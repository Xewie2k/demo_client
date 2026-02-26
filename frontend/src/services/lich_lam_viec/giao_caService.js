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

const handleResponse = async (response) => {
    if (response.status === 204) return null;

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const error = new Error(data?.message || "Có lỗi xảy ra");
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const checkActiveCa = async (idNhanVien) => {
    const response = await fetch(`${API_GIAO_CA}/check-active/${idNhanVien}`);
    return handleResponse(response);
};

export const getCaTruocGanNhat = async () => {
    const response = await fetch(`${API_GIAO_CA}/ca-truoc`);
    return handleResponse(response);
};

export const xacNhanTienDauCa = async (idGiaoCa, tienDauCaNhap) => {
    const response = await fetch(`${API_GIAO_CA}/xac-nhan-tien/${idGiaoCa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tienDauCaNhap })
    });

    return handleResponse(response);
};

export const batDauCa = async (payload) => {
    // Payload mong đợi: { idNhanVien, tienDauCaNhap, idLichLamViec }
    const response = await fetch(`${API_GIAO_CA}/bat-dau`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

export const ketThucCa = async (idGiaoCa, payload) => {
    // Payload mong đợi: { ghiChu, ... }
    const response = await fetch(`${API_GIAO_CA}/ket-thuc/${idGiaoCa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};