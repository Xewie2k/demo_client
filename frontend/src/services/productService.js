// File: src/services/productService.js
import apiClient from "./apiClient";

const BASE = "/api/admin/san-pham";

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

const softDelete = async (id) => remove(id);

const uploadAnh = async (id, file) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await apiClient.post(`${BASE}/${id}/upload-anh`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res?.data ?? res;
};

const uploadImage = async (id, file) => uploadAnh(id, file);

export default {
  getAll,
  getOne,
  create,
  update,
  remove,
  softDelete,
  uploadAnh,
  uploadImage,
};
