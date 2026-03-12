import { ref } from "vue";
import Swal from "sweetalert2";

/**
 * Chặn thao tác nếu chưa bắt đầu ca làm.
 * Mặc định đọc flag: sessionStorage["ss_has_active_shift"] === "true"
 */
export function useBanHangQuyenCaLam(options = {}) {
  const storageKey = options.storageKey || "ss_has_active_shift";

  const hasPermission = ref(false);

  function reloadPermission() {
    hasPermission.value = sessionStorage.getItem(storageKey) === "true";
    return hasPermission.value;
  }

  // init 1 lần để template có giá trị ngay
  reloadPermission();

  function checkQuyenThaoTac() {
    // luôn đọc lại sessionStorage để tránh computed cache
    if (reloadPermission()) return true;

    Swal.fire({
      icon: "error",
      title: "Chế độ Chỉ xem",
      text: "Bạn cần Bắt đầu ca làm việc mới có thể Thêm hoặc Sửa dữ liệu!",
      confirmButtonColor: "#6366f1",
    });

    return false;
  }

  // helper bọc hàm (sync/async đều ok)
  function guard(fn) {
    return (...args) => {
      if (!checkQuyenThaoTac()) return;
      return fn(...args);
    };
  }

  return { hasPermission, reloadPermission, checkQuyenThaoTac, guard };
}