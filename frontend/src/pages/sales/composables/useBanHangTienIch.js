// File: src/pages/sales/composables/useBanHangTienIch.js
export function useBanHangTienIch() {
  function safeParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  function clampInt(n, min, max) {
    let x = Number(n);
    if (!Number.isFinite(x)) x = min;
    x = Math.floor(x);
    if (x < min) x = min;
    if (x > max) x = max;
    return x;
  }

  function todayYmd() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function toYmd(v) {
    if (!v) return "";
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return v.trim();

    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch (e) {
      return "";
    }
  }

  function parseMoneyText(text) {
    const digits = String(text || "").replace(/\D/g, "");
    const n = digits ? Number(digits) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function formatMoney(v) {
    const n = Number(v || 0);
    try {
      return n.toLocaleString("vi-VN") + " đ";
    } catch (e) {
      return n + " đ";
    }
  }

  function formatNumberText(n) {
    const x = Number(n || 0);
    if (!Number.isFinite(x) || x <= 0) return "";
    try {
      return x.toLocaleString("vi-VN");
    } catch (e) {
      return String(x);
    }
  }

  function toNumberSafe(v) {
    if (v == null) return 0;
    const n = Number(String(v).replace("%", "").trim());
    return Number.isFinite(n) ? n : 0;
  }

  function normalizePercent(raw) {
    let n = toNumberSafe(raw);
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (n > 0 && n <= 1) n = n * 100;
    n = Math.round(n);
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return n;
  }

  function resolveImage(url) {
    if (!url) return "";
    const u = String(url).trim();
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;

    const base = import.meta.env.VITE_FILE_BASE_URL || "http://localhost:8080";
    if (u.startsWith("/")) return base + u;
    return base + "/" + u;
  }

  function blurActive() {
    try {
      document.activeElement?.blur?.();
    } catch (e) {}
  }

  return {
    safeParse,
    clampInt,
    todayYmd,
    toYmd,
    parseMoneyText,
    formatMoney,
    formatNumberText,
    toNumberSafe,
    normalizePercent,
    resolveImage,
    blurActive,
  };
}