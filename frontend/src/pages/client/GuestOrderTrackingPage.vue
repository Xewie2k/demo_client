<template>
  <div class="container py-5">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải thông tin đơn hàng...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger text-center shadow-sm">
      <h4><i class="fa-solid fa-triangle-exclamation"></i> Lỗi tra cứu</h4>
      <p>{{ error }}</p>
      <router-link to="/" class="btn btn-outline-dark mt-2">Về trang chủ</router-link>
    </div>

    <div v-else class="card border-0 shadow-sm animate__animated animate__fadeIn">
      <div class="card-header bg-white border-bottom py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold text-uppercase">Đơn hàng #{{ order.id }}</h5>
            <small class="text-muted">Ngày đặt: {{ formatDate(order.ngayTao) }}</small>
          </div>
          <span class="badge bg-primary px-3 py-2">{{ getStatusName(order.trangThaiHienTai) }}</span>
        </div>
      </div>
      <div class="card-body p-4">
        <!-- Timeline -->
        <div class="position-relative my-5 mx-3">
            <div class="progress" style="height: 3px;">
              <div class="progress-bar bg-success" role="progressbar" :style="{ width: progressWidth + '%' }"></div>
            </div>
            <div class="d-flex justify-content-between position-absolute top-0 w-100 translate-middle-y">
              <div v-for="step in steps" :key="step.code" class="text-center bg-white px-2">
                <div class="rounded-circle border d-flex align-items-center justify-content-center mx-auto shadow-sm" 
                     :class="order.trangThaiHienTai >= step.code ? 'border-success text-success bg-success-subtle' : 'border-secondary text-muted'"
                     style="width: 40px; height: 40px; transition: all 0.3s;">
                  <i :class="step.icon"></i>
                </div>
                <small class="d-block mt-2 fw-bold" :class="order.trangThaiHienTai >= step.code ? 'text-success' : 'text-muted'" style="font-size: 12px;">
                    {{ step.label }}
                </small>
              </div>
            </div>
        </div>

        <hr class="my-4 text-secondary-subtle">

        <div class="row g-4">
            <div class="col-md-6">
                <h6 class="fw-bold text-uppercase text-secondary small mb-3">Thông tin nhận hàng</h6>
                <p class="mb-1 fw-bold">{{ order.tenKhachHang }}</p>
                <p class="mb-1"><i class="fa-solid fa-phone me-2 text-muted"></i>{{ order.soDienThoaiKhachHang }}</p>
                <p class="mb-1"><i class="fa-solid fa-envelope me-2 text-muted"></i>{{ order.emailKhachHang }}</p>
                <p class="mb-0"><i class="fa-solid fa-location-dot me-2 text-muted"></i>{{ order.diaChiKhachHang }}</p>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold text-uppercase text-secondary small mb-3">Thanh toán</h6>
                <div class="d-flex justify-content-between mb-2">
                    <span>Phí vận chuyển</span>
                    <span class="fw-bold">{{ formatPrice(order.phiVanChuyen) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Giảm giá</span>
                    <span class="text-success">-{{ formatPrice(order.tongTien - order.tongTienSauGiam) }}</span>
                </div>
                <div class="d-flex justify-content-between border-top pt-2 mt-2">
                    <span class="fw-bold fs-5">Tổng cộng</span>
                    <span class="fw-bold fs-5 text-danger">{{ formatPrice(order.tongTienSauGiam) }}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/apiClient';

const route = useRoute();
const loading = ref(true);
const error = ref(null);
const order = ref({});

const steps = [
  { code: 1, label: 'Chờ xác nhận', icon: 'fa-solid fa-clipboard-list' },
  { code: 2, label: 'Chờ giao', icon: 'fa-solid fa-box' },
  { code: 3, label: 'Đang giao', icon: 'fa-solid fa-truck-fast' },
  { code: 6, label: 'Hoàn thành', icon: 'fa-solid fa-check' }
];

const progressWidth = computed(() => {
  const st = order.value.trangThaiHienTai || 1;
  if (st >= 6) return 100;
  if (st === 1) return 0;
  if (st === 2) return 33;
  if (st === 3) return 66;
  return 0;
});

const getStatusName = (code) => {
    const map = { 1: 'Chờ xác nhận', 2: 'Chờ giao hàng', 3: 'Đang vận chuyển', 4: 'Đã giao hàng', 5: 'Đã hủy', 6: 'Hoàn thành', 7: 'Giao thất bại' };
    return map[code] || 'Không xác định';
};

const formatPrice = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '';

onMounted(async () => {
  const { id, email } = route.query;
  if (!id || !email) { error.value = "Link không hợp lệ."; loading.value = false; return; }
  try { const res = await apiClient.get(`/api/client/hoa-don/tracking?id=${id}&email=${email}`); order.value = res.data; } catch (e) { error.value = "Không tìm thấy đơn hàng hoặc email không khớp."; } finally { loading.value = false; }
});
</script>