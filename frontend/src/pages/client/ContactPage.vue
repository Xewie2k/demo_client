<template>
  <div class="contact-page">
    <!-- Breadcrumb -->
    <div class="bg-light py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><router-link to="/client" class="text-decoration-none">Trang chủ</router-link></li>
            <li class="breadcrumb-item active">Liên hệ</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">
      <h5 class="fw-bold mb-4 border-start border-4 border-danger ps-3">LIÊN HỆ VỚI CHÚNG TÔI</h5>

      <div class="row gy-4">
        <!-- Contact Info -->
        <div class="col-lg-5">
          <div class="bg-dark text-white rounded-3 p-4 h-100">
            <h6 class="fw-bold mb-4">Thông tin liên hệ</h6>
            <ul class="list-unstyled">
              <li class="d-flex align-items-start gap-3 mb-4">
                <div class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1);">
                  <i class="bi bi-geo-alt-fill text-danger"></i>
                </div>
                <div>
                  <div class="small text-white-50 mb-1">Địa chỉ</div>
                  <div class="small">Số 1, Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</div>
                </div>
              </li>
              <li class="d-flex align-items-start gap-3 mb-4">
                <div class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1);">
                  <i class="bi bi-telephone-fill text-danger"></i>
                </div>
                <div>
                  <div class="small text-white-50 mb-1">Hotline</div>
                  <div class="small">1900 6750</div>
                </div>
              </li>
              <li class="d-flex align-items-start gap-3 mb-4">
                <div class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1);">
                  <i class="bi bi-envelope-fill text-danger"></i>
                </div>
                <div>
                  <div class="small text-white-50 mb-1">Email</div>
                  <div class="small">support@sevenstrike.vn</div>
                </div>
              </li>
              <li class="d-flex align-items-start gap-3 mb-4">
                <div class="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px; background: rgba(255,255,255,0.1);">
                  <i class="bi bi-clock-fill text-danger"></i>
                </div>
                <div>
                  <div class="small text-white-50 mb-1">Giờ làm việc</div>
                  <div class="small">8:00 - 22:00 hàng ngày</div>
                </div>
              </li>
            </ul>

            <hr class="border-secondary">
            <div class="small text-white-50 mb-2">Kết nối với chúng tôi</div>
            <div class="d-flex gap-3">
              <a href="#" class="social-icon d-flex align-items-center justify-content-center rounded-circle text-white" style="width: 36px; height: 36px; background: rgba(255,255,255,0.1);">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="social-icon d-flex align-items-center justify-content-center rounded-circle text-white" style="width: 36px; height: 36px; background: rgba(255,255,255,0.1);">
                <i class="bi bi-youtube"></i>
              </a>
              <a href="#" class="social-icon d-flex align-items-center justify-content-center rounded-circle text-white" style="width: 36px; height: 36px; background: rgba(255,255,255,0.1);">
                <i class="bi bi-tiktok"></i>
              </a>
              <a href="#" class="social-icon d-flex align-items-center justify-content-center rounded-circle text-white" style="width: 36px; height: 36px; background: rgba(255,255,255,0.1);">
                <i class="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="col-lg-7">
          <div class="border rounded-3 p-4 h-100">
            <h6 class="fw-bold mb-4">Gửi liên hệ cho chúng tôi</h6>
            <form @submit.prevent="submitForm">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Họ và tên <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="form.name" placeholder="Nhập họ tên" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Email <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" v-model="form.email" placeholder="Nhập email" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Số điện thoại</label>
                  <input type="tel" class="form-control" v-model="form.phone" placeholder="Nhập số điện thoại">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Chủ đề</label>
                  <select class="form-select" v-model="form.subject">
                    <option value="">Chọn chủ đề</option>
                    <option value="product">Hỏi về sản phẩm</option>
                    <option value="order">Hỏi về đơn hàng</option>
                    <option value="warranty">Bảo hành / Đổi trả</option>
                    <option value="partnership">Hợp tác kinh doanh</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold">Nội dung <span class="text-danger">*</span></label>
                  <textarea class="form-control" rows="5" v-model="form.message" placeholder="Nhập nội dung cần liên hệ..." required></textarea>
                </div>
                <div class="col-12">
                  <button type="submit" class="btn btn-danger px-5 rounded-1" :disabled="sending">
                    <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-send me-1"></i>
                    Gửi liên hệ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Google Maps -->
    <section class="mt-4">
      <div class="container">
        <h6 class="fw-bold mb-3 border-start border-4 border-danger ps-3">BẢN ĐỒ CỬA HÀNG</h6>
      </div>
      <div class="rounded-0 overflow-hidden" style="height: 350px;">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863906198498!2d105.7461767!3d21.0381236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454b32b842a37%3A0xe91a56573e7f9a11!2zU-G7kSAxIFRy4buLbmggVsSDbiBCw7QsIFBow6FvIE3hu5csIE5hbSBU4burIExpw6ptLCBIw6AgTuG7mWk!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
          width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Swal from 'sweetalert2';

const sending = ref(false);
const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
});

const submitForm = async () => {
  sending.value = true;
  // Simulate sending delay
  await new Promise(r => setTimeout(r, 1000));
  sending.value = false;

  Swal.fire({
    icon: 'success',
    title: 'Gửi thành công!',
    text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
    timer: 3000,
    showConfirmButton: false,
  });

  // Reset form
  form.name = '';
  form.email = '';
  form.phone = '';
  form.subject = '';
  form.message = '';
};
</script>

<style scoped>
.social-icon {
  transition: all 0.2s ease;
  text-decoration: none;
}
.social-icon:hover {
  background: var(--ss-accent) !important;
  transform: scale(1.1);
}
</style>
