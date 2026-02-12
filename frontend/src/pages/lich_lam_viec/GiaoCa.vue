<template>
  <div class="giao-ca-page">
    <div class="header-section">
      <h2 class="page-title">Giao Ca</h2>
      <span class="breadcrumb">Trang chủ / Giao ca</span>
    </div>

    <div class="center-container" v-if="!currentCa && !loading">
      <div class="start-shift-card">
        <div class="card-header">
          <i class="fa-solid fa-circle-play"></i> Bắt Đầu Ca Làm Việc
        </div>
        <div class="card-body">
          <p class="description">
            Chào mừng bạn đến với ca làm việc mới. Vui lòng nhập số tiền mặt ban đầu tại quầy để bắt đầu ca.
          </p>
          
          <div class="form-group">
            <label>Số tiền mặt ban đầu (VND)</label>
            <input 
              type="number" 
              v-model="tienBanDau" 
              class="form-control" 
              placeholder="Nhập số tiền mặt..."
            />
          </div>

          <button class="btn-start" @click="handleBatDauCa" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang xử lý...' : 'Bắt Đầu Ca' }}
          </button>
        </div>
      </div>
    </div>

    <div class="active-shift-container" v-if="currentCa && !loading">
      <div class="info-card">
        <h3><i class="fa-solid fa-clock"></i> Ca làm việc đang hoạt động</h3>
        <div class="info-row">
          <span>Thời gian bắt đầu:</span>
          <strong>{{ formatTime(currentCa.thoiGianNhanCa) }}</strong>
        </div>
        <div class="info-row">
          <span>Tiền ban đầu:</span>
          <strong>{{ formatCurrency(currentCa.tienBanDau) }}</strong>
        </div>
        <button class="btn-end" @click="showEndModal = true">Kết Thúc Ca</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">Đang tải dữ liệu...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { checkActiveCa, batDauCa } from '@/services/lich_lam_viec/giao_caService';
// Giả lập ID nhân viên đang đăng nhập (Thực tế lấy từ LocalStorage/Vuex)
const currentUserId = 1; 

const loading = ref(true);
const currentCa = ref(null);
const tienBanDau = ref("");
const isSubmitting = ref(false);
const showEndModal = ref(false);

const loadStatus = async () => {
  loading.value = true;
  try {
    const res = await checkActiveCa(currentUserId);
    currentCa.value = res; // Nếu null => chưa vào ca
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleBatDauCa = async () => {
  if (!tienBanDau.value && tienBanDau.value !== 0) {
    alert("Vui lòng nhập tiền ban đầu");
    return;
  }
  
  isSubmitting.value = true;
  try {
    const data = {
      idNhanVien: currentUserId,
      tienBanDau: Number(tienBanDau.value)
    };
    const res = await batDauCa(data);
    alert("Bắt đầu ca thành công!");
    currentCa.value = res; // Chuyển sang View active
  } catch (e) {
    alert("Lỗi: " + e.message);
  } finally {
    isSubmitting.value = false;
  }
};

const formatTime = (t) => t ? new Date(t).toLocaleString('vi-VN') : '';
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

onMounted(() => {
  loadStatus();
});
</script>

<style scoped>
.giao-ca-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f3f4f6;
  min-height: 85vh;
}

.header-section { margin-bottom: 30px; }
.page-title { color: #107c41; margin-bottom: 5px; font-weight: 700; }
.breadcrumb { color: #6b7280; font-size: 14px; }

.center-container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.start-shift-card {
  background: #fff;
  width: 600px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: #f3f4f6;
  padding: 16px 24px;
  font-weight: 700;
  font-size: 18px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-body { padding: 30px; }
.description { color: #6b7280; margin-bottom: 24px; font-size: 14px; }

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #111827;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  margin-bottom: 24px;
  box-sizing: border-box; /* Quan trọng để không vỡ layout */
}
.form-control:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.btn-start {
  width: 100%;
  padding: 12px;
  background: #10b981; /* Màu xanh lá như ảnh */
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  transition: 0.2s;
}
.btn-start:hover { background: #059669; }
.btn-start:disabled { background: #9ca3af; cursor: not-allowed; }

/* Active Shift Styles */
.active-shift-container { display: flex; justify-content: center; margin-top: 50px; }
.info-card { background: white; padding: 30px; border-radius: 12px; width: 500px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
.btn-end { background: #ef4444; color: white; width: 100%; padding: 10px; border: none; border-radius: 8px; margin-top: 20px; font-weight: 600; cursor: pointer;}

.loading-state { text-align: center; color: #6b7280; margin-top: 50px; }
</style>