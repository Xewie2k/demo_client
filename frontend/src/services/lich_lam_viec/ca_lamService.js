// Giả sử bạn đã tạo Controller cho CaLam tại endpoint này
const API_CA_LAM = "http://localhost:8080/api/admin/ca-lam"; 

export const getAllCaLam = async () => {
  const res = await fetch(API_CA_LAM);
  if (!res.ok) return []; // Trả về mảng rỗng nếu lỗi hoặc chưa làm API
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};