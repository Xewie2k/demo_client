// File: src/services/lich_lam_viec/giao_caService.js
const API_GIAO_CA = "http://localhost:8080/api/admin/giao-ca";

const parseResponseData = async (response) => {
  if (response.status === 204) return null;

  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await parseResponseData(response);

  if (!response.ok) {
    const error = new Error(data?.message || "Có lỗi xảy ra");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const checkActiveCa = async (idNhanVien) => {
  return await request(`${API_GIAO_CA}/check-active/${idNhanVien}`);
};

export const xacNhanTienDauCa = async (idGiaoCa, tienDauCaNhap) => {
  return await request(`${API_GIAO_CA}/xac-nhan-tien/${idGiaoCa}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tienDauCaNhap }),
  });
};

export const batDauCa = async (payload) => {
  return await request(`${API_GIAO_CA}/bat-dau`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const ketThucCa = async (idGiaoCa, payload) => {
  return await request(`${API_GIAO_CA}/ket-thuc/${idGiaoCa}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const getLichSuGiaoCa = async (pageNo = 0, pageSize = 100) => {
  return await request(`${API_GIAO_CA}/page?pageNo=${pageNo}&pageSize=${pageSize}`);
};