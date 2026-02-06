<template>
  <div class="p-4 ss-page">
    <div class="d-flex align-items-end justify-content-between mb-3">
      <div>
        <div class="ss-page-title">Quản lý hóa đơn</div>
        <div class="ss-page-sub">Tra cứu, lọc và theo dõi trạng thái hóa đơn</div>
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
              <option disabled value="">Loại đơn</option>
              <option>Tại cửa hàng</option>
              <option>Online</option>
            </select>
          </div>

          <div class="col-12 d-flex justify-content-end gap-2 mt-3 flex-wrap">
            <button class="btn ss-btn ss-btn-primary" type="button" @click="timKiem">
              Tìm kiếm
            </button>
            <button class="btn ss-btn ss-btn-outline" type="button" @click="lamMoi">
              Làm mới
            </button>
            <button class="btn ss-btn ss-btn-dark" type="button" @click="xuatFile">
              Xuất file
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
                <th>Tên khách hàng</th>
                <th>Tên nhân viên</th>
                <th class="text-end">Tổng tiền</th>
                <th>Ngày tạo</th>
                <th>Loại đơn</th>
                <th>SĐT khách hàng</th>
                <th>Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody v-if="!filteredHoaDon?.length">
              <tr>
                <td colspan="10" class="text-center text-muted py-4">
                  Không có dữ liệu
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr v-for="(hd, index) in filteredHoaDon" :key="hd.id">
                <td class="ss-td-index">{{ index + 1 }}</td>

                <td class="ss-td-code">{{ hd.maHD }}</td>

                <td class="ss-td-text">{{ hd.khachHang }}</td>

                <td class="ss-td-text">{{ hd.nhanVien }}</td>

                <td class="text-end fw-bold">
                  {{ hd.tongTien.toLocaleString("vi-VN") }}đ
                </td>

                <td class="ss-td-date">{{ hd.ngayTao }}</td>

                <td>
                  <span
                    class="ss-pill ss-pill-type"
                    :class="hd.loaiDon === 'Online' ? 'ss-pill-online' : 'ss-pill-store'"
                  >
                    {{ hd.loaiDon }}
                  </span>
                </td>

                <td class="ss-td-text">{{ hd.sdtKhachHang }}</td>

                <td>
                  <span
                    class="ss-pill ss-pill-status"
                    :style="getTrangThaiStyle(hd.trangThaiHienTai)"
                  >
                    {{ hienTrangThai(hd.trangThaiHienTai) }}
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ss-footnote mt-3">
          Hiển thị <b>{{ filteredHoaDon.length }}</b> hóa đơn
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";

const API_HD = "http://localhost:8080/api/admin/hoa-don";

const hoaDonList = ref([]);
const filteredHoaDon = ref([]);

const filterMaHD = ref("");
const filterLoaiDon = ref("");
const filterNgayBD = ref("");
const filterNgayKT = ref("");

const trangThaiMap = {
  CHO_XAC_NHAN: 0,
  DA_THANH_TOAN: 1,
  CHO_GIAO: 2,
  DANG_GIAO: 3,
  HOAN_THANH: 4,
};

const hienTrangThai = (value) => {
  switch (value) {
    case "CHO_XAC_NHAN":
      return "Chờ xác nhận";
    case "DA_THANH_TOAN":
      return "Đã xác nhận";
    case "CHO_GIAO":
      return "Chờ vận chuyển";
    case "DANG_GIAO":
      return "Đang giao";
    case "HOAN_THANH":
      return "Hoàn thành";
    case "HUY":
      return "Hủy";
    default:
      return "Không xác định";
  }
};

const getTrangThaiStyle = (value) => {
  switch (value) {
    case "CHO_XAC_NHAN":
      return {
        background: "rgba(255, 77, 79, 0.10)",
        color: "#b42324",
        border: "1px solid rgba(255, 77, 79, 0.28)",
      };
    case "DA_THANH_TOAN":
      return {
        background: "rgba(17, 24, 39, 0.06)",
        color: "rgba(17, 24, 39, 0.88)",
        border: "1px solid rgba(17, 24, 39, 0.14)",
      };
    case "CHO_GIAO":
      return {
        background: "#fff",
        color: "rgba(17, 24, 39, 0.86)",
        border: "1px solid rgba(255, 77, 79, 0.28)",
      };
    case "DANG_GIAO":
      return {
        background: "rgba(255, 77, 79, 0.08)",
        color: "rgba(17, 24, 39, 0.86)",
        border: "1px solid rgba(17, 24, 39, 0.14)",
      };
    case "HOAN_THANH":
      return {
        background: "rgba(255, 77, 79, 0.12)",
        color: "#111827",
        border: "1px solid rgba(255, 77, 79, 0.35)",
      };
    case "HUY":
      return {
        background: "rgba(17, 24, 39, 0.06)",
        color: "rgba(17, 24, 39, 0.72)",
        border: "1px solid rgba(17, 24, 39, 0.12)",
      };
    default:
      return {
        background: "rgba(17, 24, 39, 0.06)",
        color: "rgba(17, 24, 39, 0.72)",
        border: "1px solid rgba(17, 24, 39, 0.12)",
      };
  }
};

const xuatFile = () => {
  if (!filteredHoaDon.value || filteredHoaDon.value.length === 0) {
    alert("❌ Không có hóa đơn để xuất");
    return;
  }

  const data = filteredHoaDon.value.map((hd, index) => ({
    STT: index + 1,
    "Mã hóa đơn": hd.maHD,
    "Khách hàng": hd.khachHang,
    "Nhân viên": hd.nhanVien,
    "Tổng tiền": hd.tongTien,
    "Ngày tạo": hd.ngayTao,
    "Loại đơn": hd.loaiDon,
    "Trạng thái": hd.trangThaiHienTai,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách hóa đơn");

  XLSX.writeFile(workbook, "danh_sach_hoa_don.xlsx");
};

const loadHoaDon = async () => {
  const res = await axios.get(API_HD);

  hoaDonList.value = res.data.map((hd) => ({
    id: hd.id,
    maHD: hd.maHoaDon,
    khachHang: hd.tenKhachHang ?? "",
    sdtKhachHang: hd.soDienThoaiKhachHang ?? "",
    nhanVien: hd.idNhanVien ?? "",
    tongTien: hd.tongTien ?? 0,
    ngayTao: hd.ngayTao ? hd.ngayTao.substring(0, 10) : "",
    loaiDon: hd.loaiDon ? "Online" : "Tại cửa hàng",
    trangThaiHienTai: hd.trangThaiHienTai,
    trangThai: trangThaiMap[hd.trangThaiHienTai] ?? 0,
  }));

  filteredHoaDon.value = [...hoaDonList.value];
};

onMounted(loadHoaDon);

const timKiem = () => {
  filteredHoaDon.value = hoaDonList.value.filter((hd) => {
    const ma = filterMaHD.value ? hd.maHD.includes(filterMaHD.value) : true;
    const loai = filterLoaiDon.value ? hd.loaiDon === filterLoaiDon.value : true;
    const bd = filterNgayBD.value ? hd.ngayTao >= filterNgayBD.value : true;
    const kt = filterNgayKT.value ? hd.ngayTao <= filterNgayKT.value : true;
    return ma && loai && bd && kt;
  });
};

const lamMoi = async () => {
  filterMaHD.value = "";
  filterLoaiDon.value = "";
  filterNgayBD.value = "";
  filterNgayKT.value = "";
  await loadHoaDon();
};

const tabTrangThai = ref("ALL");

const tabList = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "CHO_XAC_NHAN" },
  { label: "Đã xác nhận", value: "DA_THANH_TOAN" },
  { label: "Chờ vận chuyển", value: "CHO_GIAO" },
  { label: "Vận chuyển", value: "DANG_GIAO" },
  { label: "Đã hoàn thành", value: "HOAN_THANH" },
  { label: "Hủy", value: "HUY" },
];

const locTheoTrangThai = (trangThai) => {
  tabTrangThai.value = trangThai;

  if (trangThai === "ALL") {
    filteredHoaDon.value = [...hoaDonList.value];
  } else {
    filteredHoaDon.value = hoaDonList.value.filter((hd) => hd.trangThaiHienTai === trangThai);
  }
};
</script>

<style scoped>
/* ===== Base ===== */
.ss-page {
  color: rgba(17, 24, 39, 0.92);
}

/* Title (đỡ chói, vừa mắt) */
.ss-page-title {
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  color: rgba(17, 24, 39, 0.92);
}
.ss-page-sub {
  margin-top: 4px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
  font-weight: 600;
}

/* Card SS */
.ss-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(255, 77, 79, 0.18);
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.08);
}

/* Section title */
.ss-section-title {
  font-weight: 900;
  font-size: 15px;
  color: rgba(17, 24, 39, 0.90);
}
.ss-section-sub {
  margin-top: 2px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.60);
}

/* Label / input */
.ss-label {
  font-size: 13px;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.70);
  margin-bottom: 6px;
}
.ss-input {
  border-radius: 12px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.88);
}
.ss-input:focus {
  box-shadow: none;
  border-color: rgba(255, 77, 79, 0.55) !important;
}

/* Buttons palette SS */
.ss-btn {
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 900;
  font-size: 13.5px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  line-height: 1;
  height: 42px;
}
.ss-btn-primary {
  border: none;
  color: #fff;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255, 77, 79, 0.14);
}
.ss-btn-primary:hover {
  filter: brightness(0.98);
}
.ss-btn-outline {
  background: #fff;
  color: rgba(17, 24, 39, 0.92);
  border: 1px solid rgba(255, 77, 79, 0.26);
}
.ss-btn-outline:hover {
  background: rgba(255, 77, 79, 0.06);
  border-color: rgba(255, 77, 79, 0.42);
}
.ss-btn-dark {
  background: rgba(17, 24, 39, 0.92);
  color: #fff;
  border: 1px solid rgba(17, 24, 39, 0.92);
}
.ss-btn-dark:hover {
  background: #111827;
}

/* Icon box (mềm hơn) */
.icon-box {
  width: 40px;
  height: 40px;
  background: rgba(255, 77, 79, 0.10);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 77, 79, 0.95);
  font-size: 18px;
}

/* Tabs */
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
  font-weight: 800;
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

/* Table wrap */
.ss-table-wrap {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

/* Table typography (vừa mắt) */
.ss-table {
  font-size: 13.5px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-table thead th {
  background: #f9fafb;
  color: rgba(17, 24, 39, 0.72);
  font-weight: 900;
  font-size: 13px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  padding: 14px 14px;
  white-space: nowrap;
}
.ss-table tbody td {
  padding: 14px 14px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  vertical-align: middle;
}
.ss-table tbody tr:hover {
  background: rgba(17, 24, 39, 0.03);
}
.ss-td-index {
  color: rgba(17, 24, 39, 0.65);
  font-weight: 700;
}
.ss-td-code {
  color: rgba(17, 24, 39, 0.92);
  font-weight: 900;
}
.ss-td-date {
  color: rgba(17, 24, 39, 0.70);
  font-weight: 700;
}
.ss-td-text {
  color: rgba(17, 24, 39, 0.84);
  font-weight: 600;
}

/* Pills */
.ss-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 900;
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
.ss-pill-online {
  background: rgba(255, 77, 79, 0.10);
  color: #b42324;
  border-color: rgba(255, 77, 79, 0.28);
}
.ss-pill-store {
  background: rgba(17, 24, 39, 0.06);
  color: rgba(17, 24, 39, 0.88);
  border-color: rgba(17, 24, 39, 0.14);
}

/* Icon mắt chuẩn SS */
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
  font-size: 18px;
  color: inherit !important;
  line-height: 1;
}
.ss-icon-btn-view:hover {
  background: var(--ss-icon-bg-hover, rgba(17, 24, 39, 0.04));
  border-color: var(--ss-icon-border-hover, rgba(17, 24, 39, 0.18));
}

/* Footnote */
.ss-footnote {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(17, 24, 39, 0.60);
}
</style>
