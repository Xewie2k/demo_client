import apiClient from "@/services/apiClient";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

const BACKEND_WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";
const THONG_BAO_API = "/api/admin/thong-bao";
const CHU_DE_THONG_BAO = "/topic/thong-bao/";
const DUOI_DEM_CHUA_DOC = "/dem-chua-doc";

let clientThongBao = null;

function parseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function layNguoiDungDangNhap() {
  return (
    parseJson(localStorage.getItem("user")) ||
    parseJson(sessionStorage.getItem("user")) ||
    parseJson(localStorage.getItem("nguoiDung")) ||
    parseJson(sessionStorage.getItem("nguoiDung")) ||
    parseJson(localStorage.getItem("ss_nguoi_ban")) ||
    parseJson(sessionStorage.getItem("ss_nguoi_ban")) ||
    null
  );
}

export function layIdNhanVienDangNhap() {
  const user = layNguoiDungDangNhap();
  if (!user || typeof user !== "object") return null;

  const rawId =
    user.idNhanVien ||
    user.nhanVienId ||
    user.id ||
    user.userId ||
    user.nhanVien?.id ||
    null;

  const id = Number(rawId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function taoClientThongBao() {
  if (!clientThongBao) {
    clientThongBao = new Client({
      webSocketFactory: () => new SockJS(BACKEND_WS_URL),
      reconnectDelay: 5000,
      debug: () => {},
      onStompError: (frame) => {
        console.error("[ThongBao] STOMP error:", frame);
      },
      onWebSocketError: (event) => {
        console.error("[ThongBao] WebSocket error:", event);
      },
    });
  }
  return clientThongBao;
}

function docBody(message) {
  try {
    return JSON.parse(message.body);
  } catch {
    return message.body;
  }
}

export function ketNoiThongBao({
  idNhanVien,
  khiCoThongBaoMoi,
  khiCapNhatDemChuaDoc,
  khiLoi,
} = {}) {
  if (!idNhanVien) return () => {};

  const client = taoClientThongBao();
  const subscriptions = [];
  let daHuy = false;

  const dangKy = () => {
    if (!client.connected || daHuy) return;

    subscriptions.push(
      client.subscribe(`${CHU_DE_THONG_BAO}${idNhanVien}`, (message) => {
        const data = docBody(message);
        if (typeof khiCoThongBaoMoi === "function") {
          khiCoThongBaoMoi(data);
        }
      })
    );

    subscriptions.push(
      client.subscribe(`${CHU_DE_THONG_BAO}${idNhanVien}${DUOI_DEM_CHUA_DOC}`, (message) => {
        const data = docBody(message);
        if (typeof khiCapNhatDemChuaDoc === "function") {
          const value = Number(data);
          khiCapNhatDemChuaDoc(Number.isFinite(value) ? value : 0);
        }
      })
    );
  };

  if (client.connected) {
    dangKy();
  } else {
    const onConnectGoc = client.onConnect;
    const onStompErrorGoc = client.onStompError;
    const onWebSocketErrorGoc = client.onWebSocketError;

    client.onConnect = (frame) => {
      if (typeof onConnectGoc === "function") {
        onConnectGoc(frame);
      }
      dangKy();
    };

    client.onStompError = (frame) => {
      if (typeof onStompErrorGoc === "function") {
        onStompErrorGoc(frame);
      }
      if (typeof khiLoi === "function") {
        khiLoi(frame);
      }
    };

    client.onWebSocketError = (event) => {
      if (typeof onWebSocketErrorGoc === "function") {
        onWebSocketErrorGoc(event);
      }
      if (typeof khiLoi === "function") {
        khiLoi(event);
      }
    };

    if (!client.active) {
      client.activate();
    }
  }

  return () => {
    daHuy = true;
    subscriptions.forEach((subscription) => {
      try {
        subscription?.unsubscribe?.();
      } catch {
        // bỏ qua unsubscribe lỗi
      }
    });
  };
}

export async function layTongQuanThongBao(nhanVienId = null) {
  const params = {};
  if (nhanVienId) params.nhanVienId = nhanVienId;
  const res = await apiClient.get(`${THONG_BAO_API}/tong-quan`, { params });
  return res.data;
}

export async function layDanhSachThongBao({
  nhanVienId = null,
  chiLayChuaDoc = false,
  gioiHan = 20,
} = {}) {
  const params = {
    chiLayChuaDoc,
    gioiHan,
  };
  if (nhanVienId) params.nhanVienId = nhanVienId;

  const res = await apiClient.get(THONG_BAO_API, { params });
  return Array.isArray(res.data) ? res.data : [];
}

export async function danhDauThongBaoDaDoc(idThongBao, nhanVienId = null) {
  const params = {};
  if (nhanVienId) params.nhanVienId = nhanVienId;
  const res = await apiClient.post(`${THONG_BAO_API}/${idThongBao}/doc`, null, { params });
  return res.data;
}

export async function danhDauTatCaThongBaoDaDoc(nhanVienId = null) {
  const params = {};
  if (nhanVienId) params.nhanVienId = nhanVienId;
  const res = await apiClient.post(`${THONG_BAO_API}/doc-tat-ca`, null, { params });
  return res.data;
}

export async function danhDauThongBaoDaXuLy(idThongBao, nhanVienId = null) {
  const params = {};
  if (nhanVienId) params.nhanVienId = nhanVienId;
  const res = await apiClient.post(`${THONG_BAO_API}/${idThongBao}/xu-ly`, null, { params });
  return res.data;
}
    