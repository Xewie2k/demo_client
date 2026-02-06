import axios from "axios";

// đổi baseURL theo BE của bạn nếu khác
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
});

const PATH = "/api/admin/co-giay";

export default {
  getAll() {
    return api.get(PATH).then((r) => r.data);
  },

  create(payload) {
    return api.post(PATH, payload).then((r) => r.data);
  },

  update(id, payload) {
    return api.put(`${PATH}/${id}`, payload).then((r) => r.data);
  },

  softDelete(id) {
    // nếu BE của bạn dùng DELETE mềm
    return api.delete(`${PATH}/${id}`).then((r) => r.data);
  },
};
