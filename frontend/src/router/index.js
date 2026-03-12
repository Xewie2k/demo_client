// File: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Swal from "sweetalert2";

import TrangChuPage from "@/pages/trang_chu/TrangChuPage.vue";
import AdminLayout from "@/views/admin/AdminLayout.vue";
import LoginManager from "@/views/authen_author/LoginManager.vue";

import ChatPage from "@/chatAI/pages/ChatPage.vue";

import ProductManagePage from "@/pages/product/ProductManagePage.vue";
import ProductDetailListPage from "@/pages/product/ProductDetailListPage.vue";
import ProductDetailFormPage from "@/pages/product/ProductDetailFormPage.vue";
import ProductFormPage from "@/pages/product/ProductFormPage.vue";

import ChatLieuPage from "@/pages/product/thuoc_tinh/ChatLieuPage.vue";
import CoGiayPage from "@/pages/product/thuoc_tinh/CoGiayPage.vue";
import FormChanPage from "@/pages/product/thuoc_tinh/FormChanPage.vue";
import KichThuocPage from "@/pages/product/thuoc_tinh/KichThuocPage.vue";
import LoaiSanPage from "@/pages/product/thuoc_tinh/LoaiSanPage.vue";
import MauSacPage from "@/pages/product/thuoc_tinh/MauSacPage.vue";
import PhongCachChoiPage from "@/pages/product/thuoc_tinh/PhongCachChoiPage.vue";
import ThuongHieuPage from "@/pages/product/thuoc_tinh/ThuongHieuPage.vue";
import ViTriThiDauPage from "@/pages/product/thuoc_tinh/ViTriThiDauPage.vue";
import XuatXuPage from "@/pages/product/thuoc_tinh/XuatXuPage.vue";

import AddDiscountPage from "@/pages/khuyen_mai/dot_giam_gia/AddDiscountPage.vue";
import DetailDiscountPage from "@/pages/khuyen_mai/dot_giam_gia/DetailDiscountPage.vue";
import DiscountPage from "@/pages/khuyen_mai/dot_giam_gia/DiscountPage.vue";

import VoucherFormPage from "@/pages/khuyen_mai/phieu_giam_gia/VoucherFormPage.vue";
import VoucherManagePage from "@/pages/khuyen_mai/phieu_giam_gia/VoucherManagePage.vue";

import CapNhatKhachHangPage from "@/pages/tai_khoan/capnhat_khachhang.vue";
import CapNhatNhanVienPage from "@/pages/tai_khoan/capnhat_nhanvien.vue";
import TaiKhoanKhachHangPage from "@/pages/tai_khoan/taikhoan_khachhang.vue";
import TaiKhoanNhanVienPage from "@/pages/tai_khoan/taikhoan_nhanvien.vue";
import ThemKhachHangPage from "@/pages/tai_khoan/them_khachhang.vue";
import ThemNhanVienPage from "@/pages/tai_khoan/them_nhanvien.vue";

import HoaDonDetail from "@/pages/hoa_don/HoaDonDetail.vue";
import HoaDonList from "@/pages/hoa_don/HoaDonList.vue";

import SalesPage from "@/pages/sales/SalesPage.vue";

import ThongKePage from "@/pages/thong_ke/ThongKePage.vue";

import GiaoCaPage from "@/pages/lich_lam_viec/GiaoCa.vue";
import LichCaLamPage from "@/pages/lich_lam_viec/LichCaLam.vue";
import LichLamViecPage from "@/pages/lich_lam_viec/LichLamViec.vue";
import LichSuHoatDongPage from "@/pages/lich_lam_viec/LichSuHoatDong.vue";

import AccountLayout from "@/pages/client/account/AccountLayout.vue";
import AddressPage from "@/pages/client/account/AddressPage.vue";
import ChangePasswordPage from "@/pages/client/account/ChangePasswordPage.vue";
import CouponsPage from "@/pages/client/account/CouponsPage.vue";
import OrderHistoryPage from "@/pages/client/account/OrderHistoryPage.vue";
import OrderTrackingPage from "@/pages/client/account/OrderTrackingPage.vue";
import ProfilePage from "@/pages/client/account/ProfilePage.vue";
import AboutPage from "@/pages/client/AboutPage.vue";
import CartPage from "@/pages/client/CartPage.vue";
import CheckoutPage from "@/pages/client/CheckoutPage.vue";
import ClientLayout from "@/views/client/ClientLayout.vue";
import ContactPage from "@/pages/client/ContactPage.vue";
import GuestOrderTrackingPage from "@/pages/client/GuestOrderTrackingPage.vue";
import HomePage from "@/pages/client/HomePage.vue";
import LoginPage from "@/pages/client/LoginPage.vue";
import NewsPage from "@/pages/client/NewsPage.vue";
import OrderSuccessPage from "@/pages/client/OrderSuccessPage.vue";
import ProductDetailPage from "@/pages/client/ProductDetailPage.vue";
import ProductsPage from "@/pages/client/ProductsPage.vue";
import RegisterPage from "@/pages/client/RegisterPage.vue";

// ======================= AUTH HELPERS =======================
const ADMIN_ROLES = ["ADMIN", "NHAN_VIEN"];
const ADMIN_USER_KEYS = ["user", "nguoiDung"];
const CLIENT_USER_KEYS = ["ss_customer"];

const safeParseJson = (raw) => {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const getStorageRaw = (keys) => {
  for (const key of keys) {
    const localValue = localStorage.getItem(key);
    if (localValue) return localValue;

    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;
  }

  return null;
};

const getStorageObject = (keys) => {
  const raw = getStorageRaw(keys);
  const parsed = safeParseJson(raw);

  return parsed && typeof parsed === "object" ? parsed : null;
};

const normalizeRole = (role) => {
  const r = String(role || "").trim().toUpperCase();

  if (r === "STAFF") return "NHAN_VIEN";
  if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";

  return r;
};

const extractRole = (user) => {
  if (!user || typeof user !== "object") return null;

  return normalizeRole(
    user.role ||
      user.vaiTro ||
      user.tenVaiTro ||
      user.tenQuyenHan ||
      user.quyenHan?.tenQuyenHan ||
      user.quyenHan ||
      user.chucVu
  );
};

const getAdminUser = () => getStorageObject(ADMIN_USER_KEYS);

const getClientUser = () => getStorageObject(CLIENT_USER_KEYS);

const getAdminRole = () => extractRole(getAdminUser());

const isAdminLoggedIn = () => {
  const user = getAdminUser();
  const role = extractRole(user);

  return !!user && ADMIN_ROLES.includes(role);
};

const isClientLoggedIn = () => {
  return !!getClientUser();
};

const clearAdminAuth = () => {
  const keys = [
    "accessToken",
    "token",
    "jwt",
    "ss_token",
    "user",
    "nguoiDung",
    "ss_nguoi_ban",
    "ss_has_active_shift",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const hasPermission = (requiredRoles, userRole) => {
  if (!requiredRoles) return true;
  if (!userRole) return false;

  return Array.isArray(requiredRoles)
    ? requiredRoles.includes(userRole)
    : requiredRoles === userRole;
};

const getRequiredRoles = (to) => {
  const matched = [...to.matched].reverse();
  const record = matched.find((r) => r.meta?.roles || r.meta?.role);

  if (!record) return null;
  return record.meta.roles ?? record.meta.role ?? null;
};

const hasActiveShift = () => sessionStorage.getItem("ss_has_active_shift") === "true";

const isActionRoute = (path) => /\/(new|them|edit|cap-nhat)(\/|$)/.test(path);

// ======================= ROUTES =======================
const routes = [
  { path: "/", redirect: "/dang-nhap" },

  {
    path: "/dang-nhap",
    name: "dang-nhap",
    component: LoginManager,
    meta: { public: true },
  },

  {
    path: "/client",
    component: ClientLayout,
    meta: { public: true },
    children: [
      { path: "", name: "client-home", component: HomePage },
      { path: "about", name: "client-about", component: AboutPage },
      { path: "cart", name: "client-cart", component: CartPage },
      { path: "checkout", name: "client-checkout", component: CheckoutPage },
      { path: "contact", name: "client-contact", component: ContactPage },
      { path: "login", name: "client-login", component: LoginPage },
      { path: "news", name: "client-news", component: NewsPage },
      { path: "products", name: "client-products", component: ProductsPage },
      {
        path: "products/:id",
        name: "client-product-detail",
        component: ProductDetailPage,
        props: true,
      },
      { path: "register", name: "client-register", component: RegisterPage },
      { path: "success", name: "client-order-success", component: OrderSuccessPage },
      { path: "tracking", name: "client-guest-tracking", component: GuestOrderTrackingPage },

      {
        path: "account",
        component: AccountLayout,
        meta: { requiresClientAuth: true },
        redirect: "/client/account/orders",
        children: [
          { path: "address", name: "client-address", component: AddressPage },
          { path: "coupons", name: "client-coupons", component: CouponsPage },
          { path: "orders", name: "client-orders", component: OrderHistoryPage },
          { path: "orders/:id", name: "client-tracking", component: OrderTrackingPage },
          { path: "password", name: "client-password", component: ChangePasswordPage },
          { path: "profile", name: "client-profile", component: ProfilePage },
        ],
      },
    ],
  },

  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/admin/trang-chu" },

      {
        path: "chat",
        name: "admin-chat",
        component: ChatPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },
      {
        path: "quan-ly-chat",
        redirect: "/admin/chat",
      },

      {
        path: "chi-tiet-san-pham",
        name: "admin-ctsp",
        component: ProductDetailListPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "chi-tiet-san-pham/new",
        name: "admin-ctsp-new",
        component: ProductDetailFormPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "chi-tiet-san-pham/:id(\\d+)",
        name: "admin-ctsp-one",
        component: ProductDetailFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "co-giay",
        name: "admin-co-giay",
        component: CoGiayPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "chat-lieu",
        name: "admin-chat-lieu",
        component: ChatLieuPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "dashboard",
        name: "admin-dashboard",
        component: ThongKePage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "form-chan",
        name: "admin-form-chan",
        component: FormChanPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "giam-gia/dot",
        name: "admin-discount",
        component: DiscountPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/dot/new",
        name: "admin-discount-new",
        component: AddDiscountPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/dot/:id(\\d+)",
        name: "admin-discount-detail",
        component: DetailDiscountPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "giam-gia/phieu",
        name: "admin-voucher",
        component: VoucherManagePage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/phieu/them",
        name: "admin-voucher-new",
        component: VoucherFormPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "giam-gia/phieu/:id(\\d+)",
        name: "admin-voucher-detail",
        component: VoucherFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "giao-ca",
        name: "admin-giao-ca",
        component: GiaoCaPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "hoa-don",
        name: "admin-hoa-don",
        component: HoaDonList,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },
      {
        path: "hoa-don/:id(\\d+)",
        name: "admin-hoa-don-detail",
        component: HoaDonDetail,
        props: true,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "khach-hang",
        redirect: "/admin/tai-khoan/khach-hang",
      },

      {
        path: "kich-thuoc",
        name: "admin-kich-thuoc",
        component: KichThuocPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "lich-ca-lam",
        name: "admin-lich-ca-lam",
        component: LichCaLamPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "lich-lam-viec",
        name: "admin-lich-lam-viec",
        component: LichLamViecPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },
      {
        path: "lich-su-hoat-dong",
        name: "admin-lich-su-hoat-dong",
        component: LichSuHoatDongPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "loai-san",
        name: "admin-loai-san",
        component: LoaiSanPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "mau-sac",
        name: "admin-mau-sac",
        component: MauSacPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "nhan-vien",
        redirect: "/admin/tai-khoan/nhan-vien",
      },

      {
        path: "phong-cach-choi",
        name: "admin-phong-cach-choi",
        component: PhongCachChoiPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "pos",
        name: "admin-pos",
        component: SalesPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "san-pham",
        name: "admin-san-pham",
        component: ProductManagePage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "san-pham/new",
        name: "admin-san-pham-new",
        component: ProductFormPage,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "san-pham/:id(\\d+)",
        name: "admin-san-pham-one",
        component: ProductFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "san-pham/:id(\\d+)/edit",
        name: "admin-san-pham-edit",
        component: ProductFormPage,
        props: true,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "tai-khoan/khach-hang",
        name: "tai-khoan-khach-hang",
        component: TaiKhoanKhachHangPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
        children: [
          {
            path: "them",
            name: "tai-khoan-khach-hang-them",
            component: ThemKhachHangPage,
            meta: { roles: ["ADMIN", "NHAN_VIEN"] },
          },
          {
            path: "cap-nhat/:id(\\d+)",
            name: "tai-khoan-khach-hang-cap-nhat",
            component: CapNhatKhachHangPage,
            props: true,
            meta: { roles: ["ADMIN", "NHAN_VIEN"] },
          },
        ],
      },
      {
        path: "tai-khoan/nhan-vien",
        name: "tai-khoan-nhan-vien",
        component: TaiKhoanNhanVienPage,
        meta: { roles: ["ADMIN"] },
        children: [
          {
            path: "them",
            name: "tai-khoan-nhan-vien-them",
            component: ThemNhanVienPage,
            meta: { roles: ["ADMIN"] },
          },
          {
            path: "cap-nhat/:id(\\d+)",
            name: "tai-khoan-nhan-vien-cap-nhat",
            component: CapNhatNhanVienPage,
            props: true,
            meta: { roles: ["ADMIN"] },
          },
        ],
      },

      {
        path: "thong-tin-ca-nhan",
        name: "admin-profile",
        component: () => import("@/views/admin/ThongTinCaNhan.vue"),
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "trang-chu",
        name: "admin-trang-chu",
        component: TrangChuPage,
        meta: { roles: ["ADMIN", "NHAN_VIEN"] },
      },

      {
        path: "thuong-hieu",
        name: "admin-thuong-hieu",
        component: ThuongHieuPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "vi-tri-thi-dau",
        name: "admin-vi-tri-thi-dau",
        component: ViTriThiDauPage,
        meta: { roles: ["ADMIN"] },
      },

      {
        path: "xuat-xu",
        name: "admin-xuat-xu",
        component: XuatXuPage,
        meta: { roles: ["ADMIN"] },
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/dang-nhap" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ======================= GUARD =======================
router.beforeEach((to, from, next) => {
  const isPublicRoute = to.matched.some((record) => record.meta?.public);
  const requiresClientAuth = to.matched.some((record) => record.meta?.requiresClientAuth);
  const requiresAdminAuth = to.matched.some((record) => record.meta?.requiresAuth);

  if (requiresClientAuth && !isClientLoggedIn()) {
    return next({ name: "client-login", query: { redirect: to.fullPath } });
  }

  if (to.name === "dang-nhap") {
    if (isAdminLoggedIn()) {
      return next("/admin/trang-chu");
    }
    return next();
  }

  if (isPublicRoute && !requiresAdminAuth) {
    return next();
  }

  if (!requiresAdminAuth) {
    return next();
  }

  if (!isAdminLoggedIn()) {
    clearAdminAuth();
    return next({ name: "dang-nhap", query: { redirect: to.fullPath } });
  }

  const role = getAdminRole();
  const requiredRoles = getRequiredRoles(to);

  // ✅ Không chặn /admin/giao-ca nữa.
  // Đây là trang để nhân viên mở/đóng ca, nên phải cho vào kể cả khi chưa có ca hoạt động.

  if (isActionRoute(to.path) && role === "NHAN_VIEN" && !hasActiveShift()) {
    Swal.fire({
      icon: "error",
      title: "Chế độ Chỉ xem",
      text: "Bạn cần Bắt đầu ca làm việc mới có thể Thêm hoặc Sửa dữ liệu!",
    });
    return next(false);
  }

  if (!hasPermission(requiredRoles, role)) {
    Swal.fire({
      icon: "error",
      title: "Từ chối truy cập",
      text: "Bạn không có quyền vào chức năng này!",
      timer: 1500,
      showConfirmButton: false,
    });

    const fallback = "/admin/trang-chu";
    return next(from.fullPath && from.fullPath !== "/dang-nhap" ? from.fullPath : fallback);
  }

  return next();
});

export default router;