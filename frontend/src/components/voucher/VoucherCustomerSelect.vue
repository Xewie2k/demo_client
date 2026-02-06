<template>
  <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
    <h3 class="h6 fw-bold mb-3">Chọn khách hàng</h3>
    <input v-if="!disabled" v-model="search" type="text" class="form-control mb-3 bg-light border-0" placeholder="Tìm kiếm khách hàng..." />
    <div class="table-responsive" style="max-height: 500px">
      <table class="table align-middle small">
        <thead class="bg-light sticky-top">
          <tr>
            <th v-if="!disabled">
              <input type="checkbox" @change="onToggleAll" :checked="isAllSelected" />
            </th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in paginated" :key="c.id">
            <td v-if="!disabled">
              <input type="checkbox" :value="c.id" v-model="selectedIds" />
            </td>
            <td>{{ c.tenKhachHang }}</td>
            <td>{{ c.email }}</td>
            <td>{{ c.soDienThoai }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="d-flex justify-content-between align-items-center mt-3">
      <div class="small text-secondary">Đã chọn: {{ selectedIds.length }}</div>
      <nav v-if="totalPages > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="page--"><span class="material-icons fs-6">chevron_left</span></button>
          </li>
          <li class="page-item" :class="{ disabled: page === totalPages }">
            <button class="page-link" @click="page++"><span class="material-icons fs-6">chevron_right</span></button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps(['customers', 'modelValue', 'disabled']);
const emit = defineEmits(['update:modelValue']);

const search = ref('');
const page = ref(1);
const pageSize = 5;
const selectedIds = ref(props.modelValue || []);

watch(selectedIds, (newVal) => emit('update:modelValue', newVal));
watch(() => props.modelValue, (newVal) => selectedIds.value = newVal || []);

const filtered = computed(() => {
  const s = search.value.toLowerCase();
  return props.customers.filter(c =>
    (c.tenKhachHang?.toLowerCase().includes(s)) || (c.soDienThoai?.includes(s))
  );
});

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize));
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filtered.value.slice(start, start + pageSize);
});

const isAllSelected = computed(() => filtered.value.length > 0 && filtered.value.every(c => selectedIds.value.includes(c.id)));

const onToggleAll = (e) => {
  if (e.target.checked) {
    const ids = new Set([...selectedIds.value, ...filtered.value.map(c => c.id)]);
    selectedIds.value = Array.from(ids);
  } else {
    const currentIds = filtered.value.map(c => c.id);
    selectedIds.value = selectedIds.value.filter(id => !currentIds.includes(id));
  }
};
</script>
