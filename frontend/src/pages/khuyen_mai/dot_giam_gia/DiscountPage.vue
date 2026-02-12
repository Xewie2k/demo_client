<!-- File: src/pages/khuyen_mai/dot_giam_gia/DiscountPage.vue -->
<template>
  <div class="discount-page">
    <h2 class="page-title">Quản lý giảm giá/ Đợt giảm giá</h2>

    <div class="card filter-section">
      <div class="filter-header">
        <div class="filter-title">
          <i class="fa-solid fa-filter"></i> Bộ lọc tìm kiếm
        </div>
      </div>

      <div class="filter-grid">
        <div class="filter-item search-col">
          <label class="label">Từ khóa</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              v-model="filters.keyword"
              type="text"
              class="form-control"
              placeholder="Tìm theo tên hoặc mã đợt..."
            />
          </div>
        </div>

        <div class="filter-item">
          <label class="label">Ngày bắt đầu</label>
          <input v-model="filters.startDate" type="date" class="form-control" @click="$event.target.showPicker()" />
        </div>

        <div class="filter-item">
          <label class="label">Ngày kết thúc</label>
          <input v-model="filters.endDate" type="date" class="form-control" @click="$event.target.showPicker()" />
        </div>

        <div class="filter-item">
          <label class="label">Trạng thái</label>
          <select v-model="filters.status" class="form-control">
            <option value="">-- Tất cả --</option>
            <option value="active">Đang diễn ra</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>

        <div class="filter-item action-col">
          <div class="btn-group-filter">
            <button class="btn-filter search" @click="fetchDiscounts">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span>Tìm kiếm</span>
            </button>
            <button class="btn-filter reset" @click="resetFilters" title="Làm mới bộ lọc">
              <i class="fa-solid fa-rotate-left"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card table-section">
      <div class="table-header">
        <div class="header-left">
          <h3>Danh sách đợt giảm giá</h3>
        </div>

        <button class="btn-add" @click="goToAddPage">
          <i class="fa-solid fa-plus"></i> Thêm mới
        </button>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th class="text-center" width="50px">STT</th>
              <th>Mã đợt</th>
              <th>Tên đợt</th>
              <th class="text-center">Giá trị</th>
              <th class="text-center">Loại giảm</th>
              <th class="text-center">Ngày bắt đầu</th>
              <th class="text-center">Ngày kết thúc</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredList.length === 0">
              <td colspan="10" class="empty-row">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png"
                  alt="Empty"
                  width="60"
                />
                <p>Không tìm thấy dữ liệu phù hợp</p>
              </td>
            </tr>

            <tr v-for="(item, index) in paginatedDiscounts" :key="item.id">
              <td class="text-center">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <td>{{ item.maDotGiamGia }}</td>

              <td>{{ item.tenDotGiamGia }}</td>

              <td class="text-center highlight-text">
                {{ item.giaTriGiamGia + "%" }}
              </td>

              <td class="text-center">
                <span class="ss-tag ss-tag-percent">%</span>
              </td>

              <td class="text-center">{{ formatDate(item.ngayBatDau) }}</td>
              <td class="text-center">{{ formatDate(item.ngayKetThuc) }}</td>

              <td class="text-center">
                <span class="ss-badge" :class="item.statusClass">
                  {{ item.statusText }}
                </span>
              </td>

              <td class="text-center action-cell">
                <div class="d-flex align-items-center justify-content-center gap-2">
                  <div
                    class="form-check form-switch mb-0"
                    title="Dừng đợt giảm giá"
                    v-if="item.statusKey !== 'ended'"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="item.trangThai"
                      @click.prevent="toggleStatus(item)"
                      style="cursor: pointer;"
                    />
                  </div>

                  <button
                    class="ss-icon-btn-view"
                    type="button"
                    @click="viewDetail(item.id)"
                    title="Xem chi tiết"
                  >
                    <span class="material-icons-outlined">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 0">
        <button
          class="page-btn"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <button class="page-btn active">{{ currentPage }}</button>

        <button
          class="page-btn"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { discountService } from "@/services/khuyen_mai/dot_giam_gia/discountService";
import { sortDotGiamGia } from "@/services/khuyen_mai/dot_giam_gia/dotGiamGiaSort";

const router = useRouter();
const rawDiscounts = ref([]);

const filters = reactive({
  keyword: "",
  startDate: "",
  endDate: "",
  status: "",
});

const currentPage = ref(1);
const itemsPerPage = 5;

const parseDateAny = (input) => {
  if (!input) return null;
  if (Array.isArray(input)) {
    const [y, m, d] = input;
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const dt = new Date(input);
  return isNaN(dt.getTime()) ? null : dt;
};

const formatDate = (dateArrOrStr) => {
  const d = parseDateAny(dateArrOrStr);
  if (!d) return "-";
  return d.toLocaleDateString("vi-VN");
};

const fetchDiscounts = async () => {
  try {
    const data = await discountService.getAll();
    const now = new Date();

    const parseDateBoundary = (d, isEnd) => {
      const dateObj = parseDateAny(d) || new Date();
      dateObj.setHours(
        isEnd ? 23 : 0,
        isEnd ? 59 : 0,
        isEnd ? 59 : 0,
        isEnd ? 999 : 0
      );
      return dateObj;
    };

    rawDiscounts.value = (Array.isArray(data) ? data : []).map((item) => {
      let statusKey = "";
      let statusText = "";
      let statusClass = "";

      const start = parseDateBoundary(item.ngayBatDau, false);
      const end = parseDateBoundary(item.ngayKetThuc, true);

      if (!item.trangThai) {
        statusKey = "ended";
        statusText = "Đã kết thúc";
        statusClass = "status-ended";
      } else if (now < start) {
        statusKey = "upcoming";
        statusText = "Sắp diễn ra";
        statusClass = "status-upcoming";
      } else if (now > end) {
        statusKey = "ended";
        statusText = "Đã kết thúc";
        statusClass = "status-ended";
      } else {
        statusKey = "active";
        statusText = "Đang diễn ra";
        statusClass = "status-active";
      }

      return { ...item, statusKey, statusText, statusClass };
    });
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
};

const filteredList = computed(() => {
  const filtered = rawDiscounts.value.filter((item) => {
    const kw = (filters.keyword || "").toLowerCase().trim();

    const keywordMatch =
      !kw ||
      (item.tenDotGiamGia || "").toLowerCase().includes(kw) ||
      (item.maDotGiamGia || "").toLowerCase().includes(kw);

    const startDate = filters.startDate ? parseDateAny(filters.startDate) : null;
    const endDate = filters.endDate ? parseDateAny(filters.endDate) : null;

    const itemStart = parseDateAny(item.ngayBatDau);
    const itemEnd = parseDateAny(item.ngayKetThuc);

    const startMatch = !startDate || (itemStart && itemStart >= startDate);
    const endMatch = !endDate || (itemEnd && itemEnd <= endDate);

    const statusMatch = !filters.status || item.statusKey === filters.status;

    return keywordMatch && startMatch && endMatch && statusMatch;
  });

  // ✅ SORT theo rule mới (ưu tiên trong cùng khoảng thời gian)
  return sortDotGiamGia(filtered);
});

const totalPages = computed(() =>
  Math.ceil(filteredList.value.length / itemsPerPage)
);

const paginatedDiscounts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredList.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

const resetFilters = () => {
  filters.keyword = "";
  filters.startDate = "";
  filters.endDate = "";
  filters.status = "";
  fetchDiscounts();
};

const goToAddPage = () => {
  router.push("/admin/giam-gia/dot/new");
};

const viewDetail = (id) => {
  router.push(`/admin/giam-gia/dot/${id}`);
};

const toggleStatus = async (item) => {
  const newStatus = !item.trangThai;
  const action = newStatus ? "kích hoạt" : "ngừng kích hoạt";

  if (!confirm(`Bạn có chắc muốn ${action} đợt giảm giá "${item.tenDotGiamGia}"?`)) {
    return;
  }

  try {
    const [fullInfo, details] = await Promise.all([
      discountService.getOne(item.id),
      discountService.getDiscountDetails(item.id),
    ]);

    const payload = {
      ...fullInfo,
      trangThai: newStatus,
      idChiTietSanPhams: (details || [])
        .map((d) => d.idChiTietSanPham || d.id_chi_tiet_san_pham)
        .filter((id) => id),
    };

    await discountService.update(item.id, payload);
    await fetchDiscounts();
  } catch (e) {
    console.error(e);
    alert("Lỗi cập nhật trạng thái: " + (e.response?.data?.message || e.message));
  }
};

onMounted(() => {
  fetchDiscounts();
});
</script>

<style scoped>
* { box-sizing: border-box; }

.discount-page { padding-bottom: 30px; }

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 30px;
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.92);
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--ss-border);
  box-shadow: var(--ss-shadow-soft);
  padding-bottom: 30px;
}

.filter-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
}

.filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 20px;
  align-items: end;
}

@media (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .search-col {
    grid-column: span 2;
  }
  .action-col {
    grid-column: span 2;
    justify-self: end;
    margin-top: 10px;
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  .search-col, .action-col {
    grid-column: span 1;
    justify-self: stretch;
  }
  .btn-group-filter {
    width: 100%;
  }
  .btn-filter {
    flex: 1;
  }
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.65);
  margin-bottom: 8px;
  display: block;
}

.form-control,
.input-wrapper input {
  height: 42px;
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background-color: #fff;
  color: #334155;
}
.form-control:focus,
.input-wrapper input:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.15);
}

.input-wrapper { position: relative; width: 100%; }
.input-wrapper input { padding-left: 36px; }

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(17, 24, 39, 0.45);
  font-size: 14px;
  pointer-events: none;
}

.btn-group-filter { display: flex; gap: 10px; }

.btn-filter {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  padding: 0 20px;
  transition: 0.2s;
}

.btn-filter.reset {
  background: #f1f5f9;
  color: #64748b;
  padding: 0 14px;
}
.btn-filter.reset:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.btn-filter.search {
  background: #111827;
  color: #fff;
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.15);
  border: none;
}
.btn-filter.search:hover {
  background: #000;
  transform: translateY(-1px);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.header-left h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.92);
}

.btn-add {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  border: none;
  padding: 0 18px;
  height: 40px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.btn-add:hover { filter: brightness(0.98); }

.table-container {
  overflow-x: auto;
  border: 1px solid var(--ss-border);
  border-radius: 14px;
  background: #fff;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 1000px;
}
.custom-table th {
  background: #f9fafb;
  color: rgba(17, 24, 39, 0.82);
  font-weight: 600;
  font-size: 13.5px;
  padding: 14px 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.10);
  white-space: nowrap;
}
.custom-table td {
  padding: 14px 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  vertical-align: middle;
  color: rgba(17, 24, 39, 0.82);
}

.ss-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
}
.ss-tag-percent {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.88);
  border-color: rgba(17, 24, 39, 0.14);
}

.highlight-text { font-weight: 400; color: rgba(17, 24, 39, 0.92); }

.ss-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  letter-spacing: 0.1px;
}

.status-active {
  background: rgba(255, 77, 79, 0.10);
  color: #b42324;
  border-color: rgba(255, 77, 79, 0.28);
}
.status-upcoming {
  background: #fff;
  color: rgba(17, 24, 39, 0.86);
  border-color: rgba(255, 77, 79, 0.28);
}
.status-ended {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.72);
  border-color: rgba(17, 24, 39, 0.12);
}

.empty-row {
  text-align: center;
  padding: 40px !important;
  color: rgba(17, 24, 39, 0.55);
}
.empty-row img { margin-bottom: 10px; opacity: 0.5; }

.text-center { text-align: center; }
.action-cell { white-space: nowrap; }

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}
.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  color: rgba(17, 24, 39, 0.80);
}
.page-btn:hover {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.18);
}
.page-btn.active {
  background: #111827;
  color: white;
  border-color: #111827;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-check-input:checked {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
