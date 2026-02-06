<template>
  <div class="p-4">
    <h5 class="fw-bold text-danger mb-3">Quản Lý Hóa Đơn</h5>

    <!-- TRẠNG THÁI -->
    <div class="card mb-4">
      <div class="card-body">
        <h6 class="fw-bold mb-3">Trạng Thái Đơn Hàng</h6>

        <div class="order-status" :style="{ '--progress': progressPercent + '%' }">
          <div v-for="(st, i) in trangThaiList" :key="i" class="status-step">
            <div
              class="icon-circle"
              :class="{
                done: i < selectedHD.trangThai,
                current: i === selectedHD.trangThai,
              }"
            >
              <i class="bi" :class="st.icon"></i>
            </div>
            <div class="status-label">{{ st.label }}</div>
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button
            class="btn btn-secondary"
            :disabled="selectedHD.id === null || selectedHD.trangThai >= trangThaiList.length - 1"
            @click="nextTrangThai"
          >
            Tiếp tục
          </button>

          <button class="btn btn-primary" @click="showHistory = true">
            <i class="bi bi-clock-history me-1"></i>
            Lịch sử hóa đơn
          </button>
        </div>
      </div>
    </div>

    <!-- THÔNG TIN ĐƠN -->
    <div class="card mb-4">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <b>
            Thông tin đơn hàng có mã hóa đơn:
            <span class="text-primary">{{ selectedHD.maHD }}</span>
          </b>
        </div>
      </div>
    </div>

    <!-- SẢN PHẨM -->
    <div class="card mb-4">
      <div class="card-body">
        <table class="table align-middle">
          <thead class="table-light">
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Giá</th>
              <th>Tổng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sp in selectedHD.sanPham" :key="sp.id">
              <td>SP #{{ sp.idChiTietSanPham }}</td>
              <td>{{ sp.soLuong }}</td>
              <td>{{ sp.donGia.toLocaleString() }} đ</td>
              <td class="fw-bold">{{ sp.thanhTien.toLocaleString() }} đ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- KHÁCH HÀNG + HÓA ĐƠN -->
    <div class="row g-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h6 class="fw-bold mb-3">Thông tin khách hàng</h6>

            <div class="mb-3">
              <label>Địa chỉ</label>
              <input class="form-control" v-model="selectedHD.diaChi" />
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label>Tên người nhận</label>
                <input class="form-control" v-model="selectedHD.tenKhachHang" />
              </div>
              <div class="col-md-6">
                <label>Số điện thoại</label>
                <input class="form-control" v-model="selectedHD.sdt" />
              </div>
            </div>

            <div class="mt-3">
              <label>Ghi chú</label>
              <textarea class="form-control" rows="4" v-model="selectedHD.ghiChu" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h6 class="fw-bold mb-3">Hóa đơn</h6>

            <div class="d-flex justify-content-between mb-2">
              <span>Tổng tiền:</span>
              <span>{{ hoaDon.tongTien.toLocaleString() }} đ</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span>Giảm giá:</span>
              <span class="text-success"> - {{ hoaDon.giamGia.toLocaleString() }} đ </span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span>Phí vận chuyển:</span>
              <span>+ {{ hoaDon.phiVanChuyen.toLocaleString() }} đ</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span>Phụ phí:</span>
              <span>+ {{ hoaDon.phuPhi.toLocaleString() }} đ</span>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <span>Hoàn phí:</span>
              <span class="text-danger"> - {{ hoaDon.hoanPhi.toLocaleString() }} đ </span>
            </div>

            <hr />

            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fw-bold">Cần thanh toán:</span>
              <span class="fw-bold text-danger fs-5">
                {{ hoaDon.canThanhToan.toLocaleString() }} đ
              </span>
            </div>

            <button class="btn btn-primary w-100 mb-2" @click="capNhatHoaDon">
              CẬP NHẬT ĐƠN HÀNG
            </button>

            <button class="btn btn-outline-secondary w-100" @click="quayLai">Quay lại</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showHistory" class="modal-overlay">
      <div class="history-modal">
        <h5 class="fw-bold mb-4 text-center">📜 Lịch sử hóa đơn</h5>

        <div class="timeline">
          <div class="timeline-item" v-for="(item, index) in lichSuTrangThai" :key="index">
            <div class="dot"></div>
            <div class="content">
              <div class="fw-semibold">{{ item.label }}</div>
              <small class="text-muted">{{ item.time }}</small>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary w-100 mt-4" @click="showHistory = false">Đóng</button>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="showPaymentHistory" class="modal-overlay">
      <div class="history-modal">
        <h5 class="fw-bold mb-4 text-center">💰 Lịch sử thanh toán</h5>

        <table class="table table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in lichSuThanhToan" :key="i">
              <td class="fw-bold text-success">{{ item.soTien.toLocaleString() }} đ</td>
              <td>{{ item.phuongThuc }}</td>
              <td>{{ item.time }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="lichSuThanhToan.length === 0" class="text-center text-muted">
          Chưa có thanh toán nào
        </div>

        <button class="btn btn-secondary w-100 mt-3" @click="showPaymentHistory = false">
          Đóng
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const API_HD = 'http://localhost:8080/api/admin/hoa-don'

const trangThaiMap = {
  CHO_XAC_NHAN: 0,
  DA_THANH_TOAN: 1,
  CHO_GIAO: 2,
  DANG_GIAO: 3,
  HOAN_THANH: 4,
}

const trangThaiList = [
  { label: 'Chờ xác nhận', icon: 'bi-cart-check' },
  { label: 'Đã thanh toán', icon: 'bi-cash-stack' },
  { label: 'Chờ giao', icon: 'bi-truck' },
  { label: 'Đang giao', icon: 'bi-truck-front' },
  { label: 'Hoàn thành', icon: 'bi-star-fill' },
]

const selectedHD = ref({
  id: null,
  sanPham: [],
  tongTien: 0,
  daThanhToan: 0,
  trangThai: 0,
})

const showHistory = ref(false)

const lichSuTrangThai = ref([{ label: 'Chờ xác nhận', time: '10:30 01/01/2026' }])

const loadChiTiet = async (id) => {
  const { data } = await axios.get(`${API_HD}/${id}`)
  selectedHD.value = {
    id: data.id,
    maHD: data.maHoaDon,
    tenKhachHang: data.tenKhachHang ?? '',
    sdt: data.soDienThoaiKhachHang ?? '',
    diaChi: data.diaChiKhachHang ?? '',
    ghiChu: data.ghiChu ?? '',
    tongTien: data.tongTien ?? 0,
    daThanhToan: data.tongTienSauGiam ?? 0,
    trangThai: trangThaiMap[data.trangThaiHienTai?.trim()] ?? 0,
    sanPham: data.sanPham ?? [],
  }
}

watch(
  () => route.params.id,
  (id) => id && loadChiTiet(id),
  { immediate: true },
)

const progressPercent = computed(
  () => (selectedHD.value.trangThai / (trangThaiList.length - 1)) * 100,
)

const nextTrangThai = () => {
  if (!selectedHD.value.id) return

  if (selectedHD.value.trangThai >= trangThaiList.length - 1) return

  const next = selectedHD.value.trangThai + 1

  selectedHD.value.trangThai = next

  lichSuTrangThai.value.push({
    label: trangThaiList[next].label,
    time: new Date().toLocaleString(),
  })
}

const hoaDon = computed(() => {
  const tongTien = selectedHD.value.tongTien
  const giamGia = selectedHD.value.giamGia ?? 0
  const phiVanChuyen = selectedHD.value.phiVanChuyen ?? 0
  const phuPhi = selectedHD.value.phuPhi ?? 0
  const hoanPhi = selectedHD.value.hoanPhi ?? 0
  const daThanhToan = selectedHD.value.daThanhToan ?? 0

  return {
    tongTien,
    giamGia,
    phiVanChuyen,
    phuPhi,
    hoanPhi,
    canThanhToan: tongTien - giamGia + phiVanChuyen + phuPhi - hoanPhi - daThanhToan,
  }
})

const capNhatHoaDon = async () => {
  const trangThaiString = Object.keys(trangThaiMap).find(
    (k) => trangThaiMap[k] === selectedHD.value.trangThai,
  )

  await axios.put(`${API_HD}/${selectedHD.value.id}`, {
    tenKhachHang: selectedHD.value.tenKhachHang,
    soDienThoaiKhachHang: selectedHD.value.sdt,
    diaChiKhachHang: selectedHD.value.diaChi,
    ghiChu: selectedHD.value.ghiChu,
    trangThaiHienTai: trangThaiString,
  })

  // ✅ THÊM LỊCH SỬ SAU KHI CẬP NHẬT
  lichSuTrangThai.value.push({
    label: `Cập nhật đơn hàng (${trangThaiList[selectedHD.value.trangThai].label})`,
    time: new Date().toLocaleString(),
  })

  alert('✅ Cập nhật thành công')
}

watch(
  lichSuTrangThai,
  () => {
    localStorage.setItem('lichSuHD_' + selectedHD.value.id, JSON.stringify(lichSuTrangThai.value))
  },
  { deep: true },
)

onMounted(() => {
  const data = localStorage.getItem('lichSuHD_' + route.params.id)
  if (data) {
    lichSuTrangThai.value = JSON.parse(data)
  }
})

const quayLai = () => router.push('/hoa-don')
</script>

<style scoped>
.order-status {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 20px;
}

.status-step {
  flex: 1;
  text-align: center;
  position: relative;
}
.icon-circle {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  border: 4px solid #ddd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: auto;
}
.icon-circle.done,
.icon-circle.current {
  border-color: #28a745;
  color: #28a745;
}
.status-label {
  margin-top: 10px;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-modal {
  background: #fff;
  width: 420px;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.timeline {
  position: relative;
  margin-left: 15px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #28a745;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.dot {
  width: 16px;
  height: 16px;
  background: #28a745;
  border-radius: 50%;
  margin-top: 3px;
  z-index: 1;
}

.content {
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 10px;
  flex: 1;
}
</style>
