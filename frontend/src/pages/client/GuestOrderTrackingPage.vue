<template>
  <div class="container py-5">
    <!-- Logged-in user mode -->
    <div v-if="isLoggedIn">
      <div class="text-center mb-4">
        <h4 class="fw-bold">Tra cứu đơn hàng</h4>
        <p class="text-muted">Theo dõi trạng thái đơn hàng của bạn</p>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'my-orders' }" @click="activeTab = 'my-orders'">
            <i class="bi bi-bag me-1"></i> Đơn hàng của tôi
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link" :class="{ active: activeTab === 'tracking' }" @click="activeTab = 'tracking'">
            <i class="bi bi-search me-1"></i> Tra cứu bằng mã
          </button>
        </li>
      </ul>

      <!-- Tab 1: My Orders -->
      <div v-if="activeTab === 'my-orders'">
        <div v-if="myOrdersLoading" class="text-center py-5">
          <div class="spinner-border" style="color: var(--ss-accent);" role="status"></div>
        </div>

        <div v-else-if="myOrders.length === 0" class="text-center py-5">
          <i class="bi bi-clipboard-x text-muted" style="font-size: 3rem;"></i>
          <p class="text-muted mt-3">Chưa có đơn hàng nào</p>
          <router-link to="/client/products" class="btn text-white" style="background-color: var(--ss-accent);">Mua sắm ngay</router-link>
        </div>

        <!-- Order Detail View -->
        <div v-else-if="selectedOrder">
          <button class="btn btn-outline-dark btn-sm mb-3" @click="selectedOrder = null">
            <i class="bi bi-arrow-left me-1"></i> Quay lại danh sách
          </button>
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-0 fw-bold">Đơn hàng {{ selectedOrder.maHoaDon }}</h5>
                  <small class="text-muted">{{ formatDate(selectedOrder.ngayTao) }}</small>
                </div>
                <span class="badge rounded-pill px-3 py-2" :class="getStatusBadgeClass(selectedOrder.trangThai)">
                  {{ selectedOrder.trangThai }}
                </span>
              </div>
            </div>
            <div class="card-body p-4">
              <!-- Timeline -->
              <div class="mb-4">
                <h6 class="fw-bold mb-3 border-start border-4 ps-2" style="border-color: var(--ss-accent) !important;">Trạng thái đơn hàng</h6>
                <OrderTimeline :status-code="selectedOrder.trangThaiHienTai" :timeline="selectedOrder.timeline" />
              </div>

              <!-- Receiver Info -->
              <div class="mb-4">
                <h6 class="fw-bold mb-3 border-start border-4 ps-2" style="border-color: var(--ss-accent) !important;">Thông tin nhận hàng</h6>
                <div class="p-3 bg-light rounded border-start border-4">
                  <div class="d-flex align-items-center mb-2">
                    <i class="bi bi-person-circle me-2 text-secondary"></i>
                    <span class="fw-bold">{{ selectedOrder.tenNguoiNhan }}</span>
                    <span class="mx-2 text-muted">|</span>
                    <span>{{ selectedOrder.soDienThoai }}</span>
                  </div>
                  <div class="d-flex align-items-start">
                    <i class="bi bi-geo-alt-fill me-2" style="color: var(--ss-accent);"></i>
                    <span class="text-muted">{{ selectedOrder.diaChi }}</span>
                  </div>
                </div>
              </div>

              <!-- Items -->
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
                    <tr v-for="(item, index) in selectedOrder.items" :key="index">
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
              <div class="row justify-content-end">
                <div class="col-md-5">
                  <div class="bg-light p-3 rounded">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Tạm tính</span>
                      <span class="fw-bold">{{ formatCurrency(selectedOrder.tamTinh) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Phí vận chuyển</span>
                      <span class="fw-bold">{{ formatCurrency(selectedOrder.phiVanChuyen) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3 border-bottom pb-2">
                      <span class="text-muted">Giảm giá</span>
                      <span class="fw-bold text-success">- {{ formatCurrency(selectedOrder.giamGia) }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="fw-bold fs-5">Tổng cộng</span>
                      <span class="fw-bold fs-4" style="color: var(--ss-accent);">{{ formatCurrency(selectedOrder.tongTien) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order List -->
        <div v-else>
          <div v-for="order in paginatedMyOrders" :key="order.id" class="card mb-3 border rounded-3 overflow-hidden">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3 px-3">
              <div class="d-flex align-items-center gap-2">
                <span class="fw-bold">{{ order.maHoaDon }}</span>
                <span class="text-muted small">{{ formatDate(order.ngayTao) }}</span>
              </div>
              <span class="badge rounded-pill px-3 py-1" :class="getStatusBadgeClass(order.trangThai)">
                {{ order.trangThai }}
              </span>
            </div>
            <div class="card-body px-3 py-3">
              <div class="d-flex align-items-center">
                <div class="me-3 flex-shrink-0">
                  <img :src="order.anhDaiDien || 'https://placehold.co/70x70'" class="border rounded" width="70" height="70" style="object-fit: cover;">
                </div>
                <div class="flex-grow-1 min-w-0">
                  <h6 class="mb-1 text-dark fw-bold text-truncate">{{ order.sanPhamDaiDien || 'Sản phẩm' }}</h6>
                  <div class="text-muted small" v-if="order.soLuongSanPham > 1">
                    + {{ order.soLuongSanPham - 1 }} sản phẩm khác
                  </div>
                </div>
                <div class="text-end ms-3 flex-shrink-0">
                  <div class="text-muted small mb-1">Tổng tiền</div>
                  <div class="fw-bold fs-6" style="color: var(--ss-accent);">{{ formatCurrency(order.tongTien) }}</div>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white border-top d-flex justify-content-end py-2 px-3">
              <button class="btn btn-sm text-white px-4" style="background-color: var(--ss-accent);" @click="viewOrderDetail(order.id)">
                Xem chi tiết
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-center mt-3">
            <nav aria-label="Phân trang đơn hàng">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: myOrdersPage === 1 }">
                  <button class="page-link rounded-start-pill" @click="goToOrderPage(myOrdersPage - 1)" :disabled="myOrdersPage === 1">
                    <i class="bi bi-chevron-left" style="font-size:11px;"></i>
                  </button>
                </li>
                <li v-for="(p, idx) in myOrdersPageRange" :key="idx" class="page-item"
                  :class="{ active: p === myOrdersPage, disabled: p === '...' }">
                  <button class="page-link" @click="goToOrderPage(p)">{{ p }}</button>
                </li>
                <li class="page-item" :class="{ disabled: myOrdersPage === myOrdersTotalPages }">
                  <button class="page-link rounded-end-pill" @click="goToOrderPage(myOrdersPage + 1)" :disabled="myOrdersPage === myOrdersTotalPages">
                    <i class="bi bi-chevron-right" style="font-size:11px;"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Tab 2: Track by code -->
      <div v-if="activeTab === 'tracking'">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <p class="text-muted text-center mb-4">Nhập mã đơn hàng và email để tra cứu</p>
                <form @submit.prevent="trackByCode">
                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-secondary">Mã đơn hàng</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-receipt text-muted"></i></span>
                      <input type="text" class="form-control border-start-0 ps-0" v-model="trackingForm.maHoaDon" placeholder="Nhập mã đơn hàng (VD: HD0001234)" required>
                    </div>
                  </div>
                  <div class="mb-4">
                    <label class="form-label small fw-semibold text-secondary">Email</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                      <input type="email" class="form-control border-start-0 ps-0" v-model="trackingForm.email" placeholder="Email đặt hàng" required>
                    </div>
                  </div>
                  <button type="submit" class="btn w-100 text-white fw-bold" style="background-color: var(--ss-accent);" :disabled="trackingLoading">
                    <span v-if="trackingLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Tra cứu
                  </button>
                </form>
              </div>
            </div>

            <!-- Tracking Result -->
            <div v-if="trackingError" class="alert alert-danger mt-3 text-center">{{ trackingError }}</div>
            <div v-if="trackedOrder" class="card border-0 shadow-sm mt-4">
              <div class="card-header bg-white border-bottom py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-0 fw-bold">Đơn hàng #{{ trackedOrder.id }}</h6>
                    <small class="text-muted">{{ formatDate(trackedOrder.ngayTao) }}</small>
                  </div>
                  <span class="badge bg-dark px-3 py-2">{{ getStatusName(trackedOrder.trangThaiHienTai) }}</span>
                </div>
              </div>
              <div class="card-body p-4">
                <!-- Timeline Progress -->
                <div class="position-relative my-5 mx-3">
                  <div class="progress" style="height: 3px;">
                    <div class="progress-bar" role="progressbar" :style="{ width: progressWidth + '%', backgroundColor: 'var(--ss-accent)' }"></div>
                  </div>
                  <div class="d-flex justify-content-between position-absolute top-0 w-100 translate-middle-y">
                    <div v-for="step in steps" :key="step.code" class="text-center bg-white px-2">
                      <div class="rounded-circle border d-flex align-items-center justify-content-center mx-auto shadow-sm"
                           :style="trackedOrder.trangThaiHienTai >= step.code ? { borderColor: 'var(--ss-accent)', color: 'var(--ss-accent)', backgroundColor: '#fff5f5' } : {}"
                           :class="trackedOrder.trangThaiHienTai >= step.code ? '' : 'border-secondary text-muted'"
                           style="width: 40px; height: 40px; transition: all 0.3s;">
                        <i :class="step.icon"></i>
                      </div>
                      <small class="d-block mt-2 fw-bold" :style="trackedOrder.trangThaiHienTai >= step.code ? { color: 'var(--ss-accent)' } : {}" :class="trackedOrder.trangThaiHienTai >= step.code ? '' : 'text-muted'" style="font-size: 12px;">
                        {{ step.label }}
                      </small>
                    </div>
                  </div>
                </div>

                <hr class="my-4">

                <div class="row g-4">
                  <div class="col-md-6">
                    <h6 class="fw-bold text-uppercase text-secondary small mb-3">Thông tin nhận hàng</h6>
                    <p class="mb-1 fw-bold">{{ trackedOrder.tenKhachHang }}</p>
                    <p class="mb-1"><i class="bi bi-telephone me-2 text-muted"></i>{{ trackedOrder.soDienThoaiKhachHang }}</p>
                    <p class="mb-1"><i class="bi bi-envelope me-2 text-muted"></i>{{ trackedOrder.emailKhachHang }}</p>
                    <p class="mb-0"><i class="bi bi-geo-alt-fill me-2" style="color: var(--ss-accent);"></i>{{ trackedOrder.diaChiKhachHang }}</p>
                  </div>
                  <div class="col-md-6">
                    <h6 class="fw-bold text-uppercase text-secondary small mb-3">Thanh toán</h6>
                    <div v-if="trackedOrder.chiTietHoaDon && trackedOrder.chiTietHoaDon.length">
                      <div v-for="item in trackedOrder.chiTietHoaDon" :key="item.id" class="d-flex justify-content-between mb-2">
                        <span>{{ item.tenSanPham }} x{{ item.soLuong }}</span>
                        <span class="fw-bold">{{ formatCurrency(item.thanhTien) }}</span>
                      </div>
                      <hr class="my-2">
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Tạm tính</span>
                      <span class="fw-bold">{{ formatCurrency(trackedOrder.tongTien) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Phí vận chuyển</span>
                      <span class="fw-bold">{{ formatCurrency(trackedOrder.phiVanChuyen) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Giảm giá</span>
                      <span class="text-success">-{{ formatCurrency(trackedOrder.tongTien - trackedOrder.tongTienSauGiam) }}</span>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-2 mt-2">
                      <span class="fw-bold fs-5">Tổng cộng</span>
                      <span class="fw-bold fs-5" style="color: var(--ss-accent);">{{ formatCurrency(trackedOrder.tongTienSauGiam + (trackedOrder.phiVanChuyen || 0)) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Guest mode (not logged in) -->
    <div v-else>
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" style="color: var(--ss-accent);" role="status"></div>
        <p class="mt-2 text-muted">Đang tải thông tin đơn hàng...</p>
      </div>

      <!-- No query params: show search form -->
      <div v-else-if="!hasQueryParams" class="row justify-content-center">
        <div class="col-md-6">
          <div class="text-center mb-4">
            <h4 class="fw-bold">Tra cứu đơn hàng</h4>
            <p class="text-muted">Nhập mã đơn hàng và email để tra cứu trạng thái</p>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form @submit.prevent="guestTrack">
                <div class="mb-3">
                  <label class="form-label small fw-semibold text-secondary">Mã đơn hàng</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-receipt text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 ps-0" v-model="guestForm.maHoaDon" placeholder="Nhập mã đơn hàng (VD: HD0001234)" required>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label small fw-semibold text-secondary">Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                    <input type="email" class="form-control border-start-0 ps-0" v-model="guestForm.email" placeholder="Email đặt hàng" required>
                  </div>
                </div>
                <button type="submit" class="btn w-100 text-white fw-bold" style="background-color: var(--ss-accent);">
                  Tra cứu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Has query params but error -->
      <div v-else-if="error" class="text-center py-5">
        <div class="alert alert-danger text-center shadow-sm mx-auto" style="max-width: 500px;">
          <h5><i class="bi bi-exclamation-triangle me-2"></i>Lỗi tra cứu</h5>
          <p class="mb-3">{{ error }}</p>
          <router-link to="/client/tracking" class="btn btn-outline-dark">Tra cứu lại</router-link>
        </div>
      </div>

      <!-- Order detail -->
      <div v-else-if="order && order.id" class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0 fw-bold">Đơn hàng #{{ order.id }}</h5>
              <small class="text-muted">Ngày đặt: {{ formatDate(order.ngayTao) }}</small>
            </div>
            <span class="badge bg-dark px-3 py-2">{{ getStatusName(order.trangThaiHienTai) }}</span>
          </div>
        </div>
        <div class="card-body p-4">
          <!-- Timeline -->
          <div class="position-relative my-5 mx-3">
            <div class="progress" style="height: 3px;">
              <div class="progress-bar" role="progressbar" :style="{ width: progressWidth + '%', backgroundColor: 'var(--ss-accent)' }"></div>
            </div>
            <div class="d-flex justify-content-between position-absolute top-0 w-100 translate-middle-y">
              <div v-for="step in steps" :key="step.code" class="text-center bg-white px-2">
                <div class="rounded-circle border d-flex align-items-center justify-content-center mx-auto shadow-sm"
                     :style="order.trangThaiHienTai >= step.code ? { borderColor: 'var(--ss-accent)', color: 'var(--ss-accent)', backgroundColor: '#fff5f5' } : {}"
                     :class="order.trangThaiHienTai >= step.code ? '' : 'border-secondary text-muted'"
                     style="width: 40px; height: 40px; transition: all 0.3s;">
                  <i :class="step.icon"></i>
                </div>
                <small class="d-block mt-2 fw-bold" :style="order.trangThaiHienTai >= step.code ? { color: 'var(--ss-accent)' } : {}" :class="order.trangThaiHienTai >= step.code ? '' : 'text-muted'" style="font-size: 12px;">
                  {{ step.label }}
                </small>
              </div>
            </div>
          </div>

          <hr class="my-4">

          <div class="row g-4">
            <div class="col-md-6">
              <h6 class="fw-bold text-uppercase text-secondary small mb-3">Thông tin nhận hàng</h6>
              <p class="mb-1 fw-bold">{{ order.tenKhachHang }}</p>
              <p class="mb-1"><i class="bi bi-telephone me-2 text-muted"></i>{{ order.soDienThoaiKhachHang }}</p>
              <p class="mb-1"><i class="bi bi-envelope me-2 text-muted"></i>{{ order.emailKhachHang }}</p>
              <p class="mb-0"><i class="bi bi-geo-alt-fill me-2" style="color: var(--ss-accent);"></i>{{ order.diaChiKhachHang }}</p>
            </div>
            <div class="col-md-6">
              <h6 class="fw-bold text-uppercase text-secondary small mb-3">Thanh toán</h6>
              <div v-if="order.chiTietHoaDon && order.chiTietHoaDon.length">
                <div v-for="item in order.chiTietHoaDon" :key="item.id" class="d-flex justify-content-between mb-2">
                  <span>{{ item.tenSanPham }} x{{ item.soLuong }}</span>
                  <span class="fw-bold">{{ formatCurrency(item.thanhTien) }}</span>
                </div>
                <hr class="my-2">
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span class="fw-bold">{{ formatCurrency(order.tongTien) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển</span>
                <span class="fw-bold">{{ formatCurrency(order.phiVanChuyen) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Giảm giá</span>
                <span class="text-success">-{{ formatCurrency(order.tongTien - order.tongTienSauGiam) }}</span>
              </div>
              <div class="d-flex justify-content-between border-top pt-2 mt-2">
                <span class="fw-bold fs-5">Tổng cộng</span>
                <span class="fw-bold fs-5" style="color: var(--ss-accent);">{{ formatCurrency(order.tongTienSauGiam + (order.phiVanChuyen || 0)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found fallback -->
      <div v-else class="text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <p class="mt-3 text-muted">Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và email.</p>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-4 mt-2"
          @click="hasQueryParams = false; error = null; loading = false">
          Tra cứu lại
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';
import OrderTimeline from '@/components/client/OrderTimeline.vue';

const route = useRoute();
const router = useRouter();
const { customer, isLoggedIn } = useClientAuth();

// Guest mode state
const loading = ref(true);
const error = ref(null);
const order = ref({});
const hasQueryParams = ref(false);

// Logged-in mode state
const activeTab = ref('my-orders');
const myOrders = ref([]);
const myOrdersLoading = ref(true);
const selectedOrder = ref(null);

// Tracking form (logged-in tab 2)
const trackingForm = reactive({ maHoaDon: '', email: '' });
const trackingLoading = ref(false);
const trackingError = ref(null);
const trackedOrder = ref(null);

// Guest form
const guestForm = reactive({ maHoaDon: '', email: '' });

const steps = [
  { code: 1, label: 'Chờ xác nhận',    icon: 'bi bi-clipboard' },
  { code: 2, label: 'Chờ giao hàng',   icon: 'bi bi-box-seam' },
  { code: 3, label: 'Đang vận chuyển', icon: 'bi bi-truck' },
  { code: 4, label: 'Đã giao hàng',    icon: 'bi bi-truck-front' },
  { code: 5, label: 'Hoàn thành',      icon: 'bi bi-check-circle' },
];

const progressWidth = computed(() => {
  const target = trackedOrder.value || order.value;
  const st = target?.trangThaiHienTai || 1;
  return Math.max(0, (st - 1) / 4 * 100);
});

const getStatusName = (code) => {
  const map = { 1: 'Chờ xác nhận', 2: 'Chờ giao hàng', 3: 'Đang vận chuyển', 4: 'Đã giao hàng', 5: 'Hoàn thành' };
  return map[code] || 'Không xác định';
};

const getStatusBadgeClass = (status) => {
  if (!status) return 'bg-secondary text-white';
  const s = status.toLowerCase();
  if (s.includes('hoàn thành')) return 'bg-dark text-white';
  if (s.includes('đã giao')) return 'bg-dark text-white';
  if (s.includes('đang') || s.includes('vận chuyển')) return 'bg-danger text-white';
  if (s.includes('chờ giao')) return 'bg-secondary text-white';
  if (s.includes('chờ xác nhận')) return 'bg-secondary text-white';
  if (s.includes('hủy') || s.includes('thất bại')) return 'bg-danger text-white';
  return 'bg-secondary text-white';
};

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN') : '';

// ── Pagination for "Đơn hàng của tôi" ──
const MY_ORDERS_PAGE_SIZE = 5;
const myOrdersPage = ref(1);
const myOrdersTotalPages = computed(() => Math.max(1, Math.ceil(myOrders.value.length / MY_ORDERS_PAGE_SIZE)));
const paginatedMyOrders = computed(() => {
  const start = (myOrdersPage.value - 1) * MY_ORDERS_PAGE_SIZE;
  return myOrders.value.slice(start, start + MY_ORDERS_PAGE_SIZE);
});
const myOrdersPageRange = computed(() => {
  const total = myOrdersTotalPages.value;
  const cur = myOrdersPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});
const goToOrderPage = (p) => {
  if (typeof p !== 'number') return;
  myOrdersPage.value = p;
};

// Logged-in: fetch my orders
const fetchMyOrders = async () => {
  myOrdersLoading.value = true;
  try {
    const res = await apiClient.get('/api/client/orders', { params: { customerId: customer.value?.id } });
    myOrders.value = res.data;
  } catch (e) {
    console.error('Failed to fetch orders', e);
  } finally {
    myOrdersLoading.value = false;
  }
};

// Logged-in: view order detail
const viewOrderDetail = async (orderId) => {
  try {
    const res = await apiClient.get(`/api/client/orders/${orderId}`);
    selectedOrder.value = res.data;
  } catch (e) {
    console.error('Failed to fetch order detail', e);
  }
};

// Logged-in: track by code
const trackByCode = async () => {
  trackingError.value = null;
  trackedOrder.value = null;
  trackingLoading.value = true;
  try {
    const res = await apiClient.get(`/api/client/hoa-don/tracking?maHoaDon=${encodeURIComponent(trackingForm.maHoaDon)}&email=${encodeURIComponent(trackingForm.email)}`);
    trackedOrder.value = res.data;
  } catch (e) {
    trackingError.value = 'Không tìm thấy đơn hàng hoặc email không khớp.';
  } finally {
    trackingLoading.value = false;
  }
};

// Guest: track from form — dùng Vue Router, không reload trang
const guestTrack = () => {
  router.push({ path: '/client/tracking', query: { maHoaDon: guestForm.maHoaDon, email: guestForm.email } });
};

// Watch for SPA in-app route changes (e.g. when guest submits the form via guestTrack())
watch(
  () => route.query,
  async (q) => {
    if (isLoggedIn.value) return;
    const maHD = q.maHoaDon || null;
    const idNum = q.id || null;
    const email = q.email || null;
    if ((maHD || idNum) && email) {
      hasQueryParams.value = true;
      loading.value = true;
      error.value = null;
      order.value = {};
      try {
        const params = new URLSearchParams({ email });
        if (maHD) params.set('maHoaDon', maHD);
        else params.set('id', idNum);
        const res = await apiClient.get(`/api/client/hoa-don/tracking?${params.toString()}`);
        order.value = res.data;
      } catch (e) {
        error.value = 'Không tìm thấy đơn hàng hoặc email không khớp.';
      } finally {
        loading.value = false;
      }
    } else {
      hasQueryParams.value = false;
      error.value = null;
      loading.value = false;
    }
  }
  // No { immediate: true } — initial load is handled in onMounted where route is guaranteed resolved
);

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchMyOrders();
    // Handle URL params for logged-in users: auto-fill tracking form and switch to tracking tab
    const q = route.query;
    if (q.maHoaDon && q.email) {
      trackingForm.maHoaDon = q.maHoaDon;
      trackingForm.email = q.email;
      activeTab.value = 'tracking';
      await trackByCode();
    }
  } else {
    // Guest mode: route is fully resolved in onMounted, so query params are available
    const q = route.query;
    const maHD = q.maHoaDon || null;
    const idNum = q.id || null;
    const email = q.email || null;
    if ((maHD || idNum) && email) {
      hasQueryParams.value = true;
      loading.value = true;
      error.value = null;
      try {
        const params = new URLSearchParams({ email });
        if (maHD) params.set('maHoaDon', maHD);
        else params.set('id', idNum);
        const res = await apiClient.get(`/api/client/hoa-don/tracking?${params.toString()}`);
        order.value = res.data;
      } catch (e) {
        error.value = 'Không tìm thấy đơn hàng hoặc email không khớp.';
      } finally {
        loading.value = false;
      }
    } else {
      hasQueryParams.value = false;
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.pagination .page-link {
  color: #333;
  border-color: #dee2e6;
  min-width: 36px;
  text-align: center;
  font-size: 0.85rem;
}
.pagination .page-item.active .page-link {
  background-color: var(--ss-accent, #e53935);
  border-color: var(--ss-accent, #e53935);
  color: #fff;
}
.pagination .page-link:hover:not(:disabled) {
  background-color: #fff5f5;
  border-color: var(--ss-accent, #e53935);
  color: var(--ss-accent, #e53935);
}
.pagination .page-item.disabled .page-link { color: #aaa; }

.nav-tabs .nav-link {
  color: #666;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
}
.nav-tabs .nav-link.active {
  color: var(--ss-accent);
  border-bottom-color: var(--ss-accent);
  background: transparent;
}
.nav-tabs .nav-link:hover {
  color: var(--ss-accent);
  border-color: transparent;
  border-bottom-color: var(--ss-accent);
}
</style>
