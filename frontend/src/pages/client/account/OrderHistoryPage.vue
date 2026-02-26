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
      <div v-for="order in paginatedOrders" :key="order.id" class="card mb-3 border rounded-3 overflow-hidden">
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

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-3">
        <nav aria-label="Phân trang đơn hàng">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link rounded-start-pill" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                <i class="bi bi-chevron-left" style="font-size:11px;"></i>
              </button>
            </li>
            <li v-for="(p, idx) in pageRange" :key="idx" class="page-item"
              :class="{ active: p === currentPage, disabled: p === '...' }">
              <button class="page-link" @click="goToPage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link rounded-end-pill" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                <i class="bi bi-chevron-right" style="font-size:11px;"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';

const { customer } = useClientAuth();
const orders = ref([]);
const loading = ref(true);

// ── Pagination ──
const PAGE_SIZE = 5;
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(orders.value.length / PAGE_SIZE)));
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return orders.value.slice(start, start + PAGE_SIZE);
});
const pageRange = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});
const goToPage = (p) => {
  if (typeof p !== 'number') return;
  currentPage.value = p;
};

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
  if (s.includes('đã giao')) return 'bg-info text-white';
  if (s.includes('đang') || s.includes('vận chuyển')) return 'bg-primary text-white';
  if (s.includes('chờ giao')) return 'bg-warning text-dark';
  if (s.includes('chờ xác nhận')) return 'bg-secondary text-white';
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

<style scoped>
.pagination .page-link {
  color: #333;
  border-color: #dee2e6;
  min-width: 36px;
  text-align: center;
  font-size: 0.85rem;
}
.pagination .page-item.active .page-link {
  background-color: var(--ss-accent, #e53935);
  border-color: var(--ss-accent, #e53935);
  color: #fff;
}
.pagination .page-link:hover:not(:disabled) {
  background-color: #fff5f5;
  border-color: var(--ss-accent, #e53935);
  color: var(--ss-accent, #e53935);
}
.pagination .page-item.disabled .page-link { color: #aaa; }
</style>
