import { ref } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import apiClient from './apiClient'

const BACKEND_WS_URL = 'http://localhost:8080/ws'
const BACKEND_API    = 'http://localhost:8080'

// ── Singleton STOMP client ────────────────────────────────────────────────────
let stompClient = null
const isConnected = ref(false)

function getClient() {
  if (!stompClient) {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(BACKEND_WS_URL),
      reconnectDelay: 5000,
      onConnect: () => { isConnected.value = true },
      onDisconnect: () => { isConnected.value = false },
      onStompError: (frame) => {
        console.error('[ChatService] STOMP error:', frame)
      },
    })
  }
  return stompClient
}

// ── Kết nối WebSocket ─────────────────────────────────────────────────────────
export function connectChat() {
  const client = getClient()
  if (!client.active) {
    client.activate()
  }
  return client
}

// ── Ngắt kết nối ─────────────────────────────────────────────────────────────
export function disconnectChat() {
  if (stompClient && stompClient.active) {
    stompClient.deactivate()
  }
}

// ── Subscribe một topic ───────────────────────────────────────────────────────
export function subscribeTopic(topic, callback) {
  const client = getClient()
  if (client.active) {
    return client.subscribe(topic, (msg) => {
      try {
        callback(JSON.parse(msg.body))
      } catch (e) {
        callback(msg.body)
      }
    })
  } else {
    // Đợi kết nối xong rồi subscribe
    const originalOnConnect = client.onConnect
    client.onConnect = (frame) => {
      if (originalOnConnect) originalOnConnect(frame)
      client.subscribe(topic, (msg) => {
        try { callback(JSON.parse(msg.body)) }
        catch (e) { callback(msg.body) }
      })
    }
  }
}

// ── Gửi tin nhắn qua STOMP ───────────────────────────────────────────────────
export function sendStompMessage(destination, body) {
  const client = getClient()
  if (client.active) {
    client.publish({
      destination,
      body: JSON.stringify(body),
    })
  } else {
    console.warn('[ChatService] Chưa kết nối WebSocket')
  }
}

// ── REST: Khởi tạo phiên chat mới (khách hàng) ───────────────────────────────
export async function khoiTaoPhien(tenKhach, khachHangId = null) {
  const res = await apiClient.post(`${BACKEND_API}/api/chat/start`, {
    tenKhach,
    khachHangId,
    loai: 'KHACH_HANG',
  })
  return res.data
}

// ── REST: Khởi tạo phiên chat nội bộ (nhân viên → admin) ─────────────────────
export async function khoiTaoPhienNoiBo(tenNhanVien, nhanVienId = null) {
  const res = await apiClient.post(`${BACKEND_API}/api/chat/staff/start`, {
    tenKhach: tenNhanVien,
    nhanVienId,
    loai: 'NOI_BO',
  })
  return res.data
}

// ── REST: Lấy lịch sử tin nhắn ───────────────────────────────────────────────
export async function layTinNhan(phienChatId) {
  const res = await apiClient.get(`${BACKEND_API}/api/chat/${phienChatId}/messages`)
  return res.data
}

// ── REST: Lấy danh sách phiên (admin) ────────────────────────────────────────
export async function layDanhSachPhien(trangThai = null, loai = null) {
  const params = {}
  if (trangThai) params.trangThai = trangThai
  if (loai) params.loai = loai
  const res = await apiClient.get(`${BACKEND_API}/api/chat/sessions`, { params })
  return res.data
}

// ── REST: Nhân viên nhận phiên ───────────────────────────────────────────────
export async function nhanPhien(phienChatId, nhanVienId) {
  const res = await apiClient.post(`${BACKEND_API}/api/chat/${phienChatId}/accept`, { nhanVienId })
  return res.data
}

// ── REST: Đóng phiên ─────────────────────────────────────────────────────────
export async function dongPhien(phienChatId) {
  await apiClient.post(`${BACKEND_API}/api/chat/${phienChatId}/close`)
}

export { isConnected }
