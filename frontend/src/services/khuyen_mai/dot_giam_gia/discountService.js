// File: src/services/khuyen_mai/dot_giam_gia/discountService.js
import apiClient from "@/services/apiClient";

const BASE_URL = "/api/admin";

// Endpoints (giữ đúng theo schema bạn đang dùng)
const API = {
  DISCOUNT: `${BASE_URL}/dot-giam-gia`,
  DISCOUNT_DETAIL: `${BASE_URL}/chi-tiet-dot-giam-gia`,
  PRODUCT_DETAIL: `${BASE_URL}/chi-tiet-san-pham`,
  PRODUCT: `${BASE_URL}/san-pham`,
  COLOR: `${BASE_URL}/mau-sac`,
  SIZE: `${BASE_URL}/kich-thuoc`,
  BRAND: `${BASE_URL}/thuong-hieu`,
  MATERIAL: `${BASE_URL}/chat-lieu`,
  CATEGORY: `${BASE_URL}/loai-san`,
  SOLE: `${BASE_URL}/co-giay`,
};

// Helper: lấy list an toàn từ axios response (Page/content/data/...)
const unwrapList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.data?.content)) return d.data.data.content;
  return [];
};

export const discountService = {
  async getAll() {
    const res = await apiClient.get(API.DISCOUNT);
    return unwrapList(res);
  },

  async getOne(id) {
    const res = await apiClient.get(`${API.DISCOUNT}/${id}`);
    return res?.data ?? res;
  },

  async delete(id) {
    const res = await apiClient.delete(`${API.DISCOUNT}/${id}`);
    return res?.data ?? res;
  },

  async update(id, payload) {
    const res = await apiClient.put(`${API.DISCOUNT}/${id}`, payload);
    return res?.data ?? res;
  },

  // Lấy danh sách chi tiết sản phẩm thuộc 1 đợt giảm giá
  async getDiscountDetails(idDotGiamGia) {
    const params = new URLSearchParams({ idDotGiamGia: String(idDotGiamGia) });
    const url = `${API.DISCOUNT_DETAIL}?${params.toString()}`;
    const res = await apiClient.get(url);
    return unwrapList(res);
  },

  // Lấy toàn bộ CTSP + enrich tên thuộc tính để hiển thị UI
  async getAllProductDetails() {
    try {
      const [
        ctspRes,
        spRes,
        mauSacRes,
        kichThuocRes,
        thuongHieuRes,
        chatLieuRes,
        loaiSanRes,
      ] = await Promise.all([
        apiClient.get(API.PRODUCT_DETAIL),
        apiClient.get(API.PRODUCT),
        apiClient.get(API.COLOR),
        apiClient.get(API.SIZE),
        apiClient.get(API.BRAND),
        apiClient.get(API.MATERIAL),
        apiClient.get(API.CATEGORY),
      ]);

      const ctsp = unwrapList(ctspRes);
      const sp = unwrapList(spRes);
      const mauSac = unwrapList(mauSacRes);
      const kichThuoc = unwrapList(kichThuocRes);
      const thuongHieu = unwrapList(thuongHieuRes);
      const chatLieu = unwrapList(chatLieuRes);
      const loaiSan = unwrapList(loaiSanRes);

      const toMap = (arr, nameField) =>
        (arr || []).reduce((acc, it) => {
          acc[it.id] = it[nameField];
          return acc;
        }, {});

      const sanPhamNameMap = toMap(sp, "tenSanPham");
      const mauSacMap = toMap(mauSac, "tenMauSac");
      const kichThuocMap = toMap(kichThuoc, "tenKichThuoc");
      const thuongHieuMap = toMap(thuongHieu, "tenThuongHieu");
      const chatLieuMap = toMap(chatLieu, "tenChatLieu");
      const loaiSanMap = toMap(loaiSan, "tenLoaiSan");

      const spById = (id) => sp.find((x) => String(x.id) === String(id)) || {};

      return (ctsp || []).map((item) => {
        let idSanPham = item.idSanPham || item.id_san_pham;
        if (!idSanPham && item.sanPham?.id) idSanPham = item.sanPham.id;

        const parent = spById(idSanPham);

        const idThuongHieu = parent.idThuongHieu || parent.id_thuong_hieu;
        const idChatLieu = parent.idChatLieu || parent.id_chat_lieu;

        return {
          ...item,
          idSanPham,

          // fallback fields
          giaNiemYet:
            item.giaNiemYet ?? item.gia_niem_yet ?? item.giaBan ?? item.gia_ban ?? 0,

          maSanPham: parent.maSanPham || parent.ma_san_pham || `SP-${idSanPham ?? "UNKNOWN"}`,
          tenSanPham: sanPhamNameMap[idSanPham] || parent.tenSanPham || parent.ten_san_pham || "Sản phẩm",

          tenMauSac: mauSacMap[item.idMauSac ?? item.id_mau_sac] || "Không xác định",
          tenKichThuoc: kichThuocMap[item.idKichThuoc ?? item.id_kich_thuoc] || "FS",
          tenLoaiSan: loaiSanMap[item.idLoaiSan ?? item.id_loai_san] || "Không xác định",

          tenThuongHieu: thuongHieuMap[idThuongHieu] || "Chưa cập nhật",
          tenChatLieu: chatLieuMap[idChatLieu] || "Chưa cập nhật",

          maChiTietSanPham:
            item.maChiTietSanPham || item.ma_chi_tiet_san_pham || `CTSP-${item.id}`,
        };
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu sản phẩm từ DB:", error);
      return [];
    }
  },

  // Tạo đợt + tạo chi tiết (client composite)
  async createDiscountComposite(payload) {
    const { idChiTietSanPhams, ...discountData } = payload;

    // 1) Tạo đợt
    const resDiscount = await apiClient.post(API.DISCOUNT, discountData);
    const newDiscount = resDiscount?.data ?? resDiscount;

    const newDiscountId = newDiscount?.id;
    if (!newDiscountId) throw new Error("Không tạo được đợt giảm giá (không có ID trả về)");

    // 2) Tạo chi tiết
    if (Array.isArray(idChiTietSanPhams) && idChiTietSanPhams.length > 0) {
      const reqs = idChiTietSanPhams.map((idCTSP) => {
        const detailPayload = {
          idDotGiamGia: newDiscountId,
          idChiTietSanPham: idCTSP,
          soLuongApDung: null,
          giaTriGiamRieng: null,
          soTienGiamToiDaRieng: null,
          ghiChu: "Added via Admin UI",
          trangThai: true,
        };
        return apiClient.post(API.DISCOUNT_DETAIL, detailPayload);
      });
      await Promise.all(reqs);
    }

    return newDiscount;
  },
};

// ✅ để page import default cũng chạy được
export default discountService;
