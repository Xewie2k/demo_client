<!-- File: src/pages/lich_lam_viec/GiaoCa.vue -->
<template>
  <div class="giao-ca-container">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang tải dữ liệu ...</span>
    </div>

    <div v-if="!loading && !caHienTai" class="modal-overlay">
      <div class="start-shift-modal">
        <div class="ss-header">
          <div class="ss-header-title">
            <i class="fa-regular fa-clock"></i>
            <span>MỞ CA LÀM VIỆC</span>
          </div>
          <div class="ss-header-sub">{{ formattedFullTime }}</div>
        </div>

        <div class="ss-body">
          <div class="ss-schedule-box">
            <div class="ss-schedule-label">LỊCH CỦA BẠN</div>
            <div class="ss-schedule-info">
              <span class="ss-shift-name">{{ lichHomNay?.tenCa || "Chưa có lịch" }}</span>
              <span class="ss-shift-time" v-if="lichHomNay">
                {{ lichHomNay.gioBatDau }} - {{ lichHomNay.gioKetThuc }}
              </span>
            </div>
          </div>

          <div class="ss-user-row">
            <div class="ss-user-info">
              <i class="fa-solid fa-circle-user" style="color: #9ca3af; font-size: 1.2rem"></i>
              <strong>{{ currentUser?.tenNhanVien || currentUser?.hoTen || "Nhân viên" }}</strong>
            </div>
            <div class="ss-current-time">{{ formattedTimeOnly }}</div>
          </div>

          <div class="form-group">
            <div class="d-flex justify-between mb-2">
              <label class="text-label">TIỀN MẶT ĐẦU CA <span class="text-danger">*</span></label>
            </div>
            <div class="input-money-wrapper new-input-style">
              <span class="currency-prefix">₫</span>
              <input
                type="text"
                class="form-control money-input-new"
                :value="tienBanDauInput !== null ? formatNumber(tienBanDauInput) : ''"
                @input="onInputMoney($event, 'start')"
                placeholder="Nhập số tiền..."
              />
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="text-label mb-2">GHI CHÚ</label>
            <textarea
              v-model="ghiChuBanDau"
              class="form-control note-textarea"
              rows="2"
              placeholder="Nhập ghi chú tại đây..."
            ></textarea>
          </div>

          <div v-if="errorMessage" class="error-box">
            <i class="fa-solid fa-circle-exclamation"></i>
            {{ errorMessage }}
          </div>
        </div>

        <div class="ss-footer">
          <button class="btn-logout" @click="handleLogout">Đăng xuất</button>
          <button
            class="btn-confirm"
            @click="handleBatDauCa"
            :disabled="isSubmitting || !lichHomNay || tienBanDauInput === null"
          >
            <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-circle-check"></i>
            XÁC NHẬN VÀO CA
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && caHienTai" class="ho-wrapper">
      <div class="ho-header">
        <div class="ho-header-left">
          <div class="ho-icon-box">
            <i class="fa-solid fa-file-invoice"></i>
          </div>
          <div class="ho-header-text">
            <h2>Phiếu Bàn Giao Ca</h2>
            <span class="ho-sub-text">
              #{{ caHienTai.id ? caHienTai.id.toString().substring(0, 8) : "cccadd2e" }}
              • {{ formattedFullTime }}
            </span>
          </div>
        </div>

        <div class="ho-header-right">
          <div class="ho-badge">
            <span class="ho-role">NHÂN VIÊN TRỰC</span>
            <span class="ho-name">{{ currentUser?.tenNhanVien || currentUser?.hoTen || "Nhân viên" }}</span>
          </div>
        </div>
      </div>

      <div class="ho-body">
        <div class="ho-card ho-left-col">
          <h3 class="ho-title">Tài chính trong ca</h3>

          <div class="ho-row mt-3">
            <span class="ho-label-text">Tiền mặt đầu ca</span>
            <span class="ho-val-text font-bold">{{ formatNumber(caHienTai.tienDauCaNhap) }} ₫</span>
          </div>

          <div class="ho-row">
            <span class="ho-label-text">Doanh thu Tiền mặt</span>
            <span class="ho-val-text text-success font-bold">+{{ formatNumber(caHienTai.tongTienTrongCa) }} ₫</span>
          </div>

          <div class="ho-row">
            <span class="ho-label-text">Doanh thu CK / Thẻ</span>
            <span class="ho-val-text text-primary font-bold">0 ₫</span>
          </div>

          <div class="ho-divider">
            <i class="fa-solid fa-receipt"></i>
            Đã thanh toán:
            <strong>{{ caHienTai.soDonHangDaThanhToan || 0 }}</strong> đơn
          </div>

          <div class="ho-summary-box">
            <div class="ho-summary-title">TỔNG TIỀN MẶT LÝ THUYẾT</div>
            <div class="ho-summary-value">{{ formatNumber(tinhTongLyThuyet) }} ₫</div>
            <div class="ho-summary-note">(Đầu ca + Doanh thu Tiền mặt - Chi phí)</div>
          </div>
        </div>

        <div class="ho-card ho-right-col">
          <h3 class="ho-title">
            <i class="fa-solid fa-clipboard-check text-success-icon"></i>
            Kiểm kê & Xác nhận
          </h3>

          <div class="form-group mt-3">
            <label class="ho-input-label">NHẬP TIỀN THỰC TẾ <span class="text-danger">*</span></label>
            <div class="ho-input-wrapper">
              <input
                type="text"
                class="ho-input-money"
                :value="tienThucTeInput !== null ? formatNumber(tienThucTeInput) : ''"
                @input="onInputMoney($event, 'end')"
                placeholder="Nhập thực tế..."
              />
              <span class="ho-currency-right">₫</span>
            </div>
          </div>

          <div
            class="ho-diff-box"
            :class="chenhLech >= 0 ? (chenhLech === 0 ? 'bg-gray' : 'bg-success-light') : 'bg-danger-light'"
          >
            <div class="diff-left">
              <i v-if="chenhLech < 0" class="fa-solid fa-circle-exclamation text-danger"></i>
              <i v-else-if="chenhLech > 0" class="fa-solid fa-circle-check text-success"></i>
              <i v-else class="fa-solid fa-check text-gray"></i>

              <span
                class="diff-text"
                :class="chenhLech >= 0 ? (chenhLech === 0 ? 'text-gray' : 'text-success') : 'text-danger'"
              >
                {{ chenhLech < 0 ? "Thiếu hụt" : chenhLech > 0 ? "Thừa tiền" : "Khớp" }}
              </span>
            </div>

            <span
              class="diff-val"
              :class="chenhLech >= 0 ? (chenhLech === 0 ? 'text-gray' : 'text-success') : 'text-danger'"
            >
              {{ chenhLech > 0 ? "+" : "" }}{{ formatNumber(chenhLech) }} ₫
            </span>
          </div>

          <div class="form-group mt-4">
            <label class="ho-input-label">GHI CHÚ</label>
            <textarea
              v-model="ghiChuInput"
              class="ho-textarea"
              rows="2"
              placeholder="Nhập lý do chênh lệch tiền..."
            ></textarea>
          </div>

          <button class="btn-submit-end" @click="submitKetThucCa" :disabled="isSubmitting || tienThucTeInput === null">
            {{ isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐÓNG CA" }}
          </button>

          <div class="ho-footer-note">Hệ thống sẽ tự động đăng xuất sau khi hoàn tất.</div>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast-notification">
      <div class="toast-icon">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div class="toast-body">
        <h4 class="toast-title">Thành công</h4>
        <p class="toast-msg">{{ toastMessage }}</p>
      </div>
      <div class="toast-close" @click="showToast = false">
        <i class="fa-solid fa-xmark"></i>
      </div>
      <div class="toast-progress"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { batDauCa, checkActiveCa, ketThucCa } from "@/services/lich_lam_viec/giao_caService";
import { getLichLamViecNhanVien } from "@/services/lich_lam_viec/lich_lam_viec_nhan_vienService";

const router = useRouter();
const emit = defineEmits(["ca-started"]);

const layThongTinUser = () => {
  try {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const currentUser = layThongTinUser();
const ID_NHAN_VIEN = currentUser ? currentUser.id || currentUser.idNhanVien : null;

if (!ID_NHAN_VIEN) {
  router.push("/login");
}

const loading = ref(true);
const isSubmitting = ref(false);
const caHienTai = ref(null);
const lichHomNay = ref(null);
const errorMessage = ref("");
const showToast = ref(false);
const toastMessage = ref("");

const tienBanDauInput = ref(null);
const ghiChuBanDau = ref("");
const tienThucTeInput = ref(null);
const ghiChuInput = ref("");

const now = ref(new Date());

let timer = null;
let toastTimeout = null;

const formattedFullTime = computed(() => {
  const d = now.value;
  const time = d.toLocaleTimeString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
  return `${time} ${date}`;
});

const formattedTimeOnly = computed(() => {
  return now.value.toLocaleTimeString("vi-VN", { hour12: false });
});

const layDuLieuThuc = (res) => {
  return res?.data?.content || res?.data || res || null;
};

const triggerToast = (msg) => {
  toastMessage.value = msg;
  showToast.value = true;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const tinhTongLyThuyet = computed(() => {
  if (!caHienTai.value) return 0;
  const banDau = Number(caHienTai.value.tienDauCaNhap || 0);
  const doanhThu = Number(caHienTai.value.tongTienTrongCa || 0);
  return banDau + doanhThu;
});

const chenhLech = computed(() => {
  return Number(tienThucTeInput.value || 0) - tinhTongLyThuyet.value;
});

const formatNumber = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return "0";
  return new Intl.NumberFormat("vi-VN").format(Number(num));
};

const onInputMoney = (event, type) => {
  const raw = event.target.value.replace(/\D/g, "");
  const val = raw ? Number(raw) : null;

  if (type === "start") {
    tienBanDauInput.value = val;
  }

  if (type === "end") {
    tienThucTeInput.value = val;
  }
};

const loadData = async () => {
  loading.value = true;
  errorMessage.value = "";
  caHienTai.value = null;
  lichHomNay.value = null;

  try {
    let activeCa = null;

    try {
      const resCa = await checkActiveCa(ID_NHAN_VIEN);
      activeCa = layDuLieuThuc(resCa);
    } catch (error) {
      console.log("Nhân viên chưa có ca mở:", error?.message || error);
    }

    if (activeCa && activeCa.id) {
      caHienTai.value = activeCa;
      sessionStorage.setItem("ss_has_active_shift", "true");
      return;
    }

    sessionStorage.removeItem("ss_has_active_shift");

    try {
      const d = new Date();
      const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      const resLich = await getLichLamViecNhanVien(ID_NHAN_VIEN, today);
      const lichList = layDuLieuThuc(resLich);

      if (Array.isArray(lichList) && lichList.length > 0) {
        lichHomNay.value = lichList[0];
      } else {
        errorMessage.value = "Bạn không có ca làm việc nào được phân công hôm nay.";
      }
    } catch (error) {
      console.error("Lỗi lấy lịch làm việc:", error);
      errorMessage.value = "Mất kết nối máy chủ. Không thể tải lịch làm việc.";
    }
  } finally {
    loading.value = false;
  }
};

const handleBatDauCa = async () => {
  errorMessage.value = "";

  if (tienBanDauInput.value === null) {
    alert("Vui lòng nhập tiền mặt đầu ca!");
    return;
  }

  if (tienBanDauInput.value < 0) {
    alert("Tiền đầu ca không hợp lệ!");
    return;
  }

  if (!lichHomNay.value) {
    return;
  }

  isSubmitting.value = true;

  try {
    const idLichLamViec = lichHomNay.value?.lichLamViec?.id || lichHomNay.value?.idLichLamViec;

    if (!idLichLamViec) {
      throw new Error("Không tìm thấy lịch làm việc để bắt đầu ca.");
    }

    await batDauCa({
      idNhanVien: ID_NHAN_VIEN,
      idLichLamViec: idLichLamViec,
      tienDauCaNhap: tienBanDauInput.value,
      ghiChu: ghiChuBanDau.value?.trim() || "",
    });

    await loadData();
    triggerToast("Bắt đầu ca làm việc thành công!");
    emit("ca-started");
  } catch (error) {
    console.error("Lỗi bắt đầu ca:", error);
    errorMessage.value =
      error?.response?.data?.message ||
      error?.data?.message ||
      error?.message ||
      "Không thể bắt đầu ca vào lúc này.";
  } finally {
    isSubmitting.value = false;
  }
};

const submitKetThucCa = async () => {
  if (!caHienTai.value) return;

  if (tienThucTeInput.value === null) {
    alert("Vui lòng nhập tiền mặt thực tế trong két!");
    return;
  }

  if (chenhLech.value !== 0 && !ghiChuInput.value.trim()) {
    alert("Vui lòng nhập ghi chú lý do chênh lệch tiền!");
    return;
  }

  isSubmitting.value = true;

  try {
    await ketThucCa(caHienTai.value.id, {
      tienMatThucTe: tienThucTeInput.value,
      ghiChu: ghiChuInput.value.trim(),
    });

    sessionStorage.removeItem("ss_has_active_shift");
    triggerToast("Kết thúc ca làm việc thành công!");

    await new Promise((resolve) => setTimeout(resolve, 3000));
    handleLogout();
  } catch (error) {
    alert("Lỗi: " + (error?.response?.data?.message || error?.message || "Không thể kết thúc ca."));
    isSubmitting.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("ss_has_active_shift");
  router.push("/login");
};

onMounted(() => {
  loadData();
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (toastTimeout) clearTimeout(toastTimeout);
});
</script>

<style scoped>
.giao-ca-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #374151;
}

.d-flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.mt-4 {
  margin-top: 24px;
}

.font-bold {
  font-weight: 700;
}

.text-danger {
  color: #ef4444;
}

.text-success {
  color: #10b981;
}

.text-primary {
  color: #3b82f6;
}

.text-gray {
  color: #6b7280;
}

.ho-wrapper {
  width: 900px;
  max-width: 95%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ho-header {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ho-header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.ho-icon-box {
  background-color: #f7e7e6;
  color: #ff4d4f;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
}

.ho-header-text h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #111827;
}

.ho-sub-text {
  font-size: 0.85rem;
  color: #9ca3af;
}

.ho-header-right {
  display: flex;
  align-items: center;
}

.ho-badge {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  border: 1px solid #f3f4f6;
}

.ho-role {
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.5px;
}

.ho-name {
  font-size: 0.95rem;
  color: #111827;
}

.ho-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.ho-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ho-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-success-icon {
  color: #ff4d4f;
  font-size: 1.2rem;
}

.ho-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
}

.ho-label-text {
  color: #6b7280;
  font-size: 0.95rem;
}

.ho-val-text {
  font-size: 1rem;
}

.ho-divider {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  padding: 16px 0;
  border-top: 1px dashed #e5e7eb;
  border-bottom: 1px dashed #e5e7eb;
  margin: 10px 0 20px 0;
}

.ho-divider i {
  color: #9ca3af;
  margin-right: 5px;
}

.ho-summary-box {
  background: #fef0f0;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ho-summary-title {
  color: #ff4d4f;
  font-weight: 500;
}

.ho-summary-value {
  color: #ff4d4f;
  font-weight: 500;
}

.ho-summary-note {
  color: #ff4d4f;
}

.ho-input-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #9ca3af;
  margin-bottom: 8px;
  display: block;
}

.ho-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  color: #9ca3af;
}

.ho-currency-right {
  position: absolute;
  right: 15px;
  color: #9ca3af;
  font-weight: 700;
  font-size: 1.2rem;
}

.ho-input-money {
  width: 100%;
  padding: 14px 40px 14px 40px;
  font-size: 1.2rem;
  font-weight: 700;
  border: 1px solid #e8ebf1;
  background: white;
  border-radius: 8px;
  text-align: right;
  color: #9ca3af;
}

.ho-input-money:focus {
  outline: none;
  border: 1px solid #ff4d4f;
}

.ho-diff-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 15px;
  font-weight: 700;
}

.diff-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.diff-val {
  font-size: 1.05rem;
}

.bg-danger-light {
  background-color: #fef2f2;
}

.bg-success-light {
  background-color: #f0fdf4;
}

.bg-gray {
  background-color: #f3f4f6;
}

.ho-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  color: #9ca3af;
}

.ho-textarea:focus {
  outline: none;
  border-color: #ff4d4f;
}

.btn-submit-end {
  width: 100%;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  margin-top: 25px;
  transition: 0.2s;
}

.btn-submit-end:hover {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 80, 0.541);
}

.btn-submit-end:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.ho-footer-note {
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.start-shift-modal {
  background: white;
  width: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.ss-header {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  padding: 20px 25px;
  text-align: left;
  position: relative;
}

.ss-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.ss-header-sub {
  font-size: 0.8rem;
  color: #a7f3d0;
  margin-top: 5px;
  margin-left: 30px;
}

.ss-body {
  padding: 25px;
}

.ss-schedule-box {
  background-color: #fdf0f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 15px;
}

.ss-schedule-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ff4d4f;
  margin-bottom: 6px;
}

.ss-schedule-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ss-shift-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #111827;
}

.ss-shift-time {
  background-color: #fadbd1;
  color: #ff4d4f;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.ss-user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 20px;
  border-bottom: 1px dashed #e5e7eb;
  margin-bottom: 20px;
}

.ss-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
}

.ss-current-time {
  color: #6b7280;
  font-size: 0.9rem;
}

.text-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #9ca3af;
}

.new-input-style {
  position: relative;
}

.currency-prefix {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-weight: 600;
}

.money-input-new {
  width: 100%;
  padding: 12px 15px 12px 35px;
  font-size: 1.25rem;
  font-weight: 400;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #111827;
}

.money-input-new:focus,
.note-textarea:focus {
  outline: none;
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  resize: none;
}

.ss-footer {
  display: flex;
  padding: 20px 25px;
  gap: 15px;
  background: #fff;
  border-top: 1px solid #f3f4f6;
}

.btn-logout {
  flex: 1;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-logout:hover {
  background-color: #fca5a5;
}

.btn-confirm {
  flex: 2;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-confirm:hover {
  background-color: #047857;
}

.btn-confirm:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error-box {
  margin-top: 15px;
  padding: 10px;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.toast-notification {
  position: fixed;
  top: 90px;
  right: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 15px;
  border-left: 5px solid #10b981;
  z-index: 9999;
  animation: slideInLeft 0.5s ease forwards;
  min-width: 300px;
  overflow: hidden;
}

.toast-icon {
  font-size: 24px;
  color: #10b981;
  display: flex;
  align-items: center;
  height: 100%;
  margin-top: 2px;
}

.toast-body {
  flex: 1;
}

.toast-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.toast-msg {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.toast-close {
  cursor: pointer;
  font-size: 18px;
  color: #999;
  transition: 0.3s;
}

.toast-close:hover {
  color: #333;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: #10b981;
  animation: progress 3s linear forwards;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes progress {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>