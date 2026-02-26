<template>
  <div class="order-page p-4 ss-page ss-font">
    <!-- HEADER -->
    <div class="order-header mb-4">
      <div>
        <h5 class="fw-bold mb-1">Chi tiết đơn hàng</h5>
        <div class="text-muted small">
          Mã đơn hàng: <b>{{ selectedHD.maHD }}</b> | Ngày tạo:
          {{ selectedHD.ngayTao }}
        </div>
      </div>

      <button class="btn btn-secondary btn-sm" @click="quayLai">
        <i class="bi bi-arrow-left"></i> Quay lại danh sách
      </button>
    </div>

    <div class="row g-4">
      <!-- CỘT TRÁI -->
      <div class="col-lg-8">
        <!-- TRẠNG THÁI -->

        <div class="card ss-card mb-4">
          <div class="card-body">
            <!-- HEADER + BUTTON -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">
                <i class="bi bi-truck me-1"></i>
                Trạng thái đơn hàng
              </h6>

              <button class="btn btn-history" @click="moModalLichSu">
                <i class="bi bi-clock-history me-1"></i>
                Lịch sử thao tác
              </button>
            </div>

            <!-- TIMELINE -->
            <div class="ss-status mt-3">
              <div
                v-for="st in trangThaiHienThi"
                :key="st.value"
                class="ss-step"
                :class="{
                  done: st.value < selectedHD.trangThai,
                  active: st.value === selectedHD.trangThai,
                }"
              >
                <div class="ss-icon">
                  <i :class="`bi ${st.icon}`"></i>
                </div>
                <span>{{ st.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- THÔNG TIN KHÁCH HÀNG -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="card ss-card">
              <div class="card-body">
                <h6 class="fw-bold mb-3">
                  <i class="bi bi-person me-1"></i> Thông tin khách hàng
                </h6>

                <div class="ss-info">
                  <span>Tên khách hàng</span>
                  <b>{{ selectedHD.tenKhachHang || "—" }}</b>
                </div>

                <div class="ss-info">
                  <span>Số điện thoại</span>
                  <b>{{ selectedHD.sdt || "—" }}</b>
                </div>

                <div class="ss-info">
                  <span>Email</span>
                  <b>{{ selectedHD.email || "—" }}</b>
                </div>
              </div>
            </div>
          </div>

          <!-- THÔNG TIN GIAO HÀNG -->
          <div class="col-md-6">
            <div class="card ss-card">
              <div class="card-body">
                <h6 class="fw-bold mb-3">
                  <i class="bi bi-geo-alt me-1"></i> Thông tin giao hàng
                </h6>

                <div class="ss-info">
                  <span>Địa chỉ</span>
                  <b>{{ selectedHD.diaChi || "—" }}</b>
                </div>

                <div class="ss-info">
                  <span>Loại đơn</span>
                  <b>{{ loaiDonText }}</b>
                </div>

                <div class="ss-info">
                  <span>Ghi chú</span>
                  <b>{{ selectedHD.ghiChu || "—" }}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- DANH SÁCH SẢN PHẨM -->
        <div class="card ss-card">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-box-seam me-1"></i>
              Danh sách sản phẩm ({{ selectedHD.sanPham.length }})
            </h6>

            <table class="table table-bordered align-middle">
              <thead class="table-light text-center">
                <tr>
                  <th style="width: 60px">STT</th>
                  <th>Mã sản phẩm</th>
                  <th>Tên sản phẩm</th>
                  <th>Kích cỡ</th>
                  <th>Màu sắc</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(sp, index) in selectedHD.sanPham"
                  :key="sp.id"
                  class="text-center"
                >
                  <td>{{ index + 1 }}</td>

                  <td class="fw-medium">
                    {{ sp.maSanPham }}
                  </td>

                  <td class="text-start">
                    {{ sp.tenSanPham }}
                  </td>

                  <td>{{ sp.size }}</td>

                  <td>{{ sp.mauSac }}</td>

                  <td>{{ sp.soLuong }}</td>

                  <td>{{ sp.donGia.toLocaleString("vi-VN") }} đ</td>

                  <td class="text-danger fw-medium">
                    {{ sp.thanhTien.toLocaleString("vi-VN") }} đ
                  </td>
                </tr>

                <tr
                  v-if="!selectedHD.sanPham || selectedHD.sanPham.length === 0"
                >
                  <td colspan="8" class="text-center text-muted">
                    Không có sản phẩm
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CỘT PHẢI -->
      <div class="col-lg-4">
        <div class="sticky-summary">
          <div class="card ss-card mb-3">
            <div class="card-body">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-wallet2 me-1"></i> Tổng kết thanh toán
              </h6>

              <div class="ss-money">
                <span>Tổng tiền hàng</span>
                <b>{{ hoaDon.tongTien.toLocaleString() }} đ</b>
              </div>

              <div class="ss-money">
                <span>Giảm giá</span>
                <b class="text-success">
                  - {{ hoaDon.giamGia.toLocaleString() }} đ
                </b>
              </div>

              <div class="ss-money">
                <span>Phí vận chuyển</span>
                <b>+ {{ hoaDon.phiVanChuyen.toLocaleString() }} đ</b>
              </div>

              <hr />

              <div class="ss-total">
                <span>TỔNG TIỀN</span>
                <b>{{ hoaDon.canThanhToan.toLocaleString() }} đ</b>
              </div>
            </div>
          </div>

          <div class="card ss-card mt-3">
            <div class="card-body payment-history-card">
              <h6 class="fw-bold mb-3">
                <i class="bi bi-clock-history me-1"></i>
                Lịch sử thanh toán
              </h6>

              <div v-if="lichSuThanhToan.length === 0" class="empty-history">
                Chưa có lịch sử thanh toán
              </div>

              <div
                v-for="(item, index) in lichSuThanhToan"
                :key="index"
                class="d-flex justify-content-between border-bottom py-2"
              >
                <!-- Cột bên trái: loại thanh toán -->
                <div class="fw-bold">{{ item.loai }}</div>

                <!-- Cột bên phải: số tiền + thời gian ở dưới -->
                <div class="text-end">
                  <div class="fw-bold text-danger">
                    {{ item.soTien.toLocaleString() }} đ
                  </div>
                  <div class="text-muted small">
                    {{ item.thoiGian }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr />
          <button class="btn btn-primary w-100 mb-2" @click="inHoaDon">
            <i class="bi bi-printer me-1"></i> In hóa đơn
          </button>
          <button class="btn btn-warning w-100" @click="moModalSua">
            <i class="bi bi-pencil me-1"></i> Chỉnh sửa đơn hàng
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalEdit" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cập nhật thông tin đơn hàng</h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <!-- TAB HEADER -->
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: tab === 'donhang' }"
                @click="tab = 'donhang'"
              >
                Thông tin đơn hàng
              </button>
            </li>

            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: tab === 'khachhang' }"
                @click="tab = 'khachhang'"
              >
                Thông tin khách hàng
              </button>
            </li>
          </ul>

          <!-- TAB THÔNG TIN ĐƠN HÀNG -->
          <div v-if="tab === 'donhang'">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Mã đơn hàng</label>
                <input class="form-control" v-model="form.maHD" disabled />
              </div>

              <div class="col-md-6">
                <label class="form-label">Ngày tạo</label>
                <input class="form-control" v-model="form.ngayTao" disabled />
              </div>

              <div class="col-md-6">
                <label class="form-label">Trạng thái</label>

                <select class="form-select" v-model="form.trangThai">
                  <option
                    v-for="st in danhSachTrangThaiHopLe"
                    :key="st.value"
                    :value="st.value"
                  >
                    {{ st.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- TAB THÔNG TIN KHÁCH HÀNG -->
          <div v-if="tab === 'khachhang'">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Tên khách hàng</label>
                <input class="form-control" v-model="form.tenKhachHang" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Số điện thoại</label>
                <input class="form-control" v-model="form.sdt" />
              </div>

              <div class="col-md-12">
                <label class="form-label">Email</label>
                <input class="form-control" v-model="form.email" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>

          <button class="btn btn-success" @click="updateHoaDon">Lưu</button>
        </div>
      </div>
    </div>
  </div>

  <!--Modal thanh toan-->
  <div class="modal fade" id="modalThanhToan" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content p-3">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold w-100 text-center">THANH TOÁN</h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="d-flex justify-content-between mb-3">
            <span>Tổng tiền hàng</span>
            <b class="text-danger">
              {{ hoaDon.canThanhToan.toLocaleString() }} đ
            </b>
          </div>

          <!-- CHỌN PHƯƠNG THỨC -->
          <div class="text-center mb-3">
            <button
              class="btn me-2"
              :class="phuongThuc === 'CK' ? 'btn-success' : 'btn-light'"
              @click="phuongThuc = 'CK'"
            >
              CHUYỂN KHOẢN
            </button>

            <button
              class="btn"
              :class="phuongThuc === 'TM' ? 'btn-success' : 'btn-light'"
              @click="phuongThuc = 'TM'"
            >
              TIỀN MẶT
            </button>
          </div>

          <!-- KHU VỰC CHUYỂN KHOẢN -->
          <div v-if="phuongThuc === 'CK'" class="mb-3 text-center">
            <div class="border rounded p-3">
              <p class="mb-1"><b>Ngân hàng:</b> MB Bank</p>
              <p class="mb-2"><b>Số tài khoản:</b> 0876524519</p>

              <img
                src="https://img.vietqr.io/image/MB-0876524519-compact.png"
                alt="QR Thanh toán"
                style="max-width: 200px"
              />

              <p class="mt-2 text-muted small">
                Quét mã để thanh toán đúng số tiền
              </p>
            </div>
          </div>

          <!-- KHU VỰC TIỀN MẶT -->
          <div v-if="phuongThuc === 'TM'" class="mb-3">
            <label class="form-label">Tiền khách đưa</label>
            <input
              class="form-control"
              v-model="tienKhachDuaHienThi"
              @input="formatTienMat"
              placeholder="Nhập số tiền..."
            />
          </div>

          <table class="table table-bordered text-center">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="lichSuThanhToan.length === 0">
                <td colspan="4">Không có giao dịch</td>
              </tr>

              <tr v-for="(item, index) in lichSuThanhToan" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.loai }}</td>
                <td>{{ item.soTien.toLocaleString() }} đ</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-between mb-3">
            <span>Tiền thiếu</span>
            <b class="text-danger">
              {{ hoaDon.canThanhToan.toLocaleString() }} đ
            </b>
          </div>

          <button class="btn btn-primary" @click="xacNhanThanhToan">
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL LỊCH SỬ THAO TÁC -->
  <div class="modal fade" id="modalLichSu" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content history-modal">
        <div class="modal-header border-0">
          <h5 class="modal-title">
            <i class="bi bi-clock-history me-2"></i>
            Lịch sử thao tác
          </h5>
          <button class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body history-body">
          <div
            v-if="lichSuThaoTac.length === 0"
            class="text-muted text-center py-4"
          >
            Chưa có lịch sử thao tác
          </div>

          <div
            v-for="(item, index) in lichSuThaoTac"
            :key="index"
            class="history-item"
          >
            <div class="history-dot"></div>

            <div class="history-content">
              <div class="history-time">
                {{ item.thoiGian }}
              </div>

              <div class="history-text">
                {{ item.noiDung }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { Modal } from "bootstrap";

const tab = ref("donhang");

const form = ref({
  maHD: "",
  ngayTao: "",
  trangThai: 1,

  tenKhachHang: "",
  sdt: "",
  email: "",
});

let modal = null;

const route = useRoute();
const router = useRouter();

const API_HD = "http://localhost:8080/api/admin/hoa-don";

const trangThaiList = [
  { value: 1, label: "Chờ xác nhận", icon: "bi-hourglass" },
  { value: 2, label: "Chờ giao hàng", icon: "bi-box" },
  { value: 3, label: "Đang vận chuyển", icon: "bi-truck" },
  { value: 4, label: "Đã giao hàng", icon: "bi-check-circle" },
  { value: 5, label: "Hoàn thành", icon: "bi-flag" },
];

const selectedHD = ref({
  trangThai: 1,
  sanPham: [],
});

const danhSachTrangThaiHopLe = computed(() => {
  const current = selectedHD.value.trangThai;

  return trangThaiList.filter((st) => {
    if (st.value === current) return true;

    switch (current) {
      case 1:
        return st.value === 2;
      case 2:
        return st.value === 3;
      case 3:
        return st.value === 4;
      case 4:
        return st.value === 5; // giao xong -> hoàn thành
      default:
        return false;
    }
  });
});

const moModalSua = () => {
  tab.value = "donhang";

  form.value = {
    maHD: selectedHD.value.maHD,
    ngayTao: selectedHD.value.ngayTao,
    trangThai: selectedHD.value.trangThai,

    tenKhachHang: selectedHD.value.tenKhachHang,
    sdt: selectedHD.value.sdt,
    email: selectedHD.value.email,
  };

  const el = document.getElementById("modalEdit");
  modal = Modal.getOrCreateInstance(el);
  modal.show();
};

const moModalThanhToan = () => {
  const el = document.getElementById("modalThanhToan");
  const modal = Modal.getOrCreateInstance(el);
  modal.show();
};

const updateHoaDon = async () => {
  try {
    const id = route.params.id;

    await axios.put(`${API_HD}/${id}/trang-thai`, {
      trangThai: form.value.trangThai,
      ghiChu: "Cập nhật trạng thái từ giao diện",
    });

    selectedHD.value.trangThai = form.value.trangThai;

    const trangThaiText = trangThaiList.find(
      (s) => s.value === form.value.trangThai,
    )?.label;

    const newItem = {
      thoiGian: layThoiGianHienTai(),
      noiDung: "Cập nhật trạng thái: " + (trangThaiText || ""),
    };

    const oldHistory = loadLichSuLocal(id);
    oldHistory.unshift(newItem);

    saveLichSuLocal(id, oldHistory);

    lichSuThaoTac.value = oldHistory;

    alert("Lưu thay đổi thành công!");
    modal.hide();
  } catch (error) {
    console.error("Update error:", error);
    alert(
      "Lỗi khi cập nhật: " + (error.response?.data?.message || error.message),
    );
  }
};

const phuongThuc = ref("TM");
const tienKhachDua = ref(0);
const tienKhachDuaHienThi = ref("");
const lichSuThanhToan = ref([]);
const lichSuThaoTac = ref([]);

const getStorageKey = (id) => `lich_su_hd_${id}`;

const saveLichSuLocal = (id, data) => {
  localStorage.setItem(getStorageKey(id), JSON.stringify(data));
};

const loadLichSuLocal = (id) => {
  const data = localStorage.getItem(getStorageKey(id));
  return data ? JSON.parse(data) : [];
};

const moModalLichSu = () => {
  const el = document.getElementById("modalLichSu");
  const modal = Modal.getOrCreateInstance(el);
  modal.show();
};

const layThoiGianHienTai = () => {
  const now = new Date();

  const gio = String(now.getHours()).padStart(2, "0");
  const phut = String(now.getMinutes()).padStart(2, "0");

  const ngay = String(now.getDate()).padStart(2, "0");
  const thang = String(now.getMonth() + 1).padStart(2, "0");
  const nam = now.getFullYear();

  return `${gio}:${phut} ${ngay}/${thang}/${nam}`;
};

const formatTienMat = () => {
  let raw = tienKhachDuaHienThi.value.replace(/\D/g, "");
  tienKhachDua.value = Number(raw);
  tienKhachDuaHienThi.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const hoaDon = computed(() => {
  const tongTien = selectedHD.value.tongTien ?? 0;
  const giamGia = selectedHD.value.giamGia ?? 0;
  const phiVanChuyen = selectedHD.value.phiVanChuyen ?? 0;

  return {
    tongTien,
    giamGia,
    phiVanChuyen,
    canThanhToan: tongTien - giamGia + phiVanChuyen,
  };
});

const xacNhanThanhToan = async () => {
  if (phuongThuc.value === "TM") {
    if (!tienKhachDua.value || tienKhachDua.value <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
  }

  const loaiThanhToan = phuongThuc.value === "TM" ? "Tiền mặt" : "Chuyển khoản";

  const banGhiMoi = {
    loai: loaiThanhToan,
    soTien:
      phuongThuc.value === "TM"
        ? tienKhachDua.value
        : hoaDon.value.canThanhToan,
    thoiGian: layThoiGianHienTai(),
  };

  lichSuThanhToan.value.unshift(banGhiMoi);

  const id = route.params.id;

  const newItem = {
    thoiGian: layThoiGianHienTai(),
    noiDung: "Thanh toán bằng " + loaiThanhToan,
  };

  const oldHistory = loadLichSuLocal(id);
  oldHistory.unshift(newItem);
  saveLichSuLocal(id, oldHistory);
  lichSuThaoTac.value = oldHistory;

  try {
    const id = route.params.id;

    await axios.put(`${API_HD}/${id}/trang-thai`, {
      trangThai: selectedHD.value.trangThai + 1,
      ghiChu: "Tự động cập nhật sau khi thanh toán",
    });

    alert("Thanh toán thành công!");

    await loadChiTiet(id);

    tienKhachDua.value = 0;
    tienKhachDuaHienThi.value = "";

    const el = document.getElementById("modalThanhToan");
    Modal.getInstance(el)?.hide();
  } catch (error) {
    alert("Lỗi khi cập nhật trạng thái sau thanh toán!");
    console.error(error);
  }
};

const trangThaiHienThi = computed(() => {
  return trangThaiList.filter((st) => st.value <= selectedHD.value.trangThai);
});

const loaiDonText = computed(() => {
  const type = selectedHD.value?.loaiDon;
  if (type === true) return "Online";
  if (type === false) return "Tại cửa hàng";
  return "Không xác định";
});

const loadChiTiet = async (id) => {
  const { data } = await axios.get(`${API_HD}/${id}`);

  // =========================
  // MAP HÓA ĐƠN
  // =========================
  selectedHD.value = {
    maHD: data.maHoaDon,
    ngayTao: data.ngayTao
      ? new Date(data.ngayTao).toLocaleString("vi-VN")
      : "—",

    ngayThanhToan: data.ngayThanhToan ?? null,

    tenKhachHang: data.tenKhachHang ?? "",
    sdt: data.soDienThoaiKhachHang ?? "",
    email: data.emailKhachHang ?? "",

    diaChi: data.diaChiKhachHang ?? "",
    ghiChu: data.ghiChu ?? "",

    loaiDon: data.loaiDon,

    tongTien: data.tongTien ?? 0, // tiền hàng gốc
    giamGia: data.tongTienGiam ?? 0, // tiền giảm
    phiVanChuyen: data.phiVanChuyen ?? 0,

    trangThai: data.trangThaiHienTai ?? 1,

    sanPham: Array.isArray(data.chiTietHoaDon)
      ? data.chiTietHoaDon.map((sp) => ({
          id: sp.id,
          maSanPham: sp.maSanPham || "—",
          tenSanPham: sp.tenSanPham || "Không xác định",
          size: sp.kichCo || "—",
          mauSac: sp.mauSac || "—",
          soLuong: sp.soLuong ?? 0,
          donGia: sp.donGia ?? 0,
          thanhTien: (sp.soLuong ?? 0) * (sp.donGia ?? 0),
        }))
      : [],
  };

  // =========================
  // MAP LỊCH SỬ THANH TOÁN
  // =========================
  lichSuThanhToan.value = [];

  if (data.ngayThanhToan) {
    lichSuThanhToan.value.push({
      loai: "Thanh toán",
      soTien: hoaDon.value.canThanhToan,
      thoiGian: new Date(data.ngayThanhToan).toLocaleString("vi-VN"),
    });
  }

  // =========================
  // MAP LỊCH SỬ THAO TÁC
  // =========================
  lichSuThaoTac.value = loadLichSuLocal(id);

  // Tạo đơn
  if (data.ngayTao) {
    lichSuThaoTac.value.push({
      thoiGian: new Date(data.ngayTao).toLocaleString("vi-VN"),
      noiDung: "Tạo đơn hàng",
    });
  }

  // Thanh toán
  if (data.ngayThanhToan) {
    lichSuThaoTac.value.unshift({
      thoiGian: new Date(data.ngayThanhToan).toLocaleString("vi-VN"),
      noiDung: "Đơn hàng đã thanh toán",
    });
  }
};

watch(
  () => route.params.id,
  (id) => id && loadChiTiet(id),
  { immediate: true },
);

const inHoaDon = () => {
  const hd = selectedHD.value;

  let html = `
    <html>
      <head>
        <title>Hóa đơn ${hd.maHD}</title>
        <style>
          body { font-family: Arial; padding: 20px; font-size: 13px; color: rgba(17,24,39,0.82); }
          .header { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: 400; }
          th { background: #f2f2f2; }
          .right { text-align: right; }
          .bold { font-weight: 400; }
          b, strong { font-weight: 400; }
          .info { margin-bottom: 10px; }
        </style>
      </head>

      <body>
        <div class="header">
          <h2 style="margin:0 0 6px; font-size:18px; font-weight:500;">HÓA ĐƠN BÁN HÀNG</h2>
          <div>Mã đơn: <b>${hd.maHD}</b></div>
          <div>Ngày tạo: ${hd.ngayTao}</div>
        </div>

        <div class="info">
          <b>Khách hàng:</b> ${hd.tenKhachHang || "—"} <br/>
          <b>SĐT:</b> ${hd.sdt || "—"} <br/>
          <b>Địa chỉ:</b> ${hd.diaChi || "—"} <br/>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
  `;

  hd.sanPham.forEach((sp, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${sp.tenSanPham}</td>
        <td>${sp.soLuong}</td>
        <td>${sp.donGia.toLocaleString()} đ</td>
        <td>${sp.thanhTien.toLocaleString()} đ</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>

      <br/>

      <div class="right">
        <div>Tổng tiền hàng: <b>${hoaDon.value.tongTien.toLocaleString()} đ</b></div>
        <div>Giảm giá: <b>- ${hoaDon.value.giamGia.toLocaleString()} đ</b></div>
        <div>Phí vận chuyển: <b>+ ${hoaDon.value.phiVanChuyen.toLocaleString()} đ</b></div>
        <hr/>
        <div class="bold">
          Tổng thanh toán: ${hoaDon.value.canThanhToan.toLocaleString()} đ
        </div>
      </div>

      <script>
        window.print();
      <\/script>

      </body>
    </html>
  `;

  const printWindow = window.open("", "", "height=700,width=900");
  printWindow.document.write(html);
  printWindow.document.close();
};

const quayLai = () => router.push("/admin/hoa-don");
</script>

<style scoped>
/* ===== Font + màu chữ đồng bộ ChatLieuPage ===== */
.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

/* Dập mọi chữ in đậm từ bootstrap/utilities ngay trong trang này */
.order-page :deep(b),
.order-page :deep(strong),
.order-page :deep(.fw-bold),
.order-page :deep(.fw-semibold),
.order-page :deep(.bold) {
  font-weight: 400 !important;
}

/* ===== PAGE ===== */
.order-page {
  background: #f5f6fa;
  min-height: 100vh;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}

/* ===== HEADER ===== */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-header h5 {
  font-size: 20px;
  font-weight: 500 !important; /* title 20px */
  letter-spacing: 0.2px;
  margin: 0;
  color: rgba(17, 24, 39, 0.9);
}
.order-header .small {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55) !important;
}

/* ===== CARD CHUNG ===== */
.ss-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.06);
  transition: all 0.25s ease;
}
.ss-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.08);
}

/* Tiêu đề h6 trong card */
.ss-card h6 {
  font-size: 14px;
  font-weight: 500 !important;
  color: rgba(17, 24, 39, 0.82);
  display: flex;
  align-items: center;
  margin: 0;
}

/* ===== STATUS ===== */
.ss-status {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 16px;
}
.ss-status::before {
  content: "";
  position: absolute;
  top: 32px;
  left: 5%;
  right: 5%;
  height: 3px;
  background: #e9ecef;
  z-index: 0;
}
.ss-step {
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
}
.ss-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: auto;
  transition: all 0.3s ease;
}
.ss-step span {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: rgba(17, 24, 39, 0.55);
  font-weight: 400;
}
.ss-step.done .ss-icon {
  border-color: #28a745;
  background: #28a745;
  color: #fff;
}
.ss-step.active .ss-icon {
  border-color: #28a745;
  color: #28a745;
  background: #eafff1;
}
/* trạng thái done/active: chỉ đổi màu, không đậm */
.ss-step.done span,
.ss-step.active span {
  color: #28a745;
  font-weight: 400 !important;
}

/* ===== INFO ROW ===== */
.ss-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  font-size: 13px;
}
.ss-info:last-child {
  border-bottom: none;
}
.ss-info span {
  color: rgba(17, 24, 39, 0.55);
}

/* ===== TABLE ===== */
.table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.table thead th {
  background: #f8f9fa;
  font-size: 13px;
  text-transform: none; /* bỏ uppercase */
  color: rgba(17, 24, 39, 0.75);
  border-bottom: none;
  font-weight: 500; /* header 13px fw 500 */
}
.table tbody td {
  font-weight: 400;
}
.table tbody tr {
  transition: background 0.2s ease;
}
.table tbody tr:hover {
  background: rgba(17, 24, 39, 0.03);
}
/* ô thành tiền: giữ màu, bỏ đậm */
.table .text-danger {
  font-weight: 400 !important;
}

/* ===== MONEY ===== */
.ss-money {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-total {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500; /* không đậm, chỉ 500 */
  color: rgba(220, 53, 69, 0.92);
}

/* ===== BUTTON ===== */
button.btn {
  border-radius: 10px;
  font-weight: 400 !important;
  font-size: 13px;
  line-height: 1;
  transition: all 0.25s ease;
}
button.btn-sm {
  font-size: 13px;
}
button.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
}
button.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.4);
}
button.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none;
  color: #fff;
}
button.btn-warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.4);
}

/* ===== BADGE ===== */
.badge {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 400;
}

/* ===== STICKY SUMMARY ===== */
.sticky-summary {
  position: sticky;
  top: 90px;
}
@media (max-width: 992px) {
  .sticky-summary {
    position: static;
  }
}

/* Nội dung trống */
.empty-history {
  padding: 10px 0;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}

/* Icon đồng bộ */
.bi-clock-history {
  font-size: 16px;
  color: rgba(17, 24, 39, 0.82);
}

/* Wrapper của lịch sử thanh toán */
.payment-history-card {
  position: relative;
  min-height: 120px;
}

/* Khu vực chứa nút thanh toán */
.payment-action {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

/* Responsive status */
@media (max-width: 768px) {
  .ss-status {
    flex-direction: column;
    gap: 25px;
  }
  .ss-status::before {
    display: none;
  }
}

/* Các phần custom cuối file: giữ cấu trúc nhưng bỏ font-weight đậm */
.btn-method,
.payment-table th {
  font-weight: 400 !important;
}

/* Nút lịch sử */
.ss-card .card-body {
  padding-bottom: 60px; /* 👈 tạo khoảng trống dưới */
}

.btn-history {
  position: absolute;
  bottom: 15px;
  right: 20px;

  background: #16a34a;
  color: white;
  border: none;

  font-size: 12px;
  border-radius: 20px;
  padding: 6px 16px;

  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(22, 163, 74, 0.25);
}

.btn-history:hover {
  background: #15803d;
  transform: translateY(-2px);
}

/* Modal */
.history-modal {
  border-radius: 16px;
  overflow: hidden;
}

.history-body {
  max-height: 400px;
  overflow-y: auto;
  position: relative;
  padding-left: 30px;
}

/* Timeline */
.history-body::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.history-item {
  position: relative;
  margin-bottom: 20px;
}

.history-dot {
  position: absolute;
  left: -17px;
  top: 5px;
  width: 10px;
  height: 10px;
  background: #28a745;
  border-radius: 50%;
}

.history-content {
  background: #f9fafb;
  padding: 10px 14px;
  border-radius: 10px;
}

.history-time {
  font-size: 11px;
  color: rgba(17, 24, 39, 0.55);
  margin-bottom: 4px;
}

.history-text {
  font-size: 13px;
}
</style>