<template>
  <div ref="wrapRef" class="ss-thong-bao-wrap">
    <button
      type="button"
      class="ss-thong-bao-btn"
      title="Thông báo"
      @click="toggleBangThongBao"
    >
      <span class="material-icons ss-thong-bao-btn-icon">notifications</span>
      <span v-if="soThongBaoChuaDoc > 0" class="ss-thong-bao-badge">
        {{ hienThiBadge }}
      </span>
    </button>

    <div v-show="dangMo" class="ss-thong-bao-panel shadow">
      <div class="ss-thong-bao-head">
        <div>
          <div class="ss-thong-bao-title">Thông báo</div>
          <div class="ss-thong-bao-subtitle">
            {{ soThongBaoChuaDoc }} chưa đọc · {{ soThongBaoChuaXuLy }} chưa xử lý
          </div>
        </div>

        <button
          type="button"
          class="ss-thong-bao-markall"
          :disabled="dangTai || soThongBaoChuaDoc <= 0"
          @click="danhDauTatCa"
        >
          Đọc tất cả
        </button>
      </div>

      <div class="ss-thong-bao-preference-row">
        <label class="ss-thong-bao-toggle">
          <input v-model="tatPopupThongBao" type="checkbox" />
          <span>Tắt popup thông báo</span>
        </label>
      </div>

      <div v-if="dangTai" class="ss-thong-bao-empty">Đang tải thông báo...</div>

      <template v-else>
        <div v-if="!danhSachThongBao.length" class="ss-thong-bao-empty">
          Hiện chưa có thông báo nào.
        </div>

        <div v-else class="ss-thong-bao-list">
          <button
            v-for="thongBao in danhSachThongBao"
            :key="thongBao.id"
            type="button"
            class="ss-thong-bao-item"
            :class="{
              'is-unread': !thongBao.daDoc,
              'is-handled': thongBao.daXuLy,
              'muc-do-2': thongBao.mucDo === 2,
              'muc-do-3': thongBao.mucDo === 3,
            }"
            @click="moThongBao(thongBao)"
          >
            <div class="ss-thong-bao-row">
              <span class="ss-thong-bao-dot"></span>

              <div class="ss-thong-bao-main">
                <div class="ss-thong-bao-item-head">
                  <span class="ss-thong-bao-item-title">{{ thongBao.tieuDe }}</span>
                  <span class="ss-thong-bao-time">
                    {{ dinhDangThoiGian(thongBao.thoiGianTao) }}
                  </span>
                </div>

                <div class="ss-thong-bao-meta">
                  <span class="ss-thong-bao-chip" :class="`muc-do-${thongBao.mucDo || 1}`">
                    {{ thongBao.mucDoLabel || "Thông tin" }}
                  </span>

                  <span v-if="thongBao.daXuLy" class="ss-thong-bao-chip handled">
                    Đã xử lý
                  </span>
                  <span v-else class="ss-thong-bao-chip pending">
                    Chưa xử lý
                  </span>
                </div>

                <div class="ss-thong-bao-content">{{ thongBao.noiDung }}</div>

                <div class="ss-thong-bao-actions">
                  <button
                    v-if="!thongBao.daXuLy"
                    type="button"
                    class="ss-thong-bao-action"
                    @click.stop="xuLyThongBao(thongBao)"
                  >
                    Đánh dấu đã xử lý
                  </button>
                </div>
              </div>
            </div>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import {
  danhDauTatCaThongBaoDaDoc,
  danhDauThongBaoDaDoc,
  danhDauThongBaoDaXuLy,
  ketNoiThongBao,
  layDanhSachThongBao,
  layIdNhanVienDangNhap,
  layTongQuanThongBao,
} from "@/services/thongBaoService";

const router = useRouter();
const toast = useToast();

const wrapRef = ref(null);
const dangMo = ref(false);
const dangTai = ref(false);
const danhSachThongBao = ref([]);
const soThongBaoChuaDoc = ref(0);
const soThongBaoChuaXuLy = ref(0);
const idNhanVien = ref(null);
const tatPopupThongBao = ref(localStorage.getItem("ss_tat_popup_thong_bao") === "true");

let huyKetNoiThongBao = null;

watch(tatPopupThongBao, (val) => {
  localStorage.setItem("ss_tat_popup_thong_bao", String(val));
});

const hienThiBadge = computed(() => {
  if (soThongBaoChuaDoc.value > 99) return "99+";
  return String(soThongBaoChuaDoc.value || 0);
});

function dinhDangThoiGian(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffPhut = Math.floor(diffMs / 60000);
  const diffGio = Math.floor(diffMs / 3600000);
  const diffNgay = Math.floor(diffMs / 86400000);

  if (diffPhut < 1) return "Vừa xong";
  if (diffPhut < 60) return `${diffPhut} phút trước`;
  if (diffGio < 24) return `${diffGio} giờ trước`;
  if (diffNgay < 7) return `${diffNgay} ngày trước`;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function parseJsonSafe(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function thongBaoToRoute(thongBao) {
  const payload = parseJsonSafe(thongBao?.duLieuBoSung);
  const idDoiTuong =
    thongBao?.idDoiTuongLienQuan || payload?.idHoaDon || payload?.idPhienChat || null;

  if (thongBao?.loaiDoiTuongLienQuan === "HOA_DON") {
    if (idDoiTuong) {
      return { name: "admin-hoa-don-detail", params: { id: String(idDoiTuong) } };
    }
    return { name: "admin-hoa-don" };
  }

  if (thongBao?.loaiDoiTuongLienQuan === "CHI_TIET_SAN_PHAM") {
    if (idDoiTuong) {
      return { name: "admin-ctsp-one", params: { id: String(idDoiTuong) } };
    }
    return { name: "admin-ctsp" };
  }

  if (thongBao?.loaiDoiTuongLienQuan === "PHIEN_CHAT") {
    if (idDoiTuong) {
      return { name: "admin-chat", query: { phienChatId: String(idDoiTuong) } };
    }
    return { name: "admin-chat" };
  }

  if (
    [
      "DON_TRUC_TUYEN_MOI",
      "DON_CHO_XAC_NHAN",
      "DON_CO_YEU_CAU_HUY",
      "THANH_TOAN_THAT_BAI",
      "THANH_TOAN_THANH_CONG_CHUA_DONG_BO",
      "GIAO_DICH_BAT_THUONG",
    ].includes(thongBao?.loaiThongBao)
  ) {
    if (payload?.idHoaDon) {
      return { name: "admin-hoa-don-detail", params: { id: String(payload.idHoaDon) } };
    }
    return { name: "admin-hoa-don" };
  }

  if (["TIN_NHAN_MOI", "KHACH_CHO_PHAN_HOI_QUA_HAN"].includes(thongBao?.loaiThongBao)) {
    if (payload?.idPhienChat || thongBao?.idDoiTuongLienQuan) {
      return {
        name: "admin-chat",
        query: { phienChatId: String(payload?.idPhienChat || thongBao?.idDoiTuongLienQuan) },
      };
    }
    return { name: "admin-chat" };
  }

  if (["BIEN_THE_HET_HANG", "BIEN_THE_SAP_HET_HANG"].includes(thongBao?.loaiThongBao)) {
    if (thongBao?.idDoiTuongLienQuan) {
      return { name: "admin-ctsp-one", params: { id: String(thongBao.idDoiTuongLienQuan) } };
    }
    return { name: "admin-ctsp" };
  }

  return { name: "admin-trang-chu" };
}

function chenThongBaoMoi(thongBaoMoi) {
  if (!thongBaoMoi || !thongBaoMoi.id) return;

  const idx = danhSachThongBao.value.findIndex((item) => item.id === thongBaoMoi.id);
  if (idx >= 0) {
    danhSachThongBao.value[idx] = thongBaoMoi;
  } else {
    danhSachThongBao.value.unshift(thongBaoMoi);
  }

  danhSachThongBao.value = danhSachThongBao.value
    .slice()
    .sort((a, b) => new Date(b.thoiGianTao || 0) - new Date(a.thoiGianTao || 0))
    .slice(0, 20);
}

async function taiTongQuan() {
  if (!idNhanVien.value) return;
  const data = await layTongQuanThongBao(idNhanVien.value);
  soThongBaoChuaDoc.value = Number(data?.soThongBaoChuaDoc || 0);
  soThongBaoChuaXuLy.value = Number(data?.soThongBaoChuaXuLy || 0);
}

async function taiDanhSach() {
  if (!idNhanVien.value) return;

  dangTai.value = true;
  try {
    danhSachThongBao.value = await layDanhSachThongBao({
      nhanVienId: idNhanVien.value,
      gioiHan: 20,
    });
  } finally {
    dangTai.value = false;
  }
}

async function dongBoBanDau() {
  if (!idNhanVien.value) return;
  await Promise.all([taiTongQuan(), taiDanhSach()]);
}

async function toggleBangThongBao() {
  dangMo.value = !dangMo.value;
  if (dangMo.value) {
    await dongBoBanDau();
  }
}

async function danhDauTatCa() {
  if (!idNhanVien.value || soThongBaoChuaDoc.value <= 0) return;

  try {
    const tongQuan = await danhDauTatCaThongBaoDaDoc(idNhanVien.value);
    soThongBaoChuaDoc.value = Number(tongQuan?.soThongBaoChuaDoc || 0);
    soThongBaoChuaXuLy.value = Number(tongQuan?.soThongBaoChuaXuLy || 0);
    danhSachThongBao.value = danhSachThongBao.value.map((item) => ({
      ...item,
      daDoc: true,
      thoiGianDoc: item.thoiGianDoc || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Lỗi đánh dấu tất cả đã đọc:", error);
  }
}

async function xuLyThongBao(thongBao) {
  if (!idNhanVien.value || !thongBao?.id || thongBao.daXuLy) return;

  try {
    const data = await danhDauThongBaoDaXuLy(thongBao.id, idNhanVien.value);
    chenThongBaoMoi(data);
    soThongBaoChuaXuLy.value = Math.max(0, soThongBaoChuaXuLy.value - 1);
  } catch (error) {
    console.error("Lỗi đánh dấu đã xử lý:", error);
  }
}

async function moThongBao(thongBao) {
  if (!thongBao) return;

  try {
    if (!thongBao.daDoc && thongBao.id && idNhanVien.value) {
      const data = await danhDauThongBaoDaDoc(thongBao.id, idNhanVien.value);
      chenThongBaoMoi(data);
      soThongBaoChuaDoc.value = Math.max(0, soThongBaoChuaDoc.value - 1);
    }
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
  }

  dangMo.value = false;

  try {
    await router.push(thongBaoToRoute(thongBao));
  } catch {
    // bỏ qua lỗi điều hướng trùng route
  }
}

function dangMoDungPhienChat(thongBaoMoi) {
  if (router.currentRoute.value.name !== "admin-chat") return false;

  const routePhienChatId = String(router.currentRoute.value.query?.phienChatId || "");
  const payload = parseJsonSafe(thongBaoMoi?.duLieuBoSung);
  const thongBaoPhienChatId = String(
    payload?.idPhienChat || thongBaoMoi?.idDoiTuongLienQuan || "",
  );

  return (
    ["TIN_NHAN_MOI", "KHACH_CHO_PHAN_HOI_QUA_HAN"].includes(thongBaoMoi?.loaiThongBao) &&
    routePhienChatId &&
    thongBaoPhienChatId &&
    routePhienChatId === thongBaoPhienChatId
  );
}

function xuLyThongBaoRealtime(thongBaoMoi) {
  chenThongBaoMoi(thongBaoMoi);

  if (tatPopupThongBao.value) return;
  if (dangMoDungPhienChat(thongBaoMoi)) return;

  toast.add({
    severity: thongBaoMoi?.mucDo === 3 ? "error" : thongBaoMoi?.mucDo === 2 ? "warn" : "info",
    summary: thongBaoMoi?.tieuDe || "Thông báo mới",
    detail: thongBaoMoi?.noiDung || "Bạn có một thông báo mới.",
    life: 3500,
  });
}

function onClickOutside(event) {
  if (!dangMo.value) return;
  const el = wrapRef.value;
  if (el && !el.contains(event.target)) {
    dangMo.value = false;
  }
}

onMounted(async () => {
  idNhanVien.value = layIdNhanVienDangNhap();
  document.addEventListener("click", onClickOutside);

  if (!idNhanVien.value) return;

  try {
    await dongBoBanDau();
  } catch (error) {
    console.error("Lỗi tải thông báo ban đầu:", error);
  }

  huyKetNoiThongBao = ketNoiThongBao({
    idNhanVien: idNhanVien.value,
    khiCoThongBaoMoi: xuLyThongBaoRealtime,
    khiCapNhatDemChuaDoc: (count) => {
      soThongBaoChuaDoc.value = Number(count || 0);
    },
    khiLoi: (error) => {
      console.error("Lỗi WebSocket thông báo:", error);
    },
  });
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  if (typeof huyKetNoiThongBao === "function") {
    huyKetNoiThongBao();
  }
});
</script>

<style scoped>
.ss-thong-bao-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ss-thong-bao-btn {
  position: relative;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.ss-thong-bao-btn:hover,
.ss-thong-bao-btn:active,
.ss-thong-bao-btn:focus,
.ss-thong-bao-btn:focus-visible {
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.ss-thong-bao-btn-icon {
  font-size: 22px;
  color: rgba(17, 24, 39, 0.65) !important;
  transition: color 0.2s ease;
}

.ss-thong-bao-btn:hover .ss-thong-bao-btn-icon {
  color: rgba(17, 24, 39, 0.65) !important;
}

.ss-thong-bao-badge {
  position: absolute;
  top: 0;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--ss-surface);
}

.ss-thong-bao-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: min(420px, calc(100vw - 32px));
  max-height: 72vh;
  background: var(--ss-surface);
  border: 1px solid var(--ss-border);
  border-radius: 16px;
  overflow: hidden;
  z-index: 1300;
}

.ss-thong-bao-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--ss-border);
}

.ss-thong-bao-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--ss-text);
}

.ss-thong-bao-subtitle {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  color: var(--ss-text-muted, #6b7280);
}

.ss-thong-bao-markall {
  border: 0;
  outline: none;
  box-shadow: none;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  padding: 0;
  cursor: pointer;
}

.ss-thong-bao-markall:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ss-thong-bao-preference-row {
  display: flex;
  justify-content: flex-end;
  padding: 10px 16px 0;
}

.ss-thong-bao-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(17, 24, 39, 0.65);
  cursor: pointer;
  user-select: none;
}

.ss-thong-bao-toggle input {
  width: 14px;
  height: 14px;
  accent-color: #ff4d4f;
}

.ss-thong-bao-list {
  max-height: calc(72vh - 96px);
  overflow: auto;
}

.ss-thong-bao-empty {
  padding: 28px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: var(--ss-text-muted, #6b7280);
}

.ss-thong-bao-item {
  width: 100%;
  border: 0;
  outline: none;
  box-shadow: none;
  background: transparent;
  text-align: left;
  padding: 0;
  border-bottom: 1px solid var(--ss-border);
}

.ss-thong-bao-item:last-child {
  border-bottom: 0;
}

.ss-thong-bao-item:hover {
  background: var(--ss-hover);
}

.ss-thong-bao-row {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
}

.ss-thong-bao-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #cbd5e1;
  margin-top: 8px;
  flex: 0 0 auto;
}

.ss-thong-bao-item.is-unread .ss-thong-bao-dot {
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.14);
}

.ss-thong-bao-item.muc-do-2 .ss-thong-bao-dot {
  background: #f59e0b;
}

.ss-thong-bao-item.muc-do-3 .ss-thong-bao-dot {
  background: #ef4444;
}

.ss-thong-bao-main {
  min-width: 0;
  flex: 1;
}

.ss-thong-bao-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.ss-thong-bao-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ss-text);
}

.ss-thong-bao-time {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 400;
  color: var(--ss-text-muted, #6b7280);
}

.ss-thong-bao-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.ss-thong-bao-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 400;
  background: rgba(148, 163, 184, 0.12);
  color: var(--ss-text-muted, #64748b);
}

.ss-thong-bao-chip.muc-do-2 {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.ss-thong-bao-chip.muc-do-3 {
  background: rgba(239, 68, 68, 0.14);
  color: #b91c1c;
}

.ss-thong-bao-chip.pending {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.ss-thong-bao-chip.handled {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.ss-thong-bao-content {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 400;
  color: var(--ss-text-muted, #475569);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ss-thong-bao-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.ss-thong-bao-action {
  border: 0;
  outline: none;
  box-shadow: none;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  font-weight: 400;
  padding: 0;
  cursor: pointer;
}

@media (max-width: 768px) {
  .ss-thong-bao-panel {
    right: -8px;
    width: min(380px, calc(100vw - 20px));
  }

  .ss-thong-bao-row {
    padding: 12px 14px;
  }
}
</style>
