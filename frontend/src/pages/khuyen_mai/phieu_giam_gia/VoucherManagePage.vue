<!-- File: src/pages/khuyen_mai/phieu_giam_gia/VoucherManagePage.vue -->
<template>
  <div class="p-4 ss-page ss-font">
    <h2 class="h5 mb-4">Quản lý giảm giá/ Phiếu giảm giá</h2>

    <!-- FILTER BOX -->
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

    <!-- LIST BOX -->
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

    <!-- PAGINATION -->
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

// khóa theo id khi đang cập nhật
const dangCapNhatTrangThai = ref(new Set());
// lưu trạng thái gốc theo DB để revert khi cancel/lỗi
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

  // yyyy-MM-dd
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

  // đã đúng format BE cần
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // dd/MM/yyyy
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
        title: "Bộ lọc không hợp lệ",
        text: msg,
        icon: "warning",
        confirmButtonText: "Đóng",
      });
    }
  }
};

// trangThai=false hoặc 0 => kết thúc
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

// keyword + ngày đã lọc ở BE
// status hiển thị vẫn lọc ở FE vì nó là trạng thái nghiệp vụ suy ra từ ngày + flag
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
    title: "Xác nhận đổi trạng thái?",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
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
  } catch (e) {
    console.error(e);
    p.trangThai = oldValue;

    await Swal.fire({
      title: "Không thể cập nhật trạng thái",
      text: getErrorMessage(e),
      icon: "error",
      confirmButtonText: "Đóng",
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
</style>