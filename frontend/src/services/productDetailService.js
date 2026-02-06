// src/services/productDetailService.js
import apiClient from "./apiClient";

const BASE = "/api/admin/chi-tiet-san-pham";

/**
 * Robust unwrap: chịu được các kiểu BE trả về:
 * - []
 * - { data: [] }
 * - { data: { data: [] } }
 * - { data: { content: [] } } (Page)
 * - { data: { data: { content: [] } } }
 */
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

const getAll = async () => {
  const res = await apiClient.get(BASE);
  return unwrapList(res);
};

const getOne = async (id) => {
  const res = await apiClient.get(`${BASE}/${id}`);
  return res?.data ?? res;
};

const getBySanPham = async (idSanPham) => {
  const res = await apiClient.get(`${BASE}/by-san-pham/${idSanPham}`);
  return unwrapList(res);
};

const create = async (payload) => {
  const res = await apiClient.post(BASE, payload);
  return res?.data ?? res;
};

const update = async (id, payload) => {
  const res = await apiClient.put(`${BASE}/${id}`, payload);
  return res?.data ?? res;
};

const remove = async (id) => {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res?.data ?? res;
};

// ✅ alias để code cũ không văng lỗi
const softDelete = async (id) => remove(id);

export default {
  getAll,
  getOne,
  getBySanPham,
  create,
  update,
  remove,
  softDelete,
};
