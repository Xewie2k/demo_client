<template>
  <div class="p-4 ss-page">
    <h2 class="ss-page-title mb-4 text-uppercase">Phiếu giảm giá</h2>

    <VoucherFilter v-model="filters" @reset="resetFilters" />

    <section class="ss-card ss-border p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="ss-section-title m-0">Danh sách phiếu giảm giá</h3>

        <button
          @click="$router.push('/admin/giam-gia/phieu/them')"
          class="btn ss-btn ss-btn-primary ss-add-btn"
          type="button"
          title="Thêm mới"
        >
          <span class="material-icons">add</span>
        </button>
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

      <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="small text-secondary">
          Hiển thị {{ paginatedVouchers.length }} / {{ filteredVouchers.length }} kết quả
        </div>

        <nav v-if="totalPages > 1">
          <ul class="pagination pagination-sm mb-0 ss-pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" :disabled="currentPage === 1" @click="prevPage" type="button">
                <span class="material-icons fs-6">chevron_left</span>
              </button>
            </li>

            <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: currentPage === p }">
              <button class="page-link shadow-none" @click="currentPage = p" type="button">
                {{ p }}
              </button>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" :disabled="currentPage === totalPages" @click="nextPage" type="button">
                <span class="material-icons fs-6">chevron_right</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

import apiClient from "@/services/apiClient";
import VoucherFilter from "@/components/voucher/VoucherFilter.vue";
import VoucherTable from "@/components/voucher/VoucherTable.vue";

const router = useRouter();

const vouchers = ref([]);
const filters = ref({ keyword: "", startDate: "", endDate: "", status: "" });

const currentPage = ref(1);
const pageSize = ref(10);

const unwrapList = (res) => {
  const d = res?.data ?? res;

  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;

  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data?.content)) return d.data.content;

  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.data?.content)) return d.data.data.content;

  return [];
};

const fetchData = async () => {
  try {
    const res = await apiClient.get("/api/admin/phieu-giam-gia");
    vouchers.value = unwrapList(res);
  } catch (e) {
    console.error("Lỗi khi gọi API:", e);
    Swal.fire("Lỗi", "Không thể kết nối đến máy chủ", "error");
  }
};

const getStatusText = (p) => {
  const now = new Date().setHours(0, 0, 0, 0);
  const start = new Date(p.ngayBatDau).setHours(0, 0, 0, 0);
  const end = new Date(p.ngayKetThuc).setHours(0, 0, 0, 0);

  if (p.trangThai === 0) return "Đã kết thúc";
  if (now < start) return "Chưa bắt đầu";
  if (now > end) return "Đã kết thúc";
  return "Đang hoạt động";
};

/**
 * ✅ Chỉ trả về màu + viền (để VoucherTable tự lo padding/font/size)
 * Palette SS: đỏ/đen/trắng
 */
const getStatusStyle = (p) => {
  const s = getStatusText(p);

  if (s === "Đang hoạt động") {
    return {
      background: "rgba(255, 77, 79, 0.10)",
      color: "#b42324",
      border: "1px solid rgba(255, 77, 79, 0.28)",
    };
  }

  if (s === "Chưa bắt đầu") {
    return {
      background: "#fff",
      color: "rgba(17, 24, 39, 0.86)",
      border: "1px solid rgba(255, 77, 79, 0.28)",
    };
  }

  return {
    background: "rgba(17, 24, 39, 0.06)",
    color: "rgba(17, 24, 39, 0.72)",
    border: "1px solid rgba(17, 24, 39, 0.12)",
  };
};

const toggleVoucherStatus = async (p) => {
  const result = await Swal.fire({
    title: "Xác nhận đổi trạng thái?",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
  });

  if (!result.isConfirmed) return;

  try {
    const newStatus = getStatusText(p) === "Đang hoạt động" ? 0 : 1;

    await apiClient.put(`/api/admin/phieu-giam-gia/${p.id}`, {
      ...p,
      trangThai: newStatus,
    });

    await fetchData();
  } catch (e) {
    console.error(e);
    Swal.fire("Lỗi", "Cập nhật trạng thái thất bại", "error");
  }
};

const viewDetail = (p) => {
  router.push(`/admin/giam-gia/phieu/chi-tiet/${p.id}`);
};

const resetFilters = () => {
  filters.value = { keyword: "", startDate: "", endDate: "", status: "" };
  currentPage.value = 1;
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "---");

const filteredVouchers = computed(() => {
  const kw = (filters.value.keyword || "").trim().toLowerCase();
  const fStart = filters.value.startDate
    ? new Date(filters.value.startDate).setHours(0, 0, 0, 0)
    : null;
  const fEnd = filters.value.endDate
    ? new Date(filters.value.endDate).setHours(23, 59, 59, 999)
    : null;

  return vouchers.value
    .filter((p) => {
      const matchesKey =
        !kw ||
        p.maPhieuGiamGia?.toLowerCase().includes(kw) ||
        p.tenPhieuGiamGia?.toLowerCase().includes(kw);

      const matchesStatus = !filters.value.status || getStatusText(p) === filters.value.status;

      const vStart = p.ngayBatDau ? new Date(p.ngayBatDau).getTime() : null;
      const vEnd = p.ngayKetThuc ? new Date(p.ngayKetThuc).getTime() : null;

      const matchesDate =
        (!fStart || (vEnd != null && vEnd >= fStart)) &&
        (!fEnd || (vStart != null && vStart <= fEnd));

      return matchesKey && matchesStatus && matchesDate;
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
});

const totalPages = computed(() => Math.ceil(filteredVouchers.value.length / pageSize.value));

const paginatedVouchers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredVouchers.value.slice(start, start + pageSize.value);
});

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

watch(
  totalPages,
  (tp) => {
    if (tp <= 0) currentPage.value = 1;
    else if (currentPage.value > tp) currentPage.value = tp;
  },
  { immediate: true }
);

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

onMounted(fetchData);
</script>

<style scoped>
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
  color: rgba(17, 24, 39, 0.92);
}

.ss-section-title {
  font-weight: 900;
  font-size: 15px;
  color: rgba(17, 24, 39, 0.92);
}

/* Card chuẩn SS */
.ss-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid var(--ss-border);
  box-shadow: var(--ss-shadow-soft);
}

/* Button chuẩn SS */
.ss-btn {
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 800;
}

.ss-btn-primary {
  color: #fff;
  border: none;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

/* nút add icon */
.ss-add-btn {
  width: 42px;
  height: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-add-btn .material-icons {
  font-size: 20px;
  line-height: 1;
}

/* Pagination */
.ss-pagination :deep(.page-link) {
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  color: rgba(17, 24, 39, 0.80) !important;
  background: #fff !important;
}
.ss-pagination :deep(.page-item.active .page-link) {
  background: #111827 !important;
  border-color: #111827 !important;
  color: #fff !important;
}
.ss-pagination :deep(.page-link:hover) {
  background: rgba(17, 24, 39, 0.04) !important;
  border-color: rgba(17, 24, 39, 0.18) !important;
}
</style>
