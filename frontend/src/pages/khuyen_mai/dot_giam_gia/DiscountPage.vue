<template>
  <div class="discount-page">
    <h2 class="page-title">QUẢN LÝ ĐỢT GIẢM GIÁ</h2>

    <div class="card filter-section">
      <div class="filter-row">
        <div class="filter-item search-item">
          <label class="label">Từ khóa</label>
          <div class="input-wrapper">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Tìm theo tên hoặc mã đợt..."
            />
          </div>
        </div>

        <div class="filter-item">
          <label class="label">Từ ngày</label>
          <input v-model="filters.startDate" type="date" class="form-control" />
        </div>

        <div class="filter-item">
          <label class="label">Đến ngày</label>
          <input v-model="filters.endDate" type="date" class="form-control" />
        </div>
      </div>

      <div class="filter-row mt-3">
        <div class="filter-item">
          <label class="label">Loại giảm giá</label>
          <select v-model="filters.type" class="form-control">
            <option value="">-- Tất cả --</option>
            <option value="percent">Theo Phần trăm (%)</option>
            <option value="money">Theo Số tiền (VND)</option>
          </select>
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

        <div class="filter-item action-item">
          <label class="label d-none-mobile">&nbsp;</label>
          <div class="btn-group">
            <button class="btn-filter reset" @click="resetFilters">
              <i class="fa-solid fa-rotate-left"></i>
              <span class="btn-text">Làm mới</span>
            </button>
            <button class="btn-filter search" @click="fetchDiscounts">
              <i class="fa-solid fa-filter"></i>
              <span class="btn-text">Lọc</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card table-section">
      <div class="table-header">
        <div class="header-left">
          <h3>Danh sách đợt giảm giá</h3>
          <span class="count-badge">{{ filteredList.length }} bản ghi</span>
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
              <th>Loại giảm</th>
              <th class="text-right">Giá trị</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
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

              <td>
                <strong>{{ item.maDotGiamGia }}</strong>
              </td>

              <td>{{ item.tenDotGiamGia }}</td>

              <td>
                <!-- ✅ đổi tag theo palette đỏ/đen -->
                <span
                  class="ss-tag"
                  :class="item.loaiGiamGia ? 'ss-tag-money' : 'ss-tag-percent'"
                >
                  {{ item.loaiGiamGia ? "VND" : "%" }}
                </span>
              </td>

              <td class="text-right highlight-text">
                {{
                  item.loaiGiamGia
                    ? formatCurrency(item.giaTriGiamGia)
                    : item.giaTriGiamGia + "%"
                }}
              </td>

              <td>{{ formatDate(item.ngayBatDau) }}</td>
              <td>{{ formatDate(item.ngayKetThuc) }}</td>

              <td class="text-center">
                <!-- ✅ badge theo palette chủ đạo -->
                <span class="ss-badge" :class="item.statusClass">
                  {{ item.statusText }}
                </span>
              </td>

              <td class="text-center action-cell">
                <!-- ✅ SS ONLY -->
                <button
                  class="ss-icon-btn-view"
                  type="button"
                  @click="viewDetail(item.id)"
                  title="Xem chi tiết"
                >
                  <span class="material-icons-outlined">visibility</span>
                </button>
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

const router = useRouter();
const rawDiscounts = ref([]);

const filters = reactive({
  keyword: "",
  startDate: "",
  endDate: "",
  type: "",
  status: "",
});

const currentPage = ref(1);
const itemsPerPage = 5;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);
};

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

      if (now < start) {
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
  return rawDiscounts.value.filter((item) => {
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

    let typeMatch = true;
    if (filters.type === "percent") typeMatch = item.loaiGiamGia === false;
    if (filters.type === "money") typeMatch = item.loaiGiamGia === true;

    const statusMatch = !filters.status || item.statusKey === filters.status;

    return keywordMatch && startMatch && endMatch && typeMatch && statusMatch;
  });
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
  filters.type = "";
  filters.status = "";
  fetchDiscounts();
};

const goToAddPage = () => {
  router.push("/admin/giam-gia/dot/new");
};

const viewDetail = (id) => {
  router.push(`/admin/giam-gia/dot/${id}`);
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
  font-weight: 900;
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
}

.filter-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.mt-3 { margin-top: 20px; }

.filter-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}
.search-item { flex: 2; min-width: 250px; }
.action-item {
  flex: 0.8;
  min-width: 180px;
  justify-content: flex-end;
}

.label {
  font-size: 13px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.65);
  margin-bottom: 8px;
  display: block;
}

.form-control,
.input-wrapper input {
  height: 40px;
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 12px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background-color: #fff;
  color: rgba(17, 24, 39, 0.82);
}
.form-control:focus,
.input-wrapper input:focus {
  border-color: rgba(255, 77, 79, 0.55);
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.10);
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

.btn-group { display: flex; gap: 10px; }

.btn-filter {
  height: 40px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  padding: 0 15px;
  transition: 0.2s;
}

.btn-filter.reset {
  background: #fff;
  color: rgba(17, 24, 39, 0.92);
  border-color: rgba(17, 24, 39, 0.18);
}
.btn-filter.reset:hover {
  border-color: rgba(255, 77, 79, 0.55);
  background: rgba(255, 77, 79, 0.06);
}

.btn-filter.search {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: #fff;
  border: none;
}
.btn-filter.search:hover { filter: brightness(0.98); }

@media (max-width: 768px) {
  .filter-row { gap: 15px; }
  .filter-item { flex: 100%; min-width: 100%; }
  .d-none-mobile { display: none; }
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
  font-weight: 900;
  color: rgba(17, 24, 39, 0.92);
}

.count-badge {
  background: rgba(17, 24, 39, 0.06);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.70);
}

.btn-add {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  color: white;
  border: none;
  padding: 0 18px;
  height: 40px;
  border-radius: 12px;
  font-weight: 800;
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
  font-weight: 900;
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

/* ✅ Tag loại giảm (palette đỏ/đen) */
.ss-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
}
.ss-tag-money {
  background: rgba(255, 77, 79, 0.10);
  color: #b42324;
  border-color: rgba(255, 77, 79, 0.28);
}
.ss-tag-percent {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.88);
  border-color: rgba(17, 24, 39, 0.14);
}

.highlight-text {
  font-weight: 900;
  color: rgba(17, 24, 39, 0.92);
}

/* ✅ Badge trạng thái (palette chủ đạo, vừa mắt) */
.ss-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 900;
  white-space: nowrap;
  border: 1px solid transparent;
  letter-spacing: 0.1px;
}

/* Đang diễn ra: đỏ dịu */
.status-active {
  background: rgba(255, 77, 79, 0.10);
  color: #b42324;
  border-color: rgba(255, 77, 79, 0.28);
}

/* Sắp diễn ra: nền trắng + viền đỏ (nhẹ, chủ đạo) */
.status-upcoming {
  background: #fff;
  color: rgba(17, 24, 39, 0.86);
  border-color: rgba(255, 77, 79, 0.28);
}

/* Đã kết thúc: tone đen dịu */
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
.text-right { text-align: right; }
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
</style>
