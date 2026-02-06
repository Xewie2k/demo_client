import { reactive, watch, computed } from 'vue';

const CART_KEY = 'sevenstrike_cart';

const storedCart = localStorage.getItem(CART_KEY);
const initialState = storedCart ? JSON.parse(storedCart) : [];

const state = reactive({
  items: initialState
});

watch(() => state.items, (newItems) => {
  localStorage.setItem(CART_KEY, JSON.stringify(newItems));
}, { deep: true });

export function useCart() {
  const addToCart = (product, variant, quantity) => {
    const existingItem = state.items.find(item => item.variantId === variant.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      state.items.push({
        productId: product.id,
        variantId: variant.id,
        name: product.tenSanPham,
        color: variant.tenMauSac,
        size: variant.tenKichThuoc,
        price: variant.giaBan,
        image: product.anhDaiDien,
        quantity: quantity,
        maxStock: variant.soLuong
      });
    }
  };

  const removeFromCart = (variantId) => {
    const index = state.items.findIndex(item => item.variantId === variantId);
    if (index !== -1) {
      state.items.splice(index, 1);
    }
  };

  const clearCart = () => {
    state.items.splice(0, state.items.length);
  };
  
  const updateQuantity = (variantId, quantity) => {
      const item = state.items.find(item => item.variantId === variantId);
      if (item) {
          item.quantity = quantity;
      }
  };

  return {
    cart: computed(() => state.items),
    items: state.items,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity
  };
}
