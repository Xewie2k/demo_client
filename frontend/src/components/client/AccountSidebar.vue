<template>
  <div class="account-sidebar bg-white rounded-3 shadow-sm overflow-hidden">
    <!-- Avatar -->
    <div class="text-center py-4 px-3" style="background: linear-gradient(135deg, #f8f9fa, #fff);">
      <div class="mb-2 position-relative d-inline-block">
        <img :src="avatarUrl" class="rounded-circle border shadow-sm" width="80" height="80" style="object-fit: cover;" alt="Avatar">
        <button
          class="btn btn-sm text-white position-absolute rounded-circle d-flex align-items-center justify-content-center"
          style="width: 28px; height: 28px; bottom: 0; right: 0; background-color: var(--ss-accent);"
          type="button"
          @click="$refs.avatarInput.click()"
        >
          <i class="bi bi-camera-fill" style="font-size: 12px;"></i>
        </button>
        <input ref="avatarInput" type="file" accept="image/*" class="d-none" @change="uploadAvatar">
      </div>
      <div v-if="avatarUploading" class="mb-1">
        <div class="spinner-border spinner-border-sm" style="color: var(--ss-accent);"></div>
      </div>
      <h6 class="fw-bold mb-0">{{ customer?.hoTen || 'Khách hàng' }}</h6>
      <small class="text-muted">{{ customer?.email || '' }}</small>
    </div>

    <!-- Menu -->
    <div class="py-2">
      <div class="px-3 py-2">
        <div class="text-uppercase fw-bold text-muted" style="font-size: 11px; letter-spacing: 1px;">Tài khoản</div>
      </div>
      <router-link to="/client/account/profile" class="sidebar-link" active-class="active">
        <i class="bi bi-person"></i> <span>Hồ sơ</span>
      </router-link>
      <router-link to="/client/account/address" class="sidebar-link" active-class="active">
        <i class="bi bi-geo-alt"></i> <span>Địa chỉ</span>
      </router-link>
      <router-link to="/client/account/password" class="sidebar-link" active-class="active">
        <i class="bi bi-key"></i> <span>Đổi mật khẩu</span>
      </router-link>

      <hr class="my-2 mx-3">

      <router-link to="/client/account/orders" class="sidebar-link" active-class="active">
        <i class="bi bi-receipt"></i> <span>Đơn mua</span>
      </router-link>
      <router-link to="/client/account/coupons" class="sidebar-link" active-class="active">
        <i class="bi bi-ticket-perforated"></i> <span>Phiếu giảm giá</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useClientAuth } from '@/services/authClient';
import apiClient from '@/services/apiClient';

const { customer, updateProfile } = useClientAuth();
const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const avatarUrl = ref(
  customer.value?.anhDaiDien
    ? baseUrl + customer.value.anhDaiDien
    : 'https://placehold.co/100x100?text=👤'
);
const avatarUploading = ref(false);
const avatarInput = ref(null);

const uploadAvatar = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  avatarUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/api/client/account/profile/${customer.value.id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.data.anhDaiDien) {
      avatarUrl.value = baseUrl + res.data.anhDaiDien;
      updateProfile({ anhDaiDien: res.data.anhDaiDien });
    }
  } catch (err) {
    console.error('Upload avatar failed', err);
  } finally {
    avatarUploading.value = false;
  }
};
</script>

<style scoped>
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  text-decoration: none;
  color: #555;
  font-size: 14px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}
.sidebar-link:hover {
  background-color: #f8f9fa;
  color: #333;
}
.sidebar-link.active {
  color: var(--ss-accent);
  font-weight: 600;
  background-color: #fff5f5;
  border-left-color: var(--ss-accent);
}
.sidebar-link i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
</style>
