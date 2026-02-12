<!-- File: src/pages/product/thuoc_tinh/PhongCachChoiPage.vue -->
<template>
  <div class="ss-page ss-font">
    <!-- HEAD (nhỏ + chữ thường + không đậm) + tổng số ngoài bộ lọc -->
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Quản lý Sản Phẩm/ Phong Cách Chơi</div>
      </div>

      <div class="ss-head-right">
        <div class="ss-count">
          Tổng số phong cách chơi: <span>{{ totalCount }}</span>
        </div>
      </div>
    </div>

    <!-- FILTER (tách khỏi list, không dính) -->
    <div class="ss-card ss-border ss-filter-card">
      <div class="ss-filter-head">
        <span class="material-icons-outlined ss-filter-icon">filter_alt</span>
        <div class="ss-filter-title">Bộ Lọc Tìm Kiếm</div>
      </div>

      <div class="ss-filter-body">
        <div class="ss-filter-left">
          <div class="ss-filter-label">Tìm kiếm phong cách chơi</div>
          <div class="ss-search-wrap">
            <span class="material-icons-outlined ss-search-icon">search</span>
            <input v-model="keyword" class="form-control ss-search-input" placeholder="Tìm kiếm..." />
          </div>
        </div>

        <div class="ss-filter-actions">
          <button class="btn ss-btn-lite" type="button" @click="exportExcel">
            <span class="material-icons-outlined ss-btn-ic">description</span>
            Tải Excel
          </button>

          <button class="btn ss-btn-primary" type="button" @click="openCreate">
            <span class="material-icons-outlined ss-btn-ic">add</span>
            Thêm phong cách
          </button>

          <button class="btn ss-btn-dark" type="button" @click="resetFilters">
            <span class="material-icons-outlined ss-btn-ic">restart_alt</span>
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    </div>

    <!-- LIST (tách riêng, có khoảng cách rõ) -->
    <div class="ss-card ss-border ss-list-card">
      <div class="ss-list-head">Danh sách phong cách chơi</div>

      <div class="table-responsive">
        <table class="table ss-table mb-0">
          <thead>
            <tr>
              <th class="col-stt">STT</th>
              <th class="col-ma">Mã</th>
              <th class="col-ten">Tên phong cách</th>
              <th class="col-tt text-center">Trạng thái</th>
              <th class="col-action text-center">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="!loading && pagedItems.length">
            <tr v-for="(row, idx) in pagedItems" :key="getId(row) ?? idx">
              <td class="ss-td col-stt">{{ (page - 1) * pageSize + idx + 1 }}</td>

              <td class="ss-td ss-td-strong col-ma">{{ getMa(row) }}</td>

              <td class="ss-td col-ten" :title="getTen(row)">{{ getTen(row) }}</td>

              <td class="text-center col-tt">
                <span class="ss-badge" :class="getTrangThai(row) ? 'ss-badge-on' : 'ss-badge-off'">
                  {{ getTrangThai(row) ? "Đang hoạt động" : "Ngừng hoạt động" }}
                </span>
              </td>

              <td class="text-center col-action">
                <div class="ss-actions-inline">
                  <button
                    class="ss-switch"
                    type="button"
                    :class="{ on: getTrangThai(row) }"
                    :disabled="togglingId === (getId(row) ?? -1)"
                    @click="onToggle(row)"
                    :title="getTrangThai(row) ? 'Tắt hoạt động' : 'Bật hoạt động'"
                    role="switch"
                    :aria-checked="getTrangThai(row)"
                  >
                    <span class="ss-switch-knob"></span>
                  </button>

                  <button class="ss-icon-btn-view" type="button" @click="onView(row)" title="Xem">
                    <span class="material-icons-outlined">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="loading">
            <tr><td colspan="5" class="text-center py-4 ss-muted">Đang tải...</td></tr>
          </tbody>

          <tbody v-else>
            <tr><td colspan="5" class="text-center py-4 ss-muted">Không có dữ liệu</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION (ngoài danh sách) -->
    <div class="ss-pagination-bar">
      <div class="ss-pagination">
        <button class="ss-pagebtn" :disabled="page <= 1" @click="page--" title="Trang trước">‹</button>

        <button
          v-for="p in pageButtons"
          :key="`p-${p}`"
          class="ss-pagebtn"
          :class="{ active: p === page }"
          :disabled="p === '...'"
          @click="goPage(p)"
        >
          {{ p }}
        </button>

        <button class="ss-pagebtn" :disabled="page >= totalPages" @click="page++" title="Trang sau">›</button>
      </div>

      <div class="ss-pageinfo">
        Trang <span>{{ page }}</span> / <span>{{ totalPages }}</span>
      </div>
    </div>

    <!-- Modal create -->
    <div v-if="modal.open" class="ss-overlay">
      <div class="ss-modal">
        <div class="ss-modal-header">
          <div class="ss-modal-title">Thêm phong cách chơi</div>
          <button class="btn btn-sm btn-outline-secondary" @click="closeModal">X</button>
        </div>

        <div class="ss-modal-body">
          <label class="form-label ss-label">Tên phong cách *</label>
          <input v-model="form.tenPhongCach" class="form-control" placeholder="Nhập tên..." />
        </div>

        <div class="ss-modal-footer">
          <button class="btn ss-btn-lite" @click="closeModal">Hủy</button>
          <button class="btn ss-btn-primary" :disabled="saving" @click="save">
            {{ saving ? "Đang lưu..." : "Lưu" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success -->
    <div v-if="success.open" class="ss-overlay">
      <div class="ss-success">
        <div class="ss-success-ring"></div>
        <div class="ss-success-title">Thành công</div>
        <div class="ss-muted">Thêm phong cách chơi thành công!</div>
        <button class="btn ss-btn-primary mt-3 px-4" @click="success.open = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import phongCachChoiService from "@/services/thuoc_tinh/phongCachChoiService.js";

const loading = ref(false);
const saving = ref(false);

const items = ref([]);
const keyword = ref("");

const page = ref(1);
const pageSize = ref(10);

const togglingId = ref(-999);

function getId(row) {
  return (
    row?.id ??
    row?.idPhongCach ??
    row?.id_phong_cach ??
    row?.phongCachId ??
    row?.phong_cach_id ??
    null
  );
}
function getMa(x) {
  return x?.ma_phong_cach ?? x?.maPhongCach ?? x?.ma ?? "--";
}
function getTen(x) {
  return x?.ten_phong_cach ?? x?.tenPhongCach ?? x?.ten ?? "";
}
function getTrangThai(row) {
  const v = row?.trangThai ?? row?.trang_thai ?? row?.status ?? row?.trangthai;
  if (v === 0 || v === "0" || String(v).toLowerCase() === "false") return false;
  return v === false ? false : true;
}

function unwrapList(res) {
  if (Array.isArray(res)) return res;
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  return [];
}

async function fetchAll() {
  loading.value = true;
  try {
    const res =
      typeof phongCachChoiService.getAll === "function"
        ? await phongCachChoiService.getAll()
        : await phongCachChoiService.all?.();
    items.value = unwrapList(res);
  } catch (e) {
    console.error(e);
    alert("Không tải được danh sách phong cách chơi.");
  } finally {
    loading.value = false;
  }
}

const totalCount = computed(() => (items.value || []).length);

const filteredItems = computed(() => {
  const kw = (keyword.value || "").trim().toLowerCase();
  if (!kw) return items.value || [];
  return (items.value || []).filter((x) => {
    const ten = String(getTen(x) || "").toLowerCase();
    const ma = String(getMa(x) || "").toLowerCase();
    return ten.includes(kw) || ma.includes(kw);
  });
});

watch(keyword, () => (page.value = 1));

const totalPages = computed(() =>
  Math.max(1, Math.ceil((filteredItems.value.length || 0) / pageSize.value))
);

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});

watch(
  () => filteredItems.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  }
);

const pageButtons = computed(() => {
  const tp = totalPages.value;
  const p = page.value;

  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

  const arr = [];
  const push = (x) => arr.push(x);

  push(1);
  if (p > 3) push("...");

  const start = Math.max(2, p - 1);
  const end = Math.min(tp - 1, p + 1);
  for (let i = start; i <= end; i++) push(i);

  if (p < tp - 2) push("...");
  push(tp);

  return arr;
});

function goPage(p) {
  if (p === "..." || typeof p !== "number") return;
  page.value = p;
}

function resetFilters() {
  keyword.value = "";
  page.value = 1;
}

function onView(row) {
  alert(
    `Mã: ${getMa(row)}\nTên: ${getTen(row)}\nTrạng thái: ${getTrangThai(row) ? "Đang hoạt động" : "Ngừng hoạt động"}`
  );
}

/**
 * ✅ FIX: BE hay validate tên NOT NULL khi update,
 * nên đổi trạng thái phải gửi kèm tên hiện tại.
 */
async function callUpdateTrangThai(service, id, nextVal, row) {
  const ten = (getTen(row) || "").trim();

  if (typeof service.toggleStatus === "function") {
    try {
      return await service.toggleStatus(id, nextVal);
    } catch (_) {
      return await service.toggleStatus(id);
    }
  }
  if (typeof service.updateTrangThai === "function") {
    try {
      return await service.updateTrangThai(id, nextVal);
    } catch (_) {
      return await service.updateTrangThai(id, { trangThai: nextVal });
    }
  }
  if (typeof service.updateStatus === "function") {
    try {
      return await service.updateStatus(id, nextVal);
    } catch (_) {
      return await service.updateStatus(id, { trangThai: nextVal });
    }
  }

  // fallback PUT/UPDATE: gửi kèm tên để BE không reject
  if (typeof service.update === "function") {
    try {
      return await service.update(id, { tenPhongCach: ten, trangThai: nextVal });
    } catch (_) {
      return await service.update(id, { ten_phong_cach: ten, trang_thai: nextVal });
    }
  }
  if (typeof service.put === "function") {
    try {
      return await service.put(id, { tenPhongCach: ten, trangThai: nextVal });
    } catch (_) {
      return await service.put(id, { ten_phong_cach: ten, trang_thai: nextVal });
    }
  }

  throw new Error("Service chưa có hàm đổi trạng thái");
}

async function onToggle(row) {
  const id = getId(row);
  if (id === undefined || id === null) {
    alert("Không tìm thấy ID để đổi trạng thái (check API trả về id).");
    return;
  }
  if (togglingId.value !== -999) return;

  const nextVal = !getTrangThai(row);
  const oldVal = getTrangThai(row);

  row.trangThai = nextVal;
  row.trang_thai = nextVal;
  togglingId.value = id;

  try {
    await callUpdateTrangThai(phongCachChoiService, id, nextVal, row);
    await fetchAll();
  } catch (e) {
    console.error(e);
    row.trangThai = oldVal;
    row.trang_thai = oldVal;
    alert("Không đổi được trạng thái. Kiểm tra API/Service.");
  } finally {
    togglingId.value = -999;
  }
}

const modal = reactive({ open: false });
const success = reactive({ open: false });
const form = reactive({ tenPhongCach: "" });

function openCreate() {
  form.tenPhongCach = "";
  modal.open = true;
}
function closeModal() {
  modal.open = false;
}

async function save() {
  const ten = (form.tenPhongCach || "").trim();
  if (!ten) return alert("Vui lòng nhập tên phong cách.");

  const ok = confirm(`Bạn có chắc chắn muốn thêm phong cách: "${ten}" không?`);
  if (!ok) return;

  saving.value = true;
  try {
    try {
      await (phongCachChoiService.create?.({ tenPhongCach: ten, trangThai: true, xoaMem: false }) ??
        phongCachChoiService.add?.({ tenPhongCach: ten, trangThai: true, xoaMem: false }));
    } catch (_) {
      await (phongCachChoiService.create?.({ ten_phong_cach: ten, trang_thai: true, xoa_mem: false }) ??
        phongCachChoiService.add?.({ ten_phong_cach: ten, trang_thai: true, xoa_mem: false }));
    }

    modal.open = false;
    success.open = true;
    await fetchAll();
  } catch (e) {
    console.error(e);
    alert("Thêm thất bại. Kiểm tra BE/log.");
  } finally {
    saving.value = false;
  }
}

/**
 * "Tải Excel": xuất CSV UTF-8 BOM để mở bằng Excel.
 */
function exportExcel() {
  const rows = filteredItems.value || [];
  const header = ["STT", "Mã", "Tên phong cách", "Trạng thái"];
  const lines = [header];

  rows.forEach((r, i) => {
    lines.push([
      String(i + 1),
      String(getMa(r) ?? ""),
      String(getTen(r) ?? ""),
      getTrangThai(r) ? "Đang hoạt động" : "Ngừng hoạt động",
    ]);
  });

  const csv = lines
    .map((arr) =>
      arr
        .map((cell) => {
          const s = String(cell ?? "");
          const escaped = s.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `phong_cach_choi_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

onMounted(fetchAll);
</script>

<style scoped>
/* Font đồng bộ, chữ bình thường */
.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

/* HEAD */
.ss-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 16px;
}
.ss-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: rgba(17, 24, 39, 0.9);
  text-transform: none;
}
.ss-count {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-count span {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 600;
}

/* Cards */
.ss-card {
  background: #fff;
  border-radius: 14px;
}
.ss-border {
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06);
}

/* FILTER card - tách khỏi list */
.ss-filter-card {
  padding: 14px 16px;
  margin-bottom: 18px;
}
.ss-filter-head {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.ss-filter-icon {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.65);
}
.ss-filter-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.82);
}
.ss-filter-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}
.ss-filter-left {
  min-width: 320px;
  flex: 1;
}
.ss-filter-label {
  font-size: 12px;
  margin-bottom: 6px;
  color: rgba(17, 24, 39, 0.55);
  font-weight: 400;
}

/* Search */
.ss-search-wrap {
  position: relative;
  width: min(520px, 100%);
}
.ss-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(17, 24, 39, 0.45);
  pointer-events: none;
}
.ss-search-input {
  padding-left: 38px !important;
  height: 40px;
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
}

/* Buttons - nhỏ lại */
.ss-filter-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-btn-ic {
  font-size: 18px;
  margin-right: 8px;
}
.btn {
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* Tải Excel - nhạt */
.ss-btn-lite {
  background: #f3f4f6 !important;
  color: rgba(17, 24, 39, 0.88) !important;
  border: 1px solid rgba(17, 24, 39, 0.10) !important;
}
.ss-btn-lite:hover {
  background: #eef0f3 !important;
}

/* Thêm phong cách - gradient logo */
.ss-btn-primary {
  border: none !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.16);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

/* Đặt lại - đậm xám */
.ss-btn-dark {
  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;
}
.ss-btn-dark:hover {
  filter: brightness(0.98);
}

/* LIST card */
.ss-list-card {
  padding: 0;
}
.ss-list-head {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.82);
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

/* Table */
.ss-table {
  width: 100%;
  table-layout: fixed;
}
.ss-table thead th {
  font-size: 13px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.75);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.ss-table td,
.ss-table th {
  padding: 12px 14px;
  vertical-align: middle;
}
.ss-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

/* columns */
.col-stt { width: 20%; }
.col-ma { width: 20%; }
.col-ten { width: 20%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-tt { width: 20%; }
.col-action { width: 20%; }

.ss-td { color: rgba(17, 24, 39, 0.78); font-weight: 400; }
.ss-td-strong { color: rgba(17, 24, 39, 0.88); font-weight: 600; }
.ss-muted { color: rgba(17, 24, 39, 0.55); }

/* Badge */
.ss-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(17, 24, 39, 0.10);
}
.ss-badge-on {
  color: rgba(17, 24, 39, 0.82);
  background: rgba(255, 77, 79, 0.10);
  border-color: rgba(255, 77, 79, 0.18);
}
.ss-badge-off {
  color: rgba(17, 24, 39, 0.65);
  background: rgba(17, 24, 39, 0.06);
  border-color: rgba(17, 24, 39, 0.12);
}

/* actions */
.ss-actions-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

/* switch */
.ss-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: rgba(17, 24, 39, 0.12);
  display: inline-flex;
  align-items: center;
  padding: 2px;
  transition: 0.15s ease;
}
.ss-switch.on {
  background: rgba(255, 77, 79, 0.92);
  border-color: rgba(255, 77, 79, 0.25);
}
.ss-switch:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-switch-knob {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateX(0);
  transition: 0.15s ease;
}
.ss-switch.on .ss-switch-knob {
  transform: translateX(20px);
}

/* icon mắt chuẩn */
.ss-icon-btn-view {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: 0.15s ease;
}
.ss-icon-btn-view .material-icons-outlined {
  font-size: 20px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-icon-btn-view:hover {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.22);
}

/* Pagination (ngoài list) */
.ss-pagination-bar {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.ss-pagination {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-pagebtn {
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: rgba(17, 24, 39, 0.85);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s ease;
}
.ss-pagebtn:hover {
  background: rgba(17, 24, 39, 0.04);
}
.ss-pagebtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-pagebtn.active {
  border-color: rgba(255, 77, 79, 0.35);
  background: rgba(255, 77, 79, 0.08);
}
.ss-pageinfo {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-pageinfo span {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 600;
}

/* overlay/modal/success */
.ss-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.ss-modal {
  width: 520px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.ss-modal-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-modal-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.88);
}
.ss-modal-body {
  padding: 16px;
}
.ss-label {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.75);
  font-weight: 400;
}
.ss-modal-footer {
  padding: 14px 16px;
  display: flex;
  justify-content: end;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.ss-success {
  width: 520px;
  background: #fff;
  border-radius: 12px;
  text-align: center;
  padding: 28px 20px 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.ss-success-ring {
  width: 80px;
  height: 80px;
  border-radius: 999px;
  margin: 0 auto 14px;
  border: 6px solid rgba(34, 197, 94, 0.25);
  border-top-color: rgba(34, 197, 94, 0.75);
  animation: spin 1s linear infinite;
}
.ss-success-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 6px;
  color: rgba(17, 24, 39, 0.92);
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
