<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="bg-light py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><router-link to="/client" class="text-decoration-none">Trang chủ</router-link></li>
            <li class="breadcrumb-item active">Sản phẩm</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">
      <!-- Filter Bar -->
      <div class="d-flex flex-wrap align-items-center gap-2 mb-4">
        <!-- Search -->
        <div class="input-group" style="max-width: 280px;">
          <input
            type="text"
            class="form-control form-control-sm rounded-start-pill border-end-0"
            placeholder="Tìm sản phẩm..."
            v-model="filters.search"
          >
          <span class="input-group-text bg-white rounded-end-pill border-start-0">
            <i class="bi bi-search text-muted" style="font-size: 13px;"></i>
          </span>
        </div>

        <!-- Brand Pills -->
        <div class="d-flex flex-wrap gap-1">
          <button
            class="btn btn-sm rounded-pill px-3"
            :class="filters.brand === null ? 'btn-dark' : 'btn-outline-secondary'"
            @click="filters.brand = null"
          >
            Tất cả
          </button>
          <button
            v-for="brand in uniqueBrands"
            :key="brand"
            class="btn btn-sm rounded-pill px-3"
            :class="filters.brand === brand ? 'btn-dark' : 'btn-outline-secondary'"
            @click="filters.brand = brand"
          >
            {{ brand }}
          </button>
        </div>

        <!-- Divider -->
        <div class="vr mx-2 d-none d-md-block" style="height: 28px; opacity: 0.3;"></div>

        <!-- Price Range Filter -->
        <div class="d-flex align-items-center gap-2">
          <span class="text-muted small text-nowrap">Giá:</span>
          <input
            type="number"
            class="form-control form-control-sm rounded-pill text-center"
            style="width: 110px; font-size: 12px;"
            placeholder="Từ"
            v-model.number="filters.priceMin"
            min="0"
          >
          <span class="text-muted">—</span>
          <input
            type="number"
            class="form-control form-control-sm rounded-pill text-center"
            style="width: 110px; font-size: 12px;"
            placeholder="Đến"
            v-model.number="filters.priceMax"
            min="0"
          >
        </div>

        <!-- Divider -->
        <div class="vr mx-2 d-none d-md-block" style="height: 28px; opacity: 0.3;"></div>

        <!-- Price Sort -->
        <div class="ms-auto">
          <select class="form-select form-select-sm rounded-pill" style="width: auto;" v-model="sortBy">
            <option value="default">Sắp xếp</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="nameAsc">Tên A-Z</option>
          </select>
        </div>
      </div>

      <!-- Results Count -->
      <p class="text-muted small mb-3" v-if="!loading">
        Hiển thị <strong>{{ filteredProducts.length }}</strong> sản phẩm
      </p>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger rounded-3 border-0 shadow-sm">
        {{ error }}
      </div>

      <!-- Empty -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
        <div class="text-muted fs-1 mb-3"><i class="bi bi-inbox"></i></div>
        <p class="text-muted">Không tìm thấy sản phẩm phù hợp.</p>
        <button class="btn btn-outline-danger btn-sm rounded-pill" @click="resetFilters">Xóa bộ lọc</button>
      </div>

      <!-- Product Grid -->
      <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
        <div v-for="product in filteredProducts" :key="product.id" class="col">
          <div class="card h-100 border-0 product-card shadow-sm rounded-3" @click="goToDetail(product.id)">
            <div class="position-relative overflow-hidden p-2 bg-white rounded-top-3">
              <div class="ratio ratio-1x1">
                <img
                  :src="product.anhDaiDien || '/placeholder-shoe.png'"
                  class="object-fit-contain"
                  :alt="product.tenSanPham"
                  @error="e => e.target.src = '/placeholder-shoe.png'"
                >
              </div>
              <div class="product-action position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0">
                <button class="btn btn-dark btn-sm rounded-circle shadow" title="Xem nhanh">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm rounded-circle shadow" title="Thêm vào giỏ">
                  <i class="bi bi-cart-plus"></i>
                </button>
              </div>
            </div>
            <div class="card-body d-flex flex-column pt-2 text-center">
              <small class="text-secondary text-uppercase mb-1" style="font-size: 0.7rem;">{{ product.tenThuongHieu }}</small>
              <h6 class="card-title fw-bold text-dark text-truncate mb-2" :title="product.tenSanPham" style="font-size: 0.9rem;">
                {{ product.tenSanPham }}
              </h6>
              <div class="mt-auto fw-bold text-danger" style="font-size: 0.95rem;">
                {{ formatPrice(product.giaThapNhat) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/services/apiClient';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();
const route = useRoute();

const filters = reactive({
  search: '',
  brand: null,
  priceMin: null,
  priceMax: null,
});
const sortBy = ref('default');

// Apply search query from URL (?q=...)
watch(() => route.query.q, (q) => {
  if (q) filters.search = q;
}, { immediate: true });

const fetchProducts = async () => {
  try {
    const res = await apiClient.get('/api/client/products');
    const d = res.data;
    if (Array.isArray(d)) products.value = d;
    else if (d?.content) products.value = d.content;
    else if (d?.data) products.value = d.data;
    else products.value = [];
  } catch (err) {
    error.value = "Không thể tải danh sách sản phẩm.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const uniqueBrands = computed(() => {
  return [...new Set(products.value.map(p => p.tenThuongHieu).filter(Boolean))];
});

const filteredProducts = computed(() => {
  let result = [...products.value];

  if (filters.search) {
    const k = filters.search.toLowerCase();
    result = result.filter(p => p.tenSanPham.toLowerCase().includes(k));
  }

  if (filters.brand) {
    result = result.filter(p => p.tenThuongHieu === filters.brand);
  }

  if (filters.priceMin != null && filters.priceMin !== '') {
    result = result.filter(p => p.giaThapNhat >= filters.priceMin);
  }
  if (filters.priceMax != null && filters.priceMax !== '') {
    result = result.filter(p => p.giaThapNhat <= filters.priceMax);
  }

  if (sortBy.value === 'priceAsc') {
    result.sort((a, b) => a.giaThapNhat - b.giaThapNhat);
  } else if (sortBy.value === 'priceDesc') {
    result.sort((a, b) => b.giaThapNhat - a.giaThapNhat);
  } else if (sortBy.value === 'nameAsc') {
    result.sort((a, b) => a.tenSanPham.localeCompare(b.tenSanPham));
  }

  return result;
});

const resetFilters = () => {
  filters.search = '';
  filters.brand = null;
  filters.priceMin = null;
  filters.priceMax = null;
  sortBy.value = 'default';
};

const goToDetail = (id) => {
  router.push({ name: 'client-product-detail', params: { id } });
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

onMounted(fetchProducts);
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}
.product-card:hover .product-action {
  opacity: 1 !important;
}
.product-action {
  transition: opacity 0.3s ease;
}
.object-fit-contain {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
</style>
