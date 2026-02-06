<!-- File: src/pages/tai_khoan/nhan_vien/them_nhanvien.vue -->
<template>
  <div class="taikhoan-form">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="page-title">THÊM TÀI KHOẢN NHÂN VIÊN</div>
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
      <!-- ẢNH -->
      <div class="block">
        <div class="block-title">Ảnh nhân viên <span class="req">*</span></div>

        <div class="avatar-row">
          <div class="avatar-preview">
            <img v-if="form.anhNhanVien" :src="form.anhNhanVien" alt="preview" />
            <div v-else class="avatar-placeholder">
              <span class="material-icons-outlined">person</span>
            </div>
          </div>

          <div class="avatar-actions">
            <input ref="fileRef" type="file" accept="image/*" class="d-none" @change="onPickFile" />
            <button class="btn btn-outline" type="button" @click="fileRef?.click()">
              <span class="material-icons-outlined">upload</span> Chọn ảnh
            </button>
            <button class="btn btn-outline" type="button" :disabled="!form.anhNhanVien" @click="clearImage">
              <span class="material-icons-outlined">close</span> Xóa ảnh
            </button>
            <div class="hint">Ảnh sẽ gửi vào field <b>anhNhanVien</b> dạng base64.</div>
          </div>
        </div>
      </div>

      <!-- THÔNG TIN -->
      <div class="row">
        <div class="col">
          <label class="label">Họ và tên <span class="req">*</span></label>
          <input v-model.trim="form.tenNhanVien" class="input" placeholder="Nhập họ và tên" />
        </div>

        <div class="col">
          <label class="label">Tên tài khoản <span class="req">*</span></label>
          <input v-model.trim="form.tenTaiKhoan" class="input" placeholder="Ví dụ: nv_admin" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">Mật khẩu <span class="req">*</span></label>
          <input v-model="form.matKhau" type="password" class="input" placeholder="Nhập mật khẩu" />
        </div>

        <div class="col">
          <label class="label">Email <span class="req">*</span></label>
          <input v-model.trim="form.email" type="email" class="input" placeholder="example@gmail.com" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">Số điện thoại <span class="req">*</span></label>
          <input v-model.trim="form.soDienThoai" class="input" placeholder="0xxx..." />
        </div>

        <div class="col">
          <label class="label">Ngày sinh</label>
          <input v-model="form.ngaySinh" type="date" class="input" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">CCCD <span class="req">*</span></label>
          <input v-model.trim="form.cccd" class="input" placeholder="012345678901" />
        </div>

        <div class="col">
          <label class="label">Trạng thái <span class="req">*</span></label>
          <select v-model="form.trangThai" class="input">
            <option :value="true">Hoạt động</option>
            <option :value="false">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      <!-- QUYỀN HẠN -->
      <div class="row">
        <div class="col">
          <label class="label">Quyền hạn <span class="req">*</span></label>
          <select v-model="form.idQuyenHan" class="input">
            <option value="">-- Chọn quyền hạn --</option>
            <option v-for="q in quyenHanOptions" :key="q.id" :value="q.id">
              {{ q.ten ?? q.tenQuyenHan ?? q.ma ?? ("Quyền " + q.id) }}
            </option>
          </select>
        </div>

        <div class="col">
          <label class="label">Ghi chú</label>
          <input v-model.trim="form.ghiChu" class="input" placeholder="(tuỳ chọn)" />
        </div>
      </div>

      <!-- ĐỊA CHỈ VN -->
      <div class="block">
        <div class="block-title">Địa chỉ <span class="req">*</span></div>

        <div class="row">
          <div class="col">
            <label class="label">Tỉnh/Thành <span class="req">*</span></label>
            <select class="input" v-model="addr.tinhCode" @change="onTinhChange">
              <option value="">-- Chọn tỉnh/thành --</option>
              <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
            </select>
          </div>

          <div class="col">
            <label class="label">Quận/Huyện <span class="req">*</span></label>
            <select class="input" v-model="addr.huyenCode" @change="onHuyenChange" :disabled="!addr.tinhCode">
              <option value="">-- Chọn quận/huyện --</option>
              <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <label class="label">Phường/Xã <span class="req">*</span></label>
            <select class="input" v-model="addr.xaCode" :disabled="!addr.huyenCode">
              <option value="">-- Chọn phường/xã --</option>
              <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
            </select>
          </div>

          <div class="col">
            <label class="label">Địa chỉ cụ thể <span class="req">*</span></label>
            <input class="input" v-model.trim="form.diaChiCuThe" placeholder="Ví dụ: 12A Nguyễn Trãi" />
          </div>
        </div>

        <div class="addr-preview">
          <span class="muted">Hiển thị:</span>
          <span class="text">{{ previewAddress }}</span>
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { addNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import vnAddressService from "@/services/vnAddressService";

const router = useRouter();

const saving = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const fileRef = ref(null);

const form = ref({
  idQuyenHan: "",
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

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const addr = ref({
  tinhCode: "",
  huyenCode: "",
  xaCode: "",
});

const quyenHanOptions = ref([]);

const back = () => router.push({ name: "tai-khoan-nhan-vien" });

const loadQuyenHan = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/admin/quyen-han");
    if (!res.ok) return;
    const data = await res.json();
    quyenHanOptions.value = Array.isArray(data) ? data : data?.content ?? [];
  } catch {
    quyenHanOptions.value = [];
  }
};

const findName = (list, code) => list.find((x) => String(x.code) === String(code))?.name || "";

const previewAddress = computed(() => {
  const tinhName = findName(provinces.value, addr.value.tinhCode);
  const huyenName = findName(districts.value, addr.value.huyenCode);
  const xaName = findName(wards.value, addr.value.xaCode);
  return (
    vnAddressService.buildAddressText({
      detail: form.value.diaChiCuThe,
      wardName: xaName,
      districtName: huyenName,
      provinceName: tinhName,
    }) || "---"
  );
});

const onTinhChange = async () => {
  addr.value.huyenCode = "";
  addr.value.xaCode = "";
  wards.value = [];
  districts.value = addr.value.tinhCode ? await vnAddressService.getDistricts(addr.value.tinhCode) : [];
};

const onHuyenChange = async () => {
  addr.value.xaCode = "";
  wards.value = addr.value.huyenCode ? await vnAddressService.getWards(addr.value.huyenCode) : [];
};

const onPickFile = (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    errorMsg.value = "Vui lòng chọn file ảnh.";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    errorMsg.value = "Ảnh quá lớn (tối đa 2MB).";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    form.value.anhNhanVien = reader.result; // base64 -> đúng field DTO
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  form.value.anhNhanVien = "";
  if (fileRef.value) fileRef.value.value = "";
};

const validate = () => {
  if (!form.value.tenNhanVien) return "Vui lòng nhập Họ và tên";
  if (!form.value.tenTaiKhoan) return "Vui lòng nhập Tên tài khoản";
  if (!form.value.matKhau) return "Vui lòng nhập Mật khẩu";
  if (!form.value.email) return "Vui lòng nhập Email";
  if (!form.value.soDienThoai) return "Vui lòng nhập Số điện thoại";
  if (!form.value.cccd) return "Vui lòng nhập CCCD";
  if (!form.value.idQuyenHan) return "Vui lòng chọn Quyền hạn";
  if (!form.value.anhNhanVien) return "Vui lòng chọn Ảnh nhân viên";

  if (!addr.value.tinhCode || !addr.value.huyenCode || !addr.value.xaCode) {
    return "Vui lòng chọn đầy đủ Tỉnh/Huyện/Xã";
  }
  if (!form.value.diaChiCuThe) return "Vui lòng nhập Địa chỉ cụ thể";

  return "";
};

const submit = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  const msg = validate();
  if (msg) {
    errorMsg.value = msg;
    return;
  }

  const ok = confirm(`Xác nhận tạo nhân viên: "${form.value.tenNhanVien}" ?`);
  if (!ok) return;

  try {
    saving.value = true;

    // map name tỉnh/huyện/xã -> đúng field DTO: thanhPho/quan/phuong
    const thanhPho = findName(provinces.value, addr.value.tinhCode);
    const quan = findName(districts.value, addr.value.huyenCode);
    const phuong = findName(wards.value, addr.value.xaCode);

    const payload = {
      idQuyenHan: Number(form.value.idQuyenHan),
      tenNhanVien: form.value.tenNhanVien,
      tenTaiKhoan: form.value.tenTaiKhoan,
      matKhau: form.value.matKhau,
      email: form.value.email,
      soDienThoai: form.value.soDienThoai,
      anhNhanVien: form.value.anhNhanVien,
      ngaySinh: form.value.ngaySinh || null,
      ghiChu: form.value.ghiChu || null,
      thanhPho,
      quan,
      phuong,
      diaChiCuThe: form.value.diaChiCuThe,
      cccd: form.value.cccd,
      trangThai: form.value.trangThai,
    };

    await addNhanVien(payload);

    successMsg.value = "Tạo nhân viên thành công!";
    setTimeout(() => back(), 300);
  } catch (e) {
    console.log(e);
    errorMsg.value = e?.message || "Tạo nhân viên thất bại";
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  provinces.value = await vnAddressService.getProvinces();
  await loadQuyenHan();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.taikhoan-form{
  font-family:"Inter",sans-serif;
  background:#fff;
  border-radius:12px;
  padding:24px;
  border:1px solid #E5E7EB;
  box-shadow:0 2px 16px rgba(0,0,0,0.04);
  margin:20px;
}
.toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;margin-bottom:16px;}
.page-title{font-weight:900;font-size:16px;color:#111827;letter-spacing:.3px;}
.toolbar-right{display:flex;gap:10px;}

.btn{
  height:36px;padding:0 14px;border:none;cursor:pointer;
  font-weight:800;font-size:13px;border-radius:10px;
  display:inline-flex;align-items:center;gap:8px;transition:.2s;
}
.btn:disabled{opacity:.6;cursor:not-allowed;}
.btn-outline{background:#fff;border:1px solid rgba(17,24,39,0.14);color:rgba(17,24,39,0.88);}
.btn-outline:hover{background:rgba(17,24,39,0.04);}
.btn-primary{
  color:#fff;
  background:linear-gradient(90deg,#ff4d4f 0%,#111827 100%);
  box-shadow:0 10px 18px rgba(255,77,79,0.16);
}

.card{border:1px solid rgba(255,77,79,0.22);border-radius:14px;padding:16px;background:#fff;}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.col{display:flex;flex-direction:column;gap:6px;}
.label{font-size:13px;font-weight:800;color:rgba(17,24,39,0.85);}
.req{color:#ef4444;}
.input{
  height:40px;border-radius:12px;border:1px solid rgba(17,24,39,0.14);
  padding:0 12px;outline:none;background:#F9FAFB;color:rgba(17,24,39,0.88);
}
.input:focus{background:#fff;border-color:rgba(255,77,79,0.65);box-shadow:0 0 0 3px rgba(255,77,79,0.12);}

.alert{margin-top:10px;border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;}
.alert.error{background:#fee2e2;color:#991b1b;}
.alert.success{background:#dcfce7;color:#166534;}

.block{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(17,24,39,0.12);}
.block-title{font-weight:900;font-size:13px;color:rgba(17,24,39,0.88);margin-bottom:10px;}

.avatar-row{display:flex;gap:14px;align-items:center;flex-wrap:wrap;}
.avatar-preview{
  width:84px;height:84px;border-radius:16px;border:1px solid rgba(17,24,39,0.14);
  background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.avatar-preview img{width:100%;height:100%;object-fit:cover;}
.avatar-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,0.04);}
.avatar-placeholder span{font-size:36px;color:rgba(17,24,39,0.55);}
.avatar-actions{display:flex;flex-direction:column;gap:8px;}
.hint{font-size:12px;color:rgba(17,24,39,0.55);max-width:520px;}
.d-none{display:none;}

.addr-preview{margin-top:8px;font-size:13px;}
.addr-preview .muted{color:rgba(17,24,39,0.55);font-weight:700;margin-right:6px;}
.addr-preview .text{color:rgba(17,24,39,0.88);font-weight:800;}

@media (max-width: 900px){ .row{grid-template-columns:1fr;} }
</style>
