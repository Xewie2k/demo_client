import axios from "axios";

const apiClient = axios.create({
  // QUAN TRONG: để rỗng hoặc "/" để request /api/... chạy cùng origin 5173
  // và Vite sẽ proxy sang 8080 => không CORS
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    const msg =
      data?.detail ||
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      err?.message ||
      "API error";

    console.error(`API Error (${status}):`, msg);

    err.userMessage = msg;
    return Promise.reject(err);
  }
);

export default apiClient;
