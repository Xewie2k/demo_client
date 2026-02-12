const API_GIAO_CA = "http://localhost:8080/api/giao-ca";

const unwrapJson = async (res) => {
  if (res.status === 204) return null; // No content
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

export const checkActiveCa = async (idNhanVien) => {
  const res = await fetch(`${API_GIAO_CA}/check-active/${idNhanVien}`);
  // Nếu 204 (No Content) tức là chưa vào ca
  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Lỗi kiểm tra ca làm việc");
  return await unwrapJson(res);
};

export const batDauCa = async (data) => {
  // data: { idNhanVien, tienBanDau }
  const res = await fetch(`${API_GIAO_CA}/bat-dau`, {
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

export const ketThucCa = async (idGiaoCa, data) => {
  // data: { tongTienTrongKet, ghiChu, idNhanVienTiepNhan }
  const res = await fetch(`${API_GIAO_CA}/ket-thuc/${idGiaoCa}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return await unwrapJson(res);
};