<!-- Demo/src/components/product/ProductDetailModal.vue -->
<script setup>
import { computed, reactive, ref, watch } from "vue";
import AppComboSelect from "@/components/common/AppComboSelect.vue";
import productService from "@/services/productService";
import { refDataService } from "@/services/refDataService";
import productDetailService from "@/services/productDetailService";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "saved"]);

const saving = ref(false);

// ===== OPTIONS =====
const loadingProducts = ref(false);
const productOptions = ref([]); // [{id,label,raw}]
const productsRaw = ref([]);

const loadingRef = ref(false);
const thuongHieuOptions = ref([]);
const xuatXuOptions = ref([]);
const viTriThiDauOptions = ref([]);
const phongCachChoiOptions = ref([]);
const coGiayOptions = ref([]);
const chatLieuOptions = ref([]);

const mauSacOptions = ref([]);
const kichThuocOptions = ref([]);
const loaiSanOptions = ref([]);
const formChanOptions = ref([]);

// ===== SELECTED =====
const selectedProductId = ref(null);

const info = reactive({
  idThuongHieu: null,
  idXuatXu: null,
  idViTriThiDau: null,
  idPhongCachChoi: null,
  idCoGiay: null,
  idChatLieu: null,
  moTaChiTiet: "",
});

// giá mặc định để apply cho tất cả dòng
const defaultPrice = reactive({
  giaNiemYet: 0,
  giaBan: 0,
});

const pick = reactive({
  idMauSac: null,
  idKichThuoc: null,
  idLoaiSan: null,
  idFormChan: null,
});

const rows = ref([]);

// ===== LOAD =====
const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    const list = await productService.getAll();
    productsRaw.value = list || [];
    productOptions.value = (list || []).map((p) => ({
      id: p.id,
      label: `${p.tenSanPham || p.ten_san_pham || ""} (${
        p.maSanPham || p.ma_san_pham || "ID " + p.id
      })`,
      raw: p,
    }));
  } catch (e) {
    console.error("Load products error:", e);
  } finally {
    loadingProducts.value = false;
  }
};

const mapOpt = (arr, getLabel) =>
  (arr || []).map((x) => ({
    id: x.id,
    label: getLabel(x),
    raw: x,
  }));

const loadRef = async () => {
  loadingRef.value = true;
  try {
    const [th, xx, vt, pc, cg, cl, ms, kt, ls, fc] = await Promise.all([
      refDataService.getThuongHieu(),
      refDataService.getXuatXu(),
      refDataService.getViTriThiDau(),
      refDataService.getPhongCachChoi(),
      refDataService.getCoGiay(),
      refDataService.getChatLieu(),
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
      refDataService.getLoaiSan(),
      refDataService.getFormChan(),
    ]);

    thuongHieuOptions.value = mapOpt(th.data, (x) => x.tenThuongHieu || x.ten_thuong_hieu || `TH#${x.id}`);
    xuatXuOptions.value = mapOpt(xx.data, (x) => x.tenXuatXu || x.ten_xuat_xu || `XX#${x.id}`);
    viTriThiDauOptions.value = mapOpt(vt.data, (x) => x.tenViTriThiDau || x.ten_vi_tri_thi_dau || `VT#${x.id}`);
    phongCachChoiOptions.value = mapOpt(pc.data, (x) => x.tenPhongCachChoi || x.ten_phong_cach_choi || `PC#${x.id}`);
    coGiayOptions.value = mapOpt(cg.data, (x) => x.tenCoGiay || x.ten_co_giay || `CG#${x.id}`);
    chatLieuOptions.value = mapOpt(cl.data, (x) => x.tenChatLieu || x.ten_chat_lieu || `CL#${x.id}`);

    mauSacOptions.value = mapOpt(ms.data, (x) => x.tenMauSac || x.ten_mau_sac || `MS#${x.id}`);
    kichThuocOptions.value = mapOpt(kt.data, (x) => x.tenKichThuoc || x.ten_kich_thuoc || `KT#${x.id}`);
    loaiSanOptions.value = mapOpt(ls.data, (x) => x.tenLoaiSan || x.ten_loai_san || `LS#${x.id}`);
    formChanOptions.value = mapOpt(fc.data, (x) => x.tenFormChan || x.ten_form_chan || `FC#${x.id}`);
  } catch (e) {
    console.error("Load ref data error:", e);
  } finally {
    loadingRef.value = false;
  }
};

const resetForm = () => {
  selectedProductId.value = null;

  info.idThuongHieu = null;
  info.idXuatXu = null;
  info.idViTriThiDau = null;
  info.idPhongCachChoi = null;
  info.idCoGiay = null;
  info.idChatLieu = null;
  info.moTaChiTiet = "";

  // reset giá mặc định
  defaultPrice.giaNiemYet = 0;
  defaultPrice.giaBan = 0;

  pick.idMauSac = null;
  pick.idKichThuoc = null;
  pick.idLoaiSan = null;
  pick.idFormChan = null;

  rows.value = [];
};

watch(
  () => props.open,
  async (v) => {
    if (v) {
      resetForm();
      await Promise.all([loadProducts(), loadRef()]);
    }
  }
);

// ===== AUTO FILL khi chọn sản phẩm =====
const selectedProductRaw = computed(() => {
  const id = selectedProductId.value;
  if (!id) return null;
  return productsRaw.value.find((p) => String(p.id) === String(id)) || null;
});

watch(selectedProductRaw, (p) => {
  if (!p) return;
  info.idThuongHieu = p.idThuongHieu ?? p.id_thuong_hieu ?? null;
  info.idXuatXu = p.idXuatXu ?? p.id_xuat_xu ?? null;
  info.idViTriThiDau = p.idViTriThiDau ?? p.id_vi_tri_thi_dau ?? null;
  info.idPhongCachChoi = p.idPhongCachChoi ?? p.id_phong_cach_choi ?? null;
  info.idCoGiay = p.idCoGiay ?? p.id_co_giay ?? null;
  info.idChatLieu = p.idChatLieu ?? p.id_chat_lieu ?? null;
});

// ===== VARIANT ROWS =====
const canAddVariant = computed(() => {
  return (
    !!selectedProductId.value &&
    !!pick.idMauSac &&
    !!pick.idKichThuoc &&
    !!pick.idLoaiSan &&
    !!pick.idFormChan
  );
});

const addVariantRow = () => {
  if (!canAddVariant.value) return;

  const exists = rows.value.some(
    (r) =>
      String(r.idMauSac) === String(pick.idMauSac) &&
      String(r.idKichThuoc) === String(pick.idKichThuoc) &&
      String(r.idLoaiSan) === String(pick.idLoaiSan) &&
      String(r.idFormChan) === String(pick.idFormChan)
  );
  if (exists) {
    alert("Biến thể này đã có trong danh sách!");
    return;
  }

  rows.value.push({
    _key: `${Date.now()}-${Math.random()}`,
    idMauSac: pick.idMauSac,
    idKichThuoc: pick.idKichThuoc,
    idLoaiSan: pick.idLoaiSan,
    idFormChan: pick.idFormChan,
    soLuong: 0,

    // lấy theo giá mặc định hiện tại
    giaNiemYet: Number.isFinite(Number(defaultPrice.giaNiemYet)) ? Number(defaultPrice.giaNiemYet) : 0,
    giaBan: Number.isFinite(Number(defaultPrice.giaBan)) ? Number(defaultPrice.giaBan) : 0,

    trangThai: true,
  });

  pick.idMauSac = null;
  pick.idKichThuoc = null;
  pick.idLoaiSan = null;
  pick.idFormChan = null;
};

const removeRow = (idx) => rows.value.splice(idx, 1);

// labelOf dùng được cả ref lẫn array
const labelOf = (optsRefOrArr, id) => {
  const arr = Array.isArray(optsRefOrArr) ? optsRefOrArr : (optsRefOrArr?.value || []);
  return arr.find((x) => String(x.id) === String(id))?.label || id;
};

// apply giá mặc định cho tất cả dòng
const applyDefaultPriceToAll = () => {
  const niemYet = Number.isFinite(Number(defaultPrice.giaNiemYet)) ? Number(defaultPrice.giaNiemYet) : 0;
  const ban = Number.isFinite(Number(defaultPrice.giaBan)) ? Number(defaultPrice.giaBan) : 0;

  rows.value = (rows.value || []).map((r) => ({
    ...r,
    giaNiemYet: niemYet,
    giaBan: ban,
  }));
};

const canSubmit = computed(() => !!selectedProductId.value && rows.value.length > 0 && !saving.value);

const submitAll = async () => {
  if (!selectedProductId.value) {
    alert("Vui lòng chọn sản phẩm!");
    return;
  }
  if (!rows.value.length) {
    alert("Chưa có biến thể nào trong danh sách!");
    return;
  }

  saving.value = true;

  try {
    for (const r of rows.value) {
      const payload = {
        idSanPham: Number(selectedProductId.value),
        idMauSac: Number(r.idMauSac),
        idKichThuoc: Number(r.idKichThuoc),
        idLoaiSan: Number(r.idLoaiSan),
        idFormChan: Number(r.idFormChan),

        soLuong: Number(r.soLuong ?? 0),

        // luôn gửi số, không null/NaN
        giaNiemYet: Number.isFinite(Number(r.giaNiemYet)) ? Number(r.giaNiemYet) : 0,
        giaBan: Number.isFinite(Number(r.giaBan)) ? Number(r.giaBan) : 0,

        trangThai: r.trangThai ?? true,

        // entity đang nullable=false => không gửi null
        ghiChu: info.moTaChiTiet || "",
      };

      await productDetailService.create(payload);
    }

    rows.value = [];
    info.moTaChiTiet = "";
    emit("saved");
  } catch (e) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    console.error("Create CTSP error:", status, data || e?.message);

    const msg =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : JSON.stringify(data)) ||
      e?.message ||
      "Tạo chi tiết sản phẩm thất bại";

    alert(msg);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div v-if="open" class="ss-modal-backdrop" @click.self="emit('close')">
    <div class="ss-modal card shadow-lg">
      <div class="card-header d-flex align-items-center justify-content-between">
        <div class="fw-bold">Thêm chi tiết sản phẩm</div>
        <button class="btn btn-sm btn-outline-secondary" :disabled="saving" @click="emit('close')">X</button>
      </div>

      <div class="card-body">
        <div class="row g-4">
          <!-- LEFT -->
          <div class="col-lg-7">
            <div class="card h-100 border-0 shadow-sm ss-inner-card">
              <div class="card-body">
                <div class="fw-bold mb-3">Thông Tin Sản Phẩm</div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">Sản phẩm</label>
                  <AppComboSelect
                    v-model="selectedProductId"
                    :options="productOptions"
                    :loading="loadingProducts"
                    placeholder="Gõ tên/mã hoặc chọn..."
                  />
                </div>

                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold">Thương hiệu</label>
                    <AppComboSelect v-model="info.idThuongHieu" :options="thuongHieuOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold">Xuất xứ</label>
                    <AppComboSelect v-model="info.idXuatXu" :options="xuatXuOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold">Vị trí thi đấu</label>
                    <AppComboSelect v-model="info.idViTriThiDau" :options="viTriThiDauOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-semibold">Phong cách chơi</label>
                    <AppComboSelect v-model="info.idPhongCachChoi" :options="phongCachChoiOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold">Cổ giày</label>
                    <AppComboSelect v-model="info.idCoGiay" :options="coGiayOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small fw-semibold">Chất liệu</label>
                    <AppComboSelect v-model="info.idChatLieu" :options="chatLieuOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold">Mô tả</label>
                    <textarea class="form-control" rows="3" v-model="info.moTaChiTiet" placeholder="Nhập mô tả sản phẩm..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="col-lg-5">
            <div class="card h-100 border-0 shadow-sm ss-inner-card">
              <div class="card-body">
                <div class="fw-bold mb-3">Biến thể</div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">Màu sắc</label>
                  <AppComboSelect v-model="pick.idMauSac" :options="mauSacOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">Kích thước</label>
                  <AppComboSelect v-model="pick.idKichThuoc" :options="kichThuocOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">Loại sân</label>
                  <AppComboSelect v-model="pick.idLoaiSan" :options="loaiSanOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">Form chân</label>
                  <AppComboSelect v-model="pick.idFormChan" :options="formChanOptions" :loading="loadingRef" placeholder="Gõ hoặc chọn..." />
                </div>

                <button class="btn btn-dark w-100 rounded-pill fw-semibold" :disabled="!canAddVariant" @click="addVariantRow">
                  + Thêm vào danh sách
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TABLE -->
        <div class="card border-0 shadow-sm ss-inner-card mt-4">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div class="fw-bold">Danh sách biến thể sẽ tạo</div>
              <div class="small text-secondary">Nhập Số lượng / Giá / Trạng thái cho từng dòng</div>
            </div>

            <!-- Giá mặc định + nút áp dụng -->
            <div class="row g-2 align-items-end mb-3">
              <div class="col-md-3">
                <label class="form-label small fw-semibold mb-1">Giá niêm yết mặc định</label>
                <input class="form-control form-control-sm" type="number" min="0" v-model.number="defaultPrice.giaNiemYet" placeholder="0" />
              </div>

              <div class="col-md-3">
                <label class="form-label small fw-semibold mb-1">Giá bán mặc định</label>
                <input class="form-control form-control-sm" type="number" min="0" v-model.number="defaultPrice.giaBan" placeholder="0" />
              </div>

              <div class="col-md-3">
                <button
                  class="btn btn-outline-dark btn-sm w-100"
                  :disabled="rows.length === 0"
                  @click="applyDefaultPriceToAll"
                >
                  Áp dụng cho tất cả
                </button>
              </div>

              <div class="col-md-3 text-md-end small text-secondary">
                * Áp dụng sẽ ghi đè giá ở các dòng hiện có
              </div>
            </div>

            <div class="table-responsive">
              <table class="table align-middle small mb-0">
                <thead>
                  <tr class="text-secondary border-bottom">
                    <th style="width:70px">STT</th>
                    <th style="width:160px">Màu</th>
                    <th style="width:120px">Size</th>
                    <th style="width:140px">Loại sân</th>
                    <th style="width:120px">Form</th>

                    <th style="width:120px">Số lượng</th>
                    <th style="width:160px">Giá niêm yết</th>
                    <th style="width:160px">Giá bán</th>

                    <th style="width:160px">Trạng thái</th>
                    <th class="text-center" style="width:80px">Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="rows.length === 0">
                    <td colspan="10" class="text-center text-secondary py-4">Chưa có dòng nào</td>
                  </tr>

                  <tr v-for="(r, idx) in rows" :key="r._key">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ labelOf(mauSacOptions, r.idMauSac) }}</td>
                    <td>{{ labelOf(kichThuocOptions, r.idKichThuoc) }}</td>
                    <td>{{ labelOf(loaiSanOptions, r.idLoaiSan) }}</td>
                    <td>{{ labelOf(formChanOptions, r.idFormChan) }}</td>

                    <td>
                      <input class="form-control form-control-sm" type="number" min="0" v-model.number="r.soLuong" />
                    </td>
                    <td>
                      <input class="form-control form-control-sm" type="number" min="0" v-model.number="r.giaNiemYet" />
                    </td>
                    <td>
                      <input class="form-control form-control-sm" type="number" min="0" v-model.number="r.giaBan" />
                    </td>

                    <td>
                      <select class="form-select form-select-sm" v-model="r.trangThai">
                        <option :value="true">Đang bán</option>
                        <option :value="false">Ngừng bán</option>
                      </select>
                    </td>

                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-danger" @click="removeRow(idx)">X</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-success px-4 rounded-pill fw-semibold" :disabled="!canSubmit" @click="submitAll">
                Thêm chi tiết sản phẩm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary px-4 rounded-pill" :disabled="saving" @click="emit('close')">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ss-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ss-modal {
  width: min(1200px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: auto;
  border-radius: 18px;
}
.ss-inner-card {
  border: 1px solid rgba(255, 77, 79, 0.18);
  border-radius: 16px;
}
</style>
