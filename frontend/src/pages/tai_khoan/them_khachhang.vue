<!-- File: src/pages/tai_khoan/khach_hang/them_khachhang.vue -->
<template>
  <div class="taikhoan-form ss-page ss-font">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="page-title">THÊM KHÁCH HÀNG</div>
      </div>

      <div class="toolbar-right">
        <button class="btn btn-outline" @click="back" type="button">
          <i class="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <button class="btn btn-primary" :disabled="saving" @click="submit" type="button">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </div>
    </div>

    <div v-if="toast.show" class="ss-page-toast" :class="toast.type">
      <span class="material-icons-outlined ss-page-toast-ic">
        {{ toast.type === "success" ? "check_circle" : toast.type === "error" ? "error" : "info" }}
      </span>
      <div class="ss-page-toast-msg">{{ toast.msg }}</div>
      <button class="ss-page-toast-x" type="button" @click="toast.show = false">×</button>
    </div>

    <div class="card">
      <div class="row">
        <div class="col">
          <label class="label">Tên khách hàng <span class="req">*</span></label>
          <input v-model.trim="form.tenKhachHang" class="input" placeholder="Nhập tên khách hàng" />
        </div>

        <div class="col">
          <label class="label">Email <span class="req">*</span></label>
          <input v-model.trim="form.email" type="email" class="input" placeholder="example@gmail.com" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">Số điện thoại</label>
          <input v-model.trim="form.soDienThoai" class="input" placeholder="0xxx..." />
        </div>

        <div class="col">
          <label class="label">Giới tính</label>
          <select v-model="form.gioiTinh" class="input">
            <option :value="null">-- Chọn --</option>
            <option :value="true">Nam</option>
            <option :value="false">Nữ</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">Ngày sinh</label>
          <input v-model="form.ngaySinh" type="date" class="input" />
        </div>
      </div>

      <!-- ĐỊA CHỈ -->
      <div class="block">
        <div class="block-head">
          <div class="block-title">Địa chỉ (có thể thêm nhiều) <span class="req">*</span></div>

          <button class="btn btn-outline" type="button" @click="addAddress">
            <i class="fa-solid fa-plus"></i> Thêm địa chỉ
          </button>
        </div>

        <div v-for="(a, idx) in addresses" :key="a.key" class="addr-card">
          <div class="addr-top">
            <label class="radio">
              <input type="radio" name="defaultAddr" :checked="a.macDinh" @change="setDefault(idx)" />
              <span>Đặt làm mặc định</span>
            </label>

            <button
              class="btn btn-outline danger"
              type="button"
              :disabled="addresses.length === 1"
              @click="removeAddress(idx)"
            >
              <i class="fa-solid fa-trash"></i> Xóa
            </button>
          </div>

          <div class="row">
            <div class="col">
              <label class="label">Tên địa chỉ <span class="req">*</span></label>
              <input class="input" v-model.trim="a.tenDiaChi" placeholder="Ví dụ: Nhà / Công ty" />
            </div>

            <div class="col">
              <label class="label">Số nhà / Đường</label>
              <input class="input" v-model.trim="a.diaChiCuThe" placeholder="Ví dụ: 12A Nguyễn Trãi" />
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label class="label">Tỉnh/Thành</label>
              <select class="input" v-model="a.tinhCode" @change="onTinhChange(a)">
                <option value="">-- Chọn tỉnh/thành --</option>
                <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
              </select>
            </div>

            <div class="col">
              <label class="label">Quận/Huyện</label>
              <select class="input" v-model="a.huyenCode" @change="onHuyenChange(a)" :disabled="!a.tinhCode">
                <option value="">-- Chọn quận/huyện --</option>
                <option v-for="d in a.districts" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label class="label">Phường/Xã</label>
              <select class="input" v-model="a.xaCode" :disabled="!a.huyenCode">
                <option value="">-- Chọn phường/xã --</option>
                <option v-for="w in a.wards" :key="w.code" :value="w.code">{{ w.name }}</option>
              </select>
            </div>

            <div class="col">
              <label class="label">Hiển thị</label>
              <div class="preview">{{ previewAddress(a) || "---" }}</div>
            </div>
          </div>
        </div>

        <div class="hint mt">
          * Theo DB: chỉ bắt buộc <span class="hint-plain">Tên địa chỉ</span>. Các phần Tỉnh/Huyện/Xã/Số nhà có thể để trống (null).
        </div>
      </div>

      <div v-if="addrErrorMsg" class="alert error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ addrErrorMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { addKhachHang } from "@/services/tai_khoan/khach_hang/khach_hangService";
import { addDiaChiKhachHang } from "@/services/tai_khoan/khach_hang/diaChiKhachHangService";
import vnAddressService from "@/services/vnAddressService";

const router = useRouter();

const saving = ref(false);
const addrErrorMsg = ref("");

const toast = ref({
  show: false,
  type: "info",
  msg: "",
});

let toastTimer = null;
const showToast = (type, msg) => {
  toast.value = { show: true, type, msg };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const form = ref({
  tenKhachHang: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  gioiTinh: null,
  ngaySinh: "",
  trangThai: true,
});

const provinces = ref([]);

const newAddr = () => ({
  key: crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
  macDinh: false,
  tenDiaChi: "",
  tinhCode: "",
  huyenCode: "",
  xaCode: "",
  diaChiCuThe: "",
  districts: [],
  wards: [],
});

const addresses = ref([
  (() => {
    const a = newAddr();
    a.macDinh = true;
    return a;
  })(),
]);

const back = () => router.push({ name: "tai-khoan-khach-hang" });

const loadProvinces = async () => {
  provinces.value = await vnAddressService.getProvinces();
};

const onTinhChange = async (a) => {
  a.huyenCode = "";
  a.xaCode = "";
  a.wards = [];
  a.districts = a.tinhCode ? await vnAddressService.getDistricts(a.tinhCode) : [];
};

const onHuyenChange = async (a) => {
  a.xaCode = "";
  a.wards = a.huyenCode ? await vnAddressService.getWards(a.huyenCode) : [];
};

const setDefault = (idx) => addresses.value.forEach((x, i) => (x.macDinh = i === idx));

const addAddress = () => {
  const a = newAddr();
  if (!addresses.value.some((x) => x.macDinh)) a.macDinh = true;
  addresses.value.push(a);
};

const removeAddress = (idx) => {
  if (addresses.value.length === 1) return;
  const wasDefault = addresses.value[idx].macDinh;
  addresses.value.splice(idx, 1);
  if (wasDefault && addresses.value.length) addresses.value[0].macDinh = true;
};

const findName = (list, code) => list.find((x) => x.code === code)?.name || "";

const removeVietnameseTones = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

const buildUsername = (fullName) => {
  if (!fullName) return "";
  const noTone = removeVietnameseTones(fullName.trim().toLowerCase());
  const parts = noTone.split(/\s+/).filter(Boolean);
  const lastName = parts[parts.length - 1] || "";
  const initials = parts.slice(0, parts.length - 1).map((x) => x[0]).join("");
  return lastName + initials;
};

const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const previewAddress = (a) => {
  const tinhName = findName(provinces.value, a.tinhCode);
  const huyenName = findName(a.districts, a.huyenCode);
  const xaName = findName(a.wards, a.xaCode);

  return vnAddressService.buildAddressText({
    detail: a.diaChiCuThe,
    wardName: xaName,
    districtName: huyenName,
    provinceName: tinhName,
  });
};

const validate = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;

  const tenKhachHang = String(form.value.tenKhachHang || "").trim();
  const email = String(form.value.email || "").trim();
  const soDienThoai = String(form.value.soDienThoai || "").trim();

  if (!tenKhachHang) {
    return { type: "customer", msg: "Vui lòng nhập Tên khách hàng" };
  }

  if (tenKhachHang.length > 100) {
    return { type: "customer", msg: "Tên khách hàng không được vượt quá 100 ký tự" };
  }

  if (!email) {
    return { type: "customer", msg: "Vui lòng nhập Email" };
  }

  if (email.length > 100 || !emailRegex.test(email)) {
    return { type: "customer", msg: "Email không đúng định dạng hoặc vượt quá 100 ký tự" };
  }

  if (!form.value.tenTaiKhoan) {
    return { type: "customer", msg: "Vui lòng nhập Tên tài khoản" };
  }

  if (!form.value.matKhau) {
    return { type: "customer", msg: "Vui lòng nhập Mật khẩu" };
  }

  if (soDienThoai && !phoneRegex.test(soDienThoai)) {
    return { type: "customer", msg: "Số điện thoại không đúng định dạng (10 số)" };
  }

  if (!addresses.value.length) {
    return { type: "address", msg: "Vui lòng thêm ít nhất 1 địa chỉ" };
  }

  if (!addresses.value.some((x) => x.macDinh)) {
    return { type: "address", msg: "Vui lòng chọn 1 địa chỉ mặc định" };
  }

  for (let i = 0; i < addresses.value.length; i++) {
    const a = addresses.value[i];
    const tenDiaChi = String(a.tenDiaChi || "").trim();

    if (!tenDiaChi) {
      return { type: "address", msg: `Địa chỉ thứ ${i + 1}: Vui lòng nhập Tên địa chỉ` };
    }

    if (tenDiaChi.length > 255) {
      return { type: "address", msg: `Địa chỉ thứ ${i + 1}: Tên địa chỉ không được vượt quá 255 ký tự` };
    }
  }

  return null;
};

const submit = async () => {
  addrErrorMsg.value = "";
  toast.value.show = false;

  form.value.tenTaiKhoan = buildUsername(form.value.tenKhachHang);
  form.value.matKhau = generatePassword();

  const error = validate();
  if (error) {
    if (error.type === "customer") {
      showToast("error", error.msg);
    } else {
      addrErrorMsg.value = error.msg;
    }
    return;
  }

  const ok = confirm(`Xác nhận tạo khách hàng: "${form.value.tenKhachHang}" ?`);
  if (!ok) return;

  try {
    saving.value = true;

    const payloadKh = {
      tenKhachHang: String(form.value.tenKhachHang || "").trim(),
      tenTaiKhoan: form.value.tenTaiKhoan,
      matKhau: form.value.matKhau,
      email: String(form.value.email || "").trim(),
      soDienThoai: String(form.value.soDienThoai || "").trim() || null,
      gioiTinh: form.value.gioiTinh,
      ngaySinh: form.value.ngaySinh || null,
      trangThai: form.value.trangThai === true,
    };

    const created = await addKhachHang(payloadKh);
    const idKhachHang = created?.id;
    if (!idKhachHang) throw new Error("BE không trả về id khách hàng");

    const tasks = addresses.value.map(async (a) => {
      const tinhName = findName(provinces.value, a.tinhCode) || null;
      const huyenName = findName(a.districts, a.huyenCode) || null;
      const xaName = findName(a.wards, a.xaCode) || null;

      return addDiaChiKhachHang({
        idKhachHang,
        tenDiaChi: String(a.tenDiaChi || "").trim(),
        thanhPho: tinhName,
        quan: huyenName,
        phuong: xaName,
        diaChiCuThe: String(a.diaChiCuThe || "").trim() || null,
        macDinh: !!a.macDinh,
      });
    });

    await Promise.all(tasks);

    showToast("success", "Thêm khách hàng thành công!");

    setTimeout(() => {
      router.push({ name: "tai-khoan-khach-hang", query: { added: true } });
    }, 700);
  } catch (e) {
    console.log(e);
    showToast("error", e?.message || "Tạo khách hàng thất bại");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await loadProvinces();
});
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.taikhoan-form {
  background: #fff;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid rgba(255, 77, 79, 0.18);
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.08);
  margin: 20px;

  font-family: inherit !important;
  color: rgba(17, 24, 39, 0.82) !important;
  font-size: 13px !important;
  font-weight: 400 !important;
}

.taikhoan-form :deep(*:not([class*="fa-"])) {
  font-family: inherit !important;
  font-weight: 400 !important;
  color: inherit;
}

.taikhoan-form :deep(b),
.taikhoan-form :deep(strong),
.taikhoan-form :deep(.fw-bold),
.taikhoan-form :deep(.fw-semibold),
.taikhoan-form :deep(.fw-medium) {
  font-weight: 400 !important;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.88);
  letter-spacing: 0.2px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  color: rgba(17, 24, 39, 0.88);
}
.btn-outline:hover {
  background: rgba(17, 24, 39, 0.04);
}

.btn-outline.danger {
  border-color: rgba(239, 68, 68, 0.35);
  color: #b42324;
}
.btn-outline.danger:hover {
  background: rgba(239, 68, 68, 0.06);
}

.btn-primary {
  color: #ffffff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.16);
}

.card {
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  font-weight: 400;
  color: rgba(17, 24, 39, 0.82);
}
.req {
  color: #ef4444;
}

.input {
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  padding: 0 12px;
  outline: none;
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
  font-size: 13px;
  font-weight: 400;
}
.input:focus {
  border-color: rgba(255, 77, 79, 0.65);
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.12);
}

.block {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(17, 24, 39, 0.12);
}
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.block-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.88);
}

.addr-card {
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  margin-top: 12px;
}
.addr-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.radio {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(17, 24, 39, 0.78);
}
.radio input {
  transform: translateY(1px);
}

.preview {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(17, 24, 39, 0.03);
  color: rgba(17, 24, 39, 0.78);
  font-size: 13px;
  font-weight: 400;
}

.hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.55);
}
.hint.mt {
  margin-top: 10px;
}
.hint-plain {
  font-weight: 400;
}

.alert {
  margin-top: 10px;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 400;
}
.alert.error {
  background: rgba(239, 68, 68, 0.10);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.20);
}

.ss-page-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 460px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: 0 20px 40px rgba(17, 24, 39, 0.15);
  animation: slideIn 0.3s ease-out;
}

.ss-page-toast.error {
  border-color: #ef4444;
  background: #fef2f2;
}
.ss-page-toast.success {
  border-color: #22c55e;
  background: #f0fdf4;
}
.ss-page-toast.info {
  border-color: #3b82f6;
  background: #eff6ff;
}

.ss-page-toast-ic {
  font-size: 18px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-page-toast.success .ss-page-toast-ic {
  color: #16a34a;
}
.ss-page-toast.error .ss-page-toast-ic {
  color: #dc2626;
}
.ss-page-toast.info .ss-page-toast-ic {
  color: #2563eb;
}

.ss-page-toast-msg {
  font-size: 13px;
  color: #111827;
  flex: 1;
}

.ss-page-toast-x {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
}
.ss-page-toast-x:hover {
  color: #6b7280;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>