<!-- File: src/pages/lich_lam_viec/GiaoCa.vue -->
<template>
    <div class="giao-ca-container">

        <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
            <span>Đang tải dữ liệu ...</span>
        </div>

        <div v-if="!loading && !caHienTai" class="shift-card">
            <div class="card-header-simple">
                <i class="fa-solid fa-circle-play text-green"></i>
                <span>Bắt Đầu Ca Làm Việc</span>
            </div>

            <div class="card-body">
                <p class="desc-text">
                    Xin chào! Vui lòng nhập số tiền mặt đang có tại quầy để mở ca mới.
                    <br>
                    <small class="text-danger">* Lưu ý: Bạn chỉ có thể bắt đầu ca trong khung giờ được phân
                        công.</small>
                </p>

                <div class="form-group">
                    <label>Tiền mặt ban đầu (VNĐ)</label>
                    <div class="input-money-wrapper">
                        <input type="text" class="form-control money-input" :value="formatNumber(tienBanDauInput)"
                            @input="onInputMoney($event, 'start')" placeholder="0" />
                        <span class="currency-unit">₫</span>
                    </div>
                </div>

                <button class="btn-action btn-primary" @click="handleBatDauCa" :disabled="isSubmitting">
                    <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
                    {{ isSubmitting ? 'Đang kiểm tra lịch...' : 'Bắt Đầu Ca' }}
                </button>

                <div v-if="errorMessage" class="error-box">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
                </div>
            </div>
        </div>

        <div v-if="!loading && caHienTai" class="shift-card">
            <div class="card-header-simple">
                <i class="fa-solid fa-briefcase"></i>
                <span>Ca Làm Việc Hiện Tại</span>
            </div>

            <div class="card-body pt-0">
                <div class="general-info">
                    <p>
                        <span class="label-text">Ca làm việc của bạn đã bắt đầu lúc: </span>
                        <span class="val-text">{{ formatDateTime(caHienTai.thoiGianNhanCa) }}</span>
                    </p>
                    <p>
                        <span class="label-text">Số tiền mặt ban đầu: </span>
                        <span class="val-text">{{ formatNumber(caHienTai.tienDauCaNhap) }} ₫</span>
                    </p>
                </div>

                <div class="handover-section">
                    <h4 class="section-title">Thông tin ca trước (Bàn giao)</h4>
                    <div class="handover-box">
                        <div class="info-row">
                            <span class="label-text">Tiền mặt cuối ca trước:</span>
                            <span class="val-text bold">{{ formatNumber(caHienTai.tienBanGiaoDuKien) }} ₫</span>
                        </div>
                        <div class="info-row mt-2">
                            <span class="label-text">Số đơn hàng chờ xử lý:</span>
                            <span class="val-text">{{ caHienTai.soDonHangChoXuLyCaTruoc }}</span>
                        </div>
                    </div>
                </div>

                <div class="current-pending">
                    <span class="label-text">Số hóa đơn chờ xử lý hiện tại: </span>
                    <span class="val-text">{{ caHienTai.soDonHangChoXuLy }}</span>
                </div>

                <button class="btn-action btn-danger mt-4" @click="openEndModal">
                    Kết Thúc Ca
                </button>
            </div>
        </div>

        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <h3>Tổng kết ca làm việc</h3>

                <div class="summary-box">
                    <div class="row">
                        <span>Lý thuyết (Đầu ca + Doanh thu):</span>
                        <strong>{{ formatCurrency(tinhTongLyThuyet) }}</strong>
                    </div>
                </div>

                <div class="form-group">
                    <label>Tiền mặt thực tế tại quầy (Đếm được):</label>
                    <div class="input-money-wrapper">
                        <input type="text" class="form-control money-input" :value="formatNumber(tienThucTeInput)"
                            @input="onInputMoney($event, 'end')" />
                        <span class="currency-unit">₫</span>
                    </div>
                </div>

                <div class="diff-box" :class="chenhLech >= 0 ? 'text-success' : 'text-danger'">
                    <span>Chênh lệch:</span>
                    <strong>{{ formatCurrency(chenhLech) }}</strong>
                    <small v-if="chenhLech < 0">(Thiếu tiền)</small>
                    <small v-if="chenhLech > 0">(Thừa tiền)</small>
                </div>

                <div class="form-group">
                    <label>Ghi chú:</label>
                    <textarea v-model="ghiChuInput" class="form-control" rows="3"></textarea>
                </div>

                <div class="modal-actions">
                    <button class="btn-secondary" @click="showModal = false">Hủy</button>
                    <button class="btn-primary" @click="submitKetThucCa" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Đang xử lý...' : 'Xác nhận Kết Ca' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Ham thong bao -->
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { batDauCa, checkActiveCa, ketThucCa } from '@/services/lich_lam_viec/giao_caService';
import { getLichLamViecNhanVien } from '@/services/lich_lam_viec/lich_lam_viec_nhan_vienService';

const router = useRouter();

const layThongTinUser = () => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
        return JSON.parse(storedUser);
    }
    return null;
};

const currentUser = layThongTinUser();

const ID_NHAN_VIEN = currentUser ? (currentUser.id || currentUser.idNhanVien) : null;

if (!ID_NHAN_VIEN) {
    router.push('/login');
}

const loading = ref(true);
const isSubmitting = ref(false);
const caHienTai = ref(null);
const errorMessage = ref('');
const showModal = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
let toastTimeout = null;

const tienBanDauInput = ref(0);
const tienThucTeInput = ref(0);
const ghiChuInput = ref('');

const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

const tinhTongLyThuyet = computed(() => {
    if (!caHienTai.value) return 0;
    const banDau = caHienTai.value.tienDauCaNhap || 0; 
    const doanhThu = caHienTai.value.tongTienTrongCa || 0; 
    return banDau + doanhThu;
});

const chenhLech = computed(() => {
    return tienThucTeInput.value - tinhTongLyThuyet.value;
});

// --- METHODS ---

const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
};

const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
};

const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = ` ${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
    return `${time} ${date}`;
};

const onInputMoney = (event, type) => {
    const raw = event.target.value.replace(/\D/g, '');
    const val = Number(raw);
    if (type === 'start') tienBanDauInput.value = val;
    if (type === 'end') tienThucTeInput.value = val;
};

const loadData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const res = await checkActiveCa(ID_NHAN_VIEN);
        if (res && res.id) {
            caHienTai.value = res;
        } else {
            caHienTai.value = null;
        }
    } catch (error) {
        console.error("Lỗi load data:", error);
        caHienTai.value = null;
    } finally {
        loading.value = false;
    }
};

const handleBatDauCa = async () => {
    errorMessage.value = '';
    if (tienBanDauInput.value < 0) return alert("Tiền không hợp lệ");

    isSubmitting.value = true;
    try {
        const today = new Date().toLocaleDateString('en-CA');

        const lichList = await getLichLamViecNhanVien(ID_NHAN_VIEN, today);

        if (!lichList || lichList.length === 0) {
            throw new Error("Không có ca làm việc được phân công hôm nay.");
        }


        console.log("Lịch làm việc nhận được:", lichList);
        const idllv = lichList[0].lichLamViec.id;

        await batDauCa({
            idNhanVien: ID_NHAN_VIEN,
            idLichLamViec: idllv,
            tienDauCaNhap: tienBanDauInput.value,
        });
        await loadData();

        triggerToast("Bắt đầu ca làm việc thành công!");

    } catch (error) {
        if (error.response && error.response.data) {
            errorMessage.value = error.response.data.message || "Có lỗi xảy ra";
        } else {
            errorMessage.value = "Không có ca làm việc được phân công trong khung giờ hiện tại.";
        }
    } finally {
        isSubmitting.value = false;
    }
};

const openEndModal = () => {
    tienThucTeInput.value = tinhTongLyThuyet.value;
    ghiChuInput.value = '';
    showModal.value = true;
};

const submitKetThucCa = async () => {
    if (!caHienTai.value) return;

    isSubmitting.value = true;
    try {
        await ketThucCa(caHienTai.value.id, {
            tienMatThucTe: tienThucTeInput.value,
            ghiChu: ghiChuInput.value
        });

        triggerToast("Kết thúc ca làm việc thành công!");

        showModal.value = false;
        caHienTai.value = null;
        tienBanDauInput.value = 0;
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<style scoped>
/* Container chính */
.giao-ca-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 80px;
    background-color: #f3f4f6;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #374151;
}

/* Card Style chung */
.shift-card {
    background: white;
    width: 480px;
    /* Độ rộng giống ảnh */
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding-bottom: 20px;
}

/* Header đơn giản (Trắng + Icon + Text đậm) */
.card-header-simple {
    padding: 20px 25px 10px 25px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 10px;
}

.card-header-simple i {
    font-size: 1.2rem;
    color: #4b5563;
    /* Icon màu xám đậm */
}

.card-header-simple i.text-green {
    color: #10b981;
}

.card-body {
    padding: 20px 25px;
}

.pt-0 {
    padding-top: 0;
}

/* Typography trong Card */
.label-text {
    color: #6b7280;
    /* Màu chữ nhãn xám nhạt */
    font-size: 0.95rem;
}

.val-text {
    color: #111827;
    font-weight: 600;
    font-size: 0.95rem;
}

.val-text.bold {
    font-weight: 800;
}

.general-info p {
    margin-bottom: 8px;
    line-height: 1.5;
}

/* Section "Thông tin ca trước" */
.handover-section {
    margin-top: 20px;
}

.section-title {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: #1f2937;
}

.handover-box {
    background-color: #f9fafb;
    /* Màu nền xám rất nhạt */
    border: 1px solid #f3f4f6;
    border-radius: 8px;
    padding: 16px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    /* Đẩy giá trị sang 2 bên nếu muốn, nhưng ảnh trông như inline block */
    align-items: center;
}

/* Theo ảnh thì label và value nằm cùng dòng nhưng value đậm hơn */
.info-row {
    display: block;
}

.info-row .val-text {
    margin-left: 5px;
}

.mt-2 {
    margin-top: 8px;
}

.mt-4 {
    margin-top: 24px;
}

/* Dòng "Số hóa đơn chờ..." bên dưới box */
.current-pending {
    margin-top: 20px;
    font-size: 0.95rem;
}

/* Button Styles */
.btn-action {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.2s;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    border-radius: 8px;
    background-color: #10b981;
}

.btn-primary:hover {
    background-color: #059669;
}

.btn-danger {
    background-color: #ef4444;
    /* Màu đỏ giống ảnh */
}

.btn-danger:hover {
    background-color: #dc2626;
}

.btn-action:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
}

/* --- Các style cũ giữ lại cho Modal và Input --- */
.desc-text {
    color: #4b5563;
    font-size: 0.95rem;
    margin-bottom: 20px;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
}

.input-money-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.money-input {
    width: 100%;
    padding: 12px 30px 12px 15px;
    font-size: 1.1rem;
    font-weight: bold;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    color: #111827;
}

.money-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.currency-unit {
    position: absolute;
    right: 15px;
    font-weight: bold;
    color: #6b7280;
}

.quick-add {
    margin-top: 8px;
    display: flex;
    gap: 10px;
}

.quick-add span {
    background: #f3f4f6;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    color: #4b5563;
}

.quick-add span:hover {
    background: #e5e7eb;
    color: #111827;
}

/* Error Box */
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    width: 450px;
    padding: 25px;
    border-radius: 12px;
}

.modal-content h3 {
    margin-top: 0;
    text-align: center;
    margin-bottom: 20px;
}

.summary-box {
    background: #f9fafb;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
}

.summary-box .row {
    display: flex;
    justify-content: space-between;
}

.modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.btn-secondary {
    bottom: 10px;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    margin-left: auto;
}

.btn-secondary:hover {
    background-color: #d1d5db;
}

.diff-box {
    margin-top: 10px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.text-success {
    color: #10b981;
}

.text-danger {
    color: #ef4444;
}

/* Loading */
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
    /* Cách top một chút để không che header nếu có */
    right: 20px;
    background: #fff;
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: flex-start;
    gap: 15px;
    border-left: 5px solid #10b981;
    /* Viền xanh lá bên trái */
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