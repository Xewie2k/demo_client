<template>
  <div class="home-page">
    <!-- Banner Carousel -->
    <section class="banner-carousel position-relative overflow-hidden" style="height: 420px;">
      <div
        v-for="(slide, index) in bannerSlides"
        :key="index"
        class="banner-slide position-absolute w-100 h-100"
        :class="{ active: currentSlide === index }"
      >
        <img :src="slide.image" :alt="slide.title" class="w-100 h-100 object-fit-cover">
        <div class="banner-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
          <div class="container">
            <h1 class="display-5 fw-bold text-white mb-2">{{ slide.title }}</h1>
            <p class="lead text-white-50 mb-4">{{ slide.subtitle }}</p>
            <router-link to="/client/products" class="btn btn-danger btn-lg rounded-pill px-5 fw-bold shadow">
              MUA NGAY
            </router-link>
          </div>
        </div>
      </div>

      <!-- Carousel Controls -->
      <button class="carousel-btn carousel-prev" @click="prevSlide">
        <i class="bi bi-chevron-left"></i>
      </button>
      <button class="carousel-btn carousel-next" @click="nextSlide">
        <i class="bi bi-chevron-right"></i>
      </button>

      <!-- Dots -->
      <div class="carousel-dots position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
        <button
          v-for="(_, index) in bannerSlides"
          :key="index"
          class="dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
        ></button>
      </div>
    </section>

    <!-- Mẫu giày mới về -->
    <section class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold m-0 border-start border-4 border-danger ps-3">MẪU GIÀY MỚI VỀ TRONG THÁNG</h5>
        <router-link to="/client/products" class="text-decoration-none small fw-bold" style="color: var(--ss-accent);">
          Xem tất cả <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="newProducts.length === 0" class="text-center py-4 text-muted">
        <i class="bi bi-inbox fs-1"></i>
        <p class="mt-2">Chưa có sản phẩm nào.</p>
      </div>

      <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
        <div v-for="product in newProducts" :key="product.id" class="col">
          <div class="card h-100 border-0 product-card rounded-3" @click="goToDetail(product.id)">
            <div class="position-relative overflow-hidden p-2 rounded-top-3" style="background-color:#f8f9fa;">
              <div class="ratio ratio-1x1">
                <img
                  :src="product.anhDaiDien || '/placeholder-shoe.png'"
                  class="object-fit-contain"
                  :alt="product.tenSanPham"
                  @error="e => e.target.src = '/placeholder-shoe.png'"
                >
              </div>
              <span class="position-absolute top-0 start-0 m-2 badge-new">Mới</span>
              <span v-if="product.phanTramGiam" class="position-absolute top-0 end-0 m-2 badge-discount" :class="discountBadgeClass(product.phanTramGiam)" :style="discountBadgeStyle(product.phanTramGiam)">-{{ product.phanTramGiam }}%</span>
              <div class="product-action position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0">
                <button class="btn btn-dark btn-sm rounded-circle shadow" title="Xem nhanh">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm rounded-circle shadow" title="Thêm vào giỏ" @click="quickAddToCart(product, $event)">
                  <i class="bi bi-cart-plus"></i>
                </button>
              </div>
            </div>
            <div class="card-body px-3 pt-2 pb-3 d-flex flex-column gap-1 text-center">
              <div class="text-muted fw-semibold" style="font-size:1.1rem;">
                <i class="bi bi-tag-fill me-1" style="color:var(--ss-accent);font-size:0.9rem;"></i>{{ product.maSanPham }}
              </div>
              <div>
                <div v-if="product.phanTramGiam" class="text-muted text-decoration-line-through" style="font-size:0.78rem; line-height:1.2;">{{ formatPrice(product.giaGocThapNhat) }}</div>
                <div class="fw-bold" style="font-size:1.1rem; color:var(--ss-accent); line-height:1.3;">{{ formatPrice(product.phanTramGiam ? product.giaSauGiamThapNhat : product.giaThapNhat) }}</div>
              </div>
              <div>
                <span v-if="product.hangCoSan" class="stock-badge stock-badge--in">Còn hàng</span>
                <span v-else class="stock-badge stock-badge--out">Hết hàng</span>
              </div>
              <div v-if="product.kichThuocCoSan && product.kichThuocCoSan.length" class="d-flex flex-wrap gap-1 justify-content-center">
                <span v-for="s in product.kichThuocCoSan" :key="s" class="size-chip">{{ s }}</span>
              </div>
              <h6 class="product-name text-dark mb-0 mt-1" style="font-size:0.83rem; line-height:1.4; font-weight:500;">
                {{ product.tenSanPham }}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mẫu giày bán chạy -->
    <section class="py-5" style="background-color: #f8f9fa;">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold m-0 border-start border-4 border-danger ps-3">MẪU GIÀY BÁN CHẠY TRONG THÁNG</h5>
          <router-link to="/client/products" class="text-decoration-none small fw-bold" style="color: var(--ss-accent);">
            Xem tất cả <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="bestSellingProducts.length === 0" class="text-center py-4 text-muted">
          <i class="bi bi-inbox fs-1"></i>
          <p class="mt-2">Chưa có sản phẩm nào.</p>
        </div>

        <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
          <div v-for="product in bestSellingProducts" :key="product.id" class="col">
            <div class="card h-100 border-0 product-card rounded-3" @click="goToDetail(product.id)">
              <div class="position-relative overflow-hidden p-2 rounded-top-3" style="background-color:#f8f9fa;">
                <div class="ratio ratio-1x1">
                  <img
                    :src="product.anhDaiDien || '/placeholder-shoe.png'"
                    class="object-fit-contain"
                    :alt="product.tenSanPham"
                    @error="e => e.target.src = '/placeholder-shoe.png'"
                  >
                </div>
                <span class="position-absolute top-0 start-0 m-2 badge-hot"><i class="bi bi-fire me-1"></i>Hot</span>
                <span v-if="product.phanTramGiam" class="position-absolute top-0 end-0 m-2 badge-discount" :class="discountBadgeClass(product.phanTramGiam)" :style="discountBadgeStyle(product.phanTramGiam)">-{{ product.phanTramGiam }}%</span>
                <div class="product-action position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0">
                  <button class="btn btn-dark btn-sm rounded-circle shadow" title="Xem nhanh">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-danger btn-sm rounded-circle shadow" title="Thêm vào giỏ" @click="quickAddToCart(product, $event)">
                    <i class="bi bi-cart-plus"></i>
                  </button>
                </div>
              </div>
              <div class="card-body px-3 pt-2 pb-3 d-flex flex-column gap-1 text-center">
                <div class="text-muted fw-semibold" style="font-size:1.1rem;">
                  <i class="bi bi-tag-fill me-1" style="color:var(--ss-accent);font-size:0.9rem;"></i>{{ product.maSanPham }}
                </div>
                <div>
                  <div v-if="product.phanTramGiam" class="text-muted text-decoration-line-through" style="font-size:0.78rem; line-height:1.2;">{{ formatPrice(product.giaGocThapNhat) }}</div>
                  <div class="fw-bold" style="font-size:1.1rem; color:var(--ss-accent); line-height:1.3;">{{ formatPrice(product.phanTramGiam ? product.giaSauGiamThapNhat : product.giaThapNhat) }}</div>
                </div>
                <div>
                  <span v-if="product.hangCoSan" class="stock-badge stock-badge--in">Còn hàng</span>
                  <span v-else class="stock-badge stock-badge--out">Hết hàng</span>
                </div>
                <div v-if="product.kichThuocCoSan && product.kichThuocCoSan.length" class="d-flex flex-wrap gap-1 justify-content-center">
                  <span v-for="s in product.kichThuocCoSan" :key="s" class="size-chip">{{ s }}</span>
                </div>
                <h6 class="product-name text-dark mb-0 mt-1" style="font-size:0.83rem; line-height:1.4; font-weight:500;">
                  {{ product.tenSanPham }}
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useCart } from '@/services/cart';
import Swal from 'sweetalert2';

const { addToCart } = useCart();

import banner1 from '@/assets/images/banner/banner.png';
import banner2 from '@/assets/images/banner/image.png';
import banner3 from '@/assets/images/banner/slider_2.webp';

const newProducts = ref([]);
const bestSellingProducts = ref([]);
const loading = ref(true);
const router = useRouter();

// Banner Carousel
const bannerSlides = [
  { image: banner1, title: 'BƯỚC CHẠY VƯƠN XA', subtitle: 'Khám phá bộ sưu tập giày bóng đá mới nhất 2026' },
  { image: banner2, title: 'CHẤT LƯỢNG ĐỈNH CAO', subtitle: 'Giày chính hãng - Giá tốt nhất thị trường' },
  { image: banner3, title: 'ĐAM MÊ SÂN CỎ', subtitle: 'Đồng hành cùng bạn trên mọi sân đấu' },
];

const currentSlide = ref(0);
let autoplayTimer = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % bannerSlides.length;
};
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + bannerSlides.length) % bannerSlides.length;
};
const goToSlide = (index) => {
  currentSlide.value = index;
};

const startAutoplay = () => {
  autoplayTimer = setInterval(nextSlide, 7000);
};
const stopAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer);
};

// Lấy hàng mới về (30 ngày gần đây) và sản phẩm bán chạy từ backend
const fetchHomeProducts = async () => {
  try {
    const [newRes, bestRes] = await Promise.all([
      apiClient.get('/api/client/products/new-arrivals'),
      apiClient.get('/api/client/products/best-selling'),
    ]);
    newProducts.value = Array.isArray(newRes.data) ? newRes.data : [];
    bestSellingProducts.value = Array.isArray(bestRes.data) ? bestRes.data : [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  router.push({ name: 'client-product-detail', params: { id } });
};

const discountBadgeClass = (pct) => {
  if (!pct) return '';
  if (pct > 70) return 'text-white';
  if (pct >= 50) return 'bg-warning text-dark';
  return 'bg-danger text-white';
};
const discountBadgeStyle = (pct) => pct > 70 ? 'background-color:#FF6B00;' : '';

const formatPrice = (value) => {
  if (value === null || value === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const quickAddToCart = (product, $event) => {
  $event.stopPropagation();
  const variants = product.variants || [];
  const inStock = variants.filter(v => v.soLuong > 0);

  if (inStock.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Hết hàng', text: 'Sản phẩm này hiện đã hết hàng.', timer: 2000, showConfirmButton: false });
    return;
  }

  if (inStock.length === 1) {
    addToCart(product, inStock[0], 1);
    Swal.fire({ icon: 'success', title: 'Đã thêm vào giỏ!', text: `${product.tenSanPham} - ${inStock[0].tenMauSac} / ${inStock[0].tenKichThuoc}`, timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
    return;
  }

  // Multiple variants → go to detail page
  router.push({ name: 'client-product-detail', params: { id: product.id } });
};

onMounted(() => {
  fetchHomeProducts();
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<style scoped>
/* Banner Carousel */
.banner-carousel {
  background-color: #111;
}

.banner-slide {
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}
.banner-slide.active {
  opacity: 1;
  z-index: 1;
}

.banner-overlay {
  background: linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 100%);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.carousel-btn:hover {
  background: rgba(255,255,255,0.4);
}
.carousel-prev { left: 16px; }
.carousel-next { right: 16px; }

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.dot.active {
  background: white;
}

/* ── Image Badges ── */
.badge-new {
  display: inline-block;
  background: #16a34a;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}
.badge-hot {
  display: inline-block;
  background: linear-gradient(135deg, #ff5722, #c62828);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(198,40,40,0.4);
  letter-spacing: 0.3px;
}
.badge-discount {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

/* Product Card */
.product-card {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
  border: 1px solid #c8c8c8 !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07) !important;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.13) !important;
  border-color: #aaa !important;
}
.product-card:hover .product-action {
  opacity: 1 !important;
}
.product-action {
  transition: opacity 0.3s ease;
}
.product-card .card-body { border-top: 2px solid #e0e0e0; }

/* Product name: 2 dòng max */
.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* Stock badge */
.stock-badge {
  display: inline-block;
  padding: 3px 11px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}
.stock-badge--in  { background: #e8f5e9; color: #2e7d32; }
.stock-badge--out { background: #f5f5f5; color: #9e9e9e; }

/* Size chip */
.size-chip {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.82rem;
  color: #444;
  background: #fff;
  font-weight: 500;
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
