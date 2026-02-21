// File: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/views/admin/AdminLayout.vue";
import LoginManager from "@/views/authen_author/LoginManager.vue";

import ProductManagePage from "@/pages/product/ProductManagePage.vue";
import ProductDetailListPage from "@/pages/product/ProductDetailListPage.vue";
import ProductDetailFormPage from "@/pages/product/ProductDetailFormPage.vue";
import ProductFormPage from "@/pages/product/ProductFormPage.vue";

import CoGiayPage from "@/pages/product/thuoc_tinh/CoGiayPage.vue";

// ✅ THUỘC TÍNH (file lẻ, không folder snake_case)
import XuatXuPage from "@/pages/product/thuoc_tinh/XuatXuPage.vue";
import ThuongHieuPage from "@/pages/product/thuoc_tinh/ThuongHieuPage.vue";
import ViTriThiDauPage from "@/pages/product/thuoc_tinh/ViTriThiDauPage.vue";
import PhongCachChoiPage from "@/pages/product/thuoc_tinh/PhongCachChoiPage.vue";
import ChatLieuPage from "@/pages/product/thuoc_tinh/ChatLieuPage.vue";
import MauSacPage from "@/pages/product/thuoc_tinh/MauSacPage.vue";
import KichThuocPage from "@/pages/product/thuoc_tinh/KichThuocPage.vue";
import FormChanPage from "@/pages/product/thuoc_tinh/FormChanPage.vue";
import LoaiSanPage from "@/pages/product/thuoc_tinh/LoaiSanPage.vue";

import DiscountPage from "@/pages/khuyen_mai/dot_giam_gia/DiscountPage.vue";
import AddDiscountPage from "@/pages/khuyen_mai/dot_giam_gia/AddDiscountPage.vue";
import DetailDiscountPage from "@/pages/khuyen_mai/dot_giam_gia/DetailDiscountPage.vue";

// ✅ Phiếu giảm giá
import VoucherManagePage from "@/pages/khuyen_mai/phieu_giam_gia/VoucherManagePage.vue";
import VoucherFormPage from "@/pages/khuyen_mai/phieu_giam_gia/VoucherFormPage.vue";

// ✅ Tài khoản (nhân viên / khách hàng)
import TaiKhoanNhanVienPage from "@/pages/tai_khoan/taikhoan_nhanvien.vue";
import ThemNhanVienPage from "@/pages/tai_khoan/them_nhanvien.vue";
import CapNhatNhanVienPage from "@/pages/tai_khoan/capnhat_nhanvien.vue";

import TaiKhoanKhachHangPage from "@/pages/tai_khoan/taikhoan_khachhang.vue";
import ThemKhachHangPage from "@/pages/tai_khoan/them_khachhang.vue";
import CapNhatKhachHangPage from "@/pages/tai_khoan/capnhat_khachhang.vue";

// ✅ Hóa đơn
import HoaDonList from "@/pages/hoa_don/HoaDonList.vue";
import HoaDonDetail from "@/pages/hoa_don/HoaDonDetail.vue";

// ✅ Bán hàng
import SalesPage from "@/pages/sales/SalesPage.vue";

// ✅ Client Pages
import ClientLayout from "@/views/client/ClientLayout.vue";
import HomePage from "@/pages/client/HomePage.vue";
import ProductsPage from "@/pages/client/ProductsPage.vue";
import ProductDetailPage from "@/pages/client/ProductDetailPage.vue";
import CartPage from "@/pages/client/CartPage.vue";
import CheckoutPage from "@/pages/client/CheckoutPage.vue";
import OrderSuccessPage from "@/pages/client/OrderSuccessPage.vue";
import GuestOrderTrackingPage from "@/pages/client/GuestOrderTrackingPage.vue";
import LoginPage from "@/pages/client/LoginPage.vue";
import RegisterPage from "@/pages/client/RegisterPage.vue";
import AccountLayout from "@/pages/client/account/AccountLayout.vue";
import OrderHistoryPage from "@/pages/client/account/OrderHistoryPage.vue";
import OrderTrackingPage from "@/pages/client/account/OrderTrackingPage.vue";
import ProfilePage from "@/pages/client/account/ProfilePage.vue";
import AddressPage from "@/pages/client/account/AddressPage.vue";
import ChangePasswordPage from "@/pages/client/account/ChangePasswordPage.vue";
import CouponsPage from "@/pages/client/account/CouponsPage.vue";
import AboutPage from "@/pages/client/AboutPage.vue";
import NewsPage from "@/pages/client/NewsPage.vue";
import ContactPage from "@/pages/client/ContactPage.vue";

// ✅ Thống kê
import ThongKePage from "@/pages/thong_ke/ThongKePage.vue";

// ✅ Check đăng nhập admin
const isLoggedIn = () => {
  const tokenKeys = ["accessToken", "token", "jwt", "ss_token"];
  const hasToken = tokenKeys.some(
    (k) => !!localStorage.getItem(k) || !!sessionStorage.getItem(k)
  );

  const hasUser =
    !!localStorage.getItem("user") ||
    !!sessionStorage.getItem("user") ||
    !!localStorage.getItem("nguoiDung") ||
    !!sessionStorage.getItem("nguoiDung");

  return hasToken || hasUser;
};

// ✅ Check đăng nhập client
const isClientLoggedIn = () => {
  return !!localStorage.getItem("ss_customer");
};

const routes = [
  { path: "/", redirect: "/dang-nhap" },

  // ✅ Login admin
  { path: "/dang-nhap", name: "dang-nhap", component: LoginManager, meta: { public: true } },

  // ✅ Client
  {
    path: "/client",
    component: ClientLayout,
    meta: { public: true },
    children: [
      { path: "", name: "client-home", component: HomePage },
      { path: "products", name: "client-products", component: ProductsPage },
      { path: "products/:id", name: "client-product-detail", component: ProductDetailPage, props: true },
      { path: "cart", name: "client-cart", component: CartPage },
      { path: "checkout", name: "client-checkout", component: CheckoutPage },
      { path: "success", name: "client-order-success", component: OrderSuccessPage },
      { path: "tracking", name: "client-guest-tracking", component: GuestOrderTrackingPage },
      { path: "about", name: "client-about", component: AboutPage },
      { path: "news", name: "client-news", component: NewsPage },
      { path: "contact", name: "client-contact", component: ContactPage },
      { path: "login", name: "client-login", component: LoginPage },
      { path: "register", name: "client-register", component: RegisterPage },
      {
        path: "account",
        component: AccountLayout,
        meta: { requiresClientAuth: true },
        redirect: "/client/account/orders",
        children: [
          { path: "orders", component: OrderHistoryPage },
          { path: "orders/:id", name: "client-tracking", component: OrderTrackingPage },
          { path: "profile", component: ProfilePage },
          { path: "address", component: AddressPage },
          { path: "coupons", component: CouponsPage },
          { path: "password", component: ChangePasswordPage },
        ],
      },
    ],
  },

  // ✅ Admin
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/admin/san-pham" },

      { path: "dashboard", name: "admin-dashboard", component: ThongKePage },
      { path: "pos", name: "admin-pos", component: SalesPage },

      { path: "hoa-don", name: "admin-hoa-don", component: HoaDonList },
      { path: "hoa-don/:id(\\d+)", name: "admin-hoa-don-detail", component: HoaDonDetail, props: true },

      { path: "giam-gia/phieu", name: "admin-voucher", component: VoucherManagePage },
      { path: "giam-gia/phieu/them", name: "admin-voucher-new", component: VoucherFormPage },
      { path: "giam-gia/phieu/:id(\\d+)", name: "admin-voucher-detail", component: VoucherFormPage, props: true },

      { path: "giam-gia/dot", name: "admin-discount", component: DiscountPage },
      { path: "giam-gia/dot/new", name: "admin-discount-new", component: AddDiscountPage },
      { path: "giam-gia/dot/:id(\\d+)", name: "admin-discount-detail", component: DetailDiscountPage, props: true },

      { path: "san-pham", name: "admin-san-pham", component: ProductManagePage },
      { path: "san-pham/new", name: "admin-san-pham-new", component: ProductFormPage },
      { path: "san-pham/:id(\\d+)", name: "admin-san-pham-one", component: ProductFormPage, props: true },
      { path: "san-pham/:id(\\d+)/edit", name: "admin-san-pham-edit", component: ProductFormPage, props: true },

      { path: "chi-tiet-san-pham", name: "admin-ctsp", component: ProductDetailListPage },
      { path: "chi-tiet-san-pham/new", name: "admin-ctsp-new", component: ProductDetailFormPage },
      { path: "chi-tiet-san-pham/:id(\\d+)", name: "admin-ctsp-one", component: ProductDetailFormPage, props: true },

      { path: "xuat-xu", name: "admin-xuat-xu", component: XuatXuPage },
      { path: "thuong-hieu", name: "admin-thuong-hieu", component: ThuongHieuPage },
      { path: "vi-tri-thi-dau", name: "admin-vi-tri-thi-dau", component: ViTriThiDauPage },
      { path: "phong-cach-choi", name: "admin-phong-cach-choi", component: PhongCachChoiPage },
      { path: "co-giay", name: "admin-co-giay", component: CoGiayPage },
      { path: "chat-lieu", name: "admin-chat-lieu", component: ChatLieuPage },
      { path: "mau-sac", name: "admin-mau-sac", component: MauSacPage },
      { path: "kich-thuoc", name: "admin-kich-thuoc", component: KichThuocPage },
      { path: "form-chan", name: "admin-form-chan", component: FormChanPage },
      { path: "loai-san", name: "admin-loai-san", component: LoaiSanPage },

      { path: "khach-hang", redirect: "/admin/tai-khoan/khach-hang" },
      { path: "nhan-vien", redirect: "/admin/tai-khoan/nhan-vien" },

      {
        path: "tai-khoan/khach-hang",
        name: "tai-khoan-khach-hang",
        component: TaiKhoanKhachHangPage,
        children: [
          { path: "them", name: "tai-khoan-khach-hang-them", component: ThemKhachHangPage },
          { path: "cap-nhat/:id(\\d+)", name: "tai-khoan-khach-hang-cap-nhat", component: CapNhatKhachHangPage, props: true },
        ],
      },
      {
        path: "tai-khoan/nhan-vien",
        name: "tai-khoan-nhan-vien",
        component: TaiKhoanNhanVienPage,
        children: [
          { path: "them", name: "tai-khoan-nhan-vien-them", component: ThemNhanVienPage },
          { path: "cap-nhat/:id(\\d+)", name: "tai-khoan-nhan-vien-cap-nhat", component: CapNhatNhanVienPage, props: true },
        ],
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/dang-nhap" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Guard
router.beforeEach((to, from, next) => {
  // Client auth guard
  const requiresClientAuth = to.matched.some((r) => r.meta?.requiresClientAuth);
  if (requiresClientAuth && !isClientLoggedIn()) {
    return next({ name: "client-login", query: { redirect: to.fullPath } });
  }

  if (to.meta?.public) return next();

  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  if (!requiresAuth) return next();

  if (isLoggedIn()) return next();

  return next({
    name: "dang-nhap",
    query: { redirect: to.fullPath },
  });
});

export default router;
