<template>
  <div class="table-responsive">
    <table class="table align-middle mb-0 ss-table">
      <thead>
        <tr>
          <th style="width: 70px">STT</th>
          <th style="width: 140px">Mã</th>
          <th>Tên</th>
          <th style="width: 140px">Loại</th>
          <th style="width: 120px">Số lượng</th>
          <th style="width: 140px">Ngày bắt đầu</th>
          <th style="width: 140px">Ngày kết thúc</th>
          <th style="width: 160px">Trạng thái</th>
          <th class="text-center" style="width: 140px">Hành động</th>
        </tr>
      </thead>

      <tbody v-if="!vouchers?.length">
        <tr>
          <td colspan="9" class="text-center text-muted py-4">Không có dữ liệu</td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr v-for="(p, i) in vouchers" :key="p.id">
          <td class="ss-td-index">{{ (currentPage - 1) * pageSize + i + 1 }}</td>

          <td class="ss-td-code">{{ p.maPhieuGiamGia }}</td>

          <td class="ss-td-name">
            {{ p.tenPhieuGiamGia }}
          </td>

          <td>
            <span
              class="ss-pill ss-pill-type"
              :class="p.loaiPhieuGiamGia ? 'ss-pill-personal' : 'ss-pill-public'"
              :style="getLoaiStyle(p.loaiPhieuGiamGia)"
            >
              {{ p.loaiPhieuGiamGia ? "Cá nhân" : "Công khai" }}
            </span>
          </td>

          <td class="ss-td-qty">
            {{ p.soLuongSuDung >= 999999 ? "∞ Vô hạn" : p.soLuongSuDung }}
          </td>

          <td class="ss-td-date">{{ formatDate(p.ngayBatDau) }}</td>
          <td class="ss-td-date">{{ formatDate(p.ngayKetThuc) }}</td>

          <td>
            <span class="ss-pill ss-pill-status" :style="getStatusStyle(p)">
              {{ getStatusText(p) }}
            </span>
          </td>

          <td class="text-center">
            <div class="d-inline-flex align-items-center gap-2">
              <button
                v-if="getStatusText(p) !== 'Đã kết thúc'"
                @click="$emit('toggle', p)"
                class="btn ss-icon-btn"
                type="button"
                title="Đổi trạng thái"
              >
                <span class="material-icons-outlined">sync</span>
              </button>

              <button
                @click="$emit('view', p)"
                class="btn ss-icon-btn"
                type="button"
                title="Xem"
              >
                <span class="material-icons-outlined">visibility</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps([
  "vouchers",
  "currentPage",
  "pageSize",
  "formatDate",
  "getStatusStyle",
  "getStatusText",
]);
defineEmits(["toggle", "view"]);

/**
 * ✅ Loại phiếu theo palette SS (đỏ/đen/trắng)
 * - Cá nhân: đỏ dịu
 * - Công khai: đen dịu
 */
const getLoaiStyle = (isPersonal) => {
  return isPersonal
    ? {
        background: "rgba(255, 77, 79, 0.10)",
        color: "#b42324",
        border: "1px solid rgba(255, 77, 79, 0.28)",
      }
    : {
        background: "rgba(17, 24, 39, 0.06)",
        color: "rgba(17, 24, 39, 0.88)",
        border: "1px solid rgba(17, 24, 39, 0.14)",
      };
};
</script>

<style scoped>
/* ===== TABLE chung: chữ vừa mắt, không nhạt ===== */
.ss-table {
  font-size: 14px;
  color: rgba(17, 24, 39, 0.88);
}

.ss-table thead th {
  background: #f9fafb;
  color: rgba(17, 24, 39, 0.78);
  font-weight: 800;
  font-size: 13.5px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  padding: 14px 14px;
  white-space: nowrap;
}

/* body: line rõ */
.ss-table td {
  padding: 14px 14px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  vertical-align: middle;
}

.ss-table tbody tr:hover {
  background: rgba(17, 24, 39, 0.03);
}

.ss-td-index {
  color: rgba(17, 24, 39, 0.72);
  font-weight: 600;
}

.ss-td-code {
  color: rgba(17, 24, 39, 0.92);
  font-weight: 800;
}

.ss-td-name {
  color: rgba(17, 24, 39, 0.88);
  font-weight: 600;
}

.ss-td-date {
  color: rgba(17, 24, 39, 0.70);
  font-weight: 600;
}

.ss-td-qty {
  color: rgba(17, 24, 39, 0.92);
  font-weight: 800;
}

/* ===== PILL (Loại + Trạng thái) ===== */
.ss-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.ss-pill-type {
  min-width: 92px;
}

.ss-pill-status {
  min-width: 116px;
}

/* ===== ICON BUTTON chuẩn SS (mắt + sync) ===== */
.ss-icon-btn {
  width: var(--ss-icon-size, 36px);
  height: var(--ss-icon-size, 36px);
  border-radius: var(--ss-icon-radius, 10px);
  border: 1px solid var(--ss-icon-border, rgba(17, 24, 39, 0.14));
  background: #fff;
  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--ss-icon, rgba(17, 24, 39, 0.88)) !important;
  transition: 0.2s;
}

.ss-icon-btn .material-icons-outlined {
  font-size: 18px;
  line-height: 1;
  color: inherit !important;
}

.ss-icon-btn:hover {
  background: var(--ss-icon-bg-hover, rgba(17, 24, 39, 0.04));
  border-color: var(--ss-icon-border-hover, rgba(17, 24, 39, 0.18));
}
</style>
