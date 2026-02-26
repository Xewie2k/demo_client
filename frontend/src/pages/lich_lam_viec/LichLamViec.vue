<!-- File: src/pages/lich_lam_viec/LichLamViec.vue -->
<template>
  <div class="lich-page">
    <div class="header-section">
      <h2 class="page-title">Quản lý lịch làm việc</h2>
    </div>

    <div class="card-box">
      <div class="toolbar-header">
        <div class="left">
          <h3><i class="fa-solid fa-sliders"></i> Tùy chọn</h3>
        </div>
      </div>

      <div class="toolbar-body">
        <button class="btn-add" @click="openModal(null)" type="button">
          <i class="fa-solid fa-plus"></i> Thêm mới lịch làm việc
        </button>

        <div class="filters-bar">
          <div class="form-group filter-item">
            <label>Nhân viên <span class="req">*</span></label>

            <div class="combobox-wrapper ss-combobox">
              <input
                type="text"
                class="form-control"
                placeholder="Nhập tên hoặc mã nhân viên..."
                v-model="searchNv"
                @focus="showNvDropdown = true"
                @blur="handleBlurNv"
                @input="showNvDropdown = true; filterNv = null"
              />

              <button
                v-if="searchNv"
                class="ss-clear-btn"
                type="button"
                title="Xóa lọc nhân viên"
                @mousedown.prevent
                @click="clearNvFilter"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>

              <span class="ss-caret" aria-hidden="true">
                <i class="fa-solid fa-chevron-down"></i>
              </span>

              <ul v-if="showNvDropdown" class="combobox-dropdown">
                <li
                  v-for="nv in filteredNhanVienList"
                  :key="nv.id"
                  @click="selectNhanVien(nv)"
                  :class="{ active: nv.id === form.idNhanVien }"
                >
                  <span>{{ nv.tenNhanVien }}</span>
                  <small v-if="nv.maNhanVien"> - {{ nv.maNhanVien }}</small>
                </li>

                <li v-if="filteredNhanVienList.length === 0" class="no-result">
                  Không tìm thấy nhân viên
                </li>
              </ul>
            </div>
          </div>

          <div class="form-group filter-item" v-if="viewMode === 'table'">
            <label>Ngày làm</label>

            <div class="date-combobox">
              <input
                type="text"
                class="form-control"
                placeholder="dd/mm/yyyy hoặc yyyy-mm-dd"
                v-model="filterDateText"
                @input="onFilterDateTyping"
                @blur="handleBlurFilterDate"
              />

              <button
                v-if="filterDateText"
                class="ss-clear-btn"
                type="button"
                title="Xóa lọc ngày"
                @mousedown.prevent
                @click="clearFilterDate"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>

              <button
                class="date-btn"
                type="button"
                title="Chọn ngày"
                @mousedown.prevent
                @click="openFilterDatePicker"
              >
                <i class="fa-regular fa-calendar"></i>
              </button>

              <!-- input date “native” để mở calendar -->
              <input
                ref="filterDatePickerRef"
                type="date"
                class="date-native"
                v-model="filterDate"
                @change="syncFilterDateText"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="toolbar-header">
        <h3><i class="fa-regular fa-file-excel"></i> Nhập dữ liệu từ Excel</h3>
      </div>

      <div class="import-body">
        <div class="file-input-wrapper">
          <label>Chọn file Excel</label>
          <div class="input-group">
            <input type="file" ref="fileInputRef" accept=".xlsx, .xls" @change="handleFileChange" />

            <button class="btn-import" type="button" @click="handleImportExcel" :disabled="isLoadingImport">
              <i v-if="isLoadingImport" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-upload"></i>
              Import Excel
            </button>
          </div>

          <small v-if="selectedFile" class="file-hint">
            Đã chọn: {{ selectedFile.name }}
          </small>
        </div>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="table-header-row">
        <h3>
          <i :class="viewMode === 'table' ? 'fa-solid fa-table' : 'fa-solid fa-calendar'"></i>
          {{ viewMode === 'table' ? 'Danh sách lịch làm việc' : 'Lịch làm việc tháng ' + (currentMonth + 1) }}
        </h3>

        <div class="view-modes">
          <button class="mode-btn" type="button" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="fa-solid fa-table"></i> Bảng
          </button>
          <button
            class="mode-btn"
            type="button"
            :class="{ active: viewMode === 'calendar' }"
            @click="viewMode = 'calendar'"
          >
            <i class="fa-solid fa-calendar"></i> Lịch
          </button>
        </div>
      </div>

      <div v-if="viewMode === 'table'" class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width: 60px">STT</th>
              <th>Nhân viên</th>
              <th>Ca làm</th>
              <th>Thời gian</th>
              <th>Ngày làm</th>
              <th class="text-right" style="width: 120px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, index) in filterLichList" :key="l.id">
              <td>{{ index + 1 }}</td>
              <td>{{ l.tenNhanVien }}</td>
              <td>{{ l.tenCa }}</td>
              <td>{{ formatTime(l.gioBatDau) }} - {{ formatTime(l.gioKetThuc) }}</td>
              <td>{{ formatDate(l.ngayLam) }}</td>
              <td class="text-right action-col">
                <button class="ss-icon-btn-view" type="button" @click="openModal(l)" title="Xem / Sửa">
                  <span class="material-icons-outlined">visibility</span>
                </button>

                <button class="ss-icon-btn-danger" type="button" @click="deletePhanCong(l.id)" title="Xóa">
                  <span class="fa-solid fa-trash"></span>
                </button>
              </td>
            </tr>

            <tr v-if="filterLichList.length === 0">
              <td colspan="6" class="text-center">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="calendar-view">
        <div class="cal-navigation">
          <div class="nav-left">
            <button class="btn-nav" type="button" @click="changeMonth(-1)" title="Tháng trước">
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <span class="cal-title">Tháng {{ currentMonth + 1 }} năm {{ currentYear }}</span>

            <button class="btn-nav" type="button" @click="changeMonth(1)" title="Tháng sau">
              <i class="fa-solid fa-chevron-right"></i>
            </button>

            <button class="btn-nav" type="button" @click="goToday">Hôm nay</button>
          </div>
        </div>

        <div class="cal-grid-header">
          <div class="cal-day-name">CN</div>
          <div class="cal-day-name">Th 2</div>
          <div class="cal-day-name">Th 3</div>
          <div class="cal-day-name">Th 4</div>
          <div class="cal-day-name">Th 5</div>
          <div class="cal-day-name">Th 6</div>
          <div class="cal-day-name">Th 7</div>
        </div>

        <div class="cal-grid-body">
          <div v-for="blank in startPadding" :key="'blank-' + blank" class="cal-cell disabled"></div>

          <div v-for="day in daysInMonth" :key="'day-' + day" class="cal-cell" :class="{ 'is-today': isToday(day) }">
            <div class="cal-date-num">{{ day }}</div>

            <div class="cal-events-container">
              <div v-for="nv in getEventsForDay(day)" :key="nv.id" class="event-item" @click="openModal(nv)">
                <div class="avatar-circle">
                  <img v-if="isImg(nv.nhanVien?.anhNhanVien)" :src="nv.nhanVien?.anhNhanVien" />
                  <span v-else class="initial">{{ getAvatarLabel(nv.tenNhanVien) }}</span>
                </div>
                <span class="event-name">{{ nv.nhanVien?.tenTaiKhoan }}</span>
              </div>

              <div class="event-item add-new-btn" @click.stop="openModalVoiNgay(day)">
                <div class="avatar-circle circle-add">
                  <i class="fa-solid fa-plus"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Cập nhật lịch làm việc' : 'Thêm mới lịch' }}</h3>
          <button @click="closeModal" class="btn-close" type="button" title="Đóng">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nhân viên <span class="req">*</span></label>

            <div v-if="!isEditing">
              <div class="selected-tags" v-if="selectedNhanViens.length > 0">
                <div v-for="(nv, index) in selectedNhanViens" :key="nv.id" class="tag-item">
                  <span>{{ nv.tenNhanVien }}</span>
                  <i class="fa-solid fa-xmark remove-tag" @click="removeSelectedNv(index)"></i>
                </div>
              </div>

              <div class="combobox-wrapper ss-combobox">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm và chọn nhiều nhân viên..."
                  v-model="searchNvModal"
                  @focus="showNvModalDropdown = true"
                  @blur="handleBlurNvModal"
                />

                <span class="ss-caret" aria-hidden="true">
                  <i class="fa-solid fa-chevron-down"></i>
                </span>

                <ul v-if="showNvModalDropdown" class="combobox-dropdown">
                  <li
                    v-for="nv in filteredNvModal"
                    :key="nv.id"
                    @click="selectNvMulti(nv)"
                    :class="{ active: isNvSelected(nv.id) }"
                  >
                    <span>{{ nv.tenNhanVien }}</span>
                    <small v-if="nv.maNhanVien"> - {{ nv.maNhanVien }}</small>
                    <i v-if="isNvSelected(nv.id)" class="fa-solid fa-check float-right"></i>
                  </li>
                  <li v-if="filteredNvModal.length === 0" class="no-result">Không tìm thấy</li>
                </ul>
              </div>

              <small class="text-muted" v-if="selectedNhanViens.length > 0">
                Đã chọn {{ selectedNhanViens.length }} nhân viên
              </small>
            </div>

            <div v-else class="combobox-wrapper ss-combobox">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm tên hoặc mã nhân viên..."
                v-model="searchNvModal"
                @focus="showNvModalDropdown = true"
                @blur="handleBlurNvModal"
              />

              <span class="ss-caret" aria-hidden="true">
                <i class="fa-solid fa-chevron-down"></i>
              </span>

              <ul v-if="showNvModalDropdown" class="combobox-dropdown">
                <li
                  v-for="nv in filteredNvModal"
                  :key="nv.id"
                  @click="selectNvSingle(nv)"
                  :class="{ active: nv.id === form.idNhanVien }"
                >
                  <span>{{ nv.tenNhanVien }}</span>
                  <small v-if="nv.maNhanVien"> - {{ nv.maNhanVien }}</small>
                </li>
                <li v-if="filteredNvModal.length === 0" class="no-result">Không tìm thấy</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Ca làm việc <span class="req">*</span></label>
            <div class="combobox-wrapper ss-combobox">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm ca làm việc..."
                v-model="searchCaModal"
                @focus="showCaModalDropdown = true"
                @blur="handleBlurCaModal"
              />

              <span class="ss-caret" aria-hidden="true">
                <i class="fa-solid fa-chevron-down"></i>
              </span>

              <ul v-if="showCaModalDropdown" class="combobox-dropdown">
                <li
                  v-for="ca in filteredCaModal"
                  :key="ca.id"
                  @click="selectCaModal(ca)"
                  :class="{ active: ca.id === form.idCaLam }"
                >
                  <span>{{ ca.tenCa }}</span>
                  <small> ({{ formatTime(ca.gioBatDau) }} - {{ formatTime(ca.gioKetThuc) }})</small>
                </li>
                <li v-if="filteredCaModal.length === 0" class="no-result">Không tìm thấy</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Ngày làm <span class="req">*</span></label>

            <div class="date-combobox">
              <input
                type="text"
                class="form-control"
                placeholder="dd/mm/yyyy hoặc yyyy-mm-dd"
                v-model="ngayLamText"
                @input="onModalNgayLamTyping"
                @blur="handleBlurModalNgayLam"
              />

              <button
                class="date-btn"
                type="button"
                title="Chọn ngày"
                @mousedown.prevent
                @click="openModalNgayLamPicker"
              >
                <i class="fa-regular fa-calendar"></i>
              </button>

              <input
                ref="ngayLamPickerRef"
                type="date"
                class="date-native"
                v-model="form.ngayLam"
                @change="syncModalNgayLamText"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-save" type="button" @click="handleSubmit">
            {{ isEditing ? 'Lưu' : 'Thêm mới' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { createPhanCong, removePhanCong, getAllPhanCong, importPhanCongExcel } from '@/services/lich_lam_viec/lich_lam_viec_nhan_vienService';

import { getAllNhanVien } from '@/services/tai_khoan/nhan_vien/nhan_vienService';
import { getAllCaLam } from '@/services/lich_lam_viec/ca_lamService';
import { pagingLichLamViec, createLich, checkLichLamViec } from '@/services/lich_lam_viec/lich_lam_viecService';

const listLichMaster = ref([]);
const lichList = ref([]);
const lichNhanVienList = ref([]);
const listNhanVien = ref([]);
const listCa = ref([]);
const loading = ref(false);

const filterNv = ref(null);
const filterDate = ref(null);

const filterDateText = ref('');
const lastValidFilterDate = ref(null);
const filterDatePickerRef = ref(null);

const selectedNhanViens = ref([]);

const searchNv = ref('');
const showNvDropdown = ref(false);

const searchNvModal = ref('');
const showNvModalDropdown = ref(false);

const searchCaModal = ref('');
const showCaModalDropdown = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const fileInputRef = ref(null);
const selectedFile = ref(null);
const isLoadingImport = ref(false);

const viewMode = ref('table');
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const ngayLamText = ref('');
const lastValidModalDate = ref(null);
const ngayLamPickerRef = ref(null);

const form = reactive({
  idLichLamViec: null,
  idNhanVien: null,
  idCaLam: null,
  ngayLam: new Date().toISOString().split('T')[0],
  ghiChu: '',
  nguoiTao: 1
});

const getAvatarLabel = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  const lastName = parts[parts.length - 1];
  return lastName.charAt(0).toUpperCase();
};

const isImg = (s) => {
  if (!s) return false;
  const v = String(s).trim();
  return v.startsWith('data:image/') || v.startsWith('http://') || v.startsWith('https://');
};

const isNvSelected = (id) => {
  return selectedNhanViens.value.some((nv) => nv.id === id);
};

const selectNvMulti = (nv) => {
  if (!isNvSelected(nv.id)) {
    selectedNhanViens.value.push(nv);
  }
  searchNvModal.value = '';
};

const removeSelectedNv = (index) => {
  selectedNhanViens.value.splice(index, 1);
};

const selectNvSingle = (nv) => {
  form.idNhanVien = nv.id;
  searchNvModal.value = nv.tenNhanVien;
  showNvModalDropdown.value = false;
};

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const startPadding = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const changeMonth = (step) => {
  let newMonth = currentMonth.value + step;
  if (newMonth > 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else if (newMonth < 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value = newMonth;
  }
};

const goToday = () => {
  const now = new Date();
  currentMonth.value = now.getMonth();
  currentYear.value = now.getFullYear();
};

const isToday = (day) => {
  const now = new Date();
  return day === now.getDate() && currentMonth.value === now.getMonth() && currentYear.value === now.getFullYear();
};

const getEventsForDay = (day) => {
  if (!lichNhanVienList.value) return [];

  const m = currentMonth.value + 1;
  const mStr = m < 10 ? `0${m}` : m;
  const dStr = day < 10 ? `0${day}` : day;
  const dateString = `${currentYear.value}-${mStr}-${dStr}`;

  return filterLichList.value.filter((l) => {
    if (Array.isArray(l.ngayLam)) {
      return l.ngayLam[0] === currentYear.value && l.ngayLam[1] === m && l.ngayLam[2] === day;
    }
    if (typeof l.ngayLam === 'string') {
      return l.ngayLam === dateString;
    }
    return false;
  });
};

const filteredNhanVienList = computed(() => {
  const q = (searchNv.value || '').toLowerCase();
  return listNhanVien.value.filter((nv) => {
    const koPhaiAdmin = nv.idQuyenHan !== 1;
    if (!koPhaiAdmin) return false;

    if (!q) return true;
    return (nv.tenNhanVien || '').toLowerCase().includes(q) || (nv.maNhanVien || '').toLowerCase().includes(q);
  });
});

const filteredNvModal = computed(() => {
  const q = (searchNvModal.value || '').toLowerCase();
  return listNhanVien.value.filter((nv) => {
    const koPhaiAdmin = nv.idQuyenHan !== 1;
    if (!koPhaiAdmin) return false;

    return (nv.tenNhanVien || '').toLowerCase().includes(q) || (nv.maNhanVien || '').toLowerCase().includes(q);
  });
});

const filteredCaModal = computed(() => {
  const q = (searchCaModal.value || '').toLowerCase();
  return listCa.value.filter((ca) => (ca.tenCa || '').toLowerCase().includes(q));
});

const selectNhanVien = (nv) => {
  filterNv.value = nv.id;
  searchNv.value = nv.tenNhanVien;
  showNvDropdown.value = false;
};

const selectCaModal = (ca) => {
  form.idCaLam = ca.id;
  searchCaModal.value = `${ca.tenCa} (${formatTime(ca.gioBatDau)} - ${formatTime(ca.gioKetThuc)})`;
  showCaModalDropdown.value = false;
};

const clearNvFilter = () => {
  filterNv.value = null;
  searchNv.value = '';
  showNvDropdown.value = false;
};

const handleBlurNvModal = () => setTimeout(() => (showNvModalDropdown.value = false), 200);
const handleBlurCaModal = () => setTimeout(() => (showCaModalDropdown.value = false), 200);
const handleBlurNv = () => setTimeout(() => (showNvDropdown.value = false), 200);

const formatTime = (arr) => {
  if (Array.isArray(arr)) return `${arr[0]}:${arr[1] < 10 ? '0' + arr[1] : arr[1]}`;
  if (typeof arr === 'string') return arr.substring(0, 5);
  return '';
};

const formatDate = (arr) => {
  if (Array.isArray(arr)) return `${arr[2]}/${arr[1]}/${arr[0]}`;
  return arr;
};

const convertArrayDateToString = (arrDate) => {
  if (Array.isArray(arrDate)) {
    const y = arrDate[0];
    const m = arrDate[1] < 10 ? '0' + arrDate[1] : arrDate[1];
    const d = arrDate[2] < 10 ? '0' + arrDate[2] : arrDate[2];
    return `${y}-${m}-${d}`;
  }
  return arrDate;
};

/* ====== Date combobox (lọc + modal): nhập tay hoặc chọn calendar ====== */
const isValidYmd = (y, m, d) => {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
};

const parseDateInputToIso = (text) => {
  const t = String(text || '').trim();
  if (!t) return null;

  // yyyy-mm-dd
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (!isValidYmd(y, m, d)) return null;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const dd = d < 10 ? `0${d}` : `${d}`;
    return `${y}-${mm}-${dd}`;
  }

  // dd/mm/yyyy
  const vn = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (vn) {
    const d = Number(vn[1]);
    const m = Number(vn[2]);
    const y = Number(vn[3]);
    if (!isValidYmd(y, m, d)) return null;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const dd = d < 10 ? `0${d}` : `${d}`;
    return `${y}-${mm}-${dd}`;
  }

  return null;
};

const formatVnFromIso = (iso) => {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

/* Lọc ngày */
const syncFilterDateText = () => {
  lastValidFilterDate.value = filterDate.value || null;
  filterDateText.value = filterDate.value ? formatVnFromIso(filterDate.value) : '';
};

const onFilterDateTyping = () => {
  const t = (filterDateText.value || '').trim();
  if (!t) {
    filterDate.value = null;
    lastValidFilterDate.value = null;
    return;
  }
  const iso = parseDateInputToIso(t);
  if (iso) {
    filterDate.value = iso;
    lastValidFilterDate.value = iso;
  }
};

const handleBlurFilterDate = () => {
  setTimeout(() => {
    const iso = parseDateInputToIso(filterDateText.value);
    if (iso) {
      filterDate.value = iso;
      lastValidFilterDate.value = iso;
      filterDateText.value = formatVnFromIso(iso);
    } else {
      filterDateText.value = lastValidFilterDate.value ? formatVnFromIso(lastValidFilterDate.value) : '';
    }
  }, 150);
};

const openFilterDatePicker = () => {
  const el = filterDatePickerRef.value;
  if (!el) return;
  if (typeof el.showPicker === 'function') el.showPicker();
  else el.click();
};

const clearFilterDate = () => {
  filterDate.value = null;
  filterDateText.value = '';
  lastValidFilterDate.value = null;
};

/* Modal ngày làm */
const syncModalNgayLamText = () => {
  lastValidModalDate.value = form.ngayLam || null;
  ngayLamText.value = form.ngayLam ? formatVnFromIso(form.ngayLam) : '';
};

const onModalNgayLamTyping = () => {
  const t = (ngayLamText.value || '').trim();
  if (!t) {
    form.ngayLam = '';
    lastValidModalDate.value = null;
    return;
  }

  const iso = parseDateInputToIso(t);
  if (iso) {
    form.ngayLam = iso;
    lastValidModalDate.value = iso;
  }
};

const handleBlurModalNgayLam = () => {
  setTimeout(() => {
    const iso = parseDateInputToIso(ngayLamText.value);
    if (iso) {
      form.ngayLam = iso;
      lastValidModalDate.value = iso;
      ngayLamText.value = formatVnFromIso(iso);
    } else {
      ngayLamText.value = lastValidModalDate.value ? formatVnFromIso(lastValidModalDate.value) : '';
    }
  }, 150);
};

const openModalNgayLamPicker = () => {
  const el = ngayLamPickerRef.value;
  if (!el) return;
  if (typeof el.showPicker === 'function') el.showPicker();
  else el.click();
};

const openModalVoiNgay = (day) => {
  isEditing.value = false;
  currentId.value = null;
  form.idLichLamViec = null;
  form.idNhanVien = null;
  selectedNhanViens.value = [];
  form.idCaLam = null;
  form.ghiChu = '';
  searchNvModal.value = '';
  searchCaModal.value = '';

  const m = currentMonth.value + 1;
  const mStr = m < 10 ? `0${m}` : m;
  const dStr = day < 10 ? `0${day}` : day;
  const dateString = `${currentYear.value}-${mStr}-${dStr}`;
  form.ngayLam = dateString;

  syncModalNgayLamText();
  showModal.value = true;
};

const openModal = (item) => {
  if (item) {
    isEditing.value = true;
    currentId.value = item.id;

    const idNv = item.nhanVien?.id;
    const idCa = item.idCaLam || (item.caLam ? item.caLam.id : null);

    form.idNhanVien = idNv;
    form.idCaLam = idCa;
    form.idLichLamViec = item.lichLamViec ? item.lichLamViec.id : item.idLichLamViec;
    form.ngayLam = convertArrayDateToString(item.ngayLam);
    form.ghiChu = item.ghiChu || '';

    const nv = listNhanVien.value.find((n) => n.id === idNv);
    searchNvModal.value = nv ? nv.tenNhanVien : '';
    selectedNhanViens.value = [];

    const ca = listCa.value.find((c) => c.id === idCa);
    searchCaModal.value = ca ? `${ca.tenCa} (${formatTime(ca.gioBatDau)} - ${formatTime(ca.gioKetThuc)})` : '';
  } else {
    isEditing.value = false;
    currentId.value = null;

    form.idLichLamViec = null;
    form.idNhanVien = null;
    selectedNhanViens.value = [];
    form.idCaLam = null;

    form.ngayLam = new Date().toISOString().split('T')[0];
    form.ghiChu = '';
    searchNvModal.value = '';
    searchCaModal.value = '';
  }

  syncModalNgayLamText();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  currentId.value = null;
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      alert('Vui lòng chỉ chọn file Excel (.xlsx, .xls)');
      resetFileInput();
      return;
    }
    selectedFile.value = file;
  } else {
    selectedFile.value = null;
  }
};

const handleImportExcel = async () => {
  if (!selectedFile.value) {
    alert('Vui lòng chọn file trước khi import!');
    return;
  }

  if (!confirm('Bạn có chắc muốn import dữ liệu từ file này?')) return;

  isLoadingImport.value = true;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    await importPhanCongExcel(formData);
    alert('Import dữ liệu thành công!');

    resetFileInput();
    await loadData();
  } catch (e) {
    console.error(e);
    alert('Import thất bại: ' + (e?.message || 'Lỗi không xác định'));
  } finally {
    isLoadingImport.value = false;
  }
};

const resetFileInput = () => {
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const handleSubmit = async () => {
  if (!form.ngayLam) {
    alert('Vui lòng chọn ngày làm việc!');
    return;
  }
  if (!form.idCaLam) {
    alert('Vui lòng chọn ca làm việc!');
    return;
  }

  if (!isEditing.value && selectedNhanViens.value.length === 0) {
    alert('Vui lòng chọn ít nhất một nhân viên!');
    return;
  }

  try {
    loading.value = true;
    let idMaster = null;

    const existingLich = await checkLichLamViec({
      ca: form.idCaLam,
      ngay: form.ngayLam
    });

    if (existingLich && existingLich.id) {
      idMaster = existingLich.id;
    } else {
      const newLichData = {
        idCaLam: form.idCaLam,
        ngayLam: form.ngayLam,
        ghiChu: form.ghiChu || '',
        nguoiTao: 1
      };
      const resLich = await createLich(newLichData);
      idMaster = resLich.id;
    }

    if (!isEditing.value) {
      const selectedIds = selectedNhanViens.value.map((nv) => nv.id);

      const promises = selectedIds.map((nvId) =>
        createPhanCong({
          idLichLamViec: idMaster,
          idNhanVien: nvId,
          nguoiTao: 1
        })
      );

      await Promise.all(promises);
      alert(`Đã thêm ${selectedIds.length} nhân viên vào lịch làm việc.`);
    } else {
      alert('Tính năng cập nhật đang được xử lý.');
    }

    closeModal();
    await loadData();
  } catch (e) {
    console.error('Lỗi hệ thống:', e);
    const msg = e?.message || 'Lỗi không xác định';
    const errorMsg = msg.includes('Unexpected token') ? 'Lỗi phản hồi từ Server (JSON error)' : msg;
    alert('Không thể hoàn thành: ' + errorMsg);
  } finally {
    loading.value = false;
  }
};

const loadData = async () => {
  try {
    const res = await getAllPhanCong();
    lichNhanVienList.value = Array.isArray(res) ? res : res.content || [];
  } catch (e) {
    console.error(e);
  }
};

const loadLichMaster = async () => {
  try {
    const res = await pagingLichLamViec(0, 1000);
    listLichMaster.value = res.content || [];
  } catch (e) {
    console.error(e);
  }
};

const loadthemLich = async () => {
  try {
    const nv = await getAllNhanVien();
    const ca = await getAllCaLam();
    listNhanVien.value = Array.isArray(nv) ? nv : [];
    listCa.value = Array.isArray(ca) ? ca : [];
  } catch (e) {
    console.error(e);
  }
};

const filterLichList = computed(() => {
  let data = [...lichNhanVienList.value];

  if (filterNv.value) {
    data = data.filter((item) => item.nhanVien?.id === Number(filterNv.value));
  }

  if (filterDate.value) {
    data = data.filter((l) => {
      const ngay = convertArrayDateToString(l.ngayLam);
      return ngay === filterDate.value;
    });
  }

  return data;
});

const deletePhanCong = async (id) => {
  if (!confirm('Gỡ nhân viên này khỏi lịch?')) return;
  try {
    await removePhanCong(id);
    await loadData();
  } catch (e) {
    alert('Thất bại: ' + (e?.message || 'Lỗi không xác định'));
  }
};

onMounted(async () => {
  await Promise.all([loadData(), loadLichMaster(), loadthemLich()]);

  // set mặc định text cho date combobox
  syncFilterDateText();
  syncModalNgayLamText();
});
</script>

<style scoped>
.lich-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  margin: 10px 0 18px;
  color: rgba(17, 24, 39, 0.92);
}

.card-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(17, 24, 39, 0.06);
  padding: 18px;
  border: 1px solid #e5e7eb;
}

.mt-20 {
  margin-top: 20px;
}

.toolbar-header h3,
.table-header-row h3 {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-body {
  margin-top: 14px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filters-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-item {
  min-width: 260px;
}

.btn-add {
  height: 38px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.14);
  color: white;
  border: none;
  padding: 0 14px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
}

.btn-import {
  height: 38px;
  background: #10b981;
  color: white;
  border: none;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.78);
}

.req {
  color: #ef4444;
}

.form-control {
  width: 100%;
  height: 38px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  background: #fff;
  color: #111827;
}

.form-control:focus {
  outline: none;
  border-color: rgba(17, 24, 39, 0.35);
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.06);
}

.import-body {
  margin-top: 12px;
  background: #f9fafb;
  padding: 14px;
  border-radius: 10px;
  border: 1px dashed #e5e7eb;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.file-hint {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #2563eb;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.view-modes {
  display: flex;
  gap: 8px;
}

.mode-btn {
  height: 34px;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  background: #f9fafb;
  color: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.mode-btn.active {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 6px 14px rgba(255, 77, 79, 0.16);
  color: white;
  border-color: transparent;
}

.table-responsive {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

th {
  text-align: left;
  padding: 11px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

td {
  padding: 11px 12px;
  border-bottom: 1px solid #eef2f7;
  font-size: 14px;
  color: #111827;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.action-col {
  display: inline-flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
}

.ss-icon-btn-view,
.ss-icon-btn-danger {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.ss-icon-btn-view:hover {
  background: #f3f4f6;
}

.ss-icon-btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* ===== combobox ===== */
.combobox-wrapper {
  position: relative;
}

.ss-combobox .form-control {
  padding-right: 58px;
}

.ss-caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 12px;
  pointer-events: none;
}

.ss-clear-btn {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ss-clear-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.combobox-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 1050;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 6px;
  list-style: none;
}

.combobox-dropdown li {
  padding: 9px 10px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.combobox-dropdown li:hover {
  background-color: #f3f4f6;
}

.combobox-dropdown li.active {
  background-color: #eef2ff;
  color: #1f2937;
}

.combobox-dropdown .no-result {
  padding: 10px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
  cursor: default;
}

/* ===== date combobox ===== */
.date-combobox {
  position: relative;
}

.date-combobox .form-control {
  padding-right: 78px;
}

.date-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
}

.date-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.date-native {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 30px;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

/* ===== calendar view ===== */
.calendar-view {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.cal-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cal-title {
  font-size: 15px;
  font-weight: 500;
  margin: 0 6px;
}

.btn-nav {
  height: 34px;
  border: 1px solid #d1d5db;
  color: #111827;
  background: white;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

.btn-nav:hover {
  background: #f3f4f6;
}

.cal-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.cal-day-name {
  padding: 10px 6px;
  text-align: center;
  font-weight: 500;
  color: #334155;
  border-right: 1px solid #e5e7eb;
  font-size: 13px;
}

.cal-day-name:last-child {
  border-right: none;
}

.cal-grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fff;
}

.cal-cell {
  min-height: 118px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 6px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.cal-cell:nth-child(7n) {
  border-right: none;
}

.cal-cell.disabled {
  background: #f9fafb;
}

.cal-cell.is-today {
  background: #fffbeb;
}

.cal-date-num {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-align: right;
  margin-bottom: 6px;
  padding-right: 2px;
}

.cal-events-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 2px;
}

.event-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 44px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #00509d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.15s ease;
}

.event-item:hover .avatar-circle {
  transform: scale(1.06);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-name {
  font-size: 11px;
  color: #374151;
  font-weight: 500;
  margin-top: 5px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.circle-add {
  background-color: #ecfdf5;
  color: #10b981;
  border: 1px dashed #10b981;
}

.add-new-btn {
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease-in-out;
  transform: translateY(6px);
}

.cal-cell:hover .add-new-btn {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* ===== modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 520px;
  max-width: calc(100vw - 24px);
  border-radius: 12px;
  overflow: hidden;
  animation: fadeIn 0.18s ease;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
}

.modal-header {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.modal-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}

.btn-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #6b7280;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  padding: 14px 16px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-save {
  height: 38px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.14);
  color: white;
  border: none;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  min-height: 44px;
}

.tag-item {
  background-color: #eef2ff;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.remove-tag {
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
}

.remove-tag:hover {
  color: #ef4444;
}

.text-muted {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
  display: block;
}

.float-right {
  margin-left: auto;
  color: #10b981;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>