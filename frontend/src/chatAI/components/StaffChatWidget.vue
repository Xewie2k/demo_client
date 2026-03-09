<template>
  <!-- Bubble trigger -->
  <button
    class="staff-chat-bubble"
    @click="toggleChat"
    :title="isOpen ? 'Đóng chat' : 'Hỗ trợ nội bộ'"
  >
    <span v-if="!isOpen" class="material-icons">support_agent</span>
    <span v-else class="material-icons">close</span>
    <span v-if="unreadCount > 0 && !isOpen" class="staff-chat-badge">{{ unreadCount }}</span>
  </button>

  <!-- Chat window -->
  <transition name="chat-slide">
    <div v-if="isOpen" class="staff-chat-window">

      <!-- Header -->
      <div class="staff-chat-header">
        <div class="d-flex align-items-center gap-2">
          <span class="material-icons" style="font-size:20px">admin_panel_settings</span>
          <div>
            <div class="fw-bold" style="font-size:14px">Hỗ Trợ Nội Bộ</div>
            <div style="font-size:11px; opacity:.8">
              <span v-if="trangThai === 'BOT_DANG_XU_LY'">🤖 AI Nội Bộ</span>
              <span v-else-if="trangThai === 'CHO_NHAN_VIEN'">⏳ Đang kết nối Admin...</span>
              <span v-else-if="trangThai === 'DANG_XU_LY'">🟢 Admin đang hỗ trợ</span>
              <span v-else-if="trangThai === 'DA_DONG'">🔴 Phiên đã kết thúc</span>
              <span v-else>Hỗ trợ nội bộ</span>
            </div>
          </div>
        </div>
        <button class="btn btn-link text-white p-0" @click="isOpen = false">
          <span class="material-icons" style="font-size:20px">expand_more</span>
        </button>
      </div>

      <!-- Messages -->
      <div class="staff-chat-messages" ref="messagesEl">
        <div
          v-for="msg in messages"
          :key="msg.id || msg.thoiGian"
          class="chat-msg"
          :class="{
            'chat-msg--bot':  msg.nguoiGui === 'BOT',
            'chat-msg--khach': msg.nguoiGui === 'KHACH',
            'chat-msg--nv':   msg.nguoiGui === 'NHAN_VIEN',
          }"
        >
          <div class="chat-msg__name">{{ msg.tenNguoiGui }}</div>
          <div class="chat-msg__bubble" v-html="renderMessage(msg.noiDung)"></div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isWaiting" class="chat-msg chat-msg--bot">
          <div class="chat-msg__name">AI Nội Bộ</div>
          <div class="chat-msg__bubble chat-msg__bubble--typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Nút hỏi Admin (chỉ khi AI đang trả lời) -->
      <div v-if="trangThai === 'BOT_DANG_XU_LY'" class="chat-quick-action">
        <button class="btn btn-sm btn-outline-secondary w-100" @click="yeuCauAdmin">
          <span class="material-icons" style="font-size:14px; vertical-align:middle">manage_accounts</span>
          Hỏi Admin trực tiếp
        </button>
      </div>

      <!-- Gợi ý câu hỏi -->
      <transition name="slide-up">
        <div v-if="shouldShowSuggestions" class="suggestion-panel">
          <span class="suggestion-label">💡 Câu hỏi gợi ý:</span>
          <div class="suggestion-chips">
            <button
              v-for="s in visibleSuggestions"
              :key="s"
              class="chip"
              @click="chonGoiY(s)"
            >{{ s }}</button>
            <button
              v-if="!showAllSuggestions && suggestions.length > 3"
              class="chip chip--more"
              @click="showAllSuggestions = true"
            >• • •</button>
            <button
              v-if="showAllSuggestions"
              class="chip chip--less"
              @click="showAllSuggestions = false"
            >Thu gọn ↑</button>
          </div>
        </div>
      </transition>

      <!-- Phiên đã kết thúc -->
      <div v-if="trangThai === 'DA_DONG'" class="chat-ended-bar">
        <span class="chat-ended-text">Phiên nội bộ đã kết thúc</span>
        <button class="chat-restart-btn" @click="batDauMoi">
          🔄 Bắt đầu cuộc trò chuyện mới
        </button>
      </div>

      <!-- Input -->
      <div v-else class="chat-input-wrap">
        <button
          class="btn-suggest"
          @click="showSuggestions = !showSuggestions"
          title="Gợi ý câu hỏi"
        >💡</button>
        <input
          v-model="inputText"
          class="chat-input"
          placeholder="Nhập tin nhắn..."
          @keyup.enter="guiTin"
        />
        <button
          class="staff-send-btn"
          @click="guiTin"
          :disabled="!inputText.trim()"
        >
          <span class="material-icons">send</span>
        </button>
      </div>

    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { connectChat, layTinNhan, getPhien, disconnectChat, khoiTaoPhienNoiBo } from '@/chatAI/services/chatService'

const isOpen      = ref(false)
const messages    = ref([])
const inputText   = ref('')
const trangThai   = ref('BOT_DANG_XU_LY')
const isWaiting   = ref(false)
const unreadCount = ref(0)
const phienChatId = ref(null)
const messagesEl  = ref(null)
const nhanVienInfo = ref(null)

// ── Gợi ý câu hỏi nội bộ ──────────────────────────────────────────────────────
const showSuggestions    = ref(true)
const showAllSuggestions = ref(false)
const suggestions = [
  'Quy trình xử lý đơn hàng lỗi?',
  'Cách hoàn tiền cho khách?',
  'Cách xuất hóa đơn?',
  'Chính sách chiết khấu?',
  'Quy định ca làm việc?',
  'Cách cập nhật tồn kho?',
  'Báo cáo sự cố kỹ thuật',
]
const shouldShowSuggestions = computed(() => showSuggestions.value)
const visibleSuggestions    = computed(() =>
  showAllSuggestions.value ? suggestions : suggestions.slice(0, 3)
)

let subscription = null

function getStaffUser() {
  const raw =
    localStorage.getItem('user') ||
    sessionStorage.getItem('user') ||
    localStorage.getItem('nguoiDung') ||
    sessionStorage.getItem('nguoiDung')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// ── LocalStorage helpers ───────────────────────────────────────────────────────
function getStaffChatKey() {
  const user = getStaffUser()
  return user?.id ? `ss_chat_pid_staff_${user.id}` : 'ss_chat_pid_staff'
}
function saveStaffChatSession(phienId) {
  localStorage.setItem(getStaffChatKey(), String(phienId))
}
function loadStaffChatSession() {
  return localStorage.getItem(getStaffChatKey())
}
function clearStaffChatSession() {
  localStorage.removeItem(getStaffChatKey())
}

// ── Khởi tạo phiên và kết nối WS ─────────────────────────────────────────────
onMounted(async () => {
  const user = getStaffUser()
  nhanVienInfo.value = user

  const tenKhach = user?.hoTen || user?.tenNhanVien || user?.ten || 'Nhân viên'
  const nhanVienId = user?.id || null

  try {
    let phien = null
    const storedId = loadStaffChatSession()

    if (storedId) {
      try {
        const stored = await getPhien(Number(storedId))
        if (stored.trangThai !== 'DA_DONG' && stored.loai === 'NOI_BO') {
          phien = stored
        } else {
          clearStaffChatSession()  // clear cả khi loai sai (không phải NOI_BO)
        }
      } catch {
        clearStaffChatSession()
      }
    }

    if (!phien) {
      phien = await khoiTaoPhienNoiBo(tenKhach, nhanVienId)
      saveStaffChatSession(phien.id)
    }

    phienChatId.value = phien.id
    trangThai.value   = phien.trangThai

    // Lấy toàn bộ lịch sử tin nhắn
    const history = await layTinNhan(phien.id)
    messages.value = history
    await scrollToBottom()

    // Kết nối WebSocket
    const client = connectChat()

    const waitConnected = () => new Promise((resolve) => {
      if (client.connected) { resolve(); return }
      const check = setInterval(() => {
        if (client.connected) { clearInterval(check); resolve() }
      }, 100)
    })
    await waitConnected()

    subscription = client.subscribe(`/topic/chat/${phien.id}`, (msg) => {
      const data = JSON.parse(msg.body)
      messages.value.push(data)
      isWaiting.value = false

      if (data.nguoiGui === 'NHAN_VIEN') trangThai.value = 'DANG_XU_LY'

      // Phiên đóng → clear localStorage để lần sau tạo phiên mới
      if (data.nguoiGui === 'BOT' && data.noiDung?.includes('kết thúc')) {
        trangThai.value = 'DA_DONG'
        clearStaffChatSession()
      }

      if (!isOpen.value) unreadCount.value++
      scrollToBottom()
    })
  } catch (e) {
    console.error('[StaffChatWidget] Khởi tạo thất bại:', e)
  }
})

onBeforeUnmount(() => {
  if (subscription) subscription.unsubscribe()
})

// ── Gửi tin nhắn ─────────────────────────────────────────────────────────────
function guiTin() {
  const text = inputText.value.trim()
  if (!text || !phienChatId.value) return

  const client = connectChat()
  inputText.value = ''
  showSuggestions.value = false
  isWaiting.value = (trangThai.value === 'BOT_DANG_XU_LY')

  const tenNV = nhanVienInfo.value?.hoTen || nhanVienInfo.value?.tenNhanVien || 'Nhân viên'
  client.publish({
    destination: `/app/chat/${phienChatId.value}/send`,
    body: JSON.stringify({ noiDung: text, tenNguoiGui: tenNV }),
  })
}

// ── Chọn gợi ý câu hỏi ───────────────────────────────────────────────────────
function chonGoiY(text) {
  inputText.value = text
  showSuggestions.value = false
  guiTin()
}

// ── Yêu cầu gặp Admin ────────────────────────────────────────────────────────
function yeuCauAdmin() {
  trangThai.value = 'CHO_NHAN_VIEN'
  const client = connectChat()
  const tenNV = nhanVienInfo.value?.hoTen || nhanVienInfo.value?.tenNhanVien || 'Nhân viên'
  client.publish({
    destination: `/app/chat/${phienChatId.value}/send`,
    body: JSON.stringify({
      noiDung: 'Tôi cần gặp Admin để được hỗ trợ trực tiếp.',
      tenNguoiGui: tenNV,
    }),
  })
}

// ── Bắt đầu phiên mới khi phiên cũ đã đóng ───────────────────────────────────
async function batDauMoi() {
  if (subscription) { subscription.unsubscribe(); subscription = null }
  messages.value = []
  trangThai.value = 'BOT_DANG_XU_LY'
  phienChatId.value = null
  isWaiting.value = false
  showSuggestions.value = true
  showAllSuggestions.value = false

  const user = getStaffUser()
  const tenKhach = user?.hoTen || user?.tenNhanVien || user?.ten || 'Nhân viên'
  const nhanVienId = user?.id || null

  try {
    const phien = await khoiTaoPhienNoiBo(tenKhach, nhanVienId)
    saveStaffChatSession(phien.id)
    phienChatId.value = phien.id
    trangThai.value = phien.trangThai

    const history = await layTinNhan(phien.id)
    messages.value = history
    await scrollToBottom()

    const client = connectChat()
    const waitConnected = () => new Promise((resolve) => {
      if (client.connected) { resolve(); return }
      const check = setInterval(() => {
        if (client.connected) { clearInterval(check); resolve() }
      }, 100)
    })
    await waitConnected()

    subscription = client.subscribe(`/topic/chat/${phien.id}`, (msg) => {
      const data = JSON.parse(msg.body)
      messages.value.push(data)
      isWaiting.value = false

      if (data.nguoiGui === 'NHAN_VIEN') trangThai.value = 'DANG_XU_LY'
      if (data.nguoiGui === 'BOT' && data.noiDung?.includes('kết thúc')) {
        trangThai.value = 'DA_DONG'
        clearStaffChatSession()
      }

      if (!isOpen.value) unreadCount.value++
      scrollToBottom()
    })
  } catch (e) {
    console.error('[StaffChatWidget] Bắt đầu mới thất bại:', e)
  }
}

// ── Toggle cửa sổ chat ────────────────────────────────────────────────────────
function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unreadCount.value = 0
    scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

// ── Render message với link clickable ─────────────────────────────────────────
function renderMessage(text) {
  if (!text) return ''
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  safe = safe.replace(
    /\/client\/products\/(\d+)/g,
    '<a href="/client/products/$1" target="_blank" class="chat-link">Xem sản phẩm #$1</a>'
  )
  safe = safe.replace(/\n/g, '<br>')
  return safe
}
</script>

<style scoped>
/* ── Bubble ───────────────────────────────────────────────────────────────── */
.staff-chat-bubble {
  position: fixed;
  bottom: 100px;
  right: 28px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(30,58,138,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9001;
  transition: transform .2s;
}
.staff-chat-bubble:hover { transform: scale(1.08); }
.staff-chat-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: #f59e0b;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 50%;
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
}

/* ── Window ───────────────────────────────────────────────────────────────── */
.staff-chat-window {
  position: fixed;
  bottom: 164px;
  right: 28px;
  width: 360px;
  height: 500px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 9000;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.staff-chat-header {
  background: #1e3a8a;
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Messages ─────────────────────────────────────────────────────────────── */
.staff-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8f9fa;
}
.chat-msg { display: flex; flex-direction: column; max-width: 80%; }
.chat-msg--bot   { align-self: flex-start; }
.chat-msg--khach { align-self: flex-end; }
.chat-msg--nv    { align-self: flex-start; }

.chat-msg__name {
  font-size: 10px;
  color: #9ca3af;
  margin-bottom: 3px;
}
.chat-msg--khach .chat-msg__name { text-align: right; }

.chat-msg__bubble {
  padding: 9px 13px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.5;
  word-break: break-word;
}
.chat-msg--bot   .chat-msg__bubble { background: #f3f4f6; border: none; color: #374151; border-radius: 2px 12px 12px 12px; white-space: pre-wrap; }
.chat-msg--khach .chat-msg__bubble { background: #1d4ed8; color: #fff; border-radius: 12px 2px 12px 12px; }
.chat-msg--nv    .chat-msg__bubble { background: #f3f4f6; color: #374151; border-radius: 2px 12px 12px 12px; }
.chat-link { color: #1d4ed8; font-weight: 600; text-decoration: underline; }

/* Typing animation */
.chat-msg__bubble--typing { display: flex; gap: 5px; align-items: center; padding: 12px; }
.chat-msg__bubble--typing span {
  width: 8px; height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing-bounce .9s infinite;
}
.chat-msg__bubble--typing span:nth-child(2) { animation-delay: .2s; }
.chat-msg__bubble--typing span:nth-child(3) { animation-delay: .4s; }
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

/* ── Quick action ─────────────────────────────────────────────────────────── */
.chat-quick-action {
  padding: 6px 12px 0;
  background: #f8f9fa;
}

/* ── Input ────────────────────────────────────────────────────────────────── */
.chat-input-wrap {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-top: 1px solid #e5e7eb;
  gap: 8px;
  background: #fff;
}
.chat-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 13.5px;
  outline: none;
  transition: border-color .2s;
}
.chat-input:focus { border-color: #1e3a8a; }
.staff-send-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #1e3a8a;
  color: #fff;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity .2s;
}
.staff-send-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Suggestion panel ─────────────────────────────────────────────────────── */
.suggestion-panel {
  padding: 8px 12px 6px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
.suggestion-label {
  font-size: 11px;
  color: #9ca3af;
  display: block;
  margin-bottom: 6px;
}
.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid #1e3a8a;
  color: #1e3a8a;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.chip:hover {
  background: #1e3a8a;
  color: #fff;
}
.chip--more,
.chip--less {
  border-style: dashed;
  opacity: .7;
}
.chip--more:hover,
.chip--less:hover { opacity: 1; }
.btn-suggest {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
  opacity: .65;
  flex-shrink: 0;
  line-height: 1;
}
.btn-suggest:hover { opacity: 1; }

/* ── Ended bar ────────────────────────────────────────────────────────────── */
.chat-ended-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f8faff;
}
.chat-ended-text {
  font-size: 12px;
  color: #9ca3af;
}
.chat-restart-btn {
  font-size: 13px;
  padding: 6px 16px;
  border: 1px solid #1e3a8a;
  color: #1e3a8a;
  background: #fff;
  border-radius: 20px;
  cursor: pointer;
  transition: all .15s;
}
.chat-restart-btn:hover {
  background: #1e3a8a;
  color: #fff;
}

/* ── Transition ───────────────────────────────────────────────────────────── */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}
.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(.97);
}
.slide-up-enter-active,
.slide-up-leave-active { transition: opacity .2s ease, transform .2s ease; }
.slide-up-enter-from,
.slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>