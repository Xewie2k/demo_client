// File: src/services/tai_khoan/nhan_vien/nhan_vienService.js
const API = "http://localhost:8080/api/admin/nhan-vien";

const unwrapJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();

  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const normalize = (v) => (v ?? "").toString().toLowerCase().trim();

export const getAllNhanVien = async () => {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Load dữ liệu thất bại");
  return await unwrapJson(res);
};

export const detailNhanVien = async (id) => {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error("Không tìm thấy nhân viên");
  return await unwrapJson(res);
};

export const addNhanVien = async (data) => {
  const isForm = data instanceof FormData;

  const res = await fetch(API, {
    method: "POST",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? data : JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await unwrapJson(res);
    throw new Error(err?.detail || err?.message || "Thêm thất bại");
  }
  return await unwrapJson(res);
};

export const updateNhanVien = async (id, data) => {
  const isForm = data instanceof FormData;

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? data : JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await unwrapJson(res);
    throw new Error(err?.detail || err?.message || "Cập nhật thất bại");
  }
  return await unwrapJson(res);
};

export const removeNhanVien = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await unwrapJson(res);
    throw new Error(err?.detail || err?.message || "Xóa thất bại");
  }
  return true;
};

// search FE
export const searchNhanVien = async (keyword) => {
  const list = await getAllNhanVien();
  const kw = normalize(keyword);
  if (!kw) return Array.isArray(list) ? list : [];

  const arr = Array.isArray(list) ? list : [];
  return arr.filter((x) => {
    const t = normalize(x.tenNhanVien);
    const u = normalize(x.tenTaiKhoan);
    const e = normalize(x.email);
    const p = normalize(x.soDienThoai);
    const m = normalize(x.maNhanVien);
    return t.includes(kw) || u.includes(kw) || e.includes(kw) || p.includes(kw) || m.includes(kw);
  });
};

export const pagingNhanVien = async (page = 0, size = 5) => {
  const res = await fetch(`${API}/page?pageNo=${page}&pageSize=${size}`);
  if (!res.ok) {
    const err = await unwrapJson(res);
    throw new Error(err?.detail || err?.message || "Load phân trang thất bại");
  }
  return await unwrapJson(res);
};
