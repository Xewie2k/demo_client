const API = "http://localhost:8080/api/admin/nhan-vien";

const unwrapJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    // nếu BE trả plain text
    return text;
  }
};

const normalize = (v) => (v ?? "").toString().toLowerCase().trim();

export const getAllNhanVien = async () => {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Load dữ liệu thất bại");
  return await unwrapJson(res);
};

// ✅ POST JSON (đúng với @RequestBody)
export const addNhanVien = async (data) => {
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

// ✅ Alias để hết lỗi import createNhanVien trong page
export const createNhanVien = addNhanVien;

// ✅ PUT JSON
export const updateNhanVien = async (id, data) => {
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

export const detailNhanVien = async (id) => {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error("Không tìm thấy nhân viên");
  return await unwrapJson(res);
};

// ✅ DELETE /{id} (đúng controller)
export const removeNhanVien = async (id) => {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Xóa thất bại: " + err);
  }
  return true;
};

// ✅ FE đang gọi /search?keyword=... nhưng BE chưa có search
// => mình làm search phía FE: gọi all() rồi filter (để không phải sửa page)
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
    return (
      t.includes(kw) ||
      u.includes(kw) ||
      e.includes(kw) ||
      p.includes(kw) ||
      m.includes(kw)
    );
  });
};

export const pagingNhanVien = async (page = 0, size = 5) => {
  const res = await fetch(`${API}/page?pageNo=${page}&pageSize=${size}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Load phân trang thất bại: " + err);
  }
  return await unwrapJson(res);
};
