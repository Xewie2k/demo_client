<!-- src/pages/product/ProductDetailFormPage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">
        {{ isEdit ? "SỬA CHI TIẾT SẢN PHẨM" : "THÊM CHI TIẾT SẢN PHẨM" }}
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-dark ss-btn" @click="back">Quay lại</button>
        <button class="btn btn-dark ss-btn" :disabled="loading" @click="submit">Lưu</button>
      </div>
    </div>

    <!-- 2 CARD TRÊN -->
    <div class="row g-3">
      <!-- (1) THÔNG TIN SẢN PHẨM -->
      <div class="col-lg-6">
        <div class="ss-card ss-border p-3 h-100">
          <div class="mb-2 ss-card-title">Thông tin sản phẩm</div>

          <div class="mb-3">
            <label class="form-label">Sản phẩm *</label>

            <v-select
              v-model="selectedProduct"
              :options="productOptions"
              label="tenSanPham"
              placeholder="Chọn hoặc nhập tên sản phẩm..."
              taggable
              :createOption="(label) => createTagOption(label, 'tenSanPham')"
              @option:created="onCreateProductTag"
            >
              <template #option="opt">
                <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                  <span class="fw-semibold">Thêm mới "{{ opt.tenSanPham }}"</span>
                  <small class="text-muted">Sản phẩm</small>
                </div>
                <div v-else class="d-flex justify-content-between">
                  <span>{{ opt.tenSanPham ?? opt.ten }}</span>
                  <small class="text-muted">{{ opt.maSanPham ?? opt.ma }}</small>
                </div>
              </template>

              <template #selected-option="opt">
                <span>
                  {{ opt.tenSanPham ?? opt.ten }}
                  <span v-if="!opt.__isNew" class="text-muted">({{ opt.maSanPham ?? opt.ma }})</span>
                </span>
              </template>
            </v-select>
          </div>

          <div class="row g-2">
            <div class="col-md-12">
              <label class="form-label">Mã</label>
              <input class="form-control" :value="form.maSanPham || '(tự tạo)'" disabled />
            </div>

            <div class="col-md-6">
              <label class="form-label">Thương hiệu *</label>
              <v-select
                v-model="selectedThuongHieu"
                :options="thuongHieuOptions"
                label="tenThuongHieu"
                placeholder="Chọn hoặc nhập thương hiệu..."
                taggable
                :createOption="(label) => createTagOption(label, 'tenThuongHieu')"
                @option:created="(opt) => onCreateRef('thuongHieu', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex justify-content-between">
                    <span class="fw-semibold">Thêm mới "{{ opt.tenThuongHieu }}"</span>
                    <small class="text-muted">Thương hiệu</small>
                  </div>
                  <div v-else class="d-flex justify-content-between">
                    <span>{{ opt.tenThuongHieu ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maThuongHieu ?? opt.ma }}</small>
                  </div>
                </template>
              </v-select>
            </div>

            <!-- Xuất xứ -->
            <div class="col-md-6">
              <label class="form-label">Xuất xứ</label>
              <v-select
                v-model="selectedXuatXu"
                :options="xuatXuOptions"
                label="tenXuatXu"
                placeholder="Chọn hoặc nhập xuất xứ..."
                taggable
                :createOption="(label) => createTagOption(label, 'tenXuatXu')"
                @option:created="(opt) => onCreateRef('xuatXu', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex justify-content-between">
                    <span class="fw-semibold">Thêm mới "{{ opt.tenXuatXu ?? opt.ten }}"</span>
                    <small class="text-muted">Xuất xứ</small>
                  </div>
                  <div v-else class="d-flex justify-content-between">
                    <span>{{ opt.tenXuatXu ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maXuatXu ?? opt.ma }}</small>
                  </div>
                </template>

                <template #selected-option="opt">
                  <span>
                    {{ opt.tenXuatXu ?? opt.ten }}
                    <span v-if="!opt.__isNew" class="text-muted">({{ opt.maXuatXu ?? opt.ma }})</span>
                  </span>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Cổ giày</label>
              <v-select
                v-model="selectedCoGiay"
                :options="coGiayOptions"
                label="tenCoGiay"
                placeholder="Chọn hoặc nhập cổ giày..."
                taggable
                :createOption="(label) => createTagOption(label, 'tenCoGiay')"
                @option:created="(opt) => onCreateRef('coGiay', opt)"
              />
            </div>

            <!-- Chất liệu -->
            <div class="col-md-6">
              <label class="form-label">Chất liệu</label>
              <v-select
                v-model="selectedChatLieu"
                :options="chatLieuOptions"
                label="tenChatLieu"
                placeholder="Chọn hoặc nhập chất liệu..."
                taggable
                :createOption="(label) => createTagOption(label, 'tenChatLieu')"
                @option:created="(opt) => onCreateRef('chatLieu', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex justify-content-between">
                    <span class="fw-semibold">Thêm mới "{{ opt.tenChatLieu ?? opt.ten }}"</span>
                    <small class="text-muted">Chất liệu</small>
                  </div>
                  <div v-else class="d-flex justify-content-between">
                    <span>{{ opt.tenChatLieu ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maChatLieu ?? opt.ma }}</small>
                  </div>
                </template>

                <template #selected-option="opt">
                  <span>
                    {{ opt.tenChatLieu ?? opt.ten }}
                    <span v-if="!opt.__isNew" class="text-muted">({{ opt.maChatLieu ?? opt.ma }})</span>
                  </span>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Vị trí thi đấu</label>
              <v-select
                v-model="selectedViTriThiDau"
                :options="viTriThiDauOptions"
                :getOptionLabel="(o) => pickLabel(o, ['tenViTriThiDau','ten_vi_tri_thi_dau','tenViTri','ten','name'])"
                placeholder="Chọn hoặc nhập vị trí..."
                taggable
                :createOption="(label) => createTagOption(label, 'tenViTriThiDau')"
                @option:created="(opt) => onCreateRef('viTriThiDau', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex justify-content-between">
                    <span class="fw-semibold">
                      Thêm mới "{{ pickLabel(opt, ['tenViTriThiDau','ten','name']) }}"
                    </span>
                    <small class="text-muted">Vị trí</small>
                  </div>

                  <div v-else class="d-flex justify-content-between">
                    <span>{{ pickLabel(opt, ['tenViTriThiDau','ten_vi_tri_thi_dau','tenViTri','ten','name']) }}</span>
                    <small class="text-muted">{{ opt.maViTriThiDau ?? opt.ma_vi_tri_thi_dau ?? opt.ma ?? "" }}</small>
                  </div>
                </template>

                <template #selected-option="opt">
                  <span>{{ pickLabel(opt, ['tenViTriThiDau','ten_vi_tri_thi_dau','tenViTri','ten','name']) }}</span>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Phong cách chơi</label>
              <v-select
                v-model="selectedPhongCachChoi"
                :options="phongCachChoiOptions"
                :getOptionLabel="(o) => pickLabel(o, ['tenPhongCachChoi','ten_phong_cach_choi','tenPhongCach','ten','name'])"
                placeholder="Chọn hoặc nhập phong cách..."
                taggable
                :createOption="(label) => createTagOption(label, 'tenPhongCachChoi')"
                @option:created="(opt) => onCreateRef('phongCachChoi', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex justify-content-between">
                    <span class="fw-semibold">
                      Thêm mới "{{ pickLabel(opt, ['tenPhongCachChoi','ten','name']) }}"
                    </span>
                    <small class="text-muted">Phong cách</small>
                  </div>

                  <div v-else class="d-flex justify-content-between">
                    <span>{{ pickLabel(opt, ['tenPhongCachChoi','ten_phong_cach_choi','tenPhongCach','ten','name']) }}</span>
                    <small class="text-muted">{{ opt.maPhongCachChoi ?? opt.ma_phong_cach_choi ?? opt.ma ?? "" }}</small>
                  </div>
                </template>

                <template #selected-option="opt">
                  <span>{{ pickLabel(opt, ['tenPhongCachChoi','ten_phong_cach_choi','tenPhongCach','ten','name']) }}</span>
                </template>
              </v-select>
            </div>

            <div class="col-12">
              <label class="form-label">Mô tả ngắn</label>
              <textarea class="form-control" rows="3" v-model="form.moTaNgan" />
            </div>
          </div>
        </div>
      </div>

      <!-- (2) BIẾN THỂ -->
      <div class="col-lg-6">
        <div class="ss-card ss-border p-3 h-100">
          <div class="mb-2 ss-card-title">Biến thể</div>

          <!-- Màu sắc -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">Màu sắc *</label>
              <router-link class="small text-decoration-none" to="/admin/mau-sac">Thêm màu sắc</router-link>
            </div>

            <v-select
              v-model="selectedMauSac"
              :options="mauSacOptions"
              label="tenMauSac"
              placeholder="Chọn hoặc nhập màu..."
              multiple
              taggable
              :createOption="(label) => createTagOption(label, 'tenMauSac')"
              @option:created="(opt) => onCreateRef('mauSac', opt, { multiple: true })"
            >
              <template #option="opt">
                <div v-if="opt.__isNew" class="d-flex justify-content-between">
                  <span class="fw-semibold">Thêm mới "{{ opt.tenMauSac }}"</span>
                  <small class="text-muted">Màu</small>
                </div>

                <div v-else class="d-flex align-items-center justify-content-between" style="gap: 10px">
                  <div class="d-flex align-items-center" style="gap: 10px; min-width: 0">
                    <span
                      class="ss-color-dot"
                      :style="{
                        background: pickColorHex(opt),
                        borderColor: isLight(pickColorHex(opt)) ? '#d1d5db' : 'transparent',
                      }"
                    />
                    <span class="text-truncate">{{ opt.tenMauSac ?? opt.ten }}</span>
                  </div>
                  <small class="text-muted">{{ opt.maMauSac ?? opt.ma }}</small>
                </div>
              </template>
            </v-select>
          </div>

          <!-- Kích cỡ -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">Kích cỡ *</label>
              <router-link class="small text-decoration-none" to="/admin/kich-thuoc">Thêm kích cỡ</router-link>
            </div>

            <v-select
              v-model="selectedKichThuoc"
              :options="kichThuocOptions"
              label="tenKichThuoc"
              placeholder="Chọn hoặc nhập kích cỡ..."
              multiple
              taggable
              :createOption="(label) => createTagOption(label, 'tenKichThuoc')"
              @option:created="(opt) => onCreateRef('kichThuoc', opt, { multiple: true })"
            />
          </div>

          <!-- Loại sân -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">Loại sân *</label>
              <router-link class="small text-decoration-none" to="/admin/loai-san">Thêm loại sân</router-link>
            </div>

            <v-select
              v-model="selectedLoaiSan"
              :options="loaiSanOptions"
              label="tenLoaiSan"
              placeholder="Chọn hoặc nhập loại sân..."
              multiple
              taggable
              :createOption="(label) => createTagOption(label, 'tenLoaiSan')"
              @option:created="(opt) => onCreateRef('loaiSan', opt, { multiple: true })"
            />
          </div>

          <!-- Form chân -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">Form chân *</label>
              <router-link class="small text-decoration-none" to="/admin/form-chan">Thêm form chân</router-link>
            </div>

            <v-select
              v-model="selectedFormChan"
              :options="formChanOptions"
              label="tenFormChan"
              placeholder="Chọn hoặc nhập form chân..."
              multiple
              taggable
              :createOption="(label) => createTagOption(label, 'tenFormChan')"
              @option:created="(opt) => onCreateRef('formChan', opt, { multiple: true })"
            />
          </div>

          <div class="text-muted small">Chọn nhiều thuộc tính để tự sinh danh sách bên dưới.</div>
        </div>
      </div>
    </div>

    <!-- (3) PHẦN DƯỚI -->
    <div class="ss-card ss-border p-3 mt-3">
      <div v-if="!hasVariantsSelected" class="ss-empty">Chưa có biến thể nào</div>

      <template v-else>
        <div class="d-flex align-items-start justify-content-between gap-3">
          <div class="d-flex gap-3 ss-common">
            <div class="ss-common-item">
              <label class="form-label">Số lượng chung</label>
              <input v-model="common.soLuongChung" type="number" min="0" class="form-control" />
            </div>
            <div class="ss-common-item">
              <label class="form-label">Giá chung</label>
              <input v-model="common.giaChung" type="number" min="0" class="form-control" />
            </div>
          </div>

          <button class="btn btn-success ss-btn ss-add-btn" :disabled="loading" @click="submit">
            {{ isEdit ? "Lưu chi tiết sản phẩm" : "Thêm chi tiết sản phẩm" }}
          </button>
        </div>

        <div class="table-responsive mt-2">
          <table class="table align-middle mb-0 ss-table-grid">
            <colgroup>
              <col style="width: 44px" />
              <col style="width: 70px" />
              <col />
              <col style="width: 140px" />
              <col style="width: 140px" />
              <col style="width: 110px" />
              <col style="width: 280px" />
            </colgroup>

            <thead>
              <tr>
                <th><input type="checkbox" v-model="selectAll" /></th>
                <th>STT</th>
                <th>Tên Sản Phẩm</th>
                <th>Số Lượng</th>
                <th>Giá</th>
                <th>Hành Động</th>
                <th>Ảnh (theo MÀU)</th>
              </tr>
            </thead>

            <tbody v-if="!rows.length">
              <tr>
                <td colspan="7" class="text-center text-muted py-4">Chưa có biến thể nào</td>
              </tr>
            </tbody>

            <tbody v-else>
              <template v-for="(g) in groupedRows" :key="g.groupKey">
                <tr v-for="(r, ri) in g.items" :key="r.key">
                  <td><input type="checkbox" v-model="r.checked" /></td>
                  <td>{{ g.startIndex + ri + 1 }}</td>
                  <td class="ss-name">{{ r.ten }}</td>

                  <td>
                    <input v-model="r.soLuong" type="number" min="0" class="form-control form-control-sm" />
                  </td>

                  <td>
                    <input v-model="r.gia" type="number" min="0" class="form-control form-control-sm" />
                  </td>

                  <td class="text-center">
                    <button class="btn ss-icon-btn" type="button" title="Xóa dòng" @click="removeRow(r)">
                      <span class="material-icons-outlined">delete_outline</span>
                    </button>
                  </td>

                  <td v-if="ri === 0" :rowspan="g.items.length">
                    <input
                      class="d-none"
                      type="file"
                      :id="`file-ms-${g.groupKey}`"
                      @change="(e) => onColorFileChange(e, g)"
                    />
                    <div class="ss-file">
                      <button
                        class="btn btn-outline-secondary ss-file-btn"
                        type="button"
                        @click="triggerColorFile(g.groupKey)"
                        :disabled="loading"
                      >
                        Chọn tệp
                      </button>
                      <div class="ss-file-name">
                        {{
                          colorFiles[g.groupKey]?.fileName
                            ? colorFiles[g.groupKey].fileName
                            : "Không có tệp nào được chọn"
                        }}
                      </div>
                    </div>

                    <div class="small text-muted mt-1">
                      * Ảnh áp dụng cho tất cả size thuộc màu: <b>{{ g.colorName }}</b>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="small text-muted mt-2">
          * Khi nhấn “Thêm chi tiết sản phẩm” sẽ hỏi xác nhận trước khi thêm.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import anhChiTietSanPhamService from "@/services/anhChiTietSanPhamService"; // ✅ THÊM
import { refDataService } from "@/services/refDataService";

const primeToast = useToast();

function toastSuccess(detail) {
  primeToast.add({ severity: "success", summary: "Thành công", detail, life: 3000 });
}
function toastError(detail) {
  primeToast.add({ severity: "error", summary: "Thất bại", detail, life: 3500 });
}
function stopWithError(msg) {
  toastError(msg);
  return false;
}

// ✅ chặn gọi tạo mới trùng (do vừa option:created vừa watch)
const _creatingRefKey = new Set();
function _lockCreate(key, name) {
  const token = `${key}:${lc(name)}`;
  if (_creatingRefKey.has(token)) return false;
  _creatingRefKey.add(token);
  return token;
}
function _unlockCreate(token) {
  if (token) _creatingRefKey.delete(token);
}

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params?.id);
const isEdit = computed(() => !!id.value && String(id.value).toLowerCase() !== "new");

const productIdQuery = computed(() => {
  const v = route.query?.productId;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
});

// ====== OPTIONS ======
const loading = ref(false);

const productOptions = ref([]);

const thuongHieuOptions = ref([]);
const xuatXuOptions = ref([]);
const coGiayOptions = ref([]);
const chatLieuOptions = ref([]);
const viTriThiDauOptions = ref([]);
const phongCachChoiOptions = ref([]);

const mauSacOptions = ref([]);
const kichThuocOptions = ref([]);
const loaiSanOptions = ref([]);
const formChanOptions = ref([]);

// ====== FORM ======
const form = reactive({
  idSanPham: null,
  maSanPham: "",
  tenSanPham: "",
  moTaNgan: "",
});

// ===== chọn thuộc tính sản phẩm =====
const selectedThuongHieu = ref(null);
const selectedXuatXu = ref(null);
const selectedCoGiay = ref(null);
const selectedChatLieu = ref(null);
const selectedViTriThiDau = ref(null);
const selectedPhongCachChoi = ref(null);

// ===== biến thể =====
const selectedMauSac = ref([]);
const selectedKichThuoc = ref([]);
const selectedLoaiSan = ref([]);
const selectedFormChan = ref([]);

// ===== common =====
const common = reactive({
  soLuongChung: "",
  giaChung: "",
});

const rows = ref([]);
const removedKeys = ref(new Set());

// file theo MÀU
const colorFiles = reactive({}); // { [idMauSac]: { file, fileName } }

const hasVariantsSelected = computed(() => {
  return (
    (selectedMauSac.value?.length || 0) > 0 &&
    (selectedKichThuoc.value?.length || 0) > 0 &&
    (selectedLoaiSan.value?.length || 0) > 0 &&
    (selectedFormChan.value?.length || 0) > 0
  );
});

const selectAll = computed({
  get() {
    if (!rows.value.length) return false;
    return rows.value.every((r) => r.checked);
  },
  set(v) {
    rows.value = rows.value.map((r) => ({ ...r, checked: !!v }));
  },
});

function normalizeArr(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  return [];
}

function createTagOption(label, field) {
  const name = String(label ?? "").trim();
  return { __isNew: true, [field]: name, ten: name };
}

function lc(s) {
  return String(s ?? "").trim().toLowerCase();
}

function pickTen(obj, tenField, maField) {
  return obj?.[tenField] ?? obj?.ten ?? obj?.[maField] ?? obj?.ma ?? obj?.id;
}

function pickLabel(opt, keys = []) {
  if (!opt) return "";
  for (const k of keys) {
    const v = opt?.[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}

// ===== COLOR helpers =====
function pickColorHex(m) {
  const raw = m?.maMau || m?.maHex || m?.hex || m?.giaTri || m?.color || m?.maMauSac || "";
  if (typeof raw === "string" && raw.trim().startsWith("#")) return raw.trim();

  const name = (m?.tenMauSac || m?.ten || "").toLowerCase().trim();
  if (name.includes("đỏ") || name.includes("do")) return "#ff4d4f";
  if (name.includes("trắng") || name.includes("trang") || name.includes("white")) return "#ffffff";
  if (name.includes("đen") || name.includes("den") || name.includes("black")) return "#111827";
  if (name.includes("xanh") || name.includes("blue")) return "#2563eb";
  if (name.includes("vàng") || name.includes("vang") || name.includes("yellow")) return "#f59e0b";
  if (name.includes("hồng") || name.includes("hong") || name.includes("pink")) return "#ec4899";
  if (name.includes("xám") || name.includes("xam") || name.includes("gray") || name.includes("grey")) return "#9ca3af";
  return "#e5e7eb";
}

function isLight(hex) {
  try {
    const h = String(hex || "").replace("#", "");
    if (h.length < 6) return false;
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 200;
  } catch {
    return false;
  }
}

// ===== mapping helpers (để chọn đúng option theo id) =====
function pickIdFrom(obj, keys = []) {
  for (const k of keys) {
    const v = obj?.[k];
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function setSelectedById(optionsRef, selectedRef, idValue) {
  const idNum = Number(idValue);
  if (!Number.isFinite(idNum) || idNum <= 0) return;
  const found = (optionsRef.value || []).find((x) => Number(x?.id) === idNum) || null;
  if (found) selectedRef.value = found;
}

function syncAttributesFromProduct(p) {
  if (!p) return;

  const idThuongHieu = pickIdFrom(p, ["idThuongHieu", "thuongHieuId", "id_thuong_hieu"]);
  const idXuatXu = pickIdFrom(p, ["idXuatXu", "xuatXuId", "id_xuat_xu"]);
  const idCoGiay = pickIdFrom(p, ["idCoGiay", "coGiayId", "id_co_giay"]);
  const idChatLieu = pickIdFrom(p, ["idChatLieu", "chatLieuId", "id_chat_lieu"]);
  const idViTriThiDau = pickIdFrom(p, ["idViTriThiDau", "viTriThiDauId", "id_vi_tri_thi_dau"]);
  const idPhongCachChoi = pickIdFrom(p, ["idPhongCachChoi", "phongCachChoiId", "id_phong_cach_choi"]);

  setSelectedById(thuongHieuOptions, selectedThuongHieu, idThuongHieu);
  setSelectedById(xuatXuOptions, selectedXuatXu, idXuatXu);
  setSelectedById(coGiayOptions, selectedCoGiay, idCoGiay);
  setSelectedById(chatLieuOptions, selectedChatLieu, idChatLieu);
  setSelectedById(viTriThiDauOptions, selectedViTriThiDau, idViTriThiDau);
  setSelectedById(phongCachChoiOptions, selectedPhongCachChoi, idPhongCachChoi);
}

// ===== PRODUCT SELECT =====
const selectedProduct = computed({
  get() {
    if (!form.idSanPham && String(form.tenSanPham || "").trim()) {
      return { __isNew: true, tenSanPham: form.tenSanPham };
    }
    return productOptions.value.find((x) => x.id === form.idSanPham) || null;
  },
  set(val) {
    if (!val) return;

    if (!val.__isNew) {
      form.idSanPham = val.id ?? null;
      form.maSanPham = val.maSanPham ?? val.ma ?? "";
      form.tenSanPham = val.tenSanPham ?? val.ten ?? "";
      form.moTaNgan = val.moTaNgan ?? val.moTa ?? "";
      syncAttributesFromProduct(val);

      resetVariantsAndRows();
      return;
    }

    form.idSanPham = null;
    form.maSanPham = "";
    form.tenSanPham = val.tenSanPham ?? val.ten ?? "";
    applyDefaultProductAttributes();
    resetVariantsAndRows();
  },
});

function onCreateProductTag() {}

// default selects
function applyDefaultProductAttributes() {
  if (!selectedThuongHieu.value && thuongHieuOptions.value.length) selectedThuongHieu.value = thuongHieuOptions.value[0];
  if (!selectedXuatXu.value && xuatXuOptions.value.length) selectedXuatXu.value = xuatXuOptions.value[0];
  if (!selectedCoGiay.value && coGiayOptions.value.length) selectedCoGiay.value = coGiayOptions.value[0];
  if (!selectedChatLieu.value && chatLieuOptions.value.length) selectedChatLieu.value = chatLieuOptions.value[0];
  if (!selectedViTriThiDau.value && viTriThiDauOptions.value.length) selectedViTriThiDau.value = viTriThiDauOptions.value[0];
  if (!selectedPhongCachChoi.value && phongCachChoiOptions.value.length) selectedPhongCachChoi.value = phongCachChoiOptions.value[0];
}

function resetVariantsAndRows() {
  selectedMauSac.value = [];
  selectedKichThuoc.value = [];
  selectedLoaiSan.value = [];
  selectedFormChan.value = [];
  rows.value = [];
  removedKeys.value = new Set();
  common.soLuongChung = "";
  common.giaChung = "";
  Object.keys(colorFiles).forEach((k) => delete colorFiles[k]);
}

// ======= CREATE REF (giữ nguyên của bạn) =======
const refConfig = {
  thuongHieu: {
    label: "Thương hiệu",
    listRef: thuongHieuOptions,
    selectedRef: selectedThuongHieu,
    getter: () => refDataService.getThuongHieu(),
    creator: (name) => refDataService.createThuongHieu({ tenThuongHieu: name, xoaMem: false }),
    nameField: "tenThuongHieu",
  },
  xuatXu: {
    label: "Xuất xứ",
    listRef: xuatXuOptions,
    selectedRef: selectedXuatXu,
    getter: () => refDataService.getXuatXu(),
    creator: (name) => refDataService.createXuatXu({ tenXuatXu: name, xoaMem: false }),
    nameField: "tenXuatXu",
  },
  coGiay: {
    label: "Cổ giày",
    listRef: coGiayOptions,
    selectedRef: selectedCoGiay,
    getter: () => refDataService.getCoGiay(),
    creator: (name) => refDataService.createCoGiay({ tenCoGiay: name, xoaMem: false }),
    nameField: "tenCoGiay",
  },
  chatLieu: {
    label: "Chất liệu",
    listRef: chatLieuOptions,
    selectedRef: selectedChatLieu,
    getter: () => refDataService.getChatLieu(),
    creator: (name) => refDataService.createChatLieu({ tenChatLieu: name, xoaMem: false }),
    nameField: "tenChatLieu",
  },
  viTriThiDau: {
    label: "Vị trí thi đấu",
    listRef: viTriThiDauOptions,
    selectedRef: selectedViTriThiDau,
    getter: () => refDataService.getViTriThiDau(),
    creator: (name) => refDataService.createViTriThiDau({ tenViTriThiDau: name, xoaMem: false }),
    nameField: "tenViTriThiDau",
  },
  phongCachChoi: {
    label: "Phong cách chơi",
    listRef: phongCachChoiOptions,
    selectedRef: selectedPhongCachChoi,
    getter: () => refDataService.getPhongCachChoi(),
    creator: (name) => refDataService.createPhongCachChoi({ tenPhongCachChoi: name, xoaMem: false }),
    nameField: "tenPhongCachChoi",
  },

  mauSac: {
    label: "Màu sắc",
    listRef: mauSacOptions,
    selectedRef: selectedMauSac,
    getter: () => refDataService.getMauSac(),
    creator: (name) => refDataService.createMauSac({ tenMauSac: name, xoaMem: false }),
    nameField: "tenMauSac",
  },
  kichThuoc: {
    label: "Kích cỡ",
    listRef: kichThuocOptions,
    selectedRef: selectedKichThuoc,
    getter: () => refDataService.getKichThuoc(),
    creator: (name) => refDataService.createKichThuoc({ tenKichThuoc: name, xoaMem: false }),
    nameField: "tenKichThuoc",
  },
  loaiSan: {
    label: "Loại sân",
    listRef: loaiSanOptions,
    selectedRef: selectedLoaiSan,
    getter: () => refDataService.getLoaiSan(),
    creator: (name) => refDataService.createLoaiSan({ tenLoaiSan: name, xoaMem: false }),
    nameField: "tenLoaiSan",
  },
  formChan: {
    label: "Form chân",
    listRef: formChanOptions,
    selectedRef: selectedFormChan,
    getter: () => refDataService.getFormChan(),
    creator: (name) => refDataService.createFormChan({ tenFormChan: name, xoaMem: false }),
    nameField: "tenFormChan",
  },
};

async function onCreateRef(key, opt, { multiple = false } = {}) {
  const cfg = refConfig[key];
  if (!cfg) return;

  const name = String(opt?.[cfg.nameField] ?? opt?.ten ?? "").trim();
  if (!name) return;

  const token = _lockCreate(key, name);
  if (!token) return;

  try {
    const existed = cfg.listRef.value.find((x) => lc(x?.[cfg.nameField] ?? x?.ten) === lc(name));
    if (existed) {
      if (multiple) {
        const arr = Array.isArray(cfg.selectedRef.value) ? cfg.selectedRef.value : [];
        cfg.selectedRef.value = arr.map((x) =>
          x?.__isNew && lc(x?.[cfg.nameField] ?? x?.ten) === lc(name) ? existed : x
        );
      } else {
        cfg.selectedRef.value = existed;
      }
      toastSuccess(`"${name}" đã tồn tại trong ${cfg.label}.`);
      return;
    }

    loading.value = true;

    const res = await cfg.creator(name);
    const created = res?.data ?? res;

    const fresh = await cfg.getter();
    cfg.listRef.value = normalizeArr(fresh);

    let found = null;
    if (created?.id) found = cfg.listRef.value.find((x) => x.id === created.id) || null;
    if (!found) found = cfg.listRef.value.find((x) => lc(x?.[cfg.nameField] ?? x?.ten) === lc(name)) || created;

    if (multiple) {
      const arr = Array.isArray(cfg.selectedRef.value) ? cfg.selectedRef.value : [];
      cfg.selectedRef.value = arr.map((x) =>
        x?.__isNew && lc(x?.[cfg.nameField] ?? x?.ten) === lc(name) ? found : x
      );
    } else {
      cfg.selectedRef.value = found;
    }

    toastSuccess(`Thêm mới ${cfg.label}: "${name}" thành công`);
  } catch (e) {
    console.error(e);
    toastError(`Không tạo được "${name}". Kiểm tra BE endpoint/Request.`);
  } finally {
    loading.value = false;
    _unlockCreate(token);
  }
}

// watch cho tag mới
watch(selectedThuongHieu, (v) => { if (v?.__isNew) onCreateRef("thuongHieu", v); });
watch(selectedXuatXu, (v) => { if (v?.__isNew) onCreateRef("xuatXu", v); });
watch(selectedCoGiay, (v) => { if (v?.__isNew) onCreateRef("coGiay", v); });
watch(selectedChatLieu, (v) => { if (v?.__isNew) onCreateRef("chatLieu", v); });
watch(selectedViTriThiDau, (v) => { if (v?.__isNew) onCreateRef("viTriThiDau", v); });
watch(selectedPhongCachChoi, (v) => { if (v?.__isNew) onCreateRef("phongCachChoi", v); });

// ====== Build rows ======
function buildKey(ms, kt, ls, fc) {
  return `${ms}-${kt}-${ls}-${fc}`;
}

function buildRowName(c, s, ls, fc) {
  const tenSP = form.tenSanPham || "Sản phẩm";
  const tenMau = pickTen(c, "tenMauSac", "maMauSac");
  const tenKT = pickTen(s, "tenKichThuoc", "maKichThuoc");
  const tenLS = pickTen(ls, "tenLoaiSan", "maLoaiSan");
  const tenFC = pickTen(fc, "tenFormChan", "maFormChan");
  return `${tenSP} [${tenMau} - ${tenKT} - ${tenLS} - ${tenFC}]`;
}

function sortByName(a, b, field) {
  return String(a?.[field] ?? a?.ten ?? "").localeCompare(String(b?.[field] ?? b?.ten ?? ""), "vi");
}

function rebuildRows() {
  const idSanPham = form.idSanPham || null;

  const colors = (selectedMauSac.value || []).slice().sort((a, b) => sortByName(a, b, "tenMauSac"));
  const sizes = (selectedKichThuoc.value || []).slice().sort((a, b) => sortByName(a, b, "tenKichThuoc"));
  const loais = (selectedLoaiSan.value || []).slice().sort((a, b) => sortByName(a, b, "tenLoaiSan"));
  const forms = (selectedFormChan.value || []).slice().sort((a, b) => sortByName(a, b, "tenFormChan"));

  if (!colors.length || !sizes.length || !loais.length || !forms.length) {
    rows.value = [];
    return;
  }

  const oldMap = new Map(rows.value.map((r) => [r.key, r]));
  const removed = removedKeys.value;

  const next = [];
  for (const c of colors) {
    for (const s of sizes) {
      for (const ls of loais) {
        for (const fc of forms) {
          const key = buildKey(c.id, s.id, ls.id, fc.id);
          if (removed.has(key)) continue;

          const old = oldMap.get(key);

          next.push({
            key,
            checked: old?.checked ?? true,
            idSanPham,
            idMauSac: c.id,
            idKichThuoc: s.id,
            idLoaiSan: ls.id,
            idFormChan: fc.id,
            ten: buildRowName(c, s, ls, fc),
            soLuong: old?.soLuong ?? (common.soLuongChung !== "" ? common.soLuongChung : ""),
            gia: old?.gia ?? (common.giaChung !== "" ? common.giaChung : ""),
          });

          if (colorFiles[String(c.id)] == null) colorFiles[String(c.id)] = { file: null, fileName: "" };
        }
      }
    }
  }

  rows.value = next;
}

watch([selectedMauSac, selectedKichThuoc, selectedLoaiSan, selectedFormChan], rebuildRows);

watch(() => common.soLuongChung, (v) => {
  if (!hasVariantsSelected.value) return;
  rows.value = rows.value.map((r) => (r.checked ? { ...r, soLuong: v } : r));
});

watch(() => common.giaChung, (v) => {
  if (!hasVariantsSelected.value) return;
  rows.value = rows.value.map((r) => (r.checked ? { ...r, gia: v } : r));
});

function removeRow(row) {
  removedKeys.value.add(row.key);
  rows.value = rows.value.filter((r) => r.key !== row.key);
}

// group rows by MÀU
const groupedRows = computed(() => {
  const list = rows.value || [];
  const groups = new Map();

  for (const r of list) {
    const k = String(r.idMauSac);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  const order = (selectedMauSac.value || []).map((x) => String(x.id));
  const result = [];
  let stt = 0;

  for (const colorId of order) {
    const items = groups.get(colorId);
    if (!items?.length) continue;

    const colorObj = (selectedMauSac.value || []).find((x) => String(x.id) === String(colorId));
    const colorName = pickTen(colorObj, "tenMauSac", "maMauSac");

    result.push({ groupKey: String(colorId), colorName, items, startIndex: stt });
    stt += items.length;
  }

  return result;
});

// FILE per color
function triggerColorFile(colorId) {
  const el = document.getElementById(`file-ms-${colorId}`);
  el?.click();
}
function onColorFileChange(e, group) {
  const f = e.target.files?.[0];
  const key = String(group.groupKey);
  if (!colorFiles[key]) colorFiles[key] = { file: null, fileName: "" };
  colorFiles[key].file = f || null;
  colorFiles[key].fileName = f?.name || "";
}

// ✅ ===== UPLOAD ẢNH THEO MÀU (THÊM MỚI) =====
function pickAnhPathFromRes(obj) {
  return obj?.duongDanAnh ?? obj?.duong_dan_anh ?? obj?.urlAnh ?? obj?.imageUrl ?? obj?.image ?? "";
}

/**
 * Create: createdCtspList = [{id, idMauSac, ...}]
 * - nếu colorFiles[mau].file có => upload 1 lần để lấy duongDanAnh,
 *   rồi create record ảnh cho các ctsp còn lại cùng màu (không upload lại file)
 */
async function uploadImagesAfterCreate(createdCtspList) {
  const list = createdCtspList || [];
  if (!list.length) return;

  const byColor = new Map(); // colorId -> [ctspId...]
  for (const it of list) {
    const ctspId = Number(it?.id);
    const colorId = String(it?.idMauSac ?? it?.id_mau_sac ?? "");
    if (!ctspId || !colorId) continue;

    if (!byColor.has(colorId)) byColor.set(colorId, []);
    byColor.get(colorId).push(ctspId);
  }

  for (const [colorId, ctspIds] of byColor.entries()) {
    const f = colorFiles[colorId]?.file || null;
    if (!f) continue; // màu này không chọn ảnh => skip

    if (!ctspIds.length) continue;

    // upload 1 lần cho ctsp đầu tiên
    const firstCtspId = ctspIds[0];

    const upRes = await anhChiTietSanPhamService.uploadNew({
      idChiTietSanPham: firstCtspId,
      file: f,
      laAnhDaiDien: true,
      moTa: "",
    });

    const uploaded = upRes?.data ?? upRes;
    const duongDanAnh = pickAnhPathFromRes(uploaded);

    // nếu không lấy được path thì thôi, khỏi nhân bản
    if (!duongDanAnh) continue;

    // nhân bản record ảnh cho các ctsp còn lại cùng màu
    const tasks = [];
    for (let i = 1; i < ctspIds.length; i++) {
      tasks.push(
        anhChiTietSanPhamService.create({
          idChiTietSanPham: ctspIds[i],
          duongDanAnh,
          laAnhDaiDien: true,
          moTa: "",
          xoaMem: false,
        })
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }
}

/**
 * Edit: ctspId = id.value
 * - nếu có file của màu đang sửa => ưu tiên updateUpload nếu có ảnh cũ,
 *   fail thì fallback uploadNew (vẫn set đại diện chuẩn).
 */
async function uploadImageAfterEdit(ctspId) {
  const colorId = String(selectedMauSac.value?.[0]?.id ?? "");
  const f = colorId ? (colorFiles[colorId]?.file || null) : null;
  if (!ctspId || !f) return;

  try {
    const res = await anhChiTietSanPhamService.byChiTietSanPham(ctspId);
    const imgs = normalizeArr(res);
    const daiDien = imgs.find((x) => (x?.laAnhDaiDien ?? x?.la_anh_dai_dien) === true) || imgs[0] || null;
    const imgId = daiDien?.id ? Number(daiDien.id) : null;

    if (imgId) {
      try {
        // nếu BE có PUT /{id}/upload
        await anhChiTietSanPhamService.updateUpload({
          id: imgId,
          file: f,
          laAnhDaiDien: true,
          moTa: daiDien?.moTa ?? "",
        });
        return;
      } catch (e) {
        // fallback
        await anhChiTietSanPhamService.uploadNew({
          idChiTietSanPham: ctspId,
          file: f,
          laAnhDaiDien: true,
          moTa: "",
        });
        return;
      }
    }

    // chưa có ảnh nào => upload mới
    await anhChiTietSanPhamService.uploadNew({
      idChiTietSanPham: ctspId,
      file: f,
      laAnhDaiDien: true,
      moTa: "",
    });
  } catch (e) {
    // fallback cuối
    await anhChiTietSanPhamService.uploadNew({
      idChiTietSanPham: ctspId,
      file: f,
      laAnhDaiDien: true,
      moTa: "",
    });
  }
}

function back() {
  const pid = productIdQuery.value || form.idSanPham;
  if (pid) return router.push(`/admin/chi-tiet-san-pham?productId=${pid}`);
  return router.push("/admin/chi-tiet-san-pham");
}

// LOAD edit
async function loadEditIfNeeded() {
  if (!isEdit.value) return;

  const res = await productDetailService.getOne(id.value);
  const row = res?.data ?? res;

  const idSanPham = row.idSanPham ?? row.sanPhamId ?? row.id_san_pham;
  const idMauSac = row.idMauSac ?? row.mauSacId ?? row.id_mau_sac;
  const idKichThuoc = row.idKichThuoc ?? row.kichThuocId ?? row.id_kich_thuoc;
  const idLoaiSan = row.idLoaiSan ?? row.loaiSanId ?? row.id_loai_san;
  const idFormChan = row.idFormChan ?? row.formChanId ?? row.id_form_chan;

  form.idSanPham = Number(idSanPham) || null;

  const p = productOptions.value.find((x) => Number(x.id) === Number(form.idSanPham));
  if (p) {
    form.maSanPham = p.maSanPham ?? p.ma ?? "";
    form.tenSanPham = p.tenSanPham ?? p.ten ?? "";
    form.moTaNgan = p.moTaNgan ?? p.moTa ?? "";
    syncAttributesFromProduct(p);
  }

  const ms = mauSacOptions.value.find((x) => Number(x.id) === Number(idMauSac));
  const kt = kichThuocOptions.value.find((x) => Number(x.id) === Number(idKichThuoc));
  const ls = loaiSanOptions.value.find((x) => Number(x.id) === Number(idLoaiSan));
  const fc = formChanOptions.value.find((x) => Number(x.id) === Number(idFormChan));

  selectedMauSac.value = ms ? [ms] : [];
  selectedKichThuoc.value = kt ? [kt] : [];
  selectedLoaiSan.value = ls ? [ls] : [];
  selectedFormChan.value = fc ? [fc] : [];

  common.soLuongChung = String(row.soLuong ?? "");
  common.giaChung = String(row.giaBan ?? row.giaNiemYet ?? row.gia ?? "");

  rebuildRows();
}

onMounted(async () => {
  loading.value = true;
  try {
    const [p, th, xx, cg, cl, vt, pc, ms, kt, ls, fc] = await Promise.all([
      productService.getAll(),
      refDataService.getThuongHieu(),
      refDataService.getXuatXu(),
      refDataService.getCoGiay(),
      refDataService.getChatLieu(),
      refDataService.getViTriThiDau(),
      refDataService.getPhongCachChoi(),
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
      refDataService.getLoaiSan(),
      refDataService.getFormChan(),
    ]);

    productOptions.value = normalizeArr(p);

    thuongHieuOptions.value = normalizeArr(th);
    xuatXuOptions.value = normalizeArr(xx);
    coGiayOptions.value = normalizeArr(cg);
    chatLieuOptions.value = normalizeArr(cl);
    viTriThiDauOptions.value = normalizeArr(vt);
    phongCachChoiOptions.value = normalizeArr(pc);

    mauSacOptions.value = normalizeArr(ms);
    kichThuocOptions.value = normalizeArr(kt);
    loaiSanOptions.value = normalizeArr(ls);
    formChanOptions.value = normalizeArr(fc);

    if (!isEdit.value && productIdQuery.value) {
      const found = productOptions.value.find((x) => Number(x.id) === Number(productIdQuery.value));
      if (found) selectedProduct.value = found;
      else form.idSanPham = productIdQuery.value;
    }

    applyDefaultProductAttributes();
    await loadEditIfNeeded();

    if (form.idSanPham) {
      const p2 = productOptions.value.find((x) => Number(x.id) === Number(form.idSanPham));
      if (p2) syncAttributesFromProduct(p2);
    }
  } catch (e) {
    console.error(e);
    toastError("Không tải được dữ liệu tham chiếu.");
  } finally {
    loading.value = false;
  }
});

// CREATE PRODUCT IF NEEDED
async function createProductIfNeeded() {
  if (form.idSanPham) return;

  const ten = String(form.tenSanPham || "").trim();
  if (!ten) throw new Error("Vui lòng nhập tên sản phẩm.");
  if (!selectedThuongHieu.value?.id) throw new Error("Vui lòng chọn/nhập Thương hiệu.");

  const payload = {
    tenSanPham: ten,
    moTaNgan: form.moTaNgan ?? null,

    idThuongHieu: selectedThuongHieu.value.id,
    idXuatXu: selectedXuatXu.value?.id ?? null,
    idCoGiay: selectedCoGiay.value?.id ?? null,
    idChatLieu: selectedChatLieu.value?.id ?? null,
    idViTriThiDau: selectedViTriThiDau.value?.id ?? null,
    idPhongCachChoi: selectedPhongCachChoi.value?.id ?? null,
    trangThaiKinhDoanh: true,

    xoaMem: false,
  };

  const res = await productService.create(payload);
  const created = res?.data ?? res;

  const createdId = created?.id;
  if (!createdId) throw new Error("Tạo sản phẩm thành công nhưng không nhận được id.");

  const list = await productService.getAll();
  productOptions.value = normalizeArr(list);

  const found = productOptions.value.find((x) => Number(x.id) === Number(createdId)) || { ...created, id: createdId };
  form.idSanPham = found.id;
  form.maSanPham = found.maSanPham ?? found.ma ?? form.maSanPham;
  form.tenSanPham = found.tenSanPham ?? found.ten ?? form.tenSanPham;

  toastSuccess("Thêm sản phẩm thành công");
}

// SUBMIT
async function submit() {
  try {
    if (!hasVariantsSelected.value) return stopWithError("Chưa chọn đủ biến thể (Màu/Kích cỡ/Loại sân/Form chân).");
    if (!rows.value.length) return stopWithError("Chưa có biến thể nào để thêm.");

    await createProductIfNeeded();
    if (!form.idSanPham) return stopWithError("Không xác định được sản phẩm.");

    const selectedRows = rows.value.filter((r) => r.checked);
    if (!selectedRows.length) return stopWithError("Bạn chưa tick dòng nào để thêm.");

    const bad = selectedRows.find((r) => Number(r.soLuong) < 0 || Number(r.gia) < 0 || String(r.gia ?? "") === "");
    if (bad) return stopWithError("Vui lòng nhập Số lượng/Giá hợp lệ (>= 0) cho các dòng đã tick.");

    const ok = confirm(
      isEdit.value
        ? "Bạn có muốn lưu thay đổi chi tiết sản phẩm này không?"
        : `Bạn có muốn thêm ${selectedRows.length} chi tiết sản phẩm không?`
    );
    if (!ok) return;

    loading.value = true;

    if (isEdit.value) {
      const r = selectedRows[0];
      const price = Number(r.gia || 0);

      const payload = {
        idSanPham: form.idSanPham,
        idMauSac: r.idMauSac,
        idKichThuoc: r.idKichThuoc,
        idLoaiSan: r.idLoaiSan,
        idFormChan: r.idFormChan,
        soLuong: Number(r.soLuong || 0),
        giaNiemYet: price,
        giaBan: price,
        trangThai: true,
      };

      await productDetailService.update(id.value, payload);

      // ✅ upload ảnh (nếu có chọn file màu)
      await uploadImageAfterEdit(Number(id.value));

      toastSuccess("Lưu chi tiết sản phẩm thành công");

      router.push(`/admin/chi-tiet-san-pham?productId=${form.idSanPham}&saved=1&mode=update`);
      return;
    }

    // CREATE nhiều CTSP
    const createdResList = await Promise.all(
      selectedRows.map((r) => {
        const price = Number(r.gia || 0);
        const payload = {
          idSanPham: form.idSanPham,
          idMauSac: r.idMauSac,
          idKichThuoc: r.idKichThuoc,
          idLoaiSan: r.idLoaiSan,
          idFormChan: r.idFormChan,
          soLuong: Number(r.soLuong || 0),
          giaNiemYet: price,
          giaBan: price,
          trangThai: true,
        };
        return productDetailService.create(payload);
      })
    );

    // normalize created list => [{id, idMauSac...}]
    const createdCtspList = createdResList
      .map((x) => x?.data ?? x)
      .filter(Boolean);

    // ✅ upload ảnh theo MÀU sau khi tạo
    await uploadImagesAfterCreate(createdCtspList);

    toastSuccess("Thêm chi tiết sản phẩm thành công");

    router.push(`/admin/chi-tiet-san-pham?productId=${form.idSanPham}&saved=1&mode=create`);
  } catch (e) {
    console.error(e);
    toastError(e?.message || (isEdit.value ? "Lưu thất bại." : "Thêm thất bại."));
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.ss-page-title { font-weight: 900; font-size: 22px; letter-spacing: 0.4px; }
.ss-btn { border-radius: 10px; padding: 10px 14px; }
.ss-card-title { font-weight: 700; }
.ss-empty { padding: 26px 10px; text-align: center; color: #6b7280; }

.ss-common { align-items: flex-end; }
.ss-common-item { width: 230px; }
.ss-add-btn { border-radius: 12px; padding: 12px 18px; }

.ss-file { display: flex; align-items: center; gap: 10px; }
.ss-file-btn { border-radius: 8px; padding: 6px 10px; }
.ss-file-name {
  color: #374151;
  font-size: 13px;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.ss-name { white-space: normal; }

.ss-icon-btn {
  border: 1px solid rgba(255, 77, 79, 0.45);
  color: #ff4d4f;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}
.ss-icon-btn:hover { background: rgba(255, 77, 79, 0.06); }

.ss-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  flex: 0 0 auto;
}
</style>
