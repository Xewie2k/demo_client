<template>
  <div class="login-page d-flex align-items-center justify-content-center" style="min-height: 75vh;">
    <div class="w-100" style="max-width: 420px;">
      <!-- Logo -->
      <div class="text-center mb-4">
        <img :src="logoUrl" alt="SevenStrike" style="height: 90px;" class="mb-2">
      </div>

      <!-- Card -->
      <div class="card border-0 shadow rounded-4">
        <div class="card-body p-4 p-md-5">
          <div class="text-center mb-4">
            <h5 class="fw-bold mb-1">Đăng nhập</h5>
            <p class="text-muted small mb-0">Chào mừng bạn quay lại SevenStrike</p>
          </div>

          <div v-if="errorMsg" class="alert alert-danger py-2 small rounded-3">{{ errorMsg }}</div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary">Email / Tên tài khoản</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
                <input
                  type="text"
                  class="form-control border-start-0 ps-0"
                  v-model="username"
                  required
                  placeholder="Nhập email hoặc tên tài khoản"
                  autofocus
                >
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">Mật khẩu</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0 ps-0"
                  v-model="password"
                  required
                  placeholder="Nhập mật khẩu"
                >
                <button class="btn btn-outline-secondary border-start-0" type="button" @click="showPassword = !showPassword" tabindex="-1">
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-muted"></i>
                </button>
              </div>
            </div>
            <button
              type="submit"
              class="btn w-100 py-2 fw-bold text-white rounded-3"
              style="background-color: var(--ss-accent);"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Đăng nhập
            </button>
          </form>

          <div class="text-center mt-4 pt-3 border-top">
            <span class="text-muted small">Chưa có tài khoản? </span>
            <router-link to="/client/register" class="fw-bold small text-decoration-none" style="color: var(--ss-accent);">Đăng ký ngay</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClientAuth } from '@/services/authClient';

const router = useRouter();
const route = useRoute();
const { login } = useClientAuth();

import logoUrl from '@/assets/images/logo/Logo_SevenStrike.png';

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    await login(username.value, password.value);
    const redirect = route.query.redirect || '/client';
    router.push(redirect);
  } catch (err) {
    errorMsg.value = err.userMessage || err.response?.data || 'Đăng nhập thất bại!';
  } finally {
    loading.value = false;
  }
};
</script>
