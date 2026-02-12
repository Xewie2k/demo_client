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
          <!-- ✅ Đặt lại: icon + màu y hệt ChatLieuPage (ss-btn-dark) -->
          <button class="btn btn-reset" @click="resetFilters" type="button">
            <span class="material-icons-outlined btn-mi">restart_alt</span>
            Đặt lại bộ lọc
          </button>

          <!-- ✅ Xuất Excel: icon + màu y hệt ChatLieuPage (ss-btn-lite) -->
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

              <!-- ✅ Địa chỉ: ưu tiên macDinh -->
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

                  <button class="ss-icon-btn-view" @click="updatedkh(item.id)" title="Xem" type="button">
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
</template>

<script setup>
import { searchKhachHang, pagingKhachHang, updateKhachHang, getAllKhachHang } from "@/services/tai_khoan/khach_hang/khach_hangService";
import { getAllDiaChiKhachHang } from "@/services/tai_khoan/khach_hang/diaChiKhachHangService";
import { computed, onMounted, ref, watch } from "vue";
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
    // ưu tiên macDinh = true
    for (const a of arr) {
      if (a?.xoaMem) continue;
      const idkh = a?.idKhachHang;
      if (!idkh) continue;

      const txt = buildAddrText(a) || a?.tenDiaChi || "---";

      // set nếu chưa có, hoặc nếu đây là macDinh
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

  // đang cập nhật thì chặn spam click
  if (dangCapNhatTrangThai.value.has(id)) {
    if (e?.target) e.target.checked = !!item.trangThai;
    return;
  }

  const oldValue = !!item.trangThai;
  const newValue = !!e?.target?.checked;

  if (oldValue === newValue) return;

  // tăng seq để đảm bảo "lần cuối" là lần hợp lệ
  const nextSeq = (trangThaiSeqMap.value.get(id) ?? 0) + 1;
  trangThaiSeqMap.value.set(id, nextSeq);

  // optimistic update
  item.trangThai = newValue;
  reApplyFilters();

  dangCapNhatTrangThai.value.add(id);

  try {
    await updateKhachHang(id, { trangThai: newValue });

    // nếu trong lúc gọi API user đã đổi lần khác, bỏ qua kết quả cũ
    if (trangThaiSeqMap.value.get(id) !== nextSeq) return;

    reApplyFilters();
  } catch (err) {
    // chỉ revert nếu đây vẫn là request mới nhất
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

    // load address map để hiển thị cột địa chỉ
    await loadAddressMap();
  } catch (e) {
    console.log("Filter error", e);
  }
};

const resetFilters = async () => {
  filters.value = {
    keyword: "",
    status: "",
    gender: "",
  };

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

/* ✅ XUẤT EXCEL: đổi sang style ss-btn-lite của ChatLieuPage */
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

/* ✅ ĐẶT LẠI BỘ LỌC: đổi sang style ss-btn-dark của ChatLieuPage */
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
</style>
