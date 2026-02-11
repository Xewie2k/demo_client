<template>
  <div class="client-layout d-flex flex-column min-vh-100 font-sans">
    <!-- Top Bar with Marquee -->
    <div class="top-bar text-white py-1" style="background-color: var(--ss-accent); overflow: hidden;">
      <div class="container d-flex justify-content-between align-items-center">
        <div class="marquee-wrapper flex-grow-1 overflow-hidden me-3">
          <span class="marquee-text small fw-bold">
            Chào mừng bạn đến với SevenStrike &nbsp;·&nbsp; Đam mê sân cỏ! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Chào mừng bạn đến với SevenStrike &nbsp;·&nbsp; Đam mê sân cỏ! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>
    </div>

    <!-- Info Bar: Hotline + Store -->
    <div class="bg-white py-1 border-bottom">
      <div class="container d-flex align-items-center gap-4">
        <span class="small text-muted"><i class="bi bi-telephone-fill me-1"></i> Hotline: 1900 6789</span>
        <span class="small text-muted"><i class="bi bi-shop me-1"></i> Hệ thống cửa hàng</span>
      </div>
    </div>

    <!-- Header: Hotline Left | Logo Center | Search + Icons Right -->
    <header class="bg-white py-3 position-relative" style="z-index: 1030;">
      <div class="container">
        <div class="row align-items-center">
          <!-- Left spacer (hidden on mobile) -->
          <div class="col-md-3 d-none d-md-block"></div>

          <!-- Logo + Brand (Center) -->
          <div class="col-md-6 col-6">
            <router-link to="/client" class="text-decoration-none d-flex align-items-center justify-content-center gap-2">
              <img
                src="@/assets/images/logo/Logo_SevenStrike.png"
                alt="SevenStrike"
                class="img-fluid"
                style="max-height: 55px;"
              />
              <div>
                <div class="fw-bold text-dark" style="font-size: 18px; letter-spacing: 1px; line-height: 1.2;">SevenStrike</div>
                <div class="text-muted" style="font-size: 11px;">Giày bóng đá nam</div>
              </div>
            </router-link>
          </div>

          <!-- Search + Icons (Right) -->
          <div class="col-md-3 col-6 d-flex align-items-center justify-content-end gap-3">
            <!-- Search -->
            <div class="input-group d-none d-md-flex" style="max-width: 200px;">
              <input
                type="text"
                class="form-control form-control-sm rounded-start-pill border-end-0"
                placeholder="Tìm kiếm sản phẩm..."
                v-model="searchQuery"
                @keyup.enter="doSearch"
                style="font-size: 12px;"
              >
              <button
                class="btn btn-sm text-white rounded-end-pill px-2"
                style="background-color: var(--ss-accent);"
                type="button"
                @click="doSearch"
              >
                <i class="bi bi-search" style="font-size: 12px;"></i>
              </button>
            </div>

            <!-- Search Icon for mobile -->
            <button class="btn btn-link text-dark d-md-none p-0" @click="showMobileSearch = !showMobileSearch">
              <i class="bi bi-search" style="font-size: 20px;"></i>
            </button>

            <!-- Cart -->
            <router-link to="/client/cart" class="position-relative text-dark p-1">
              <i class="bi bi-cart3" style="font-size: 22px;"></i>
              <span
                v-if="cartCount > 0"
                class="position-absolute translate-middle badge rounded-pill border border-white"
                style="background-color: var(--ss-accent); font-size: 0.6rem; top: -2px; right: -12px;"
              >
                {{ cartCount }}
              </span>
            </router-link>

            <!-- User Dropdown -->
            <div class="dropdown">
              <div class="text-dark cursor-pointer p-1" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle" style="font-size: 22px;"></i>
              </div>
              <div class="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-2 py-3" style="min-width: 220px;">
                <div class="px-3 pb-2 mb-2 border-bottom">
                  <div class="fw-bold text-dark" style="font-size: 15px;">Nguyễn Văn A</div>
                  <div class="text-muted" style="font-size: 12px;">vana@example.com</div>
                  <div class="text-muted" style="font-size: 12px;">0123456788</div>
                </div>
                <router-link class="dropdown-item py-2" to="/client/account/profile">
                  <i class="bi bi-person me-2"></i>Thông tin cá nhân
                </router-link>
                <router-link class="dropdown-item py-2" to="/client/account/orders">
                  <i class="bi bi-bag me-2"></i>Đơn mua
                </router-link>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item py-2 text-danger" href="#">
                  <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Search Bar -->
        <div v-if="showMobileSearch" class="d-md-none mt-2">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control rounded-start-pill" placeholder="Tìm kiếm sản phẩm..." v-model="searchQuery" @keyup.enter="doSearch">
            <button class="btn btn-sm text-white rounded-end-pill px-3" style="background-color: var(--ss-accent);" @click="doSearch">Tìm</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Menu -->
    <nav class="bg-white border-bottom shadow-sm sticky-top">
      <div class="container">
        <ul class="nav justify-content-center py-2">
          <li class="nav-item">
            <router-link to="/client" class="nav-link nav-link-sm text-dark hover-accent" active-class="" exact-active-class="text-accent">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/client/products" class="nav-link nav-link-sm text-dark hover-accent" active-class="text-accent">Sản phẩm</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/client/about" class="nav-link nav-link-sm text-dark hover-accent" active-class="text-accent">Giới thiệu</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/client/news" class="nav-link nav-link-sm text-dark hover-accent" active-class="text-accent">Tin tức</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/client/contact" class="nav-link nav-link-sm text-dark hover-accent" active-class="text-accent">Liên hệ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/client/tracking" class="nav-link nav-link-sm text-dark hover-accent" active-class="text-accent">Tra cứu</router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow-1 bg-white">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-white pt-5 pb-3">
      <div class="container">
        <div class="row gy-5">
          <!-- Col 1: Brand -->
          <div class="col-lg-4 col-md-6">
            <h5 class="fw-bold text-white mb-3">SevenStrike</h5>
            <p class="text-white-50 small mb-4">
              Giày bóng đá nam chính hãng - giao nhanh
            </p>
            <div class="d-flex gap-3">
               <a href="#" class="text-white"><i class="bi bi-facebook fs-5"></i></a>
               <a href="#" class="text-white"><i class="bi bi-youtube fs-5"></i></a>
               <a href="#" class="text-white"><i class="bi bi-tiktok fs-5"></i></a>
               <a href="#" class="text-white"><i class="bi bi-instagram fs-5"></i></a>
            </div>
          </div>

          <!-- Col 2: Liên hệ -->
          <div class="col-lg-4 col-md-6">
             <h6 class="fw-bold text-uppercase mb-4">Liên hệ</h6>
             <ul class="list-unstyled text-white-50 small">
                <li class="mb-3 d-flex align-items-start gap-2">
                   <i class="bi bi-telephone-fill text-white"></i>
                   <span>Hotline: 1900 6750</span>
                </li>
                <li class="mb-3 d-flex align-items-start gap-2">
                   <i class="bi bi-envelope-fill text-white"></i>
                   <span>Email: support@sevenstrike.vn</span>
                </li>
                <li class="mb-3 d-flex align-items-start gap-2">
                   <i class="bi bi-geo-alt-fill text-white"></i>
                   <span>Số 1, Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</span>
                </li>
             </ul>
          </div>

          <!-- Col 3: Kết nối -->
          <div class="col-lg-4 col-md-12">
             <h6 class="fw-bold text-uppercase mb-4">Kết nối</h6>
             <ul class="list-unstyled text-white-50 small">
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Chính sách bảo mật</a></li>
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Chính sách vận chuyển</a></li>
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Chính sách đổi trả</a></li>
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Quy định sử dụng</a></li>
             </ul>
          </div>
        </div>

        <hr class="border-secondary my-4">

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
           <span class="small text-white-50">&copy; 2026 SevenStrike. All rights reserved.</span>
           <div class="d-flex gap-2">
              <i class="bi bi-credit-card text-white-50 fs-4"></i>
              <i class="bi bi-paypal text-white-50 fs-4"></i>
              <i class="bi bi-wallet2 text-white-50 fs-4"></i>
           </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCart } from '@/services/cart';

const router = useRouter();
const { cart } = useCart();
const cartCount = computed(() => cart.value.reduce((acc, item) => acc + item.quantity, 0));

const searchQuery = ref('');
const showMobileSearch = ref(false);

const doSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'client-products', query: { q: searchQuery.value.trim() } });
    showMobileSearch.value = false;
  }
};
</script>

<style scoped>
/* Colors */
.text-accent { color: var(--ss-accent) !important; }
.bg-accent { background-color: var(--ss-accent) !important; }

/* Marquee Animation */
.marquee-wrapper {
  white-space: nowrap;
}
.marquee-text {
  display: inline-block;
  animation: marquee 20s linear infinite;
}
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Nav Links - smaller text */
.nav-link-sm {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 14px;
}

/* Nav Hover */
.hover-accent {
  transition: color 0.2s;
}
.hover-accent:hover {
  color: var(--ss-accent) !important;
}

.hover-white:hover {
  color: #fff !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Input Group Styles */
.input-group .form-control:focus {
  box-shadow: none;
  border-color: #ced4da;
}
</style>
