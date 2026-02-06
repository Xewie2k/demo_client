const API = "http://localhost:8080/api/admin/khach-hang";

const unwrapJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return text;
  }
};

const normalize = (v) => (v ?? "").toString().toLowerCase().trim();

export const getAllKhachHang = async () => {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Load dữ liệu khách hàng thất bại");
  return await unwrapJson(res);
};

// ✅ POST JSON (đúng @RequestBody)
export const addKhachHang = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Thêm thất bại: " + err);
  }
  return await unwrapJson(res);
};

// ✅ Alias để hết lỗi import createKhachHang (nếu page nào đang dùng)
export const createKhachHang = addKhachHang;

// ✅ PUT JSON
export const updateKhachHang = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
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

export const detailKhachHang = async (id) => {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error("Không tìm thấy khách hàng");
  return await unwrapJson(res);
};

// ✅ DELETE /{id} (đúng controller)
export const removeKhachHang = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Xóa khách hàng thất bại: " + err);
  }
  return true;
};

// ✅ FE đang gọi /search?keyword=... nhưng BE chưa có search
// => search phía FE: gọi all() rồi filter (để không phải sửa page)
export const searchKhachHang = async (keyword) => {
  const list = await getAllKhachHang();
  const kw = normalize(keyword);
  if (!kw) return Array.isArray(list) ? list : [];

  const arr = Array.isArray(list) ? list : [];
  return arr.filter((x) => {
    const m = normalize(x.maKhachHang);
    const t = normalize(x.tenKhachHang);
    const u = normalize(x.tenTaiKhoan);
    const e = normalize(x.email);
    const p = normalize(x.soDienThoai);
    return (
      m.includes(kw) ||
      t.includes(kw) ||
      u.includes(kw) ||
      e.includes(kw) ||
      p.includes(kw)
    );
  });
};

export const pagingKhachHang = async (page = 0, size = 5) => {
  const res = await fetch(`${API}/page?pageNo=${page}&pageSize=${size}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Load phân trang khách hàng thất bại: " + err);
  }
  return await unwrapJson(res);
};
