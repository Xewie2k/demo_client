<!-- File: src/views/authen_author/LoginManager.vue -->
<template>
  <div class="container-fluid login-page p-0">
    <div class="row g-0 h-100">
      <div class="col-md-6 d-none d-md-flex left-section justify-content-center align-items-center position-relative">
        <div class="left-decor">
          <span class="deco deco-circle deco-circle-lg"></span>
          <span class="deco deco-circle deco-circle-sm"></span>
          <span class="deco deco-square"></span>
          <span class="deco deco-diamond deco-diamond-1"></span>
          <span class="deco deco-diamond deco-diamond-2"></span>
        </div>

        <div class="left-hero">
          <div class="hero-badge">
            <i class="bi bi-laptop hero-main"></i>
            <i class="bi bi-person-fill hero-mini"></i>
          </div>
        </div>

        <div class="left-icon">
          <i class="ph-soccer-ball-bold"></i>
        </div>
      </div>

      <div class="col-12 col-md-6 right-section d-flex justify-content-center align-items-center">
        <div class="login-card w-100 p-4">
          <div class="text-center mb-5">
            <img src="@/assets/images/logo/Logo_SevenStrike.png" alt="Small Logo" class="small-logo" />
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
                <input class="form-check-input" type="checkbox" v-model="rememberMe" id="rememberMe" />
                <label class="form-check-label small text-secondary" for="rememberMe">Ghi nhớ tôi</label>
              </div>
            </div>

            <button type="submit" class="btn btn-danger w-100 fw-bold py-2" :disabled="loading">
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

    normalizeRole(role) {
      const r = String(role || "").trim().toUpperCase();
      if (r === "STAFF") return "NHAN_VIEN";
      if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";
      return r;
    },

    clearAuth() {
      const keys = ["user", "accessToken", "token", "jwt", "ss_token", "nguoiDung", "ss_nguoi_ban"];
      keys.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    },

    pickErrorMessage(error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (typeof data === "string" && data.trim()) return data;

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

    normalizeNguoiBan(user) {
      const u = user || {};
      const id = u.idNhanVien || u.nhanVienId || u.id || u.userId || u.nhanVien?.id || null;
      const hoTen = u.hoTen || u.tenNhanVien || u.ten || u.fullName || u.name || u.username || "";
      return { id, hoTen, role: this.normalizeRole(u.role || u.quyen || u.vaiTro || u.tenVaiTro) || null };
    },

    saveUser(user) {
      const store = this.rememberMe ? localStorage : sessionStorage;
      store.setItem("user", JSON.stringify(user));
      store.setItem("ss_nguoi_ban", JSON.stringify(this.normalizeNguoiBan(user)));
    },

    resolveRedirect(userRole) {
      const role = this.normalizeRole(userRole);

      const qRedirect = this.$route?.query?.redirect;
      if (qRedirect && typeof qRedirect === "string" && qRedirect.startsWith("/admin")) {
        return qRedirect;
      }

      // ✅ mặc định: luôn về trang chủ để không bị “từ chối” do redirect nhầm /admin/san-pham
      if (role === "ADMIN" || role === "NHAN_VIEN") return "/admin/trang-chu";

      return "/dang-nhap";
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
        const payload = { username: this.username.trim(), password: this.password };
        const response = await axios.post("http://localhost:8080/api/auth/login", payload);

        const user = response?.data || {};
        const role = this.normalizeRole(
          user?.role || user?.vaiTro || user?.tenVaiTro || user?.tenQuyenHan || user?.quyenHan?.tenQuyenHan
        );

        // ✅ nếu backend không trả role rõ ràng -> coi như lỗi
        if (!role) {
          this.clearAuth();
          await Swal.fire({
            icon: "error",
            title: "Thất bại",
            text: "Không xác định được quyền tài khoản. Vui lòng đăng nhập lại.",
            confirmButtonColor: "#ff4d4f",
          });
          return;
        }

        this.clearAuth();
        this.saveUser({ ...user, role }); // ✅ ép role về chuẩn

        await Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công",
          text: user.message || `Xin chào ${user.hoTen || this.username}`,
          timer: 900,
          showConfirmButton: false,
        });

        if (role === "ADMIN" || role === "NHAN_VIEN") {
          const redirect = this.resolveRedirect(role);
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
          text: errorMsg,
          confirmButtonColor: "#ff4d4f",
        });
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    // ✅ đã có user + role hợp lệ thì về trang chủ
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!raw) return;

      const u = JSON.parse(raw);
      const role = this.normalizeRole(
        u?.role || u?.vaiTro || u?.tenVaiTro || u?.tenQuyenHan || u?.quyenHan?.tenQuyenHan
      );

      if (role === "ADMIN" || role === "NHAN_VIEN") {
        this.$router.replace("/admin/trang-chu");
      } else {
        this.clearAuth();
      }
    } catch (e) {
      this.clearAuth();
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
  background: #f6f7f9;
  overflow: hidden;
}

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
  top: 56px;
  left: 102px;
  font-size: 14px;
  color: #6c757d;
}

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
