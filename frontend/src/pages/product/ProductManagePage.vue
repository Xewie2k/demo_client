<!-- File: src/pages/product/ProductManagePage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">QUẢN LÝ SẢN PHẨM</div>
    </div>

    <!-- FILTER BAR -->
    <div class="ss-card ss-border p-3 mb-3">
      <div class="d-flex align-items-center mb-2">
        <span class="material-icons-outlined me-2">filter_alt</span>
        <div class="fw-bold">Bộ lọc</div>
      </div>

      <!-- Row 1: Search + Status -->
      <div class="row g-3 align-items-start">
        <!-- Search -->
        <div class="col-lg-7">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="material-icons-outlined ss-label-icon">search</span>
            <label class="form-label mb-0">Tìm</label>
          </div>

          <input v-model="keyword" class="form-control ss-search-input" placeholder="Tìm theo mã / tên..." />

          <div class="small ss-text-sub mt-2">
            Tổng số sản phẩm: <b class="ss-text-strong">{{ filteredProducts.length }}</b>
          </div>
        </div>

        <!-- Status radio -->
        <div class="col-lg-5">
          <label class="form-label">Trạng thái</label>
          <div class="ss-radio">
            <label class="ss-radio-item">
              <input type="radio" value="all" v-model="statusFilter" />
              <span>Tất cả</span>
            </label>

            <label class="ss-radio-item">
              <input type="radio" value="active" v-model="statusFilter" />
              <span>Kinh doanh</span>
            </label>

            <label class="ss-radio-item">
              <input type="radio" value="inactive" v-model="statusFilter" />
              <span>Ngừng kinh doanh</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Row 2: Buttons + Page size -->
      <div class="d-flex align-items-center justify-content-between gap-2 mt-3 flex-wrap">
        <div class="d-flex gap-2">
          <button class="btn ss-btn ss-btn-outline" type="button" @click="resetFilter" :disabled="loading">
            Đặt lại bộ lọc
          </button>

          <button class="btn ss-btn ss-btn-primary" type="button" @click="goAddProductDetail" :disabled="loading">
            Thêm chi tiết sản phẩm
          </button>
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="small ss-text-sub">Hiển thị</span>
          <select v-model.number="pageSize" class="form-select ss-page-size" :disabled="loading">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
          </select>
          <span class="small ss-text-sub">/ trang</span>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="ss-card ss-border p-3">
      <div class="table-responsive">
        <table class="table align-middle mb-0 ss-table-grid">
          <colgroup>
            <col style="width: 70px" />
            <col />
            <col style="width: 160px" />
            <col style="width: 180px" />
            <col style="width: 140px" />
            <col style="width: 110px" />
            <col style="width: 160px" />
            <col style="width: 170px" />
          </colgroup>

          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Xuất xứ</th>
              <th>Thương hiệu</th>
              <th>Ngày tạo</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody v-if="loading">
            <tr>
              <td colspan="8" class="text-center ss-text-sub py-4">Đang tải...</td>
            </tr>
          </tbody>

          <tbody v-else-if="!pagedProducts.length">
            <tr>
              <td colspan="8" class="text-center ss-text-sub py-4">Không có dữ liệu</td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="(p, idx) in pagedProducts" :key="p.id">
              <td class="ss-text">{{ (page - 1) * pageSize + idx + 1 }}</td>

              <td>
                <div class="ss-text-strong">
                  {{ p.tenSanPham ?? p.ten_san_pham ?? p.ten ?? "-" }}
                </div>

                <div class="ss-text-sub small" v-if="p.maSanPham ?? p.ma_san_pham ?? p.ma">
                  {{ p.maSanPham ?? p.ma_san_pham ?? p.ma }}
                </div>

                <div class="ss-text-sub small" v-if="p.moTaNgan ?? p.mo_ta_ngan ?? p.moTa">
                  {{ p.moTaNgan ?? p.mo_ta_ngan ?? p.moTa }}
                </div>
              </td>

              <td class="ss-text">{{ getXuatXuTen(p) }}</td>
              <td class="ss-text">{{ getThuongHieuTen(p) }}</td>

              <td class="ss-text-sub">
                {{ formatDate(p.ngayTao ?? p.ngay_tao ?? p.createdAt ?? p.created_at) }}
              </td>

              <td>
                <span v-if="qtyLoadingIds.has(p.id)" class="ss-text-sub">...</span>
                <span v-else class="ss-text-strong">{{ qtyMap[p.id] ?? 0 }}</span>
              </td>

              <td>
                <span class="ss-pill" :class="getTrangThai(p) ? 'ss-pill-active' : 'ss-pill-inactive'">
                  {{ getTrangThai(p) ? "Kinh doanh" : "Ngừng kinh doanh" }}
                </span>
              </td>

              <td class="text-center">
                <div class="d-inline-flex align-items-center gap-2">
                  <label
                    class="ss-switch"
                    :class="switchLoadingIds.has(p.id) ? 'is-disabled' : ''"
                    title="Đổi trạng thái"
                  >
                    <input
                      type="checkbox"
                      :checked="getTrangThai(p)"
                      :disabled="switchLoadingIds.has(p.id)"
                      @change="() => toggleTrangThai(p)"
                    />
                    <span class="ss-slider"></span>
                  </label>

                  <!-- ✅ SS ONLY (đồng nhất toàn hệ qua admin.css) -->
                  <button class="ss-icon-btn-view" type="button" title="Xem" @click="viewProduct(p)">
                    <span class="material-icons-outlined">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination bar -->
      <div class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
        <div class="small ss-text-sub">Tổng: {{ filteredProducts.length }} bản ghi</div>

        <div class="ss-pagination">
          <button class="btn ss-page-btn" :disabled="page <= 1" @click="page = page - 1">
            <span class="material-icons-outlined">chevron_left</span>
          </button>

          <div class="ss-page-info">
            Trang <b>{{ page }}</b> / <b>{{ totalPages }}</b>
          </div>

          <button class="btn ss-page-btn" :disabled="page >= totalPages" @click="page = page + 1">
            <span class="material-icons-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import { refDataService } from "@/services/refDataService";

const router = useRouter();
const loading = ref(false);

const products = ref([]);
const keyword = ref("");
const statusFilter = ref("all"); // all | active | inactive

const page = ref(1);
const pageSize = ref(5);

const qtyMap = reactive({});
const qtyLoadingIds = reactive(new Set());

const xuatXuMap = reactive({});
const thuongHieuMap = reactive({});

const switchLoadingIds = reactive(new Set());

function unwrapList(v) {
  if (Array.isArray(v)) return v;
  const d = v?.data ?? v;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  return [];
}

function lc(s) {
  return String(s ?? "").trim().toLowerCase();
}

function getTrangThai(p) {
  const v =
    p?.trangThaiKinhDoanh ??
    p?.trang_thai_kinh_doanh ??
    p?.trangThai ??
    p?.trang_thai ??
    p?.trangThaiSanPham ??
    p?.dangKinhDoanh ??
    p?.kinhDoanh ??
    p?.isActive;

  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "active", "on", "kinhdoanh", "kinh_doanh"].includes(s)) return true;
    if (["false", "0", "inactive", "off", "ngung", "ngung_kinh_doanh"].includes(s)) return false;
  }
  return true;
}

function getXuatXuTen(p) {
  const direct =
    p?.tenXuatXu ??
    p?.xuatXuTen ??
    p?.xuat_xu_ten ??
    p?.xuatXu?.tenXuatXu ??
    p?.xuatXu?.ten ??
    p?.xuat_xu?.ten_xuat_xu ??
    p?.xuat_xu?.ten;
  if (direct) return direct;

  const id =
    p?.idXuatXu ??
    p?.id_xuat_xu ??
    p?.xuatXuId ??
    p?.xuat_xu_id ??
    p?.xuatXu?.id ??
    p?.xuat_xu?.id;
  return id && xuatXuMap[id] ? xuatXuMap[id] : "-";
}

function getThuongHieuTen(p) {
  const direct =
    p?.tenThuongHieu ??
    p?.thuongHieuTen ??
    p?.thuong_hieu_ten ??
    p?.thuongHieu?.tenThuongHieu ??
    p?.thuongHieu?.ten ??
    p?.thuong_hieu?.ten_thuong_hieu ??
    p?.thuong_hieu?.ten;
  if (direct) return direct;

  const id =
    p?.idThuongHieu ??
    p?.id_thuong_hieu ??
    p?.thuongHieuId ??
    p?.thuong_hieu_id ??
    p?.thuongHieu?.id ??
    p?.thuong_hieu?.id;
  return id && thuongHieuMap[id] ? thuongHieuMap[id] : "-";
}

function formatDate(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  } catch {
    return "-";
  }
}

const filteredProducts = computed(() => {
  const kw = lc(keyword.value);
  return (products.value || []).filter((p) => {
    const ma = lc(p.maSanPham ?? p.ma_san_pham ?? p.ma);
    const ten = lc(p.tenSanPham ?? p.ten_san_pham ?? p.ten);

    const matchKw = !kw || ma.includes(kw) || ten.includes(kw);

    const st = getTrangThai(p);
    const matchStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "active" && st) ||
      (statusFilter.value === "inactive" && !st);

    return matchKw && matchStatus;
  });
});

const totalPages = computed(() => {
  const n = filteredProducts.value.length;
  return Math.max(1, Math.ceil(n / pageSize.value));
});

const pagedProducts = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

watch([keyword, statusFilter, pageSize], () => {
  page.value = 1;
});

watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

function resetFilter() {
  keyword.value = "";
  statusFilter.value = "all";
  page.value = 1;
}

function viewProduct(p) {
  router.push(`/admin/san-pham/${p.id}`);
}

function goAddProductDetail() {
  router.push(`/admin/chi-tiet-san-pham/new`);
}

function sumSoLuong(details) {
  const list = Array.isArray(details) ? details : [];
  return list.reduce((acc, x) => {
    const v = x?.soLuong ?? x?.so_luong ?? 0;
    const n = Number(v);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

async function loadQuantities(list) {
  const concurrency = 6;
  let i = 0;

  async function worker() {
    while (i < list.length) {
      const cur = list[i++];
      const id = cur?.id;
      if (!id) continue;

      try {
        qtyLoadingIds.add(id);
        const details = await productDetailService.getBySanPham(id);
        qtyMap[id] = sumSoLuong(details);
      } catch (e) {
        console.error(e);
        qtyMap[id] = 0;
      } finally {
        qtyLoadingIds.delete(id);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, worker));
}

async function loadRefMaps() {
  try {
    const [xxRes, thRes] = await Promise.all([refDataService.getXuatXu(), refDataService.getThuongHieu()]);
    const xxList = unwrapList(xxRes);
    const thList = unwrapList(thRes);

    xxList.forEach((x) => {
      if (x?.id) xuatXuMap[x.id] = x.tenXuatXu ?? x.ten_xuat_xu ?? x.ten ?? "-";
    });
    thList.forEach((x) => {
      if (x?.id) thuongHieuMap[x.id] = x.tenThuongHieu ?? x.ten_thuong_hieu ?? x.ten ?? "-";
    });
  } catch (e) {
    console.error(e);
  }
}

async function toggleTrangThai(p) {
  const id = p?.id;
  if (!id) return;

  try {
    switchLoadingIds.add(id);
    const next = !getTrangThai(p);

    const payload = {
      ...p,
      trangThaiKinhDoanh: next,
      trang_thai_kinh_doanh: next,
      trangThai: next,
      trang_thai: next,
      dangKinhDoanh: next,
      kinhDoanh: next,
      isActive: next,
    };

    await productService.update(id, payload);

    const idx = (products.value || []).findIndex((x) => x.id === id);
    if (idx >= 0) {
      products.value[idx] = { ...products.value[idx], ...payload };
    }
  } catch (e) {
    console.error(e);
  } finally {
    switchLoadingIds.delete(id);
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    await loadRefMaps();
    const list = await productService.getAll();
    products.value = Array.isArray(list) ? list : [];
    await loadQuantities(products.value);
  } catch (e) {
    console.error(e);
    products.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
}

/* ===== chữ “bình thường” (đỡ nhạt) ===== */
.ss-text {
  color: rgba(17, 24, 39, 0.78);
}
.ss-text-strong {
  color: rgba(17, 24, 39, 0.92);
  font-weight: 700;
}
.ss-text-sub {
  color: rgba(17, 24, 39, 0.58);
}

/* ===== button base ===== */
.ss-btn {
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(17, 24, 39, 0.16);
}

/* label icon */
.ss-label-icon {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.65);
}

/* ===== Buttons palette đỏ/đen/trắng ===== */
.ss-btn-outline {
  background: #fff;
  color: #111827;
  border: 1px solid rgba(17, 24, 39, 0.28);
}
.ss-btn-outline:hover {
  border-color: rgba(255, 77, 79, 0.55);
  background: rgba(255, 77, 79, 0.06);
}

.ss-btn-primary {
  color: #fff;
  border: none;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

/* ===== Search ===== */
.ss-search-input {
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
}
.ss-search-input:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55);
}

/* ===== radio ===== */
.ss-radio {
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
  min-height: 44px;
}
.ss-radio-item {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  cursor: pointer;
  user-select: none;
  color: rgba(17, 24, 39, 0.78);
  font-weight: 600;
}
.ss-radio-item input {
  transform: translateY(1px);
  accent-color: #ff4d4f;
}

/* ===== status pill ===== */
.ss-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
}
.ss-pill-active {
  background: rgba(255, 77, 79, 0.1);
  color: #b42324;
  border: 1px solid rgba(255, 77, 79, 0.35);
}
.ss-pill-inactive {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.14);
}

/* ===== icon mắt: SS ONLY =====
   ✅ Lưu ý: admin.css đã ép global rồi.
   Ở đây chỉ để “dự phòng”, không đổi style khác. */
.ss-icon-btn-view {
  width: var(--ss-icon-size, 36px);
  height: var(--ss-icon-size, 36px);
  border-radius: var(--ss-icon-radius, 10px);
  border: 1px solid var(--ss-icon-border, rgba(17, 24, 39, 0.14));
  background: #fff;
  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--ss-icon, rgba(17, 24, 39, 0.92)) !important;
  transition: 0.2s;
}
.ss-icon-btn-view .material-icons-outlined {
  font-size: 18px;
  color: currentColor !important;
  line-height: 1;
}
.ss-icon-btn-view:hover {
  background: var(--ss-icon-bg-hover, rgba(17, 24, 39, 0.04));
  border-color: var(--ss-icon-border-hover, rgba(17, 24, 39, 0.18));
}

/* ===== switch ===== */
.ss-switch {
  position: relative;
  width: 44px;
  height: 24px;
  display: inline-block;
}
.ss-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.ss-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(17, 24, 39, 0.18);
  border-radius: 999px;
  transition: 0.2s;
}
.ss-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 999px;
  transition: 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}
.ss-switch input:checked + .ss-slider {
  background: #ff4d4f;
}
.ss-switch input:checked + .ss-slider:before {
  transform: translateX(20px);
}
.ss-switch.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* ===== pagination ===== */
.ss-pagination {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-page-btn {
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  padding: 6px 8px;
  background: #fff;
}
.ss-page-btn .material-icons-outlined {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.92);
}
.ss-page-btn:disabled {
  opacity: 0.45;
}
.ss-page-info {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.75);
}

/* page size */
.ss-page-size {
  width: 80px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
}

/* Table tone chữ (đỡ nhạt) */
.ss-table-grid td {
  color: rgba(17, 24, 39, 0.78);
}
.ss-table-grid th {
  color: rgba(17, 24, 39, 0.88);
}
</style>
