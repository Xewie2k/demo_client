<template>
  <div class="account-sidebar bg-white p-3">
    <div class="text-center mb-4">
      <div class="mb-2">
        <img :src="avatarUrl" class="rounded-circle border" width="80" height="80" alt="Avatar">
      </div>
      <h6 class="fw-bold mb-1">{{ userName }}</h6>
      <button class="btn btn-sm btn-light border mt-1" style="font-size: 12px;">CHỌN ẢNH</button>
    </div>
    
    <div class="menu">
        <div class="mb-2">
             <div class="d-flex align-items-center mb-1 fw-bold text-dark text-decoration-none">
                <i class="bi bi-person me-2"></i> Tài khoản của tôi
             </div>
             <div class="ps-4 d-flex flex-column">
                 <router-link to="/client/account/profile" class="text-decoration-none text-muted mb-1" active-class="text-danger fw-bold">Hồ sơ</router-link>
                 <router-link to="/client/account/address" class="text-decoration-none text-muted mb-1" active-class="text-danger fw-bold">Địa chỉ</router-link>
                 <router-link to="/client/account/password" class="text-decoration-none text-muted mb-1" active-class="text-danger fw-bold">Đổi mật khẩu</router-link>
             </div>
        </div>

        <router-link to="/client/account/orders" class="d-flex align-items-center mb-2 text-decoration-none text-dark" active-class="text-danger fw-bold">
            <i class="bi bi-receipt me-2"></i> <span>Đơn mua</span>
        </router-link>

        <router-link to="/client/account/coupons" class="d-flex align-items-center mb-2 text-decoration-none text-dark" active-class="text-danger fw-bold">
            <i class="bi bi-ticket-perforated me-2"></i> <span>Phiếu giảm giá</span>
        </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountSidebar",
  data() {
    return {
      userName: 'Nguyen Van A',
      avatarUrl: 'https://placehold.co/100x100'
    }
  }
}
</script>

<style scoped>
.menu a:hover {
    color: #dc3545 !important;
}
</style>
