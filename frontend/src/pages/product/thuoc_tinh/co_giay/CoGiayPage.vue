<!-- File: src/pages/thuoc_tinh/CoGiayPage.vue -->
<template>
  <div class="ss-page">
    <!-- Title + button -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">QUẢN LÝ CỔ GIÀY</div>

      <button class="btn btn-primary ss-btn" @click="openCreate">
        + THÊM CỔ GIÀY
      </button>
    </div>

    <!-- Search (nhỏ như mẫu) -->
    <div class="ss-card ss-border p-3 mb-3">
      <div class="ss-search-wrap">
        <span class="material-icons-outlined ss-search-icon">search</span>
        <input
          v-model="keyword"
          class="form-control ss-search-input"
          placeholder="Tìm kiếm..."
        />
      </div>
    </div>

    <!-- Table -->
    <div class="ss-card ss-border">
      <div class="p-3 fw-bold ss-text-strong">Danh sách cổ giày</div>

      <div class="table-responsive">
        <table class="table ss-table mb-0">
          <thead>
            <tr>
              <th style="width: 70px">STT</th>
              <th style="width: 160px">Mã</th>
              <th>Tên cổ giày</th>
              <th style="width: 140px" class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="!loading && pagedItems.length">
            <tr v-for="(row, idx) in pagedItems" :key="row.id ?? idx">
              <td class="ss-text">{{ (page - 1) * pageSize + idx + 1 }}</td>
              <td class="ss-text-strong">
                {{ row.maCoGiay ?? row.ma ?? "--" }}
              </td>
              <td class="ss-text">
                {{ row.tenCoGiay ?? row.ten ?? "" }}
              </td>
              <td class="text-center">
                <!-- ✅ SS ONLY: đồng nhất icon mắt toàn hệ -->
                <button class="ss-icon-btn-view" type="button" @click="onView(row)" title="Xem">
                  <span class="material-icons-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="loading">
            <tr>
              <td colspan="4" class="text-center py-4 ss-text-sub">Đang tải...</td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr>
              <td colspan="4" class="text-center py-4 ss-text-sub">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- paging đơn giản -->
      <div class="d-flex align-items-center justify-content-between p-3">
        <div class="ss-text-sub">Tổng: <b class="ss-text-strong">{{ filteredItems.length }}</b> bản ghi</div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary ss-btn-sm" :disabled="page <= 1" @click="page--">
            ‹
          </button>
          <div class="ss-text-sub">Trang <b class="ss-text-strong">{{ page }}</b> / <b class="ss-text-strong">{{ totalPages }}</b></div>
          <button
            class="btn btn-outline-secondary ss-btn-sm"
            :disabled="page >= totalPages"
            @click="page++"
          >
            ›
          </button>
        </div>
      </div>
    </div>

    <!-- Modal create -->
    <div v-if="modal.open" class="ss-overlay">
      <div class="ss-modal">
        <div class="ss-modal-header">
          <div class="fw-bold ss-text-strong">THÊM CỔ GIÀY</div>
          <button class="btn btn-sm btn-outline-secondary" @click="closeModal">X</button>
        </div>

        <div class="ss-modal-body">
          <label class="form-label ss-text">Tên cổ giày *</label>
          <input v-model="form.tenCoGiay" class="form-control" placeholder="Nhập tên..." />
        </div>

        <div class="ss-modal-footer">
          <button class="btn btn-outline-secondary ss-btn" @click="closeModal">Hủy</button>
          <button class="btn btn-primary ss-btn" :disabled="saving" @click="save">
            {{ saving ? "Đang lưu..." : "Lưu" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success popup giống ảnh -->
    <div v-if="success.open" class="ss-overlay">
      <div class="ss-success">
        <div class="ss-success-ring"></div>
        <div class="ss-success-title">Thành công</div>
        <div class="ss-text-sub">Thêm cổ giày thành công!</div>
        <button class="btn btn-primary mt-3 px-4" @click="success.open = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";

// đúng đường dẫn bạn chốt
import coGiayService from "@/services/thuoc_tinh/co_GiayService.js";

const loading = ref(false);
const saving = ref(false);

const items = ref([]);
const keyword = ref("");

const page = ref(1);
const pageSize = ref(10);

const filteredItems = computed(() => {
  const kw = (keyword.value || "").trim().toLowerCase();
  if (!kw) return items.value || [];

  return (items.value || []).filter((x) => {
    const ten = String(x.tenCoGiay ?? x.ten ?? "").toLowerCase();
    const ma = String(x.maCoGiay ?? x.ma ?? "").toLowerCase();
    return ten.includes(kw) || ma.includes(kw);
  });
});

watch(keyword, () => (page.value = 1));

const totalPages = computed(() => {
  const total = filteredItems.value.length || 0;
  return Math.max(1, Math.ceil(total / pageSize.value));
});

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

// modal + success
const modal = reactive({ open: false });
const success = reactive({ open: false });

const form = reactive({
  tenCoGiay: "",
});

function openCreate() {
  form.tenCoGiay = "";
  modal.open = true;
}
function closeModal() {
  modal.open = false;
}

async function fetchAll() {
  loading.value = true;
  try {
    const res =
      typeof coGiayService.getAll === "function"
        ? await coGiayService.getAll()
        : await coGiayService.all();

    const data = Array.isArray(res) ? res : (res?.data ?? res?.content ?? []);
    items.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    alert("Không tải được danh sách cổ giày.");
  } finally {
    loading.value = false;
  }
}

function onView(row) {
  alert(`Mã: ${row.maCoGiay ?? row.ma ?? "--"}\nTên: ${row.tenCoGiay ?? row.ten ?? ""}`);
}

async function save() {
  const ten = (form.tenCoGiay || "").trim();
  if (!ten) return alert("Vui lòng nhập tên cổ giày.");

  const ok = confirm(`Bạn có chắc chắn muốn thêm cổ giày: "${ten}" không?`);
  if (!ok) return;

  saving.value = true;
  try {
    const payload = { tenCoGiay: ten };

    if (typeof coGiayService.create === "function") await coGiayService.create(payload);
    else if (typeof coGiayService.add === "function") await coGiayService.add(payload);
    else throw new Error("coGiayService thiếu create/add");

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

onMounted(fetchAll);
</script>

<style scoped>
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
}

/* ===== chữ “bình thường”, không nhạt ===== */
.ss-text {
  color: rgba(17, 24, 39, 0.82);
}
.ss-text-strong {
  color: rgba(17, 24, 39, 0.92);
  font-weight: 700;
}
.ss-text-sub {
  color: rgba(17, 24, 39, 0.60);
}

.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
}
.ss-btn-sm {
  border-radius: 10px;
  padding: 6px 10px;
}

/* ===========================
   ✅ BUTTON THEO MÀU CHỦ ĐẠO
   (đỏ / đen / trắng)
   =========================== */

/* Primary: gradient đỏ -> đen */
.btn-primary {
  border: none !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.16);
}
.btn-primary:hover {
  filter: brightness(0.98);
  box-shadow: 0 12px 26px rgba(17, 24, 39, 0.18), 0 10px 22px rgba(255, 77, 79, 0.14);
}
.btn-primary:active {
  transform: translateY(0.5px);
}
.btn-primary:disabled,
.btn-primary.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

/* Outline secondary: nền trắng, viền đen mềm; hover ám đỏ nhẹ */
.btn-outline-secondary {
  background: #fff !important;
  color: rgba(17, 24, 39, 0.92) !important;
  border: 1px solid rgba(17, 24, 39, 0.22) !important;
}
.btn-outline-secondary:hover {
  border-color: rgba(255, 77, 79, 0.55) !important;
  background: rgba(255, 77, 79, 0.06) !important;
  color: rgba(17, 24, 39, 0.92) !important;
}
.btn-outline-secondary:disabled,
.btn-outline-secondary.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* search nhỏ + icon */
.ss-search-wrap {
  position: relative;
  width: 320px;
}
.ss-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(17, 24, 39, 0.55);
  pointer-events: none;
}
.ss-search-input {
  padding-left: 38px !important;
  height: 40px;
  border-radius: 999px !important;
}

/* table lines rõ (không kẻ dọc body) */
.ss-table thead th {
  font-size: 13px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.88);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-table td,
.ss-table th {
  padding: 12px 14px;
  vertical-align: middle;
}
.ss-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* modal */
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
.ss-modal-body {
  padding: 16px;
}
.ss-modal-footer {
  padding: 14px 16px;
  display: flex;
  justify-content: end;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* success */
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
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 6px;
  color: rgba(17, 24, 39, 0.92);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
