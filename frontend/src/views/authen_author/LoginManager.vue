<!-- File: src/views/authen_author/LoginManager.vue -->
<template>
  <div class="container-fluid login-page p-0">
    <div class="row g-0 h-100">
      <!-- LEFT: giống mẫu (nền xám nhạt + hình trang trí + icon trung tâm) -->
      <div
        class="col-md-6 d-none d-md-flex left-section justify-content-center align-items-center position-relative"
      >
        <!-- Decor shapes -->
        <div class="left-decor">
          <span class="deco deco-circle deco-circle-lg"></span>
          <span class="deco deco-circle deco-circle-sm"></span>
          <span class="deco deco-square"></span>
          <span class="deco deco-diamond deco-diamond-1"></span>
          <span class="deco deco-diamond deco-diamond-2"></span>
        </div>

        <!-- Center badge -->
        <div class="left-hero">
          <div class="hero-badge">
            <i class="bi bi-laptop hero-main"></i>
            <i class="bi bi-person-fill hero-mini"></i>
          </div>
        </div>

        <!-- Icon trang trí cùng chủ đề -->
        <div class="left-icon">
          <i class="ph-soccer-ball-bold"></i>
        </div>
      </div>

      <!-- RIGHT -->
      <div
        class="col-12 col-md-6 right-section d-flex justify-content-center align-items-center"
      >
        <div class="login-card w-100 p-4">
          <div class="text-center mb-5">
            <img
              src="@/assets/images/logo/Logo_SevenStrike.png"
              alt="Small Logo"
              class="small-logo"
            />
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-4">
              <label class="form-label fw-bold small">Tài Khoản</label>
              <div class="input-group custom-input-group">
                <span class="input-group-text bg-transparent border-0 pe-0">
                  <i class="bi bi-person text-secondary fs-5"></i>
                </span>
                <input
                  type="text"
                  v-model.trim="username"
                  class="form-control border-0 bg-transparent ps-2"
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold small">Mật Khẩu</label>
              <div class="input-group custom-input-group">
                <span class="input-group-text bg-transparent border-0 pe-0">
                  <i class="bi bi-lock text-secondary fs-5"></i>
                </span>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  class="form-control border-0 bg-transparent ps-2"
                  autocomplete="current-password"
                />
                <span
                  class="input-group-text bg-transparent border-0"
                  @click="togglePassword"
                  style="cursor: pointer"
                >
                  <i
                    :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                    class="text-secondary fs-5"
                  ></i>
                </span>
              </div>
            </div>

            <div class="mb-4">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="rememberMe"
                  id="rememberMe"
                />
                <label
                  class="form-check-label small text-secondary"
                  for="rememberMe"
                >
                  Ghi nhớ tôi
                </label>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-danger w-100 fw-bold py-2"
              :disabled="loading"
            >
              {{ loading ? "Đang đăng nhập..." : "Đăng Nhập" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false,
      showPassword: false,
      loading: false,
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    clearAuth() {
      // ✅ dọn sạch cả 2 nơi để tránh trạng thái “nửa đăng nhập”
      const keys = ["user", "accessToken", "token", "jwt", "ss_token", "nguoiDung"];
      keys.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    },

    pickErrorMessage(error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      // ✅ backend controller của bạn trả body là String
      if (typeof data === "string" && data.trim()) return data;

      // nếu lỡ backend có trả object
      if (data && typeof data === "object") {
        const m = data.message || data.error || data.title;
        if (typeof m === "string" && m.trim()) return m;
        try {
          return JSON.stringify(data);
        } catch (e) {
          return "Máy chủ đang gặp lỗi, vui lòng thử lại.";
        }
      }

      if (status === 401) return "Tài khoản hoặc mật khẩu không chính xác.";
      if (status === 403) return "Tài khoản này hiện đang bị khóa!";
      return error?.message || "Máy chủ đang gặp lỗi, vui lòng thử lại.";
    },

    saveUser(user) {
      const store = this.rememberMe ? localStorage : sessionStorage;
      store.setItem("user", JSON.stringify(user));
    },

    async handleLogin() {
      if (!this.username || !this.password) {
        await Swal.fire({
          icon: "warning",
          title: "Lỗi",
          text: "Vui lòng nhập đầy đủ thông tin",
          confirmButtonColor: "#ff4d4f",
        });
        return;
      }

      if (this.loading) return;
      this.loading = true;

      try {
        const payload = {
          username: this.username.trim(),
          password: this.password,
        };

        const response = await axios.post(
          "http://localhost:8080/api/auth/login",
          payload
        );

        const user = response?.data || {};

        // ✅ dọn auth cũ rồi lưu auth mới
        this.clearAuth();
        this.saveUser(user);

        await Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công",
          text: user.message || `Xin chào ${user.hoTen || this.username}`,
          timer: 1200,
          showConfirmButton: false,
        });

        // ✅ Ưu tiên quay về route được guard đẩy sang
        const redirect = this.$route.query.redirect || "/admin/san-pham";

        if (user.role === "ADMIN" || user.role === "STAFF") {
          this.$router.replace(redirect);
        } else {
          await Swal.fire({
            icon: "error",
            title: "Từ chối",
            text: "Không có quyền truy cập",
            confirmButtonColor: "#ff4d4f",
          });
          this.clearAuth();
        }
      } catch (error) {
        const errorMsg = this.pickErrorMessage(error);

        await Swal.fire({
          icon: "error",
          title: "Thất bại",
          text: errorMsg, // ✅ luôn là string
          confirmButtonColor: "#ff4d4f",
        });
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // ✅ nếu đã có user thì đá vào admin luôn
    const user =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (user) {
      this.$router.replace("/admin");
    }
  },
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
}

.left-section {
  background: #f6f7f9; /* nền xám nhạt như mẫu */
  overflow: hidden;
}

/* Decor shapes */
.left-decor .deco {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.deco-circle {
  border-radius: 50%;
}

.deco-circle-lg {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(13, 110, 253, 0.25);
  top: 30%;
  left: 18%;
}

.deco-circle-sm {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(13, 110, 253, 0.15);
  top: 48%;
  left: 22%;
}

.deco-square {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(108, 117, 125, 0.18);
  top: 55%;
  left: 28%;
}

.deco-diamond {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(32, 201, 151, 0.18);
  transform: rotate(45deg);
}

.deco-diamond-1 {
  top: 34%;
  left: 66%;
}

.deco-diamond-2 {
  top: 52%;
  left: 70%;
}

/* Center badge */
.left-hero {
  position: relative;
  z-index: 2;
}

.hero-badge {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-main {
  font-size: 60px;
  color: #6c757d;
}

.hero-mini {
  position: absolute;
  top: 56px; /* chỉnh để giống mẫu */
  left: 102px; /* chỉnh để nằm góc phải icon laptop */
  font-size: 14px;
  color: #6c757d;
}

/* Icon trang trí chủ đề */
.left-icon {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 2;
  font-size: 3rem;
  color: #000;
  opacity: 0.08;
}

.right-section {
  background: #fff;
}

.login-card {
  max-width: 420px;
}

.small-logo {
  width: 130px;
}

.custom-input-group {
  background-color: #f1f3f5;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
}

.custom-input-group .form-control:focus {
  box-shadow: none;
}

.input-group-text i {
  line-height: 0;
}
</style>
