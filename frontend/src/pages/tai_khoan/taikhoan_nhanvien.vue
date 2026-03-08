<!-- File: src/pages/tai_khoan/nhan_vien/taikhoan_nhanvien.vue -->
<template>
  <div class="ss-page ss-font">
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Quản lý tài khoản/ Quản lý nhân viên</div>
      </div>
    </div>

    <div v-if="pageToast.show" class="ss-page-toast" :class="pageToast.type">
      <span class="material-icons-outlined ss-page-toast-ic">
        {{ pageToast.type === "success" ? "check_circle" : pageToast.type === "error" ? "error" : "info" }}
      </span>
      <div class="ss-page-toast-msg">{{ pageToast.msg }}</div>
      <button class="ss-page-toast-x" type="button" @click="hidePageToast">×</button>
    </div>

    <div v-if="confirmTrangThai.show" class="ss-confirm-toast">
      <span class="material-icons-outlined ss-confirm-ic">help_outline</span>
      <div class="ss-confirm-msg">{{ confirmTrangThai.msg }}</div>

      <div class="ss-confirm-actions">
        <button
          class="ss-confirm-btn ss-confirm-cancel"
          type="button"
          @click="cancelConfirmTrangThai"
          :disabled="confirmTrangThai.loading"
        >
          Hủy
        </button>
        <button
          class="ss-confirm-btn ss-confirm-ok"
          type="button"
          @click="okConfirmTrangThai"
          :disabled="confirmTrangThai.loading"
        >
          {{ confirmTrangThai.loading ? "Đang cập nhật..." : "Xác nhận" }}
        </button>
      </div>
    </div>

    <div class="taikhoan-nhanvien-container" v-if="!isPage">
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

            <button class="btn btn-newaccount" @click="themnv" type="button">
              <i class="fa-solid fa-plus"></i> Thêm nhân viên
            </button>
          </div>
        </div>

        <div class="filters-bar">
          <div class="filter-group">
            <label class="ss-label">Chức vụ:</label>
            <select v-model="filters.roleId" class="form-select filter-pill">
              <option value="">Tất cả</option>
              <option v-for="[id, name] in roleMap" :key="id" :value="id">
                {{ name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="ss-label">Trạng thái:</label>
            <select v-model="filters.status" class="form-select filter-pill">
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="table-wrapper">
          <table class="ss-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Mã nhân viên</th>
                <th>Họ và tên</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Quyền hạn</th>
                <th>Trạng thái</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in nhanVienList" :key="item.id">
                <td class="text-gray">{{ pageNo * pageSize + index + 1 }}</td>

                <td>
                  <div class="avatar">
                    <img v-if="isImg(item.anhNhanVien)" :src="getImageUrl(item.anhNhanVien)" alt="avatar" />
                    <div v-else class="avatar-fallback">{{ initials(item.tenNhanVien) }}</div>
                  </div>
                </td>

                <td class="text-dark">{{ item.maNhanVien ?? "---" }}</td>
                <td class="text-dark">{{ item.tenNhanVien ?? "---" }}</td>

                <td class="text-gray">{{ item.soDienThoai ?? "---" }}</td>
                <td class="text-gray">{{ item.email ?? "---" }}</td>

                <td class="text-gray">
                  {{ buildDiaChi(item) }}
                </td>

                <td>
                  <span class="badge badge-role">
                    {{ getRoleName(item.idQuyenHan) }}
                  </span>
                </td>

                <td>
                  <span class="badge" :class="item.trangThai ? 'status-active' : 'status-ended'">
                    {{ item.trangThai ? "Hoạt động" : "Ngừng hoạt động" }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="action-group">
                    <label class="switch" title="Đổi trạng thái nhanh">
                      <input
                        type="checkbox"
                        :checked="!!item.trangThai"
                        :disabled="dangCapNhatTrangThai.has(item.id)"
                        @change="(e) => toggleStatus(item, e)"
                      />
                      <span class="slider"></span>
                    </label>

                    <button class="ss-icon-btn-view" @click="updatednv(item.id)" title="Xem" type="button">
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
  </div>
</template>

<script setup>
import { searchNhanVien, pagingNhanVien, updateNhanVien, getAllNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as XLSX from "xlsx";

const router = useRouter();
const route = useRoute();

const BASE_URL = "http://localhost:8080";

const pageNo = ref(0);
const pageSize = ref(5);
const totalPages = ref(0);

const nhanVienList = ref([]);
const nhanVienOrigin = ref([]);

const filters = ref({
  keyword: "",
  status: "",
  roleId: "",
});

const roleMap = ref(new Map());

const dangCapNhatTrangThai = ref(new Set());
const trangThaiSeqMap = ref(new Map());

const pageToast = reactive({ show: false, type: "info", msg: "" });
let pageToastTimer = null;

const showPageToast = (type, msg) => {
  pageToast.show = true;
  pageToast.type = type || "info";
  pageToast.msg = msg || "";

  if (pageToastTimer) clearTimeout(pageToastTimer);
  pageToastTimer = setTimeout(() => {
    pageToast.show = false;
  }, 2600);
};

const hidePageToast = () => {
  pageToast.show = false;
};

const confirmTrangThai = reactive({
  show: false,
  loading: false,
  msg: "",
  item: null,
  newValue: false,
});

const openConfirmTrangThai = (item, newValue) => {
  const ten = (item?.tenNhanVien ?? item?.maNhanVien ?? "nhân viên").toString().trim() || "nhân viên";
  const nextText = newValue ? "Hoạt động" : "Ngừng hoạt động";

  confirmTrangThai.show = true;
  confirmTrangThai.loading = false;
  confirmTrangThai.item = item;
  confirmTrangThai.newValue = !!newValue;
  confirmTrangThai.msg = `Bạn có muốn chuyển trạng thái của "${ten}" sang "${nextText}" không?`;
};

const cancelConfirmTrangThai = () => {
  if (confirmTrangThai.loading) return;
  confirmTrangThai.show = false;
  confirmTrangThai.loading = false;
  confirmTrangThai.msg = "";
  confirmTrangThai.item = null;
  confirmTrangThai.newValue = false;
};

const reApplyFilters = () => {
  applyStatusFilter();
  applyRoleFilter();
};

const capNhatTrangThai = async (item, newValue) => {
  const id = item?.id;
  if (!id) return;

  if (dangCapNhatTrangThai.value.has(id)) return;

  const oldValue = !!item.trangThai;
  const nextValue = !!newValue;

  if (oldValue === nextValue) return;

  const nextSeq = (trangThaiSeqMap.value.get(id) ?? 0) + 1;
  trangThaiSeqMap.value.set(id, nextSeq);

  item.trangThai = nextValue;
  reApplyFilters();

  dangCapNhatTrangThai.value.add(id);

  try {
    await updateNhanVien(id, { trangThai: nextValue });

    if (trangThaiSeqMap.value.get(id) !== nextSeq) return;

    reApplyFilters();
    showPageToast("success", "Đã cập nhật trạng thái");
  } catch (e) {
    console.log(e);
    if (trangThaiSeqMap.value.get(id) === nextSeq) {
      item.trangThai = oldValue;
      reApplyFilters();
      showPageToast("error", "Không thể cập nhật trạng thái");
    }
  } finally {
    if (trangThaiSeqMap.value.get(id) === nextSeq) {
      dangCapNhatTrangThai.value.delete(id);
    }
  }
};

const okConfirmTrangThai = async () => {
  const item = confirmTrangThai.item;
  if (!item?.id) {
    cancelConfirmTrangThai();
    return;
  }

  if (confirmTrangThai.loading) return;

  confirmTrangThai.loading = true;
  try {
    await capNhatTrangThai(item, confirmTrangThai.newValue);
  } finally {
    confirmTrangThai.loading = false;
    cancelConfirmTrangThai();
  }
};

const mapTenQuyenHan = (raw) => {
  const v = String(raw ?? "").trim();
  if (!v) return v;

  const k = v.toUpperCase().replace(/\s+/g, "");

  if (k === "NHAN_VIEN" || k === "NHANVIEN" || k === "ROLE_NHAN_VIEN" || k === "ROLENHAN_VIEN") return "Nhân viên";
  if (k === "ADMIN" || k === "ROLE_ADMIN" || k === "ROLEADMIN") return "Admin";

  return v;
};

const loadQuyenHan = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/admin/quyen-han");
    if (!res.ok) return;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.content ?? [];
    const m = new Map();
    list.forEach((x) => {
      const rawName = x.ten ?? x.tenQuyenHan ?? x.ma ?? `Quyền ${x.id}`;
      const name = mapTenQuyenHan(rawName);
      m.set(Number(x.id), name);
    });
    roleMap.value = m;
  } catch {
  }
};

const getRoleName = (id) => {
  const key = Number(id);
  return roleMap.value.get(key) || (id ? `Quyền ${id}` : "---");
};

const themnv = () => {
  router.push({ name: "tai-khoan-nhan-vien-them" });
};

const updatednv = (id) => {
  router.push({ name: "tai-khoan-nhan-vien-cap-nhat", params: { id } });
};

const isPage = computed(() => {
  return (
    route.path.includes("/admin/tai-khoan/nhan-vien/them") ||
    route.path.includes("/admin/tai-khoan/nhan-vien/cap-nhat")
  );
});

const sortNewestFirst = (arr) => (arr || []).slice().sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));

const applyStatusFilter = () => {
  const source = Array.isArray(nhanVienOrigin.value) ? nhanVienOrigin.value : (nhanVienOrigin.value ?? []);
  if (!filters.value.status) {
    nhanVienList.value = source;
    return;
  }
  const isActive = filters.value.status === "active";
  nhanVienList.value = source.filter((item) => Boolean(item.trangThai) === isActive);
};

const applyRoleFilter = () => {
  const source = Array.isArray(nhanVienList.value) ? nhanVienList.value : [];
  if (!filters.value.roleId) return;

  const roleId = Number(filters.value.roleId);
  nhanVienList.value = source.filter((item) => Number(item.idQuyenHan) === roleId);
};

const handleFilter = async () => {
  try {
    cancelConfirmTrangThai();

    if (filters.value.keyword.trim()) {
      const res = await searchNhanVien(filters.value.keyword.trim());
      const arr = Array.isArray(res) ? res : res?.content ?? [];
      nhanVienOrigin.value = sortNewestFirst(arr);
      totalPages.value = 1;
    } else {
      const res = await pagingNhanVien(pageNo.value, pageSize.value);
      nhanVienOrigin.value = sortNewestFirst(res?.content ?? []);
      totalPages.value = res?.totalPages ?? 0;
    }

    applyStatusFilter();
    applyRoleFilter();
  } catch (e) {
    console.log("Filter error", e);
  }
};

const resetFilters = async () => {
  filters.value = { keyword: "", status: "", roleId: "" };
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

const buildDiaChi = (x) => {
  const parts = [x.diaChiCuThe, x.phuong, x.quan, x.thanhPho]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean);
  return parts.length ? parts.join(", ") : "---";
};

const getImageUrl = (imageData) => {
  if (!imageData) return null;
  const s = String(imageData).trim();
  if (!s) return null;
  if (s.startsWith("data:")) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return s.startsWith("/") ? BASE_URL + s : `${BASE_URL}/${s}`;
};

const isImg = (s) => {
  return !!getImageUrl(s);
};

const initials = (name) => {
  const t = (name ?? "").toString().trim();
  if (!t) return "NV";
  const parts = t.split(/\s+/).filter(Boolean);
  const last2 = parts.slice(-2);
  return last2.map((p) => p[0]?.toUpperCase() || "").join("");
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

  if (e?.target) e.target.checked = oldValue;

  openConfirmTrangThai(item, newValue);
};

const exportExcel = async () => {
  try {
    let allData = [];
    if (filters.value.keyword.trim()) allData = await searchNhanVien(filters.value.keyword.trim());
    else allData = await getAllNhanVien();

    const base = Array.isArray(allData) ? allData : (allData?.content ?? []);
    let filteredData = base;

    if (filters.value.status) {
      const isActive = filters.value.status === "active";
      filteredData = filteredData.filter((item) => Boolean(item.trangThai) === isActive);
    }

    if (filters.value.roleId) {
      const roleId = Number(filters.value.roleId);
      filteredData = filteredData.filter((item) => Number(item.idQuyenHan) === roleId);
    }

    const sortedData = sortNewestFirst(filteredData);

    const dataToExport = sortedData.map((item, index) => ({
      STT: index + 1,
      "Mã nhân viên": item.maNhanVien ?? "---",
      "Họ và tên": item.tenNhanVien ?? "---",
      "SĐT": item.soDienThoai ?? "---",
      Email: item.email ?? "---",
      "Địa chỉ": buildDiaChi(item),
      "Quyền hạn": getRoleName(item.idQuyenHan),
      "Trạng thái": item.trangThai ? "Hoạt động" : "Ngừng hoạt động",
    }));

    if (dataToExport.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách nhân viên");

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 50 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.writeFile(workbook, "DanhSachNhanVien.xlsx");
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    alert("Đã xảy ra lỗi khi xuất file Excel.");
  }
};

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
      newPath.includes("/admin/tai-khoan/nhan-vien/them") ||
      newPath.includes("/admin/tai-khoan/nhan-vien/cap-nhat");
    if (!isChild) await handleFilter();
  }
);

onMounted(async () => {
  await loadQuyenHan();
  await handleFilter();
});
</script>

<style scoped>
.ss-page { padding: 16px; }
.ss-font { font-family: inherit; color: rgba(17,24,39,0.82); }
.ss-title { font-size: 20px; font-weight: 500; color: rgba(17,24,39,0.88); }
.ss-label { font-size: 13px; font-weight: 400; color: rgba(17,24,39,0.82); }

.ss-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.ss-head-left { display: flex; align-items: center; gap: 10px; }

.taikhoan-nhanvien-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(255,77,79,0.18);
  box-shadow: 0 18px 50px rgba(17,24,39,0.08);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.toolbar-left, .toolbar-right { display: flex; align-items: center; }
.toolbar-right { gap: 10px; }

.btn-mi {
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.btn, .btn-export, .btn-newaccount {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(17,24,39,0.14);
  background: #fff;
  color: rgba(17,24,39,0.88);
  font-size: 13px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.15s ease;
}
.btn:hover, .btn-export:hover, .btn-newaccount:hover { background: rgba(17,24,39,0.04); }

.btn-reset{
  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;
}
.btn-reset:hover{
  filter: brightness(0.98);
}

.btn-export{
  background: #f3f4f6 !important;
  color: rgba(17,24,39,0.88) !important;
  border: 1px solid rgba(17,24,39,0.10) !important;
}
.btn-export:hover{
  background: #eef0f3 !important;
}

.btn-newaccount{
  border: none !important;
  color:#fff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}
.btn-newaccount:hover{
  filter: brightness(0.98);
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
}
.btn i, .btn-export i, .btn-newaccount i { font-size: 13px; }

.filters-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.filter-group{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.filter-group label{
  white-space: nowrap;
  margin: 0;
  line-height: 1;
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.82);
  flex: 0 0 auto;
}
.filter-pill{
  height: 36px;
  min-width: 160px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.82);
  border: 1px solid rgba(17,24,39,0.14);
}

.search-wrapper { position: relative; display:flex; align-items:center; }
.search-icon { position:absolute; left:12px; color: rgba(17,24,39,0.40); font-size: 13px; pointer-events:none; }
.search-input{
  height: 36px;
  padding: 0 12px 0 34px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.14);
  outline: none;
  min-width: 420px;
  color: rgba(17,24,39,0.82);
  font-size: 13px;
  background:#F9FAFB;
}
.search-input:focus{
  border-color: rgba(255,77,79,0.45);
  background:#fff;
  box-shadow: 0 0 0 3px rgba(255,77,79,0.10);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(17,24,39,0.08);
}
.ss-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.ss-table thead th{
  padding: 14px 16px;
  background:#F9FAFB;
  font-size: 13px;
  font-weight: 400;
  text-align:left;
  color: rgba(17,24,39,0.82);
  border-bottom: 1px solid rgba(17,24,39,0.08);
  white-space: nowrap;
}
.ss-table tbody td{
  padding: 14px 16px;
  border-bottom: 1px solid rgba(17,24,39,0.06);
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.72);
  vertical-align: middle;
}
.ss-table tbody tr:hover { background:#F9FAFB; }

.text-center { text-align: center; }
.text-gray { color: rgba(17,24,39,0.62); }
.text-dark { color: rgba(17,24,39,0.88); }

.avatar{
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.14);
  background: #fff;
  overflow: hidden;
  display:flex;
  align-items:center;
  justify-content:center;
}
.avatar img{ width:100%; height:100%; object-fit: cover; }
.avatar-fallback{
  width:100%; height:100%;
  display:flex; align-items:center; justify-content:center;
  background: rgba(17,24,39,0.04);
  color: rgba(17,24,39,0.78);
  font-weight: 500;
  font-size: 13px;
}

.badge{
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
}
.status-active{
  background: rgba(255,77,79,0.10);
  color: #b42324;
  border: 1px solid rgba(255,77,79,0.35);
}
.status-ended{
  background: rgba(17,24,39,0.06);
  color: rgba(17,24,39,0.82);
  border: 1px solid rgba(17,24,39,0.14);
}
.badge-role{
  background: rgba(17,24,39,0.04);
  color: rgba(17,24,39,0.82);
  border: 1px solid rgba(17,24,39,0.14);
}

.pagination-container{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:8px;
  margin-top: 12px;
}
.page-btn{
  width:36px; height:36px;
  border-radius: 10px;
  border:1px solid rgba(17,24,39,0.14);
  background:#fff;
  color: rgba(17,24,39,0.82);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition: 0.15s ease;
  font-size: 13px;
  font-weight: 400;
}
.page-btn:hover:not(.disabled){ background: rgba(17,24,39,0.04); }
.page-btn.active{ background:#111827; color:#fff; border-color:#111827; }
.page-btn.disabled{ color: rgba(17,24,39,0.25); background:#F9FAFB; cursor:not-allowed; }

.ss-icon-btn-view{
  width:36px; height:36px;
  border-radius:10px;
  background:#fff;
  border:1px solid rgba(17,24,39,0.14);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition: 0.15s ease;
  padding:0;
}
.ss-icon-btn-view span{
  font-size: 20px;
  color: rgba(17,24,39,0.88);
}
.ss-icon-btn-view:hover{
  background: rgba(17,24,39,0.04);
  border-color: rgba(17,24,39,0.22);
}

.action-group{
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}
.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: rgba(17,24,39,0.12);
  border-radius: 18px;
  transition: .3s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  border-radius: 50%;
  transition: .3s;
  box-shadow: 0 2px 6px rgba(17,24,39,0.12);
}

.switch input:checked + .slider { background-color: #ff4d4f; }
.switch input:checked + .slider:before { transform: translateX(14px); }

.switch input:disabled + .slider { opacity: 0.6; cursor: not-allowed; }

.ss-page-toast {
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 2500;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  max-width: 460px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: 0 18px 45px rgba(17, 24, 39, 0.14);
}
.ss-page-toast.success { border-color: rgba(34, 197, 94, 0.25); }
.ss-page-toast.error { border-color: rgba(239, 68, 68, 0.25); }
.ss-page-toast.info { border-color: rgba(59, 130, 246, 0.25); }
.ss-page-toast-ic { font-size: 18px; color: rgba(17, 24, 39, 0.55); }
.ss-page-toast.success .ss-page-toast-ic { color: rgba(34, 197, 94, 0.95); }
.ss-page-toast.error .ss-page-toast-ic { color: rgba(239, 68, 68, 0.95); }
.ss-page-toast.info .ss-page-toast-ic { color: rgba(59, 130, 246, 0.95); }
.ss-page-toast-msg {
  color: rgba(17, 24, 39, 0.86);
  font-size: 13px;
  line-height: 1.35;
  flex: 1;
}
.ss-page-toast-x {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: rgba(17, 24, 39, 0.45);
}
.ss-page-toast-x:hover { color: rgba(17, 24, 39, 0.7); }

.ss-confirm-toast {
  position: fixed;
  top: 64px;
  right: 14px;
  z-index: 2501;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: min(520px, calc(100vw - 28px));
  padding: 12px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(255, 77, 79, 0.25);
  box-shadow: 0 18px 55px rgba(17, 24, 39, 0.18);
}

.ss-confirm-ic {
  font-size: 20px;
  color: rgba(255, 77, 79, 0.95);
  margin-top: 1px;
}

.ss-confirm-msg {
  flex: 1;
  color: rgba(17, 24, 39, 0.86);
  font-size: 13.5px;
  line-height: 1.35;
  padding-right: 8px;
}

.ss-confirm-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.ss-confirm-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 700;
  transition: 0.15s ease;
}
.ss-confirm-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.ss-confirm-cancel {
  background: #f3f4f6;
  border-color: rgba(17, 24, 39, 0.12);
  color: rgba(17, 24, 39, 0.82);
}
.ss-confirm-cancel:hover { background: #eef0f3; }

.ss-confirm-ok {
  background: #ff4d4f;
  border-color: rgba(255, 77, 79, 0.35);
  color: #fff;
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.ss-confirm-ok:hover { filter: brightness(0.98); }

@media (max-width: 900px){
  .search-input{ min-width: 260px; width: 100%; }
  .filters-bar{ gap: 10px; }
}
</style>