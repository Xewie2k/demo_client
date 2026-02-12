const API_LICH = "http://localhost:8080/api/lich-lam-viec";

const unwrapJson = async (res) => {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
};

export const getLichPage = async (page = 0, size = 10) => {
  const res = await fetch(`${API_LICH}?page=${page}&size=${size}`);
  if (!res.ok) throw new Error("Load lịch thất bại");
  return await unwrapJson(res);
};

export const createLich = async (data) => {
  // data: { idNhanVien, idCaLam, ngayLam, ghiChu }
  const res = await fetch(API_LICH, {
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