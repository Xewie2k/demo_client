<!-- File: src/chatAI/pages/ChatPage.vue -->
<template>
  <div class="chat-admin-page d-flex" style="height: calc(100vh - 60px);">
    <!-- ── Cột trái: danh sách phiên ─────────────────────────────────────── -->
    <div
      class="chat-session-list border-end d-flex flex-column"
      style="width: 300px; min-width: 300px;"
    >
      <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
        <span class="fw-bold" style="font-size: 15px">
          <span class="material-icons align-middle me-1" style="font-size: 18px">chat</span>
          Quản lý Chat
        </span>

        <span
          v-if="soPhienCho > 0"
          class="badge rounded-pill"
          style="background: var(--ss-accent)"
        >
          {{ soPhienCho }} chờ
        </span>
      </div>

      <!-- Loại phiên tabs -->
      <div class="d-flex border-bottom">
        <button
          class="flex-1 btn btn-sm py-2 rounded-0 d-flex align-items-center justify-content-center gap-1"
          :class="activeLoai === 'KHACH_HANG' ? 'btn-danger text-white' : 'btn-light text-secondary'"
          @click="switchLoai('KHACH_HANG')"
        >
          <span class="material-icons" style="font-size: 14px">person</span>
          Khách hàng
        </button>

        <button
          v-if="isAdmin"
          class="flex-1 btn btn-sm py-2 rounded-0 d-flex align-items-center justify-content-center gap-1"
          :class="activeLoai === 'NOI_BO' ? 'btn-primary text-white' : 'btn-light text-secondary'"
          @click="switchLoai('NOI_BO')"
        >
          <span class="material-icons" style="font-size: 14px">badge</span>
          Nội bộ

          <span
            v-if="soPhienNoiBoCho > 0"
            class="badge rounded-pill bg-warning text-dark ms-1"
            style="font-size: 10px"
          >
            {{ soPhienNoiBoCho }}
          </span>

          <span
            v-if="soTinNhanChuaDocNoiBo > 0"
            class="badge rounded-pill bg-danger ms-1"
            style="font-size: 10px"
          >
            {{ soTinNhanChuaDocNoiBo > 99 ? '99+' : soTinNhanChuaDocNoiBo }}
          </span>
        </button>
      </div>

      <!-- Trạng thái tabs -->
      <div class="d-flex border-bottom">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex-1 btn btn-sm py-2 rounded-0"
          :class="
            activeTab === tab.value
              ? activeLoai === 'NOI_BO'
                ? 'btn-primary text-white'
                : 'btn-danger text-white'
              : 'btn-light text-secondary'
          "
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Danh sách -->
      <div class="flex-1 overflow-auto">
        <div
          v-if="filteredSessions.length === 0"
          class="text-center text-muted p-4"
          style="font-size: 13px"
        >
          Không có phiên nào
        </div>

        <div
          v-for="session in filteredSessions"
          :key="session.id"
          class="session-item p-3 border-bottom"
          :class="{
            'session-item--active': selectedId === session.id,
            'session-item--noibo': session.loai === 'NOI_BO',
          }"
          @click="chonPhien(session)"
        >
          <div class="d-flex justify-content-between align-items-start">
            <span class="fw-semibold" style="font-size: 13px">
              {{ session.tenKhach }}
            </span>

            <div class="d-flex align-items-center gap-1">
              <span
                v-if="getUnreadCount(session.id) > 0"
                class="badge rounded-pill bg-danger"
                style="font-size: 10px; min-width: 18px; padding: 2px 5px;"
              >
                {{ getUnreadCount(session.id) > 99 ? '99+' : getUnreadCount(session.id) }}
              </span>

              <span class="session-badge" :class="`badge-${session.trangThai}`">
                {{ labelTrangThai(session.trangThai) }}
              </span>
            </div>
          </div>

          <div
            class="text-muted mt-1"
            style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
            :class="{ 'fw-semibold text-dark': getUnreadCount(session.id) > 0 }"
          >
            {{ session.tinNhanCuoi || '(chưa có tin nhắn)' }}
          </div>

          <div class="text-muted mt-1" style="font-size: 11px;">
            {{ formatTime(session.thoiGianBatDau) }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Cột phải: khung chat ───────────────────────────────────────────── -->
    <div class="flex-1 d-flex flex-column" style="min-width: 0;">
      <!-- Không có phiên nào được chọn -->
      <div
        v-if="!selectedSession"
        class="flex-1 d-flex align-items-center justify-content-center text-muted flex-column gap-2"
      >
        <span class="material-icons" style="font-size: 48px; opacity: 0.3">forum</span>
        <span style="font-size: 14px">Chọn một phiên chat để bắt đầu</span>
      </div>

      <!-- Đã chọn phiên -->
      <template v-else>
        <!-- Header phiên -->
        <div
          class="chat-header-admin border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
          :class="selectedSession.loai === 'NOI_BO' ? 'header-noibo' : ''"
        >
          <div>
            <div class="fw-bold" style="font-size: 15px">
              {{ selectedSession.tenKhach }}

              <span
                v-if="selectedSession.loai === 'NOI_BO'"
                class="badge ms-2"
                style="font-size: 10px; background: #1e3a8a; vertical-align: middle"
              >
                Nội bộ
              </span>
            </div>

            <div style="font-size: 12px; color: #6b7280">
              {{ labelTrangThai(selectedSession.trangThai) }}
              · {{ selectedSession.soTinNhan || currentMessages.length }} tin nhắn
            </div>
          </div>

          <div class="d-flex gap-2">
            <button
              v-if="selectedSession.trangThai === 'CHO_NHAN_VIEN'"
              class="btn btn-sm text-white"
              :style="{
                background: getLoaiPrimaryColor(selectedSession.loai),
                border: 'none'
              }"
              @click="tiepNhan"
            >
              <span
                class="material-icons"
                style="font-size: 14px; vertical-align: middle"
              >check_circle</span>
              Tiếp nhận
            </button>

            <button
              v-if="canClose"
              class="btn btn-sm btn-outline-secondary"
              @click="dongPhienHienTai"
            >
              <span
                class="material-icons"
                style="font-size: 14px; vertical-align: middle"
              >cancel</span>
              Đóng phiên
            </button>
          </div>
        </div>

        <!-- Tin nhắn -->
        <div class="chat-messages-admin flex-1 overflow-auto p-4" ref="messagesEl">
          <div
            v-for="(msg, index) in currentMessages"
            :key="msg.id ?? `${msg.thoiGian || 'msg'}-${index}`"
            class="admin-msg"
            :class="{
              'admin-msg--bot': msg.nguoiGui === 'BOT',
              'admin-msg--khach': msg.nguoiGui === 'KHACH',
              'admin-msg--khach--noibo':
                msg.nguoiGui === 'KHACH' && selectedSession?.loai === 'NOI_BO',
              'admin-msg--nv': msg.nguoiGui === 'NHAN_VIEN',
              'admin-msg--nv--noibo':
                msg.nguoiGui === 'NHAN_VIEN' && selectedSession?.loai === 'NOI_BO',
            }"
          >
            <div class="admin-msg__meta">
              <span class="fw-semibold">{{ msg.tenNguoiGui }}</span>
              <span class="ms-2 text-muted">{{ formatTime(msg.thoiGian) }}</span>
            </div>

            <div
              class="admin-msg__bubble"
              v-html="renderMessage(msg.noiDung)"
            ></div>
          </div>
        </div>

        <!-- Input trả lời -->
        <div
          v-if="selectedSession.trangThai === 'DANG_XU_LY'"
          class="border-top p-3 d-flex gap-2 bg-white"
        >
          <input
            v-model="replyText"
            class="form-control form-control-sm"
            :placeholder="
              selectedSession.loai === 'NOI_BO'
                ? 'Nhập tin nhắn trả lời nhân viên...'
                : 'Nhập tin nhắn trả lời khách...'
            "
            @keyup.enter="guiTinNhanVien"
            style="border-radius: 20px;"
          />

          <button
            class="btn btn-sm text-white"
            :style="{
              background: getLoaiPrimaryColor(selectedSession.loai),
              borderRadius: '20px',
              padding: '0 16px'
            }"
            @click="guiTinNhanVien"
            :disabled="!replyText.trim()"
          >
            <span
              class="material-icons"
              style="font-size: 16px; vertical-align: middle"
            >send</span>
          </button>
        </div>

        <div
          v-else-if="selectedSession.trangThai === 'CHO_NHAN_VIEN'"
          class="border-top p-3 text-center text-muted"
          style="font-size: 13px;"
        >
          Nhấn <strong>Tiếp nhận</strong> để bắt đầu hỗ trợ
          {{ selectedSession.loai === 'NOI_BO' ? 'nhân viên' : 'khách hàng' }}
        </div>

        <div
          v-else-if="selectedSession.trangThai === 'DA_DONG'"
          class="border-top p-3 text-center text-muted"
          style="font-size: 13px;"
        >
          Phiên đã đóng
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  unref,
} from 'vue'
import {
  connectChat,
  sendStompMessage,
  layDanhSachPhien,
  layTinNhan,
  nhanPhien,
  dongPhien,
  disconnectChat,
} from '@/chatAI/services/chatService'
import { useChatBadge, setCurrentSession } from '@/chatAI/services/useChatBadge.js'

const { sessionUnreadMap } = useChatBadge()

// ── Dữ liệu ─────────────────────────────────────────────────────────────────
const sessions = ref([])
const sessionsNoiBo = ref([])
const sessionsClosedKH = ref([])
const sessionsClosedNoiBo = ref([])

const selectedId = ref(null)
const currentMessages = ref([])
const replyText = ref('')
const messagesEl = ref(null)

const activeTab = ref('active')
const activeLoai = ref('KHACH_HANG')

const tabs = [
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Chờ nhận', value: 'CHO_NHAN_VIEN' },
  { label: 'Đã đóng', value: 'DA_DONG' },
]

// ── Computed ────────────────────────────────────────────────────────────────
const currentSessions = computed(() =>
  activeLoai.value === 'NOI_BO' ? sessionsNoiBo.value : sessions.value
)

const selectedSession = computed(() =>
  [
    ...sessions.value,
    ...sessionsNoiBo.value,
    ...sessionsClosedKH.value,
    ...sessionsClosedNoiBo.value,
  ].find((s) => s.id === selectedId.value)
)

const filteredSessions = computed(() => {
  if (activeTab.value === 'DA_DONG') {
    return activeLoai.value === 'NOI_BO'
      ? sessionsClosedNoiBo.value
      : sessionsClosedKH.value
  }

  const list = currentSessions.value
  if (activeTab.value === 'active') {
    return list.filter((s) => s.trangThai !== 'DA_DONG')
  }

  return list.filter((s) => s.trangThai === activeTab.value)
})

const soPhienCho = computed(() =>
  sessions.value.filter((s) => s.trangThai === 'CHO_NHAN_VIEN').length
)

const soPhienNoiBoCho = computed(() =>
  sessionsNoiBo.value.filter((s) => s.trangThai === 'CHO_NHAN_VIEN').length
)

const soTinNhanChuaDocNoiBo = computed(() =>
  sessionsNoiBo.value.reduce((sum, s) => sum + getUnreadCount(s.id), 0)
)

const canClose = computed(() => {
  if (!selectedSession.value || selectedSession.value.trangThai === 'DA_DONG') {
    return false
  }

  if (isAdmin.value) return true

  const user = getAdminUser()
  return selectedSession.value.nhanVienId === user?.id
})

// ── User / phân quyền ───────────────────────────────────────────────────────
function getAdminUser() {
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

const isAdmin = computed(() => {
  const u = getAdminUser()
  const role = u?.role || u?.vaiTro || u?.chucVu || ''
  return role === 'ADMIN'
})

// ── Subscriptions ───────────────────────────────────────────────────────────
let subscriptionAdmin = null
let subscriptionNoiBo = null
let subscriptionChat = null

// ── Helpers list ────────────────────────────────────────────────────────────
function getUnreadCount(sessionId) {
  const map = unref(sessionUnreadMap) || {}
  return Number(map?.[sessionId] || 0)
}

function getOpenListRefByLoai(loai) {
  return loai === 'NOI_BO' ? sessionsNoiBo : sessions
}

function getClosedListRefByLoai(loai) {
  return loai === 'NOI_BO' ? sessionsClosedNoiBo : sessionsClosedKH
}

function removeById(listRef, id) {
  const idx = listRef.value.findIndex((item) => item.id === id)
  if (idx >= 0) listRef.value.splice(idx, 1)
}

function upsertAtTop(listRef, item) {
  const idx = listRef.value.findIndex((x) => x.id === item.id)
  if (idx >= 0) {
    listRef.value[idx] = { ...listRef.value[idx], ...item }
    const updated = listRef.value[idx]
    listRef.value.splice(idx, 1)
    listRef.value.unshift(updated)
  } else {
    listRef.value.unshift(item)
  }
}

function syncSessionLists(updatedPhien) {
  if (!updatedPhien?.id) return

  const openList = getOpenListRefByLoai(updatedPhien.loai)
  const closedList = getClosedListRefByLoai(updatedPhien.loai)

  if (updatedPhien.trangThai === 'DA_DONG') {
    removeById(openList, updatedPhien.id)
    upsertAtTop(closedList, updatedPhien)
  } else {
    removeById(closedList, updatedPhien.id)
    upsertAtTop(openList, updatedPhien)
  }
}

function clearSelectedSessionState() {
  selectedId.value = null
  currentMessages.value = []

  if (subscriptionChat) {
    subscriptionChat.unsubscribe()
    subscriptionChat = null
  }

  try {
    setCurrentSession(null)
  } catch {
    // ignore
  }
}

function getLoaiPrimaryColor(loai) {
  return loai === 'NOI_BO' ? '#1e3a8a' : 'var(--ss-accent)'
}

// ── WebSocket helpers ───────────────────────────────────────────────────────
async function waitForConnected(client, timeoutMs = 10000) {
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
        reject(new Error('Kết nối chat timeout'))
      }
    }, 100)
  })
}

async function subscribeSelectedChat(session) {
  if (!session?.id || session?.trangThai === 'DA_DONG') return

  if (subscriptionChat) {
    subscriptionChat.unsubscribe()
    subscriptionChat = null
  }

  const targetSessionId = session.id
  const client = connectChat()
  await waitForConnected(client)

  subscriptionChat = client.subscribe(`/topic/chat/${targetSessionId}`, (msg) => {
    if (selectedId.value !== targetSessionId) return

    const data = JSON.parse(msg.body)
    currentMessages.value.push(data)

    const openList = getOpenListRefByLoai(session.loai)
    const closedList = getClosedListRefByLoai(session.loai)

    const openIdx = openList.value.findIndex((s) => s.id === targetSessionId)
    if (openIdx >= 0) {
      const current = openList.value[openIdx]
      openList.value[openIdx] = {
        ...current,
        tinNhanCuoi: data.noiDung,
        soTinNhan: Number(current.soTinNhan || 0) + 1,
      }
    }

    const closedIdx = closedList.value.findIndex((s) => s.id === targetSessionId)
    if (closedIdx >= 0) {
      const current = closedList.value[closedIdx]
      closedList.value[closedIdx] = {
        ...current,
        tinNhanCuoi: data.noiDung,
        soTinNhan: Number(current.soTinNhan || 0) + 1,
      }
    }

    scrollToBottom()
  })
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await loadSessions('KHACH_HANG')

    if (isAdmin.value) {
      await loadSessions('NOI_BO')
    }

    const client = connectChat()
    await waitForConnected(client)

    // Khách hàng
    subscriptionAdmin = client.subscribe('/topic/admin/notifications', (msg) => {
      const updatedPhien = JSON.parse(msg.body)
      syncSessionLists(updatedPhien)
    })

    // Nội bộ
    if (isAdmin.value) {
      subscriptionNoiBo = client.subscribe('/topic/admin/noibo-notifications', (msg) => {
        const updatedPhien = JSON.parse(msg.body)
        syncSessionLists(updatedPhien)
      })
    }
  } catch (e) {
    console.error('[ChatPage] init error:', e)
  }
})

onBeforeUnmount(() => {
  if (subscriptionAdmin) subscriptionAdmin.unsubscribe()
  if (subscriptionNoiBo) subscriptionNoiBo.unsubscribe()
  if (subscriptionChat) subscriptionChat.unsubscribe()

  try {
    setCurrentSession(null)
  } catch {
    // ignore
  }

  disconnectChat()
})

// ── Load data ───────────────────────────────────────────────────────────────
async function loadClosedSessions(loai = activeLoai.value) {
  try {
    const data = await layDanhSachPhien('DA_DONG', loai)

    if (loai === 'NOI_BO') {
      sessionsClosedNoiBo.value = Array.isArray(data) ? data : []
    } else {
      sessionsClosedKH.value = Array.isArray(data) ? data : []
    }
  } catch (e) {
    console.error('[ChatPage] loadClosedSessions error:', e)
  }
}

async function loadSessions(loai) {
  try {
    const data = await layDanhSachPhien(null, loai)

    if (loai === 'NOI_BO') {
      sessionsNoiBo.value = Array.isArray(data) ? data : []
    } else {
      sessions.value = Array.isArray(data) ? data : []
    }
  } catch (e) {
    console.error('[ChatPage] loadSessions error:', e)
  }
}

// ── Chọn phiên ──────────────────────────────────────────────────────────────
async function chonPhien(session) {
  if (!session?.id) return

  const targetId = session.id

  if (subscriptionChat) {
    subscriptionChat.unsubscribe()
    subscriptionChat = null
  }

  selectedId.value = targetId
  currentMessages.value = []

  try {
    setCurrentSession(targetId)
  } catch {
    // ignore
  }

  try {
    const history = await layTinNhan(targetId)

    if (selectedId.value !== targetId) return

    currentMessages.value = Array.isArray(history) ? history : []
    await scrollToBottom()
    await subscribeSelectedChat(session)
  } catch (e) {
    console.error('[ChatPage] layTinNhan error:', e)
  }
}

// ── Tiếp nhận phiên ─────────────────────────────────────────────────────────
async function tiepNhan() {
  if (!selectedId.value) return

  const user = getAdminUser()
  const nhanVienId = user?.id || null

  try {
    const updated = await nhanPhien(selectedId.value, nhanVienId)
    syncSessionLists(updated)
  } catch (e) {
    console.error('[ChatPage] tiepNhan error:', e)
  }
}

// ── Gửi tin nhắn ────────────────────────────────────────────────────────────
function guiTinNhanVien() {
  const text = replyText.value.trim()
  if (!text || !selectedId.value || selectedSession.value?.trangThai !== 'DANG_XU_LY') return

  const user = getAdminUser()
  replyText.value = ''

  sendStompMessage(`/app/chat/${selectedId.value}/nhanvien/send`, {
    noiDung: text,
    tenNguoiGui: user?.hoTen || user?.tenNhanVien || 'Admin',
    nhanVienId: user?.id || null,
  })
}

// ── Đóng phiên ──────────────────────────────────────────────────────────────
async function dongPhienHienTai() {
  if (!selectedId.value || !selectedSession.value) return

  const user = getAdminUser()

  try {
    await dongPhien(selectedId.value, {
      nguoiDongId: user?.id || null,
      vaiTro: isAdmin.value ? 'ADMIN' : 'NHAN_VIEN',
    })

    const closedSess = {
      ...selectedSession.value,
      trangThai: 'DA_DONG',
    }

    syncSessionLists(closedSess)
  } catch (e) {
    console.error('[ChatPage] dongPhien error:', e)
  }
}

// ── Switch tab / loại ───────────────────────────────────────────────────────
async function switchTab(val) {
  activeTab.value = val
  if (val === 'DA_DONG') {
    await loadClosedSessions(activeLoai.value)
  }
}

async function switchLoai(loai) {
  activeLoai.value = loai
  clearSelectedSessionState()

  if (activeTab.value === 'DA_DONG') {
    await loadClosedSessions(loai)
  }
}

// ── Helpers UI ──────────────────────────────────────────────────────────────
function labelTrangThai(t) {
  const map = {
    BOT_DANG_XU_LY: '🤖 AI đang xử lý',
    CHO_NHAN_VIEN: '⏳ Chờ tiếp nhận',
    DANG_XU_LY: '🟢 Đang xử lý',
    DA_DONG: '✅ Đã đóng',
  }
  return map[t] || t
}

function formatTime(dt) {
  if (!dt) return ''

  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()

  return d.toLocaleString(
    'vi-VN',
    sameDay
      ? { hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
  )
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

// ── Render message với link clickable ───────────────────────────────────────
function renderMessage(text) {
  if (!text) return ''

  let safe = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  safe = safe.replace(
    /\/client\/products\/(\d+)/g,
    '<a href="/client/products/$1" target="_blank" rel="noopener noreferrer" class="chat-link">Xem sản phẩm #$1</a>'
  )

  safe = safe.replace(/\n/g, '<br>')
  return safe
}
</script>

<style scoped>
.chat-admin-page {
  background: #f9fafb;
}

.session-item {
  cursor: pointer;
  transition: background 0.15s;
}

.session-item:hover {
  background: #f3f4f6;
}

.session-item--active {
  background: #fff5f5 !important;
  border-left: 3px solid var(--ss-accent);
}

.session-item--active.session-item--noibo {
  background: #eff6ff !important;
  border-left: 3px solid #1e3a8a;
}

.session-badge {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 99px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-BOT_DANG_XU_LY {
  background: #e0f2fe;
  color: #0369a1;
}

.badge-CHO_NHAN_VIEN {
  background: #fef9c3;
  color: #92400e;
}

.badge-DANG_XU_LY {
  background: #dcfce7;
  color: #15803d;
}

.badge-DA_DONG {
  background: #f3f4f6;
  color: #6b7280;
}

.chat-messages-admin {
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.admin-msg {
  margin-bottom: 14px;
  max-width: 75%;
}

.admin-msg--bot {
  align-self: flex-start;
}

.admin-msg--khach {
  align-self: flex-start;
}

.admin-msg--nv {
  align-self: flex-end;
}

.admin-msg__meta {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.admin-msg--bot .admin-msg__meta,
.admin-msg--khach .admin-msg__meta,
.admin-msg--khach--noibo .admin-msg__meta {
  text-align: left;
}

.admin-msg--nv .admin-msg__meta,
.admin-msg--nv--noibo .admin-msg__meta {
  text-align: right;
}

.admin-msg__bubble {
  padding: 9px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
}

.admin-msg--bot .admin-msg__bubble {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 2px 12px 12px 12px;
}

.admin-msg--khach .admin-msg__bubble {
  background: #f3f4f6;
  color: #374151;
  border-radius: 2px 12px 12px 12px;
}

.admin-msg--nv .admin-msg__bubble {
  background: var(--ss-accent, #ff4d4f);
  color: #fff;
  border-radius: 12px 2px 12px 12px;
}

/* Nội bộ: admin/support bên phải xanh, người mở phiên bên trái xám */
.admin-msg--nv--noibo {
  align-self: flex-end;
}

.admin-msg--nv--noibo .admin-msg__bubble {
  background: #1e3a8a;
  color: #fff;
  border-radius: 12px 2px 12px 12px;
}

.admin-msg--khach--noibo {
  align-self: flex-start;
}

.admin-msg--khach--noibo .admin-msg__bubble {
  background: #f3f4f6;
  color: #374151;
  border-radius: 2px 12px 12px 12px;
}

:deep(.chat-link) {
  color: var(--ss-accent, #ff4d4f);
  font-weight: 600;
  text-decoration: underline;
}

.admin-msg--nv :deep(.chat-link),
.admin-msg--nv--noibo :deep(.chat-link) {
  color: #fff;
}

.header-noibo {
  background: #eff6ff;
  border-bottom-color: #bfdbfe !important;
}

.flex-1 {
  flex: 1;
}
</style>