<!-- File: src/pages/product/ProductManagePage.vue -->
<template>
  <div class="ss-page ss-font">
    <transition name="ss-toast-fade">
      <div
        v-if="toast.show"
        class="ss-toast"
        :class="toast.type === 'success' ? 'is-success' : 'is-error'"
      >
        <div class="ss-toast-icon">
          <span class="material-icons-outlined">
            {{ toast.type === "success" ? "check_circle" : "error" }}
          </span>
        </div>
        <div class="ss-toast-content">
          <div class="ss-toast-title">
            {{ toast.type === "success" ? "Thành công" : "Có lỗi xảy ra" }}
          </div>
          <div class="ss-toast-message">{{ toast.message }}</div>
        </div>
        <button class="ss-toast-close" type="button" @click="hideToast">
          <span class="material-icons-outlined">close</span>
        </button>
      </div>
    </transition>

    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Quản lý sản phẩm/ Danh sách sản phẩm</div>
      </div>

      <div class="ss-head-right">
        <div class="ss-count">
          Tổng số sản phẩm: <span>{{ filteredProducts.length }}</span>
        </div>
      </div>
    </div>

    <div class="ss-card ss-border ss-filter-card">
      <div class="ss-filter-head">
        <span class="material-icons-outlined ss-filter-icon">filter_alt</span>
        <div class="ss-filter-title">Bộ lọc tìm kiếm</div>
      </div>

      <div class="ss-filter-row1">
        <div class="ss-field ss-field-left">
          <div class="ss-filter-label">Tìm kiếm</div>
          <div class="ss-search-wrap">
            <span class="material-icons-outlined ss-search-icon">search</span>
            <input
              v-model="keyword"
              class="form-control ss-search-input"
              placeholder="Tìm theo mã / tên sản phẩm..."
              :disabled="loading"
            />
          </div>

          <div class="ss-filter-label ss-mt-10">Trạng thái</div>
          <div class="ss-radio">
            <label class="ss-radio-item">
              <input type="radio" value="all" v-model="stockFilter" />
              <span>Tất cả</span>
            </label>

            <label class="ss-radio-item">
              <input type="radio" value="in_stock" v-model="stockFilter" />
              <span>Kinh doanh</span>
            </label>

            <label class="ss-radio-item">
              <input type="radio" value="out_stock" v-model="stockFilter" />
              <span>Ngừng kinh doanh</span>
            </label>
          </div>
        </div>

        <div class="ss-field ss-field-select">
          <div class="ss-filter-label">Chất liệu</div>

          <div class="ss-combo" :class="{ disabled: loading }">
            <input
              v-model="chatLieuFilterText"
              class="form-control ss-combo-input"
              placeholder="Chất liệu"
              :disabled="loading"
              @focus="openChatLieuCombo"
              @blur="closeChatLieuCombo"
              @input="onChatLieuInput"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.clOpen && !loading" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !chatLieuSelectedId && !chatLieuFilterText }"
                @mousedown.prevent="selectChatLieu(null)"
                title="Bỏ lọc chất liệu"
              >
                Tất cả
              </div>

              <div
                v-for="cl in chatLieuSuggest"
                :key="`cl-${cl.id}`"
                class="ss-combo-item"
                :class="{ active: Number(chatLieuSelectedId) === Number(cl.id) }"
                @mousedown.prevent="selectChatLieu(cl)"
                :title="cl.ten"
              >
                {{ cl.ten }}
              </div>

              <div v-if="!chatLieuSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>
        </div>

        <div class="ss-field ss-field-select">
          <div class="ss-filter-label">Thương hiệu</div>

          <div class="ss-combo" :class="{ disabled: loading }">
            <input
              v-model="thuongHieuFilterText"
              class="form-control ss-combo-input"
              placeholder="Thương hiệu"
              :disabled="loading"
              @focus="openThuongHieuCombo"
              @blur="closeThuongHieuCombo"
              @input="onThuongHieuInput"
            />
            <span class="material-icons-outlined ss-combo-ic">expand_more</span>

            <div v-if="combo.thOpen && !loading" class="ss-combo-list" @mousedown.prevent>
              <div
                class="ss-combo-item"
                :class="{ active: !thuongHieuSelectedId && !thuongHieuFilterText }"
                @mousedown.prevent="selectThuongHieu(null)"
                title="Bỏ lọc thương hiệu"
              >
                Tất cả
              </div>

              <div
                v-for="th in thuongHieuSuggest"
                :key="`th-${th.id}`"
                class="ss-combo-item"
                :class="{ active: Number(thuongHieuSelectedId) === Number(th.id) }"
                @mousedown.prevent="selectThuongHieu(th)"
                :title="th.ten"
              >
                {{ th.ten }}
              </div>

              <div v-if="!thuongHieuSuggest.length" class="ss-combo-empty">
                Không có gợi ý phù hợp
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ss-filter-row2">
        <div class="ss-filter-actions">
          <button class="btn ss-btn-outline" type="button" @click="exportExcel" :disabled="loading">
            <span class="material-icons-outlined ss-btn-ic">description</span>
            Tải Excel
          </button>

          <button class="btn ss-btn-primary" type="button" @click="goAddProductDetail" :disabled="loading">
            <span class="material-icons-outlined ss-btn-ic">add</span>
            Thêm chi tiết sản phẩm
          </button>

          <button class="btn ss-btn-soft" type="button" @click="openQr" :disabled="loading">
            <span class="material-icons-outlined ss-btn-ic">qr_code_scanner</span>
            Quét QR
          </button>

          <button class="btn ss-btn-outline" type="button" @click="resetFilter" :disabled="loading">
            <span class="material-icons-outlined ss-btn-ic">restart_alt</span>
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
    </div>

    <div class="ss-card ss-border ss-list-card">
      <div class="ss-list-title">Danh sách sản phẩm</div>

      <div class="table-responsive">
        <table class="table ss-table mb-0">
          <thead>
            <tr>
              <th class="col-stt">STT</th>
              <th class="col-ma">Mã sản phẩm</th>
              <th class="col-ten">Tên sản phẩm</th>
              <th class="col-th">Thương hiệu</th>
              <th class="col-cl">Chất liệu</th>
              <th class="col-sl">Số lượng tồn</th>
              <th class="col-gia">Khoảng giá</th>
              <th class="col-tt text-center">Trạng thái</th>
              <th class="col-action text-center">Hành động</th>
            </tr>
          </thead>

          <tbody v-if="!loading && pagedProducts.length">
            <tr v-for="(p, idx) in pagedProducts" :key="p.id ?? idx">
              <td class="ss-td col-stt">{{ (page - 1) * pageSize + idx + 1 }}</td>
              <td class="ss-td ss-td-strong col-ma">{{ getMaSanPham(p) }}</td>
              <td class="ss-td col-ten" :title="getTenSanPham(p)">{{ getTenSanPham(p) }}</td>
              <td class="ss-td col-th" :title="getThuongHieuTen(p)">{{ getThuongHieuTen(p) }}</td>
              <td class="ss-td col-cl" :title="getChatLieuTen(p)">{{ getChatLieuTen(p) }}</td>

              <td class="ss-td col-sl">
                <span v-if="qtyLoadingIds.has(p.id)" class="ss-muted">...</span>
                <span v-else>{{ qtyMap[p.id] ?? 0 }}</span>
              </td>

              <td class="ss-td col-gia">
                <span v-if="priceLoadingIds.has(p.id)" class="ss-muted">...</span>
                <span v-else class="ss-money">{{ getPriceRangeText(p.id) }}</span>
              </td>

              <td class="text-center col-tt">
                <span class="ss-badge" :class="getTrangThaiKinhDoanh(p) ? 'ss-badge-on' : 'ss-badge-off'">
                  {{ getTrangThaiKinhDoanh(p) ? "Kinh doanh" : "Ngừng kinh doanh" }}
                </span>
              </td>

              <td class="text-center col-action">
                <div class="ss-actions-inline">
                  <button
                    class="ss-switch"
                    type="button"
                    :class="{ on: getTrangThaiKinhDoanh(p) }"
                    :disabled="switchLoadingIds.has(p.id)"
                    @click="openConfirmToggle(p)"
                    :title="getTrangThaiKinhDoanh(p) ? 'Tắt kinh doanh' : 'Bật kinh doanh'"
                    role="switch"
                    :aria-checked="getTrangThaiKinhDoanh(p)"
                  >
                    <span class="ss-switch-knob"></span>
                  </button>

                  <button class="ss-icon-btn-view" type="button" title="Xem biến thể" @click="viewVariants(p)">
                    <span class="material-icons-outlined">visibility</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="loading">
            <tr><td colspan="9" class="text-center py-4 ss-muted">Đang tải...</td></tr>
          </tbody>

          <tbody v-else>
            <tr><td colspan="9" class="text-center py-4 ss-muted">Không có dữ liệu</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="ss-pagination-bar">
      <div class="ss-pagination">
        <button class="ss-pagebtn" :disabled="page <= 1" @click="page--" title="Trang trước">‹</button>

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

        <button class="ss-pagebtn" :disabled="page >= totalPages" @click="page++" title="Trang sau">›</button>
      </div>

      <div class="ss-pageinfo">Trang <span>{{ page }}</span> / <span>{{ totalPages }}</span></div>
    </div>

    <div v-if="qr.open" class="ss-overlay" @click.self="closeQr">
      <div class="ss-modal ss-qr-modal">
        <div class="ss-modal-header">
          <div class="ss-modal-title">Quét QR sản phẩm</div>
          <button class="ss-modal-close" type="button" @click="closeQr">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>

        <div class="ss-modal-body">
          <div v-if="qr.error" class="ss-qr-error">{{ qr.error }}</div>
          <video ref="videoRef" class="ss-qr-video" autoplay playsinline muted></video>
          <div class="ss-qr-hint">Đưa QR vào khung, hệ thống sẽ tự nhận và lọc.</div>
        </div>

        <div class="ss-modal-footer">
          <button class="btn ss-btn-outline" type="button" @click="closeQr">Đóng</button>
        </div>
      </div>
    </div>

    <canvas ref="canvasRef" class="d-none"></canvas>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import { refDataService } from "@/services/refDataService";

const router = useRouter();
const loading = ref(false);

const products = ref([]);
const keyword = ref("");

const chatLieuFilterText = ref("");
const thuongHieuFilterText = ref("");
const chatLieuSelectedId = ref(null);
const thuongHieuSelectedId = ref(null);

const stockFilter = ref("all");

const page = ref(1);
const pageSize = ref(10);

const qtyMap = reactive({});
const qtyLoadingIds = reactive(new Set());

const priceMap = reactive({});
const priceLoadingIds = reactive(new Set());

const thuongHieuOptions = ref([]);
const chatLieuOptions = ref([]);
const thuongHieuMap = reactive({});
const chatLieuMap = reactive({});

const switchLoadingIds = reactive(new Set());
const ctspToProductId = reactive(new Map());

const toast = reactive({
  show: false,
  type: "success",
  message: "",
});
let toastTimer = 0;

function getErrorMessage(error, fallback) {
  const message =
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail;
  return typeof message === "string" && message.trim() ? message.trim() : fallback;
}

function showToast(message, type = "success", duration = 2500) {
  clearTimeout(toastTimer);
  toast.show = true;
  toast.type = type;
  toast.message = String(message || "");
  toastTimer = window.setTimeout(() => {
    toast.show = false;
  }, duration);
}

function hideToast() {
  clearTimeout(toastTimer);
  toast.show = false;
}

function applySwalButtonStyle(button, type = "confirm") {
  if (!button) return;

  button.style.appearance = "none";
  button.style.webkitAppearance = "none";
  button.style.border = "0";
  button.style.outline = "none";
  button.style.boxShadow = "none";
  button.style.borderRadius = "3px";
  button.style.minWidth = "78px";
  button.style.height = "38px";
  button.style.padding = "0 18px";
  button.style.fontSize = "14px";
  button.style.fontWeight = "400";
  button.style.lineHeight = "38px";
  button.style.fontFamily = "inherit";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.cursor = "pointer";

  if (type === "confirm") {
    button.style.background = "#27313b";
    button.style.color = "#fff";
  } else if (type === "cancel") {
    button.style.background = "#6c757d";
    button.style.color = "#fff";
  } else if (type === "ok") {
    button.style.background = "#8a3ffc";
    button.style.color = "#fff";
  }
}

function getSwalBase(type = "confirm") {
  return {
    width: 500,
    padding: "22px 20px 24px",
    background: "#ffffff",
    backdrop: "rgba(0,0,0,0.45)",
    allowOutsideClick: false,
    allowEscapeKey: true,
    buttonsStyling: false,
    reverseButtons: false,
    focusConfirm: false,
    customClass: {
      popup: "ss-swal-popup",
      icon: "ss-swal-icon",
      title: "ss-swal-title",
      htmlContainer: "ss-swal-text",
      actions: type === "success" ? "ss-swal-actions ss-swal-actions-center" : "ss-swal-actions",
      confirmButton: type === "success" ? "ss-swal-ok-btn" : "ss-swal-confirm-btn",
      cancelButton: "ss-swal-cancel-btn",
    },
    didOpen: (popup) => {
      const actions = popup.querySelector(".swal2-actions");
      const confirmBtn = popup.querySelector(".swal2-confirm");
      const cancelBtn = popup.querySelector(".swal2-cancel");
      const title = popup.querySelector(".swal2-title");
      const html = popup.querySelector(".swal2-html-container");
      const icon = popup.querySelector(".swal2-icon");

      popup.style.borderRadius = "6px";
      popup.style.boxShadow = "0 18px 48px rgba(0, 0, 0, 0.22)";
      popup.style.padding = "22px 20px 24px";

      if (actions) {
        actions.style.display = "flex";
        actions.style.alignItems = "center";
        actions.style.justifyContent = "center";
        actions.style.gap = "10px";
        actions.style.marginTop = "18px";
        actions.style.width = "100%";
      }

      if (title) {
        title.style.fontSize = "27px";
        title.style.lineHeight = "1.2";
        title.style.fontWeight = "400";
        title.style.color = "#333";
        title.style.margin = "2px 0 10px";
        title.style.padding = "0";
      }

      if (html) {
        html.style.fontSize = "15px";
        html.style.lineHeight = "1.45";
        html.style.fontWeight = "400";
        html.style.color = "#666";
        html.style.margin = "0";
        html.style.padding = "0";
      }

      if (icon) {
        icon.style.margin = "8px auto 10px";
      }

      if (type === "success") {
        applySwalButtonStyle(confirmBtn, "ok");
      } else {
        applySwalButtonStyle(confirmBtn, "confirm");
        applySwalButtonStyle(cancelBtn, "cancel");
      }
    },
  };
}

function buildToggleConfirmHtml(p, next) {
  const ten = getTenSanPham(p) || "—";
  const ma = getMaSanPham(p) || "—";
  const fromLabel = getTrangThaiLabel(getTrangThaiKinhDoanh(p));
  const toLabel = getTrangThaiLabel(next);

  return `
    <div style="font-weight:400;color:#666;line-height:1.5;">
      <div style="margin-bottom:10px;font-weight:400;">
        Bạn có muốn chuyển trạng thái sản phẩm này không?
      </div>
      <div style="border:1px solid rgba(255,77,79,0.14);background:linear-gradient(180deg, rgba(255,77,79,0.04), rgba(17,24,39,0.02));border-radius:10px;padding:12px 14px;text-align:left;">
        <div style="font-size:15px;color:#333;font-weight:400;margin-bottom:4px;">${escapeHtml(ten)}</div>
        <div style="font-size:13px;color:#666;font-weight:400;margin-bottom:8px;">Mã sản phẩm: ${escapeHtml(ma)}</div>
        <div style="font-size:13px;color:#666;font-weight:400;">
          Trạng thái sẽ đổi từ
          <span style="color:#b42324;font-weight:400;">${escapeHtml(fromLabel)}</span>
          sang
          <span style="color:#b42324;font-weight:400;">${escapeHtml(toLabel)}</span>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function unwrapList(v) {
  if (Array.isArray(v)) return v;
  const d = v?.data ?? v;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  return [];
}

function lc(s) {
  return String(s ?? "").trim().toLowerCase();
}

function getMaSanPham(p) {
  return p?.maSanPham ?? p?.ma_san_pham ?? p?.ma ?? "--";
}

function getTenSanPham(p) {
  return p?.tenSanPham ?? p?.ten_san_pham ?? p?.ten ?? "";
}

function getThuongHieuId(p) {
  return (
    p?.idThuongHieu ??
    p?.id_thuong_hieu ??
    p?.thuongHieuId ??
    p?.thuong_hieu_id ??
    p?.thuongHieu?.id ??
    p?.thuong_hieu?.id ??
    null
  );
}

function getChatLieuId(p) {
  return (
    p?.idChatLieu ??
    p?.id_chat_lieu ??
    p?.chatLieuId ??
    p?.chat_lieu_id ??
    p?.chatLieu?.id ??
    p?.chat_lieu?.id ??
    null
  );
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

  const id = getThuongHieuId(p);
  return id && thuongHieuMap[id] ? thuongHieuMap[id] : "--";
}

function getChatLieuTen(p) {
  const direct =
    p?.tenChatLieu ??
    p?.chatLieuTen ??
    p?.chat_lieu_ten ??
    p?.chatLieu?.tenChatLieu ??
    p?.chatLieu?.ten ??
    p?.chat_lieu?.ten_chat_lieu ??
    p?.chat_lieu?.ten;

  if (direct) return direct;

  const id = getChatLieuId(p);
  return id && chatLieuMap[id] ? chatLieuMap[id] : "--";
}

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function getPriceRangeText(productId) {
  const info = priceMap[productId];
  const min = info?.min;
  const max = info?.max;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "--";
  if (min === max) return formatMoney(min);
  return `${formatMoney(min)} - ${formatMoney(max)}`;
}

function getTrangThaiKinhDoanh(p) {
  const v =
    p?.trangThaiKinhDoanh ??
    p?.trang_thai_kinh_doanh ??
    p?.trangThai ??
    p?.trang_thai ??
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

function getTrangThaiLabel(value) {
  return value ? "Kinh doanh" : "Ngừng kinh doanh";
}

function pickMaCtsp(d) {
  return d?.maChiTietSanPham ?? d?.ma_chi_tiet_san_pham ?? d?.maCtsp ?? d?.ma ?? "";
}

const combo = reactive({ clOpen: false, thOpen: false });
let clCloseT = 0;
let thCloseT = 0;

function openChatLieuCombo() {
  if (loading.value) return;
  combo.clOpen = true;
}

function closeChatLieuCombo() {
  clearTimeout(clCloseT);
  clCloseT = window.setTimeout(() => {
    combo.clOpen = false;
  }, 140);
}

function onChatLieuInput() {
  chatLieuSelectedId.value = null;
  combo.clOpen = true;
}

function selectChatLieu(opt) {
  if (!opt) {
    chatLieuSelectedId.value = null;
    chatLieuFilterText.value = "";
  } else {
    chatLieuSelectedId.value = Number(opt.id);
    chatLieuFilterText.value = String(opt.ten ?? "");
  }
  combo.clOpen = false;
}

function openThuongHieuCombo() {
  if (loading.value) return;
  combo.thOpen = true;
}

function closeThuongHieuCombo() {
  clearTimeout(thCloseT);
  thCloseT = window.setTimeout(() => {
    combo.thOpen = false;
  }, 140);
}

function onThuongHieuInput() {
  thuongHieuSelectedId.value = null;
  combo.thOpen = true;
}

function selectThuongHieu(opt) {
  if (!opt) {
    thuongHieuSelectedId.value = null;
    thuongHieuFilterText.value = "";
  } else {
    thuongHieuSelectedId.value = Number(opt.id);
    thuongHieuFilterText.value = String(opt.ten ?? "");
  }
  combo.thOpen = false;
}

const chatLieuSuggest = computed(() => {
  const q = lc(chatLieuFilterText.value);
  const list = chatLieuOptions.value || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x.ten).includes(q) || String(x.id).includes(q)).slice(0, 50);
});

const thuongHieuSuggest = computed(() => {
  const q = lc(thuongHieuFilterText.value);
  const list = thuongHieuOptions.value || [];
  if (!q) return list.slice(0, 50);
  return list.filter((x) => lc(x.ten).includes(q) || String(x.id).includes(q)).slice(0, 50);
});

const filteredProducts = computed(() => {
  const kw = lc(keyword.value);

  const clId = chatLieuSelectedId.value != null ? Number(chatLieuSelectedId.value) : null;
  const thId = thuongHieuSelectedId.value != null ? Number(thuongHieuSelectedId.value) : null;

  const clText = lc(chatLieuFilterText.value);
  const thText = lc(thuongHieuFilterText.value);

  return (products.value || []).filter((p) => {
    const ma = lc(getMaSanPham(p));
    const ten = lc(getTenSanPham(p));
    const matchKw = !kw || ma.includes(kw) || ten.includes(kw);

    const matchCL =
      (!clId && !clText) ||
      (clId && Number(getChatLieuId(p)) === clId) ||
      (!clId && clText && lc(getChatLieuTen(p)).includes(clText));

    const matchTH =
      (!thId && !thText) ||
      (thId && Number(getThuongHieuId(p)) === thId) ||
      (!thId && thText && lc(getThuongHieuTen(p)).includes(thText));

    const kd = getTrangThaiKinhDoanh(p);

    const matchStatus =
      stockFilter.value === "all" ||
      (stockFilter.value === "in_stock" && kd) ||
      (stockFilter.value === "out_stock" && !kd);

    return matchKw && matchCL && matchTH && matchStatus;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil((filteredProducts.value.length || 0) / pageSize.value)));

const pagedProducts = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredProducts.value.slice(start, start + pageSize.value);
});

watch(
  [keyword, chatLieuFilterText, thuongHieuFilterText, chatLieuSelectedId, thuongHieuSelectedId, stockFilter],
  () => (page.value = 1)
);

watch(
  () => filteredProducts.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  }
);

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

function resetFilter() {
  keyword.value = "";
  chatLieuFilterText.value = "";
  thuongHieuFilterText.value = "";
  chatLieuSelectedId.value = null;
  thuongHieuSelectedId.value = null;
  stockFilter.value = "all";
  page.value = 1;
}

function viewVariants(p) {
  const id = p?.id;
  if (!id) return;
  router.push({ path: "/admin/chi-tiet-san-pham", query: { sanPhamId: String(id) } });
}

function goAddProductDetail() {
  router.push(`/admin/chi-tiet-san-pham/new`);
}

function exportExcel() {
  const rows = filteredProducts.value || [];
  const header = ["STT", "Mã sản phẩm", "Tên sản phẩm", "Thương hiệu", "Chất liệu", "Số lượng tồn", "Khoảng giá", "Trạng thái kinh doanh"];
  const lines = [header];

  rows.forEach((p, i) => {
    const id = p?.id;
    const sl = id ? (qtyMap[id] ?? 0) : 0;
    const gia = id ? getPriceRangeText(id) : "--";
    const tt = getTrangThaiKinhDoanh(p) ? "Kinh doanh" : "Ngừng kinh doanh";

    lines.push([
      String(i + 1),
      String(getMaSanPham(p) ?? ""),
      String(getTenSanPham(p) ?? ""),
      String(getThuongHieuTen(p) ?? ""),
      String(getChatLieuTen(p) ?? ""),
      String(sl),
      String(gia),
      String(tt),
    ]);
  });

  const csv = lines
    .map((arr) =>
      arr
        .map((cell) => {
          const s = String(cell ?? "");
          const escaped = s.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `san_pham_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sumSoLuong(details) {
  const list = Array.isArray(details) ? details : [];
  return list.reduce((acc, x) => {
    const v = x?.soLuong ?? x?.so_luong ?? 0;
    const n = Number(v);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function getGiaBienThe(x) {
  const v = x?.giaBan ?? x?.gia_ban ?? x?.donGia ?? x?.don_gia ?? x?.gia ?? x?.price ?? x?.giaNiemYet ?? x?.gia_niem_yet;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function calcMinMaxGia(details) {
  const list = Array.isArray(details) ? details : [];
  let min = null;
  let max = null;

  for (const x of list) {
    const g = getGiaBienThe(x);
    if (g === null) continue;
    if (min === null || g < min) min = g;
    if (max === null || g > max) max = g;
  }

  return { min, max };
}

async function loadAggFromDetails(list) {
  const concurrency = 6;
  let i = 0;

  async function worker() {
    while (i < list.length) {
      const cur = list[i++];
      const id = cur?.id;
      if (!id) continue;

      try {
        qtyLoadingIds.add(id);
        priceLoadingIds.add(id);

        const details = await productDetailService.getBySanPham(id);
        const arr = unwrapList(details);

        arr.forEach((d) => {
          const code = String(pickMaCtsp(d) || "").trim();
          if (code) ctspToProductId.set(code.toUpperCase(), Number(id));
        });

        qtyMap[id] = sumSoLuong(arr);

        const { min, max } = calcMinMaxGia(arr);
        priceMap[id] = { min, max };
      } catch (e) {
        console.error(e);
        qtyMap[id] = 0;
        priceMap[id] = { min: null, max: null };
      } finally {
        qtyLoadingIds.delete(id);
        priceLoadingIds.delete(id);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, worker));
}

async function loadRefOptions() {
  try {
    const thRes = await refDataService.getThuongHieu?.();
    const thList = unwrapList(thRes)
      .map((x) => ({
        id: x?.id,
        ten: x?.tenThuongHieu ?? x?.ten_thuong_hieu ?? x?.ten ?? "--",
      }))
      .filter((x) => x.id != null);

    thuongHieuOptions.value = thList;
    thList.forEach((x) => {
      thuongHieuMap[x.id] = x.ten;
    });

    const clRes = await refDataService.getChatLieu?.();
    const clList = unwrapList(clRes)
      .map((x) => ({
        id: x?.id,
        ten: x?.tenChatLieu ?? x?.ten_chat_lieu ?? x?.ten ?? "--",
      }))
      .filter((x) => x.id != null);

    chatLieuOptions.value = clList;
    clList.forEach((x) => {
      chatLieuMap[x.id] = x.ten;
    });
  } catch (e) {
    console.error(e);
  }
}

async function openConfirmToggle(p) {
  const id = p?.id;
  if (!id || switchLoadingIds.has(id)) return;

  const next = !getTrangThaiKinhDoanh(p);

  const result = await Swal.fire({
    ...getSwalBase("confirm"),
    icon: "question",
    title: "Xác nhận?",
    html: buildToggleConfirmHtml(p, next),
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    showCancelButton: true,
  });

  if (!result.isConfirmed) return;

  await toggleTrangThai(p, next);
}

async function toggleTrangThai(p, forcedNext = null) {
  const id = p?.id;
  if (!id || switchLoadingIds.has(id)) return;

  const current = getTrangThaiKinhDoanh(p);
  const next = typeof forcedNext === "boolean" ? forcedNext : !current;

  try {
    switchLoadingIds.add(id);

    const payload = {
      ...p,
      trangThaiKinhDoanh: next,
      trangThai: next,
    };

    await productService.update(id, payload);

    const idx = (products.value || []).findIndex((x) => Number(x.id) === Number(id));
    let updatedProduct = payload;

    if (idx >= 0) {
      updatedProduct = {
        ...products.value[idx],
        ...payload,
      };
      products.value[idx] = updatedProduct;
    }

    await Swal.fire({
      ...getSwalBase("success"),
      icon: "success",
      title: "Thành công!",
      html: `
        <div style="font-weight:400;color:#666;line-height:1.5;">
          Đã chuyển trạng thái sản phẩm
          <span style="font-weight:400;color:#333;">${escapeHtml(getTenSanPham(updatedProduct) || getMaSanPham(updatedProduct))}</span>
          từ
          <span style="font-weight:400;color:#b42324;">${escapeHtml(getTrangThaiLabel(current))}</span>
          sang
          <span style="font-weight:400;color:#b42324;">${escapeHtml(getTrangThaiLabel(next))}</span>.
        </div>
      `,
      confirmButtonText: "OK",
      showCancelButton: false,
    });
  } catch (e) {
    console.error(e);
    await Swal.fire({
      ...getSwalBase("confirm"),
      icon: "error",
      title: "Thất bại!",
      text: getErrorMessage(e, `Không thể thay đổi trạng thái sản phẩm "${getTenSanPham(p) || getMaSanPham(p)}".`),
      confirmButtonText: "OK",
      showCancelButton: false,
    });
    throw e;
  } finally {
    switchLoadingIds.delete(id);
  }
}

/** QR */
const qr = reactive({ open: false, error: "" });
const videoRef = ref(null);
const canvasRef = ref(null);

let qrStream = null;
let rafId = 0;
let detector = null;
let jsQRFunc = null;

async function ensureJsQR() {
  if (jsQRFunc) return jsQRFunc;
  try {
    const mod = await import("jsqr");
    jsQRFunc = mod.default;
    return jsQRFunc;
  } catch (e) {
    return null;
  }
}

async function openQr() {
  qr.error = "";
  qr.open = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    qrStream = stream;

    const video = videoRef.value;
    if (!video) return;

    video.srcObject = stream;
    await video.play();

    if ("BarcodeDetector" in window) {
      detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      scanLoopBarcodeDetector();
    } else {
      const fn = await ensureJsQR();
      if (!fn) {
        qr.error = "Trình duyệt không hỗ trợ BarcodeDetector. Để quét QR trên mọi trình duyệt, cài: npm i jsqr";
        return;
      }
      scanLoopJsQR(fn);
    }
  } catch (e) {
    console.error(e);
    qr.error = "Không mở được camera. Vui lòng kiểm tra quyền truy cập camera.";
  }
}

function fillFromQr(raw) {
  const val = String(raw || "").trim();
  if (!val) return;

  const upper = val.toUpperCase();

  const hitSp = (products.value || []).find(
    (p) => String(getMaSanPham(p) || "").trim().toUpperCase() === upper
  );

  if (hitSp) {
    keyword.value = String(getMaSanPham(hitSp) || "").trim();
    closeQr();
    return;
  }

  const spId = ctspToProductId.get(upper);
  if (spId) {
    const sp = (products.value || []).find((p) => Number(p?.id) === Number(spId));
    if (sp) {
      keyword.value = String(getMaSanPham(sp) || "").trim();
      closeQr();
      return;
    }
  }

  keyword.value = val;
  closeQr();
}

function scanLoopBarcodeDetector() {
  const video = videoRef.value;
  if (!video || !detector || !qr.open) return;

  rafId = requestAnimationFrame(async () => {
    try {
      const codes = await detector.detect(video);
      if (codes && codes.length) {
        const raw = codes[0]?.rawValue ?? "";
        if (raw) return fillFromQr(raw);
      }
    } catch {}
    scanLoopBarcodeDetector();
  });
}

function scanLoopJsQR(jsqr) {
  const video = videoRef.value;
  const canvas = canvasRef.value;
  if (!video || !canvas || !qr.open) return;

  rafId = requestAnimationFrame(() => {
    try {
      const w = video.videoWidth || 0;
      const h = video.videoHeight || 0;
      if (w && h) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const res = jsqr(img.data, w, h);
        if (res?.data) return fillFromQr(res.data);
      }
    } catch {}
    scanLoopJsQR(jsqr);
  });
}

function stopQr() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  detector = null;

  if (qrStream) {
    qrStream.getTracks().forEach((t) => t.stop());
    qrStream = null;
  }

  const video = videoRef.value;
  if (video) {
    try {
      video.pause();
      video.srcObject = null;
    } catch {}
  }
}

function closeQr() {
  qr.open = false;
  qr.error = "";
  stopQr();
}

onBeforeUnmount(() => {
  stopQr();
  clearTimeout(clCloseT);
  clearTimeout(thCloseT);
  clearTimeout(toastTimer);
});

onMounted(async () => {
  loading.value = true;
  try {
    await loadRefOptions();
    const list = await productService.getAll();
    products.value = unwrapList(list);
    await loadAggFromDetails(products.value);
  } catch (e) {
    console.error(e);
    products.value = [];
    showToast("Không thể tải danh sách sản phẩm.", "error");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

:root {
  --ss-brand-red: #ff4d4f;
  --ss-brand-red-dark: #e13c3f;
  --ss-brand-ink: #111827;
  --ss-brand-soft: rgba(255, 77, 79, 0.08);
  --ss-brand-soft-2: rgba(255, 77, 79, 0.12);
  --ss-brand-border: rgba(255, 77, 79, 0.22);
  --ss-text-main: rgba(17, 24, 39, 0.88);
  --ss-text-muted: rgba(17, 24, 39, 0.55);
}

.ss-toast {
  position: fixed;
  top: 20px;
  right: 22px;
  z-index: 5000;
  min-width: 340px;
  max-width: 520px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(17, 24, 39, 0.16);
  border: 1px solid rgba(17, 24, 39, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 12px;
}
.ss-toast.is-success {
  border-left: 5px solid var(--ss-brand-red);
}
.ss-toast.is-error {
  border-left: 5px solid #dc2626;
}
.ss-toast-icon {
  flex: 0 0 auto;
  margin-top: 1px;
}
.ss-toast.is-success .ss-toast-icon .material-icons-outlined {
  color: var(--ss-brand-red);
}
.ss-toast.is-error .ss-toast-icon .material-icons-outlined {
  color: #dc2626;
}
.ss-toast-content {
  flex: 1 1 auto;
  min-width: 0;
}
.ss-toast-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ss-text-main);
  margin-bottom: 4px;
}
.ss-toast-message {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(17, 24, 39, 0.76);
}
.ss-toast-close {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: rgba(17, 24, 39, 0.5);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.18s ease;
}
.ss-toast-close:hover {
  background: rgba(17, 24, 39, 0.05);
  color: rgba(17, 24, 39, 0.8);
}
.ss-toast-close .material-icons-outlined {
  font-size: 18px;
}
.ss-toast-fade-enter-active,
.ss-toast-fade-leave-active {
  transition: all 0.24s ease;
}
.ss-toast-fade-enter-from,
.ss-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.ss-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 16px;
}
.ss-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: rgba(17, 24, 39, 0.9);
}
.ss-count {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-count span {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 600;
}

.ss-card {
  background: #fff;
  border-radius: 14px;
}
.ss-border {
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06);
}

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
  font-weight: 500;
  color: rgba(17, 24, 39, 0.82);
}
.ss-filter-label {
  font-size: 12px;
  margin-bottom: 6px;
  color: rgba(17, 24, 39, 0.55);
  font-weight: 400;
}
.ss-mt-10 {
  margin-top: 10px;
}

.ss-filter-row1 {
  display: grid;
  grid-template-columns: 1.6fr 0.55fr 0.55fr;
  gap: 12px;
  align-items: start;
}
.ss-field-left {
  min-width: 320px;
}

.ss-filter-row2 {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.ss-filter-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  overflow: auto;
  max-width: 100%;
  padding-bottom: 2px;
}

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
.ss-search-input:focus,
.ss-combo-input:focus {
  border-color: rgba(255, 77, 79, 0.35);
  box-shadow: 0 0 0 4px rgba(255, 77, 79, 0.08);
}

.ss-select {
  height: 40px;
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
}

.ss-combo {
  position: relative;
}
.ss-combo.disabled {
  opacity: 0.98;
}
.ss-combo-input {
  height: 40px;
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14);
  padding-right: 34px !important;
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
.ss-combo-item:hover {
  background: rgba(255, 77, 79, 0.06);
}
.ss-combo-item.active {
  background: rgba(255, 77, 79, 0.1);
  color: rgba(180, 35, 36, 0.95);
}
.ss-combo-empty {
  padding: 10px 10px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}

.ss-radio {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  min-height: 40px;
}
.ss-radio-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(17, 24, 39, 0.82);
  font-size: 13px;
}
.ss-radio-item input {
  accent-color: #ff4d4f;
  transform: translateY(1px);
}

.ss-btn-ic {
  font-size: 18px;
  margin-right: 8px;
}
.btn {
  border-radius: 10px;
  padding: 9px 13px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: 0.18s ease;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ss-btn-primary {
  border: none !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 12px 24px rgba(255, 77, 79, 0.16);
}
.ss-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(0.99);
}

.ss-btn-outline {
  background: #fff !important;
  color: #ff4d4f !important;
  border: 1px solid rgba(255, 77, 79, 0.26) !important;
  box-shadow: 0 8px 18px rgba(255, 77, 79, 0.06);
}
.ss-btn-outline:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.06) !important;
  border-color: rgba(255, 77, 79, 0.36) !important;
}

.ss-btn-soft {
  background: rgba(255, 77, 79, 0.1) !important;
  color: rgba(180, 35, 36, 0.95) !important;
  border: 1px solid rgba(255, 77, 79, 0.18) !important;
}
.ss-btn-soft:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.15) !important;
}

.ss-list-card {
  padding: 0;
}
.ss-list-title {
  padding: 14px 16px 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.82);
}

.ss-table {
  width: 100%;
  table-layout: fixed;
}
.ss-table thead th {
  font-size: 13px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.75);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 77, 79, 0.06);
}
.ss-table td,
.ss-table th {
  padding: 12px 14px;
  vertical-align: middle;
}
.ss-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.col-stt {
  width: 7%;
}
.col-ma {
  width: 12%;
}
.col-ten {
  width: 15%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-th {
  width: 12%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-cl {
  width: 12%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-sl {
  width: 10%;
}
.col-gia {
  width: 17%;
}
.col-tt {
  width: 10%;
}
.col-action {
  width: 12%;
}

.ss-td {
  color: rgba(17, 24, 39, 0.78);
  font-weight: 400;
}
.ss-td-strong {
  color: rgba(17, 24, 39, 0.88);
  font-weight: 600;
}
.ss-muted {
  color: rgba(17, 24, 39, 0.55);
}

.ss-money {
  color: #ff4d4f;
  font-weight: 600;
}

.ss-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(17, 24, 39, 0.1);
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

.ss-actions-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.ss-switch {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: rgba(17, 24, 39, 0.12);
  display: inline-flex;
  align-items: center;
  padding: 2px;
  transition: 0.15s ease;
}
.ss-switch.on {
  background: rgba(255, 77, 79, 0.92);
  border-color: rgba(255, 77, 79, 0.25);
}
.ss-switch:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-switch-knob {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateX(0);
  transition: 0.15s ease;
}
.ss-switch.on .ss-switch-knob {
  transform: translateX(20px);
}

.ss-icon-btn-view {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(255, 77, 79, 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: 0.15s ease;
}
.ss-icon-btn-view .material-icons-outlined {
  font-size: 20px;
  color: rgba(180, 35, 36, 0.95);
}
.ss-icon-btn-view:hover {
  background: rgba(255, 77, 79, 0.06);
  border-color: rgba(255, 77, 79, 0.3);
}

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
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s ease;
}
.ss-pagebtn:hover {
  background: rgba(255, 77, 79, 0.04);
  border-color: rgba(255, 77, 79, 0.2);
}
.ss-pagebtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-pagebtn.active {
  border-color: rgba(255, 77, 79, 0.35);
  background: rgba(255, 77, 79, 0.08);
  color: rgba(180, 35, 36, 0.95);
}
.ss-pageinfo {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-pageinfo span {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 600;
}

.ss-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.ss-modal {
  width: 680px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.ss-qr-modal {
  width: 680px;
}
.ss-modal-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-modal-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.88);
}
.ss-modal-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 77, 79, 0.18);
  background: #fff;
  color: rgba(180, 35, 36, 0.95);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.16s ease;
}
.ss-modal-close:hover:not(:disabled) {
  background: rgba(255, 77, 79, 0.06);
  border-color: rgba(255, 77, 79, 0.28);
}
.ss-modal-close:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ss-modal-close .material-icons-outlined {
  font-size: 18px;
}
.ss-modal-body {
  padding: 16px;
}
.ss-modal-footer {
  padding: 14px 16px;
  display: flex;
  justify-content: end;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.ss-qr-error {
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.22);
  color: rgba(180, 35, 36, 0.95);
  font-size: 13px;
}
.ss-qr-video {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #000;
  max-height: 420px;
  object-fit: cover;
}
.ss-qr-hint {
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.65);
  font-size: 13px;
}

:deep(.swal2-popup.ss-swal-popup) {
  width: 500px !important;
  max-width: 500px !important;
  border-radius: 6px !important;
  padding: 22px 20px 24px !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22) !important;
  font-family: inherit !important;
}

:deep(.swal2-icon.ss-swal-icon) {
  margin: 8px auto 10px !important;
}

:deep(.swal2-icon.swal2-question.ss-swal-icon) {
  width: 72px !important;
  height: 72px !important;
  border-width: 3px !important;
  color: #9db5c2 !important;
  border-color: #9db5c2 !important;
}

:deep(.swal2-icon.swal2-success.ss-swal-icon) {
  width: 72px !important;
  height: 72px !important;
  border-width: 3px !important;
  border-color: #d8efcf !important;
  color: #8fd16f !important;
}

:deep(.swal2-icon.swal2-success .swal2-success-ring) {
  border-color: rgba(143, 209, 111, 0.22) !important;
}

:deep(.swal2-icon.swal2-success [class^="swal2-success-line"]) {
  background-color: #8fd16f !important;
}

:deep(.swal2-title.ss-swal-title) {
  font-size: 27px !important;
  line-height: 1.2 !important;
  font-weight: 400 !important;
  color: #333 !important;
  margin: 2px 0 10px !important;
  padding: 0 !important;
}

:deep(.swal2-html-container.ss-swal-text) {
  font-size: 15px !important;
  line-height: 1.45 !important;
  font-weight: 400 !important;
  color: #666 !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.swal2-actions.ss-swal-actions) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  margin-top: 18px !important;
  width: 100% !important;
}

:deep(.swal2-actions.ss-swal-actions-center) {
  justify-content: center !important;
}

:deep(.ss-swal-confirm-btn),
:deep(.ss-swal-cancel-btn),
:deep(.ss-swal-ok-btn) {
  appearance: none !important;
  -webkit-appearance: none !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  min-width: 78px !important;
  height: 38px !important;
  padding: 0 18px !important;
  border-radius: 3px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 38px !important;
  font-family: inherit !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: 0.15s ease !important;
}

:deep(.ss-swal-confirm-btn) {
  background: #27313b !important;
  color: #fff !important;
}

:deep(.ss-swal-confirm-btn:hover) {
  background: #1f2831 !important;
}

:deep(.ss-swal-cancel-btn) {
  background: #6c757d !important;
  color: #fff !important;
}

:deep(.ss-swal-cancel-btn:hover) {
  background: #5f6870 !important;
}

:deep(.ss-swal-ok-btn) {
  background: #8a3ffc !important;
  color: #fff !important;
}

:deep(.ss-swal-ok-btn:hover) {
  background: #7b32ed !important;
}

:deep(.ss-swal-confirm-btn:focus),
:deep(.ss-swal-cancel-btn:focus),
:deep(.ss-swal-ok-btn:focus) {
  outline: none !important;
  box-shadow: none !important;
}

@media (max-width: 1200px) {
  .ss-filter-row1 {
    grid-template-columns: 1fr 1fr;
  }
  .ss-filter-row2 {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .ss-toast {
    right: 12px;
    left: 12px;
    min-width: unset;
    max-width: unset;
  }

  .ss-filter-row1 {
    grid-template-columns: 1fr;
  }

  .ss-modal,
  .ss-qr-modal {
    width: calc(100vw - 24px);
  }
}
</style>