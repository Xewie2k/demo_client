<template>
  <div class="bg-white p-4 rounded-3 shadow-sm h-100">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" style="color: var(--ss-accent);" role="status"></div>
    </div>

    <div v-else-if="order">
      <!-- Header -->
      <div class="row mb-4 border-bottom pb-3">
        <div class="col-md-8">
          <div class="mb-2">
            <span class="fw-bold fs-5 me-2">Đơn hàng {{ order.maHoaDon }}</span>
          </div>
          <div class="text-muted mb-1">
            Trạng thái: <span class="fw-bold" style="color: var(--ss-accent);">{{ order.trangThai }}</span>
          </div>
        </div>
        <div class="col-md-4 text-end">
          <div class="fw-bold fs-4" style="color: var(--ss-accent);">{{ formatCurrency(order.tongTien) }}</div>
          <div class="text-muted small">{{ formatDate(order.ngayTao) }}</div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-5 px-3">
        <h6 class="fw-bold mb-4 border-start border-4 ps-2" style="border-color: var(--ss-accent) !important;">Trạng thái đơn hàng</h6>
        <OrderTimeline :status-code="order.trangThaiHienTai" :timeline="order.timeline" />
      </div>

      <!-- Receiver -->
      <div class="mb-5">
        <h6 class="fw-bold mb-3 border-start border-4 ps-2" style="border-color: var(--ss-accent) !important;">Địa chỉ nhận hàng</h6>
        <div class="p-3 bg-light rounded border-start border-4">
          <div class="d-flex align-items-center mb-2">
            <i class="bi bi-person-circle me-2 text-secondary"></i>
            <span class="fw-bold">{{ order.tenNguoiNhan }}</span>
            <span class="mx-2 text-muted">|</span>
            <span>{{ order.soDienThoai }}</span>
          </div>
          <div class="d-flex align-items-start">
            <i class="bi bi-geo-alt-fill me-2" style="color: var(--ss-accent);"></i>
            <span class="text-muted">{{ order.diaChi }}</span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="table-responsive mb-4">
        <table class="table table-hover align-middle">
          <thead class="bg-light text-secondary small text-uppercase">
            <tr>
              <th class="border-0 py-3 ps-3">#</th>
              <th class="border-0 py-3">Sản phẩm</th>
              <th class="border-0 py-3 text-end">Đơn giá</th>
              <th class="border-0 py-3 text-center">Số lượng</th>
              <th class="border-0 py-3 text-end pe-3">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in order.items" :key="index">
              <td class="ps-3 fw-bold text-muted">{{ index + 1 }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <img :src="item.anhDaiDien || 'https://placehold.co/60x60'" class="rounded border me-3" width="60" height="60" style="object-fit: cover;">
                  <div>
                    <div class="fw-bold mb-1 text-dark">{{ item.tenSanPham }}</div>
                    <div class="text-muted small">{{ item.phanLoai }}</div>
                  </div>
                </div>
              </td>
              <td class="text-end fw-bold">{{ formatCurrency(item.donGia) }}</td>
              <td class="text-center">{{ item.soLuong }}</td>
              <td class="text-end fw-bold pe-3" style="color: var(--ss-accent);">{{ formatCurrency(item.thanhTien) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="row justify-content-end mb-5">
        <div class="col-md-5">
          <div class="bg-light p-3 rounded">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Tạm tính</span>
              <span class="fw-bold">{{ formatCurrency(order.tamTinh) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Phí vận chuyển</span>
              <span class="fw-bold">{{ formatCurrency(order.phiVanChuyen) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
              <span class="text-muted">Giảm giá</span>
              <span class="fw-bold text-success">- {{ formatCurrency(order.giamGia) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold fs-5">Tổng cộng</span>
              <span class="fw-bold fs-4" style="color: var(--ss-accent);">{{ formatCurrency(order.tongTien) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex justify-content-between align-items-center pt-3 border-top">
        <router-link to="/client/account/orders" class="btn btn-outline-dark">
          <i class="bi bi-arrow-left me-1"></i> Quay lại danh sách
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/apiClient';
import OrderTimeline from '@/components/client/OrderTimeline.vue';

const route = useRoute();
const order = ref(null);
const loading = ref(true);

const fetchOrderDetail = async () => {
  try {
    const id = route.params.id;
    const res = await apiClient.get(`/api/client/orders/${id}`);
    order.value = res.data;
  } catch (error) {
    console.error("Failed to fetch order detail", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (value) => {
  if (!value) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

onMounted(fetchOrderDetail);
</script>
