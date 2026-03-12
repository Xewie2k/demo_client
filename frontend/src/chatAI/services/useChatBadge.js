import { computed, reactive } from 'vue'
import { connectChat, layDanhSachPhien } from '@/chatAI/services/chatService'

// ── Module-level singleton ───────────────────────────────────────────────────
const _sessionUnread = reactive({}) // { [sessionId]: count }
const _sessionLoai = reactive({}) // { [sessionId]: 'KHACH_HANG' | 'NOI_BO' }

let _currentSessionId = null
const _subscribed = new Set() // Set<String(sessionId)>
let _client = null
let _initialized = false
let _initPromise = null

const _unreadCount = computed(() =>
  Object.values(_sessionUnread).reduce((sum, v) => sum + Number(v || 0), 0)
)

// ── Exports ──────────────────────────────────────────────────────────────────

/** Gọi khi mở 1 phiên trong ChatPage → clear badge phiên đó */
export function setCurrentSession(id) {
  _currentSessionId = id ? String(id) : null
  if (id) _sessionUnread[String(id)] = 0
}

/** Gọi khi vào trang /admin/chat → reset tất cả badges */
export function resetChatUnread() {
  Object.keys(_sessionUnread).forEach((k) => {
    _sessionUnread[k] = 0
  })
  _currentSessionId = null
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function _getUser() {
  const raw =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user') ||
    localStorage.getItem('nguoiDung') ||
    sessionStorage.getItem('nguoiDung')

  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function _isAdmin() {
  const u = _getUser()
  const role = u?.role || u?.vaiTro || u?.chucVu || ''
  return role === 'ADMIN'
}

function _ensureUnreadKey(sessionId) {
  const id = String(sessionId)
  if (typeof _sessionUnread[id] !== 'number') {
    _sessionUnread[id] = 0
  }
}

function _rememberSession(phien) {
  if (!phien?.id) return

  const id = String(phien.id)
  _ensureUnreadKey(id)

  if (phien.loai) {
    _sessionLoai[id] = phien.loai
  }
}

/**
 * Quyết định tin nhắn này có cần hiện badge không
 *
 * Rule đang dùng:
 *  - KHACH luôn đếm
 *  - NHAN_VIEN chỉ đếm thêm cho ADMIN ở phiên nội bộ
 */
function _shouldCount(sessionId, nguoiGui) {
  if (nguoiGui === 'KHACH') return true

  const loai = _sessionLoai[String(sessionId)] || null
  if (loai === 'NOI_BO' && nguoiGui === 'NHAN_VIEN' && _isAdmin()) {
    return true
  }

  return false
}

async function _waitForConnected(client, timeoutMs = 10000) {
  if (client?.connected) return

  const startedAt = Date.now()

  await new Promise((resolve, reject) => {
    const iv = setInterval(() => {
      if (client?.connected) {
        clearInterval(iv)
        resolve()
        return
      }

      if (Date.now() - startedAt >= timeoutMs) {
        clearInterval(iv)
        reject(new Error('Kết nối chat badge timeout'))
      }
    }, 150)
  })
}

/** Subscribe vào topic tin nhắn của 1 phiên (chỉ subscribe 1 lần) */
function _subscribeSession(sessionOrId, loai = null) {
  const id =
    typeof sessionOrId === 'object' && sessionOrId !== null
      ? String(sessionOrId.id)
      : String(sessionOrId)

  if (!id || !_client || _subscribed.has(id)) return

  if (typeof sessionOrId === 'object' && sessionOrId !== null) {
    _rememberSession(sessionOrId)
  } else {
    _ensureUnreadKey(id)
    if (loai) _sessionLoai[id] = loai
  }

  _subscribed.add(id)

  _client.subscribe(`/topic/chat/${id}`, (msg) => {
    if (id === _currentSessionId) {
      _sessionUnread[id] = 0
      return
    }

    try {
      const message = JSON.parse(msg.body)

      if (_shouldCount(id, message?.nguoiGui)) {
        _sessionUnread[id] = Number(_sessionUnread[id] || 0) + 1
      }
    } catch {
      // bỏ qua tin lỗi format
    }
  })
}

async function _loadAndSubscribeActiveSessions() {
  const khList = await layDanhSachPhien(null, 'KHACH_HANG')
  if (Array.isArray(khList)) {
    khList
      .filter((s) => s?.trangThai !== 'DA_DONG')
      .forEach((s) => {
        _rememberSession(s)
        _subscribeSession(s)
      })
  }

  if (_isAdmin()) {
    const nbList = await layDanhSachPhien(null, 'NOI_BO')
    if (Array.isArray(nbList)) {
      nbList
        .filter((s) => s?.trangThai !== 'DA_DONG')
        .forEach((s) => {
          _rememberSession(s)
          _subscribeSession(s)
        })
    }
  }
}

function _subscribeSessionNotifications() {
  if (!_client) return

  _client.subscribe('/topic/admin/notifications', (msg) => {
    try {
      const phien = JSON.parse(msg.body)
      if (!phien?.id) return

      _rememberSession(phien)

      if (phien.trangThai !== 'DA_DONG') {
        _subscribeSession(phien)
      }
    } catch {
      // bỏ qua
    }
  })

  if (_isAdmin()) {
    _client.subscribe('/topic/admin/noibo-notifications', (msg) => {
      try {
        const phien = JSON.parse(msg.body)
        if (!phien?.id) return

        _rememberSession(phien)

        if (phien.trangThai !== 'DA_DONG') {
          _subscribeSession(phien)
        }
      } catch {
        // bỏ qua
      }
    })
  }
}

// ── Khởi tạo singleton (chỉ chạy 1 lần) ─────────────────────────────────────
async function _init() {
  if (_initialized) return
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    _client = connectChat()
    await _waitForConnected(_client)

    try {
      await _loadAndSubscribeActiveSessions()
    } catch (e) {
      console.error('[useChatBadge] load sessions error:', e)
    }

    _subscribeSessionNotifications()
    _initialized = true
  })()

  try {
    await _initPromise
  } catch (e) {
    _initialized = false
    throw e
  } finally {
    _initPromise = null
  }
}

// ── Composable dùng trong SidebarMenu + ChatPage ────────────────────────────
export function useChatBadge() {
  _init().catch((e) => {
    console.error('[useChatBadge] init error:', e)
  })

  return {
    unreadChatCount: _unreadCount,
    sessionUnreadMap: _sessionUnread,
  }
}