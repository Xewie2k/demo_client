<template>
  <div class="checkout-page">
    <div class="row g-4">
      <!-- Left Column: Customer Info -->
      <div class="col-lg-7">
        <div class="bg-white p-4 rounded-3 shadow-sm mb-4">
            <h5 class="fw-bold mb-4" style="color: var(--ss-accent);">THÔNG TIN THANH TOÁN</h5>

            <form @submit.prevent="submitOrder">
              <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small">Họ và tên <span class="text-danger">*</span></label>
                    <input type="text" class="form-control rounded-1" v-model="form.tenKhachHang" required placeholder="Nguyễn Văn A">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold text-secondary small">Số điện thoại <span class="text-danger">*</span></label>
                    <input type="tel" class="form-control rounded-1" v-model="form.soDienThoai" required placeholder="0123456789">
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold text-secondary small">Email <span class="text-danger">*</span></label>
                    <input type="email" class="form-control rounded-1" v-model="form.email" required placeholder="email@example.com">
                    <div class="form-text text-muted small">Hóa đơn và link theo dõi đơn hàng sẽ được gửi qua email này.</div>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold text-secondary small">Địa chỉ cụ thể <span class="text-danger">*</span></label>
                    <div class="input-group">
                       <input type="text" class="form-control rounded-1" v-model="form.diaChi" required placeholder="Số nhà, ngõ, đường...">
                       <button v-if="isLoggedIn" class="btn btn-dark px-4 rounded-1" type="button" data-bs-toggle="modal" data-bs-target="#addressModal">CHỌN</button>
                    </div>
                  </div>
                  <div class="col-md-4">
                     <label class="form-label fw-bold text-secondary small">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                     <select class="form-select rounded-1" v-model="addressCodes.city" @change="onCityChange">
                        <option value="">Chọn Tỉnh/Thành</option>
                        <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                     </select>
                  </div>
                   <div class="col-md-4">
                     <label class="form-label fw-bold text-secondary small">Quận/Huyện <span class="text-danger">*</span></label>
                     <select class="form-select rounded-1" v-model="addressCodes.district" @change="onDistrictChange" :disabled="!addressCodes.city">
                        <option value="">Chọn Quận/Huyện</option>
                        <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
                     </select>
                  </div>
                   <div class="col-md-4">
                     <label class="form-label fw-bold text-secondary small">Xã/Phường <span class="text-danger">*</span></label>
                     <select class="form-select rounded-1" v-model="addressCodes.ward" @change="onWardChange" :disabled="!addressCodes.district">
                        <option value="">Chọn Xã/Phường</option>
                        <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
                     </select>
                  </div>
                  
                  <div class="col-12">
                    <label class="form-label fw-bold text-secondary small">Ghi chú (tùy chọn)</label>
                    <textarea class="form-control rounded-1" v-model="form.ghiChu" rows="2" placeholder="Ghi chú thêm..."></textarea>
                  </div>
              </div>
            </form>
        </div>

        <!-- Coupon Section -->
        <div class="bg-white p-4 rounded-3 shadow-sm mb-4">
             <label class="form-label fw-bold text-secondary small">Phiếu giảm giá</label>
             <div class="input-group">
                <input type="text" class="form-control" placeholder="Mã phiếu giảm giá" :value="selectedVoucher ? selectedVoucher.maPhieuGiamGia : ''" readonly>
                <button class="btn btn-dark px-4" type="button" data-bs-toggle="modal" data-bs-target="#couponModal">CHỌN</button>
             </div>
        </div>

        <!-- Payment Method -->
        <div class="bg-white p-4 rounded-3 shadow-sm">
             <label class="form-label fw-bold text-secondary small mb-3">Phương thức thanh toán</label>
             <div class="d-flex flex-column gap-3">
                <div class="form-check p-3 border rounded bg-light">
                   <input class="form-check-input" type="radio" name="paymentMethod" id="cod" value="COD" v-model="paymentMethod">
                   <label class="form-check-label w-100 fw-bold" for="cod">
                      Thanh toán khi nhận hàng
                   </label>
                </div>
                 <div class="form-check p-3 border rounded bg-light">
                   <input class="form-check-input" type="radio" name="paymentMethod" id="vnpay" value="VNPAY" v-model="paymentMethod">
                   <label class="form-check-label w-100 fw-bold d-flex justify-content-between align-items-center" for="vnpay">
                      <span>Thanh toán qua VNPAY</span>
                      <img src="@/assets/images/logo/vnpay-logo-vinadesign-25-12-59-16.jpg" height="28" alt="VNPAY">
                   </label>
                </div>
                <div class="form-check p-3 border rounded bg-light">
                   <input class="form-check-input" type="radio" name="paymentMethod" id="momo" value="MOMO" v-model="paymentMethod">
                   <label class="form-check-label w-100 fw-bold d-flex justify-content-between align-items-center" for="momo">
                      <span>Thanh toán qua MoMo</span>
                      <img src="@/assets/images/logo/MOMO-Logo-App.png" height="28" alt="MoMo">
                   </label>
                </div>
                <div class="form-check p-3 border rounded bg-light">
                   <input class="form-check-input" type="radio" name="paymentMethod" id="zalopay" value="ZALOPAY" v-model="paymentMethod">
                   <label class="form-check-label w-100 fw-bold d-flex justify-content-between align-items-center" for="zalopay">
                      <span>Thanh toán qua ZaloPay</span>
                      <img src="@/assets/images/logo/Zalo.png" height="28" alt="ZaloPay">
                   </label>
                </div>
                <div class="form-check p-3 border rounded bg-light">
                   <input class="form-check-input" type="radio" name="paymentMethod" id="vietqr" value="VIETQR" v-model="paymentMethod">
                   <label class="form-check-label w-100 fw-bold d-flex justify-content-between align-items-center" for="vietqr">
                      <span>Chuyển khoản VietQR</span>
                      <img src="@/assets/images/logo/VietQR.png" height="15" alt="VietQR">
                   </label>
                </div>
             </div>
             
             <button class="btn btn-danger w-100 py-3 fw-bold rounded-1 mt-4 shadow-sm text-uppercase" 
                     style="background-color: var(--ss-accent); border: none;"
                     @click="submitOrder" 
                     :disabled="loading"
             >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                HOÀN THÀNH ĐẶT HÀNG
             </button>
        </div>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="col-lg-5">
         <div class="bg-white p-4 rounded-3 shadow-sm sticky-top" style="top: 100px;">
             <h5 class="fw-bold mb-4">Đơn hàng của bạn</h5>
            
            <div class="mb-4 pe-2" style="max-height: 400px; overflow-y: auto;">
               <div class="d-flex gap-3 mb-3 border-bottom pb-3" v-for="item in displayItems" :key="item.variantId">
                    <div class="position-relative">
                        <img :src="item.image || '/placeholder-shoe.png'" class="rounded border object-fit-cover" width="60" height="60">
                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-secondary border border-white" style="width: 20px; height: 20px; padding: 0; display: flex; align-items: center; justify-content: center;">{{ item.quantity }}</span>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold text-dark text-truncate" style="max-width: 180px;">{{ item.name }}</h6>
                        <small class="text-muted d-block">{{ item.color }} / {{ item.size }}</small>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold text-danger">{{ formatPrice(item.price * item.quantity) }}</div>
                        <div v-if="item.discountPercent" class="text-muted text-decoration-line-through" style="font-size:0.78rem;">
                            {{ formatPrice(item.originalPrice * item.quantity) }}
                        </div>
                    </div>
               </div>
            </div>

            <div class="d-flex justify-content-between mb-2 text-secondary">
              <span>Tạm tính</span>
              <span class="fw-bold text-dark">{{ formatPrice(itemsPrice) }}</span>
            </div>
            <div v-if="campaignSavings > 0" class="d-flex justify-content-between mb-2 text-success fw-bold">
              <span>Tiết kiệm (đợt giảm giá)</span>
              <span>-{{ formatPrice(campaignSavings) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2 text-secondary">
              <span class="d-flex align-items-center gap-2">
                Phí vận chuyển
                <img src="@/assets/images/logo/Logo_GHN.webp" height="16" alt="GHN" style="opacity: 0.7;">
              </span>
              <span class="fw-bold text-dark">{{ formatPrice(shippingFee) }}</span>
            </div>
            <div v-if="discountAmount > 0" class="d-flex justify-content-between mb-2 text-success fw-bold">
              <span>Giảm giá</span>
              <span>-{{ formatPrice(discountAmount) }}</span>
            </div>
            
            <hr class="border-secondary-subtle my-3">
            
            <div class="d-flex justify-content-between align-items-end">
              <span class="fw-bold fs-5 text-dark">Tổng cộng</span>
              <span class="fw-bold fs-4 text-danger">{{ formatPrice(finalPrice) }}</span>
            </div>
          </div>
      </div>
    </div>

    <!-- Address Modal -->
    <div class="modal fade" id="addressModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Chọn địa chỉ giao hàng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="savedAddresses.length > 0" class="d-flex flex-column gap-2">
              <div
                v-for="addr in savedAddresses"
                :key="addr.id"
                class="d-flex align-items-center justify-content-between p-3 rounded-3 border cursor-pointer hover-bg-light"
                :class="{'border-danger bg-danger-subtle': tempSelectedAddress && tempSelectedAddress.id === addr.id}"
                @click="tempSelectedAddress = addr"
              >
                <div>
                  <div class="fw-bold">
                    {{ addr.tenDiaChi }}
                    <span v-if="addr.macDinh" class="badge bg-danger ms-1" style="font-size: 10px;">Mặc định</span>
                  </div>
                  <div class="small text-secondary">{{ [addr.diaChiCuThe, addr.phuong, addr.quan, addr.thanhPho].filter(Boolean).join(', ') }}</div>
                </div>
                <div v-if="tempSelectedAddress && tempSelectedAddress.id === addr.id">
                  <i class="bi bi-check-circle-fill" style="color: var(--ss-accent); font-size: 20px;"></i>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-5 text-muted">
              <i class="bi bi-geo-alt" style="font-size: 2rem;"></i>
              <p class="mt-2 mb-0">Chưa có địa chỉ nào. Vui lòng thêm tại <router-link to="/client/account/address">Quản lý địa chỉ</router-link>.</p>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary rounded-1" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn rounded-1 text-white" style="background-color: var(--ss-accent); border:none;" data-bs-dismiss="modal" @click="applyAddress">Áp dụng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Coupon Modal -->
    <div class="modal fade" id="couponModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Chọn phiếu giảm giá</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
             <div v-if="vouchers.length > 0" class="d-flex flex-column gap-2">
                  <div 
                    v-for="v in vouchers" 
                    :key="v.id"
                    class="d-flex align-items-center justify-content-between p-3 rounded-3 border cursor-pointer hover-bg-light position-relative overflow-hidden"
                    :class="{'border-danger bg-danger-subtle': tempSelectedVoucher && tempSelectedVoucher.id === v.id, 'opacity-50 grayscale': itemsPrice < v.hoaDonToiThieu}"
                    @click="itemsPrice >= v.hoaDonToiThieu && (tempSelectedVoucher = v)"
                  >
                     <!-- Ticket Edge Effect (Optional css) -->
                    <div>
                      <div class="fw-bold">{{ v.maPhieuGiamGia }}</div>
                      <div class="small text-secondary">{{ v.tenPhieuGiamGia }}</div>
                      <small class="text-danger fw-bold" style="font-size: 11px;">
                        Giảm {{ !v.loaiPhieuGiamGia ? (Number(v.giaTriGiamGia) + '%') : formatPrice(v.giaTriGiamGia) }}
                        <span v-if="!v.loaiPhieuGiamGia && v.soTienGiamToiDa"> (Tối đa {{ formatPrice(v.soTienGiamToiDa) }})</span>
                      </small>
                      <div class="small text-muted" style="font-size: 10px;">Đơn tối thiểu: {{ formatPrice(v.hoaDonToiThieu) }}</div>
                      <div v-if="getBestVoucher() && getBestVoucher().id === v.id" class="small text-success fw-bold mt-1" style="font-size: 11px;">
                        <i class="bi bi-star-fill me-1"></i>Phiếu giảm giá tốt nhất
                      </div>
                    </div>
                    <div v-if="tempSelectedVoucher && tempSelectedVoucher.id === v.id">
                        <span class="material-icons text-danger">check_circle</span>
                    </div>
                  </div>
             </div>
             <div v-else class="text-center py-5 text-muted">
                Không có mã giảm giá nào.
             </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary rounded-1" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-danger rounded-1 text-white" style="background-color: var(--ss-accent); border:none;" data-bs-dismiss="modal" @click="applyVoucher">Áp dụng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- VietQR Modal -->
    <div class="modal fade" id="vietqrModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold">Quét mã QR để thanh toán</h5>
          </div>
          <div class="modal-body text-center">
            <div v-if="vietqrData">
              <img :src="vietqrData.qrImageUrl" class="img-fluid rounded mb-3" style="max-width: 280px;" alt="QR Code">
              <div class="alert alert-info text-start p-3 mb-3" style="font-size:14px;">
                <div class="fw-bold mb-2">Thông tin chuyển khoản:</div>
                <div>Ngân hàng: <strong>{{ vietqrData.bankId }}</strong></div>
                <div>Số tài khoản: <strong>{{ vietqrData.accountNo }}</strong></div>
                <div>Chủ tài khoản: <strong>{{ vietqrData.accountName }}</strong></div>
                <div>Số tiền: <strong class="text-danger">{{ formatPrice(vietqrData.amount) }}</strong></div>
                <div>Nội dung CK: <strong>{{ vietqrData.memo }}</strong></div>
              </div>
              <div class="text-muted small mb-3">
                Vui lòng chuyển khoản đúng nội dung để đơn hàng được xử lý nhanh nhất.
              </div>
              <div v-if="vietqrCountdown > 0" class="badge bg-warning text-dark fs-6 mb-2">
                Hết hạn sau: {{ Math.floor(vietqrCountdown / 60) }}:{{ String(vietqrCountdown % 60).padStart(2, '0') }}
              </div>
              <div v-else class="text-danger small fw-bold mb-2">Mã QR đã hết hạn.</div>
            </div>
            <div v-else class="py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary rounded-1" @click="cancelVietQR">Hủy</button>
            <button type="button" class="btn text-white rounded-1 fw-bold"
                    style="background-color: var(--ss-accent); border:none;"
                    @click="confirmVietQRTransfer"
                    :disabled="!vietqrData">
              Tôi đã chuyển khoản
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCart } from '@/services/cart';
import { useClientAuth } from '@/services/authClient';
import apiClient from '@/services/apiClient';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

const { cart, clearCart } = useCart();
const { customer, isLoggedIn } = useClientAuth();
const router = useRouter();
const loading = ref(false);
const vouchers = ref([]);
const selectedVoucher = ref(null);
const tempSelectedVoucher = ref(null); // For modal selection before applying
const paymentMethod = ref('COD');
const savedAddresses = ref([]);
const tempSelectedAddress = ref(null);

// VietQR state
const vietqrData = ref(null);
const vietqrCountdown = ref(0);
let vietqrTimer = null;
let vietqrOrderData = null;
let vietqrFinalPrice = 0;

const form = reactive({
  tenKhachHang: '',
  soDienThoai: '',
  email: '',
  diaChi: '',
  ghiChu: ''
});

const address = reactive({
    city: '',
    district: '',
    ward: ''
});

// --- Address Logic ---
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const addressCodes = reactive({
    city: '',
    district: '',
    ward: ''
});

const normalizeName = (name) => {
    if (!name) return '';
    return name
        .replace(/^(Tỉnh|Thành phố|Thành Phố|Quận|Huyện|Thị xã|Thị Xã|Thị trấn|Thị Trấn|Xã|Phường)\s+/i, '')
        .trim().toLowerCase();
};

const loadProvinces = async () => {
    try {
        const res = await apiClient.get('/api/client/ghn/tinh-thanh');
        provinces.value = (res.data || []).map(p => ({ code: p.provinceId, name: p.provinceName }));
    } catch (e) {
        console.error("Lỗi tải tỉnh thành GHN", e);
    }
};

const updateShippingFee = async () => {
    if (!addressCodes.district || !addressCodes.ward) return;
    try {
        const res = await apiClient.post('/api/client/ghn/tinh-phi-van-chuyen', {
            toDistrictId: addressCodes.district,
            toWardCode: String(addressCodes.ward),
            tongGiaTriHang: Math.round(itemsPrice.value)
        });
        shippingFee.value = res.data.total || res.data.phiVanChuyen || 0;
    } catch (e) {
        shippingFee.value = 0; // fallback nếu GHN lỗi
    }
};

const onCityChange = async () => {
    addressCodes.district = "";
    addressCodes.ward = "";
    districts.value = [];
    wards.value = [];
    shippingFee.value = 0;

    const p = provinces.value.find(x => x.code == addressCodes.city);
    address.city = p ? p.name : "";
    address.district = "";
    address.ward = "";

    if (addressCodes.city) {
        try {
            const res = await apiClient.get(`/api/client/ghn/quan-huyen/${addressCodes.city}`);
            districts.value = (res.data || []).map(d => ({ code: d.districtId, name: d.districtName }));
        } catch (e) {
            console.error("Lỗi tải quận huyện GHN", e);
        }
    }
};

const onDistrictChange = async () => {
    addressCodes.ward = "";
    wards.value = [];
    shippingFee.value = 0;

    const d = districts.value.find(x => x.code == addressCodes.district);
    address.district = d ? d.name : "";
    address.ward = "";

    if (addressCodes.district) {
        try {
            const res = await apiClient.get(`/api/client/ghn/phuong-xa/${addressCodes.district}`);
            wards.value = (res.data || []).map(w => ({ code: w.wardCode, name: w.wardName }));
        } catch (e) {
            console.error("Lỗi tải phường xã GHN", e);
        }
    }
};

const onWardChange = async () => {
    const w = wards.value.find(x => x.code == addressCodes.ward);
    address.ward = w ? w.name : "";
    await updateShippingFee();
};
// --- Saved Address Selection ---
const fillAddressFromSaved = async (addr) => {
    if (!addr) return;
    form.diaChi = addr.diaChiCuThe || '';

    // Match province by normalized name (handles "Thành phố Hà Nội" vs "Hà Nội")
    const matchedProvince = provinces.value.find(p => normalizeName(p.name) === normalizeName(addr.thanhPho));
    if (matchedProvince) {
        addressCodes.city = matchedProvince.code;
        address.city = matchedProvince.name;
        try {
            const res = await apiClient.get(`/api/client/ghn/quan-huyen/${matchedProvince.code}`);
            districts.value = (res.data || []).map(d => ({ code: d.districtId, name: d.districtName }));
        } catch (e) { districts.value = []; }

        // Match district by normalized name
        const matchedDistrict = districts.value.find(d => normalizeName(d.name) === normalizeName(addr.quan));
        if (matchedDistrict) {
            addressCodes.district = matchedDistrict.code;
            address.district = matchedDistrict.name;
            try {
                const res = await apiClient.get(`/api/client/ghn/phuong-xa/${matchedDistrict.code}`);
                wards.value = (res.data || []).map(w => ({ code: w.wardCode, name: w.wardName }));
            } catch (e) { wards.value = []; }

            // Match ward by normalized name
            const matchedWard = wards.value.find(w => normalizeName(w.name) === normalizeName(addr.phuong));
            if (matchedWard) {
                addressCodes.ward = matchedWard.code;
                address.ward = matchedWard.name;
                await updateShippingFee();
            }
        }
    }
};

const applyAddress = async () => {
    if (tempSelectedAddress.value) {
        await fillAddressFromSaved(tempSelectedAddress.value);
    }
};
// ---------------------

// Display logic: Checkout selected items or all items
const displayItems = computed(() => {
    // If specific items were passed via storage (from Cart Page selection)
    const stored = sessionStorage.getItem('checkout_items');
    if (stored) {
        try {
            const ids = JSON.parse(stored);
            if (Array.isArray(ids) && ids.length > 0) {
                return cart.value.filter(i => ids.includes(i.variantId));
            }
        } catch(e){}
    }
    return cart.value;
});

const itemsPrice = computed(() => {
  return displayItems.value.reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

const campaignSavings = computed(() =>
  displayItems.value.reduce((acc, item) => {
    if (item.discountPercent && item.originalPrice) {
      return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0)
);

const shippingFee = ref(0); // 0 khi chưa chọn địa chỉ; tính từ GHN API khi chọn xong phường/xã

const discountAmount = computed(() => {
  if (!selectedVoucher.value) return 0;
  const voucher = selectedVoucher.value;

  if (itemsPrice.value < voucher.hoaDonToiThieu) return 0;

  let discount = 0;
  if (!voucher.loaiPhieuGiamGia) {
      // Percentage voucher (loaiPhieuGiamGia = false/null)
      discount = itemsPrice.value * (Number(voucher.giaTriGiamGia) / 100);
      if (voucher.soTienGiamToiDa && discount > voucher.soTienGiamToiDa)
          discount = Number(voucher.soTienGiamToiDa);
  } else {
      // Fixed amount voucher (loaiPhieuGiamGia = true)
      discount = Number(voucher.giaTriGiamGia) || 0;
  }

  return Math.min(discount, itemsPrice.value);
});

const finalPrice = computed(() => {
  return itemsPrice.value + shippingFee.value - discountAmount.value;
});

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const fetchVouchers = async () => {
    try {
        const res = await apiClient.get('/api/client/vouchers');
        vouchers.value = res.data;
    } catch (e) {
        console.error("Failed to fetch vouchers", e);
    }
};

const calcVoucherDiscount = (voucher) => {
    if (!voucher || itemsPrice.value < voucher.hoaDonToiThieu) return 0;
    let discount = 0;
    if (!voucher.loaiPhieuGiamGia) {
        // Percentage
        discount = itemsPrice.value * (Number(voucher.giaTriGiamGia) / 100);
        if (voucher.soTienGiamToiDa && discount > voucher.soTienGiamToiDa)
            discount = Number(voucher.soTienGiamToiDa);
    } else {
        // Fixed
        discount = Number(voucher.giaTriGiamGia) || 0;
    }
    return Math.min(discount, itemsPrice.value);
};

const getBestVoucher = () => {
    const eligible = vouchers.value.filter(v => itemsPrice.value >= v.hoaDonToiThieu);
    if (eligible.length === 0) return null;
    return eligible.reduce((best, current) =>
        calcVoucherDiscount(current) > calcVoucherDiscount(best) ? current : best
    );
};

const applyVoucher = () => {
    if (tempSelectedVoucher.value) {
         if (itemsPrice.value < tempSelectedVoucher.value.hoaDonToiThieu) {
            Swal.fire('Không thể áp dụng', `Đơn hàng phải tối thiểu ${formatPrice(tempSelectedVoucher.value.hoaDonToiThieu)}`, 'error');
            return;
        }
        selectedVoucher.value = tempSelectedVoucher.value;
    } else {
        // If no voucher selected, apply the best one automatically
        const best = getBestVoucher();
        if (best) {
            selectedVoucher.value = best;
        }
    }
};

onMounted(async () => {
  await Promise.all([fetchVouchers(), loadProvinces()]);

  // Auto-select best voucher when page loads
  const best = getBestVoucher();
  if (best) {
    selectedVoucher.value = best;
    tempSelectedVoucher.value = best;
  }
  
  if (isLoggedIn.value && customer.value) {
    form.tenKhachHang = customer.value.hoTen || '';
    form.email = customer.value.email || '';
    form.soDienThoai = customer.value.soDienThoai || '';

    // Fetch saved addresses and auto-fill default
    try {
      const res = await apiClient.get(`/api/client/account/addresses/${customer.value.id}`);
      const addresses = res.data || [];
      savedAddresses.value = addresses;
      const defaultAddr = addresses.find(a => a.macDinh) || addresses[0];
      if (defaultAddr) {
        await fillAddressFromSaved(defaultAddr);
      }
    } catch (e) {
      console.error('Failed to load default address', e);
    }
  }
});

const submitOrder = async () => {
    if (!form.tenKhachHang || !form.soDienThoai || !form.email || !form.diaChi || !address.city) {
        Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin giao hàng.', 'error');
        return;
    }

    if (displayItems.value.length === 0) {
        Swal.fire('Lỗi', 'Không có sản phẩm để thanh toán.', 'error');
        return;
    }

    loading.value = true;
    try {
        const fullAddress = `${form.diaChi}, ${address.ward}, ${address.district}, ${address.city}`;

        const loaiThanhToanMap = { COD: 0, VNPAY: 1, MOMO: 2, ZALOPAY: 3, VIETQR: 4 };
        const loaiThanhToan = loaiThanhToanMap[paymentMethod.value] ?? 0;

        const payload = {
            ...form,
            diaChi: fullAddress,
            idKhachHang: customer.value?.id || null,
            idPhieuGiamGia: selectedVoucher.value ? selectedVoucher.value.id : null,
            items: displayItems.value.map(item => ({
                idChiTietSanPham: item.variantId,
                soLuong: item.quantity
            })),
            loaiThanhToan,
            ghnToDistrictId: addressCodes.district || null,
            ghnToWardCode: addressCodes.ward ? String(addressCodes.ward) : null
        };

        const res = await apiClient.post('/api/client/orders', payload);
        const orderData = res.data;
        const totalToShow = Math.round(finalPrice.value);

        if (paymentMethod.value === 'VNPAY') {
            const payRes = await apiClient.post('/api/payment/create_payment', {
                amount: totalToShow,
                orderInfo: `Thanh toan don hang ${orderData.id}`,
                returnUrl: null
            });
            if (payRes.data?.paymentUrl) {
                removeOrderedItems();
                sessionStorage.setItem('order_maHoaDon', orderData.maHoaDon || '');
                window.location.href = payRes.data.paymentUrl;
            } else {
                throw new Error("Không lấy được link thanh toán VNPay");
            }

        } else if (paymentMethod.value === 'MOMO') {
            const payRes = await apiClient.post('/api/payment/momo/create', {
                amount: totalToShow,
                orderId: orderData.id
            });
            if (payRes.data?.paymentUrl) {
                removeOrderedItems();
                sessionStorage.setItem('order_maHoaDon', orderData.maHoaDon || '');
                window.location.href = payRes.data.paymentUrl;
            } else {
                throw new Error("Không lấy được link thanh toán MoMo");
            }

        } else if (paymentMethod.value === 'ZALOPAY') {
            const payRes = await apiClient.post('/api/payment/zalopay/create', {
                amount: totalToShow,
                orderId: orderData.id
            });
            if (payRes.data?.paymentUrl) {
                removeOrderedItems();
                sessionStorage.setItem('order_maHoaDon', orderData.maHoaDon || '');
                window.location.href = payRes.data.paymentUrl;
            } else {
                throw new Error("Không lấy được link thanh toán ZaloPay");
            }

        } else if (paymentMethod.value === 'VIETQR') {
            const qrRes = await apiClient.post('/api/payment/vietqr/generate', {
                amount: totalToShow,
                orderId: orderData.id
            });
            if (qrRes.data) {
                vietqrData.value = qrRes.data;
                vietqrOrderData  = orderData;
                vietqrFinalPrice = totalToShow;

                // Start 15-minute countdown
                vietqrCountdown.value = 15 * 60;
                vietqrTimer = setInterval(() => {
                    if (vietqrCountdown.value > 0) {
                        vietqrCountdown.value--;
                    } else {
                        clearInterval(vietqrTimer);
                    }
                }, 1000);

                const modalEl = document.getElementById('vietqrModal');
                const modal = new Modal(modalEl);
                modal.show();
            } else {
                throw new Error("Không tạo được mã QR VietQR");
            }

        } else {
            // COD
            removeOrderedItems();
            router.push({ name: 'client-order-success', query: { id: orderData.id, maHoaDon: orderData.maHoaDon, tongTien: totalToShow } });
        }

    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Có lỗi xảy ra: ' + (err.userMessage || err.message), 'error');
    } finally {
        loading.value = false;
    }
};

const confirmVietQRTransfer = () => {
    if (vietqrTimer) clearInterval(vietqrTimer);
    vietqrCountdown.value = 0;

    const modalEl = document.getElementById('vietqrModal');
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();

    removeOrderedItems();
    sessionStorage.setItem('order_maHoaDon', vietqrOrderData?.maHoaDon || '');
    router.push({
        name: 'client-order-success',
        query: { id: vietqrOrderData?.id, maHoaDon: vietqrOrderData?.maHoaDon, tongTien: vietqrFinalPrice }
    });
};

const cancelVietQR = () => {
    if (vietqrTimer) clearInterval(vietqrTimer);
    vietqrCountdown.value = 0;
    vietqrData.value = null;

    const modalEl = document.getElementById('vietqrModal');
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();
};

const removeOrderedItems = () => {
    clearCart();
    sessionStorage.removeItem('checkout_items');
};
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
.grayscale {
    filter: grayscale(1);
    cursor: not-allowed !important;
}
.cursor-pointer {
    cursor: pointer;
}
.hover-bg-light:hover:not(.grayscale) {
    background-color: #f8f9fa;
}
</style>