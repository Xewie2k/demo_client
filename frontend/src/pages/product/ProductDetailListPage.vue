<!-- File: src/pages/product/ProductDetailListPage.vue -->
<template>
  <div class="ss-page ss-font">
    <!-- HEAD -->
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">
          {{ headTitle }}
        </div>
      </div>

      <div class="ss-head-right d-flex gap-2">
        <button
          class="btn ss-btn-outline"
          type="button"
          @click="back"
          :disabled="loading"
        >
          ← Quay lại danh sách
        </button>
      </div>
    </div>

    <!-- FILTER -->
    <div class="ss-card ss-border ss-filter-card">
      <div class="ss-filter-head">
        <span class="material-icons-outlined ss-filter-icon">filter_alt</span>
        <div class="ss-filter-title">Bộ lọc tìm kiếm</div>
      </div>

      <!-- Row 1 -->
      <div class="ss-filter-row1">
        <div class="ss-field">
          <div class="ss-filter-label">Tìm kiếm</div>
          <div class="ss-search-wrap">
            <span class="material-icons-outlined ss-search-icon">search</span>
            <input
              v-model="keyword"
              class="form-control ss-search-input"
              :placeholder="searchPlaceholder"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="ss-field ss-field-select">
          <div class="ss-filter-label">Trạng thái</div>
          <select
            v-model="statusFilter"
            class="form-select ss-select"
            :disabled="loading"
          >
            <option value="all">Tất cả</option>
            <option value="active">Kinh doanh</option>
            <option value="inactive">Ngừng kinh doanh</option>
          </select>
        </div>
      </div>

      <!-- Row 2: 3 thuộc tính (bỏ Form chân để tránh tràn) -->
      <div class="ss-filter-row2">
        <div class="ss-field ss-field-select">
          <div class="ss-filter-label">Màu sắc</div>
          <MultiSelect
            v-model="filters.idMauSac"
            :options="mauSacSelectOptions"
            optionLabel="label"
            optionValue="id"
            filter
            display="chip"
            placeholder="Tất cả"
            :maxSelectedLabels="2"
            :disabled="loading"
            class="w-100 ss-pv-multi"
          />
        </div>

        <div class="ss-field ss-field-select">
          <div class="ss-filter-label">Kích thước</div>
          <MultiSelect
            v-model="filters.idKichThuoc"
            :options="kichThuocSelectOptions"
            optionLabel="label"
            optionValue="id"
            filter
            display="chip"
            placeholder="Tất cả"
            :maxSelectedLabels="2"
            :disabled="loading"
            class="w-100 ss-pv-multi"
          />
        </div>

        <div class="ss-field ss-field-select">
          <div class="ss-filter-label">Loại sân</div>
          <MultiSelect
            v-model="filters.idLoaiSan"
            :options="loaiSanSelectOptions"
            optionLabel="label"
            optionValue="id"
            filter
            display="chip"
            placeholder="Tất cả"
            :maxSelectedLabels="2"
            :disabled="loading"
            class="w-100 ss-pv-multi"
          />
        </div>
      </div>

      <!-- Row 3: Range giá + ACTIONS -->
      <div class="ss-filter-row3">
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1"
        >
          <div class="ss-filter-label mb-0">Khoảng giá</div>
          <div class="ss-price-hint">
            <span>{{ formatMoney(priceMin) }}</span>
            <span class="mx-1">-</span>
            <span>{{ formatMoney(priceMax) }}</span>
            <span class="ms-2 ss-muted"
              >(Max: {{ formatMoney(priceBoundMax) }})</span
            >
          </div>
        </div>

        <div class="ss-range-wrap">
          <input
            class="ss-range"
            type="range"
            :min="0"
            :max="priceBoundMax"
            :step="priceStep"
            :value="priceMin"
            :disabled="loading || priceBoundMax <= 0"
            @input="onPriceMinInput($event)"
          />
          <input
            class="ss-range ss-range-top"
            type="range"
            :min="0"
            :max="priceBoundMax"
            :step="priceStep"
            :value="priceMax"
            :disabled="loading || priceBoundMax <= 0"
            @input="onPriceMaxInput($event)"
          />

          <div class="ss-range-track">
            <div class="ss-range-track-bg"></div>
            <div class="ss-range-track-fill" :style="rangeFillStyle"></div>
          </div>
        </div>

        <!-- ✅ ĐỔI THỨ TỰ + ĐỒNG BỘ ICON -->
        <div class="ss-filter-actions-under">
          <!-- Excel (icon giống ProductManagePage) -->
          <button
            class="btn ss-btn-lite"
            type="button"
            @click="exportExcel"
            :disabled="loading || zipDownloading"
          >
            <span class="material-icons-outlined ss-btn-ic">description</span>
            Tải Excel
          </button>

          <!-- QR (đã chọn) -->
          <button
            class="btn ss-btn-lite"
            type="button"
            @click="downloadQrSelectedZip"
            :disabled="loading || zipDownloading || selectedIds.size === 0"
            :title="
              selectedIds.size === 0
                ? 'Vui lòng chọn ít nhất 1 dòng'
                : 'Tải QR các dòng đã chọn'
            "
          >
            <span class="material-icons-outlined ss-btn-ic">download</span>
            Tải QR (Đã chọn)
          </button>

          <!-- QR (tất cả theo lọc hiện tại) -->
          <button
            class="btn ss-btn-lite"
            type="button"
            @click="downloadQrAllZip"
            :disabled="
              loading || zipDownloading || filteredDetails.length === 0
            "
            title="Tải QR của toàn bộ dữ liệu đang hiển thị theo bộ lọc"
          >
            <span class="material-icons-outlined ss-btn-ic">download</span>
            Tải QR (Tất cả)
          </button>

          <!-- Quét QR (icon giống ProductManagePage) -->
          <button
            class="btn ss-btn-warn"
            type="button"
            @click="openQrCamera"
            :disabled="loading || zipDownloading"
          >
            <span class="material-icons-outlined ss-btn-ic"
              >qr_code_scanner</span
            >
            Quét QR
          </button>

          <!-- Đặt lại (icon giống ProductManagePage) -->
          <button
            class="btn ss-btn-dark"
            type="button"
            @click="resetFilter"
            :disabled="loading || zipDownloading"
          >
            <span class="material-icons-outlined ss-btn-ic">restart_alt</span>
            Đặt lại bộ lọc
          </button>

          <button
            v-if="isProductScoped"
            class="btn ss-btn-primary"
            type="button"
            @click="showAllVariants"
            :disabled="loading || zipDownloading"
            title="Hiển thị toàn bộ biến thể của tất cả sản phẩm"
          >
            <span class="material-icons-outlined ss-btn-ic">grid_view</span>
            Hiển thị đầy đủ biến thể
          </button>
        </div>
      </div>
    </div>

    <!-- LIST -->
    <div class="ss-card ss-border ss-list-card">
      <div class="ss-list-title">
        {{ listTitle }}
      </div>

      <div class="table-responsive ss-table-wrap">
        <table class="table ss-table mb-0 align-middle">
          <thead>
            <tr>
              <!-- ✅ Checkbox trước STT -->
              <th class="col-check text-center">
                <input
                  ref="headerCheckRef"
                  type="checkbox"
                  class="ss-check"
                  :checked="allSelected"
                  :disabled="loading || filteredDetails.length === 0"
                  @change="toggleSelectAll($event)"
                  title="Chọn tất cả theo bộ lọc hiện tại"
                />
              </th>

              <th class="col-stt">STT</th>
              <th class="col-masp">Mã SP</th>
              <th class="col-ma">Mã CTSP</th>
              <th class="col-anh text-center">Ảnh</th>
              <th class="col-ten">Tên sản phẩm</th>
              <th class="col-mau">Màu sắc</th>
              <th class="col-kt">Kích thước</th>
              <th class="col-ls">Loại sân</th>
              <th class="col-sl">SL tồn</th>
              <th class="col-gia">Giá bán</th>
              <th class="col-tt text-center">Trạng thái</th>
              <th class="col-action text-center">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="loading">
            <tr>
              <td colspan="13" class="text-center py-4 ss-muted">
                Đang tải...
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!pagedDetails.length">
            <tr>
              <td colspan="13" class="text-center py-4 ss-muted">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="(d, idx) in pagedDetails" :key="d.id">
              <!-- ✅ checkbox dòng -->
              <td class="ss-td col-check text-center">
                <input
                  type="checkbox"
                  class="ss-check"
                  :checked="isSelected(d?.id)"
                  @change="toggleSelectOne(d?.id, $event)"
                />
              </td>

              <td class="ss-td col-stt">
                {{ (page - 1) * pageSize + idx + 1 }}
              </td>

              <td class="ss-td col-masp">{{ pickMaSp(d) }}</td>

              <td class="ss-td col-ma">{{ pickMaCtsp(d) }}</td>

              <td class="ss-td col-anh text-center">
                <div class="ss-thumb">
                  <img
                    v-if="pickImageUrl(d)"
                    :src="imgUrlWithVer(pickImageUrl(d))"
                    alt="img"
                  />
                  <span v-else class="ss-muted">-</span>
                </div>
              </td>

              <td class="ss-td col-ten ss-ellipsis" :title="pickTenSanPham(d)">
                {{ pickTenSanPham(d) }}
              </td>

              <td class="ss-td col-mau ss-ellipsis" :title="pickTenMauSac(d)">
                <div class="d-flex align-items-center gap-2 ss-ellipsis">
                  <span
                    v-if="pickMaMauHex(d)"
                    class="ss-swatch"
                    :style="{ background: pickMaMauHex(d) }"
                  ></span>
                  <span class="ss-ellipsis">{{ pickTenMauSac(d) }}</span>
                </div>
              </td>

              <td class="ss-td col-kt ss-ellipsis" :title="pickTenKichThuoc(d)">
                {{ pickTenKichThuoc(d) }}
              </td>
              <td class="ss-td col-ls ss-ellipsis" :title="pickTenLoaiSan(d)">
                {{ pickTenLoaiSan(d) }}
              </td>

              <td class="ss-td col-sl">{{ Number(pickSoLuong(d) || 0) }}</td>

              <td class="ss-td col-gia">
                <span class="ss-money">{{ formatMoney(pickGia(d)) }} đ</span>
              </td>

              <td class="col-tt text-center">
                <span
                  class="ss-badge"
                  :class="getTrangThai(d) ? 'ss-badge-on' : 'ss-badge-off'"
                >
                  {{ getTrangThai(d) ? "Kinh doanh" : "Ngừng kinh doanh" }}
                </span>
              </td>

              <td class="col-action text-center">
                <button
                  class="ss-icon-btn-view"
                  type="button"
                  title="Xem / Sửa"
                  @click="openEdit(d)"
                >
                  <span class="material-icons-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="ss-pagination-bar">
      <div class="ss-pagination">
        <button
          class="ss-pagebtn"
          :disabled="page <= 1"
          @click="page--"
          title="Trang trước"
        >
          ‹
        </button>

        <button
          v-for="p in pageButtons"
          :key="`p-${p}`"
          class="ss-pagebtn"
          :class="{ active: p === page }"
          :disabled="p === '...'"
          @click="goPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="ss-pagebtn"
          :disabled="page >= totalPages"
          @click="page++"
          title="Trang sau"
        >
          ›
        </button>
      </div>

      <div class="ss-pageinfo">
        Trang <span>{{ page }}</span> / <span>{{ totalPages }}</span>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="editOpen" class="ss-modal-backdrop" @click.self="closeEdit">
      <div class="ss-modal ss-edit-modal">
        <div class="ss-modal-head">
          <div>
            <div class="ss-modal-title">Sửa chi tiết sản phẩm</div>
          </div>

          <button class="ss-xbtn" type="button" @click="closeEdit" title="Đóng">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>

        <div v-if="editError" class="ss-alert">{{ editError }}</div>

        <div class="ss-edit-grid">
          <div class="ss-edit-col">
            <div class="ss-field">
              <label class="ss-input-label">
                Mã sản phẩm chi tiết <span class="ss-required">*</span>
              </label>
              <input
                class="form-control ss-input"
                v-model="editForm.maCtsp"
                disabled
              />
            </div>

            <div class="ss-field">
              <label class="ss-input-label">
                Số lượng tồn <span class="ss-required">*</span>
              </label>
              <input
                type="number"
                min="0"
                class="form-control ss-input"
                v-model.number="editForm.soLuong"
                placeholder="Nhập số lượng..."
              />
            </div>

            <div class="ss-field">
              <label class="ss-input-label">
                Giá bán <span class="ss-required">*</span>
              </label>
              <input
                class="form-control ss-input"
                v-model="editForm.giaBanText"
                inputmode="numeric"
                placeholder="Ví dụ: 500.000"
                @input="onGiaBanInput"
              />
            </div>

            <div class="ss-field">
              <label class="ss-input-label">Trạng thái kinh doanh</label>
              <div class="ss-status-row">
                <label class="ss-switch">
                  <input type="checkbox" v-model="editForm.trangThai" />
                  <span class="ss-slider"></span>
                </label>
                <div class="ss-status-text">
                  {{ editForm.trangThai ? "Kinh doanh" : "Ngừng kinh doanh" }}
                </div>
              </div>
            </div>
          </div>

          <div class="ss-edit-col">
            <div class="ss-field">
              <label class="ss-input-label">Màu sắc</label>
              <input
                class="form-control ss-input"
                v-model="editForm.tenMauSac"
                list="dl-mauSac"
                placeholder="Nhập màu sắc..."
              />
              <datalist id="dl-mauSac">
                <option
                  v-for="x in mauSacOptions"
                  :key="`ms-${x.id}`"
                  :value="pickTenFrom(x, ['tenMauSac', 'ten_mau_sac', 'ten'])"
                />
              </datalist>
            </div>

            <div class="ss-field">
              <label class="ss-input-label">Kích cỡ</label>
              <input
                class="form-control ss-input"
                v-model="editForm.tenKichThuoc"
                list="dl-kichThuoc"
                placeholder="Nhập kích cỡ..."
              />
              <datalist id="dl-kichThuoc">
                <option
                  v-for="x in kichThuocOptions"
                  :key="`kt-${x.id}`"
                  :value="
                    pickTenFrom(x, ['tenKichThuoc', 'ten_kich_thuoc', 'ten'])
                  "
                />
              </datalist>
            </div>

            <div class="ss-field">
              <label class="ss-input-label">Loại sân</label>
              <input
                class="form-control ss-input"
                v-model="editForm.tenLoaiSan"
                list="dl-loaiSan"
                placeholder="Nhập loại sân..."
              />
              <datalist id="dl-loaiSan">
                <option
                  v-for="x in loaiSanOptions"
                  :key="`ls-${x.id}`"
                  :value="pickTenFrom(x, ['tenLoaiSan', 'ten_loai_san', 'ten'])"
                />
              </datalist>
            </div>

            <div class="ss-field">
              <label class="ss-input-label">Form chân</label>
              <input
                class="form-control ss-input"
                v-model="editForm.tenFormChan"
                list="dl-formChan"
                placeholder="Nhập form chân..."
              />
              <datalist id="dl-formChan">
                <option
                  v-for="x in formChanOptions"
                  :key="`fc-${x.id}`"
                  :value="
                    pickTenFrom(x, ['tenFormChan', 'ten_form_chan', 'ten'])
                  "
                />
              </datalist>
            </div>
          </div>
        </div>

        <div class="ss-edit-grid ss-edit-grid-2">
          <div class="ss-box">
            <div class="ss-box-head">
              <div class="ss-box-title">Mã QR (QR Code)</div>
              <button
                class="btn ss-mini-btn"
                type="button"
                @click="downloadQr"
                :disabled="!editForm.maCtsp || !qrDataUrl"
              >
                <span class="material-icons-outlined" style="font-size: 18px"
                  >download</span
                >
                Tải QR
              </button>
            </div>

            <div class="ss-qr-wrap">
              <img
                v-if="qrDataUrl"
                class="ss-qr-img"
                :src="qrDataUrl"
                alt="qr"
              />
              <div v-else class="ss-qr-empty ss-muted">Không tạo được QR</div>

              <div class="ss-qr-hint">
                Nội dung QR: <span>{{ editForm.maCtsp }}</span>
              </div>
            </div>
          </div>

          <div class="ss-box">
            <div class="ss-box-head">
              <div class="ss-box-title">Hình ảnh</div>
              <button
                v-if="editForm.previewUrl || editForm.anhHienTai"
                class="ss-img-remove"
                type="button"
                title="Xóa ảnh đang chọn"
                @click="clearPickedImage"
              >
                <span class="material-icons-outlined">close</span>
              </button>
            </div>

            <div class="ss-img-card">
              <div class="ss-img-preview">
                <img
                  v-if="editForm.previewUrl || editForm.anhHienTai"
                  :src="editForm.previewUrl || editForm.anhHienTai"
                  alt="img"
                />
                <div v-else class="ss-muted">Chưa có ảnh</div>
              </div>

              <label class="btn ss-btn-img" for="ssPickImg">Chọn ảnh mới</label>
              <input
                id="ssPickImg"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onPickImage"
              />

              <div class="ss-img-note">PNG, JPG, JPEG</div>
            </div>
          </div>
        </div>

        <div class="ss-field mt-2">
          <label class="ss-input-label">Mô tả (nếu có)</label>
          <textarea
            class="form-control ss-textarea"
            rows="3"
            v-model="editForm.moTa"
            placeholder="Nhập mô tả..."
          ></textarea>
        </div>

        <div class="ss-modal-foot">
          <button
            class="btn ss-btn-outline"
            type="button"
            @click="closeEdit"
            :disabled="editSaving"
          >
            Hủy bỏ
          </button>
          <button
            class="btn ss-btn-primary"
            type="button"
            @click="saveEdit"
            :disabled="editSaving"
          >
            <span v-if="editSaving" class="ss-spin"></span>
            Cập nhật chi tiết
          </button>
        </div>
      </div>
    </div>

    <!-- QR CAMERA MODAL -->
    <div
      v-if="qrCameraOpen"
      class="ss-modal-backdrop"
      @click.self="closeQrCamera"
    >
      <div class="ss-modal ss-modal-wide">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="ss-modal-title">Quét QR sản phẩm</div>
          <button
            class="btn ss-btn-outline"
            type="button"
            @click="closeQrCamera"
          >
            Đóng
          </button>
        </div>

        <div class="ss-muted mb-2" style="font-size: 13px">
          Đưa QR vào khung để hệ thống tự nhận. Sau khi nhận sẽ tự lọc theo mã.
        </div>

        <div class="ss-qr-box">
          <div id="ss-qr-reader" class="ss-qr-reader"></div>
        </div>

        <div v-if="qrError" class="ss-cam-error mt-2">{{ qrError }}</div>

        <div class="d-flex align-items-center justify-content-end gap-2 mt-3">
          <button
            class="btn ss-btn-outline"
            type="button"
            @click="restartQrCamera"
            :disabled="loading"
          >
            Quét lại
          </button>
          <button
            class="btn ss-btn-primary"
            type="button"
            @click="closeQrCamera"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import MultiSelect from "primevue/multiselect";
import { Html5Qrcode } from "html5-qrcode";
import QRCode from "qrcode";
import JSZip from "jszip";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import anhChiTietSanPhamService from "@/services/anhChiTietSanPhamService";
import { refDataService } from "@/services/refDataService";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const keyword = ref("");
const statusFilter = ref("all");

const page = ref(1);
const pageSize = ref(10);

const details = ref([]);

const scopedProductId = ref(null);
const scopedProductName = ref("");
const scopedProductMa = ref("");

const isProductScoped = computed(() => {
  const v = scopedProductId.value;
  if (v === null || v === undefined || v === "") return false;
  return Number.isFinite(Number(v));
});

const headTitle = computed(() => {
  if (isProductScoped.value)
    return `Quản lý sản phẩm/ Danh sách biến thể - Sản phẩm`;
  return `Quản lý sản phẩm/ Danh sách chi tiết sản phẩm`;
});

const listTitle = computed(() => {
  if (isProductScoped.value) return `Danh sách biến thể của sản phẩm`;
  return `Danh sách chi tiết sản phẩm`;
});

const searchPlaceholder = computed(() => {
  if (isProductScoped.value) return "Tìm theo mã SP / mã CTSP...";
  return "Tìm theo mã SP / mã CTSP / tên sản phẩm...";
});

const imgVerTick = ref(Date.now());
function bumpImgVer() {
  imgVerTick.value = Date.now();
}
function imgUrlWithVer(url) {
  if (!url) return "";
  const u = String(url);
  const join = u.includes("?") ? "&" : "?";
  return `${u}${join}v=${imgVerTick.value}`;
}

const productOptions = ref([]);
const mauSacOptions = ref([]);
const kichThuocOptions = ref([]);
const loaiSanOptions = ref([]);
const formChanOptions = ref([]);

const filters = reactive({
  idMauSac: [],
  idKichThuoc: [],
  idLoaiSan: [],
  idFormChan: [],
});

function unwrapList(v) {
  if (Array.isArray(v)) return v;
  const d = v?.data ?? v;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data?.data?.content)) return d.data.data.content;
  return [];
}
function lc(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}
function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}
function toNumberArray(v) {
  return ensureArray(v)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}
function toIntOrNull(v) {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getTrangThai(obj) {
  const v =
    obj?.trangThai ??
    obj?.trang_thai ??
    obj?.trangThaiKinhDoanh ??
    obj?.trang_thai_kinh_doanh ??
    obj?.dangKinhDoanh ??
    obj?.kinhDoanh ??
    obj?.isActive;

  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "active", "on", "kinhdoanh", "kinh_doanh"].includes(s))
      return true;
    if (
      ["false", "0", "inactive", "off", "ngung", "ngung_kinh_doanh"].includes(s)
    )
      return false;
  }
  return true;
}

function pickIdSanPham(d) {
  return (
    d?.idSanPham ??
    d?.id_san_pham ??
    d?.sanPhamId ??
    d?.sanPham?.id ??
    d?.san_pham?.id ??
    d?.idSanPhamCha ??
    d?.id_san_pham_cha ??
    null
  );
}
function pickIdMauSac(d) {
  return (
    d?.idMauSac ??
    d?.id_mau_sac ??
    d?.mauSacId ??
    d?.mauSac?.id ??
    d?.mau_sac?.id ??
    null
  );
}
function pickIdKichThuoc(d) {
  return (
    d?.idKichThuoc ??
    d?.id_kich_thuoc ??
    d?.kichThuocId ??
    d?.kichThuoc?.id ??
    d?.kich_thuoc?.id ??
    null
  );
}
function pickIdLoaiSan(d) {
  return (
    d?.idLoaiSan ??
    d?.id_loai_san ??
    d?.loaiSanId ??
    d?.loaiSan?.id ??
    d?.loai_san?.id ??
    null
  );
}
function pickIdFormChan(d) {
  return (
    d?.idFormChan ??
    d?.id_form_chan ??
    d?.formChanId ??
    d?.formChan?.id ??
    d?.form_chan?.id ??
    null
  );
}

function pickMaSp(d) {
  const raw =
    d?.maSanPham ??
    d?.ma_san_pham ??
    d?.sanPhamMa ??
    d?.san_pham_ma ??
    d?.sanPham?.maSanPham ??
    d?.sanPham?.ma_san_pham ??
    d?.sanPham?.ma ??
    d?.san_pham?.ma_san_pham ??
    d?.san_pham?.ma ??
    "";
  const s = String(raw ?? "").trim();
  return s || "-";
}

function pickMaCtsp(d) {
  return (
    d?.maChiTietSanPham ?? d?.ma_chi_tiet_san_pham ?? d?.maCtsp ?? d?.ma ?? "-"
  );
}
function pickSoLuong(d) {
  return d?.soLuong ?? d?.so_luong ?? 0;
}
function pickGia(d) {
  return (
    d?.giaBan ?? d?.gia_ban ?? d?.giaNiemYet ?? d?.gia_niem_yet ?? d?.gia ?? 0
  );
}
function pickTenSanPham(d) {
  return (
    d?.tenSanPham ??
    d?.sanPhamTen ??
    d?.sanPham?.tenSanPham ??
    d?.sanPham?.ten_san_pham ??
    d?.sanPham?.ten ??
    d?.san_pham?.ten_san_pham ??
    "-"
  );
}
function pickTenMauSac(d) {
  return (
    d?.tenMauSac ??
    d?.ten_mau_sac ??
    d?.mauSac?.tenMauSac ??
    d?.mauSac?.ten_mau_sac ??
    d?.mauSac?.ten ??
    "-"
  );
}
function pickTenKichThuoc(d) {
  return (
    d?.tenKichThuoc ??
    d?.ten_kich_thuoc ??
    d?.kichThuoc?.tenKichThuoc ??
    d?.kichThuoc?.ten_kich_thuoc ??
    d?.kichThuoc?.ten ??
    "-"
  );
}
function pickTenLoaiSan(d) {
  return (
    d?.tenLoaiSan ??
    d?.ten_loai_san ??
    d?.loaiSan?.tenLoaiSan ??
    d?.loaiSan?.ten_loai_san ??
    d?.loaiSan?.ten ??
    "-"
  );
}
function pickTenFormChan(d) {
  return (
    d?.tenFormChan ??
    d?.ten_form_chan ??
    d?.formChan?.tenFormChan ??
    d?.formChan?.ten_form_chan ??
    d?.formChan?.ten ??
    "-"
  );
}
function pickMaMauHex(d) {
  const raw =
    d?.maMau ??
    d?.ma_mau ??
    d?.mauSac?.maMau ??
    d?.mauSac?.ma_mau ??
    d?.mau_sac?.ma_mau ??
    d?.mauSac?.maHex ??
    d?.mauSac?.ma_hex ??
    "";
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return s;
  return "";
}

function apiBase() {
  const raw =
    import.meta?.env?.VITE_API_URL ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:8080";
  return String(raw).replace(/\/+$/, "");
}
function normalizeAnhPath(p) {
  if (!p) return "";
  const s = String(p);
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = apiBase();
  return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
}
function pickImageUrl(d) {
  const raw =
    d?.anhDaiDienUrl ??
    d?.anhDaiDien ??
    d?.urlAnh ??
    d?.hinhAnh ??
    d?.imageUrl ??
    d?.image ??
    d?.anh ??
    "";
  return raw ? normalizeAnhPath(raw) : "";
}

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("vi-VN");
}

function toMapById(arr) {
  const m = new Map();
  (arr || []).forEach((x) => {
    const id = Number(x?.id);
    if (Number.isFinite(id)) m.set(id, x);
  });
  return m;
}
function pickTenFrom(obj, keys = []) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}
function enrichCtspList(ctspList) {
  const pMap = toMapById(productOptions.value);
  const msMap = toMapById(mauSacOptions.value);
  const ktMap = toMapById(kichThuocOptions.value);
  const lsMap = toMapById(loaiSanOptions.value);
  const fcMap = toMapById(formChanOptions.value);

  return (ctspList || []).map((x) => {
    const pid = toIntOrNull(pickIdSanPham(x));
    const p = pid != null ? pMap.get(pid) : null;

    const ms = (() => {
      const id = toIntOrNull(pickIdMauSac(x));
      return id != null ? msMap.get(id) : null;
    })();
    const kt = (() => {
      const id = toIntOrNull(pickIdKichThuoc(x));
      return id != null ? ktMap.get(id) : null;
    })();
    const ls = (() => {
      const id = toIntOrNull(pickIdLoaiSan(x));
      return id != null ? lsMap.get(id) : null;
    })();
    const fch = (() => {
      const id = toIntOrNull(pickIdFormChan(x));
      return id != null ? fcMap.get(id) : null;
    })();

    const tenSpTmp =
      x?.tenSanPham ??
      pickTenFrom(p, ["tenSanPham", "ten_san_pham", "ten", "name"]);
    const tenMauSacTmp =
      x?.tenMauSac ?? pickTenFrom(ms, ["tenMauSac", "ten_mau_sac", "ten"]);
    const tenKichThuocTmp =
      x?.tenKichThuoc ??
      pickTenFrom(kt, ["tenKichThuoc", "ten_kich_thuoc", "ten"]);
    const tenLoaiSanTmp =
      x?.tenLoaiSan ?? pickTenFrom(ls, ["tenLoaiSan", "ten_loai_san", "ten"]);
    const tenFormChanTmp =
      x?.tenFormChan ??
      pickTenFrom(fch, ["tenFormChan", "ten_form_chan", "ten"]);

    const maMau =
      x?.maMau ??
      x?.ma_mau ??
      pickTenFrom(ms, ["maMau", "ma_mau", "maHex", "ma_hex"]) ??
      "";

    return {
      ...x,
      sanPham: x?.sanPham ?? x?.san_pham ?? p ?? null,
      tenSanPham: tenSpTmp || "-",
      tenMauSac: tenMauSacTmp || "-",
      tenKichThuoc: tenKichThuocTmp || "-",
      tenLoaiSan: tenLoaiSanTmp || "-",
      tenFormChan: tenFormChanTmp || "-",
      maMau,
    };
  });
}

function toSelectOptions(arr, labelGetter) {
  return (arr || [])
    .map((x) => {
      const id = Number(x?.id);
      if (!Number.isFinite(id)) return null;
      const label = (labelGetter?.(x) ?? "").toString().trim();
      return { id, label: label || "-" };
    })
    .filter(Boolean);
}
const mauSacSelectOptions = computed(() =>
  toSelectOptions(
    mauSacOptions.value,
    (x) => x?.tenMauSac ?? x?.ten_mau_sac ?? x?.ten ?? "-",
  ),
);
const kichThuocSelectOptions = computed(() =>
  toSelectOptions(
    kichThuocOptions.value,
    (x) => x?.tenKichThuoc ?? x?.ten_kich_thuoc ?? x?.ten ?? "-",
  ),
);
const loaiSanSelectOptions = computed(() =>
  toSelectOptions(
    loaiSanOptions.value,
    (x) => x?.tenLoaiSan ?? x?.ten_loai_san ?? x?.ten ?? "-",
  ),
);
const formChanSelectOptions = computed(() =>
  toSelectOptions(
    formChanOptions.value,
    (x) => x?.tenFormChan ?? x?.ten_form_chan ?? x?.ten ?? "-",
  ),
);

function getRouteProductKey() {
  const id =
    route?.query?.sanPhamId ??
    route?.query?.idSanPham ??
    route?.query?.spId ??
    route?.query?.id ??
    route?.params?.id ??
    null;

  if (id != null && String(id).trim() !== "" && Number.isFinite(Number(id))) {
    return { type: "id", value: Number(id) };
  }

  const ma =
    route?.query?.maSanPham ??
    route?.query?.ma ??
    route?.query?.ma_sp ??
    route?.query?.maSP ??
    null;

  if (ma != null && String(ma).trim() !== "") {
    return { type: "ma", value: String(ma).trim() };
  }

  return null;
}

function applyScopedProductById(id) {
  const pid = toIntOrNull(id);
  if (pid == null) {
    scopedProductId.value = null;
    scopedProductName.value = "";
    scopedProductMa.value = "";
    return;
  }
  scopedProductId.value = pid;

  const p = unwrapList(productOptions.value).find((x) => Number(x?.id) === pid);
  scopedProductName.value =
    p?.tenSanPham ?? p?.ten_san_pham ?? p?.ten ?? scopedProductName.value ?? "";
  scopedProductMa.value =
    p?.maSanPham ?? p?.ma_san_pham ?? p?.ma ?? scopedProductMa.value ?? "";
}

function applyScopedProductByMa(ma) {
  const code = lc(ma);
  if (!code) {
    scopedProductId.value = null;
    scopedProductName.value = "";
    scopedProductMa.value = "";
    return;
  }

  const p = unwrapList(productOptions.value).find((x) => {
    const m = lc(x?.maSanPham ?? x?.ma_san_pham ?? x?.ma ?? "");
    return m === code;
  });

  if (p?.id != null) {
    scopedProductId.value = Number(p.id);
    scopedProductName.value = p?.tenSanPham ?? p?.ten_san_pham ?? p?.ten ?? "";
    scopedProductMa.value = p?.maSanPham ?? p?.ma_san_pham ?? p?.ma ?? "";
  } else {
    scopedProductId.value = null;
    scopedProductName.value = "";
    scopedProductMa.value = "";
  }
}

function syncScopeFromRoute() {
  const key = getRouteProductKey();
  if (!key) {
    scopedProductId.value = null;
    scopedProductName.value = "";
    scopedProductMa.value = "";
    return;
  }
  if (key.type === "id") applyScopedProductById(key.value);
  if (key.type === "ma") applyScopedProductByMa(key.value);
}

const baseFilteredDetails = computed(() => {
  const kw = lc(keyword.value);

  const fMauSac = toNumberArray(filters.idMauSac);
  const fKichThuoc = toNumberArray(filters.idKichThuoc);
  const fLoaiSan = toNumberArray(filters.idLoaiSan);
  const fFormChan = toNumberArray(filters.idFormChan);

  const scopedId = toIntOrNull(scopedProductId.value);

  return (details.value || []).filter((d) => {
    if (scopedId != null) {
      const pid = toIntOrNull(pickIdSanPham(d));
      if (pid == null || pid !== scopedId) return false;
    }

    const maSp = lc(pickMaSp(d));
    const maCtsp = lc(pickMaCtsp(d));
    const tenSp = lc(pickTenSanPham(d));
    const matchKw =
      !kw || maSp.includes(kw) || maCtsp.includes(kw) || tenSp.includes(kw);

    const st = getTrangThai(d);
    const matchStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "active" && st) ||
      (statusFilter.value === "inactive" && !st);

    const idMauSac = Number(pickIdMauSac(d));
    const idKichThuoc = Number(pickIdKichThuoc(d));
    const idLoaiSan = Number(pickIdLoaiSan(d));
    const idFormChan = Number(pickIdFormChan(d));

    const matchId =
      (fMauSac.length === 0 ||
        (Number.isFinite(idMauSac) && fMauSac.includes(idMauSac))) &&
      (fKichThuoc.length === 0 ||
        (Number.isFinite(idKichThuoc) && fKichThuoc.includes(idKichThuoc))) &&
      (fLoaiSan.length === 0 ||
        (Number.isFinite(idLoaiSan) && fLoaiSan.includes(idLoaiSan))) &&
      (fFormChan.length === 0 ||
        (Number.isFinite(idFormChan) && fFormChan.includes(idFormChan)));

    return matchKw && matchStatus && matchId;
  });
});

const priceBoundMax = computed(() => {
  const arr = baseFilteredDetails.value || [];
  let mx = 0;
  for (const d of arr) {
    const g = Number(pickGia(d) || 0);
    if (Number.isFinite(g) && g > mx) mx = g;
  }
  return Math.max(0, Math.floor(mx));
});
const priceStep = computed(() => {
  const mx = priceBoundMax.value;
  if (mx <= 0) return 1000;
  if (mx <= 2_000_000) return 10_000;
  if (mx <= 10_000_000) return 50_000;
  return 100_000;
});
const priceMin = ref(0);
const priceMax = ref(0);

watch(
  () => [
    keyword.value,
    statusFilter.value,
    JSON.stringify(filters),
    scopedProductId.value,
  ],
  () => {
    priceMin.value = 0;
    priceMax.value = priceBoundMax.value;
    page.value = 1;
  },
  { deep: true },
);
watch(
  () => priceBoundMax.value,
  (mx) => {
    if (priceMax.value > mx) priceMax.value = mx;
    if (priceMin.value > priceMax.value) priceMin.value = priceMax.value;
    if (priceMax.value === 0 && mx > 0) priceMax.value = mx;
  },
  { immediate: true },
);

function onPriceMinInput(e) {
  const v = Number(e?.target?.value ?? 0);
  if (!Number.isFinite(v)) return;
  priceMin.value = Math.max(0, Math.min(v, priceMax.value));
  page.value = 1;
}
function onPriceMaxInput(e) {
  const v = Number(e?.target?.value ?? 0);
  if (!Number.isFinite(v)) return;
  priceMax.value = Math.min(priceBoundMax.value, Math.max(v, priceMin.value));
  page.value = 1;
}
const rangeFillStyle = computed(() => {
  const mx = priceBoundMax.value || 1;
  const left = (priceMin.value / mx) * 100;
  const right = (priceMax.value / mx) * 100;
  return { left: `${left}%`, width: `${Math.max(0, right - left)}%` };
});

const filteredDetails = computed(() => {
  const arr = baseFilteredDetails.value || [];
  const min = Number(priceMin.value || 0);
  const max = Number(priceMax.value || 0);
  return arr.filter((d) => {
    const gia = Number(pickGia(d) || 0);
    if (!Number.isFinite(gia)) return false;
    return gia >= min && gia <= max;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredDetails.value.length / pageSize.value)),
);
const pagedDetails = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredDetails.value.slice(start, start + pageSize.value);
});
watch(
  () => [pageSize.value, filteredDetails.value.length],
  () => (page.value = 1),
);
watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

const pageButtons = computed(() => {
  const tp = totalPages.value;
  const p = page.value;

  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

  const arr = [];
  const push = (x) => arr.push(x);

  push(1);
  if (p > 3) push("...");

  const start = Math.max(2, p - 1);
  const end = Math.min(tp - 1, p + 1);
  for (let i = start; i <= end; i++) push(i);

  if (p < tp - 2) push("...");
  push(tp);

  return arr;
});
function goPage(p) {
  if (p === "..." || typeof p !== "number") return;
  page.value = p;
}

/* =======================
   ✅ CHECKBOX CHỌN DÒNG
   ======================= */
const selectedIds = reactive(new Set());
const headerCheckRef = ref(null);

const allSelected = computed(() => {
  const arr = filteredDetails.value || [];
  if (!arr.length) return false;
  return arr.every((d) => selectedIds.has(Number(d?.id)));
});
const someSelected = computed(() => {
  const arr = filteredDetails.value || [];
  if (!arr.length) return false;
  let hit = 0;
  for (const d of arr) {
    if (selectedIds.has(Number(d?.id))) hit++;
    if (hit > 0) break;
  }
  return hit > 0;
});

watch([allSelected, someSelected], () => {
  if (!headerCheckRef.value) return;
  headerCheckRef.value.indeterminate = someSelected.value && !allSelected.value;
});

function isSelected(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return false;
  return selectedIds.has(n);
}

function toggleSelectOne(id, e) {
  const n = Number(id);
  if (!Number.isFinite(n)) return;
  const checked = !!e?.target?.checked;
  if (checked) selectedIds.add(n);
  else selectedIds.delete(n);
}

function toggleSelectAll(e) {
  const checked = !!e?.target?.checked;
  const arr = filteredDetails.value || [];
  if (!arr.length) return;

  if (checked) {
    arr.forEach((d) => {
      const n = Number(d?.id);
      if (Number.isFinite(n)) selectedIds.add(n);
    });
  } else {
    arr.forEach((d) => {
      const n = Number(d?.id);
      if (Number.isFinite(n)) selectedIds.delete(n);
    });
  }
}

function resetFilter() {
  keyword.value = "";
  statusFilter.value = "all";
  filters.idMauSac = [];
  filters.idKichThuoc = [];
  filters.idLoaiSan = [];
  filters.idFormChan = [];
  priceMin.value = 0;
  priceMax.value = priceBoundMax.value;
  page.value = 1;

  selectedIds.clear();
}

function back() {
  router.push("/admin/san-pham");
}

function showAllVariants() {
  scopedProductId.value = null;
  scopedProductName.value = "";
  scopedProductMa.value = "";
  router.replace({ path: "/admin/chi-tiet-san-pham", query: {} });
  resetFilter();
}

async function loadData() {
  loading.value = true;
  try {
    const [p, ctsp, allAnh, ms, kt, ls, fc] = await Promise.all([
      productService.getAll(),
      productDetailService.getAll(),
      anhChiTietSanPhamService.getAll(),
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
      refDataService.getLoaiSan(),
      refDataService.getFormChan(),
    ]);

    productOptions.value = unwrapList(p);
    mauSacOptions.value = unwrapList(ms);
    kichThuocOptions.value = unwrapList(kt);
    loaiSanOptions.value = unwrapList(ls);
    formChanOptions.value = unwrapList(fc);

    syncScopeFromRoute();

    const ctspList = unwrapList(ctsp);

    const anhList = unwrapList(allAnh);
    const mapAnh = new Map();
    for (const a of anhList) {
      if (!a) continue;
      const xoa = a?.xoaMem ?? a?.xoa_mem ?? false;
      if (xoa === true || xoa === 1) continue;

      const ctspId = a?.idChiTietSanPham ?? a?.id_chi_tiet_san_pham ?? null;
      if (!ctspId) continue;

      const raw =
        a?.duongDanAnh ?? a?.duong_dan_anh ?? a?.urlAnh ?? a?.imageUrl ?? "";
      const url = normalizeAnhPath(raw);
      if (!url) continue;

      const cur = mapAnh.get(ctspId) || { daiDien: "", first: "" };
      if (!cur.first) cur.first = url;

      const daiDien = a?.laAnhDaiDien ?? a?.la_anh_dai_dien ?? false;
      if (daiDien === true || daiDien === 1) cur.daiDien = url;

      mapAnh.set(ctspId, cur);
    }

    details.value = enrichCtspList(ctspList).map((x) => {
      const pick = mapAnh.get(x?.id);
      return { ...x, anhDaiDienUrl: pick?.daiDien || pick?.first || "" };
    });

    bumpImgVer();
    priceMin.value = 0;
    priceMax.value = priceBoundMax.value;
    page.value = 1;

    selectedIds.clear();
  } catch (e) {
    console.error(e);
    details.value = [];
    priceMin.value = 0;
    priceMax.value = 0;
    selectedIds.clear();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

watch(
  () => [route.fullPath],
  () => {
    syncScopeFromRoute();
    resetFilter();
  },
);

/* =======================
   ✅ EXCEL + QR ZIP
   ======================= */
const zipDownloading = ref(false);

function escapeCsvCell(v) {
  const s = String(v ?? "");
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

function exportExcel() {
  const rows = filteredDetails.value || [];

  const header = [
    "STT",
    "Mã SP",
    "Mã CTSP",
    "Tên sản phẩm",
    "Màu sắc",
    "Kích thước",
    "Loại sân",
    "SL tồn",
    "Giá bán",
    "Trạng thái",
  ];

  const lines = [header];

  rows.forEach((d, i) => {
    const tt = getTrangThai(d) ? "Kinh doanh" : "Ngừng kinh doanh";
    lines.push([
      String(i + 1),
      pickMaSp(d),
      pickMaCtsp(d),
      pickTenSanPham(d),
      pickTenMauSac(d),
      pickTenKichThuoc(d),
      pickTenLoaiSan(d),
      String(Number(pickSoLuong(d) || 0)),
      String(formatMoney(pickGia(d))),
      tt,
    ]);
  });

  const csv = lines.map((arr) => arr.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chi_tiet_san_pham_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = String(dataUrl).split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const bin = atob(base64);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function makeQrDataUrl(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  return await QRCode.toDataURL(t, {
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

async function downloadQrZip(list, fileName) {
  const arr = Array.isArray(list) ? list : [];
  if (!arr.length) {
    alert("Không có dữ liệu để tải QR.");
    return;
  }

  zipDownloading.value = true;
  try {
    const zip = new JSZip();

    for (const d of arr) {
      const code = String(pickMaCtsp(d) || "").trim();
      if (!code) continue;

      const dataUrl = await makeQrDataUrl(code);
      if (!dataUrl) continue;

      const blob = dataUrlToBlob(dataUrl);
      zip.file(`${code}_QR.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("Tải QR (zip) chưa thành công. Vui lòng thử lại.");
  } finally {
    zipDownloading.value = false;
  }
}

async function downloadQrSelectedZip() {
  const rows = (filteredDetails.value || []).filter((d) =>
    selectedIds.has(Number(d?.id)),
  );
  if (!rows.length) {
    alert("Vui lòng chọn ít nhất 1 dòng để tải QR.");
    return;
  }
  await downloadQrZip(
    rows,
    `qr_da_chon_${new Date().toISOString().slice(0, 10)}.zip`,
  );
}

async function downloadQrAllZip() {
  const rows = filteredDetails.value || [];
  if (!rows.length) {
    alert("Không có dữ liệu để tải QR.");
    return;
  }
  await downloadQrZip(
    rows,
    `qr_tat_ca_${new Date().toISOString().slice(0, 10)}.zip`,
  );
}

/* =======================
   ✅ EDIT MODAL (GIỮ NGUYÊN)
   ======================= */
const editOpen = ref(false);
const editSaving = ref(false);
const editError = ref("");

const editForm = reactive({
  id: null,
  maCtsp: "",
  tenMauSac: "",
  tenKichThuoc: "",
  tenLoaiSan: "",
  tenFormChan: "",
  soLuong: 0,
  giaBan: 0,
  giaBanText: "",
  trangThai: true,
  moTa: "",
  anhHienTai: "",
  file: null,
  previewUrl: "",
  idMauSac: null,
  idKichThuoc: null,
  idLoaiSan: null,
  idFormChan: null,
});

function openEdit(d) {
  editError.value = "";
  editForm.id = d?.id ?? null;
  editForm.maCtsp = pickMaCtsp(d);
  editForm.tenMauSac = pickTenMauSac(d);
  editForm.tenKichThuoc = pickTenKichThuoc(d);
  editForm.tenLoaiSan = pickTenLoaiSan(d);
  editForm.tenFormChan = pickTenFormChan(d);

  editForm.soLuong = Number(pickSoLuong(d) || 0);
  editForm.giaBan = Number(pickGia(d) || 0);
  editForm.giaBanText = formatMoney(editForm.giaBan);

  editForm.trangThai = getTrangThai(d);
  editForm.moTa = d?.moTa ?? d?.mo_ta ?? d?.ghiChu ?? d?.ghi_chu ?? "";

  editForm.anhHienTai = pickImageUrl(d);
  editForm.file = null;
  if (editForm.previewUrl) URL.revokeObjectURL(editForm.previewUrl);
  editForm.previewUrl = "";

  editForm.idMauSac = toIntOrNull(pickIdMauSac(d));
  editForm.idKichThuoc = toIntOrNull(pickIdKichThuoc(d));
  editForm.idLoaiSan = toIntOrNull(pickIdLoaiSan(d));
  editForm.idFormChan = toIntOrNull(pickIdFormChan(d));

  editOpen.value = true;
}

function closeEdit() {
  editOpen.value = false;
  editSaving.value = false;
  editError.value = "";
}

function clearPickedImage() {
  editForm.file = null;
  if (editForm.previewUrl) URL.revokeObjectURL(editForm.previewUrl);
  editForm.previewUrl = "";
}

function onPickImage(e) {
  const file = e?.target?.files?.[0];
  if (!file) return;

  editForm.file = file;
  if (editForm.previewUrl) URL.revokeObjectURL(editForm.previewUrl);
  editForm.previewUrl = URL.createObjectURL(file);

  e.target.value = "";
}

function onlyDigits(s) {
  return String(s ?? "").replace(/[^\d]/g, "");
}
function onGiaBanInput() {
  const digits = onlyDigits(editForm.giaBanText);
  const n = Number(digits || 0);
  editForm.giaBan = Number.isFinite(n) ? n : 0;
  editForm.giaBanText = digits ? formatMoney(n) : "";
}

function findIdByName(options, name, keys) {
  const target = lc(name);
  if (!target) return null;
  const arr = unwrapList(options);
  for (const x of arr) {
    const t = lc(pickTenFrom(x, keys));
    if (t && t === target) {
      const id = Number(x?.id);
      if (Number.isFinite(id)) return id;
    }
  }
  return null;
}

async function saveEdit() {
  editError.value = "";
  if (!editForm.id) {
    editError.value = "Không xác định được bản ghi cần sửa.";
    return;
  }

  const msId = findIdByName(mauSacOptions.value, editForm.tenMauSac, [
    "tenMauSac",
    "ten_mau_sac",
    "ten",
  ]);
  const ktId = findIdByName(kichThuocOptions.value, editForm.tenKichThuoc, [
    "tenKichThuoc",
    "ten_kich_thuoc",
    "ten",
  ]);
  const lsId = findIdByName(loaiSanOptions.value, editForm.tenLoaiSan, [
    "tenLoaiSan",
    "ten_loai_san",
    "ten",
  ]);
  const fcId = findIdByName(formChanOptions.value, editForm.tenFormChan, [
    "tenFormChan",
    "ten_form_chan",
    "ten",
  ]);

  const payload = {
    id: editForm.id,
    soLuong: Number(editForm.soLuong || 0),
    giaBan: Number(editForm.giaBan || 0),
    trangThai: !!editForm.trangThai,
    moTa: editForm.moTa,
    idMauSac: msId ?? editForm.idMauSac,
    idKichThuoc: ktId ?? editForm.idKichThuoc,
    idLoaiSan: lsId ?? editForm.idLoaiSan,
    idFormChan: fcId ?? editForm.idFormChan,
  };

  editSaving.value = true;
  try {
    if (typeof productDetailService?.update === "function") {
      await productDetailService.update(editForm.id, payload);
    } else if (typeof productDetailService?.updateById === "function") {
      await productDetailService.updateById(editForm.id, payload);
    } else if (typeof productDetailService?.save === "function") {
      await productDetailService.save(payload);
    } else {
      const res = await fetch(
        `${apiBase()}/api/chi-tiet-san-pham/${editForm.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Fallback API update không thành công.");
    }

    if (editForm.file) {
      try {
        if (typeof anhChiTietSanPhamService?.uploadDaiDien === "function") {
          await anhChiTietSanPhamService.uploadDaiDien(
            editForm.id,
            editForm.file,
          );
        } else if (typeof anhChiTietSanPhamService?.upload === "function") {
          await anhChiTietSanPhamService.upload(editForm.id, editForm.file);
        } else if (typeof anhChiTietSanPhamService?.create === "function") {
          const fd = new FormData();
          fd.append("idChiTietSanPham", String(editForm.id));
          fd.append("file", editForm.file);
          await anhChiTietSanPhamService.create(fd);
        }
      } catch (imgErr) {
        console.warn("Upload ảnh chưa thành công:", imgErr);
      }
    }

    const idx = details.value.findIndex((x) => x?.id === editForm.id);
    if (idx !== -1) {
      const old = details.value[idx];
      details.value[idx] = {
        ...old,
        soLuong: payload.soLuong,
        giaBan: payload.giaBan,
        trangThai: payload.trangThai,
        moTa: payload.moTa,
        idMauSac: payload.idMauSac,
        idKichThuoc: payload.idKichThuoc,
        idLoaiSan: payload.idLoaiSan,
        idFormChan: payload.idFormChan,
        tenMauSac: editForm.tenMauSac,
        tenKichThuoc: editForm.tenKichThuoc,
        tenLoaiSan: editForm.tenLoaiSan,
        tenFormChan: editForm.tenFormChan,
        anhDaiDienUrl: editForm.previewUrl || old.anhDaiDienUrl,
      };
      bumpImgVer();
    }

    closeEdit();
  } catch (e) {
    console.error(e);
    editError.value =
      "Cập nhật chưa thành công. Vui lòng kiểm tra API update chi tiết sản phẩm của BE/service.";
  } finally {
    editSaving.value = false;
  }
}

const qrDataUrl = ref("");

async function genQr() {
  const text = String(editForm.maCtsp || "").trim();
  if (!text) {
    qrDataUrl.value = "";
    return;
  }

  try {
    qrDataUrl.value = await QRCode.toDataURL(text, {
      width: 210,
      margin: 1,
      errorCorrectionLevel: "M",
    });
  } catch (e) {
    console.error("QR gen error:", e);
    qrDataUrl.value = "";
  }
}

watch(
  () => editForm.maCtsp,
  () => genQr(),
  { immediate: true },
);

async function downloadQr() {
  const text = String(editForm.maCtsp || "").trim();
  if (!text || !qrDataUrl.value) return;

  try {
    const blob = dataUrlToBlob(qrDataUrl.value);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${text}_QR.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("Không tải được QR. Vui lòng thử lại.");
  }
}

/* =======================
   ✅ QR CAMERA (GIỮ NGUYÊN)
   ======================= */
const qrCameraOpen = ref(false);
const qrError = ref("");
let qrScanner = null;

async function openQrCamera() {
  qrError.value = "";
  qrCameraOpen.value = true;
  await nextTick();
  await startQrCamera();
}

function findProductByMa(ma) {
  const code = lc(ma);
  if (!code) return null;
  return (
    unwrapList(productOptions.value).find(
      (x) => lc(x?.maSanPham ?? x?.ma_san_pham ?? x?.ma ?? "") === code,
    ) || null
  );
}

function findCtspByMa(maCtsp) {
  const code = lc(maCtsp);
  if (!code) return null;
  return (details.value || []).find((x) => lc(pickMaCtsp(x)) === code) || null;
}

function applyScopeAndReplaceRouteByProductId(id) {
  const pid = toIntOrNull(id);
  if (pid == null) return;

  applyScopedProductById(pid);
  router.replace({
    path: "/admin/chi-tiet-san-pham",
    query: { sanPhamId: pid },
  });
}

async function handleScannedText(decodedText) {
  const val = String(decodedText || "").trim();
  if (!val) return;

  if (/^sp/i.test(val)) {
    const p = findProductByMa(val);
    if (p?.id != null) {
      keyword.value = "";
      applyScopeAndReplaceRouteByProductId(p.id);
      return;
    }
    keyword.value = val;
    return;
  }

  if (/^ctsp/i.test(val) || /^ct/i.test(val)) {
    const ct = findCtspByMa(val);
    if (ct) {
      const pid = toIntOrNull(pickIdSanPham(ct));
      if (pid != null) {
        applyScopeAndReplaceRouteByProductId(pid);
      }
      keyword.value = val;
      return;
    }
    keyword.value = val;
    return;
  }

  keyword.value = val;
}

async function startQrCamera() {
  try {
    await stopQrCamera();
    qrScanner = new Html5Qrcode("ss-qr-reader");
    const config = { fps: 10, qrbox: { width: 280, height: 280 } };

    await qrScanner.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        await handleScannedText(decodedText);
        await closeQrCamera();
      },
      () => {},
    );
  } catch (e) {
    console.error(e);
    qrError.value =
      "Không mở được camera / không quét được QR. Vui lòng cấp quyền camera và thử lại.";
  }
}

async function stopQrCamera() {
  try {
    if (qrScanner) {
      try {
        await qrScanner.stop();
      } catch {}
      try {
        await qrScanner.clear();
      } catch {}
      qrScanner = null;
    }
  } catch {}
}
async function restartQrCamera() {
  qrError.value = "";
  await startQrCamera();
}
async function closeQrCamera() {
  qrCameraOpen.value = false;
  await stopQrCamera();
}

onBeforeUnmount(() => {
  stopQrCamera();
  if (editForm.previewUrl) URL.revokeObjectURL(editForm.previewUrl);
});
</script>

<style scoped>
.ss-btn-lite {
  background: #f3f4f6 !important;
  color: rgba(17, 24, 39, 0.88) !important;
  border: 1px solid rgba(17, 24, 39, 0.1) !important;
}
.ss-btn-lite:hover {
  background: #eef0f3 !important;
}

/* ✅ Ép toàn bộ không in đậm */
.ss-font,
.ss-font * {
  font-weight: 400 !important;
}

.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

/* không đè font icon */
.material-icons,
.material-icons-outlined {
  font-family: "Material Icons", "Material Icons Outlined" !important;
  font-weight: normal !important;
}

/* HEAD */
.ss-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 16px;
}
.ss-title {
  font-size: 20px;
  letter-spacing: 0.2px;
  color: rgba(17, 24, 39, 0.9);
}

/* Cards */
.ss-card {
  background: #fff;
  border-radius: 14px;
}
.ss-border {
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06);
}

/* FILTER */
.ss-filter-card {
  padding: 14px 16px;
  margin-bottom: 18px;
}
.ss-filter-head {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.ss-filter-icon {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.65);
}
.ss-filter-title {
  font-size: 14px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-filter-label {
  font-size: 12px;
  margin-bottom: 6px;
  color: rgba(17, 24, 39, 0.55);
}

.ss-filter-row1 {
  display: grid;
  grid-template-columns: 1.6fr 0.7fr;
  gap: 12px;
  align-items: start;
}

.ss-filter-row2 {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: start;
}

.ss-filter-row3 {
  margin-top: 12px;
}

.ss-filter-actions-under {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

/* Search */
.ss-search-wrap {
  position: relative;
  width: 100%;
}
.ss-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(17, 24, 39, 0.45);
  pointer-events: none;
}
.ss-search-input {
  padding-left: 38px !important;
  height: 40px;
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
}
.ss-search-input:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55);
}

/* Select */
.ss-select {
  height: 40px;
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
}
.ss-select:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55);
}

/* Buttons */
.ss-btn-ic {
  font-size: 18px;
  margin-right: 8px;
}
.btn {
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.ss-btn-primary {
  border: none !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.16);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}
.ss-btn-warn {
  border: none !important;
  background: #ff7a45 !important;
  color: #fff !important;
}
.ss-btn-warn:hover {
  filter: brightness(0.98);
}
.ss-btn-dark {
  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;
}
.ss-btn-dark:hover {
  filter: brightness(0.98);
}
.ss-btn-outline {
  background: #fff !important;
  color: rgba(17, 24, 39, 0.88) !important;
  border: 1px solid rgba(17, 24, 39, 0.18) !important;
}
.ss-btn-outline:hover {
  background: rgba(17, 24, 39, 0.04) !important;
}

/* LIST */
.ss-list-card {
  padding: 0;
}
.ss-list-title {
  padding: 14px 16px 10px;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.82);
}

/* Table */
.ss-table-wrap {
  overflow-x: hidden;
}
.ss-table {
  width: 100%;
  table-layout: fixed;
}
.ss-table thead th {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.75);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 77, 79, 0.06);
  white-space: nowrap;
  border-left: none !important;
  border-right: none !important;
}
.ss-table td,
.ss-table th {
  padding: 12px 14px;
  vertical-align: middle;
}
.ss-table tbody td {
  border-left: none !important;
  border-right: none !important;
}
.ss-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

/* widths */
.col-check {
  width: 3%;
}
.col-stt {
  width: 5%;
}
.col-masp {
  width: 8%;
}
.col-ma {
  width: 8%;
}
.col-anh {
  width: 6%;
}
.col-ten {
  width: 13%;
}
.col-mau {
  width: 9%;
}
.col-kt {
  width: 6%;
}
.col-ls {
  width: 10%;
}
.col-sl {
  width: 6%;
}
.col-gia {
  width: 9%;
}
.col-tt {
  width: 8%;
}
.col-action {
  width: 8%;
}

.ss-td {
  color: rgba(17, 24, 39, 0.78);
}
.ss-muted {
  color: rgba(17, 24, 39, 0.55);
}

/* ✅ checkbox */
.ss-check {
  width: 16px;
  height: 16px;
  accent-color: #ff4d4f;
  cursor: pointer;
}

/* ✅ Giá bán màu đỏ */
.ss-money {
  color: #ff4d4f;
  white-space: nowrap;
}

.ss-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* thumb */
.ss-thumb {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
  margin: 0 auto;
}
.ss-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* swatch */
.ss-swatch {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  flex: 0 0 auto;
}

/* Badge */
.ss-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  white-space: nowrap;
  min-width: 108px;
}

.ss-badge-on {
  color: rgba(180, 35, 36, 0.95);
  background: rgba(255, 77, 79, 0.12);
  border-color: rgba(255, 77, 79, 0.25);
}

.ss-badge-off {
  color: rgba(17, 24, 39, 0.65);
  background: rgba(17, 24, 39, 0.06);
  border-color: rgba(17, 24, 39, 0.12);
}

/* icon view */
.ss-icon-btn-view {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: 0.15s ease;
}
.ss-icon-btn-view .material-icons-outlined {
  font-size: 20px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-icon-btn-view:hover {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.22);
}

/* ✅ Khoảng giá màu đỏ */
.ss-price-hint {
  font-size: 13px;
  color: rgba(255, 77, 79, 0.95);
}

.ss-range-wrap {
  position: relative;
  padding: 14px 0 10px;
}
.ss-range {
  width: 100%;
  appearance: none;
  height: 20px;
  background: transparent;
  position: relative;
  z-index: 3;
  outline: none;
  margin: 0;
}
.ss-range-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 14px;
  pointer-events: none;
}
.ss-range-top::-webkit-slider-thumb {
  pointer-events: auto;
}
.ss-range-top::-moz-range-thumb {
  pointer-events: auto;
}

.ss-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.18);
  box-shadow: 0 2px 10px rgba(17, 24, 39, 0.1);
  cursor: pointer;
  margin-top: 1px;
}
.ss-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.18);
  box-shadow: 0 2px 10px rgba(17, 24, 39, 0.1);
  cursor: pointer;
}
.ss-range-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 24px;
  height: 6px;
  z-index: 1;
}
.ss-range-track-bg {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.1);
}
.ss-range-track-fill {
  position: absolute;
  top: 0;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
}

/* Pagination */
.ss-pagination-bar {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}
.ss-pagination {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-pagebtn {
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: rgba(17, 24, 39, 0.85);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s ease;
}
.ss-pagebtn:hover {
  background: rgba(17, 24, 39, 0.04);
}
.ss-pagebtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-pagebtn.active {
  border-color: rgba(255, 77, 79, 0.35);
  background: rgba(255, 77, 79, 0.08);
}
.ss-pageinfo {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-pageinfo span {
  color: rgba(17, 24, 39, 0.9);
}

/* PrimeVue MultiSelect */
.ss-pv-multi :deep(.p-multiselect) {
  width: 100%;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  box-shadow: none;
}
.ss-pv-multi :deep(.p-multiselect:not(.p-disabled).p-focus) {
  border-color: rgba(255, 77, 79, 0.55);
  box-shadow: none;
}
.ss-pv-multi :deep(.p-multiselect-label) {
  padding: 8px 12px;
  color: rgba(17, 24, 39, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ss-pv-multi :deep(.p-multiselect-trigger) {
  width: 40px;
}
.ss-pv-multi :deep(.p-multiselect-token) {
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.04);
  color: rgba(17, 24, 39, 0.82);
}
.ss-pv-multi :deep(.p-multiselect-token-icon) {
  color: rgba(17, 24, 39, 0.6);
}

/* dấu * màu đỏ */
.ss-required {
  color: #ff4d4f;
}

/* MODAL */
.ss-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  z-index: 2000;
}
.ss-modal {
  width: min(720px, calc(100vw - 24px));
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  padding: 14px;
  box-shadow: 0 12px 40px rgba(17, 24, 39, 0.18);
}
.ss-modal-wide {
  width: min(720px, calc(100vw - 24px));
}
.ss-edit-modal {
  max-height: 86vh;
  overflow: auto;
}
.ss-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.ss-modal-title {
  font-size: 16px;
  color: rgba(17, 24, 39, 0.9);
}
.ss-xbtn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-xbtn .material-icons-outlined {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.8);
}
.ss-xbtn:hover {
  background: rgba(17, 24, 39, 0.04);
}

.ss-alert {
  margin: 8px 0 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 79, 0.35);
  background: rgba(255, 77, 79, 0.08);
  color: rgba(255, 77, 79, 0.92);
  font-size: 13px;
}

.ss-edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.ss-edit-grid-2 {
  margin-top: 12px;
  align-items: start;
}
.ss-edit-col {
  display: grid;
  gap: 10px;
}

.ss-input-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.6);
  margin-bottom: 6px;
}
.ss-input {
  height: 40px;
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
}
.ss-input:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55);
}
.ss-textarea {
  border-radius: 12px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
}
.ss-textarea:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55);
}

/* status switch */
.ss-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
}
.ss-status-text {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.8);
}
.ss-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  transition: 0.2s;
  border-radius: 999px;
}
.ss-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background: white;
  transition: 0.2s;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.14);
}
.ss-switch input:checked + .ss-slider {
  background: rgba(255, 77, 79, 0.65);
}
.ss-switch input:checked + .ss-slider:before {
  transform: translateX(20px);
}

/* box QR / ảnh */
.ss-box {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}
.ss-box-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.ss-box-title {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-mini-btn {
  border-radius: 10px;
  padding: 7px 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.86);
  gap: 8px;
}
.ss-mini-btn:hover {
  background: rgba(17, 24, 39, 0.04);
}

/* QR */
.ss-qr-wrap {
  display: grid;
  justify-items: center;
  gap: 8px;
}
.ss-qr-img {
  width: 210px;
  height: 210px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
}
.ss-qr-empty {
  width: 210px;
  height: 210px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: rgba(17, 24, 39, 0.02);
  display: grid;
  place-items: center;
  font-size: 12px;
}
.ss-qr-hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.6);
}

/* ảnh */
.ss-img-remove {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255, 77, 79, 0.3);
  background: rgba(255, 77, 79, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-img-remove .material-icons-outlined {
  font-size: 16px;
  color: rgba(255, 77, 79, 0.95);
}
.ss-img-card {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 4px 0 2px;
}
.ss-img-preview {
  width: 100%;
  height: 180px;
  border-radius: 14px;
  border: 1px dashed rgba(17, 24, 39, 0.18);
  display: grid;
  place-items: center;
  overflow: hidden;
  background: rgba(17, 24, 39, 0.02);
}
.ss-img-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ss-btn-img {
  border: none !important;
  background: #ff7a45 !important;
  color: #fff !important;
  border-radius: 10px !important;
  padding: 8px 14px !important;
}
.ss-btn-img:hover {
  filter: brightness(0.98);
}
.ss-img-note {
  font-size: 11px;
  color: rgba(17, 24, 39, 0.55);
}

/* footer */
.ss-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

/* loading spin */
.ss-spin {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-top-color: #fff;
  margin-right: 8px;
  display: inline-block;
  animation: ssSpin 0.8s linear infinite;
}
@keyframes ssSpin {
  to {
    transform: rotate(360deg);
  }
}

/* QR scan modal */
.ss-qr-box {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: rgba(17, 24, 39, 0.04);
}
.ss-qr-reader {
  width: 100%;
  min-height: 360px;
}
.ss-cam-error {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 79, 0.35);
  background: rgba(255, 77, 79, 0.08);
  color: rgba(255, 77, 79, 0.92);
}

/* Responsive */
@media (max-width: 1200px) {
  .ss-filter-row1 {
    grid-template-columns: 1fr 1fr;
  }
  .ss-filter-row2 {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 860px) {
  .ss-edit-grid {
    grid-template-columns: 1fr;
  }
  .ss-qr-img,
  .ss-qr-empty {
    width: 190px;
    height: 190px;
  }
  .ss-img-preview {
    height: 170px;
  }
}
</style>
