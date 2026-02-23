<template>
  <div class="products-page">
    <!-- Breadcrumb -->
    <div class="bg-light py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><router-link to="/client" class="text-decoration-none">Trang chủ</router-link></li>
            <li class="breadcrumb-item active">Sản phẩm</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">
      <!-- Top Bar -->
      <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <!-- Search -->
        <div class="input-group" style="max-width: 300px;">
          <input
            type="text"
            class="form-control form-control-sm rounded-start-pill border-end-0"
            placeholder="Tìm sản phẩm..."
            v-model="filters.search"
          >
          <span class="input-group-text bg-white rounded-end-pill border-start-0">
            <i class="bi bi-search text-muted" style="font-size: 13px;"></i>
          </span>
        </div>

        <!-- Active filter tags -->
        <div class="d-flex flex-wrap gap-1 flex-grow-1">
          <template v-for="val in filters.mauSac" :key="`mau-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('mauSac', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.kichThuoc" :key="`size-${val}`">
            <span class="filter-tag bg-dark text-white">
              Cỡ {{ val }} <i class="bi bi-x" @click="toggleFilter('kichThuoc', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.brand" :key="`brand-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('brand', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.loaiSan" :key="`ls-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('loaiSan', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.formChan" :key="`fc-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('formChan', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.chatLieu" :key="`cl-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('chatLieu', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.coGiay" :key="`cg-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('coGiay', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.xuatXu" :key="`xx-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('xuatXu', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.viTriThiDau" :key="`vt-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('viTriThiDau', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.phongCachChoi" :key="`pc-${val}`">
            <span class="filter-tag bg-dark text-white">
              {{ val }} <i class="bi bi-x" @click="toggleFilter('phongCachChoi', val)"></i>
            </span>
          </template>
          <template v-for="val in filters.discounts" :key="`disc-${val}`">
            <span class="filter-tag bg-danger text-white">
              -{{ val }}% <i class="bi bi-x" @click="toggleFilter('discounts', val)"></i>
            </span>
          </template>
          <span v-if="filters.priceMin || filters.priceMax" class="filter-tag bg-secondary text-white">
            {{ filters.priceMin ? formatPrice(filters.priceMin) : '0' }} — {{ filters.priceMax ? formatPrice(filters.priceMax) : '∞' }}
            <i class="bi bi-x" @click="filters.priceMin = null; filters.priceMax = null"></i>
          </span>
        </div>

        <!-- Filter Button -->
        <button
          class="btn btn-outline-dark btn-sm rounded-pill px-4 d-flex align-items-center gap-2 ms-auto"
          @click="showFilter = true"
        >
          Lọc & Sắp xếp
          <i class="bi bi-sliders" style="font-size: 14px;"></i>
          <span v-if="activeFilterCount > 0" class="badge bg-dark rounded-pill" style="font-size: 10px;">{{ activeFilterCount }}</span>
        </button>
      </div>

      <!-- Results Count -->
      <p class="text-muted small mb-3" v-if="!loading">
        Hiển thị <strong>{{ filteredProducts.length }}</strong> sản phẩm
      </p>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger rounded-3 border-0 shadow-sm">{{ error }}</div>

      <!-- Empty -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
        <div class="text-muted fs-1 mb-3"><i class="bi bi-inbox"></i></div>
        <p class="text-muted">Không tìm thấy sản phẩm phù hợp.</p>
        <button class="btn btn-outline-danger btn-sm rounded-pill" @click="resetFilters">Xóa bộ lọc</button>
      </div>

      <!-- Product Grid -->
      <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
        <div v-for="product in filteredProducts" :key="product.id" class="col">
          <div class="card h-100 border-0 product-card shadow-sm rounded-3" @click="goToDetail(product.id)">
            <div class="position-relative overflow-hidden p-2 bg-white rounded-top-3">
              <div class="ratio ratio-1x1">
                <img
                  :src="product.anhDaiDien || '/placeholder-shoe.png'"
                  class="object-fit-contain"
                  :alt="product.tenSanPham"
                  @error="e => e.target.src = '/placeholder-shoe.png'"
                >
              </div>
              <span v-if="product.phanTramGiam" class="position-absolute top-0 end-0 m-2 badge bg-danger rounded-pill px-2 py-1" style="font-size: 0.75rem;">-{{ product.phanTramGiam }}%</span>
              <div class="product-action position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0">
                <button class="btn btn-dark btn-sm rounded-circle shadow" title="Xem nhanh">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm rounded-circle shadow" title="Thêm vào giỏ" @click="quickAddToCart(product, $event)">
                  <i class="bi bi-cart-plus"></i>
                </button>
              </div>
            </div>
            <div class="card-body d-flex flex-column pt-2 text-center">
              <small class="text-secondary text-uppercase mb-1" style="font-size: 0.7rem;">{{ product.tenThuongHieu }}</small>
              <h6 class="card-title fw-bold text-dark text-truncate mb-2" :title="product.tenSanPham" style="font-size: 0.9rem;">
                {{ product.tenSanPham }}
              </h6>
              <div class="mt-auto">
                <template v-if="product.phanTramGiam">
                  <div class="text-muted text-decoration-line-through" style="font-size: 0.8rem;">{{ formatPrice(product.giaGocThapNhat) }}</div>
                  <div class="fw-bold text-danger" style="font-size: 0.95rem;">{{ formatPrice(product.giaSauGiamThapNhat) }}</div>
                </template>
                <div v-else class="fw-bold text-danger" style="font-size: 0.95rem;">{{ formatPrice(product.giaThapNhat) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="showFilter" class="filter-backdrop" @click="showFilter = false"></div>

    <!-- Filter Drawer -->
    <div class="filter-drawer" :class="{ 'filter-drawer--open': showFilter }">
      <!-- Header -->
      <div class="filter-drawer__header d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
        <h5 class="mb-0 fw-bold text-uppercase" style="letter-spacing: 1px;">Lọc & Sắp xếp</h5>
        <button
          class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
          style="width:34px;height:34px;"
          @click="showFilter = false"
        >
          <i class="bi bi-x-lg" style="font-size: 14px;"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="filter-drawer__body">

        <!-- ── Sắp xếp theo ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('sort')">
            <span>Sắp xếp theo</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ sortOptions.find(o => o.value === sortBy)?.label }}</span>
              <i class="bi" :class="expanded.sort ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.sort">
            <div class="d-flex flex-column gap-1 pt-2 pb-1">
              <label
                v-for="opt in sortOptions"
                :key="opt.value"
                class="sort-option d-flex align-items-center justify-content-between px-2 py-2 rounded-2"
                :class="{ 'sort-option--active': sortBy === opt.value }"
                @click="sortBy = opt.value"
              >
                <span>{{ opt.label }}</span>
                <i v-if="sortBy === opt.value" class="bi bi-check2 fw-bold"></i>
              </label>
            </div>
          </div>
        </div>

        <!-- ── Màu sắc ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('mauSac')">
            <span>Màu sắc</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.mauSac) }}</span>
              <i class="bi" :class="expanded.mauSac ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.mauSac">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="color in uniqueColors"
                :key="color"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.mauSac.includes(color) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('mauSac', color)"
              >
                <i v-if="filters.mauSac.includes(color)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ color }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Kích thước ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('kichThuoc')">
            <span>Kích thước</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.kichThuoc, 'Cỡ') }}</span>
              <i class="bi" :class="expanded.kichThuoc ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.kichThuoc">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="size in uniqueSizes"
                :key="size"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.kichThuoc.includes(size) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('kichThuoc', size)"
              >
                <i v-if="filters.kichThuoc.includes(size)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ size }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Thương hiệu ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('brand')">
            <span>Thương hiệu</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.brand) }}</span>
              <i class="bi" :class="expanded.brand ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.brand">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="b in uniqueBrands"
                :key="b"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.brand.includes(b) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('brand', b)"
              >
                <i v-if="filters.brand.includes(b)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ b }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Loại sân ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('loaiSan')">
            <span>Loại sân</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.loaiSan) }}</span>
              <i class="bi" :class="expanded.loaiSan ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.loaiSan">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="ls in uniqueLoaiSan"
                :key="ls"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.loaiSan.includes(ls) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('loaiSan', ls)"
              >
                <i v-if="filters.loaiSan.includes(ls)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ ls }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Form chân ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('formChan')">
            <span>Form chân</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.formChan) }}</span>
              <i class="bi" :class="expanded.formChan ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.formChan">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="fc in uniqueFormChan"
                :key="fc"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.formChan.includes(fc) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('formChan', fc)"
              >
                <i v-if="filters.formChan.includes(fc)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ fc }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Chất liệu ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('chatLieu')">
            <span>Chất liệu</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.chatLieu) }}</span>
              <i class="bi" :class="expanded.chatLieu ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.chatLieu">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="cl in uniqueChatLieu"
                :key="cl"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.chatLieu.includes(cl) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('chatLieu', cl)"
              >
                <i v-if="filters.chatLieu.includes(cl)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ cl }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Cổ giày ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('coGiay')">
            <span>Cổ giày</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.coGiay) }}</span>
              <i class="bi" :class="expanded.coGiay ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.coGiay">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="cg in uniqueCoGiay"
                :key="cg"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.coGiay.includes(cg) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('coGiay', cg)"
              >
                <i v-if="filters.coGiay.includes(cg)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ cg }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Xuất xứ ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('xuatXu')">
            <span>Xuất xứ</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.xuatXu) }}</span>
              <i class="bi" :class="expanded.xuatXu ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.xuatXu">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="xx in uniqueXuatXu"
                :key="xx"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.xuatXu.includes(xx) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('xuatXu', xx)"
              >
                <i v-if="filters.xuatXu.includes(xx)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ xx }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Vị trí thi đấu ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('viTriThiDau')">
            <span>Vị trí thi đấu</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.viTriThiDau) }}</span>
              <i class="bi" :class="expanded.viTriThiDau ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.viTriThiDau">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="vt in uniqueViTri"
                :key="vt"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.viTriThiDau.includes(vt) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('viTriThiDau', vt)"
              >
                <i v-if="filters.viTriThiDau.includes(vt)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ vt }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Phong cách chơi ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('phongCachChoi')">
            <span>Phong cách chơi</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">{{ hintText(filters.phongCachChoi) }}</span>
              <i class="bi" :class="expanded.phongCachChoi ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.phongCachChoi">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="pc in uniquePhongCach"
                :key="pc"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.phongCachChoi.includes(pc) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('phongCachChoi', pc)"
              >
                <i v-if="filters.phongCachChoi.includes(pc)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ pc }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Giảm giá ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('giamGia')">
            <span>Giảm giá</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint text-danger">{{ hintText(filters.discounts.map(d => `-${d}%`)) }}</span>
              <i class="bi" :class="expanded.giamGia ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.giamGia">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="pct in uniqueDiscounts"
                :key="pct"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.discounts.includes(pct) ? 'btn-danger' : 'btn-outline-danger'"
                @click="toggleFilter('discounts', pct)"
              >
                <i v-if="filters.discounts.includes(pct)" class="bi bi-check2 me-1" style="font-size:11px;"></i>-{{ pct }}%
              </button>
            </div>
          </div>
        </div>

        <!-- ── Khoảng giá ── -->
        <div class="accordion-section">
          <button class="accordion-header" @click="toggleSection('khoangGia')">
            <span>Khoảng giá</span>
            <div class="d-flex align-items-center gap-2">
              <span class="accordion-hint">
                {{ (filters.priceMin || filters.priceMax) ? `${filters.priceMin ? formatPrice(filters.priceMin) : '0'} — ${filters.priceMax ? formatPrice(filters.priceMax) : '∞'}` : '' }}
              </span>
              <i class="bi" :class="expanded.khoangGia ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </div>
          </button>
          <div class="accordion-body" v-show="expanded.khoangGia">
            <div class="d-flex align-items-center gap-2 pt-2 pb-1">
              <input
                type="number"
                class="form-control form-control-sm rounded-pill text-center"
                placeholder="Từ"
                v-model.number="filters.priceMin"
                min="0"
              >
              <span class="text-muted flex-shrink-0">—</span>
              <input
                type="number"
                class="form-control form-control-sm rounded-pill text-center"
                placeholder="Đến"
                v-model.number="filters.priceMax"
                min="0"
              >
            </div>
          </div>
        </div>

      </div><!-- /body -->

      <!-- Footer -->
      <div class="filter-drawer__footer px-4 py-3 border-top d-flex gap-2">
        <button class="btn btn-outline-secondary flex-fill rounded-pill" @click="resetFilters">
          Xóa bộ lọc
        </button>
        <button class="btn btn-dark flex-fill rounded-pill d-flex align-items-center justify-content-center gap-2" @click="showFilter = false">
          Áp dụng <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useCart } from '@/services/cart';
import Swal from 'sweetalert2';

const { addToCart } = useCart();

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const showFilter = ref(false);
const router = useRouter();
const route = useRoute();

// ── Filters (multi-select dùng mảng, single dùng null|value) ──
const filters = reactive({
  search: '',
  // Multi-select (mảng)
  mauSac: [],
  kichThuoc: [],
  brand: [],
  loaiSan: [],
  formChan: [],
  chatLieu: [],
  coGiay: [],
  xuatXu: [],
  viTriThiDau: [],
  phongCachChoi: [],
  discounts: [],
  // Single-select
  priceMin: null,
  priceMax: null,
});

const sortBy = ref('newest');

// ── Accordion state ──
const expanded = reactive({
  sort: true,
  mauSac: false,
  kichThuoc: false,
  brand: false,
  loaiSan: false,
  formChan: false,
  chatLieu: false,
  coGiay: false,
  xuatXu: false,
  viTriThiDau: false,
  phongCachChoi: false,
  giamGia: false,
  khoangGia: false,
});

const toggleSection = (key) => { expanded[key] = !expanded[key]; };

// Toggle một giá trị trong mảng filter
const toggleFilter = (key, value) => {
  const arr = filters[key];
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(value);
};

// Hiển thị hint cho multi-select
const hintText = (arr, prefix = '') => {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return prefix ? `${prefix} ${arr[0]}` : arr[0];
  return `${arr.length} đã chọn`;
};

// ── Constants ──
const sortOptions = [
  { value: 'priceAsc',    label: 'Giá (thấp - cao)' },
  { value: 'newest',      label: 'Mới nhất trước' },
  { value: 'bestSelling', label: 'Bán chạy nhất' },
  { value: 'priceDesc',   label: 'Giá (cao - thấp)' },
];


// ── Watch URL query ──
watch(() => route.query.q, (q) => {
  if (q) filters.search = q;
}, { immediate: true });

// ── Fetch ──
const fetchProducts = async () => {
  try {
    const res = await apiClient.get('/api/client/products');
    const d = res.data;
    if (Array.isArray(d)) products.value = d;
    else if (d?.content) products.value = d.content;
    else if (d?.data) products.value = d.data;
    else products.value = [];
  } catch (err) {
    error.value = 'Không thể tải danh sách sản phẩm.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// ── Unique options ──
const uniqueBrands    = computed(() => [...new Set(products.value.map(p => p.tenThuongHieu).filter(Boolean))].sort());
const uniqueXuatXu   = computed(() => [...new Set(products.value.map(p => p.tenXuatXu).filter(Boolean))].sort());
const uniqueCoGiay   = computed(() => [...new Set(products.value.map(p => p.tenCoGiay).filter(Boolean))].sort());
const uniqueChatLieu = computed(() => [...new Set(products.value.map(p => p.tenChatLieu).filter(Boolean))].sort());
const uniqueViTri    = computed(() => [...new Set(products.value.map(p => p.tenViTriThiDau).filter(Boolean))].sort());
const uniquePhongCach = computed(() => [...new Set(products.value.map(p => p.tenPhongCachChoi).filter(Boolean))].sort());
const uniqueDiscounts = computed(() =>
  [...new Set(products.value.map(p => p.phanTramGiam).filter(v => v != null && v > 0))].sort((a, b) => a - b)
);

const uniqueColors = computed(() => {
  const s = new Set();
  products.value.forEach(p => (p.variants || []).forEach(v => v.tenMauSac && s.add(v.tenMauSac)));
  return [...s].sort();
});
const uniqueSizes = computed(() => {
  const s = new Set();
  products.value.forEach(p => (p.variants || []).forEach(v => v.tenKichThuoc && s.add(v.tenKichThuoc)));
  return [...s].sort((a, b) => Number(a) - Number(b));
});
const uniqueLoaiSan = computed(() => {
  const s = new Set();
  products.value.forEach(p => (p.variants || []).forEach(v => v.tenLoaiSan && s.add(v.tenLoaiSan)));
  return [...s].sort();
});
const uniqueFormChan = computed(() => {
  const s = new Set();
  products.value.forEach(p => (p.variants || []).forEach(v => v.tenFormChan && s.add(v.tenFormChan)));
  return [...s].sort();
});

// ── Active filter count ──
const multiKeys = ['mauSac','kichThuoc','brand','loaiSan','formChan','chatLieu','coGiay','xuatXu','viTriThiDau','phongCachChoi','discounts'];

const activeFilterCount = computed(() => {
  let n = multiKeys.filter(k => filters[k].length > 0).length;
  if (filters.priceMin || filters.priceMax) n++;
  return n;
});

// ── Filtered + sorted products ──
const filteredProducts = computed(() => {
  let result = [...products.value];

  if (filters.search) {
    const k = filters.search.toLowerCase();
    result = result.filter(p => p.tenSanPham.toLowerCase().includes(k));
  }

  // Product-level multi-select
  if (filters.brand.length)         result = result.filter(p => filters.brand.includes(p.tenThuongHieu));
  if (filters.xuatXu.length)        result = result.filter(p => filters.xuatXu.includes(p.tenXuatXu));
  if (filters.coGiay.length)        result = result.filter(p => filters.coGiay.includes(p.tenCoGiay));
  if (filters.chatLieu.length)      result = result.filter(p => filters.chatLieu.includes(p.tenChatLieu));
  if (filters.viTriThiDau.length)   result = result.filter(p => filters.viTriThiDau.includes(p.tenViTriThiDau));
  if (filters.phongCachChoi.length) result = result.filter(p => filters.phongCachChoi.includes(p.tenPhongCachChoi));

  // Variant-level multi-select (sản phẩm có ít nhất 1 variant khớp)
  if (filters.mauSac.length)   result = result.filter(p => (p.variants || []).some(v => filters.mauSac.includes(v.tenMauSac)));
  if (filters.kichThuoc.length) result = result.filter(p => (p.variants || []).some(v => filters.kichThuoc.includes(v.tenKichThuoc)));
  if (filters.loaiSan.length)  result = result.filter(p => (p.variants || []).some(v => filters.loaiSan.includes(v.tenLoaiSan)));
  if (filters.formChan.length) result = result.filter(p => (p.variants || []).some(v => filters.formChan.includes(v.tenFormChan)));

  // Discount (multi-select: khớp đúng % đã chọn)
  if (filters.discounts.length) {
    result = result.filter(p => filters.discounts.includes(p.phanTramGiam));
  }

  // Price
  const ep = (p) => p.phanTramGiam ? (p.giaSauGiamThapNhat ?? p.giaThapNhat) : p.giaThapNhat;
  if (filters.priceMin != null && filters.priceMin !== '') result = result.filter(p => ep(p) >= filters.priceMin);
  if (filters.priceMax != null && filters.priceMax !== '') result = result.filter(p => ep(p) <= filters.priceMax);

  // Sort
  if (sortBy.value === 'priceAsc')    result.sort((a, b) => ep(a) - ep(b));
  else if (sortBy.value === 'priceDesc')   result.sort((a, b) => ep(b) - ep(a));
  else if (sortBy.value === 'newest')      result.sort((a, b) => b.id - a.id);
  else if (sortBy.value === 'bestSelling') result.sort((a, b) => (b.soLuongDaBan ?? 0) - (a.soLuongDaBan ?? 0));

  return result;
});

// ── Reset ──
const resetFilters = () => {
  multiKeys.forEach(k => filters[k].splice(0));
  filters.search = '';
  filters.priceMin = null;
  filters.priceMax = null;
  sortBy.value = 'newest';
};

const goToDetail = (id) => router.push({ name: 'client-product-detail', params: { id } });

const formatPrice = (value) => {
  if (value == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const quickAddToCart = (product, $event) => {
  $event.stopPropagation();
  const variants = product.variants || [];
  const inStock = variants.filter(v => v.soLuong > 0);
  if (inStock.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Hết hàng', text: 'Sản phẩm này hiện đã hết hàng.', timer: 2000, showConfirmButton: false });
    return;
  }
  if (inStock.length === 1) {
    addToCart(product, inStock[0], 1);
    Swal.fire({ icon: 'success', title: 'Đã thêm vào giỏ!', text: `${product.tenSanPham} - ${inStock[0].tenMauSac} / ${inStock[0].tenKichThuoc}`, timer: 1500, showConfirmButton: false, position: 'top-end', toast: true });
    return;
  }
  router.push({ name: 'client-product-detail', params: { id: product.id } });
};

onMounted(fetchProducts);
</script>

<style scoped>
/* ── Product Card ── */
.product-card { cursor: pointer; transition: all 0.3s ease; overflow: hidden; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
.product-card:hover .product-action { opacity: 1 !important; }
.product-action { transition: opacity 0.3s ease; }
.object-fit-contain { object-fit: contain; width: 100%; height: 100%; }

/* ── Active filter tags ── */
.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  white-space: nowrap;
}
.filter-tag i { cursor: pointer; font-size: 11px; opacity: 0.75; }
.filter-tag i:hover { opacity: 1; }

/* ── Backdrop ── */
.filter-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1040;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── Filter Drawer ── */
.filter-drawer {
  position: fixed; top: 0; right: 0;
  width: 400px; max-width: 95vw; height: 100vh;
  background: #fff; z-index: 1050;
  display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
}
.filter-drawer--open { transform: translateX(0); }
.filter-drawer__body { flex: 1; overflow-y: auto; }
.filter-drawer__footer { flex-shrink: 0; }

/* ── Accordion ── */
.accordion-section { border-bottom: 1px solid #f0f0f0; }

.accordion-header {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 14px 24px; background: none; border: none;
  font-size: 0.9rem; font-weight: 600; color: #1a1a1a;
  cursor: pointer; transition: background 0.15s; text-align: left;
}
.accordion-header:hover { background: #fafafa; }

.accordion-hint {
  font-size: 0.78rem; font-weight: 400; color: #888;
  max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.accordion-body { padding: 0 24px 12px; }

/* ── Multi-select buttons ── */
.multi-btn { transition: all 0.15s; }

/* ── Sort options ── */
.sort-option {
  cursor: pointer; transition: background 0.15s;
  user-select: none; font-size: 0.875rem; color: #333;
}
.sort-option:hover { background: #f5f5f5; }
.sort-option--active { background: #f5f5f5; font-weight: 600; color: #000; }
</style>
