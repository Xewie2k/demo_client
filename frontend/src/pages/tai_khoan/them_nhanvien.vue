<!-- File: src/pages/tai_khoan/nhan_vien/them_nhanvien.vue -->
<template>
  <div class="taikhoan-form ss-page ss-font">
    <div class="header-section">
      <h2 class="page-title">Thêm nhân viên</h2>

      <div class="toolbar-right">
        <button class="btn btn-outline" type="button" @click="back">
          <i class="fa-solid fa-arrow-left"></i> Quay lại
        </button>

        <button class="btn btn-primary" type="button" :disabled="saving" @click="submit">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </div>
    </div>

    <div class="form-card">
      <div>
        <div class="right-col-header">
          <button class="btn btn-outline btn-sm" type="button" @click="toggleScanner">
            <i class="fa-solid fa-qrcode"></i> Quét QR
          </button>
        </div>

        <div v-if="showScanner" class="scanner-overlay">
          <div class="scanner-box">
            <div class="scanner-header">
              <span>Quét mã QR CCCD</span>
              <button class="btn-close" type="button" @click="stopScanner">✕</button>
            </div>
            <div id="reader" width="600px"></div>
            <div class="scanner-hint">Đưa mã QR CCCD vào khung hình</div>
          </div>
        </div>
      </div>

      <div class="avatar-section">
        <div class="avatar-wrapper" @click="fileRef?.click()">
          <img v-if="form.anhNhanVien" :src="form.anhNhanVien" class="avatar-img" />
          <div v-else class="avatar-placeholder">
            <i class="fa-solid fa-camera"></i>
            <span>Chọn ảnh</span>
          </div>
          <input ref="fileRef" type="file" accept="image/*" class="d-none" @change="onPickFile" />
        </div>

        <div class="avatar-hint">PNG, JPG, JPEG - Tối đa 5MB</div>

        <button v-if="form.anhNhanVien" class="btn-text-red" type="button" @click.stop="clearImage">
          Xóa ảnh
        </button>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label class="label">Tên nhân viên</label>
          <input v-model.trim="form.tenNhanVien" class="input" placeholder="Nhập họ và tên" />
        </div>

        <div class="form-group">
          <label class="label">Số điện thoại</label>
          <input v-model.trim="form.soDienThoai" class="input" placeholder="Nhập số điện thoại" />
        </div>

        <div class="form-group">
          <label class="label">Email</label>
          <input v-model.trim="form.email" type="email" class="input" placeholder="Nhập địa chỉ email" />
        </div>

        <div class="form-group">
          <label class="label">Tỉnh/Thành phố</label>
          <select class="input select" v-model="addr.tinhCode" @change="timTinh">
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Quận/Huyện</label>
          <select class="input select" v-model="addr.huyenCode" @change="timHuyen" :disabled="!addr.tinhCode">
            <option value="">-- Chọn Quận/Huyện --</option>
            <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Xã/Phường</label>
          <select class="input select" v-model="addr.xaCode" :disabled="!addr.huyenCode">
            <option value="">-- Chọn Xã/Phường --</option>
            <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Địa chỉ cụ thể</label>
          <input v-model.trim="form.diaChiCuThe" class="input" placeholder="Số nhà, tên đường..." />
        </div>

        <div class="form-group">
          <label class="label">Ngày sinh</label>
          <input v-model="form.ngaySinh" type="date" class="input" />
        </div>

        <div class="form-group">
          <label class="label">Quyền hạn <span class="req">*</span></label>
          <select v-model="form.idQuyenHan" class="input select">
            <option value="">-- Chọn quyền hạn --</option>
            <option v-for="q in quyenHanOptions" :key="q.id" :value="q.id">
              {{ mapTenQuyenHan(q.ten ?? q.tenQuyenHan ?? q.ma ?? ("Quyền " + q.id)) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Ghi chú</label>
          <input v-model="form.ghiChu" class="input" placeholder="Ghi chú thêm..." />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Html5QrcodeScanner } from "html5-qrcode";
import { addNhanVien } from "@/services/tai_khoan/nhan_vien/nhan_vienService";
import vnAddressService from "@/services/vnAddressService";
import emailjs from "@emailjs/browser";

const router = useRouter();
const saving = ref(false);
const fileRef = ref(null);

const EMAILJS_PUBLIC_KEY = "D-LHcLlAo_N5Vc5Kc";
emailjs.init(EMAILJS_PUBLIC_KEY);

/** ✅ Map mã quyền -> text hiển thị */
const mapTenQuyenHan = (raw) => {
  const v = String(raw ?? "").trim();
  if (!v) return v;

  const k = v.toUpperCase().replace(/\s+/g, "");

  if (k === "NHAN_VIEN" || k === "NHANVIEN" || k === "ROLE_NHAN_VIEN" || k === "ROLENHAN_VIEN") return "Nhân viên";
  if (k === "ADMIN" || k === "ROLE_ADMIN" || k === "ROLEADMIN") return "Admin";

  return v;
};

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
  diaChiCuThe: "",
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

const timTinh = async () => {
  addr.value.huyenCode = "";
  addr.value.xaCode = "";
  wards.value = [];
  districts.value = addr.value.tinhCode ? await vnAddressService.getDistricts(addr.value.tinhCode) : [];
};

const timHuyen = async () => {
  addr.value.xaCode = "";
  wards.value = addr.value.huyenCode ? await vnAddressService.getWards(addr.value.huyenCode) : [];
};

const onPickFile = (e) => {
  const file = e?.target?.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    form.value.anhNhanVien = reader.result;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  form.value.anhNhanVien = "";
  if (fileRef.value) fileRef.value.value = "";
};

const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const buildUsername = (fullName) => {
  if (!fullName) return "";
  const noTone = removeVietnameseTones(fullName.trim().toLowerCase());
  const parts = noTone.split(/\s+/);
  const lastName = parts[parts.length - 1];
  const initials = parts.slice(0, parts.length - 1).map((x) => x[0]).join("");
  return lastName + initials;
};

const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

/* ===== QR SCAN ===== */
const showScanner = ref(false);
let scanner = null;

const normalizeString = (str) => {
  if (!str) return "";
  let s = removeVietnameseTones(String(str).trim().toLowerCase());
  s = s.replace(/(tinh|thanh pho|tp|huyen|quan|thi xa|xa|phuong|thi tran)\s+/g, "").trim();
  s = s.replace(/\s+/g, " ");
  return s;
};

const diachicccd = (list, nameToFind) => {
  if (!nameToFind || !Array.isArray(list) || list.length === 0) return null;
  const target = normalizeString(nameToFind);

  let found = list.find((item) => normalizeString(item.name) === target);
  if (!found) {
    found = list.find(
      (item) =>
        normalizeString(item.name).includes(target) || target.includes(normalizeString(item.name))
    );
  }
  return found ? found.code : null;
};

const CCCDScan = async (text) => {
  const parts = text.split("|");
  if (parts.length < 6) throw new Error("Format CCCD không đúng");

  // parts[2]: Họ tên, parts[3]: DOB ddMMyyyy, parts[5]: địa chỉ
  form.value.tenNhanVien = parts[2] || form.value.tenNhanVien;
  form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);

  const rawDob = parts[3];
  if (rawDob && rawDob.length === 8) {
    form.value.ngaySinh = `${rawDob.slice(4)}-${rawDob.slice(2, 4)}-${rawDob.slice(0, 2)}`;
  }

  const fullAddress = parts[5] || "";
  const addrParts = fullAddress.split(",").map((s) => s.trim()).filter(Boolean);

  const tinhName = addrParts.length > 0 ? addrParts[addrParts.length - 1] : "";
  const huyenName = addrParts.length > 1 ? addrParts[addrParts.length - 2] : "";
  const xaName = addrParts.length > 2 ? addrParts[addrParts.length - 3] : "";

  const specificAddr = addrParts.slice(0, Math.max(addrParts.length - 3, 0)).join(", ");
  form.value.diaChiCuThe = specificAddr || fullAddress;

  if (tinhName) {
    const tinhCode = diachicccd(provinces.value, tinhName);
    if (tinhCode) {
      addr.value.tinhCode = tinhCode;
      await timTinh();

      if (huyenName) {
        const huyenCode = diachicccd(districts.value, huyenName);
        if (huyenCode) {
          addr.value.huyenCode = huyenCode;
          await timHuyen();

          if (xaName) {
            const xaCode = diachicccd(wards.value, xaName);
            if (xaCode) addr.value.xaCode = xaCode;
          }
        }
      }
    }
  }
};

const jsonScan = async (data) => {
  if (!data || typeof data !== "object") throw new Error("JSON không hợp lệ");

  if (data.tenNhanVien) form.value.tenNhanVien = data.tenNhanVien;
  if (data.email) form.value.email = data.email;
  if (data.soDienThoai) form.value.soDienThoai = data.soDienThoai;
  if (data.ngaySinh) form.value.ngaySinh = data.ngaySinh;
  if (data.ghiChu) form.value.ghiChu = data.ghiChu;
  if (data.diaChiCuThe) form.value.diaChiCuThe = data.diaChiCuThe;

  if (form.value.tenNhanVien) {
    form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);
  }

  if (data.thanhPho) {
    const tinhCode = diachicccd(provinces.value, data.thanhPho);
    if (tinhCode) {
      addr.value.tinhCode = tinhCode;
      await timTinh();

      if (data.quan) {
        const huyenCode = diachicccd(districts.value, data.quan);
        if (huyenCode) {
          addr.value.huyenCode = huyenCode;
          await timHuyen();

          if (data.phuong) {
            const xaCode = diachicccd(wards.value, data.phuong);
            if (xaCode) addr.value.xaCode = xaCode;
          }
        }
      }
    }
  }
};

const onScanSuccess = async (decodedText) => {
  try {
    if (String(decodedText).includes("|")) {
      await CCCDScan(decodedText);
    } else {
      const data = JSON.parse(decodedText);
      await jsonScan(data);
    }

    alert("Quét dữ liệu thành công!");
    stopScanner();
  } catch (e) {
    console.error("Lỗi xử lý dữ liệu:", e);
    alert("Dữ liệu không hợp lệ hoặc lỗi hệ thống địa chỉ.");
  }
};

const toggleScanner = async () => {
  showScanner.value = !showScanner.value;

  if (showScanner.value) {
    await nextTick();
    scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(onScanSuccess, () => {});
  } else {
    stopScanner();
  }
};

const stopScanner = () => {
  if (scanner) {
    scanner.clear().catch(console.error);
    scanner = null;
  }
  showScanner.value = false;
};

onBeforeUnmount(() => {
  stopScanner();
});

/* ===== EMAIL ===== */
const sendEmail = async ({ tenNhanVien, tenTaiKhoan, matKhau, email }) => {
  try {
    const serviceID = "service_n03lqrf";
    const templateID = "template_1gy88ic";

    const templateParams = {
      to_email: email,
      to_name: tenNhanVien,
      username: tenTaiKhoan,
      password: matKhau,
    };

    const response = await emailjs.send(serviceID, templateID, templateParams);
    console.log("Email gửi thành công!", response.status, response.text);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
  }
};

const validate = () => {
  if (!form.value.tenNhanVien) return "Chưa nhập tên nhân viên";
  if (!form.value.email) return "Chưa nhập email";
  if (!form.value.soDienThoai) return "Chưa nhập số điện thoại";
  if (!form.value.idQuyenHan) return "Chưa chọn quyền hạn";
  if (!addr.value.tinhCode || !addr.value.huyenCode || !addr.value.xaCode) return "Chưa chọn địa chỉ đầy đủ";
  return "";
};

const submit = async () => {
  form.value.tenTaiKhoan = buildUsername(form.value.tenNhanVien);
  form.value.matKhau = generatePassword();

  const msg = validate();
  if (msg) {
    alert(msg);
    return;
  }

  try {
    saving.value = true;

    const payload = {
      ...form.value,
      idQuyenHan: Number(form.value.idQuyenHan),
      thanhPho: findName(provinces.value, addr.value.tinhCode),
      quan: findName(districts.value, addr.value.huyenCode),
      phuong: findName(wards.value, addr.value.xaCode),
    };

    await addNhanVien(payload);

    await sendEmail({
      tenNhanVien: form.value.tenNhanVien,
      tenTaiKhoan: form.value.tenTaiKhoan,
      matKhau: form.value.matKhau,
      email: form.value.email,
    });

    alert("Thêm nhân viên thành công!");
    back();
  } catch (e) {
    alert(e?.message || "Lỗi hệ thống");
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
/* ✅ Không import font ngoài – dùng font chung của dự án */
.taikhoan-form{
  font-family: inherit;
  max-width: 1000px;
  margin: 20px auto;
  color: rgba(17,24,39,0.82);
}

/* ===== Header ===== */
.header-section{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 12px;
  margin-bottom: 12px;
}

.page-title{
  font-size: 20px;
  font-weight: 500;
  color: rgba(17,24,39,0.88);
  margin: 0;
}

.toolbar-right{
  display:flex;
  gap: 10px;
  align-items:center;
}

/* ===== Card ===== */
.form-card{
  background:#fff;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid rgba(255,77,79,0.18);
  box-shadow: 0 18px 50px rgba(17,24,39,0.08);
}

/* ===== QR header ===== */
.right-col-header{
  display:flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

/* ===== Buttons ===== */
.btn{
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(17,24,39,0.14);
  background:#fff;
  color: rgba(17,24,39,0.88);
  font-size: 13px;
  font-weight: 400;
  display:inline-flex;
  align-items:center;
  gap: 8px;
  cursor:pointer;
  transition: 0.15s ease;
}
.btn:hover{ background: rgba(17,24,39,0.04); }
.btn:disabled{ opacity:.6; cursor:not-allowed; }

.btn-primary{
  border: none;
  color:#fff !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}
.btn-primary:hover{ filter: brightness(0.98); }

.btn-outline{
  background:#fff;
  border:1px solid rgba(17,24,39,0.14);
  color: rgba(17,24,39,0.88);
}

.btn.btn-sm{
  padding: 0 12px;
}

.btn-text-red{
  background: none;
  border: none;
  color: #ef4444;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  margin-top: 6px;
}

/* ===== Avatar ===== */
.avatar-section{
  display:flex;
  flex-direction: column;
  align-items:center;
  margin: 10px 0 18px;
}

.avatar-wrapper{
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(17,24,39,0.03);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  overflow:hidden;
  position: relative;
  transition: 0.15s ease;
  border: 1px solid rgba(17,24,39,0.14);
}
.avatar-wrapper:hover{
  background: rgba(17,24,39,0.04);
}

.avatar-img{ width:100%; height:100%; object-fit: cover; }

.avatar-placeholder{
  display:flex;
  flex-direction: column;
  align-items:center;
  gap: 6px;
  color: rgba(17,24,39,0.45);
}
.avatar-placeholder i{ font-size: 20px; }
.avatar-placeholder span{ font-size: 12px; font-weight: 400; }

.avatar-hint{
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(17,24,39,0.55);
}

/* ===== Form grid ===== */
.form-grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 18px;
  row-gap: 14px;
}

.form-group{
  display:flex;
  flex-direction: column;
  gap: 6px;
}

.label{
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.82);
  display:flex;
  align-items:center;
  justify-content: space-between;
}

.req{ color:#ef4444; }

.input{
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(17,24,39,0.14);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(17,24,39,0.82);
  background: #fff !important;
  outline: none;
  transition: 0.15s ease;
}
.input:focus{
  border-color: rgba(255,77,79,0.45);
  box-shadow: 0 0 0 0.18rem rgba(255,77,79,0.14);
}

.select{
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 1em;
  padding-right: 34px;
}

/* ===== Scanner overlay ===== */
.scanner-overlay{
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(17,24,39,0.45);
  display:flex;
  justify-content:center;
  align-items:center;
}

.scanner-box{
  background:#fff;
  border-radius: 14px;
  width: 92%;
  max-width: 420px;
  border: 1px solid rgba(17,24,39,0.14);
  box-shadow: 0 18px 50px rgba(17,24,39,0.18);
  padding: 14px;
}

.scanner-header{
  display:flex;
  justify-content: space-between;
  align-items:center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(17,24,39,0.88);
}

.btn-close{
  border: 1px solid rgba(17,24,39,0.14);
  background:#fff;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  color: rgba(17,24,39,0.88);
  transition: 0.15s ease;
}
.btn-close:hover{ background: rgba(17,24,39,0.04); }

.scanner-hint{
  text-align:center;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(17,24,39,0.55);
}

.d-none{ display:none; }

@media (max-width: 768px){
  .form-grid{ grid-template-columns: 1fr; }
}
</style>
