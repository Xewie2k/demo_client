// File: src/pages/sales/composables/useBanHangTabs.js
import { onBeforeUnmount, ref } from "vue";

export function useBanHangTabs(deps) {
  const {
    // state refs cần sync vào tab
    isCounter,
    cartItems,

    selectedKh,
    diaChiList,
    selectedDiaChi,

    autoVoucher,
    voucherManual,
    voucherCode,

    khachThanhToan,
    payMethod,
    payTienMat,
    payChuyenKhoan,
    payMaThamChieu,
    payTienMatText,
    payChuyenKhoanText,

    guest,

    phiVanChuyen,
    phiVanChuyenText,

    // deps
    apiClient,
    showToast,
    capNhatTonLocal,

    // callbacks
    scheduleAutoVoucher,
    scheduleSyncHoaDon,
    ensureBaseQtyIfCartHasItems,
    capNhatDotGiamGiaChoGioHang,
    loadDiaChiAndPickDefault,

    // stock key clear
    xoaTonKhoLocal,
    dongTatCaModal,
    blurActive,
  } = deps;

  const maxOrderTabs = ref(10);
  const tabs = ref([]);
  const activeTab = ref(0);

  const midnightTimer = ref(null);
  const midnightInterval = ref(null);
  const lastDayKey = ref("");

  function safeParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  function clonePlain(v, fallback = null) {
    if (v == null) return fallback;
    if (typeof v !== "object") return v;
    try {
      return JSON.parse(JSON.stringify(v));
    } catch (e) {
      return Array.isArray(v) ? [...v] : { ...v };
    }
  }

  function taoRowId() {
    return `row_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function ensureRowId(item) {
    if (!item || typeof item !== "object") return item;
    if (!item.__rowId) item.__rowId = taoRowId();
    return item;
  }

  function normalizeCartItemsForTab(items) {
    const list = Array.isArray(items) ? items : [];
    return list.map((x) => {
      const out = clonePlain(x, {});
      ensureRowId(out);
      out.qty = Math.max(1, Number(out.qty || 1));
      return out;
    });
  }

  function buildEmptyGuest() {
    return {
      tenKhachHang: "",
      soDienThoai: "",
      diaChiCuThe: "",
      tinhThanh: "",
      huyenQuan: "",
      xaPhuong: "",
    };
  }

  function normalizeGuestState(x) {
    if (!x || typeof x !== "object") return buildEmptyGuest();
    return {
      tenKhachHang: x.tenKhachHang || "",
      soDienThoai: x.soDienThoai || "",
      diaChiCuThe: x.diaChiCuThe || "",
      tinhThanh: x.tinhThanh || "",
      huyenQuan: x.huyenQuan || "",
      xaPhuong: x.xaPhuong || "",
    };
  }

  function normalizeTab(t, idx = 0) {
    const orderNo = Number(t?.orderNo || idx + 1) || idx + 1;
    const hdCode = String(t?.hdCode || "").trim() || "000";

    return {
      id: t?.id ?? Date.now() + Math.random(),
      orderNo,
      hdCode,
      name: t?.name || `Đơn hàng ${orderNo} - HD-${hdCode}`,
      hoaDonId: t?.hoaDonId ?? null,

      isCounter: !!t?.isCounter,
      cartItems: normalizeCartItemsForTab(t?.cartItems),

      selectedKh: clonePlain(t?.selectedKh, null),
      diaChiList: Array.isArray(t?.diaChiList) ? t.diaChiList.map((x) => clonePlain(x, {})) : [],
      selectedDiaChi: clonePlain(t?.selectedDiaChi, null),

      autoVoucher: clonePlain(t?.autoVoucher, null),
      voucherManual: clonePlain(t?.voucherManual, null),
      voucherCode: String(t?.voucherCode || ""),

      khachThanhToan: Number(t?.khachThanhToan || 0) || 0,

      payMethod: t?.payMethod || "TIEN_MAT",
      payTienMat: Number(t?.payTienMat || 0) || 0,
      payChuyenKhoan: Number(t?.payChuyenKhoan || 0) || 0,
      payMaThamChieu: String(t?.payMaThamChieu || "").trim(),
      payTienMatText: String(t?.payTienMatText || ""),
      payChuyenKhoanText: String(t?.payChuyenKhoanText || ""),

      guest: normalizeGuestState(t?.guest),

      phiVanChuyen: Number(t?.phiVanChuyen || 0) || 0,
      phiVanChuyenText: String(t?.phiVanChuyenText || "0"),
    };
  }

  function persistTabs() {
    const out = Array.isArray(tabs.value) ? tabs.value.map((t, i) => normalizeTab(t, i)) : [];
    localStorage.setItem("ss_pos_tabs", JSON.stringify(out));
    localStorage.setItem("ss_pos_active_tab", String(activeTab.value));
  }

  function persistActiveTab() {
    const t = tabs.value?.[activeTab.value];
    if (!t) return;

    t.isCounter = !!isCounter.value;
    t.cartItems = normalizeCartItemsForTab(cartItems.value);

    t.selectedKh = clonePlain(selectedKh.value, null);
    t.diaChiList = Array.isArray(diaChiList.value) ? diaChiList.value.map((x) => clonePlain(x, {})) : [];
    t.selectedDiaChi = clonePlain(selectedDiaChi.value, null);

    t.autoVoucher = clonePlain(autoVoucher.value, null);
    t.voucherManual = clonePlain(voucherManual.value, null);
    t.voucherCode = String(voucherCode.value || "");

    t.khachThanhToan = Number(khachThanhToan.value || 0) || 0;
    t.payMethod = payMethod.value || "TIEN_MAT";
    t.payTienMat = Number(payTienMat.value || 0) || 0;
    t.payChuyenKhoan = Number(payChuyenKhoan.value || 0) || 0;
    t.payMaThamChieu = String(payMaThamChieu.value || "").trim();
    t.payTienMatText = String(payTienMatText.value || "");
    t.payChuyenKhoanText = String(payChuyenKhoanText.value || "");

    t.guest = normalizeGuestState(guest);
    t.phiVanChuyen = Number(phiVanChuyen.value || 0) || 0;
    t.phiVanChuyenText = String(phiVanChuyenText.value || "0");

    persistTabs();
  }

  function applyTabState(t) {
    const tab = normalizeTab(t, activeTab.value);

    isCounter.value = !!tab.isCounter;
    cartItems.value = normalizeCartItemsForTab(tab.cartItems);

    selectedKh.value = clonePlain(tab.selectedKh, null);
    diaChiList.value = Array.isArray(tab.diaChiList) ? tab.diaChiList.map((x) => clonePlain(x, {})) : [];
    selectedDiaChi.value = clonePlain(tab.selectedDiaChi, null);

    autoVoucher.value = clonePlain(tab.autoVoucher, null);
    voucherManual.value = clonePlain(tab.voucherManual, null);
    voucherCode.value = String(tab.voucherCode || "");

    khachThanhToan.value = Number(tab.khachThanhToan || 0) || 0;
    payMethod.value = tab.payMethod || "TIEN_MAT";
    payTienMat.value = Number(tab.payTienMat || 0) || 0;
    payChuyenKhoan.value = Number(tab.payChuyenKhoan || 0) || 0;
    payMaThamChieu.value = String(tab.payMaThamChieu || "").trim();

    payTienMatText.value =
      String(tab.payTienMatText || "").trim() !== ""
        ? String(tab.payTienMatText)
        : deps.formatNumberText(payTienMat.value || 0);

    payChuyenKhoanText.value =
      String(tab.payChuyenKhoanText || "").trim() !== ""
        ? String(tab.payChuyenKhoanText)
        : deps.formatNumberText(payChuyenKhoan.value || 0);

    Object.assign(guest, normalizeGuestState(tab.guest));

    phiVanChuyen.value = Number(tab.phiVanChuyen || 0) || 0;
    phiVanChuyenText.value = String(tab.phiVanChuyenText || "0");

    if (isCounter.value && selectedKh.value?.id && diaChiList.value.length === 0) {
      loadDiaChiAndPickDefault(selectedKh.value.id);
    }
  }

  async function refreshTabSauKhiApply() {
    try {
      await ensureBaseQtyIfCartHasItems();
    } catch (e) {}

    try {
      await capNhatDotGiamGiaChoGioHang();
    } catch (e) {}

    try {
      scheduleAutoVoucher();
    } catch (e) {}

    try {
      scheduleSyncHoaDon();
    } catch (e) {}
  }

  function pad3(n) {
    const x = Number(n || 0);
    if (x < 10) return `00${x}`;
    if (x < 100) return `0${x}`;
    return `${x}`;
  }

  function nextHdCode() {
    const key = "ss_pos_hd_seq";
    let seq = parseInt(localStorage.getItem(key) || "1", 10);
    if (!Number.isFinite(seq) || seq <= 0) seq = 1;
    const code = pad3(seq);
    localStorage.setItem(key, String(seq + 1));
    return code;
  }

  function makeEmptyTab(orderNo, hdCode) {
    return {
      id: Date.now() + Math.random(),
      orderNo,
      hdCode,
      name: `Đơn hàng ${orderNo} - HD-${hdCode}`,
      hoaDonId: null,

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
      payTienMatText: "",
      payChuyenKhoanText: "",

      guest: buildEmptyGuest(),

      phiVanChuyen: 0,
      phiVanChuyenText: "0",
    };
  }

  function resetPageState() {
    tabs.value = [];
    activeTab.value = 0;

    isCounter.value = false;
    cartItems.value = [];

    selectedKh.value = null;
    diaChiList.value = [];
    selectedDiaChi.value = null;

    autoVoucher.value = null;
    voucherManual.value = null;
    voucherCode.value = "";

    khachThanhToan.value = 0;
    payMethod.value = "TIEN_MAT";
    payTienMat.value = 0;
    payChuyenKhoan.value = 0;
    payMaThamChieu.value = "";
    payTienMatText.value = "";
    payChuyenKhoanText.value = "";

    Object.assign(guest, buildEmptyGuest());

    phiVanChuyen.value = 0;
    phiVanChuyenText.value = "0";
  }

  function tabItemCount(t) {
    const items = Array.isArray(t?.cartItems) ? t.cartItems : [];
    return items.reduce((sum, it) => sum + Math.max(0, Number(it?.qty || 0)), 0);
  }

  async function switchTab(idx) {
    if (idx === activeTab.value) return;
    persistActiveTab();

    try {
      blurActive?.();
    } catch (e) {}

    activeTab.value = idx;
    applyTabState(tabs.value[idx]);
    persistTabs();

    await refreshTabSauKhiApply();
  }

  function createOrderTab() {
    if (tabs.value.length >= maxOrderTabs.value) {
      showToast(`Chỉ được tạo tối đa ${maxOrderTabs.value} đơn để tránh spam.`, "error");
      return;
    }

    persistActiveTab();

    try {
      blurActive?.();
    } catch (e) {}

    const n = tabs.value.length + 1;
    const hdCode = nextHdCode();
    const tab = makeEmptyTab(n, hdCode);

    tabs.value.push(tab);
    activeTab.value = tabs.value.length - 1;
    applyTabState(tab);
    persistTabs();

    showToast(`Đã tạo đơn hàng: HD-${hdCode}`, "success");

    scheduleSyncHoaDon();
    scheduleAutoVoucher();
  }

  async function closeTab(idx) {
    persistActiveTab();

    const tab = normalizeTab(tabs.value[idx], idx);
    const hasItems = Array.isArray(tab?.cartItems) && tab.cartItems.length > 0;

    if (hasItems) {
      const ok = window.confirm(
        "Đơn hàng đang có sản phẩm. Bạn có chắc muốn hủy đơn này không? (Hệ thống sẽ hoàn lại tồn kho)",
      );
      if (!ok) return;
    }

    const items = Array.isArray(tab?.cartItems) ? tab.cartItems : [];
    for (const it of items) {
      const qty = Math.max(0, Number(it?.qty || 0));
      if (qty > 0) capNhatTonLocal(it?.id, qty);
    }

    const hdId = tab?.hoaDonId;
    if (hdId) {
      try {
        await apiClient.delete(`/api/admin/hoa-don/${hdId}/reset`);
      } catch (e) {
        try {
          await apiClient.delete(`/api/admin/hoa-don/${hdId}`);
        } catch (e2) {}
      }
    }

    const wasActive = idx === activeTab.value;
    tabs.value.splice(idx, 1);

    tabs.value = tabs.value.map((t, i) => ({
      ...normalizeTab(t, i),
      orderNo: i + 1,
      name: `Đơn hàng ${i + 1} - HD-${t.hdCode}`,
    }));

    if (tabs.value.length === 0) {
      resetPageState();
      persistTabs();
      return;
    }

    if (wasActive) activeTab.value = idx > 0 ? idx - 1 : 0;
    else if (idx < activeTab.value) activeTab.value = Math.max(0, activeTab.value - 1);

    if (activeTab.value >= tabs.value.length) activeTab.value = tabs.value.length - 1;

    applyTabState(tabs.value[activeTab.value]);
    persistTabs();
    await refreshTabSauKhiApply();
  }

  // ======= AUTO CLEAR 0H + STORAGE SYNC =======
  function getTodayKeyLocal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function xoaVoucherFingerprintLocal() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith("ss_pos_voucher_fp_")) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
  }

  function clearPosTabsLocal(reason = "") {
    try {
      localStorage.removeItem("ss_pos_tabs");
      localStorage.removeItem("ss_pos_active_tab");
      localStorage.removeItem("ss_pos_hd_seq");
    } catch (e) {}

    try {
      xoaVoucherFingerprintLocal();
    } catch (e) {}

    try {
      xoaTonKhoLocal();
    } catch (e) {}

    resetPageState();
    persistTabs();

    try {
      blurActive?.();
    } catch (e) {}

    // đóng modal nếu đang mở
    dongTatCaModal();

    showToast(reason || "Đã sang ngày mới, hệ thống tự động làm mới màn bán hàng.", "info");
  }

  function checkNewDayAndClearIfNeeded() {
    const key = "ss_pos_day";
    const today = getTodayKeyLocal();
    const last = localStorage.getItem(key);

    if (!last) {
      localStorage.setItem(key, today);
      lastDayKey.value = today;
      return;
    }

    if (last !== today) {
      localStorage.setItem(key, today);
      lastDayKey.value = today;
      clearPosTabsLocal("Đã sang ngày mới, hệ thống đã xoá các hoá đơn chờ và làm mới tabs.");
      return;
    }

    lastDayKey.value = today;
  }

  function scheduleClearAtNextMidnight() {
    if (midnightTimer.value) clearTimeout(midnightTimer.value);
    if (midnightInterval.value) clearInterval(midnightInterval.value);

    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);

    let ms = next.getTime() - now.getTime();
    if (!Number.isFinite(ms) || ms < 0) ms = 5_000;

    midnightTimer.value = setTimeout(() => {
      checkNewDayAndClearIfNeeded();
      scheduleClearAtNextMidnight();
    }, ms + 500);

    midnightInterval.value = setInterval(() => {
      checkNewDayAndClearIfNeeded();
    }, 30_000);
  }

  function onStorageSync(e) {
    if (!e) return;
    if (e.key === "ss_pos_tabs" || e.key === "ss_pos_active_tab" || e.key === "ss_pos_day") {
      checkNewDayAndClearIfNeeded();

      const savedTabs = safeParse(localStorage.getItem("ss_pos_tabs") || "[]", []);
      if (Array.isArray(savedTabs) && savedTabs.length > 0) {
        tabs.value = savedTabs.map((t, i) => normalizeTab(t, i));
        activeTab.value = Number(localStorage.getItem("ss_pos_active_tab") || "0");
        if (activeTab.value < 0 || activeTab.value >= tabs.value.length) activeTab.value = 0;
        applyTabState(tabs.value[activeTab.value]);
        refreshTabSauKhiApply().catch?.(() => {});
      } else {
        resetPageState();
        persistTabs();
      }
    }
  }

  function khoiPhucTabsTuLocal() {
    const savedTabs = safeParse(localStorage.getItem("ss_pos_tabs") || "[]", []);
    if (Array.isArray(savedTabs) && savedTabs.length > 0) {
      tabs.value = savedTabs.map((t, i) => normalizeTab(t, i));
      activeTab.value = Number(localStorage.getItem("ss_pos_active_tab") || "0");
      if (activeTab.value < 0 || activeTab.value >= tabs.value.length) activeTab.value = 0;
      applyTabState(tabs.value[activeTab.value]);
      refreshTabSauKhiApply().catch?.(() => {});
    } else {
      resetPageState();
      persistTabs();
    }
  }

  function khoiTaoAutoClearVaSyncStorage() {
    checkNewDayAndClearIfNeeded();
    scheduleClearAtNextMidnight();
    window.addEventListener("storage", onStorageSync);
  }

  onBeforeUnmount(() => {
    try {
      if (midnightTimer.value) clearTimeout(midnightTimer.value);
      if (midnightInterval.value) clearInterval(midnightInterval.value);
    } catch (e) {}
    window.removeEventListener("storage", onStorageSync);
  });

  return {
    maxOrderTabs,
    tabs,
    activeTab,

    persistTabs,
    persistActiveTab,
    applyTabState,

    tabItemCount,
    switchTab,
    createOrderTab,
    closeTab,

    khoiPhucTabsTuLocal,
    khoiTaoAutoClearVaSyncStorage,
    checkNewDayAndClearIfNeeded,
  };
}