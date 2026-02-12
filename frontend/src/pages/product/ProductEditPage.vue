<!-- src/pages/product/ProductEditPage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">SỬA SẢN PHẨM</div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-dark ss-btn" type="button" @click="back">Quay lại</button>
        <!-- ✅ đổi sang mở confirm -->
        <button class="btn btn-dark ss-btn" type="button" :disabled="loading" @click="openConfirmSave">
          Lưu
        </button>
      </div>
    </div>

    <!-- ✅ bọc form để chặn submit ngầm (Enter) -->
    <form @submit.prevent="openConfirmSave">
      <div class="row g-3">
        <div class="col-lg-12">
          <div class="ss-card ss-border p-3">
            <div class="mb-2 ss-card-title">Thông tin & thuộc tính sản phẩm</div>

            <div class="row g-2">
              <div class="col-md-4">
                <label class="form-label">Mã</label>
                <input class="form-control" :value="form.maSanPham || '(tự tạo)'" disabled />
              </div>

              <div class="col-md-8">
                <label class="form-label">Tên sản phẩm *</label>
                <input class="form-control" v-model="form.tenSanPham" placeholder="Nhập tên sản phẩm..." />
              </div>

              <div class="col-12">
                <label class="form-label">Mô tả ngắn</label>
                <textarea class="form-control" rows="3" v-model="form.moTaNgan" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Thương hiệu *</label>
                <v-select
                  v-model="selectedThuongHieu"
                  :options="thuongHieuOptions"
                  label="tenThuongHieu"
                  placeholder="Chọn thương hiệu..."
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Xuất xứ</label>
                <v-select
                  v-model="selectedXuatXu"
                  :options="xuatXuOptions"
                  label="tenXuatXu"
                  placeholder="Chọn xuất xứ..."
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Cổ giày</label>
                <v-select
                  v-model="selectedCoGiay"
                  :options="coGiayOptions"
                  label="tenCoGiay"
                  placeholder="Chọn cổ giày..."
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Chất liệu</label>
                <v-select
                  v-model="selectedChatLieu"
                  :options="chatLieuOptions"
                  label="tenChatLieu"
                  placeholder="Chọn chất liệu..."
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Vị trí thi đấu</label>
                <v-select
                  v-model="selectedViTriThiDau"
                  :options="viTriThiDauOptions"
                  :getOptionLabel="(o) => o?.tenViTriThiDau ?? o?.ten ?? ''"
                  placeholder="Chọn vị trí..."
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Phong cách chơi</label>
                <v-select
                  v-model="selectedPhongCachChoi"
                  :options="phongCachChoiOptions"
                  :getOptionLabel="(o) => o?.tenPhongCachChoi ?? o?.ten ?? ''"
                  placeholder="Chọn phong cách..."
                />
              </div>
            </div>

            <div class="small text-muted mt-2">
              * Trang này chỉ sửa thông tin bảng <b>sản phẩm</b>. Muốn quản lý biến thể (màu/size/loại sân/form chân) vào mục
              <b>“Sản phẩm chi tiết”</b> ở sidebar.
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- ✅ CONFIRM POPUP (CHẮC CHẮN HIỆN) -->
    <div v-if="confirmSave.open" class="ss-overlay" @click.self="closeConfirmSave">
      <div class="ss-confirm">
        <div class="ss-confirm-header">
          <div class="fw-bold ss-confirm-title">Xác nhận cập nhật</div>
          <button class="btn btn-sm btn-outline-secondary" type="button" @click="closeConfirmSave">X</button>
        </div>

        <div class="ss-confirm-body">
          <div class="ss-confirm-text">
            Bạn có chắc chắn muốn <b>cập nhật/thay đổi</b> thông tin sản phẩm này không?
          </div>
          <div class="ss-confirm-sub">
            Tên: <b>{{ (form.tenSanPham || "").trim() || "(chưa nhập)" }}</b>
          </div>
        </div>

        <div class="ss-confirm-footer">
          <button class="btn btn-outline-secondary ss-btn" type="button" @click="closeConfirmSave" :disabled="loading">
            Hủy
          </button>
          <button class="btn btn-primary ss-btn" type="button" @click="confirmAndSubmit" :disabled="loading">
            {{ loading ? "Đang lưu..." : "Cập nhật" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import productService from "@/services/productService";
import { refDataService } from "@/services/refDataService";

const route = useRoute();
const router = useRouter();
const primeToast = useToast();

const loading = ref(false);
const id = Number(route.params?.id);

const form = reactive({
  id: null,
  maSanPham: "",
  tenSanPham: "",
  moTaNgan: "",
});

const thuongHieuOptions = ref([]);
const xuatXuOptions = ref([]);
const coGiayOptions = ref([]);
const chatLieuOptions = ref([]);
const viTriThiDauOptions = ref([]);
const phongCachChoiOptions = ref([]);

const selectedThuongHieu = ref(null);
const selectedXuatXu = ref(null);
const selectedCoGiay = ref(null);
const selectedChatLieu = ref(null);
const selectedViTriThiDau = ref(null);
const selectedPhongCachChoi = ref(null);

const confirmSave = reactive({ open: false });

function toastSuccess(detail) {
  primeToast.add({ severity: "success", summary: "Thành công", detail, life: 2500 });
}
function toastError(detail) {
  primeToast.add({ severity: "error", summary: "Thất bại", detail, life: 3500 });
}

function normalizeArr(res) {
  return Array.isArray(res) ? res : res?.data ?? [];
}

function back() {
  router.push("/admin/san-pham");
}

function openConfirmSave() {
  // ✅ validate trước khi mở confirm
  if (!form.tenSanPham?.trim()) return toastError("Vui lòng nhập tên sản phẩm.");
  if (!selectedThuongHieu.value?.id) return toastError("Vui lòng chọn Thương hiệu.");

  confirmSave.open = true;
}
function closeConfirmSave() {
  confirmSave.open = false;
}

async function loadData() {
  loading.value = true;
  try {
    const [th, xx, cg, cl, vt, pc] = await Promise.all([
      refDataService.getThuongHieu(),
      refDataService.getXuatXu(),
      refDataService.getCoGiay(),
      refDataService.getChatLieu(),
      refDataService.getViTriThiDau(),
      refDataService.getPhongCachChoi(),
    ]);

    thuongHieuOptions.value = normalizeArr(th);
    xuatXuOptions.value = normalizeArr(xx);
    coGiayOptions.value = normalizeArr(cg);
    chatLieuOptions.value = normalizeArr(cl);
    viTriThiDauOptions.value = normalizeArr(vt);
    phongCachChoiOptions.value = normalizeArr(pc);

    const res = await productService.getOne(id);
    const p = res?.data ?? res;

    form.id = p.id ?? id;
    form.maSanPham = p.maSanPham ?? p.ma ?? "";
    form.tenSanPham = p.tenSanPham ?? p.ten ?? "";
    form.moTaNgan = p.moTaNgan ?? p.moTa ?? "";

    selectedThuongHieu.value = thuongHieuOptions.value.find((x) => x.id === p.idThuongHieu) || null;
    selectedXuatXu.value = xuatXuOptions.value.find((x) => x.id === p.idXuatXu) || null;
    selectedCoGiay.value = coGiayOptions.value.find((x) => x.id === p.idCoGiay) || null;
    selectedChatLieu.value = chatLieuOptions.value.find((x) => x.id === p.idChatLieu) || null;
    selectedViTriThiDau.value = viTriThiDauOptions.value.find((x) => x.id === p.idViTriThiDau) || null;
    selectedPhongCachChoi.value = phongCachChoiOptions.value.find((x) => x.id === p.idPhongCachChoi) || null;
  } catch (e) {
    console.error(e);
    toastError("Không tải được dữ liệu sản phẩm.");
  } finally {
    loading.value = false;
  }
}

async function confirmAndSubmit() {
  // đóng confirm trước để tránh double click/lag
  confirmSave.open = false;

  const payload = {
    tenSanPham: form.tenSanPham.trim(),
    moTaNgan: form.moTaNgan ?? null,
    idThuongHieu: selectedThuongHieu.value.id,
    idXuatXu: selectedXuatXu.value?.id ?? null,
    idCoGiay: selectedCoGiay.value?.id ?? null,
    idChatLieu: selectedChatLieu.value?.id ?? null,
    idViTriThiDau: selectedViTriThiDau.value?.id ?? null,
    idPhongCachChoi: selectedPhongCachChoi.value?.id ?? null,
    xoaMem: false,
  };

  loading.value = true;
  try {
    await productService.update(id, payload);
    toastSuccess("Cập nhật sản phẩm thành công");
    back();
  } catch (e) {
    console.error(e);
    toastError("Cập nhật thất bại. Kiểm tra BE endpoint/Request.");
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.ss-page-title { font-weight: 900; font-size: 22px; letter-spacing: 0.4px; }
.ss-btn { border-radius: 10px; padding: 10px 14px; }
.ss-card-title { font-weight: 700; }

/* overlay giống chuẩn dự án */
.ss-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

/* confirm box */
.ss-confirm {
  width: 520px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

.ss-confirm-header {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-confirm-title { color: rgba(17, 24, 39, 0.92); }

.ss-confirm-body { padding: 16px; }
.ss-confirm-text { color: rgba(17, 24, 39, 0.86); }
.ss-confirm-sub { margin-top: 8px; color: rgba(17, 24, 39, 0.65); font-size: 13px; }

.ss-confirm-footer {
  padding: 14px 16px;
  display: flex;
  justify-content: end;
  gap: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* nút primary theo palette SevenStrike */
.btn-primary {
  border: none !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.16);
}
.btn-primary:disabled, .btn-primary.disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.btn-outline-secondary {
  background: #fff !important;
  color: rgba(17, 24, 39, 0.92) !important;
  border: 1px solid rgba(17, 24, 39, 0.22) !important;
}
</style>
