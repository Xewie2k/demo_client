<template>
  <div class="product-detail-page container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger ss-card border-0">
      {{ error }}
    </div>

    <div v-else-if="product" class="row g-5">
      <!-- Image Gallery -->
      <div class="col-lg-6">
        <div class="ss-card p-3 mb-3">
            <div class="position-relative overflow-hidden rounded-4" style="padding-top: 100%;">
                <img 
                    :src="selectedImage || product.anhDaiDien || '/placeholder-shoe.png'" 
                    class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" 
                    :alt="product.tenSanPham"
                    @error="e => e.target.src = '/placeholder-shoe.png'"
                >
            </div>
        </div>
        
        <!-- Thumbnails -->
        <div class="d-flex gap-2 overflow-auto pb-2">
            <div 
                v-for="(img, index) in product.images" 
                :key="index"
                class="rounded-3 overflow-hidden border cursor-pointer flex-shrink-0"
                :class="selectedImage === img ? 'border-danger border-2' : 'border-light'"
                style="width: 80px; height: 80px;"
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
        <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-light text-secondary border border-secondary-subtle rounded-pill px-3 py-2 fw-normal">
                {{ product.tenThuongHieu }}
            </span>
             <span class="text-secondary small">| Mã: {{ product.maSanPham }}</span>
        </div>

        <h2 class="fw-bold mb-3">{{ product.tenSanPham }}</h2>
        
        <div class="d-flex align-items-center gap-3 mb-4">
            <h2 class="text-danger fw-bold m-0">
                <span v-if="selectedVariant">{{ formatPrice(selectedVariant.giaBan) }}</span>
                <span v-else>{{ formatPrice(product.giaThapNhat) }} - {{ formatPrice(product.giaCaoNhat) }}</span>
            </h2>
        </div>

        <!-- Description Short -->
        <p class="text-secondary mb-4">{{ product.moTaNgan }}</p>

        <!-- Attributes Selection -->
        <div class="mb-4">
          <label class="form-label fw-bold text-secondary small text-uppercase">Màu sắc</label>
          <div class="d-flex gap-2 flex-wrap">
             <button 
                v-for="color in uniqueColors" 
                :key="color" 
                class="btn ss-chip"
                :class="selectedColor === color ? 'ss-chip-active' : ''"
                @click="selectColor(color)"
             >
                {{ color }}
             </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-bold text-secondary small text-uppercase">Kích thước</label>
          <div class="d-flex gap-2 flex-wrap">
             <button 
                v-for="size in availableSizes" 
                :key="size" 
                class="btn ss-chip"
                :class="selectedSize === size ? 'ss-chip-active' : ''"
                @click="selectSize(size)"
                :disabled="!isSizeAvailable(size)"
             >
                {{ size }}
             </button>
          </div>
        </div>

        <!-- Quantity & Add to Cart -->
        <div class="d-flex align-items-end gap-3 mb-5">
            <div>
                 <label class="form-label fw-bold text-secondary small text-uppercase">Số lượng</label>
                 <div class="input-group" style="width: 140px;">
                    <button class="btn btn-outline-secondary border-end-0" type="button" @click="quantity > 1 ? quantity-- : null">-</button>
                    <input type="number" class="form-control text-center border-start-0 border-end-0" v-model="quantity" min="1" :max="selectedVariant ? selectedVariant.soLuong : 1">
                    <button class="btn btn-outline-secondary border-start-0" type="button" @click="quantity++">+</button>
                  </div>
            </div>
            <div v-if="selectedVariant" class="text-muted small mb-2">
                {{ selectedVariant.soLuong }} sản phẩm có sẵn
            </div>
        </div>

        <div class="d-flex gap-3">
             <button 
                class="btn btn-danger btn-lg w-100 rounded-3 fw-bold py-3 shadow-sm" 
                @click="handleAddToCart"
                :disabled="!selectedVariant || quantity > (selectedVariant?.soLuong || 0)"
                style="background-color: #ff4d4f; border-color: #ff4d4f;"
            >
                <i class="pi pi-shopping-cart me-2"></i> Thêm vào giỏ hàng
            </button>
        </div>
        
        <!-- Details & Specs -->
        <div class="mt-5 pt-5 border-top">
            <ul class="nav nav-pills mb-4 gap-3" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active rounded-pill px-4 fw-bold" id="pills-desc-tab" data-bs-toggle="pill" data-bs-target="#pills-desc" type="button" role="tab">Chi tiết sản phẩm</button>
                </li>
                 <li class="nav-item" role="presentation">
                    <button class="nav-link rounded-pill px-4 fw-bold text-secondary" id="pills-specs-tab" data-bs-toggle="pill" data-bs-target="#pills-specs" type="button" role="tab">Thông số kỹ thuật</button>
                </li>
            </ul>
            
            <div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade show active" id="pills-desc" role="tabpanel">
                    <div class="bg-white p-4 rounded-4 ss-border" v-html="product.moTaChiTiet || 'Chưa có mô tả chi tiết.'"></div>
                </div>
                <div class="tab-pane fade" id="pills-specs" role="tabpanel">
                     <div class="bg-white p-4 rounded-4 ss-border">
                        <table class="table table-borderless m-0">
                            <tbody>
                                <tr><th class="text-secondary w-25">Xuất xứ</th><td class="fw-bold">{{ product.tenXuatXu }}</td></tr>
                                <tr><th class="text-secondary">Vị trí</th><td class="fw-bold">{{ product.tenViTriThiDau }}</td></tr>
                                <tr><th class="text-secondary">Phong cách</th><td class="fw-bold">{{ product.tenPhongCachChoi }}</td></tr>
                                <tr><th class="text-secondary">Cỏ giày</th><td class="fw-bold">{{ product.tenCoGiay }}</td></tr>
                                <tr><th class="text-secondary">Chất liệu</th><td class="fw-bold">{{ product.tenChatLieu }}</td></tr>
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
            .map(v => v.tenKichThuoc))].sort((a,b) => a - b); // sort sizes if numeric
    }
    return [...new Set(product.value.variants.map(v => v.tenKichThuoc))].sort((a,b) => a - b);
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

const handleAddToCart = () => {
    if (!selectedVariant.value) return;
    addToCart(product.value, selectedVariant.value, quantity.value);
    
    // Use Toast or SweetAlert
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
.object-fit-cover {
  object-fit: cover;
}
.cursor-pointer {
    cursor: pointer;
}
/* Tab styling overrides if needed */
.nav-pills .nav-link.active {
    background-color: #ff4d4f;
}
.nav-pills .nav-link {
    color: #6c757d;
}
</style>
