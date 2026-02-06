// File: src/services/refDataService.js
import apiClient from "./apiClient";

const unwrapList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content; // nếu sau này có phân trang kiểu Spring Page
  return [];
};

export const refDataService = {
  // GET (trả về array)
  async getThuongHieu() { return unwrapList(await apiClient.get("/api/admin/thuong-hieu")); },
  async getXuatXu() { return unwrapList(await apiClient.get("/api/admin/xuat-xu")); },
  async getMauSac() { return unwrapList(await apiClient.get("/api/admin/mau-sac")); },
  async getKichThuoc() { return unwrapList(await apiClient.get("/api/admin/kich-thuoc")); },
  async getLoaiSan() { return unwrapList(await apiClient.get("/api/admin/loai-san")); },
  async getFormChan() { return unwrapList(await apiClient.get("/api/admin/form-chan")); },
  async getCoGiay() { return unwrapList(await apiClient.get("/api/admin/co-giay")); },
  async getChatLieu() { return unwrapList(await apiClient.get("/api/admin/chat-lieu")); },
  async getViTriThiDau() { return unwrapList(await apiClient.get("/api/admin/vi-tri-thi-dau")); },
  async getPhongCachChoi() { return unwrapList(await apiClient.get("/api/admin/phong-cach-choi")); },

  // POST (giữ nguyên trả axios response)
  createThuongHieu(payload) { return apiClient.post("/api/admin/thuong-hieu", payload); },
  createXuatXu(payload) { return apiClient.post("/api/admin/xuat-xu", payload); },
  createMauSac(payload) { return apiClient.post("/api/admin/mau-sac", payload); },
  createKichThuoc(payload) { return apiClient.post("/api/admin/kich-thuoc", payload); },
  createLoaiSan(payload) { return apiClient.post("/api/admin/loai-san", payload); },
  createFormChan(payload) { return apiClient.post("/api/admin/form-chan", payload); },
  createCoGiay(payload) { return apiClient.post("/api/admin/co-giay", payload); },
  createChatLieu(payload) { return apiClient.post("/api/admin/chat-lieu", payload); },
  createViTriThiDau(payload) { return apiClient.post("/api/admin/vi-tri-thi-dau", payload); },
  createPhongCachChoi(payload) { return apiClient.post("/api/admin/phong-cach-choi", payload); },
};
