<template>
  <div class="discount-page">
    <div class="header-section">
      <h2 class="page-title">
        QUẢN LÝ ĐỢT GIẢM GIÁ /
        <span class="title-light">CHI TIẾT & CẬP NHẬT</span>
      </h2>

      <button class="btn-back" type="button" @click="goBack">
        <i class="fa-solid fa-arrow-left"></i> Quay lại
      </button>
    </div>

    <div class="content-wrapper">
      <div class="left-column">
        <div class="card info-card ss-card">
          <h4 class="card-title">Thông tin chung</h4>

          <div class="form-group">
            <label class="label">Mã đợt (Không thể sửa):</label>
            <input
              v-model="formData.maDotGiamGia"
              type="text"
              class="form-control"
              disabled
              style="background-color: #f1f5f9"
            />
          </div>

          <div class="form-group">
            <label class="label">
              Tên đợt giảm giá: <span class="text-red">*</span>
            </label>
            <input
              v-model="formData.tenDotGiamGia"
              type="text"
              class="form-control"
              placeholder="Nhập tên đợt..."
              :disabled="isEnded"
            />
          </div>

          <div class="form-group row-group">
            <label class="label" style="min-width: 120px">Loại giảm giá:</label>
            <div class="radio-group">
              <div class="d-flex align-items-center gap-2">
                <input type="radio" :value="false" v-model="formData.loaiGiamGia" checked disabled />
                <span class="font-weight-normal">% Phần trăm</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="label">Giá trị giảm:</label>
            <input
              v-model.number="formData.giaTriGiamGia"
              type="number"
              class="form-control"
              placeholder="Nhập giá trị..."
              :disabled="isEnded"
              min="1"
              max="100"
            />
          </div>

          <div class="form-group">
            <label class="label">Mức ưu tiên:</label>
            <input
              v-model.number="formData.mucUuTien"
              type="number"
              class="form-control"
              placeholder="Nhập mức ưu tiên..."
              :disabled="isEnded"
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="label">Ngày bắt đầu:</label>
            <input
              v-model="formData.ngayBatDau"
              type="date"
              class="form-control"
              :disabled="isEnded"
              @click="$event.target.showPicker()"
            />
          </div>

          <div class="form-group">
            <label class="label">Ngày kết thúc:</label>
            <input
              v-model="formData.ngayKetThuc"
              type="date"
              class="form-control"
              :disabled="isEnded"
              @click="$event.target.showPicker()"
            />
          </div>

          <div class="action-buttons mt-4">
            <button
              class="btn-update"
              type="button"
              @click="submitUpdate"
              v-if="!isEnded"
            >
              <i class="fa-solid fa-floppy-disk me-1"></i> Lưu thay đổi
            </button>
            <button class="btn-delete ms-2" type="button" @click="softDelete">
              <i class="fa-solid fa-trash me-1"></i> Xóa
            </button>
          </div>
        </div>
      </div>

      <div class="right-column">
        <div class="card product-select-card ss-card">
          <h4 class="card-title">Chọn sản phẩm áp dụng</h4>

          <div class="search-bar mb-3">
            <div class="input-wrapper">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
              />
            </div>
          </div>

          <div class="filter-grid mb-3">
            <select v-model="sourceFilters.brand" class="form-select-sm bg-white">
              <option value="">-- Thương hiệu --</option>
              <option v-for="opt in sourceFilterOptions.brands" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <select v-model="sourceFilters.origin" class="form-select-sm bg-white">
              <option value="">-- Xuất xứ --</option>
              <option v-for="opt in sourceFilterOptions.origins" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <button class="btn-clear-filter bg-white" type="button" @click="clearSourceFilters" title="Xóa bộ lọc">
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
                        <i class="fa-solid" :class="expandedGroupIds.includes(group.idSanPham) ? 'fa-minus' : 'fa-plus'"></i>
                      </button>
                    </td>
                    <td class="text-center">
                      <input
                        type="checkbox"
                        class="custom-checkbox"
                        :checked="isGroupSelected(group.idSanPham)"
                        @change="handleParentCheck(group.idSanPham, $event.target.checked)"
                        :disabled="isEnded"
                      />
                    </td>

                    <!-- ✅ BADGE “SỐ MŨ” giống file thêm -->
                    <td class="text-center" @click="toggleExpand(group.idSanPham)" style="cursor: pointer">
                      <div class="thumb-wrap">
                        <img :src="getGroupThumb(group)" class="product-thumb" @error="onImgError" alt="thumb" />
                        <span v-if="badgeTheoDot" class="discount-badge">{{ badgeTheoDot }}</span>
                      </div>
                    </td>

                    <td class="text-center" @click="toggleExpand(group.idSanPham)" style="cursor: pointer">
                      {{ group.maSanPham }}
                    </td>
                    <td class="text-center" @click="toggleExpand(group.idSanPham)" style="cursor: pointer">
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
                        :disabled="isEnded"
                        @change="onSourceCheckboxChange"
                      />
                    </td>

                    <!-- ✅ BADGE “SỐ MŨ” giống file thêm -->
                    <td class="text-center">
                      <div class="thumb-wrap">
                        <img :src="getVariantThumb(v)" class="product-thumb-sm" @error="onImgError" alt="thumb" />
                        <span v-if="badgeTheoDot" class="discount-badge discount-badge--sm">{{ badgeTheoDot }}</span>
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
            <button class="page-btn" type="button" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="page-btn active" type="button">{{ currentPage }}</button>
            <button class="page-btn" type="button" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="card detail-card ss-card">
        <div class="detail-header">
          <h3 class="section-title">
            Danh sách chi tiết sản phẩm được áp dụng
            <span v-if="selectedVariantIds.length" class="count-tag">({{ selectedVariantIds.length }})</span>
          </h3>

          <div class="d-flex align-items-center gap-2">
            <button
              class="btn-danger-outline"
              type="button"
              @click="removeAll"
              v-if="selectedVariantIds.length > 0 && !isEnded"
            >
              <i class="fa-solid fa-trash"></i> Xóa tất cả
            </button>
          </div>
        </div>

        <div class="filter-grid mb-3" v-if="selectedVariantIds.length > 0">
          <select v-model="detailFilters.brand" class="form-select-sm">
            <option value="">-- Thương hiệu --</option>
            <option v-for="opt in filterOptions.brands" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.material" class="form-select-sm">
            <option value="">-- Chất liệu --</option>
            <option v-for="opt in filterOptions.materials" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.size" class="form-select-sm">
            <option value="">-- Kích cỡ --</option>
            <option v-for="opt in filterOptions.sizes" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.color" class="form-select-sm">
            <option value="">-- Màu sắc --</option>
            <option v-for="opt in filterOptions.colors" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <select v-model="detailFilters.sole" class="form-select-sm">
            <option value="">-- Loại sân --</option>
            <option v-for="opt in filterOptions.soles" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <button class="btn-clear-filter" type="button" @click="clearDetailFilters" title="Xóa bộ lọc">
            <i class="fa-solid fa-filter-circle-xmark"></i>
          </button>
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
                    :disabled="isEnded"
                  />
                </th>
                <th class="text-center" width="50">STT</th>
                <th class="text-center" width="60">Ảnh</th>
                <th>Mã SP (CT)</th>
                <th class="text-center">Tên sản phẩm</th>
                <th class="text-center">Giá bán</th>
                <th class="text-center">Thương hiệu</th>
                <th class="text-center">Số lượng</th>
                <th class="text-center">Chất liệu</th>
                <th class="text-center">Kích cỡ</th>
                <th class="text-center">Màu sắc</th>
                <th class="text-center">Loại sân</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="variantsDisplay.length === 0">
                <td colspan="12" class="text-center text-muted py-5">
                  <div class="empty-state">
                    <i class="fa-solid fa-box-open fa-2x mb-2"></i>
                    <p>Chưa có sản phẩm nào được chọn cho đợt giảm giá này.</p>
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
                    :disabled="isEnded"
                    @change="onDetailCheckboxChange"
                  />
                </td>
                <td class="text-center">
                  {{ (currentDetailPage - 1) * detailItemsPerPage + index + 1 }}
                </td>

                <!-- ✅ BADGE “SỐ MŨ” giống file thêm -->
                <td class="text-center">
                  <div class="thumb-wrap">
                    <img :src="getVariantThumb(item)" class="product-thumb-sm" @error="onImgError" alt="thumb" />
                    <span v-if="badgeTheoDot" class="discount-badge discount-badge--sm">{{ badgeTheoDot }}</span>
                  </div>
                </td>

                <td class="text-primary">{{ item.maChiTietSanPham }}</td>
                <td class="text-wrap-name text-center">{{ item.tenSanPham }}</td>

                <!-- ✅ FIX: hiển thị GIÁ THEO ĐỢT ĐANG XEM (KHÔNG bị “dính” đợt khác) -->
                <td class="text-center">
                  <div v-if="getHienThiGiaTheoDot(item).hasDiscount">
                    <div class="old-price">
                      {{ formatCurrency(getHienThiGiaTheoDot(item).originalPrice) }}
                    </div>
                    <div class="new-price">
                      {{ formatCurrency(getHienThiGiaTheoDot(item).finalPrice) }}
                      <span class="discount-tag">
                        {{ getHienThiGiaTheoDot(item).badge }}
                      </span>
                    </div>
                  </div>
                  <div v-else>
                    {{ formatCurrency(getGiaBienThe(item)) }}
                  </div>
                </td>

                <td class="text-center">{{ item.tenThuongHieu }}</td>
                <td class="text-center">{{ item.soLuong }}</td>
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
          <button class="page-btn" type="button" @click="changeDetailPage(currentDetailPage - 1)" :disabled="currentDetailPage === 1">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="page-btn active" type="button">{{ currentDetailPage }}</button>
          <button class="page-btn" type="button" @click="changeDetailPage(currentDetailPage + 1)" :disabled="currentDetailPage === totalDetailPages">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { discountService } from "@/services/khuyen_mai/dot_giam_gia/discountService.js";

const route = useRoute();
const router = useRouter();
const discountId = route.params.id;

const goBack = async () => {
  try {
    await router.push({ name: "admin-discount" });
  } catch (e) {
    try {
      await router.push("/admin/giam-gia/dot");
    } catch (e2) {
      router.back();
    }
  }
};

/* =========================
   FIX ẢNH: normalize + fallback
   ========================= */
const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");
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
  return (
    v?.anh ||
    v?.urlAnh ||
    v?.duongDanAnh ||
    v?.anhDaiDien ||
    v?.anhSanPham ||
    v?.hinhAnh ||
    v?.image ||
    v?.imageUrl ||
    v?.thumbnail ||
    ""
  );
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
  maDotGiamGia: "",
  tenDotGiamGia: "",
  loaiGiamGia: false,
  giaTriGiamGia: null,
  ngayBatDau: "",
  ngayKetThuc: "",
  mucUuTien: 0,
  trangThai: true,
});

/* ✅ BADGE “SỐ MŨ” dùng chung giống file thêm */
const badgeTheoDot = computed(() => {
  const val = Number(formData.giaTriGiamGia ?? 0);
  if (!Number.isFinite(val) || val <= 0) return null;

  const isMoney = !!formData.loaiGiamGia; // hiện đang khóa %, nhưng để sẵn
  return isMoney
    ? `-${new Intl.NumberFormat("vi-VN").format(val)}đ`
    : `-${Math.round(val)}%`;
});

const currentPage = ref(1);
const itemsPerPage = 5;

const rawVariants = ref([]);
const selectedVariantIds = ref([]);
const searchKeyword = ref("");

const isLoading = ref(false);
const expandedGroupIds = ref([]);

const currentDetailPage = ref(1);
const detailItemsPerPage = 5;

const detailFilters = reactive({
  brand: "",
  material: "",
  color: "",
  size: "",
  sole: "",
});

const sourceFilters = reactive({ brand: "", origin: "" });

const sourceFilterOptions = computed(() => {
  const data = rawVariants.value;
  const getOpts = (k) => [...new Set(data.map(i => i[k]))].filter(Boolean).sort();
  return {
    brands: getOpts('tenThuongHieu'),
    origins: getOpts('tenXuatXu'),
  };
});

const clearSourceFilters = () => {
  sourceFilters.brand = "";
  sourceFilters.origin = "";
};

const fillSourceFilters = (item) => {
  sourceFilters.brand = item.tenThuongHieu || "";
  sourceFilters.origin = item.tenXuatXu || "";
};

const onSourceCheckboxChange = (e) => {
  if (!e.target.checked) clearSourceFilters();
};

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
    groups = groups.filter((g) =>
      (g.tenSanPham || "").toLowerCase().includes(key) ||
      (g.maSanPham || "").toLowerCase().includes(key)
    );
  }

  if (sourceFilters.brand || sourceFilters.origin) {
    groups = groups.filter(g => g.variants.some(v => {
      const matchBrand = !sourceFilters.brand || v.tenThuongHieu === sourceFilters.brand;
      const matchOrigin = !sourceFilters.origin || v.tenXuatXu === sourceFilters.origin;
      return matchBrand && matchOrigin;
    }));
  }
  return groups;
});

const totalPages = computed(() =>
  Math.ceil(filteredParentProducts.value.length / itemsPerPage)
);

const paginatedParentProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredParentProducts.value.slice(start, end);
});

const isEnded = computed(() => {
  if (formData.trangThai === false) return true;

  if (!formData.ngayKetThuc) return false;
  const parts = String(formData.ngayKetThuc).split("-");
  if (parts.length !== 3) return false;
  const end = new Date(parts[0], parts[1] - 1, parts[2]);
  end.setHours(23, 59, 59, 999);
  return new Date() > end;
});

const allSelectedVariants = computed(() =>
  rawVariants.value.filter((v) => selectedVariantIds.value.includes(v.id))
);

const filterOptions = computed(() => {
  const data = allSelectedVariants.value;
  const getOptions = (key) =>
    [...new Set(data.map((item) => item[key]))].filter(Boolean).sort();
  return {
    brands: getOptions("tenThuongHieu"),
    materials: getOptions("tenChatLieu"),
    colors: getOptions("tenMauSac"),
    sizes: getOptions("tenKichThuoc"),
    soles: getOptions("tenLoaiSan"),
  };
});

const variantsDisplay = computed(() => {
  let list = allSelectedVariants.value;

  if (detailFilters.brand) list = list.filter((v) => v.tenThuongHieu === detailFilters.brand);
  if (detailFilters.material) list = list.filter((v) => v.tenChatLieu === detailFilters.material);
  if (detailFilters.color) list = list.filter((v) => v.tenMauSac === detailFilters.color);
  if (detailFilters.size) list = list.filter((v) => v.tenKichThuoc === detailFilters.size);
  if (detailFilters.sole) list = list.filter((v) => v.tenLoaiSan === detailFilters.sole);

  return list;
});

const totalDetailPages = computed(() =>
  Math.ceil(variantsDisplay.value.length / detailItemsPerPage)
);

const paginatedVariantsDisplay = computed(() => {
  const start = (currentDetailPage.value - 1) * detailItemsPerPage;
  const end = start + detailItemsPerPage;
  return variantsDisplay.value.slice(start, end);
});

const isAllVariantsSelected = computed(() => {
  return (
    variantsDisplay.value.length > 0 &&
    variantsDisplay.value.every((v) => selectedVariantIds.value.includes(v.id))
  );
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};
watch(searchKeyword, () => {
  currentPage.value = 1;
});

const changeDetailPage = (page) => {
  if (page >= 1 && page <= totalDetailPages.value)
    currentDetailPage.value = page;
};

watch(
  () => variantsDisplay.value.length,
  () => {
    if (currentDetailPage.value > totalDetailPages.value) {
      currentDetailPage.value = Math.max(1, totalDetailPages.value);
    }
  }
);

watch(
  detailFilters,
  () => {
    currentDetailPage.value = 1;
  },
  { deep: true }
);

const fillFilters = (item) => {
  detailFilters.brand = item.tenThuongHieu || "";
  detailFilters.material = item.tenChatLieu || "";
  detailFilters.color = item.tenMauSac || "";
  detailFilters.size = item.tenKichThuoc || "";
  detailFilters.sole = item.tenLoaiSan || "";
};

const onDetailCheckboxChange = (e) => {
  if (!e.target.checked) clearDetailFilters();
};

const formatDateForInput = (dateInput) => {
  if (!dateInput) return "";
  if (Array.isArray(dateInput)) {
    const [y, m, d] = dateInput;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value ?? 0);
};

/* ✅ GIÁ THỰC TẾ (variant) */
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

/* ✅ FIX: hiển thị giá theo ĐỢT ĐANG XEM */
const getHienThiGiaTheoDot = (variant) => {
  const price = getGiaBienThe(variant);

  const val = Number(formData.giaTriGiamGia ?? 0);
  if (!Number.isFinite(val) || val <= 0) {
    return { hasDiscount: false, originalPrice: price, finalPrice: price, badge: null };
  }

  const isMoney = !!formData.loaiGiamGia; // hiện đang khóa %, nhưng để sẵn
  const discountAmount = isMoney ? val : (price * val) / 100;
  const finalPrice = Math.max(0, price - discountAmount);

  const badge = isMoney ? `-${new Intl.NumberFormat("vi-VN").format(val)}đ` : `-${Math.round(val)}%`;

  return { hasDiscount: true, originalPrice: price, finalPrice, badge };
};

const toggleExpand = (groupId) => {
  if (expandedGroupIds.value.includes(groupId)) {
    expandedGroupIds.value = expandedGroupIds.value.filter(id => id !== groupId);
  } else {
    expandedGroupIds.value.push(groupId);
  }
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

  if (isChecked) {
    selectedVariantIds.value = [...new Set([...selectedVariantIds.value, ...childIds])];
  } else {
    selectedVariantIds.value = selectedVariantIds.value.filter((id) => !childIds.includes(id));
    clearSourceFilters();
  }
};

const toggleAllVariants = (e) => {
  const visibleIds = variantsDisplay.value.map((v) => v.id);
  if (e.target.checked) {
    const uniqueIds = new Set([...selectedVariantIds.value, ...visibleIds]);
    selectedVariantIds.value = Array.from(uniqueIds);
  } else {
    selectedVariantIds.value = selectedVariantIds.value.filter((id) => !visibleIds.includes(id));
  }
};

const removeAll = () => {
  if (confirm("Bạn có chắc muốn bỏ chọn tất cả sản phẩm?")) {
    selectedVariantIds.value = [];
    alert("Danh sách sản phẩm đã được làm trống.");
  }
};

const clearDetailFilters = () => {
  Object.keys(detailFilters).forEach((k) => (detailFilters[k] = ""));
};

const submitUpdate = async () => {
  if (!formData.tenDotGiamGia || !formData.ngayBatDau || !formData.ngayKetThuc) {
    alert("Vui lòng nhập đủ thông tin đợt giảm giá");
    return;
  }

  if (selectedVariantIds.value.length === 0) {
    if (!confirm("Đợt giảm giá này chưa chọn sản phẩm nào. Bạn có chắc muốn lưu không?")) return;
  }

  const payload = { ...formData, idChiTietSanPhams: selectedVariantIds.value };

  try {
    isLoading.value = true;
    await discountService.update(discountId, payload);
    alert("Cập nhật đợt giảm giá thành công!");
    goBack();
  } catch (e) {
    alert("Lỗi cập nhật: " + (e.response?.data?.message || e.message));
  } finally {
    isLoading.value = false;
  }
};

const softDelete = async () => {
  if (!confirm("Bạn muốn xóa đợt giảm giá này? Hành động này không thể hoàn tác!")) return;

  try {
    isLoading.value = true;
    await discountService.delete(discountId);
    alert("Đợt giảm giá đã được xóa thành công.");
    goBack();
  } catch (e) {
    alert("Lỗi xóa: " + (e.response?.data?.message || e.message));
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
    const [variants, discountInfo] = await Promise.all([
      discountService.getAllProductDetails(),
      discountService.getOne(discountId),
    ]);

    rawVariants.value = Array.isArray(variants) ? variants : [];

    if (discountInfo) {
      Object.assign(formData, discountInfo);
      formData.ngayBatDau = formatDateForInput(discountInfo.ngayBatDau);
      formData.ngayKetThuc = formatDateForInput(discountInfo.ngayKetThuc);
      if (typeof discountInfo.mucUuTien !== "undefined" && discountInfo.mucUuTien !== null) {
        formData.mucUuTien = discountInfo.mucUuTien;
      }
    }

    const appliedDetails = await discountService.getDiscountDetails(discountId);

    if (Array.isArray(appliedDetails) && appliedDetails.length > 0) {
      const filteredDetails = appliedDetails.filter((d) => {
        const dId = d.idDotGiamGia || (d.dotGiamGia ? d.dotGiamGia.id : null);
        return dId == discountId;
      });

      selectedVariantIds.value = filteredDetails
        .map(
          (item) =>
            item.idChiTietSanPham ||
            item.id_chi_tiet_san_pham ||
            (item.chiTietSanPham ? item.chiTietSanPham.id : null)
        )
        .filter((id) => id != null);
    }
  } catch (e) {
    console.error("Lỗi tải dữ liệu chi tiết: ", e);
    alert("Lỗi: Không thể tải dữ liệu đợt giảm giá.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => loadData());
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

* {
  box-sizing: border-box;
}

.discount-page {
  --ss-red: #ff4d4f;
  --ss-black: #111827;
  --ss-border: rgba(255, 77, 79, 0.18);
  --ss-focus: rgba(255, 77, 79, 0.14);
  --ss-text: rgba(17, 24, 39, 0.88);
  --ss-sub: rgba(17, 24, 39, 0.62);

  padding-bottom: 30px;
  font-family: "Inter", "Segoe UI", sans-serif;
  color: rgba(17, 24, 39, 0.86);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  margin-top: 10px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--ss-text);
  margin: 0;
  letter-spacing: 0.2px;
}
.title-light {
  font-weight: 400;
  color: var(--ss-sub);
}

.btn-back {
  background: linear-gradient(90deg, var(--ss-black) 0%, #374151 100%);
  color: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  height: 36px;
}
.btn-back:hover {
  filter: brightness(0.98);
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 24px;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.08);
  border: 1px solid var(--ss-border);
  display: flex;
  flex-direction: column;
}
.ss-card {
  border: 1px solid var(--ss-border);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ss-text);
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  padding-bottom: 10px;
}

.left-column,
.right-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.info-card,
.product-select-card {
  height: 100%;
}

.form-group {
  margin-bottom: 16px;
}
.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--ss-sub);
  margin-bottom: 8px;
  display: block;
}
.text-red {
  color: var(--ss-red);
}

.form-control {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  color: rgba(17, 24, 39, 0.86);
}
.form-control:focus {
  border-color: rgba(255, 77, 79, 0.45);
  box-shadow: 0 0 0 0.18rem var(--ss-focus);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: auto;
  justify-content: center;
}
.btn-update {
  background: linear-gradient(90deg, var(--ss-red) 0%, var(--ss-black) 100%);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: 0.2s;
  flex: 1;
  justify-content: center;
  min-width: 150px;
  height: 38px;
}
.btn-update:hover {
  filter: brightness(0.98);
}
.btn-delete {
  background: linear-gradient(90deg, #ef4444 0%, #991b1b 100%);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: 0.2s;
  flex: 1;
  justify-content: center;
  min-width: 120px;
  height: 38px;
}
.btn-delete:hover {
  filter: brightness(0.98);
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid rgba(255, 77, 79, 0.55);
  color: #ef4444;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  height: 34px;
}
.btn-danger-outline:hover {
  background: rgba(255, 77, 79, 0.06);
}

.search-bar {
  margin-bottom: 16px;
}
.input-wrapper {
  position: relative;
  width: 100%;
}
.input-wrapper input {
  padding-left: 36px;
  width: 100%;
  height: 40px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 999px;
  outline: none;
  transition: 0.2s;
  color: rgba(17, 24, 39, 0.86);
  background-color: #fff;
}
.input-wrapper input:focus {
  border-color: rgba(255, 77, 79, 0.45);
  box-shadow: 0 0 0 0.18rem var(--ss-focus);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(17, 24, 39, 0.45);
}

.table-wrapper-mini {
  height: 450px;
  overflow-y: auto;
  border: 1px solid rgba(17, 24, 39, 0.10);
  border-radius: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
}
.page-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(17, 24, 39, 0.70);
  font-weight: 500;
}
.page-btn:hover:not(:disabled) {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.20);
}
.page-btn.active {
  background: linear-gradient(90deg, var(--ss-red) 0%, var(--ss-black) 100%);
  color: #fff;
  border-color: transparent;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-responsive {
  overflow-x: auto;
  border: 1px solid rgba(17, 24, 39, 0.10);
  border-radius: 12px;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.custom-table th {
  background: #f8fafc;
  color: rgba(17, 24, 39, 0.70);
  font-weight: 500;
  padding: 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.10);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}
.custom-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  vertical-align: middle;
  color: rgba(17, 24, 39, 0.86);
}
.custom-table tr:hover td {
  background-color: rgba(17, 24, 39, 0.03);
}

.discount-tag {
  display: inline-block;
  background-color: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 6px;
  margin-left: 6px;
  vertical-align: middle;
}
.old-price {
  text-decoration: line-through;
  color: rgba(17, 24, 39, 0.45);
  font-size: 12px;
}
.new-price {
  color: #ef4444;
  font-weight: 600;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ss-text);
  margin: 0;
}
.count-tag {
  background: rgba(255, 77, 79, 0.10);
  color: #ef4444;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  margin-left: 8px;
  font-weight: 500;
}

.filter-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.form-select-sm {
  padding: 6px 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  background-color: #fff;
  min-width: 120px;
  color: rgba(17, 24, 39, 0.86);
}

.btn-clear-filter {
  background: rgba(17, 24, 39, 0.04);
  border: 1px solid rgba(17, 24, 39, 0.14);
  color: rgba(17, 24, 39, 0.70);
  width: 34px;
  height: 34px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.btn-clear-filter:hover {
  background: rgba(255, 77, 79, 0.06);
  color: #ef4444;
  border-color: rgba(255, 77, 79, 0.35);
}

.text-center {
  text-align: center;
}
.text-primary {
  color: #ef4444;
}
.text-muted {
  color: rgba(17, 24, 39, 0.45);
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #ef4444;
  background-color: #fff;
}

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
  border: 1px solid rgba(17, 24, 39, 0.18);
}
.empty-state {
  text-align: center;
  color: rgba(17, 24, 39, 0.35);
  padding: 20px;
}
.empty-state p {
  font-size: 14px;
  color: rgba(17, 24, 39, 0.50);
  margin-top: 5px;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}

.product-thumb {
  width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #eee; background:#fff;
}
.product-thumb-sm {
  width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #eee; background:#fff;
}

.btn-expand {
  background: none; border: none; cursor: pointer; color: #64748b; width: 24px; height: 24px;
}
.btn-expand:hover { color: #111827; }

.child-row td {
  background-color: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.font-weight-normal { font-weight: 400 !important; }

.bg-white {
  background-color: #fff !important;
}

/* ✅ BADGE “SỐ MŨ” giống file thêm */
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

</style>
