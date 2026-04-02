// File: src/services/refDataService.js
import apiClient from "./apiClient";

const unwrapList = (res) => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
};

const getList = async (url) => unwrapList(await apiClient.get(url));

export const refDataService = {
  // ===== GET all =====
  async getThuongHieu() { return getList("/api/admin/thuong-hieu"); },
  async getXuatXu() { return getList("/api/admin/xuat-xu"); },
  async getMauSac() { return getList("/api/admin/mau-sac"); },
  async getKichThuoc() { return getList("/api/admin/kich-thuoc"); },
  async getLoaiSan() { return getList("/api/admin/loai-san"); },
  async getFormChan() { return getList("/api/admin/form-chan"); },
  async getCoGiay() { return getList("/api/admin/co-giay"); },
  async getChatLieu() { return getList("/api/admin/chat-lieu"); },
  async getViTriThiDau() { return getList("/api/admin/vi-tri-thi-dau"); },
  async getPhongCachChoi() { return getList("/api/admin/phong-cach-choi"); },

  // ===== GET active =====
  async getThuongHieuActive() { return getList("/api/admin/thuong-hieu/active"); },
  async getXuatXuActive() { return getList("/api/admin/xuat-xu/active"); },
  async getMauSacActive() { return getList("/api/admin/mau-sac/active"); },
  async getKichThuocActive() { return getList("/api/admin/kich-thuoc/active"); },
  async getLoaiSanActive() { return getList("/api/admin/loai-san/active"); },
  async getFormChanActive() { return getList("/api/admin/form-chan/active"); },
  async getCoGiayActive() { return getList("/api/admin/co-giay/active"); },
  async getChatLieuActive() { return getList("/api/admin/chat-lieu/active"); },
  async getViTriThiDauActive() { return getList("/api/admin/vi-tri-thi-dau/active"); },
  async getPhongCachChoiActive() { return getList("/api/admin/phong-cach-choi/active"); },

  // ===== POST =====
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