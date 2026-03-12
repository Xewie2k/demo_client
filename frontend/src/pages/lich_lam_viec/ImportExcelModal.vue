<template>
  <div class="import-excel-modal" v-if="hienThiModal">
    <div class="modal-overlay">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>
            <i class="fa-solid fa-file-excel"></i>
            {{
              buoc === 1
                ? "Chọn File Excel"
                : buoc === 2
                ? "Kiểm Tra Dữ Liệu"
                : "Kết Quả Import"
            }}
          </h3>
          <button @click="closeModal" class="btn-close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="buoc === 1">
            <div class="step-container">
              <div class="instruction-box">
                <h4><i class="fa-solid fa-circle-info"></i> Hướng Dẫn</h4>
                <ul>
                  <li>
                    Template đúng gồm các cột:
                    <strong>STT</strong>,
                    <strong>Mã Nhân Viên</strong>,
                    <strong>Ca Làm</strong>,
                    <strong>Ngày Làm</strong>,
                    <strong>Tên Nhân Viên</strong>,
                    <strong>Ghi Chú</strong>
                  </li>
                  <li>
                    Cột bắt buộc để import là:
                    <strong>Mã Nhân Viên</strong>,
                    <strong>Tên Nhân Viên</strong>,
                    <strong>Ca Làm</strong>,
                    <strong>Ngày Làm</strong>
                  </li>
                  <li>
                    File template tải từ hệ thống đã có sẵn combobox ở cột
                    <strong>Mã Nhân Viên</strong> và <strong>Ca Làm</strong>
                  </li>
                  <li>
                    Cột <strong>Tên Nhân Viên</strong> trong template sẽ tự điền theo mã nhân viên
                  </li>
                  <li>
                    Ngày làm hỗ trợ định dạng <strong>YYYY-MM-DD</strong>,
                    <strong>DD/MM/YYYY</strong> hoặc ngày Excel
                  </li>
                </ul>
              </div>

              <div class="file-input-section">
                <div class="file-input-wrapper">
                  <label class="file-label">Chọn File Excel:</label>
                  <div class="input-group">
                    <input
                      type="file"
                      id="fileExcel"
                      @change="xuLyKhiChonFile"
                      accept=".xlsx,.xls"
                      class="file-input"
                    />
                    <span class="file-name">{{ fileDaChon?.name || "Chưa chọn file" }}</span>
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

              <div v-if="duLieuChuanHoa.length > 0" class="preview-table">
                <h4>Xem Trước Dữ Liệu ({{ duLieuChuanHoa.length }} dòng):</h4>
                <table>
                  <thead>
                    <tr>
                      <th v-for="(col, idx) in cotXemTruoc" :key="idx">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIdx) in duLieuChuanHoa.slice(0, 10)" :key="rowIdx">
                      <td v-for="(col, colIdx) in cotXemTruoc" :key="colIdx">
                        {{ layGiaTriXemTruoc(row, col, rowIdx) }}
                      </td>
                    </tr>
                    <tr v-if="duLieuChuanHoa.length > 10">
                      <td colspan="100" class="text-center">
                        ... và {{ duLieuChuanHoa.length - 10 }} dòng nữa
                      </td>
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
                <p>Đã import {{ ketQuaImport?.length || 0 }} phân công làm việc</p>

                <div v-if="ketQuaImport && ketQuaImport.length > 0" class="result-list">
                  <h5>Chi Tiết Phân Công Được Tạo:</h5>
                  <ul>
                    <li v-for="(item, idx) in ketQuaImport.slice(0, 8)" :key="idx">
                      {{ item.maNhanVien || "-" }} -
                      {{ item.tenNhanVien || "-" }} -
                      {{ item.tenCa || "-" }} -
                      {{ dinhDangNgayPreview(item.ngayLam) }}
                    </li>
                    <li v-if="ketQuaImport.length > 8">
                      ... và {{ ketQuaImport.length - 8 }} phân công nữa
                    </li>
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

          <button
            v-if="buoc === 1"
            class="btn-primary"
            @click="xemTruocDuLieu"
            :disabled="!fileDaChon || dangXuLy"
          >
            <i class="fa-solid fa-arrow-right"></i> Tiếp Tục
          </button>

          <button
            v-if="buoc === 2"
            class="btn-primary"
            @click="thucHienImport"
            :disabled="danhSachLoi.length > 0 || dangXuLy"
          >
            <i class="fa-solid fa-upload"></i>
            {{ dangXuLy ? "Đang Import..." : "Import Ngay" }}
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
import { ref } from "vue";
import {
  parseExcelFile,
  validateScheduleData,
  normalizeExcelRows,
  dinhDangNgayPreview,
} from "@/services/lich_lam_viec/xuLyExcel";
import { importLichExcel } from "@/services/lich_lam_viec/lich_lam_viecService";

const props = defineProps({
  listNhanVien: {
    type: Array,
    default: () => [],
  },
  listCa: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "import-success"]);

const hienThiModal = ref(false);
const buoc = ref(1);
const dangXuLy = ref(false);

const fileDaChon = ref(null);
const duLieuTuExcel = ref([]);
const duLieuChuanHoa = ref([]);

const danhSachLoi = ref([]);
const danhSachCanhBao = ref([]);
const loiDocFile = ref("");

const loiImport = ref("");
const ketQuaImport = ref(null);

const cotXemTruoc = [
  "STT",
  "Mã Nhân Viên",
  "Ca Làm",
  "Ngày Làm",
  "Tên Nhân Viên",
  "Ghi Chú",
];

const openModal = () => {
  hienThiModal.value = true;
  datLaiTrangThai();
};

const closeModal = () => {
  hienThiModal.value = false;
  datLaiTrangThai();
  emit("close");
};

const datLaiTrangThai = () => {
  fileDaChon.value = null;
  duLieuTuExcel.value = [];
  duLieuChuanHoa.value = [];
  danhSachLoi.value = [];
  danhSachCanhBao.value = [];
  loiDocFile.value = "";
  loiImport.value = "";
  ketQuaImport.value = null;
  buoc.value = 1;
};

const xuLyKhiChonFile = (event) => {
  fileDaChon.value = event.target.files[0];
  loiDocFile.value = "";
};

const layGiaTriXemTruoc = (row, col, rowIdx) => {
  switch (col) {
    case "STT":
      return row.STT || rowIdx + 1;
    case "Mã Nhân Viên":
      return row.MaNhanVien || "-";
    case "Ca Làm":
      return row.TenCa || "-";
    case "Ngày Làm":
      return dinhDangNgayPreview(row.NgayLam);
    case "Tên Nhân Viên":
      return row.TenNhanVien || "-";
    case "Ghi Chú":
      return row.GhiChu || "-";
    default:
      return "-";
  }
};

const xemTruocDuLieu = async () => {
  if (!fileDaChon.value) {
    loiDocFile.value = "Vui lòng chọn file Excel.";
    return;
  }

  dangXuLy.value = true;
  loiDocFile.value = "";

  try {
    const duLieu = await parseExcelFile(fileDaChon.value);
    duLieuTuExcel.value = duLieu || [];

    const normalized = normalizeExcelRows(duLieuTuExcel.value);
    duLieuChuanHoa.value = normalized;

    if (normalized.length === 0) {
      loiDocFile.value = "File Excel không có dữ liệu hợp lệ.";
      return;
    }

    const ketQuaKiemTra = validateScheduleData(
      normalized,
      props.listCa,
      props.listNhanVien
    );

    danhSachLoi.value = ketQuaKiemTra.errors || [];
    danhSachCanhBao.value = ketQuaKiemTra.warnings || [];
    buoc.value = 2;
  } catch (error) {
    loiDocFile.value = error?.message || "Lỗi khi đọc file Excel.";
  } finally {
    dangXuLy.value = false;
  }
};

const thucHienImport = async () => {
  if (!fileDaChon.value) return;

  dangXuLy.value = true;
  loiImport.value = "";

  try {
    const duLieuForm = new FormData();
    duLieuForm.append("file", fileDaChon.value);

    const ketQua = await importLichExcel(duLieuForm);

    ketQuaImport.value = Array.isArray(ketQua)
      ? ketQua
      : ketQua?.content
      ? ketQua.content
      : ketQua
      ? [ketQua]
      : [];

    buoc.value = 3;
    emit("import-success");
  } catch (error) {
    console.error("Import error:", error);
    loiImport.value = error?.message || "Có lỗi xảy ra khi import.";
    ketQuaImport.value = [];
    buoc.value = 3;
  } finally {
    dangXuLy.value = false;
  }
};

const hoanTat = () => {
  closeModal();
};

defineExpose({
  openModal,
  closeModal,
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
  inset: 0;
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
  max-width: 950px;
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
  background: rgba(239, 68, 68, 0.1);
  cursor: pointer;
  color: #dc2626;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.18);
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
  background: #fff5f5;
  border-left: 4px solid #ef4444;
  padding: 15px;
  border-radius: 6px;
}

.instruction-box h4 {
  margin: 0 0 10px 0;
  color: #991b1b;
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
  border: 2px dashed #fca5a5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.file-input:focus {
  outline: none;
  border-color: #ef4444;
}

.file-name {
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
  font-size: 13px;
  color: #7f1d1d;
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

.error-box p {
  white-space: pre-line;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.warning-box {
  background: #fff1f2;
  border-left: 4px solid #fb7185;
  padding: 15px;
  border-radius: 6px;
  color: #9f1239;
}

.warning-box h4,
.warning-box.large h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #be123c;
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
  background: #fff5f5;
  border-left: 4px solid #ef4444;
  padding: 15px;
  border-radius: 6px;
  color: #7f1d1d;
}

.success-box h4,
.success-box.large h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #b91c1c;
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
  color: #b91c1c;
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
  background: #fff1f2;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #7f1d1d;
  border-bottom: 2px solid #fecdd3;
}

.preview-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-table tr:hover {
  background: #fffafa;
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
  padding: 9px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-primary {
  border: none;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(255, 77, 79, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(255, 77, 79, 0.24);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.btn-secondary {
  border: 1px solid #ef4444;
  background: #fff5f5;
  color: #dc2626;
}

.btn-secondary:hover {
  background: #fee2e2;
}
</style>