<template>
  <div class="profile-page">
    <div class="header-section">
      <h2 class="page-title">Thông Tin Cá Nhân</h2>
      <p class="text-muted small">Quản lý và cập nhật thông tin tài khoản của bạn</p>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card-box text-center p-4 h-100 d-flex flex-column align-items-center justify-content-center">
          <div class="avatar-wrapper mb-3 position-relative">
            <img
              v-if="displayAvatar"
              :src="displayAvatar"
              alt="Avatar"
              class="profile-avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ getAvatarLabel(form.tenNhanVien) }}
            </div>

            <label for="avatar-upload" class="avatar-upload-btn" title="Đổi ảnh đại diện">
              <i class="fa-solid fa-camera"></i>
            </label>
            <input
              type="file"
              id="avatar-upload"
              class="d-none"
              accept="image/*"
              @change="onFileChange"
            />
          </div>

          <h4 class="fw-bold mb-1">{{ form.tenNhanVien || 'Chưa có tên' }}</h4>
          <span class="badge bg-danger rounded-pill px-3">{{ roleName }}</span>
          <p class="text-muted small mt-3">Nhấn vào biểu tượng máy ảnh để tải ảnh mới lên.</p>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card-box p-4">
          <h5 class="fw-bold mb-4 border-bottom pb-2">Chi tiết thông tin</h5>

          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-bold">Mã nhân viên <span class="text-danger">*</span></label>
                <input type="text" class="form-control disabled-input" :value="form.maNhanVien" readonly />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Tên tài khoản <span class="text-danger">*</span></label>
                <input type="text" class="form-control disabled-input" :value="form.tenTaiKhoan" readonly />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Họ và tên <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="form.tenNhanVien" placeholder="Nhập họ và tên..." />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Mật khẩu <span class="text-danger">*</span></label>
                <input type="password" class="form-control" v-model="form.matKhau" placeholder="Nhập mật khẩu..." />
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Email</label>
                <input type="email" class="form-control" v-model="form.email" />
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Số điện thoại</label>
                <input type="text" class="form-control" v-model="form.soDienThoai" />
              </div>

              <div class="col-md-12">
                <label class="form-label small fw-bold">Ngày sinh</label>
                <input type="date" class="form-control" v-model="form.ngaySinh" />
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Tỉnh / Thành phố</label>
                <div class="combobox-wrapper">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.thanhPho"
                    @focus="showCity = true"
                    @blur="handleBlurCity"
                    placeholder="Nhập hoặc chọn..."
                  />
                  <ul v-if="showCity" class="combobox-dropdown shadow">
                    <li v-for="p in filteredProvinces" :key="p.code" @click="selectCity(p.name)">
                      {{ p.name }}
                    </li>
                    <li v-if="filteredProvinces.length === 0" class="no-result text-muted font-italic">Không tìm thấy</li>
                  </ul>
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Quận / Huyện</label>
                <div class="combobox-wrapper">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.quan"
                    @focus="showDistrict = true"
                    @blur="handleBlurDistrict"
                    placeholder="Nhập hoặc chọn..."
                  />
                  <ul v-if="showDistrict" class="combobox-dropdown shadow">
                    <li v-for="d in filteredDistricts" :key="d.code" @click="selectDistrict(d.name)">
                      {{ d.name }}
                    </li>
                    <li v-if="filteredDistricts.length === 0" class="no-result text-muted font-italic">Không tìm thấy</li>
                  </ul>
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Phường / Xã</label>
                <div class="combobox-wrapper">
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.phuong"
                    @focus="showWard = true"
                    @blur="handleBlurWard"
                    placeholder="Nhập hoặc chọn..."
                  />
                  <ul v-if="showWard" class="combobox-dropdown shadow">
                    <li v-for="w in filteredWards" :key="w.code" @click="selectWard(w.name)">
                      {{ w.name }}
                    </li>
                    <li v-if="filteredWards.length === 0" class="no-result text-muted font-italic">Không tìm thấy</li>
                  </ul>
                </div>
              </div>
              <div class="col-md-12">
                <label class="form-label small fw-bold">Địa chỉ cụ thể</label>
                <input type="text" class="form-control" v-model="form.diaChiCuThe" placeholder="Số nhà, ngõ, ngách, đường..." />
              </div>

              <div class="col-md-12">
                <label class="form-label small fw-bold">Ghi chú</label>
                <textarea class="form-control" v-model="form.ghiChu" rows="2"></textarea>
              </div>
            </div>

            <div class="text-end mt-4 pt-3 border-top">
              <button type="submit" class="btn btn-save" :disabled="loading">
                <i v-if="loading" class="fa-solid fa-spinner fa-spin me-2"></i>
                <i v-else class="fa-solid fa-floppy-disk me-2"></i>
                Lưu Thay Đổi
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import { detailNhanVien, updateNhanVien } from '@/services/tai_khoan/nhan_vien/nhan_vienService';
import Swal from 'sweetalert2';

const loading = ref(false);
const userId = ref(null);
const roleName = ref('Nhân Viên');

// Ảnh Upload
const selectedFile = ref(null);
const previewAvatar = ref(null);

const form = reactive({
  idQuyenHan: null,
  maNhanVien: '',
  tenTaiKhoan: '',
  tenNhanVien: '',
  matKhau: '',
  email: '',
  soDienThoai: '',
  anhNhanVien: '',
  ngaySinh: '',
  thanhPho: '',
  quan: '',
  phuong: '',
  diaChiCuThe: '',
  ghiChu: '',
  trangThai: true,
  xoaMem: false
});

let oldPasswordHash = '';

// ======================== LOGIC ẢNH ĐẠI DIỆN ========================
const getAvatarLabel = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const isImg = (s) => {
  if (!s) return false;
  const v = String(s).trim();
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:image/") || v.startsWith("blob:");
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewAvatar.value = URL.createObjectURL(file);
  }
};

const displayAvatar = computed(() => {
  if (previewAvatar.value) return previewAvatar.value;
  if (isImg(form.anhNhanVien)) return form.anhNhanVien;
  return null;
});

// ======================== LOGIC COMBOBOX ĐỊA CHỈ ========================
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const showCity = ref(false);
const showDistrict = ref(false);
const showWard = ref(false);

const fetchAddressData = async () => {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
    provinces.value = await res.json();
  } catch (e) {
    console.error("Lỗi tải API tỉnh thành:", e);
  }
};

watch(() => form.thanhPho, (newVal) => {
  const p = provinces.value.find(x => x.name.toLowerCase() === String(newVal).toLowerCase());
  districts.value = p ? p.districts : [];
});

watch(() => form.quan, (newVal) => {
  const d = districts.value.find(x => x.name.toLowerCase() === String(newVal).toLowerCase());
  wards.value = d ? d.wards : [];
});

const filteredProvinces = computed(() => {
  if (!form.thanhPho) return provinces.value;
  return provinces.value.filter(p => p.name.toLowerCase().includes(form.thanhPho.toLowerCase()));
});

const filteredDistricts = computed(() => {
  if (!form.quan) return districts.value;
  return districts.value.filter(d => d.name.toLowerCase().includes(form.quan.toLowerCase()));
});

const filteredWards = computed(() => {
  if (!form.phuong) return wards.value;
  return wards.value.filter(w => w.name.toLowerCase().includes(form.phuong.toLowerCase()));
});

const selectCity = (name) => { form.thanhPho = name; showCity.value = false; };
const selectDistrict = (name) => { form.quan = name; showDistrict.value = false; };
const selectWard = (name) => { form.phuong = name; showWard.value = false; };

const handleBlurCity = () => setTimeout(() => showCity.value = false, 200);
const handleBlurDistrict = () => setTimeout(() => showDistrict.value = false, 200);
const handleBlurWard = () => setTimeout(() => showWard.value = false, 200);


// ======================== LOGIC LƯU DỮ LIỆU ========================
const loadProfile = async () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return;
    const u = JSON.parse(raw);
    userId.value = u.id || u.idNhanVien;

    const r = String(u?.role || u?.quyen || u?.vaiTro || "").toUpperCase();
    roleName.value = r.includes("ADMIN") ? "Quản Trị Viên" : "Nhân Viên";

    if (!userId.value) return;

    const res = await detailNhanVien(userId.value);
    Object.assign(form, res);

    oldPasswordHash = res.matKhau || '';
    // Gán 6 dấu sao để hiển thị (báo cho người dùng biết mật khẩu không bị trống)
    form.matKhau = '******';

    await fetchAddressData();
    const p = provinces.value.find(x => x.name === form.thanhPho);
    if(p) districts.value = p.districts;

    const d = districts.value.find(x => x.name === form.quan);
    if(d) wards.value = d.wards;

  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải thông tin cá nhân!' });
  }
};

const handleSubmit = async () => {
  // ✅ 1. VALIDATION CÁC TRƯỜNG BẮT BUỘC (Dấu *)
  if (!form.tenNhanVien || form.tenNhanVien.trim() === '') {
    Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Họ và tên không được để trống!' });
    return;
  }

  if (!form.matKhau || form.matKhau.trim() === '') {
    Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Mật khẩu không được để trống!' });
    return;
  }

  loading.value = true;
  try {
    const payload = { ...form };

    // ✅ 2. XỬ LÝ MẬT KHẨU
    // Nếu gửi lên chuỗi '******' => Tức là họ không sửa => Gán lại pass cũ
    if (payload.matKhau === '******') {
      payload.matKhau = oldPasswordHash;
    }

    let submitData;
    if (selectedFile.value) {
      submitData = new FormData();
      submitData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      submitData.append("file", selectedFile.value);
    } else {
      submitData = payload;
    }

    const resUpdate = await updateNhanVien(userId.value, submitData);

    // Cập nhật Avatar và Tên ở LocalStorage để Menu tự đổi
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      u.tenNhanVien = resUpdate.tenNhanVien;
      u.anhNhanVien = resUpdate.anhNhanVien;
      localStorage.setItem("user", JSON.stringify(u));
    }

    await Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: 'Đã cập nhật thông tin cá nhân!',
      timer: 1500,
      showConfirmButton: false
    });

    window.location.reload();

  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Thất bại', text: error.message || 'Có lỗi xảy ra!' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.profile-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
  color: rgba(17, 24, 39, 0.92);
}
.card-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #e5e7eb;
}
.avatar-wrapper {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  border-radius: 50%;
  border: 4px solid #f8f9fa;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background-color: #111827;
}
.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  font-weight: bold;
  color: white;
}
.avatar-upload-btn {
  position: absolute;
  bottom: 0px;
  right: 10px;
  background-color: #ff4d4f;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: all 0.2s;
}
.avatar-upload-btn:hover {
  background-color: #e63946;
  transform: scale(1.1);
}
.disabled-input {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  font-weight: 500;
}
.btn-save {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  transition: all 0.3s;
}
.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 77, 79, 0.3);
}

/* ==================== CSS COMBOBOX ==================== */
.combobox-wrapper {
  position: relative;
}
.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1050;
  margin-top: 4px;
  padding: 0;
  list-style: none;
}
.combobox-dropdown li {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s;
}
.combobox-dropdown li:last-child {
  border-bottom: none;
}
.combobox-dropdown li:hover {
  background-color: #f3f4f6;
  color: #111827;
}
.combobox-dropdown .no-result {
  padding: 12px 15px;
  text-align: center;
  cursor: default;
}
.combobox-dropdown .no-result:hover {
  background-color: white;
}
</style>
