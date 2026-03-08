import { onBeforeUnmount, ref } from "vue";

export function useBanHangHoaDonSubmit(deps) {
  const {
    apiClient,
    router,

    tabs,
    activeTab,

    isCounter,
    cartItems,

    selectedKh,
    selectedDiaChi,
    diaChiList,
    guest,

    nguoiBan,

    effectiveVoucher,
    phiVanChuyenNum,
    tongTienHang,
    tongPhaiTra,

    ctspList,
    loadCtspForPos,
    ensureBaseQtyIfCartHasItems,
    capNhatDotGiamGiaChoGioHang,

    scheduleAutoVoucher,
    persistActiveTab,
    persistTabs,
    applyTabState,

    showToast,
  } = deps;

  const submitting = ref(false);

  const syncingHoaDon = ref(false);
  const syncHdTimer = ref(null);

  const showSubmitConfirmModal = ref(false);

  function getActiveTabObj() {
    return tabs.value?.[activeTab.value] || null;
  }

  function getHttpStatus(err) {
    return err?.response?.status ?? null;
  }

  function is404(err) {
    return Number(getHttpStatus(err)) === 404;
  }

  function getBackendMessage(err) {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.response?.data?.detail ||
      err?.message ||
      ""
    );
  }

  function isVoucherRelatedError(err) {
    const msg = String(getBackendMessage(err) || "").trim().toLowerCase();
    if (!msg) return false;

    return (
      msg.includes("phiếu") ||
      msg.includes("phieu") ||
      msg.includes("voucher") ||
      msg.includes("mã giảm giá") ||
      msg.includes("ma giam gia") ||
      msg.includes("giảm giá") ||
      msg.includes("giam gia") ||
      msg.includes("không còn hợp lệ") ||
      msg.includes("khong con hop le") ||
      msg.includes("ngừng hoạt động") ||
      msg.includes("ngung hoat dong") ||
      msg.includes("đã kết thúc") ||
      msg.includes("da ket thuc") ||
      msg.includes("hết lượt") ||
      msg.includes("het luot") ||
      msg.includes("hết số lượng") ||
      msg.includes("het so luong") ||
      msg.includes("không đủ điều kiện") ||
      msg.includes("khong du dieu kien")
    );
  }

  function getVoucherRealtimeErrorMessage(err) {
    const raw = String(getBackendMessage(err) || "").trim();
    if (raw && isVoucherRelatedError(err)) {
      return `${raw} Hệ thống đã kiểm tra lại theo thời gian thực, vui lòng kiểm tra lại ưu đãi trước khi xác nhận.`;
    }
    return "Phiếu giảm giá vừa thay đổi trạng thái. Hệ thống đã kiểm tra lại theo thời gian thực, vui lòng kiểm tra lại ưu đãi trước khi xác nhận.";
  }

  function resetHoaDonIdTrongTabDangChon(reason = "") {
    const t = getActiveTabObj();
    if (!t) return false;

    if (t.hoaDonId == null) return false;

    t.hoaDonId = null;
    persistTabs();

    if (reason) showToast(reason, "info");
    return true;
  }

  function buildEmptyTabState() {
    return {
      isCounter: false,
      cartItems: [],
      selectedKh: null,
      diaChiList: [],
      selectedDiaChi: null,
      autoVoucher: null,
      voucherManual: null,
      voucherCode: "",
      khachThanhToan: 0,
      payMethod: "TIEN_MAT",
      payTienMat: 0,
      payChuyenKhoan: 0,
      payMaThamChieu: "",
      guest: {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      },
      phiVanChuyen: 0,
      phiVanChuyenText: "0",
    };
  }

  function anTabDaHoanTatSauSubmit() {
    try {
      const idx = Number(activeTab.value || 0);

      if (!Array.isArray(tabs.value) || tabs.value.length === 0) {
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
        return;
      }

      if (!Number.isFinite(idx) || idx < 0 || idx >= tabs.value.length) {
        tabs.value = [];
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
        return;
      }

      tabs.value.splice(idx, 1);

      tabs.value = (tabs.value || []).map((t, i) => ({
        ...t,
        orderNo: i + 1,
        name: `Đơn hàng ${i + 1} - HD-${t.hdCode}`,
      }));

      if (tabs.value.length === 0) {
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
        return;
      }

      activeTab.value = idx >= tabs.value.length ? tabs.value.length - 1 : idx;
      applyTabState(tabs.value[activeTab.value]);
      persistTabs();
      scheduleAutoVoucher();
    } catch (e) {
      try {
        tabs.value = [];
        activeTab.value = 0;
        applyTabState(buildEmptyTabState());
        persistTabs();
        scheduleAutoVoucher();
      } catch (e2) {}
    }
  }

  async function ensureHoaDonChoTab() {
    const t = getActiveTabObj();
    if (!t) throw new Error("NO_TAB");
    if (t.hoaDonId) return t.hoaDonId;

    const isShipping = isCounter.value === true;

    const tenKhachHang = isShipping
      ? selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : guest.tenKhachHang || "Khách vãng lai"
      : selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : "Khách lẻ";

    const soDienThoaiKhachHang =
      (isShipping
        ? selectedKh.value
          ? deps.getKhPhone(selectedKh.value)
          : guest.soDienThoai
        : selectedKh.value
          ? deps.getKhPhone(selectedKh.value)
          : "0000000000") || "0000000000";

    const diaChiKhachHang = isShipping
      ? selectedKh.value
        ? selectedDiaChi.value
          ? deps.renderDiaChi(selectedDiaChi.value)
          : "Chờ cập nhật"
        : "Chờ cập nhật"
      : "Tại quầy";

    const payload = {
      idKhachHang: selectedKh.value?.id || null,
      idNhanVien: nguoiBan.value?.id ?? null,

      idPhieuGiamGia: effectiveVoucher.value?.id || null,
      idPhieuGiamGiaCaNhan: effectiveVoucher.value?.__pggcnId || null,

      loaiDon: isShipping ? 1 : 0,
      phiVanChuyen: Math.round(isShipping ? phiVanChuyenNum.value : 0),

      tongTien: 0,
      tongTienSauGiam: 0,

      tenKhachHang: (tenKhachHang || "").trim() || (isShipping ? "Khách vãng lai" : "Khách lẻ"),
      soDienThoaiKhachHang: String(soDienThoaiKhachHang || "").replace(/\D/g, "") || "0000000000",
      diaChiKhachHang: diaChiKhachHang || (isShipping ? "Chờ cập nhật" : "Tại quầy"),
      emailKhachHang: selectedKh.value ? deps.getKhEmail(selectedKh.value) || null : null,

      ghiChu: "Hóa đơn chờ POS",
    };

    const res = await apiClient.post("/api/admin/hoa-don", payload);
    const id = res?.data?.id;
    if (!id) throw new Error("CREATE_HD_FAIL");

    t.hoaDonId = id;
    persistTabs();

    return id;
  }

  function buildThongTinHoaDonPayload() {
    const isShipping = isCounter.value === true;
    const loaiDon = isShipping ? 1 : 0;

    let tenKh = isShipping
      ? selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : guest.tenKhachHang || "Khách vãng lai"
      : selectedKh.value
        ? deps.getKhName(selectedKh.value)
        : "Khách lẻ";

    tenKh = (tenKh || "").trim() || (isShipping ? "Khách vãng lai" : "Khách lẻ");

    const sdtDigits = selectedKh.value
      ? String(deps.getKhPhone(selectedKh.value) || "").replace(/\D/g, "")
      : String(guest.soDienThoai || "").replace(/\D/g, "");

    const soDienThoai = sdtDigits || "0000000000";

    let diaChi = isShipping ? "" : "Tại quầy";
    if (isShipping) {
      if (selectedKh.value) diaChi = selectedDiaChi.value ? deps.renderDiaChi(selectedDiaChi.value) : "";
      else {
        const parts = [guest.diaChiCuThe, guest.xaPhuong, guest.huyenQuan, guest.tinhThanh].filter((x) =>
          String(x || "").trim(),
        );
        diaChi = parts.join(", ");
      }
      diaChi = diaChi || "Chờ cập nhật";
    }

    const ship = Math.round(isShipping ? Number(phiVanChuyenNum.value || 0) : 0);
    const tongHang = Math.round(Number(tongTienHang.value || 0));
    const tongTra = Math.round(Number(tongPhaiTra.value || 0));
    const tongSauGiamKhongShip = Math.max(0, tongTra - ship);

    return {
      idKhachHang: selectedKh.value?.id || null,
      idNhanVien: nguoiBan.value?.id ?? null,

      idPhieuGiamGia: effectiveVoucher.value?.id || null,
      idPhieuGiamGiaCaNhan: effectiveVoucher.value?.__pggcnId || null,

      loaiDon,
      phiVanChuyen: ship,

      tongTien: tongHang,
      tongTienSauGiam: tongSauGiamKhongShip,

      tenKhachHang: tenKh,
      soDienThoaiKhachHang: soDienThoai,
      diaChiKhachHang: diaChi,
      emailKhachHang: selectedKh.value ? deps.getKhEmail(selectedKh.value) || null : null,
      ghiChu: null,
    };
  }

  function buildChiTietSnapshotPayload(idHoaDon) {
    return (cartItems.value || []).map((it) => {
      const donGia = Math.round(Number(it?.__giaBanChot ?? it?.giaBan ?? 0) || 0);
      const giaGoc = Math.round(Number(it?.__giaGocChot ?? it?.giaGoc ?? 0) || 0);

      return {
        idHoaDon,
        idChiTietSanPham: it.id,
        soLuong: Number(it.qty || 1),
        donGia,
        giaGoc,
        ghiChu: null,
        xoaMem: false,
      };
    });
  }

  function taoRowId() {
    return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  async function reloadCartFromDb(idHoaDon) {
    try {
      const res = await apiClient.get(`/api/admin/hoa-don/${idHoaDon}`);
      const hd = res?.data || null;
      const list = Array.isArray(hd?.chiTietHoaDon) ? hd.chiTietHoaDon : [];

      const out = list
        .map((x) => {
          const ctspId = x?.idChiTietSanPham ?? null;
          const found = ctspId != null ? ctspList.value.find((k) => Number(k?.id) === Number(ctspId)) : null;

          const donGia = Math.round(Number(x?.donGia || 0) || 0);
          const giaChot = donGia > 0 ? donGia : Math.round(Number(found?.giaBan || 0) || 0);

          const giaGocDb = Math.round(Number(x?.giaGoc || 0) || 0);
          const giaGocApi = Math.round(Number(found?.giaGoc || 0) || 0);
          const giaGocChot = giaGocDb > 0 ? giaGocDb : giaGocApi;

          return {
            __rowId: taoRowId(),
            id: ctspId,
            maCtsp: x?.maChiTietSanPham || found?.maCtsp || "",
            tenSanPham: x?.tenSanPham || found?.tenSanPham || "",
            mauSac: x?.mauSac || found?.mauSac || "",
            kichCo: x?.kichCo || found?.kichCo || "",

            giaGoc: giaGocChot > 0 ? giaGocChot : 0,
            giaBan: giaChot > 0 ? giaChot : 0,

            phanTramGiam: 0,
            idDotGiamGia: null,
            maDotGiamGia: null,
            tenDotGiamGia: null,

            __khoaGia: true,
            __giaGocChot: giaGocChot > 0 ? giaGocChot : 0,
            __giaBanChot: giaChot > 0 ? giaChot : 0,
            __phanTramGiamChot: 0,
            __idDotGiamGiaChot: null,
            __maDotGiamGiaChot: null,
            __tenDotGiamGiaChot: null,

            anhUrl: found?.anhUrl ?? null,
            qty: Number(x?.soLuong || 1),
            checked: true,
          };
        })
        .filter((x) => x.id != null);

      cartItems.value = out;

      await ensureBaseQtyIfCartHasItems();
      await capNhatDotGiamGiaChoGioHang();
      scheduleAutoVoucher();
      persistActiveTab();
    } catch (e) {}
  }

  async function syncHoaDonToDb(opts = {}) {
    const silent = !!opts.silent;
    const t = getActiveTabObj();
    if (!t) return;

    if (syncingHoaDon.value) return;
    syncingHoaDon.value = true;

    try {
      const idHoaDon = await ensureHoaDonChoTab();

      await apiClient.put(`/api/admin/hoa-don/${idHoaDon}/thong-tin`, buildThongTinHoaDonPayload());

      await apiClient.post(`/api/admin/hoa-don/${idHoaDon}/chi-tiet`, buildChiTietSnapshotPayload(idHoaDon));

      return true;
    } catch (e) {
      if (is404(e)) {
        const daReset = resetHoaDonIdTrongTabDangChon(silent ? "" : "Hóa đơn chờ không còn tồn tại, hệ thống sẽ tạo lại.");

        if (daReset) {
          try {
            const newId = await ensureHoaDonChoTab();

            await apiClient.put(`/api/admin/hoa-don/${newId}/thong-tin`, buildThongTinHoaDonPayload());

            await apiClient.post(`/api/admin/hoa-don/${newId}/chi-tiet`, buildChiTietSnapshotPayload(newId));

            return true;
          } catch (eRetry) {
            if (!silent) {
              const msg = isVoucherRelatedError(eRetry)
                ? getVoucherRealtimeErrorMessage(eRetry)
                : getBackendMessage(eRetry) || "Không đồng bộ được hoá đơn với DB.";
              showToast(msg, "error");
            }
            if (!silent) throw eRetry;
            return false;
          } finally {
            syncingHoaDon.value = false;
          }
        }
      }

      if (!silent) {
        const msg = isVoucherRelatedError(e)
          ? getVoucherRealtimeErrorMessage(e)
          : getBackendMessage(e) || "Không đồng bộ được hoá đơn với DB.";
        showToast(msg, "error");
      }

      try {
        const idHoaDon = t?.hoaDonId;
        if (idHoaDon) {
          await loadCtspForPos({ silent: true, keepPage: true });
          await reloadCartFromDb(idHoaDon);
        }
      } catch (e2) {}

      if (!silent) throw e;
      return false;
    } finally {
      syncingHoaDon.value = false;
    }
  }

  function scheduleSyncHoaDon() {
    if (submitting.value) return;

    if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
    syncHdTimer.value = setTimeout(() => {
      if (submitting.value) return;
      syncHoaDonToDb({ silent: true }).catch(() => {});
    }, 200);
  }

  function openSubmitConfirm(canSubmit) {
    if (!canSubmit.value) return;
    deps.blurActive();
    showSubmitConfirmModal.value = true;
  }

  function closeSubmitConfirm() {
    deps.blurActive();
    showSubmitConfirmModal.value = false;
  }

  async function confirmSubmitOrder(submitOrder) {
    deps.blurActive();
    showSubmitConfirmModal.value = false;
    await submitOrder();
  }

  function goToHoaDon(created) {
    const id = created?.id;
    try {
      if (id != null) router.push(`/admin/hoa-don/${id}`);
      else router.push(`/admin/hoa-don`);
    } catch (e) {
      try {
        router.push(`/admin/hoa-don`);
      } catch (e2) {}
    }
  }

  function buildBodyThanhToanGiaoHang(pay) {
    const total = Number(tongPhaiTra.value || 0);
    const tm = Number(pay.payTienMatNum.value || 0);
    const ck = Number(pay.payChuyenKhoanNum.value || 0);

    const noteBase = "Xác nhận thanh toán đơn giao hàng";

    if (tm > 0 && ck > 0) {
      if (Number(tm + ck) !== Number(total)) {
        return { error: "Kết hợp: tổng tiền mặt + chuyển khoản phải đúng bằng tổng phải trả." };
      }
      return {
        ghiChu: noteBase,
        thanhToans: [
          { tenPhuongThuc: "Tiền mặt", soTien: tm },
          { tenPhuongThuc: "Chuyển khoản", soTien: ck, maThamChieu: (pay.payMaThamChieu.value || "").trim() || null },
        ],
      };
    }

    if (ck > 0 && tm <= 0) {
      if (Number(ck) !== Number(total)) {
        return { error: "Chuyển khoản: số tiền phải đúng bằng tổng phải trả." };
      }
      return {
        ghiChu: noteBase,
        thanhToans: [{ tenPhuongThuc: "Chuyển khoản", soTien: ck, maThamChieu: (pay.payMaThamChieu.value || "").trim() || null }],
      };
    }

    return {
      ghiChu: noteBase,
      thanhToans: [{ tenPhuongThuc: "Tiền mặt", soTien: total }],
    };
  }

  async function layPhiVanChuyenTuGhnTheoHoaDonId(idHoaDon) {
    const tries = [
      `/api/admin/hoa-don/${idHoaDon}/ghn/phi-van-chuyen`,
      `/api/hoa-don/${idHoaDon}/ghn/phi-van-chuyen`,
      `/api/admin/ghn/phi-van-chuyen?idHoaDon=${idHoaDon}`,
      `/api/ghn/phi-van-chuyen?idHoaDon=${idHoaDon}`,
    ];

    let lastErr = null;
    for (const url of tries) {
      try {
        const res = await apiClient.get(url, { meta: { silent: true } });
        const data = res?.data;

        const n =
          typeof data === "number"
            ? data
            : Number(
                data?.phiVanChuyen ??
                  data?.fee ??
                  data?.shipFee ??
                  data?.total ??
                  data?.data?.phiVanChuyen ??
                  0,
              );

        if (Number.isFinite(n) && n >= 0) return Math.round(n);
      } catch (e) {
        lastErr = e;
        const status = e?.response?.status;
        if (status === 404 || status === 405 || status === 401 || status === 403) continue;
        continue;
      }
    }

    if (lastErr) console.warn("Không lấy được phí GHN (fallback giữ phí hiện tại).", lastErr);
    return null;
  }

  async function capNhatPhiVanChuyenTheoGhnNeuCo(idHoaDon, pay) {
    try {
      if (!isCounter.value) return;
      if (!idHoaDon) return;
      if (!pay?.phiVanChuyen || !pay?.phiVanChuyenText) return;

      const fee = await layPhiVanChuyenTuGhnTheoHoaDonId(idHoaDon);
      if (fee == null) return;

      const old = Math.round(Number(pay.phiVanChuyen.value || 0));
      if (fee === old) return;

      pay.phiVanChuyen.value = fee;
      pay.phiVanChuyenText.value = fee > 0 ? fee.toLocaleString("vi-VN") : "0";

      showToast("Đã cập nhật phí vận chuyển theo GHN.", "info");
    } catch (e) {}
  }

  async function refreshDuLieuRealtimeTruocKhiSubmit(pay) {
    try {
      await loadCtspForPos({ silent: true, keepPage: true });
    } catch (e) {
      try {
        await loadCtspForPos();
      } catch (e2) {}
    }

    try {
      await ensureBaseQtyIfCartHasItems();
    } catch (e) {}

    try {
      await capNhatDotGiamGiaChoGioHang();
    } catch (e) {}

    try {
      if (typeof pay?.refreshVoucherRealtimeTruocKhiXacNhan === "function") {
        const voucherResult = await pay.refreshVoucherRealtimeTruocKhiXacNhan();
        if (voucherResult?.ok === false) return voucherResult;
      }
    } catch (e) {}

    return { ok: true };
  }

  async function submitOrder(canSubmit, pay) {
    if (!canSubmit.value) return;

    if (syncHdTimer.value) clearTimeout(syncHdTimer.value);

    submitting.value = true;
    try {
      const realtimeResult = await refreshDuLieuRealtimeTruocKhiSubmit(pay);
      if (realtimeResult?.ok === false) {
        if (realtimeResult?.reason === "BETTER_VOUCHER_FOUND") {
          showToast("Phiếu giảm giá vừa thay đổi. Vui lòng chọn lại ưu đãi trước khi xác nhận.", "info");
        }
        return;
      }

      for (const it of cartItems.value) {
        const qty = Number(it.qty || 0);
        if (!Number.isFinite(qty) || qty < 1) {
          showToast("Số lượng mua không hợp lệ.", "error");
          return;
        }

        const max = deps.getMaxQtyForItem(it);
        if (qty > max) {
          showToast(`Sản phẩm ${it.maCtsp || ""} vượt tồn kho.`, "error");
          it.qty = Math.max(1, max);
          return;
        }
      }

      const idHoaDon = await ensureHoaDonChoTab();

      await capNhatPhiVanChuyenTheoGhnNeuCo(idHoaDon, pay);

      await syncHoaDonToDb({ silent: false });

      if (!isCounter.value) {
        const noteBase = "Chốt đơn tại quầy";

        if (pay.payMethod.value === "KET_HOP") {
          if (Number(pay.khachThanhToan.value || 0) !== Number(tongPhaiTra.value || 0)) {
            showToast("Kết hợp: tổng tiền mặt + chuyển khoản phải đúng bằng tổng phải trả.", "error");
            pay.openPayModal();
            return;
          }

          const body = {
            ghiChu: noteBase,
            thanhToans: [
              ...(pay.payTienMatNum.value > 0 ? [{ tenPhuongThuc: "Tiền mặt", soTien: pay.payTienMatNum.value }] : []),
              ...(pay.payChuyenKhoanNum.value > 0
                ? [{ tenPhuongThuc: "Chuyển khoản", soTien: pay.payChuyenKhoanNum.value, maThamChieu: (pay.payMaThamChieu.value || "").trim() || null }]
                : []),
            ],
          };

          const done = await apiClient.put(`/api/admin/hoa-don/${idHoaDon}/confirm-tai-quay-ket-hop`, body);
          const finalHd = done?.data || { id: idHoaDon };

          showToast("Đã chốt đơn tại quầy.", "success");
          goToHoaDon(finalHd);

          if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
          anTabDaHoanTatSauSubmit();
          return;
        }

        if (pay.payMethod.value === "CHUYEN_KHOAN") {
          if (Number(pay.khachThanhToan.value || 0) !== Number(tongPhaiTra.value || 0)) {
            showToast("Chuyển khoản: số tiền phải đúng bằng tổng phải trả.", "error");
            pay.openPayModal();
            return;
          }

          const done = await apiClient.put(`/api/admin/hoa-don/${idHoaDon}/confirm-tai-quay-chuyen-khoan`, {
            ghiChu: "Chốt đơn tại quầy - chuyển khoản",
          });
          const finalHd = done?.data || { id: idHoaDon };

          showToast("Đã chốt đơn tại quầy.", "success");
          goToHoaDon(finalHd);

          if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
          anTabDaHoanTatSauSubmit();
          return;
        }

        if (Number(pay.khachThanhToan.value || 0) < Number(tongPhaiTra.value || 0)) {
          showToast("Tiền mặt: khách thanh toán chưa đủ.", "error");
          pay.openPayModal();
          return;
        }

        const done = await apiClient.put(`/api/admin/hoa-don/${idHoaDon}/confirm-tai-quay-tien-mat`, {
          ghiChu: "Chốt đơn tại quầy - tiền mặt",
        });
        const finalHd = done?.data || { id: idHoaDon };

        showToast("Đã chốt đơn tại quầy.", "success");
        goToHoaDon(finalHd);

        if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
        anTabDaHoanTatSauSubmit();
        return;
      }

      const payNum = Number(pay.khachThanhToan.value || 0);
      const total = Number(tongPhaiTra.value || 0);

      if (!Number.isFinite(payNum) || payNum <= 0) {
        showToast("Vui lòng nhập thanh toán trước khi xác nhận.", "error");
        pay.openPayModal();
        return;
      }

      const bodyGiaoHang = buildBodyThanhToanGiaoHang(pay);
      if (bodyGiaoHang?.error) {
        showToast(bodyGiaoHang.error, "error");
        pay.openPayModal();
        return;
      }

      if (Number(pay.payChuyenKhoanNum.value || 0) > 0 || Number(pay.payTienMatNum.value || 0) > 0) {
        const tm = Number(pay.payTienMatNum.value || 0);
        const ck = Number(pay.payChuyenKhoanNum.value || 0);
        if (ck > 0 && tm === 0 && ck !== total) {
          showToast("Chuyển khoản: số tiền phải đúng bằng tổng phải trả.", "error");
          pay.openPayModal();
          return;
        }
        if (ck > 0 && tm > 0 && tm + ck !== total) {
          showToast("Kết hợp: tổng tiền mặt + chuyển khoản phải đúng bằng tổng phải trả.", "error");
          pay.openPayModal();
          return;
        }
      }

      const doneShip = await apiClient.put(`/api/admin/hoa-don/${idHoaDon}/confirm-giao-hang-ket-hop`, bodyGiaoHang);
      const finalHdShip = doneShip?.data || { id: idHoaDon };

      showToast("Đã lưu đơn giao hàng và ghi nhận thanh toán.", "success");
      goToHoaDon(finalHdShip);

      if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
      anTabDaHoanTatSauSubmit();
    } catch (e) {
      const msg = isVoucherRelatedError(e)
        ? getVoucherRealtimeErrorMessage(e)
        : getBackendMessage(e) || "Xác nhận đơn thất bại. Vui lòng kiểm tra lại.";
      showToast(msg, "error");
    } finally {
      submitting.value = false;
    }
  }

  onBeforeUnmount(() => {
    try {
      if (syncHdTimer.value) clearTimeout(syncHdTimer.value);
    } catch (e) {}
  });

  return {
    submitting,
    syncingHoaDon,
    showSubmitConfirmModal,

    ensureHoaDonChoTab,
    syncHoaDonToDb,
    scheduleSyncHoaDon,

    openSubmitConfirm,
    closeSubmitConfirm,
    confirmSubmitOrder,

    submitOrder,
  };
}