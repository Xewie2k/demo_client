// File: src/services/thuoc_tinh/phongCachChoiService.js
import apiClient from "../apiClient";

const unwrapList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

// Payload “an toàn”: gửi nhiều key để BE map đúng field trong PhongCachChoiRequest
const buildCreatePayload = (ten) => ({
  ten,
  tenPhongCachChoi: ten,
  ten_phong_cach_choi: ten,
});

const base = "/api/admin/phong-cach-choi";

export default {
  async getAll() {
    return unwrapList(await apiClient.get(base));
  },

  getOne(id) {
    return apiClient.get(`${base}/${id}`);
  },

  create(payload) {
    return apiClient.post(base, payload);
  },

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
