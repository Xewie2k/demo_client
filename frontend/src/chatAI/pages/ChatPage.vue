<!-- File: src/chatAI/pages/ChatPage.vue -->
<template>
  <div class="chat-admin-page d-flex" style="height: calc(100vh - 60px);">

    <!-- ── Cột trái: danh sách phiên ─────────────────────────────────────── -->
    <div class="chat-session-list border-end d-flex flex-column" style="width: 300px; min-width: 300px;">
      <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
        <span class="fw-bold" style="font-size:15px">
          <span class="material-icons align-middle me-1" style="font-size:18px">chat</span>
          Quản lý Chat
        </span>
        <span v-if="soPhienCho > 0" class="badge rounded-pill" style="background:var(--ss-accent)">
          {{ soPhienCho }} chờ
        </span>
      </div>

      <!-- Loại phiên tabs (Khách hàng / Nội bộ) -->
      <div class="d-flex border-bottom">
        <button
          class="flex-1 btn btn-sm py-2 rounded-0 d-flex align-items-center justify-content-center gap-1"
          :class="activeLoai === 'KHACH_HANG' ? 'btn-danger text-white' : 'btn-light text-secondary'"
          @click="switchLoai('KHACH_HANG')"
        >
          <span class="material-icons" style="font-size:14px">person</span>
          Khách hàng
        </button>
        <button
          v-if="isAdmin"
          class="flex-1 btn btn-sm py-2 rounded-0 d-flex align-items-center justify-content-center gap-1"
          :class="activeLoai === 'NOI_BO' ? 'btn-primary text-white' : 'btn-light text-secondary'"
          @click="switchLoai('NOI_BO')"
        >
          <span class="material-icons" style="font-size:14px">badge</span>
          Nội bộ
          <span v-if="soPhienNoiBoCho > 0" class="badge rounded-pill bg-warning text-dark ms-1" style="font-size:10px">
            {{ soPhienNoiBoCho }}
          </span>
        </button>
      </div>

      <!-- Trạng thái tabs -->
      <div class="d-flex border-bottom">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex-1 btn btn-sm py-2 rounded-0"
          :class="activeTab === tab.value
            ? (activeLoai === 'NOI_BO' ? 'btn-primary text-white' : 'btn-danger text-white')
            : 'btn-light text-secondary'"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Danh sách -->
      <div class="flex-1 overflow-auto">
        <div v-if="filteredSessions.length === 0" class="text-center text-muted p-4" style="font-size:13px">
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
            <span class="fw-semibold" style="font-size:13px">{{ session.tenKhach }}</span>
            <span class="session-badge" :class="`badge-${session.trangThai}`">
              {{ labelTrangThai(session.trangThai) }}
            </span>
          </div>
          <div class="text-muted mt-1" style="font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            {{ session.tinNhanCuoi || '(chưa có tin nhắn)' }}
          </div>
          <div class="text-muted mt-1" style="font-size:11px;">
            {{ formatTime(session.thoiGianBatDau) }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Cột phải: khung chat ───────────────────────────────────────────── -->
    <div class="flex-1 d-flex flex-column" style="min-width:0;">
      <!-- Không có phiên nào được chọn -->
      <div v-if="!selectedSession" class="flex-1 d-flex align-items-center justify-content-center text-muted flex-column gap-2">
        <span class="material-icons" style="font-size:48px; opacity:.3">forum</span>
        <span style="font-size:14px">Chọn một phiên chat để bắt đầu</span>
      </div>

      <!-- Đã chọn phiên -->
      <template v-else>
        <!-- Header phiên -->
        <div class="chat-header-admin border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
          :class="selectedSession.loai === 'NOI_BO' ? 'header-noibo' : ''"
        >
          <div>
            <div class="fw-bold" style="font-size:15px">
              {{ selectedSession.tenKhach }}
              <span v-if="selectedSession.loai === 'NOI_BO'"
                class="badge ms-2"
                style="font-size:10px; background:#1e3a8a; vertical-align:middle"
              >Nội bộ</span>
            </div>
            <div style="font-size:12px; color:#6b7280">
              {{ labelTrangThai(selectedSession.trangThai) }}
              · {{ selectedSession.soTinNhan }} tin nhắn
            </div>
          </div>
          <div class="d-flex gap-2">
            <button
              v-if="selectedSession.trangThai === 'CHO_NHAN_VIEN'"
              class="btn btn-sm"
              style="background:var(--ss-accent);color:#fff;border:none"
              @click="tiepNhan"
            >
              <span class="material-icons" style="font-size:14px; vertical-align:middle">check_circle</span>
              Tiếp nhận
            </button>
            <button
              v-if="canClose"
              class="btn btn-sm btn-outline-secondary"
              @click="dongPhienHienTai"
            >
              <span class="material-icons" style="font-size:14px; vertical-align:middle">cancel</span>
              Đóng phiên
            </button>
          </div>
        </div>

        <!-- Tin nhắn -->
        <div class="chat-messages-admin flex-1 overflow-auto p-4" ref="messagesEl">
          <div
            v-for="msg in currentMessages"
            :key="msg.id || msg.thoiGian"
            class="admin-msg"
            :class="{
              'admin-msg--bot':   msg.nguoiGui === 'BOT',
              'admin-msg--khach': msg.nguoiGui === 'KHACH',
              'admin-msg--nv':    msg.nguoiGui === 'NHAN_VIEN',
            }"
          >
            <div class="admin-msg__meta">
              <span class="fw-semibold">{{ msg.tenNguoiGui }}</span>
              <span class="ms-2 text-muted">{{ formatTime(msg.thoiGian) }}</span>
            </div>
            <div class="admin-msg__bubble">{{ msg.noiDung }}</div>
          </div>
        </div>

        <!-- Input trả lời -->
        <div v-if="selectedSession.trangThai === 'DANG_XU_LY'" class="border-top p-3 d-flex gap-2 bg-white">
          <input
            v-model="replyText"
            class="form-control form-control-sm"
            :placeholder="selectedSession.loai === 'NOI_BO' ? 'Nhập tin nhắn trả lời nhân viên...' : 'Nhập tin nhắn trả lời khách...'"
            @keyup.enter="guiTinNhanVien"
            style="border-radius: 20px;"
          />
          <button
            class="btn btn-sm text-white"
            :style="`background: ${selectedSession.loai === 'NOI_BO' ? '#1e3a8a' : 'var(--ss-accent)'}; border-radius: 20px; padding: 0 16px;`"
            @click="guiTinNhanVien"
            :disabled="!replyText.trim()"
          >
            <span class="material-icons" style="font-size:16px; vertical-align:middle">send</span>
          </button>
        </div>
        <div v-else-if="selectedSession.trangThai === 'CHO_NHAN_VIEN'" class="border-top p-3 text-center text-muted" style="font-size:13px;">
          Nhấn <strong>Tiếp nhận</strong> để bắt đầu hỗ trợ
          {{ selectedSession.loai === 'NOI_BO' ? 'nhân viên' : 'khách hàng' }}
        </div>
        <div v-else-if="selectedSession.trangThai === 'DA_DONG'" class="border-top p-3 text-center text-muted" style="font-size:13px;">
          Phiên đã đóng
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  connectChat, sendStompMessage,
  layDanhSachPhien, layTinNhan, nhanPhien, dongPhien
} from '@/chatAI/services/chatService'

// ── Dữ liệu ─────────────────────────────────────────────────────────────────
const sessions            = ref([])
const sessionsNoiBo       = ref([])
const sessionsClosedKH    = ref([])
const sessionsClosedNoiBo = ref([])
const selectedId      = ref(null)
const currentMessages = ref([])
const replyText       = ref('')
const messagesEl      = ref(null)
const activeTab       = ref('active')
const activeLoai      = ref('KHACH_HANG')

const tabs = [
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Chờ nhận',       value: 'CHO_NHAN_VIEN' },
  { label: 'Đã đóng',        value: 'DA_DONG' },
]

// ── Computed ──────────────────────────────────────────────────────────────────
const currentSessions = computed(() =>
  activeLoai.value === 'NOI_BO' ? sessionsNoiBo.value : sessions.value
)

const selectedSession = computed(() =>
  [...sessions.value, ...sessionsNoiBo.value,
   ...sessionsClosedKH.value, ...sessionsClosedNoiBo.value]
    .find(s => s.id === selectedId.value)
)

const filteredSessions = computed(() => {
  if (activeTab.value === 'DA_DONG') {
    return activeLoai.value === 'NOI_BO'
      ? sessionsClosedNoiBo.value
      : sessionsClosedKH.value
  }
  const list = currentSessions.value
  if (activeTab.value === 'active') return list.filter(s => s.trangThai !== 'DA_DONG')
  return list.filter(s => s.trangThai === activeTab.value)
})

const soPhienCho = computed(() =>
  sessions.value.filter(s => s.trangThai === 'CHO_NHAN_VIEN').length
)

const soPhienNoiBoCho = computed(() =>
  sessionsNoiBo.value.filter(s => s.trangThai === 'CHO_NHAN_VIEN').length
)

const canClose = computed(() => {
  if (!selectedSession.value || selectedSession.value.trangThai === 'DA_DONG') return false
  if (isAdmin.value) return true
  const user = getAdminUser()
  return selectedSession.value.nhanVienId === user?.id
})

// ── Lấy user admin từ localStorage ───────────────────────────────────────────
function getAdminUser() {
  const raw =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user') ||
    localStorage.getItem('nguoiDung') ||
    sessionStorage.getItem('nguoiDung')
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

// ── Phân quyền theo role ──────────────────────────────────────────────────────
const isAdmin = computed(() => {
  const u = getAdminUser()
  const role = u?.role || u?.vaiTro || u?.chucVu || ''
  return role === 'ADMIN'
})

let subscriptionAdmin = null
let subscriptionNoiBo = null
let subscriptionChat  = null

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadSessions('KHACH_HANG')
  if (isAdmin.value) {
    await loadSessions('NOI_BO')
  }

  const client = connectChat()
  const waitConnected = () => new Promise((resolve) => {
    if (client.connected) { resolve(); return }
    const iv = setInterval(() => { if (client.connected) { clearInterval(iv); resolve() } }, 100)
  })
  await waitConnected()

  // Subscribe thông báo phiên khách hàng mới / cập nhật
  subscriptionAdmin = client.subscribe('/topic/admin/notifications', (msg) => {
    const updatedPhien = JSON.parse(msg.body)
    if (updatedPhien.trangThai === 'DA_DONG') {
      const idx = sessions.value.findIndex(s => s.id === updatedPhien.id)
      if (idx >= 0) sessions.value.splice(idx, 1)
      const ci = sessionsClosedKH.value.findIndex(s => s.id === updatedPhien.id)
      if (ci >= 0) sessionsClosedKH.value[ci] = updatedPhien
      else sessionsClosedKH.value.unshift(updatedPhien)
    } else {
      const idx = sessions.value.findIndex(s => s.id === updatedPhien.id)
      if (idx >= 0) sessions.value[idx] = updatedPhien
      else sessions.value.unshift(updatedPhien)
    }
  })

  // Subscribe thông báo phiên nội bộ — chỉ ADMIN
  if (isAdmin.value) {
    subscriptionNoiBo = client.subscribe('/topic/admin/noibo-notifications', (msg) => {
      const updatedPhien = JSON.parse(msg.body)
      if (updatedPhien.trangThai === 'DA_DONG') {
        const idx = sessionsNoiBo.value.findIndex(s => s.id === updatedPhien.id)
        if (idx >= 0) sessionsNoiBo.value.splice(idx, 1)
        const ci = sessionsClosedNoiBo.value.findIndex(s => s.id === updatedPhien.id)
        if (ci >= 0) sessionsClosedNoiBo.value[ci] = updatedPhien
        else sessionsClosedNoiBo.value.unshift(updatedPhien)
      } else {
        const idx = sessionsNoiBo.value.findIndex(s => s.id === updatedPhien.id)
        if (idx >= 0) sessionsNoiBo.value[idx] = updatedPhien
        else sessionsNoiBo.value.unshift(updatedPhien)
      }
    })
  }
})

onBeforeUnmount(() => {
  if (subscriptionAdmin) subscriptionAdmin.unsubscribe()
  if (subscriptionNoiBo) subscriptionNoiBo.unsubscribe()
  if (subscriptionChat)  subscriptionChat.unsubscribe()
})

// ── Tải danh sách phiên đã đóng ───────────────────────────────────────────────
async function loadClosedSessions() {
  try {
    const loai = activeLoai.value
    const data = await layDanhSachPhien('DA_DONG', loai)
    if (loai === 'NOI_BO') sessionsClosedNoiBo.value = data
    else sessionsClosedKH.value = data
  } catch (e) {
    console.error('[ChatPage] loadClosedSessions error:', e)
  }
}

// ── Tải danh sách phiên ───────────────────────────────────────────────────────
async function loadSessions(loai) {
  try {
    const data = await layDanhSachPhien(null, loai)
    if (loai === 'NOI_BO') {
      sessionsNoiBo.value = data
    } else {
      sessions.value = data
    }
  } catch (e) {
    console.error('[ChatPage] loadSessions error:', e)
  }
}

// ── Chọn phiên ────────────────────────────────────────────────────────────────
async function chonPhien(session) {
  if (subscriptionChat) subscriptionChat.unsubscribe()

  selectedId.value      = session.id
  currentMessages.value = []

  try {
    currentMessages.value = await layTinNhan(session.id)
    await scrollToBottom()
  } catch (e) {
    console.error('[ChatPage] layTinNhan error:', e)
  }

  const client = connectChat()
  if (!client.connected) {
    await new Promise((resolve) => {
      const iv = setInterval(() => { if (client.connected) { clearInterval(iv); resolve() } }, 100)
    })
  }
  subscriptionChat = client.subscribe(`/topic/chat/${session.id}`, (msg) => {
    const data = JSON.parse(msg.body)
    currentMessages.value.push(data)
    // Cập nhật trạng thái phiên
    const list = session.loai === 'NOI_BO' ? sessionsNoiBo : sessions
    const idx = list.value.findIndex(s => s.id === session.id)
    if (idx >= 0) {
      list.value[idx].tinNhanCuoi = data.noiDung
      list.value[idx].soTinNhan++
    }
    scrollToBottom()
  })
}

// ── Tiếp nhận phiên ───────────────────────────────────────────────────────────
async function tiepNhan() {
  if (!selectedId.value) return
  const user = getAdminUser()
  const nhanVienId = user?.id || null
  try {
    const updated = await nhanPhien(selectedId.value, nhanVienId)
    const list = updated.loai === 'NOI_BO' ? sessionsNoiBo : sessions
    const idx = list.value.findIndex(s => s.id === selectedId.value)
    if (idx >= 0) list.value[idx] = updated
  } catch (e) {
    console.error('[ChatPage] tiepNhan error:', e)
  }
}

// ── Admin/Nhân viên gửi tin ───────────────────────────────────────────────────
function guiTinNhanVien() {
  const text = replyText.value.trim()
  if (!text || !selectedId.value) return
  const user = getAdminUser()
  replyText.value = ''
  sendStompMessage(`/app/chat/${selectedId.value}/nhanvien/send`, {
    noiDung: text,
    tenNguoiGui: user?.hoTen || user?.tenNhanVien || 'Admin',
    nhanVienId: user?.id || null,
  })
}

// ── Đóng phiên ────────────────────────────────────────────────────────────────
async function dongPhienHienTai() {
  if (!selectedId.value) return
  const user = getAdminUser()
  try {
    await dongPhien(selectedId.value, {
      nguoiDongId: user?.id || null,
      vaiTro: isAdmin.value ? 'ADMIN' : 'NHAN_VIEN',
    })
    const sess = selectedSession.value
    const list       = sess?.loai === 'NOI_BO' ? sessionsNoiBo    : sessions
    const closedList = sess?.loai === 'NOI_BO' ? sessionsClosedNoiBo : sessionsClosedKH
    const idx = list.value.findIndex(s => s.id === selectedId.value)
    if (idx >= 0) {
      const closedSess = { ...list.value[idx], trangThai: 'DA_DONG' }
      list.value.splice(idx, 1)
      const existIdx = closedList.value.findIndex(s => s.id === closedSess.id)
      if (existIdx >= 0) closedList.value[existIdx] = closedSess
      else closedList.value.unshift(closedSess)
    }
  } catch (e) {
    console.error('[ChatPage] dongPhien error:', e)
  }
}

async function switchTab(val) {
  activeTab.value = val
  if (val === 'DA_DONG') await loadClosedSessions()
}

function switchLoai(loai) {
  activeLoai.value = loai
  selectedId.value = null
  currentMessages.value = []
  if (subscriptionChat) { subscriptionChat.unsubscribe(); subscriptionChat = null }
  if (activeTab.value === 'DA_DONG') loadClosedSessions()
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function labelTrangThai(t) {
  const map = {
    BOT_DANG_XU_LY: '🤖 AI đang xử lý',
    CHO_NHAN_VIEN:  '⏳ Chờ tiếp nhận',
    DANG_XU_LY:     '🟢 Đang xử lý',
    DA_DONG:        '✅ Đã đóng',
  }
  return map[t] || t
}

function formatTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}
</script>

<style scoped>
.chat-admin-page {
  background: #f9fafb;
}

.session-item {
  cursor: pointer;
  transition: background .15s;
}
.session-item:hover { background: #f3f4f6; }
.session-item--active { background: #fff5f5 !important; border-left: 3px solid var(--ss-accent); }
.session-item--active.session-item--noibo { background: #eff6ff !important; border-left: 3px solid #1e3a8a; }

.session-badge {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 99px;
  font-weight: 600;
  white-space: nowrap;
}
.badge-BOT_DANG_XU_LY { background: #e0f2fe; color: #0369a1; }
.badge-CHO_NHAN_VIEN   { background: #fef9c3; color: #92400e; }
.badge-DANG_XU_LY      { background: #dcfce7; color: #15803d; }
.badge-DA_DONG         { background: #f3f4f6; color: #6b7280; }

.chat-messages-admin {
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.admin-msg {
  margin-bottom: 14px;
  max-width: 75%;
}
.admin-msg--bot   { align-self: flex-start; }
.admin-msg--nv    { align-self: flex-start; }           /* Nhân viên → trái */
.admin-msg--khach { align-self: flex-end; }             /* Khách hàng → phải */

.admin-msg__meta { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
.admin-msg--nv    .admin-msg__meta { text-align: left; }
.admin-msg--khach .admin-msg__meta { text-align: right; }

.admin-msg__bubble {
  padding: 9px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
}
.admin-msg--bot   .admin-msg__bubble { background: #fff; border: 1px solid #e5e7eb; color: #374151; border-radius: 2px 12px 12px 12px; }
.admin-msg--nv    .admin-msg__bubble { background: #1e3a8a; color: #fff; border-radius: 2px 12px 12px 12px; }
.admin-msg--khach .admin-msg__bubble { background: var(--ss-accent); color: #fff; border-radius: 12px 2px 12px 12px; }

.header-noibo {
  background: #eff6ff;
  border-bottom-color: #bfdbfe !important;
}

.flex-1 { flex: 1; }
</style>