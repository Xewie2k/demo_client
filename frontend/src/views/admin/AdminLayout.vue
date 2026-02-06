<template>
  <div class="container-fluid p-0 d-flex min-vh-100 bg-light">
    <!-- Sidebar -->
    <aside class="sidebar position-fixed h-100 ss-sidebar" style="width: 280px; z-index: 1000">
      <!-- LOGO -->
      <div class="sidebar-logo text-center">
        <img
          src="@/assets/images/logo/Logo_SevenStrike.png"
          alt="Logo"
          class="img-fluid"
          style="max-height: 78px"
        />
      </div>

      <nav class="nav flex-column px-3 flex-grow-1 sidebar-nav">
        <!-- Thống kê -->
        <router-link class="nav-link nav-item text-secondary" to="/admin/dashboard">
          <span class="material-icons nav-ic">grid_view</span>
          <span class="nav-text">Thống kê</span>
        </router-link>

        <!-- Bán hàng tại quầy -->
        <router-link class="nav-link nav-item text-secondary" to="/admin/pos">
          <span class="material-icons nav-ic">shopping_cart</span>
          <span class="nav-text">Bán hàng tại quầy</span>
        </router-link>

        <!-- Hóa đơn -->
        <router-link class="nav-link nav-item text-secondary" to="/admin/hoa-don">
          <span class="material-icons nav-ic">receipt_long</span>
          <span class="nav-text">Hóa đơn</span>
        </router-link>

        <!-- Giảm giá (Dropdown) -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-link nav-item nav-toggle w-100"
            :class="isDiscountGroupActive ? 'sidebar-active-custom' : 'text-secondary'"
            @click="toggleDiscountMenu"
          >
            <span class="d-flex align-items-center gap-2 nav-left">
              <span class="material-icons nav-ic" :class="isDiscountGroupActive ? 'text-orange-red' : ''">
                local_offer
              </span>
              <span class="nav-text">Giảm giá</span>
            </span>

            <span class="material-icons nav-caret" :class="isDiscountGroupActive ? 'text-orange-red' : ''">
              {{ discountMenuOpen ? "expand_less" : "expand_more" }}
            </span>
          </button>

          <div v-show="discountMenuOpen" class="sub-menu">
            <router-link
              class="sub-link"
              :class="route.path === '/admin/giam-gia/phieu' ? 'sub-item-active fw-bold' : 'text-secondary'"
              to="/admin/giam-gia/phieu"
            >
              Phiếu giảm giá
            </router-link>

            <router-link
              class="sub-link"
              :class="route.path.startsWith('/admin/giam-gia/dot') ? 'sub-item-active fw-bold' : 'text-secondary'"
              to="/admin/giam-gia/dot"
            >
              Đợt giảm giá
            </router-link>
          </div>
        </div>

        <!-- Quản lý sản phẩm (Dropdown) -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-link nav-item nav-toggle w-100"
            :class="isProductGroupActive ? 'sidebar-active-custom' : 'text-secondary'"
            @click="toggleProductMenu"
          >
            <span class="d-flex align-items-center gap-2 nav-left">
              <span class="material-icons nav-ic" :class="isProductGroupActive ? 'text-orange-red' : ''">
                inventory_2
              </span>
              <span class="nav-text">Quản lý sản phẩm</span>
            </span>

            <span class="material-icons nav-caret" :class="isProductGroupActive ? 'text-orange-red' : ''">
              {{ productMenuOpen ? "expand_less" : "expand_more" }}
            </span>
          </button>

          <div v-show="productMenuOpen" class="sub-menu">
            <router-link
              class="sub-link"
              :class="route.path.startsWith('/admin/san-pham') ? 'sub-item-active fw-bold' : 'text-secondary'"
              to="/admin/san-pham"
            >
              Sản phẩm
            </router-link>

            <router-link
              class="sub-link"
              :class="route.path.startsWith('/admin/chi-tiet-san-pham') ? 'sub-item-active fw-bold' : 'text-secondary'"
              to="/admin/chi-tiet-san-pham"
            >
              Sản phẩm chi tiết
            </router-link>

            <!-- THUỘC TÍNH -->
            <button
              type="button"
              class="sub-link sub-toggle"
              :class="isAttrGroupActive ? 'sub-item-active fw-bold' : 'text-secondary'"
              @click="toggleAttrMenu"
            >
              <span>Thuộc tính</span>
              <span class="material-icons sub-caret">
                {{ attrMenuOpen ? "expand_less" : "expand_more" }}
              </span>
            </button>

            <div v-show="attrMenuOpen" class="sub-menu sub-menu-lv2">
              <router-link
                class="sub-link"
                :class="route.path === '/admin/xuat-xu' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/xuat-xu"
              >
                Xuất xứ
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/thuong-hieu' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/thuong-hieu"
              >
                Thương hiệu
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/vi-tri-thi-dau' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/vi-tri-thi-dau"
              >
                Vị trí thi đấu
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/phong-cach-choi' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/phong-cach-choi"
              >
                Phong cách chơi
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/co-giay' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/co-giay"
              >
                Cổ giày
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/chat-lieu' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/chat-lieu"
              >
                Chất liệu
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/mau-sac' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/mau-sac"
              >
                Màu sắc
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/kich-thuoc' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/kich-thuoc"
              >
                Kích thước
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/form-chan' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/form-chan"
              >
                Form chân
              </router-link>

              <router-link
                class="sub-link"
                :class="route.path === '/admin/loai-san' ? 'sub-item-active fw-bold' : 'text-secondary'"
                to="/admin/loai-san"
              >
                Loại sân
              </router-link>
            </div>
          </div>
        </div>

        <!-- Quản lý tài khoản (Dropdown) -->
        <div class="nav-group">
          <button
            type="button"
            class="nav-link nav-item nav-toggle w-100"
            :class="isAccountGroupActive ? 'sidebar-active-custom' : 'text-secondary'"
            @click="toggleAccountMenu"
          >
            <span class="d-flex align-items-center gap-2 nav-left">
              <span class="material-icons nav-ic" :class="isAccountGroupActive ? 'text-orange-red' : ''">
                group
              </span>
              <span class="nav-text">Quản lý tài khoản</span>
            </span>

            <span class="material-icons nav-caret" :class="isAccountGroupActive ? 'text-orange-red' : ''">
              {{ accountMenuOpen ? "expand_less" : "expand_more" }}
            </span>
          </button>

          <div v-show="accountMenuOpen" class="sub-menu">
            <!-- ✅ FIX: trỏ thẳng route mới + active startsWith -->
            <router-link
              class="sub-link"
              :class="route.path.startsWith('/admin/tai-khoan/khach-hang') ? 'sub-item-active fw-bold' : 'text-secondary'"
              to="/admin/tai-khoan/khach-hang"
            >
              Khách hàng
            </router-link>

            <router-link
              class="sub-link"
              :class="route.path.startsWith('/admin/tai-khoan/nhan-vien') ? 'sub-item-active fw-bold' : 'text-secondary'"
              to="/admin/tai-khoan/nhan-vien"
            >
              Nhân viên
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-grow-1" style="margin-left: 280px">
      <!-- ✅ PRIMEVUE TOAST (đặt trước header để không bị che) -->
      <Toast position="top-right" />

      <!-- Header -->
      <header class="navbar bg-white px-4 sticky-top ss-header" style="height: 64px">
        <div class="container-fluid justify-content-end gap-3">
          <span class="material-icons text-secondary cursor-pointer">dark_mode</span>
          <div class="d-flex align-items-center gap-2 cursor-pointer border-start ps-3">
            <span class="material-icons text-secondary">account_circle</span>
            <span class="material-icons small text-secondary">expand_more</span>
          </div>
        </div>
      </header>

      <div class="p-4">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

// ✅ dùng component global "Toast" đã register trong main.js

const route = useRoute();

// ===== PATH GROUPS =====
const productPaths = [
  "/admin/san-pham",
  "/admin/chi-tiet-san-pham",
  "/admin/xuat-xu",
  "/admin/thuong-hieu",
  "/admin/vi-tri-thi-dau",
  "/admin/phong-cach-choi",
  "/admin/co-giay",
  "/admin/chat-lieu",
  "/admin/mau-sac",
  "/admin/kich-thuoc",
  "/admin/form-chan",
  "/admin/loai-san",
];

const attrPaths = [
  "/admin/xuat-xu",
  "/admin/thuong-hieu",
  "/admin/vi-tri-thi-dau",
  "/admin/phong-cach-choi",
  "/admin/co-giay",
  "/admin/chat-lieu",
  "/admin/mau-sac",
  "/admin/kich-thuoc",
  "/admin/form-chan",
  "/admin/loai-san",
];

const discountPaths = ["/admin/giam-gia/phieu", "/admin/giam-gia/dot"];

// ✅ FIX: group tài khoản theo path mới
const accountPaths = ["/admin/tai-khoan/khach-hang", "/admin/tai-khoan/nhan-vien"];

const isProductGroupActive = computed(() => productPaths.some((p) => route.path.startsWith(p)));
const isAttrGroupActive = computed(() => attrPaths.some((p) => route.path.startsWith(p)));
const isDiscountGroupActive = computed(() => discountPaths.some((p) => route.path.startsWith(p)));
const isAccountGroupActive = computed(() => accountPaths.some((p) => route.path.startsWith(p)));

const productMenuOpen = ref(false);
const attrMenuOpen = ref(false);
const discountMenuOpen = ref(false);
const accountMenuOpen = ref(false);

// auto open when active route
watch(
  () => route.path,
  (p) => {
    if (productPaths.some((x) => p.startsWith(x))) productMenuOpen.value = true;
    if (attrPaths.some((x) => p.startsWith(x))) attrMenuOpen.value = true;
    if (discountPaths.some((x) => p.startsWith(x))) discountMenuOpen.value = true;

    // ✅ FIX: open nhóm tài khoản khi đi vào /admin/tai-khoan/...
    if (accountPaths.some((x) => p.startsWith(x))) accountMenuOpen.value = true;
  },
  { immediate: true }
);

const toggleProductMenu = () => {
  productMenuOpen.value = !productMenuOpen.value;
  if (!productMenuOpen.value) attrMenuOpen.value = false;
};
const toggleAttrMenu = () => (attrMenuOpen.value = !attrMenuOpen.value);

const toggleDiscountMenu = () => (discountMenuOpen.value = !discountMenuOpen.value);
const toggleAccountMenu = () => (accountMenuOpen.value = !accountMenuOpen.value);
</script>

<style scoped>
/* Logo */
.sidebar-logo {
  padding: 18px 10px 10px 10px;
}

.ss-sidebar {
  background: #fff;
  border-right: 1px solid var(--ss-border);
  box-shadow: 14px 0 28px -12px rgba(0, 0, 0, 0.18);
}

.ss-header {
  border-bottom: 1px solid var(--ss-border);
}

.sidebar-active-custom {
  background-color: #fff0f0 !important;
  color: #ff4d4f !important;
  border-radius: 10px;
  border: 1px solid var(--ss-border);
}

.sub-item-active {
  background-color: #ffe5e5 !important;
  color: #ff4d4f !important;
  border-radius: 8px;
  border: 1px solid var(--ss-border);
}

.text-orange-red {
  color: #ff4d4f !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Item */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px !important;
  border-radius: 10px;

  font-size: 13px;
  font-weight: 650;
  line-height: 1.2;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  transition: all 0.2s ease;
}
.nav-item:hover {
  background-color: #f8f9fa;
  color: #ff4d4f !important;
  border: 1px solid var(--ss-border);
}

.nav-ic {
  font-size: 18px;
  width: 22px;
  display: inline-flex;
  justify-content: center;
}

.nav-toggle {
  border: 0;
  background: transparent;
  text-align: left;
}

.nav-left {
  min-width: 0;
  flex: 1;
}

.nav-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-caret {
  font-size: 18px;
  flex: 0 0 auto;
}

/* Sub menu */
.sub-menu {
  padding-left: 36px;
  padding-right: 10px;
  margin-top: 6px;

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-link {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  text-decoration: none;

  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.15;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-link:hover {
  background-color: #f8f9fa;
  color: #ff4d4f !important;
  border: 1px solid var(--ss-border);
}

/* Thuộc tính: button giống router-link */
.sub-toggle {
  border: 0;
  background: transparent;
  text-align: left;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub-caret {
  font-size: 18px;
}

/* menu con cấp 2 */
.sub-menu-lv2 {
  padding-left: 14px;
  margin-top: 6px;

  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
