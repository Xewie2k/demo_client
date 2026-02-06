<template>
  <section class="card border-0 shadow-sm rounded-4 p-4 mb-4">
    <h3 class="h6 fw-bold mb-3">Bộ lọc</h3>
    <div class="row g-3">
      <div class="col-md-4">
        <label class="form-label small fw-bold">Tìm kiếm</label>
        <input :value="modelValue.keyword" @input="update('keyword', $event.target.value)" type="text" class="form-control bg-light border-0" placeholder="Tìm theo tên hoặc mã" />
      </div>
      <div class="col-md-4">
        <label class="form-label small fw-bold">Ngày bắt đầu</label>
        <input :value="modelValue.startDate" @input="update('startDate', $event.target.value)" type="date" class="form-control bg-light border-0" />
      </div>
      <div class="col-md-4">
        <label class="form-label small fw-bold">Ngày kết thúc</label>
        <input :value="modelValue.endDate" @input="inputUpdate('endDate', $event.target.value)" type="date" class="form-control bg-light border-0" />
      </div>
      <div class="col-12 mt-3">
        <label class="form-label fw-bold small mb-2">Trạng thái</label>
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex gap-3 align-items-center flex-wrap">
            <div class="form-check mb-0" v-for="opt in statusOptions" :key="opt.id">
              <input class="form-check-input" type="radio" :id="'st_' + opt.id" :value="opt.val" :checked="modelValue.status === opt.val" @change="update('status', opt.val)" />
              <label class="form-check-label small" :for="'st_' + opt.id">{{ opt.label }}</label>
            </div>
          </div>
          <button @click="$emit('reset')" class="btn btn-sm btn-outline-secondary px-3 rounded-pill fw-bold">Làm mới bộ lọc</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'reset']);

const statusOptions = [
  { id: 'all', label: 'Tất cả', val: '' },
  { id: 'active', label: 'Đang hoạt động', val: 'Đang hoạt động' },
  { id: 'pending', label: 'Chưa bắt đầu', val: 'Chưa bắt đầu' },
  { id: 'ended', label: 'Đã kết thúc', val: 'Đã kết thúc' },
];

const update = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>
