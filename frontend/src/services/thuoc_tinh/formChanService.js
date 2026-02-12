import axios from "axios";

const apiBase =
  import.meta?.env?.VITE_API_URL ||
  import.meta?.env?.VITE_API_BASE_URL ||
  "http://localhost:8080";

const http = axios.create({
  baseURL: String(apiBase).replace(/\/+$/, ""),
});

const base = "/api/admin/form-chan";

export default {
  getAll() {
    return http.get(base);
  },
  getOne(id) {
    return http.get(`${base}/${id}`);
  },
  create(payload) {
    return http.post(base, payload);
  },
  update(id, payload) {
    return http.put(`${base}/${id}`, payload);
  },
  remove(id) {
    return http.delete(`${base}/${id}`);
  },
};
