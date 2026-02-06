<!-- src/pages/product/ProductFormPage.vue -->
<template>
  <div class="ss-page">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">
        {{ isEdit ? "SỬA SẢN PHẨM" : "THÊM SẢN PHẨM" }}
      </div>

      <button class="btn btn-outline-dark ss-btn" @click="back">Quay lại</button>
    </div>

    <div class="ss-card ss-border p-3">
      <div class="row g-3">
        <!-- Mã sản phẩm (chỉ hiển thị, không sửa) -->
        <div class="col-md-6">
          <label class="form-label">Mã sản phẩm</label>
          <input class="form-control" :value="form.maSanPham || '(tự tạo)'" disabled />
        </div>

        <!-- Tên sản phẩm -->
        <div class="col-md-6">
          <label class="form-label">Tên sản phẩm *</label>
          <input v-model="form.tenSanPham" class="form-control" placeholder="Nhập tên sản phẩm..." />
        </div>

        <!-- Trạng thái kinh doanh -->
        <div class="col-md-6">
          <label class="form-label">Trạng thái kinh doanh</label>
          <select v-model="form.kinhDoanh" class="form-select">
            <option :value="true">Kinh doanh</option>
            <option :value="false">Ngừng kinh doanh</option>
          </select>
        </div>

        <!-- Ảnh sản phẩm -->
        <div class="col-md-6">
          <label class="form-label">Ảnh sản phẩm</label>

          <input class="d-none" type="file" accept="image/*" id="product-image-file" @change="onImageChange" />

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary ss-btn-sm" type="button" @click="triggerImagePick">
              Chọn ảnh
            </button>
            <div class="small text-muted text-truncate" style="max-width: 320px">
              {{ imageFileName || "Chưa chọn ảnh" }}
            </div>
          </div>

          <div class="ss-image-preview mt-2" v-if="imagePreviewUrl">
            <img :src="imagePreviewUrl" alt="preview" />
          </div>

          <div class="small text-muted mt-2">
            * Ảnh “sản phẩm” thực tế sẽ lấy từ <b>ảnh đại diện</b> của <b>chi tiết sản phẩm</b>. <br />
            * Nếu bạn chọn ảnh ở đây: hệ thống sẽ upload và set làm ảnh đại diện cho <b>CTSP mới nhất</b> của sản phẩm (nếu có).
          </div>
        </div>

        <!-- Mô tả ngắn -->
        <div class="col-12">
          <label class="form-label">Mô tả ngắn</label>
          <textarea v-model="form.moTaNgan" class="form-control" rows="3" placeholder="Nhập mô tả ngắn..." />
        </div>

        <!-- Mô tả chi tiết -->
        <div class="col-12">
          <label class="form-label">Mô tả chi tiết</label>
          <textarea v-model="form.moTaChiTiet" class="form-control" rows="6" placeholder="Nhập mô tả chi tiết..." />
        </div>

        <!-- Buttons -->
        <div class="col-12 d-flex justify-content-end gap-2 mt-2">
          <button class="btn btn-outline-secondary ss-btn" :disabled="loading" @click="resetForm">
            Hủy
          </button>
          <button class="btn btn-dark ss-btn" :disabled="loading" @click="submit">
            Lưu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import anhChiTietSanPhamService from "@/services/anhChiTietSanPhamService.js";

const toast = useToast();
const route = useRoute();
const router = useRouter();

const loading = ref(false);

const id = computed(() => route.params?.id);
const isEdit = computed(() => !!id.value && String(id.value).toLowerCase() !== "new");

// ===== FORM =====
const form = reactive({
  maSanPham: "",
  tenSanPham: "",
  moTaNgan: "",
  moTaChiTiet: "",
  kinhDoanh: true,
});

// backup để nút Hủy trả về dữ liệu ban đầu
let initialSnapshot = null;

// ===== IMAGE =====
const imageFile = ref(null);
const imageFileName = ref("");
const imagePreviewUrl = ref("");

// giữ url preview để revoke
let lastObjectUrl = null;

// CTSP mới nhất của SP để gắn ảnh đại diện (nếu có)
const latestCtspId = ref(null);

// helper toast
function toastSuccess(detail) {
  toast.add({ severity: "success", summary: "Thành công", detail, life: 3000 });
}
function toastError(detail) {
  toast.add({ severity: "error", summary: "Thất bại", detail, life: 3500 });
}

function back() {
  router.push("/admin/san-pham");
}

function resetForm() {
  if (!initialSnapshot) return;

  form.maSanPham = initialSnapshot.maSanPham || "";
  form.tenSanPham = initialSnapshot.tenSanPham || "";
  form.moTaNgan = initialSnapshot.moTaNgan || "";
  form.moTaChiTiet = initialSnapshot.moTaChiTiet || "";
  form.kinhDoanh = initialSnapshot.kinhDoanh ?? true;

  // reset ảnh chọn mới
  imageFile.value = null;
  imageFileName.value = "";

  // revoke preview hiện tại nếu là objectUrl
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }
  imagePreviewUrl.value = initialSnapshot.imagePreviewUrl || "";

  // reset input file để chọn lại cùng 1 file vẫn trigger change
  const el = document.getElementById("product-image-file");
  if (el) el.value = "";
}

function triggerImagePick() {
  document.getElementById("product-image-file")?.click();
}

function onImageChange(e) {
  const input = e.target;
  const f = input.files?.[0];
  if (!f) return;

  imageFile.value = f;
  imageFileName.value = f.name;

  // revoke preview cũ
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }

  // preview local
  const url = URL.createObjectURL(f);
  lastObjectUrl = url;
  imagePreviewUrl.value = url;

  // reset input để chọn lại cùng file vẫn gọi onChange
  input.value = "";
}

// ===== helpers unwrap list =====
function unwrapList(v) {
  if (Array.isArray(v)) return v;
  const d = v?.data ?? v;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data?.content)) return d.data.content;
  return [];
}

function pickIdSanPham(d) {
  return d?.idSanPham ?? d?.id_san_pham ?? d?.sanPhamId ?? d?.sanPham?.id ?? d?.san_pham?.id ?? null;
}
function pickNgayTao(d) {
  return d?.ngayTao ?? d?.ngay_tao ?? d?.createdAt ?? d?.created_at ?? null;
}

// ===== LOAD SP + tự lấy ảnh từ CTSP đại diện =====
async function loadProductRepresentativeImage(productId) {
  latestCtspId.value = null;

  // lấy danh sách CTSP để tìm CTSP “mới nhất”
  let ctspList = [];
  try {
    const ctspRes = await productDetailService.getAll();
    ctspList = unwrapList(ctspRes).filter((x) => String(pickIdSanPham(x)) === String(productId));
  } catch (e) {
    ctspList = [];
  }

  if (!ctspList.length) {
    latestCtspId.value = null;
    return "";
  }

  // chọn CTSP mới nhất (ưu tiên ngayTao, fallback id lớn nhất)
  ctspList.sort((a, b) => {
    const ta = new Date(pickNgayTao(a) || 0).getTime();
    const tb = new Date(pickNgayTao(b) || 0).getTime();
    if (ta !== tb) return tb - ta;
    const ida = Number(a?.id ?? 0);
    const idb = Number(b?.id ?? 0);
    return idb - ida;
  });

  const ctspId = ctspList[0]?.id;
  latestCtspId.value = ctspId ?? null;
  if (!ctspId) return "";

  // lấy ảnh của CTSP đó
  try {
    const imgsRes = await anhChiTietSanPhamService.getByChiTietSanPham(ctspId); // ✅ alias
    const imgs = unwrapList(imgsRes);

    if (!imgs || !imgs.length) return "";

    // ưu tiên ảnh đại diện
    const daiDien = imgs.find((x) => x?.laAnhDaiDien === true || x?.la_anh_dai_dien === true) || imgs[0];

    // linh hoạt key đường dẫn
    return daiDien?.duongDanAnh ?? daiDien?.url ?? daiDien?.path ?? "";
  } catch (e) {
    return "";
  }
}

async function loadOne() {
  if (!isEdit.value) {
    initialSnapshot = {
      maSanPham: "",
      tenSanPham: "",
      moTaNgan: "",
      moTaChiTiet: "",
      kinhDoanh: true,
      imagePreviewUrl: "",
    };
    latestCtspId.value = null;
    return;
  }

  loading.value = true;
  try {
    const res =
      typeof productService.getOne === "function"
        ? await productService.getOne(id.value)
        : typeof productService.one === "function"
        ? await productService.one(id.value)
        : await productService.getById(id.value);

    const p = res?.data ?? res;

    form.maSanPham = p?.maSanPham ?? p?.ma ?? "";
    form.tenSanPham = p?.tenSanPham ?? p?.ten ?? "";
    form.moTaNgan = p?.moTaNgan ?? p?.moTa ?? "";
    form.moTaChiTiet = p?.moTaChiTiet ?? p?.moTaDayDu ?? p?.chiTiet ?? "";

    const kd = p?.trangThaiKinhDoanh ?? p?.kinhDoanh ?? p?.trangThai ?? p?.isActive ?? true;
    form.kinhDoanh = !(kd === false || kd === 0 || kd === "0" || String(kd).toLowerCase() === "false");

    if (lastObjectUrl) {
      URL.revokeObjectURL(lastObjectUrl);
      lastObjectUrl = null;
    }

    // ✅ ảnh sản phẩm lấy từ CTSP ảnh đại diện
    const imgFromCtsp = await loadProductRepresentativeImage(id.value);

    imagePreviewUrl.value = imgFromCtsp || "";
    imageFile.value = null;
    imageFileName.value = "";

    initialSnapshot = {
      maSanPham: form.maSanPham,
      tenSanPham: form.tenSanPham,
      moTaNgan: form.moTaNgan,
      moTaChiTiet: form.moTaChiTiet,
      kinhDoanh: form.kinhDoanh,
      imagePreviewUrl: imagePreviewUrl.value,
    };
  } catch (e) {
    console.error(e);
    toastError("Không tải được dữ liệu sản phẩm.");
  } finally {
    loading.value = false;
  }
}

// ✅ upload ảnh “sản phẩm” = upload vào anh_chi_tiet_san_pham (set đại diện) của CTSP mới nhất
async function uploadProductImageToLatestCtspIfAny() {
  if (!imageFile.value) return;
  if (!isEdit.value) {
    toastError("Sản phẩm mới chưa có chi tiết sản phẩm. Hãy tạo CTSP trước rồi mới gắn ảnh.");
    return;
  }

  const ctspId = latestCtspId.value;
  if (!ctspId) {
    toastError("Sản phẩm chưa có chi tiết sản phẩm (CTSP). Hãy tạo CTSP trước để gắn ảnh.");
    return;
  }

  try {
    await anhChiTietSanPhamService.upload({
      idChiTietSanPham: ctspId,
      file: imageFile.value,
      laAnhDaiDien: true,
      moTa: "",
    });

    toastSuccess("Đã upload ảnh và đặt làm ảnh đại diện (CTSP).");
  } catch (e) {
    console.error(e);
    toastError("Upload ảnh thất bại. Kiểm tra API /uploads hoặc cấu hình StaticResource.");
  }
}

// ===== SUBMIT =====
async function submit() {
  try {
    const ten = String(form.tenSanPham || "").trim();
    if (!ten) return toastError("Vui lòng nhập Tên sản phẩm.");

    loading.value = true;

    const payload = {
      tenSanPham: ten,
      moTaNgan: form.moTaNgan ?? null,
      moTaChiTiet: form.moTaChiTiet ?? null,
      kinhDoanh: !!form.kinhDoanh,
      trangThaiKinhDoanh: !!form.kinhDoanh,
      xoaMem: false,
    };

    if (isEdit.value) {
      const updateFn = productService.update || productService.put || productService.edit;
      if (typeof updateFn !== "function") throw new Error("productService chưa có hàm update/put/edit");

      await updateFn(id.value, payload);

      // ✅ nếu chọn ảnh => upload vào CTSP mới nhất
      await uploadProductImageToLatestCtspIfAny();

      toastSuccess("Lưu sản phẩm thành công");
      await loadOne();
      return;
    }

    const createFn = productService.create || productService.post || productService.add;
    if (typeof createFn !== "function") throw new Error("productService chưa có hàm create/post/add");

    const createdRes = await createFn(payload);
    const created = createdRes?.data ?? createdRes;
    const createdId = created?.id ?? created?.data?.id;

    toastSuccess("Thêm sản phẩm thành công");

    if (createdId) router.push(`/admin/san-pham/${createdId}`);
    else back();
  } catch (e) {
    console.error(e);
    toastError(e?.message || "Lưu thất bại.");
  } finally {
    loading.value = false;
  }
}

onMounted(loadOne);

onBeforeUnmount(() => {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }
});
</script>

<style scoped>
.ss-page-title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.4px;
}
.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
}
.ss-btn-sm {
  border-radius: 10px;
  padding: 8px 12px;
}

.ss-image-preview {
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
.ss-image-preview img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
</style>
