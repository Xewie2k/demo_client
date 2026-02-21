<template>
  <div class="about-page">
    <!-- Hero Banner -->
    <section class="hero-banner position-relative d-flex align-items-center justify-content-center text-white text-center" style="min-height: 340px;">
      <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
      <div class="container position-relative" style="z-index: 1;">
        <h1 class="display-5 fw-bold mb-3">VỀ SEVENSTRIKE</h1>
        <p class="lead mb-0 text-white-50">Đam mê sân cỏ - Bước chạy vươn xa</p>
      </div>
    </section>

    <!-- Câu chuyện thương hiệu -->
    <section class="py-5">
      <div class="container">
        <div class="row align-items-center gy-4">
          <div class="col-lg-6">
            <h5 class="fw-bold border-start border-4 border-danger ps-3 mb-4">CÂU CHUYỆN THƯƠNG HIỆU</h5>
            <p class="text-muted lh-lg">
              <strong>SevenStrike</strong> ra đời từ niềm đam mê mãnh liệt dành cho bóng đá và mong muốn mang đến cho người chơi Việt Nam những đôi giày chất lượng nhất với giá cả hợp lý.
            </p>
            <p class="text-muted lh-lg">
              Chúng tôi tin rằng mỗi bước chạy trên sân cỏ đều quan trọng. Từ những trận đấu phong trào đến sân chơi chuyên nghiệp, SevenStrike luôn đồng hành cùng bạn với những sản phẩm giày bóng đá chính hãng từ các thương hiệu hàng đầu thế giới.
            </p>
            <p class="text-muted lh-lg">
              Với đội ngũ tư vấn am hiểu về giày bóng đá, chúng tôi cam kết giúp bạn tìm được đôi giày phù hợp nhất với phong cách chơi bóng, vị trí thi đấu và form chân của mình.
            </p>
          </div>
          <div class="col-lg-6 text-center">
            <div class="bg-light rounded-4 d-flex align-items-center justify-content-center" style="height: 320px;">
              <div class="text-muted text-center">
                <i class="bi bi-image" style="font-size: 4rem; opacity: 0.3;"></i>
                <p class="mt-2 small">Hình ảnh cửa hàng SevenStrike</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tại sao chọn SevenStrike -->
    <section class="py-5" style="background-color: #f8f9fa;">
      <div class="container">
        <h5 class="fw-bold text-center mb-5">TẠI SAO CHỌN SEVENSTRIKE?</h5>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div class="col" v-for="item in whyUs" :key="item.icon">
            <div class="card h-100 border-0 shadow-sm rounded-3 text-center p-4 why-card">
              <div class="mb-3">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle" style="width: 64px; height: 64px; background-color: rgba(220, 53, 69, 0.1);">
                  <i :class="item.icon" class="text-danger" style="font-size: 1.5rem;"></i>
                </div>
              </div>
              <h6 class="fw-bold mb-2">{{ item.title }}</h6>
              <p class="text-muted small mb-0">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sứ mệnh -->
    <section class="py-5">
      <div class="container">
        <div class="row align-items-center gy-4">
          <div class="col-lg-6 order-lg-2 text-center">
            <div class="bg-light rounded-4 d-flex align-items-center justify-content-center" style="height: 280px;">
              <div class="text-muted text-center">
                <i class="bi bi-trophy" style="font-size: 4rem; opacity: 0.3;"></i>
                <p class="mt-2 small">Đội ngũ SevenStrike</p>
              </div>
            </div>
          </div>
          <div class="col-lg-6 order-lg-1">
            <h5 class="fw-bold border-start border-4 border-danger ps-3 mb-4">SỨ MỆNH CỦA CHÚNG TÔI</h5>
            <p class="text-muted lh-lg">
              SevenStrike hướng tới mục tiêu trở thành điểm đến tin cậy số 1 cho những người yêu bóng đá tại Việt Nam. Chúng tôi không chỉ bán giày, mà còn mang đến trải nghiệm mua sắm tuyệt vời với sự tư vấn chuyên nghiệp.
            </p>
            <ul class="list-unstyled">
              <li class="d-flex align-items-start gap-2 mb-3">
                <i class="bi bi-check-circle-fill text-danger mt-1"></i>
                <span class="text-muted">Chỉ bán sản phẩm chính hãng, có nguồn gốc rõ ràng</span>
              </li>
              <li class="d-flex align-items-start gap-2 mb-3">
                <i class="bi bi-check-circle-fill text-danger mt-1"></i>
                <span class="text-muted">Tư vấn chuyên sâu theo nhu cầu từng khách hàng</span>
              </li>
              <li class="d-flex align-items-start gap-2 mb-3">
                <i class="bi bi-check-circle-fill text-danger mt-1"></i>
                <span class="text-muted">Dịch vụ hậu mãi và chính sách đổi trả linh hoạt</span>
              </li>
              <li class="d-flex align-items-start gap-2">
                <i class="bi bi-check-circle-fill text-danger mt-1"></i>
                <span class="text-muted">Giá cả cạnh tranh, minh bạch</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Con số ấn tượng -->
    <section class="py-5 text-white" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
      <div class="container">
        <h5 class="fw-bold text-center mb-5">CON SỐ ẤN TƯỢNG</h5>
        <div class="row row-cols-2 row-cols-lg-4 g-4 text-center">
          <div class="col" v-for="stat in stats" :key="stat.label">
            <div class="py-3">
              <div class="display-5 fw-bold mb-1" style="color: var(--ss-accent);">{{ stat.value }}</div>
              <div class="text-white-50 small">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const whyUs = [
  { icon: 'bi bi-shield-check', title: 'Chính hãng 100%', desc: 'Cam kết sản phẩm chính hãng từ các thương hiệu hàng đầu thế giới.' },
  { icon: 'bi bi-truck', title: 'Giao hàng nhanh', desc: 'Giao hàng toàn quốc trong 1-3 ngày, miễn phí cho đơn từ 500K.' },
  { icon: 'bi bi-arrow-repeat', title: 'Đổi trả dễ dàng', desc: 'Chính sách đổi trả trong 7 ngày nếu sản phẩm lỗi hoặc sai size.' },
  { icon: 'bi bi-headset', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ bạn mọi lúc.' },
];

const stats = [
  { value: '10,000+', label: 'Khách hàng tin tưởng' },
  { value: '500+', label: 'Sản phẩm đa dạng' },
  { value: '50+', label: 'Thương hiệu nổi tiếng' },
  { value: '99%', label: 'Khách hàng hài lòng' },
];
</script>

<style scoped>
.hero-banner {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.hero-overlay {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.03)" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,218.7C672,203,768,149,864,138.7C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom center;
  background-size: cover;
  opacity: 0.5;
}
.why-card {
  transition: all 0.3s ease;
}
.why-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}
</style>
