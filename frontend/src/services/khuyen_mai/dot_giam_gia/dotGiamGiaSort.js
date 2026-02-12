// File: src/services/khuyen_mai/dot_giam_gia/dotGiamGiaSort.js

const parseDateAny = (input) => {
  if (!input) return null;

  // BE có thể trả LocalDate dạng [yyyy, mm, dd]
  if (Array.isArray(input)) {
    const [y, m, d] = input;
    if (!y) return null;
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  // string yyyy-mm-dd
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Date / timestamp
  const dt = new Date(input);
  return isNaN(dt.getTime()) ? null : dt;
};

const dateKey = (input) => {
  const d = parseDateAny(input);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const rangeKey = (item) => {
  return `${dateKey(item?.ngayBatDau)}|${dateKey(item?.ngayKetThuc)}`;
};

const safeNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * Rule:
 * - Nếu cùng (ngayBatDau, ngayKetThuc): sort mucUuTien desc -> giaTriGiamGia desc -> id desc
 * - Khác khoảng thời gian: sort ngayBatDau desc -> ngayKetThuc desc -> id desc
 */
export const sortDotGiamGia = (list) => {
  const arr = Array.isArray(list) ? [...list] : [];

  arr.sort((a, b) => {
    const aKey = rangeKey(a);
    const bKey = rangeKey(b);

    const aStart = parseDateAny(a?.ngayBatDau);
    const bStart = parseDateAny(b?.ngayBatDau);
    const aEnd = parseDateAny(a?.ngayKetThuc);
    const bEnd = parseDateAny(b?.ngayKetThuc);

    const aStartT = aStart ? aStart.getTime() : -Infinity;
    const bStartT = bStart ? bStart.getTime() : -Infinity;
    const aEndT = aEnd ? aEnd.getTime() : -Infinity;
    const bEndT = bEnd ? bEnd.getTime() : -Infinity;

    // Cùng khoảng thời gian -> ưu tiên + giá trị giảm
    if (aKey && aKey === bKey) {
      const pA = safeNum(a?.mucUuTien, 0);
      const pB = safeNum(b?.mucUuTien, 0);
      if (pA !== pB) return pB - pA;

      const vA = safeNum(a?.giaTriGiamGia, 0);
      const vB = safeNum(b?.giaTriGiamGia, 0);
      if (vA !== vB) return vB - vA;

      return safeNum(b?.id, 0) - safeNum(a?.id, 0);
    }

    // Khác khoảng thời gian -> mới nhất -> cũ nhất
    if (aStartT !== bStartT) return bStartT - aStartT;
    if (aEndT !== bEndT) return bEndT - aEndT;
    return safeNum(b?.id, 0) - safeNum(a?.id, 0);
  });

  return arr;
};
