<template>
  <div class="update_page">
    <!-- HEADER: Back + Title -->
    <div class="page-head">
      <button type="button" class="ss-btn ss-btn-back" @click="back">
        <i class="bi bi-arrow-left me-2"></i>
        Quay lại
      </button>

      <h3 class="page-title">CẬP NHẬT KHÁCH HÀNG</h3>

      <div class="head-spacer"></div>
    </div>

    <div class="card ss-card">
      <form @submit.prevent="submit">
        <div class="row">
          <!-- CỘT TRÁI -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input class="form-control ss-input" v-model="kh.tenKhachHang" placeholder="Nhập họ và tên" />
            </div>

            <div class="mb-3">
              <label class="form-label">Tên tài khoản</label>
              <input class="form-control ss-input" v-model="kh.tenTaiKhoan" placeholder="Nhập tên tài khoản" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input class="form-control ss-input" type="email" v-model="kh.email" placeholder="example@email.com" />
            </div>

            <div class="mb-3">
              <label class="form-label">Mật khẩu</label>
              <input class="form-control ss-input" type="password" v-model="kh.matKhau" placeholder="Nhập mật khẩu" />
            </div>
          </div>

          <!-- CỘT PHẢI -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Giới tính</label>
              <div class="d-flex align-items-center gap-3 mt-1">
                <div class="form-check form-check-inline m-0">
                  <input class="form-check-input ss-radio" type="radio" id="nam" :value="true" v-model="kh.gioiTinh" />
                  <label class="form-check-label" for="nam">Nam</label>
                </div>

                <div class="form-check form-check-inline m-0">
                  <input class="form-check-input ss-radio" type="radio" id="nu" :value="false" v-model="kh.gioiTinh" />
                  <label class="form-check-label" for="nu">Nữ</label>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Ngày sinh</label>
              <input class="form-control ss-input" type="date" v-model="kh.ngaySinh" />
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input class="form-control ss-input" v-model="kh.soDienThoai" placeholder="Nhập số điện thoại" />
            </div>
          </div>
        </div>

        <!-- ===== ĐỊA CHỈ ===== -->
        <div class="addr-section">
          <div class="addr-head">
            <div class="addr-title">ĐỊA CHỈ (có thể thêm nhiều)</div>

            <button type="button" class="ss-btn ss-btn-outline" @click="addAddress" :disabled="loadingAddr">
              <span class="material-icons-outlined">add</span>
              Thêm địa chỉ
            </button>
          </div>

          <div v-if="loadingAddr" class="addr-loading">Đang tải địa chỉ...</div>

          <div v-else>
            <div v-if="addresses.length === 0" class="addr-empty">
              Chưa có địa chỉ. Bấm “Thêm địa chỉ”.
            </div>

            <div v-for="(a, idx) in addresses" :key="a.key" class="addr-card">
              <div class="addr-top">
                <label class="radio">
                  <input type="radio" name="defaultAddr" :checked="a.macDinh" @change="setDefault(idx)" />
                  <span>Đặt làm mặc định</span>
                </label>

                <button
                  class="ss-btn ss-btn-outline danger"
                  type="button"
                  :disabled="addresses.length === 1"
                  @click="removeAddress(idx)"
                >
                  <span class="material-icons-outlined">delete</span>
                  Xóa
                </button>
              </div>

              <div class="row addr-grid">
                <div class="col">
                  <label class="form-label">Tên địa chỉ <span class="req">*</span></label>
                  <input class="form-control ss-input" v-model.trim="a.tenDiaChi" placeholder="Ví dụ: Nhà riêng / Công ty..." />
                </div>

                <div class="col">
                  <label class="form-label">Số nhà / Đường</label>
                  <input class="form-control ss-input" v-model.trim="a.diaChiCuThe" placeholder="Ví dụ: 12A Nguyễn Trãi" />
                </div>
              </div>

              <div class="row addr-grid">
                <div class="col">
                  <label class="form-label">Tỉnh/Thành</label>
                  <select class="form-control ss-input" v-model="a.tinhCode" @change="onTinhChange(a)">
                    <option value="">-- Chọn tỉnh/thành --</option>
                    <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                  </select>
                </div>

                <div class="col">
                  <label class="form-label">Quận/Huyện</label>
                  <select class="form-control ss-input" v-model="a.huyenCode" :disabled="!a.tinhCode" @change="onHuyenChange(a)">
                    <option value="">-- Chọn quận/huyện --</option>
                    <option v-for="d in a.districts" :key="d.code" :value="d.code">{{ d.name }}</option>
                  </select>
                </div>
              </div>

              <div class="row addr-grid">
                <div class="col">
                  <label class="form-label">Phường/Xã</label>
                  <select class="form-control ss-input" v-model="a.xaCode" :disabled="!a.huyenCode">
                    <option value="">-- Chọn phường/xã --</option>
                    <option v-for="w in a.wards" :key="w.code" :value="w.code">{{ w.name }}</option>
                  </select>
                </div>

                <div class="col"></div>
              </div>

              <div class="addr-preview">
                <span class="muted">Hiển thị:</span>
                <span class="text">{{ previewAddress(a) || a.tenDiaChi || "---" }}</span>
              </div>
            </div>
          </div>

          <div v-if="addrError" class="addr-error">
            {{ addrError }}
          </div>
        </div>

        <!-- ACTION -->
        <div class="d-flex justify-content-end gap-2 mt-4 actions">
          <button type="submit" class="ss-btn ss-btn-primary ss-btn-submit" :disabled="saving">
            {{ saving ? "Đang cập nhật..." : "Cập nhật" }}
          </button>
          <button type="button" class="ss-btn ss-btn-danger" @click="cancel" :disabled="saving">
            Xóa
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { detailKhachHang, removeKhachHang, updateKhachHang } from "@/services/tai_khoan/khach_hang/khach_hangService.js";

// ✅ đúng đường dẫn bạn nói
import {
  getAllDiaChiKhachHang,
  createDiaChiKhachHang,
  updateDiaChiKhachHang,
  removeDiaChiKhachHang,
} from "@/services/tai_khoan/khach_hang/diaChiKhachHangService.js";

import vnAddressService from "@/services/vnAddressService.js";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const saving = ref(false);

// ===== KH =====
const kh = ref({
  tenKhachHang: "",
  tenTaiKhoan: "",
  gioiTinh: null,
  email: "",
  matKhau: "",
  ngaySinh: "",
  soDienThoai: "",
});

// ===== ĐỊA CHỈ =====
const provinces = ref([]);
const loadingAddr = ref(false);
const addrError = ref("");

const removedAddrIds = ref([]); // lưu các id địa chỉ bị xóa để call BE

const newAddr = () => ({
  key: crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
  id: null,
  idKhachHang: Number(id),
  tenDiaChi: "",
  thanhPho: null,
  quan: null,
  phuong: null,
  diaChiCuThe: null,
  macDinh: false,
  // dropdown state
  tinhCode: "",
  huyenCode: "",
  xaCode: "",
  districts: [],
  wards: [],
});

const addresses = ref([]);

const normalize = (v) => (v ?? "").toString().trim().toLowerCase();

// tìm code theo name (để auto set dropdown khi load từ DB: đang lưu name)
const findCodeByName = (list, name) => {
  const n = normalize(name);
  if (!n) return "";
  return list.find((x) => normalize(x.name) === n)?.code || "";
};

const findNameByCode = (list, code) => list.find((x) => x.code === code)?.name || "";

const previewAddress = (a) => {
  const tinhName = findNameByCode(provinces.value, a.tinhCode);
  const huyenName = findNameByCode(a.districts, a.huyenCode);
  const xaName = findNameByCode(a.wards, a.xaCode);
  return vnAddressService.buildAddressText({
    detail: a.diaChiCuThe,
    wardName: xaName,
    districtName: huyenName,
    provinceName: tinhName,
  });
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

const setDefault = (idx) => {
  addresses.value.forEach((x, i) => (x.macDinh = i === idx));
};

const addAddress = () => {
  const a = newAddr();
  // nếu chưa có default nào, set cái mới là default
  if (!addresses.value.some((x) => x.macDinh)) a.macDinh = true;
  addresses.value.push(a);
};

const removeAddress = (idx) => {
  if (addresses.value.length === 1) return;

  const a = addresses.value[idx];
  const wasDefault = a.macDinh;

  if (a?.id) removedAddrIds.value.push(a.id);

  addresses.value.splice(idx, 1);

  if (wasDefault && addresses.value.length) {
    addresses.value[0].macDinh = true;
  }
};

// ===== LOAD DATA =====
const loadKhachHang = async () => {
  const data = await detailKhachHang(id);
  if (data) {
    kh.value = {
      ...kh.value,
      ...data,
      ngaySinh: data.ngaySinh?.substring(0, 10),
    };
  }
};

const loadProvinces = async () => {
  provinces.value = await vnAddressService.getProvinces();
};

const hydrateDropdownForAddr = async (a) => {
  // set tỉnh theo name DB
  a.tinhCode = findCodeByName(provinces.value, a.thanhPho);
  a.districts = a.tinhCode ? await vnAddressService.getDistricts(a.tinhCode) : [];

  // set huyện theo name DB
  a.huyenCode = findCodeByName(a.districts, a.quan);
  a.wards = a.huyenCode ? await vnAddressService.getWards(a.huyenCode) : [];

  // set xã theo name DB
  a.xaCode = findCodeByName(a.wards, a.phuong);
};

const loadDiaChi = async () => {
  loadingAddr.value = true;
  addrError.value = "";
  removedAddrIds.value = [];

  try {
    const all = await getAllDiaChiKhachHang();
    const arr = Array.isArray(all) ? all : [];

    const mine = arr.filter((x) => Number(x?.idKhachHang) === Number(id));

    // sort: default trước, rồi mới nhất
    mine.sort((a, b) => {
      const da = a?.macDinh ? 1 : 0;
      const db = b?.macDinh ? 1 : 0;
      if (db !== da) return db - da;
      return (b?.id ?? 0) - (a?.id ?? 0);
    });

    addresses.value = mine.map((x) => ({
      key: String(x?.id ?? crypto?.randomUUID?.() ?? Date.now()),
      id: x?.id ?? null,
      idKhachHang: x?.idKhachHang ?? Number(id),
      tenDiaChi: x?.tenDiaChi ?? "",
      thanhPho: x?.thanhPho ?? null,
      quan: x?.quan ?? null,
      phuong: x?.phuong ?? null,
      diaChiCuThe: x?.diaChiCuThe ?? null,
      macDinh: !!x?.macDinh,
      tinhCode: "",
      huyenCode: "",
      xaCode: "",
      districts: [],
      wards: [],
    }));

    // nếu BE chưa có địa chỉ => tạo 1 dòng trống mặc định
    if (addresses.value.length === 0) {
      const a = newAddr();
      a.macDinh = true;
      addresses.value = [a];
    }

    // đảm bảo luôn có 1 default
    if (!addresses.value.some((x) => x.macDinh) && addresses.value.length) {
      addresses.value[0].macDinh = true;
    }

    // hydrate dropdown theo name đã lưu trong DB
    for (const a of addresses.value) {
      await hydrateDropdownForAddr(a);
    }
  } catch (e) {
    console.error(e);
    addrError.value = e?.message || "Không tải được địa chỉ";
  } finally {
    loadingAddr.value = false;
  }
};

// ===== VALIDATE =====
const validateAll = () => {
  // địa chỉ: DB bắt buộc ten_dia_chi
  if (!addresses.value.length) return "Vui lòng có ít nhất 1 địa chỉ";
  if (!addresses.value.some((x) => x.macDinh)) return "Vui lòng chọn 1 địa chỉ mặc định";
  for (const a of addresses.value) {
    if (!a.tenDiaChi || !a.tenDiaChi.trim()) return "Vui lòng nhập Tên địa chỉ (Nhà riêng/Công ty...)";
  }
  return "";
};

// ===== SAVE =====
const saveAddresses = async () => {
  // 1) xóa các địa chỉ đã remove
  for (const addrId of removedAddrIds.value) {
    await removeDiaChiKhachHang(addrId);
  }

  // 2) chuẩn bị payload theo DB (name fields có thể null)
  const toPayload = (a, macDinh) => {
    const tinhName = findNameByCode(provinces.value, a.tinhCode) || null;
    const huyenName = findNameByCode(a.districts, a.huyenCode) || null;
    const xaName = findNameByCode(a.wards, a.xaCode) || null;

    return {
      idKhachHang: Number(id),
      tenDiaChi: a.tenDiaChi?.trim(),
      thanhPho: tinhName,
      quan: huyenName,
      phuong: xaName,
      diaChiCuThe: a.diaChiCuThe?.trim() || null,
      macDinh: !!macDinh,
      // xoaMem: null => BE default false
    };
  };

  const defaultIdx = addresses.value.findIndex((x) => x.macDinh);
  const defaultAddr = defaultIdx >= 0 ? addresses.value[defaultIdx] : null;

  // 3) update/create các địa chỉ KHÔNG default trước (để tránh unique default)
  for (let i = 0; i < addresses.value.length; i++) {
    const a = addresses.value[i];
    if (a === defaultAddr) continue;

    const payload = toPayload(a, false);
    if (a.id) await updateDiaChiKhachHang(a.id, payload);
    else {
      const created = await createDiaChiKhachHang(payload);
      a.id = created?.id ?? a.id;
    }
  }

  // 4) lưu địa chỉ DEFAULT cuối cùng
  if (defaultAddr) {
    const payload = toPayload(defaultAddr, true);
    if (defaultAddr.id) await updateDiaChiKhachHang(defaultAddr.id, payload);
    else {
      const created = await createDiaChiKhachHang(payload);
      defaultAddr.id = created?.id ?? defaultAddr.id;
    }
  }

  removedAddrIds.value = [];
};

const submit = async () => {
  const msg = validateAll();
  if (msg) return alert(msg);

  const ok = confirm("Xác nhận cập nhật khách hàng?");
  if (!ok) return;

  try {
    saving.value = true;

    // 1) update khách hàng
    await updateKhachHang(id, {
      tenKhachHang: kh.value.tenKhachHang,
      tenTaiKhoan: kh.value.tenTaiKhoan,
      email: kh.value.email || null,
      matKhau: kh.value.matKhau,
      gioiTinh: kh.value.gioiTinh,
      ngaySinh: kh.value.ngaySinh || null,
      soDienThoai: kh.value.soDienThoai || null,
    });

    // 2) update địa chỉ
    await saveAddresses();

    alert("Cập nhật thành công!");
    router.push("/admin/tai-khoan/khach-hang");
  } catch (e) {
    console.error(e);
    alert("Cập nhật thất bại: " + (e?.message || ""));
  } finally {
    saving.value = false;
  }
};

const cancel = async () => {
  const ok = confirm("Xác nhận xóa khách hàng?");
  if (!ok) return;

  try {
    await removeKhachHang(id);
    router.push("/admin/tai-khoan/khach-hang");
  } catch (e) {
    console.error(e);
    alert("Xóa thất bại: " + (e?.message || ""));
  }
};

const back = () => router.push("/admin/tai-khoan/khach-hang");

onMounted(async () => {
  try {
    await loadProvinces();
    await loadKhachHang();
    await loadDiaChi();
  } catch (e) {
    console.error(e);
    alert("Không thể tải dữ liệu!");
  }
});
</script>

<style scoped>
.update_page {
  margin: 20px;
}

.page-head {
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.page-title {
  text-align: left;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin: 0;
  color: rgba(17, 24, 39, 0.88);
  font-size: 20px;
}

.head-spacer {
  height: 1px;
}

/* Card + border đỏ nhạt */
.ss-card {
  background: #fff;
  padding: 22px;
  border-radius: 14px;
  border: 1px solid rgba(255, 77, 79, 0.18);
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.08);
}

/* Inputs */
.ss-input {
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  height: 40px;
}
.ss-input:focus {
  border-color: rgba(255, 77, 79, 0.45) !important;
  box-shadow: 0 0 0 0.18rem rgba(255, 77, 79, 0.14) !important;
}

.ss-radio:checked {
  background-color: #ff4d4f !important;
  border-color: #ff4d4f !important;
}

/* ===== Buttons ===== */
.ss-btn {
  border-radius: 10px;
  height: 36px;
  padding: 0 14px;
  font-weight: 800;
  font-size: 13px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: none;
  cursor: pointer;
  user-select: none;
}

.ss-btn-back {
  background: rgba(255, 77, 79, 0.08);
  color: rgba(17, 24, 39, 0.88);
  border: 1px solid rgba(255, 77, 79, 0.22);
}
.ss-btn-back:hover {
  background: rgba(255, 77, 79, 0.12);
}

.ss-btn-primary {
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.14);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}

.ss-btn-danger {
  background: linear-gradient(90deg, #ef4444 0%, #991b1b 100%) !important;
  color: #fff !important;
}

.ss-btn-submit {
  min-width: 118px;
}

.actions {
  border-top: 1px solid rgba(17, 24, 39, 0.10);
  padding-top: 16px;
}

/* ===== Address UI (giữ tone đỏ/đen/trắng) ===== */
.addr-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(17, 24, 39, 0.12);
}

.addr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.addr-title {
  font-weight: 900;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.88);
  letter-spacing: 0.2px;
}

.ss-btn-outline {
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  color: rgba(17, 24, 39, 0.88);
  gap: 8px;
}
.ss-btn-outline:hover {
  background: rgba(17, 24, 39, 0.04);
}
.ss-btn-outline.danger {
  border-color: rgba(239, 68, 68, 0.35);
  color: #b42324;
}
.ss-btn-outline.danger:hover {
  background: rgba(239, 68, 68, 0.06);
}

.addr-loading {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.65);
  padding: 8px 0;
}

.addr-empty {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.65);
  padding: 10px 0;
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
  font-weight: 800;
  color: rgba(17, 24, 39, 0.78);
  font-size: 13px;
}
.radio input {
  transform: translateY(1px);
}

.addr-grid {
  margin-left: 0;
  margin-right: 0;
}

.req {
  color: #ef4444;
}

.addr-preview {
  margin-top: 8px;
  font-size: 13px;
}
.addr-preview .muted {
  color: rgba(17, 24, 39, 0.55);
  font-weight: 700;
  margin-right: 6px;
}
.addr-preview .text {
  color: rgba(17, 24, 39, 0.88);
  font-weight: 700;
}

.addr-error {
  margin-top: 10px;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 800;
  font-size: 13px;
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.20);
  color: #991b1b;
}
</style>
