<template>
  <div class="bg-white p-4 rounded-3 shadow-sm h-100">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h5 class="fw-bold m-0">Đổi mật khẩu</h5>
      <div class="text-muted small">Bảo mật tài khoản</div>
    </div>

    <div style="max-width: 440px;">
      <div v-if="successMsg" class="alert alert-success py-2 small rounded-3">{{ successMsg }}</div>
      <div v-if="errorMsg" class="alert alert-danger py-2 small rounded-3">{{ errorMsg }}</div>

      <form @submit.prevent="handleChangePassword" novalidate>
        <div class="mb-3">
          <label class="form-label small fw-semibold text-secondary">Mật khẩu hiện tại</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
            <input
              :type="showOld ? 'text' : 'password'"
              :class="['form-control border-start-0 border-end-0 ps-0', errors.matKhauCu && 'is-invalid']"
              v-model="form.matKhauCu"
            >
            <button class="btn btn-outline-secondary border-start-0" type="button" @click="showOld = !showOld" tabindex="-1">
              <i :class="showOld ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-muted"></i>
            </button>
          </div>
          <div v-if="errors.matKhauCu" class="text-danger small mt-1">{{ errors.matKhauCu }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold text-secondary">Mật khẩu mới</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-key text-muted"></i></span>
            <input
              :type="showNew ? 'text' : 'password'"
              :class="['form-control border-start-0 border-end-0 ps-0', errors.matKhauMoi && 'is-invalid']"
              v-model="form.matKhauMoi"
            >
            <button class="btn btn-outline-secondary border-start-0" type="button" @click="showNew = !showNew" tabindex="-1">
              <i :class="showNew ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-muted"></i>
            </button>
          </div>
          <div v-if="errors.matKhauMoi" class="text-danger small mt-1">{{ errors.matKhauMoi }}</div>
        </div>
        <div class="mb-4">
          <label class="form-label small fw-semibold text-secondary">Xác nhận mật khẩu mới</label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0"><i class="bi bi-shield-lock text-muted"></i></span>
            <input
              :type="showNew ? 'text' : 'password'"
              :class="['form-control border-start-0 ps-0', errors.confirmPassword && 'is-invalid']"
              v-model="confirmPassword"
            >
          </div>
          <div v-if="errors.confirmPassword" class="text-danger small mt-1">{{ errors.confirmPassword }}</div>
        </div>
        <button type="submit" class="btn text-white px-4" style="background-color: var(--ss-accent);" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          Đổi mật khẩu
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';

const { customer } = useClientAuth();
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const errors = ref({});
const confirmPassword = ref('');
const showOld = ref(false);
const showNew = ref(false);

const form = reactive({
  matKhauCu: '',
  matKhauMoi: '',
});

function validate() {
  errors.value = {};
  if (!form.matKhauCu) errors.value.matKhauCu = 'Vui lòng nhập mật khẩu hiện tại';
  if (!form.matKhauMoi) {
    errors.value.matKhauMoi = 'Vui lòng nhập mật khẩu mới';
  } else if (form.matKhauMoi.length < 6) {
    errors.value.matKhauMoi = 'Mật khẩu mới tối thiểu 6 ký tự';
  }
  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (form.matKhauMoi !== confirmPassword.value) {
    errors.value.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }
  return Object.keys(errors.value).length === 0;
}

const handleChangePassword = async () => {
  successMsg.value = '';
  errorMsg.value = '';
  if (!validate()) return;

  saving.value = true;
  try {
    await apiClient.put(`/api/client/account/password/${customer.value.id}`, form);
    successMsg.value = 'Đổi mật khẩu thành công!';
    form.matKhauCu = '';
    form.matKhauMoi = '';
    confirmPassword.value = '';
  } catch (err) {
    errorMsg.value = err.userMessage || 'Đổi mật khẩu thất bại!';
  } finally {
    saving.value = false;
  }
};
</script>
