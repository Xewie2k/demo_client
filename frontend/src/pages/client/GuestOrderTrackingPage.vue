<template>
  <!-- Toast notification -->
  <Teleport to="body">
    <div
      v-if="toast.show"
      :class="`position-fixed top-0 end-0 m-3 alert alert-${toast.type} shadow`"
      style="z-index:9999; min-width:260px; border-radius:10px;"
    >
      <i :class="`bi bi-${toast.type === 'success' ? 'check-circle-fill' : 'x-circle-fill'} me-2`"></i>
      {{ toast.msg }}
    </div>
  </Teleport>
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
        
        <div v-else-if="myOrdersError" class="text-center py-5">
          <i class="bi bi-exclamation-circle text-danger" style="font-size: 2rem;"></i>
          <p class="text-danger mt-3">{{ myOrdersError }}</p>
          <button class="btn btn-outline-dark btn-sm" @click="fetchMyOrders">Thử lại</button>
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
              <!-- Action buttons for selectedOrder -->
              <div v-if="selectedOrder.trangThaiHienTai === 7" class="alert alert-warning small mb-3">
                <i class="bi bi-hourglass-split me-1"></i>
                Yêu cầu hủy đơn của bạn đang chờ cửa hàng xác nhận.
              </div>
              <div v-if="selectedOrder.trangThaiHienTai === 1" class="mb-4 d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-danger btn-sm" @click="openCancelModal('selected')">
                  <i class="bi bi-x-circle me-1"></i> Yêu cầu hủy đơn
                </button>
                <template v-if="selectedOrder.loaiThanhToan === 0">
                  <button class="btn btn-outline-primary btn-sm" @click="openDeliveryModal('selected')">
                    <i class="bi bi-pencil me-1"></i> Sửa thông tin giao hàng
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="openItemsModal('selected')">
                    <i class="bi bi-cart-check me-1"></i> Sửa sản phẩm
                  </button>
                </template>
              </div>

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
                    <template v-for="(item, index) in selectedOrder.items" :key="index">
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
                        <td class="text-end fw-bold pe-3" style="color: var(--ss-accent);">{{ formatCurrency(item.donGia * item.soLuong) }}</td>
                      </tr>
                      <!-- Dòng vàng thay đổi giá -->
                      <tr v-if="item.donGiaCu && item.donGia !== item.donGiaCu" style="background-color: #fff3cd;">
                        <td colspan="5" class="py-1 ps-3 small" style="color: #856404;">
                          <i class="bi bi-exclamation-triangle-fill me-1"></i>
                          Giá trong đơn: <strong>{{ formatCurrency(item.donGia) }}</strong> — Giá hiện tại: <strong>{{ formatCurrency(item.donGiaCu) }}</strong>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <!-- Summary -->
              <div class="row justify-content-end">
                <div class="col-md-5">
                  <div class="bg-light p-3 rounded">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Tạm tính</span>
                      <span class="fw-bold">{{ formatCurrency(calcSelectedTamTinh) }}</span>
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
                    <h6 class="mb-0 fw-bold">Đơn hàng {{ trackedOrder.maHoaDon }}</h6>
                    <small class="text-muted">{{ formatDate(trackedOrder.ngayTao) }}</small>
                  </div>
                  <span class="badge px-3 py-2" :class="trackedOrder.trangThaiHienTai === 6 ? 'bg-danger' : trackedOrder.trangThaiHienTai === 7 ? 'bg-warning text-dark' : 'bg-dark'">{{ getStatusName(trackedOrder.trangThaiHienTai) }}</span>
                </div>
              </div>
              <div class="card-body p-4">
                <!-- Action buttons for trackedOrder -->
                <div v-if="trackedOrder.trangThaiHienTai === 7" class="alert alert-warning small mb-3">
                  <i class="bi bi-hourglass-split me-1"></i>
                  Yêu cầu hủy đơn của bạn đang chờ cửa hàng xác nhận.
                </div>
                <div v-if="trackedOrder.trangThaiHienTai === 1" class="mb-4 d-flex gap-2 flex-wrap">
                  <button class="btn btn-outline-danger btn-sm" @click="openCancelModal('tracked')">
                    <i class="bi bi-x-circle me-1"></i> Yêu cầu hủy đơn
                  </button>
                  <template v-if="trackedOrder.loaiThanhToan === 0">
                    <button class="btn btn-outline-primary btn-sm" @click="openDeliveryModal('tracked')">
                      <i class="bi bi-pencil me-1"></i> Sửa thông tin giao hàng
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="openItemsModal('tracked')">
                      <i class="bi bi-cart-check me-1"></i> Sửa sản phẩm
                    </button>
                  </template>
                </div>

                <!-- Timeline Progress -->
                <div class="position-relative my-5 mx-3">
                  <div class="progress" style="height: 3px;">
                    <div class="progress-bar" role="progressbar"
                      :style="{ width: calcProgressWidth(trackedOrder) + '%', backgroundColor: trackedOrder.trangThaiHienTai === 6 ? '#dc3545' : trackedOrder.trangThaiHienTai === 7 ? '#f97316' : 'var(--ss-accent)' }">
                    </div>
                  </div>
                  <div class="d-flex justify-content-between position-absolute top-0 w-100 translate-middle-y">
                    <div v-for="step in steps" :key="step.code" class="text-center bg-white px-2">
                      <div class="rounded-circle border d-flex align-items-center justify-content-center mx-auto shadow-sm"
                           :style="calcStepStyle(trackedOrder, step.code)"
                           style="width: 40px; height: 40px; transition: all 0.3s;">
                        <i :class="step.icon"></i>
                      </div>
                      <small class="d-block mt-2 fw-bold"
                        :style="isStepActive(trackedOrder, step.code) ? { color: trackedOrder.trangThaiHienTai === 6 ? '#dc3545' : trackedOrder.trangThaiHienTai === 7 ? '#f97316' : 'var(--ss-accent)' } : {}"
                        :class="isStepActive(trackedOrder, step.code) ? '' : 'text-muted'" style="font-size: 12px;">
                        {{ step.label }}
                      </small>
                    </div>
                  </div>
                </div>
                <div v-if="trackedOrder.trangThaiHienTai === 6" class="alert alert-danger text-center py-2" style="font-size:0.9rem;">
                  <i class="bi bi-x-circle-fill me-1"></i> Đơn hàng này đã bị hủy
                </div>
                <div v-if="trackedOrder.trangThaiHienTai === 7" class="alert alert-warning text-center py-2" style="font-size:0.9rem;">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> Yêu cầu hủy đang chờ cửa hàng xác nhận
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
                      <template v-for="item in trackedOrder.chiTietHoaDon" :key="item.id">
                        <div class="d-flex justify-content-between mb-2">
                          <span>{{ item.tenSanPham }} x{{ item.soLuong }}</span>
                          <span class="fw-bold">{{ formatCurrency(item.thanhTien) }}</span>
                        </div>
                        <!-- Dòng vàng thay đổi giá -->
                        <div v-if="item.donGiaCu && item.donGia !== item.donGiaCu" class="mb-2 px-2 py-1 rounded small" style="background-color:#fff3cd; color:#856404;">
                          <i class="bi bi-exclamation-triangle-fill me-1"></i>
                          Giá trong đơn: <strong>{{ formatCurrency(item.donGia) }}</strong> — Giá hiện tại: <strong>{{ formatCurrency(item.donGiaCu) }}</strong>
                        </div>
                      </template>
                      <hr class="my-2">
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span>Tạm tính</span>
                      <span class="fw-bold">{{ formatCurrency(calcChiTietTamTinh(trackedOrder.chiTietHoaDon)) }}</span>
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

      <!-- Order detail (guest) -->
      <div v-else-if="order && order.id" class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="mb-0 fw-bold">Đơn hàng {{ order.maHoaDon }}</h5>
              <small class="text-muted">Ngày đặt: {{ formatDate(order.ngayTao) }}</small>
            </div>
            <span class="badge px-3 py-2" :class="order.trangThaiHienTai === 6 ? 'bg-danger' : order.trangThaiHienTai === 7 ? 'bg-warning text-dark' : 'bg-dark'">{{ getStatusName(order.trangThaiHienTai) }}</span>
          </div>
        </div>
        <div class="card-body p-4">
          <!-- Action buttons for guest -->
          <div v-if="order.trangThaiHienTai === 7" class="alert alert-warning small mb-3">
            <i class="bi bi-hourglass-split me-1"></i>
            Yêu cầu hủy đơn đang chờ cửa hàng xác nhận.
          </div>
          <div v-if="order.trangThaiHienTai === 1" class="mb-4 d-flex gap-2 flex-wrap">
            <template v-if="order.loaiThanhToan === 0">
              <button class="btn btn-outline-primary btn-sm" @click="openDeliveryModal('guest')">
                <i class="bi bi-pencil me-1"></i> Sửa thông tin giao hàng
              </button>
              <button class="btn btn-outline-secondary btn-sm" @click="openItemsModal('guest')">
                <i class="bi bi-cart-check me-1"></i> Sửa sản phẩm
              </button>
            </template>
          </div>

          <!-- Timeline -->
          <div class="position-relative my-5 mx-3">
            <div class="progress" style="height: 3px;">
              <div class="progress-bar" role="progressbar"
                :style="{ width: calcProgressWidth(order) + '%', backgroundColor: order.trangThaiHienTai === 6 ? '#dc3545' : order.trangThaiHienTai === 7 ? '#f97316' : 'var(--ss-accent)' }">
              </div>
            </div>
            <div class="d-flex justify-content-between position-absolute top-0 w-100 translate-middle-y">
              <div v-for="step in steps" :key="step.code" class="text-center bg-white px-2">
                <div class="rounded-circle border d-flex align-items-center justify-content-center mx-auto shadow-sm"
                     :style="calcStepStyle(order, step.code)"
                     style="width: 40px; height: 40px; transition: all 0.3s;">
                  <i :class="step.icon"></i>
                </div>
                <small class="d-block mt-2 fw-bold"
                  :style="isStepActive(order, step.code) ? { color: order.trangThaiHienTai === 6 ? '#dc3545' : order.trangThaiHienTai === 7 ? '#f97316' : 'var(--ss-accent)' } : {}"
                  :class="isStepActive(order, step.code) ? '' : 'text-muted'" style="font-size: 12px;">
                  {{ step.label }}
                </small>
              </div>
            </div>
          </div>
          <div v-if="order.trangThaiHienTai === 6" class="alert alert-danger text-center py-2" style="font-size:0.9rem;">
            <i class="bi bi-x-circle-fill me-1"></i> Đơn hàng này đã bị hủy
          </div>
          <div v-if="order.trangThaiHienTai === 7" class="alert alert-warning text-center py-2" style="font-size:0.9rem;">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> Yêu cầu hủy đang chờ cửa hàng xác nhận
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
                <template v-for="item in order.chiTietHoaDon" :key="item.id">
                  <div class="d-flex justify-content-between mb-2">
                    <span>{{ item.tenSanPham }} x{{ item.soLuong }}</span>
                    <span class="fw-bold">{{ formatCurrency(item.thanhTien) }}</span>
                  </div>
                  <!-- Dòng vàng thay đổi giá -->
                  <div v-if="item.donGiaCu && item.donGia !== item.donGiaCu" class="mb-2 px-2 py-1 rounded small" style="background-color:#fff3cd; color:#856404;">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>
                    Giá trong đơn: <strong>{{ formatCurrency(item.donGia) }}</strong> — Giá hiện tại: <strong>{{ formatCurrency(item.donGiaCu) }}</strong>
                  </div>
                </template>
                <hr class="my-2">
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Tạm tính</span>
                <span class="fw-bold">{{ formatCurrency(calcChiTietTamTinh(order.chiTietHoaDon)) }}</span>
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

    <!-- ========== MODALS ========== -->

    <!-- Modal Hủy đơn -->
    <div v-if="showCancelModal" class="modal d-block" style="background: rgba(0,0,0,0.5);" @click.self="showCancelModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận hủy đơn hàng</h5>
            <button type="button" class="btn-close" @click="showCancelModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted">Gửi yêu cầu hủy đơn hàng? Cửa hàng sẽ xem xét và xác nhận.</p>
            <div v-if="actionOrderData && actionOrderData.loaiThanhToan === 1" class="alert alert-warning small">
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
            <button class="btn btn-danger btn-sm" :disabled="cancelLoading" @click="doCancel">
              <span v-if="cancelLoading" class="spinner-border spinner-border-sm me-1"></span>
              Gửi yêu cầu hủy
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
              <div class="input-group input-group-sm">
                <input v-model="deliveryForm.diaChiKhachHang" type="text" class="form-control">
                <button
                  v-if="isLoggedIn && savedAddresses.length"
                  class="btn btn-dark px-3"
                  type="button"
                  @click="showAddressPickModal = true; tempSelectedAddress = null;"
                >CHỌN</button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="showDeliveryModal = false">Hủy</button>
            <button class="btn btn-primary btn-sm" :disabled="deliveryLoading" @click="doSaveDelivery">
              <span v-if="deliveryLoading" class="spinner-border spinner-border-sm me-1"></span>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal chọn địa chỉ nhanh -->
    <div v-if="showAddressPickModal" class="modal d-block" style="background: rgba(0,0,0,0.6); z-index: 1060;" @click.self="showAddressPickModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Chọn địa chỉ giao hàng</h5>
            <button type="button" class="btn-close" @click="showAddressPickModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex flex-column gap-2">
              <div
                v-for="addr in savedAddresses"
                :key="addr.id"
                class="d-flex align-items-center justify-content-between p-3 rounded-3 border"
                style="cursor: pointer; transition: all 0.2s;"
                :class="tempSelectedAddress && tempSelectedAddress.id === addr.id ? 'border-danger bg-danger-subtle' : 'bg-white'"
                @click="tempSelectedAddress = addr"
              >
                <div>
                  <div class="fw-bold">
                    {{ addr.tenDiaChi }}
                    <span v-if="addr.macDinh" class="badge ms-1" style="background-color: var(--ss-accent); font-size: 10px;">Mặc định</span>
                  </div>
                  <div class="small text-secondary">{{ [addr.diaChiCuThe, addr.phuong, addr.quan, addr.thanhPho].filter(Boolean).join(', ') }}</div>
                </div>
                <i v-if="tempSelectedAddress && tempSelectedAddress.id === addr.id" class="bi bi-check-circle-fill ms-2" style="color: var(--ss-accent); font-size: 1.2rem;"></i>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary rounded-1 btn-sm" @click="showAddressPickModal = false">Đóng</button>
            <button type="button" class="btn btn-sm rounded-1 text-white" style="background-color: var(--ss-accent); border: none;" @click="applyAddress" :disabled="!tempSelectedAddress">Áp dụng</button>
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
            <button class="btn btn-primary btn-sm" :disabled="itemsLoading || editItems.length === 0" @click="doSaveItems">
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
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';
import OrderTimeline from '@/components/client/OrderTimeline.vue';
import vnAddressService from '@/services/vnAddressService';

const route = useRoute();
const router = useRouter();
const { customer, isLoggedIn } = useClientAuth();

// Guest mode state
const loading = ref(true);
const error = ref(null);
const order = ref({});
const hasQueryParams = ref(false);
const guestEmail = ref(''); // email đã dùng để tra cứu (guest)

// Logged-in mode state
const activeTab = ref('my-orders');
const myOrders = ref([]);
const myOrdersLoading = ref(true);
const myOrdersError = ref(null);
const selectedOrder = ref(null);

// Tracking form (logged-in tab 2)
const trackingForm = reactive({ maHoaDon: '', email: '' });
const trackingLoading = ref(false);
const trackingError = ref(null);
const trackedOrder = ref(null);
const trackingEmailUsed = ref(''); // email đã dùng khi trackByCode thành công

// Guest form
const guestForm = reactive({ maHoaDon: '', email: '' });

// Toast
const toast = reactive({ show: false, type: 'success', msg: '' });
const showToast = (msg, type = 'success') => {
  toast.msg = msg; toast.type = type; toast.show = true;
  setTimeout(() => { toast.show = false; }, 3000);
};

// Action modal state
const showCancelModal = ref(false);
const cancelReason = ref('');
const cancelLoading = ref(false);
const showDeliveryModal = ref(false);
const deliveryLoading = ref(false);
const deliveryForm = ref({ tenKhachHang: '', soDienThoaiKhachHang: '', diaChiKhachHang: '' });
// Saved addresses (quick select)
const savedAddresses = ref([]);
const tempSelectedAddress = ref(null);
const showAddressPickModal = ref(false);
const showItemsModal = ref(false);
const itemsLoading = ref(false);
const editItems = ref([]);
// actionCtx: 'selected' | 'tracked' | 'guest'
const actionCtx = ref('');
// reference to the order object currently being acted on (for modal display info)
const actionOrderData = computed(() => {
  if (actionCtx.value === 'selected') return selectedOrder.value;
  if (actionCtx.value === 'tracked') return trackedOrder.value;
  if (actionCtx.value === 'guest') return order.value;
  return null;
});

const steps = [
  { code: 1, label: 'Chờ xác nhận',    icon: 'bi bi-clipboard' },
  { code: 2, label: 'Chờ giao hàng',   icon: 'bi bi-box-seam' },
  { code: 3, label: 'Đang vận chuyển', icon: 'bi bi-truck' },
  { code: 4, label: 'Đã giao hàng',    icon: 'bi bi-truck-front' },
  { code: 5, label: 'Hoàn thành',      icon: 'bi bi-check-circle' },
];

// Helpers for custom 5-step timeline
const calcProgressWidth = (o) => {
  const st = o?.trangThaiHienTai || 1;
  if (st >= 6) return 0;
  return Math.max(0, (st - 1) / 4 * 100);
};
const isStepActive = (o, code) => {
  const st = o?.trangThaiHienTai || 1;
  if (st >= 6) return code === 1; // cancelled: only step 1 shows active
  return st >= code;
};
const calcStepStyle = (o, code) => {
  const active = isStepActive(o, code);
  const st = o?.trangThaiHienTai;
  if (active) {
    const color = st === 6 ? '#dc3545' : st === 7 ? '#f97316' : 'var(--ss-accent)';
    const bg = st === 6 ? '#fff5f5' : st === 7 ? '#fff7ed' : '#fff5f5';
    return { borderColor: color, color, backgroundColor: bg };
  }
  return {};
};

// Tính tạm tính từ chiTietHoaDon (HoaDonChiTietResponse.thanhTien)
const calcChiTietTamTinh = (items) =>
  (items || []).reduce((s, i) => s + (Number(i.thanhTien) || 0), 0);

// Tính tạm tính từ ClientOrderDetailDTO.items
const calcSelectedTamTinh = computed(() =>
  (selectedOrder.value?.items || []).reduce((s, i) => s + (i.donGia || 0) * (i.soLuong || 0), 0)
);

const getStatusName = (code) => {
  const map = { 1: 'Chờ xác nhận', 2: 'Chờ giao hàng', 3: 'Đang vận chuyển', 4: 'Đã giao hàng', 5: 'Hoàn thành', 6: 'Đã hủy', 7: 'Yêu cầu hủy' };
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
  myOrdersError.value = null;
  try {
    const res = await apiClient.get('/api/client/orders', { params: { customerId: customer.value?.id } });
    myOrders.value = res.data;
  } catch (e) {
    console.error('Failed to fetch orders', e);
    myOrdersError.value = 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.';
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
    trackingEmailUsed.value = trackingForm.email;
  } catch (e) {
    trackingError.value = 'Không tìm thấy đơn hàng hoặc email không khớp.';
  } finally {
    trackingLoading.value = false;
  }
};

// Guest: track from form
const guestTrack = () => {
  router.push({ path: '/client/tracking', query: { maHoaDon: guestForm.maHoaDon, email: guestForm.email } });
};

// Fetch guest order and store email for later use
const fetchGuestOrder = async (maHD, idNum, email) => {
  loading.value = true;
  error.value = null;
  order.value = {};
  try {
    const params = new URLSearchParams({ email });
    if (maHD) params.set('maHoaDon', maHD);
    else params.set('id', idNum);
    const res = await apiClient.get(`/api/client/hoa-don/tracking?${params.toString()}`);
    order.value = res.data;
    guestEmail.value = email;
  } catch (e) {
    error.value = 'Không tìm thấy đơn hàng hoặc email không khớp.';
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.query,
  async (q) => {
    if (isLoggedIn.value) return;
    const maHD = q.maHoaDon || null;
    const idNum = q.id || null;
    const email = q.email || null;
    if ((maHD || idNum) && email) {
      hasQueryParams.value = true;
      await fetchGuestOrder(maHD, idNum, email);
    } else {
      hasQueryParams.value = false;
      error.value = null;
      loading.value = false;
    }
  }
);

// ── ACTION MODALS ──

const getOrderId = () => actionOrderData.value?.id;
const getAuthBody = (extra = {}) => {
  if (actionCtx.value === 'selected') {
    return { khachHangId: selectedOrder.value?.idKhachHang, ...extra };
  }
  if (actionCtx.value === 'tracked') {
    return { email: trackingEmailUsed.value, ...extra };
  }
  // guest
  return { email: guestEmail.value, ...extra };
};
const refreshAfterAction = async () => {
  if (actionCtx.value === 'selected' && selectedOrder.value) {
    await viewOrderDetail(selectedOrder.value.id);
  } else if (actionCtx.value === 'tracked' && trackedOrder.value) {
    await trackByCode();
  } else if (actionCtx.value === 'guest') {
    const q = route.query;
    await fetchGuestOrder(q.maHoaDon || null, q.id || null, guestEmail.value);
  }
};

const openCancelModal = (ctx) => {
  actionCtx.value = ctx;
  cancelReason.value = '';
  showCancelModal.value = true;
};
const doCancel = async () => {
  cancelLoading.value = true;
  try {
    await apiClient.post(`/api/client/hoa-don/${getOrderId()}/cancel`, getAuthBody({ lyDo: cancelReason.value || null }));
    showCancelModal.value = false;
    cancelReason.value = '';
    await refreshAfterAction();
    showToast('Đã gửi yêu cầu hủy đơn hàng.');
  } catch (err) {
    showToast(err.response?.data?.message || 'Không thể hủy đơn hàng', 'danger');
  } finally {
    cancelLoading.value = false;
  }
};

const openDeliveryModal = async (ctx) => {
  actionCtx.value = ctx;
  const o = actionOrderData.value;
  deliveryForm.value = {
    tenKhachHang: o?.tenKhachHang || o?.tenNguoiNhan || '',
    soDienThoaiKhachHang: o?.soDienThoaiKhachHang || o?.soDienThoai || '',
    diaChiKhachHang: o?.diaChiKhachHang || o?.diaChi || '',
  };
  // Load saved addresses for logged-in users
  savedAddresses.value = [];
  tempSelectedAddress.value = null;
  if (isLoggedIn.value && customer.value?.id) {
    try {
      const res = await apiClient.get(`/api/client/account/addresses/${customer.value.id}`);
      savedAddresses.value = res.data || [];
    } catch (e) { /* ignore */ }
  }
  showDeliveryModal.value = true;
};

const applyAddress = () => {
  if (!tempSelectedAddress.value) return;
  const addr = tempSelectedAddress.value;
  deliveryForm.value.diaChiKhachHang = vnAddressService.buildAddressText({
    detail: addr.diaChiCuThe,
    wardName: addr.phuong,
    districtName: addr.quan,
    provinceName: addr.thanhPho,
  });
  showAddressPickModal.value = false;
};
const doSaveDelivery = async () => {
  deliveryLoading.value = true;
  try {
    await apiClient.put(`/api/client/hoa-don/${getOrderId()}/delivery-info`, getAuthBody(deliveryForm.value));
    showDeliveryModal.value = false;
    await refreshAfterAction();
    showToast('Cập nhật thông tin giao hàng thành công!');
  } catch (err) {
    showToast(err.response?.data?.message || 'Không thể cập nhật thông tin giao hàng', 'danger');
  } finally {
    deliveryLoading.value = false;
  }
};

const openItemsModal = (ctx) => {
  actionCtx.value = ctx;
  const o = actionOrderData.value;
  // selectedOrder has .items (ClientOrderItemDTO); guest/tracked has .chiTietHoaDon (HoaDonChiTietResponse)
  const src = o?.items || o?.chiTietHoaDon || [];
  editItems.value = src.map(item => ({
    idChiTietSanPham: item.idChiTietSanPham || item.id,
    tenSanPham: item.tenSanPham,
    phanLoai: item.phanLoai || (item.mauSac ? `${item.mauSac} - ${item.kichCo}` : ''),
    anhDaiDien: item.anhDaiDien || item.duongDanAnhDaiDien || null,
    soLuong: item.soLuong,
  }));
  showItemsModal.value = true;
};
const decreaseQty = (i) => { if (editItems.value[i].soLuong > 1) editItems.value[i].soLuong--; };
const removeItem = (i) => { if (editItems.value.length > 1) editItems.value.splice(i, 1); };
const doSaveItems = async () => {
  if (editItems.value.length === 0) return;
  itemsLoading.value = true;
  try {
    await apiClient.put(`/api/client/hoa-don/${getOrderId()}/items`, getAuthBody({
      items: editItems.value.map(item => ({ idChiTietSanPham: item.idChiTietSanPham, soLuong: item.soLuong, xoaMem: false }))
    }));
    showItemsModal.value = false;
    await refreshAfterAction();
    showToast('Cập nhật sản phẩm thành công!');
  } catch (err) {
    showToast(err.response?.data?.message || 'Không thể cập nhật sản phẩm', 'danger');
  } finally {
    itemsLoading.value = false;
  }
};

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchMyOrders();
    const q = route.query;
    if (q.maHoaDon && q.email) {
      trackingForm.maHoaDon = q.maHoaDon;
      trackingForm.email = q.email;
      activeTab.value = 'tracking';
      await trackByCode();
    }
  } else {
    const q = route.query;
    const maHD = q.maHoaDon || null;
    const idNum = q.id || null;
    const email = q.email || null;
    if ((maHD || idNum) && email) {
      hasQueryParams.value = true;
      await fetchGuestOrder(maHD, idNum, email);
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
