// src/services/anhChiTietSanPhamService.js
import axios from "axios";

const apiBase =
  import.meta?.env?.VITE_API_URL ||
  import.meta?.env?.VITE_API_BASE_URL ||
  "http://localhost:8080";

const http = axios.create({
  baseURL: String(apiBase).replace(/\/+$/, ""),
});

const base = "/api/admin/anh-chi-tiet-san-pham";

function asFormData(file, extra = {}) {
  const fd = new FormData();
  // ✅ BẮT BUỘC key phải là "file" đúng như BE @RequestParam("file")
  fd.append("file", file);

  Object.keys(extra).forEach((k) => {
    if (extra[k] === undefined || extra[k] === null) return;
    fd.append(k, extra[k]);
  });

  return fd;
}

export default {
  getAll() {
    return http.get(base);
  },

  getOne(id) {
    return http.get(`${base}/${id}`);
  },

  // ====== API GỐC ======
  byChiTietSanPham(idChiTietSanPham) {
    return http.get(`${base}/by-chi-tiet-san-pham/${idChiTietSanPham}`);
  },

  setDaiDien(id) {
    return http.put(`${base}/${id}/set-dai-dien`);
  },

  delete(id) {
    return http.delete(`${base}/${id}`);
  },

  // ✅ UPLOAD MỚI (tạo record ảnh mới)
  // BE: POST /upload?idChiTietSanPham=...&laAnhDaiDien=...&moTa=...
  uploadNew({ idChiTietSanPham, file, laAnhDaiDien = false, moTa = "" }) {
    const fd = asFormData(file, { idChiTietSanPham, laAnhDaiDien, moTa });
    return http.post(`${base}/upload`, fd); // axios tự set multipart
  },

  // ✅ UPDATE ẢNH THEO ID ẢNH (replace file)
  // PUT /{id}/upload (multipart)
  updateUpload({ id, file, laAnhDaiDien = false, moTa = "" }) {
    const fd = asFormData(file, { laAnhDaiDien, moTa });
    return http.put(`${base}/${id}/upload`, fd);
  },

  // ====== ✅ ALIAS (để code trang khác gọi "đúng tên mong đợi") ======
  // ProductFormPage đang gọi getByChiTietSanPham(...)
  getByChiTietSanPham(idChiTietSanPham) {
    return this.byChiTietSanPham(idChiTietSanPham);
  },

  // ProductFormPage đang gọi upload(...)
  upload({ idChiTietSanPham, file, laAnhDaiDien = false, moTa = "" }) {
    return this.uploadNew({ idChiTietSanPham, file, laAnhDaiDien, moTa });
  },
};
