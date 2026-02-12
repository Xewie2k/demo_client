<!-- File: src/pages/tai_khoan/capnhat_nhanvien.vue -->
<template>
  <div class="update_page">
    <!-- HEADER: Back + Title -->
    <div class="page-head">
      <button type="button" class="ss-btn ss-btn-back" @click="back">
        <i class="bi bi-arrow-left me-2"></i>
        Quay lại
      </button>

      <h3 class="page-title">CẬP NHẬT NHÂN VIÊN</h3>

      <div class="head-spacer"></div>
    </div>

    <div class="card ss-card">
      <form @submit.prevent="submit">
        <div class="row">
          <!-- AVATAR -->
          <div class="col-md-2 text-center">
            <div class="avatar-wrapper ss-border">
              <img v-if="nv.anhNhanVien" :src="getImageUrl(nv.anhNhanVien)" class="avatar-img" />
              <i v-else class="bi bi-person avatar-icon"></i>
            </div>

            <input type="file" accept="image/*" ref="fileInput" @change="onFileChange" hidden />

            <button type="button" class="ss-btn ss-btn-sm ss-btn-back mt-2" @click="openFilePicker">
              <i class="bi bi-camera me-2"></i>
              Chọn ảnh
            </button>
          </div>

          <!-- THÔNG TIN CÁ NHÂN -->
          <div class="col-md-5">
            <h6 class="section-title">Thông tin cá nhân</h6>

            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input class="form-control ss-input" v-model="nv.tenNhanVien" />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên tài khoản</label>
              <input class="form-control ss-input" v-model="nv.tenTaiKhoan" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control ss-input" v-model="nv.email" />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input class="form-control ss-input" v-model="nv.soDienThoai" />
            </div>

            <div class="mb-3">
              <label class="form-label">Ngày sinh</label>
              <input type="date" class="form-control ss-input" v-model="nv.ngaySinh" />
            </div>

            <div class="mb-3">
              <label class="form-label">Quyền hạn</label>
              <select class="form-control ss-input" v-model.number="nv.idQuyenHan">
                <option value="">-- Chọn quyền hạn --</option>
                <option v-for="q in listQuyenHan" :key="q.id" :value="Number(q.id)">
                  {{ mapTenQuyenHan(q.ten ?? q.tenQuyenHan ?? q.ma ?? ("Quyền " + q.id)) }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Ghi chú</label>
              <textarea
                class="form-control ss-input"
                style="height:auto; min-height: 92px; padding-top: 10px"
                v-model="nv.ghiChu"
              ></textarea>
            </div>
          </div>

          <!-- ĐỊA CHỈ -->
          <div class="col-md-5">
            <h6 class="section-title">Thông tin địa chỉ</h6>

            <div class="mb-3">
              <label class="form-label">Thành phố</label>
              <select class="form-control ss-input" v-model="nv.thanhPho">
                <option value="">Chọn thành phố</option>

                <!-- nếu DB có giá trị nhưng không nằm trong list -> vẫn hiển thị -->
                <option v-if="nv.thanhPho && !thanhphoOptions.includes(nv.thanhPho)" :value="nv.thanhPho">
                  {{ nv.thanhPho }}
                </option>

                <option v-for="tp in thanhphoOptions" :key="tp" :value="tp">{{ tp }}</option>
              </select>
            </div>

            <div class="mb-3 d-flex gap-2">
              <div class="flex-grow-1">
                <label class="form-label">Quận</label>
                <select class="form-control ss-input" v-model="nv.quan" :disabled="!nv.thanhPho">
                  <option value="">Chọn quận</option>

                  <option v-if="nv.quan && !quanOptions.includes(nv.quan)" :value="nv.quan">
                    {{ nv.quan }}
                  </option>

                  <option v-for="q in quanOptions" :key="q" :value="q">{{ q }}</option>
                </select>
              </div>

              <div class="flex-grow-1">
                <label class="form-label">Phường</label>
                <select class="form-control ss-input" v-model="nv.phuong" :disabled="!nv.quan">
                  <option value="">Chọn phường</option>

                  <option v-if="nv.phuong && !phuongOptions.includes(nv.phuong)" :value="nv.phuong">
                    {{ nv.phuong }}
                  </option>

                  <option v-for="p in phuongOptions" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Địa chỉ chi tiết</label>
              <input class="form-control ss-input" v-model="nv.diaChiCuThe" />
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="d-flex justify-content-between align-items-center mt-4 actions">
          <button type="button" class="ss-btn ss-btn-state" @click="toggleStatus">
            {{ nv.trangThai ? "Hủy hoạt động" : "Kích hoạt" }}
          </button>

          <div class="d-flex gap-2">
            <button type="submit" class="ss-btn ss-btn-primary ss-btn-submit">
              Cập nhật
            </button>

            <button type="button" class="ss-btn ss-btn-danger" @click="cancel">
              Xóa
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { detailNhanVien, removeNhanVien, updateNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService.js";
import { getAllQuyenHan } from "@/services/tai_khoan/nhan_vien/quyen_hanService.js";
import vnAddressService from "@/services/vnAddressService";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const avatarFile = ref(null);
const fileInput = ref(null);

const listQuyenHan = ref([]);
const BASE_URL = "http://localhost:8080";

/** ✅ Map mã quyền -> text hiển thị */
const mapTenQuyenHan = (raw) => {
  const v = String(raw ?? "").trim();
  if (!v) return v;

  const k = v.toUpperCase().replace(/\s+/g, "");

  if (k === "NHAN_VIEN" || k === "NHANVIEN" || k === "ROLE_NHAN_VIEN" || k === "ROLENHAN_VIEN") return "Nhân viên";
  if (k === "ADMIN" || k === "ROLE_ADMIN" || k === "ROLEADMIN") return "Admin";

  return v;
};

/** ====== VN Address list (name + code) ====== */
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const thanhphoOptions = ref([]); // ["Hà Nội", ...]
const quanOptions = ref([]); // ["Huyện Gia Lâm", ...]
const phuongOptions = ref([]); // ["Xã Dương Xá", ...]

const nv = ref({
  idQuyenHan: null,
  tenNhanVien: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  anhNhanVien: "",
  ngaySinh: "",
  ghiChu: "",
  thanhPho: "",
  quan: "",
  phuong: "",
  diaChiCuThe: "",
  cccd: "",
  trangThai: true,
});

const getImageUrl = (imageData) => {
  if (!imageData) return null;
  const s = String(imageData).trim();
  if (!s) return null;
  if (s.startsWith("data:")) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return s.startsWith("/") ? BASE_URL + s : `${BASE_URL}/${s}`;
};

const normalizeDateToInput = (v) => {
  if (!v) return "";
  const s = String(v).trim();

  // yyyy-mm-ddTHH:mm:ss...
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);

  // dd/MM/yyyy
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  return s;
};

/** unwrap response nếu BE trả {data:{...}} hoặc {content:...} */
const unwrapDetail = (data) => {
  if (!data) return null;
  if (data?.data) return unwrapDetail(data.data);
  if (data?.content && typeof data.content === "object") return data.content;
  return data;
};

/** map key snake_case -> camelCase (để fill chắc chắn) */
const mapNhanVien = (raw) => {
  const x = unwrapDetail(raw) || {};
  return {
    idQuyenHan: x.idQuyenHan ?? x.id_quyen_han ?? x.idQuyenHan ?? null,
    tenNhanVien: x.tenNhanVien ?? x.ten_nhan_vien ?? "",
    tenTaiKhoan: x.tenTaiKhoan ?? x.ten_tai_khoan ?? x.username ?? "",
    email: x.email ?? "",
    soDienThoai: x.soDienThoai ?? x.so_dien_thoai ?? x.sdt ?? "",
    anhNhanVien: x.anhNhanVien ?? x.anh_nhan_vien ?? x.avatar ?? "",
    ngaySinh: normalizeDateToInput(x.ngaySinh ?? x.ngay_sinh ?? x.dob ?? ""),
    ghiChu: x.ghiChu ?? x.ghi_chu ?? "",
    thanhPho: x.thanhPho ?? x.thanh_pho ?? x.tinh ?? "",
    quan: x.quan ?? x.quan_huyen ?? x.huyen ?? "",
    phuong: x.phuong ?? x.phuong_xa ?? x.xa ?? "",
    diaChiCuThe: x.diaChiCuThe ?? x.dia_chi_cu_the ?? x.dia_chi ?? "",
    cccd: x.cccd ?? x.canCuoc ?? x.cccd_number ?? "",
    trangThai: x.trangThai ?? x.trang_thai ?? x.active ?? true,
  };
};

const getAllQH = async () => {
  try {
    listQuyenHan.value = await getAllQuyenHan();
  } catch {
    listQuyenHan.value = [];
  }
};

/** Load danh sách tỉnh (để select có option) */
const loadProvinces = async () => {
  provinces.value = await vnAddressService.getProvinces();
  thanhphoOptions.value = (provinces.value || []).map((p) => p.name);
};

const findByName = (arr, name) => (arr || []).find((x) => (x?.name ?? "").trim() === (name ?? "").trim());

const loadDistrictsByProvinceName = async (provinceName) => {
  const p = findByName(provinces.value, provinceName);
  if (!p?.code) {
    districts.value = [];
    quanOptions.value = [];
    return;
  }
  districts.value = await vnAddressService.getDistricts(p.code);
  quanOptions.value = (districts.value || []).map((d) => d.name);
};

const loadWardsByDistrictName = async (districtName) => {
  const d = findByName(districts.value, districtName);
  if (!d?.code) {
    wards.value = [];
    phuongOptions.value = [];
    return;
  }
  wards.value = await vnAddressService.getWards(d.code);
  phuongOptions.value = (wards.value || []).map((w) => w.name);
};

const loadNhanVien = async () => {
  try {
    const raw = await detailNhanVien(id);
    const mapped = mapNhanVien(raw);

    // merge vào nv để không mất default keys
    nv.value = {
      ...nv.value,
      ...mapped,
      idQuyenHan: mapped.idQuyenHan !== null && mapped.idQuyenHan !== "" ? Number(mapped.idQuyenHan) : null,
    };

    // sau khi có thanhPho/quan/phuong => load option tương ứng để select hiển thị đúng
    await loadDistrictsByProvinceName(nv.value.thanhPho);
    await loadWardsByDistrictName(nv.value.quan);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết nhân viên:", error);
    alert("Không thể tải thông tin nhân viên!");
  }
};

const openFilePicker = () => fileInput.value?.click();

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh!");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert("Ảnh quá lớn (tối đa 2MB)!");
    return;
  }

  avatarFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    nv.value.anhNhanVien = e.target?.result; // preview base64
  };
  reader.readAsDataURL(file);
};

/** luôn gửi FormData (data) để đồng nhất */
const buildFormData = () => {
  const payload = { ...nv.value };

  // nếu đang preview base64 thì bỏ khỏi JSON
  if (typeof payload.anhNhanVien === "string" && payload.anhNhanVien.startsWith("data:")) {
    delete payload.anhNhanVien;
  }

  // ép kiểu
  payload.idQuyenHan = payload.idQuyenHan ? Number(payload.idQuyenHan) : null;
  payload.ngaySinh = payload.ngaySinh || null;
  payload.ghiChu = payload.ghiChu || null;

  const fd = new FormData();
  fd.append("data", JSON.stringify(payload));
  if (avatarFile.value) fd.append("file", avatarFile.value);
  return fd;
};

const toggleStatus = async () => {
  try {
    nv.value.trangThai = !nv.value.trangThai;
    await updateNhanVien(id, buildFormData());
    alert(nv.value.trangThai ? "Đã kích hoạt nhân viên!" : "Đã hủy kích hoạt nhân viên!");
  } catch (e) {
    console.error(e);
    alert("Cập nhật trạng thái thất bại: " + (e?.message || ""));
  }
};

const submit = async () => {
  try {
    await updateNhanVien(id, buildFormData());
    alert("Cập nhật thành công!");
    router.push("/admin/tai-khoan/nhan-vien");
  } catch (error) {
    console.error(error);
    alert("Cập nhật thất bại: " + (error?.message || ""));
  }
};

const cancel = async () => {
  try {
    await removeNhanVien(id);
    router.push("/admin/tai-khoan/nhan-vien");
  } catch (error) {
    console.error(error);
    alert("Xóa thất bại: " + (error?.message || ""));
  }
};

const back = () => router.push("/admin/tai-khoan/nhan-vien");

/** khi đổi Thành phố/Quận => load lại option & reset phần phụ thuộc */
watch(
  () => nv.value.thanhPho,
  async (newVal, oldVal) => {
    if (newVal === oldVal) return;
    nv.value.quan = "";
    nv.value.phuong = "";
    await loadDistrictsByProvinceName(newVal);
    wards.value = [];
    phuongOptions.value = [];
  }
);

watch(
  () => nv.value.quan,
  async (newVal, oldVal) => {
    if (newVal === oldVal) return;
    nv.value.phuong = "";
    await loadWardsByDistrictName(newVal);
  }
);

onMounted(async () => {
  await getAllQH();
  await loadProvinces();
  await loadNhanVien();
});
</script>

<style scoped>
/* ✅ Đồng bộ 1 font + cỡ chữ như trang Phiếu giảm giá */
.update_page {
  margin: 20px;
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
  font-size: 13px;
}

/* ✅ tuyệt đối không in đậm trong trang */
:deep(.fw-bold),
:deep(.fw-semibold),
:deep(b),
:deep(strong) {
  font-weight: 400 !important;
}

.page-head {
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* ✅ Title theo style voucher (không in đậm) */
.page-title {
  text-align: center;
  font-weight: 400 !important;
  font-size: 20px;
  letter-spacing: 0.2px;
  margin: 0;
  color: rgba(17, 24, 39, 0.9);
  text-transform: none;
}

.head-spacer {
  height: 1px;
}

/* Card + border đỏ nhạt (giữ cấu trúc, chỉnh nhẹ cho đúng vibe voucher) */
.ss-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 77, 79, 0.2) !important;
  box-shadow: none !important;
}

/* ✅ Section title không in đậm, size giống voucher */
.section-title {
  font-weight: 400 !important;
  font-size: 14px;
  margin-bottom: 14px;
  color: rgba(17, 24, 39, 0.82);
}

/* Labels giống voucher */
.form-label {
  font-weight: 400 !important;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.78);
  margin-bottom: 6px;
}

/* Inputs */
.ss-input {
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  height: 40px;
  font-size: 13px;
  font-weight: 400 !important;
  color: rgba(17, 24, 39, 0.82);
}
.ss-input:focus {
  border-color: rgba(255, 77, 79, 0.45) !important;
  box-shadow: 0 0 0 0.18rem rgba(255, 77, 79, 0.14) !important;
}

/* Textarea vẫn theo font/weight */
textarea.ss-input {
  height: auto;
  font-size: 13px;
  font-weight: 400 !important;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  overflow: hidden;
}
.ss-border {
  border: 1px solid rgba(255, 77, 79, 0.22);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-icon {
  font-size: 42px;
  color: #9ca3af;
}

/* ===== Buttons ===== */
.ss-btn {
  border-radius: 10px;
  height: 36px;
  padding: 0 14px;
  font-weight: 400 !important;
  font-size: 13px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.88);
  cursor: pointer;
  user-select: none;
  transition: 0.15s ease;
}
.ss-btn:hover {
  background: rgba(17, 24, 39, 0.04);
}

.ss-btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
}

/* Back (giữ màu đỏ nhạt) */
.ss-btn-back {
  background: rgba(255, 77, 79, 0.08);
  color: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(255, 77, 79, 0.22);
}
.ss-btn-back:hover {
  background: rgba(255, 77, 79, 0.12);
}

/* Primary */
.ss-btn-primary {
  border: none !important;
  color: #fff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

/* State */
.ss-btn-state {
  border: none !important;
  background: linear-gradient(90deg, #111827 0%, #ff4d4f 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 18px rgba(17, 24, 39, 0.12);
}
.ss-btn-state:hover {
  filter: brightness(0.98);
}

/* Danger */
.ss-btn-danger {
  border: none !important;
  background: linear-gradient(90deg, #ef4444 0%, #991b1b 100%) !important;
  color: #fff !important;
}

/* Fix nút cập nhật bị co quá nhỏ */
.ss-btn-submit {
  min-width: 118px;
}

/* Footer actions */
.actions {
  border-top: 1px solid rgba(17, 24, 39, 0.10);
  padding-top: 16px;
}
</style>
