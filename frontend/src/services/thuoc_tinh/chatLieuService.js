import axios from "axios";
import { getApiErrorMessage } from "@/services/apiError";

const apiBase =
  import.meta?.env?.VITE_API_URL ||
  import.meta?.env?.VITE_API_BASE_URL ||
  "http://localhost:8080";

const http = axios.create({
  baseURL: String(apiBase).replace(/\/+$/, ""),
  withCredentials: true,
});

const base = "/api/admin/chat-lieu";

function unwrap(res) {
  return res?.data ?? res;
}

function throwApiError(error, fallback) {
  throw new Error(getApiErrorMessage(error, fallback));
}

export default {
  async getAll() {
    try {
      const res = await http.get(base);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Không tải được danh sách chất liệu.");
    }
  },

  async getOne(id) {
    try {
      const res = await http.get(`${base}/${id}`);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Không tải được thông tin chất liệu.");
    }
  },

  async create(payload) {
    try {
      const res = await http.post(base, payload);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Thêm chất liệu thất bại.");
    }
  },

  async update(id, payload) {
    try {
      const res = await http.put(`${base}/${id}`, payload);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Cập nhật chất liệu thất bại.");
    }
  },

  async remove(id) {
    try {
      const res = await http.delete(`${base}/${id}`);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Xóa chất liệu thất bại.");
    }
  },
};