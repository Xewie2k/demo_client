<!-- File: src/pages/hoa_don/HoaDonList.vue -->
<template>
  <div class="p-4 ss-page ss-font">
    <div class="d-flex align-items-end justify-content-between mb-3">
      <div>
        <div class="ss-page-title">Quản lý hóa đơn</div>
      </div>
    </div>

    <!-- Bộ Lọc -->
    <section class="ss-card ss-border mb-4">
      <div class="p-4">
        <div class="d-flex align-items-center mb-3">
          <i class="bi bi-funnel me-2"></i>
          <div class="ss-section-title">Bộ lọc</div>
        </div>

        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label ss-label">Mã hóa đơn</label>
            <input
              type="text"
              v-model="filterMaHD"
              class="form-control ss-input"
              placeholder="Nhập mã hóa đơn"
            />
          </div>

          <div class="col-md-3">
            <label class="form-label ss-label">Ngày bắt đầu</label>
            <input type="date" v-model="filterNgayBD" class="form-control ss-input" />
          </div>

          <div class="col-md-3">
            <label class="form-label ss-label">Ngày kết thúc</label>
            <input type="date" v-model="filterNgayKT" class="form-control ss-input" />
          </div>

          <div class="col-md-3">
            <label class="form-label ss-label">Loại đơn</label>
            <select v-model="filterLoaiDon" class="form-select ss-input">
              <option value="">Tất cả</option>
              <option value="0">Tại quầy</option>
              <option value="1">Giao hàng</option>
              <option value="2">Online</option>
            </select>
          </div>

          <div class="col-12 d-flex justify-content-end gap-2 mt-3 flex-wrap">
            <button
              class="btn ss-btn ss-btn-dark"
              type="button"
              @click="lamMoi"
              title="Đặt lại bộ lọc"
            >
              <span class="material-icons-outlined ss-btn-ic">restart_alt</span>
              Đặt lại bộ lọc
            </button>

            <button
              class="btn ss-btn ss-btn-lite"
              type="button"
              @click="xuatFile"
              title="Xuất Excel"
            >
              <span class="material-icons-outlined ss-btn-ic">description</span>
              Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Danh Sách Hóa Đơn -->
    <div class="ss-card ss-border">
      <div class="p-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="icon-box">
            <i class="fa-regular fa-file-lines"></i>
          </div>
          <div>
            <div class="ss-section-title">Danh sách hóa đơn</div>
            <div class="ss-section-sub">Lọc nhanh theo trạng thái</div>
          </div>
        </div>

        <!-- Tabs trạng thái -->
        <div class="order-tabs mb-3">
          <button
            v-for="tab in tabList"
            :key="tab.value"
            class="btn-tab"
            :class="{ active: tabTrangThai === tab.value }"
            type="button"
            @click="locTheoTrangThai(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="table-responsive ss-table-wrap">
          <table class="table align-middle mb-0 ss-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã hóa đơn</th>
                <th>Tên nhân viên</th>
                <th>Tên khách hàng</th>
                <th>Ngày tạo</th>
                <th class="text-end">Tổng tiền</th>
                <th>Loại đơn</th>
                <th>SĐT khách hàng</th>
                <th>Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody v-if="!loading && !pagedHoaDon.length">
              <tr>
                <td colspan="10" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>

            <tbody v-else-if="loading">
              <tr>
                <td colspan="10" class="text-center text-muted py-4">Đang tải...</td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr v-for="(hd, idx) in pagedHoaDon" :key="hd.id">
                <td class="ss-td-index">{{ (page - 1) * pageSize + idx + 1 }}</td>

                <td class="ss-td-code">{{ hd.maHD }}</td>

                <td class="ss-td-text">{{ hd.nhanVien }}</td>

                <td class="ss-td-text">{{ hd.khachHang }}</td>

                <td class="ss-td-date">{{ hd.ngayTao }}</td>

                <td class="text-end ss-td-money">
                  {{ Number(hd.tongTien || 0).toLocaleString("vi-VN") }}đ
                </td>

                <td>
                  <span
                    class="ss-pill ss-pill-type"
                    :class="
                      hd.loaiDonCode === 1
                        ? 'ss-pill-ship'
                        : hd.loaiDonCode === 2
                        ? 'ss-pill-online'
                        : 'ss-pill-store'
                    "
                  >
                    {{ hd.loaiDonLabel }}
                  </span>
                </td>

                <td class="ss-td-text">{{ hd.sdtKhachHang }}</td>

                <td>
                  <span
                    class="ss-pill ss-pill-status"
                    :style="getTrangThaiStyle(hd.trangThaiHienTai)"
                  >
                    {{
                      tabTrangThai === TRANG_THAI.CAN_HOAN_PHI &&
                      hd.trangThaiHienTai === TRANG_THAI.HUY_DON &&
                      hd.daHoanPhi === false
                        ? "Cần hoàn phí"
                        : hienTrangThai(hd.trangThaiHienTai)
                    }}
                  </span>
                </td>

                <td class="text-center">
                  <button
                    class="btn ss-icon-btn-view"
                    type="button"
                    title="Xem"
                    @click="$router.push(`/admin/hoa-don/${hd.id}`)"
                  >
                    <span class="material-icons-outlined">visibility</span>
                  </button>

                  <button
                    v-if="laAdmin() && tabTrangThai === TRANG_THAI.YEU_CAU_HUY"
                    class="btn btn-danger btn-sm ms-1"
                    type="button"
                    :disabled="xacNhanHuyLoadingId === hd.id"
                    @click="xacNhanHuyInList(hd)"
                    title="Xác nhận hủy đơn"
                  >
                    <span
                      v-if="xacNhanHuyLoadingId === hd.id"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-check-circle"></i>
                  </button>

                  <button
                    v-if="laAdmin() && tabTrangThai === TRANG_THAI.YEU_CAU_HUY"
                    class="btn btn-outline-secondary btn-sm ms-1"
                    type="button"
                    :disabled="tuChoiHuyLoadingId === hd.id"
                    @click="tuChoiHuyInList(hd)"
                    title="Từ chối yêu cầu hủy"
                  >
                    <span
                      v-if="tuChoiHuyLoadingId === hd.id"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-x-circle"></i>
                  </button>

                  <button
                    v-if="laAdmin() && tabTrangThai === TRANG_THAI.CAN_HOAN_PHI"
                    class="btn btn-success btn-sm ms-1"
                    type="button"
                    :disabled="hoanPhiLoadingId === hd.id"
                    @click="xacNhanHoanPhiInList(hd)"
                    title="Xác nhận đã hoàn tiền cho khách"
                  >
                    <span
                      v-if="hoanPhiLoadingId === hd.id"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-cash-coin"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ss-footnote mt-3">
          Hiển thị
          <span class="ss-footnote-strong">{{ filteredHoaDon.length }}</span>
          hóa đơn
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="ss-pagination-bar" v-if="!loading && filteredHoaDon.length">
      <div class="ss-pagination">
        <button class="ss-pagebtn" :disabled="page <= 1" @click="page--" title="Trang trước">
          ‹
        </button>

        <button
          v-for="p in pageButtons"
          :key="`p-${p}`"
          class="ss-pagebtn"
          :class="{ active: p === page }"
          :disabled="p === '...'"
          @click="goPage(p)"
        >
          {{ p }}
        </button>

        <button
          class="ss-pagebtn"
          :disabled="page >= totalPages"
          @click="page++"
          title="Trang sau"
        >
          ›
        </button>
      </div>

      <div class="ss-pageinfo">
        Trang <span>{{ page }}</span> / <span>{{ totalPages }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";

const API_HD = "http://localhost:8080/api/admin/hoa-don";

/* ================== DATA ================== */
const loading = ref(false);
const hoaDonList = ref([]);
const filteredHoaDon = ref([]);

/* ================== FILTER ================= */
const filterMaHD = ref("");
const filterLoaiDon = ref("");
const tabTrangThai = ref("ALL");

const today = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const filterNgayBD = ref(today());
const filterNgayKT = ref(today());

/* ================== ROLE / USER ================== */
const normalizeRole = (role) => {
  const r = String(role || "").trim().toUpperCase();
  if (r === "STAFF") return "NHAN_VIEN";
  if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";
  return r;
};

const getUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const getUserRole = () => {
  const u = getUser();
  const role =
    u?.role ||
    u?.vaiTro ||
    u?.tenVaiTro ||
    u?.tenQuyenHan ||
    u?.quyenHan?.tenQuyenHan ||
    u?.quyenHan;

  return normalizeRole(role);
};

const laAdmin = () => {
  const role = getUserRole();
  return role === "ADMIN" || role === "QUAN_LY" || role === "MANAGER";
};

const tachMaNhanVienTuChuoi = (s) => {
  const m = String(s || "").match(/NV\d{5}/i);
  return m ? m[0].toUpperCase() : null;
};

const maNhanVienToId = (ma) => {
  if (!ma) return null;
  const m = String(ma).toUpperCase();
  if (!/^NV\d{5}$/.test(m)) return null;
  const n = Number(m.slice(2));
  return Number.isNaN(n) ? null : n;
};

const getCurrentNhanVienInfo = () => {
  const u = getUser() || {};

  const toNumberId = (val) => {
    const raw = String(val ?? "").trim();
    if (!raw) return null;

    const ma = tachMaNhanVienTuChuoi(raw);
    if (ma) return maNhanVienToId(ma);

    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;

    const n = Number(digits);
    return Number.isNaN(n) || n <= 0 ? null : n;
  };

  const id =
    toNumberId(u?.idNhanVien) ??
    toNumberId(u?.nhanVienId) ??
    toNumberId(u?.id_nhan_vien) ??
    toNumberId(u?.nvId) ??
    toNumberId(u?.nv_id) ??
    toNumberId(u?.id) ??
    toNumberId(u?.userId) ??
    toNumberId(u?.uid) ??
    toNumberId(u?.maNhanVien) ??
    null;

  const ma =
    tachMaNhanVienTuChuoi(u?.maNhanVien) ||
    tachMaNhanVienTuChuoi(u?.ma_nhan_vien) ||
    (id ? `NV${String(id).padStart(5, "0")}` : null);

  const tenTaiKhoan = String(
    u?.tenTaiKhoan ??
      u?.ten_tai_khoan ??
      u?.username ??
      u?.taiKhoan ??
      u?.account ??
      ""
  ).trim();

  return {
    idNhanVien: id || null,
    maNhanVien: ma || null,
    tenTaiKhoan: tenTaiKhoan || "",
  };
};

const taoConfigHeaderNhanVien = () => {
  const info = getCurrentNhanVienInfo();
  const headers = {};

  if (info?.idNhanVien) {
    headers["X-Nhan-Vien-Id"] = String(info.idNhanVien);
    headers["X-NhanVienId"] = String(info.idNhanVien);
    headers["X-NV-ID"] = String(info.idNhanVien);
    headers["X-Employee-Id"] = String(info.idNhanVien);
  }

  if (info?.maNhanVien) headers["X-Ma-Nhan-Vien"] = String(info.maNhanVien);
  if (info?.tenTaiKhoan) headers["X-Ten-Tai-Khoan"] = String(info.tenTaiKhoan);

  return Object.keys(headers).length ? { headers } : {};
};

const canDoAdminAction = () => {
  if (!laAdmin()) {
    alert("Chỉ Admin/Quản lý mới được thực hiện thao tác này.");
    return false;
  }
  return true;
};

/* ================== TRẠNG THÁI ================== */
const TRANG_THAI = {
  CHO_XAC_NHAN: 1,
  CHO_GIAO_HANG: 2,
  DANG_VAN_CHUYEN: 3,
  DA_GIAO_HANG: 4,
  HOAN_THANH: 5,
  HUY_DON: 6,
  YEU_CAU_HUY: 7,
  CAN_HOAN_PHI: "CAN_HOAN_PHI",
};

const tabList = computed(() => {
  const base = [
    { label: "Tất cả", value: "ALL" },
    { label: "Chờ xác nhận", value: TRANG_THAI.CHO_XAC_NHAN },
    { label: "Chờ giao hàng", value: TRANG_THAI.CHO_GIAO_HANG },
    { label: "Vận chuyển", value: TRANG_THAI.DANG_VAN_CHUYEN },
    { label: "Đã giao hàng", value: TRANG_THAI.DA_GIAO_HANG },
    { label: "Hoàn thành", value: TRANG_THAI.HOAN_THANH },
    { label: "Đã hủy", value: TRANG_THAI.HUY_DON },
    { label: "⚠️ Yêu cầu hủy", value: TRANG_THAI.YEU_CAU_HUY },
  ];

  if (laAdmin()) {
    base.push({ label: "💰 Cần hoàn phí", value: TRANG_THAI.CAN_HOAN_PHI });
  }

  return base;
});

const trangThaiMap = {
  1: { label: "Chờ xác nhận", bg: "#fff7ed", color: "#c2410c" },
  2: { label: "Chờ giao hàng", bg: "#eff6ff", color: "#1d4ed8" },
  3: { label: "Đang vận chuyển", bg: "#fef3c7", color: "#92400e" },
  4: { label: "Đã giao hàng", bg: "#ecfeff", color: "#0e7490" },
  5: { label: "Hoàn thành", bg: "#dcfce7", color: "#15803d" },
  6: { label: "Đã hủy", bg: "#fee2e2", color: "#dc2626" },
  7: { label: "Yêu cầu hủy", bg: "#fff7ed", color: "#ea580c" },
};

const hienTrangThai = (code) => trangThaiMap[code]?.label || "Không xác định";

const getTrangThaiStyle = (code) => {
  const st = trangThaiMap[code];
  if (!st) {
    return {
      background: "#f3f4f6",
      color: "#374151",
      border: "1px solid #d1d5db",
    };
  }
  return {
    background: st.bg,
    color: st.color,
    border: `1px solid ${st.color}33`,
  };
};

/* ================== LOẠI ĐƠN ================== */
function toLoaiDonLabel(code) {
  const n = Number(code);
  if (n === 0) return "Tại quầy";
  if (n === 1) return "Giao hàng";
  if (n === 2) return "Online";
  return "Tại quầy";
}

/* ================== LOAD DATA ================== */
const loadHoaDon = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API_HD);

    hoaDonList.value = (res.data || [])
      .map((hd) => {
        const tongHang = Number(hd.tongTien ?? 0);
        const giamGia = Number(hd.tongTienGiam ?? 0);
        const phiShip = Number(hd.phiVanChuyen ?? 0);

        const tongThanhToan = tongHang - giamGia + phiShip;
        const loaiDonCode = Number(hd.loaiDon ?? 0);
        const ngayTaoRaw = hd.ngayTao ?? "";

        return {
          id: hd.id,
          maHD: hd.maHoaDon,
          khachHang: hd.tenKhachHang ?? "",
          sdtKhachHang: hd.soDienThoaiKhachHang ?? "",
          nhanVien: hd.tenNhanVien ?? "",
          tongTien: tongThanhToan,
          ngayTaoRaw,
          ngayTao: ngayTaoRaw ? ngayTaoRaw.substring(0, 10) : "",
          loaiDonCode,
          loaiDonLabel: toLoaiDonLabel(loaiDonCode),
          trangThaiHienTai: Number(hd.trangThaiHienTai),
          daHoanPhi: hd.daHoanPhi,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.ngayTaoRaw || a.ngayTao) - new Date(b.ngayTaoRaw || b.ngayTao)
      );

    filteredHoaDon.value = [...hoaDonList.value];
  } finally {
    loading.value = false;
  }
};

/* ================== FILTER CORE ================== */
const apDungBoLoc = () => {
  filteredHoaDon.value = hoaDonList.value.filter((hd) => {
    const ma = filterMaHD.value
      ? (hd.maHD || "").toLowerCase().includes(filterMaHD.value.toLowerCase())
      : true;

    const loai =
      filterLoaiDon.value !== ""
        ? Number(hd.loaiDonCode) === Number(filterLoaiDon.value)
        : true;

    const bd = filterNgayBD.value ? hd.ngayTao >= filterNgayBD.value : true;
    const kt = filterNgayKT.value ? hd.ngayTao <= filterNgayKT.value : true;

    const trangThai =
      tabTrangThai.value === "ALL"
        ? true
        : tabTrangThai.value === TRANG_THAI.CAN_HOAN_PHI
        ? hd.trangThaiHienTai === TRANG_THAI.HUY_DON && hd.daHoanPhi === false
        : Number(hd.trangThaiHienTai) === Number(tabTrangThai.value);

    return ma && loai && bd && kt && trangThai;
  });

  page.value = 1;
};

watch([filterMaHD, filterLoaiDon, filterNgayBD, filterNgayKT, tabTrangThai], () => {
  if (hoaDonList.value.length) apDungBoLoc();
});

/* ================== ACTION ================== */
const locTheoTrangThai = (value) => (tabTrangThai.value = value);

const lamMoi = async () => {
  filterMaHD.value = "";
  filterLoaiDon.value = "";
  filterNgayBD.value = today();
  filterNgayKT.value = today();
  tabTrangThai.value = "ALL";
  await loadHoaDon();
  apDungBoLoc();
};

const xuatFile = () => {
  if (!filteredHoaDon.value.length) return alert("❌ Không có hóa đơn để xuất");

  const data = filteredHoaDon.value.map((hd, i) => ({
    STT: i + 1,
    "Mã hóa đơn": hd.maHD,
    "Khách hàng": hd.khachHang,
    "Nhân viên": hd.nhanVien,
    "Tổng tiền": hd.tongTien,
    "Ngày tạo": hd.ngayTao,
    "Loại đơn": hd.loaiDonLabel,
    "Trạng thái":
      hd.trangThaiHienTai === TRANG_THAI.HUY_DON && hd.daHoanPhi === false
        ? "Đã hủy - Chưa hoàn phí"
        : hienTrangThai(hd.trangThaiHienTai),
    "Hoàn phí":
      hd.daHoanPhi === true ? "Đã hoàn" : hd.daHoanPhi === false ? "Chưa hoàn" : "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh sách hóa đơn");
  XLSX.writeFile(wb, "danh_sach_hoa_don.xlsx");
};

/* ================== YÊU CẦU HỦY ================== */
const xacNhanHuyLoadingId = ref(null);
const tuChoiHuyLoadingId = ref(null);

const xacNhanHuyInList = async (hd) => {
  if (!canDoAdminAction()) return;
  if (!confirm(`Xác nhận hủy đơn ${hd.maHD} theo yêu cầu khách hàng?`)) return;

  xacNhanHuyLoadingId.value = hd.id;
  try {
    const info = getCurrentNhanVienInfo();

    await axios.post(
      `${API_HD}/${hd.id}/xac-nhan-huy-theo-yeu-cau`,
      { nhanVienId: info?.idNhanVien || null },
      taoConfigHeaderNhanVien()
    );

    await loadHoaDon();
    apDungBoLoc();
  } catch (e) {
    alert(e.response?.data?.message || "Không thể xác nhận hủy đơn");
  } finally {
    xacNhanHuyLoadingId.value = null;
  }
};

const tuChoiHuyInList = async (hd) => {
  if (!canDoAdminAction()) return;

  const lyDo = prompt(`Lý do từ chối hủy đơn ${hd.maHD} (tùy chọn):`);
  if (lyDo === null) return;

  tuChoiHuyLoadingId.value = hd.id;
  try {
    const info = getCurrentNhanVienInfo();

    await axios.post(
      `${API_HD}/${hd.id}/tu-choi-huy`,
      {
        nhanVienId: info?.idNhanVien || null,
        lyDo: lyDo || null,
      },
      taoConfigHeaderNhanVien()
    );

    await loadHoaDon();
    apDungBoLoc();
  } catch (e) {
    alert(e.response?.data?.message || "Không thể từ chối yêu cầu hủy");
  } finally {
    tuChoiHuyLoadingId.value = null;
  }
};

/* ================== HOÀN PHÍ ================== */
const hoanPhiLoadingId = ref(null);

const xacNhanHoanPhiInList = async (hd) => {
  if (!canDoAdminAction()) return;
  if (!confirm(`Xác nhận đã hoàn tiền cho đơn ${hd.maHD}?`)) return;

  hoanPhiLoadingId.value = hd.id;
  try {
    const info = getCurrentNhanVienInfo();

    await axios.post(
      `${API_HD}/${hd.id}/xac-nhan-hoan-phi`,
      {
        nhanVienId: info?.idNhanVien || null,
      },
      taoConfigHeaderNhanVien()
    );

    await loadHoaDon();
    apDungBoLoc();
  } catch (e) {
    alert(e.response?.data?.message || "Không thể xác nhận hoàn phí");
  } finally {
    hoanPhiLoadingId.value = null;
  }
};

/* ================== PAGINATION ================== */
const page = ref(1);
const pageSize = ref(10);

const totalPages = computed(() =>
  Math.max(1, Math.ceil((filteredHoaDon.value.length || 0) / pageSize.value))
);

const pagedHoaDon = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredHoaDon.value.slice(start, start + pageSize.value);
});

watch(
  () => filteredHoaDon.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
  }
);

const pageButtons = computed(() => {
  const tp = totalPages.value;
  const p = page.value;

  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);

  const arr = [];
  const push = (x) => arr.push(x);

  push(1);
  if (p > 3) push("...");

  const start = Math.max(2, p - 1);
  const end = Math.min(tp - 1, p + 1);
  for (let i = start; i <= end; i++) push(i);

  if (p < tp - 2) push("...");
  push(tp);

  return arr;
});

function goPage(p) {
  if (p === "..." || typeof p !== "number") return;
  page.value = p;
}

/* ================== INIT ================== */
onMounted(async () => {
  await loadHoaDon();
  apDungBoLoc();
});
</script>

<style scoped>
.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

.ss-page {
  color: rgba(17, 24, 39, 0.82);
}

.ss-page-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.2px;
  text-transform: none;
  color: rgba(17, 24, 39, 0.9);
}
.ss-page-sub {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
  font-weight: 400;
}

.ss-card {
  background: #fff;
  border-radius: 14px;
}
.ss-border {
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06);
}

.ss-section-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.82);
}
.ss-section-sub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(17, 24, 39, 0.6);
}

.ss-label {
  font-size: 13px;
  font-weight: 400;
  color: rgba(17, 24, 39, 0.75);
  margin-bottom: 6px;
}
.ss-input {
  border-radius: 10px !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  height: 40px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(17, 24, 39, 0.88);
}
.ss-input:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55) !important;
}

.ss-btn {
  border-radius: 10px;
  padding: 8px 12px;
  font-weight: 500;
  font-size: 13px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  line-height: 1;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.ss-btn-ic {
  font-size: 18px;
  margin-right: 8px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}
.ss-btn-lite {
  background: #f3f4f6 !important;
  color: rgba(17, 24, 39, 0.88) !important;
  border: 1px solid rgba(17, 24, 39, 0.1) !important;
}
.ss-btn-lite:hover {
  background: #eef0f3 !important;
}
.ss-btn-dark {
  background: #4b5563 !important;
  color: #fff !important;
  border: none !important;
}
.ss-btn-dark:hover {
  filter: brightness(0.98);
}

.icon-box {
  width: 40px;
  height: 40px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 77, 79, 0.95);
  font-size: 18px;
}

.order-tabs {
  display: flex;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  overflow-x: auto;
}
.btn-tab {
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  padding: 8px 12px;
  font-weight: 400;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}
.btn-tab:hover {
  background: rgba(17, 24, 39, 0.04);
  border-color: rgba(17, 24, 39, 0.18);
}
.btn-tab.active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
}

.ss-table-wrap {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  overflow: hidden;
}
.ss-table {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-table thead th {
  background: #f9fafb;
  color: rgba(17, 24, 39, 0.75);
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  padding: 12px 14px;
  white-space: nowrap;
}
.ss-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  vertical-align: middle;
}
.ss-table tbody tr:hover {
  background: rgba(17, 24, 39, 0.03);
}

.ss-td-index {
  color: rgba(17, 24, 39, 0.65);
  font-weight: 400;
}
.ss-td-code {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 400;
}
.ss-td-date {
  color: rgba(17, 24, 39, 0.7);
  font-weight: 400;
}
.ss-td-text {
  color: rgba(17, 24, 39, 0.84);
  font-weight: 400;
}
.ss-td-money {
  color: rgba(17, 24, 39, 0.88);
  font-weight: 400;
}

.ss-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.1px;
  white-space: nowrap;
}
.ss-pill-status {
  min-width: 130px;
}
.ss-pill-type {
  min-width: 110px;
  border: 1px solid rgba(17, 24, 39, 0.14);
}

.ss-pill-store {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.88);
  border-color: rgba(17, 24, 39, 0.14);
}

.ss-pill-ship {
  background: rgba(255, 77, 79, 0.1);
  color: #b42324;
  border-color: rgba(255, 77, 79, 0.28);
}

.ss-pill-online {
  background: rgba(255, 77, 79, 0.08);
  color: #b42324;
  border-color: rgba(255, 77, 79, 0.22);
}

.ss-icon-btn-view {
  width: var(--ss-icon-size, 36px);
  height: var(--ss-icon-size, 36px);
  border-radius: var(--ss-icon-radius, 10px);
  border: 1px solid var(--ss-icon-border, rgba(17, 24, 39, 0.14));
  background: #fff;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ss-icon, rgba(17, 24, 39, 0.88)) !important;
  transition: 0.2s;
}
.ss-icon-btn-view .material-icons-outlined {
  font-size: 20px;
  color: inherit !important;
  line-height: 1;
}
.ss-icon-btn-view:hover {
  background: var(--ss-icon-bg-hover, rgba(17, 24, 39, 0.04));
  border-color: var(--ss-icon-border-hover, rgba(17, 24, 39, 0.18));
}

.ss-footnote {
  font-size: 12px;
  font-weight: 400;
  color: rgba(17, 24, 39, 0.6);
}
.ss-footnote-strong {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 500;
}

.ss-pagination-bar {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.ss-pagination {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-pagebtn {
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: rgba(17, 24, 39, 0.85);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s ease;
}
.ss-pagebtn:hover {
  background: rgba(17, 24, 39, 0.04);
}
.ss-pagebtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-pagebtn.active {
  border-color: rgba(255, 77, 79, 0.35);
  background: rgba(255, 77, 79, 0.08);
}
.ss-pageinfo {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-pageinfo span {
  color: rgba(17, 24, 39, 0.9);
  font-weight: 600;
}
</style>