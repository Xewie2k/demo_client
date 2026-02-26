<template>
  <div class="news-page">
    <!-- Breadcrumb -->
    <div class="bg-light py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><router-link to="/client" class="text-decoration-none" style="color: var(--ss-accent);">Trang chủ</router-link></li>
            <li class="breadcrumb-item active">Tin tức</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-4">
      <h5 class="fw-bold mb-4 border-start border-4 border-danger ps-3">TIN TỨC & SỰ KIỆN</h5>

      <!-- Featured Article -->
      <div class="row mb-5 gy-4">
        <div class="col-lg-7">
          <div class="featured-card rounded-3 overflow-hidden shadow-sm h-100 position-relative" @click="showToast">
            <div class="bg-light d-flex align-items-center justify-content-center" style="height: 100%; min-height: 360px;">
              <div class="text-muted text-center">
                <i class="bi bi-newspaper" style="font-size: 4rem; opacity: 0.3;"></i>
                <p class="mt-2">Hình ảnh bài viết nổi bật</p>
              </div>
            </div>
            <div class="position-absolute bottom-0 start-0 w-100 p-4" style="background: linear-gradient(transparent, rgba(0,0,0,0.8));">
              <span class="badge bg-danger mb-2">Nổi bật</span>
              <h5 class="text-white fw-bold mb-1">Bộ sưu tập giày bóng đá Tết 2026 - Bước chân may mắn</h5>
              <p class="text-white-50 small mb-0">Khám phá những mẫu giày bóng đá mới nhất dành riêng cho mùa xuân 2026 với thiết kế độc đáo và công nghệ tiên tiến.</p>
            </div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="d-flex flex-column gap-3 h-100">
            <div v-for="item in sideArticles" :key="item.title" class="d-flex gap-3 p-3 border rounded-3 side-article" @click="showToast">
              <div class="bg-light rounded-2 flex-shrink-0 d-flex align-items-center justify-content-center" style="width: 100px; height: 80px;">
                <i class="bi bi-image text-muted" style="font-size: 1.5rem; opacity: 0.4;"></i>
              </div>
              <div class="d-flex flex-column justify-content-center">
                <span class="text-muted" style="font-size: 0.7rem;">{{ item.date }}</span>
                <h6 class="fw-bold mb-0 small lh-base">{{ item.title }}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Articles Grid -->
      <h6 class="fw-bold mb-3 text-uppercase text-muted" style="font-size: 0.8rem; letter-spacing: 1px;">Tất cả bài viết</h6>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="article in articles" :key="article.title" class="col">
          <div class="card h-100 border-0 shadow-sm rounded-3 news-card" @click="showToast">
            <div class="bg-light rounded-top-3 d-flex align-items-center justify-content-center" style="height: 200px;">
              <div class="text-muted text-center">
                <i :class="article.icon" style="font-size: 2.5rem; opacity: 0.3;"></i>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge rounded-pill" :class="article.tagClass" style="font-size: 0.65rem;">{{ article.tag }}</span>
                <span class="text-muted" style="font-size: 0.7rem;">{{ article.date }}</span>
              </div>
              <h6 class="fw-bold mb-2 lh-base" style="font-size: 0.9rem;">{{ article.title }}</h6>
              <p class="text-muted small mb-3 flex-grow-1">{{ article.desc }}</p>
              <span class="small fw-bold" style="color: var(--ss-accent); cursor: pointer;">
                Đọc thêm <i class="bi bi-arrow-right"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2';

const sideArticles = [
  { date: '10/02/2026', title: 'Top 5 đôi giày bóng đá bán chạy nhất tháng 1/2026' },
  { date: '05/02/2026', title: 'Hướng dẫn chọn size giày bóng đá chuẩn nhất' },
  { date: '28/01/2026', title: 'SevenStrike khai trương chi nhánh mới tại Đà Nẵng' },
];

const articles = [
  {
    icon: 'bi bi-stars',
    tag: 'Sản phẩm mới',
    tagClass: 'bg-danger',
    date: '12/02/2026',
    title: 'Nike Phantom GX 3 Elite - Đỉnh cao của sự chính xác',
    desc: 'Phiên bản mới nhất của dòng Phantom với công nghệ Flyknit cải tiến, mang lại cảm giác bóng tuyệt vời cho các tiền vệ và tiền đạo.',
  },
  {
    icon: 'bi bi-lightbulb',
    tag: 'Mẹo hay',
    tagClass: 'bg-primary',
    date: '08/02/2026',
    title: '5 mẹo bảo quản giày bóng đá bền đẹp như mới',
    desc: 'Hướng dẫn chi tiết cách vệ sinh, bảo quản giày bóng đá đúng cách để tăng tuổi thọ và giữ form giày luôn như mới mua.',
  },
  {
    icon: 'bi bi-graph-up-arrow',
    tag: 'Xu hướng',
    tagClass: 'bg-success',
    date: '01/02/2026',
    title: 'Xu hướng giày bóng đá 2026: Nhẹ hơn, nhanh hơn',
    desc: 'Các thương hiệu lớn đang hướng tới những đôi giày siêu nhẹ, tối ưu tốc độ và sự linh hoạt cho người chơi.',
  },
  {
    icon: 'bi bi-percent',
    tag: 'Khuyến mãi',
    tagClass: 'bg-warning text-dark',
    date: '25/01/2026',
    title: 'Flash Sale tháng 2 - Giảm đến 40% tất cả sản phẩm',
    desc: 'Chương trình khuyến mãi lớn nhất đầu năm 2026. Hàng trăm sản phẩm giảm giá sốc, số lượng có hạn.',
  },
  {
    icon: 'bi bi-calendar-event',
    tag: 'Sự kiện',
    tagClass: 'bg-info',
    date: '20/01/2026',
    title: 'Giải đấu SevenStrike Cup 2026 chính thức khởi động',
    desc: 'Giải bóng đá phong trào do SevenStrike tài trợ chính thức quay trở lại với quy mô lớn hơn và giải thưởng hấp dẫn.',
  },
  {
    icon: 'bi bi-star',
    tag: 'Review',
    tagClass: 'bg-secondary',
    date: '15/01/2026',
    title: 'So sánh chi tiết: Adidas Predator vs Nike Mercurial 2026',
    desc: 'Đánh giá toàn diện 2 dòng giày huyền thoại từ góc nhìn của người chơi thực tế: độ bám, cảm giác bóng, độ bền.',
  },
];

const showToast = () => {
  Swal.fire({
    icon: 'info',
    title: 'Sắp ra mắt!',
    text: 'Tính năng đọc bài viết chi tiết đang được phát triển.',
    timer: 2000,
    showConfirmButton: false,
  });
};
</script>

<style scoped>
.news-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}
.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
}
.featured-card {
  cursor: pointer;
  transition: all 0.3s ease;
}
.featured-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
}
.side-article {
  cursor: pointer;
  transition: all 0.2s ease;
}
.side-article:hover {
  background-color: #f8f9fa;
  border-color: var(--ss-accent) !important;
}
</style>
