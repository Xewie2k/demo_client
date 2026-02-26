<!-- File: src/pages/trang_chu/TrangChuPage.vue -->
<template>
  <div class="tc-page">
    <!-- HERO -->
    <section class="tc-hero">
      <div class="tc-hero-inner">
        <div class="tc-hero-left">
          <div class="tc-brand">
            <img class="tc-logo" :src="logoUrl" alt="SevenStrike" />
            <div class="tc-brand-text">
              <div class="tc-brand-name">SevenStrike</div>
            </div>
          </div>

          <div class="tc-hero-title">
            Chọn giày chuẩn sân, đá tự tin hơn mỗi trận.
          </div>

          <div class="tc-hero-desc">
            SevenStrike tập trung vào trải nghiệm chơi bóng: độ bám sân, cảm giác bóng, form chân và sự ổn định khi bứt tốc.
            Từ sân cỏ nhân tạo, sân cỏ tự nhiên đến futsal — luôn có lựa chọn phù hợp.
          </div>

          <div class="tc-hero-actions">
            <button class="btn tc-btn-primary" type="button" @click="go('/admin/san-pham')">
              <i class="fa-solid fa-shoe-prints me-2"></i>
              Quản lý sản phẩm
            </button>

            <button class="btn tc-btn-outline" type="button" @click="go('/admin/pos')">
              <i class="fa-solid fa-cash-register me-2"></i>
              Vào màn bán hàng
            </button>
          </div>

          <div class="tc-hero-badges">
            <div class="tc-badge">
              <i class="fa-solid fa-ruler-combined"></i>
              <span>Tư vấn hỗ trợ nhiệt tình</span>
            </div>
            <div class="tc-badge">
              <i class="fa-solid fa-truck-fast"></i>
              <span>Giao hàng nhanh toàn quốc</span>
            </div>
            <div class="tc-badge">
              <i class="fa-solid fa-shield-halved"></i>
              <span>Cam kết chất lượng</span>
            </div>
          </div>
        </div>

        <div class="tc-hero-right">
          <div class="tc-slider">
            <img
              class="tc-slider-img"
              :src="slides[activeSlide].img"
              :alt="slides[activeSlide].title"
              loading="lazy"
            />

            <div class="tc-slider-glass">
              <div class="tc-slider-kicker">bộ sưu tập</div>
              <div class="tc-slider-title">{{ slides[activeSlide].title }}</div>
              <div class="tc-slider-sub">{{ slides[activeSlide].desc }}</div>

              <div class="tc-dots">
                <button
                  v-for="(s, i) in slides"
                  :key="i"
                  class="tc-dot"
                  :class="{ active: i === activeSlide }"
                  type="button"
                  @click="activeSlide = i"
                  :aria-label="`Chuyển banner ${i + 1}`"
                />
              </div>
            </div>

            <div class="tc-slider-decor"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- QUICK LINKS (lối tắt quản trị) -->
    <section class="tc-section">
      <div class="tc-section-head">
        <div class="tc-section-title">Lối tắt nhanh</div>
      </div>

      <div class="tc-quick-grid">
        <button class="tc-quick" type="button" @click="go('/admin/san-pham')">
          <div class="tc-quick-ic"><i class="fa-solid fa-boxes-stacked"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Sản phẩm</div>
            <div class="tc-quick-sub">Danh sách, thêm mới, cập nhật</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/chi-tiet-san-pham')">
          <div class="tc-quick-ic"><i class="fa-solid fa-layer-group"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Chi tiết sản phẩm</div>
            <div class="tc-quick-sub">Màu, size, ảnh, tồn kho</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/hoa-don')">
          <div class="tc-quick-ic"><i class="fa-solid fa-receipt"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Hóa đơn</div>
            <div class="tc-quick-sub">Theo dõi trạng thái đơn</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/dashboard')">
          <div class="tc-quick-ic"><i class="fa-solid fa-chart-line"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Thống kê</div>
            <div class="tc-quick-sub">Doanh thu, đơn hàng, top sản phẩm</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/giam-gia/dot')">
          <div class="tc-quick-ic"><i class="fa-solid fa-percent"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Đợt giảm giá</div>
            <div class="tc-quick-sub">Tạo đợt, cấu hình chi tiết</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/giam-gia/phieu')">
          <div class="tc-quick-ic"><i class="fa-solid fa-ticket"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Phiếu giảm giá</div>
            <div class="tc-quick-sub">Công khai & cá nhân</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/tai-khoan/khach-hang')">
          <div class="tc-quick-ic"><i class="fa-solid fa-users"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Khách hàng</div>
            <div class="tc-quick-sub">Tài khoản, sổ địa chỉ</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>

        <button class="tc-quick" type="button" @click="go('/admin/pos')">
          <div class="tc-quick-ic"><i class="fa-solid fa-basket-shopping"></i></div>
          <div class="tc-quick-txt">
            <div class="tc-quick-tt">Bán hàng</div>
            <div class="tc-quick-sub">Tạo đơn nhanh tại quầy</div>
          </div>
          <i class="fa-solid fa-angle-right tc-quick-ar"></i>
        </button>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="tc-section">
      <div class="tc-section-head">
        <div class="tc-section-title">Chọn theo mặt sân</div>
      </div>

      <div class="tc-cat-grid">
        <div class="tc-cat">
          <div class="tc-cat-top">
            <div class="tc-cat-ic"><i class="fa-solid fa-futbol"></i></div>
            <div class="tc-cat-tt">Sân cỏ nhân tạo</div>
          </div>
          <div class="tc-cat-sub">Ưu tiên bám sân, hỗ trợ chuyển hướng, giảm trượt.</div>
          <div class="tc-cat-tags">
            <span class="tc-tag">TF</span>
            <span class="tc-tag">AG</span>
            <span class="tc-tag">đế bám</span>
          </div>
        </div>

        <div class="tc-cat">
          <div class="tc-cat-top">
            <div class="tc-cat-ic"><i class="fa-solid fa-leaf"></i></div>
            <div class="tc-cat-tt">Sân cỏ tự nhiên</div>
          </div>
          <div class="tc-cat-sub">Ổn định khi tăng tốc, giảm trượt khi bứt tốc.</div>
          <div class="tc-cat-tags">
            <span class="tc-tag">FG</span>
            <span class="tc-tag">đinh chắc</span>
            <span class="tc-tag">ổn định</span>
          </div>
        </div>

        <div class="tc-cat">
          <div class="tc-cat-top">
            <div class="tc-cat-ic"><i class="fa-solid fa-bolt"></i></div>
            <div class="tc-cat-tt">Futsal</div>
          </div>
          <div class="tc-cat-sub">Cảm giác bóng thật, đế êm, tối ưu sân trong nhà.</div>
          <div class="tc-cat-tags">
            <span class="tc-tag">IC</span>
            <span class="tc-tag">êm chân</span>
            <span class="tc-tag">bóng thật</span>
          </div>
        </div>

        <div class="tc-cat tc-cat-highlight">
          <div class="tc-cat-top">
            <div class="tc-cat-ic"><i class="fa-solid fa-list-check"></i></div>
            <div class="tc-cat-tt">Tư vấn nhanh</div>
          </div>
          <div class="tc-cat-sub">
            Chọn theo vị trí thi đấu, form chân (bè/thon), thói quen di chuyển.
          </div>
          <button class="btn tc-btn-soft" type="button" @click="go('/admin/pos')">
            <i class="fa-solid fa-comments me-2"></i>
            Bắt đầu tư vấn
          </button>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="tc-section">
      <div class="tc-section-head tc-section-head-row">
        <div>
          <div class="tc-section-title">Sản phẩm nổi bật</div>
        </div>

        <button class="btn tc-btn-outline" type="button" @click="go('/admin/san-pham')">
          Xem tất cả
          <i class="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>

      <div class="tc-product-grid">
        <div class="tc-product" v-for="p in featuredProducts" :key="p.id">
          <div class="tc-product-img-wrap">
            <img class="tc-product-img" :src="p.img" :alt="p.name" loading="lazy" />
            <div class="tc-product-chip">{{ p.chip }}</div>
          </div>

          <div class="tc-product-body">
            <div class="tc-product-name" :title="p.name">{{ p.name }}</div>
            <div class="tc-product-sub">{{ p.meta }}</div>

            <div class="tc-product-foot">
              <div class="tc-product-hint">{{ p.hint }}</div>
              <button class="btn tc-btn-soft-sm" type="button" @click="go('/admin/san-pham')">
                Xem
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section class="tc-section">
      <div class="tc-about">
        <div class="tc-about-left">
          <div class="tc-section-title">Về SevenStrike</div>
          <div class="tc-section-sub">
            Tập trung vào chất lượng và trải nghiệm đá bóng: bám sân, cảm giác bóng, form chân.
          </div>

          <div class="tc-about-text">
            SevenStrike là nơi chọn giày theo nhu cầu thực tế: mặt sân, vị trí thi đấu và form chân.
            Hệ thống quản lý giúp thao tác nhanh: sản phẩm, chi tiết sản phẩm, khuyến mãi, hóa đơn và khách hàng.
          </div>

          <div class="tc-about-list">
            <div class="tc-about-item">
              <i class="fa-solid fa-check"></i>
              <span>Chọn size dễ hơn nhờ gợi ý theo form chân</span>
            </div>
            <div class="tc-about-item">
              <i class="fa-solid fa-check"></i>
              <span>Gợi ý theo mặt sân để tối ưu độ bám</span>
            </div>
            <div class="tc-about-item">
              <i class="fa-solid fa-check"></i>
              <span>Tối ưu thao tác bán hàng tại quầy</span>
            </div>
          </div>

          <div class="tc-about-actions">
            <button class="btn tc-btn-primary" type="button" @click="go('/admin/pos')">
              <i class="fa-solid fa-cart-shopping me-2"></i>
              Tạo đơn ngay
            </button>
            <button class="btn tc-btn-outline" type="button" @click="go('/admin/giam-gia/phieu')">
              <i class="fa-solid fa-ticket me-2"></i>
              Tạo phiếu giảm giá
            </button>
          </div>
        </div>

        <div class="tc-about-right">
          <div class="tc-about-card">
            <div class="tc-about-card-top">
              <div class="tc-about-kicker">gợi ý nhanh</div>
              <div class="tc-about-tt">3 bước chọn giày đúng</div>
            </div>

            <div class="tc-steps">
              <div class="tc-step">
                <div class="tc-step-no">01</div>
                <div class="tc-step-txt">
                  <div class="tc-step-tt">Chọn mặt sân</div>
                  <div class="tc-step-sub">TF/AG/FG/IC theo điều kiện sân</div>
                </div>
              </div>

              <div class="tc-step">
                <div class="tc-step-no">02</div>
                <div class="tc-step-txt">
                  <div class="tc-step-tt">Chọn form chân</div>
                  <div class="tc-step-sub">thon/bè, ưu tiên ôm chân hay thoáng</div>
                </div>
              </div>

              <div class="tc-step">
                <div class="tc-step-no">03</div>
                <div class="tc-step-txt">
                  <div class="tc-step-tt">Chọn lối chơi</div>
                  <div class="tc-step-sub">tốc độ, kiểm soát bóng, ổn định</div>
                </div>
              </div>
            </div>

            <button class="btn tc-btn-soft w-100" type="button" @click="go('/admin/chi-tiet-san-pham')">
              <i class="fa-solid fa-layer-group me-2"></i>
              Quản lý chi tiết sản phẩm
            </button>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const go = (path) => router.push(path);

const logoUrl = computed(() => {
  try {
    return new URL("@/assets/images/logo/Logo_SevenStrike.png", import.meta.url).href;
  } catch (e) {
    return "";
  }
});

const slides = ref([
  {
    title: "Sân cỏ nhân tạo (TF/AG)",
    desc: "Bám sân tốt, chuyển hướng mượt, hỗ trợ bứt tốc",
    img: "https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    title: "Futsal (IC)",
    desc: "Cảm giác bóng thật, đế êm, tối ưu sân trong nhà",
    img: "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    title: "Sân cỏ tự nhiên (FG)",
    desc: "Ổn định khi tăng tốc, giảm trượt khi bứt tốc",
    img: "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
]);

const activeSlide = ref(0);
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.value.length;
  }, 5200);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const featuredProducts = ref([
  {
    id: 1,
    name: "SevenStrike Speed Pro",
    meta: "Ưu tiên tốc độ • bám sân • di chuyển nhanh",
    hint: "Phù hợp: đá biên, chạy chỗ",
    chip: "tốc độ",
    img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 2,
    name: "SevenStrike Control Elite",
    meta: "Cảm giác bóng • kiểm soát • chuyền – giữ nhịp",
    hint: "Phù hợp: tiền vệ, kiểm soát trận",
    chip: "kiểm soát",
    img: "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 3,
    name: "SevenStrike Power Max",
    meta: "Ổn định cổ chân • bứt tốc • tăng độ bám",
    hint: "Phù hợp: tăng tốc, dứt điểm",
    chip: "ổn định",
    img: "https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1600",
  },
  {
    id: 4,
    name: "SevenStrike Futsal IC",
    meta: "Đế êm • bám sân • bóng thật",
    hint: "Phù hợp: futsal, sân trong nhà",
    chip: "futsal",
    img: "https://images.pexels.com/photos/19092/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1600",
  },
]);
</script>

<style scoped>
.tc-page {
  padding: 16px;
  background: #f6f7fb;
  min-height: calc(100vh - 64px);
  color: #0f172a;
}

/* HERO */
.tc-hero {
  border-radius: 18px;
  overflow: hidden;
  background: radial-gradient(1200px 600px at 15% 10%, rgba(185, 28, 28, 0.12), transparent 60%),
    linear-gradient(180deg, #ffffff, #fbfbfd);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.tc-hero-inner {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 992px) {
  .tc-hero-inner {
    grid-template-columns: 1.05fr 0.95fr;
    min-height: 380px;
  }
}

.tc-hero-left {
  padding: 18px;
}

@media (min-width: 992px) {
  .tc-hero-left {
    padding: 24px;
  }
}

.tc-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tc-logo {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  object-fit: contain;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 6px;
}

.tc-brand-name {
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #111827;
}

.tc-brand-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.tc-hero-title {
  margin-top: 14px;
  font-size: 28px;
  line-height: 1.2;
  letter-spacing: 0.2px;
  color: #0f172a;
}

@media (min-width: 992px) {
  .tc-hero-title {
    font-size: 32px;
  }
}

.tc-hero-desc {
  margin-top: 10px;
  color: #475569;
  line-height: 1.65;
  font-size: 14px;
  max-width: 640px;
}

.tc-hero-actions {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tc-btn-primary {
  border: 0;
  border-radius: 14px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #b91c1c, #ef4444);
  color: #fff;
}

.tc-btn-primary:hover {
  filter: brightness(0.98);
  color: #fff;
}

.tc-btn-outline {
  border-radius: 14px;
  padding: 10px 14px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}

.tc-btn-outline:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
}

.tc-hero-badges {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tc-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: #0f172a;
  font-size: 12px;
}

.tc-badge i {
  color: #b91c1c;
}

/* SLIDER */
.tc-hero-right {
  padding: 14px 14px 16px;
}

@media (min-width: 992px) {
  .tc-hero-right {
    padding: 18px 18px 20px;
  }
}

.tc-slider {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  height: 300px;
  background: #0b1220;
  border: 1px solid rgba(15, 23, 42, 0.10);
}

@media (min-width: 992px) {
  .tc-slider {
    height: 100%;
    min-height: 340px;
  }
}

.tc-slider-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.02);
  filter: saturate(1.05) contrast(1.03);
}

.tc-slider-decor {
  position: absolute;
  inset: 0;
  background: radial-gradient(800px 500px at 20% 20%, rgba(239, 68, 68, 0.18), transparent 60%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.15), rgba(2, 6, 23, 0.35));
  pointer-events: none;
}

.tc-slider-glass {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  padding: 12px 12px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  color: #fff;
  z-index: 2;
}

.tc-slider-kicker {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.85;
}

.tc-slider-title {
  margin-top: 4px;
  font-size: 16px;
}

.tc-slider-sub {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.45;
}

.tc-dots {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.tc-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.35);
}

.tc-dot.active {
  background: rgba(255, 255, 255, 0.9);
}

/* SECTIONS */
.tc-section {
  margin-top: 16px;
}

.tc-section-head {
  padding: 0 2px 10px;
}

.tc-section-head-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.tc-section-title {
  font-size: 15px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #0f172a;
}

.tc-section-sub {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

/* QUICK */
.tc-quick-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 768px) {
  .tc-quick-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  .tc-quick-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.tc-quick {
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.tc-quick:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.08);
}

.tc-quick-ic {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid rgba(185, 28, 28, 0.14);
  color: #b91c1c;
}

.tc-quick-tt {
  font-size: 14px;
  color: #0f172a;
}

.tc-quick-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

.tc-quick-ar {
  margin-left: auto;
  color: #94a3b8;
}

/* CATEGORIES */
.tc-cat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 992px) {
  .tc-cat-grid {
    grid-template-columns: 1fr 1fr 1fr 1.1fr;
  }
}

.tc-cat {
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  padding: 14px;
}

.tc-cat-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tc-cat-ic {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.tc-cat-tt {
  font-size: 14px;
  color: #0f172a;
}

.tc-cat-sub {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.55;
}

.tc-cat-tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tc-tag {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.06);
  color: #0f172a;
}

.tc-cat-highlight {
  background: radial-gradient(600px 300px at 20% 10%, rgba(239, 68, 68, 0.14), transparent 60%),
    #ffffff;
}

.tc-btn-soft {
  margin-top: 10px;
  border-radius: 14px;
  border: 1px solid rgba(185, 28, 28, 0.18);
  background: rgba(185, 28, 28, 0.06);
  color: #b91c1c;
  padding: 10px 12px;
}

.tc-btn-soft:hover {
  background: rgba(185, 28, 28, 0.10);
  color: #b91c1c;
}

/* PRODUCTS */
.tc-product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 768px) {
  .tc-product-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  .tc-product-grid {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.tc-product {
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.tc-product:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.08);
}

.tc-product-img-wrap {
  position: relative;
  height: 140px;
  background: #0b1220;
}

.tc-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tc-product-chip {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 12px;
  backdrop-filter: blur(10px);
}

.tc-product-body {
  padding: 12px;
}

.tc-product-name {
  font-size: 14px;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.tc-product-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.55;
  min-height: 36px;
}

.tc-product-foot {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

.tc-product-hint {
  font-size: 12px;
  color: #475569;
}

.tc-btn-soft-sm {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(2, 6, 23, 0.03);
  color: #0f172a;
  padding: 8px 12px;
}

.tc-btn-soft-sm:hover {
  background: rgba(2, 6, 23, 0.06);
  color: #0f172a;
}

/* ABOUT */
.tc-about {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 992px) {
  .tc-about {
    grid-template-columns: 1.1fr 0.9fr;
    align-items: stretch;
  }
}

.tc-about-left,
.tc-about-right {
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  padding: 14px;
}

.tc-about-text {
  margin-top: 10px;
  font-size: 13px;
  color: #475569;
  line-height: 1.65;
}

.tc-about-list {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.tc-about-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  color: #0f172a;
  font-size: 13px;
}

.tc-about-item i {
  color: #16a34a;
}

.tc-about-actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* ABOUT CARD */
.tc-about-card {
  border-radius: 16px;
  background: radial-gradient(700px 320px at 10% 10%, rgba(239, 68, 68, 0.14), transparent 60%),
    #0b1220;
  border: 1px solid rgba(15, 23, 42, 0.10);
  padding: 14px;
  color: #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tc-about-kicker {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.85;
}

.tc-about-tt {
  margin-top: 4px;
  font-size: 16px;
  color: #fff;
}

.tc-steps {
  display: grid;
  gap: 10px;
  margin-top: 6px;
}

.tc-step {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.tc-step-no {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(239, 68, 68, 0.24);
  color: #fff;
  font-size: 12px;
}

.tc-step-tt {
  color: #fff;
  font-size: 14px;
}

.tc-step-sub {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.45;
}

.tc-footer-note {
  margin-top: 10px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
  padding: 0 2px;
}
</style>
