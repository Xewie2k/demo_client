<template>
  <div class="bg-white p-4 rounded-3 shadow-sm h-100">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h5 class="fw-bold m-0">Hồ sơ của tôi</h5>
      <div class="text-muted small">Quản lý thông tin cá nhân</div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" style="color: var(--ss-accent);" role="status"></div>
    </div>

    <div v-else class="row g-4">
      <div class="col-md-8">
        <div v-if="successMsg" class="alert alert-success py-2 small rounded-3">{{ successMsg }}</div>
        <div v-if="errorMsg" class="alert alert-danger py-2 small rounded-3">{{ errorMsg }}</div>

        <form @submit.prevent="saveProfile">
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Tên khách hàng</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
              <input type="text" class="form-control border-start-0 ps-0" v-model="form.tenKhachHang" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Email</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
              <input type="email" class="form-control border-start-0 ps-0" v-model="form.email" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Số điện thoại</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-telephone text-muted"></i></span>
              <input type="tel" class="form-control border-start-0 ps-0" v-model="form.soDienThoai">
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold text-secondary">Giới tính</label>
              <select class="form-select" v-model="form.gioiTinh">
                <option :value="null">-- Chọn --</option>
                <option :value="true">Nam</option>
                <option :value="false">Nữ</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold text-secondary">Ngày sinh</label>
              <input type="date" class="form-control" v-model="form.ngaySinh">
            </div>
          </div>
          <button type="submit" class="btn text-white px-4" style="background-color: var(--ss-accent);" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            Lưu thay đổi
          </button>
        </form>
      </div>

      <div class="col-md-4">
        <div class="rounded-3 p-3 border" style="background: linear-gradient(135deg, #f8f9fa, #fff);">
          <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-1"></i> Thông tin nhanh</h6>
          <div class="small mb-2">
            <div class="text-muted mb-1">Email</div>
            <div class="fw-bold text-dark">{{ profile?.email || '-' }}</div>
          </div>
          <div class="small mb-2">
            <div class="text-muted mb-1">Điện thoại</div>
            <div class="fw-bold text-dark">{{ profile?.soDienThoai || '-' }}</div>
          </div>
          <div class="small">
            <div class="text-muted mb-1">Vai trò</div>
            <div class="fw-bold text-dark">Khách hàng</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';

const { customer, updateProfile } = useClientAuth();
const loading = ref(true);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const profile = ref(null);

const form = reactive({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: null,
  ngaySinh: null,
});

const fetchProfile = async () => {
  try {
    const res = await apiClient.get('/api/client/account/profile', { params: { id: customer.value.id } });
    profile.value = res.data;
    form.tenKhachHang = res.data.tenKhachHang || '';
    form.email = res.data.email || '';
    form.soDienThoai = res.data.soDienThoai || '';
    form.gioiTinh = res.data.gioiTinh;
    form.ngaySinh = res.data.ngaySinh || null;
  } catch (err) {
    errorMsg.value = 'Không thể tải thông tin hồ sơ.';
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  saving.value = true;
  successMsg.value = '';
  errorMsg.value = '';
  try {
    const res = await apiClient.put(`/api/client/account/profile/${customer.value.id}`, form);
    profile.value = res.data;
    updateProfile({ hoTen: res.data.tenKhachHang, email: res.data.email, soDienThoai: res.data.soDienThoai });
    successMsg.value = 'Cập nhật hồ sơ thành công!';
  } catch (err) {
    errorMsg.value = err.userMessage || 'Cập nhật thất bại!';
  } finally {
    saving.value = false;
  }
};

onMounted(fetchProfile);
</script>
