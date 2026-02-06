<!-- File: Demo/src/components/product/ProductFormModal.vue -->
<template>
  <div v-if="open" class="modal-backdrop-custom">
    <div class="modal-custom card shadow ss-border">
      <div
        class="card-header bg-white d-flex justify-content-between align-items-center"
        style="border-color: var(--ss-border) !important"
      >
        <div class="fw-bold">
          {{ mode === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm" }}
        </div>
        <button class="btn btn-sm btn-outline-secondary" @click="handleClose">X</button>
      </div>

      <div class="card-body">
        <div class="row g-3">
          <!-- THƯƠNG HIỆU -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Thương hiệu *</label>

            <v-select
              v-model="selectedThuongHieu"
              :options="thuongHieuOptions"
              :get-option-label="labelThuongHieu"
              placeholder="Gõ để tìm thương hiệu..."
              :clearable="true"
            >
              <template #option="opt">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-semibold">{{ opt.tenThuongHieu ?? opt.ten ?? "-" }}</span>
                  <small class="text-muted">{{ opt.maThuongHieu ?? opt.ma ?? "" }}</small>
                </div>
              </template>
            </v-select>

            <div class="mt-2">
              <small class="text-muted d-block mb-1">Hoặc nhập ID thủ công:</small>
              <input
                v-model.number="form.idThuongHieu"
                type="number"
                class="form-control"
                min="1"
                placeholder="VD: 1"
              />
            </div>
          </div>

          <!-- TÊN SP -->
          <div class="col-md-6">
            <label class="form-label fw-semibold">Tên sản phẩm *</label>
            <input v-model="form.tenSanPham" type="text" class="form-control" />
          </div>

          <!-- MÔ TẢ NGẮN -->
          <div class="col-12">
            <label class="form-label fw-semibold">Mô tả ngắn</label>
            <input v-model="form.moTaNgan" type="text" class="form-control" />
          </div>

          <!-- MÔ TẢ CHI TIẾT -->
          <div class="col-12">
            <label class="form-label fw-semibold">Mô tả chi tiết</label>
            <textarea v-model="form.moTaChiTiet" class="form-control" rows="4"></textarea>
          </div>
        </div>
      </div>

      <div
        class="card-footer bg-white d-flex justify-content-end gap-2"
        style="border-color: var(--ss-border) !important"
      >
        <button class="btn btn-outline-dark ss-btn" @click="handleClose">Huỷ</button>
        <button class="btn btn-dark ss-btn" :disabled="saving" @click="handleSave">
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { refDataService } from "@/services/refDataService";
import productService from "@/services/productService";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "create" }, // create | edit
  initial: { type: Object, default: null },
});

const emit = defineEmits(["close", "submitted"]);

const saving = ref(false);

const form = ref({
  id: null, // dùng khi edit
  idThuongHieu: null,
  tenSanPham: "",
  moTaNgan: "",
  moTaChiTiet: "",
});

// ===== danh mục
const thuongHieuOptions = ref([]);

// label an toàn nhiều kiểu field
function labelThuongHieu(x) {
  if (!x) return "";
  const ten = x.tenThuongHieu ?? x.ten ?? "";
  const ma = x.maThuongHieu ?? x.ma ?? "";
  return ma ? `${ten} (${ma})` : ten;
}

// v-select selected object (sync 2 chiều)
const selectedThuongHieu = ref(null);

// chọn -> set id
watch(selectedThuongHieu, (v) => {
  if (v?.id) form.value.idThuongHieu = Number(v.id);
});

// nhập id -> set selected (nếu tìm thấy)
watch(
  () => form.value.idThuongHieu,
  (id) => {
    if (!id) return;
    const found = thuongHieuOptions.value.find((x) => Number(x.id) === Number(id));
    if (found) selectedThuongHieu.value = found;
  }
);

// nạp options + init form
onMounted(async () => {
  await loadThuongHieu();

  // init theo mode
  hydrateFromInitial();
});

// nếu mở modal nhiều lần, cần watch initial/mode/open để fill đúng
watch(
  () => [props.open, props.mode, props.initial],
  () => {
    if (props.open) hydrateFromInitial();
  }
);

async function loadThuongHieu() {
  try {
    const res = await refDataService.getThuongHieu();
    thuongHieuOptions.value = res?.data ?? [];
  } catch (e) {
    console.error(e);
    thuongHieuOptions.value = [];
  }
}

function hydrateFromInitial() {
  if (props.mode === "edit" && props.initial) {
    form.value = {
      id: props.initial.id ?? props.initial?.id,
      idThuongHieu: props.initial.idThuongHieu ?? null,
      tenSanPham: props.initial.tenSanPham ?? "",
      moTaNgan: props.initial.moTaNgan ?? "",
      moTaChiTiet: props.initial.moTaChiTiet ?? "",
    };

    const th = thuongHieuOptions.value.find(
      (x) => Number(x.id) === Number(form.value.idThuongHieu)
    );
    selectedThuongHieu.value = th || null;
  } else {
    // create: reset
    form.value = {
      id: null,
      idThuongHieu: null,
      tenSanPham: "",
      moTaNgan: "",
      moTaChiTiet: "",
    };
    selectedThuongHieu.value = null;
  }
}

function handleClose() {
  emit("close");
}

async function handleSave() {
  // validate tối thiểu theo BE SanPhamService
  if (!form.value.idThuongHieu) return alert("Thiếu Thương hiệu (idThuongHieu)");
  if (!form.value.tenSanPham || !form.value.tenSanPham.trim()) return alert("Thiếu Tên sản phẩm");

  saving.value = true;
  try {
    const payload = {
      idThuongHieu: form.value.idThuongHieu,
      tenSanPham: form.value.tenSanPham?.trim(),
      moTaNgan: form.value.moTaNgan ?? "",
      moTaChiTiet: form.value.moTaChiTiet ?? "",
    };

    if (props.mode === "edit" && (form.value.id || props.initial?.id)) {
      const id = form.value.id ?? props.initial.id;
      await productService.update(id, payload);
    } else {
      await productService.create(payload);
    }

    emit("submitted");
    emit("close");
  } catch (e) {
    console.error(e);
    alert("Lưu thất bại.");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
/* giữ đúng font/cỡ chữ đồng nhất */
.form-label,
.form-control,
.form-select {
  font-size: 14px;
}

/* vue-select khớp bootstrap */
:deep(.vs__dropdown-toggle) {
  border-radius: 0.375rem;
  min-height: 38px;
  border-color: #dee2e6;
}
:deep(.vs__selected),
:deep(.vs__search),
:deep(.vs__dropdown-option) {
  font-size: 14px;
}

.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 700;
}

/* modal style dùng lại của bạn (nếu đã có thì không sao) */
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-custom {
  width: 880px;
  max-width: calc(100vw - 24px);
  border-radius: 14px;
  overflow: hidden;
}
</style>
