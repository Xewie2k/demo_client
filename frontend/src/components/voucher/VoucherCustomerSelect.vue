<!-- File: src/components/voucher/VoucherCustomerSelect.vue -->
<template>
  <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h3 class="h6 m-0 ss-title">Chọn khách hàng</h3>

      <label class="form-check d-flex align-items-center gap-2 m-0">
        <input class="form-check-input" type="checkbox" :checked="chiHienChuaGui" @change="emitChiHienChuaGui($event)" :disabled="disabled" />
        <span class="ss-muted">Chỉ hiện chưa gửi</span>
      </label>
    </div>

    <input
      v-if="!disabled"
      v-model="search"
      type="text"
      class="form-control mb-3 ss-input"
      placeholder="Tìm theo tên / SĐT / email..."
    />

    <div class="table-responsive ss-table-wrap" style="max-height: 500px">
      <table class="table table-hover align-middle mb-0 ss-table">
        <colgroup>
          <col v-if="!disabled" style="width: 40px" />
          <col style="width: 33.33%" />
          <col style="width: 33.33%" />
          <col style="width: 33.33%" />
        </colgroup>

        <thead class="table-light sticky-top">
          <tr>
            <th v-if="!disabled">
              <input type="checkbox" class="form-check-input" @change="onToggleAll" :checked="isAllSelected" />
            </th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in paginated" :key="c.id">
            <td v-if="!disabled">
              <input
                type="checkbox"
                class="form-check-input"
                :value="Number(c.id)"
                v-model="selectedIds"
                :disabled="disabled"
              />
            </td>

            <td class="ss-ellipsis">{{ getText(c?.tenKhachHang) || "-" }}</td>
            <td class="ss-ellipsis">{{ getText(c?.email) || "-" }}</td>
            <td class="ss-ellipsis">{{ getText(c?.soDienThoai) || "-" }}</td>
          </tr>

          <tr v-if="paginated.length === 0">
            <td :colspan="disabled ? 3 : 4" class="text-center text-secondary py-4">
              Không có khách hàng phù hợp
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="small ss-muted">Đã chọn: {{ selectedIds.length }}</div>

      <nav v-if="totalPages > 1">
        <ul class="pagination mb-0 ss-pagination">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" type="button" @click="prevPage" :disabled="page === 1">‹</button>
          </li>

          <li class="page-item" :class="{ disabled: page === totalPages }">
            <button class="page-link" type="button" @click="nextPage" :disabled="page === totalPages">›</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  customers: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },

  // ✅ optional: danh sách đã gửi mail (nếu cha muốn dùng)
  daGuiIds: { type: Array, default: () => [] },

  // ✅ optional v-model:chiHienChuaGui
  chiHienChuaGui: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "update:chiHienChuaGui"]);

const search = ref("");
const page = ref(1);
const pageSize = 5;

const getText = (v) => {
  if (v === null || v === undefined) return "";
  return String(v).trim();
};

const normalizeIds = (arr) =>
  [...new Set((arr || []).map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0))].sort((a, b) => a - b);

const sameArray = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const sentSet = computed(() => new Set(normalizeIds(props.daGuiIds)));

// ✅ local state
const selectedIds = ref(normalizeIds(props.modelValue));

// ✅ emit khi THỰC SỰ đổi
watch(
  selectedIds,
  (newVal) => {
    const cleaned = normalizeIds(newVal);
    const currentProps = normalizeIds(props.modelValue);

    if (sameArray(cleaned, currentProps)) return;
    emit("update:modelValue", cleaned);
  },
  { deep: true }
);

// ✅ nhận từ cha: chỉ set khi khác
watch(
  () => props.modelValue,
  (newVal) => {
    const incoming = normalizeIds(newVal);
    const currentLocal = normalizeIds(selectedIds.value);

    if (sameArray(incoming, currentLocal)) return;
    selectedIds.value = incoming;
  },
  { deep: true }
);

const filtered = computed(() => {
  const s = (search.value || "").toLowerCase().trim();
  let list = Array.isArray(props.customers) ? props.customers : [];

  if (s) {
    list = list.filter((c) => {
      const ten = String(c?.tenKhachHang || "").toLowerCase();
      const sdt = String(c?.soDienThoai || "").toLowerCase();
      const email = String(c?.email || "").toLowerCase();
      return ten.includes(s) || sdt.includes(s) || email.includes(s);
    });
  }

  // ✅ chỉ hiện chưa gửi (nếu cha bật)
  if (props.chiHienChuaGui) {
    list = list.filter((c) => !sentSet.value.has(Number(c?.id)));
  }

  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));

const paginated = computed(() => {
  const safePage = Math.min(Math.max(page.value, 1), totalPages.value);
  const start = (safePage - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

watch(
  () => filtered.value.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value;
    if (page.value < 1) page.value = 1;
  }
);

const isAllSelected = computed(() => {
  if (filtered.value.length === 0) return false;
  const set = new Set(selectedIds.value.map(Number));
  return filtered.value.every((c) => set.has(Number(c.id)));
});

const onToggleAll = (e) => {
  const checked = e.target.checked;

  if (checked) {
    const ids = new Set(selectedIds.value);
    filtered.value.forEach((c) => ids.add(Number(c.id)));
    selectedIds.value = normalizeIds(Array.from(ids));
  } else {
    const removeSet = new Set(filtered.value.map((c) => Number(c.id)).filter((n) => Number.isFinite(n) && n > 0));
    selectedIds.value = normalizeIds(selectedIds.value.filter((id) => !removeSet.has(Number(id))));
  }
};

const prevPage = () => {
  if (page.value > 1) page.value--;
};

const nextPage = () => {
  if (page.value < totalPages.value) page.value++;
};

const emitChiHienChuaGui = (e) => {
  emit("update:chiHienChuaGui", !!e?.target?.checked);
};
</script>

<style scoped>
.ss-title {
  font-weight: 400;
  letter-spacing: 0.2px;
}
.ss-muted {
  color: rgba(17, 24, 39, 0.7);
  font-weight: 400;
}
.ss-input {
  height: 36px;
  border-radius: 10px;
  font-size: 14px;
  border: 1px solid rgba(17, 24, 39, 0.12);
}
.ss-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ss-table-wrap {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  overflow: hidden;
}
.ss-table {
  table-layout: fixed;
  width: 100%;
}
.ss-table th,
.ss-table td {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 400;
  border-color: rgba(17, 24, 39, 0.08);
}
.ss-table thead th {
  font-weight: 400;
}
.ss-pagination .page-link {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-left: 6px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  color: #111827;
  font-weight: 400;
}
</style>
