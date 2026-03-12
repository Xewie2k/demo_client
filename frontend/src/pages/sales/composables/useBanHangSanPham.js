import { computed, onBeforeUnmount, reactive, ref } from "vue";

export function useBanHangSanPham(deps) {
  const {
    SalesService,
    apiClient,

    cartItems,

    // tồn local
    getAvailableQtyByCtspId,
    getBaseQtyByCtspId,
    capNhatTonLocal,
    dongBoTonKhoTuApi,
    persistCtspBaseQtyMap,

    // toast + helpers
    showToast,
    clampInt,
    safeParse,
    resolveImage,
    normalizePercent,
    toNumberSafe,

    scheduleAutoVoucher,
    scheduleSyncHoaDon,
  } = deps;

  const showCtspModal = ref(false);
  const ctspLoading = ref(false);
  const ctspErr = ref("");
  const ctspList = ref([]);
  const ctspFilter = reactive({ keyword: "", mauSac: "", kichCo: "", tenSanPham: "" });
  const ctspPage = ref(1);
  const ctspPageSize = ref(5);

  // ✅ để tránh cache giá cũ: poll nhẹ khi đang mở modal / có giỏ hàng
  const ctspLoadedAt = ref(0);
  const pollTimer = ref(null);
  const CTSP_POLL_MS = 5000;

  function startPollCtsp() {
    if (pollTimer.value) return;
    pollTimer.value = setInterval(() => {
      try {
        if (document.visibilityState !== "visible") return;
        const need =
          showCtspModal.value ||
          (Array.isArray(cartItems.value) && cartItems.value.length > 0);
        if (!need) return;

        loadCtspForPos({ silent: true, keepPage: true }).catch(() => {});
      } catch (e) {}
    }, CTSP_POLL_MS);
  }

  function stopPollCtsp() {
    if (!pollTimer.value) return;
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }

  onBeforeUnmount(() => {
    try {
      stopPollCtsp();
    } catch (e) {}
  });

  const filteredCtsp = computed(() => {
    const kw = (ctspFilter.keyword || "").toLowerCase();
    const ms = ctspFilter.mauSac || "";
    const kc = ctspFilter.kichCo || "";
    const sp = ctspFilter.tenSanPham || "";

    return ctspList.value
      .map((x) => ({ ...x, __available: getAvailableQtyByCtspId(x.id) }))
      .filter((x) => {
        const s = `${x.maCtsp || ""} ${x.tenSanPham || ""} ${x.mauSac || ""} ${x.kichCo || ""}`.toLowerCase();
        if (kw && !s.includes(kw)) return false;
        if (ms && x.mauSac !== ms) return false;
        if (kc && x.kichCo !== kc) return false;
        if (sp && x.tenSanPham !== sp) return false;
        return true;
      });
  });

  const ctspTotalPages = computed(() => Math.max(1, Math.ceil(filteredCtsp.value.length / ctspPageSize.value)));

  const pagedCtsp = computed(() => {
    const start = (ctspPage.value - 1) * ctspPageSize.value;
    return filteredCtsp.value.slice(start, start + ctspPageSize.value);
  });

  const ctspMauSacOptions = computed(() => [...new Set(ctspList.value.map((x) => x.mauSac).filter(Boolean))].sort());
  const ctspKichCoOptions = computed(() => [...new Set(ctspList.value.map((x) => x.kichCo).filter(Boolean))].sort());
  const ctspSanPhamOptions = computed(() => [...new Set(ctspList.value.map((x) => x.tenSanPham).filter(Boolean))].sort());

  function onImgErr(e) {
    if (e?.target) e.target.style.display = "none";
  }

  function taoRowId() {
    return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function ensureRowId(it) {
    if (!it) return null;
    if (!it.__rowId) it.__rowId = taoRowId();
    return it.__rowId;
  }

  function getThongBaoVuotTon(soLuong) {
    const n = Math.max(0, Math.round(Number(soLuong || 0)));
    return `Sản phẩm hiện chỉ còn ${n} sản phẩm trong kho.`;
  }

  // ======= KHÓA GIÁ THEO DÒNG =======
  function isGiaDaKhoa(it) {
    return it?.__khoaGia === true || it?.khoaGia === true;
  }

  function khoaGiaChoItemNeuCan(it) {
    if (!it || it.id == null) return;

    ensureRowId(it);

    if (!it.__giaBanChot) {
      const gb = Math.round(toNumberSafe(it.giaBan ?? 0));
      if (gb > 0) it.__giaBanChot = gb;
    }
    if (!it.__giaGocChot) {
      const gg = Math.round(toNumberSafe(it.giaGoc ?? 0));
      if (gg > 0) it.__giaGocChot = gg;
    }
    if (it.__phanTramGiamChot == null) {
      it.__phanTramGiamChot = normalizePercent(it.phanTramGiam ?? it.phanTramKhuyenMai ?? 0);
    }

    if (it.__idDotGiamGiaChot == null) it.__idDotGiamGiaChot = it.idDotGiamGia ?? null;
    if (it.__maDotGiamGiaChot == null) it.__maDotGiamGiaChot = it.maDotGiamGia ?? null;
    if (it.__tenDotGiamGiaChot == null) it.__tenDotGiamGiaChot = it.tenDotGiamGia ?? null;

    it.__khoaGia = true;
  }

  function khoaGiaToanBoGioHangNeuChuaKhoa() {
    const arr = Array.isArray(cartItems.value) ? cartItems.value : [];
    for (const it of arr) {
      ensureRowId(it);
      if (!isGiaDaKhoa(it)) khoaGiaChoItemNeuCan(it);
    }
  }

  // ✅ Detect “giá đã đổi trên server” để CHẶN tăng số lượng dòng cũ (chỉ cho giảm/xóa)
  function isGiaDaThayDoiSoVoiServer(it) {
    try {
      if (!it || it.id == null) return false;
      if (!isGiaDaKhoa(it)) return false;

      const now = (ctspList.value || []).find((x) => Number(x?.id) === Number(it.id)) || null;
      if (!now) return false;

      const giaNow = Math.round(toNumberSafe(now.giaBan ?? 0));
      const giaOld = Math.round(toNumberSafe(it.__giaBanChot ?? it.giaBan ?? 0));

      if (giaNow > 0 && giaOld > 0 && giaNow !== giaOld) return true;

      const pctNow = normalizePercent(now.phanTramGiam ?? now.phanTramKhuyenMai ?? 0);
      const pctOld = normalizePercent(it.__phanTramGiamChot ?? it.phanTramGiam ?? it.phanTramKhuyenMai ?? 0);
      if (pctNow !== pctOld) return true;

      const dotNow = now.idDotGiamGia ?? null;
      const dotOld = it.__idDotGiamGiaChot ?? it.idDotGiamGia ?? null;
      if (String(dotNow ?? "") !== String(dotOld ?? "")) return true;

      return false;
    } catch (e) {
      return false;
    }
  }

  // ======= GIÁ =======
  function getGiaGoc(it) {
    if (!it) return 0;

    if (isGiaDaKhoa(it)) {
      const g0 = Math.round(toNumberSafe(it.__giaGocChot ?? it.giaGoc ?? 0));
      if (g0 > 0) return g0;

      const gLock = Math.round(toNumberSafe(it.__giaBanChot ?? it.giaBan ?? 0));
      return gLock > 0 ? gLock : 0;
    }

    const goc = Number(it.giaGoc);
    if (Number.isFinite(goc) && goc > 0) return goc;

    const giaBanOld = Number(it.giaBan || 0);
    return Number.isFinite(giaBanOld) && giaBanOld > 0 ? giaBanOld : 0;
  }

  function getGiaThucTe(it) {
    if (!it) return 0;

    if (isGiaDaKhoa(it)) {
      const gLock = Math.round(toNumberSafe(it.__giaBanChot ?? it.giaBan ?? 0));
      if (gLock > 0) return gLock;

      const g0 = Math.round(toNumberSafe(it.__giaGocChot ?? it.giaGoc ?? 0));
      return g0 > 0 ? g0 : 0;
    }

    const gb = Number(it.giaBan ?? 0);
    if (Number.isFinite(gb) && gb > 0) return Math.round(gb);

    const giaGoc = getGiaGoc(it);
    const pct = normalizePercent(it.phanTramGiam ?? it.phanTramKhuyenMai ?? 0);
    if (giaGoc > 0 && pct > 0) return Math.round((giaGoc * (100 - pct)) / 100);

    return Math.round(giaGoc || 0);
  }

  function showGiaGoc(it) {
    const giaGoc = Number(getGiaGoc(it) || 0);
    const giaThuc = Number(getGiaThucTe(it) || 0);
    return giaGoc > 0 && giaThuc > 0 && giaThuc < giaGoc;
  }

  function getPhanTramGiamDisplay(it) {
    if (isGiaDaKhoa(it)) {
      const pLock = normalizePercent(it.__phanTramGiamChot ?? it.phanTramGiam ?? it.phanTramKhuyenMai ?? 0);
      if (!Number.isFinite(pLock) || pLock <= 0) return 0;
      return Math.round(pLock);
    }

    const p = normalizePercent(it?.phanTramGiam ?? it?.phanTramKhuyenMai ?? 0);
    if (!Number.isFinite(p) || p <= 0) return 0;
    return Math.round(p);
  }

  function getGiamGiaTitle(it) {
    const pct = getPhanTramGiamDisplay(it);

    const tenDot = isGiaDaKhoa(it) ? it?.__tenDotGiamGiaChot || it?.tenDotGiamGia || "" : it?.tenDotGiamGia || it?.tenDot || "";
    const maDot = isGiaDaKhoa(it) ? it?.__maDotGiamGiaChot || it?.maDotGiamGia || "" : it?.maDotGiamGia || it?.maDot || "";

    if (maDot || tenDot) return `Đợt giảm giá: ${[maDot, tenDot].filter(Boolean).join(" - ")} · Giảm ${pct}%`;
    return `Giảm ${pct}%`;
  }

  // ======= ĐỢT GIẢM GIÁ BEST-BY-CTSP =======
  async function fetchBestDotGiamGiaByCtspIds(ids) {
    const list = [...new Set((ids || []).map((x) => Number(x)).filter(Number.isFinite))];
    if (!list.length) return [];

    const tries = [
      "/api/admin/chi-tiet-dot-giam-gia/ban-hang/best-by-ctsp-ids",
      "/api/chi-tiet-dot-giam-gia/ban-hang/best-by-ctsp-ids",
    ];

    let lastErr = null;
    for (const url of tries) {
      try {
        const res = await apiClient.post(url, list);
        const data = res?.data;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        lastErr = e;
      }
    }

    console.error("Không lấy được đợt giảm giá theo CTSP:", lastErr);
    return [];
  }

  function getCtspIdFromDotBestRow(x) {
    if (!x || typeof x !== "object") return null;
    const v =
      x.idChiTietSanPham ??
      x.idCtsp ??
      x.idChiTietSanPhamApDung ??
      x.idChiTietSanPhamId ??
      x.chiTietSanPhamId ??
      x.ctspId ??
      null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function getLoaiGiamGiaFromDotBestRow(x) {
    if (!x || typeof x !== "object") return true;
    const v = x.loaiGiamGia ?? x.loaiGiam ?? x.isPercent ?? x.laPhanTram ?? x.phanTram ?? true;
    return v === true || v === 1 || String(v).toLowerCase() === "true";
  }

  function getGiaTriGiamFromDotBestRow(x) {
    if (!x || typeof x !== "object") return 0;
    const raw =
      x.giaTriGiamApDung ??
      x.giaTriGiam ??
      x.phanTramGiam ??
      x.phanTramGiamGia ??
      x.giaTri ??
      x.soTienGiam ??
      x.tienGiam ??
      0;
    return toNumberSafe(raw);
  }

  function getDotInfoFromDotBestRow(x) {
    const dot = x?.dotGiamGia || x?.dot || x?.dotKhuyenMai || null;

    const idDot = x?.idDotGiamGia ?? dot?.id ?? x?.dotGiamGiaId ?? x?.idDot ?? null;

    const maDot =
      x?.maDotGiamGia ??
      dot?.maDotGiamGia ??
      dot?.maDot ??
      dot?.ma ??
      x?.maDot ??
      null;

    const tenDot =
      x?.tenDotGiamGia ??
      dot?.tenDotGiamGia ??
      dot?.tenDot ??
      dot?.ten ??
      x?.tenDot ??
      null;

    return { idDot, maDot, tenDot };
  }

  async function ganDotGiamGiaChoDanhSachCtsp(dsCtsp) {
    const list = Array.isArray(dsCtsp) ? dsCtsp : [];
    const ids = [...new Set(list.map((x) => x?.id).filter((x) => x != null))];
    if (!ids.length) return;

    const dsBest = await fetchBestDotGiamGiaByCtspIds(ids);

    const map = new Map();
    for (const x of dsBest) {
      const idCtsp = getCtspIdFromDotBestRow(x);
      if (idCtsp != null) map.set(idCtsp, x);
    }

    for (const sp of list) {
      if (!sp || sp.id == null) continue;

      if (isGiaDaKhoa(sp)) continue;

      const best = map.get(Number(sp.id));

      const giaBase =
        toNumberSafe(sp.giaGoc ?? 0) > 0
          ? Math.round(toNumberSafe(sp.giaGoc))
          : Math.round(toNumberSafe(sp.giaBan ?? 0));

      if (!best) {
        sp.phanTramGiam = 0;
        sp.idDotGiamGia = null;
        sp.maDotGiamGia = null;
        sp.tenDotGiamGia = null;

        sp.giaGoc = 0;
        sp.giaBan = giaBase > 0 ? giaBase : Math.round(toNumberSafe(sp.giaBan ?? 0));
        continue;
      }

      const loaiPercent = getLoaiGiamGiaFromDotBestRow(best);
      let giaTri = getGiaTriGiamFromDotBestRow(best);

      if (loaiPercent) {
        if (giaTri > 0 && giaTri <= 1) giaTri = giaTri * 100;
        giaTri = Math.max(0, Math.min(100, Math.round(giaTri)));
      } else {
        giaTri = Math.max(0, Math.round(giaTri));
      }

      const { idDot, maDot, tenDot } = getDotInfoFromDotBestRow(best);

      let giaSau = giaBase;
      if (giaBase > 0 && giaTri > 0) {
        if (loaiPercent) giaSau = Math.round((giaBase * (100 - giaTri)) / 100);
        else giaSau = Math.round(Math.max(0, giaBase - giaTri));
      }

      sp.giaGoc = giaBase > 0 ? giaBase : 0;
      sp.giaBan = giaSau > 0 ? giaSau : 0;

      sp.phanTramGiam = loaiPercent
        ? giaTri
        : giaBase > 0 && giaTri > 0
          ? Math.round(Math.min(100, (giaTri / giaBase) * 100))
          : 0;

      sp.idDotGiamGia = idDot ?? null;
      sp.maDotGiamGia = maDot ?? null;
      sp.tenDotGiamGia = tenDot ?? null;
    }
  }

  async function capNhatDotGiamGiaChoGioHang() {
    if (!Array.isArray(cartItems.value) || cartItems.value.length === 0) return;

    // ✅ khóa trước để không làm trôi giá cũ của các dòng đã có trong giỏ
    khoaGiaToanBoGioHangNeuChuaKhoa();
    await ganDotGiamGiaChoDanhSachCtsp(cartItems.value);
  }

  function normalizeCtspRow(x) {
    if (!x || typeof x !== "object") return x;
    return {
      ...x,
      giaGoc: Math.round(toNumberSafe(x.giaGoc ?? 0)),
      giaBan: Math.round(toNumberSafe(x.giaBan ?? 0)),
      phanTramGiam: normalizePercent(x.phanTramGiam ?? x.phanTramKhuyenMai ?? 0),
    };
  }

  async function loadCtspForPos(opts = {}) {
    const silent = !!opts.silent;
    const keepPage = !!opts.keepPage;

    if (!silent) {
      ctspLoading.value = true;
      ctspErr.value = "";
    }

    try {
      // ✅ khóa giỏ hiện tại trước khi nạp dữ liệu mới để tránh ghi đè giá chốt cũ
      khoaGiaToanBoGioHangNeuChuaKhoa();

      const data = await SalesService.getCtspBanHang();
      const rawList = Array.isArray(data) ? data : [];

      const list = rawList.map((x) => normalizeCtspRow(x));
      await ganDotGiamGiaChoDanhSachCtsp(list);

      ctspList.value = list;
      ctspLoadedAt.value = Date.now();

      dongBoTonKhoTuApi(list);
      persistCtspBaseQtyMap();

      await capNhatDotGiamGiaChoGioHang();

      if (!keepPage) ctspPage.value = 1;
    } catch (e) {
      if (!silent) {
        ctspErr.value = "Không tải được danh sách biến thể (API đang lỗi).";
        ctspList.value = [];
      }
    } finally {
      if (!silent) ctspLoading.value = false;
    }
  }

  async function ensureBaseQtyIfCartHasItems() {
    const hasCart = Array.isArray(cartItems.value) && cartItems.value.length > 0;
    if (!hasCart) return;

    khoaGiaToanBoGioHangNeuChuaKhoa();
    startPollCtsp();

    if (Array.isArray(ctspList.value) && ctspList.value.length > 0) return;

    try {
      await loadCtspForPos();
    } catch (e) {}
  }

  // ======= GIỎ HÀNG =======
  function getMaxQtyForItem(it) {
    const id = it?.id;
    const cur = Math.max(0, Number(it?.qty || 0));
    const conLai = Math.max(0, Number(getAvailableQtyByCtspId(id) || 0));
    return Math.max(0, cur + conLai);
  }

  function incQty(it) {
    if (isGiaDaThayDoiSoVoiServer(it)) {
      showToast("Giá sản phẩm đã thay đổi. Dòng cũ chỉ được giảm hoặc xóa. Nếu muốn thêm theo giá mới, hãy thêm dòng mới.", "info");
      return;
    }

    const old = Number(it.qty || 1);
    const conLai = getAvailableQtyByCtspId(it?.id);
    if (conLai <= 0) {
      showToast(getThongBaoVuotTon(getMaxQtyForItem(it)), "error");
      return;
    }

    it.qty = old + 1;
    capNhatTonLocal(it?.id, -1);
    scheduleSyncHoaDon();
  }

  function decQty(it) {
    const old = Number(it.qty || 1);
    if (old > 1) {
      it.qty = old - 1;
      capNhatTonLocal(it?.id, +1);
      scheduleSyncHoaDon();
    }
  }

  function onQtyInput(it, e) {
    const raw = String(e?.target?.value || "");
    const digits = raw.replace(/\D/g, "");
    const n = digits ? Number(digits) : 0;

    const old = Number(it.qty || 1);
    const max = getMaxQtyForItem(it);

    const vuotTon = digits && n > max;
    let next = clampInt(n, 1, Math.max(1, max));

    // ✅ nếu giá đã đổi: không cho tăng (chỉ cho giảm)
    if (next > old && isGiaDaThayDoiSoVoiServer(it)) {
      showToast("Giá sản phẩm đã thay đổi. Dòng cũ chỉ được giảm hoặc xóa.", "info");
      next = old;
    }

    if (vuotTon) showToast(getThongBaoVuotTon(max), "error");
    if (next === old) return;

    const delta = next - old;
    it.qty = next;

    if (delta > 0) capNhatTonLocal(it?.id, -delta);
    else capNhatTonLocal(it?.id, Math.abs(delta));

    scheduleSyncHoaDon();
  }

  function onQtyBlur(it) {
    const old = Number(it.qty || 0);
    const max = getMaxQtyForItem(it);
    let next = old;
    let biDieuChinhDoVuotTon = false;

    if (!Number.isFinite(next) || next < 1) next = 1;
    if (next > max) {
      next = Math.max(1, max);
      biDieuChinhDoVuotTon = true;
    }

    if (next > old && isGiaDaThayDoiSoVoiServer(it)) {
      showToast("Giá sản phẩm đã thay đổi. Dòng cũ chỉ được giảm hoặc xóa.", "info");
      next = old;
    }

    if (next !== old) {
      const delta = next - old;
      it.qty = next;

      if (delta > 0) capNhatTonLocal(it?.id, -delta);
      else capNhatTonLocal(it?.id, Math.abs(delta));

      if (biDieuChinhDoVuotTon) {
        showToast(`${getThongBaoVuotTon(max)} Hệ thống đã tự điều chỉnh số lượng.`, "info");
      } else {
        showToast("Số lượng mua đã được tự điều chỉnh theo tồn kho.", "info");
      }
    }

    scheduleAutoVoucher();
    scheduleSyncHoaDon();
  }

  function removeItem(rowKeyOrId) {
    const key = String(rowKeyOrId ?? "");

    const arr = Array.isArray(cartItems.value) ? [...cartItems.value] : [];
    let idx = arr.findIndex((x) => String(x?.__rowId ?? "") === key);

    // fallback (data cũ chưa có __rowId)
    if (idx < 0) {
      const idNum = Number(rowKeyOrId);
      if (Number.isFinite(idNum)) idx = arr.findIndex((x) => Number(x?.id) === idNum);
    }

    if (idx < 0) return;

    const it = arr[idx];
    const qty = Math.max(0, Number(it?.qty || 0));
    if (qty > 0) capNhatTonLocal(it?.id, qty);

    arr.splice(idx, 1);
    cartItems.value = arr;

    if (!showCtspModal.value && (!Array.isArray(cartItems.value) || cartItems.value.length === 0)) {
      stopPollCtsp();
    }

    scheduleAutoVoucher();
    scheduleSyncHoaDon();
  }

  async function ensureCtspFreshIfStale() {
    try {
      const now = Date.now();
      if (ctspLoadedAt.value && now - ctspLoadedAt.value < 1500) return;
      await loadCtspForPos({ silent: true, keepPage: true });
    } catch (e) {}
  }

  async function refreshCtspRealtimeTruocKhiThem() {
    try {
      await loadCtspForPos({ silent: true, keepPage: true });
    } catch (e) {
      await ensureCtspFreshIfStale();
    }
  }

  // ✅ GĐ3: nếu giá đã đổi -> KHÔNG cộng vào dòng cũ, mà tạo DÒNG MỚI
  async function pickCtsp(row, qtyToAdd = 1) {
    if (!row) return;

    startPollCtsp();
    await refreshCtspRealtimeTruocKhiThem();

    const nx0 = normalizeCtspRow(row);
    const id = nx0?.id;
    if (id == null) return;

    const latest = (ctspList.value || []).find((x) => Number(x?.id) === Number(id)) || nx0;
    const nx = normalizeCtspRow(latest);

    const available = getAvailableQtyByCtspId(id);
    if (available <= 0) {
      showToast(getThongBaoVuotTon(0), "error");
      return;
    }

    const want = clampInt(qtyToAdd, 1, Math.max(1, available));

    const giaGocLock = Math.round(toNumberSafe(nx.giaGoc ?? nx.giaBan ?? 0));
    const giaBanLock = Math.round(toNumberSafe(nx.giaBan ?? 0));
    const pctLock = normalizePercent(nx.phanTramGiam ?? 0);
    const dotIdLock = nx.idDotGiamGia ?? null;

    // tìm dòng cùng CTSP và cùng “giá chốt” -> mới được cộng
    const existSamePrice = (cartItems.value || []).find((x) => {
      if (!x) return false;
      if (Number(x.id) !== Number(id)) return false;

      const g = Math.round(toNumberSafe(x.__giaBanChot ?? x.giaBan ?? 0));
      const p = normalizePercent(x.__phanTramGiamChot ?? x.phanTramGiam ?? x.phanTramKhuyenMai ?? 0);
      const d = x.__idDotGiamGiaChot ?? x.idDotGiamGia ?? null;

      return g === giaBanLock && p === pctLock && String(d ?? "") === String(dotIdLock ?? "");
    });

    if (existSamePrice) {
      // ✅ được cộng vì cùng “bản ghi giá”
      khoaGiaChoItemNeuCan(existSamePrice);

      const old = Number(existSamePrice.qty || 1);
      const max = getMaxQtyForItem(existSamePrice);
      const newQty = Math.min(max, old + want);

      const delta = newQty - old;
      if (delta <= 0) {
        showToast(getThongBaoVuotTon(max), "error");
        return;
      }

      existSamePrice.qty = newQty;
      existSamePrice.checked = true;

      capNhatTonLocal(id, -delta);
    } else {
      // ✅ giá/đợt giảm đã đổi -> tạo DÒNG MỚI (record mới), không sửa dòng cũ
      const addQty = Math.min(want, available);

      if (addQty <= 0) {
        showToast(getThongBaoVuotTon(available), "error");
        return;
      }

      const item = {
        __rowId: taoRowId(),
        id: nx.id,
        maCtsp: nx.maCtsp,
        tenSanPham: nx.tenSanPham,
        mauSac: nx.mauSac,
        kichCo: nx.kichCo,

        giaGoc: giaGocLock > 0 ? giaGocLock : 0,
        giaBan: giaBanLock > 0 ? giaBanLock : 0,

        phanTramGiam: pctLock,
        idDotGiamGia: nx.idDotGiamGia ?? null,
        maDotGiamGia: nx.maDotGiamGia ?? null,
        tenDotGiamGia: nx.tenDotGiamGia ?? null,

        __khoaGia: true,
        __giaGocChot: giaGocLock > 0 ? giaGocLock : 0,
        __giaBanChot: giaBanLock > 0 ? giaBanLock : 0,
        __phanTramGiamChot: pctLock,
        __idDotGiamGiaChot: nx.idDotGiamGia ?? null,
        __maDotGiamGiaChot: nx.maDotGiamGia ?? null,
        __tenDotGiamGiaChot: nx.tenDotGiamGia ?? null,

        anhUrl: nx.anhUrl,

        qty: addQty,
        checked: true,
      };

      cartItems.value.unshift(item);
      capNhatTonLocal(id, -addQty);
    }

    scheduleAutoVoucher();
    scheduleSyncHoaDon();
  }

  // ======= MODAL CTSP =======
  async function openCtspModal() {
    showCtspModal.value = true;
    ctspPage.value = 1;
    startPollCtsp();
    await loadCtspForPos();
  }

  function closeCtspModal() {
    deps.blurActive();
    showCtspModal.value = false;

    if (!Array.isArray(cartItems.value) || cartItems.value.length === 0) {
      stopPollCtsp();
    }
  }

  function resetCtspFilter() {
    ctspFilter.keyword = "";
    ctspFilter.mauSac = "";
    ctspFilter.kichCo = "";
    ctspFilter.tenSanPham = "";
    ctspPage.value = 1;
  }

  return {
    // state
    showCtspModal,
    ctspLoading,
    ctspErr,
    ctspList,
    ctspFilter,
    ctspPage,
    ctspPageSize,

    // computed
    filteredCtsp,
    ctspTotalPages,
    pagedCtsp,
    ctspMauSacOptions,
    ctspKichCoOptions,
    ctspSanPhamOptions,

    // helpers for template
    resolveImage,
    onImgErr,
    getGiaGoc,
    getGiaThucTe,
    showGiaGoc,
    getPhanTramGiamDisplay,
    getGiamGiaTitle,

    // ✅ expose để SalesPage disable nút "+"
    isGiaDaThayDoiSoVoiServer,

    // cart
    getMaxQtyForItem,
    incQty,
    decQty,
    onQtyInput,
    onQtyBlur,
    removeItem,

    // pick
    pickCtsp,

    // modal
    openCtspModal,
    closeCtspModal,
    resetCtspFilter,

    // api
    loadCtspForPos,
    ensureBaseQtyIfCartHasItems,
    capNhatDotGiamGiaChoGioHang,
  };
}