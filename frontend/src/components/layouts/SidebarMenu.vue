<template>
  <aside
    class="sidebar bg-white border-end d-flex flex-column position-fixed h-100 ss-sidebar"
    style="width: 280px; z-index: 1000"
  >
    <!-- Logo (GIỮ NGUYÊN CHỖ LOGO) -->
    <div
      class="p-4 text-center border-bottom"
      style="border-color: var(--ss-border) !important"
    >
      <img
        src="@/assets/images/logo/Logo_SevenStrike.png"
        alt="SevenStrike"
        class="img-fluid"
        style="max-height: 80px"
      />
    </div>

    <nav class="nav flex-column px-3 py-3 gap-1 overflow-y-auto flex-grow-1">
      <!-- Thống kê -->
      <RouterLink class="ss-nav-link" to="/admin/dashboard">
        <span class="material-icons me-3">grid_view</span>
        Thống kê
      </RouterLink>

      <!-- Bán hàng tại quầy -->
      <RouterLink class="ss-nav-link" to="/admin/pos">
        <span class="material-icons me-3">shopping_cart</span>
        Bán hàng tại quầy
      </RouterLink>

      <!-- Hóa đơn -->
      <RouterLink class="ss-nav-link" to="/admin/hoa-don">
        <span class="material-icons me-3">receipt_long</span>
        Hóa đơn
      </RouterLink>

      <!-- Giảm giá -->
      <div class="ss-nav-group">
        <button class="ss-nav-toggle" @click="toggle('discount')">
          <div class="d-flex align-items-center">
            <span class="material-icons me-3">local_offer</span>
            Giảm giá
          </div>
          <span
            class="material-icons ss-expand"
            :class="{ open: openGroup.discount }"
            >expand_more</span
          >
        </button>

        <div v-show="openGroup.discount" class="ss-submenu">
          <RouterLink class="ss-sub-link" to="/admin/giam-gia/phieu">
            Phiếu giảm giá
          </RouterLink>
          <RouterLink class="ss-sub-link" to="/admin/giam-gia/dot">
            Đợt giảm giá
          </RouterLink>
        </div>
      </div>

      <!-- Quản lý sản phẩm -->
      <div class="ss-nav-group">
        <button class="ss-nav-toggle" @click="toggle('product')">
          <div class="d-flex align-items-center">
            <span class="material-icons me-3">inventory_2</span>
            Quản lý sản phẩm
          </div>
          <span
            class="material-icons ss-expand"
            :class="{ open: openGroup.product }"
            >expand_more</span
          >
        </button>

        <div v-show="openGroup.product" class="ss-submenu">
          <!-- Sản phẩm -->
          <RouterLink class="ss-sub-link" to="/admin/san-pham">
            Sản phẩm
          </RouterLink>

          <!-- ✅ NEW: Chi tiết sản phẩm -->
          <RouterLink class="ss-sub-link" to="/admin/chi-tiet-san-pham">
            Chi tiết sản phẩm
          </RouterLink>

          <!-- Thuộc tính (phần riêng) -->
          <div class="ss-subtitle">Thuộc tính</div>

          <RouterLink class="ss-sub-link" to="/admin/xuat-xu"
            >Xuất xứ</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/thuong-hieu"
            >Thương hiệu</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/vi-tri-thi-dau"
            >Vị trí thi đấu</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/phong-cach-choi"
            >Phong cách chơi</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/co-giay"
            >Cổ giày</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/chat-lieu"
            >Chất liệu</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/mau-sac"
            >Màu sắc</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/kich-thuoc"
            >Kích thước</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/form-chan"
            >Form chân</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/loai-san"
            >Loại sân</RouterLink
          >
        </div>
      </div>

      <!-- Quản lý tài khoản -->
      <div class="ss-nav-group">
        <button class="ss-nav-toggle" @click="toggle('account')">
          <div class="d-flex align-items-center">
            <span class="material-icons me-3">group</span>
            Quản lý tài khoản
          </div>
          <span
            class="material-icons ss-expand"
            :class="{ open: openGroup.account }"
            >expand_more</span
          >
        </button>

        <div v-show="openGroup.account" class="ss-submenu">
          <!-- ✅ CHỈ ĐỔI LINK để trỏ sang màn mới -->
          <RouterLink class="ss-sub-link" to="/admin/tai-khoan/khach-hang"
            >Khách hàng</RouterLink
          >
          <RouterLink class="ss-sub-link" to="/admin/tai-khoan/nhan-vien"
            >Nhân viên</RouterLink
          >
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { reactive } from "vue";
import { RouterLink } from "vue-router";

const openGroup = reactive({
  discount: false,
  product: true,
  account: false,
});

function toggle(key) {
  openGroup[key] = !openGroup[key];
}
</script>

<style scoped>
.ss-sidebar {
  box-shadow: 14px 0 28px -12px rgba(0, 0, 0, 0.18);
}

.ss-nav-link {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 600;
  transition: all 0.2s ease;
}

.ss-nav-link:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ff4d4f;
}

.ss-nav-link.router-link-active {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.22);
}

.ss-nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ss-nav-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: #6b7280;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ss-nav-toggle:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ff4d4f;
}

.ss-expand {
  transition: transform 0.2s ease;
}
.ss-expand.open {
  transform: rotate(180deg);
}

.ss-submenu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 44px;
  padding-bottom: 6px;
}

.ss-sub-link {
  display: flex;
  padding: 10px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.ss-sub-link:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ff4d4f;
}

.ss-sub-link.router-link-active {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.22);
}

.ss-subtitle {
  margin-top: 6px;
  margin-bottom: 2px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #9ca3af;
  text-transform: uppercase;
}
</style>
