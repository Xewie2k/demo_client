// File: src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "",
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

/* =========================================================
 * ✅ LẤY ROLE ĐĂNG NHẬP (giống router)
 * ========================================================= */
function normalizeRole(role) {
  const r = String(role || "").trim().toUpperCase();
  if (r === "STAFF") return "NHAN_VIEN";
  if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";
  return r;
}

function getUserObj() {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;
  return safeParseJson(raw);
}

function getUserRole() {
  const u = getUserObj();

  const role =
    u?.role ||
    u?.vaiTro ||
    u?.tenVaiTro ||
    u?.tenQuyenHan ||
    u?.quyenHan?.tenQuyenHan ||
    u?.quyenHan;

  return normalizeRole(role);
}

/* =========================================================
 * ✅ LẤY ID NHÂN VIÊN (để gắn header audit cho admin)
 * ========================================================= */
function getNhanVienId() {
  const prefer = safeParseJson(localStorage.getItem("ss_nguoi_ban") || "null");
  const u1 = safeParseJson(localStorage.getItem("user") || "null");
  const u2 = safeParseJson(sessionStorage.getItem("ss_nguoi_ban") || "null");
  const u3 = safeParseJson(sessionStorage.getItem("user") || "null");

  const u = prefer || u1 || u2 || u3;
  if (!u || typeof u !== "object") return null;

  const id = u.idNhanVien || u.nhanVienId || u.id || u.userId || u.nhanVien?.id || null;

  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? String(n) : null;
}

/* =========================================================
 * ✅ Cấu hình chặn thao tác nếu chưa mở ca (CHỈ ADMIN)
 * ========================================================= */
const DS_API_KHONG_CHAN_MO_CA = [
  "/login", // tuỳ dự án
  "/giao-ca", // cho phép thao tác liên quan ca
  "/nhan-vien", // tuỳ dự án
];

function laApiKhongChanMoCa(url = "") {
  return DS_API_KHONG_CHAN_MO_CA.some((x) => url.includes(x));
}

function laMethodThayDoiDuLieu(method = "") {
  const m = String(method).toLowerCase();
  return ["post", "put", "patch", "delete"].includes(m);
}

function laApiClient(url = "") {
  const u = String(url || "");
  return u.includes("/api/client");
}

function laApiAdmin(url = "") {
  const u = String(url || "");
  return u.includes("/api/admin");
}

function taoLoiChanMoCa() {
  const err = new Error("Blocked by Shift Permission"); // giữ để tương thích
  err.code = "CHAN_MO_CA";
  err.isBlockedByShift = true;
  err.userMessage = "LỖI: Chế độ chỉ xem. Bạn chưa mở ca làm việc nên không thể thực hiện thao tác này!";
  return err;
}

/* =========================================================
 * ✅ Request interceptor:
 *  - BỎ CHẶN cho /api/client/**
 *  - CHỈ CHẶN cho /api/admin/** khi role = NHAN_VIEN và method là POST/PUT/PATCH/DELETE
 *  - GẮN header NV cho /api/admin/**
 *  - Xử lý Content-Type
 * ========================================================= */
apiClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    const meta = config.meta || {};

    const url = String(config.url || "");
    const method = String(config.method || "get").toLowerCase();

    // =========================
    // 0) CLIENT API: KHÔNG LIÊN QUAN CA LÀM -> KHÔNG CHẶN
    // =========================
    if (laApiClient(url)) {
      // vẫn xử lý content-type phía dưới
    } else {
      // =========================
      // 1) LỚP BẢO VỆ: CHỈ CHẶN ADMIN + NHÂN VIÊN + THAY ĐỔI DỮ LIỆU
      // =========================
      const role = getUserRole();

      if (
        !meta.boQuaChanMoCa &&
        laApiAdmin(url) &&
        role === "NHAN_VIEN" &&
        laMethodThayDoiDuLieu(method)
      ) {
        const isKhongChan = laApiKhongChanMoCa(url);

        if (!isKhongChan) {
          const hasActiveShift = sessionStorage.getItem("ss_has_active_shift") === "true";

          if (!hasActiveShift) {
            const err = taoLoiChanMoCa();

            // Mặc định có cảnh báo, nhưng cho phép tắt theo từng request
            if (meta.tuDongCanhBao !== false) {
              alert(err.userMessage);
            }

            return Promise.reject(err);
          }
        }
      }
    }

    // =========================
    // 2) GẮN HEADER NHÂN VIÊN (chỉ cho ADMIN API)
    // =========================
    if (laApiAdmin(url)) {
      const nvId = getNhanVienId();
      if (nvId) {
        if (!config.headers["X-Nhan-Vien-Id"]) config.headers["X-Nhan-Vien-Id"] = nvId;
        if (!config.headers["X-NV-ID"]) config.headers["X-NV-ID"] = nvId;
      }
    }

    // =========================
    // 3) CONTENT-TYPE: xử lý FormData + tránh ép JSON cho kiểu đặc biệt
    // =========================
    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

    const isUrlSearchParams =
      typeof URLSearchParams !== "undefined" && config.data instanceof URLSearchParams;

    const isArrayBuffer = typeof ArrayBuffer !== "undefined" && config.data instanceof ArrayBuffer;

    const isBlob = typeof Blob !== "undefined" && config.data instanceof Blob;
    const isFile = typeof File !== "undefined" && config.data instanceof File;

    if (isFormData) {
      if (config.headers?.["Content-Type"]) delete config.headers["Content-Type"];
    } else if (!isUrlSearchParams && !isArrayBuffer && !isBlob && !isFile) {
      if (!config.headers["Content-Type"] && config.data !== undefined) {
        // chỉ set khi có data (tránh set thừa cho GET không body)
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (err) => Promise.reject(err)
);

/* =========================================================
 * ✅ Response interceptor: log có kiểm soát + userMessage
 * ========================================================= */
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Nếu là lỗi do bị chặn mở ca thì không log
    if (err?.isBlockedByShift || err?.code === "CHAN_MO_CA") {
      return Promise.reject(err);
    }

    const status = err?.response?.status;
    const data = err?.response?.data;

    const isSilent = !!err?.config?.meta?.silent;
    if (!isSilent) {
      console.error("API error:", status, data || err?.message);
    }

    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      err?.message ||
      "Lỗi API";

    err.userMessage = err.userMessage || msg;
    return Promise.reject(err);
  }
);

export default apiClient;
