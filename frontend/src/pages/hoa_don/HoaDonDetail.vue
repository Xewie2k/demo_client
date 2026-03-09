<!-- File: src/pages/hoa_don/HoaDonDetail.vue -->
<template>
  <!-- Toast notification -->
  <div
    v-if="toast.show"
    :class="`position-fixed top-0 end-0 m-3 alert alert-${toast.type} shadow`"
    style="z-index:9999; min-width:260px; border-radius:10px;"
  >
    <i :class="`bi bi-${toast.type === 'success' ? 'check-circle-fill' : 'x-circle-fill'} me-2`"></i>
    {{ toast.msg }}
  </div>

  <div class="order-page p-4 ss-page ss-font">
    <!-- HEADER -->
    <div class="order-header mb-4">
      <div>
        <h5 class="fw-bold mb-1">Chi tiết đơn hàng</h5>

        <div class="text-muted small">
          Mã đơn hàng: <b>{{ selectedHD.maHD }}</b> | Ngày tạo:
          {{ selectedHD.ngayTao }}
        </div>

        <!-- ✅ Nhìn nhanh: tạo bởi + cập nhật gần nhất -->
        <div class="text-muted small mt-1">
          Tạo bởi: <b>{{ thongTinTaoBoiText }}</b>
          <span class="mx-1">|</span>
          Cập nhật gần nhất: {{ thongTinCapNhatGanNhatText }}
        </div>
      </div>

      <button class="btn btn-secondary btn-sm" type="button" @click="quayLai">
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

              <button class="btn btn-history" type="button" @click="moModalLichSu">
                <i class="bi bi-clock-history me-1"></i>
                Lịch sử thao tác
              </button>
            </div>

            <!-- TIMELINE -->
            <div
              class="ss-status mt-3"
              :class="{ 'ss-status-single': trangThaiHienThi.length <= 1 }"
            >
              <div
                v-for="st in trangThaiHienThi"
                :key="st.value"
                class="ss-step"
                :class="{
                  done: st.value < trangThaiHienTaiDungDeHienThi && trangThaiHienTaiDungDeHienThi <= 5,
                  active: st.value === trangThaiHienTaiDungDeHienThi && trangThaiHienTaiDungDeHienThi <= 5,
                  cancelled: selectedHD.trangThai === 6 && st.value === 1,
                  'request-cancel': selectedHD.trangThai === 7 && st.value === 1,
                }"
              >
                <div class="ss-icon">
                  <i :class="`bi ${getStepIcon(st)}`"></i>
                </div>

                <span>{{ st.label }}</span>

                <!-- ✅ Ai thao tác + thời gian cho từng mốc (nếu có) -->
                <div
                  v-if="st.value <= trangThaiHienTaiDungDeHienThi && metaTrangThai(st.value)"
                  class="ss-step-meta"
                >
                  <div class="ss-step-time" :title="metaTrangThai(st.value)?.thoiGian">
                    {{ metaTrangThai(st.value)?.thoiGian }}
                  </div>
                  <div class="ss-step-user" :title="metaTrangThai(st.value)?.nguoi">
                    {{ metaTrangThai(st.value)?.nguoi }}
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedHD.trangThai === 6" class="alert alert-danger text-center py-2 mt-2 mb-0" style="font-size:0.9rem;">
              <i class="bi bi-x-circle-fill me-1"></i> Đơn hàng đã bị hủy
            </div>
            <div v-if="selectedHD.trangThai === 7" class="alert alert-warning text-center py-2 mt-2 mb-0" style="font-size:0.9rem;">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> Khách hàng yêu cầu hủy — đang chờ xác nhận
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
                <tr v-for="(sp, index) in selectedHD.sanPham" :key="sp.id" class="text-center">
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

                <tr v-if="!selectedHD.sanPham || selectedHD.sanPham.length === 0">
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
                <div class="fw-bold">{{ item.loai }}</div>

                <div class="text-end">
                  <div class="fw-bold text-danger">
                    {{ item.soTien.toLocaleString() }} đ
                  </div>

                  <div class="text-muted small">
                    {{ item.thoiGian }}
                    <span v-if="item.nguoiThaoTac" class="mx-1">•</span>
                    <span v-if="item.nguoiThaoTac">{{ item.nguoiThaoTac }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- YÊU CẦU HỦY: Admin cần xác nhận hoặc từ chối -->
          <div v-if="selectedHD.trangThai === 7" class="card ss-card mt-3 border-danger">
            <div class="card-body">
              <h6 class="fw-bold mb-2 text-danger">
                <i class="bi bi-exclamation-triangle me-1"></i> Khách hàng yêu cầu hủy đơn
              </h6>
              <p class="text-muted small mb-3">Xem lịch sử thao tác để biết lý do yêu cầu hủy.</p>
              <div class="d-flex gap-2">
                <button class="btn btn-danger flex-fill" :disabled="huyLoading" @click="xacNhanHuyTheoYeuCau">
                  <span v-if="huyLoading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-check-circle me-1"></i> Xác nhận hủy
                </button>
                <button class="btn btn-outline-secondary flex-fill" @click="showTuChoiHuyModal = true">
                  <i class="bi bi-x-circle me-1"></i> Từ chối hủy
                </button>
              </div>
            </div>
          </div>

          <!-- HOÀN PHÍ: Admin xác nhận đã hoàn tiền cho khách -->
          <div v-if="selectedHD.daHoanPhi === false" class="card ss-card mt-3 border-warning">
            <div class="card-body">
              <h6 class="fw-bold mb-2 text-warning">
                <i class="bi bi-cash-coin me-1"></i> Đơn hàng cần hoàn phí
              </h6>
              <p class="text-muted small mb-3">Xác nhận đã hoàn tiền cho khách hàng.</p>
              <button class="btn btn-warning w-100" :disabled="hoanPhiLoading" @click="xacNhanHoanPhi">
                <span v-if="hoanPhiLoading" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-check-circle me-1"></i> Xác nhận đã hoàn phí
              </button>
            </div>
          </div>

          <hr />
          <button class="btn btn-primary w-100 mb-2" type="button" @click="inHoaDon">
            <i class="bi bi-printer me-1"></i> In hóa đơn
          </button>

          <!-- ✅ CHẶN NHÂN VIÊN CHƯA MỞ CA -->
          <button
            class="btn btn-warning w-100"
            type="button"
            @click="checkQuyenThaoTac(moModalSua)"
          >
            <i class="bi bi-pencil me-1"></i> Chỉnh sửa đơn hàng
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL EDIT -->
  <div class="modal fade" id="modalEdit" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cập nhật thông tin đơn hàng</h5>
          <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button
                class="nav-link"
                type="button"
                :class="{ active: tab === 'donhang' }"
                @click="tab = 'donhang'"
              >
                Thông tin đơn hàng
              </button>
            </li>

            <li class="nav-item">
              <button
                class="nav-link"
                type="button"
                :class="{ active: tab === 'khachhang' }"
                @click="tab = 'khachhang'"
              >
                Thông tin khách hàng
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                type="button"
                :class="{ active: tab === 'giaohang' }"
                @click="tab = 'giaohang'"
              >
                Thông tin giao hàng
              </button>
            </li>
          </ul>

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

                <select class="form-select" v-model.number="form.trangThai">
                  <option v-for="st in danhSachTrangThaiHopLe" :key="st.value" :value="st.value">
                    {{ st.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

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

          <!-- TAB THÔNG TIN GIAO HÀNG -->
          <div v-if="tab === 'giaohang'">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Địa chỉ cụ thể</label>
                <input class="form-control" v-model="form.diaChiCuThe" placeholder="Số nhà, ngõ, đường..." />
              </div>
              <div class="col-md-4">
                <label class="form-label">Tỉnh/Thành phố</label>
                <select class="form-select" v-model="addressCodes.city" @change="onCityChange">
                  <option value="">Chọn Tỉnh/Thành</option>
                  <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Quận/Huyện</label>
                <select class="form-select" v-model="addressCodes.district" @change="onDistrictChange" :disabled="!addressCodes.city">
                  <option value="">Chọn Quận/Huyện</option>
                  <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Xã/Phường</label>
                <select class="form-select" v-model="addressCodes.ward" @change="onWardChange" :disabled="!addressCodes.district">
                  <option value="">Chọn Xã/Phường</option>
                  <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
                </select>
              </div>
              <div v-if="addressNames.city || addressNames.district || addressNames.ward || form.diaChiCuThe" class="col-12">
                <div class="text-muted small mt-1">
                  <i class="bi bi-geo-alt me-1"></i>
                  Địa chỉ mới: <b>{{ [form.diaChiCuThe, addressNames.ward, addressNames.district, addressNames.city].filter(Boolean).join(', ') || '—' }}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Hủy</button>

          <!-- ✅ CHẶN NHÂN VIÊN CHƯA MỞ CA -->
          <button
            class="btn btn-success"
            type="button"
            @click="checkQuyenThaoTac(tab === 'giaohang' || tab === 'khachhang' ? updateThongTinGiaoHang : updateHoaDon)"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL THANH TOÁN -->
  <div class="modal fade" id="modalThanhToan" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content p-3">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold w-100 text-center">THANH TOÁN</h5>
          <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <div class="d-flex justify-content-between mb-3">
            <span>Tổng tiền hàng</span>
            <b class="text-danger">
              {{ hoaDon.canThanhToan.toLocaleString() }} đ
            </b>
          </div>

          <div class="text-center mb-3">
            <button
              class="btn me-2"
              type="button"
              :class="phuongThuc === 'CK' ? 'btn-success' : 'btn-light'"
              @click="phuongThuc = 'CK'"
            >
              CHUYỂN KHOẢN
            </button>

            <button
              class="btn"
              type="button"
              :class="phuongThuc === 'TM' ? 'btn-success' : 'btn-light'"
              @click="phuongThuc = 'TM'"
            >
              TIỀN MẶT
            </button>
          </div>

          <div v-if="phuongThuc === 'CK'" class="mb-3 text-center">
            <div class="border rounded p-3">
              <p class="mb-1"><b>Ngân hàng:</b> MB Bank</p>
              <p class="mb-2"><b>Số tài khoản:</b> 906512234</p>

              <img
                src="https://img.vietqr.io/image/MB-906512234-compact.png"
                alt="QR Thanh toán"
                style="max-width: 200px"
              />

              <p class="mt-2 text-muted small">Quét mã để thanh toán đúng số tiền</p>
            </div>
          </div>

          <div v-if="phuongThuc === 'TM'" class="mb-3">
            <label class="form-label">Tiền khách đưa</label>
            <input
              class="form-control"
              v-model="tienKhachDuaHienThi"
              @input="formatTienMat"
              placeholder="Nhập số tiền..."
            />
          </div>

          <div class="d-flex justify-content-between mb-3">
            <span>Tiền thiếu</span>
            <b class="text-danger">
              {{ tienThieuThanhToan.toLocaleString() }} đ
            </b>
          </div>

          <!-- ✅ CHẶN NHÂN VIÊN CHƯA MỞ CA -->
          <button class="btn btn-primary" type="button" @click="checkQuyenThaoTac(xacNhanThanhToan)">
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL TỪ CHỐI HỦY (Admin) -->
  <div v-if="showTuChoiHuyModal" class="modal d-block" style="background: rgba(0,0,0,0.5);" @click.self="showTuChoiHuyModal = false">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Từ chối yêu cầu hủy đơn</h5>
          <button type="button" class="btn-close" @click="showTuChoiHuyModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted">Từ chối yêu cầu hủy đơn <strong>{{ selectedHD.maHD }}</strong>? Đơn sẽ về lại trạng thái Chờ xác nhận.</p>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Lý do từ chối (tùy chọn)</label>
            <textarea v-model="tuChoiLyDo" class="form-control form-control-sm" rows="2" placeholder="Nhập lý do..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="showTuChoiHuyModal = false">Đóng</button>
          <button class="btn btn-primary btn-sm" :disabled="tuChoiLoading" @click="tuChoiHuy">
            <span v-if="tuChoiLoading" class="spinner-border spinner-border-sm me-1"></span>
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL LỊCH SỬ -->
  <div class="modal fade" id="modalLichSu" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content history-modal">
        <div class="modal-header border-0">
          <h5 class="modal-title">
            <i class="bi bi-clock-history me-2"></i>
            Lịch sử thao tác
          </h5>
          <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body history-body">
          <div v-if="lichSuThaoTac.length === 0" class="text-muted text-center py-4">
            Chưa có lịch sử thao tác
          </div>

          <div v-for="(item, index) in lichSuThaoTac" :key="index" class="history-item">
            <div class="history-dot"></div>

            <div class="history-content">
              <div class="history-time">
                {{ item.thoiGian }}
              </div>

              <div v-if="item.nguoiThaoTac" class="history-user">
                {{ item.nguoiThaoTac }}
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
import { ref, watch, computed, onMounted, onBeforeUnmount, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import vnAddressService from "@/services/vnAddressService";

const props = defineProps({
  id: { type: [String, Number], required: false },
});

/* =========================================================
 * ✅ CHẶN THAO TÁC KHI NHÂN VIÊN CHƯA MỞ CA
 * - ADMIN: luôn được thao tác
 * - NHÂN VIÊN: bắt buộc ss_has_active_shift=true
 * ========================================================= */
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

const laNhanVien = () => getUserRole() === "NHAN_VIEN";

const coCaLamDangHoatDong = () => {
  return sessionStorage.getItem("ss_has_active_shift") === "true";
};

const duocThaoTac = () => {
  if (!laNhanVien()) return true;
  return coCaLamDangHoatDong();
};

const checkQuyenThaoTac = async (callback) => {
  if (!duocThaoTac()) {
    await Swal.fire({
      icon: "error",
      title: "Chế độ Chỉ xem",
      text: "Bạn cần Bắt đầu ca làm việc mới có thể Thêm hoặc Sửa dữ liệu!",
      confirmButtonColor: "#6366f1",
    });
    return false;
  }

  if (typeof callback === "function") {
    await callback();
  }
  return true;
};

const tab = ref("donhang");

// Address refs for delivery tab
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const addressCodes = reactive({ city: '', district: '', ward: '' });
const addressNames = reactive({ city: '', district: '', ward: '' });

// Toast notification
const toast = reactive({ show: false, type: 'success', msg: '' });
const showToast = (msg, type = 'success') => {
  toast.msg = msg; toast.type = type; toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};

// Cancel request refs
const showTuChoiHuyModal = ref(false);
const tuChoiLyDo = ref('');
const tuChoiLoading = ref(false);
const huyLoading = ref(false);
const hoanPhiLoading = ref(false);

const form = ref({
  maHD: "",
  ngayTao: "",
  trangThai: 1,
  tenKhachHang: "",
  sdt: "",
  email: "",
  diaChiCuThe: "",
});

let modal = null;

const route = useRoute();
const router = useRouter();

const API_HD = "http://localhost:8080/api/admin/hoa-don";
/** ✅ nếu API nhân viên của bạn khác, đổi lại ở đây */
const API_NV = "http://localhost:8080/api/admin/nhan-vien";

const trangThaiList = [
  { value: 1, label: "Chờ xác nhận", icon: "bi-hourglass" },
  { value: 2, label: "Chờ giao hàng", icon: "bi-box" },
  { value: 3, label: "Đang vận chuyển", icon: "bi-truck" },
  { value: 4, label: "Đã giao hàng", icon: "bi-check-circle" },
  { value: 5, label: "Hoàn thành", icon: "bi-flag" },
  { value: 6, label: "Đã hủy", icon: "bi-x-circle" },
  { value: 7, label: "Yêu cầu hủy", icon: "bi-exclamation-triangle" },
];

const selectedHD = ref({
  trangThai: 1,
  sanPham: [],
  nguoiTaoId: null,
  nguoiCapNhatId: null,
});

const hoaDonIdHienTai = computed(() => {
  const p = props.id;
  const r = route.params.id;
  return p ?? r ?? null;
});

const loaiDonText = computed(() => {
  const type = selectedHD.value?.loaiDon;
  if (type === 1 || type === "1" || type === true) return "Giao hàng";
  if (type === 0 || type === "0" || type === false) return "Tại quầy";
  return "Không xác định";
});

const isTaiQuay = computed(() => {
  const type = selectedHD.value?.loaiDon;
  return type === 0 || type === "0" || type === false;
});

const trangThaiHienTaiDungDeHienThi = computed(() => {
  const t = Number(selectedHD.value?.trangThai ?? 1);
  if (isTaiQuay.value) return t >= 5 ? 5 : 1;
  return t;
});

const danhSachTrangThaiHopLe = computed(() => {
  const current = trangThaiHienTaiDungDeHienThi.value;

  if (isTaiQuay.value) {
    const ds = trangThaiList.filter((st) => st.value === 1 || st.value === 5);
    return ds.filter((st) => {
      if (st.value === current) return true;
      if (current === 1) return st.value === 5;
      return false;
    });
  }

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
        return st.value === 5;
      default:
        return false;
    }
  });
});

/* =========================================================
 * ✅ LẤY NHÂN VIÊN ĐANG ĐĂNG NHẬP (CHỐT: KHÔNG ĐỂ REQUEST THIẾU HEADER)
 * ========================================================= */

const base64UrlDecode = (str) => {
  try {
    if (!str) return null;
    let s = String(str).replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return atob(s);
  } catch (e) {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecode(parts[1]);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
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

const tachThongTinNguoiTuChuoi = (s) => {
  const str = String(s || "").trim();
  if (!str) return { maNhanVien: null, tenTaiKhoan: null };

  const ma = tachMaNhanVienTuChuoi(str);

  if (ma) {
    const re = new RegExp(`${ma}\\s*[-–—]\\s*(.+)$`, "i");
    const m = str.match(re);
    const tk = m?.[1] ? String(m[1]).trim() : null;
    return { maNhanVien: ma, tenTaiKhoan: tk || null };
  }

  const m2 = str.match(/^(.+?)\s*\(\s*(NV\d{5})\s*\)\s*$/i);
  if (m2) {
    return {
      maNhanVien: String(m2[2]).toUpperCase(),
      tenTaiKhoan: String(m2[1]).trim(),
    };
  }

  return { maNhanVien: null, tenTaiKhoan: null };
};

const dinhDangNguoiHienThi = (maNv, tenTaiKhoan) => {
  const ma = String(maNv || "").trim();
  const tk = String(tenTaiKhoan || "").trim();

  if (ma && tk) return `${ma} - ${tk}`;
  if (ma) return ma;
  if (tk) return tk;
  return "";
};

const layTokenTuAxiosAuthorization = () => {
  try {
    const auth =
      axios?.defaults?.headers?.common?.Authorization ||
      axios?.defaults?.headers?.common?.authorization ||
      null;

    if (!auth || typeof auth !== "string") return null;
    const m = auth.match(/Bearer\s+(.+)$/i);
    if (m?.[1] && m[1].includes(".")) return m[1].trim();
    if (auth.includes(".") && auth.split(".").length >= 2) return auth.trim();
    return null;
  } catch (e) {
    return null;
  }
};

const layDanhSachJwtTrongStorage = () => {
  const out = [];

  const pushFrom = (store, storeName) => {
    try {
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        const v = store.getItem(k);
        if (!v || typeof v !== "string") continue;
        if (!v.includes(".")) continue;
        if (v.split(".").length < 2) continue;
        out.push({ token: v, key: k, store: storeName });
      }
    } catch (e) {}
  };

  pushFrom(localStorage, "localStorage");
  pushFrom(sessionStorage, "sessionStorage");
  return out;
};

const chonTokenMoiNhat = (candidates) => {
  const now = Math.floor(Date.now() / 1000);

  const uniq = new Map();
  (candidates || []).forEach((x) => {
    if (x?.token) uniq.set(x.token, x);
  });

  let bestToken = null;
  let bestScore = -1;

  for (const [token] of uniq.entries()) {
    const payload = decodeJwtPayload(token);
    if (!payload) continue;

    const exp = Number(payload?.exp ?? 0) || 0;
    const iat = Number(payload?.iat ?? 0) || 0;

    if (exp && exp < now - 10) continue;

    const score = (iat || 0) * 1_000_000 + (exp || 0);

    if (score > bestScore) {
      bestScore = score;
      bestToken = token;
    }
  }

  if (!bestToken) {
    const keyUuTien = [
      "token",
      "accessToken",
      "access_token",
      "jwt",
      "auth_token",
      "ss_token",
      "sevenstrike_token",
    ];

    for (const k of keyUuTien) {
      const v = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (v && typeof v === "string" && v.includes(".") && v.split(".").length >= 2) {
        bestToken = v;
        break;
      }
    }
  }

  return bestToken;
};

const timTokenTrongStorage = () => {
  const tAxios = layTokenTuAxiosAuthorization();
  if (tAxios) return tAxios;

  const list = layDanhSachJwtTrongStorage();
  return chonTokenMoiNhat(list);
};

const timUserObjTrongStorage = () => {
  const keys = [
    "currentUser",
    "user",
    "ss_user",
    "tai_khoan",
    "nhan_vien",
    "auth_user",
    "profile",
    "me",
  ];

  const tryParse = (raw) => {
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return obj && typeof obj === "object" ? obj : null;
    } catch (e) {
      return null;
    }
  };

  for (const k of keys) {
    const o1 = tryParse(localStorage.getItem(k));
    if (o1) return o1;

    const o2 = tryParse(sessionStorage.getItem(k));
    if (o2) return o2;
  }

  const hasUserHint = (obj) => {
    if (!obj || typeof obj !== "object") return false;

    const hit =
      obj?.idNhanVien ??
      obj?.nhanVienId ??
      obj?.id_nhan_vien ??
      obj?.nvId ??
      obj?.nv_id ??
      obj?.id ??
      obj?.userId ??
      obj?.uid ??
      obj?.maNhanVien ??
      obj?.ma_nhan_vien ??
      obj?.tenTaiKhoan ??
      obj?.ten_tai_khoan ??
      obj?.username ??
      obj?.taiKhoan ??
      obj?.account ??
      obj?.sub ??
      null;

    return hit !== null && hit !== undefined;
  };

  const scanStore = (store) => {
    try {
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        const raw = store.getItem(k);
        const obj = tryParse(raw);
        if (obj && hasUserHint(obj)) return obj;
      }
    } catch (e) {}
    return null;
  };

  return scanStore(localStorage) || scanStore(sessionStorage) || null;
};

const layThongTinDangNhap = () => {
  const toNumberId = (val) => {
    const raw = String(val ?? "").trim();
    if (!raw) return null;

    const ma = tachMaNhanVienTuChuoi(raw);
    if (ma) return maNhanVienToId(ma);

    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;

    const n = Number(digits);
    if (!Number.isNaN(n) && n > 0) return n;

    return null;
  };

  const token = timTokenTrongStorage();
  const payload = decodeJwtPayload(token) || {};

  const maFromJwt =
    payload?.maNhanVien ??
    payload?.ma_nhan_vien ??
    payload?.maNV ??
    payload?.ma_nv ??
    null;

  const tkFromJwt =
    payload?.tenTaiKhoan ??
    payload?.ten_tai_khoan ??
    payload?.username ??
    payload?.user_name ??
    payload?.taiKhoan ??
    payload?.account ??
    payload?.sub ??
    null;

  const idRaw =
    payload?.idNhanVien ??
    payload?.nhanVienId ??
    payload?.id_nhan_vien ??
    payload?.nhan_vien_id ??
    payload?.nvId ??
    payload?.nv_id ??
    payload?.employeeId ??
    payload?.empId ??
    payload?.userId ??
    payload?.uid ??
    payload?.id ??
    null;

  let id = toNumberId(idRaw);
  if (!id) id = toNumberId(maFromJwt);

  const obj = timUserObjTrongStorage();

  if (!id && obj) {
    id =
      toNumberId(obj?.idNhanVien) ??
      toNumberId(obj?.nhanVienId) ??
      toNumberId(obj?.id_nhan_vien) ??
      toNumberId(obj?.nvId) ??
      toNumberId(obj?.nv_id) ??
      toNumberId(obj?.id) ??
      toNumberId(obj?.userId) ??
      toNumberId(obj?.uid) ??
      toNumberId(obj?.maNhanVien) ??
      toNumberId(obj?.ma_nhan_vien) ??
      null;
  }

  const ma =
    tachMaNhanVienTuChuoi(maFromJwt) ||
    tachMaNhanVienTuChuoi(obj?.maNhanVien) ||
    tachMaNhanVienTuChuoi(obj?.ma_nhan_vien) ||
    (id ? `NV${String(id).padStart(5, "0")}` : null);

  const tenTaiKhoan = String(
    tkFromJwt ??
      obj?.tenTaiKhoan ??
      obj?.ten_tai_khoan ??
      obj?.username ??
      obj?.taiKhoan ??
      obj?.account ??
      obj?.sub ??
      ""
  ).trim();

  return {
    idNhanVien: id || null,
    maNhanVien: ma || null,
    tenTaiKhoan: tenTaiKhoan || "",
  };
};

const taoConfigHeaderNhanVien = () => {
  const info = layThongTinDangNhap();

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

/* =========================
 * ✅ LỊCH SỬ + NGƯỜI THAO TÁC
 * ========================= */

const phuongThuc = ref("TM");
const tienKhachDua = ref(0);
const tienKhachDuaHienThi = ref("");
const lichSuThanhToan = ref([]);
const lichSuThaoTac = ref([]);

const mapNhanVienTaiKhoan = ref({});

const moModalLichSu = () => {
  const el = document.getElementById("modalLichSu");
  const m = Modal.getOrCreateInstance(el);
  m.show();
};

const parseDateFromText = (s) => {
  try {
    if (!s) return null;

    if (s instanceof Date) {
      const t = s.getTime();
      return Number.isNaN(t) ? null : s;
    }

    const str = String(s).trim();

    const d1 = new Date(str);
    if (!Number.isNaN(d1.getTime())) return d1;

    const cleaned = str.replace(",", "").trim();

    let m = cleaned.match(
      /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );
    if (m) {
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      const ss = Number(m[3] ?? 0);
      const dd = Number(m[4]);
      const MM = Number(m[5]) - 1;
      const yy = Number(m[6]);
      const d2 = new Date(yy, MM, dd, hh, mm, ss);
      if (!Number.isNaN(d2.getTime())) return d2;
    }

    m = cleaned.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    );
    if (m) {
      const dd = Number(m[1]);
      const MM = Number(m[2]) - 1;
      const yy = Number(m[3]);
      const hh = Number(m[4]);
      const mm = Number(m[5]);
      const ss = Number(m[6] ?? 0);
      const d3 = new Date(yy, MM, dd, hh, mm, ss);
      if (!Number.isNaN(d3.getTime())) return d3;
    }

    return null;
  } catch (e) {
    return null;
  }
};

const sapXepLichSuGiamDan = (arr) => {
  return [...(arr || [])].sort((a, b) => {
    const da = parseDateFromText(a?.thoiGian)?.getTime?.() ?? 0;
    const db = parseDateFromText(b?.thoiGian)?.getTime?.() ?? 0;
    return db - da;
  });
};

const layThongTinNhanVien = async (id) => {
  if (!id) return null;
  if (mapNhanVienTaiKhoan.value[id]) return mapNhanVienTaiKhoan.value[id];

  try {
    const { data } = await axios.get(`${API_NV}/${id}`);

    const ma =
      data?.maNhanVien ||
      data?.ma_nhan_vien ||
      data?.maNV ||
      data?.ma_nv ||
      data?.ma ||
      (id ? `NV${String(id).padStart(5, "0")}` : null);

    const tenTaiKhoan =
      data?.tenTaiKhoan ||
      data?.ten_tai_khoan ||
      data?.tenTaiKhoanNhanVien ||
      data?.username ||
      data?.taiKhoan ||
      data?.account ||
      "";

    const out = { maNhanVien: ma, tenTaiKhoan: tenTaiKhoan };
    mapNhanVienTaiKhoan.value[id] = out;
    return out;
  } catch (e) {
    mapNhanVienTaiKhoan.value[id] = {
      maNhanVien: `NV${String(id).padStart(5, "0")}`,
      tenTaiKhoan: "",
    };
    return mapNhanVienTaiKhoan.value[id];
  }
};

const ganTenTaiKhoanChoLichSu = async () => {
  const ids = new Set();

  const collect = (arr) => {
    (arr || []).forEach((x) => {
      const id = x?.nguoiId ?? null;
      if (id) ids.add(id);
    });
  };

  collect(lichSuThaoTac.value);
  collect(lichSuThanhToan.value);

  if (selectedHD.value?.nguoiTaoId) ids.add(Number(selectedHD.value.nguoiTaoId));
  if (selectedHD.value?.nguoiCapNhatId) ids.add(Number(selectedHD.value.nguoiCapNhatId));

  if (ids.size) {
    await Promise.all(Array.from(ids).map((id) => layThongTinNhanVien(id)));
  }

  const buildNguoi = (x) => {
    const id = x?.nguoiId ?? null;
    const info = id ? mapNhanVienTaiKhoan.value[id] : null;

    const parsed = tachThongTinNguoiTuChuoi(x?.nguoiThaoTacRaw || x?.nguoiThaoTac || "");

    const ma = info?.maNhanVien || parsed?.maNhanVien || (id ? `NV${String(id).padStart(5, "0")}` : null);
    const tk = info?.tenTaiKhoan || parsed?.tenTaiKhoan || "";

    return dinhDangNguoiHienThi(ma, tk);
  };

  lichSuThaoTac.value = (lichSuThaoTac.value || []).map((x) => ({
    ...x,
    nguoiThaoTac: buildNguoi(x),
  }));

  lichSuThanhToan.value = (lichSuThanhToan.value || []).map((x) => ({
    ...x,
    nguoiThaoTac: buildNguoi(x),
  }));
};

const layNguoiIdTuLichSu = (x) => {
  const nguoiIdRaw =
    x?.nguoiId ??
    x?.nguoi_id ??
    x?.nguoiThaoTacId ??
    x?.nguoi_thao_tac_id ??
    x?.idNguoiThaoTac ??
    x?.id_nguoi_thao_tac ??
    x?.nhanVienId ??
    x?.nhan_vien_id ??
    x?.idNhanVien ??
    x?.id_nhan_vien ??
    x?.nguoiCapNhat ??
    x?.nguoiCapNhatId ??
    x?.idNguoiCapNhat ??
    x?.nguoi_tao ??
    x?.nguoiTao ??
    x?.createdBy ??
    x?.updatedBy ??
    null;

  const toNumber = (v) => {
    if (v === null || v === undefined) return null;

    const ma = tachMaNhanVienTuChuoi(v);
    if (ma) return maNhanVienToId(ma);

    const digits = String(v).replace(/\D/g, "");
    if (!digits) return null;

    const n = Number(digits);
    if (!Number.isNaN(n) && n > 0) return n;

    return null;
  };

  const n = toNumber(nguoiIdRaw);
  if (n) return n;

  const parsed = tachThongTinNguoiTuChuoi(x?.nguoiThaoTac || x?.nguoi || "");
  if (parsed?.maNhanVien) return maNhanVienToId(parsed.maNhanVien);

  return null;
};

const layTrangThaiMoiTuLichSu = (x) => {
  const raw =
    x?.trangThaiMoi ??
    x?.trang_thai_moi ??
    x?.trangThaiSau ??
    x?.trang_thai_sau ??
    x?.trangThaiHienTai ??
    x?.trang_thai_hien_tai ??
    x?.trangThai ??
    x?.status ??
    null;

  if (raw === null || raw === undefined) return null;

  const n = Number(String(raw).match(/\d+/)?.[0] ?? NaN);
  return Number.isNaN(n) ? null : n;
};

const chuanHoaItemLichSuThaoTac = (x) => {
  const nguoiId = layNguoiIdTuLichSu(x);
  const trangThaiMoi = layTrangThaiMoiTuLichSu(x);

  const thoiGianText =
    x?.thoiGian
      ? new Date(x.thoiGian).toLocaleString("vi-VN")
      : x?.thoiGianText
      ? x.thoiGianText
      : x?.ngayTao
      ? new Date(x.ngayTao).toLocaleString("vi-VN")
      : "—";

  return {
    thoiGian: thoiGianText,
    noiDung: x?.noiDung || x?.ghiChu || x?.moTa || x?.hanhDong || "—",
    trangThaiMoi: trangThaiMoi,
    nguoiThaoTacRaw: x?.nguoiThaoTac || x?.nguoi || x?.tenNguoiThaoTac || "",
    nguoiThaoTac: "",
    nguoiId: nguoiId,
  };
};

const chuanHoaItemLichSuThanhToan = (x) => {
  const nguoiId = layNguoiIdTuLichSu(x);

  const thoiGianText =
    x?.thoiGian
      ? new Date(x.thoiGian).toLocaleString("vi-VN")
      : x?.thoiGianText
      ? x.thoiGianText
      : x?.ngayTao
      ? new Date(x.ngayTao).toLocaleString("vi-VN")
      : "—";

  return {
    loai: x?.loai || x?.tenPhuongThuc || x?.phuongThuc || "Thanh toán",
    soTien: Number(x?.soTien ?? x?.amount ?? 0),
    thoiGian: thoiGianText,
    nguoiThaoTacRaw: x?.nguoiThaoTac || x?.nguoi || x?.tenNguoiThaoTac || "",
    nguoiThaoTac: "",
    nguoiId: nguoiId,
    ghiChu: x?.ghiChu || "",
  };
};

const taiLichSuThaoTacTuBE = async (id) => {
  try {
    const { data } = await axios.get(`${API_HD}/${id}/lich-su-thao-tac`);
    if (!Array.isArray(data)) return [];
    return sapXepLichSuGiamDan(data.map(chuanHoaItemLichSuThaoTac));
  } catch (e) {
    return [];
  }
};

const taiLichSuThanhToanTuBE = async (id) => {
  try {
    const { data } = await axios.get(`${API_HD}/${id}/lich-su-thanh-toan`);
    if (!Array.isArray(data)) return [];
    return sapXepLichSuGiamDan(data.map(chuanHoaItemLichSuThanhToan));
  } catch (e) {
    return [];
  }
};

const boSungLichSuMacDinhTuHoaDon = (arr, dataHoaDon) => {
  const ds = [...(arr || [])];

  const coTaoDon = ds.some((x) => {
    const t = String(x?.noiDung || "").toLowerCase();
    return t.includes("tạo") && (t.includes("đơn") || t.includes("hóa đơn"));
  });

  if (!coTaoDon && dataHoaDon?.ngayTao) {
    const nguoiTao =
      Number(
        dataHoaDon?.nguoiTao ??
          dataHoaDon?.nguoi_tao ??
          dataHoaDon?.idNhanVien ??
          dataHoaDon?.id_nhan_vien ??
          null
      ) || null;

    ds.push({
      thoiGian: new Date(dataHoaDon.ngayTao).toLocaleString("vi-VN"),
      noiDung: "Tạo đơn hàng",
      trangThaiMoi: 1,
      nguoiThaoTacRaw: "",
      nguoiThaoTac: "",
      nguoiId: nguoiTao,
    });
  }

  return sapXepLichSuGiamDan(ds);
};

/* =========================
 * ✅ MODAL
 * ========================= */

const moModalSua = async () => {
  tab.value = "donhang";
  form.value = {
    maHD: selectedHD.value.maHD,
    ngayTao: selectedHD.value.ngayTao,
    trangThai: trangThaiHienTaiDungDeHienThi.value,
    tenKhachHang: selectedHD.value.tenKhachHang,
    sdt: selectedHD.value.sdt,
    email: selectedHD.value.email,
    diaChiCuThe: selectedHD.value.diaChi?.split(',')[0]?.trim() || '',
  };

  // Reset address codes
  addressCodes.city = ''; addressCodes.district = ''; addressCodes.ward = '';
  addressNames.city = ''; addressNames.district = ''; addressNames.ward = '';
  districts.value = []; wards.value = [];

  // Load provinces nếu chưa có
  if (!provinces.value.length) {
    provinces.value = await vnAddressService.getProvinces();
  }

  const el = document.getElementById("modalEdit");
  modal = Modal.getOrCreateInstance(el);
  modal.show();
};

const updateHoaDon = async () => {
  try {
    const id = hoaDonIdHienTai.value;
    if (!id) return;

    const next = Number(form.value.trangThai);
    const current = Number(selectedHD.value?.trangThai ?? 1);

    if (next === current) {
      alert("Trạng thái không thay đổi!");
      return;
    }

    await axios.put(
      `${API_HD}/${id}/trang-thai`,
      {
        trangThai: next,
        ghiChu: "Cập nhật trạng thái từ giao diện",
      },
      taoConfigHeaderNhanVien()
    );

    alert("Lưu thay đổi thành công!");
    await loadChiTiet(id);
    modal?.hide();
  } catch (error) {
    console.error("Update error:", error);
    alert("Lỗi khi cập nhật: " + (error.response?.data?.message || error.message));
  }
};

const updateThongTinGiaoHang = async () => {
  try {
    const id = hoaDonIdHienTai.value;
    if (!id) return;

    // Build địa chỉ từ cascading dropdowns
    const diaChi = vnAddressService.buildAddressText({
      detail: form.value.diaChiCuThe,
      wardName: addressNames.ward,
      districtName: addressNames.district,
      provinceName: addressNames.city,
    }) || selectedHD.value.diaChi;

    await axios.put(`${API_HD}/${id}/thong-tin-giao-hang`, {
      tenKhachHang: form.value.tenKhachHang,
      soDienThoaiKhachHang: form.value.sdt,
      emailKhachHang: form.value.email,
      diaChiKhachHang: diaChi,
    });

    await loadChiTiet(id);
    modal?.hide();
    showToast('Lưu thay đổi thành công!');
  } catch (error) {
    console.error("Update error:", error);
    showToast(error.response?.data?.message || 'Lỗi khi cập nhật', 'danger');
  }
};

/* =========================
 * ✅ TÍNH TIỀN + THANH TOÁN
 * ========================= */

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

const tienThieuThanhToan = computed(() => {
  const total = Number(hoaDon.value.canThanhToan || 0);
  if (phuongThuc.value === "TM") {
    return Math.max(0, total - Number(tienKhachDua.value || 0));
  }
  return total;
});

const formatTienMat = () => {
  let raw = tienKhachDuaHienThi.value.replace(/\D/g, "");
  tienKhachDua.value = Number(raw);
  tienKhachDuaHienThi.value = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const xacNhanThanhToan = async () => {
  const id = hoaDonIdHienTai.value;
  if (!id) return;

  if (phuongThuc.value === "TM") {
    if (!tienKhachDua.value || tienKhachDua.value <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    if (tienKhachDua.value < Number(hoaDon.value.canThanhToan || 0)) {
      alert("Tiền khách đưa chưa đủ để thanh toán!");
      return;
    }
  }

  try {
    const note = "Thanh toán từ màn chi tiết hóa đơn";

    if (isTaiQuay.value) {
      if (phuongThuc.value === "TM") {
        await axios.put(
          `${API_HD}/${id}/confirm-tai-quay-tien-mat`,
          { ghiChu: note },
          taoConfigHeaderNhanVien()
        );
      } else {
        await axios.put(
          `${API_HD}/${id}/confirm-tai-quay-chuyen-khoan`,
          { ghiChu: note },
          taoConfigHeaderNhanVien()
        );
      }
    } else {
      const trangThaiSauThanhToan = Math.min(5, Number(selectedHD.value.trangThai || 1) + 1);

      await axios.put(
        `${API_HD}/${id}/trang-thai`,
        {
          trangThai: trangThaiSauThanhToan,
          ghiChu: "Tự động cập nhật sau khi thanh toán",
        },
        taoConfigHeaderNhanVien()
      );
    }

    alert("Thanh toán thành công!");
    await loadChiTiet(id);

    tienKhachDua.value = 0;
    tienKhachDuaHienThi.value = "";

    try {
      document.activeElement?.blur?.();
    } catch (e) {}

    const el = document.getElementById("modalThanhToan");
    Modal.getInstance(el)?.hide();
  } catch (error) {
    console.error(error);
    alert("Lỗi khi xác nhận thanh toán!");
  }
};

/* =========================
 * ✅ HIỂN THỊ TIMELINE
 * ========================= */
const trangThaiHienThi = computed(() => {
  const current = Number(trangThaiHienTaiDungDeHienThi.value || 1);

  if (isTaiQuay.value) {
    if (current >= 5) return trangThaiList.filter((st) => st.value === 1 || st.value === 5);
    return trangThaiList.filter((st) => st.value === 1);
  }

  // For status 6/7 (cancelled/request-cancel), show all 5 normal steps
  if (current > 5) return trangThaiList.filter((st) => st.value <= 5);
  return trangThaiList.filter((st) => st.value <= current);
});

const metaTheoTrangThai = computed(() => {
  const map = {};
  const arr = [...(lichSuThaoTac.value || [])];

  arr.sort((a, b) => {
    const da = parseDateFromText(a?.thoiGian)?.getTime?.() ?? 0;
    const db = parseDateFromText(b?.thoiGian)?.getTime?.() ?? 0;
    return da - db;
  });

  for (const it of arr) {
    const who = it?.nguoiThaoTac || "";
    const time = it?.thoiGian || "—";

    let stVal = null;
    if (it?.trangThaiMoi !== null && it?.trangThaiMoi !== undefined) {
      const n = Number(it.trangThaiMoi);
      if (!Number.isNaN(n)) stVal = n;
    }

    if (stVal && !map[stVal]) {
      map[stVal] = { thoiGian: time, nguoi: who || "—" };
    }
  }

  return map;
});

const metaTrangThai = (value) => metaTheoTrangThai.value?.[value] || null;

const getStepIcon = (st) => {
  if (st.value === 1 && selectedHD.value.trangThai === 6) return 'bi-ban';
  if (st.value === 1 && selectedHD.value.trangThai === 7) return 'bi-exclamation-octagon-fill';
  return st.icon;
};

const getCurrentNhanVienId = () => {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user")
      || localStorage.getItem("nguoiDung") || sessionStorage.getItem("nguoiDung");
    const u = JSON.parse(raw || 'null');
    return u?.id || null;
  } catch { return null; }
};

const xacNhanHuyTheoYeuCau = async () => {
  if (!confirm('Xác nhận hủy đơn hàng theo yêu cầu của khách?')) return;
  huyLoading.value = true;
  try {
    const id = hoaDonIdHienTai.value;
    await axios.post(`${API_HD}/${id}/xac-nhan-huy-theo-yeu-cau`, { nhanVienId: getCurrentNhanVienId() });
    await loadChiTiet(id);
    showToast('Đã xác nhận hủy đơn hàng!');
  } catch (err) {
    showToast(err.response?.data?.message || 'Không thể xác nhận hủy đơn', 'danger');
  } finally {
    huyLoading.value = false;
  }
};

const xacNhanHoanPhi = async () => {
  if (!confirm('Xác nhận đã hoàn tiền cho khách hàng?')) return;
  hoanPhiLoading.value = true;
  try {
    const id = hoaDonIdHienTai.value;
    await axios.post(`${API_HD}/${id}/xac-nhan-hoan-phi`, { nhanVienId: getCurrentNhanVienId() });
    await loadChiTiet(id);
    showToast('Đã xác nhận hoàn phí!');
  } catch (err) {
    showToast(err.response?.data?.message || 'Không thể xác nhận hoàn phí', 'danger');
  } finally {
    hoanPhiLoading.value = false;
  }
};

const tuChoiHuy = async () => {
  tuChoiLoading.value = true;
  try {
    const id = hoaDonIdHienTai.value;
    await axios.post(`${API_HD}/${id}/tu-choi-huy`, {
      nhanVienId: getCurrentNhanVienId(),
      lyDo: tuChoiLyDo.value || null,
    });
    showTuChoiHuyModal.value = false;
    tuChoiLyDo.value = '';
    await loadChiTiet(id);
    showToast('Đã từ chối yêu cầu hủy đơn!');
  } catch (err) {
    showToast(err.response?.data?.message || 'Không thể từ chối yêu cầu hủy', 'danger');
  } finally {
    tuChoiLoading.value = false;
  }
};

const onCityChange = async () => {
  addressCodes.district = ''; addressCodes.ward = '';
  districts.value = []; wards.value = [];
  const p = provinces.value.find(x => x.code == addressCodes.city);
  addressNames.city = p?.name || '';
  addressNames.district = ''; addressNames.ward = '';
  if (addressCodes.city) districts.value = await vnAddressService.getDistricts(addressCodes.city);
};

const onDistrictChange = async () => {
  addressCodes.ward = ''; wards.value = [];
  const d = districts.value.find(x => x.code == addressCodes.district);
  addressNames.district = d?.name || '';
  addressNames.ward = '';
  if (addressCodes.district) wards.value = await vnAddressService.getWards(addressCodes.district);
};

const onWardChange = () => {
  const w = wards.value.find(x => x.code == addressCodes.ward);
  addressNames.ward = w?.name || '';
};

const thongTinTaoBoiText = computed(() => {
  const arr = [...(lichSuThaoTac.value || [])].sort((a, b) => {
    const da = parseDateFromText(a?.thoiGian)?.getTime?.() ?? 0;
    const db = parseDateFromText(b?.thoiGian)?.getTime?.() ?? 0;
    return da - db;
  });

  const taoDon = arr.find((x) => {
    const t = String(x?.noiDung || "").toLowerCase();
    return t.includes("tạo") && (t.includes("đơn") || t.includes("hóa đơn"));
  });

  if (taoDon?.nguoiThaoTac) return taoDon.nguoiThaoTac;

  const id = selectedHD.value?.nguoiTaoId;
  if (id && mapNhanVienTaiKhoan.value[id]) {
    const info = mapNhanVienTaiKhoan.value[id];
    return dinhDangNguoiHienThi(info?.maNhanVien, info?.tenTaiKhoan) || info?.maNhanVien || "—";
  }

  return "—";
});

const thongTinCapNhatGanNhatText = computed(() => {
  const arr = sapXepLichSuGiamDan(lichSuThaoTac.value || []);
  const last = arr?.[0];
  if (!last) return "—";

  let who = last?.nguoiThaoTac || "";

  if (!who) {
    const id = selectedHD.value?.nguoiCapNhatId;
    if (id && mapNhanVienTaiKhoan.value[id]) {
      const info = mapNhanVienTaiKhoan.value[id];
      who = dinhDangNguoiHienThi(info?.maNhanVien, info?.tenTaiKhoan) || "";
    }
  }

  const whoText = who ? ` – ${who}` : "";
  return `${last.thoiGian}${whoText}`;
});

const loadChiTiet = async (id) => {
  const { data } = await axios.get(`${API_HD}/${id}`);

  selectedHD.value = {
    maHD: data.maHoaDon,
    ngayTao: data.ngayTao ? new Date(data.ngayTao).toLocaleString("vi-VN") : "—",

    tenKhachHang: data.tenKhachHang ?? "",
    sdt: data.soDienThoaiKhachHang ?? "",
    email: data.emailKhachHang ?? "",

    diaChi: data.diaChiKhachHang ?? "",
    ghiChu: data.ghiChu ?? "",
    loaiDon: data.loaiDon,

    tongTien: data.tongTien ?? 0,
    giamGia: data.tongTienGiam ?? 0,
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

    nguoiTaoId: data.nguoiTao ?? data.nguoi_tao ?? null,
    nguoiCapNhatId: data.nguoiCapNhat ?? data.nguoi_cap_nhat ?? null,
    daHoanPhi: data.daHoanPhi,
  };

  const [lsThaoTacBE, lsThanhToanBE] = await Promise.all([
    taiLichSuThaoTacTuBE(id),
    taiLichSuThanhToanTuBE(id),
  ]);

  lichSuThaoTac.value = boSungLichSuMacDinhTuHoaDon(lsThaoTacBE, data);
  lichSuThanhToan.value = lsThanhToanBE;

  await ganTenTaiKhoanChoLichSu();
};

watch(
  () => hoaDonIdHienTai.value,
  (id) => id && loadChiTiet(id),
  { immediate: true }
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

const cleanupFns = [];

onMounted(() => {
  const ids = ["modalEdit", "modalThanhToan", "modalLichSu"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const onHide = () => {
      try {
        document.activeElement?.blur?.();
      } catch (e) {}
    };

    el.addEventListener("hide.bs.modal", onHide);
    el.addEventListener("hidden.bs.modal", onHide);

    cleanupFns.push(() => {
      el.removeEventListener("hide.bs.modal", onHide);
      el.removeEventListener("hidden.bs.modal", onHide);
    });
  });
});

onBeforeUnmount(() => {
  cleanupFns.forEach((fn) => {
    try {
      fn();
    } catch (e) {}
  });
});
</script>

<style scoped>
.ss-font {
  font-family: inherit;
  color: rgba(17, 24, 39, 0.82);
}

.order-page :deep(b),
.order-page :deep(strong),
.order-page :deep(.fw-bold),
.order-page :deep(.fw-semibold),
.order-page :deep(.bold) {
  font-weight: 400 !important;
}

.order-page {
  background: #f5f6fa;
  min-height: 100vh;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-header h5 {
  font-size: 20px;
  font-weight: 500 !important;
  letter-spacing: 0.2px;
  margin: 0;
  color: rgba(17, 24, 39, 0.9);
}
.order-header .small {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55) !important;
}

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
.ss-card .card-body {
  position: relative;
  padding-bottom: 60px;
}

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

/* ✅ nếu chỉ có 1 icon thì căn giữa + ẩn line */
.ss-status.ss-status-single {
  justify-content: center;
}
.ss-status.ss-status-single::before {
  display: none;
}
.ss-status.ss-status-single .ss-step {
  flex: 0 0 auto;
  width: 180px;
}

.ss-step {
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
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

/* ✅ MÀU ĐỎ */
.ss-step.done .ss-icon {
  border-color: #dc3545;
  background: #dc3545;
  color: #fff;
}
.ss-step.active .ss-icon {
  border-color: #dc3545;
  color: #dc3545;
  background: #fff5f5;
}
.ss-step.done span,
.ss-step.active span {
  color: #dc3545;
  font-weight: 400 !important;
}
.ss-step.cancelled .ss-icon {
  border-color: #dc3545;
  background: #fee2e2;
  color: #dc3545;
}
.ss-step.cancelled span { color: #dc3545; }
.ss-step.request-cancel .ss-icon {
  border-color: #f97316;
  background: #fff7ed;
  color: #f97316;
}
.ss-step.request-cancel span { color: #f97316; }

.ss-step-meta {
  margin: 6px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  max-width: 160px;
}
.ss-step-time,
.ss-step-user {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 1.25;
  color: rgba(17, 24, 39, 0.55);
}

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

.table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.table thead th {
  background: #f8f9fa;
  font-size: 13px;
  text-transform: none;
  color: rgba(17, 24, 39, 0.75);
  border-bottom: none;
  font-weight: 500;
}
.table tbody td {
  font-weight: 400;
}
.table tbody tr:hover {
  background: rgba(17, 24, 39, 0.03);
}
.table .text-danger {
  font-weight: 400 !important;
}

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
  font-weight: 500;
  color: rgba(220, 53, 69, 0.92);
}

button.btn {
  border-radius: 10px;
  font-weight: 400 !important;
  font-size: 13px;
  line-height: 1;
  transition: all 0.25s ease;
}
button.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
}
button.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none;
  color: #fff;
}

.sticky-summary {
  position: sticky;
  top: 90px;
}
@media (max-width: 992px) {
  .sticky-summary {
    position: static;
  }
}

.empty-history {
  padding: 10px 0;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
}

@media (max-width: 768px) {
  .ss-status {
    flex-direction: column;
    gap: 25px;
  }
  .ss-status::before {
    display: none;
  }
}

.btn-history {
  position: absolute;
  bottom: 15px;
  right: 20px;
  background: #dc3545;
  color: white;
  border: none;
  font-size: 12px;
  border-radius: 20px;
  padding: 6px 16px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.25);
}

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
.history-body::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(220, 53, 69, 0.25);
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
  background: #dc3545;
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
.history-user {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.72);
  margin-bottom: 6px;
}
.history-text {
  font-size: 13px;
}
</style>