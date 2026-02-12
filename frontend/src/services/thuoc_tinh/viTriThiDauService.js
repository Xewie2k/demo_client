// File: src/services/thuoc_tinh/viTriThiDauService.js
import apiClient from "../apiClient";

const unwrapList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

// Payload “an toàn”: gửi nhiều key để BE map đúng field trong ViTriThiDauRequest
const buildCreatePayload = (ten) => ({
  ten, // phòng khi BE nhận field 'ten'
  tenViTriThiDau: ten, // camelCase phổ biến
  ten_vi_tri_thi_dau: ten, // phòng khi BE dùng snake_case
});

const base = "/api/admin/vi-tri-thi-dau";

export default {
  async getAll() {
    return unwrapList(await apiClient.get(base));
  },

  getOne(id) {
    return apiClient.get(`${base}/${id}`);
  },

  // create truyền thẳng payload object (nếu bạn đã chuẩn payload ở nơi gọi)
  create(payload) {
    return apiClient.post(base, payload);
  },

  // createQuick: chỉ cần truyền tên (dùng cho “thêm nhanh”)
  createQuick(ten) {
    return apiClient.post(base, buildCreatePayload(String(ten || "").trim()));
  },

  update(id, payload) {
    return apiClient.put(`${base}/${id}`, payload);
  },

  remove(id) {
    return apiClient.delete(`${base}/${id}`);
  },
};
