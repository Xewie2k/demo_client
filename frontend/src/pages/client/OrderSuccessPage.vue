<template>
  <div class="container py-5 d-flex flex-column align-items-center justify-content-center min-vh-75">
    
    <div v-if="loading" class="text-center">
       <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Đang xử lý kết quả...</p>
    </div>

    <div v-else class="text-center animate__animated animate__fadeInUp">
        <div class="mb-4">
            <div v-if="success" class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle shadow-sm" style="width: 100px; height: 100px;">
                <span class="material-icons" style="font-size: 60px;">check</span>
            </div>
             <div v-else class="d-inline-flex align-items-center justify-content-center bg-danger text-white rounded-circle shadow-sm" style="width: 100px; height: 100px;">
                <span class="material-icons" style="font-size: 60px;">priority_high</span>
            </div>
        </div>
        
        <h2 class="fw-bold mb-3">{{ success ? 'ĐẶT HÀNG THÀNH CÔNG!' : 'THANH TOÁN THẤT BẠI' }}</h2>
        
        <p class="text-secondary mb-4" style="max-width: 500px; margin: 0 auto;">
           {{ success 
              ? 'Cảm ơn bạn đã mua sắm tại SevenStrike. Đơn hàng của bạn đã được ghi nhận và sẽ sớm được xử lý.' 
              : 'Giao dịch thanh toán của bạn không thành công hoặc đã bị hủy. Vui lòng thử lại.' 
           }}
        </p>

        <div class="bg-light p-4 rounded-3 shadow-sm mx-auto mb-5 text-start" style="max-width: 450px;">
             <h6 class="fw-bold border-bottom pb-2 mb-3 text-uppercase text-muted" style="font-size: 12px;">Thông tin đơn hàng</h6>
             
             <!-- Case 1: COD Order ID available -->
             <div v-if="orderId" class="d-flex justify-content-between mb-2">
                 <span class="text-secondary">Mã đơn hàng:</span>
                 <span class="fw-bold">#{{ orderId }}</span>
             </div>

             <!-- Case 2: VNPAY Info -->
             <div v-if="transactionId" class="d-flex justify-content-between mb-2">
                 <span class="text-secondary">Mã giao dịch:</span>
                 <span class="fw-bold">{{ transactionId }}</span>
             </div>
             <div v-if="totalPrice" class="d-flex justify-content-between mb-2">
                 <span class="text-secondary">Tổng thanh toán:</span>
                 <span class="fw-bold text-danger">{{ formatPrice(totalPrice) }}</span>
             </div>
             
             <div v-if="orderInfo" class="mt-3 small text-muted fst-italic">
                "{{ orderInfo }}"
             </div>
        </div>
        
        <div class="d-flex gap-3 justify-content-center">
            <router-link to="/client" class="btn btn-outline-dark rounded-1 px-4 py-2">
                TIẾP TỤC MUA SẮM
            </router-link>
            <router-link v-if="success" to="/client/account/orders" class="btn btn-dark rounded-1 px-4 py-2 text-white" style="background-color: var(--ss-primary);">
                XEM LỊCH SỬ ĐƠN HÀNG
            </router-link>
             <router-link v-if="!success" to="/client/cart" class="btn btn-dark rounded-1 px-4 py-2 text-white" style="background-color: var(--ss-primary);">
                QUAY LẠI GIỎ HÀNG
            </router-link>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const loading = ref(true);
const success = ref(false);

const orderId = ref(null);
const transactionId = ref(null);
const totalPrice = ref(null);
const orderInfo = ref(null);

const formatPrice = (value) => {
    
    let val = Number(value);
    if (isNaN(val)) return '0 đ';
    
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

onMounted(() => {
    // Check params
    // 1. COD: ?id=...
    if (route.query.id) {
        orderId.value = route.query.id;
        success.value = true;
        // Fetch order details if needed, but for now ID is enough
        loading.value = false;
        return;
    }

    // 2. VNPAY: ?status=success|failed & ...
    if (route.query.status) {
        success.value = route.query.status === 'success';
        transactionId.value = route.query.transactionId;
        
        // Xử lý giá từ backend redirect (nếu có)
        let p = Number(route.query.totalPrice);
        if (p > 1000000000) p = p / 100; // Heuristic: nếu giá quá lớn thì chia 100
        totalPrice.value = p;
        
        orderInfo.value = route.query.orderInfo;
        
        // Try to extract order ID from orderInfo if possible "Thanh toan don hang {id}"
        if (orderInfo.value) {
            const match = orderInfo.value.match(/\d+/);
            if (match) {
                orderId.value = match[0];
            }
        }
        
        loading.value = false;
        return;
    }
    
    // 3. Xử lý kết quả trực tiếp từ VNPay (vnp_ResponseCode)
    if (route.query.vnp_ResponseCode) {
        success.value = route.query.vnp_ResponseCode === '00';
        transactionId.value = route.query.vnp_TransactionNo;
        // vnp_Amount của VNPay luôn nhân 100, nên cần chia 100
        totalPrice.value = route.query.vnp_Amount ? Number(route.query.vnp_Amount) / 100 : 0;
        orderInfo.value = route.query.vnp_OrderInfo;
        
        if (orderInfo.value) {
            const match = orderInfo.value.match(/\d+/);
            if (match) orderId.value = match[0];
        }
        loading.value = false;
        return;
    }

    // Fallback if no params
    loading.value = false;
    success.value = false; // Or redirect to home
});
</script>

<style scoped>
.min-vh-75 {
    min-height: 75vh;
}
</style>
