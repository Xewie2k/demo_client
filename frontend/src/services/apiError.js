export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra. Vui lòng thử lại.") {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  if (error?.message && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}