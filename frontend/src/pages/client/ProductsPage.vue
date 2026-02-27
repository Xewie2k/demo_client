<template>
  <div class="products-page">
    <!-- Breadcrumb -->
    <div class="bg-light py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><router-link to="/client" class="text-decoration-none" style="color: var(--ss-accent);">Trang chủ</router-link></li>
            <li class="breadcrumb-item active">Sản phẩm</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">

      <!-- Mobile: search + filter toggle -->
      <div class="d-flex d-md-none align-items-center gap-2 mb-3">
        <div class="input-group flex-grow-1">
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
        <button
          class="btn btn-outline-dark btn-sm rounded-pill px-3 d-flex align-items-center gap-2 flex-shrink-0"
          @click="showFilter = true"
        >
          <i class="bi bi-sliders"></i> Lọc
          <span v-if="activeFilterCount > 0" class="badge bg-dark rounded-pill" style="font-size: 10px;">{{ activeFilterCount }}</span>
        </button>
      </div>

      <!-- Two-column layout: sidebar + grid -->
      <div class="row g-4 align-items-start">

        <!-- LEFT SIDEBAR (always visible on md+) -->
        <div class="col-md-3 d-none d-md-block">
          <div class="filter-sidebar">

            <!-- Sidebar header -->
            <div class="d-flex justify-content-between align-items-center px-3 py-3 border-bottom">
              <h6 class="fw-bold m-0" style="letter-spacing: 0.5px;">Bộ lọc & Sắp xếp</h6>
              <button v-if="activeFilterCount > 0" class="btn btn-link btn-sm text-danger p-0 text-decoration-none" style="font-size:0.8rem;" @click="resetFilters">
                Xóa tất cả
              </button>
            </div>

            <!-- ── Sắp xếp theo ── -->
            <div class="accordion-section">
              <div class="filter-section-title">Sắp xếp theo</div>
              <div class="accordion-body">
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
              <div class="filter-section-title">Màu sắc</div>
              <div class="accordion-body">
                <div class="d-flex flex-wrap gap-2 pt-1 pb-1">
                  <template v-for="c in uniqueColors" :key="c.name">
                    <button
                      v-if="c.hex"
                      class="color-swatch"
                      :class="{ 'color-swatch--selected': filters.mauSac.includes(c.name) }"
                      :style="{ backgroundColor: c.hex }"
                      :title="c.name"
                      @click="toggleFilter('mauSac', c.name)"
                    >
                      <i v-if="filters.mauSac.includes(c.name)" class="bi bi-check2" style="font-size:12px; text-shadow:0 0 3px rgba(0,0,0,0.8); color:#fff;"></i>
                    </button>
                    <button
                      v-else
                      class="btn btn-sm rounded-pill px-3 multi-btn"
                      :class="filters.mauSac.includes(c.name) ? 'btn-dark' : 'btn-outline-secondary'"
                      @click="toggleFilter('mauSac', c.name)"
                    >
                      <i v-if="filters.mauSac.includes(c.name)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ c.name }}
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <!-- ── Kích thước ── -->
            <div class="accordion-section">
              <div class="filter-section-title">Kích thước</div>
              <div class="accordion-body">
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
              <div class="filter-section-title">Thương hiệu</div>
              <div class="accordion-body">
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

            <!-- ── Xuất xứ ── -->
            <div class="accordion-section" v-if="uniqueXuatXu.length">
              <div class="filter-section-title">Xuất xứ</div>
              <div class="accordion-body">
                <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
                  <button
                    v-for="x in uniqueXuatXu"
                    :key="x"
                    class="btn btn-sm rounded-pill px-3 multi-btn"
                    :class="filters.xuatXu.includes(x) ? 'btn-dark' : 'btn-outline-secondary'"
                    @click="toggleFilter('xuatXu', x)"
                  >
                    <i v-if="filters.xuatXu.includes(x)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ x }}
                  </button>
                </div>
              </div>
            </div>

            <!-- ── Loại sân ── -->
            <div class="accordion-section" v-if="uniqueLoaiSan.length">
              <div class="filter-section-title">Loại sân</div>
              <div class="accordion-body">
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

            <!-- ── Cổ giày ── -->
            <div class="accordion-section" v-if="uniqueCoGiay.length">
              <div class="filter-section-title">Cổ giày</div>
              <div class="accordion-body">
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

            <!-- ── Giảm giá ── -->
            <div class="accordion-section">
              <div class="filter-section-title">Giảm giá</div>
              <div class="accordion-body">
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

            <!-- ── Khoảng giá (dual range slider) ── -->
            <div class="accordion-section">
              <div class="filter-section-title">Khoảng giá</div>
              <div class="accordion-body">
                <div class="px-1 pt-1 pb-3">
                  <div class="price-labels">
                    <span class="price-label-box">{{ formatPrice(filters.priceMin || 0) }}</span>
                    <span class="price-label-box">{{ formatPrice(filters.priceMax != null ? filters.priceMax : priceBoundMax) }}</span>
                  </div>
                  <div class="ss-range-wrap">
                    <input class="ss-range" type="range" :min="0" :max="priceBoundMax" :step="priceStep" :value="filters.priceMin || 0" :disabled="priceBoundMax <= 0" @input="onPriceMinInput($event)" />
                    <input class="ss-range ss-range-top" type="range" :min="0" :max="priceBoundMax" :step="priceStep" :value="filters.priceMax != null ? filters.priceMax : priceBoundMax" :disabled="priceBoundMax <= 0" @input="onPriceMaxInput($event)" />
                    <div class="ss-range-track">
                      <div class="ss-range-track-bg"></div>
                      <div class="ss-range-track-fill" :style="rangeFillStyle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div><!-- /filter-sidebar -->
        </div><!-- /col-md-3 -->

        <!-- RIGHT COLUMN: search (desktop) + active tags + product grid -->
        <div class="col-12 col-md-9">

          <!-- Desktop search bar -->
          <div class="d-none d-md-flex align-items-center gap-3 mb-3">
            <div class="input-group" style="max-width: 320px;">
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
            <p class="text-muted small mb-0 ms-auto" v-if="!loading">
              Hiển thị
              <strong>{{ filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filteredProducts.length) }}</strong>
              trong <strong>{{ filteredProducts.length }}</strong> sản phẩm
            </p>
          </div>

          <!-- Active filter tags -->
          <div v-if="activeFilterCount > 0 || filters.search" class="d-flex flex-wrap gap-1 mb-3">
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
            <template v-for="val in filters.xuatXu" :key="`xx-${val}`">
              <span class="filter-tag bg-dark text-white">
                {{ val }} <i class="bi bi-x" @click="toggleFilter('xuatXu', val)"></i>
              </span>
            </template>
            <template v-for="val in filters.loaiSan" :key="`ls-${val}`">
              <span class="filter-tag bg-dark text-white">
                Sân {{ val }} <i class="bi bi-x" @click="toggleFilter('loaiSan', val)"></i>
              </span>
            </template>
            <template v-for="val in filters.coGiay" :key="`cg-${val}`">
              <span class="filter-tag bg-dark text-white">
                {{ val }} <i class="bi bi-x" @click="toggleFilter('coGiay', val)"></i>
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

          <!-- Mobile result count -->
          <p class="text-muted small mb-3 d-md-none" v-if="!loading">
            Hiển thị
            <strong>{{ filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1 }}–{{ Math.min(currentPage * PAGE_SIZE, filteredProducts.length) }}</strong>
            trong <strong>{{ filteredProducts.length }}</strong> sản phẩm
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
          <div v-else class="products-grid-anchor row row-cols-2 row-cols-sm-2 row-cols-lg-3 g-3">
            <div v-for="product in paginatedProducts" :key="product.id" class="col">
              <div class="card h-100 border-0 product-card rounded-3" @click="goToDetail(product.id)">
                <div class="position-relative overflow-hidden p-2 rounded-top-3" style="background-color:#f8f9fa;">
                  <div class="ratio ratio-1x1">
                    <img
                      :src="product.anhDaiDien || '/placeholder-shoe.png'"
                      class="object-fit-contain"
                      :alt="product.tenSanPham"
                      @error="e => e.target.src = '/placeholder-shoe.png'"
                    >
                  </div>
                  <span v-if="newArrivalIds.has(product.id)" class="position-absolute top-0 start-0 m-2 badge-new">Mới</span>
                  <span v-else-if="bestSellerIds.has(product.id)" class="position-absolute top-0 start-0 m-2 badge-hot"><i class="bi bi-fire me-1"></i>Hot</span>
                  <span v-if="product.phanTramGiam" class="position-absolute top-0 end-0 m-2 badge-discount" :class="discountBadgeClass(product.phanTramGiam)" :style="discountBadgeStyle(product.phanTramGiam)">-{{ product.phanTramGiam }}%</span>
                  <div class="product-action position-absolute top-50 start-50 translate-middle d-flex gap-2 opacity-0">
                    <button class="btn btn-dark btn-sm rounded-circle shadow" title="Xem nhanh">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm rounded-circle shadow" title="Thêm vào giỏ" @click="quickAddToCart(product, $event)">
                      <i class="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="card-body px-3 pt-2 pb-3 d-flex flex-column gap-1 text-center">
                  <div class="text-muted fw-semibold" style="font-size:1.1rem;">
                    <i class="bi bi-tag-fill me-1" style="color:var(--ss-accent);font-size:0.9rem;"></i>{{ product.maSanPham }}
                  </div>
                  <div>
                    <div v-if="product.phanTramGiam" class="text-muted text-decoration-line-through" style="font-size:0.78rem; line-height:1.2;">{{ formatPrice(product.giaGocThapNhat) }}</div>
                    <div class="fw-bold" style="font-size:1.1rem; color:var(--ss-accent); line-height:1.3;">{{ formatPrice(product.phanTramGiam ? product.giaSauGiamThapNhat : product.giaThapNhat) }}</div>
                  </div>
                  <div>
                    <span v-if="product.hangCoSan" class="stock-badge stock-badge--in">Còn hàng</span>
                    <span v-else class="stock-badge stock-badge--out">Hết hàng</span>
                  </div>
                  <div v-if="product.kichThuocCoSan && product.kichThuocCoSan.length" class="d-flex flex-wrap gap-1 justify-content-center">
                    <span v-for="s in product.kichThuocCoSan" :key="s" class="size-chip">{{ s }}</span>
                  </div>
                  <h6 class="product-name text-dark mb-0 mt-1" style="font-size:0.83rem; line-height:1.4; font-weight:500;">
                    {{ product.tenSanPham }}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="!loading && !error && filteredProducts.length > 0" class="d-flex justify-content-center mt-4">
            <nav aria-label="Phân trang sản phẩm">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link rounded-start-pill" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-left" style="font-size:11px;"></i>
                  </button>
                </li>
                <li
                  v-for="(p, idx) in pageRange"
                  :key="idx"
                  class="page-item"
                  :class="{ active: p === currentPage, disabled: p === '...' }"
                >
                  <button class="page-link" @click="goToPage(p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link rounded-end-pill" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-right" style="font-size:11px;"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

        </div><!-- /col-md-9 -->

      </div><!-- /row -->
    </div>

    <!-- Mobile: Backdrop + Filter Drawer (right-side slide-out) -->
    <div v-if="showFilter" class="filter-backdrop" @click="showFilter = false"></div>

    <!-- Filter Drawer (mobile only) -->
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
          <div class="filter-section-title">Sắp xếp theo</div>
          <div class="accordion-body">
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
          <div class="filter-section-title">Màu sắc</div>
          <div class="accordion-body">
            <div class="d-flex flex-wrap gap-2 pt-1 pb-1">
              <template v-for="c in uniqueColors" :key="c.name">
                <button
                  v-if="c.hex"
                  class="color-swatch"
                  :class="{ 'color-swatch--selected': filters.mauSac.includes(c.name) }"
                  :style="{ backgroundColor: c.hex }"
                  :title="c.name"
                  @click="toggleFilter('mauSac', c.name)"
                >
                  <i v-if="filters.mauSac.includes(c.name)" class="bi bi-check2" style="font-size:12px; text-shadow:0 0 3px rgba(0,0,0,0.8); color:#fff;"></i>
                </button>
                <button
                  v-else
                  class="btn btn-sm rounded-pill px-3 multi-btn"
                  :class="filters.mauSac.includes(c.name) ? 'btn-dark' : 'btn-outline-secondary'"
                  @click="toggleFilter('mauSac', c.name)"
                >
                  <i v-if="filters.mauSac.includes(c.name)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ c.name }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- ── Kích thước ── -->
        <div class="accordion-section">
          <div class="filter-section-title">Kích thước</div>
          <div class="accordion-body">
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
          <div class="filter-section-title">Thương hiệu</div>
          <div class="accordion-body">
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

        <!-- ── Xuất xứ ── -->
        <div class="accordion-section" v-if="uniqueXuatXu.length">
          <div class="filter-section-title">Xuất xứ</div>
          <div class="accordion-body">
            <div class="d-flex flex-wrap gap-2 pt-2 pb-1">
              <button
                v-for="x in uniqueXuatXu"
                :key="x"
                class="btn btn-sm rounded-pill px-3 multi-btn"
                :class="filters.xuatXu.includes(x) ? 'btn-dark' : 'btn-outline-secondary'"
                @click="toggleFilter('xuatXu', x)"
              >
                <i v-if="filters.xuatXu.includes(x)" class="bi bi-check2 me-1" style="font-size:11px;"></i>{{ x }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Loại sân ── -->
        <div class="accordion-section" v-if="uniqueLoaiSan.length">
          <div class="filter-section-title">Loại sân</div>
          <div class="accordion-body">
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

        <!-- ── Cổ giày ── -->
        <div class="accordion-section" v-if="uniqueCoGiay.length">
          <div class="filter-section-title">Cổ giày</div>
          <div class="accordion-body">
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

        <!-- ── Giảm giá ── -->
        <div class="accordion-section">
          <div class="filter-section-title">Giảm giá</div>
          <div class="accordion-body">
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

        <!-- ── Khoảng giá (dual range slider) ── -->
        <div class="accordion-section">
          <div class="filter-section-title">Khoảng giá</div>
          <div class="accordion-body">
            <div class="px-1 pt-1 pb-3">
              <div class="price-labels">
                <span class="price-label-box">{{ formatPrice(filters.priceMin || 0) }}</span>
                <span class="price-label-box">{{ formatPrice(filters.priceMax != null ? filters.priceMax : priceBoundMax) }}</span>
              </div>
              <div class="ss-range-wrap">
                <input class="ss-range" type="range" :min="0" :max="priceBoundMax" :step="priceStep" :value="filters.priceMin || 0" :disabled="priceBoundMax <= 0" @input="onPriceMinInput($event)" />
                <input class="ss-range ss-range-top" type="range" :min="0" :max="priceBoundMax" :step="priceStep" :value="filters.priceMax != null ? filters.priceMax : priceBoundMax" :disabled="priceBoundMax <= 0" @input="onPriceMaxInput($event)" />
                <div class="ss-range-track">
                  <div class="ss-range-track-bg"></div>
                  <div class="ss-range-track-fill" :style="rangeFillStyle"></div>
                </div>
              </div>
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
  discounts: [],
  xuatXu: [],
  loaiSan: [],
  coGiay: [],
  // Single-select
  priceMin: null,
  priceMax: null,
});

const sortBy = ref('newest');

// Toggle một giá trị trong mảng filter
const toggleFilter = (key, value) => {
  const arr = filters[key];
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push(value);
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

const newArrivalIds = ref(new Set());
const bestSellerIds = ref(new Set());

// ── Fetch ──
const fetchProducts = async () => {
  try {
    const [prodRes, newRes, bestRes] = await Promise.all([
      apiClient.get('/api/client/products'),
      apiClient.get('/api/client/products/new-arrivals'),
      apiClient.get('/api/client/products/best-selling'),
    ]);
    const d = prodRes.data;
    if (Array.isArray(d)) products.value = d;
    else if (d?.content) products.value = d.content;
    else if (d?.data) products.value = d.data;
    else products.value = [];
    newArrivalIds.value = new Set((Array.isArray(newRes.data) ? newRes.data : []).map(p => p.id));
    bestSellerIds.value = new Set((Array.isArray(bestRes.data) ? bestRes.data : []).map(p => p.id));
  } catch (err) {
    error.value = 'Không thể tải danh sách sản phẩm.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const discountBadgeClass = (pct) => {
  if (!pct) return '';
  if (pct > 70) return 'text-white';
  if (pct >= 50) return 'bg-danger text-white';
  return 'bg-danger text-white';
};
const discountBadgeStyle = (pct) => pct > 70 ? 'background-color:#c62828;' : '';

// ── Unique options ──
const uniqueBrands = computed(() => [...new Set(products.value.map(p => p.tenThuongHieu).filter(Boolean))].sort());
const uniqueDiscounts = computed(() =>
  [...new Set(products.value.map(p => p.phanTramGiam).filter(v => v != null && v > 0))].sort((a, b) => a - b)
);

// Colors: build map tenMauSac → maMauHex so swatches show actual color
const colorMap = computed(() => {
  const map = new Map();
  products.value.forEach(p =>
    (p.variants || []).forEach(v => {
      if (v.tenMauSac && !map.has(v.tenMauSac)) map.set(v.tenMauSac, v.maMauHex || null);
    })
  );
  return map;
});
const uniqueColors = computed(() =>
  [...colorMap.value.entries()]
    .map(([name, hex]) => ({ name, hex }))
    .sort((a, b) => a.name.localeCompare(b.name))
);

const uniqueSizes = computed(() => {
  const s = new Set();
  products.value.forEach(p => (p.variants || []).forEach(v => v.tenKichThuoc && s.add(v.tenKichThuoc)));
  return [...s].sort((a, b) => Number(a) - Number(b));
});

const uniqueXuatXu = computed(() => [...new Set(products.value.map(p => p.tenXuatXu).filter(Boolean))].sort());
const uniqueLoaiSan = computed(() => {
  const s = new Set();
  products.value.forEach(p => (p.variants || []).forEach(v => v.tenLoaiSan && s.add(v.tenLoaiSan)));
  return [...s].sort();
});
const uniqueCoGiay = computed(() => [...new Set(products.value.map(p => p.tenCoGiay).filter(Boolean))].sort());

// ── Price range slider ──
const priceBoundMax = computed(() => {
  let mx = 0;
  const ep = (p) => p.phanTramGiam ? (p.giaSauGiamThapNhat ?? p.giaThapNhat ?? 0) : (p.giaThapNhat ?? 0);
  products.value.forEach(p => { const g = Number(ep(p)); if (g > mx) mx = g; });
  return Math.max(0, Math.floor(mx));
});
const priceStep = computed(() => {
  const mx = priceBoundMax.value;
  if (mx <= 0) return 1000;
  if (mx <= 2_000_000) return 10_000;
  if (mx <= 10_000_000) return 50_000;
  return 100_000;
});
const rangeFillStyle = computed(() => {
  const mx = priceBoundMax.value || 1;
  const left  = ((filters.priceMin || 0) / mx) * 100;
  const right = ((filters.priceMax != null ? filters.priceMax : mx) / mx) * 100;
  return { left: `${left}%`, width: `${Math.max(0, right - left)}%` };
});
const onPriceMinInput = (e) => {
  const v = Number(e.target.value);
  filters.priceMin = Math.max(0, Math.min(v, filters.priceMax != null ? filters.priceMax : priceBoundMax.value));
};
const onPriceMaxInput = (e) => {
  const v = Number(e.target.value);
  filters.priceMax = Math.min(priceBoundMax.value, Math.max(v, filters.priceMin || 0));
};
watch(priceBoundMax, (mx) => {
  if ((filters.priceMax == null || filters.priceMax === 0) && mx > 0) filters.priceMax = mx;
});

// ── Active filter count ──
const multiKeys = ['mauSac', 'kichThuoc', 'brand', 'discounts', 'xuatXu', 'loaiSan', 'coGiay'];

const activeFilterCount = computed(() => {
  let n = multiKeys.filter(k => filters[k].length > 0).length;
  if (filters.priceMin > 0 || (filters.priceMax != null && filters.priceMax < priceBoundMax.value)) n++;
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
  if (filters.brand.length) result = result.filter(p => filters.brand.includes(p.tenThuongHieu));

  // Variant-level multi-select (sản phẩm có ít nhất 1 variant khớp)
  if (filters.mauSac.length)    result = result.filter(p => (p.variants || []).some(v => filters.mauSac.includes(v.tenMauSac)));
  if (filters.kichThuoc.length) result = result.filter(p => (p.variants || []).some(v => filters.kichThuoc.includes(v.tenKichThuoc)));

  // Discount (multi-select: khớp đúng % đã chọn)
  if (filters.discounts.length) {
    result = result.filter(p => filters.discounts.includes(p.phanTramGiam));
  }

  // Xuất xứ
  if (filters.xuatXu.length) result = result.filter(p => filters.xuatXu.includes(p.tenXuatXu));
  // Loại sân (variant-level)
  if (filters.loaiSan.length) result = result.filter(p => (p.variants || []).some(v => filters.loaiSan.includes(v.tenLoaiSan)));
  // Cổ giày
  if (filters.coGiay.length) result = result.filter(p => filters.coGiay.includes(p.tenCoGiay));

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

// ── Pagination ──
const PAGE_SIZE = 12;
const currentPage = ref(1);

// Reset về trang 1 khi filter/sort thay đổi
watch(filteredProducts, () => { currentPage.value = 1; });

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / PAGE_SIZE));

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredProducts.value.slice(start, start + PAGE_SIZE);
});

// Dãy số trang hiển thị (smart range với dấu "…")
const pageRange = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

const goToPage = (p) => {
  if (typeof p !== 'number') return;
  currentPage.value = p;
  // Cuộn lên đầu vùng sản phẩm
  const el = document.querySelector('.products-grid-anchor');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ── Reset ──
const resetFilters = () => {
  multiKeys.forEach(k => filters[k].splice(0));
  filters.search = '';
  filters.priceMin = null;
  filters.priceMax = priceBoundMax.value || null;
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
/* ── Filter Sidebar ── */
.filter-sidebar {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* ── Image Badges ── */
.badge-new {
  display: inline-block;
  background: var(--ss-accent, #dc3545);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}
.badge-hot {
  display: inline-block;
  background: linear-gradient(135deg, #e53935, #c62828);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(198,40,40,0.4);
  letter-spacing: 0.3px;
}
.badge-discount {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

/* ── Product Card ── */
.product-card {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
  border: 1px solid #c8c8c8 !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07) !important;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.13) !important;
  border-color: #aaa !important;
}
.product-card:hover .product-action { opacity: 1 !important; }
.product-action { transition: opacity 0.3s ease; }
.product-card .card-body { border-top: 2px solid #e0e0e0; }
.object-fit-contain { object-fit: contain; width: 100%; height: 100%; }

/* ── Product name: 2 dòng max ── */
.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* ── Stock badge ── */
.stock-badge {
  display: inline-block;
  padding: 3px 11px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}
.stock-badge--in  { background: #fff0f0; color: var(--ss-accent, #dc3545); }
.stock-badge--out { background: #f5f5f5; color: #9e9e9e; }

/* ── Size chip ── */
.size-chip {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.82rem;
  color: #444;
  background: #fff;
  font-weight: 500;
}

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

/* ── Filter sections (always visible) ── */
.accordion-section { border-bottom: 1px solid #f0f0f0; }

.filter-section-title {
  padding: 12px 20px 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #aaa;
}

.accordion-body { padding: 0 20px 14px; }

/* ── Multi-select buttons ── */
.multi-btn { transition: all 0.15s; }
.multi-btn.btn-outline-secondary:hover,
.multi-btn.btn-outline-secondary:focus {
  background-color: #fff5f5;
  border-color: var(--ss-accent, #e53935);
  color: var(--ss-accent, #e53935);
}

/* ── Sort options ── */
.sort-option {
  cursor: pointer; transition: background 0.15s;
  user-select: none; font-size: 0.875rem; color: #333;
}
.sort-option:hover { background: #fff5f5; color: var(--ss-accent, #e53935); }
.sort-option--active { background: #fff5f5; font-weight: 600; color: var(--ss-accent, #e53935); }

/* ── Color Swatch ── */
.color-swatch {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.color-swatch:hover { transform: scale(1.1); }
.color-swatch--selected {
  border-color: #111;
  transform: scale(1.1);
}

/* ── Price labels ── */
.price-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.price-label-box {
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #e53935;
}

/* ── Dual Range Slider ── */
.ss-range-wrap { position: relative; padding: 16px 0 8px; }
.ss-range { position: relative; z-index: 2; width: 100%; appearance: none; height: 20px; background: transparent; outline: none; margin: 0; }
.ss-range-top { position: absolute; left: 0; right: 0; top: 16px; z-index: 3; pointer-events: none; }
.ss-range-top::-webkit-slider-thumb { pointer-events: auto; }
.ss-range-top::-moz-range-thumb { pointer-events: auto; }
.ss-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 13px; height: 13px; border-radius: 50%; background: #e53935; border: 2px solid #c62828; box-shadow: 0 1px 4px rgba(229,57,53,0.4); cursor: pointer; }
.ss-range::-moz-range-thumb { width: 13px; height: 13px; border-radius: 50%; background: #e53935; border: 2px solid #c62828; box-shadow: 0 1px 4px rgba(229,57,53,0.4); cursor: pointer; }
.ss-range-track { position: absolute; left: 0; right: 0; top: 24px; height: 4px; z-index: 1; }
.ss-range-track-bg { position: absolute; inset: 0; border-radius: 999px; background: #e0e0e0; }
.ss-range-track-fill { position: absolute; top: 0; height: 4px; border-radius: 999px; background: #e53935; }

/* ── Pagination ── */
.pagination .page-link {
  color: #333;
  border-color: #dee2e6;
  min-width: 36px;
  text-align: center;
  font-size: 0.85rem;
}
.pagination .page-item.active .page-link {
  background-color: var(--ss-accent, #e53935);
  border-color: var(--ss-accent, #e53935);
  color: #fff;
}
.pagination .page-link:hover:not(.disabled) {
  background-color: #fff5f5;
  border-color: var(--ss-accent, #e53935);
  color: var(--ss-accent, #e53935);
}
.pagination .page-item.disabled .page-link { color: #aaa; }
</style>
