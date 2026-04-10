import axios from "axios";
import { getApiErrorMessage } from "@/services/apiError";

const api = axios.create({
  baseURL:
    import.meta?.env?.VITE_API_URL ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:8080",
  withCredentials: true,
});

const PATH = "/api/admin/kich-thuoc";

function unwrap(res) {
  return res?.data ?? res;
}

function throwApiError(error, fallback) {
  throw new Error(getApiErrorMessage(error, fallback));
}

export default {
  async getAll() {
    try {
      const res = await api.get(PATH);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Không tải được danh sách kích thước.");
    }
  },

  async getOne(id) {
    try {
      const res = await api.get(`${PATH}/${id}`);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Không tải được thông tin kích thước.");
    }
  },

  async create(payload) {
    try {
      const res = await api.post(PATH, payload);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Thêm kích thước thất bại.");
    }
  },

  async update(id, payload) {
    try {
      const res = await api.put(`${PATH}/${id}`, payload);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Cập nhật kích thước thất bại.");
    }
  },

  async remove(id) {
    try {
      const res = await api.delete(`${PATH}/${id}`);
      return unwrap(res);
    } catch (error) {
      throwApiError(error, "Xóa kích thước thất bại.");
    }
  },
};