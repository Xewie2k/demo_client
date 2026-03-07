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
            <span v-if="order.trangThaiHienTai === 6" class="badge bg-danger ms-2">Đã hủy</span>
          </div>
          <div class="text-muted mb-1">
            Trạng thái: <span class="fw-bold" style="color: var(--ss-accent);">{{ order.trangThai }}</span>
          </div>
          <div class="text-muted small">
            Thanh toán: <span class="fw-semibold">{{ order.loaiThanhToan === 1 ? 'Chuyển khoản' : 'Tiền mặt (COD)' }}</span>
          </div>
        </div>
        <div class="col-md-4 text-end">
          <div class="fw-bold fs-4" style="color: var(--ss-accent);">{{ formatCurrency(order.tongTien) }}</div>
          <div class="text-muted small">{{ formatDate(order.ngayTao) }}</div>
        </div>
      </div>

      <!-- Action buttons for CHỜ XÁC NHẬN -->
      <div v-if="order.trangThaiHienTai === 1" class="mb-4 d-flex gap-2 flex-wrap">
        <button class="btn btn-outline-danger" @click="showCancelModal = true">
          <i class="bi bi-x-circle me-1"></i> Hủy đơn hàng
        </button>
        <template v-if="order.loaiThanhToan === 0">
          <button class="btn btn-outline-primary" @click="openDeliveryModal">
            <i class="bi bi-pencil me-1"></i> Sửa thông tin giao hàng
          </button>
          <button class="btn btn-outline-secondary" @click="openItemsModal">
            <i class="bi bi-cart-check me-1"></i> Sửa sản phẩm
          </button>
        </template>
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
            <template v-for="(item, index) in order.items" :key="index">
              <tr>
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
              <!-- Dòng vàng thông báo thay đổi giá -->
              <tr v-if="item.donGiaCu" style="background-color: #fff3cd;">
                <td colspan="5" class="py-1 ps-3 small" style="color: #856404;">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  Giá đổi từ <strong>{{ formatCurrency(item.donGiaCu) }}</strong> thành <strong>{{ formatCurrency(item.donGia) }}</strong>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="row justify-content-end mb-5">
        <div class="col-md-5">
          <div class="bg-light p-3 rounded">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Tạm tính</span>
              <span class="fw-bold">{{ formatCurrency(displayTamTinh) }}</span>
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

    <!-- Modal Hủy đơn -->
    <div v-if="showCancelModal" class="modal d-block" style="background: rgba(0,0,0,0.5);" @click.self="showCancelModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận hủy đơn hàng</h5>
            <button type="button" class="btn-close" @click="showCancelModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Bạn có chắc chắn muốn hủy đơn hàng <strong>{{ order.maHoaDon }}</strong> không?</p>
            <div v-if="order.loaiThanhToan === 1" class="alert alert-warning small">
              <i class="bi bi-info-circle me-1"></i>
              Đây là đơn chuyển khoản. Sau khi hủy, cửa hàng sẽ liên hệ để hoàn tiền cho bạn.
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Lý do hủy (tùy chọn)</label>
              <textarea v-model="cancelReason" class="form-control form-control-sm" rows="2" placeholder="Nhập lý do hủy..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="showCancelModal = false">Không</button>
            <button class="btn btn-danger btn-sm" :disabled="cancelLoading" @click="cancelOrder">
              <span v-if="cancelLoading" class="spinner-border spinner-border-sm me-1"></span>
              Hủy đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Sửa thông tin giao hàng -->
    <div v-if="showDeliveryModal" class="modal d-block" style="background: rgba(0,0,0,0.5);" @click.self="showDeliveryModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sửa thông tin giao hàng</h5>
            <button type="button" class="btn-close" @click="showDeliveryModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Tên người nhận</label>
              <input v-model="deliveryForm.tenKhachHang" type="text" class="form-control form-control-sm">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Số điện thoại</label>
              <input v-model="deliveryForm.soDienThoaiKhachHang" type="text" class="form-control form-control-sm">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Địa chỉ</label>
              <input v-model="deliveryForm.diaChiKhachHang" type="text" class="form-control form-control-sm">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="showDeliveryModal = false">Hủy</button>
            <button class="btn btn-primary btn-sm" :disabled="deliveryLoading" @click="saveDeliveryInfo">
              <span v-if="deliveryLoading" class="spinner-border spinner-border-sm me-1"></span>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Sửa sản phẩm -->
    <div v-if="showItemsModal" class="modal d-block" style="background: rgba(0,0,0,0.5);" @click.self="showItemsModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sửa sản phẩm trong đơn hàng</h5>
            <button type="button" class="btn-close" @click="showItemsModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="editItems.length === 0" class="text-center text-muted py-3">Không có sản phẩm</div>
            <div v-for="(item, i) in editItems" :key="i" class="d-flex align-items-center mb-3 p-2 bg-light rounded">
              <img :src="item.anhDaiDien || 'https://placehold.co/50x50'" class="rounded me-3" width="50" height="50" style="object-fit:cover;">
              <div class="flex-grow-1">
                <div class="fw-semibold small">{{ item.tenSanPham }}</div>
                <div class="text-muted small">{{ item.phanLoai }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-secondary btn-sm px-2" @click="decreaseQty(i)" :disabled="item.soLuong <= 1">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="fw-bold px-2">{{ item.soLuong }}</span>
                <button class="btn btn-outline-secondary btn-sm px-2" @click="item.soLuong++">
                  <i class="bi bi-plus"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm px-2 ms-2" @click="removeItem(i)"
                  :disabled="editItems.length <= 1" :title="editItems.length <= 1 ? 'Phải còn ít nhất 1 sản phẩm' : 'Xóa'">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <div v-if="editItems.length <= 1" class="alert alert-warning small mt-2">
              <i class="bi bi-exclamation-triangle me-1"></i> Đơn hàng phải có ít nhất 1 sản phẩm.
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="showItemsModal = false">Hủy</button>
            <button class="btn btn-primary btn-sm" :disabled="itemsLoading || editItems.length === 0" @click="saveItems">
              <span v-if="itemsLoading" class="spinner-border spinner-border-sm me-1"></span>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/apiClient';
import OrderTimeline from '@/components/client/OrderTimeline.vue';

const route = useRoute();
const order = ref(null);
const loading = ref(true);

const showCancelModal = ref(false);
const cancelReason = ref('');
const cancelLoading = ref(false);

const showDeliveryModal = ref(false);
const deliveryLoading = ref(false);
const deliveryForm = ref({ tenKhachHang: '', soDienThoaiKhachHang: '', diaChiKhachHang: '' });

const showItemsModal = ref(false);
const itemsLoading = ref(false);
const editItems = ref([]);

const displayTamTinh = computed(() =>
  (order.value?.items || []).reduce((s, i) => s + (i.donGia || 0) * (i.soLuong || 0), 0)
);

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

const cancelOrder = async () => {
  if (!order.value) return;
  cancelLoading.value = true;
  try {
    await apiClient.post(`/api/client/hoa-don/${order.value.id}/cancel`, {
      khachHangId: order.value.idKhachHang,
      lyDo: cancelReason.value || null
    });
    showCancelModal.value = false;
    cancelReason.value = '';
    await fetchOrderDetail();
  } catch (err) {
    alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
  } finally {
    cancelLoading.value = false;
  }
};

const openDeliveryModal = () => {
  deliveryForm.value = {
    tenKhachHang: order.value.tenNguoiNhan || '',
    soDienThoaiKhachHang: order.value.soDienThoai || '',
    diaChiKhachHang: order.value.diaChi || ''
  };
  showDeliveryModal.value = true;
};

const saveDeliveryInfo = async () => {
  if (!order.value) return;
  deliveryLoading.value = true;
  try {
    await apiClient.put(`/api/client/hoa-don/${order.value.id}/delivery-info`, {
      khachHangId: order.value.idKhachHang,
      ...deliveryForm.value
    });
    showDeliveryModal.value = false;
    await fetchOrderDetail();
  } catch (err) {
    alert(err.response?.data?.message || 'Không thể cập nhật thông tin giao hàng');
  } finally {
    deliveryLoading.value = false;
  }
};

const openItemsModal = () => {
  editItems.value = (order.value.items || []).map(item => ({ ...item }));
  showItemsModal.value = true;
};

const decreaseQty = (i) => {
  if (editItems.value[i].soLuong > 1) editItems.value[i].soLuong--;
};

const removeItem = (i) => {
  if (editItems.value.length > 1) editItems.value.splice(i, 1);
};

const saveItems = async () => {
  if (!order.value || editItems.value.length === 0) return;
  itemsLoading.value = true;
  try {
    await apiClient.put(`/api/client/hoa-don/${order.value.id}/items`, {
      khachHangId: order.value.idKhachHang,
      items: editItems.value.map(item => ({
        idChiTietSanPham: item.idChiTietSanPham,
        soLuong: item.soLuong,
        xoaMem: false
      }))
    });
    showItemsModal.value = false;
    await fetchOrderDetail();
  } catch (err) {
    alert(err.response?.data?.message || 'Không thể cập nhật sản phẩm');
  } finally {
    itemsLoading.value = false;
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
