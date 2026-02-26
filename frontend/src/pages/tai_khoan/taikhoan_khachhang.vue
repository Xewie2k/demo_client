<!-- File: src/pages/tai_khoan/khach_hang/taikhoan_khachhang.vue -->
<template>
  <h2 class="page-title">Quản lý tài khoản/ Quản lý khách hàng</h2>

  <div class="taikhoan-khachhang-container" v-if="!isPage">
    <div class="panel">
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Tìm theo tên, SĐT, email,... "
              class="search-input"
            />
          </div>
        </div>

        <div class="toolbar-right">
          <button class="btn btn-reset" @click="resetFilters" type="button">
            <span class="material-icons-outlined btn-mi">restart_alt</span>
            Đặt lại bộ lọc
          </button>

          <button class="btn btn-export" @click="exportExcel" type="button">
            <span class="material-icons-outlined btn-mi">description</span>
            Xuất Excel
          </button>

          <button class="btn btn-newaccount" @click="themkh" type="button">
            <i class="fa-solid fa-plus"></i> Thêm khách hàng
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <label>Giới tính:</label>
          <select v-model="filters.gender" class="form-select rounded-3 filter-pill">
            <option value="">Tất cả</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="filters.status" class="form-select rounded-3 filter-pill">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã khách hàng</th>
              <th>Họ tên</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in khachhangList" :key="item.id">
              <td class="text-gray">{{ pageNo * pageSize + index + 1 }}</td>

              <td class="text-dark fw-700">{{ item.maKhachHang ?? "---" }}</td>

              <td class="text-dark fw-700">{{ item.tenKhachHang ?? "---" }}</td>
              <td class="text-gray">{{ item.soDienThoai ?? "---" }}</td>
              <td class="text-gray">{{ item.email ?? "---" }}</td>

              <td class="text-gray">{{ addrMap.get(item.id) ?? "---" }}</td>

              <td>
                <span class="badge" :class="item.trangThai ? 'status-active' : 'status-ended'">
                  {{ item.trangThai ? "Hoạt động" : "Ngừng hoạt động" }}
                </span>
              </td>

              <td class="text-center">
                <div class="action-group">
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="!!item.trangThai"
                      :disabled="dangCapNhatTrangThai.has(item.id)"
                      @change="(e) => toggleStatus(item, e)"
                    />
                    <span class="slider"></span>
                  </label>

                  <!-- ✅ Sổ địa chỉ -->
                  <button
                    class="ss-icon-btn-view"
                    @click="openSoDiaChi(item)"
                    title="Sổ địa chỉ"
                    type="button"
                  >
                    <span class="material-icons-outlined">location_on</span>
                  </button>

                  <button
                    class="ss-icon-btn-view"
                    @click="updatedkh(item.id)"
                    title="Xem"
                    type="button"
                  >
                    <span class="material-icons-outlined">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-container">
        <button
          class="page-btn"
          :class="{ disabled: pageNo === 0 }"
          :disabled="pageNo === 0"
          @click="changePage(pageNo - 1)"
          type="button"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <button
          v-for="p in visiblePages"
          :key="p"
          class="page-btn"
          :class="{ active: pageNo === p }"
          @click="changePage(p)"
          type="button"
        >
          {{ p + 1 }}
        </button>

        <button
          class="page-btn"
          :class="{ disabled: pageNo >= totalPages - 1 }"
          :disabled="pageNo >= totalPages - 1"
          @click="changePage(pageNo + 1)"
          type="button"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>

  <router-view />

  <!-- =========================
       MODAL: SỔ ĐỊA CHỈ KHÁCH HÀNG
       (✅ chỉ sửa trong modal)
       ========================= -->
  <div v-if="soDiaChi.open" class="ss-overlay" @click.self="closeSoDiaChi">
    <div class="ss-addr-modal">
      <!-- ✅ TOAST trong modal -->
      <div v-if="soDiaChi.toast.show" class="ss-addr-toast" :class="soDiaChi.toast.type">
        <span class="material-icons-outlined ss-addr-toast-ic">
          {{ soDiaChi.toast.type === "success" ? "check_circle" : soDiaChi.toast.type === "error" ? "error" : "info" }}
        </span>
        <div class="ss-addr-toast-msg">{{ soDiaChi.toast.msg }}</div>
        <button class="ss-addr-toast-x" type="button" @click="hideSoDiaChiToast">×</button>
      </div>

      <div class="ss-addr-head">
        <div class="ss-addr-head-left">
          <div class="ss-addr-title">
            <span class="material-icons-outlined ss-addr-ic">place</span>
            <span>Sổ địa chỉ khách hàng</span>
          </div>
          <div class="ss-addr-sub">
            {{ soDiaChi.tenKhachHang || "---" }}
            <span class="ss-dot-sep">•</span>
            {{ soDiaChi.maKhachHang || "---" }}
          </div>
        </div>

        <div class="ss-addr-head-right">
          <button
            class="ss-addr-head-btn"
            type="button"
            title="Làm mới"
            @click="reloadSoDiaChi(true)"
            :disabled="soDiaChi.loading"
          >
            <span class="material-icons-outlined">refresh</span>
          </button>
          <button class="ss-addr-head-btn" type="button" title="Đóng" @click="closeSoDiaChi">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      </div>

      <div class="ss-addr-body">
        <div class="ss-addr-grid">
          <!-- LEFT: danh sách -->
          <div class="ss-addr-card ss-addr-card-list">
            <div class="ss-addr-card-head">
              <div class="ss-addr-card-title">
                <span class="material-icons-outlined">list</span>
                <span>Danh sách địa chỉ</span>
              </div>
            </div>

            <div class="ss-addr-table-wrap">
              <table class="ss-addr-table">
                <thead>
                  <tr>
                    <th style="width:70px">STT</th>
                    <th>Địa chỉ</th>
                    <th style="width:120px">Mặc định</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!soDiaChi.list.length">
                    <td colspan="3" class="ss-addr-empty">Chưa có địa chỉ nào</td>
                  </tr>

                  <tr v-for="(a, idx) in soDiaChi.list" :key="a.id ?? idx">
                    <td class="ss-addr-stt">{{ idx + 1 }}</td>

                    <td>
                      <div class="ss-addr-line">
                        <div class="ss-addr-main">
                          {{ buildAddrText(a) || a?.tenDiaChi || "---" }}
                        </div>
                        <div class="ss-addr-subline">
                          Người nhận:
                          {{ a?.hoTenNguoiNhan ?? a?.tenNguoiNhan ?? "---" }}
                          <span class="ss-dot-sep">•</span>
                          SĐT: {{ a?.soDienThoai ?? a?.sdt ?? "---" }}
                        </div>
                      </div>
                    </td>

                    <td class="ss-addr-default-col">
                      <span v-if="a?.macDinh" class="ss-addr-badge">Mặc định</span>
                      <button
                        v-else
                        class="ss-addr-mini-btn"
                        type="button"
                        @click="confirmSetMacDinhDiaChi(a)"
                        :disabled="soDiaChi.loading"
                        title="Đặt mặc định"
                      >
                        <span class="material-icons-outlined">check</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- RIGHT: thêm nhanh -->
          <div class="ss-addr-card ss-addr-card-form">
            <div class="ss-addr-card-head">
              <div class="ss-addr-card-title">
                <span class="material-icons-outlined">add_location_alt</span>
                <span>Thêm nhanh địa chỉ</span>
              </div>
            </div>

            <div class="ss-addr-form">
              <div class="ss-addr-row">
                <div class="ss-addr-col">
                  <label class="ss-addr-label">Họ tên người nhận</label>
                  <input
                    v-model.trim="quick.tenNguoiNhan"
                    class="ss-addr-input"
                    placeholder="vd: Nguyễn Văn A"
                  />
                </div>

                <div class="ss-addr-col">
                  <label class="ss-addr-label">Số điện thoại</label>
                  <input
                    v-model.trim="quick.soDienThoai"
                    class="ss-addr-input"
                    placeholder="vd: 09xxxxxxxx"
                  />
                </div>
              </div>

              <div class="ss-addr-row">
                <div class="ss-addr-col">
                  <label class="ss-addr-label">Thành phố/Tỉnh</label>

                  <v-select
                    v-model="quick.tinh"
                    :options="tinhOptions"
                    label="name"
                    placeholder="Chọn hoặc tìm tỉnh/thành..."
                    :clearable="true"
                  >
                    <template #option="opt">
                      <span class="text-truncate">{{ opt?.name }}</span>
                    </template>
                    <template #selected-option="opt">
                      <span>{{ opt?.name }}</span>
                    </template>
                  </v-select>
                </div>

                <div class="ss-addr-col">
                  <label class="ss-addr-label">Quận/Huyện</label>

                  <v-select
                    v-model="quick.huyen"
                    :options="huyenOptions"
                    label="name"
                    placeholder="Chọn hoặc tìm quận/huyện..."
                    :clearable="true"
                    :disabled="!quick.tinh"
                  >
                    <template #option="opt">
                      <span class="text-truncate">{{ opt?.name }}</span>
                    </template>
                    <template #selected-option="opt">
                      <span>{{ opt?.name }}</span>
                    </template>
                  </v-select>
                </div>
              </div>

              <div class="ss-addr-row">
                <div class="ss-addr-col">
                  <label class="ss-addr-label">Phường/Xã</label>

                  <v-select
                    v-model="quick.xa"
                    :options="xaOptions"
                    label="name"
                    placeholder="Chọn hoặc tìm phường/xã..."
                    :clearable="true"
                    :disabled="!quick.huyen"
                  >
                    <template #option="opt">
                      <span class="text-truncate">{{ opt?.name }}</span>
                    </template>
                    <template #selected-option="opt">
                      <span>{{ opt?.name }}</span>
                    </template>
                  </v-select>
                </div>

                <div class="ss-addr-col">
                  <label class="ss-addr-label">Địa chỉ cụ thể</label>
                  <input
                    v-model.trim="quick.diaChiCuThe"
                    class="ss-addr-input"
                    placeholder="Số nhà, đường..."
                  />
                </div>
              </div>

              <label class="ss-addr-check">
                <input type="checkbox" v-model="quick.macDinh" />
                <span>Đặt làm địa chỉ mặc định</span>
              </label>

              <div class="ss-addr-actions">
                <button
                  class="ss-addr-btn ss-addr-btn-primary"
                  type="button"
                  @click="themNhanhDiaChi"
                  :disabled="soDiaChi.loading"
                >
                  {{ soDiaChi.loading ? "Đang thêm..." : "Thêm nhanh" }}
                </button>
              </div>

              <div v-if="soDiaChi.err" class="ss-addr-err">
                <span class="material-icons-outlined">error_outline</span>
                <span>{{ soDiaChi.err }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ bỏ footer Đóng (tránh thừa nút) -->
    </div>
  </div>
</template>

<script setup>
import {
  searchKhachHang,
  pagingKhachHang,
  updateKhachHang,
  getAllKhachHang
} from "@/services/tai_khoan/khach_hang/khach_hangService";

import {
  getAllDiaChiKhachHang
} from "@/services/tai_khoan/khach_hang/diaChiKhachHangService";

import {
  getDiaChiByKhachHangId_FEFilter,
  createDiaChiKhachHang,
  updateDiaChiKhachHang
} from "@/services/tai_khoan/khach_hang/diaChiKhachHangService";

import vnAddressService from "@/services/vnAddressService";

import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as XLSX from "xlsx";

const router = useRouter();
const route = useRoute();

const pageNo = ref(0);
const pageSize = ref(5);
const totalPages = ref(0);

const khachhangList = ref([]);
const khachhangOrigin = ref([]);

const addrMap = ref(new Map()); // idKhachHang -> "text"

const filters = ref({ keyword: "", status: "", gender: "" });

// ✅ Khóa theo id khi đang cập nhật + chống out-of-order khi bấm nhanh
const dangCapNhatTrangThai = ref(new Set()); // Set<id>
const trangThaiSeqMap = ref(new Map()); // Map<id, seq>

const themkh = () => router.push({ name: "tai-khoan-khach-hang-them" });
const updatedkh = (id) => router.push({ name: "tai-khoan-khach-hang-cap-nhat", params: { id } });

const isPage = computed(() => {
  return (
    route.path.includes("/admin/tai-khoan/khach-hang/them") ||
    route.path.includes("/admin/tai-khoan/khach-hang/cap-nhat")
  );
});

const sortNewestFirst = (arr) => (arr || []).slice().sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));

const buildAddrText = (a) => {
  const parts = [a?.diaChiCuThe, a?.phuong, a?.quan, a?.thanhPho]
    .map((x) => (x ?? "").toString().trim())
    .filter(Boolean);
  return parts.join(", ");
};

const loadAddressMap = async () => {
  try {
    const all = await getAllDiaChiKhachHang();
    const arr = Array.isArray(all) ? all : [];

    const m = new Map();
    for (const a of arr) {
      if (a?.xoaMem) continue;
      const idkh = a?.idKhachHang;
      if (!idkh) continue;

      const txt = buildAddrText(a) || a?.tenDiaChi || "---";

      if (!m.has(idkh) || a?.macDinh) m.set(idkh, txt);
    }

    addrMap.value = m;
  } catch (e) {
    console.log("Load address map error", e);
    addrMap.value = new Map();
  }
};

const applyStatusFilter = () => {
  const source = Array.isArray(khachhangOrigin.value) ? khachhangOrigin.value : (khachhangOrigin.value ?? []);

  if (!filters.value.status) {
    khachhangList.value = source;
    return;
  }

  const isActive = filters.value.status === "active";
  khachhangList.value = source.filter((item) => Boolean(item.trangThai) === isActive);
};

const applyGenderFilter = () => {
  const source = Array.isArray(khachhangList.value) ? khachhangList.value : [];
  if (!filters.value.gender) return;

  const isMale = filters.value.gender === "male";
  khachhangList.value = source.filter((item) => Boolean(item.gioiTinh) === isMale);
};

const reApplyFilters = () => {
  applyStatusFilter();
  applyGenderFilter();
};

const toggleStatus = async (item, e) => {
  const id = item?.id;
  if (!id) return;

  if (dangCapNhatTrangThai.value.has(id)) {
    if (e?.target) e.target.checked = !!item.trangThai;
    return;
  }

  const oldValue = !!item.trangThai;
  const newValue = !!e?.target?.checked;

  if (oldValue === newValue) return;

  const nextSeq = (trangThaiSeqMap.value.get(id) ?? 0) + 1;
  trangThaiSeqMap.value.set(id, nextSeq);

  item.trangThai = newValue;
  reApplyFilters();

  dangCapNhatTrangThai.value.add(id);

  try {
    await updateKhachHang(id, { trangThai: newValue });

    if (trangThaiSeqMap.value.get(id) !== nextSeq) return;

    reApplyFilters();
  } catch (err) {
    if (trangThaiSeqMap.value.get(id) === nextSeq) {
      item.trangThai = oldValue;
      reApplyFilters();
      alert("Không thể cập nhật trạng thái");
    }
  } finally {
    if (trangThaiSeqMap.value.get(id) === nextSeq) {
      dangCapNhatTrangThai.value.delete(id);
    }
  }
};

const exportExcel = async () => {
  try {
    await loadAddressMap();

    let allData = [];
    if (filters.value.keyword.trim()) {
      const res = await searchKhachHang(filters.value.keyword.trim());
      allData = Array.isArray(res) ? res : (res?.content ?? []);
    } else {
      const res = await getAllKhachHang();
      allData = Array.isArray(res) ? res : (res?.content ?? []);
    }

    let filteredData = allData;
    if (filters.value.status) {
      const isActive = filters.value.status === "active";
      filteredData = filteredData.filter((item) => Boolean(item.trangThai) === isActive);
    }

    if (filters.value.gender) {
      const isMale = filters.value.gender === "male";
      filteredData = filteredData.filter((item) => Boolean(item.gioiTinh) === isMale);
    }

    const sortedData = sortNewestFirst(filteredData);

    const dataToExport = sortedData.map((item, index) => ({
      STT: index + 1,
      "Mã khách hàng": item.maKhachHang ?? "---",
      "Họ tên": item.tenKhachHang ?? "---",
      "SĐT": item.soDienThoai ?? "---",
      Email: item.email ?? "---",
      "Địa chỉ": addrMap.value.get(item.id) ?? "---",
      "Trạng thái": item.trangThai ? "Hoạt động" : "Ngừng hoạt động",
    }));

    if (dataToExport.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách khách hàng");

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 50 },
      { wch: 20 },
    ];

    XLSX.writeFile(workbook, "DanhSachKhachHang.xlsx");
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    alert("Đã xảy ra lỗi khi xuất file Excel.");
  }
};

const handleFilter = async () => {
  try {
    if (filters.value.keyword.trim()) {
      const res = await searchKhachHang(filters.value.keyword.trim());
      const arr = Array.isArray(res) ? res : (res?.content ?? []);
      khachhangOrigin.value = sortNewestFirst(arr);
      totalPages.value = 1;
    } else {
      const res = await pagingKhachHang(pageNo.value, pageSize.value);
      khachhangOrigin.value = sortNewestFirst(res?.content ?? []);
      totalPages.value = res?.totalPages ?? 0;
    }

    applyStatusFilter();
    applyGenderFilter();

    await loadAddressMap();
  } catch (e) {
    console.log("Filter error", e);
  }
};

const resetFilters = async () => {
  filters.value = { keyword: "", status: "", gender: "" };
  pageNo.value = 0;
  await handleFilter();
};

const changePage = async (page) => {
  if (page < 0 || page >= totalPages.value) return;
  pageNo.value = page;
  await handleFilter();
};

const visiblePages = computed(() => {
  const pages = [];
  const max = totalPages.value;
  const current = pageNo.value;

  let start = Math.max(current - 2, 0);
  let end = Math.min(start + 4, max - 1);

  if (end - start < 4) start = Math.max(end - 4, 0);

  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

watch(
  filters,
  async () => {
    pageNo.value = 0;
    await handleFilter();
  },
  { deep: true }
);

watch(
  () => route.path,
  async (newPath) => {
    const isChild =
      newPath.includes("/admin/tai-khoan/khach-hang/them") ||
      newPath.includes("/admin/tai-khoan/khach-hang/cap-nhat");
    if (!isChild) await handleFilter();
  }
);

// =======================
// MODAL SỔ ĐỊA CHỈ
// =======================
const soDiaChi = reactive({
  open: false,
  loading: false,
  idKhachHang: null,
  maKhachHang: "",
  tenKhachHang: "",
  list: [],
  err: "",
  toast: { show: false, type: "info", msg: "" },
});

let soDiaChiToastTimer = null;

const showSoDiaChiToast = (type, msg) => {
  soDiaChi.toast.show = true;
  soDiaChi.toast.type = type || "info";
  soDiaChi.toast.msg = msg || "";

  if (soDiaChiToastTimer) clearTimeout(soDiaChiToastTimer);
  soDiaChiToastTimer = setTimeout(() => {
    soDiaChi.toast.show = false;
  }, 2800);
};

const hideSoDiaChiToast = () => {
  soDiaChi.toast.show = false;
};

const tinhOptions = ref([]);
const huyenOptions = ref([]);
const xaOptions = ref([]);

const quick = reactive({
  tenNguoiNhan: "",
  soDienThoai: "",
  diaChiCuThe: "",
  macDinh: false,
  tinh: null,
  huyen: null,
  xa: null,
});

const resetQuick = () => {
  quick.tenNguoiNhan = "";
  quick.soDienThoai = "";
  quick.diaChiCuThe = "";
  quick.macDinh = false;
  quick.tinh = null;
  quick.huyen = null;
  quick.xa = null;
  huyenOptions.value = [];
  xaOptions.value = [];
  soDiaChi.err = "";
};

const quickPreviewText = () => {
  const parts = [
    (quick.diaChiCuThe || "").toString().trim(),
    quick.xa?.name,
    quick.huyen?.name,
    quick.tinh?.name,
  ].filter((x) => (x ?? "").toString().trim());
  return parts.join(", ");
};

const getErrMsgNganGon = (e) => {
  const data = e?.response?.data;
  const msg =
    (typeof data === "string" ? data : null) ||
    data?.message ||
    data?.detail ||
    e?.message ||
    "";

  const s = String(msg || "").trim();
  if (!s) return "Đã xảy ra lỗi, vui lòng thử lại.";
  if (s.length > 120) return "Đã xảy ra lỗi, vui lòng kiểm tra lại dữ liệu.";
  return s;
};

const unsetMacDinhHienTai = async (ignoreId) => {
  const cur = (soDiaChi.list || []).find((x) => !!x?.macDinh && (ignoreId ? x?.id !== ignoreId : true));
  if (!cur?.id) return;
  await updateDiaChiKhachHang(cur.id, { macDinh: false });
};

watch(
  () => quick.tinh,
  async (nv) => {
    quick.huyen = null;
    quick.xa = null;
    xaOptions.value = [];
    try {
      huyenOptions.value = nv?.code ? await vnAddressService.getDistricts(nv.code) : [];
    } catch {
      huyenOptions.value = [];
    }
  }
);

watch(
  () => quick.huyen,
  async (nv) => {
    quick.xa = null;
    try {
      xaOptions.value = nv?.code ? await vnAddressService.getWards(nv.code) : [];
    } catch {
      xaOptions.value = [];
    }
  }
);

const openSoDiaChi = async (kh) => {
  soDiaChi.err = "";
  hideSoDiaChiToast();
  soDiaChi.idKhachHang = kh?.id ?? null;
  soDiaChi.maKhachHang = kh?.maKhachHang ?? "";
  soDiaChi.tenKhachHang = kh?.tenKhachHang ?? "";
  soDiaChi.open = true;

  resetQuick();

  try {
    if (!tinhOptions.value.length) tinhOptions.value = await vnAddressService.getProvinces();
  } catch {
    tinhOptions.value = [];
  }

  await reloadSoDiaChi(false);
};

const closeSoDiaChi = () => {
  soDiaChi.open = false;
  soDiaChi.loading = false;
  soDiaChi.list = [];
  soDiaChi.err = "";
  soDiaChi.idKhachHang = null;
  soDiaChi.maKhachHang = "";
  soDiaChi.tenKhachHang = "";
  resetQuick();
  hideSoDiaChiToast();
};

const reloadSoDiaChi = async (resetForm = false) => {
  if (!soDiaChi.idKhachHang) return;
  try {
    soDiaChi.loading = true;
    soDiaChi.err = "";
    if (resetForm) resetQuick();

    const arr = await getDiaChiByKhachHangId_FEFilter(soDiaChi.idKhachHang);
    const list = Array.isArray(arr) ? arr : [];

    soDiaChi.list = list
      .slice()
      .sort((a, b) => {
        const am = a?.macDinh ? 1 : 0;
        const bm = b?.macDinh ? 1 : 0;
        if (bm !== am) return bm - am;
        return (b?.id ?? 0) - (a?.id ?? 0);
      });

    if (!soDiaChi.list.length) quick.macDinh = true;

    if (resetForm) showSoDiaChiToast("info", "Đã làm mới sổ địa chỉ");
  } catch (e) {
    console.log(e);
    soDiaChi.list = [];
    soDiaChi.err = "Không tải được danh sách địa chỉ";
    showSoDiaChiToast("error", soDiaChi.err);
  } finally {
    soDiaChi.loading = false;
  }
};

const themNhanhDiaChi = async () => {
  if (!soDiaChi.idKhachHang) return;

  const hasAny =
    String(quick.diaChiCuThe || "").trim() ||
    quick.xa?.name ||
    quick.huyen?.name ||
    quick.tinh?.name;

  if (!hasAny) {
    soDiaChi.err = "Vui lòng nhập/chọn ít nhất 1 thông tin địa chỉ";
    showSoDiaChiToast("error", soDiaChi.err);
    return;
  }

  const preview = quickPreviewText() || "---";
  const ok = confirm(
    `Xác nhận thêm địa chỉ?\n\n${preview}${quick.macDinh ? "\n\n(Địa chỉ này sẽ được đặt làm mặc định)" : ""}`
  );
  if (!ok) return;

  try {
    soDiaChi.loading = true;
    soDiaChi.err = "";

    if (quick.macDinh) {
      await unsetMacDinhHienTai(null);
    }

    const payload = {
      idKhachHang: soDiaChi.idKhachHang,
      tenDiaChi: String(quick.tenNguoiNhan || "Địa chỉ").trim(),
      thanhPho: quick.tinh?.name || null,
      quan: quick.huyen?.name || null,
      phuong: quick.xa?.name || null,
      diaChiCuThe: String(quick.diaChiCuThe || "").trim() || null,
      macDinh: !!quick.macDinh,
      hoTenNguoiNhan: String(quick.tenNguoiNhan || "").trim() || null,
      tenNguoiNhan: String(quick.tenNguoiNhan || "").trim() || null,
      soDienThoai: String(quick.soDienThoai || "").trim() || null,
    };

    await createDiaChiKhachHang(payload);

    showSoDiaChiToast("success", "Thêm địa chỉ thành công");
    resetQuick();
    await reloadSoDiaChi(false);
    await loadAddressMap();
  } catch (e) {
    console.log(e);
    soDiaChi.err = getErrMsgNganGon(e) || "Thêm địa chỉ thất bại";
    showSoDiaChiToast("error", "Thêm địa chỉ thất bại");
  } finally {
    soDiaChi.loading = false;
  }
};

const confirmSetMacDinhDiaChi = async (a) => {
  const id = a?.id;
  if (!id) return;

  const preview = buildAddrText(a) || a?.tenDiaChi || "---";
  const ok = confirm(`Đặt địa chỉ này làm mặc định?\n\n${preview}`);
  if (!ok) return;

  await setMacDinhDiaChi(a);
};

const setMacDinhDiaChi = async (a) => {
  const id = a?.id;
  if (!id) return;

  try {
    soDiaChi.loading = true;
    soDiaChi.err = "";

    await unsetMacDinhHienTai(id);
    await updateDiaChiKhachHang(id, { macDinh: true });

    showSoDiaChiToast("success", "Đã đặt địa chỉ mặc định");
    await reloadSoDiaChi(false);
    await loadAddressMap();
  } catch (e) {
    console.log(e);
    soDiaChi.err = getErrMsgNganGon(e) || "Không thể đặt mặc định";
    showSoDiaChiToast("error", "Không thể đặt mặc định");
  } finally {
    soDiaChi.loading = false;
  }
};

onMounted(async () => {
  await handleFilter();
});
</script>

<style scoped>
.taikhoan-khachhang-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px;
}

.panel {
  font-family: var(--admin-font);
  color: var(--ss-text);
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid var(--ss-border);
  box-shadow: var(--ss-shadow-soft);
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 30px;
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.92);
}

.text-center {
  text-align: center;
}

.text-gray {
  color: var(--ss-text-muted);
}

.text-dark {
  color: rgba(17, 24, 39, 0.88);
}

.fw-700 {
  font-weight: 600;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* ✅ Material icon trong button */
.btn-mi {
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

/* Base button */
.btn {
  height: 34px;
  padding: 0 14px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn:hover {
  opacity: 0.96;
}

/* ✅ Thêm khách hàng (giữ nguyên) */
.btn-newaccount {
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.btn-newaccount i {
  font-size: 12px;
}

/* ✅ XUẤT EXCEL */
.btn-export {
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  background: #f3f4f6 !important;
  color: rgba(17, 24, 39, 0.88) !important;
  border: 1px solid rgba(17, 24, 39, 0.10) !important;

  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-export:hover {
  background: #eef0f3 !important;
}

/* ✅ ĐẶT LẠI BỘ LỌC */
.btn-reset {
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;

  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: 0.2s;
}
.btn-reset:hover {
  filter: brightness(0.98);
}

.filter-pill {
  height: 38px;
  min-width: 150px;
}

/* Badge */
.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
}

.status-active {
  background: rgba(255, 77, 79, 0.10);
  color: #b42324;
  border: 1px solid rgba(255, 77, 79, 0.35);
}

.status-ended {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.14);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
  border: 1px solid rgba(17, 24, 39, 0.08);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th:first-child {
  border-top-left-radius: 16px;
}
th:last-child {
  border-top-right-radius: 16px;
}

th {
  padding: 16px;
  background: #f9fafb;
  font-size: 13.5px;
  font-weight: 600;
  text-align: left;
  color: rgba(17, 24, 39, 0.88);
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
  text-transform: none;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13.5px;
  vertical-align: middle;
  color: rgba(17, 24, 39, 0.72);
}

tbody tr:hover {
  background: #f9fafb;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.page-btn:hover:not(.disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.page-btn.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.page-btn.disabled {
  color: #d1d5db;
  background: #f9fafb;
}

/* Search */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
}

.search-input {
  height: 40px;
  padding: 0 16px 0 36px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  outline: none;
  min-width: 465px;
  color: rgba(17, 24, 39, 0.78);
  font-size: 14px;
  background: #f9fafb;
}

.search-input:focus {
  border-color: rgba(255, 77, 79, 0.65);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.10);
}

/* ✅ Eye icon unified */
.ss-icon-btn-view {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.15s ease;
  padding: 0;
}

.ss-icon-btn-view span {
  font-size: 20px;
  color: rgba(17, 24, 39, 0.88);
}

.ss-icon-btn-view:hover {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.22);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.78);
  font-weight: 600;
  white-space: nowrap;
}

.filters-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.action-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.switch input {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
  cursor: pointer;
  z-index: 2;
}

.switch input:disabled {
  cursor: not-allowed;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #e5e7eb;
  border-radius: 18px;
  transition: 0.3s;
}

.switch input:disabled + .slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background-color: #22c55e;
}

.switch input:checked + .slider:before {
  transform: translateX(14px);
}

/* =========================================
   MODAL SỔ ĐỊA CHỈ (✅ chỉ chỉnh phần modal)
   ========================================= */
.ss-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

/* ✅ ép 1 font, không in đậm trong modal (nhưng KHÔNG làm hỏng icon nữa) */
.ss-addr-modal,
.ss-addr-modal * {
  font-family: inherit !important;
  font-weight: 400 !important;
}

/* ✅ FIX ICON: trả lại font đúng cho Material Icons trong modal */
.ss-addr-modal .material-icons-outlined,
.ss-addr-modal .material-icons {
  font-family: "Material Icons Outlined", "Material Icons" !important;
  font-weight: normal !important;
  font-style: normal !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  display: inline-block !important;
  white-space: nowrap !important;
  word-wrap: normal !important;
  direction: ltr !important;
  -webkit-font-feature-settings: "liga" !important;
  -webkit-font-smoothing: antialiased !important;
  line-height: 1 !important;
}

.ss-addr-modal {
  width: min(1100px, calc(100vw - 28px));
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  position: relative;
}

/* ✅ toast trong modal */
.ss-addr-toast {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  max-width: 420px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: 0 18px 45px rgba(17, 24, 39, 0.14);
}
.ss-addr-toast.success { border-color: rgba(34, 197, 94, 0.25); }
.ss-addr-toast.error { border-color: rgba(239, 68, 68, 0.25); }
.ss-addr-toast.info { border-color: rgba(59, 130, 246, 0.25); }
.ss-addr-toast-ic { font-size: 18px; color: rgba(17, 24, 39, 0.55); }
.ss-addr-toast.success .ss-addr-toast-ic { color: rgba(34, 197, 94, 0.95); }
.ss-addr-toast.error .ss-addr-toast-ic { color: rgba(239, 68, 68, 0.95); }
.ss-addr-toast.info .ss-addr-toast-ic { color: rgba(59, 130, 246, 0.95); }
.ss-addr-toast-msg {
  color: rgba(17, 24, 39, 0.86);
  font-size: 13px;
  line-height: 1.35;
  flex: 1;
}
.ss-addr-toast-x {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: rgba(17, 24, 39, 0.45);
}
.ss-addr-toast-x:hover { color: rgba(17, 24, 39, 0.7); }

.ss-addr-head {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* ✅ CHỈNH: đẩy dòng tên + mã xuống rõ ràng và canh thẳng dưới tiêu đề */
.ss-addr-head-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ss-addr-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(17, 24, 39, 0.92);
  font-size: 15px;
}

.ss-addr-ic { color: #ff4d4f; }

.ss-addr-sub {
  margin-top: 8px;           /* ✅ xuống hẳn dưới tiêu đề */
  padding-left: 34px;        /* ✅ canh thẳng dưới chữ (bù icon + gap) */
  color: rgba(17, 24, 39, 0.58);
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ss-dot-sep { color: rgba(17, 24, 39, 0.35); }

.ss-addr-head-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.ss-addr-head-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: 0.15s ease;
}
.ss-addr-head-btn span { font-size: 20px; color: rgba(17, 24, 39, 0.88); }
.ss-addr-head-btn:hover { background: rgba(17, 24, 39, 0.04); border-color: rgba(17, 24, 39, 0.22); }
.ss-addr-head-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ss-addr-body {
  padding: 16px;
  max-height: calc(100vh - 190px);
  overflow: auto;
}

.ss-addr-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 14px;
  align-items: start;
}

.ss-addr-card {
  border: 1px solid rgba(255, 77, 79, 0.18);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.ss-addr-card-head {
  padding: 12px 12px 10px 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

.ss-addr-card-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(17, 24, 39, 0.88);
  font-size: 14px;
}

.ss-addr-table-wrap { max-height: 260px; overflow: auto; }

.ss-addr-table { width: 100%; border-collapse: separate; border-spacing: 0; }

.ss-addr-table thead th {
  padding: 12px;
  background: rgba(17, 24, 39, 0.03);
  border-bottom: 1px solid rgba(17, 24, 39, 0.10);
  color: rgba(17, 24, 39, 0.82);
  font-size: 13px;
  white-space: nowrap;
}

.ss-addr-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  vertical-align: top;
  color: rgba(17, 24, 39, 0.72);
  font-size: 13px;
}

.ss-addr-empty { text-align: center; padding: 18px 10px; color: rgba(17, 24, 39, 0.55); }
.ss-addr-stt { color: rgba(17, 24, 39, 0.55); }

.ss-addr-line { display: flex; flex-direction: column; gap: 4px; }
.ss-addr-main { color: rgba(17, 24, 39, 0.88); }
.ss-addr-subline {
  color: rgba(17, 24, 39, 0.55);
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.ss-addr-default-col { text-align: right; }

.ss-addr-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 77, 79, 0.10);
  border: 1px solid rgba(255, 77, 79, 0.28);
  color: #b42324;
  font-size: 12px;
}

.ss-addr-mini-btn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.15s ease;
  padding: 0;
}
.ss-addr-mini-btn span { font-size: 18px; color: rgba(17, 24, 39, 0.88); }
.ss-addr-mini-btn:hover { background: rgba(17, 24, 39, 0.04); border-color: rgba(17, 24, 39, 0.22); }

.ss-addr-form { padding: 12px; }

.ss-addr-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.ss-addr-col { display: flex; flex-direction: column; gap: 6px; }

.ss-addr-label { color: rgba(17, 24, 39, 0.78); font-size: 13px; }

.ss-addr-input {
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  padding: 0 12px;
  outline: none;
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
  font-size: 13px;
}
.ss-addr-input:focus {
  border-color: rgba(255, 77, 79, 0.65);
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.12);
}

.ss-addr-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(17, 24, 39, 0.72);
  font-size: 13px;
  margin-top: 2px;
}

.ss-addr-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; }

.ss-addr-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.15s ease;
}
.ss-addr-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.ss-addr-btn-primary {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: #fff;
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.ss-addr-btn-primary:hover { filter: brightness(0.98); }

.ss-addr-err {
  margin-top: 10px;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.20);
  color: #991b1b;
}
.ss-addr-err span.material-icons-outlined { font-size: 18px; }

/* ✅ Vue Select */
:deep(.vs__dropdown-toggle) {
  min-height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  padding: 0 10px !important;
  background: #fff !important;
}
:deep(.vs__selected) { color: rgba(17, 24, 39, 0.82) !important; margin: 0 6px 0 0 !important; }
:deep(.vs__search),
:deep(.vs__search:focus) {
  margin: 0 !important;
  padding: 0 !important;
  color: rgba(17, 24, 39, 0.82) !important;
  font-size: 13px !important;
}
:deep(.vs__dropdown-menu) {
  border-radius: 12px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.10) !important;
}
:deep(.vs__clear) {
  opacity: 1 !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 10px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-right: 6px !important;
  padding: 0 !important;
  color: rgba(17, 24, 39, 0.35) !important;
  font-size: 18px !important;
  line-height: 1 !important;
}
:deep(.vs__clear:hover) {
  color: rgba(17, 24, 39, 0.55) !important;
  background: rgba(17, 24, 39, 0.04);
}
:deep(.vs__deselect) { color: rgba(17, 24, 39, 0.45) !important; }

/* responsive */
@media (max-width: 980px) {
  .ss-addr-grid { grid-template-columns: 1fr; }
  .ss-addr-row { grid-template-columns: 1fr; }
}
</style>
