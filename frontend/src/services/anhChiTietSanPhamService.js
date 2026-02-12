// src/services/anhChiTietSanPhamService.js
import apiClient from "@/services/apiClient";

const base = "/api/admin/anh-chi-tiet-san-pham";

function asFormData(file) {
  const fd = new FormData();
  // ✅ key "file" đúng BE @RequestParam("file")
  fd.append("file", file);
  return fd;
}

export default {
  getAll() {
    return apiClient.get(base);
  },

  getOne(id) {
    return apiClient.get(`${base}/${id}`);
  },

  // ====== API GỐC ======
  byChiTietSanPham(idChiTietSanPham) {
    return apiClient.get(`${base}/by-chi-tiet-san-pham/${idChiTietSanPham}`);
  },

  setDaiDien(id) {
    return apiClient.put(`${base}/${id}/set-dai-dien`);
  },

  delete(id) {
    return apiClient.delete(`${base}/${id}`);
  },

  // ✅ UPLOAD MỚI (tạo record ảnh mới)
  // BE: POST /upload?idChiTietSanPham=...&laAnhDaiDien=...&moTa=...
  uploadNew({ idChiTietSanPham, file, laAnhDaiDien = false, moTa = "" }) {
    const fd = asFormData(file);

    // ✅ gửi các field dạng params để BE @RequestParam ăn chắc
    return apiClient.post(`${base}/upload`, fd, {
      params: { idChiTietSanPham, laAnhDaiDien, moTa },
      // ❌ không set Content-Type để axios tự set boundary
    });
  },

  // ✅ UPDATE ẢNH THEO ID ẢNH (replace file)
  // PUT /{id}/upload (multipart)
  updateUpload({ id, file, laAnhDaiDien = false, moTa = "" }) {
    const fd = asFormData(file);

    return apiClient.put(`${base}/${id}/upload`, fd, {
      params: { laAnhDaiDien, moTa },
    });
  },

  // ====== ✅ ALIAS (để code trang khác gọi "đúng tên mong đợi") ======
  getByChiTietSanPham(idChiTietSanPham) {
    return this.byChiTietSanPham(idChiTietSanPham);
  },

  upload({ idChiTietSanPham, file, laAnhDaiDien = false, moTa = "" }) {
    return this.uploadNew({ idChiTietSanPham, file, laAnhDaiDien, moTa });
  },

  // ✅ FIX BUG: page đang gọi create(...) => thêm alias create()
  // Bạn có thể truyền idChiTietSanPham như cũ.
  create({ idChiTietSanPham, file, laAnhDaiDien = false, moTa = "" }) {
    return this.uploadNew({ idChiTietSanPham, file, laAnhDaiDien, moTa });
  },

  // ✅ alias an toàn nếu nơi khác dùng tên remove
  remove(id) {
    return this.delete(id);
  },
};
