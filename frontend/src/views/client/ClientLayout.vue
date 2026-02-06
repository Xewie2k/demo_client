<template>
  <div class="client-layout d-flex flex-column min-vh-100 font-sans">
    <!-- Top Bar -->
    <div class="top-bar text-white py-2" style="background-color: var(--ss-accent);">
      <div class="container d-flex justify-content-between align-items-center">
        <span class="small fw-bold">Chào mừng bạn đến với SevenStrike - Đam mê sân cỏ!</span>
        <span class="small"><i class="bi bi-telephone-fill me-1"></i> Hotline: 1900 6789</span>
      </div>
    </div>

    <!-- Middle Header: Logo & Search -->
    <header class="bg-white py-3 position-relative" style="z-index: 1030;">
      <div class="container">
        <div class="row align-items-center">
          <!-- Left Spacer (or specific info) -->
          <div class="col-md-3 d-none d-md-block">
             <!-- Could put social icons here -->
          </div>

          <!-- Logo (Center) -->
          <div class="col-md-6 text-center">
            <router-link to="/client" class="text-decoration-none">
              <img
                src="@/assets/images/logo/Logo_SevenStrike.png"
                alt="SevenStrike"
                class="img-fluid"
                style="max-height: 80px;"
              />
              <div class="fw-bold text-dark fs-5 mt-1" style="letter-spacing: 2px;">SEVENSTRIKE</div>
            </router-link>
          </div>

          <!-- Search & Icons (Right) -->
          <div class="col-md-3 d-flex align-items-center justify-content-end gap-3">
             <div class="input-group input-group-sm d-none d-lg-flex" style="width: 200px;">
                <input type="text" class="form-control border-end-0 rounded-start-pill" placeholder="Tìm sản phẩm...">
                <button class="btn text-white rounded-end-pill" style="background-color: var(--ss-accent);" type="button">
                   <i class="bi bi-search"></i>
                </button>
             </div>
             
             <!-- Search Icon for mobile -->
             <button class="btn btn-link text-dark d-lg-none p-0">
                <i class="bi bi-search fs-4"></i>
             </button>

             <!-- Cart -->
             <router-link to="/client/cart" class="position-relative text-dark p-1">
                <i class="bi bi-cart3 fs-4"></i>
                <span
                  v-if="cartCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill border border-white"
                  style="background-color: var(--ss-accent); font-size: 0.6rem;"
                >
                  {{ cartCount }}
                </span>
             </router-link>
             
             <!-- User -->
             <div class="dropdown">
                 <div class="text-dark cursor-pointer p-1" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle fs-4"></i>
                 </div>
                 <ul class="dropdown-menu dropdown-menu-end border-0 shadow mt-2">
                    <li><h6 class="dropdown-header">Xin chào, Khách hàng</h6></li>
                    <li><router-link class="dropdown-item" to="/client/account/orders">Đơn mua</router-link></li>
                    <li><router-link class="dropdown-item" to="/client/account/profile">Tài khoản</router-link></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#">Đăng xuất</a></li>
                 </ul>
             </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Menu (Bottom of Header) -->
    <nav class="bg-white border-top border-bottom shadow-sm sticky-top">
       <div class="container">
          <ul class="nav justify-content-center fw-bold text-uppercase py-2">
             <li class="nav-item">
                <router-link to="/client" class="nav-link text-dark hover-accent" active-class="" exact-active-class="text-accent">Trang chủ</router-link>
             </li>
             <li class="nav-item">
                <router-link to="/client/products" class="nav-link text-dark hover-accent" active-class="text-accent">Sản phẩm</router-link>
             </li>
             <li class="nav-item">
                <router-link to="/client/about" class="nav-link text-dark hover-accent" active-class="text-accent">Giới thiệu</router-link>
             </li>
             <li class="nav-item">
                <router-link to="/client/news" class="nav-link text-dark hover-accent" active-class="text-accent">Tin tức</router-link>
             </li>
             <li class="nav-item">
                <router-link to="/client/contact" class="nav-link text-dark hover-accent" active-class="text-accent">Liên hệ</router-link>
             </li>
             <li class="nav-item">
                <router-link to="/client/tracking" class="nav-link text-dark hover-accent" active-class="text-accent">Tra cứu</router-link>
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
            <h5 class="fw-bold text-white mb-4">SEVENSTRIKE</h5>
            <p class="text-white-50 small mb-4">
              Giày thể thao chính hãng - giao nhanh. Chất lượng khẳng định thương hiệu.
            </p>
            <div class="d-flex gap-3">
               <a href="#" class="text-white"><i class="bi bi-facebook fs-5"></i></a>
               <a href="#" class="text-white"><i class="bi bi-instagram fs-5"></i></a>
               <a href="#" class="text-white"><i class="bi bi-tiktok fs-5"></i></a>
               <a href="#" class="text-white"><i class="bi bi-youtube fs-5"></i></a>
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

          <!-- Col 3: Kết nối / Policy -->
          <div class="col-lg-4 col-md-12">
             <h6 class="fw-bold text-uppercase mb-4">Chính sách</h6>
             <ul class="list-unstyled text-white-50 small">
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Chính sách bảo mật</a></li>
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Chính sách vận chuyển</a></li>
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Chính sách đổi trả</a></li>
                <li class="mb-2"><a href="#" class="text-white-50 text-decoration-none hover-white">Quy định sử dụng</a></li>
             </ul>
          </div>
        </div>
        
        <hr class="border-secondary my-5">
        
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
           <span class="small text-white-50">© 2026 SevenStrike. All rights reserved.</span>
           <div class="d-flex gap-2">
              <!-- Payment Icons Mockup -->
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCart } from '@/services/cart'; 

const route = useRoute();
const { cart } = useCart();
const cartCount = computed(() => cart.value.reduce((acc, item) => acc + item.quantity, 0));
</script>

<style scoped>
/* Colors */
.text-accent { color: var(--ss-accent) !important; }
.bg-accent { background-color: var(--ss-accent) !important; }

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
