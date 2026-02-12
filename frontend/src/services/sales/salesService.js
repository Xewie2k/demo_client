// File: src/services/sales/salesService.js
import apiClient from "@/services/apiClient";

const SalesService = {
  async getCtspBanHang() {
    // ✅ Ưu tiên đúng controller bạn đang có: /api/chi-tiet-san-pham/ban-hang
    const candidates = [
      "/api/chi-tiet-san-pham/ban-hang",
      "/api/chi-tiet-san-pham",
      // fallback (nếu sau này bạn có admin)
      "/api/admin/chi-tiet-san-pham/ban-hang",
      "/api/admin/chi-tiet-san-pham",
    ];
    return tryGetFirst(candidates, { silent: false });
  },

  async getKhachHangAll() {
    const candidates = [
      "/api/admin/khach-hang/all",
      "/api/admin/khach-hang",
      "/api/khach-hang",
    ];
    return tryGetFirst(candidates, { silent: false });
  },

  // ✅ khớp 100% với controller bạn gửi
  async getDiaChiByKhachHangId(khachHangId) {
    if (!khachHangId) return [];
    const id = Number(khachHangId);
    if (!Number.isFinite(id) || id <= 0) return [];

    const candidates = [
      `/api/admin/dia-chi-khach-hang/khach-hang/${id}`,
      `/api/dia-chi-khach-hang/khach-hang/${id}`,
    ];

    const data = await tryGetFirst(candidates, { silent: true, fallback: [] });
    return Array.isArray(data) ? data : [];
  },

  async getVouchersPublic() {
    const candidates = ["/api/admin/phieu-giam-gia", "/api/phieu-giam-gia"];
    const data = await tryGetFirst(candidates, { silent: true, fallback: [] });
    return Array.isArray(data) ? data : [];
  },

  async getVouchersPersonalByKhachHangId(khachHangId) {
    // ✅ FIX spam 500: không gọi endpoint /khach-hang/{id} nữa (đang lỗi BE)
    // -> gọi all rồi lọc theo khách ở FE.
    if (!khachHangId) return [];
    const id = Number(khachHangId);
    if (!Number.isFinite(id) || id <= 0) return [];

    const candidates = [
      "/api/admin/phieu-giam-gia-ca-nhan",
      "/api/phieu-giam-gia-ca-nhan",
    ];

    const data = await tryGetFirst(candidates, { silent: true, fallback: [] });
    const list = Array.isArray(data) ? data : [];

    return list.filter((x) => extractKhachHangId(x) === id);
  },

  async getBestVoucherByTongTien(tongTien) {
    const tong = Number(tongTien || 0);
    if (!Number.isFinite(tong) || tong <= 0) return null;

    const q = Math.round(tong);
    const candidates = [
      `/api/admin/phieu-giam-gia/best?tongTien=${q}`,
      `/api/phieu-giam-gia/best?tongTien=${q}`,
    ];

    const data = await tryGetFirst(candidates, { silent: true, fallback: null });
    return data && typeof data === "object" ? data : null;
  },

  async createPosQuote(payload) {
    return apiClient.post("/api/pos/quote", payload).then((r) => r.data);
  },

  async confirmPosOrder(payload) {
    return apiClient.post("/api/pos/confirm", payload).then((r) => r.data);
  },
};

export default SalesService;

function extractKhachHangId(x) {
  if (!x || typeof x !== "object") return null;

  const direct =
    x.idKhachHang ??
    x.khachHangId ??
    x.id_khach_hang ??
    x.khachHang?.id ??
    x.khachHang?.idKhachHang ??
    x.khachHang?.khachHangId ??
    null;

  const n = Number(direct);
  return Number.isFinite(n) ? n : null;
}

async function tryGetFirst(paths, options = {}) {
  const { silent = false, fallback = null } = options;
  let lastErr = null;

  for (const p of paths) {
    try {
      // ✅ meta.silent để apiClient không spam console.error
      const res = await apiClient.get(p, { meta: { silent } });
      return res.data;
    } catch (e) {
      lastErr = e;
      const status = e?.response?.status;

      // 404/405: endpoint không tồn tại -> thử candidate khác
      if (status === 404 || status === 405) continue;

      // 401/403: không có quyền -> thử candidate khác
      if (status === 401 || status === 403) continue;

      // 5xx: server lỗi -> vẫn cho thử candidate khác (để fallback sang endpoint khác)
      if (status >= 500) continue;

      continue;
    }
  }

  if (silent) return fallback;
  throw lastErr || new Error("API error");
}
