// File: src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "",
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

// ✅ Auto set Content-Type JSON nếu data là object thường
apiClient.interceptors.request.use(
  (config) => {
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (!isFormData) {
      config.headers = config.headers || {};
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    } else {
      if (config.headers?.["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    // ✅ Nếu request đánh dấu silent thì không spam console
    const isSilent = !!err?.config?.meta?.silent;

    if (!isSilent) {
      console.error("API error:", status, data || err?.message);
    }

    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : null) ||
      err?.message ||
      "API error";

    err.userMessage = msg;
    return Promise.reject(err);
  }
);

export default apiClient;
