<!-- File: src/pages/khuyen_mai/phieu_giam_gia/VoucherManagePage.vue -->
<template>
  <div class="p-4 ss-page ss-font">
    <h2 class="h5 mb-4">Quản lý giảm giá/ Phiếu giảm giá</h2>

    <div class="ss-filter-container mb-4 p-4">
      <div class="ss-filter-top">
        <VoucherFilter v-model="filters" @reset="resetFilters" />

        <div class="ss-filter-actions">
          <button
            class="btn ss-btn-dark"
            type="button"
            @click="resetFilters"
            title="Đặt lại bộ lọc"
          >
            <span class="material-icons-outlined ss-btn-ico">restart_alt</span>
            Đặt lại bộ lọc
          </button>

          <button
            class="btn ss-btn-lite"
            type="button"
            @click="exportToExcel"
            title="Xuất Excel"
          >
            <span class="material-icons-outlined ss-btn-ico">description</span>
            Xuất Excel
          </button>

          <button
            class="btn ss-btn-primary"
            type="button"
            @click="goCreate"
            title="Thêm phiếu giảm giá"
          >
            <span class="material-icons-outlined ss-btn-ico">add</span>
            Thêm phiếu giảm giá
          </button>
        </div>
      </div>
    </div>

    <section class="ss-custom-box p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="h6 m-0">Danh sách phiếu giảm giá</h3>
      </div>

      <VoucherTable
        :vouchers="paginatedVouchers"
        :currentPage="currentPage"
        :pageSize="pageSize"
        :formatDate="formatDate"
        :getStatusStyle="getStatusStyle"
        :getStatusText="getStatusText"
        @toggle="toggleVoucherStatus"
        @view="viewDetail"
      />
    </section>

    <div class="ss-pagination-wrap" v-if="totalPages > 0">
      <button
        class="ss-page-btn"
        :class="{ disabled: currentPage === 1 }"
        :disabled="currentPage === 1"
        @click="gotoPage(currentPage - 1)"
        type="button"
        aria-label="Previous page"
      >
        &lt;
      </button>

      <button
        v-for="p in totalPages"
        :key="p"
        class="ss-page-btn"
        :class="{ active: currentPage === p }"
        @click="gotoPage(p)"
        type="button"
      >
        {{ p }}
      </button>

      <button
        class="ss-page-btn"
        :class="{ disabled: currentPage === totalPages }"
        :disabled="currentPage === totalPages"
        @click="gotoPage(currentPage + 1)"
        type="button"
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import VoucherFilter from "@/components/voucher/VoucherFilter.vue";
import VoucherTable from "@/components/voucher/VoucherTable.vue";

const router = useRouter();

const API_URL = "http://localhost:8080/api/admin/phieu-giam-gia";

const vouchers = ref([]);
const filters = ref({
  keyword: "",
  startDate: "",
  endDate: "",
  status: "",
});

const currentPage = ref(1);
const pageSize = ref(10);

const dangCapNhatTrangThai = ref(new Set());
const trangThaiGocMap = ref(new Map());

let fetchTimer = null;
let lastShownFilterError = "";

const normalizeTrangThai = (v) => v === true || Number(v) === 1;

const getErrorMessage = (e) => {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    "Đã có lỗi xảy ra"
  );
};

const parseApiDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const s = String(value).trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const normalizeDateForApi = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const dd = String(value.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const s = String(value).trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) {
    const dd = String(Number(m1[1])).padStart(2, "0");
    const mm = String(Number(m1[2])).padStart(2, "0");
    const yyyy = m1[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
};

const buildServerParams = () => {
  const params = {};

  const keyword = (filters.value.keyword || "").trim();
  const ngayBatDau = normalizeDateForApi(filters.value.startDate);
  const ngayKetThuc = normalizeDateForApi(filters.value.endDate);

  if (keyword) params.keyword = keyword;
  if (ngayBatDau) params.ngayBatDau = ngayBatDau;
  if (ngayKetThuc) params.ngayKetThuc = ngayKetThuc;

  return params;
};

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

const isEndedByFlag = (p) => p?.trangThai === false || Number(p?.trangThai) === 0;

const getStatusText = (p) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDate = parseApiDate(p?.ngayBatDau);
  const endDate = parseApiDate(p?.ngayKetThuc);

  const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
  const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

  if (isEndedByFlag(p)) return "Đã kết thúc";
  if (start != null && now.getTime() < start) return "Chưa bắt đầu";
  if (end != null && now.getTime() > end) return "Đã kết thúc";
  return "Đang hoạt động";
};

const getStatusStyle = (p) => {
  const s = getStatusText(p);
  const baseStyle = {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "400",
    display: "inline-block",
    minWidth: "110px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  };

  if (s === "Đang hoạt động") {
    return {
      ...baseStyle,
      background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
      color: "#e11d48",
      border: "1px solid #fecdd3",
    };
  }

  if (s === "Chưa bắt đầu") {
    return {
      ...baseStyle,
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      color: "#475569",
      border: "1px solid #e2e8f0",
    };
  }

  return {
    ...baseStyle,
    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    color: "#9ca3af",
    border: "1px solid #d1d5db",
  };
};

const formatDate = (d) => {
  const date = parseApiDate(d);
  return date ? date.toLocaleDateString("vi-VN") : "---";
};

const fetchData = async () => {
  try {
    const params = buildServerParams();

    const res = await axios.get(API_URL, { params });
    const arr = Array.isArray(res.data) ? res.data : res.data?.content || [];

    vouchers.value = arr;

    const m = new Map();
    for (const it of arr) {
      if (it?.id != null) {
        m.set(it.id, normalizeTrangThai(it.trangThai));
      }
    }
    trangThaiGocMap.value = m;
    lastShownFilterError = "";
  } catch (e) {
    console.error(e);

    const msg = getErrorMessage(e);
    const errorKey = `${filters.value.startDate}|${filters.value.endDate}|${msg}`;

    if (lastShownFilterError !== errorKey) {
      lastShownFilterError = errorKey;

      await Swal.fire({
        ...getSwalBase("confirm"),
        icon: "warning",
        title: "Bộ lọc không hợp lệ",
        text: msg,
        confirmButtonText: "OK",
        showCancelButton: false,
      });
    }
  }
};

const filteredVouchers = computed(() => {
  const statusFilter = (filters.value.status || "").trim();

  return vouchers.value
    .filter((p) => {
      if (!statusFilter || statusFilter === "Tất cả") return true;
      return getStatusText(p) === statusFilter;
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
});

const totalPages = computed(() => {
  return Math.ceil(filteredVouchers.value.length / pageSize.value);
});

const paginatedVouchers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredVouchers.value.slice(start, start + pageSize.value);
});

const gotoPage = (p) => {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
};

const scheduleFetchData = () => {
  currentPage.value = 1;

  if (fetchTimer) clearTimeout(fetchTimer);
  fetchTimer = setTimeout(() => {
    fetchData();
  }, 300);
};

watch(
  () => [filters.value.keyword, filters.value.startDate, filters.value.endDate],
  () => {
    scheduleFetchData();
  },
);

watch(
  () => filters.value.status,
  () => {
    currentPage.value = 1;
  },
);

watch(totalPages, (tp) => {
  if (tp <= 0) {
    currentPage.value = 1;
    return;
  }
  if (currentPage.value > tp) currentPage.value = tp;
});

const resetFilters = async () => {
  filters.value = {
    keyword: "",
    startDate: "",
    endDate: "",
    status: "",
  };
  currentPage.value = 1;
  await fetchData();
};

const exportToExcel = () => {
  const data = filteredVouchers.value.map((v) => ({
    "Mã phiếu": v.maPhieuGiamGia,
    "Tên phiếu": v.tenPhieuGiamGia,
    "Ngày bắt đầu": formatDate(v.ngayBatDau),
    "Ngày kết thúc": formatDate(v.ngayKetThuc),
    "Trạng thái": getStatusText(v),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vouchers");
  XLSX.writeFile(workbook, `Voucher_SevenStrike_${new Date().getTime()}.xlsx`);
};

const buildNewTrangThai = (p, oldValue, argChecked) => {
  if (typeof argChecked === "boolean") return argChecked;

  if (typeof p?.trangThai === "boolean") return p.trangThai;

  const n = normalizeTrangThai(p?.trangThai);
  if (n !== oldValue) return n;

  return !oldValue;
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const getTrangThaiPopupLabel = (value) => {
  return value ? "Đang hoạt động" : "Đã kết thúc";
};

const buildToggleConfirmHtml = (p, oldValue, newValue) => {
  return `
    <div style="font-weight:400;color:#666;line-height:1.5;">
      <div style="margin-bottom:10px;font-weight:400;">
        Bạn có muốn chuyển trạng thái phiếu giảm giá này không?
      </div>
      <div style="border:1px solid rgba(255,77,79,0.14);background:linear-gradient(180deg, rgba(255,77,79,0.04), rgba(17,24,39,0.02));border-radius:10px;padding:12px 14px;text-align:left;">
        <div style="font-size:15px;color:#333;font-weight:400;margin-bottom:4px;">
          ${escapeHtml(p?.tenPhieuGiamGia || "—")}
        </div>
        <div style="font-size:13px;color:#666;font-weight:400;margin-bottom:8px;">
          Mã phiếu: ${escapeHtml(p?.maPhieuGiamGia || "—")}
        </div>
        <div style="font-size:13px;color:#666;font-weight:400;">
          Trạng thái sẽ đổi từ
          <span style="color:#b42324;font-weight:400;">${escapeHtml(getTrangThaiPopupLabel(oldValue))}</span>
          sang
          <span style="color:#b42324;font-weight:400;">${escapeHtml(getTrangThaiPopupLabel(newValue))}</span>
        </div>
      </div>
    </div>
  `;
};

const toggleVoucherStatus = async (p, checked) => {
  const id = p?.id;
  if (!id) return;

  if (dangCapNhatTrangThai.value.has(id)) {
    const oldValue = trangThaiGocMap.value.get(id) ?? normalizeTrangThai(p?.trangThai);
    p.trangThai = oldValue;
    return;
  }

  const oldValue = trangThaiGocMap.value.get(id) ?? normalizeTrangThai(p?.trangThai);
  const newValue = buildNewTrangThai(p, oldValue, checked);

  const result = await Swal.fire({
    ...getSwalBase("confirm"),
    icon: "question",
    title: "Xác nhận?",
    html: buildToggleConfirmHtml(p, oldValue, newValue),
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    showCancelButton: true,
  });

  if (!result.isConfirmed) {
    p.trangThai = oldValue;
    return;
  }

  p.trangThai = newValue;
  dangCapNhatTrangThai.value.add(id);

  try {
    try {
      await axios.put(`${API_URL}/${id}`, { trangThai: newValue });
    } catch (e1) {
      const payload = { ...p, trangThai: newValue };
      await axios.put(`${API_URL}/${id}`, payload);
    }

    await fetchData();

    await Swal.fire({
      ...getSwalBase("success"),
      icon: "success",
      title: "Thành công!",
      html: `
        <div style="font-weight:400;color:#666;line-height:1.5;">
          Đã chuyển trạng thái phiếu giảm giá
          <span style="font-weight:400;color:#333;">${escapeHtml(p?.tenPhieuGiamGia || p?.maPhieuGiamGia || "")}</span>
          từ
          <span style="font-weight:400;color:#b42324;">${escapeHtml(getTrangThaiPopupLabel(oldValue))}</span>
          sang
          <span style="font-weight:400;color:#b42324;">${escapeHtml(getTrangThaiPopupLabel(newValue))}</span>.
        </div>
      `,
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } catch (e) {
    console.error(e);
    p.trangThai = oldValue;

    await Swal.fire({
      ...getSwalBase("confirm"),
      icon: "error",
      title: "Thất bại!",
      text: getErrorMessage(e),
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } finally {
    dangCapNhatTrangThai.value.delete(id);
  }
};

const goCreate = () => router.push("/admin/giam-gia/phieu/them");
const viewDetail = (p) => router.push(`/admin/giam-gia/phieu/${p.id}`);

onMounted(fetchData);

onBeforeUnmount(() => {
  if (fetchTimer) clearTimeout(fetchTimer);
});
</script>

<style scoped>
.ss-page {
  padding: 16px;
}
.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

:deep(.fw-bold),
:deep(.fw-semibold),
:deep(b),
:deep(strong) {
  font-weight: 400 !important;
}

h2.h5 {
  font-size: 20px;
  font-weight: 500 !important;
  letter-spacing: 0.2px;
  text-transform: none !important;
  color: rgba(17, 24, 39, 0.9);
  margin: 0 0 16px;
}
h3.h6 {
  font-size: 14px;
  font-weight: 500 !important;
  color: rgba(17, 24, 39, 0.82);
}

.ss-filter-container,
.ss-custom-box {
  background-color: #fff;
  border: 1px solid rgba(255, 77, 79, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
}

.ss-filter-top {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ss-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 400 !important;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.15s ease;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.88);
  white-space: nowrap;
}
.btn:hover {
  background: rgba(17, 24, 39, 0.04);
}

.ss-btn-ico {
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.ss-btn-lite {
  background: #f3f4f6 !important;
  color: rgba(17, 24, 39, 0.88) !important;
  border: 1px solid rgba(17, 24, 39, 0.10) !important;
}
.ss-btn-lite:hover {
  background: #eef0f3 !important;
}

.ss-btn-dark {
  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;
}
.ss-btn-dark:hover {
  filter: brightness(0.98);
}

.ss-btn-primary {
  border: none !important;
  color: #fff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

.ss-pagination-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.ss-page-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
  font-size: 13px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.15s ease;
}
.ss-page-btn:hover:not(.disabled) {
  background: rgba(17, 24, 39, 0.04);
}
.ss-page-btn.active {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: #fff;
}
.ss-page-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

:deep(.swal2-popup.ss-swal-popup) {
  width: 500px !important;
  max-width: 500px !important;
  border-radius: 6px !important;
  padding: 22px 20px 24px !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22) !important;
  font-family: inherit !important;
}

:deep(.swal2-icon.ss-swal-icon) {
  margin: 8px auto 10px !important;
}

:deep(.swal2-icon.swal2-question.ss-swal-icon) {
  width: 72px !important;
  height: 72px !important;
  border-width: 3px !important;
  color: #9db5c2 !important;
  border-color: #9db5c2 !important;
}

:deep(.swal2-icon.swal2-success.ss-swal-icon) {
  width: 72px !important;
  height: 72px !important;
  border-width: 3px !important;
  border-color: #d8efcf !important;
  color: #8fd16f !important;
}

:deep(.swal2-icon.swal2-success .swal2-success-ring) {
  border-color: rgba(143, 209, 111, 0.22) !important;
}

:deep(.swal2-icon.swal2-success [class^="swal2-success-line"]) {
  background-color: #8fd16f !important;
}

:deep(.swal2-title.ss-swal-title) {
  font-size: 27px !important;
  line-height: 1.2 !important;
  font-weight: 400 !important;
  color: #333 !important;
  margin: 2px 0 10px !important;
  padding: 0 !important;
}

:deep(.swal2-html-container.ss-swal-text) {
  font-size: 15px !important;
  line-height: 1.45 !important;
  font-weight: 400 !important;
  color: #666 !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.swal2-actions.ss-swal-actions) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  margin-top: 18px !important;
  width: 100% !important;
}

:deep(.swal2-actions.ss-swal-actions-center) {
  justify-content: center !important;
}

:deep(.ss-swal-confirm-btn),
:deep(.ss-swal-cancel-btn),
:deep(.ss-swal-ok-btn) {
  appearance: none !important;
  -webkit-appearance: none !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  min-width: 78px !important;
  height: 38px !important;
  padding: 0 18px !important;
  border-radius: 3px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 38px !important;
  font-family: inherit !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: 0.15s ease !important;
}

:deep(.ss-swal-confirm-btn) {
  background: #27313b !important;
  color: #fff !important;
}

:deep(.ss-swal-confirm-btn:hover) {
  background: #1f2831 !important;
}

:deep(.ss-swal-cancel-btn) {
  background: #6c757d !important;
  color: #fff !important;
}

:deep(.ss-swal-cancel-btn:hover) {
  background: #5f6870 !important;
}

:deep(.ss-swal-ok-btn) {
  background: #8a3ffc !important;
  color: #fff !important;
}

:deep(.ss-swal-ok-btn:hover) {
  background: #7b32ed !important;
}

:deep(.ss-swal-confirm-btn:focus),
:deep(.ss-swal-cancel-btn:focus),
:deep(.ss-swal-ok-btn:focus) {
  outline: none !important;
  box-shadow: none !important;
}
</style>