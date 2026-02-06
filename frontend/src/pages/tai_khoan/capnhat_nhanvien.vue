<template>
  <div class="update_page">
    <!-- HEADER: Back + Title -->
    <div class="page-head">
      <button type="button" class="ss-btn ss-btn-back" @click="back">
        <i class="bi bi-arrow-left me-2"></i>
        Quay lại
      </button>

      <h3 class="page-title">CẬP NHẬT NHÂN VIÊN</h3>

      <div class="head-spacer"></div>
    </div>

    <div class="card ss-card">
      <form @submit.prevent="submit">
        <div class="row">
          <!-- AVATAR -->
          <div class="col-md-2 text-center">
            <div class="avatar-wrapper ss-border">
              <img v-if="nv.anhNhanVien" :src="getImageUrl(nv.anhNhanVien)" class="avatar-img" />
              <i v-else class="bi bi-person avatar-icon"></i>
            </div>

            <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" hidden />

            <button type="button" class="ss-btn ss-btn-sm ss-btn-back mt-2" @click="openFilePicker">
              <i class="bi bi-camera me-2"></i>
              Chọn ảnh
            </button>
          </div>

          <!-- THÔNG TIN CÁ NHÂN -->
          <div class="col-md-5">
            <h6 class="section-title">Thông tin cá nhân</h6>

            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input class="form-control ss-input" v-model="nv.tenNhanVien" />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên tài khoản</label>
              <input class="form-control ss-input" v-model="nv.tenTaiKhoan" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control ss-input" v-model="nv.email" />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input class="form-control ss-input" v-model="nv.soDienThoai" />
            </div>
          </div>

          <!-- ĐỊA CHỈ -->
          <div class="col-md-5">
            <h6 class="section-title">Thông tin địa chỉ</h6>

            <div class="mb-3">
              <label class="form-label">Thành phố</label>
              <select class="form-control ss-input" v-model="nv.thanhPho">
                <option value="">Chọn thành phố</option>
                <option v-for="tp in thanhphoOptions" :key="tp">{{ tp }}</option>
              </select>
            </div>

            <div class="mb-3 d-flex gap-2">
              <div class="flex-grow-1">
                <label class="form-label">Quận</label>
                <select class="form-control ss-input" v-model="nv.quan">
                  <option v-for="q in quanOptions" :key="q">{{ q }}</option>
                </select>
              </div>
              <div class="flex-grow-1">
                <label class="form-label">Phường</label>
                <select class="form-control ss-input" v-model="nv.phuong">
                  <option v-for="p in phuongOptions" :key="p">{{ p }}</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Địa chỉ chi tiết</label>
              <input class="form-control ss-input" v-model="nv.diaChiCuThe" />
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="d-flex justify-content-between align-items-center mt-4 actions">
          <!-- Trạng thái: chủ đạo (đen -> đỏ), KHÔNG vàng/xanh -->
          <button type="button" class="ss-btn ss-btn-state" @click="toggleStatus">
            {{ nv.trangThai ? "Hủy hoạt động" : "Kích hoạt" }}
          </button>

          <div class="d-flex gap-2">
            <button type="submit" class="ss-btn ss-btn-primary ss-btn-submit">
              Cập nhật
            </button>

            <button type="button" class="ss-btn ss-btn-danger" @click="cancel">
              Xóa
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { detailNhanVien, removeNhanVien, updateNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService.js";
import { getAllQuyenHan } from "@/services/tai_khoan/nhan_vien/quyen_hanService.js";

const router = useRouter();
const route = useRoute();
const avatarFile = ref(null);
const id = route.params.id;

const listQuyenHan = ref([]);
const BASE_URL = "http://localhost:8080";

const nv = ref({
  idQuyenHan: null,
  tenNhanVien: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  anhNhanVien: "",
  ngaySinh: "",
  ghiChu: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: "",
  cccd: "",
  trangThai: true,
});

const thanhphoOptions = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];

const phuongOptions = [
  "Phường Xuân Phương",
  "Phường Mỹ Đình 1",
  "Phường Mỹ Đình 2",
  "Phường Mễ Trì",
  "Phường Trung Văn",
  "Phường Cầu Diễn",
  "Phường Phú Đô",
  "Phường Đại Mỗ",
  "Phường Tây Mỗ",
  "Phường Minh Khai",
  "Phường Trung Hòa",
];

const quanOptions = [
  "Quận Nam Từ Liêm",
  "Quận Bắc Từ Liêm",
  "Quận Cầu Giấy",
  "Quận Thanh Xuân",
  "Quận Hoàng Mai",
  "Quận Đống Đa",
  "Quận Hai Bà Trưng",
  "Quận Tây Hồ",
  "Quận Long Biên",
  "Quận Hoàn Kiếm",
  "Quận Ba Đình",
  "Quận Hà Đông",
  "Quận Sơn Tây",
];

const getAllQH = async () => {
  listQuyenHan.value = await getAllQuyenHan();
};

const loadNhanVien = async () => {
  try {
    const data = await detailNhanVien(id);
    if (data) {
      nv.value = {
        ...nv.value,
        ...data,
        ngaySinh: data.ngaySinh?.substring(0, 10),
      };
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết nhân viên:", error);
    alert("Không thể tải thông tin nhân viên!");
  }
};

const toggleStatus = async () => {
  try {
    nv.value.trangThai = !nv.value.trangThai;
    await updateNhanVien(id, nv.value);
    alert(nv.value.trangThai ? "Đã kích hoạt nhân viên!" : "Đã hủy kích hoạt nhân viên!");
  } catch (e) {
    console.error(e);
    alert("Cập nhật trạng thái thất bại: " + e.message);
  }
};

const submit = async () => {
  try {
    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(nv.value)], { type: "application/json" })
    );

    if (avatarFile.value) formData.append("file", avatarFile.value);

    await updateNhanVien(id, formData);

    alert("Cập nhật thành công!");
    router.push("/admin/tai-khoan/nhan-vien");
  } catch (error) {
    console.error(error);
    alert("Cập nhật thất bại: " + error.message);
  }
};

const cancel = async () => {
  try {
    await removeNhanVien(id);
    router.push("/admin/tai-khoan/nhan-vien");
  } catch (error) {
    console.error(error);
    alert("Xóa thất bại: " + error.message);
  }
};

const back = () => {
  router.push("/admin/tai-khoan/nhan-vien");
};

const fileInput = ref(null);

const openFilePicker = () => {
  fileInput.value?.click();
};

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  avatarFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    nv.value.anhNhanVien = e.target?.result;
  };
  reader.readAsDataURL(file);
};

const getImageUrl = (imageData) => {
  if (!imageData) return null;
  if (String(imageData).startsWith("data:")) return imageData;
  return BASE_URL + imageData;
};

onMounted(() => {
  getAllQH();
  loadNhanVien();
});
</script>

<style scoped>
.update_page {
  margin: 20px;
}

.page-head {
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.page-title {
  text-align: center;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin: 0;
  color: rgba(17, 24, 39, 0.88);
}

.head-spacer {
  height: 1px;
}

/* Card + border đỏ nhạt */
.ss-card {
  background: #fff;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid rgba(255, 77, 79, 0.25);
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.08);
}

.section-title {
  font-weight: 800;
  margin-bottom: 14px;
  color: rgba(17, 24, 39, 0.86);
}

/* Inputs */
.ss-input {
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  height: 40px;
}
.ss-input:focus {
  border-color: rgba(255, 77, 79, 0.45) !important;
  box-shadow: 0 0 0 0.18rem rgba(255, 77, 79, 0.14) !important;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  overflow: hidden;
}
.ss-border {
  border: 1px solid rgba(255, 77, 79, 0.22);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-icon {
  font-size: 42px;
  color: #9ca3af;
}

/* ===== Buttons (không trắng + không mất chữ) ===== */
.ss-btn {
  border-radius: 10px;
  height: 36px;
  padding: 0 14px;
  font-weight: 800;
  font-size: 13px;

  display: inline-flex;           /* ✅ luôn thấy chữ */
  align-items: center;
  justify-content: center;

  border: none;
  cursor: pointer;
  user-select: none;
}

.ss-btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
}

/* Back: tint đỏ nhạt (không trắng) */
.ss-btn-back {
  background: rgba(255, 77, 79, 0.08);
  color: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(255, 77, 79, 0.22);
}
.ss-btn-back:hover {
  background: rgba(255, 77, 79, 0.12);
}

/* Primary: đỏ -> đen */
.ss-btn-primary {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.14);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

/* State: đen -> đỏ */
.ss-btn-state {
  background: linear-gradient(90deg, #111827 0%, #ff4d4f 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(17, 24, 39, 0.12);
}
.ss-btn-state:hover {
  filter: brightness(0.98);
}

/* Danger */
.ss-btn-danger {
  background: linear-gradient(90deg, #ef4444 0%, #991b1b 100%) !important;
  color: #fff !important;
}

/* Fix nút cập nhật bị co quá nhỏ */
.ss-btn-submit {
  min-width: 118px;
}

/* Footer actions */
.actions {
  border-top: 1px solid rgba(17, 24, 39, 0.10);
  padding-top: 16px;
}
</style>
