<template>
  <div class="product-detail-page">
    <!-- Breadcrumb -->
    <div class="bg-light py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><router-link to="/client" class="text-decoration-none">Trang chủ</router-link></li>
            <li class="breadcrumb-item"><router-link to="/client/products" class="text-decoration-none">Sản phẩm</router-link></li>
            <li class="breadcrumb-item active" v-if="product">{{ product.tenSanPham }}</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger rounded-3 border-0 shadow-sm">
        {{ error }}
      </div>

      <div v-else-if="product">
        <div class="row g-4 g-lg-5">
          <!-- Image Gallery -->
          <div class="col-lg-6">
            <div class="bg-white rounded-4 shadow-sm p-3 mb-3 position-relative">
              <div class="ratio ratio-1x1">
                <img
                  :src="selectedImage || product.anhDaiDien || '/placeholder-shoe.png'"
                  class="object-fit-contain rounded-3"
                  :alt="product.tenSanPham"
                  @error="e => e.target.src = '/placeholder-shoe.png'"
                >
              </div>
              <!-- Discount badge on main image -->
              <span v-if="displayDiscount" class="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill px-3 py-2 fs-6 shadow">
                -{{ displayDiscount }}%
              </span>
            </div>

            <!-- Thumbnails -->
            <div class="d-flex gap-2 overflow-auto pb-2" v-if="product.images && product.images.length > 0">
              <div
                v-for="(img, index) in product.images"
                :key="index"
                class="rounded-3 overflow-hidden flex-shrink-0 thumb-item"
                :class="selectedImage === img ? 'thumb-active' : ''"
                style="width: 76px; height: 76px;"
                @click="selectedImage = img"
              >
                <img
                  :src="img"
                  class="w-100 h-100 object-fit-cover"
                  @error="e => e.target.style.display = 'none'"
                >
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="col-lg-6">
            <!-- Brand & Code -->
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge rounded-pill px-3 py-2 fw-normal" style="background-color: #f0f0f0; color: #666;">
                {{ product.tenThuongHieu }}
              </span>
              <span class="text-muted small">Mã: {{ product.maSanPham }}</span>
            </div>

            <h3 class="fw-bold mb-3" style="line-height: 1.3;">{{ product.tenSanPham }}</h3>

            <!-- Price Section -->
            <div class="bg-light rounded-3 p-3 mb-4">
              <template v-if="selectedVariant">
                <template v-if="selectedVariant.phanTramGiam">
                  <div class="d-flex align-items-center gap-3">
                    <span class="fs-4 fw-bold text-danger">{{ formatPrice(selectedVariant.giaSauGiam) }}</span>
                    <span class="badge bg-danger rounded-pill px-2 py-1">-{{ selectedVariant.phanTramGiam }}%</span>
                  </div>
                  <div class="text-muted text-decoration-line-through mt-1">{{ formatPrice(selectedVariant.giaGoc || selectedVariant.giaBan) }}</div>
                </template>
                <span v-else class="fs-4 fw-bold text-danger">{{ formatPrice(selectedVariant.giaBan) }}</span>
              </template>
              <template v-else>
                <template v-if="product.phanTramGiam">
                  <div class="d-flex align-items-center gap-3">
                    <span class="fs-4 fw-bold text-danger">{{ formatPrice(product.giaSauGiamThapNhat) }}</span>
                    <span class="badge bg-danger rounded-pill px-2 py-1">-{{ product.phanTramGiam }}%</span>
                  </div>
                  <div class="text-muted text-decoration-line-through mt-1">{{ formatPrice(product.giaGocThapNhat) }}</div>
                </template>
                <span v-else class="fs-4 fw-bold text-danger">
                  {{ formatPrice(product.giaThapNhat) }}
                  <span v-if="product.giaThapNhat !== product.giaCaoNhat" class="fs-6 fw-normal text-muted"> - {{ formatPrice(product.giaCaoNhat) }}</span>
                </span>
              </template>
            </div>

            <!-- Description Short -->
            <p v-if="product.moTaNgan" class="text-muted mb-4" style="line-height: 1.6;">{{ product.moTaNgan }}</p>

            <!-- Divider -->
            <hr class="my-3">

            <!-- Color Selection -->
            <div class="mb-4">
              <label class="form-label fw-bold small text-uppercase mb-2" style="letter-spacing: 0.5px; color: #555;">
                <i class="bi bi-palette me-1"></i> Màu sắc
                <span v-if="selectedColor" class="fw-normal text-muted text-capitalize ms-1">— {{ selectedColor }}</span>
              </label>
              <div class="d-flex gap-2 flex-wrap">
                <button
                  v-for="color in uniqueColors"
                  :key="color"
                  class="btn variant-btn"
                  :class="selectedColor === color ? 'variant-btn-active' : ''"
                  @click="selectColor(color)"
                >
                  {{ color }}
                </button>
              </div>
            </div>

            <!-- Size Selection -->
            <div class="mb-4">
              <label class="form-label fw-bold small text-uppercase mb-2" style="letter-spacing: 0.5px; color: #555;">
                <i class="bi bi-rulers me-1"></i> Kích thước
              </label>
              <div class="d-flex gap-2 flex-wrap">
                <button
                  v-for="size in availableSizes"
                  :key="size"
                  class="btn variant-btn"
                  :class="selectedSize === size ? 'variant-btn-active' : ''"
                  @click="selectSize(size)"
                  :disabled="!isSizeAvailable(size)"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Quantity & Stock -->
            <div class="mb-4">
              <label class="form-label fw-bold small text-uppercase mb-2" style="letter-spacing: 0.5px; color: #555;">
                <i class="bi bi-box me-1"></i> Số lượng
              </label>
              <div class="d-flex align-items-center gap-3">
                <div class="d-flex align-items-center border rounded-pill overflow-hidden" style="height: 42px;">
                  <button class="btn btn-link text-dark px-3 h-100 border-0" type="button" @click="quantity > 1 ? quantity-- : null">
                    <i class="bi bi-dash-lg"></i>
                  </button>
                  <input type="number" class="form-control text-center border-0 shadow-none" v-model="quantity" min="1" :max="selectedVariant ? selectedVariant.soLuong : 1" style="width: 56px;">
                  <button class="btn btn-link text-dark px-3 h-100 border-0" type="button" @click="quantity++">
                    <i class="bi bi-plus-lg"></i>
                  </button>
                </div>
                <span v-if="selectedVariant" class="text-muted small">
                  <i class="bi bi-check-circle text-success me-1"></i>{{ selectedVariant.soLuong }} sản phẩm có sẵn
                </span>
              </div>
            </div>

            <!-- Add to Cart -->
            <button
              class="btn btn-danger btn-lg w-100 rounded-pill fw-bold py-3 shadow-sm mb-4"
              @click="handleAddToCart"
              :disabled="!selectedVariant || quantity > (selectedVariant?.soLuong || 0)"
            >
              <i class="bi bi-cart-plus me-2"></i> Thêm vào giỏ hàng
            </button>

            <!-- Trust Bar -->
            <div class="row g-2 mb-3">
              <div class="col-4">
                <div class="text-center p-2 rounded-3" style="background-color: #fff5f5;">
                  <i class="bi bi-truck text-danger d-block mb-1" style="font-size: 1.3rem;"></i>
                  <small class="text-muted" style="font-size: 0.7rem;">Giao hàng nhanh</small>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center p-2 rounded-3" style="background-color: #f0f9ff;">
                  <i class="bi bi-shield-check text-primary d-block mb-1" style="font-size: 1.3rem;"></i>
                  <small class="text-muted" style="font-size: 0.7rem;">Hàng chính hãng</small>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center p-2 rounded-3" style="background-color: #f0fdf4;">
                  <i class="bi bi-arrow-repeat text-success d-block mb-1" style="font-size: 1.3rem;"></i>
                  <small class="text-muted" style="font-size: 0.7rem;">Đổi trả dễ dàng</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Section -->
        <div class="mt-5">
          <div class="bg-white rounded-4 shadow-sm overflow-hidden">
            <ul class="nav nav-tabs border-0 px-4 pt-3" id="detail-tab" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link border-0 fw-bold pb-3 px-4"
                  :class="activeTab === 'desc' ? 'active text-danger border-bottom border-danger border-3' : 'text-muted'"
                  @click="activeTab = 'desc'"
                  type="button"
                >
                  Chi tiết sản phẩm
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link border-0 fw-bold pb-3 px-4"
                  :class="activeTab === 'specs' ? 'active text-danger border-bottom border-danger border-3' : 'text-muted'"
                  @click="activeTab = 'specs'"
                  type="button"
                >
                  Thông số kỹ thuật
                </button>
              </li>
            </ul>

            <div class="p-4">
              <div v-if="activeTab === 'desc'" v-html="product.moTaChiTiet || '<p class=\'text-muted\'>Chưa có mô tả chi tiết.</p>'"></div>
              <div v-else-if="activeTab === 'specs'">
                <table class="table table-striped table-borderless mb-0">
                  <tbody>
                    <tr><td class="text-muted" style="width: 180px;">Thương hiệu</td><td class="fw-semibold">{{ product.tenThuongHieu }}</td></tr>
                    <tr><td class="text-muted">Xuất xứ</td><td class="fw-semibold">{{ product.tenXuatXu }}</td></tr>
                    <tr><td class="text-muted">Vị trí thi đấu</td><td class="fw-semibold">{{ product.tenViTriThiDau }}</td></tr>
                    <tr><td class="text-muted">Phong cách chơi</td><td class="fw-semibold">{{ product.tenPhongCachChoi }}</td></tr>
                    <tr><td class="text-muted">Cỏ giày</td><td class="fw-semibold">{{ product.tenCoGiay }}</td></tr>
                    <tr><td class="text-muted">Chất liệu</td><td class="fw-semibold">{{ product.tenChatLieu }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useCart } from '@/services/cart';
import Swal from 'sweetalert2';

const props = defineProps(['id']);
const route = useRoute();
const { addToCart } = useCart();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedImage = ref(null);
const activeTab = ref('desc');

const selectedColor = ref(null);
const selectedSize = ref(null);
const quantity = ref(1);

const fetchProduct = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/api/client/products/${props.id}`);
    product.value = res.data;
    if (product.value.images && product.value.images.length > 0) {
      selectedImage.value = product.value.images[0];
    }
  } catch (err) {
    error.value = "Không thể tải thông tin sản phẩm.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const uniqueColors = computed(() => {
  if (!product.value) return [];
  return [...new Set(product.value.variants.map(v => v.tenMauSac))];
});

const availableSizes = computed(() => {
  if (!product.value) return [];
  if (selectedColor.value) {
    return [...new Set(product.value.variants
      .filter(v => v.tenMauSac === selectedColor.value)
      .map(v => v.tenKichThuoc))].sort((a, b) => a - b);
  }
  return [...new Set(product.value.variants.map(v => v.tenKichThuoc))].sort((a, b) => a - b);
});

const isSizeAvailable = (size) => {
  if (selectedColor.value) {
    return product.value.variants.some(v => v.tenMauSac === selectedColor.value && v.tenKichThuoc === size && v.soLuong > 0);
  }
  return true;
};

const selectColor = (color) => {
  selectedColor.value = color;
  selectedSize.value = null;
};

const selectSize = (size) => {
  selectedSize.value = size;
};

const selectedVariant = computed(() => {
  if (!product.value || !selectedColor.value || !selectedSize.value) return null;
  return product.value.variants.find(v => v.tenMauSac === selectedColor.value && v.tenKichThuoc === selectedSize.value);
});

// Show the best discount % (variant-level if selected, otherwise product-level)
const displayDiscount = computed(() => {
  if (selectedVariant.value?.phanTramGiam) return selectedVariant.value.phanTramGiam;
  if (product.value?.phanTramGiam) return product.value.phanTramGiam;
  return null;
});

const handleAddToCart = () => {
  if (!selectedVariant.value) return;
  addToCart(product.value, selectedVariant.value, quantity.value);

  Swal.fire({
    icon: 'success',
    title: 'Đã thêm vào giỏ hàng',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

onMounted(fetchProduct);

watch(() => props.id, fetchProduct);

watch([quantity, selectedVariant], ([newQty, newVariant]) => {
  if (newVariant && newQty > newVariant.soLuong) {
    Swal.fire({
      icon: 'warning',
      title: 'Thông báo',
      text: `Chỉ còn ${newVariant.soLuong} sản phẩm trong kho`,
    });
    quantity.value = newVariant.soLuong;
  }
});
</script>

<style scoped>
.object-fit-contain {
  object-fit: contain;
}
.object-fit-cover {
  object-fit: cover;
}

/* Thumbnails */
.thumb-item {
  cursor: pointer;
  border: 2px solid #e9ecef;
  transition: all 0.2s;
}
.thumb-item:hover {
  border-color: #adb5bd;
}
.thumb-active {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 1px #dc3545;
}

/* Variant Buttons */
.variant-btn {
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 6px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  background: #fff;
  transition: all 0.2s;
}
.variant-btn:hover:not(:disabled) {
  border-color: #dc3545;
  color: #dc3545;
  background: #fff5f5;
}
.variant-btn-active {
  border-color: #dc3545 !important;
  color: #fff !important;
  background: #dc3545 !important;
}
.variant-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Quantity input */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}

/* Tab styles */
.nav-tabs .nav-link {
  transition: color 0.2s;
}
.nav-tabs .nav-link:hover {
  color: #dc3545 !important;
}
</style>
