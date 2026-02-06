// File: src/services/tai_khoan/khach_hang/diaChiKhachHangService.js
const API = "http://localhost:8080/api/admin/dia-chi-khach-hang";

const unwrapJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
};

export const getAllDiaChiKhachHang = async () => {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Load địa chỉ thất bại");
  return await unwrapJson(res);
};

export const getDiaChiByKhachHangId_FEFilter = async (idKhachHang) => {
  const all = await getAllDiaChiKhachHang();
  const arr = Array.isArray(all) ? all : [];
  return arr.filter((x) => String(x?.idKhachHang) === String(idKhachHang) && !x?.xoaMem);
};

// ✅ POST
export const addDiaChiKhachHang = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Thêm địa chỉ thất bại: " + (await res.text()));
  return await unwrapJson(res);
};

// ✅ Alias để đúng tên import trong page (createDiaChiKhachHang)
export const createDiaChiKhachHang = addDiaChiKhachHang;

// ✅ PUT
export const updateDiaChiKhachHang = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật địa chỉ thất bại: " + (await res.text()));
  return await unwrapJson(res);
};

// ✅ DELETE (soft delete bên BE)
export const removeDiaChiKhachHang = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Xóa địa chỉ thất bại: " + (await res.text()));
  return true;
};
