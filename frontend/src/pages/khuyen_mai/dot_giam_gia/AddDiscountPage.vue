<!-- File: src/pages/khuyen_mai/dot_giam_gia/AddDiscountPage.vue -->
<template>
  <div class="discount-page">
    <div class="header-section">
      <h2 class="page-title">THÊM ĐỢT GIẢM GIÁ</h2>
      <button class="btn-back" @click="router.push('/admin/giam-gia/dot')">
        <i class="fa-solid fa-arrow-left"></i> Quay lại
      </button>
    </div>

    <div class="content-wrapper">
      <!-- Cột trái: Form thông tin -->
      <div class="left-column">
        <div class="card info-card">
          <h4 class="card-title">Thông tin đợt giảm giá</h4>

          <div class="form-group">
            <label class="label">Mã đợt (Tự động sinh):</label>
            <input
              type="text"
              class="form-control"
              disabled
              placeholder="Mã tự sinh (DGG-...)"
              style="background-color: #f1f5f9"
            />
          </div>

          <div class="form-group">
            <label class="label"
              >Tên đợt giảm giá: <span class="text-red">*</span></label
            >
            <input
              v-model="formData.tenDotGiamGia"
              type="text"
              class="form-control"
              placeholder="Nhập tên đợt..."
              :disabled="isLoading"
            />
          </div>

          <!-- ✅ BỎ PHẦN CHỌN LOẠI GIẢM (mặc định giảm theo %) -->

          <div class="form-group">
            <label class="label"
              >Giá trị giảm (%): <span class="text-red">*</span></label
            >
            <input
              v-model.number="formData.giaTriGiamGia"
              type="number"
              class="form-control"
              placeholder="Mời nhập giảm theo %"
              min="1"
              max="100"
              :disabled="isLoading"
            />
            <div
              class="hint"
              v-if="
                formData.giaTriGiamGia !== null &&
                (formData.giaTriGiamGia < 1 || formData.giaTriGiamGia > 100)
              "
            >
              Giá trị giảm phải nằm trong khoảng 1 - 100 (%).
            </div>
          </div>

          <div class="form-group">
            <label class="label"
              >Ngày bắt đầu: <span class="text-red">*</span></label
            >
            <input
              v-model="formData.ngayBatDau"
              type="date"
              class="form-control"
              @click="$event.target.showPicker()"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label class="label"
              >Ngày kết thúc: <span class="text-red">*</span></label
            >
            <input
              v-model="formData.ngayKetThuc"
              type="date"
              class="form-control"
              @click="$event.target.showPicker()"
              :disabled="isLoading"
            />
            <div class="hint" v-if="dateError">
              {{ dateError }}
            </div>
          </div>

          <div class="action-buttons mt-4">
            <button
              class="btn-update"
              @click="submitCreate"
              :disabled="isLoading || !canSubmit"
              :title="!canSubmit ? 'Vui lòng nhập đúng dữ liệu bắt buộc' : ''"
            >
              <i class="fa-solid fa-plus me-1"></i>
              {{ isLoading ? "Đang xử lý..." : "Tạo đợt giảm giá" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cột phải: Chọn sản phẩm -->
      <div class="right-column">
        <div class="card product-select-card">
          <h4 class="card-title">Chọn sản phẩm áp dụng</h4>

          <div class="search-bar mb-3">
            <div class="input-wrapper">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Source Filters -->
          <div class="filter-grid mb-3">
            <!-- ✅ Combobox giống ProductManagePage.vue -->
            <div class="ss-combo" :class="{ disabled: isLoading }">
              <input
                v-model="sourceFilterText.brand"
                class="ss-combo-input"
                placeholder="-- Thương hiệu --"
                :disabled="isLoading"
                @focus="openCombo('sBrandOpen')"
                @blur="closeCombo('sBrandOpen')"
                @input="onSourceInput('brand')"
              />
              <span class="material-icons-outlined ss-combo-ic">expand_more</span>

              <div v-if="combo.sBrandOpen && !isLoading" class="ss-combo-list" @mousedown.prevent>
                <div
                  class="ss-combo-item"
                  :class="{ active: !sourceFilters.brand && !sourceFilterText.brand }"
                  @mousedown.prevent="selectSource('brand', null)"
                  title="Bỏ lọc thương hiệu"
                >
                  Tất cả
                </div>

                <div
                  v-for="opt in sourceBrandSuggest"
                  :key="`sb-${opt}`"
                  class="ss-combo-item"
                  :class="{ active: sourceFilters.brand === opt }"
                  @mousedown.prevent="selectSource('brand', opt)"
                  :title="opt"
                >
                  {{ opt }}
                </div>

                <div v-if="!sourceBrandSuggest.length" class="ss-combo-empty">
                  Không có gợi ý phù hợp
                </div>
              </div>
            </div>

            <div class="ss-combo" :class="{ disabled: isLoading }">
              <input
                v-model="sourceFilterText.origin"
                class="ss-combo-input"
                placeholder="-- Xuất xứ --"
                :disabled="isLoading"
                @focus="openCombo('sOriginOpen')"
                @blur="closeCombo('sOriginOpen')"
                @input="onSourceInput('origin')"
              />
              <span class="material-icons-outlined ss-combo-ic">expand_more</span>

              <div v-if="combo.sOriginOpen && !isLoading" class="ss-combo-list" @mousedown.prevent>
                <div
                  class="ss-combo-item"
                  :class="{ active: !sourceFilters.origin && !sourceFilterText.origin }"
                  @mousedown.prevent="selectSource('origin', null)"
                  title="Bỏ lọc xuất xứ"
                >
                  Tất cả
                </div>

                <div
                  v-for="opt in sourceOriginSuggest"
                  :key="`so-${opt}`"
                  class="ss-combo-item"
                  :class="{ active: sourceFilters.origin === opt }"
                  @mousedown.prevent="selectSource('origin', opt)"
                  :title="opt"
                >
                  {{ opt }}
                </div>

                <div v-if="!sourceOriginSuggest.length" class="ss-combo-empty">
                  Không có gợi ý phù hợp
                </div>
              </div>
            </div>

            <button
              class="btn-clear-filter bg-white"
              type="button"
              @click="clearSourceFilters"
              title="Xóa bộ lọc"
              :disabled="isLoading"
            >
              <i class="fa-solid fa-filter-circle-xmark"></i>
            </button>
          </div>

          <div class="table-wrapper-mini">
            <table class="custom-table">
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 50px" />
                <col style="width: 60px" />
                <col style="width: 150px" />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th class="text-center">#</th>
                  <th class="text-center">Ảnh</th>
                  <th class="text-center">Mã SP</th>
                  <th class="text-center">Tên sản phẩm</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredParentProducts.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">
                    Không tìm thấy dữ liệu
                  </td>
                </tr>

                <template v-for="group in paginatedParentProducts" :key="group.idSanPham">
                  <tr class="parent-row">
                    <td class="text-center">
                      <button class="btn-expand" @click="toggleExpand(group.idSanPham)" type="button">
                        <i
                          class="fa-solid"
                          :class="expandedGroupIds.includes(group.idSanPham) ? 'fa-minus' : 'fa-plus'"
                        ></i>
                      </button>
                    </td>

                    <td class="text-center" @click.stop>
                      <input
                        type="checkbox"
                        class="custom-checkbox"
                        :checked="isGroupSelected(group.idSanPham)"
                        @change="handleParentCheck(group.idSanPham, $event.target.checked)"
                      />
                    </td>

                    <td class="text-center td-click" @click="toggleExpand(group.idSanPham)">
                      <div class="thumb-wrap">
                        <img :src="getGroupThumb(group)" class="product-thumb" @error="onImgError" alt="thumb" />
                        <span v-if="displayPercent" class="discount-badge">-{{ displayPercent }}%</span>
                      </div>
                    </td>

                    <td class="text-center td-click" @click="toggleExpand(group.idSanPham)">
                      {{ group.maSanPham }}
                    </td>

                    <td class="text-center td-click" @click="toggleExpand(group.idSanPham)">
                      {{ group.tenSanPham }}
                    </td>
                  </tr>

                  <tr
                    v-if="expandedGroupIds.includes(group.idSanPham)"
                    v-for="v in group.variants"
                    :key="v.id"
                    class="child-row"
                    @click="fillSourceFilters(v)"
                    style="cursor: pointer"
                    title="Click để điền bộ lọc"
                  >
                    <td></td>

                    <td class="text-center" @click.stop>
                      <input
                        type="checkbox"
                        class="custom-checkbox"
                        :value="v.id"
                        v-model="selectedVariantIds"
                        @change="onSourceCheckboxChange"
                      />
                    </td>

                    <td class="text-center">
                      <div class="thumb-wrap">
                        <img :src="getVariantThumb(v)" class="product-thumb-sm" @error="onImgError" alt="thumb" />
                        <span v-if="displayPercent" class="discount-badge sm">-{{ displayPercent }}%</span>
                      </div>
                    </td>

                    <td class="text-center text-muted small">{{ v.maChiTietSanPham }}</td>
                    <td class="small">{{ v.tenMauSac }} - {{ v.tenKichThuoc }} - {{ v.tenLoaiSan }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div class="pagination" v-if="totalPages > 0">
            <button class="page-btn" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="page-btn active">{{ currentPage }}</button>
            <button class="page-btn" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Danh sách chi tiết đã chọn -->
    <div class="bottom-section">
      <div class="card detail-card">
        <div class="detail-header">
          <h3 class="section-title">
            Danh sách chi tiết sản phẩm được chọn
            <span v-if="selectedVariantIds.length" class="count-tag">({{ selectedVariantIds.length }})</span>
          </h3>
          <button class="btn-danger-outline" @click="removeAll" v-if="selectedVariantIds.length > 0">
            <i class="fa-solid fa-trash"></i> Xóa tất cả
          </button>
        </div>

        <!-- ✅ combobox giống ProductManagePage.vue -->
        <div class="filter-grid mb-2" v-if="selectedVariantIds.length > 0">
          <div class="ss-combo">
            <input
              v-model="detailFilterText.brand"
              class="ss-combo-input"
              placeholder="-- Thương hiệu --"
              @focus="openCombo('dBrandOpen')"
              @blur="closeCombo('dBrandOpen')"
              @input="onDetailInput('brand')"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.dBrandOpen" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !detailFilters.brand && !detailFilterText.brand }"
                @mousedown.prevent="selectDetail('brand', null)"
                title="Bỏ lọc thương hiệu"
              >
                Tất cả
              </div>

              <div
                v-for="opt in detailBrandSuggest"
                :key="`db-${opt}`"
                class="ss-combo-item"
                :class="{ active: detailFilters.brand === opt }"
                @mousedown.prevent="selectDetail('brand', opt)"
                :title="opt"
              >
                {{ opt }}
              </div>

              <div v-if="!detailBrandSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>

          <div class="ss-combo">
            <input
              v-model="detailFilterText.material"
              class="ss-combo-input"
              placeholder="-- Chất liệu --"
              @focus="openCombo('dMaterialOpen')"
              @blur="closeCombo('dMaterialOpen')"
              @input="onDetailInput('material')"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.dMaterialOpen" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !detailFilters.material && !detailFilterText.material }"
                @mousedown.prevent="selectDetail('material', null)"
                title="Bỏ lọc chất liệu"
              >
                Tất cả
              </div>

              <div
                v-for="opt in detailMaterialSuggest"
                :key="`dm-${opt}`"
                class="ss-combo-item"
                :class="{ active: detailFilters.material === opt }"
                @mousedown.prevent="selectDetail('material', opt)"
                :title="opt"
              >
                {{ opt }}
              </div>

              <div v-if="!detailMaterialSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>

          <div class="ss-combo">
            <input
              v-model="detailFilterText.size"
              class="ss-combo-input"
              placeholder="-- Kích cỡ --"
              @focus="openCombo('dSizeOpen')"
              @blur="closeCombo('dSizeOpen')"
              @input="onDetailInput('size')"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.dSizeOpen" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !detailFilters.size && !detailFilterText.size }"
                @mousedown.prevent="selectDetail('size', null)"
                title="Bỏ lọc kích cỡ"
              >
                Tất cả
              </div>

              <div
                v-for="opt in detailSizeSuggest"
                :key="`ds-${opt}`"
                class="ss-combo-item"
                :class="{ active: detailFilters.size === opt }"
                @mousedown.prevent="selectDetail('size', opt)"
                :title="opt"
              >
                {{ opt }}
              </div>

              <div v-if="!detailSizeSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>

          <div class="ss-combo">
            <input
              v-model="detailFilterText.color"
              class="ss-combo-input"
              placeholder="-- Màu sắc --"
              @focus="openCombo('dColorOpen')"
              @blur="closeCombo('dColorOpen')"
              @input="onDetailInput('color')"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.dColorOpen" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !detailFilters.color && !detailFilterText.color }"
                @mousedown.prevent="selectDetail('color', null)"
                title="Bỏ lọc màu sắc"
              >
                Tất cả
              </div>

              <div
                v-for="opt in detailColorSuggest"
                :key="`dc-${opt}`"
                class="ss-combo-item"
                :class="{ active: detailFilters.color === opt }"
                @mousedown.prevent="selectDetail('color', opt)"
                :title="opt"
              >
                {{ opt }}
              </div>

              <div v-if="!detailColorSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>

          <div class="ss-combo">
            <input
              v-model="detailFilterText.sole"
              class="ss-combo-input"
              placeholder="-- Loại sân --"
              @focus="openCombo('dSoleOpen')"
              @blur="closeCombo('dSoleOpen')"
              @input="onDetailInput('sole')"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.dSoleOpen" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !detailFilters.sole && !detailFilterText.sole }"
                @mousedown.prevent="selectDetail('sole', null)"
                title="Bỏ lọc loại sân"
              >
                Tất cả
              </div>

              <div
                v-for="opt in detailSoleSuggest"
                :key="`dsl-${opt}`"
                class="ss-combo-item"
                :class="{ active: detailFilters.sole === opt }"
                @mousedown.prevent="selectDetail('sole', opt)"
                :title="opt"
              >
                {{ opt }}
              </div>

              <div v-if="!detailSoleSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>

          <button class="btn-clear-filter bg-white" type="button" @click="clearDetailFilters" title="Xóa bộ lọc">
            <i class="fa-solid fa-filter-circle-xmark"></i>
          </button>
        </div>

        <!-- ✅ Range lọc khoảng giá: min/max theo GIÁ THỰC TẾ của biến thể đã chọn -->
        <div class="price-range-box" v-if="selectedVariantIds.length > 0 && detailPriceBounds.max > 0">
          <div class="price-range-head">
            <div class="price-range-title">
              <i class="fa-solid fa-sliders"></i> Khoảng giá
            </div>
            <div class="price-range-value">
              {{ formatCurrency(detailFilters.minPrice) }} - {{ formatCurrency(detailFilters.maxPrice) }}
            </div>
          </div>

          <div class="range-wrap">
            <div class="range-track"></div>
            <div class="range-progress" :style="rangeProgressStyle"></div>

            <input
              class="range-input thumb-min"
              :class="{ top: isMinThumbOnTop }"
              type="range"
              :min="detailPriceBounds.min"
              :max="detailPriceBounds.max"
              :step="priceStep"
              v-model.number="detailFilters.minPrice"
              @input="onMinRangeInput"
            />

            <input
              class="range-input thumb-max"
              type="range"
              :min="detailPriceBounds.min"
              :max="detailPriceBounds.max"
              :step="priceStep"
              v-model.number="detailFilters.maxPrice"
              @input="onMaxRangeInput"
            />
          </div>

          <div class="price-range-foot">
            <span>{{ formatCurrency(detailPriceBounds.min) }}</span>
            <span>{{ formatCurrency(detailPriceBounds.max) }}</span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th width="40" class="text-center">
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    @change="toggleAllVariants"
                    :checked="isAllVariantsSelected"
                  />
                </th>
                <th class="text-center" width="50">STT</th>
                <th class="text-center" width="60">Ảnh</th>
                <th>Mã SP (CT)</th>
                <th class="text-center">Tên sản phẩm</th>
                <th class="text-center">Giá bán</th>
                <th class="text-center">Thương hiệu</th>
                <th class="text-center">Chất liệu</th>
                <th class="text-center">Kích cỡ</th>
                <th class="text-center">Màu sắc</th>
                <th class="text-center">Loại sân</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="variantsDisplay.length === 0">
                <td colspan="11" class="text-center text-muted py-5">
                  <div class="empty-state">
                    <i class="fa-solid fa-box-open fa-2x mb-2"></i>
                    <p>Chưa có sản phẩm nào được chọn.</p>
                  </div>
                </td>
              </tr>

              <tr
                v-for="(item, index) in paginatedVariantsDisplay"
                :key="item.id"
                @click="fillFilters(item)"
                style="cursor: pointer"
                title="Click để điền thông tin vào bộ lọc"
              >
                <td class="text-center" @click.stop>
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    :value="item.id"
                    v-model="selectedVariantIds"
                    @change="onDetailCheckboxChange"
                  />
                </td>

                <td class="text-center">
                  {{ (currentDetailPage - 1) * detailItemsPerPage + index + 1 }}
                </td>

                <td class="text-center">
                  <div class="thumb-wrap">
                    <img :src="getVariantThumb(item)" class="product-thumb-sm" @error="onImgError" alt="thumb" />
                    <span v-if="displayPercent" class="discount-badge sm">-{{ displayPercent }}%</span>
                  </div>
                </td>

                <td class="text-primary">{{ item.maChiTietSanPham }}</td>

                <td class="text-wrap-name text-center">{{ item.tenSanPham }}</td>

                <!-- ✅ HIỂN THỊ GIÁ THỰC TẾ + GIÁ SAU GIẢM -->
                <td class="text-center price-cell">
                  <template v-if="displayPercent">
                    <span class="price-original">{{ formatCurrency(getGiaBienThe(item)) }}</span>
                    <span class="price-discounted">{{ formatCurrency(getGiaBienThe(item) * (1 - displayPercent / 100)) }}</span>
                  </template>
                  <template v-else>
                    {{ formatCurrency(getGiaBienThe(item)) }}
                  </template>
                </td>

                <td class="text-center">{{ item.tenThuongHieu }}</td>
                <td class="text-center">{{ item.tenChatLieu }}</td>
                <td class="text-center">{{ item.tenKichThuoc }}</td>

                <td class="text-center">
                  <span class="color-dot" :style="{ backgroundColor: mapColor(item.tenMauSac) }"></span>
                  {{ item.tenMauSac }}
                </td>

                <td class="text-center">{{ item.tenLoaiSan }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="totalDetailPages > 0">
          <button class="page-btn" @click="changeDetailPage(currentDetailPage - 1)" :disabled="currentDetailPage === 1">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="page-btn active">{{ currentDetailPage }}</button>
          <button
            class="page-btn"
            @click="changeDetailPage(currentDetailPage + 1)"
            :disabled="currentDetailPage === totalDetailPages"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { discountService } from "@/services/khuyen_mai/dot_giam_gia/discountService";
import { useRouter } from "vue-router";

const router = useRouter();

/* =========================
   FIX ẢNH: normalize + fallback
   ========================= */
const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  ""
);

const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='6' fill='%23F3F4F6'/%3E%3Cpath d='M12 26l6-6 4 4 6-6 4 4' stroke='%239CA3AF' stroke-width='2' fill='none'/%3E%3Ccircle cx='16' cy='16' r='2' fill='%239CA3AF'/%3E%3C/svg%3E";

const normalizeImgUrl = (raw) => {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  if (s.startsWith("data:image/")) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  if (s.startsWith("uploads/")) return `${API_BASE}/${s}`;
  return `${API_BASE}/uploads/${s}`;
};

const extractRawImg = (v) => {
  return v?.anh || v?.urlAnh || v?.duongDanAnh || v?.anhDaiDien || v?.anhSanPham || v?.hinhAnh || v?.image || v?.imageUrl || v?.thumbnail || "";
};

const getVariantThumb = (v) => normalizeImgUrl(extractRawImg(v)) || IMG_PLACEHOLDER;

const getGroupThumb = (group) => {
  if (!group?.variants?.length) return IMG_PLACEHOLDER;
  const pick = group.variants.find((x) => normalizeImgUrl(extractRawImg(x))) || group.variants[0];
  return getVariantThumb(pick);
};

const onImgError = (e) => {
  const img = e?.target;
  if (!img) return;
  if (img.src === IMG_PLACEHOLDER) return;
  img.src = IMG_PLACEHOLDER;
};
/* ========================= */

const formData = reactive({
  tenDotGiamGia: "",
  loaiGiamGia: false, // ✅ mặc định %
  giaTriGiamGia: null,
  ngayBatDau: "",
  ngayKetThuc: "",
  trangThai: true,
});

const displayPercent = computed(() => {
  const v = Number(formData.giaTriGiamGia);
  if (!Number.isFinite(v) || v < 1 || v > 100) return null;
  return Math.round(v);
});

const rawVariants = ref([]);
const selectedVariantIds = ref([]);

const searchKeyword = ref("");
const isLoading = ref(false);

const currentPage = ref(1);
const itemsPerPage = 5;

const currentDetailPage = ref(1);
const detailItemsPerPage = 5;

const expandedGroupIds = ref([]);

/* =========================
   ✅ COMBOBOX giống ProductManagePage.vue
   ========================= */
const combo = reactive({
  sBrandOpen: false,
  sOriginOpen: false,
  dBrandOpen: false,
  dMaterialOpen: false,
  dSizeOpen: false,
  dColorOpen: false,
  dSoleOpen: false,
});

const closeT = {
  sBrandOpen: 0,
  sOriginOpen: 0,
  dBrandOpen: 0,
  dMaterialOpen: 0,
  dSizeOpen: 0,
  dColorOpen: 0,
  dSoleOpen: 0,
};

const openCombo = (key) => {
  if (isLoading.value) return;
  combo[key] = true;
};

const closeCombo = (key) => {
  clearTimeout(closeT[key]);
  closeT[key] = window.setTimeout(() => {
    combo[key] = false;
  }, 140);
};

const lc = (s) => String(s ?? "").trim().toLowerCase();

/* =========================
   SOURCE FILTERS (bảng phải)
   - sourceFilters: giá trị được chọn (match exact)
   - sourceFilterText: text gõ tay (match includes)
   ========================= */
const sourceFilters = reactive({ brand: "", origin: "" });
const sourceFilterText = reactive({ brand: "", origin: "" });

const onSourceInput = (key) => {
  sourceFilters[key] = "";
  if (key === "brand") combo.sBrandOpen = true;
  if (key === "origin") combo.sOriginOpen = true;
};

const selectSource = (key, val) => {
  if (!val) {
    sourceFilters[key] = "";
    sourceFilterText[key] = "";
  } else {
    sourceFilters[key] = val;
    sourceFilterText[key] = val;
  }
  if (key === "brand") combo.sBrandOpen = false;
  if (key === "origin") combo.sOriginOpen = false;
};

const clearSourceFilters = () => {
  sourceFilters.brand = "";
  sourceFilters.origin = "";
  sourceFilterText.brand = "";
  sourceFilterText.origin = "";
};

const fillSourceFilters = (item) => {
  selectSource("brand", item.tenThuongHieu || null);
  selectSource("origin", item.tenXuatXu || null);
};

const onSourceCheckboxChange = (e) => {
  if (!e.target.checked) clearSourceFilters();
};

const sourceFilterOptions = computed(() => {
  const data = rawVariants.value;
  const getOpts = (k) => [...new Set(data.map((i) => i[k]))].filter(Boolean).sort();
  return {
    brands: getOpts("tenThuongHieu"),
    origins: getOpts("tenXuatXu"),
  };
});

const sourceBrandSuggest = computed(() => {
  const q = lc(sourceFilterText.brand);
  const list = sourceFilterOptions.value.brands || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});

const sourceOriginSuggest = computed(() => {
  const q = lc(sourceFilterText.origin);
  const list = sourceFilterOptions.value.origins || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});

/* =========================
   GROUP sản phẩm
   ========================= */
const productGroups = computed(() => {
  const groups = {};
  rawVariants.value.forEach((v) => {
    const pId = v.idSanPham;
    if (!groups[pId]) {
      groups[pId] = {
        idSanPham: pId,
        tenSanPham: v.tenSanPham,
        maSanPham: v.maSanPham || `SP-${pId}`,
        variants: [],
      };
    }
    groups[pId].variants.push(v);
  });
  return Object.values(groups);
});

const filteredParentProducts = computed(() => {
  let groups = productGroups.value;

  if (searchKeyword.value) {
    const key = searchKeyword.value.toLowerCase();
    groups = groups.filter(
      (g) => (g.tenSanPham || "").toLowerCase().includes(key) || (g.maSanPham || "").toLowerCase().includes(key)
    );
  }

  // ✅ match cả exact và includes
  if (sourceFilters.brand || sourceFilters.origin || sourceFilterText.brand || sourceFilterText.origin) {
    groups = groups.filter((g) =>
      g.variants.some((v) => {
        const th = lc(v.tenThuongHieu);
        const xx = lc(v.tenXuatXu);

        const matchBrand =
          (!sourceFilters.brand && !sourceFilterText.brand) ||
          (sourceFilters.brand && v.tenThuongHieu === sourceFilters.brand) ||
          (!sourceFilters.brand && sourceFilterText.brand && th.includes(lc(sourceFilterText.brand)));

        const matchOrigin =
          (!sourceFilters.origin && !sourceFilterText.origin) ||
          (sourceFilters.origin && v.tenXuatXu === sourceFilters.origin) ||
          (!sourceFilters.origin && sourceFilterText.origin && xx.includes(lc(sourceFilterText.origin)));

        return matchBrand && matchOrigin;
      })
    );
  }

  return groups;
});

const totalPages = computed(() => Math.ceil(filteredParentProducts.value.length / itemsPerPage));

const paginatedParentProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredParentProducts.value.slice(start, end);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

watch(searchKeyword, () => (currentPage.value = 1));
watch(
  () => [sourceFilters.brand, sourceFilters.origin, sourceFilterText.brand, sourceFilterText.origin],
  () => (currentPage.value = 1)
);

watch(
  () => filteredParentProducts.value.length,
  () => {
    if (currentPage.value > totalPages.value) currentPage.value = Math.max(1, totalPages.value);
  }
);

const allSelectedVariants = computed(() => rawVariants.value.filter((v) => selectedVariantIds.value.includes(v.id)));

/* =========================
   ✅ GIÁ THỰC TẾ (variant)
   ========================= */
const getGiaBienThe = (v) => {
  const raw =
    v?.giaBan ??
    v?.gia_ban ??
    v?.giaNiemYet ??
    v?.gia_niem_yet ??
    v?.donGia ??
    v?.don_gia ??
    v?.gia ??
    v?.price ??
    0;

  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

/* =========================
   FILTERS bảng dưới
   - detailFilters.xxx: giá trị được chọn (match exact)
   - detailFilterText.xxx: text gõ tay (match includes)
   ========================= */
const detailFilters = reactive({
  brand: "",
  material: "",
  color: "",
  size: "",
  sole: "",
  minPrice: 0,
  maxPrice: 0,
});

const detailFilterText = reactive({
  brand: "",
  material: "",
  color: "",
  size: "",
  sole: "",
});

const onDetailInput = (key) => {
  detailFilters[key] = "";
  if (key === "brand") combo.dBrandOpen = true;
  if (key === "material") combo.dMaterialOpen = true;
  if (key === "size") combo.dSizeOpen = true;
  if (key === "color") combo.dColorOpen = true;
  if (key === "sole") combo.dSoleOpen = true;
};

const selectDetail = (key, val) => {
  if (!val) {
    detailFilters[key] = "";
    detailFilterText[key] = "";
  } else {
    detailFilters[key] = val;
    detailFilterText[key] = val;
  }

  if (key === "brand") combo.dBrandOpen = false;
  if (key === "material") combo.dMaterialOpen = false;
  if (key === "size") combo.dSizeOpen = false;
  if (key === "color") combo.dColorOpen = false;
  if (key === "sole") combo.dSoleOpen = false;
};

const filterOptions = computed(() => {
  const data = allSelectedVariants.value;
  const getOptions = (key) => [...new Set(data.map((item) => item[key]))].filter(Boolean).sort();
  return {
    brands: getOptions("tenThuongHieu"),
    materials: getOptions("tenChatLieu"),
    colors: getOptions("tenMauSac"),
    sizes: getOptions("tenKichThuoc"),
    soles: getOptions("tenLoaiSan"),
  };
});

const detailBrandSuggest = computed(() => {
  const q = lc(detailFilterText.brand);
  const list = filterOptions.value.brands || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});
const detailMaterialSuggest = computed(() => {
  const q = lc(detailFilterText.material);
  const list = filterOptions.value.materials || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});
const detailSizeSuggest = computed(() => {
  const q = lc(detailFilterText.size);
  const list = filterOptions.value.sizes || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});
const detailColorSuggest = computed(() => {
  const q = lc(detailFilterText.color);
  const list = filterOptions.value.colors || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});
const detailSoleSuggest = computed(() => {
  const q = lc(detailFilterText.sole);
  const list = filterOptions.value.soles || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x).includes(q)).slice(0, 50);
});

/* =========================
   ✅ RANGE: min/max theo GIÁ THỰC TẾ của biến thể đã chọn
   ========================= */
const detailPriceBounds = computed(() => {
  const data = allSelectedVariants.value;
  const prices = data.map(getGiaBienThe).filter((n) => Number.isFinite(n) && n > 0);
  if (!prices.length) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
});

const priceStep = computed(() => {
  const max = detailPriceBounds.value.max || 0;
  if (max <= 0) return 1000;
  if (max <= 500000) return 1000;
  if (max <= 5000000) return 10000;
  return 50000;
});

/**
 * ✅ LOGIC “KHÔNG BỊ SOI”:
 * - Khi bounds thay đổi do thêm/bớt biến thể:
 *   + Nếu min đang ở sát biên min cũ -> tự kéo về min mới (khi có giá rẻ hơn)
 *   + Nếu max đang ở sát biên max cũ -> tự kéo về max mới (khi có giá đắt hơn)
 * - Nếu user đã kéo để lọc (không còn ở sát biên) thì KHÔNG tự nhảy nữa, chỉ clamp vào bounds.
 */
const lastBounds = reactive({ min: 0, max: 0, step: 1000 });

watch(
  () => detailPriceBounds.value,
  (b) => {
    const hasSelection = allSelectedVariants.value.length > 0 && b.max > 0;

    if (!hasSelection) {
      detailFilters.minPrice = 0;
      detailFilters.maxPrice = 0;
      lastBounds.min = 0;
      lastBounds.max = 0;
      lastBounds.step = priceStep.value || 1000;
      return;
    }

    const prevMin = lastBounds.min || b.min;
    const prevMax = lastBounds.max || b.max;
    const prevStep = lastBounds.step || priceStep.value || 1;

    const curMin = Number(detailFilters.minPrice);
    const curMax = Number(detailFilters.maxPrice);

    // init lần đầu khi vừa bắt đầu chọn sản phẩm
    const firstInit = !lastBounds.max || !Number.isFinite(curMin) || !Number.isFinite(curMax) || (curMin === 0 && curMax === 0);
    if (firstInit) {
      detailFilters.minPrice = b.min;
      detailFilters.maxPrice = b.max;
    } else {
      // ✅ bám min nếu đang ở sát min cũ và min mới nhỏ hơn (thêm biến thể rẻ hơn)
      const minWasAtEdge = curMin <= prevMin + prevStep;
      if (b.min < prevMin && minWasAtEdge) {
        detailFilters.minPrice = b.min;
      }

      // ✅ bám max nếu đang ở sát max cũ và max mới lớn hơn (thêm biến thể đắt hơn)
      const maxWasAtEdge = curMax >= prevMax - prevStep;
      if (b.max > prevMax && maxWasAtEdge) {
        detailFilters.maxPrice = b.max;
      }
    }

    // ✅ clamp chắc chắn nằm trong bounds
    detailFilters.minPrice = Math.max(b.min, Math.min(Number(detailFilters.minPrice), b.max));
    detailFilters.maxPrice = Math.max(b.min, Math.min(Number(detailFilters.maxPrice), b.max));

    if (detailFilters.minPrice > detailFilters.maxPrice) {
      detailFilters.minPrice = detailFilters.maxPrice;
    }

    lastBounds.min = b.min;
    lastBounds.max = b.max;
    lastBounds.step = priceStep.value || prevStep;
  },
  { immediate: true }
);

const isMinThumbOnTop = computed(() => detailFilters.minPrice >= detailFilters.maxPrice - priceStep.value);

const rangeProgressStyle = computed(() => {
  const b = detailPriceBounds.value;
  if (!b.max || b.max <= b.min) return { left: "0%", right: "0%" };

  const min = Number(detailFilters.minPrice);
  const max = Number(detailFilters.maxPrice);

  const range = b.max - b.min;
  const left = ((min - b.min) / range) * 100;
  const right = 100 - ((max - b.min) / range) * 100;

  return { left: `${Math.max(0, Math.min(100, left))}%`, right: `${Math.max(0, Math.min(100, right))}%` };
});

const onMinRangeInput = () => {
  if (detailFilters.minPrice > detailFilters.maxPrice) detailFilters.minPrice = detailFilters.maxPrice;
};
const onMaxRangeInput = () => {
  if (detailFilters.maxPrice < detailFilters.minPrice) detailFilters.maxPrice = detailFilters.minPrice;
};

/* =========================
   variantsDisplay: match exact hoặc match includes
   ========================= */
const variantsDisplay = computed(() => {
  let list = allSelectedVariants.value;

  const matchKey = (selectedVal, textVal, candidate) => {
    const s = String(selectedVal || "");
    const t = String(textVal || "");
    const c = String(candidate || "");
    if (!s && !t) return true;
    if (s) return c === s;
    return lc(c).includes(lc(t));
  };

  list = list.filter((v) => matchKey(detailFilters.brand, detailFilterText.brand, v.tenThuongHieu));
  list = list.filter((v) => matchKey(detailFilters.material, detailFilterText.material, v.tenChatLieu));
  list = list.filter((v) => matchKey(detailFilters.color, detailFilterText.color, v.tenMauSac));
  list = list.filter((v) => matchKey(detailFilters.size, detailFilterText.size, v.tenKichThuoc));
  list = list.filter((v) => matchKey(detailFilters.sole, detailFilterText.sole, v.tenLoaiSan));

  if (detailPriceBounds.value.max > 0) {
    const min = Number(detailFilters.minPrice);
    const max = Number(detailFilters.maxPrice);
    list = list.filter((v) => {
      const p = getGiaBienThe(v);
      return p >= min && p <= max;
    });
  }

  return list;
});

const clearDetailFilters = () => {
  detailFilters.brand = "";
  detailFilters.material = "";
  detailFilters.color = "";
  detailFilters.size = "";
  detailFilters.sole = "";

  detailFilterText.brand = "";
  detailFilterText.material = "";
  detailFilterText.color = "";
  detailFilterText.size = "";
  detailFilterText.sole = "";

  detailFilters.minPrice = detailPriceBounds.value.min || 0;
  detailFilters.maxPrice = detailPriceBounds.value.max || 0;
};

watch(
  () => [detailFilters, detailFilterText],
  () => (currentDetailPage.value = 1),
  { deep: true }
);

const fillFilters = (item) => {
  selectDetail("brand", item.tenThuongHieu || null);
  selectDetail("material", item.tenChatLieu || null);
  selectDetail("color", item.tenMauSac || null);
  selectDetail("size", item.tenKichThuoc || null);
  selectDetail("sole", item.tenLoaiSan || null);
};

const onDetailCheckboxChange = (e) => {
  if (!e.target.checked) clearDetailFilters();
};

const totalDetailPages = computed(() => Math.ceil(variantsDisplay.value.length / detailItemsPerPage));

const paginatedVariantsDisplay = computed(() => {
  const start = (currentDetailPage.value - 1) * detailItemsPerPage;
  const end = start + detailItemsPerPage;
  return variantsDisplay.value.slice(start, end);
});

const changeDetailPage = (page) => {
  if (page >= 1 && page <= totalDetailPages.value) currentDetailPage.value = page;
};

watch(
  () => variantsDisplay.value.length,
  () => {
    if (currentDetailPage.value > totalDetailPages.value) currentDetailPage.value = Math.max(1, totalDetailPages.value);
  }
);

const isAllVariantsSelected = computed(() => {
  return variantsDisplay.value.length > 0 && variantsDisplay.value.every((v) => selectedVariantIds.value.includes(v.id));
});

/* =========================
   METHODS khác
   ========================= */
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value ?? 0);
};

const toggleExpand = (groupId) => {
  if (expandedGroupIds.value.includes(groupId)) expandedGroupIds.value = expandedGroupIds.value.filter((id) => id !== groupId);
  else expandedGroupIds.value.push(groupId);
};

const isGroupSelected = (parentId) => {
  const group = productGroups.value.find((g) => g.idSanPham === parentId);
  if (!group) return false;
  return group.variants.length > 0 && group.variants.every((v) => selectedVariantIds.value.includes(v.id));
};

const handleParentCheck = (parentId, isChecked) => {
  const group = productGroups.value.find((g) => g.idSanPham === parentId);
  if (!group) return;
  const childIds = group.variants.map((v) => v.id);

  if (isChecked) selectedVariantIds.value = [...new Set([...selectedVariantIds.value, ...childIds])];
  else {
    selectedVariantIds.value = selectedVariantIds.value.filter((id) => !childIds.includes(id));
    clearSourceFilters();
  }
};

const toggleAllVariants = (e) => {
  const visibleIds = variantsDisplay.value.map((v) => v.id);
  if (e.target.checked) selectedVariantIds.value = Array.from(new Set([...selectedVariantIds.value, ...visibleIds]));
  else selectedVariantIds.value = selectedVariantIds.value.filter((id) => !visibleIds.includes(id));
};

const removeAll = () => {
  selectedVariantIds.value = [];
  clearDetailFilters();
  currentDetailPage.value = 1;

  // reset meta để lần chọn mới init chuẩn
  lastBounds.min = 0;
  lastBounds.max = 0;
  lastBounds.step = priceStep.value || 1000;
};

const normalizeDate = (d, isEnd = false) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  if (isEnd) x.setHours(23, 59, 59, 999);
  else x.setHours(0, 0, 0, 0);
  return x;
};

const dateError = computed(() => {
  if (!formData.ngayBatDau || !formData.ngayKetThuc) return "";
  const s = normalizeDate(formData.ngayBatDau, false);
  const e = normalizeDate(formData.ngayKetThuc, true);
  if (!s || !e) return "Ngày không hợp lệ.";
  if (s > e) return "Ngày bắt đầu không được lớn hơn ngày kết thúc.";
  return "";
});

const canSubmit = computed(() => {
  if (!formData.tenDotGiamGia?.trim()) return false;
  if (!formData.ngayBatDau || !formData.ngayKetThuc) return false;
  if (dateError.value) return false;
  if (formData.giaTriGiamGia === null || formData.giaTriGiamGia === "") return false;
  const v = Number(formData.giaTriGiamGia);
  if (Number.isNaN(v) || v < 1 || v > 100) return false;
  return true;
});

const submitCreate = async () => {
  if (!canSubmit.value) {
    alert("Vui lòng nhập đúng và đủ thông tin bắt buộc (tên, ngày, % giảm 1-100).");
    return;
  }

  if (selectedVariantIds.value.length === 0) {
    if (!confirm("Bạn chưa chọn sản phẩm nào. Tiếp tục tạo?")) return;
  }

  const payload = { ...formData, idChiTietSanPhams: selectedVariantIds.value };

  try {
    isLoading.value = true;
    await discountService.createDiscountComposite(payload);
    alert("Tạo đợt giảm giá thành công!");
    router.push("/admin/giam-gia/dot");
  } catch (e) {
    alert("Lỗi tạo mới: " + (e.response?.data?.message || e.message));
  } finally {
    isLoading.value = false;
  }
};

const mapColor = (colorName) => {
  if (!colorName) return "#ccc";
  const lower = colorName.toLowerCase();
  if (lower.includes("đỏ")) return "#ef4444";
  if (lower.includes("xanh lá") || lower.includes("lục")) return "#22c55e";
  if (lower.includes("xanh dương") || lower.includes("xanh")) return "#3b82f6";
  if (lower.includes("đen")) return "#000";
  if (lower.includes("trắng")) return "#f8fafc";
  if (lower.includes("vàng")) return "#eab308";
  if (lower.includes("cam")) return "#f97316";
  if (lower.includes("tím")) return "#a855f7";
  if (lower.includes("hồng")) return "#ec4899";
  if (lower.includes("xám") || lower.includes("ghi")) return "#64748b";
  if (lower.includes("nâu")) return "#78350f";
  return "#ccc";
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await discountService.getAllProductDetails();
    const arr = Array.isArray(res) ? res : res?.content ?? [];
    rawVariants.value = arr;
  } catch (e) {
    console.error("Lỗi tải dữ liệu sản phẩm: ", e);
    alert("Lỗi: Không thể tải danh sách sản phẩm.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

* { box-sizing: border-box; }
.discount-page { padding-bottom: 30px; font-family: "Inter", "Segoe UI", sans-serif; }

/* Header */
.header-section { display:flex; justify-content: space-between; align-items:center; margin-bottom: 30px; margin-top: 10px; }
.page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
.btn-back { background: #64748b; color: white; border:none; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor:pointer; display:flex; align-items:center; gap: 6px; transition: 0.2s; }
.btn-back:hover { background: #475569; }

/* Layout */
.content-wrapper { display:grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px; }
.left-column, .right-column { min-width:0; display:flex; flex-direction: column; }

.bottom-section { margin-top: 12px; }
.detail-card { width: 100%; }

/* Card */
.card { background:#fff; border-radius:10px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border:none; display:flex; flex-direction: column; }
.card-title { font-size:16px; font-weight:600; color:#334155; margin-bottom:20px; border-bottom:1px solid #f1f5f9; padding-bottom:10px; }
.info-card, .product-select-card { height: 100%; }

/* Form */
.form-group { margin-bottom: 16px; }
.label { font-size:13px; font-weight:500; color:#64748b; margin-bottom: 8px; display:block; }
.text-red { color:#ef4444; }
.form-control { width:100%; height:40px; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; outline:none; transition: 0.2s; }
.form-control:focus { border-color:#3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.hint { margin-top: 6px; font-size: 12px; color: #ef4444; }

/* Buttons */
.action-buttons { display:flex; gap:10px; margin-top:auto; justify-content:center; }
.btn-update { background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%); color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:500; cursor:pointer; display:flex; align-items:center; transition: 0.2s; flex:1; justify-content:center; }
.btn-update:hover { filter: brightness(0.98); }
.btn-update:disabled { opacity:0.7; cursor:not-allowed; }

/* Search */
.search-bar { margin-bottom: 16px; }
.input-wrapper { position: relative; width: 100%; }
.input-wrapper input { padding-left: 36px; width:100%; height:40px; border:1px solid #e2e8f0; border-radius:6px; background-color:#fff; outline:none; }
.search-icon { position:absolute; left:12px; top:50%; transform: translateY(-50%); color:#94a3b8; }

/* Table */
.table-wrapper-mini { height: 450px; overflow-y:auto; border:1px solid #e2e8f0; border-radius: 8px; }
.table-responsive { overflow-x:auto; border:1px solid #e2e8f0; border-radius:8px; }

.custom-table { width:100%; border-collapse: collapse; font-size:14px; }
.custom-table th { background:#f8fafc; color:#475569; font-weight:500; padding:12px; border-bottom:1px solid #e2e8f0; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
.custom-table td { padding:12px; border-bottom:1px solid #f1f5f9; vertical-align: middle; color:#334155; }
.custom-table tr:hover td { background-color:#f8fafc; }

.parent-row td { background: #fff; }
.child-row td { background-color:#f8fafc; border-bottom:1px solid #f1f5f9; }

.td-click { cursor: pointer; }

/* Pagination */
.pagination { display:flex; justify-content:center; gap:8px; margin-top:auto; padding-top:16px; }
.page-btn { width:32px; height:32px; border:1px solid #e2e8f0; background:white; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: all 0.2s; color:#64748b; }
.page-btn:hover:not(:disabled) { background:#f8fafc; border-color:#cbd5e1; }
.page-btn.active { background:#1e293b; color:#fff; border-color:#1e293b; }
.page-btn:disabled { opacity:0.5; cursor:not-allowed; }

/* Detail header */
.detail-header { display:flex; justify-content: space-between; align-items:center; margin-bottom:15px; }
.section-title { font-size:16px; font-weight:600; color:#1e293b; margin:0; }
.count-tag { background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:10px; font-size:12px; margin-left:8px; }
.btn-danger-outline { background:transparent; border:1px solid #ef4444; color:#ef4444; border-radius:4px; padding:4px 10px; font-size:12px; cursor:pointer; transition:0.2s; }
.btn-danger-outline:hover { background:#fef2f2; }

/* Misc */
.text-center { text-align:center; }
.text-primary { color:#2563eb; }
.text-muted { color:#94a3b8; }

.product-thumb { width:40px; height:40px; object-fit: cover; border-radius:4px; border:1px solid #eee; background:#fff; }
.product-thumb-sm { width:32px; height:32px; object-fit: cover; border-radius:4px; border:1px solid #eee; background:#fff; }

.btn-expand { background:none; border:none; cursor:pointer; color:#64748b; width:24px; height:24px; }
.btn-expand:hover { color:#0f172a; }

.filter-grid { display:flex; gap:10px; flex-wrap: wrap; align-items:center; }
.bg-white { background-color:#fff !important; }

.btn-clear-filter { background:#f1f5f9; border:1px solid #e2e8f0; color:#64748b; width:34px; height:34px; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.btn-clear-filter:hover { color:#ef4444; border-color:#ef4444; }

.color-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:4px; border:1px solid #cbd5e1; }
.custom-checkbox { width:16px; height:16px; cursor:pointer; accent-color:#ef4444; background-color:#fff; }
.empty-state { text-align:center; color:#cbd5e1; padding:20px; }
.text-wrap-name { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ✅ Giá gốc gạch ngang + giá sau giảm */
.price-cell { line-height: 1.6; }
.price-original { text-decoration: line-through; color: #94a3b8; font-size: 12px; display: block; }
.price-discounted { color: #ef4444; font-weight: 600; font-size: 14px; display: block; }

/* ✅ Badge -% trên ảnh */
.thumb-wrap { position: relative; display: inline-block; vertical-align: middle; }
.discount-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 999px;
  border: 1.5px solid #fff;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  pointer-events: none;
  white-space: nowrap;
  line-height: 1.3;
  z-index: 2;
}
.discount-badge.sm { font-size: 8px; padding: 1px 3px; top: -3px; right: -3px; }

/* ✅ Combobox giống ProductManagePage.vue */
.ss-combo { position: relative; min-width: 160px; }
.ss-combo.disabled { opacity: 0.98; }
.ss-combo-input {
  height: 34px;
  border-radius: 8px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
  padding: 6px 34px 6px 10px !important;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
}
.ss-combo-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}
.ss-combo-ic {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(17, 24, 39, 0.55);
  pointer-events: none;
}
.ss-combo-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 50;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(17, 24, 39, 0.12);
  max-height: 260px;
  overflow: auto;
  padding: 6px;
}
.ss-combo-item {
  padding: 10px 10px;
  border-radius: 10px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
  cursor: pointer;
}
.ss-combo-item:hover { background: rgba(17, 24, 39, 0.05); }
.ss-combo-item.active { background: rgba(255, 77, 79, 0.10); }
.ss-combo-empty { padding: 10px 10px; font-size: 13px; color: rgba(17, 24, 39, 0.55); }

/* ✅ Range lọc giá */
.price-range-box { border: 1px dashed #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; background: #fff; }
.price-range-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
.price-range-title { font-size: 13px; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px; }
.price-range-value { font-size: 13px; color: #0f172a; font-weight: 600; }

.range-wrap { position: relative; height: 30px; }
.range-track { position: absolute; left: 0; right: 0; top: 50%; height: 6px; border-radius: 999px; background: #e2e8f0; transform: translateY(-50%); }
.range-progress { position: absolute; top: 50%; height: 6px; border-radius: 999px; background: #1e293b; transform: translateY(-50%); }

.range-input { position: absolute; left: 0; right: 0; top: 50%; width: 100%; transform: translateY(-50%); background: transparent; -webkit-appearance: none; appearance: none; pointer-events: none; z-index: 3; }
.range-input.thumb-min { z-index: 4; }
.range-input.thumb-min.top { z-index: 6; }
.range-input.thumb-max { z-index: 5; }
.range-input::-webkit-slider-runnable-track { height: 6px; background: transparent; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #ef4444; border: 2px solid #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); pointer-events: auto; cursor: pointer; }
.range-input::-moz-range-track { height: 6px; background: transparent; }
.range-input::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #ef4444; border: 2px solid #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); pointer-events: auto; cursor: pointer; }

.price-range-foot { display: flex; justify-content: space-between; color: #64748b; font-size: 12px; margin-top: 8px; }

@media (max-width: 1024px) { .content-wrapper { grid-template-columns: 1fr; } }
</style>