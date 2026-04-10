<template>
  <div class="ss-page ss-font">
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Quản lý tài khoản/ Quản lý nhân viên</div>
      </div>
    </div>

    <transition name="ss-toast-fade">
      <div v-if="pageToast.show" class="ss-page-toast" :class="pageToast.type">
        <span class="material-icons-outlined ss-page-toast-ic">
          {{ pageToast.type === "success" ? "check_circle" : pageToast.type === "error" ? "error" : "info" }}
        </span>
        <div class="ss-page-toast-msg">{{ pageToast.msg }}</div>
        <button class="ss-page-toast-x" type="button" @click="hidePageToast">×</button>
      </div>
    </transition>

    <div class="taikhoan-nhanvien-container" v-if="!isPage">
      <div class="panel">
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="search-wrapper">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                v-model="filters.keyword"
                type="text"
                placeholder="Tìm theo tên, SĐT, email,..."
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
            <label>Chức vụ:</label>
            <select v-model="filters.roleId" class="form-select rounded-3 filter-pill">
              <option value="">Tất cả</option>
              <option v-for="[id, name] in roleMap" :key="id" :value="id">
                {{ name }}
              </option>
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
              <tr v-if="nhanVienList.length === 0">
                <td colspan="10" class="empty-cell">Không có dữ liệu</td>
              </tr>

              <tr v-for="(item, index) in nhanVienList" :key="item.id">
                <td class="text-gray">{{ pageNo * pageSize + index + 1 }}</td>

                <td>
                  <div class="avatar">
                    <img v-if="isImg(item.anhNhanVien)" :src="getImageUrl(item.anhNhanVien)" alt="avatar" />
                    <div v-else class="avatar-fallback">{{ initials(item.tenNhanVien) }}</div>
                  </div>
                </td>

                <td class="text-dark fw-700">{{ item.maNhanVien ?? "---" }}</td>
                <td class="text-dark fw-700">{{ item.tenNhanVien ?? "---" }}</td>
                <td class="text-gray">{{ item.soDienThoai ?? "---" }}</td>
                <td class="text-gray">{{ item.email ?? "---" }}</td>
                <td class="text-gray">{{ buildDiaChi(item) }}</td>

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
                    <button
                      class="ss-switch"
                      type="button"
                      :class="{ on: !!item.trangThai }"
                      :disabled="dangCapNhatTrangThai.has(item.id)"
                      @click="openToggleConfirm(item)"
                      :title="item.trangThai ? 'Ngừng hoạt động' : 'Kích hoạt'"
                      role="switch"
                      :aria-checked="!!item.trangThai"
                    >
                      <span class="ss-switch-knob"></span>
                    </button>

                    <button
                      class="ss-icon-btn-view"
                      @click="updatednv(item.id)"
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

        <div class="pagination-container" v-if="totalPages > 0">
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
import {
  searchNhanVien,
  pagingNhanVien,
  updateNhanVien,
  getAllNhanVien,
} from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

const router = useRouter();
const route = useRoute();

const BASE_URL = "http://localhost:8080";

const pageNo = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);

const nhanVienList = ref([]);
const nhanVienOrigin = ref([]);
const roleMap = ref(new Map());

const filters = ref({
  keyword: "",
  status: "",
  roleId: "",
});

const dangCapNhatTrangThai = reactive(new Set());

const themnv = () => router.push({ name: "tai-khoan-nhan-vien-them" });
const updatednv = (id) => router.push({ name: "tai-khoan-nhan-vien-cap-nhat", params: { id } });

const isPage = computed(() => {
  return (
    route.path.includes("/admin/tai-khoan/nhan-vien/them") ||
    route.path.includes("/admin/tai-khoan/nhan-vien/cap-nhat")
  );
});

const sortNewestFirst = (arr) => (arr || []).slice().sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));

const getErrorMessage = (e, fallback = "Đã xảy ra lỗi") => {
  const msg =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.response?.data?.detail ||
    e?.message;

  return typeof msg === "string" && msg.trim() ? msg.trim() : fallback;
};

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

function applySwalButtonStyle(button, type = "confirm") {
  if (!button) return;
  button.style.appearance = "none";
  button.style.webkitAppearance = "none";
  button.style.border = "0";
  button.style.outline = "none";
  button.style.boxShadow = "none";
  button.style.borderRadius = "3px";
  button.style.minWidth = "78px";
  button.style.height = "38px";
  button.style.padding = "0 18px";
  button.style.fontSize = "14px";
  button.style.fontWeight = "400";
  button.style.lineHeight = "38px";
  button.style.fontFamily = "inherit";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.cursor = "pointer";

  if (type === "confirm") {
    button.style.background = "#27313b";
    button.style.color = "#fff";
  } else if (type === "cancel") {
    button.style.background = "#6c757d";
    button.style.color = "#fff";
  } else if (type === "ok") {
    button.style.background = "#8a3ffc";
    button.style.color = "#fff";
  }
}

function getSwalBase(type = "confirm") {
  return {
    width: 500,
    padding: "22px 20px 24px",
    background: "#ffffff",
    backdrop: "rgba(0,0,0,0.45)",
    allowOutsideClick: false,
    allowEscapeKey: true,
    buttonsStyling: false,
    reverseButtons: false,
    focusConfirm: false,
    customClass: {
      popup: "ss-swal-popup",
      icon: "ss-swal-icon",
      title: "ss-swal-title",
      htmlContainer: "ss-swal-text",
      actions: type === "success" ? "ss-swal-actions ss-swal-actions-center" : "ss-swal-actions",
      confirmButton: type === "success" ? "ss-swal-ok-btn" : "ss-swal-confirm-btn",
      cancelButton: "ss-swal-cancel-btn",
    },
    didOpen: (popup) => {
      const actions = popup.querySelector(".swal2-actions");
      const confirmBtn = popup.querySelector(".swal2-confirm");
      const cancelBtn = popup.querySelector(".swal2-cancel");
      const title = popup.querySelector(".swal2-title");
      const html = popup.querySelector(".swal2-html-container");
      const icon = popup.querySelector(".swal2-icon");

      popup.style.borderRadius = "6px";
      popup.style.boxShadow = "0 18px 48px rgba(0, 0, 0, 0.22)";
      popup.style.padding = "22px 20px 24px";

      if (actions) {
        actions.style.display = "flex";
        actions.style.alignItems = "center";
        actions.style.justifyContent = "center";
        actions.style.gap = "10px";
        actions.style.marginTop = "18px";
        actions.style.width = "100%";
      }

      if (title) {
        title.style.fontSize = "27px";
        title.style.lineHeight = "1.2";
        title.style.fontWeight = "400";
        title.style.color = "#333";
        title.style.margin = "2px 0 10px";
        title.style.padding = "0";
      }

      if (html) {
        html.style.fontSize = "15px";
        html.style.lineHeight = "1.45";
        html.style.fontWeight = "400";
        html.style.color = "#666";
        html.style.margin = "0";
        html.style.padding = "0";
      }

      if (icon) {
        icon.style.margin = "8px auto 10px";
      }

      if (type === "success") {
        applySwalButtonStyle(confirmBtn, "ok");
      } else {
        applySwalButtonStyle(confirmBtn, "confirm");
        applySwalButtonStyle(cancelBtn, "cancel");
      }
    },
  };
}

const escapeHtml = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const mapTenQuyenHan = (raw) => {
  const v = String(raw ?? "").trim();
  if (!v) return v;

  const k = v.toUpperCase().replace(/\s+/g, "");

  if (k === "NHAN_VIEN" || k === "NHANVIEN" || k === "ROLE_NHAN_VIEN" || k === "ROLENHAN_VIEN") {
    return "Nhân viên";
  }

  if (k === "ADMIN" || k === "ROLE_ADMIN" || k === "ROLEADMIN") {
    return "Admin";
  }

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
  } catch (e) {
    console.log("Load quyền hạn error", e);
  }
};

const getRoleName = (id) => {
  const key = Number(id);
  return roleMap.value.get(key) || (id ? `Quyền ${id}` : "---");
};

const applyStatusFilter = () => {
  const source = Array.isArray(nhanVienOrigin.value) ? nhanVienOrigin.value : [];
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

const reApplyFilters = () => {
  applyStatusFilter();
  applyRoleFilter();
};

const buildToggleConfirmHtml = (item, nextValue) => {
  const oldText = item?.trangThai ? "Hoạt động" : "Ngừng hoạt động";
  const newText = nextValue ? "Hoạt động" : "Ngừng hoạt động";

  return `
    <div style="font-weight:400;color:#666;line-height:1.5;">
      <div style="margin-bottom:10px;font-weight:400;">
        Bạn có muốn chuyển trạng thái nhân viên này không?
      </div>
      <div style="border:1px solid rgba(255,77,79,0.14);background:linear-gradient(180deg, rgba(255,77,79,0.04), rgba(17,24,39,0.02));border-radius:10px;padding:12px 14px;text-align:left;">
        <div style="font-size:15px;color:#333;font-weight:400;margin-bottom:4px;">
          ${escapeHtml(item?.tenNhanVien || "—")}
        </div>
        <div style="font-size:13px;color:#666;font-weight:400;margin-bottom:8px;">
          Mã nhân viên: ${escapeHtml(item?.maNhanVien || "—")}
        </div>
        <div style="font-size:13px;color:#666;font-weight:400;">
          Trạng thái sẽ đổi từ
          <span style="color:#b42324;font-weight:400;">${escapeHtml(oldText)}</span>
          sang
          <span style="color:#b42324;font-weight:400;">${escapeHtml(newText)}</span>
        </div>
      </div>
    </div>
  `;
};

const capNhatTrangThai = async (item, newValue) => {
  const id = item?.id;
  if (!id || dangCapNhatTrangThai.has(id)) return;

  const oldValue = !!item.trangThai;
  const nextValue = !!newValue;

  if (oldValue === nextValue) return;

  const result = await Swal.fire({
    ...getSwalBase("confirm"),
    icon: "question",
    title: "Xác nhận?",
    html: buildToggleConfirmHtml(item, nextValue),
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    showCancelButton: true,
  });

  if (!result.isConfirmed) return;

  dangCapNhatTrangThai.add(id);
  item.trangThai = nextValue;
  reApplyFilters();

  try {
    await updateNhanVien(id, { trangThai: nextValue });

    await Swal.fire({
      ...getSwalBase("success"),
      icon: "success",
      title: "Thành công!",
      html: `
        <div style="font-weight:400;color:#666;line-height:1.5;">
          Đã chuyển trạng thái nhân viên
          <span style="font-weight:400;color:#333;">${escapeHtml(item?.tenNhanVien || item?.maNhanVien || "")}</span>
          từ
          <span style="font-weight:400;color:#b42324;">${escapeHtml(oldValue ? "Hoạt động" : "Ngừng hoạt động")}</span>
          sang
          <span style="font-weight:400;color:#b42324;">${escapeHtml(nextValue ? "Hoạt động" : "Ngừng hoạt động")}</span>.
        </div>
      `,
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } catch (err) {
    item.trangThai = oldValue;
    reApplyFilters();

    await Swal.fire({
      ...getSwalBase("confirm"),
      icon: "error",
      title: "Thất bại!",
      text: getErrorMessage(err, "Không thể cập nhật trạng thái nhân viên."),
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } finally {
    dangCapNhatTrangThai.delete(id);
  }
};

const openToggleConfirm = async (item) => {
  await capNhatTrangThai(item, !item?.trangThai);
};

const handleFilter = async () => {
  try {
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
    showPageToast("error", getErrorMessage(e, "Không tải được danh sách nhân viên."));
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
  const parts = [x?.diaChiCuThe, x?.phuong, x?.quan, x?.thanhPho]
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

const exportExcel = async () => {
  try {
    let allData = [];
    if (filters.value.keyword.trim()) {
      const res = await searchNhanVien(filters.value.keyword.trim());
      allData = Array.isArray(res) ? res : res?.content ?? [];
    } else {
      const res = await getAllNhanVien();
      allData = Array.isArray(res) ? res : res?.content ?? [];
    }

    let filteredData = allData;

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
      showPageToast("info", "Không có dữ liệu để xuất Excel.");
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
    showPageToast("success", "Xuất Excel thành công.");
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    showPageToast("error", getErrorMessage(error, "Đã xảy ra lỗi khi xuất file Excel."));
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

  if (route.query.added) {
    showPageToast("success", "Thêm nhân viên thành công!");
    const { added, ...restQuery } = route.query;
    await router.replace({ query: restQuery });
  }
});
</script>

<style scoped>
.ss-page { padding: 16px; }
.ss-font { font-family: inherit; color: rgba(17, 24, 39, 0.82); }
.ss-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.ss-head-left { display: flex; align-items: center; gap: 10px; }
.ss-title { font-size: 20px; font-weight: 500; color: rgba(17, 24, 39, 0.88); }

.taikhoan-nhanvien-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  font-family: inherit;
  color: rgba(17,24,39,0.82);
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid rgba(255,77,79,0.18);
  box-shadow: 0 18px 50px rgba(17,24,39,0.08);
}

.text-center { text-align: center; }
.text-gray { color: rgba(17,24,39,0.62); }
.text-dark { color: rgba(17,24,39,0.88); }
.fw-700 { font-weight: 600; }

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

.btn {
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
.btn:hover { background: rgba(17,24,39,0.04); }

.btn-newaccount {
  border: none !important;
  color:#fff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}
.btn-newaccount:hover { filter: brightness(0.98); }
.btn-newaccount i { font-size: 13px; }

.btn-export {
  background: #f3f4f6 !important;
  color: rgba(17,24,39,0.88) !important;
  border: 1px solid rgba(17,24,39,0.10) !important;
}
.btn-export:hover { background: #eef0f3 !important; }

.btn-reset {
  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;
}
.btn-reset:hover { filter: brightness(0.98); }

.filter-pill {
  height: 36px;
  min-width: 150px;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
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

.badge-role {
  background: rgba(17,24,39,0.04);
  color: rgba(17,24,39,0.82);
  border: 1px solid rgba(17,24,39,0.14);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(17,24,39,0.08);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th:first-child { border-top-left-radius: 16px; }
th:last-child { border-top-right-radius: 16px; }

th {
  padding: 14px 16px;
  background:#F9FAFB;
  font-size: 13px;
  font-weight: 400;
  text-align:left;
  color: rgba(17,24,39,0.82);
  border-bottom: 1px solid rgba(17,24,39,0.08);
  white-space: nowrap;
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(17,24,39,0.06);
  font-size: 13px;
  vertical-align: middle;
  color: rgba(17,24,39,0.72);
}

tbody tr:hover { background:#F9FAFB; }

.pagination-container {
  display:flex;
  justify-content:center;
  align-items:center;
  gap:8px;
  margin-top: 12px;
}

.page-btn {
  width:36px;
  height:36px;
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

.page-btn:hover:not(.disabled) { background: rgba(17,24,39,0.04); }
.page-btn.active { background:#111827; color:#fff; border-color:#111827; }
.page-btn.disabled { color: rgba(17,24,39,0.25); background:#F9FAFB; }

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgba(17,24,39,0.40);
  font-size: 13px;
  pointer-events: none;
}

.search-input {
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

.search-input:focus {
  border-color: rgba(255,77,79,0.45);
  background:#fff;
  box-shadow: 0 0 0 3px rgba(255,77,79,0.10);
}

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
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.78);
  font-weight: 400;
  white-space: nowrap;
}

.filters-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.action-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ss-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: rgba(17, 24, 39, 0.12);
  display: inline-flex;
  align-items: center;
  padding: 2px;
  transition: 0.15s ease;
}
.ss-switch.on {
  background: rgba(255, 77, 79, 0.92);
  border-color: rgba(255, 77, 79, 0.25);
}
.ss-switch:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-switch-knob {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateX(0);
  transition: 0.15s ease;
}
.ss-switch.on .ss-switch-knob {
  transform: translateX(20px);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.14);
  background: #fff;
  overflow: hidden;
  display:flex;
  align-items:center;
  justify-content:center;
}
.avatar img {
  width:100%;
  height:100%;
  object-fit: cover;
}
.avatar-fallback {
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(17,24,39,0.04);
  color: rgba(17,24,39,0.78);
  font-weight: 500;
  font-size: 13px;
}

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
.ss-toast-fade-enter-active, .ss-toast-fade-leave-active { transition: all 0.25s ease; }
.ss-toast-fade-enter-from, .ss-toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.empty-cell {
  text-align: center;
  color: rgba(17,24,39,0.55);
}

:deep(.swal2-popup.ss-swal-popup) {
  width: 500px !important;
  max-width: 500px !important;
  border-radius: 6px !important;
  padding: 22px 20px 24px !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22) !important;
  font-family: inherit !important;
}
:deep(.swal2-icon.ss-swal-icon) { margin: 8px auto 10px !important; }
:deep(.swal2-icon.swal2-question.ss-swal-icon) {
  width: 72px !important;
  height: 72px !important;
  border-width: 3px !important;
  color: #9db5c2 !important;
  border-color: #9db5c2 !important;
}
:deep(.swal2-icon.swal2-success.ss-swal-icon) {
  width: 72px !important;
  height: 72px !important;
  border-width: 3px !important;
  border-color: #d8efcf !important;
  color: #8fd16f !important;
}
:deep(.swal2-icon.swal2-success .swal2-success-ring) {
  border-color: rgba(143, 209, 111, 0.22) !important;
}
:deep(.swal2-icon.swal2-success [class^="swal2-success-line"]) {
  background-color: #8fd16f !important;
}
:deep(.swal2-title.ss-swal-title) {
  font-size: 27px !important;
  line-height: 1.2 !important;
  font-weight: 400 !important;
  color: #333 !important;
  margin: 2px 0 10px !important;
  padding: 0 !important;
}
:deep(.swal2-html-container.ss-swal-text) {
  font-size: 15px !important;
  line-height: 1.45 !important;
  font-weight: 400 !important;
  color: #666 !important;
  margin: 0 !important;
  padding: 0 !important;
}
:deep(.swal2-actions.ss-swal-actions) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  margin-top: 18px !important;
  width: 100% !important;
}
:deep(.swal2-actions.ss-swal-actions-center) { justify-content: center !important; }
:deep(.ss-swal-confirm-btn),
:deep(.ss-swal-cancel-btn),
:deep(.ss-swal-ok-btn) {
  appearance: none !important;
  -webkit-appearance: none !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  min-width: 78px !important;
  height: 38px !important;
  padding: 0 18px !important;
  border-radius: 3px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 38px !important;
  font-family: inherit !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: 0.15s ease !important;
}
:deep(.ss-swal-confirm-btn) { background: #27313b !important; color: #fff !important; }
:deep(.ss-swal-confirm-btn:hover) { background: #1f2831 !important; }
:deep(.ss-swal-cancel-btn) { background: #6c757d !important; color: #fff !important; }
:deep(.ss-swal-cancel-btn:hover) { background: #5f6870 !important; }
:deep(.ss-swal-ok-btn) { background: #8a3ffc !important; color: #fff !important; }
:deep(.ss-swal-ok-btn:hover) { background: #7b32ed !important; }
:deep(.ss-swal-confirm-btn:focus),
:deep(.ss-swal-cancel-btn:focus),
:deep(.ss-swal-ok-btn:focus) {
  outline: none !important;
  box-shadow: none !important;
}

@media (max-width: 900px){
  .search-input{ min-width: 260px; width: 100%; }
  .filters-bar{ gap: 10px; }
}
</style>