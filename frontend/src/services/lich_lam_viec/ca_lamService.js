// Giả sử bạn đã tạo Controller cho CaLam tại endpoint
const API_CA_LAM = "http://localhost:8080/api/admin/ca-lam"; 

const unwrapJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
};

export const getAllCaLam = async () => {
  const res = await fetch(API_CA_LAM);
  if (!res.ok) throw new Error("Load dữ liệu ca làm thất bại");
  return await unwrapJson(res);
};

export const createCaLam = async (data) => {
  // data: { idNhanVien, idCaLam, ngayLam, ghiChu }
  const res = await fetch(API_CA_LAM, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return await unwrapJson(res);
};

export const updateCaLam = async (id, data) => {
  const res = await fetch(`${API_CA_LAM}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Cập nhật thất bại: " + err);
  }
  return await unwrapJson(res);
};