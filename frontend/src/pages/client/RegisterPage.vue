<template>
  <div class="register-page d-flex align-items-center justify-content-center" style="min-height: 75vh;">
    <div class="w-100" style="max-width: 460px;">
      <!-- Logo -->
      <div class="text-center mb-4">
        <img :src="logoUrl" alt="SevenStrike" style="height: 90px;" class="mb-2">
      </div>

      <!-- Card -->
      <div class="card border-0 shadow rounded-4">
        <div class="card-body p-4 p-md-5">
          <div class="text-center mb-4">
            <h5 class="fw-bold mb-1">Đăng ký tài khoản</h5>
            <p class="text-muted small mb-0">Tạo tài khoản để mua sắm tại SevenStrike</p>
          </div>

          <div v-if="errorMsg" class="alert alert-danger py-2 small rounded-3">{{ errorMsg }}</div>

          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Họ và tên <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
                <input type="text" class="form-control border-start-0 ps-0" v-model="form.tenKhachHang" required placeholder="Nguyễn Văn A" autofocus>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Email <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                <input type="email" class="form-control border-start-0 ps-0" v-model="form.email" required placeholder="email@example.com">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Số điện thoại</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-telephone text-muted"></i></span>
                <input type="tel" class="form-control border-start-0 ps-0" v-model="form.soDienThoai" placeholder="0123456789">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Mật khẩu <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0 ps-0"
                  v-model="form.matKhau"
                  required
                  placeholder="Nhập mật khẩu"
                  minlength="6"
                >
                <button class="btn btn-outline-secondary border-start-0" type="button" @click="showPassword = !showPassword" tabindex="-1">
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-muted"></i>
                </button>
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">Xác nhận mật khẩu <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-shield-lock text-muted"></i></span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 ps-0"
                  v-model="confirmPassword"
                  required
                  placeholder="Nhập lại mật khẩu"
                >
              </div>
            </div>
            <button
              type="submit"
              class="btn w-100 py-2 fw-bold text-white rounded-3"
              style="background-color: var(--ss-accent);"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Đăng ký
            </button>
          </form>

          <div class="text-center mt-4 pt-3 border-top">
            <span class="text-muted small">Đã có tài khoản? </span>
            <router-link to="/client/login" class="fw-bold small text-decoration-none" style="color: var(--ss-accent);">Đăng nhập</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useClientAuth } from '@/services/authClient';

const router = useRouter();
const { register } = useClientAuth();

import logoUrl from '@/assets/images/logo/Logo_SevenStrike.png';

const form = reactive({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  matKhau: '',
});
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);

const handleRegister = async () => {
  errorMsg.value = '';

  if (form.matKhau !== confirmPassword.value) {
    errorMsg.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  loading.value = true;
  try {
    await register(form);
    router.push('/client');
  } catch (err) {
    errorMsg.value = err.userMessage || err.response?.data || 'Đăng ký thất bại!';
  } finally {
    loading.value = false;
  }
};
</script>
