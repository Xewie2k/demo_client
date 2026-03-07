<template>
  <div class="ss-page ss-font">
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">LỊCH SỬ GIAO CA & KẾT TOÁN</div>
        <div class="ss-subtitle">Theo dõi lịch sử đóng/mở ca và dòng tiền của nhân viên</div>
      </div>
    </div>

    <div class="ss-card ss-border ss-mb-16">
      <div class="ss-card-body ss-filter-grid">
        <div class="ss-field">
          <label class="ss-label">Tìm kiếm</label>
          <div class="ss-input-group">
            <span class="material-icons-outlined ss-input-icon">search</span>
            <input
              type="text"
              class="form-control ss-input ss-input-with-icon"
              placeholder="Tìm theo nhân viên / mã ca..."
            />
          </div>
        </div>

        <div class="ss-field">
          <label class="ss-label">Từ ngày:</label>
          <input type="date" v-model="tuNgay" class="form-control ss-input" />
        </div>

        <div class="ss-field">
          <label class="ss-label">Đến ngày:</label>
          <input type="date" v-model="denNgay" class="form-control ss-input" />
        </div>

        <div class="ss-field ss-filter-actions">
          <button class="btn ss-btn-outline" type="button" @click="loadData">
            <i class="fa-solid fa-rotate-right me-2"></i> Tải lại
          </button>
        </div>
      </div>
    </div>

    <div class="ss-card ss-border">
      <div class="table-responsive">
        <table class="table ss-table mb-0">
          <thead>
            <tr>
              <th class="text-center" style="width: 50px">#</th>
              <th>NHÂN VIÊN</th>
              <th>CA</th>
              <th>MỞ</th>
              <th>ĐÓNG</th>
              <th class="text-end">TIỀN MẶT</th>
              <th class="text-end">TIỀN CK</th>
              <th class="text-end">DOANH THU</th>
              <th class="text-end">CHÊNH LỆCH</th>
              <th class="text-center" style="width: 120px">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="10" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="rawData.length === 0">
              <td colspan="10" class="text-center py-4">Không có dữ liệu giao ca.</td>
            </tr>
            <tr v-else v-for="(item, index) in rawData" :key="item.id">
              <td class="text-center">{{ index + 1 }}</td>

              <td>{{ item.tenNhanVien || '—' }}</td>

              <td>
                <span :class="getMauCaLam(item.tenCaLam || item.maGiaoCa)">
                  {{ item.tenCaLam || item.maGiaoCa || '—' }}
                </span>
              </td>

              <td>
                <div class="ss-time">{{ formatTime(item.thoiGianNhanCa) }}</div>
                <div class="ss-date">{{ formatDate(item.thoiGianNhanCa) }}</div>
              </td>

              <td>
                <div v-if="item.thoiGianKetCa">
                  <div class="ss-time">{{ formatTime(item.thoiGianKetCa) }}</div>
                  <div class="ss-date">{{ formatDate(item.thoiGianKetCa) }}</div>
                </div>
                <div v-else>—</div>
              </td>

              <td class="text-end">{{ formatMoney(item.tienMatTrongCa) }} đ</td>
              <td class="text-end">{{ formatMoney(item.tienChuyenKhoanTrongCa) }} đ</td>
              <td class="text-end fw-bold">{{ formatMoney(item.tongTienTrongCa) }} đ</td>

              <td class="text-end fw-bold"
                  :class="{'text-success': calcChenhLech(item) >= 0, 'text-danger': calcChenhLech(item) < 0}">
                {{ formatMoney(calcChenhLech(item)) }} đ
              </td>

              <td class="text-center">
                <span class="ss-badge" :class="item.trangThai === 1 ? 'badge-closed' : 'badge-active'">
                  {{ item.trangThai === 1 ? 'Đã đóng' : 'Đang làm' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getLichSuGiaoCa } from '@/services/lich_lam_viec/giao_caService.js';

const rawData = ref([]);
const isLoading = ref(false);

// ========================
// ✅ LOGIC LẤY NGÀY HÔM NAY
// ========================
const getTodayYMD = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Định dạng chuẩn YYYY-MM-DD cho thẻ input date
};

// Khai báo biến và gán mặc định là hôm nay
const tuNgay = ref(getTodayYMD());
const denNgay = ref(getTodayYMD());


const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await getLichSuGiaoCa(0, 100);

    if (res && res.content) {
      rawData.value = res.content;
    } else if (res && res.data && res.data.content) {
      rawData.value = res.data.content;
    } else if (res && res.data && Array.isArray(res.data)) {
      rawData.value = res.data;
    } else if (Array.isArray(res)) {
      rawData.value = res;
    } else {
      rawData.value = [];
    }
  } catch (error) {
    console.error("❌ Lỗi lấy danh sách lịch sử giao ca:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// ========================
// CÁC HÀM FORMAT HIỂN THỊ
// ========================
const getMauCaLam = (tenCa) => {
  if (!tenCa) return 'badge-xam';
  const name = String(tenCa).toLowerCase();
  if (name.includes('chiều')) return 'badge-hong';
  return 'badge-xam';
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('vi-VN');
};

const formatMoney = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString('vi-VN');
};

const calcChenhLech = (item) => {
  const tienMat = item.tienMatTrongCa || 0;
  const tienCk = item.tienChuyenKhoanTrongCa || 0;
  const tongThu = item.tongTienTrongCa || 0;
  return (tienMat + tienCk) - tongThu;
};
</script>

<style scoped>
/* Base page styling theo chuẩn SevenStrike */
.ss-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.ss-mb-16 { margin-bottom: 16px; }

/* Header */
.ss-head {
  margin-bottom: 24px;
}
.ss-title {
  font-size: 20px;
  font-weight: 700;
  color: #212529;
  text-transform: uppercase;
}
.ss-subtitle {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

/* Card */
.ss-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.ss-border {
  border: 1px solid #e9ecef;
}
.ss-card-body {
  padding: 16px;
}

/* Filter Grid */
.ss-filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}
.ss-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
  display: block;
}
.ss-input {
  height: 38px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  font-size: 13px;
}
.ss-input:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 0.2rem rgba(185, 28, 28, 0.1);
}
.ss-input-group {
  position: relative;
}
.ss-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 18px;
}
.ss-input-with-icon {
  padding-left: 36px;
}
.ss-btn-outline {
  height: 38px;
  padding: 0 20px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  background: #fff;
  color: #495057;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}
.ss-btn-outline:hover {
  background: #f8f9fa;
  color: #212529;
}

/* Table */
.ss-table {
  width: 100%;
  font-size: 13px;
  color: #212529;
}
.ss-table thead th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 700;
  border-bottom: 2px solid #e9ecef;
  padding: 12px 16px;
  white-space: nowrap;
}
.ss-table tbody td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f3f5;
}
.ss-table tbody tr:hover {
  background-color: rgba(185, 28, 28, 0.02);
}

/* Typography & Tags */
.ss-time {
  font-weight: 500;
  color: #212529;
}
.ss-date {
  font-size: 11px;
  color: #868e96;
}
.ss-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f1f3f5;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  color: #495057;
}

/* CSS CHO BADGE CA SÁNG / CA CHIỀU */
.badge-xam {
  background-color: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

.badge-hong {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

/* Badges Trạng thái */
.ss-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge-closed {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}
.badge-active {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.text-danger { color: #dc3545 !important; }
.text-success { color: #198754 !important; }

/* Hiển thị rõ icon lịch trong ô chọn ngày */
.ss-input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  /* Ép icon thành màu đen và làm mờ một chút cho thanh lịch */
  filter: brightness(0) opacity(0.6);
  transition: 0.2s;
}

/* Khi di chuột vào icon lịch sẽ đậm lên */
.ss-input[type="date"]::-webkit-calendar-picker-indicator:hover {
  filter: brightness(0) opacity(0.9);
}
</style>
