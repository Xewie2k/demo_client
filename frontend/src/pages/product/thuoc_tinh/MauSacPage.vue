<!-- src/pages/product/thuoc_tinh/MauSacPage.vue -->
<template>
  <div class="ss-page ss-font">
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Quản lý Sản Phẩm/ Màu Sắc</div>
      </div>

      <div class="ss-head-right">
        <div class="ss-count">
          Tổng số màu sắc: <span>{{ totalCount }}</span>
        </div>
      </div>
    </div>

    <div class="ss-card ss-border ss-filter-card">
      <div class="ss-filter-head">
        <span class="material-icons-outlined ss-filter-icon">filter_alt</span>
        <div class="ss-filter-title">Bộ Lọc Tìm Kiếm</div>
      </div>

      <div class="ss-filter-body">
        <div class="ss-filter-left">
          <div class="ss-filter-label">Tìm theo mã, tên, HEX, trạng thái</div>
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
            Thêm màu sắc
          </button>

          <button class="btn ss-btn-dark" type="button" @click="resetFilters">
            <span class="material-icons-outlined ss-btn-ic">restart_alt</span>
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    </div>

    <div class="ss-card ss-border ss-list-card">
      <div class="ss-list-head">Danh sách màu sắc</div>

      <div class="table-responsive">
        <table class="table ss-table mb-0">
          <thead>
            <tr>
              <th class="col-stt">STT</th>
              <th class="col-ma">Mã</th>
              <th class="col-ten">Tên</th>
              <th class="col-hex">Mã màu HEX</th>
              <th class="col-tt text-center">Trạng thái</th>
              <th class="col-action text-center">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="!loading && pagedItems.length">
            <tr v-for="(row, idx) in pagedItems" :key="getId(row) ?? idx">
              <td class="ss-td col-stt">{{ (page - 1) * pageSize + idx + 1 }}</td>
              <td class="ss-td ss-td-strong col-ma">{{ getMa(row) }}</td>
              <td class="ss-td col-ten" :title="getTen(row)">{{ getTen(row) }}</td>

              <td class="ss-td col-hex">
                <div class="d-flex align-items-center gap-2">
                  <span
                    class="ss-color-swatch"
                    :style="{ background: normalizeHex(getMaMau(row)) || '#ffffff' }"
                    :title="normalizeHex(getMaMau(row)) || 'Chưa có'"
                  ></span>
                  <span class="ss-muted ss-hex-text" :title="normalizeHex(getMaMau(row)) || ''">
                    {{ normalizeHex(getMaMau(row)) || "--" }}
                  </span>
                </div>
              </td>

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

                  <button class="ss-icon-btn-view" type="button" @click="openEdit(row)" title="Chỉnh sửa">
                    <span class="material-icons-outlined">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="loading">
            <tr><td colspan="6" class="text-center py-4 ss-muted">Đang tải...</td></tr>
          </tbody>

          <tbody v-else>
            <tr><td colspan="6" class="text-center py-4 ss-muted">Không có dữ liệu</td></tr>
          </tbody>
        </table>
      </div>
    </div>

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

    <div v-if="modal.open" class="ss-overlay">
      <div class="ss-modal">
        <div class="ss-modal-header">
          <div class="ss-modal-title">{{ modal.mode === 'create' ? 'Thêm màu sắc' : 'Chỉnh sửa màu sắc' }}</div>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="closeModal">X</button>
        </div>

        <div class="ss-modal-body">
          <template v-if="modal.mode === 'edit'">
            <label class="form-label ss-label">Mã màu sắc</label>
            <input :value="form.maMauSac" class="form-control ss-input-readonly" readonly disabled />
          </template>

          <label class="form-label ss-label ss-label-gap">Tên màu sắc *</label>
          <input
            v-model="form.tenMauSac"
            class="form-control"
            placeholder="Nhập tên..."
            @input="modal.error = ''"
          />

          <label class="form-label ss-label ss-label-gap">Mã màu (HEX) *</label>
          <div class="d-flex align-items-center gap-2">
            <span
              class="ss-color-swatch ss-color-swatch-lg"
              :style="{ background: normalizeHex(form.maMauHex) || '#ffffff' }"
              :title="normalizeHex(form.maMauHex) || ''"
            ></span>
            <input
              v-model="form.maMauHex"
              class="form-control"
              placeholder="Ví dụ: #111827 hoặc #ff4d4f"
              @input="modal.error = ''"
            />
          </div>
          <div class="ss-muted mt-1">Nhập dạng #RRGGBB hoặc #RGB.</div>

          <template v-if="modal.mode === 'edit'">
            <label class="form-label ss-label ss-label-gap">Trạng thái</label>
            <select v-model="form.trangThai" class="form-select" @change="modal.error = ''">
              <option :value="true">Đang hoạt động</option>
              <option :value="false">Ngừng hoạt động</option>
            </select>
          </template>

          <div v-if="modal.error" class="ss-form-error">{{ modal.error }}</div>
        </div>

        <div class="ss-modal-footer">
          <button class="btn ss-btn-lite" type="button" @click="closeModal" :disabled="saving">Hủy</button>
          <button class="btn ss-btn-primary" type="button" :disabled="saving" @click="save">
            {{ saving ? "Đang lưu..." : modal.mode === 'create' ? "Lưu" : "Cập nhật" }}
          </button>
        </div>
      </div>
    </div>

    <transition name="ss-toast-fade">
      <div
        v-if="toast.open"
        class="ss-toast"
        :class="toast.type === 'error' ? 'ss-toast-error' : 'ss-toast-success'"
      >
        <span class="material-icons-outlined ss-toast-icon">
          {{ toast.type === "error" ? "error" : "check_circle" }}
        </span>
        <span class="ss-toast-text">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import Swal from "sweetalert2";
import mauSacService from "@/services/thuoc_tinh/mauSacService.js";

const loading = ref(false);
const saving = ref(false);
const items = ref([]);
const keyword = ref("");
const page = ref(1);
const pageSize = ref(10);
const togglingId = ref(-999);

function getErrorMessage(error, fallback) {
  const message = error?.message;
  return typeof message === "string" && message.trim() ? message.trim() : fallback;
}

function getId(row) {
  return row?.id ?? row?.idMauSac ?? row?.id_mau_sac ?? row?.mauSacId ?? row?.mau_sac_id ?? null;
}

function getMa(x) {
  return x?.maMauSac ?? x?.ma_mau_sac ?? x?.ma ?? "--";
}

function getTen(x) {
  return x?.tenMauSac ?? x?.ten_mau_sac ?? x?.ten ?? "";
}

function getMaMau(x) {
  return x?.maMauHex ?? x?.ma_mau_hex ?? x?.maMau ?? x?.ma_mau ?? x?.maHex ?? x?.ma_hex ?? x?.hex ?? "";
}

function normalizeHex(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";
  const val = raw.startsWith("#") ? raw : `#${raw}`;
  if (/^#[0-9a-fA-F]{3}$/.test(val)) return val.toUpperCase();
  if (/^#[0-9a-fA-F]{6}$/.test(val)) return val.toUpperCase();
  return "";
}

function getTrangThai(x) {
  const v = x?.trangThai ?? x?.trang_thai ?? x?.status;
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

const toast = reactive({
  open: false,
  type: "success",
  message: "",
  timer: null,
});

function clearToastTimer() {
  if (toast.timer) {
    clearTimeout(toast.timer);
    toast.timer = null;
  }
}

function showToast(message, type = "success", duration = 2500) {
  clearToastTimer();
  toast.message = message;
  toast.type = type;
  toast.open = true;

  toast.timer = setTimeout(() => {
    toast.open = false;
    toast.timer = null;
  }, duration);
}

function applySwalButtonStyle(button, type = "confirm") {
  if (!button) return;
  button.style.appearance = "none";
  button.style.webkitAppearance = "none";
  button.style.border = "0";
  button.style.outline = "none";
  button.style.boxShadow = "none";
  button.style.borderRadius = "3px";
  button.style.minWidth = "78px";
  button.style.height = "38px";
  button.style.padding = "0 18px";
  button.style.fontSize = "14px";
  button.style.fontWeight = "400";
  button.style.lineHeight = "38px";
  button.style.fontFamily = "inherit";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.cursor = "pointer";

  if (type === "confirm") {
    button.style.background = "#27313b";
    button.style.color = "#fff";
  } else if (type === "cancel") {
    button.style.background = "#6c757d";
    button.style.color = "#fff";
  } else if (type === "ok") {
    button.style.background = "#8a3ffc";
    button.style.color = "#fff";
  }
}

function getSwalBase(type = "confirm") {
  return {
    width: 500,
    padding: "22px 20px 24px",
    background: "#ffffff",
    backdrop: "rgba(0,0,0,0.45)",
    allowOutsideClick: false,
    allowEscapeKey: true,
    buttonsStyling: false,
    reverseButtons: false,
    focusConfirm: false,
    customClass: {
      popup: "ss-swal-popup",
      icon: "ss-swal-icon",
      title: "ss-swal-title",
      htmlContainer: "ss-swal-text",
      actions: type === "success" ? "ss-swal-actions ss-swal-actions-center" : "ss-swal-actions",
      confirmButton: type === "success" ? "ss-swal-ok-btn" : "ss-swal-confirm-btn",
      cancelButton: "ss-swal-cancel-btn",
    },
    didOpen: (popup) => {
      const actions = popup.querySelector(".swal2-actions");
      const confirmBtn = popup.querySelector(".swal2-confirm");
      const cancelBtn = popup.querySelector(".swal2-cancel");
      const title = popup.querySelector(".swal2-title");
      const html = popup.querySelector(".swal2-html-container");
      const icon = popup.querySelector(".swal2-icon");

      popup.style.borderRadius = "6px";
      popup.style.boxShadow = "0 18px 48px rgba(0, 0, 0, 0.22)";
      popup.style.padding = "22px 20px 24px";

      if (actions) {
        actions.style.display = "flex";
        actions.style.alignItems = "center";
        actions.style.justifyContent = "center";
        actions.style.gap = "10px";
        actions.style.marginTop = "18px";
        actions.style.width = "100%";
      }

      if (title) {
        title.style.fontSize = "27px";
        title.style.lineHeight = "1.2";
        title.style.fontWeight = "400";
        title.style.color = "#333";
        title.style.margin = "2px 0 10px";
        title.style.padding = "0";
      }

      if (html) {
        html.style.fontSize = "15px";
        html.style.lineHeight = "1.45";
        html.style.fontWeight = "400";
        html.style.color = "#666";
        html.style.margin = "0";
        html.style.padding = "0";
      }

      if (icon) {
        icon.style.margin = "8px auto 10px";
      }

      if (type === "success") {
        applySwalButtonStyle(confirmBtn, "ok");
      } else {
        applySwalButtonStyle(confirmBtn, "confirm");
        applySwalButtonStyle(cancelBtn, "cancel");
      }
    },
  };
}

async function fetchAll() {
  loading.value = true;
  try {
    const res = await mauSacService.getAll();
    items.value = unwrapList(res);
  } catch (e) {
    console.error(e);
    showToast(getErrorMessage(e, "Không tải được danh sách màu sắc."), "error");
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
    const mamau = String(normalizeHex(getMaMau(x)) || "").toLowerCase();
    const tt = getTrangThai(x) ? "dang hoat dong" : "ngung hoat dong";
    return ten.includes(kw) || ma.includes(kw) || mamau.includes(kw) || tt.includes(kw);
  });
});

watch(keyword, () => {
  page.value = 1;
});

const totalPages = computed(() => Math.max(1, Math.ceil((filteredItems.value.length || 0) / pageSize.value)));

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
  arr.push(1);
  if (p > 3) arr.push("...");
  const start = Math.max(2, p - 1);
  const end = Math.min(tp - 1, p + 1);
  for (let i = start; i <= end; i++) arr.push(i);
  if (p < tp - 2) arr.push("...");
  arr.push(tp);

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

async function callUpdateTrangThai(service, id, nextVal, row) {
  const ten = (getTen(row) || "").trim();
  const hex = normalizeHex(getMaMau(row));

  if (typeof service.toggleStatus === "function") {
    try {
      return await service.toggleStatus(id, nextVal);
    } catch {
      return await service.toggleStatus(id);
    }
  }

  if (typeof service.updateTrangThai === "function") {
    return await service.updateTrangThai(id, nextVal);
  }

  if (typeof service.updateStatus === "function") {
    return await service.updateStatus(id, nextVal);
  }

  if (typeof service.update === "function") {
    return await service.update(id, { tenMauSac: ten, maMauHex: hex, trangThai: nextVal });
  }

  if (typeof service.put === "function") {
    return await service.put(id, { tenMauSac: ten, maMauHex: hex, trangThai: nextVal });
  }

  throw new Error("Service chưa có hàm đổi trạng thái");
}

async function onToggle(row) {
  const id = getId(row);

  if (id === undefined || id === null) {
    await Swal.fire({
      ...getSwalBase("confirm"),
      icon: "error",
      title: "Lỗi!",
      text: "Không tìm thấy ID để đổi trạng thái.",
      confirmButtonText: "OK",
      showCancelButton: false,
    });
    return;
  }

  if (togglingId.value !== -999) return;

  const nextVal = !getTrangThai(row);

  const confirmResult = await Swal.fire({
    ...getSwalBase("confirm"),
    icon: "question",
    title: "Xác nhận?",
    text: `Bạn có muốn ${nextVal ? "bật hoạt động" : "ngừng hoạt động"}?`,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    showCancelButton: true,
  });

  if (!confirmResult.isConfirmed) return;

  togglingId.value = id;

  try {
    await callUpdateTrangThai(mauSacService, id, nextVal, row);
    await fetchAll();

    await Swal.fire({
      ...getSwalBase("success"),
      icon: "success",
      title: "Thành công!",
      text: "Đã cập nhật trạng thái màu sắc!",
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } catch (e) {
    console.error(e);
    await Swal.fire({
      ...getSwalBase("confirm"),
      icon: "error",
      title: "Thất bại!",
      text: getErrorMessage(e, "Không đổi được trạng thái màu sắc."),
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } finally {
    togglingId.value = -999;
  }
}

const modal = reactive({
  open: false,
  mode: "create",
  error: "",
  editingId: null,
});

const form = reactive({
  maMauSac: "",
  tenMauSac: "",
  maMauHex: "",
  trangThai: true,
});

function openCreate() {
  modal.mode = "create";
  modal.open = true;
  modal.error = "";
  modal.editingId = null;

  form.maMauSac = "";
  form.tenMauSac = "";
  form.maMauHex = "";
  form.trangThai = true;
}

function openEdit(row) {
  modal.mode = "edit";
  modal.open = true;
  modal.error = "";
  modal.editingId = getId(row);

  form.maMauSac = getMa(row);
  form.tenMauSac = getTen(row);
  form.maMauHex = normalizeHex(getMaMau(row));
  form.trangThai = getTrangThai(row);
}

function closeModal() {
  if (saving.value) return;
  modal.open = false;
  modal.error = "";
  modal.editingId = null;
}

async function save() {
  const ten = (form.tenMauSac || "").trim();
  const maMauHex = normalizeHex(form.maMauHex);
  modal.error = "";

  if (!ten) {
    modal.error = "Vui lòng nhập tên màu sắc.";
    return;
  }

  if (!maMauHex) {
    modal.error = "Vui lòng nhập mã màu HEX hợp lệ.";
    return;
  }

  saving.value = true;

  try {
    if (modal.mode === "create") {
      await mauSacService.create({
        tenMauSac: ten,
        maMauHex,
        trangThai: true,
        xoaMem: false,
      });

      modal.open = false;
      await fetchAll();
      showToast("Thêm màu sắc thành công!");
      return;
    }

    if (modal.editingId === undefined || modal.editingId === null) {
      modal.error = "Không tìm thấy ID màu sắc để cập nhật.";
      return;
    }

    if (typeof mauSacService.update === "function") {
      await mauSacService.update(modal.editingId, {
        tenMauSac: ten,
        maMauHex,
        trangThai: form.trangThai,
      });
    } else if (typeof mauSacService.put === "function") {
      await mauSacService.put(modal.editingId, {
        tenMauSac: ten,
        maMauHex,
        trangThai: form.trangThai,
      });
    } else {
      throw new Error("Service chưa có hàm cập nhật màu sắc");
    }

    modal.open = false;
    await fetchAll();
    showToast("Cập nhật màu sắc thành công!");
  } catch (e) {
    console.error(e);
    modal.error = getErrorMessage(
      e,
      modal.mode === "create" ? "Thêm màu sắc thất bại." : "Cập nhật màu sắc thất bại."
    );
  } finally {
    saving.value = false;
  }
}

function exportExcel() {
  const rows = filteredItems.value || [];
  const header = ["STT", "Mã", "Tên", "Mã màu HEX", "Trạng thái"];
  const lines = [header];

  rows.forEach((r, i) => {
    lines.push([
      String(i + 1),
      String(getMa(r) ?? ""),
      String(getTen(r) ?? ""),
      String(normalizeHex(getMaMau(r)) || ""),
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
  a.download = `mau_sac_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

onMounted(fetchAll);
onBeforeUnmount(() => {
  clearToastTimer();
});
</script>

<style scoped>
.ss-font { font-family: inherit; color: rgba(17, 24, 39, 0.82); }
.ss-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px; gap: 16px; }
.ss-title { font-size: 20px; font-weight: 600; letter-spacing: 0.2px; color: rgba(17, 24, 39, 0.9); text-transform: none; }
.ss-count { font-size: 13px; color: rgba(17, 24, 39, 0.55); }
.ss-count span { color: rgba(17, 24, 39, 0.9); font-weight: 600; }
.ss-card { background: #fff; border-radius: 14px; }
.ss-border { border: 1px solid rgba(17, 24, 39, 0.08); box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06); }
.ss-filter-card { padding: 14px 16px; margin-bottom: 18px; }
.ss-filter-head { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ss-filter-icon { font-size: 18px; color: rgba(17, 24, 39, 0.65); }
.ss-filter-title { font-size: 14px; font-weight: 600; color: rgba(17, 24, 39, 0.82); }
.ss-filter-body { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.ss-filter-left { min-width: 320px; flex: 1; }
.ss-filter-label { font-size: 12px; margin-bottom: 6px; color: rgba(17, 24, 39, 0.55); font-weight: 400; }
.ss-search-wrap { position: relative; width: min(520px, 100%); }
.ss-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: rgba(17, 24, 39, 0.45); pointer-events: none; }
.ss-search-input { padding-left: 38px !important; height: 40px; border-radius: 10px !important; border: 1px solid rgba(17, 24, 39, 0.14); }
.ss-filter-actions { display: inline-flex; align-items: center; gap: 10px; }
.ss-btn-ic { font-size: 18px; margin-right: 8px; }
.btn { border-radius: 10px; padding: 8px 12px; font-size: 13px; font-weight: 500; line-height: 1; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; }
.ss-btn-lite { background: #f3f4f6 !important; color: rgba(17, 24, 39, 0.88) !important; border: 1px solid rgba(17, 24, 39, 0.10) !important; }
.ss-btn-lite:hover { background: #eef0f3 !important; }
.ss-btn-primary { border: none !important; background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important; color: #fff !important; box-shadow: 0 10px 22px rgba(255, 77, 79, 0.16); }
.ss-btn-primary:hover { filter: brightness(0.98); }
.ss-btn-dark { background: #4b5563 !important; color: #fff !important; border: none !important; }
.ss-btn-dark:hover { filter: brightness(0.98); }
.ss-list-card { padding: 0; }
.ss-list-head { padding: 14px 16px; font-size: 14px; font-weight: 500; color: rgba(17, 24, 39, 0.82); border-bottom: 1px solid rgba(17, 24, 39, 0.08); }
.ss-table { width: 100%; table-layout: fixed; }
.ss-table thead th { font-size: 13px; font-weight: 600; color: rgba(17, 24, 39, 0.75); border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
.ss-table td, .ss-table th { padding: 12px 14px; vertical-align: middle; }
.ss-table tbody tr:not(:last-child) td { border-bottom: 1px solid rgba(0, 0, 0, 0.04); }
.col-stt { width: 12%; }
.col-ma { width: 16%; }
.col-ten { width: 24%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-hex { width: 22%; }
.col-tt { width: 14%; }
.col-action { width: 12%; }
.ss-td { color: rgba(17, 24, 39, 0.78); font-weight: 400; }
.ss-td-strong { color: rgba(17, 24, 39, 0.88); font-weight: 600; }
.ss-muted { color: rgba(17, 24, 39, 0.55); }
.ss-badge { display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; border: 1px solid rgba(17, 24, 39, 0.10); }
.ss-badge-on { color: rgba(17, 24, 39, 0.82); background: rgba(255, 77, 79, 0.10); border-color: rgba(255, 77, 79, 0.18); }
.ss-badge-off { color: rgba(17, 24, 39, 0.65); background: rgba(17, 24, 39, 0.06); border-color: rgba(17, 24, 39, 0.12); }
.ss-color-swatch { width: 18px; height: 18px; border-radius: 6px; border: 1px solid rgba(17, 24, 39, 0.14); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35); }
.ss-color-swatch-lg { width: 22px; height: 22px; border-radius: 8px; }
.ss-hex-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
.ss-actions-inline { display: inline-flex; align-items: center; gap: 10px; justify-content: center; }
.ss-switch { width: 44px; height: 24px; border-radius: 999px; border: 1px solid rgba(17, 24, 39, 0.14); background: rgba(17, 24, 39, 0.12); display: inline-flex; align-items: center; padding: 2px; transition: 0.15s ease; }
.ss-switch.on { background: rgba(255, 77, 79, 0.92); border-color: rgba(255, 77, 79, 0.25); }
.ss-switch:disabled { opacity: 0.55; cursor: not-allowed; }
.ss-switch-knob { width: 18px; height: 18px; border-radius: 999px; background: #fff; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); transform: translateX(0); transition: 0.15s ease; }
.ss-switch.on .ss-switch-knob { transform: translateX(20px); }
.ss-icon-btn-view { width: 36px; height: 36px; border-radius: 10px; background: #fff; border: 1px solid rgba(17, 24, 39, 0.14); display: inline-flex; align-items: center; justify-content: center; padding: 0; transition: 0.15s ease; }
.ss-icon-btn-view .material-icons-outlined { font-size: 20px; color: rgba(17, 24, 39, 0.88); }
.ss-icon-btn-view:hover { background: rgba(17, 24, 39, 0.04); border-color: rgba(17, 24, 39, 0.22); }
.ss-pagination-bar { margin-top: 14px; display: flex; align-items: center; justify-content: center; gap: 14px; }
.ss-pagination { display: inline-flex; align-items: center; gap: 8px; }
.ss-pagebtn { min-width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(17, 24, 39, 0.12); background: #fff; color: rgba(17, 24, 39, 0.85); font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; transition: 0.15s ease; }
.ss-pagebtn:hover { background: rgba(17, 24, 39, 0.04); }
.ss-pagebtn:disabled { opacity: 0.55; cursor: not-allowed; }
.ss-pagebtn.active { border-color: rgba(255, 77, 79, 0.35); background: rgba(255, 77, 79, 0.08); }
.ss-pageinfo { font-size: 13px; color: rgba(17, 24, 39, 0.55); }
.ss-pageinfo span { color: rgba(17, 24, 39, 0.9); font-weight: 600; }
.ss-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.ss-modal { width: 520px; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25); }
.ss-modal-header { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0, 0, 0, 0.08); }
.ss-modal-title { font-size: 14px; font-weight: 600; color: rgba(17, 24, 39, 0.88); }
.ss-modal-body { padding: 16px; }
.ss-label { font-size: 13px; color: rgba(17, 24, 39, 0.75); font-weight: 400; }
.ss-label-gap { display: block; margin-top: 14px; }
.ss-input-readonly { background: #f9fafb !important; color: rgba(17, 24, 39, 0.7) !important; cursor: not-allowed; }
.ss-form-error { margin-top: 8px; font-size: 13px; color: #dc2626; font-weight: 500; }
.ss-modal-footer { padding: 14px 16px; display: flex; justify-content: end; gap: 10px; border-top: 1px solid rgba(0, 0, 0, 0.08); }
.ss-toast { position: fixed; top: 24px; right: 24px; z-index: 5000; min-width: 280px; max-width: 380px; padding: 12px 16px; border-radius: 12px; color: #fff; display: flex; align-items: center; gap: 10px; box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18); }
.ss-toast-success { background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%); }
.ss-toast-error { background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%); }
.ss-toast-icon { font-size: 20px; flex-shrink: 0; }
.ss-toast-text { font-size: 14px; font-weight: 500; line-height: 1.4; }
.ss-toast-fade-enter-active, .ss-toast-fade-leave-active { transition: all 0.25s ease; }
.ss-toast-fade-enter-from, .ss-toast-fade-leave-to { opacity: 0; transform: translateY(-8px); }
:deep(.swal2-popup.ss-swal-popup) { width: 500px !important; max-width: 500px !important; border-radius: 6px !important; padding: 22px 20px 24px !important; box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22) !important; font-family: inherit !important; }
:deep(.swal2-icon.ss-swal-icon) { margin: 8px auto 10px !important; }
:deep(.swal2-icon.swal2-question.ss-swal-icon) { width: 72px !important; height: 72px !important; border-width: 3px !important; color: #9db5c2 !important; border-color: #9db5c2 !important; }
:deep(.swal2-icon.swal2-success.ss-swal-icon) { width: 72px !important; height: 72px !important; border-width: 3px !important; border-color: #d8efcf !important; color: #8fd16f !important; }
:deep(.swal2-icon.swal2-success .swal2-success-ring) { border-color: rgba(143, 209, 111, 0.22) !important; }
:deep(.swal2-icon.swal2-success [class^="swal2-success-line"]) { background-color: #8fd16f !important; }
:deep(.swal2-title.ss-swal-title) { font-size: 27px !important; line-height: 1.2 !important; font-weight: 400 !important; color: #333 !important; margin: 2px 0 10px !important; padding: 0 !important; }
:deep(.swal2-html-container.ss-swal-text) { font-size: 15px !important; line-height: 1.45 !important; font-weight: 400 !important; color: #666 !important; margin: 0 !important; padding: 0 !important; }
:deep(.swal2-actions.ss-swal-actions) { display: flex !important; align-items: center !important; justify-content: center !important; gap: 10px !important; margin-top: 18px !important; width: 100% !important; }
:deep(.swal2-actions.ss-swal-actions-center) { justify-content: center !important; }
:deep(.ss-swal-confirm-btn), :deep(.ss-swal-cancel-btn), :deep(.ss-swal-ok-btn) { appearance: none !important; -webkit-appearance: none !important; border: 0 !important; outline: 0 !important; box-shadow: none !important; min-width: 78px !important; height: 38px !important; padding: 0 18px !important; border-radius: 3px !important; font-size: 14px !important; font-weight: 400 !important; line-height: 38px !important; font-family: inherit !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; cursor: pointer !important; transition: 0.15s ease !important; }
:deep(.ss-swal-confirm-btn) { background: #27313b !important; color: #fff !important; }
:deep(.ss-swal-confirm-btn:hover) { background: #1f2831 !important; }
:deep(.ss-swal-cancel-btn) { background: #6c757d !important; color: #fff !important; }
:deep(.ss-swal-cancel-btn:hover) { background: #5f6870 !important; }
:deep(.ss-swal-ok-btn) { background: #8a3ffc !important; color: #fff !important; }
:deep(.ss-swal-ok-btn:hover) { background: #7b32ed !important; }
:deep(.ss-swal-confirm-btn:focus), :deep(.ss-swal-cancel-btn:focus), :deep(.ss-swal-ok-btn:focus) { outline: none !important; box-shadow: none !important; }
</style>