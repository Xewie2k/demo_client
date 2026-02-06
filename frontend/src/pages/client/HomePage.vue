<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <section class="hero-banner mb-5 rounded-4 overflow-hidden shadow-sm position-relative">
       <img src="@/assets/images/banner/banner.png" 
            alt="Hero Banner" 
            class="w-100 object-fit-cover" 
            style="height: 400px; min-height: 300px;"
       >
       <div class="position-absolute top-50 start-0 translate-middle-y p-5 text-white" style="background: linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%); width: 100%; height: 100%; display: flex; align-items: center;">
          <div class="container">
             <h1 class="display-4 fw-bold mb-3">BƯỚC CHẠY VƯƠN XA</h1>
             <p class="lead mb-4">Khám phá bộ sưu tập giày bóng đá mới nhất 2026.</p>
             <button class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow">MUA NGAY</button>
          </div>
       </div>
    </section>

    <div class="container-fluid px-0">
       <div class="row g-4">
      <!-- Sidebar Filters -->
      <div class="col-lg-3 col-xl-2">
        <div class="ss-card p-3 sticky-top bg-white rounded-3 border" style="top: 100px; z-index: 100">
          <h6 class="fw-bold mb-3 d-flex align-items-center justify-content-between">
             <span>BỘ LỌC TÌM KIẾM</span>
             <i class="bi bi-funnel-fill text-danger"></i>
          </h6>
          
          <!-- Search -->
          <div class="mb-3">
             <label class="form-label small fw-bold text-secondary">Từ khóa</label>
             <input type="text" class="form-control form-control-sm bg-light border-0" placeholder="Tên sản phẩm..." v-model="filters.search">
          </div>

          <!-- Price Range -->
          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary">Khoảng giá</label>
            <div class="row g-2">
               <div class="col-6">
                  <input type="number" class="form-control form-control-sm bg-light border-0" placeholder="Từ" v-model.number="filters.minPrice">
               </div>
               <div class="col-6">
                  <input type="number" class="form-control form-control-sm bg-light border-0" placeholder="Đến" v-model.number="filters.maxPrice">
               </div>
            </div>
          </div>

          <!-- Brand Filter -->
          <div class="mb-3" v-if="uniqueBrands.length > 0">
             <label class="form-label small fw-bold text-secondary">Thương hiệu</label>
             <div class="d-flex flex-column gap-1" style="max-height: 200px; overflow-y: auto;">
                <div class="form-check" v-for="brand in uniqueBrands" :key="brand">
                   <input class="form-check-input" type="checkbox" :value="brand" :id="'brand-'+brand" v-model="filters.brands">
                   <label class="form-check-label small" :for="'brand-'+brand">{{ brand }}</label>
                </div>
             </div>
          </div>
          
           <!-- Reset Button -->
           <button class="btn btn-sm btn-outline-secondary w-100" @click="resetFilters" v-if="hasActiveFilters">
              Xóa bộ lọc
           </button>
        </div>
      </div>

      <!-- Product List -->
      <div class="col-lg-9 col-xl-10">
         <!-- Header / Sorting -->
         <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold m-0 border-start border-4 border-danger ps-2">SẢN PHẨM MỚI</h5>
            <div class="d-flex align-items-center gap-2">
               <span class="small text-secondary text-nowrap">Sắp xếp:</span>
               <select class="form-select form-select-sm w-auto border-0 bg-light fw-bold" v-model="sortBy">
                  <option value="default">Mặc định</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="nameAsc">Tên A-Z</option>
               </select>
            </div>
         </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger rounded-3 border-0 shadow-sm">
          {{ error }}
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
          <div class="text-muted fs-1 mb-3"><i class="bi bi-inbox"></i></div>
          <p class="text-muted">Không tìm thấy sản phẩm phù hợp.</p>
          <button class="btn btn-outline-danger btn-sm" @click="resetFilters">Xóa bộ lọc</button>
        </div>

        <!-- 4 Columns Grid -->
        <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
          <div v-for="product in filteredProducts" :key="product.id" class="col">
            <div class="card h-100 ss-card border-0 product-card shadow-sm" @click="goToDetail(product.id)">
              <!-- Image -->
              <div class="position-relative overflow-hidden p-2 bg-white">
                <div class="ratio ratio-1x1">
                    <img 
                      :src="product.anhDaiDien || '/placeholder-shoe.png'" 
                      class="object-fit-contain" 
                      :alt="product.tenSanPham"
                      @error="e => e.target.src = '/placeholder-shoe.png'"
                    >
                </div>
                <!-- Badge -->
                <div class="position-absolute top-0 start-0 m-2 badge bg-danger" v-if="false">New</div> <!-- Placeholder for new/sale -->
                
                <!-- Hover Action -->
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
                <small class="text-secondary text-uppercase mb-1" style="font-size: 0.75rem;">{{ product.tenThuongHieu }}</small>
                <h6 class="card-title fw-bold text-dark text-truncate mb-2" :title="product.tenSanPham" style="font-size: 0.95rem;">
                  {{ product.tenSanPham }}
                </h6>
                
                <div class="mt-auto">
                   <div class="fw-bold text-danger fs-6">
                      {{ formatPrice(product.giaThapNhat) }} 
                   </div>
                   <div v-if="product.giaThapNhat !== product.giaCaoNhat" class="small text-muted text-decoration-line-through">
                      <!-- Optional: Show old price if available, here just creating space -->
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

const filters = reactive({
    search: '',
    minPrice: null,
    maxPrice: null,
    brands: []
});

const sortBy = ref('default');

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

const hasActiveFilters = computed(() => {
    return filters.search || filters.minPrice || filters.maxPrice || filters.brands.length > 0;
});

const resetFilters = () => {
    filters.search = '';
    filters.minPrice = null;
    filters.maxPrice = null;
    filters.brands = [];
};

const filteredProducts = computed(() => {
    let result = [...products.value];

    if (filters.search) {
        const k = filters.search.toLowerCase();
        result = result.filter(p => p.tenSanPham.toLowerCase().includes(k));
    }

    if (filters.brands.length > 0) {
        result = result.filter(p => filters.brands.includes(p.tenThuongHieu));
    }

    if (filters.minPrice !== null && filters.minPrice !== '') {
        result = result.filter(p => p.giaCaoNhat >= filters.minPrice);
    }
    if (filters.maxPrice !== null && filters.maxPrice !== '') {
        result = result.filter(p => p.giaThapNhat <= filters.maxPrice);
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
.hero-banner {
  height: 400px;
}

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

.object-fit-cover {
    object-fit: cover;
}
</style>
