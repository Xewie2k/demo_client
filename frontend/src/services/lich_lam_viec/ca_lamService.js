// Giả sử bạn đã tạo Controller cho CaLam tại endpoint này
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