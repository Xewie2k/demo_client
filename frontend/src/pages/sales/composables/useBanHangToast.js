// File: src/pages/sales/composables/useBanHangToast.js
import { onBeforeUnmount, reactive, ref } from "vue";

export function useBanHangToast() {
  const toast = reactive({ show: false, msg: "", type: "success" });
  const toastTimer = ref(null);

  function showToast(msg, type = "success", duration = 2600) {
    if (toastTimer.value) clearTimeout(toastTimer.value);

    toast.show = true;
    toast.msg = msg;
    toast.type = type;

    const time = Number(duration);
    const finalDuration = Number.isFinite(time) && time > 0 ? time : 2600;

    toastTimer.value = setTimeout(() => {
      toast.show = false;
    }, finalDuration);
  }

  function hideToast() {
    if (toastTimer.value) clearTimeout(toastTimer.value);
    toast.show = false;
  }

  onBeforeUnmount(() => {
    try {
      if (toastTimer.value) clearTimeout(toastTimer.value);
    } catch (e) {}
  });

  return { toast, showToast, hideToast };
}