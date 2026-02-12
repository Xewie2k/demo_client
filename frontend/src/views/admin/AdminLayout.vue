<!-- File: src/views/admin/AdminLayout.vue -->
<template>
  <div class="container-fluid p-0 min-vh-100 bg-light ss-admin-root">
    <!-- ✅ Sidebar tách riêng -->
    <SidebarMenu />

    <!-- Main -->
    <main class="ss-main">
      <Toast position="top-right" />

      <header class="navbar bg-white px-4 sticky-top ss-header" style="height: 64px">
        <div class="container-fluid justify-content-end gap-3">
          <span class="material-icons text-secondary cursor-pointer">dark_mode</span>

          <!-- ✅ User dropdown (tự quản lý, không phụ thuộc bootstrap js) -->
          <div ref="userWrapRef" class="ss-user-wrap border-start ps-3">
            <button class="ss-user-btn" type="button" @click="toggleUserMenu">
              <span class="material-icons text-secondary">account_circle</span>
              <span class="fw-bold small text-secondary d-none d-md-inline">
                {{ userName }}
              </span>
              <span class="material-icons small text-secondary">
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
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

import SidebarMenu from "@/components/layouts/SidebarMenu.vue";
// Toast là component global (đã register trong main.js)

const route = useRoute();
const router = useRouter();

const userName = ref("Tài khoản");
const userMenuOpen = ref(false);
const userWrapRef = ref(null);

const getToken = () => {
  const keys = ["accessToken", "token", "jwt", "ss_token"];
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
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

const syncUserName = () => {
  const u = getUser();
  const name =
    u?.hoTen ||
    u?.tenNhanVien ||
    u?.ten ||
    u?.username ||
    u?.email;

  if (name) userName.value = name;
};

const clearAuth = () => {
  const keys = ["accessToken", "token", "jwt", "ss_token", "user", "nguoiDung"];
  keys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

const requireAuthOrRedirect = () => {
  const token = getToken();
  const u = getUser();

  // ✅ Cho phép 1 trong 2: có token hoặc có user
  if (!token && !u) {
    router.replace({
      path: "/dang-nhap",
      query: { redirect: route.fullPath },
    });
  }
};

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const handleProfile = () => {
  // TODO: sau này có trang profile thì push route ở đây
  userMenuOpen.value = false;
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
  if (el && !el.contains(e.target)) userMenuOpen.value = false;
};

onMounted(() => {
  requireAuthOrRedirect();
  syncUserName();
  document.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
/* ✅ chặn tràn ngang toàn layout + set biến width sidebar */
.ss-admin-root {
  overflow-x: hidden;
  --ss-sidebar-w: 240px;
}

/* ✅ main ăn theo width sidebar mới */
.ss-main {
  margin-left: var(--ss-sidebar-w, 240px);
  width: calc(100% - var(--ss-sidebar-w, 240px));
  overflow-x: hidden;
  min-height: 100vh;
}

.ss-header {
  border-bottom: 1px solid var(--ss-border, #eee);
}

.cursor-pointer {
  cursor: pointer;
}

/* ===== USER MENU ===== */
.ss-user-wrap {
  position: relative;
  display: flex;
  align-items: center;
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
  background: rgba(255, 77, 79, 0.06);
}

.ss-user-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
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
}

.ss-user-item:hover {
  background: rgba(255, 77, 79, 0.06);
}

.ss-user-divider {
  height: 1px;
  background: #eee;
}

.ss-user-ic {
  font-size: 20px;
}

.ss-danger {
  color: #dc3545;
}
</style>
