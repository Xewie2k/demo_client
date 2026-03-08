// File: src/pages/sales/composables/useBanHangQr.js
import { nextTick, ref } from "vue";
import { Html5Qrcode } from "html5-qrcode";

export function useBanHangQr(deps) {
  const { ctspList, loadCtspForPos, pickCtsp, getAvailableQtyByCtspId, blurActive } = deps;

  const showQrModal = ref(false);
  const qr = ref(null);
  const qrError = ref("");

  async function openQrModal() {
    showQrModal.value = true;
    qrError.value = "";
    await nextTick();
    await startQr();
  }

  async function closeQrModal() {
    blurActive();
    showQrModal.value = false;
    await stopQr();
  }

  async function restartQr() {
    qrError.value = "";
    await stopQr();
    await startQr();
  }

  async function startQr() {
    try {
      if (!qr.value) qr.value = new Html5Qrcode("ss-qr-reader");

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await qr.value.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          const text = String(decodedText || "").trim();
          if (!text) return;

          if (ctspList.value.length === 0) await loadCtspForPos();

          let row = ctspList.value.find((x) => String(x.maCtsp || "").trim() === text);

          if (!row) {
            const id = Number(text);
            if (Number.isFinite(id))
              row = ctspList.value.find((x) => Number(x.id) === id);
          }

          if (row) {
            pickCtsp({ ...row, __available: getAvailableQtyByCtspId(row.id) }, 1);
            await stopQr();
            blurActive();
            showQrModal.value = false;
          }
        },
      );
    } catch (e) {
      qrError.value =
        "Không mở được camera/QR. Vui lòng cấp quyền camera hoặc dùng thiết bị khác.";
    }
  }

  async function stopQr() {
    try {
      if (qr.value && (await qr.value.getState()) === 2) await qr.value.stop();
    } catch (e) {}
    try {
      if (qr.value) await qr.value.clear();
    } catch (e) {}
  }

  return {
    showQrModal,
    qrError,
    openQrModal,
    closeQrModal,
    restartQr,
    stopQr,
  };
}