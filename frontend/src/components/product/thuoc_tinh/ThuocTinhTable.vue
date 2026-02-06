<template>
  <div class="ss-card ss-border">
    <div class="ss-card-head d-flex align-items-center justify-content-between">
      <div class="fw-bold">{{ title }}</div>

      <div class="d-flex align-items-center gap-2">
        <span class="text-muted">Hiển thị</span>
        <select
          class="form-select form-select-sm"
          style="width: 90px"
          :value="pageSize"
          @change="$emit('page-size-change', $event.target.value)"
        >
          <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table ss-table mb-0">
        <thead>
          <tr>
            <th class="text-start th-stt">STT</th>
            <th class="text-start th-ma">Mã</th>
            <th class="text-start">{{ nameLabel }}</th>
            <th class="text-start th-hd">Hành động</th>
          </tr>
        </thead>

        <tbody v-if="!loading && items?.length">
          <tr v-for="(row, idx) in items" :key="row.id ?? idx">
            <td class="text-start">{{ (page - 1) * pageSize + idx + 1 }}</td>
            <td class="text-start fw-semibold">{{ pickMa(row) }}</td>
            <td class="text-start">{{ pickTen(row) }}</td>
            <td class="text-start">
              <button class="btn btn-sm ss-icon-btn" title="Xem" @click="$emit('view', row)">
                <span class="material-icons">visibility</span>
              </button>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="4" class="text-center py-4">
              <span v-if="loading">Đang tải...</span>
              <span v-else class="text-muted">Không có dữ liệu</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ss-card-foot d-flex align-items-center justify-content-between">
      <div class="text-muted small">Tổng: {{ totalItems }} bản ghi</div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" :disabled="page <= 1" @click="$emit('page-change', page - 1)">‹</button>
        <div class="small">Trang {{ page }} / {{ totalPages }}</div>
        <button class="btn btn-sm btn-outline-secondary" :disabled="page >= totalPages" @click="$emit('page-change', page + 1)">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: { type: String, default: "Danh sách" },
  nameLabel: { type: String, default: "Tên" },

  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },

  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 },
});

defineEmits(["page-change", "page-size-change", "view"]);

const totalPages = computed(() => Math.max(1, Math.ceil((props.totalItems || 0) / (props.pageSize || 10))));

function pickMa(row) {
  return row?.maCoGiay ?? row?.ma ?? row?.maThuocTinh ?? "-";
}
function pickTen(row) {
  return row?.tenCoGiay ?? row?.ten ?? row?.tenThuocTinh ?? "-";
}
</script>

<style scoped>
.ss-card-head,
.ss-card-foot {
  padding: 12px 14px;
}

/* ✅ HEADER kẻ cột giống màn sản phẩm */
.ss-table {
  border-collapse: separate;
  border-spacing: 0;
}
.ss-table thead th {
  background: #fafafa;
  font-weight: 800;
  font-size: 13px;
  white-space: nowrap;

  /* ✅ chỉnh khoảng cách cột ở đây */
  padding: 14px 18px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.ss-table thead th + th {
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

/* ✅ BODY không kẻ dọc */
.ss-table tbody td {
  padding: 14px 18px; /* ✅ chỉnh khoảng cách cột */
  border-left: none !important;
  border-right: none !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* (tuỳ chọn) set width để cột đều đẹp */
.th-stt { width: 70px; }
.th-ma { width: 140px; }
.th-hd { width: 140px; }

.ss-icon-btn {
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
}
.ss-icon-btn .material-icons {
  font-size: 18px;
}
.ss-table thead th {
  padding: 12px 16px;
}

.ss-table thead th:nth-child(1) { width: 70px; }   /* STT */
.ss-table thead th:nth-child(2) { width: 160px; }  /* Mã */
.ss-table thead th:nth-child(4) { width: 120px; }  /* Hành động */
</style>
