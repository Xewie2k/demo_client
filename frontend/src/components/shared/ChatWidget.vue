<template>
  <!-- Bubble trigger -->
  <button
    class="chat-bubble"
    @click="toggleChat"
    :title="isOpen ? 'Đóng chat' : 'Hỗ trợ trực tuyến'"
  >
    <span v-if="!isOpen" class="material-icons">chat</span>
    <span v-else class="material-icons">close</span>
    <span v-if="unreadCount > 0 && !isOpen" class="chat-badge">{{ unreadCount }}</span>
  </button>

  <!-- Chat window -->
  <transition name="chat-slide">
    <div v-if="isOpen" class="chat-window">

      <!-- Header -->
      <div class="chat-header">
        <div class="d-flex align-items-center gap-2">
          <span class="material-icons" style="font-size:20px">support_agent</span>
          <div>
            <div class="fw-bold" style="font-size:14px">SevenStrike Hỗ Trợ</div>
            <div style="font-size:11px; opacity:.8">
              <span v-if="trangThai === 'BOT_DANG_XU_LY'">🤖 Trợ lý AI</span>
              <span v-else-if="trangThai === 'CHO_NHAN_VIEN'">⏳ Đang kết nối nhân viên...</span>
              <span v-else-if="trangThai === 'DANG_XU_LY'">🟢 Nhân viên đang hỗ trợ</span>
              <span v-else>Hỗ trợ trực tuyến</span>
            </div>
          </div>
        </div>
        <button class="btn btn-link text-white p-0" @click="isOpen = false">
          <span class="material-icons" style="font-size:20px">expand_more</span>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesEl">
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
          <div class="chat-msg__bubble">{{ msg.noiDung }}</div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isWaiting" class="chat-msg chat-msg--bot">
          <div class="chat-msg__name">SevenStrike AI</div>
          <div class="chat-msg__bubble chat-msg__bubble--typing">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Nút gặp nhân viên (chỉ khi AI đang trả lời) -->
      <div v-if="trangThai === 'BOT_DANG_XU_LY'" class="chat-quick-action">
        <button class="btn btn-sm btn-outline-secondary w-100" @click="yeuCauNhanVien">
          <span class="material-icons" style="font-size:14px; vertical-align:middle">person</span>
          Gặp nhân viên hỗ trợ
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

      <!-- Input -->
      <div class="chat-input-wrap">
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
          :disabled="trangThai === 'DA_DONG'"
        />
        <button
          class="chat-send-btn"
          @click="guiTin"
          :disabled="!inputText.trim() || trangThai === 'DA_DONG'"
        >
          <span class="material-icons">send</span>
        </button>
      </div>

    </div>
  </transition>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  connectChat, subscribeTopic, sendStompMessage,
  khoiTaoPhien, layTinNhan, getPhien, disconnectChat
} from '@/services/chatService'
import { useClientAuth } from '@/services/authClient'

const { customer } = useClientAuth()

const isOpen      = ref(false)
const messages    = ref([])
const inputText   = ref('')
const trangThai   = ref('BOT_DANG_XU_LY')
const isWaiting   = ref(false)
const unreadCount = ref(0)
const phienChatId = ref(null)
const messagesEl  = ref(null)

// ── Gợi ý câu hỏi ─────────────────────────────────────────────────────────────
const showSuggestions    = ref(true)
const showAllSuggestions = ref(false)
const suggestions = [
  'Làm thế nào để đặt hàng?',
  'Chính sách đổi trả hàng?',
  'Phí vận chuyển là bao nhiêu?',
  'Kiểm tra trạng thái đơn hàng',
  'Có voucher giảm giá không?',
  'Sản phẩm có bảo hành không?',
  'Hướng dẫn thanh toán online',
  'Liên hệ nhân viên hỗ trợ',
]
const shouldShowSuggestions = computed(() => showSuggestions.value)
const visibleSuggestions    = computed(() =>
  showAllSuggestions.value ? suggestions : suggestions.slice(0, 3)
)

let subscription = null

// ── LocalStorage helpers ───────────────────────────────────────────────────────
function getChatKey() {
  const id = customer.value?.id
  return id ? `ss_chat_pid_${id}` : 'ss_chat_pid_guest'
}
function saveChatSession(phienId) {
  localStorage.setItem(getChatKey(), String(phienId))
}
function loadChatSession() {
  return localStorage.getItem(getChatKey())
}
function clearChatSession() {
  localStorage.removeItem(getChatKey())
}

// ── Khởi tạo phiên và kết nối WS ─────────────────────────────────────────────
onMounted(async () => {
  const tenKhach = customer.value?.hoTen || 'Khách vãng lai'
  const khachHangId = customer.value?.id || null

  try {
    let phien = null
    const storedId = loadChatSession()

    if (storedId) {
      try {
        const stored = await getPhien(Number(storedId))
        if (stored.trangThai !== 'DA_DONG') {
          phien = stored
        } else {
          clearChatSession()
        }
      } catch {
        clearChatSession()
      }
    }

    if (!phien) {
      phien = await khoiTaoPhien(tenKhach, khachHangId)
      saveChatSession(phien.id)
    }

    phienChatId.value = phien.id
    trangThai.value   = phien.trangThai

    // Lấy toàn bộ lịch sử tin nhắn
    const history = await layTinNhan(phien.id)
    messages.value = history
    await scrollToBottom()

    // Kết nối WebSocket
    const client = connectChat()

    // Đợi kết nối STOMP hoàn tất rồi subscribe
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

      // Cập nhật trạng thái theo type tin nhắn
      if (data.nguoiGui === 'NHAN_VIEN') trangThai.value = 'DANG_XU_LY'

      // Phiên đóng → clear localStorage để lần sau tạo phiên mới
      if (data.nguoiGui === 'BOT' && data.noiDung?.includes('kết thúc')) {
        trangThai.value = 'DA_DONG'
        clearChatSession()
      }

      if (!isOpen.value) unreadCount.value++
      scrollToBottom()
    })
  } catch (e) {
    console.error('[ChatWidget] Khởi tạo thất bại:', e)
  }
})

onBeforeUnmount(() => {
  if (subscription) subscription.unsubscribe()
  disconnectChat()
})

// ── Gửi tin nhắn ─────────────────────────────────────────────────────────────
async function guiTin() {
  const text = inputText.value.trim()
  if (!text || !phienChatId.value) return

  inputText.value = ''
  showSuggestions.value = false
  isWaiting.value = (trangThai.value === 'BOT_DANG_XU_LY')

  sendStompMessage(`/app/chat/${phienChatId.value}/send`, {
    noiDung: text,
    tenNguoiGui: customer.value?.hoTen || 'Khách vãng lai',
  })
}

// ── Chọn gợi ý câu hỏi ───────────────────────────────────────────────────────
function chonGoiY(text) {
  inputText.value = text
  showSuggestions.value = false
  guiTin()
}

// ── Yêu cầu gặp nhân viên ────────────────────────────────────────────────────
function yeuCauNhanVien() {
  trangThai.value = 'CHO_NHAN_VIEN'
  sendStompMessage(`/app/chat/${phienChatId.value}/send`, {
    noiDung: 'Tôi muốn nói chuyện với nhân viên hỗ trợ.',
    tenNguoiGui: customer.value?.hoTen || 'Khách vãng lai',
  })
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
</script>

<style scoped>
/* ── Bubble ───────────────────────────────────────────────────────────────── */
.chat-bubble {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ss-accent, #ff4d4f);
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(255,77,79,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9000;
  transition: transform .2s;
}
.chat-bubble:hover { transform: scale(1.08); }
.chat-badge {
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
.chat-window {
  position: fixed;
  bottom: 96px;
  right: 28px;
  width: 360px;
  height: 500px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 8999;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.chat-header {
  background: var(--ss-accent, #ff4d4f);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Messages ─────────────────────────────────────────────────────────────── */
.chat-messages {
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
.chat-msg--bot   .chat-msg__bubble { background: #fff; border: 1px solid #e5e7eb; color: #374151; border-radius: 2px 12px 12px 12px; }
.chat-msg--khach .chat-msg__bubble { background: var(--ss-accent, #ff4d4f); color: #fff; border-radius: 12px 2px 12px 12px; }
.chat-msg--nv    .chat-msg__bubble { background: #1e3a8a; color: #fff; border-radius: 2px 12px 12px 12px; }

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
.chat-input:focus { border-color: var(--ss-accent, #ff4d4f); }
.chat-send-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--ss-accent, #ff4d4f);
  color: #fff;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity .2s;
}
.chat-send-btn:disabled { opacity: .4; cursor: not-allowed; }

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
  border: 1px solid var(--ss-accent, #ff4d4f);
  color: var(--ss-accent, #ff4d4f);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.chip:hover {
  background: var(--ss-accent, #ff4d4f);
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
