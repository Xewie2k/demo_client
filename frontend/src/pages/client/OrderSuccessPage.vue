<template>
  <div class="container py-5 d-flex flex-column align-items-center justify-content-center min-vh-75">

    <div v-if="loading" class="text-center">
       <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
       </div>
       <p class="mt-3 text-muted">Đang xử lý kết quả...</p>
    </div>

    <div v-else class="text-center" style="max-width: 550px; margin: 0 auto;">

        <!-- Success -->
        <template v-if="success">
          <h3 class="fw-bold mb-4" style="color: var(--ss-accent);">Thanh toán đã ghi nhận!</h3>

          <p class="mb-1 text-secondary">
            Mã đơn hàng: <strong class="text-dark">#{{ maHoaDon || orderId }}</strong>
          </p>
          <p class="mb-3 text-secondary">
            Trạng thái: <strong class="text-dark">chờ xác nhận</strong>
          </p>

          <p class="text-muted mb-5" style="font-size: 14px;">
            Thanh toán của bạn đã được ghi nhận. Chúng tôi sẽ xác nhận đơn hàng của bạn trong thời gian sớm nhất.
          </p>

          <router-link to="/client" class="btn text-white px-4 py-2 rounded-pill" style="background-color: var(--ss-accent);">
            Quay về trang chủ
          </router-link>
        </template>

        <!-- Failed -->
        <template v-else>
          <div class="mb-4">
            <div class="d-inline-flex align-items-center justify-content-center bg-danger text-white rounded-circle shadow-sm" style="width: 100px; height: 100px;">
              <span class="material-icons" style="font-size: 60px;">priority_high</span>
            </div>
          </div>

          <h3 class="fw-bold mb-3 text-danger">THANH TOÁN THẤT BẠI</h3>
          <p class="text-secondary mb-5">
            Giao dịch thanh toán của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại.
          </p>

          <router-link to="/client" class="btn text-white px-4 py-2 rounded-pill" style="background-color: var(--ss-accent);">
            Quay về trang chủ
          </router-link>
        </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const success = ref(false);

const orderId = ref(null);
const maHoaDon = ref(null);
const tongTienDisplay = ref(null);

const formatPrice = (value) => {
    let val = Number(value);
    if (isNaN(val)) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

onMounted(() => {
    // 1. COD: ?id=...&maHoaDon=...&tongTien=...
    if (route.query.id) {
        orderId.value = route.query.id;
        maHoaDon.value = route.query.maHoaDon || null;
        tongTienDisplay.value = route.query.tongTien || null;
        success.value = true;
        loading.value = false;
        return;
    }

    // 2. VNPAY (qua backend redirect): ?status=success|failed & ...
    if (route.query.status) {
        success.value = route.query.status === 'success';

        // Backend đã chia vnp_Amount / 100 rồi, dùng trực tiếp
        tongTienDisplay.value = Number(route.query.totalPrice);

        const orderInfoVal = route.query.orderInfo;
        if (orderInfoVal) {
            const match = orderInfoVal.match(/\d+/);
            if (match) orderId.value = match[0];
        }

        // Lấy maHoaDon từ sessionStorage
        const storedMaHD = sessionStorage.getItem('order_maHoaDon');
        if (storedMaHD) {
            maHoaDon.value = storedMaHD;
            sessionStorage.removeItem('order_maHoaDon');
        }

        loading.value = false;
        return;
    }

    // 3. Trực tiếp từ VNPay (vnp_ResponseCode)
    if (route.query.vnp_ResponseCode) {
        success.value = route.query.vnp_ResponseCode === '00';
        tongTienDisplay.value = route.query.vnp_Amount ? Number(route.query.vnp_Amount) / 100 : 0;

        const orderInfoVal = route.query.vnp_OrderInfo;
        if (orderInfoVal) {
            const match = orderInfoVal.match(/\d+/);
            if (match) orderId.value = match[0];
        }

        const storedMaHD = sessionStorage.getItem('order_maHoaDon');
        if (storedMaHD) {
            maHoaDon.value = storedMaHD;
            sessionStorage.removeItem('order_maHoaDon');
        }

        loading.value = false;
        return;
    }

    // Fallback
    loading.value = false;
    success.value = false;
});
</script>

<style scoped>
.min-vh-75 {
    min-height: 75vh;
}
</style>
