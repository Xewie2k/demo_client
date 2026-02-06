import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/admin';

export const voucherService = {
  getAll() {
    return axios.get(`${API_BASE}/phieu-giam-gia`);
  },
  getById(id) {
    return axios.get(`${API_BASE}/phieu-giam-gia/${id}`);
  },
  getCustomerIds(id) {
    return axios.get(`${API_BASE}/phieu-giam-gia/${id}/khach-hang-ids`);
  },
  getCustomers() {
    return axios.get(`${API_BASE}/khach-hang`);
  },
  save(payload) {
    if (payload.id) {
      return axios.put(`${API_BASE}/phieu-giam-gia/${payload.id}`, payload);
    }
    return axios.post(`${API_BASE}/phieu-giam-gia`, payload);
  },
  delete(id) {
    return axios.delete(`${API_BASE}/phieu-giam-gia/${id}`);
  },
  updateStatus(id, payload) {
    return axios.put(`${API_BASE}/phieu-giam-gia/${id}`, payload);
  }
};
