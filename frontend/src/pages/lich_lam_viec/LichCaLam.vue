<template>
  <div class="lich-page">
    <transition name="ss-toast-fade">
      <div v-if="pageToast.show" class="ss-page-toast" :class="pageToast.type">
        <span class="material-icons-outlined ss-page-toast-ic">
          {{ pageToast.type === "success" ? "check_circle" : pageToast.type === "error" ? "error" : "info" }}
        </span>
        <div class="ss-page-toast-msg">{{ pageToast.msg }}</div>
        <button class="ss-page-toast-x" type="button" @click="hidePageToast">×</button>
      </div>
    </transition>

    <div class="card-box">
      <div class="filter-header">
        <h3>Bộ lọc tìm kiếm</h3>
        <button class="btn-icon-bg" title="Xóa bộ lọc" @click="resetFilter" type="button">
          <span><i class="fa-solid fa-filter-circle-xmark"></i></span>
        </button>
      </div>

      <div class="filter-body">
        <div class="form-group filter-col">
          <label>Tìm kiếm chung</label>
          <div class="search-input-wrapper">
            <span><i class="fa-solid fa-magnifying-glass search-icon"></i></span>
            <input
              type="text"
              class="form-control pl-35"
              placeholder="Nhập tên ca, mã ca..."
              v-model="filters.keyword"
            />
          </div>
        </div>

        <div class="form-group filter-col">
          <label>Thời gian bắt đầu</label>
          <div class="time-input-wrapper">
            <input type="time" class="form-control" v-model="filters.gioBatDau" />
          </div>
        </div>

        <div class="form-group filter-col">
          <label>Thời gian kết thúc</label>
          <div class="time-input-wrapper">
            <input type="time" class="form-control" v-model="filters.gioKetThuc" />
          </div>
        </div>

        <div class="form-group filter-col">
          <label>Trạng thái</label>
          <div class="radio-group">
            <label class="radio-container">
              <input type="radio" value="all" v-model="filters.trangThai" />
              <span class="checkmark"></span> Tất cả
            </label>
            <label class="radio-container">
              <input type="radio" value="active" v-model="filters.trangThai" />
              <span class="checkmark"></span> Hoạt động
            </label>
            <label class="radio-container">
              <input type="radio" value="inactive" v-model="filters.trangThai" />
              <span class="checkmark"></span> Ngưng
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="table-header-row">
        <h3>Danh sách Ca làm việc</h3>

        <div class="action-buttons">
          <button v-if="hasPermission" class="btn-circle btn-success" @click="openModal(null)" title="Thêm mới" type="button">
            <span><i class="fa-solid fa-plus"></i></span>
          </button>
          <button class="btn-circle btn-light" @click="loadData" title="Làm mới" type="button">
            <span><i class="fa-solid fa-rotate-right"></i></span>
          </button>
        </div>
      </div>

      <div class="table-responsive mt-10">
        <table>
          <thead>
            <tr>
              <th style="width: 60px" class="text-center">STT</th>
              <th>Thông tin Ca</th>
              <th class="text-center">Giờ bắt đầu</th>
              <th class="text-center">Giờ kết thúc</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-center" style="width: 120px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ca, index) in danhSachCaLamLoc" :key="ca.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="shift-info">
                  <div class="shift-icon">
                    <span><i class="fa-regular fa-clock"></i></span>
                  </div>
                  <div class="shift-details">
                    <span class="shift-name">{{ ca.tenCa }}</span>
                    <span class="shift-code">{{ ca.maCa }}</span>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <span class="time-badge start">{{ formatTime(ca.gioBatDau) }}</span>
              </td>
              <td class="text-center">
                <span class="time-badge end">{{ formatTime(ca.gioKetThuc) }}</span>
              </td>
              <td class="text-center">
                <button
                  class="ss-switch"
                  type="button"
                  :class="{ on: !!ca.trangThai }"
                  :disabled="!hasPermission || dangCapNhatTrangThai.has(ca.id)"
                  @click="openToggleConfirm(ca)"
                  :title="ca.trangThai ? 'Ngưng hoạt động' : 'Kích hoạt'"
                  role="switch"
                  :aria-checked="!!ca.trangThai"
                >
                  <span class="ss-switch-knob"></span>
                </button>
              </td>
              <td class="text-center action-col">
                <button class="ss-icon-btn-view" type="button" @click="openModal(ca)">
                  <span class="material-icons-outlined">visibility</span>
                </button>
              </td>
            </tr>

            <tr v-if="danhSachCaLamLoc.length === 0">
              <td colspan="6" class="text-center py-4">Không có dữ liệu ca làm việc</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Cập nhật Ca làm việc' : 'Thêm mới Ca làm việc' }}</h3>
          <button @click="closeModal" class="btn-close" type="button" title="Đóng">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group mb-15">
            <label>Tên ca <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="form.tenCa" placeholder="VD: Ca Sáng, Ca Chiều..." />
          </div>

          <div class="row-flex mb-15">
            <div class="form-group flex-1 mr-10">
              <label>Giờ bắt đầu</label>
              <input type="time" lang="en-GB" class="form-control" v-model="form.gioBatDau" />
            </div>
            <div class="form-group flex-1">
              <label>Giờ kết thúc</label>
              <input type="time" lang="en-GB" class="form-control" v-model="form.gioKetThuc" />
            </div>
          </div>

          <div class="form-group mb-15">
            <label>Mô tả</label>
            <textarea
              class="form-control textarea"
              v-model="form.moTa"
              rows="3"
              placeholder="Ghi chú thêm về ca làm việc..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" type="button" @click="closeModal">Hủy bỏ</button>
          <button
            v-if="hasPermission"
            class="btn-save"
            type="button"
            @click="handleSubmit"
            :disabled="submitting"
          >
            {{ submitting ? 'Đang lưu...' : isEditing ? 'Lưu' : 'Thêm mới' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createCaLam, getAllCaLam, updateCaLam } from "@/services/lich_lam_viec/ca_lamService";
import { computed, onMounted, reactive, ref } from "vue";
import Swal from "sweetalert2";

const getUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const hasPermission = computed(() => {
  const u = getUser();
  const role = u?.role || u?.quyen || u?.vaiTro || u?.tenVaiTro;
  return role !== "NHAN_VIEN";
});

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);
const submitting = ref(false);

const danhSachCaLam = ref([]);
const dangCapNhatTrangThai = reactive(new Set());

const filters = reactive({
  keyword: "",
  gioBatDau: "",
  gioKetThuc: "",
  trangThai: "all",
});

const form = reactive({
  tenCa: "",
  gioBatDau: "",
  gioKetThuc: "",
  moTa: "",
  trangThai: true,
});

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

const getErrorMessage = (e, fallback = "Đã xảy ra lỗi") => {
  const msg =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.response?.data?.detail ||
    e?.message;

  return typeof msg === "string" && msg.trim() ? msg.trim() : fallback;
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

const normalizeTime = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.length === 5 ? `${s}:00` : s;
};

const formatTime = (value) => {
  if (!value) return "---";
  return String(value).substring(0, 5);
};

const buildCaPayload = (ca, trangThai) => {
  return {
    tenCa: ca?.tenCa?.toString().trim() || "",
    gioBatDau: normalizeTime(ca?.gioBatDau),
    gioKetThuc: normalizeTime(ca?.gioKetThuc),
    moTa: ca?.moTa?.toString().trim() || "",
    trangThai: !!trangThai,
  };
};

const danhSachCaLamLoc = computed(() => {
  let list = Array.isArray(danhSachCaLam.value) ? [...danhSachCaLam.value] : [];

  const keyword = filters.keyword.trim().toLowerCase();
  if (keyword) {
    list = list.filter((item) => {
      const tenCa = String(item?.tenCa || "").toLowerCase();
      const maCa = String(item?.maCa || "").toLowerCase();
      return tenCa.includes(keyword) || maCa.includes(keyword);
    });
  }

  if (filters.gioBatDau) {
    list = list.filter((item) => String(item?.gioBatDau || "").substring(0, 5) >= filters.gioBatDau);
  }

  if (filters.gioKetThuc) {
    list = list.filter((item) => String(item?.gioKetThuc || "").substring(0, 5) <= filters.gioKetThuc);
  }

  if (filters.trangThai === "active") {
    list = list.filter((item) => !!item.trangThai);
  } else if (filters.trangThai === "inactive") {
    list = list.filter((item) => !item.trangThai);
  }

  return list;
});

const resetFilter = () => {
  filters.keyword = "";
  filters.gioBatDau = "";
  filters.gioKetThuc = "";
  filters.trangThai = "all";
};

const loadData = async () => {
  try {
    const res = await getAllCaLam();
    danhSachCaLam.value = Array.isArray(res) ? res : res?.content || [];
  } catch (e) {
    console.error(e);
    showPageToast("error", getErrorMessage(e, "Không tải được danh sách ca làm việc."));
  }
};

const openModal = (ca) => {
  if (ca) {
    isEditing.value = true;
    currentId.value = ca.id;
    form.tenCa = ca.tenCa || "";
    form.gioBatDau = ca.gioBatDau ? String(ca.gioBatDau).substring(0, 5) : "";
    form.gioKetThuc = ca.gioKetThuc ? String(ca.gioKetThuc).substring(0, 5) : "";
    form.moTa = ca.moTa || "";
    form.trangThai = ca.trangThai !== undefined ? ca.trangThai : true;
  } else {
    isEditing.value = false;
    currentId.value = null;
    form.tenCa = "";
    form.gioBatDau = "";
    form.gioKetThuc = "";
    form.moTa = "";
    form.trangThai = true;
  }
  showModal.value = true;
};

const closeModal = () => {
  if (submitting.value) return;
  showModal.value = false;
};

const handleSubmit = async () => {
  if (!form.tenCa.trim()) {
    showPageToast("error", "Tên ca không được để trống.");
    return;
  }

  const payload = {
    tenCa: form.tenCa.trim(),
    gioBatDau: normalizeTime(form.gioBatDau),
    gioKetThuc: normalizeTime(form.gioKetThuc),
    moTa: form.moTa.trim(),
    trangThai: !!form.trangThai,
  };

  try {
    submitting.value = true;

    if (isEditing.value) {
      await updateCaLam(currentId.value, payload);
      showPageToast("success", "Cập nhật ca làm việc thành công.");
    } else {
      await createCaLam(payload);
      showPageToast("success", "Thêm ca làm việc thành công.");
    }

    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Lỗi khi lưu ca làm việc:", error);
    showPageToast("error", getErrorMessage(error, "Có lỗi xảy ra khi lưu ca làm việc."));
  } finally {
    submitting.value = false;
  }
};

const buildToggleConfirmHtml = (ca, nextValue) => {
  const oldText = ca?.trangThai ? "Hoạt động" : "Ngưng hoạt động";
  const newText = nextValue ? "Hoạt động" : "Ngưng hoạt động";

  return `
    <div style="font-weight:400;color:#666;line-height:1.5;">
      <div style="margin-bottom:10px;font-weight:400;">
        Bạn có muốn chuyển trạng thái ca làm việc này không?
      </div>
      <div style="border:1px solid rgba(255,77,79,0.14);background:linear-gradient(180deg, rgba(255,77,79,0.04), rgba(17,24,39,0.02));border-radius:10px;padding:12px 14px;text-align:left;">
        <div style="font-size:15px;color:#333;font-weight:400;margin-bottom:4px;">
          ${escapeHtml(ca?.tenCa || "—")}
        </div>
        <div style="font-size:13px;color:#666;font-weight:400;margin-bottom:8px;">
          Mã ca: ${escapeHtml(ca?.maCa || "—")}
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

const capNhatTrangThai = async (ca, newValue) => {
  const id = ca?.id;
  if (id == null || dangCapNhatTrangThai.has(id)) return;

  const oldValue = !!ca.trangThai;
  const nextValue = !!newValue;

  if (oldValue === nextValue) return;

  const result = await Swal.fire({
    ...getSwalBase("confirm"),
    icon: "question",
    title: "Xác nhận?",
    html: buildToggleConfirmHtml(ca, nextValue),
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    showCancelButton: true,
  });

  if (!result.isConfirmed) return;

  dangCapNhatTrangThai.add(id);
  ca.trangThai = nextValue;

  try {
    await updateCaLam(id, buildCaPayload(ca, nextValue));

    await Swal.fire({
      ...getSwalBase("success"),
      icon: "success",
      title: "Thành công!",
      html: `
        <div style="font-weight:400;color:#666;line-height:1.5;">
          Đã chuyển trạng thái ca làm việc
          <span style="font-weight:400;color:#333;">${escapeHtml(ca?.tenCa || ca?.maCa || "")}</span>
          từ
          <span style="font-weight:400;color:#b42324;">${escapeHtml(oldValue ? "Hoạt động" : "Ngưng hoạt động")}</span>
          sang
          <span style="font-weight:400;color:#b42324;">${escapeHtml(nextValue ? "Hoạt động" : "Ngưng hoạt động")}</span>.
        </div>
      `,
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } catch (error) {
    ca.trangThai = oldValue;

    await Swal.fire({
      ...getSwalBase("confirm"),
      icon: "error",
      title: "Thất bại!",
      text: getErrorMessage(error, "Không thể cập nhật trạng thái ca làm việc."),
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } finally {
    dangCapNhatTrangThai.delete(id);
  }
};

const openToggleConfirm = async (ca) => {
  if (!hasPermission.value) return;
  await capNhatTrangThai(ca, !ca?.trangThai);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.lich-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 20px;
  border: 1px solid #f3f4f6;
}

.mt-20 {
  margin-top: 20px;
}

.mt-10 {
  margin-top: 10px;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.filter-header,
.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.filter-header h3,
.table-header-row h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-icon-bg {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon-bg:hover {
  background: #e5e7eb;
  color: #111827;
}

.filter-body {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-col {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #ff4d4f;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.pl-35 {
  padding-left: 35px;
}

.radio-group {
  display: flex;
  gap: 15px;
  height: 40px;
  align-items: center;
}

.radio-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 24px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: #374151;
}

.radio-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 16px;
  width: 16px;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 50%;
}

.radio-container input:checked ~ .checkmark {
  border-color: #10b981;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.radio-container input:checked ~ .checkmark:after {
  display: block;
}

.radio-container .checkmark:after {
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-success {
  background-color: #ff4d4f;
}

.btn-success:hover {
  background-color: #ff4d4f;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.btn-light {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-light:hover {
  background-color: #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  vertical-align: middle;
}

tbody tr:hover {
  background-color: #f9fafb;
}

.shift-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shift-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0f2fe;
  color: #0284c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.shift-details {
  display: flex;
  flex-direction: column;
}

.shift-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.shift-code {
  font-size: 12px;
  color: #6b7280;
}

.time-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
}

.time-badge.start {
  background-color: #d1fae5;
  color: #059669;
}

.time-badge.end {
  background-color: #fee2e2;
  color: #dc2626;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  color: #ef4444;
}

.modal-body {
  padding: 20px;
}

.mb-15 {
  margin-bottom: 15px;
}

.text-danger {
  color: #ef4444;
}

.row-flex {
  display: flex;
  align-items: flex-end;
}

.flex-1 {
  flex: 1;
}

.mr-10 {
  margin-right: 10px;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
}

.btn-cancel {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f3f4f6;
}

.btn-save {
  padding: 8px 16px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover {
  background: #ff4d4f;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ss-icon-btn-view,
.ss-icon-btn-danger {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.ss-icon-btn-view:hover {
  background: #f3f4f6;
}

.ss-icon-btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
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
</style>