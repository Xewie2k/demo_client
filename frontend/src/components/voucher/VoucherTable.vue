<!-- File: src/components/voucher/VoucherTable.vue -->
<template>
  <div class="table-responsive">
    <table class="table align-middle small">
      <thead>
        <tr class="text-secondary border-bottom">
          <th>STT</th>
          <th>Mã</th>
          <th>Tên</th>
          <th>Loại</th>
          <th>Số lượng</th>
          <th>Ngày Bắt đầu</th>
          <th>Ngày Kết thúc</th>
          <th>Trạng thái</th>
          <th class="text-center">Hành động</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(p, i) in vouchers" :key="p.id" class="voucher-row">
          <td>{{ (currentPage - 1) * pageSize + i + 1 }}</td>

          <td class="text-dark fw-bold">{{ p.maPhieuGiamGia }}</td>
          <td>{{ p.tenPhieuGiamGia }}</td>

          <td>
            <span
              class="badge rounded-pill px-3 py-2 shadow-sm border-0"
              :style="getInternalLoaiStyle(p.loaiPhieuGiamGia)"
              style="font-size: 11px; min-width: 90px; font-weight: 700"
            >
              {{ p.loaiPhieuGiamGia ? "Cá nhân" : "Công khai" }}
            </span>
          </td>

          <td class="fw-bold">{{ p.soLuongSuDung >= 999999 ? "∞ Vô hạn" : p.soLuongSuDung }}</td>
          <td>{{ formatDate(p.ngayBatDau) }}</td>
          <td>{{ formatDate(p.ngayKetThuc) }}</td>

          <td>
            <span
              class="badge rounded-pill px-3 py-2 shadow-sm border-0"
              :style="getStatusStyle(p)"
              style="min-width: 110px; font-size: 11px; font-weight: 700"
            >
              {{ getStatusText(p) }}
            </span>
          </td>

          <td class="text-center">
            <div class="d-flex align-items-center justify-content-center gap-2">
              <!-- ✅ chỉ cho gạt khi đang hoạt động (yêu cầu của bạn) -->
              <div v-if="getStatusText(p) === 'Đang hoạt động'" class="form-check form-switch m-0 p-0">
                <input
                  class="form-check-input ss-toggle-red"
                  type="checkbox"
                  role="switch"
                  :checked="normalizeTrangThai(p.trangThai)"
                  @change="(e) => onToggle(p, e)"
                />
              </div>

              <button @click="$emit('view', p)" class="btn btn-sm btn-link p-0 text-secondary ss-btn-view">
                <span class="material-icons">visibility</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps(["vouchers", "currentPage", "pageSize", "formatDate", "getStatusStyle", "getStatusText"]);
const emit = defineEmits(["toggle", "view"]);

const normalizeTrangThai = (v) => v === true || Number(v) === 1;

const onToggle = (p, e) => {
  const checked = !!e?.target?.checked;
  // ✅ truyền checked lên cha để cha update đúng DB
  emit("toggle", p, checked);
};

const getInternalLoaiStyle = (isPersonal) => {
  if (!isPersonal) {
    return {
      background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
      color: "#e11d48",
      border: "1px solid #fecdd3",
    };
  }
  return {
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    color: "#475569",
    border: "1px solid #e2e8f0",
  };
};
</script>

<style scoped>
.voucher-row {
  transition: all 0.2s ease;
}
.voucher-row:hover {
  background-color: rgba(0, 0, 0, 0.015);
}

/* Tùy chỉnh nút gạt màu đỏ cam */
.ss-toggle-red {
  cursor: pointer;
  width: 2.2em !important;
  height: 1.1em !important;
  border-color: rgba(0, 0, 0, 0.1);
}

.ss-toggle-red:checked {
  background-color: #ff4d4f !important;
  border-color: #ff4d4f !important;
}

.ss-toggle-red:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 77, 79, 0.15) !important;
}

/* Hiệu ứng cho nút xem */
.ss-btn-view:hover {
  color: #ff4d4f !important;
  transform: scale(1.1);
}
</style>
