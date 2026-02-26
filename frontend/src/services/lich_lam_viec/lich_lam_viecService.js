
const API_LICH = "http://localhost:8080/api/admin/lich-lam-viec";

const unwrapJson = async (res) => {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
};

export const checkLichLamViec = async (data) => {
  const params = new URLSearchParams({
    ca: data.ca,
    ngay: data.ngay
  }).toString();

  const res = await fetch(`${API_LICH}/check?${params}`);

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Kiểm tra lịch làm việc thất bại: " + err);
  }
  
  return await unwrapJson(res);
};

export const getAllLichLamViec = async (data) => {
  const res = await fetch(API_LICH);
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Load lịch làm việc thất bại: " + err);
  }
  return await unwrapJson(res);
};

export const pagingLichLamViec = async (page = 0, size = 5) => {
  const res = await fetch(`${API_LICH}/page?pageNo=${page}&pageSize=${size}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Load phân trang lịch làm việc thất bại: " + err);
  }
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

export const updateLich = async (id, data) => {
  const res = await fetch(`${API_LICH}/${id}`, {
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

export const removeLich = async (id) => {
  const res = await fetch(`${API_LICH}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Xóa thất bại: " + err);
  }
  return true;
};

export const importLichExcel = async (formData) => {
  const res = await fetch(`${API_LICH}/import-excel`, {
    method: "POST",
    body: formData, 
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Lỗi khi import file Excel");
  }

  return await unwrapJson(res);
};