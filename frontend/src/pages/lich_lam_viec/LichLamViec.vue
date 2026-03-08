<!-- File: src/pages/lich_lam_viec/LichLamViec.vue -->
<template>
  <div class="lich-page">
    <div class="header-section">
      <h2 class="page-title">Quản Lý Lịch Làm Việc</h2>
    </div>

    <div class="card-box">
      <div class="toolbar-header">
        <div class="left">
          <h3><i class="fa-solid fa-sliders"></i> Tùy chọn</h3>
        </div>
      </div>

      <div class="toolbar-body column-layout">
        <div class="filters-bar">
          <div class="form-group row-layout">
            <label>Nhân viên <span class="req">*</span></label>

            <div class="combobox-wrapper">
              <input
                v-model="searchNv"
                type="text"
                class="form-control"
                placeholder="Tìm kiếm nhân viên..."
                @focus="showNvDropdown = true"
                @blur="handleBlurNv"
                @input="
                  showNvDropdown = true;
                  filterNv = null;
                "
              />
              <ul v-if="showNvDropdown" class="combobox-dropdown">
                <li
                  v-for="nv in filteredNhanVienList"
                  :key="nv.id"
                  @click="selectNhanVien(nv)"
                  :class="{ active: nv.id === form.idNhanVien }"
                >
                  <span class="fw-bold">{{ nv.tenNhanVien }}</span>
                  <small v-if="nv.maNhanVien"> - {{ nv.maNhanVien }}</small>
                </li>
                <li v-if="filteredNhanVienList.length === 0" class="no-result">
                  Không tìm thấy nhân viên
                </li>
              </ul>
            </div>
          </div>

          <div class="filter-group" v-if="viewMode === 'table'">
            <label>Ngày làm:</label>
            <input type="date" v-model="filterDate" class="form-control" />
          </div>
        </div>

        <button v-if="hasPermission" class="btn-add mt-10" @click="openModal(null)">
          <i class="fa-solid fa-plus"></i> Thêm mới lịch làm việc
        </button>
      </div>
    </div>

    <div class="card-box mt-20">
      <div class="toolbar-header">
        <h3><i class="fa-regular fa-file-excel"></i> Nhập Dữ Liệu Từ Excel</h3>
      </div>
      <div class="import-body">
        <p class="import-description">
          Nhập lịch làm việc từ file Excel. Chọn file chứa danh sách nhân viên, ca làm và ngày làm việc.
        </p>
        <div class="import-actions">
          <button class="btn-import" @click="openExcelModal" v-if="hasPermission">
            <i class="fa-solid fa-upload"></i> Import Excel
          </button>
        </div>
      </div>
    </div>

    <ImportExcelModal
      ref="excelModalRef"
      :listNhanVien="listNhanVien"
      :listCa="listCa"
      @close="closeExcelModal"
      @import-success="loadData"
    />

    <div class="card-box mt-20">
      <div class="table-header-row">
        <h3>
          <i
            :class="
              viewMode === 'table'
                ? 'fa-solid fa-table'
                : 'fa-solid fa-calendar'
            "
          ></i>
          {{
            viewMode === "table"
              ? "Danh Sách Lịch Làm Việc"
              : viewMode === "week"
              ? "Lịch Làm Việc Tuần"
              : "Lịch Làm Việc Tháng " + (currentMonth + 1)
          }}
        </h3>

        <div class="view-modes">
          <button class="mode-btn" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">
            <i class="fa-solid fa-table"></i> Bảng
          </button>
          <button
            class="mode-btn"
            :class="{ active: viewMode === 'calendar' || viewMode === 'week' }"
            @click="viewMode = 'week'"
          >
            <i class="fa-solid fa-calendar"></i> Lịch
          </button>
        </div>
      </div>

      <div v-if="viewMode === 'table'" class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>MÃ NHÂN VIÊN</th>
              <th>NHÂN VIÊN</th>
              <th>CA LÀM</th>
              <th>THỜI GIAN</th>
              <th>NGÀY LÀM</th>
              <th class="text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, index) in filterLichList" :key="l.id">
              <td>{{ index + 1 }}</td>
              <td>{{ l.maNhanVien }}</td>
              <td>{{ l.tenNhanVien }}</td>
              <td>{{ l.tenCa }}</td>
              <td>
                {{ formatTime(l.gioBatDau) }} - {{ formatTime(l.gioKetThuc) }}
              </td>
              <td>{{ formatDate(l.ngayLam) }}</td>
              <td class="text-right action-col">
                <button v-if="hasPermission" class="ss-icon-btn-view" @click="openModal(l)" title="Xem / Sửa">
                  <span class="material-icons-outlined">visibility</span>
                </button>

                <button v-if="hasPermission" class="ss-icon-btn-view" @click="deletePhanCong(l.id)" title="Xóa">
                  <span class="fa-solid fa-trash"></span>
                </button>
              </td>
            </tr>
            <tr v-if="filterLichList.length === 0">
              <td colspan="7" class="text-center">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="calendar-view">
        <div class="cal-navigation">
          <div class="nav-left">
            <button class="btn-nav" @click="changePeriod(-1)">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="cal-title">
              {{ viewMode === "week" ? "Tuần " : "Tháng " }}
              {{ currentMonth + 1 }} năm {{ currentYear }}
            </span>
            <button class="btn-nav" @click="changePeriod(1)">
              <i class="fa-solid fa-chevron-right"></i>
            </button>

            <button class="btn-nav" @click="goToday">Hôm nay</button>
          </div>

          <div class="nav-right">
            <div class="btn-toggle-group">
              <button class="btn-toggle" :class="{ active: viewMode === 'day' }" @click="viewMode = 'day'">
                Ngày
              </button>
              <button class="btn-toggle" :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">
                Tuần
              </button>
              <button
                class="btn-toggle"
                :class="{ active: viewMode === 'calendar' }"
                @click="viewMode = 'calendar'"
              >
                Tháng
              </button>
            </div>
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

        <div v-if="viewMode === 'calendar'" class="cal-grid-body">
          <div v-for="blank in startPadding" :key="'blank-' + blank" class="cal-cell disabled"></div>

          <div v-for="day in daysInMonth" :key="'day-' + day" class="cal-cell" :class="{ 'is-today': isToday(day) }">
            <div class="cal-date-num">{{ day }}</div>
            <div class="cal-events-container">
              <div v-for="nv in getEventsForDayGrouped(day)" :key="nv.id" class="event-item" @click="openModal(nv)">
                <div class="avatar-circle">
                  <img v-if="isImg(nv.nhanVien?.anhNhanVien)" :src="nv.nhanVien?.anhNhanVien" />
                  <span v-else class="initial">{{ getAvatarLabel(nv.tenNhanVien) }}</span>
                </div>
                <span class="event-name">{{ nv.nhanVien?.tenTaiKhoan }}</span>
              </div>
              <div
                v-if="hasPermission"
                class="event-item add-new-btn"
                @click.stop="openModalVoiNgay(day, currentMonth, currentYear)"
              >
                <div class="avatar-circle circle-add">
                  <i class="fa-solid fa-plus"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="viewMode === 'week'" class="cal-grid-body">
          <div
            v-for="wd in weekDays"
            :key="'week-day-' + wd.dateFull.getTime()"
            class="cal-cell"
            :class="{ 'is-today': isToday(wd.day) && currentMonth === wd.month }"
          >
            <div class="cal-date-num">{{ wd.day }}/{{ wd.month + 1 }}</div>

            <div class="cal-events-container">
              <div
                v-for="nv in getEventsForSpecificDayGrouped(wd.day, wd.month, wd.year)"
                :key="nv.id"
                class="event-item"
                @click="openModal(nv)"
              >
                <div class="avatar-circle">
                  <img v-if="isImg(nv.nhanVien?.anhNhanVien)" :src="nv.nhanVien?.anhNhanVien" />
                  <span v-else class="initial">{{ getAvatarLabel(nv.tenNhanVien) }}</span>
                </div>
                <span class="event-name">{{ nv.nhanVien?.tenTaiKhoan }}</span>
              </div>

              <div
                v-if="hasPermission"
                class="event-item add-new-btn"
                @click.stop="openModalVoiNgay(wd.day, wd.month, wd.year)"
              >
                <div class="avatar-circle circle-add">
                  <i class="fa-solid fa-plus"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="viewMode === 'day'" class="matrix-view day-matrix">
          <div class="matrix-header">
            <div class="matrix-cell-header shift-col">CA LÀM VIỆC</div>
            <div class="matrix-cell-header day-col flex-1" :class="{ 'is-today': isTodayDate(currentDate) }">
              <div class="day-name">{{ getDayName(currentDate) }}</div>
              <div class="day-date">{{ formatDateFull(currentDate) }}</div>
            </div>
          </div>

          <div class="matrix-body">
            <div v-for="ca in listCa" :key="ca.id" class="matrix-row">
              <div class="matrix-cell shift-col">
                <div class="shift-name">{{ ca.tenCa }}</div>
                <div class="shift-time">{{ formatTime(ca.gioBatDau) }} - {{ formatTime(ca.gioKetThuc) }}</div>
              </div>

              <div class="matrix-cell day-col flex-1" :class="{ 'is-today': isTodayDate(currentDate) }">
                <div
                  v-if="hasPermission && getEventsForShiftAndDate(ca.id, currentDate).length === 0"
                  class="add-full-btn"
                  @click="openModalVoiNgayCa(currentDate, ca.id)"
                >
                  + Bấm vào đây để thêm nhân viên vào ca này
                </div>
                <div v-else class="employee-cards row-dir">
                  <button
                    v-if="hasPermission"
                    class="btn-add-mini inline"
                    @click="openModalVoiNgayCa(currentDate, ca.id)"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <div
                    v-for="(nv, index) in getEventsForShiftAndDate(ca.id, currentDate)"
                    :key="nv.id"
                    class="employee-card large"
                    :class="['border-color-4']"
                    @click="openModal(nv)"
                  >
                    <div class="avatar-circle">
                      <img v-if="isImg(nv.nhanVien?.anhNhanVien)" :src="nv.nhanVien?.anhNhanVien" />
                      <span v-else class="initial">
                        {{ getAvatarLabel(nv.tenNhanVien || nv.nhanVien?.tenTaiKhoan) }}
                      </span>
                    </div>
                    <div class="emp-info">
                      <div class="emp-name">{{ nv.tenNhanVien || nv.nhanVien?.tenTaiKhoan }}</div>
                      <div class="emp-id">{{ nv.nhanVien?.maNhanVien || nv.maNhanVien }}</div>
                    </div>
                  </div>
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
          <h3>{{ isEditing ? "Cập Nhật Lịch Làm Việc" : "Thêm Mới Lịch" }}</h3>
          <button @click="closeModal" class="btn-close"></button>
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

              <div class="combobox-wrapper">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm và chọn nhiều nhân viên..."
                  v-model="searchNvModal"
                  @focus="showNvModalDropdown = true"
                  @blur="handleBlurNvModal"
                />

                <ul v-if="showNvModalDropdown" class="combobox-dropdown">
                  <li
                    v-for="nv in filteredNvModal"
                    :key="nv.id"
                    @click="selectNvMulti(nv)"
                    :class="{ active: isNvSelected(nv.id) }"
                  >
                    <span class="fw-bold">{{ nv.tenNhanVien }}</span>
                    <small> - {{ nv.maNhanVien }}</small>
                    <i v-if="isNvSelected(nv.id)" class="fa-solid fa-check float-right"></i>
                  </li>
                  <li v-if="filteredNvModal.length === 0" class="no-result">
                    Không tìm thấy
                  </li>
                </ul>
              </div>
              <small class="text-muted" v-if="selectedNhanViens.length > 0">
                Đã chọn {{ selectedNhanViens.length }} nhân viên
              </small>
            </div>

            <div v-else class="combobox-wrapper">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm tên hoặc mã nhân viên..."
                v-model="searchNvModal"
                @focus="showNvModalDropdown = true"
                @blur="handleBlurNvModal"
              />
              <ul v-if="showNvModalDropdown" class="combobox-dropdown">
                <li
                  v-for="nv in filteredNvModal"
                  :key="nv.id"
                  @click="selectNvSingle(nv)"
                  :class="{ active: nv.id === form.idNhanVien }"
                >
                  <span class="fw-bold">{{ nv.tenNhanVien }}</span>
                  <small> - {{ nv.maNhanVien }}</small>
                </li>
                <li v-if="filteredNvModal.length === 0" class="no-result">
                  Không tìm thấy
                </li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Ca làm việc <span class="req">*</span></label>

            <div class="selected-tags" v-if="selectedCas.length > 0">
              <div v-for="(ca, index) in selectedCas" :key="ca.id" class="tag-item">
                <span>{{ ca.tenCa }}</span>
                <i class="fa-solid fa-xmark remove-tag" @click="removeSelectedCa(index)"></i>
              </div>
            </div>

            <div class="combobox-wrapper">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm và chọn ca làm việc..."
                v-model="searchCaModal"
                @focus="showCaModalDropdown = true"
                @blur="handleBlurCaModal"
              />

              <ul v-if="showCaModalDropdown" class="combobox-dropdown">
                <li
                  v-for="ca in filteredCaModal"
                  :key="ca.id"
                  @click="selectCaMulti(ca)"
                  :class="{ active: isCaSelected(ca.id) }"
                >
                  <span class="fw-bold">{{ ca.tenCa }}</span>
                  <small> - ({{ formatTime(ca.gioBatDau) }} - {{ formatTime(ca.gioKetThuc) }})</small>
                  <i v-if="isCaSelected(ca.id)" class="fa-solid fa-check float-right"></i>
                </li>
                <li v-if="filteredCaModal.length === 0" class="no-result">Không tìm thấy</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Ngày làm <span class="req">*</span></label>
            <div class="input-with-icon">
              <input type="date" v-model="form.ngayLam" class="btn-date" />
            </div>
          </div>

          <div v-if="isEditing && form.danhSachCa && form.danhSachCa.length > 0" class="assigned-shifts-section">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-save" @click="handleSubmit">
            {{ isEditing ? "Lưu" : "Thêm mới" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import {
  createPhanCong,
  removePhanCong,
  getAllPhanCong,
} from "@/services/lich_lam_viec/lich_lam_viec_nhan_vienService";
import { getAllNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import { getAllCaLam } from "@/services/lich_lam_viec/ca_lamService";
import {
  createLich,
  checkLichLamViec,
} from "@/services/lich_lam_viec/lich_lam_viecService";
import ImportExcelModal from "./ImportExcelModal.vue";

const excelModalRef = ref(null);

const openExcelModal = () => {
  if (excelModalRef.value) {
    excelModalRef.value.openModal();
  }
};

const closeExcelModal = () => {};

const getUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const hasPermission = computed(() => {
  const u = getUser();
  const role = u?.role || u?.quyen || u?.vaiTro || u?.tenVaiTro;

  if (role === "NHAN_VIEN") {
    return false;
  }

  return true;
});

const lichNhanVienList = ref([]);
const listNhanVien = ref([]);
const listCa = ref([]);
const loading = ref(false);
const filterNv = ref(null);
const filterCaLam = ref(null);
const filterDate = ref(null);

const selectedNhanViens = ref([]);

const searchNv = ref("");
const showNvDropdown = ref(false);
const searchNvModal = ref("");
const showNvModalDropdown = ref(false);
const searchCaModal = ref("");
const showCaModalDropdown = ref(false);

const showModal = ref(false);
const isEditing = ref(false);
const currentId = ref(null);

const viewMode = ref("week");
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const currentDate = ref(new Date());

const editingItem = ref(null);
const selectedCas = ref([]);

const form = reactive({
  idLichLamViec: null,
  idNhanVien: null,
  idCaLam: null,
  ngayLam: "",
  ghiChu: "",
  nguoiTao: 1,
});

const getAvatarLabel = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const lastName = parts[parts.length - 1];
  return lastName.charAt(0).toUpperCase();
};

const isImg = (s) => {
  if (!s) return false;
  const v = String(s).trim();
  return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
};

const isNvSelected = (id) => {
  return selectedNhanViens.value.some((nv) => nv.id === id);
};

const selectNvMulti = (nv) => {
  if (!isNvSelected(nv.id)) {
    selectedNhanViens.value.push(nv);
  }
  searchNvModal.value = "";
};

const removeSelectedNv = (index) => {
  selectedNhanViens.value.splice(index, 1);
};

const selectNvSingle = (nv) => {
  form.idNhanVien = nv.id;
  searchNvModal.value = nv.tenNhanVien;
  showNvModalDropdown.value = false;
};

const isCaSelected = (id) => {
  return selectedCas.value.some((ca) => ca.id === id);
};

const selectCaMulti = (ca) => {
  if (!isCaSelected(ca.id)) {
    selectedCas.value.push(ca);
  }
  searchCaModal.value = "";
  showCaModalDropdown.value = false;
};

const removeSelectedCa = (index) => {
  selectedCas.value.splice(index, 1);
};

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const startPadding = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

const goToday = () => {
  currentDate.value = new Date();
  currentMonth.value = currentDate.value.getMonth();
  currentYear.value = currentDate.value.getFullYear();
};

const isToday = (day) => {
  const now = new Date();
  return (
    day === now.getDate() &&
    currentMonth.value === now.getMonth() &&
    currentYear.value === now.getFullYear()
  );
};

const formatDateFull = (d) => {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const dStr = day < 10 ? `0${day}` : day;
  const mStr = month < 10 ? `0${month}` : month;
  return `${dStr}/${mStr}/${year}`;
};

const isTodayDate = (d) => {
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};

const getDayName = (d) => {
  const dayIndex = d.getDay();
  return dayIndex === 0 ? "CN" : `T${dayIndex + 1}`;
};

const getEventsForShiftAndDate = (idCa, d) => {
  if (!lichNhanVienList.value || lichNhanVienList.value.length === 0) return [];

  const year = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dateString = `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return lichNhanVienList.value.filter((l) => {
    let shiftId = null;

    if (l.lichLamViec && l.lichLamViec.idCaLam) {
      shiftId = typeof l.lichLamViec.idCaLam === "object" ? l.lichLamViec.idCaLam.id : l.lichLamViec.idCaLam;
    } else {
      shiftId = l.idCaLam;
    }

    if (String(shiftId) !== String(idCa)) return false;

    if (typeof l.ngayLam === "string") {
      return l.ngayLam.startsWith(dateString);
    }

    if (Array.isArray(l.ngayLam)) {
      return l.ngayLam[0] === year && l.ngayLam[1] === m && l.ngayLam[2] === day;
    }

    return false;
  });
};

const openModalVoiNgayCa = (dateObj, idCa) => {
  isEditing.value = false;
  editingItem.value = null;
  currentId.value = null;
  form.idLichLamViec = null;
  form.idNhanVien = null;
  form.idCaLam = idCa;
  form.ghiChu = "";
  selectedNhanViens.value = [];
  searchNvModal.value = "";

  const ca = listCa.value.find((c) => c.id === idCa);
  selectedCas.value = ca ? [ca] : [];
  searchCaModal.value = ca ? `${ca.tenCa} (${formatTime(ca.gioBatDau)} - ${formatTime(ca.gioKetThuc)})` : "";

  const year = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const mStr = m < 10 ? `0${m}` : m;
  const dStr = day < 10 ? `0${day}` : day;
  form.ngayLam = `${year}-${mStr}-${dStr}`;

  showModal.value = true;
};

const weekDays = computed(() => {
  const days = [];
  const startOfWeek = new Date(currentDate.value);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push({
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      dateFull: d,
    });
  }
  return days;
});

const changePeriod = (step) => {
  if (viewMode.value === "calendar") {
    const newMonth = currentMonth.value + step;
    if (newMonth > 11) {
      currentMonth.value = 0;
      currentYear.value++;
    } else if (newMonth < 0) {
      currentMonth.value = 11;
      currentYear.value--;
    } else {
      currentMonth.value = newMonth;
    }
    currentDate.value = new Date(currentYear.value, currentMonth.value, 1);
  } else if (viewMode.value === "week") {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() + step * 7);
    currentDate.value = newDate;
    currentMonth.value = newDate.getMonth();
    currentYear.value = newDate.getFullYear();
  } else if (viewMode.value === "day") {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() + step);
    currentDate.value = newDate;
    currentMonth.value = newDate.getMonth();
    currentYear.value = newDate.getFullYear();
  }
};

const getEventsForSpecificDay = (day, month, year) => {
  if (!lichNhanVienList.value) return [];

  const m = month + 1;
  const mStr = m < 10 ? `0${m}` : m;
  const dStr = day < 10 ? `0${day}` : day;
  const dateString = `${year}-${mStr}-${dStr}`;

  return filterLichList.value.filter((l) => {
    if (Array.isArray(l.ngayLam)) {
      return l.ngayLam[0] === year && l.ngayLam[1] === m && l.ngayLam[2] === day;
    }
    return l.ngayLam === dateString;
  });
};

const getEventsForSpecificDayGrouped = (day, month, year) => {
  const events = getEventsForSpecificDay(day, month, year);
  return groupShiftsByNhanVien(events);
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
    if (typeof l.ngayLam === "string") {
      return l.ngayLam === dateString;
    }
    return false;
  });
};

const getEventsForDayGrouped = (day) => {
  const events = getEventsForDay(day);
  return groupShiftsByNhanVien(events);
};

const groupShiftsByNhanVien = (events) => {
  const grouped = {};

  events.forEach((item) => {
    const nvId = item.nhanVien?.id;
    if (!grouped[nvId]) {
      grouped[nvId] = {
        ...item,
        danhSachCa: [],
      };
    }

    grouped[nvId].danhSachCa.push({
      idPhanCong: item.id,
      idCa: item.idCaLam || item.caLam?.id,
      tenCa: item.tenCa || item.caLam?.tenCa,
      gioBatDau: item.gioBatDau,
      gioKetThuc: item.gioKetThuc,
    });
  });

  return Object.values(grouped);
};

const filteredNhanVienList = computed(() => {
  if (!searchNv.value) return listNhanVien.value;

  return listNhanVien.value.filter((nv) => {
    const nhanVienSearch =
      !searchNv.value ||
      (nv.tenNhanVien || "").toLowerCase().includes(searchNv.value.toLowerCase()) ||
      ((nv.maNhanVien || "").toLowerCase().includes(searchNv.value.toLowerCase()));

    const koPhaiAdmin = nv.idQuyenHan !== 1;
    return nhanVienSearch && koPhaiAdmin;
  });
});

const filteredNvModal = computed(() => {
  const q = searchNvModal.value.toLowerCase();

  return listNhanVien.value.filter((nv) => {
    const nhanVienSearch =
      (nv.tenNhanVien || "").toLowerCase().includes(q) ||
      (nv.maNhanVien || "").toLowerCase().includes(q);

    const koPhaiAdmin = nv.idQuyenHan !== 1;
    return nhanVienSearch && koPhaiAdmin;
  });
});

const filteredCaModal = computed(() => {
  const q = searchCaModal.value.toLowerCase();

  return listCa.value.filter((ca) => {
    const matchesSearch = (ca.tenCa || "").toLowerCase().includes(q);
    const notSelected = !isCaSelected(ca.id);
    return matchesSearch && notSelected;
  });
});

const selectNhanVien = (nv) => {
  filterNv.value = nv.id;
  searchNv.value = nv.tenNhanVien;
  showNvDropdown.value = false;
};

const handleBlurNvModal = () => setTimeout(() => (showNvModalDropdown.value = false), 200);
const handleBlurCaModal = () => setTimeout(() => (showCaModalDropdown.value = false), 200);

const handleBlurNv = () => {
  setTimeout(() => {
    showNvDropdown.value = false;
  }, 200);
};

const formatTime = (arr) => {
  if (Array.isArray(arr)) return `${arr[0]}:${arr[1] < 10 ? "0" + arr[1] : arr[1]}`;
  if (typeof arr === "string") return arr.substring(0, 5);
  return "";
};

const formatDate = (arr) => {
  if (Array.isArray(arr)) return `${arr[2]}/${arr[1]}/${arr[0]}`;
  return arr;
};

const convertArrayDateToString = (arrDate) => {
  if (Array.isArray(arrDate)) {
    const y = arrDate[0];
    const m = arrDate[1] < 10 ? "0" + arrDate[1] : arrDate[1];
    const d = arrDate[2] < 10 ? "0" + arrDate[2] : arrDate[2];
    return `${y}-${m}-${d}`;
  }
  return arrDate;
};

const openModalVoiNgay = (day, month = null, year = null) => {
  isEditing.value = false;
  editingItem.value = null;
  currentId.value = null;
  form.idLichLamViec = null;
  form.idNhanVien = null;
  form.idCaLam = null;
  form.ghiChu = "";
  selectedNhanViens.value = [];
  selectedCas.value = [];
  searchNvModal.value = "";
  searchCaModal.value = "";

  const targetYear = year !== null ? year : currentYear.value;
  const targetMonth = month !== null ? month : currentMonth.value;

  const m = targetMonth + 1;
  const mStr = m < 10 ? `0${m}` : m;
  const dStr = day < 10 ? `0${day}` : day;
  form.ngayLam = `${targetYear}-${mStr}-${dStr}`;

  showModal.value = true;
};

const openModal = (item) => {
  if (item) {
    isEditing.value = true;
    editingItem.value = item;
    currentId.value = item.id;
    form.idNhanVien = item.nhanVien?.id;
    form.ngayLam = convertArrayDateToString(item.ngayLam);

    if (item.danhSachCa) {
      const uniqueCas = {};
      (item.danhSachCa || []).forEach((ca) => {
        const caId = ca.idCa || ca.id;
        if (!uniqueCas[caId]) {
          uniqueCas[caId] = {
            id: caId,
            tenCa: ca.tenCa,
          };
        }
      });
      selectedCas.value = Object.values(uniqueCas);
    } else {
      selectedCas.value = [
        {
          id: item.idCaLam || item.caLam?.id,
          tenCa: item.tenCa || item.caLam?.tenCa,
        },
      ];
    }

    const nv = listNhanVien.value.find((n) => n.id === form.idNhanVien);
    searchNvModal.value = nv ? nv.tenNhanVien : "";
    searchCaModal.value = "";
  } else {
    isEditing.value = false;
    editingItem.value = null;
    currentId.value = null;
    form.idLichLamViec = null;
    form.idNhanVien = null;
    form.idCaLam = null;
    form.ghiChu = "";
    form.ngayLam = new Date().toISOString().split("T")[0];
    selectedNhanViens.value = [];
    selectedCas.value = [];
    searchNvModal.value = "";
    searchCaModal.value = "";
  }

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingItem.value = null;
  currentId.value = null;
  selectedNhanViens.value = [];
  selectedCas.value = [];
  searchNvModal.value = "";
  searchCaModal.value = "";
};

const handleSubmit = async () => {
  if (!form.ngayLam) {
    alert("Vui lòng chọn ngày làm việc!");
    return;
  }

  if (selectedCas.value.length === 0) {
    alert("Vui lòng chọn ít nhất một ca làm việc!");
    return;
  }

  if (!isEditing.value && selectedNhanViens.value.length === 0) {
    alert("Vui lòng chọn ít nhất một nhân viên!");
    return;
  }

  try {
    loading.value = true;
    const currentUser = getUser();
    const idNguoiTao = currentUser?.id || 1;

    if (isEditing.value && editingItem.value) {
      let oldPhanCongIds = [];

      if (editingItem.value.danhSachCa) {
        oldPhanCongIds = editingItem.value.danhSachCa.map((ca) => ca.idPhanCong).filter((id) => id);
      } else {
        oldPhanCongIds = [editingItem.value.id].filter((id) => id);
      }

      for (const id of oldPhanCongIds) {
        try {
          await removePhanCong(id);
        } catch (e) {
          console.error("Failed to remove old assignment", id, e);
        }
      }
    }

    const targetNvs = isEditing.value ? [{ id: form.idNhanVien }] : selectedNhanViens.value;

    for (const ca of selectedCas.value) {
      const existingLich = await checkLichLamViec({
        idCaLam: ca.id,
        ngayLam: form.ngayLam,
      });

      let idLichHienTai = null;

      if (existingLich && (Array.isArray(existingLich) ? existingLich.length > 0 : existingLich.id)) {
        idLichHienTai = Array.isArray(existingLich) ? existingLich[0].id : existingLich.id;
      } else {
        const resLich = await createLich({
          idCaLam: ca.id,
          ngayLam: form.ngayLam,
          ghiChu: "",
          nguoiTao: idNguoiTao,
        });

        idLichHienTai =
          resLich?.data?.id ||
          resLich?.id ||
          (Array.isArray(resLich) ? resLich[0]?.id : null);
      }

      if (idLichHienTai) {
        const phanCongPromises = targetNvs.map((nv) =>
          createPhanCong({
            idLichLamViec: idLichHienTai,
            idNhanVien: nv.id,
            nguoiTao: idNguoiTao,
          }),
        );

        await Promise.all(phanCongPromises);
      }
    }

    alert(
      isEditing.value
        ? "Cập nhật lịch làm việc thành công!"
        : `Đã phân công thành công cho ${targetNvs.length} nhân viên vào ${selectedCas.value.length} ca.`,
    );

    closeModal();
    await loadData();
  } catch (error) {
    console.error("Lỗi khi lưu lịch làm việc:", error);
    alert("Có lỗi xảy ra: " + (error?.message || "Không thể lưu dữ liệu"));
  } finally {
    loading.value = false;
  }
};

const loadData = async () => {
  try {
    const res = await getAllPhanCong();
    const data = Array.isArray(res) ? res : res.content || [];
    lichNhanVienList.value = data;
    console.log("Dữ liệu 1 bản ghi mẫu:", data[0]);
  } catch (e) {
    console.error(e);
  }
};

const loadthemLich = async () => {
  const nv = await getAllNhanVien();
  const ca = await getAllCaLam();
  listNhanVien.value = Array.isArray(nv) ? nv : [];
  listCa.value = Array.isArray(ca) ? ca : [];
  await loadData();
};

const filterLichList = computed(() => {
  let data = [...lichNhanVienList.value];

  if (filterNv.value) {
    data = data.filter((item) => item.nhanVien?.id === Number(filterNv.value));
  }

  if (filterDate.value) {
    data = data.filter((l) => convertArrayDateToString(l.ngayLam) === filterDate.value);
  }

  return data;
});

const deletePhanCong = async (id) => {
  const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa phân công này không?");
  if (!confirmDelete) return;

  try {
    await removePhanCong(id);
    alert("Xóa phân công thành công!");
    await loadData();
  } catch (e) {
    alert("Xóa phân công thất bại: " + (e?.message || "Có lỗi xảy ra"));
  }
};

onMounted(() => {
  loadthemLich();
});
</script>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.lich-page {
  font-family: var(--admin-font, sans-serif);
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 30px;
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.92);
}

.card-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.mt-20 {
  margin-top: 20px;
}

.toolbar-header h3,
.table-header-row h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-body {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.btn-add {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-date {
  width: 100%;
  height: 38px;
  border: 1px solid #e5e7eb;
  background-color: white;
  color: #000;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.filters-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.78);
  font-weight: 600;
  white-space: nowrap;
}

.import-body {
  margin-top: 15px;
  background: #f9fafb;
  padding: 20px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.import-description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.import-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-import,
.btn-download {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-import {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  box-shadow: 0 4px 6px rgba(255, 77, 79, 0.2);
  color: white;
}

.btn-download {
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-download:hover {
  background: #eff6ff;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-modes {
  display: flex;
  gap: 5px;
}

.action-col {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ss-icon-btn-view:hover {
  background: #e0f2fe;
}

.mode-btn {
  border: 1px solid #e5e7eb;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  background: #f9fafb;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
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
  box-shadow: 0 4px 6px rgba(255, 77, 79, 0.2);
  color: white;
  border-color: transparent;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  text-align: left;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  text-transform: uppercase;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #111827;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.calendar-view {
  margin-top: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.cal-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 10px;
  text-transform: capitalize;
}

.btn-nav {
  border: 1px solid #d1d5db;
  color: #000;
  background: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-nav:hover {
  background: #f3f4f6;
}

.btn-nav.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

.btn-toggle-group {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
}

.btn-toggle {
  padding: 5px 12px;
  background: white;
  border: none;
  border-right: 1px solid #d1d5db;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.btn-toggle:last-child {
  border-right: none;
}

.btn-toggle.active {
  background: #111827;
  font-weight: 500;
  color: white;
}

.cal-grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.cal-day-name {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: #1e40af;
  border-right: 1px solid #e5e7eb;
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
  min-height: 120px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 5px;
  position: relative;
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
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-align: right;
  margin-bottom: 5px;
  padding-right: 5px;
}

.cal-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banglich-chip {
  background: #0ea5e9;
  color: white;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 2px;
  transition: all 0.2s;
}

.banglich-chip:hover {
  background: #0284c7;
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 500px;
  border-radius: 8px;
  overflow: hidden;
  animation: fadeIn 0.2s;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  font-size: 15px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.req {
  color: red;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #f3f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.combobox-wrapper {
  position: relative;
}

.combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1050;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  padding: 0;
  list-style: none;
}

.combobox-dropdown li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.combobox-dropdown li:last-child {
  border-bottom: none;
}

.combobox-dropdown li:hover {
  background-color: #f3f4f6;
}

.combobox-dropdown li.active {
  background-color: #e0f2fe;
  color: #0369a1;
  font-weight: 600;
}

.combobox-dropdown .no-result {
  padding: 10px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
  cursor: default;
}

.column-layout {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mt-10 {
  margin-top: 10px;
}

.fw-bold {
  font-weight: 600;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  min-height: 40px;
}

.tag-item {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: fadeIn 0.2s;
}

.remove-tag {
  cursor: pointer;
  font-size: 14px;
  color: #0284c7;
}

.remove-tag:hover {
  color: #ef4444;
}

.text-muted {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}

.float-right {
  float: right;
  color: #10b981;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, 0.04);
  color: rgba(17, 24, 39, 0.78);
  font-weight: 500;
  font-size: 13px;
}

.btn-quick-add {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: #ecfdf5;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.btn-quick-add:hover {
  background-color: #d1fae5;
  transform: scale(1.1);
}

.btn-quick-add i {
  font-size: 14px;
}

.cal-events-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
}

.event-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 40px;
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
  font-weight: 600;
  font-size: 14px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.event-item:hover .avatar-circle {
  transform: scale(1.1);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-name {
  font-size: 11px;
  color: #374151;
  font-weight: 600;
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.circle-add {
  background-color: #ecfdf5;
  color: #ff4d4f;
  border: 1px dashed #ff4d4f;
}

.add-new-btn:hover .circle-add {
  background-color: #ff4d4f;
  color: white;
}

.cal-cell {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100px;
}

.event-item.add-new-btn {
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease-in-out;
  transform: translateY(5px);
}

.cal-cell:hover .event-item.add-new-btn {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.matrix-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: none;
  overflow-x: auto;
  background: white;
}

.matrix-header {
  display: flex;
  background: #fcfcfc;
  border-bottom: 1px solid #e5e7eb;
}

.matrix-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.matrix-row:last-child {
  border-bottom: none;
}

.matrix-cell-header {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.matrix-cell {
  padding: 8px;
  border-right: 1px solid #e5e7eb;
  position: relative;
  min-height: 100px;
}

.matrix-cell-header:last-child,
.matrix-cell:last-child {
  border-right: none;
}

.shift-col {
  width: 150px;
  min-width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: #fff;
}

.matrix-cell-header.shift-col {
  justify-content: center;
  align-items: center;
  background: #f9fafb;
}

.day-col {
  flex: 1;
  min-width: 130px;
}

.day-name {
  font-size: 14px;
  font-weight: bold;
}

.day-date {
  font-size: 12px;
  color: #6b7280;
}

.is-today {
  background-color: #fdf8f6 !important;
}

.row-layout {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-layout label {
  margin-bottom: 0;
  white-space: nowrap;
  min-width: 90px;
}

.shift-name {
  font-weight: 600;
  font-size: 13px;
  color: #111827;
  text-align: center;
  margin-top: 10px;
}

.shift-time {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  text-align: center;
}

.btn-add-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #78350f;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-add-mini:hover {
  background: #92400e;
}

.employee-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}

.employee-card {
  border: 1px solid #e5e7eb;
  border-left: 3px solid #ef4444;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.employee-card.large {
  flex-direction: row;
  padding: 10px 16px;
  gap: 15px;
  width: fit-content;
}

.employee-cards.row-dir {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0;
  padding-left: 0;
}

.btn-add-mini.inline {
  position: static;
  margin-right: 10px;
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.avatar-circle.small {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.add-full-btn {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 80px;
  border: 1px dashed transparent;
  transition: all 0.2s;
}

.add-full-btn:hover {
  color: #4b5563;
  border-color: #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
}

.flex-1 {
  flex: 1;
}

.border-color-0 {
  border-left-color: #ef4444 !important;
}

.border-color-1 {
  border-left-color: #10b981 !important;
}

.border-color-2 {
  border-left-color: #3b82f6 !important;
}

.border-color-3 {
  border-left-color: #f59e0b !important;
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