<template>
  <div class="bg-white p-4 rounded-3 shadow-sm h-100">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h5 class="fw-bold m-0">Phiếu giảm giá của tôi</h5>
      <div class="text-muted small">Quản lý phiếu giảm giá</div>
    </div>

    <!-- Tab filter -->
    <div class="mb-4">
      <div class="btn-group" role="group">
        <button v-for="tab in tabs" :key="tab.key" type="button"
          class="btn btn-sm" :class="activeTab === tab.key ? 'text-white' : 'btn-outline-secondary'"
          :style="activeTab === tab.key ? 'background-color: var(--ss-accent); border-color: var(--ss-accent);' : ''"
          @click="activeTab = tab.key">
          {{ tab.label }}
          <span v-if="getCount(tab.key) > 0" class="badge bg-white ms-1" :style="activeTab === tab.key ? 'color: var(--ss-accent);' : 'color: #6c757d;'">
            {{ getCount(tab.key) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" style="color: var(--ss-accent);" role="status"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredCoupons.length === 0" class="text-center py-5">
      <div class="mb-3">
        <i class="bi bi-ticket-perforated text-muted" style="font-size: 3rem;"></i>
      </div>
      <p class="text-muted">Chưa có phiếu giảm giá nào</p>
      <router-link to="/client/products" class="btn text-white" style="background-color: var(--ss-accent);">Mua sắm ngay</router-link>
    </div>

    <!-- Coupon list -->
    <div v-else class="d-flex flex-column gap-3">
      <div v-for="coupon in paginatedCoupons" :key="coupon.id + '-' + coupon.nguon"
        class="coupon-card d-flex border rounded-3 overflow-hidden"
        :class="{ 'opacity-60': coupon.trangThaiHienThi === 'used' || coupon.trangThaiHienThi === 'expired' }">

        <!-- Left: discount badge -->
        <div class="coupon-left d-flex flex-column align-items-center justify-content-center text-white text-center px-3"
          :style="{ background: getDiscountBg(coupon.trangThaiHienThi) }" style="min-width: 120px;">
          <div class="fw-bold" style="font-size: 1.5rem;">
            {{ formatDiscount(coupon) }}
          </div>
          <div class="small mt-1" v-if="coupon.loaiPhieuGiamGia && coupon.soTienGiamToiDa">
            Tối đa {{ formatShortCurrency(coupon.soTienGiamToiDa) }}
          </div>
        </div>

        <!-- Right: details -->
        <div class="flex-grow-1 p-3 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <h6 class="fw-bold mb-0">{{ coupon.tenPhieuGiamGia }}</h6>
              <span class="badge rounded-pill" :class="getStatusClass(coupon.trangThaiHienThi)">
                {{ getStatusLabel(coupon.trangThaiHienThi) }}
              </span>
            </div>
            <div class="d-flex align-items-center gap-2 mt-1">
              <span class="badge bg-light text-dark border" style="font-size: 0.7rem;">
                <i class="bi bi-upc me-1"></i>{{ coupon.maPhieuGiamGia }}
              </span>
              <span class="badge rounded-pill" :class="coupon.nguon === 'personal' ? 'bg-info text-white' : 'bg-light text-dark border'">
                <i :class="coupon.nguon === 'personal' ? 'bi bi-gift' : 'bi bi-globe'" class="me-1"></i>
                {{ coupon.nguon === 'personal' ? 'Cá nhân' : 'Công khai' }}
              </span>
            </div>
          </div>
          <div class="d-flex align-items-center justify-content-between mt-2">
            <div class="text-muted small">
              <span v-if="coupon.hoaDonToiThieu">Đơn tối thiểu: <strong>{{ formatCurrency(coupon.hoaDonToiThieu) }}</strong></span>
              <span v-else>Không yêu cầu đơn tối thiểu</span>
            </div>
            <div class="text-muted small">
              <i class="bi bi-calendar3 me-1"></i>
              <span v-if="coupon.trangThaiHienThi === 'upcoming'">Bắt đầu: {{ formatDate(coupon.ngayBatDau) }}</span>
              <span v-else>HSD: {{ formatDate(coupon.ngayKetThuc) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-3">
        <nav aria-label="Phân trang phiếu giảm giá">
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
import { ref, computed, watch, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';

const { customer } = useClientAuth();
const coupons = ref([]);
const loading = ref(true);
const activeTab = ref('all');

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'personal', label: 'Của tôi' },
  { key: 'public', label: 'Công khai' },
  { key: 'used', label: 'Đã sử dụng' },
];

const filteredCoupons = computed(() => {
  if (activeTab.value === 'all') return coupons.value;
  if (activeTab.value === 'personal') return coupons.value.filter(c => c.nguon === 'personal');
  if (activeTab.value === 'public') return coupons.value.filter(c => c.nguon === 'public');
  if (activeTab.value === 'used') return coupons.value.filter(c => c.trangThaiHienThi === 'used');
  return coupons.value;
});

// ── Pagination ──
const PAGE_SIZE = 6;
const currentPage = ref(1);
watch(filteredCoupons, () => { currentPage.value = 1; });
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCoupons.value.length / PAGE_SIZE)));
const paginatedCoupons = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredCoupons.value.slice(start, start + PAGE_SIZE);
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
const goToPage = (p) => { if (typeof p === 'number') currentPage.value = p; };

const getCount = (key) => {
  if (key === 'all') return coupons.value.length;
  if (key === 'personal') return coupons.value.filter(c => c.nguon === 'personal').length;
  if (key === 'public') return coupons.value.filter(c => c.nguon === 'public').length;
  if (key === 'used') return coupons.value.filter(c => c.trangThaiHienThi === 'used').length;
  return 0;
};

const fetchCoupons = async () => {
  try {
    const res = await apiClient.get('/api/client/account/coupons', {
      params: { customerId: customer.value?.id }
    });
    coupons.value = res.data;
  } catch (error) {
    console.error('Failed to fetch coupons', error);
  } finally {
    loading.value = false;
  }
};

const formatDiscount = (coupon) => {
  if (!coupon.loaiPhieuGiamGia) {
    // percentage
    return coupon.giaTriGiamGia + '%';
  }
  // fixed amount
  return formatShortCurrency(coupon.giaTriGiamGia);
};

const formatShortCurrency = (value) => {
  if (!value) return '0đ';
  const num = Number(value);
  if (num >= 1000000) return Math.round(num / 1000000) + 'tr';
  if (num >= 1000) return Math.round(num / 1000) + 'K';
  return num + 'đ';
};

const formatCurrency = (value) => {
  if (!value) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const getDiscountBg = (status) => {
  if (status === 'used' || status === 'expired') return '#adb5bd';
  if (status === 'upcoming') return '#ffc107';
  return 'var(--ss-accent)';
};

const getStatusClass = (status) => {
  if (status === 'available') return 'bg-success text-white';
  if (status === 'used') return 'bg-secondary text-white';
  if (status === 'expired') return 'bg-danger text-white';
  if (status === 'upcoming') return 'bg-warning text-dark';
  return 'bg-secondary text-white';
};

const getStatusLabel = (status) => {
  if (status === 'available') return 'Có thể dùng';
  if (status === 'used') return 'Đã dùng';
  if (status === 'expired') return 'Hết hạn';
  if (status === 'upcoming') return 'Sắp mở';
  return '';
};

onMounted(fetchCoupons);
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

.coupon-card {
  transition: all 0.2s ease;
}
.coupon-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}
.opacity-60 {
  opacity: 0.6;
}
.coupon-left {
  position: relative;
}
.coupon-left::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
}
</style>
