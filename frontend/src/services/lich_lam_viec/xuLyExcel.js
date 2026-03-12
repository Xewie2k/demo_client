// File: src/services/lich_lam_viec/xuLyExcel.js
import * as XLSX from "xlsx";

const boDau = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const chuanHoaText = (value) => {
  return boDau(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

const normalizeHeaderKey = (header) => {
  const key = chuanHoaText(header);

  if (key === "stt") return "STT";
  if (["manhanvien", "manv"].includes(key)) return "MaNhanVien";
  if (["tennhanvien", "tennv", "nhanvien1", "nhanvien"].includes(key)) return "TenNhanVien";
  if (["calam", "tenca", "ca"].includes(key)) return "TenCa";
  if (["ngaylam", "ngay"].includes(key)) return "NgayLam";
  if (["ghichu", "ghichu1", "note"].includes(key)) return "GhiChu";

  return header;
};

const laDongTrong = (row) => {
  return (
    !String(row.MaNhanVien || "").trim() &&
    !String(row.TenNhanVien || "").trim() &&
    !String(row.TenCa || "").trim() &&
    !String(row.NgayLam || "").trim() &&
    !String(row.GhiChu || "").trim()
  );
};

const pad2 = (value) => String(value).padStart(2, "0");

const taoNgayISO = (year, month, day) => {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  if (
    !Number.isInteger(y) ||
    !Number.isInteger(m) ||
    !Number.isInteger(d) ||
    y < 1000 ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31
  ) {
    return null;
  }

  const check = new Date(Date.UTC(y, m - 1, d));
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() + 1 !== m ||
    check.getUTCDate() !== d
  ) {
    return null;
  }

  return `${String(y).padStart(4, "0")}-${pad2(m)}-${pad2(d)}`;
};

export const parseNgayToISO = (giaTriNgay) => {
  if (giaTriNgay === null || giaTriNgay === undefined || giaTriNgay === "") {
    return null;
  }

  // Trường hợp [yyyy, mm, dd]
  if (Array.isArray(giaTriNgay) && giaTriNgay.length >= 3) {
    const [year, month, day] = giaTriNgay;
    return taoNgayISO(year, month, day);
  }

  // Trường hợp Date object
  if (giaTriNgay instanceof Date && !Number.isNaN(giaTriNgay.getTime())) {
    return taoNgayISO(
      giaTriNgay.getFullYear(),
      giaTriNgay.getMonth() + 1,
      giaTriNgay.getDate()
    );
  }

  // Trường hợp Excel serial number
  if (typeof giaTriNgay === "number" && !Number.isNaN(giaTriNgay)) {
    const parsed = XLSX.SSF.parse_date_code(giaTriNgay);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return taoNgayISO(parsed.y, parsed.m, parsed.d);
    }
    return null;
  }

  const value = String(giaTriNgay).trim();
  if (!value) return null;

  const normalizedValue = value
    .replace(/\./g, "/")
    .replace(/\s+/g, " ")
    .trim();

  // yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss
  let match = normalizedValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (match) {
    const [, y, m, d] = match;
    return taoNgayISO(y, m, d);
  }

  // yyyy/MM/dd
  match = normalizedValue.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (match) {
    const [, y, m, d] = match;
    return taoNgayISO(y, m, d);
  }

  // dd/MM/yyyy
  match = normalizedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return taoNgayISO(y, m, d);
  }

  // dd-MM-yyyy
  match = normalizedValue.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return taoNgayISO(y, m, d);
  }

  return null;
};

export const dinhDangNgayPreview = (giaTriNgay) => {
  const iso = parseNgayToISO(giaTriNgay);
  if (!iso) return "-";

  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const normalizeExcelRows = (rows = []) => {
  return rows
    .map((row, index) => {
      const normalized = {
        rowNum: row?.rowNum || index + 2,
        STT: "",
        MaNhanVien: "",
        TenNhanVien: "",
        TenCa: "",
        NgayLam: "",
        GhiChu: "",
      };

      Object.keys(row || {}).forEach((rawKey) => {
        if (rawKey === "rowNum") return;

        const mappedKey = normalizeHeaderKey(rawKey);
        if (Object.prototype.hasOwnProperty.call(normalized, mappedKey)) {
          normalized[mappedKey] = row[rawKey];
        }
      });

      return normalized;
    })
    .filter((row) => !laDongTrong(row));
};

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Vui lòng chọn file"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;

        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: false,
        });

        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        if (!sheet) {
          reject(new Error("Không tìm thấy sheet dữ liệu"));
          return;
        }

        // Đọc theo text hiển thị của Excel để tránh lệch timezone
        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
          dateNF: "dd/MM/yyyy",
        });

        if (!rows || rows.length === 0) {
          reject(new Error("File Excel không có dữ liệu"));
          return;
        }

        const transformedData = rows.map((row, index) => ({
          rowNum: index + 2,
          ...row,
        }));

        resolve(transformedData);
      } catch (error) {
        reject(new Error("Lỗi khi đọc file Excel: " + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Không thể đọc file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const validateScheduleData = (data = [], listCa = [], listNhanVien = []) => {
  const errors = [];
  const warnings = [];

  const rows = normalizeExcelRows(data);
  const duplicateSet = new Set();

  rows.forEach((row) => {
    const rowNum = row.rowNum || 0;

    const maNhanVien = String(row.MaNhanVien || "").trim();
    const tenNhanVien = String(row.TenNhanVien || "").trim();
    const tenCa = String(row.TenCa || "").trim();
    const ngayLamISO = parseNgayToISO(row.NgayLam);

    if (!maNhanVien) {
      errors.push(`Dòng ${rowNum}: Mã Nhân Viên không được để trống`);
    }

    if (!tenNhanVien) {
      errors.push(`Dòng ${rowNum}: Tên Nhân Viên không được để trống`);
    }

    if (!tenCa) {
      errors.push(`Dòng ${rowNum}: Ca Làm không được để trống`);
    }

    if (!row.NgayLam) {
      errors.push(`Dòng ${rowNum}: Ngày Làm không được để trống`);
    } else if (!ngayLamISO) {
      errors.push(`Dòng ${rowNum}: Ngày Làm không đúng định dạng (YYYY-MM-DD hoặc DD/MM/YYYY)`);
    }

    const nhanVien = maNhanVien
      ? listNhanVien.find(
          (nv) => chuanHoaText(nv.maNhanVien) === chuanHoaText(maNhanVien)
        )
      : null;

    if (maNhanVien && !nhanVien) {
      errors.push(`Dòng ${rowNum}: Mã Nhân Viên "${maNhanVien}" không tồn tại`);
    }

    if (
      nhanVien &&
      tenNhanVien &&
      chuanHoaText(tenNhanVien) !== chuanHoaText(nhanVien.tenNhanVien)
    ) {
      warnings.push(
        `Dòng ${rowNum}: Tên Nhân Viên không khớp với mã "${maNhanVien}". Hệ thống sẽ ưu tiên dữ liệu theo mã nhân viên.`
      );
    }

    const ca = tenCa
      ? listCa.find((item) => chuanHoaText(item.tenCa) === chuanHoaText(tenCa))
      : null;

    if (tenCa && !ca) {
      errors.push(`Dòng ${rowNum}: Ca Làm "${tenCa}" không tồn tại`);
    }

    if (nhanVien && ca && ngayLamISO) {
      const duplicateKey = `${nhanVien.id}-${ca.id}-${ngayLamISO}`;

      if (duplicateSet.has(duplicateKey)) {
        warnings.push(`Dòng ${rowNum}: Bị trùng nhân viên + ca làm + ngày làm với một dòng khác trong file`);
      } else {
        duplicateSet.add(duplicateKey);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedData: rows,
  };
};

export const isValidDate = (dateValue) => {
  return !!parseNgayToISO(dateValue);
};

export const formatDataForPreview = (data = []) => {
  const rows = normalizeExcelRows(data);

  return rows.map((row, index) => ({
    ...row,
    STT: row.STT || index + 1,
    displayText: `Dòng ${row.rowNum}: ${row.MaNhanVien || "-"} | ${row.TenNhanVien || "-"} | ${row.TenCa || "-"} | ${dinhDangNgayPreview(row.NgayLam)} | ${row.GhiChu || "-"}`,
  }));
};