const API_PHAN_CONG = "http://localhost:8080/api/admin/lich-lam-viec-nhan-vien";

const unwrapJson = async (res) => {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
};

export const getLichLamViecNhanVien = async (idNhanVien, ngayLam) => {
  const res = await fetch(`${API_PHAN_CONG}/nhan-vien/${idNhanVien}?ngayLam=${ngayLam}`);

  if (!res.ok) {
    throw new Error("Không tìm thấy lịch làm việc của nhân viên");
  }
  return await res.json();
};


export const getAllPhanCong = async (data) => {
  const res = await fetch(API_PHAN_CONG);
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Load lịch làm việc nhân viên thất bại: " + err);
  }
  return await unwrapJson(res);
};

// export const pagingLichNhanVien = async (page = 0, size = 5) => {
//   const res = await fetch(`${API_PHAN_CONG}/page?pageNo=${page}&pageSize=${size}`);
//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error("Load danh sách phân công thất bại: " + err);
//   }
//   return await unwrapJson(res);
// };


export const createPhanCong = async (data) => {
  const res = await fetch(API_PHAN_CONG, {
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

export const removePhanCong = async (id) => {
  const res = await fetch(`${API_PHAN_CONG}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Gỡ nhân viên thất bại: " + err);
  }
  return true;
};

export const importPhanCongExcel = async (formData) => {
  const res = await fetch(`${API_PHAN_CONG}/import-excel`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Lỗi khi import file Excel phân công");
  }

  return await unwrapJson(res);
};

export const getNhanVienTheoLich = async (idLich) => {
    const res = await fetch(`${API_PHAN_CONG}/lich/${idLich}`);
    if (!res.ok) {
        const err = await res.text();
        throw new Error("Không thể lấy danh sách nhân viên của lịch này: " + err);
    }
    return await unwrapJson(res);
};