<!-- File: src/pages/product/ProductDetailListPage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">DANH SÁCH CHI TIẾT SẢN PHẨM</div>

      <div class="d-flex gap-2">
        <button class="btn ss-btn ss-btn-outline" type="button" @click="back" :disabled="loading">
          Quay lại
        </button>

        <button class="btn ss-btn ss-btn-outline" type="button" @click="reload" :disabled="loading">
          Làm mới
        </button>

        <button class="btn ss-btn ss-btn-primary" type="button" @click="goAdd" :disabled="loading">
          + Thêm chi tiết sản phẩm
        </button>
      </div>
    </div>

    <!-- FILTER -->
    <div class="ss-card ss-border p-3 mb-3">
      <div class="d-flex align-items-center mb-2">
        <span class="material-icons-outlined me-2">filter_alt</span>
        <div class="fw-bold">Bộ lọc</div>
      </div>

      <div class="row g-3">
        <!-- keyword -->
        <div class="col-lg-4">
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="material-icons-outlined ss-label-icon">search</span>
            <label class="form-label mb-0">Tìm</label>
          </div>
          <input v-model="keyword" class="form-control ss-search-input" placeholder="Tìm theo mã / tên..." />
        </div>

        <!-- sản phẩm -->
        <div class="col-lg-4">
          <label class="form-label">Sản phẩm</label>
          <select v-model="filters.idSanPham" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="p in productOptions" :key="p.id" :value="String(p.id)">
              {{ p.tenSanPham ?? p.ten_san_pham ?? p.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- thương hiệu -->
        <div class="col-lg-4">
          <label class="form-label">Thương hiệu</label>
          <select v-model="filters.idThuongHieu" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in thuongHieuOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenThuongHieu ?? x.ten_thuong_hieu ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- màu sắc -->
        <div class="col-lg-3">
          <label class="form-label">Màu sắc</label>
          <select v-model="filters.idMauSac" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in mauSacOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenMauSac ?? x.ten_mau_sac ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- kích thước -->
        <div class="col-lg-3">
          <label class="form-label">Kích thước</label>
          <select v-model="filters.idKichThuoc" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in kichThuocOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenKichThuoc ?? x.ten_kich_thuoc ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- loại sân -->
        <div class="col-lg-3">
          <label class="form-label">Loại sân</label>
          <select v-model="filters.idLoaiSan" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in loaiSanOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenLoaiSan ?? x.ten_loai_san ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- form chân -->
        <div class="col-lg-3">
          <label class="form-label">Form chân</label>
          <select v-model="filters.idFormChan" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in formChanOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenFormChan ?? x.ten_form_chan ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- xuất xứ -->
        <div class="col-lg-3">
          <label class="form-label">Xuất xứ</label>
          <select v-model="filters.idXuatXu" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in xuatXuOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenXuatXu ?? x.ten_xuat_xu ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- cổ giày -->
        <div class="col-lg-3">
          <label class="form-label">Cổ giày</label>
          <select v-model="filters.idCoGiay" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in coGiayOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenCoGiay ?? x.ten_co_giay ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- chất liệu -->
        <div class="col-lg-3">
          <label class="form-label">Chất liệu</label>
          <select v-model="filters.idChatLieu" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in chatLieuOptions" :key="x.id" :value="String(x.id)">
              {{ x.tenChatLieu ?? x.ten_chat_lieu ?? x.ten ?? "-" }}
            </option>
          </select>
        </div>

        <!-- vị trí thi đấu -->
        <div class="col-lg-3">
          <label class="form-label">Vị trí thi đấu</label>
          <select v-model="filters.idViTriThiDau" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in viTriThiDauOptions" :key="x.id" :value="String(x.id)">
              {{
                x.tenViTriThiDau ??
                x.tenViTri ??
                x.ten_vi_tri_thi_dau ??
                x.ten_vi_tri ??
                x.ten ??
                "-"
              }}
            </option>
          </select>
        </div>

        <!-- phong cách chơi -->
        <div class="col-lg-3">
          <label class="form-label">Phong cách chơi</label>
          <select v-model="filters.idPhongCachChoi" class="form-select ss-select">
            <option value="">Tất cả</option>
            <option v-for="x in phongCachChoiOptions" :key="x.id" :value="String(x.id)">
              {{
                x.tenPhongCachChoi ??
                x.tenPhongCach ??
                x.ten_phong_cach_choi ??
                x.ten_phong_cach ??
                x.ten ??
                "-"
              }}
            </option>
          </select>
        </div>

        <!-- giá min/max -->
        <div class="col-lg-3">
          <label class="form-label">Giá từ</label>
          <input v-model.number="filters.giaMin" type="number" min="0" class="form-control ss-input" placeholder="0" />
        </div>
        <div class="col-lg-3">
          <label class="form-label">Giá đến</label>
          <input v-model.number="filters.giaMax" type="number" min="0" class="form-control ss-input" placeholder="0" />
        </div>

        <!-- số lượng min/max -->
        <div class="col-lg-3">
          <label class="form-label">SL từ</label>
          <input v-model.number="filters.slMin" type="number" min="0" class="form-control ss-input" placeholder="0" />
        </div>
        <div class="col-lg-3">
          <label class="form-label">SL đến</label>
          <input v-model.number="filters.slMax" type="number" min="0" class="form-control ss-input" placeholder="0" />
        </div>

        <!-- trạng thái -->
        <div class="col-12">
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

        <!-- bar dưới: reset + page size -->
        <div class="col-12">
          <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap mt-1">
            <button class="btn ss-btn ss-btn-outline" type="button" @click="resetFilter" :disabled="loading">
              Đặt lại bộ lọc
            </button>

            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted">Hiển thị</span>
              <select v-model.number="pageSize" class="form-select ss-page-size" :disabled="loading">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
              </select>
              <span class="small text-muted">/ trang</span>
            </div>
          </div>

          <div class="small text-muted mt-2">
            Tổng bản ghi: <b>{{ filteredDetails.length }}</b>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="ss-card ss-border p-3">
      <div class="table-responsive">
        <table class="table align-middle mb-0 ss-table-grid">
          <colgroup>
            <col style="width: 70px" />
            <col style="width: 140px" />
            <col style="width: 90px" />
            <col style="width: 260px" />
            <col style="width: 140px" />
            <col style="width: 120px" />
            <col style="width: 140px" />
            <col style="width: 140px" />
            <col style="width: 140px" />
            <col style="width: 140px" />
            <col style="width: 160px" />
            <col style="width: 160px" />
            <col style="width: 160px" />
            <col style="width: 150px" />
            <col style="width: 150px" />
            <col style="width: 140px" />
          </colgroup>

          <thead>
            <tr>
              <th>STT</th>
              <th>Mã CTSP</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>

              <th>Thương hiệu</th>
              <th>Xuất xứ</th>

              <th>Màu sắc</th>
              <th>Kích thước</th>
              <th>Loại sân</th>
              <th>Form chân</th>

              <th>Cổ giày</th>
              <th>Chất liệu</th>
              <th>Vị trí thi đấu</th>
              <th>Phong cách</th>

              <th>Số lượng</th>
              <th>Giá</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody v-if="loading">
            <tr>
              <td colspan="17" class="text-center text-muted py-4">Đang tải...</td>
            </tr>
          </tbody>

          <tbody v-else-if="!pagedDetails.length">
            <tr>
              <td colspan="17" class="text-center text-muted py-4">Không có dữ liệu</td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="(d, idx) in pagedDetails" :key="d.id">
              <td>{{ (page - 1) * pageSize + idx + 1 }}</td>

              <td class="fw-semibold">{{ pickMaCtsp(d) }}</td>

              <td>
                <div class="ss-thumb">
                  <!-- ✅ cache-buster -->
                  <img v-if="pickImageUrl(d)" :src="imgUrlWithVer(pickImageUrl(d))" alt="img" />
                  <span v-else class="text-muted small">-</span>
                </div>
              </td>

              <td class="ss-name">
                <div class="fw-semibold">{{ pickTenSanPham(d) }}</div>
              </td>

              <td>{{ pickTenThuongHieu(d) }}</td>
              <td>{{ pickTenXuatXu(d) }}</td>

              <td>{{ pickTenMauSac(d) }}</td>
              <td>{{ pickTenKichThuoc(d) }}</td>
              <td>{{ pickTenLoaiSan(d) }}</td>
              <td>{{ pickTenFormChan(d) }}</td>

              <td>{{ pickTenCoGiay(d) }}</td>
              <td>{{ pickTenChatLieu(d) }}</td>
              <td>{{ pickTenViTriThiDau(d) }}</td>
              <td>{{ pickTenPhongCachChoi(d) }}</td>

              <td class="fw-semibold">{{ Number(pickSoLuong(d) || 0) }}</td>
              <td class="fw-semibold">{{ formatMoney(pickGia(d)) }}</td>

              <td class="text-center">
                <button class="btn ss-icon-btn-view" type="button" title="Xem" @click="viewDetail(d)">
                  <span class="material-icons-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination bar -->
      <div class="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
        <div class="small text-muted">Tổng: {{ filteredDetails.length }} bản ghi</div>

        <div class="ss-pagination">
          <button class="btn ss-page-btn" :disabled="page <= 1" @click="page = page - 1">
            <span class="material-icons-outlined">chevron_left</span>
          </button>

          <div class="ss-page-info">Trang <b>{{ page }}</b> / <b>{{ totalPages }}</b></div>

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
import { useRoute, useRouter } from "vue-router";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import anhChiTietSanPhamService from "@/services/anhChiTietSanPhamService";
import { refDataService } from "@/services/refDataService";

const router = useRouter();
const route = useRoute();

const loading = ref(false);

const keyword = ref("");
const statusFilter = ref("all"); // all|active|inactive

const page = ref(1);
const pageSize = ref(10);

const details = ref([]);

// ✅ cache-buster ảnh (để update xong thấy ảnh mới ngay)
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

// options
const productOptions = ref([]);
const thuongHieuOptions = ref([]);
const xuatXuOptions = ref([]);
const mauSacOptions = ref([]);
const kichThuocOptions = ref([]);
const loaiSanOptions = ref([]);
const formChanOptions = ref([]);
const coGiayOptions = ref([]);
const chatLieuOptions = ref([]);
const viTriThiDauOptions = ref([]);
const phongCachChoiOptions = ref([]);

const filters = reactive({
  idSanPham: "",
  idThuongHieu: "",
  idXuatXu: "",
  idMauSac: "",
  idKichThuoc: "",
  idLoaiSan: "",
  idFormChan: "",
  idCoGiay: "",
  idChatLieu: "",
  idViTriThiDau: "",
  idPhongCachChoi: "",
  giaMin: null,
  giaMax: null,
  slMin: null,
  slMax: null,
});

/** ========= helpers ========= */
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
  return String(s ?? "").trim().toLowerCase();
}
function numOrNull(v) {
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
    if (["true", "1", "active", "on", "kinhdoanh", "kinh_doanh"].includes(s)) return true;
    if (["false", "0", "inactive", "off", "ngung", "ngung_kinh_doanh"].includes(s)) return false;
  }
  return true;
}

/** ========= pick id ========= */
function pickIdSanPham(d) {
  return d?.idSanPham ?? d?.id_san_pham ?? d?.sanPhamId ?? d?.sanPham?.id ?? d?.san_pham?.id ?? null;
}
function pickIdMauSac(d) {
  return d?.idMauSac ?? d?.id_mau_sac ?? d?.mauSacId ?? d?.mauSac?.id ?? d?.mau_sac?.id ?? null;
}
function pickIdKichThuoc(d) {
  return d?.idKichThuoc ?? d?.id_kich_thuoc ?? d?.kichThuocId ?? d?.kichThuoc?.id ?? d?.kich_thuoc?.id ?? null;
}
function pickIdLoaiSan(d) {
  return d?.idLoaiSan ?? d?.id_loai_san ?? d?.loaiSanId ?? d?.loaiSan?.id ?? d?.loai_san?.id ?? null;
}
function pickIdFormChan(d) {
  return d?.idFormChan ?? d?.id_form_chan ?? d?.formChanId ?? d?.formChan?.id ?? d?.form_chan?.id ?? null;
}

/** ========= pick display ========= */
function pickMaCtsp(d) {
  return d?.maChiTietSanPham ?? d?.ma_chi_tiet_san_pham ?? d?.maCtsp ?? d?.ma ?? "-";
}
function pickSoLuong(d) {
  return d?.soLuong ?? d?.so_luong ?? 0;
}
function pickGia(d) {
  return d?.giaBan ?? d?.gia_ban ?? d?.giaNiemYet ?? d?.gia_niem_yet ?? d?.gia ?? 0;
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
function pickTenThuongHieu(d) {
  return d?.tenThuongHieu ?? d?.thuongHieuTen ?? d?.thuongHieu?.tenThuongHieu ?? d?.thuongHieu?.ten_thuong_hieu ?? d?.thuongHieu?.ten ?? "-";
}
function pickTenXuatXu(d) {
  return d?.tenXuatXu ?? d?.xuatXuTen ?? d?.xuatXu?.tenXuatXu ?? d?.xuatXu?.ten_xuat_xu ?? d?.xuatXu?.ten ?? "-";
}
function pickTenMauSac(d) {
  return d?.tenMauSac ?? d?.ten_mau_sac ?? d?.mauSac?.tenMauSac ?? d?.mauSac?.ten_mau_sac ?? d?.mauSac?.ten ?? "-";
}
function pickTenKichThuoc(d) {
  return d?.tenKichThuoc ?? d?.ten_kich_thuoc ?? d?.kichThuoc?.tenKichThuoc ?? d?.kichThuoc?.ten_kich_thuoc ?? d?.kichThuoc?.ten ?? "-";
}
function pickTenLoaiSan(d) {
  return d?.tenLoaiSan ?? d?.ten_loai_san ?? d?.loaiSan?.tenLoaiSan ?? d?.loaiSan?.ten_loai_san ?? d?.loaiSan?.ten ?? "-";
}
function pickTenFormChan(d) {
  return d?.tenFormChan ?? d?.ten_form_chan ?? d?.formChan?.tenFormChan ?? d?.formChan?.ten_form_chan ?? d?.formChan?.ten ?? "-";
}
function pickTenCoGiay(d) {
  return d?.tenCoGiay ?? d?.ten_co_giay ?? d?.coGiay?.tenCoGiay ?? d?.coGiay?.ten_co_giay ?? d?.coGiay?.ten ?? "-";
}
function pickTenChatLieu(d) {
  return d?.tenChatLieu ?? d?.ten_chat_lieu ?? d?.chatLieu?.tenChatLieu ?? d?.chatLieu?.ten_chat_lieu ?? d?.chatLieu?.ten ?? "-";
}
function pickTenViTriThiDau(d) {
  return (
    d?.tenViTriThiDau ??
    d?.ten_vi_tri_thi_dau ??
    d?.tenViTri ??
    d?.ten_vi_tri ??
    d?.viTriThiDau?.tenViTriThiDau ??
    d?.viTriThiDau?.ten_vi_tri_thi_dau ??
    d?.viTriThiDau?.tenViTri ??
    d?.viTriThiDau?.ten_vi_tri ??
    d?.viTriThiDau?.ten ??
    "-"
  );
}
function pickTenPhongCachChoi(d) {
  return (
    d?.tenPhongCachChoi ??
    d?.ten_phong_cach_choi ??
    d?.tenPhongCach ??
    d?.ten_phong_cach ??
    d?.phongCachChoi?.tenPhongCachChoi ??
    d?.phongCachChoi?.ten_phong_cach_choi ??
    d?.phongCachChoi?.tenPhongCach ??
    d?.phongCachChoi?.ten_phong_cach ??
    d?.phongCachChoi?.ten ??
    "-"
  );
}

/** ========= image ========= */
function apiBase() {
  const raw = import.meta?.env?.VITE_API_URL || import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080";
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
  const raw = d?.anhDaiDienUrl ?? d?.anhDaiDien ?? d?.urlAnh ?? d?.hinhAnh ?? d?.imageUrl ?? d?.image ?? d?.anh ?? "";
  return raw ? normalizeAnhPath(raw) : "";
}

/** ========= formatter ========= */
function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("vi-VN");
}

/** ========= join map ========= */
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
function toIntOrNull(v) {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function enrichCtspList(ctspList) {
  const pMap = toMapById(productOptions.value);

  const thMap = toMapById(thuongHieuOptions.value);
  const xxMap = toMapById(xuatXuOptions.value);
  const cgMap = toMapById(coGiayOptions.value);
  const clMap = toMapById(chatLieuOptions.value);
  const vtMap = toMapById(viTriThiDauOptions.value);
  const pcMap = toMapById(phongCachChoiOptions.value);

  const msMap = toMapById(mauSacOptions.value);
  const ktMap = toMapById(kichThuocOptions.value);
  const lsMap = toMapById(loaiSanOptions.value);
  const fcMap = toMapById(formChanOptions.value);

  return (ctspList || []).map((x) => {
    const pid = toIntOrNull(pickIdSanPham(x));
    const p = pid != null ? pMap.get(pid) : null;

    const idThuongHieu = toIntOrNull(p?.idThuongHieu ?? p?.id_thuong_hieu ?? p?.thuongHieuId ?? p?.thuongHieu?.id);
    const idXuatXu = toIntOrNull(p?.idXuatXu ?? p?.id_xuat_xu ?? p?.xuatXuId ?? p?.xuatXu?.id);
    const idCoGiay = toIntOrNull(p?.idCoGiay ?? p?.id_co_giay ?? p?.coGiayId ?? p?.coGiay?.id);
    const idChatLieu = toIntOrNull(p?.idChatLieu ?? p?.id_chat_lieu ?? p?.chatLieuId ?? p?.chatLieu?.id);

    const idViTriThiDau = toIntOrNull(p?.idViTriThiDau ?? p?.id_vi_tri_thi_dau ?? p?.viTriThiDauId ?? p?.viTriThiDau?.id);
    const idPhongCachChoi = toIntOrNull(p?.idPhongCachChoi ?? p?.id_phong_cach_choi ?? p?.phongCachChoiId ?? p?.phongCachChoi?.id);

    const th = idThuongHieu != null ? thMap.get(idThuongHieu) : null;
    const xx = idXuatXu != null ? xxMap.get(idXuatXu) : null;
    const cg = idCoGiay != null ? cgMap.get(idCoGiay) : null;
    const cl = idChatLieu != null ? clMap.get(idChatLieu) : null;
    const vt = idViTriThiDau != null ? vtMap.get(idViTriThiDau) : null;
    const pc = idPhongCachChoi != null ? pcMap.get(idPhongCachChoi) : null;

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

    const tenSpTmp = x?.tenSanPham ?? pickTenFrom(p, ["tenSanPham", "ten_san_pham", "ten", "name"]);

    const tenThuongHieuTmp = x?.tenThuongHieu ?? pickTenFrom(th, ["tenThuongHieu", "ten_thuong_hieu", "ten"]);
    const tenXuatXuTmp = x?.tenXuatXu ?? pickTenFrom(xx, ["tenXuatXu", "ten_xuat_xu", "ten"]);
    const tenCoGiayTmp = x?.tenCoGiay ?? pickTenFrom(cg, ["tenCoGiay", "ten_co_giay", "ten"]);
    const tenChatLieuTmp = x?.tenChatLieu ?? pickTenFrom(cl, ["tenChatLieu", "ten_chat_lieu", "ten"]);

    const tenViTriTmp =
      x?.tenViTriThiDau ??
      pickTenFrom(vt, ["tenViTriThiDau", "tenViTri", "ten_vi_tri_thi_dau", "ten_vi_tri", "ten"]);

    const tenPhongCachTmp =
      x?.tenPhongCachChoi ??
      pickTenFrom(pc, ["tenPhongCachChoi", "tenPhongCach", "ten_phong_cach_choi", "ten_phong_cach", "ten"]);

    const tenMauSacTmp = x?.tenMauSac ?? pickTenFrom(ms, ["tenMauSac", "ten_mau_sac", "ten"]);
    const tenKichThuocTmp = x?.tenKichThuoc ?? pickTenFrom(kt, ["tenKichThuoc", "ten_kich_thuoc", "ten"]);
    const tenLoaiSanTmp = x?.tenLoaiSan ?? pickTenFrom(ls, ["tenLoaiSan", "ten_loai_san", "ten"]);
    const tenFormChanTmp = x?.tenFormChan ?? pickTenFrom(fch, ["tenFormChan", "ten_form_chan", "ten"]);

    return {
      ...x,
      sanPham: x?.sanPham ?? x?.san_pham ?? p ?? null,

      tenSanPham: tenSpTmp || "-",

      idThuongHieu: x?.idThuongHieu ?? (idThuongHieu != null ? idThuongHieu : null),
      tenThuongHieu: tenThuongHieuTmp || "-",

      idXuatXu: x?.idXuatXu ?? (idXuatXu != null ? idXuatXu : null),
      tenXuatXu: tenXuatXuTmp || "-",

      idCoGiay: x?.idCoGiay ?? (idCoGiay != null ? idCoGiay : null),
      tenCoGiay: tenCoGiayTmp || "-",

      idChatLieu: x?.idChatLieu ?? (idChatLieu != null ? idChatLieu : null),
      tenChatLieu: tenChatLieuTmp || "-",

      idViTriThiDau: x?.idViTriThiDau ?? (idViTriThiDau != null ? idViTriThiDau : null),
      tenViTriThiDau: tenViTriTmp || "-",

      idPhongCachChoi: x?.idPhongCachChoi ?? (idPhongCachChoi != null ? idPhongCachChoi : null),
      tenPhongCachChoi: tenPhongCachTmp || "-",

      tenMauSac: tenMauSacTmp || "-",
      tenKichThuoc: tenKichThuocTmp || "-",
      tenLoaiSan: tenLoaiSanTmp || "-",
      tenFormChan: tenFormChanTmp || "-",
    };
  });
}

/** ========= computed filter + paging ========= */
const filteredDetails = computed(() => {
  const kw = lc(keyword.value);

  const fIdSanPham = filters.idSanPham ? String(filters.idSanPham) : "";
  const fIdThuongHieu = filters.idThuongHieu ? String(filters.idThuongHieu) : "";
  const fIdXuatXu = filters.idXuatXu ? String(filters.idXuatXu) : "";
  const fIdMauSac = filters.idMauSac ? String(filters.idMauSac) : "";
  const fIdKichThuoc = filters.idKichThuoc ? String(filters.idKichThuoc) : "";
  const fIdLoaiSan = filters.idLoaiSan ? String(filters.idLoaiSan) : "";
  const fIdFormChan = filters.idFormChan ? String(filters.idFormChan) : "";
  const fIdCoGiay = filters.idCoGiay ? String(filters.idCoGiay) : "";
  const fIdChatLieu = filters.idChatLieu ? String(filters.idChatLieu) : "";
  const fIdViTriThiDau = filters.idViTriThiDau ? String(filters.idViTriThiDau) : "";
  const fIdPhongCachChoi = filters.idPhongCachChoi ? String(filters.idPhongCachChoi) : "";

  const giaMin = numOrNull(filters.giaMin);
  const giaMax = numOrNull(filters.giaMax);
  const slMin = numOrNull(filters.slMin);
  const slMax = numOrNull(filters.slMax);

  return (details.value || []).filter((d) => {
    const maCtsp = lc(pickMaCtsp(d));
    const tenSp = lc(pickTenSanPham(d));
    const matchKw = !kw || maCtsp.includes(kw) || tenSp.includes(kw);

    const st = getTrangThai(d);
    const matchStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "active" && st) ||
      (statusFilter.value === "inactive" && !st);

    const idSanPham = pickIdSanPham(d);
    const idMauSac = pickIdMauSac(d);
    const idKichThuoc = pickIdKichThuoc(d);
    const idLoaiSan = pickIdLoaiSan(d);
    const idFormChan = pickIdFormChan(d);

    const idThuongHieu = d?.idThuongHieu ?? d?.id_thuong_hieu ?? d?.thuongHieuId ?? d?.sanPham?.thuongHieu?.id ?? null;
    const idXuatXu = d?.idXuatXu ?? d?.id_xuat_xu ?? d?.xuatXuId ?? d?.sanPham?.xuatXu?.id ?? null;
    const idCoGiay = d?.idCoGiay ?? d?.id_co_giay ?? d?.coGiayId ?? d?.sanPham?.coGiay?.id ?? null;
    const idChatLieu = d?.idChatLieu ?? d?.id_chat_lieu ?? d?.chatLieuId ?? d?.sanPham?.chatLieu?.id ?? null;

    const idViTriThiDau = d?.idViTriThiDau ?? d?.id_vi_tri_thi_dau ?? d?.viTriThiDauId ?? d?.sanPham?.viTriThiDau?.id ?? null;
    const idPhongCachChoi = d?.idPhongCachChoi ?? d?.id_phong_cach_choi ?? d?.phongCachChoiId ?? d?.sanPham?.phongCachChoi?.id ?? null;

    const matchId =
      (!fIdSanPham || String(idSanPham) === fIdSanPham) &&
      (!fIdMauSac || String(idMauSac) === fIdMauSac) &&
      (!fIdKichThuoc || String(idKichThuoc) === fIdKichThuoc) &&
      (!fIdLoaiSan || String(idLoaiSan) === fIdLoaiSan) &&
      (!fIdFormChan || String(idFormChan) === fIdFormChan) &&
      (!fIdThuongHieu || String(idThuongHieu) === fIdThuongHieu) &&
      (!fIdXuatXu || String(idXuatXu) === fIdXuatXu) &&
      (!fIdCoGiay || String(idCoGiay) === fIdCoGiay) &&
      (!fIdChatLieu || String(idChatLieu) === fIdChatLieu) &&
      (!fIdViTriThiDau || String(idViTriThiDau) === fIdViTriThiDau) &&
      (!fIdPhongCachChoi || String(idPhongCachChoi) === fIdPhongCachChoi);

    const gia = Number(pickGia(d) || 0);
    const sl = Number(pickSoLuong(d) || 0);

    const matchGia = (giaMin == null || gia >= giaMin) && (giaMax == null || gia <= giaMax);
    const matchSl = (slMin == null || sl >= slMin) && (slMax == null || sl <= slMax);

    return matchKw && matchStatus && matchId && matchGia && matchSl;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDetails.value.length / pageSize.value)));

const pagedDetails = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredDetails.value.slice(start, start + pageSize.value);
});

watch(
  () => [keyword.value, statusFilter.value, pageSize.value, JSON.stringify(filters)],
  () => (page.value = 1)
);
watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

/** ========= actions ========= */
function resetFilter() {
  keyword.value = "";
  statusFilter.value = "all";

  filters.idSanPham = "";
  filters.idThuongHieu = "";
  filters.idXuatXu = "";
  filters.idMauSac = "";
  filters.idKichThuoc = "";
  filters.idLoaiSan = "";
  filters.idFormChan = "";
  filters.idCoGiay = "";
  filters.idChatLieu = "";
  filters.idViTriThiDau = "";
  filters.idPhongCachChoi = "";
  filters.giaMin = null;
  filters.giaMax = null;
  filters.slMin = null;
  filters.slMax = null;

  page.value = 1;
}
function viewDetail(d) {
  router.push(`/admin/chi-tiet-san-pham/${d.id}`);
}
function goAdd() {
  router.push(`/admin/chi-tiet-san-pham/new`);
}
function back() {
  router.push("/admin/san-pham");
}
async function reload() {
  await loadData();
}

/** ========= load ========= */
async function loadData() {
  loading.value = true;
  try {
    const [p, ctsp, allAnh, th, xx, ms, kt, ls, fc, cg, cl, vt, pc] = await Promise.all([
      productService.getAll(),
      productDetailService.getAll(),
      anhChiTietSanPhamService.getAll(),
      refDataService.getThuongHieu(),
      refDataService.getXuatXu(),
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
      refDataService.getLoaiSan(),
      refDataService.getFormChan(),
      refDataService.getCoGiay(),
      refDataService.getChatLieu(),
      refDataService.getViTriThiDau(),
      refDataService.getPhongCachChoi(),
    ]);

    productOptions.value = unwrapList(p);
    thuongHieuOptions.value = unwrapList(th);
    xuatXuOptions.value = unwrapList(xx);
    mauSacOptions.value = unwrapList(ms);
    kichThuocOptions.value = unwrapList(kt);
    loaiSanOptions.value = unwrapList(ls);
    formChanOptions.value = unwrapList(fc);
    coGiayOptions.value = unwrapList(cg);
    chatLieuOptions.value = unwrapList(cl);
    viTriThiDauOptions.value = unwrapList(vt);
    phongCachChoiOptions.value = unwrapList(pc);

    const ctspList = unwrapList(ctsp);

    // map ảnh theo idChiTietSanPham
    const anhList = unwrapList(allAnh);
    const mapAnh = new Map(); // ctspId -> { daiDien, first }

    for (const a of anhList) {
      if (!a) continue;

      const xoa = a?.xoaMem ?? a?.xoa_mem ?? false;
      if (xoa === true || xoa === 1) continue;

      const ctspId = a?.idChiTietSanPham ?? a?.id_chi_tiet_san_pham ?? null;
      if (!ctspId) continue;

      const raw = a?.duongDanAnh ?? a?.duong_dan_anh ?? a?.urlAnh ?? a?.imageUrl ?? "";
      const url = normalizeAnhPath(raw);
      if (!url) continue;

      const cur = mapAnh.get(ctspId) || { daiDien: "", first: "" };
      if (!cur.first) cur.first = url;

      const daiDien = a?.laAnhDaiDien ?? a?.la_anh_dai_dien ?? false;
      if (daiDien === true || daiDien === 1) cur.daiDien = url;

      mapAnh.set(ctspId, cur);
    }

    // enrich + gắn ảnh
    details.value = enrichCtspList(ctspList).map((x) => {
      const pick = mapAnh.get(x?.id);
      return { ...x, anhDaiDienUrl: pick?.daiDien || pick?.first || "" };
    });

    // ✅ bump để ảnh render mới (tránh cache)
    bumpImgVer();

    // query productId
    const pid = Number(route.query?.productId);
    if (Number.isFinite(pid) && pid > 0) filters.idSanPham = String(pid);
  } catch (e) {
    console.error(e);
    details.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
/* giữ nguyên style của bạn */
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
}

.ss-btn {
  border-radius: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(17, 24, 39, 0.16);
}

.ss-label-icon {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.65);
}

/* palette buttons */
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

/* search input */
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

.ss-select,
.ss-input {
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
}
.ss-select:focus,
.ss-input:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55);
}

/* radio */
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
}
.ss-radio-item input {
  transform: translateY(1px);
  accent-color: #ff4d4f;
}

/* thumb */
.ss-thumb {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.ss-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* name wrap */
.ss-name {
  white-space: normal;
}

/* icon view (đúng chuẩn “đen mềm”) */
.ss-icon-btn-view {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 10px;
  background: #fff;
  padding: 0;
}
.ss-icon-btn-view .material-icons-outlined {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-icon-btn-view:hover {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.22);
}

/* pagination */
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
  color: rgba(17, 24, 39, 0.88);
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
  width: 90px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
}
</style>
