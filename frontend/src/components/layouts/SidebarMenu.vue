<!-- File: src/components/layouts/SidebarMenu.vue -->
<template>
  <aside
    class="sidebar bg-white border-end d-flex flex-column position-fixed h-100 ss-sidebar"
    style="z-index: 1000"
  >
    <!-- Logo -->
    <div class="ss-logo-wrap text-center">
      <img
        src="@/assets/images/logo/Logo_SevenStrike.png"
        alt="SevenStrike"
        class="img-fluid ss-logo"
      />
    </div>

    <nav class="nav flex-column px-3 py-0 gap-1 flex-grow-1">
      <!-- Trang chủ: ADMIN + NHAN_VIEN -->
      <RouterLink class="ss-nav-link" to="/admin/trang-chu" title="Trang chủ">
        <span class="material-icons ss-ic">home</span>
        <span class="ss-nav-label">Trang chủ</span>
      </RouterLink>

      <!-- Thống kê: chỉ ADMIN -->
      <RouterLink v-if="isAdmin" class="ss-nav-link" to="/admin/dashboard" title="Thống kê">
        <span class="material-icons ss-ic">grid_view</span>
        <span class="ss-nav-label">Thống kê</span>
      </RouterLink>

      <!-- Bán hàng: ADMIN + NHAN_VIEN -->
      <RouterLink class="ss-nav-link" to="/admin/pos" title="Bán hàng">
        <span class="material-icons ss-ic">shopping_cart</span>
        <span class="ss-nav-label">Bán hàng</span>
      </RouterLink>

      <!-- Hóa đơn: ADMIN + NHAN_VIEN -->
      <RouterLink class="ss-nav-link" to="/admin/hoa-don" title="Quản lý hóa đơn">
        <span class="material-icons ss-ic">receipt_long</span>
        <span class="ss-nav-label">Quản lý hóa đơn</span>
      </RouterLink>

      <!-- Khách hàng:
           - NHAN_VIEN: hiển thị dạng item riêng
           - ADMIN: KHÔNG hiển thị (vì đã có trong Quản lý tài khoản) -->
      <RouterLink
        v-if="!isAdmin"
        class="ss-nav-link"
        to="/admin/tai-khoan/khach-hang"
        title="Khách hàng"
      >
        <span class="material-icons ss-ic">person</span>
        <span class="ss-nav-label">Khách hàng</span>
      </RouterLink>

      <!-- Các nhóm chỉ ADMIN -->
      <template v-if="isAdmin">
        <!-- Quản lý sản phẩm -->
        <div class="ss-nav-group">
          <button
            class="ss-nav-toggle"
            @click="toggle('product')"
            type="button"
            title="Quản lý sản phẩm"
          >
            <div class="ss-toggle-left">
              <span class="material-icons ss-ic">inventory_2</span>
              <span class="ss-nav-label">Quản lý sản phẩm</span>
            </div>
            <span class="material-icons ss-caret" :class="{ open: openGroup.product }">
              expand_more
            </span>
          </button>

          <div v-show="openGroup.product" class="ss-submenu">
            <RouterLink class="ss-sub-link" to="/admin/san-pham" title="Sản phẩm">
              <span class="ss-sub-label">Sản phẩm</span>
            </RouterLink>

            <RouterLink class="ss-sub-link" to="/admin/chi-tiet-san-pham" title="Biến thể sản phẩm">
              <span class="ss-sub-label">Biến thể sản phẩm</span>
            </RouterLink>
          </div>
        </div>

        <!-- Danh sách thuộc tính -->
        <div class="ss-nav-group">
          <button
            class="ss-nav-toggle"
            @click="toggle('attr')"
            type="button"
            title="Danh sách thuộc tính"
          >
            <div class="ss-toggle-left">
              <span class="material-icons ss-ic">tune</span>
              <span class="ss-nav-label">Danh sách thuộc tính</span>
            </div>
            <span class="material-icons ss-caret" :class="{ open: openGroup.attr }">
              expand_more
            </span>
          </button>

          <div v-show="openGroup.attr" class="ss-submenu">
            <RouterLink class="ss-sub-link" to="/admin/thuong-hieu" title="Thương hiệu"><span class="ss-sub-label">Thương hiệu</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/xuat-xu" title="Xuất xứ"><span class="ss-sub-label">Xuất xứ</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/vi-tri-thi-dau" title="Vị trí thi đấu"><span class="ss-sub-label">Vị trí thi đấu</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/phong-cach-choi" title="Phong cách chơi"><span class="ss-sub-label">Phong cách chơi</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/co-giay" title="Cổ giày"><span class="ss-sub-label">Cổ giày</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/chat-lieu" title="Chất liệu"><span class="ss-sub-label">Chất liệu</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/mau-sac" title="Màu sắc"><span class="ss-sub-label">Màu sắc</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/kich-thuoc" title="Kích thước"><span class="ss-sub-label">Kích thước</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/loai-san" title="Loại sân"><span class="ss-sub-label">Loại sân</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/form-chan" title="Form chân"><span class="ss-sub-label">Form chân</span></RouterLink>
          </div>
        </div>

        <!-- Quản lý giảm giá -->
        <div class="ss-nav-group">
          <button
            class="ss-nav-toggle"
            @click="toggle('discount')"
            type="button"
            title="Quản lý giảm giá"
          >
            <div class="ss-toggle-left">
              <span class="material-icons ss-ic">local_offer</span>
              <span class="ss-nav-label">Quản lý giảm giá</span>
            </div>
            <span class="material-icons ss-caret" :class="{ open: openGroup.discount }">
              expand_more
            </span>
          </button>

          <div v-show="openGroup.discount" class="ss-submenu">
            <RouterLink class="ss-sub-link" to="/admin/giam-gia/phieu" title="Phiếu giảm giá"><span class="ss-sub-label">Phiếu giảm giá</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/giam-gia/dot" title="Đợt giảm giá"><span class="ss-sub-label">Đợt giảm giá</span></RouterLink>
          </div>
        </div>

        <!-- Quản lý tài khoản (ADMIN có Khách hàng + Nhân viên) -->
        <div class="ss-nav-group">
          <button
            class="ss-nav-toggle"
            @click="toggle('account')"
            type="button"
            title="Quản lý tài khoản"
          >
            <div class="ss-toggle-left">
              <span class="material-icons ss-ic">group</span>
              <span class="ss-nav-label">Quản lý tài khoản</span>
            </div>
            <span class="material-icons ss-caret" :class="{ open: openGroup.account }">
              expand_more
            </span>
          </button>

          <div v-show="openGroup.account" class="ss-submenu">
            <RouterLink class="ss-sub-link" to="/admin/tai-khoan/khach-hang" title="Khách hàng"><span class="ss-sub-label">Khách hàng</span></RouterLink>
            <RouterLink class="ss-sub-link" to="/admin/tai-khoan/nhan-vien" title="Nhân viên"><span class="ss-sub-label">Nhân viên</span></RouterLink>
          </div>
        </div>
      </template>

      <!-- Lịch làm việc: ADMIN + NHAN_VIEN (đặt cuối menu) -->
      <div class="ss-nav-group">
        <button class="ss-nav-toggle" @click="toggle('work')" type="button" title="Lịch làm việc">
          <div class="ss-toggle-left">
            <span class="material-icons ss-ic">event</span>
            <span class="ss-nav-label">Lịch làm việc</span>
          </div>
          <span class="material-icons ss-caret" :class="{ open: openGroup.work }">
            expand_more
          </span>
        </button>

        <div v-show="openGroup.work" class="ss-submenu">
          <RouterLink class="ss-sub-link" to="/admin/lich-lam-viec" title="Lịch làm việc">
            <span class="ss-sub-label">Lịch làm việc</span>
          </RouterLink>

          <RouterLink class="ss-sub-link" to="/admin/giao-ca" title="Giao ca">
            <span class="ss-sub-label">Giao ca</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const normalizeRole = (role) => {
  const r = String(role || "").trim().toUpperCase();
  if (r === "STAFF") return "NHAN_VIEN";
  if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";
  return r;
};

const getUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const userRole = computed(() => {
  const u = getUser();
  const role =
    u?.role ||
    u?.vaiTro ||
    u?.tenVaiTro ||
    u?.quyenHan ||
    u?.tenQuyenHan ||
    u?.quyenHan?.tenQuyenHan;

  return normalizeRole(role);
});

const isAdmin = computed(() => userRole.value === "ADMIN");

const openGroup = reactive({
  product: false,
  attr: false,
  discount: false,
  account: false,
  work: false,
});

function toggle(key) {
  openGroup[key] = !openGroup[key];
}

const attrPaths = [
  "/admin/thuong-hieu",
  "/admin/xuat-xu",
  "/admin/vi-tri-thi-dau",
  "/admin/phong-cach-choi",
  "/admin/co-giay",
  "/admin/chat-lieu",
  "/admin/mau-sac",
  "/admin/kich-thuoc",
  "/admin/loai-san",
  "/admin/form-chan",
];

watch(
  () => route.path,
  (p) => {
    openGroup.discount = p.startsWith("/admin/giam-gia/");
    openGroup.account = p.startsWith("/admin/tai-khoan/");

    const isProduct =
      p.startsWith("/admin/san-pham") ||
      p.startsWith("/admin/chi-tiet-san-pham");

    const isAttr = attrPaths.some((base) => p.startsWith(base));

    const isWork =
      p.startsWith("/admin/lich-lam-viec") ||
      p.startsWith("/admin/giao-ca");

    openGroup.product = isProduct;
    openGroup.attr = isAttr;
    openGroup.work = isWork;
  },
  { immediate: true }
);
</script>

<style scoped>
.ss-sidebar {
  width: 240px;
  box-shadow: 14px 0 28px -12px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.ss-logo-wrap {
  padding: 14px 10px 0 !important;
  margin: 0 !important;
  border: none !important;
}
.ss-logo {
  max-height: 90px;
  margin: 0 !important;
}

/* LINK CHÍNH */
.ss-nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 11px;
  padding: 10px 10px;
  border-radius: 12px;
  text-decoration: none;

  color: #6b7280;
  font-weight: 650;
  font-size: 12.75px;
  transition: all 0.2s ease;

  white-space: nowrap;
  overflow: hidden;
}

.ss-ic {
  font-size: 20px;
  width: 24px;
  display: inline-flex;
  justify-content: center;
  flex: 0 0 auto;
}

.ss-nav-label {
  flex: 1;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ss-nav-link:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ff4d4f;
}

.ss-nav-link.router-link-exact-active {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.22);
}

/* GROUP */
.ss-nav-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* TOGGLE */
.ss-nav-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;

  color: #6b7280;
  font-weight: 750;
  font-size: 12.75px;
  cursor: pointer;
  transition: all 0.2s ease;

  white-space: nowrap;
  overflow: hidden;
}

.ss-toggle-left {
  display: flex;
  align-items: center;
  gap: 11px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.ss-nav-toggle:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ff4d4f;
}

.ss-caret {
  font-size: 18px;
  transition: transform 0.2s ease;
  flex: 0 0 auto;
}
.ss-caret.open {
  transform: rotate(180deg);
}

/* SUBMENU LV1 */
.ss-submenu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 34px;
  padding-bottom: 6px;
  overflow: hidden;
}

.ss-sub-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;

  color: #6b7280;
  font-weight: 650;
  font-size: 12.5px;
  transition: all 0.2s ease;

  white-space: nowrap;
  overflow: hidden;
}

.ss-sub-label {
  flex: 1;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ss-sub-link:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ff4d4f;
}

.ss-sub-link.router-link-exact-active {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.22);
}
</style>
