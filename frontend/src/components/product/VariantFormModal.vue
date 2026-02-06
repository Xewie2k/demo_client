<template>
  <div v-if="open" class="modal-backdrop-custom">
    <div class="modal-custom card shadow">
      <!-- Header -->
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="fw-bold">Thêm chi tiết sản phẩm</div>
        <button class="btn btn-sm btn-outline-secondary" :disabled="submitting || saving" @click="emit('close')">
          X
        </button>
      </div>

      <!-- Body -->
      <div class="card-body">
        <div class="row g-3">
          <!-- LEFT: Thông tin sản phẩm -->
          <div class="col-lg-7">
            <div class="ss-card ss-border p-3 h-100">
              <div class="fw-bold mb-2">Thông tin sản phẩm</div>

              <label class="form-label">Sản phẩm *</label>
              <AppSelect
                v-model="selectedProduct"
                :options="productOptions"
                placeholder="Gõ để tìm sản phẩm..."
                :loading="loadingProducts"
              />

              <div class="row g-2 mt-2">
                <div class="col-md-4">
                  <label class="form-label">Thương hiệu (ID)</label>
                  <input class="form-control" :value="productInfo.idThuongHieu ?? ''" disabled />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Xuất xứ (ID)</label>
                  <input class="form-control" :value="productInfo.idXuatXu ?? ''" disabled />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Vị trí thi đấu (ID)</label>
                  <input class="form-control" :value="productInfo.idViTriThiDau ?? ''" disabled />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Phong cách chơi (ID)</label>
                  <input class="form-control" :value="productInfo.idPhongCachChoi ?? ''" disabled />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Cổ giày (ID)</label>
                  <input class="form-control" :value="productInfo.idCoGiay ?? ''" disabled />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Chất liệu (ID)</label>
                  <input class="form-control" :value="productInfo.idChatLieu ?? ''" disabled />
                </div>
              </div>

              <div class="mt-2">
                <label class="form-label">Ghi chú (tùy chọn)</label>
                <textarea v-model="note" class="form-control" rows="3" placeholder="Ghi chú..."></textarea>
              </div>

              <div class="mt-2 small text-muted">
                * Các ô thông tin sản phẩm đang hiển thị theo ID (auto-fill).
              </div>
            </div>
          </div>

          <!-- RIGHT: Biến thể -->
          <div class="col-lg-5">
            <div class="ss-card ss-border p-3 h-100">
              <div class="fw-bold mb-2">Biến thể</div>

              <label class="form-label">Màu sắc *</label>
              <AppSelect
                v-model="selectedMauSac"
                :options="mauSacOptions"
                placeholder="Gõ để tìm màu..."
                :loading="loadingRef"
              />

              <label class="form-label mt-2">Kích thước *</label>
              <AppSelect
                v-model="selectedKichThuoc"
                :options="kichThuocOptions"
                placeholder="Gõ để tìm size..."
                :loading="loadingRef"
              />

              <label class="form-label mt-2">Loại sân *</label>
              <AppSelect
                v-model="selectedLoaiSan"
                :options="loaiSanOptions"
                placeholder="Gõ để tìm loại sân..."
                :loading="loadingRef"
              />

              <label class="form-label mt-2">Form chân *</label>
              <AppSelect
                v-model="selectedFormChan"
                :options="formChanOptions"
                placeholder="Gõ để tìm form chân..."
                :loading="loadingRef"
              />

              <!-- GIÁ (BẮT BUỘC TRONG DB) -->
              <div class="row g-2 mt-2">
                <div class="col-6">
                  <label class="form-label">Giá niêm yết *</label>
                  <input
                    v-model.number="giaNiemYet"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="VD: 1200000"
                  />
                </div>
                <div class="col-6">
                  <label class="form-label">Giá bán</label>
                  <input
                    v-model.number="giaBan"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="VD: 990000"
                  />
                </div>
              </div>

              <button class="btn btn-dark w-100 mt-3" :disabled="!canAddVariant" @click="addVariantRow">
                + Thêm vào danh sách
              </button>

              <div class="small text-muted mt-2">
                Tip: Gõ để lọc nhanh rồi chọn.
              </div>
            </div>
          </div>

          <!-- TABLE: Danh sách biến thể -->
          <div class="col-12">
            <div class="ss-card ss-border p-3">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="fw-bold">Danh sách biến thể sẽ tạo</div>
                <div class="small text-muted">
                  * DB yêu cầu Giá niêm yết (bắt buộc).
                </div>
              </div>

              <div class="table-responsive mt-2">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th style="width:70px;">STT</th>
                      <th>Màu</th>
                      <th>Size</th>
                      <th>Loại sân</th>
                      <th>Form</th>
                      <th style="width:140px;">Số lượng</th>
                      <th style="width:170px;">Giá niêm yết</th>
                      <th style="width:170px;">Giá bán</th>
                      <th style="width:140px;">Trạng thái</th>
                      <th style="width:90px;">Xóa</th>
                    </tr>
                  </thead>

                  <tbody v-if="variantRows.length">
                    <tr v-for="(r, idx) in variantRows" :key="r.key">
                      <td>{{ idx + 1 }}</td>
                      <td>{{ r.mau.label }}</td>
                      <td>{{ r.kichThuoc.label }}</td>
                      <td>{{ r.loaiSan.label }}</td>
                      <td>{{ r.formChan.label }}</td>

                      <td>
                        <input type="number" class="form-control" v-model.number="r.soLuong" min="0" />
                      </td>

                      <td>
                        <input type="number" class="form-control" v-model.number="r.giaNiemYet" min="0" />
                      </td>

                      <td>
                        <input type="number" class="form-control" v-model.number="r.giaBan" min="0" />
                      </td>

                      <td>
                        <select class="form-select" v-model="r.trangThai">
                          <option :value="true">Đang bán</option>
                          <option :value="false">Ngừng bán</option>
                        </select>
                      </td>

                      <td>
                        <button class="btn btn-outline-danger btn-sm" @click="removeRow(idx)">X</button>
                      </td>
                    </tr>
                  </tbody>

                  <tbody v-else>
                    <tr>
                      <td colspan="10" class="text-center text-muted py-4">Chưa có dòng nào</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Footer actions -->
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-outline-secondary" :disabled="saving" @click="emit('close')">Đóng</button>

                <button
                  class="btn btn-success"
                  :disabled="saving || !selectedProduct || !variantRows.length"
                  @click="submitCreateDetails"
                >
                  {{ saving ? "Đang lưu..." : "Thêm chi tiết sản phẩm" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div><!-- /body -->
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AppSelect from "@/components/common/AppSelect.vue";
import productService from "@/services/productService";
import { refDataService } from "@/services/refDataService";
import productDetailService from "@/services/productDetailService";

const props = defineProps({
  open: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

// ====== OPTIONS ======
const loadingProducts = ref(false);
const productOptions = ref([]);

const loadingRef = ref(false);
const mauSacOptions = ref([]);
const kichThuocOptions = ref([]);
const loaiSanOptions = ref([]);
const formChanOptions = ref([]);

// ====== SELECTED ======
const selectedProduct = ref(null);
const selectedMauSac = ref(null);
const selectedKichThuoc = ref(null);
const selectedLoaiSan = ref(null);
const selectedFormChan = ref(null);

const note = ref("");

// GIÁ nhập nhanh (áp vào row khi add)
const giaNiemYet = ref(0);
const giaBan = ref(null);

// ====== TABLE ROWS ======
const variantRows = ref([]);

// ====== LOAD DATA ======
const loadProducts = async () => {
  loadingProducts.value = true;
  try {
    const list = await productService.getAll();
    productOptions.value = (list || []).map((p) => ({
      id: p.id,
      label: `${p.maSanPham || p.ma_san_pham || ""} - ${p.tenSanPham || p.ten_san_pham || ""}`.trim(),
      raw: p,
    }));
  } finally {
    loadingProducts.value = false;
  }
};

const loadRefData = async () => {
  loadingRef.value = true;
  try {
    const [ms, kt, ls, fc] = await Promise.all([
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
      refDataService.getLoaiSan(),
      refDataService.getFormChan(),
    ]);

    mauSacOptions.value = (ms.data || []).map((x) => ({
      id: x.id,
      label: x.tenMauSac || x.ten_mau_sac || x.maMauSac || `MS#${x.id}`,
      raw: x,
    }));

    kichThuocOptions.value = (kt.data || []).map((x) => ({
      id: x.id,
      label: x.tenKichThuoc || x.ten_kich_thuoc || x.maKichThuoc || `KT#${x.id}`,
      raw: x,
    }));

    loaiSanOptions.value = (ls.data || []).map((x) => ({
      id: x.id,
      label: x.tenLoaiSan || x.ten_loai_san || x.maLoaiSan || `LS#${x.id}`,
      raw: x,
    }));

    formChanOptions.value = (fc.data || []).map((x) => ({
      id: x.id,
      label: x.tenFormChan || x.ten_form_chan || x.maFormChan || `FC#${x.id}`,
      raw: x,
    }));
  } finally {
    loadingRef.value = false;
  }
};

// chỉ load khi mở modal + reset nhẹ để demo sạch
watch(
  () => props.open,
  (v) => {
    if (v) {
      loadProducts();
      loadRefData();
      variantRows.value = [];
      note.value = "";
      giaNiemYet.value = 0;
      giaBan.value = null;
      selectedMauSac.value = null;
      selectedKichThuoc.value = null;
      selectedLoaiSan.value = null;
      selectedFormChan.value = null;
    }
  }
);

// ====== AUTO FILL PRODUCT INFO ======
const productInfo = computed(() => {
  const p = selectedProduct.value?.raw || {};
  return {
    idThuongHieu: p.idThuongHieu ?? p.id_thuong_hieu ?? "",
    idXuatXu: p.idXuatXu ?? p.id_xuat_xu ?? "",
    idViTriThiDau: p.idViTriThiDau ?? p.id_vi_tri_thi_dau ?? "",
    idPhongCachChoi: p.idPhongCachChoi ?? p.id_phong_cach_choi ?? "",
    idCoGiay: p.idCoGiay ?? p.id_co_giay ?? "",
    idChatLieu: p.idChatLieu ?? p.id_chat_lieu ?? "",
  };
});

// ====== ADD ROW ======
const canAddVariant = computed(() => {
  const okVariant =
    selectedProduct.value &&
    selectedMauSac.value &&
    selectedKichThuoc.value &&
    selectedLoaiSan.value &&
    selectedFormChan.value;

  const okPrice = Number(giaNiemYet.value ?? 0) >= 0;

  return okVariant && okPrice;
});

const isDuplicate = (row) => {
  return variantRows.value.some(
    (r) =>
      r.mau.id === row.mau.id &&
      r.kichThuoc.id === row.kichThuoc.id &&
      r.loaiSan.id === row.loaiSan.id &&
      r.formChan.id === row.formChan.id
  );
};

const addVariantRow = () => {
  const row = {
    key: `${Date.now()}_${Math.random()}`,
    mau: selectedMauSac.value,
    kichThuoc: selectedKichThuoc.value,
    loaiSan: selectedLoaiSan.value,
    formChan: selectedFormChan.value,
    soLuong: 0,
    trangThai: true,
    giaNiemYet: Number(giaNiemYet.value ?? 0),
    giaBan: giaBan.value === null || giaBan.value === "" ? null : Number(giaBan.value),
  };

  if (isDuplicate(row)) return;

  variantRows.value.push(row);

  // reset biến thể để nhập tiếp (sản phẩm giữ nguyên)
  selectedMauSac.value = null;
  selectedKichThuoc.value = null;
  selectedLoaiSan.value = null;
  selectedFormChan.value = null;
};

const removeRow = (idx) => {
  variantRows.value.splice(idx, 1);
};

// ====== SUBMIT CREATE ======
const saving = ref(false);

const submitCreateDetails = async () => {
  if (!selectedProduct.value) return;
  if (!variantRows.value.length) return;

  // validate nhanh
  for (const r of variantRows.value) {
    if (Number(r.soLuong ?? 0) < 0) {
      alert("Số lượng không hợp lệ (>=0).");
      return;
    }
    if (r.giaNiemYet === null || r.giaNiemYet === "" || Number(r.giaNiemYet) < 0) {
      alert("Giá niêm yết không hợp lệ (>=0).");
      return;
    }
    if (r.giaBan !== null && r.giaBan !== "" && Number(r.giaBan) < 0) {
      alert("Giá bán không hợp lệ (>=0).");
      return;
    }
  }

  const idSanPham = selectedProduct.value.id;

  const payloads = variantRows.value.map((r) => ({
    idSanPham,
    idMauSac: r.mau.id,
    idKichThuoc: r.kichThuoc.id,
    idLoaiSan: r.loaiSan.id,
    idFormChan: r.formChan.id,
    soLuong: Number(r.soLuong || 0),
    giaNiemYet: Number(r.giaNiemYet || 0),
    giaBan: r.giaBan === null || r.giaBan === "" ? null : Number(r.giaBan),
    trangThai: r.trangThai,
    ghiChu: note.value || null,
  }));

  saving.value = true;
  try {
    const result = await productDetailService.createMany(payloads);

    if (result.fail?.length) {
      console.warn("Có dòng lỗi:", result.fail);
      alert(`Tạo OK: ${result.ok.length} dòng, lỗi: ${result.fail.length} dòng.\nMở Console để xem lỗi (hay gặp: trùng biến thể).`);
    } else {
      alert(`Tạo thành công ${result.ok.length} dòng!`);
    }

    variantRows.value = [];
    note.value = "";
  } catch (e) {
    alert(e?.response?.data?.message || e?.message || "Lỗi khi tạo chi tiết sản phẩm");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-backdrop-custom{
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display:flex; justify-content:center; align-items:center;
  padding: 20px; z-index: 9999;
}
.modal-custom{
  width: min(1200px, 98vw);
  max-height: 92vh;
  overflow: auto;
  border-radius: 12px;
}
</style>
