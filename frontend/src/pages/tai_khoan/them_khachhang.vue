<!-- File: src/pages/tai_khoan/khach_hang/them_khachhang.vue -->
<template>
  <div class="taikhoan-form">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="page-title">THÊM KHÁCH HÀNG</div>
      </div>

      <div class="toolbar-right">
        <button class="btn btn-outline" @click="back">
          <i class="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <button class="btn btn-primary" :disabled="saving" @click="submit">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </div>
    </div>

    <div class="card">
      <!-- THÔNG TIN -->
      <div class="row">
        <div class="col">
          <label class="label">Tên khách hàng <span class="req">*</span></label>
          <input v-model.trim="form.tenKhachHang" class="input" placeholder="Nhập tên khách hàng" />
        </div>

        <div class="col">
          <label class="label">Tên tài khoản <span class="req">*</span></label>
          <input v-model.trim="form.tenTaiKhoan" class="input" placeholder="Ví dụ: kh_nguyenvana" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">Mật khẩu <span class="req">*</span></label>
          <input v-model="form.matKhau" type="password" class="input" placeholder="Nhập mật khẩu" />
        </div>

        <div class="col">
          <label class="label">Email</label>
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

        <div class="col">
          <label class="label">Ghi chú</label>
          <input v-model.trim="form.ghiChu" class="input" placeholder="(tuỳ chọn)" />
        </div>
      </div>

      <!-- ĐỊA CHỈ -->
      <div class="block">
        <div class="block-head">
          <div class="block-title">Địa chỉ (có thể thêm nhiều) <span class="req">*</span></div>
          <button class="btn btn-outline" type="button" @click="addAddress">
            <span class="material-icons-outlined">add</span> Thêm địa chỉ
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
              <span class="material-icons-outlined">delete</span> Xóa
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
          * Theo DB: chỉ bắt buộc <b>Tên địa chỉ</b>. Các phần Tỉnh/Huyện/Xã/Số nhà có thể để trống (null).
        </div>
      </div>

      <div v-if="errorMsg" class="alert error">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ errorMsg }}</span>
      </div>

      <div v-if="successMsg" class="alert success">
        <i class="fa-solid fa-circle-check"></i>
        <span>{{ successMsg }}</span>
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
const errorMsg = ref("");
const successMsg = ref("");

const form = ref({
  tenKhachHang: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  gioiTinh: null,
  ngaySinh: "",
  ghiChu: "",
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

const addresses = ref([(() => {
  const a = newAddr();
  a.macDinh = true;
  return a;
})()]);

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
const addAddress = () => addresses.value.push(newAddr());

const removeAddress = (idx) => {
  if (addresses.value.length === 1) return;
  const wasDefault = addresses.value[idx].macDinh;
  addresses.value.splice(idx, 1);
  if (wasDefault) addresses.value[0].macDinh = true;
};

const findName = (list, code) => list.find((x) => x.code === code)?.name || "";

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
  if (!form.value.tenKhachHang) return "Vui lòng nhập Tên khách hàng";
  if (!form.value.tenTaiKhoan) return "Vui lòng nhập Tên tài khoản";
  if (!form.value.matKhau) return "Vui lòng nhập Mật khẩu";

  if (!addresses.value.length) return "Vui lòng thêm ít nhất 1 địa chỉ";
  if (!addresses.value.some((x) => x.macDinh)) return "Vui lòng chọn 1 địa chỉ mặc định";

  for (const a of addresses.value) {
    if (!a.tenDiaChi?.trim()) return "Vui lòng nhập Tên địa chỉ cho tất cả địa chỉ";
  }
  return "";
};

const submit = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  const msg = validate();
  if (msg) return (errorMsg.value = msg);

  const ok = confirm(`Xác nhận tạo khách hàng: "${form.value.tenKhachHang}" ?`);
  if (!ok) return;

  try {
    saving.value = true;

    // 1) tạo KH
    const payloadKh = {
      tenKhachHang: form.value.tenKhachHang,
      tenTaiKhoan: form.value.tenTaiKhoan,
      matKhau: form.value.matKhau,
      email: form.value.email || null,
      soDienThoai: form.value.soDienThoai || null,
      gioiTinh: form.value.gioiTinh,
      ngaySinh: form.value.ngaySinh || null,
    };

    const created = await addKhachHang(payloadKh);
    const idKhachHang = created?.id;
    if (!idKhachHang) throw new Error("BE không trả về id khách hàng");

    // 2) tạo nhiều địa chỉ
    const tasks = addresses.value.map(async (a) => {
      const tinhName = findName(provinces.value, a.tinhCode) || null;
      const huyenName = findName(a.districts, a.huyenCode) || null;
      const xaName = findName(a.wards, a.xaCode) || null;

      return addDiaChiKhachHang({
        idKhachHang,
        tenDiaChi: a.tenDiaChi.trim(),
        thanhPho: tinhName,
        quan: huyenName,
        phuong: xaName,
        diaChiCuThe: a.diaChiCuThe?.trim() || null,
        macDinh: !!a.macDinh,
      });
    });

    await Promise.all(tasks);

    successMsg.value = "Tạo khách hàng + địa chỉ thành công!";
    setTimeout(() => back(), 350);
  } catch (e) {
    console.log(e);
    errorMsg.value = e?.message || "Tạo khách hàng thất bại";
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await loadProvinces();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.taikhoan-form{
  font-family: "Inter", sans-serif;
  background:#fff;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid rgba(255,77,79,0.18);
  box-shadow: 0 18px 50px rgba(17,24,39,0.08);
  margin: 20px;
}

.toolbar{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; }
.page-title{ font-weight: 900; font-size: 16px; color: rgba(17,24,39,0.88); letter-spacing:.3px; }

.toolbar-right{ display:flex; gap:10px; }

.btn{
  height: 36px;
  padding: 0 14px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
  border-radius: 10px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  transition: .2s;
}
.btn:disabled{ opacity:.6; cursor:not-allowed; }

.btn-outline{
  background:#fff;
  border:1px solid rgba(17,24,39,0.14);
  color: rgba(17,24,39,0.88);
}
.btn-outline:hover{ background: rgba(17,24,39,0.04); }

.btn-outline.danger{ border-color: rgba(239,68,68,0.35); color:#b42324; }
.btn-outline.danger:hover{ background: rgba(239,68,68,0.06); }

.btn-primary{
  color:#fff;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}

.card{
  border: 1px solid rgba(17,24,39,0.12);
  border-radius: 14px;
  padding: 16px;
  background:#fff;
}

.row{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.col{ display:flex; flex-direction:column; gap:6px; }

.label{ font-size: 13px; font-weight: 800; color: rgba(17,24,39,0.85); }
.req{ color:#ef4444; }

.input{
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.14);
  padding: 0 12px;
  outline: none;
  background:#F9FAFB;
  color: rgba(17,24,39,0.88);
}
.input:focus{
  background:#fff;
  border-color: rgba(255,77,79,0.65);
  box-shadow: 0 0 0 3px rgba(255,77,79,0.12);
}

.block{ margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(17,24,39,0.12); }
.block-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
.block-title{ font-weight: 900; font-size: 13px; color: rgba(17,24,39,0.88); }

.addr-card{
  border: 1px solid rgba(17,24,39,0.14);
  border-radius: 14px;
  padding: 12px;
  background:#fff;
  margin-top: 12px;
}
.addr-top{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom: 10px; }
.radio{ display:flex; align-items:center; gap:8px; font-weight: 800; color: rgba(17,24,39,0.78); font-size: 13px; }
.radio input{ transform: translateY(1px); }

.preview{
  height: 40px;
  display:flex;
  align-items:center;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.10);
  background: rgba(17,24,39,0.03);
  color: rgba(17,24,39,0.78);
  font-weight: 700;
  font-size: 13px;
}

.hint{ font-size: 12px; color: rgba(17,24,39,0.55); }
.hint.mt{ margin-top: 10px; }

.alert{
  margin-top: 10px;
  border-radius: 12px;
  padding: 10px 12px;
  display:flex;
  align-items:center;
  gap:8px;
  font-weight: 700;
  font-size: 13px;
}
.alert.error{ background:#fee2e2; color:#991b1b; }
.alert.success{ background:#dcfce7; color:#166534; }

@media (max-width: 900px){
  .row{ grid-template-columns: 1fr; }
}
</style>
