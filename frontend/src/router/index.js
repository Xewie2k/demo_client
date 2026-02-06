// File: src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/views/admin/AdminLayout.vue";

import ProductManagePage from "@/pages/product/ProductManagePage.vue";
import ProductDetailListPage from "@/pages/product/ProductDetailListPage.vue";
import ProductDetailFormPage from "@/pages/product/ProductDetailFormPage.vue";
import ProductFormPage from "@/pages/product/ProductFormPage.vue";

import CoGiayPage from "@/pages/product/thuoc_tinh/co_giay/CoGiayPage.vue";

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

// ✅ Client Pages
import ClientLayout from "@/views/client/ClientLayout.vue";
import HomePage from "@/pages/client/HomePage.vue";
import ProductDetailPage from "@/pages/client/ProductDetailPage.vue";
import CartPage from "@/pages/client/CartPage.vue";
import CheckoutPage from "@/pages/client/CheckoutPage.vue";
import OrderSuccessPage from "@/pages/client/OrderSuccessPage.vue";
import AccountLayout from "@/pages/client/account/AccountLayout.vue";
import OrderHistoryPage from "@/pages/client/account/OrderHistoryPage.vue";
import OrderTrackingPage from "@/pages/client/account/OrderTrackingPage.vue";

const SimplePage = (title) => ({
  template: `<div class="p-4"><h3 style="font-weight:800">${title}</h3><div class="text-muted">Demo page</div></div>`,
});

const routes = [
  { path: "/", redirect: "/client" },

  {
    path: "/client",
    component: ClientLayout,
    children: [
      { path: "", name: "client-home", component: HomePage },
      { path: "products/:id", name: "client-product-detail", component: ProductDetailPage, props: true },
      { path: "cart", name: "client-cart", component: CartPage },
      { path: "checkout", name: "client-checkout", component: CheckoutPage },
      { path: "success", name: "client-order-success", component: OrderSuccessPage },
      { 
        path: "account",
        component: AccountLayout,
        redirect: "/client/account/orders",
        children: [
            { path: "orders", component: OrderHistoryPage },
            { path: "orders/:id", name: "client-tracking", component: OrderTrackingPage },
            { path: "profile", component: SimplePage("Hồ sơ") },
            { path: "address", component: SimplePage("Địa chỉ") },
            { path: "coupons", component: SimplePage("Phiếu giảm giá") },
            { path: "password", component: SimplePage("Đổi mật khẩu") },
        ]
      }
    ]
  },

  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/admin/san-pham" },

      { path: "dashboard", component: SimplePage("THỐNG KÊ") },
      { path: "pos", component: SimplePage("BÁN HÀNG TẠI QUẦY") },

      // ✅ Hóa đơn
      { path: "hoa-don", name: "admin-hoa-don", component: HoaDonList },
      {
        path: "hoa-don/:id",
        name: "admin-hoa-don-detail",
        component: HoaDonDetail,
        props: true,
      },

      // =========================================================
      // ✅ KHUYẾN MẠI
      // =========================================================

      // ✅ Phiếu giảm giá
      {
        path: "giam-gia/phieu",
        name: "admin-voucher",
        component: VoucherManagePage,
      },
      {
        path: "giam-gia/phieu/them",
        name: "admin-voucher-new",
        component: VoucherFormPage,
      },
      // ✅ chi tiết phải đứng TRƯỚC :id để tránh match nhầm
      {
        path: "giam-gia/phieu/chi-tiet/:id",
        name: "admin-voucher-detail",
        component: VoucherFormPage,
        props: true,
      },
      // ✅ sửa (giữ theo dạng :id như bạn đang làm)
      {
        path: "giam-gia/phieu/:id",
        name: "admin-voucher-edit",
        component: VoucherFormPage,
        props: true,
      },

      // ✅ Đợt giảm giá
      { path: "giam-gia/dot", name: "admin-discount", component: DiscountPage },
      { path: "giam-gia/dot/new", name: "admin-discount-new", component: AddDiscountPage },
      {
        path: "giam-gia/dot/:id",
        name: "admin-discount-detail",
        component: DetailDiscountPage,
        props: true,
      },

      // =========================================================
      // ✅ SẢN PHẨM
      // =========================================================
      { path: "san-pham", name: "admin-san-pham", component: ProductManagePage },
      { path: "san-pham/new", name: "admin-san-pham-new", component: ProductFormPage },
      { path: "san-pham/:id", name: "admin-san-pham-one", component: ProductFormPage, props: true },
      { path: "san-pham/:id/edit", name: "admin-san-pham-edit", component: ProductFormPage, props: true },

      // ✅ Chi tiết sản phẩm
      { path: "chi-tiet-san-pham", name: "admin-ctsp", component: ProductDetailListPage },
      { path: "chi-tiet-san-pham/new", name: "admin-ctsp-new", component: ProductDetailFormPage },
      { path: "chi-tiet-san-pham/:id", name: "admin-ctsp-one", component: ProductDetailFormPage, props: true },

      // =========================================================
      // ✅ THUỘC TÍNH
      // =========================================================
      { path: "xuat-xu", component: SimplePage("XUẤT XỨ") },
      { path: "thuong-hieu", component: SimplePage("THƯƠNG HIỆU") },
      { path: "vi-tri-thi-dau", component: SimplePage("VỊ TRÍ THI ĐẤU") },
      { path: "phong-cach-choi", component: SimplePage("PHONG CÁCH CHƠI") },
      { path: "co-giay", component: CoGiayPage },
      { path: "chat-lieu", component: SimplePage("CHẤT LIỆU") },
      { path: "mau-sac", component: SimplePage("MÀU SẮC") },
      { path: "kich-thuoc", component: SimplePage("KÍCH THƯỚC") },
      { path: "form-chan", component: SimplePage("FORM CHÂN") },
      { path: "loai-san", component: SimplePage("LOẠI SÂN") },

      // ✅ (giữ nguyên demo cũ nếu bạn còn dùng)
      { path: "khach-hang", redirect: "/admin/tai-khoan/khach-hang" },
      { path: "nhan-vien", redirect: "/admin/tai-khoan/nhan-vien" },

      // =========================================================
      // ✅ TÀI KHOẢN
      // =========================================================
      {
        path: "tai-khoan/khach-hang",
        name: "tai-khoan-khach-hang",
        component: TaiKhoanKhachHangPage,
        children: [
          { path: "them", name: "tai-khoan-khach-hang-them", component: ThemKhachHangPage },
          {
            path: "cap-nhat/:id",
            name: "tai-khoan-khach-hang-cap-nhat",
            component: CapNhatKhachHangPage,
            props: true,
          },
        ],
      },
      {
        path: "tai-khoan/nhan-vien",
        name: "tai-khoan-nhan-vien",
        component: TaiKhoanNhanVienPage,
        children: [
          { path: "them", name: "tai-khoan-nhan-vien-them", component: ThemNhanVienPage },
          {
            path: "cap-nhat/:id",
            name: "tai-khoan-nhan-vien-cap-nhat",
            component: CapNhatNhanVienPage,
            props: true,
          },
        ],
      },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/admin/san-pham" },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
