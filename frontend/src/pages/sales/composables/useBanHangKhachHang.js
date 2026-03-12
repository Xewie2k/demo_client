// File: src/pages/sales/composables/useBanHangKhachHang.js
import { computed, reactive, ref } from "vue";

export function useBanHangKhachHang(deps) {
  const {
    SalesService,
    isCounter,

    showToast,
    scheduleAutoVoucher,
    persistActiveTab,
    scheduleSyncHoaDon,
  } = deps;

  const showKhModal = ref(false);
  const khLoading = ref(false);
  const khErr = ref("");
  const khList = ref([]);
  const khFilter = reactive({ keyword: "" });

  const selectedKh = ref(null);

  const guest = reactive({
    tenKhachHang: "",
    soDienThoai: "",
    diaChiCuThe: "",
    tinhThanh: "",
    huyenQuan: "",
    xaPhuong: "",
  });

  const tinhOptions = ref([]);
  const huyenOptions = ref([]);
  const xaOptions = ref([]);

  const showDiaChiModal = ref(false);
  const dcLoading = ref(false);
  const dcErr = ref("");
  const diaChiList = ref([]);
  const selectedDiaChi = ref(null);

  const khAddrCache = reactive({});
  const khAddrLoading = reactive({});

  function getKhName(k) {
    if (!k) return "";
    return k.hoTen || k.tenKhachHang || k.ten || k.fullName || k.name || "";
  }

  function getKhPhone(k) {
    if (!k) return "";
    return k.sdt || k.soDienThoai || k.phone || k.soDienThoaiKhachHang || "";
  }

  function getKhEmail(k) {
    if (!k) return "";
    return k.email || k.mail || "";
  }

  function renderDiaChi(dc) {
    if (!dc) return "";
    const soNha = dc.soNha || dc.diaChiCuThe || dc.diaChi || dc.diaChiChiTiet || "";
    const xa = dc.xaPhuong || dc.phuongXa || dc.xa || "";
    const huyen = dc.quanHuyen || dc.huyenQuan || dc.huyen || "";
    const tinh = dc.tinhThanh || dc.thanhPho || dc.tinh || "";
    const parts = [soNha, xa, huyen, tinh].filter((x) => String(x || "").trim());
    return parts.join(", ");
  }

  function renderKhDiaChi(k) {
    if (!k) return "";

    const direct =
      k.diaChiDayDu ||
      k.diaChiMacDinh ||
      k.diaChiGiaoHang ||
      k.diaChiKhachHang ||
      k.diaChi ||
      k.address ||
      "";
    if (typeof direct === "string" && direct.trim()) return direct.trim();

    const soNha = k.soNha || k.diaChiCuThe || k.diaChiChiTiet || "";
    const xa = k.xaPhuong || k.phuongXa || k.xa || "";
    const huyen = k.quanHuyen || k.huyenQuan || k.huyen || "";
    const tinh = k.tinhThanh || k.thanhPho || k.tinh || "";
    const parts = [soNha, xa, huyen, tinh].filter((x) => String(x || "").trim());
    if (parts.length) return parts.join(", ");

    if (k.diaChiMacDinh && typeof k.diaChiMacDinh === "object") {
      const s = renderDiaChi(k.diaChiMacDinh);
      if (s) return s;
    }

    const list =
      k.diaChiList ||
      k.danhSachDiaChi ||
      k.diaChiKhachHangs ||
      k.addresses ||
      null;
    if (Array.isArray(list) && list.length > 0) {
      let def = list.find((x) => x.macDinh === true || x.macDinh === 1);
      if (!def) def = list[0];
      const s = renderDiaChi(def);
      if (s) return s;
    }

    return "";
  }

  const filteredKh = computed(() => {
    const kw = (khFilter.keyword || "").toLowerCase();
    if (!kw) return khList.value;

    return khList.value.filter((k) => {
      const addr = khAddrCache[k.id] || renderKhDiaChi(k) || "";
      const s = `${getKhName(k)} ${getKhPhone(k)} ${addr}`.toLowerCase();
      return s.includes(kw);
    });
  });

  function onGuestPhoneInput(e) {
    const raw = String(e?.target?.value || "");
    const digits = raw.replace(/\D/g, "");
    guest.soDienThoai = digits;
    scheduleSyncHoaDon();
  }

  async function loadKh() {
    khLoading.value = true;
    khErr.value = "";
    try {
      const data = await SalesService.getKhachHangAll();
      khList.value = Array.isArray(data) ? data : [];
    } catch (e) {
      khErr.value = "Không tải được dữ liệu khách hàng (API đang lỗi).";
      khList.value = [];
    } finally {
      khLoading.value = false;
    }
  }

  function preloadKhAddr(list) {
    if (!Array.isArray(list)) return;
    list.forEach((k) => ensureKhAddr(k));
  }

  async function ensureKhAddr(k) {
    if (!k?.id) return;
    if (khAddrCache[k.id]) return;
    if (khAddrLoading[k.id]) return;

    const direct = renderKhDiaChi(k);
    if (direct) {
      khAddrCache[k.id] = direct;
      return;
    }

    khAddrLoading[k.id] = true;
    try {
      const list = await SalesService.getDiaChiByKhachHangId(k.id);
      let def = list.find((x) => x.macDinh === true || x.macDinh === 1);
      if (!def && list.length > 0) def = list[0];

      const addr = def ? renderDiaChi(def) : "";
      if (addr) khAddrCache[k.id] = addr;
    } catch (e) {
    } finally {
      delete khAddrLoading[k.id];
    }
  }

  async function openKhModal() {
    showKhModal.value = true;
    await loadKh();
    preloadKhAddr(filteredKh.value.slice(0, 12));
  }

  function closeKhModal() {
    deps.blurActive();
    showKhModal.value = false;
  }

  async function reloadKh() {
    await loadKh();
    preloadKhAddr(filteredKh.value.slice(0, 12));
  }

  async function loadDiaChiAndPickDefault(khachHangId, autoCloseIfSingle = true) {
    dcLoading.value = true;
    dcErr.value = "";
    try {
      const list = await SalesService.getDiaChiByKhachHangId(khachHangId);

      diaChiList.value = Array.isArray(list) ? list : [];

      let def = diaChiList.value.find((x) => x.macDinh === true || x.macDinh === 1);
      if (!def && diaChiList.value.length > 0) def = diaChiList.value[0];

      selectedDiaChi.value = def || null;

      if (selectedKh.value?.id && selectedDiaChi.value) {
        const addr = renderDiaChi(selectedDiaChi.value);
        if (addr) khAddrCache[selectedKh.value.id] = addr;
      }

      if (autoCloseIfSingle && diaChiList.value.length <= 1) {
        deps.blurActive();
        showDiaChiModal.value = false;
      }
    } catch (e) {
      dcErr.value = "Không tải được địa chỉ khách hàng (API đang lỗi).";
      diaChiList.value = [];
      selectedDiaChi.value = null;
    } finally {
      dcLoading.value = false;
    }
  }

  async function pickKh(k) {
    selectedKh.value = k;
    deps.blurActive();
    showKhModal.value = false;

    // reset guest
    guest.tenKhachHang = "";
    guest.soDienThoai = "";
    guest.diaChiCuThe = "";
    guest.tinhThanh = "";
    guest.huyenQuan = "";
    guest.xaPhuong = "";

    if (isCounter.value && k?.id) {
      await loadDiaChiAndPickDefault(k.id);
    } else {
      diaChiList.value = [];
      selectedDiaChi.value = null;
    }

    ensureKhAddr(k);
    scheduleAutoVoucher();
    persistActiveTab();
    scheduleSyncHoaDon();
  }

  async function openDiaChiModal() {
    if (!selectedKh.value?.id) return;
    showDiaChiModal.value = true;
    await loadDiaChiAndPickDefault(selectedKh.value.id, false);
  }

  function closeDiaChiModal() {
    deps.blurActive();
    showDiaChiModal.value = false;
  }

  function pickDiaChi(dc) {
    selectedDiaChi.value = dc;
    deps.blurActive();
    showDiaChiModal.value = false;

    if (selectedKh.value?.id && dc) {
      const addr = renderDiaChi(dc);
      if (addr) khAddrCache[selectedKh.value.id] = addr;
    }

    persistActiveTab();
    scheduleSyncHoaDon();
  }

  function chonKhachVangLai() {
    if (!isCounter.value) {
      showToast("Chức năng này dùng cho giao hàng.", "info");
      return;
    }

    selectedKh.value = null;
    diaChiList.value = [];
    selectedDiaChi.value = null;

    showToast("Đã chuyển sang khách vãng lai.", "info");
    scheduleAutoVoucher();
    persistActiveTab();
    scheduleSyncHoaDon();
  }

  return {
    // state
    showKhModal,
    khLoading,
    khErr,
    khList,
    khFilter,

    selectedKh,
    guest,
    tinhOptions,
    huyenOptions,
    xaOptions,

    showDiaChiModal,
    dcLoading,
    dcErr,
    diaChiList,
    selectedDiaChi,

    khAddrCache,
    khAddrLoading,

    // computed
    filteredKh,

    // utils
    getKhName,
    getKhPhone,
    getKhEmail,
    renderDiaChi,
    renderKhDiaChi,

    // handlers
    onGuestPhoneInput,

    // modal actions
    openKhModal,
    closeKhModal,
    reloadKh,
    pickKh,

    openDiaChiModal,
    closeDiaChiModal,
    pickDiaChi,
    loadDiaChiAndPickDefault,

    chonKhachVangLai,
  };
}