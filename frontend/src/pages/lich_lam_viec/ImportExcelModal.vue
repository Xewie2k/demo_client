<template>
  <div class="import-excel-modal" v-if="hienThiModal">
    <div class="modal-overlay">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>
            <i class="fa-solid fa-file-excel"></i>
            {{ buoc === 1 ? 'Chọn File Excel' : buoc === 2 ? 'Kiểm Tra Dữ Liệu' : 'Kết Quả Import' }}
          </h3>
          <button @click="closeModal" class="btn-close"></button>
        </div>

        <div class="modal-body">
          <div v-if="buoc === 1">
            <div class="step-container">
              <div class="instruction-box">
                <h4><i class="fa-solid fa-circle-info"></i> Hướng Dẫn</h4>
                <ul>
                  <li>File phải có các cột: <strong>Ca Làm</strong>, <strong>Ngày Làm</strong>, <strong>Nhân
                      Viên</strong></li>
                  <li>Ngày Làm: Định dạng YYYY-MM-DD hoặc DD/MM/YYYY</li>
                  <li>Nhân Viên: Có thể nhập nhiều người, cách nhau bằng dấu phẩy (,) hoặc dấu chấm phẩy (;)</li>
                </ul>
              </div>

              <div class="file-input-section">
                <div class="file-input-wrapper">
                  <label class="file-label">Chọn File Excel:</label>
                  <div class="input-group">
                    <input type="file" id="fileExcel" @change="xuLyKhiChonFile" accept=".xlsx, .xls"
                      class="file-input" />
                    <span class="file-name">{{ fileDaChon?.name || 'Chưa chọn file' }}</span>
                  </div>
                </div>

                <div v-if="loiDocFile" class="error-box">
                  <i class="fa-solid fa-exclamation-circle"></i> {{ loiDocFile }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="buoc === 2">
            <div class="step-container">
              <div v-if="danhSachLoi.length > 0" class="error-box large">
                <h4><i class="fa-solid fa-circle-exclamation"></i> Lỗi Dữ Liệu:</h4>
                <ul>
                  <li v-for="(err, idx) in danhSachLoi" :key="idx">{{ err }}</li>
                </ul>
              </div>

              <div v-if="danhSachCanhBao.length > 0" class="warning-box large">
                <h4><i class="fa-solid fa-triangle-exclamation"></i> Cảnh Báo:</h4>
                <ul>
                  <li v-for="(warn, idx) in danhSachCanhBao" :key="idx">{{ warn }}</li>
                </ul>
              </div>

              <div v-if="duLieuTuExcel.length > 0" class="preview-table">
                <h4>Xem Trước Dữ Liệu ({{ duLieuTuExcel.length }} dòng):</h4>
                <table>
                  <thead>
                    <tr>
                      <th v-for="(key, idx) in cacCotXemTruoc" :key="idx">{{ key }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIdx) in duLieuTuExcel.slice(0, 10)" :key="rowIdx">
                      <td v-for="(col, colIdx) in cacCotXemTruoc" :key="colIdx">
                        <template v-if="col === 'Ngày Làm'">
                          {{ dinhDangNgay(row[col]) }}
                        </template>
                        <template v-else>
                          {{ row[col] || '-' }}
                        </template>
                      </td>
                    </tr>
                    <tr v-if="duLieuTuExcel.length > 10">
                      <td colspan="100" class="text-center">... và {{ duLieuTuExcel.length - 10 }} dòng nữa</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-else-if="buoc === 3">
            <div class="step-container">
              <div v-if="loiImport" class="error-box large">
                <h4><i class="fa-solid fa-circle-exclamation"></i> Lỗi Import:</h4>
                <p>{{ loiImport }}</p>
              </div>

              <div v-else class="success-box large">
                <h4><i class="fa-solid fa-circle-check"></i> Import Thành Công!</h4>
                <p>Đã import {{ ketQuaImport?.length || 0 }} lịch làm việc</p>

                <div v-if="ketQuaImport && ketQuaImport.length > 0" class="result-list">
                  <h5>Chi Tiết Lịch Được Tạo:</h5>
                  <ul>
                    <li v-for="(item, idx) in ketQuaImport.slice(0, 5)" :key="idx">
                      {{ item.tenCa }} - {{ dinhDangNgay(item.ngayLam) }}
                    </li>
                    <li v-if="ketQuaImport.length > 5">... và {{ ketQuaImport.length - 5 }} lịch nữa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="buoc > 1" class="btn-secondary" @click="buoc--">
            <i class="fa-solid fa-arrow-left"></i> Quay Lại
          </button>

          <button v-if="buoc === 1" class="btn-primary" @click="xemTruocDuLieu" :disabled="!fileDaChon || dangXuLy">
            <i class="fa-solid fa-arrow-right"></i> Tiếp Tục
          </button>

          <button v-if="buoc === 2" class="btn-primary" @click="thucHienImport"
            :disabled="danhSachLoi.length > 0 || dangXuLy">
            <i class="fa-solid fa-upload"></i> {{ dangXuLy ? 'Đang Import...' : 'Import Ngay' }}
          </button>

          <button v-if="buoc === 3" class="btn-primary" @click="hoanTat">
            <i class="fa-solid fa-check"></i> Xong
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { parseExcelFile, validateScheduleData} from '@/services/lich_lam_viec/xuLyExcel';
import { importLichExcel } from '@/services/lich_lam_viec/lich_lam_viecService';

const props = defineProps({
  listNhanVien: Array,
  listCa: Array,
  onImportSuccess: Function
});

const emit = defineEmits(['close']);

// Trạng thái modal và tiến trình
const hienThiModal = ref(false);
const buoc = ref(1);
const dangXuLy = ref(false);

// Dữ liệu file
const fileDaChon = ref(null);
const duLieuTuExcel = ref([]);

// Trạng thái kiểm tra (Validation)
const danhSachLoi = ref([]);
const danhSachCanhBao = ref([]);
const loiDocFile = ref('');

// Kết quả sau cùng
const loiImport = ref('');
const ketQuaImport = ref(null);

// Tính toán các cột hiển thị dựa trên dữ liệu excel
const cacCotXemTruoc = computed(() => {
  if (duLieuTuExcel.value.length === 0) return [];
  
  return Object.keys(duLieuTuExcel.value[0]).filter(key => key !== 'rowNum');
});

const openModal = () => {
  hienThiModal.value = true;
  buoc.value = 1;
  datLaiTrangThai();
};

const closeModal = () => {
  hienThiModal.value = false;
  datLaiTrangThai();
  emit('close');
};

const datLaiTrangThai = () => {
  fileDaChon.value = null;
  duLieuTuExcel.value = [];
  danhSachLoi.value = [];
  danhSachCanhBao.value = [];
  loiDocFile.value = '';
  loiImport.value = '';
  ketQuaImport.value = null;
  buoc.value = 1;
};

const xuLyKhiChonFile = (event) => {
  fileDaChon.value = event.target.files[0];
  loiDocFile.value = '';
};

const xemTruocDuLieu = async () => {
  if (!fileDaChon.value) {
    loiDocFile.value = 'Vui lòng chọn file Excel';
    return;
  }

  dangXuLy.value = true;
  try {
    // Đọc file Excel
    const duLieu = await parseExcelFile(fileDaChon.value);
    duLieuTuExcel.value = duLieu;

    // Kiểm tra tính hợp lệ
    const ketQuaKiemTra = validateScheduleData(duLieu, props.listCa, props.listNhanVien);
    danhSachLoi.value = ketQuaKiemTra.errors;
    danhSachCanhBao.value = ketQuaKiemTra.warnings;

    // Chuyển sang bước 2
    buoc.value = 2;
  } catch (error) {
    loiDocFile.value = error.message || 'Lỗi khi đọc file Excel';
  } finally {
    dangXuLy.value = false;
  }
};

const thucHienImport = async () => {
  if (!fileDaChon.value) return;

  dangXuLy.value = true;
  loiImport.value = '';

  try {
    const duLieuForm = new FormData();
    duLieuForm.append('file', fileDaChon.value);

    const ketQua = await importLichExcel(duLieuForm);
    ketQuaImport.value = Array.isArray(ketQua) ? ketQua : ketQua.content || [ketQua];

    buoc.value = 3;

    // Thông báo cho component cha cập nhật lại danh sách
    if (props.onImportSuccess) {
      props.onImportSuccess();
    }
  } catch (error) {
    loiImport.value = error.message || 'Có lỗi xảy ra khi import';
    console.error('Import error:', error);
  } finally {
    dangXuLy.value = false;
  }
};

const hoanTat = () => {
  closeModal();
};

const dinhDangNgay = (giaTriNgay) => {
  if (giaTriNgay === null || giaTriNgay === undefined || giaTriNgay === '') return "-";

  let date;

  if (Array.isArray(giaTriNgay)) {
    const [year, month, day] = giaTriNgay;
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  if (typeof giaTriNgay === 'number') {
    date = new Date(Math.round((giaTriNgay - 25569) * 864e5));
  }
  else {
    const stringDate = String(giaTriNgay).trim();

    if (stringDate.includes('-') && stringDate.split('-')[0].length === 4) {
      const [y, m, d] = stringDate.split('-');
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    date = new Date(stringDate);
  }

  // Trả về định dạng DD/MM/YYYY
  if (date instanceof Date && !isNaN(date.getTime())) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return String(giaTriNgay);
};

defineExpose({
  openModal,
  closeModal
});
</script>

<style scoped>
.import-excel-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow: auto;
  max-width: 800px;
  width: 90%;
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close {
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
  max-height: calc(90vh - 160px);
  overflow-y: auto;
}

.step-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.instruction-box {
  background: #f0f4f8;
  border-left: 4px solid #3b82f6;
  padding: 15px;
  border-radius: 6px;
}

.instruction-box h4 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.instruction-box ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}

.instruction-box li {
  margin-bottom: 8px;
}

.file-input-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.file-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.file-name {
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
}

.error-box {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 15px;
  border-radius: 6px;
  color: #7f1d1d;
}

.error-box h4,
.error-box.large h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-box ul,
.error-box.large ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.5;
}

.error-box li,
.error-box.large li {
  margin-bottom: 6px;
}

.warning-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 15px;
  border-radius: 6px;
  color: #78350f;
}

.warning-box h4,
.warning-box.large h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-box ul,
.warning-box.large ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.5;
}

.warning-box li,
.warning-box.large li {
  margin-bottom: 6px;
}

.success-box {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  padding: 15px;
  border-radius: 6px;
  color: #166534;
}

.success-box h4,
.success-box.large h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-box p {
  margin: 0 0 15px 0;
  font-size: 13px;
}

.result-list {
  margin-top: 15px;
}

.result-list h5 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #166534;
}

.result-list ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.5;
}

.result-list li {
  margin-bottom: 6px;
}

.preview-table {
  margin-top: 20px;
}

.preview-table h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #374151;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: white;
}

.preview-table th {
  background: #f3f4f6;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.preview-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-table tr:hover {
  background: #f9fafb;
}

.text-center {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(255, 77, 79, 0.2);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}
</style>