/**
 * Module-level singleton theo dõi số tin nhắn chưa đọc theo từng phiên (giống Zalo/Messenger).
 *
 * Logic:
 *  - _sessionUnread: reactive map { [sessionId]: unreadCount }
 *  - Subscribe vào /topic/chat/{id} của từng phiên đang hoạt động
 *  - Khi tin nhắn mới từ KHACH_HANG (hoặc NHAN_VIEN cho admin) đến phiên KHÔNG đang xem → tăng count
 *  - setCurrentSession(id): gọi khi mở 1 phiên → clear badge đó
 *  - resetChatUnread(): gọi khi vào /admin/chat → xóa tất cả
 *  - unreadChatCount (computed): tổng tất cả → dùng cho sidebar badge
 */

import { computed, reactive } from 'vue'
import { connectChat, layDanhSachPhien } from '@/chatAI/services/chatService'

// ── Module-level singleton ─────────────────────────────────────────────────────
const _sessionUnread    = reactive({})   // { [sessionId]: count }
let   _currentSessionId = null           // session đang được mở (không đếm)
const _subscribed       = new Set()      // Set<String(sessionId)> đã subscribe
let   _client           = null
let   _initialized      = false

// Tổng số tin chưa đọc → dùng cho sidebar
const _unreadCount = computed(() =>
  Object.values(_sessionUnread).reduce((sum, v) => sum + v, 0)
)

// ── Exports ────────────────────────────────────────────────────────────────────

/** Gọi khi mở 1 phiên trong ChatPage → clear badge phiên đó */
export function setCurrentSession(id) {
  _currentSessionId = id ? String(id) : null
  if (id) _sessionUnread[String(id)] = 0
}

/** Gọi khi vào trang /admin/chat → reset tất cả badges */
export function resetChatUnread() {
  Object.keys(_sessionUnread).forEach(k => { _sessionUnread[k] = 0 })
  _currentSessionId = null
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function _getUser() {
  const raw =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user') ||
    localStorage.getItem('nguoiDung') ||
    sessionStorage.getItem('nguoiDung')
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

function _isAdmin() {
  const u    = _getUser()
  const role = u?.role || u?.vaiTro || u?.chucVu || ''
  return role === 'ADMIN'
}

/** Quyết định tin nhắn này có cần hiện badge không */
function _shouldCount(nguoiGui) {
  if (nguoiGui === 'KHACH') return true                     // tin nhắn từ khách hàng
  if (nguoiGui === 'NHAN_VIEN' && _isAdmin()) return true   // phiên nội bộ
  return false
}

/** Subscribe vào topic tin nhắn của 1 phiên (chỉ subscribe 1 lần) */
function _subscribeSession(sessionId) {
  const id = String(sessionId)
  if (_subscribed.has(id) || !_client) return
  _subscribed.add(id)

  _client.subscribe(`/topic/chat/${id}`, (msg) => {
    if (id === _currentSessionId) return   // đang xem phiên này → không đếm
    try {
      const message = JSON.parse(msg.body)
      if (_shouldCount(message.nguoiGui)) {
        _sessionUnread[id] = (_sessionUnread[id] || 0) + 1
      }
    } catch { /* bỏ qua */ }
  })
}

// ── Khởi tạo singleton (chỉ chạy 1 lần) ─────────────────────────────────────
async function _init() {
  if (_initialized) return
  _initialized = true

  // 1. Kết nối WebSocket
  _client = connectChat()
  await new Promise((resolve) => {
    if (_client.connected) { resolve(); return }
    const iv = setInterval(() => {
      if (_client.connected) { clearInterval(iv); resolve() }
    }, 150)
  })

  // 2. Load tất cả phiên đang hoạt động → subscribe từng phiên
  try {
    const khList = await layDanhSachPhien(null, 'KHACH_HANG')
    if (Array.isArray(khList)) {
      khList
        .filter(s => s.trangThai !== 'DA_DONG')
        .forEach(s => _subscribeSession(s.id))
    }

    if (_isAdmin()) {
      const nbList = await layDanhSachPhien(null, 'NOI_BO')
      if (Array.isArray(nbList)) {
        nbList
          .filter(s => s.trangThai !== 'DA_DONG')
          .forEach(s => _subscribeSession(s.id))
      }
    }
  } catch { /* bỏ qua lỗi network */ }

  // 3. Khi có phiên mới → subscribe thêm phiên đó
  _client.subscribe('/topic/admin/notifications', (msg) => {
    try {
      const phien = JSON.parse(msg.body)
      if (phien?.id && phien.trangThai !== 'DA_DONG') {
        _subscribeSession(phien.id)
      }
    } catch { /* bỏ qua */ }
  })

  if (_isAdmin()) {
    _client.subscribe('/topic/admin/noibo-notifications', (msg) => {
      try {
        const phien = JSON.parse(msg.body)
        if (phien?.id && phien.trangThai !== 'DA_DONG') {
          _subscribeSession(phien.id)
        }
      } catch { /* bỏ qua */ }
    })
  }
}

// ── Composable dùng trong SidebarMenu + ChatPage ──────────────────────────────
export function useChatBadge() {
  _init()
  return {
    unreadChatCount:  _unreadCount,
    sessionUnreadMap: _sessionUnread,
  }
}
