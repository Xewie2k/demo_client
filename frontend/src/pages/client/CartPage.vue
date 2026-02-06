<template>
  <div class="cart-page container">
    <div class="text-center mb-4">
       <h4 class="fw-bold text-uppercase" style="color: var(--ss-accent);">GIỎ HÀNG CỦA BẠN</h4>
    </div>

    <div v-if="cart.length === 0" class="text-center py-5 bg-white rounded-3 shadow-sm">
      <div class="mb-3 text-muted">
         <i class="bi bi-cart-x" style="font-size: 4rem;"></i>
      </div>
      <p class="text-muted fs-5">Giỏ hàng của bạn đang trống</p>
      <router-link to="/client" class="btn btn-outline-danger rounded-pill px-4 fw-bold">Mua sắm ngay</router-link>
    </div>

    <div v-else class="bg-white rounded-3 shadow-sm overflow-hidden">
        <div class="table-responsive">
            <table class="table table-borderless align-middle mb-0">
                <thead class="bg-light border-bottom">
                    <tr>
                        <th class="ps-4 py-3" style="width: 50px;">
                            <input class="form-check-input" type="checkbox" :checked="allSelected" @change="toggleSelectAll">
                        </th>
                        <th class="py-3">Sản phẩm</th>
                        <th class="py-3 text-center">Đơn giá</th>
                        <th class="py-3 text-center">Số lượng</th>
                        <th class="py-3 text-center">Số tiền</th>
                        <th class="py-3 text-center">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in cart" :key="item.variantId" class="border-bottom">
                        <td class="ps-4">
                            <input class="form-check-input" type="checkbox" v-model="selectedItems" :value="item.variantId">
                        </td>
                        <td class="py-4">
                            <div class="d-flex align-items-center gap-3">
                                <img 
                                    :src="item.image || '/placeholder-shoe.png'" 
                                    class="rounded-3 border object-fit-cover" 
                                    width="80" height="80" 
                                    alt="Product"
                                >
                                <div>
                                    <h6 class="mb-1 fw-bold text-dark">{{ item.name }}</h6>
                                    <div class="text-secondary small">
                                        Phân loại hàng: {{ item.color }}, {{ item.size }}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="text-center fw-bold text-dark">
                            {{ formatPrice(item.price) }}
                        </td>
                        <td class="text-center">
                            <div class="d-inline-flex border rounded bg-white">
                                <button class="btn btn-sm btn-link text-dark text-decoration-none px-2 border-end" @click="updateQuantity(item.variantId, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
                                <input type="text" class="form-control form-control-sm text-center border-0 bg-transparent" :value="item.quantity" readonly style="width: 40px; height: 30px;">
                                <button class="btn btn-sm btn-link text-dark text-decoration-none px-2 border-start" @click="updateQuantity(item.variantId, item.quantity + 1)" :disabled="item.quantity >= item.maxStock">+</button>
                            </div>
                        </td>
                        <td class="text-center fw-bold text-danger">
                            {{ formatPrice(item.price * item.quantity) }}
                        </td>
                        <td class="text-center">
                             <button class="btn btn-link text-danger text-decoration-none p-0" @click="removeFromCart(item.variantId)">
                                Xóa
                             </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Cart Footer -->
        <div class="d-flex justify-content-between align-items-center p-4 bg-white sticky-bottom border-top">
            <div class="d-flex align-items-center gap-2">
                <input class="form-check-input" type="checkbox" :checked="allSelected" @change="toggleSelectAll" id="selectAllFooter">
                <label for="selectAllFooter" class="cursor-pointer">Chọn tất cả ({{ cart.length }})</label>
                <button class="btn btn-link text-danger text-decoration-none ms-3" @click="removeSelected" :disabled="selectedItems.length === 0">Xóa</button>
            </div>
            
            <div class="d-flex align-items-center gap-4">
                <div class="d-flex align-items-center gap-2">
                    <span class="text-secondary">Tổng thanh toán ({{ selectedItems.length }} sản phẩm):</span>
                    <span class="fs-4 fw-bold text-danger">{{ formatPrice(selectedTotalPrice) }}</span>
                </div>
                <button 
                    class="btn btn-danger px-5 py-2 fw-bold text-white rounded-1" 
                    style="background-color: var(--ss-accent); border: none; min-width: 200px;"
                    @click="proceedToCheckout"
                >
                    MUA HÀNG
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useCart } from '@/services/cart';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const { cart, removeFromCart, updateQuantity } = useCart();
const router = useRouter();

// By default select all
const selectedItems = ref([]);

// Watch cart changes to handle selected items cleanup
watch(cart, (newCart) => {
    // remove IDs that are no longer in cart
    const currentIds = newCart.map(i => i.variantId);
    selectedItems.value = selectedItems.value.filter(id => currentIds.includes(id));
}, { deep: true });

onMounted(() => {
    // Select all by default
    selectedItems.value = cart.value.map(i => i.variantId);
});

const allSelected = computed(() => {
    return cart.value.length > 0 && selectedItems.value.length === cart.value.length;
});

const toggleSelectAll = (e) => {
    if (e.target.checked) {
        selectedItems.value = cart.value.map(i => i.variantId);
    } else {
        selectedItems.value = [];
    }
};

const selectedTotalPrice = computed(() => {
    return cart.value
        .filter(item => selectedItems.value.includes(item.variantId))
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

const removeSelected = () => {
    if(selectedItems.value.length === 0) return;
    
    Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: "Xóa các sản phẩm đã chọn khỏi giỏ hàng?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4f',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            selectedItems.value.forEach(id => removeFromCart(id));
            selectedItems.value = [];
        }
    });
};

const proceedToCheckout = () => {
    if (selectedItems.value.length === 0) {
        Swal.fire('Thông báo', 'Bạn chưa chọn sản phẩm nào để thanh toán', 'info');
        return;
    }
    // Only pass selected items? Usually cart is global. 
    // For now, we assume the Checkout page reads from "Cart" but ideally should filter by selected.
    // I will save selected IDs to sessionStorage or query param?
    // Or just filter in Checkout. Let's use sessionStorage for simplicity of this demo.
    sessionStorage.setItem('checkout_items', JSON.stringify(selectedItems.value));
    router.push('/client/checkout');
};

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
.cursor-pointer {
    cursor: pointer;
}
</style>
