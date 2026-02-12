<template>
  <div class="lich-page">
    <div class="header-section">
      <h2 class="page-title">Quản Lý Lịch Làm Việc</h2>
      <span class="breadcrumb">Trang chủ / Lịch làm việc</span>
    </div>

    <div class="card-box">
      <div class="toolbar-header">
        <div class="left">
           <h3><i class="fa-solid fa-sliders"></i> Tùy chọn</h3>
        </div>
      </div>
      
      <div class="toolbar-body">
        <button class="btn-add" @click="openModal">
          <i class="fa-solid fa-plus"></i> Thêm mới lịch làm việc
        </button>
        
        <div class="filters">
          <div class="filter-item">
            <label>Nhân viên:</label>
            <select v-model="filterNv" class="custom-select">
              <option :value="null">Tất cả</option>
              <option v-for="nv in listNhanVien" :key="nv.id" :value="nv.id">
                {{ nv.tenNhanVien }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <label>Ngày làm:</label>
            <input type="date" v-model="filterDate" class="custom-input" />
          </div>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="toolbar-header">
         <h3><i class="fa-regular fa-file-excel"></i> Nhập Dữ Liệu Từ Excel</h3>
      </div>
      <div class="import-body">
        <div class="file-input-wrapper">
           <label>Chọn file Excel:</label>
           <div class="input-group">
             <input type="file" id="fileExcel" />
             <button class="btn-import"><i class="fa-solid fa-upload"></i> Import Excel</button>
           </div>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
       <div class="table-header-row">
          <h3><i class="fa-solid fa-table"></i> Danh Sách Lịch Làm Việc</h3>
          <div class="view-modes">
            <button class="mode-btn active"><i class="fa-solid fa-table"></i> Bảng</button>
            <button class="mode-btn"><i class="fa-solid fa-calendar"></i> Lịch</button>
          </div>
       </div>

       <div class="table-responsive">
         <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NHÂN VIÊN</th>
                <th>CA LÀM</th>
                <th>NGÀY LÀM</th>
                <th>TRẠNG THÁI</th>
                <th class="text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in lichList" :key="l.id">
                <td>{{ l.id }}</td>
                <td class="fw-bold">{{ l.nhanVien?.tenNhanVien }}</td>
                <td>
                  <span class="badge-ca">{{ l.caLam?.tenCa }} ({{ formatTime(l.caLam?.gioBatDau) }} - {{ formatTime(l.caLam?.gioKetThuc) }})</span>
                </td>
                <td>{{ formatDate(l.ngayLam) }}</td>
                 <td>
                  <span class="badge-status" :class="l.trangThai ? 'active' : ''">
                    {{ l.trangThai ? 'Đã duyệt' : 'Hủy' }}
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn-icon"><i class="fa-solid fa-pen"></i> Sửa</button>
                  <button class="btn-icon delete"><i class="fa-solid fa-trash"></i> Xóa</button>
                </td>
              </tr>
              <tr v-if="lichList.length === 0">
                <td colspan="6" class="text-center">Không có dữ liệu</td>
              </tr>
            </tbody>
         </table>
       </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Thêm Mới Lịch</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
             <label>Nhân viên <span class="req">*</span></label>
             <select v-model="form.idNhanVien" class="form-control">
               <option v-for="nv in listNhanVien" :key="nv.id" :value="nv.id">
                 {{ nv.tenNhanVien }} - {{ nv.maNhanVien }}
               </option>
             </select>
          </div>
          <div class="form-group">
             <label>Ca làm việc <span class="req">*</span></label>
             <select v-model="form.idCaLam" class="form-control">
               <option v-for="ca in listCa" :key="ca.id" :value="ca.id">
                 {{ ca.tenCa }} ({{ ca.gioBatDau }} - {{ ca.gioKetThuc }})
               </option>
             </select>
          </div>
          <div class="form-group">
             <label>Ngày làm <span class="req">*</span></label>
             <input type="date" v-model="form.ngayLam" class="form-control" />
          </div>
          <div class="form-group">
             <label>Ghi chú</label>
             <textarea v-model="form.ghiChu" class="form-control"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Hủy</button>
          <button class="btn-save" @click="handleSubmit">Lưu lại</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { getLichPage, createLich } from '@/services/lich_lam_viec/lich_lam_viecService';
import { getAllNhanVien } from '@/services/tai_khoan/nhan_vien/nhan_vienService'; // Tận dụng service bạn đã có
import { getAllCaLam } from '@/services/lich_lam_viec/ca_lamService';

const lichList = ref([]);
const listNhanVien = ref([]);
const listCa = ref([]);
const loading = ref(false);

const filterNv = ref(null);
const filterDate = ref(null);

const showModal = ref(false);
const form = reactive({
  idNhanVien: "",
  idCaLam: "",
  ngayLam: "",
  ghiChu: ""
});

const loadData = async () => {
  try {
    const res = await getLichPage(0, 10);
    lichList.value = res.content || [];
  } catch(e) { console.error(e); }
};

const loadInit = async () => {
  const [nv, ca] = await Promise.all([getAllNhanVien(), getAllCaLam()]);
  listNhanVien.value = Array.isArray(nv) ? nv : [];
  listCa.value = Array.isArray(ca) ? ca : [];
  loadData();
};

const openModal = () => {
  form.idNhanVien = "";
  form.idCaLam = "";
  form.ngayLam = new Date().toISOString().split('T')[0];
  form.ghiChu = "";
  showModal.value = true;
};

const closeModal = () => showModal.value = false;

const handleSubmit = async () => {
  if(!form.idNhanVien || !form.idCaLam || !form.ngayLam) {
    alert("Vui lòng nhập đủ thông tin");
    return;
  }
  try {
    await createLich(form);
    alert("Thêm lịch thành công");
    closeModal();
    loadData();
  } catch(e) {
    alert("Lỗi: " + e.message);
  }
};

const formatTime = (arr) => {
   // LocalTime từ Java trả về mảng [h, m] hoặc string "HH:mm:ss" tùy config Jackson
   if(Array.isArray(arr)) return `${arr[0]}:${arr[1] < 10 ? '0'+arr[1] : arr[1]}`;
   if(typeof arr === 'string') return arr.substring(0,5);
   return '';
}
const formatDate = (arr) => {
   if(Array.isArray(arr)) return `${arr[2]}/${arr[1]}/${arr[0]}`; // d/m/y
   return arr;
}

onMounted(() => {
  loadInit();
});
</script>

<style scoped>
.lich-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.header-section { margin-bottom: 20px; }
.page-title { color: #107c41; margin: 0; font-weight: 700; font-size: 24px; }
.breadcrumb { font-size: 13px; color: #107c41; text-decoration: underline; }

/* Card Box Style (White container) */
.card-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 20px;
  border: 1px solid #e5e7eb;
}
.mt-20 { margin-top: 20px; }

.toolbar-header h3, .table-header-row h3 {
  font-size: 16px; font-weight: 600; margin: 0; color: #374151; display: flex; align-items: center; gap: 8px;
}
.toolbar-body {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

/* Buttons */
.btn-add {
  background: #10b981; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; gap: 8px; align-items: center;
}
.btn-import {
  background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;
}

/* Filters */
.filters { display: flex; gap: 20px; }
.filter-item { display: flex; align-items: center; gap: 10px; }
.custom-select, .custom-input {
  padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; outline: none; min-width: 150px;
}

/* Import Section */
.import-body { margin-top: 15px; background: #f9fafb; padding: 15px; border-radius: 6px; }
.input-group { display: flex; gap: 10px; margin-top: 5px; }

/* Table */
.table-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.view-modes { display: flex; gap: 5px; }
.mode-btn { border: 1px solid #d1d5db; background: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.mode-btn.active { background: #10b981; color: white; border-color: #10b981; }

table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; }
.fw-bold { font-weight: 600; }
.text-right { text-align: right; }
.text-center { text-align: center; }

.badge-ca { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.badge-status { font-size: 12px; font-weight: 600; color: #9ca3af; }
.badge-status.active { color: #10b981; }

.btn-icon { background: none; border: none; cursor: pointer; color: #374151; font-size: 13px; margin-left: 10px; }
.btn-icon.delete { color: #ef4444; }

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content { background: white; width: 500px; border-radius: 8px; overflow: hidden; animation: fadeIn 0.2s; }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.btn-close { background: none; border: none; font-size: 24px; cursor: pointer; }
.modal-body { padding: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
.req { color: red; }
.form-control { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }
.modal-footer { padding: 15px 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; }
.btn-cancel { background: #f3f4f6; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-save { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>