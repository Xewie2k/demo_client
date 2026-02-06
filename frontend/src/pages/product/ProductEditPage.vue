<!-- src/pages/product/ProductEditPage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">SỬA SẢN PHẨM</div>

      <div class="d-flex gap-2">
        <button class="btn btn-outline-dark ss-btn" @click="back">Quay lại</button>
        <button class="btn btn-dark ss-btn" :disabled="loading" @click="submit">Lưu</button>
      </div>
    </div>

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

    // Bạn cần đảm bảo productService có getOne(id)
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

async function submit() {
  if (!form.tenSanPham?.trim()) return toastError("Vui lòng nhập tên sản phẩm.");
  if (!selectedThuongHieu.value?.id) return toastError("Vui lòng chọn Thương hiệu.");

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
    // Bạn cần đảm bảo productService có update(id, payload)
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
</style>
