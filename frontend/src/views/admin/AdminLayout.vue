<!-- File: src/views/admin/AdminLayout.vue -->
<template>
  <div class="container-fluid p-0 min-vh-100 ss-admin-root">
    <SidebarMenu />

    <main class="ss-main">
      <Toast position="top-right" />

      <header class="navbar px-4 sticky-top ss-header" style="height: 64px">
        <div class="container-fluid justify-content-end gap-3">
          <button
            type="button"
            class="ss-theme-btn"
            @click="batTatTheme"
            :title="theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'"
          >
            <span class="material-icons ss-text-muted">
              {{ theme === "dark" ? "light_mode" : "dark_mode" }}
            </span>
          </button>

          <div ref="userWrapRef" class="ss-user-wrap ps-3">
            <button class="ss-user-btn" type="button" @click="toggleUserMenu">
              <span class="material-icons ss-text-muted">account_circle</span>
              <span class="fw-bold small ss-text-muted d-none d-md-inline">
                {{ userName }}
              </span>
              <span class="material-icons small ss-text-muted">
                {{ userMenuOpen ? "expand_less" : "expand_more" }}
              </span>
            </button>

            <div v-show="userMenuOpen" class="ss-user-menu shadow">
              <button class="ss-user-item" type="button" @click="handleProfile">
                <span class="material-icons ss-user-ic">person</span>
                <span class="small fw-bold">Thông tin cá nhân</span>
              </button>

              <div class="ss-user-divider"></div>

              <button class="ss-user-item ss-danger" type="button" @click="handleLogout">
                <span class="material-icons ss-user-ic">logout</span>
                <span class="small fw-bold">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="p-4">
        <router-view />
      </div>

      <div v-if="showGiaoCaModal" class="ss-ca-modal-overlay">
        <div class="ss-ca-modal-content">
          <GiaoCa @ca-started="handleCaStarted" class="giao-ca-embedded" />
        </div>
      </div>
    </main>
  </div>

  <StaffChatWidget v-if="isNhanVien" />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

import SidebarMenu from "@/components/layouts/SidebarMenu.vue";
import StaffChatWidget from "@/chatAI/components/StaffChatWidget.vue";
import GiaoCa from "@/pages/lich_lam_viec/GiaoCa.vue";
import { checkActiveCa } from "@/services/lich_lam_viec/giao_caService";
import { getLichLamViecNhanVien } from "@/services/lich_lam_viec/lich_lam_viec_nhan_vienService";
import { useTheme } from "@/utils/useTheme";

const ADMIN_ROLES = ["ADMIN", "NHAN_VIEN"];

const route = useRoute();
const router = useRouter();

const { theme, khoiTaoTheme, batTatTheme } = useTheme();
khoiTaoTheme();

const userName = ref("Tài khoản");
const userMenuOpen = ref(false);
const userWrapRef = ref(null);
const showGiaoCaModal = ref(false);

const normalizeRole = (role) => {
  const r = String(role || "").trim().toUpperCase();

  if (r === "STAFF") return "NHAN_VIEN";
  if (r === "NHANVIEN" || r === "NHÂN_VIÊN" || r === "NHÂN VIÊN") return "NHAN_VIEN";

  return r;
};

const getUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    localStorage.getItem("nguoiDung") ||
    sessionStorage.getItem("nguoiDung");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const getUserRole = () => {
  const u = getUser();

  return normalizeRole(
    u?.role ||
      u?.vaiTro ||
      u?.tenVaiTro ||
      u?.tenQuyenHan ||
      u?.quyenHan?.tenQuyenHan ||
      u?.quyenHan ||
      u?.chucVu
  );
};

const isAdminRole = (role) => ADMIN_ROLES.includes(normalizeRole(role));

const isNhanVien = computed(() => getUserRole() === "NHAN_VIEN");

const syncUserName = () => {
  const u = getUser();
  const name = u?.hoTen || u?.tenNhanVien || u?.ten || u?.username || u?.email;

  userName.value = name || "Tài khoản";
};

const clearAuth = () => {
  const keys = [
    "accessToken",
    "token",
    "jwt",
    "ss_token",
    "user",
    "nguoiDung",
    "ss_nguoi_ban",
    "ss_has_active_shift",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const requireAuthOrRedirect = () => {
  const user = getUser();
  const role = getUserRole();

  if (!user || !isAdminRole(role)) {
    clearAuth();
    router.replace({
      path: "/dang-nhap",
      query: { redirect: route.fullPath },
    });
    return false;
  }

  return true;
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const handleProfile = () => {
  userMenuOpen.value = false;
  router.push("/admin/thong-tin-ca-nhan");
};

const handleLogout = () => {
  Swal.fire({
    title: "Xác nhận đăng xuất?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ff4d4f",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy",
  }).then((result) => {
    if (result.isConfirmed) {
      clearAuth();
      userMenuOpen.value = false;
      router.replace("/dang-nhap");
    }
  });
};

const onClickOutside = (e) => {
  if (!userMenuOpen.value) return;

  const el = userWrapRef.value;
  if (el && !el.contains(e.target)) {
    userMenuOpen.value = false;
  }
};

const getMinutes = (value) => {
  if (Array.isArray(value)) {
    return Number(value[0] || 0) * 60 + Number(value[1] || 0);
  }

  const parts = String(value || "").split(":");
  return Number(parts[0] || 0) * 60 + Number(parts[1] || 0);
};

const kiemTraVaoCa = async () => {
  const user = getUser();
  const role = getUserRole();

  if (!user || !isAdminRole(role)) return;

  if (role !== "NHAN_VIEN") {
    sessionStorage.setItem("ss_has_active_shift", "true");
    showGiaoCaModal.value = false;
    return;
  }

  const idNhanVien =
    user.idNhanVien ||
    user.nhanVienId ||
    user.id ||
    user.userId ||
    user.nhanVien?.id ||
    null;

  if (!idNhanVien) {
    sessionStorage.setItem("ss_has_active_shift", "false");
    showGiaoCaModal.value = false;
    return;
  }

  const today = new Date().toLocaleDateString("en-CA");

  try {
    const activeCa = await checkActiveCa(idNhanVien);

    if (activeCa && activeCa.id) {
      sessionStorage.setItem("ss_has_active_shift", "true");
      showGiaoCaModal.value = false;
      return;
    }

    const lichList = await getLichLamViecNhanVien(idNhanVien, today);
    let inShiftTime = false;

    if (Array.isArray(lichList) && lichList.length > 0) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const item of lichList) {
        const ca = item?.lichLamViec?.idCaLam || item?.lichLamViec?.caLam;

        if (ca?.gioBatDau && ca?.gioKetThuc) {
          const startMin = getMinutes(ca.gioBatDau);
          const endMin = getMinutes(ca.gioKetThuc);

          if (currentMinutes >= startMin - 30 && currentMinutes <= endMin) {
            inShiftTime = true;
            break;
          }
        }
      }
    }

    if (inShiftTime) {
      sessionStorage.setItem("ss_has_active_shift", "false");
      showGiaoCaModal.value = true;
      return;
    }

    sessionStorage.setItem("ss_has_active_shift", "false");
    showGiaoCaModal.value = false;

    Swal.fire({
      icon: "info",
      title: "Chế độ Chỉ xem",
      text: "Hiện tại không phải ca làm việc của bạn. Bạn chỉ có thể xem dữ liệu.",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
    });
  } catch (error) {
    console.error("Lỗi kiểm tra vào ca:", error);
    sessionStorage.setItem("ss_has_active_shift", "false");
    showGiaoCaModal.value = false;
  }
};

const handleCaStarted = () => {
  showGiaoCaModal.value = false;
  sessionStorage.setItem("ss_has_active_shift", "true");

  Swal.fire({
    icon: "success",
    title: "Đã mở ca",
    text: "Bạn đã có thể thao tác với hệ thống.",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });
};

onMounted(async () => {
  const ok = requireAuthOrRedirect();
  if (!ok) return;

  syncUserName();
  document.addEventListener("click", onClickOutside);
  await kiemTraVaoCa();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.ss-admin-root {
  overflow-x: hidden;
  --ss-sidebar-w: 240px;
  background: var(--ss-bg);
  color: var(--ss-text);
}

.ss-main {
  margin-left: var(--ss-sidebar-w, 240px);
  width: calc(100% - var(--ss-sidebar-w, 240px));
  overflow-x: hidden;
  min-height: 100vh;
}

.ss-header {
  background: var(--ss-surface);
  border-bottom: 1px solid var(--ss-border);
}

.ss-theme-btn {
  border: 0;
  background: transparent;
  padding: 6px 8px;
  border-radius: 10px;
  cursor: pointer;
}

.ss-theme-btn:hover {
  background: var(--ss-hover);
}

.ss-user-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--ss-border);
}

.ss-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 6px 6px;
  border-radius: 10px;
  cursor: pointer;
}

.ss-user-btn:hover {
  background: var(--ss-hover);
}

.ss-user-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  background: var(--ss-surface);
  border-radius: 12px;
  border: 1px solid var(--ss-border);
  overflow: hidden;
  z-index: 1200;
}

.ss-user-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  color: var(--ss-text);
}

.ss-user-item:hover {
  background: var(--ss-hover);
}

.ss-user-divider {
  height: 1px;
  background: var(--ss-border);
}

.ss-user-ic {
  font-size: 20px;
}

.ss-danger {
  color: #dc3545;
}

.ss-ca-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ss-ca-modal-content {
  background: transparent;
  border-radius: 12px;
}

.giao-ca-embedded {
  min-height: auto !important;
  padding: 0 !important;
  background: transparent !important;
}

.giao-ca-embedded :deep(.modal-overlay) {
  position: static !important;
  background: transparent !important;
}
</style>