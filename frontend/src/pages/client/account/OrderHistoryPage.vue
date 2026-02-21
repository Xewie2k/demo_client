<template>
  <div class="bg-white p-4 rounded-3 shadow-sm h-100">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h5 class="fw-bold m-0">Đơn mua của bạn</h5>
      <div class="text-muted small">Quản lý đơn hàng</div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" style="color: var(--ss-accent);" role="status"></div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-5">
      <div class="mb-3">
        <i class="bi bi-clipboard-x text-muted" style="font-size: 3rem;"></i>
      </div>
      <p class="text-muted">Chưa có đơn hàng nào</p>
      <router-link to="/client/products" class="btn text-white" style="background-color: var(--ss-accent);">Tìm kiếm sản phẩm</router-link>
    </div>

    <div v-else>
      <div v-for="order in orders" :key="order.id" class="card mb-3 border rounded-3 overflow-hidden">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3 px-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold">{{ order.maHoaDon }}</span>
            <span class="text-muted small">{{ formatDate(order.ngayTao) }}</span>
          </div>
          <span class="badge rounded-pill px-3 py-1" :class="getStatusBadgeClass(order.trangThai)">
            {{ order.trangThai }}
          </span>
        </div>
        <div class="card-body px-3 py-3">
          <div class="d-flex align-items-center">
            <div class="me-3 flex-shrink-0">
              <img :src="order.anhDaiDien || 'https://placehold.co/70x70'" class="border rounded" width="70" height="70" style="object-fit: cover;">
            </div>
            <div class="flex-grow-1 min-w-0">
              <h6 class="mb-1 text-dark fw-bold text-truncate">{{ order.sanPhamDaiDien || 'Sản phẩm' }}</h6>
              <div class="text-muted small" v-if="order.soLuongSanPham > 1">
                + {{ order.soLuongSanPham - 1 }} sản phẩm khác
              </div>
            </div>
            <div class="text-end ms-3 flex-shrink-0">
              <div class="text-muted small mb-1">Tổng tiền</div>
              <div class="fw-bold fs-6" style="color: var(--ss-accent);">{{ formatCurrency(order.tongTien) }}</div>
            </div>
          </div>
        </div>
        <div class="card-footer bg-white border-top d-flex justify-content-end py-2 px-3">
          <router-link :to="'/client/account/orders/' + order.id" class="btn btn-sm text-white px-4" style="background-color: var(--ss-accent);">
            Xem chi tiết
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';

const { customer } = useClientAuth();
const orders = ref([]);
const loading = ref(true);

const fetchOrders = async () => {
  try {
    const res = await apiClient.get('/api/client/orders', { params: { customerId: customer.value?.id } });
    orders.value = res.data;
  } catch (error) {
    console.error("Failed to fetch orders", error);
  } finally {
    loading.value = false;
  }
};

const getStatusBadgeClass = (status) => {
  if (!status) return 'bg-secondary text-white';
  const s = status.toLowerCase();
  if (s.includes('hoàn thành')) return 'bg-success text-white';
  if (s.includes('đang giao') || s.includes('vận chuyển')) return 'bg-primary text-white';
  if (s.includes('chờ giao')) return 'bg-info text-white';
  if (s.includes('chờ xác nhận')) return 'bg-warning text-dark';
  if (s.includes('hủy') || s.includes('thất bại')) return 'bg-danger text-white';
  return 'bg-secondary text-white';
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const formatCurrency = (value) => {
  if (!value) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

onMounted(fetchOrders);
</script>
