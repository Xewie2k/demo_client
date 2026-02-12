<!-- File: src/components/voucher/VoucherFilter.vue -->
<template>
  <section class="ss-vfilter">
    <div class="row g-3">
      <div class="col-md-3">
        <label class="form-label small ss-label">Tìm kiếm</label>
        <input
          :value="modelValue.keyword"
          @input="update('keyword', $event.target.value)"
          type="text"
          class="form-control"
          placeholder="Tìm theo tên hoặc mã"
        />
      </div>

      <div class="col-md-3">
        <label class="form-label small ss-label">Ngày bắt đầu</label>
        <input
          :value="modelValue.startDate"
          @input="update('startDate', $event.target.value)"
          type="date"
          class="form-control"
        />
      </div>

      <div class="col-md-3">
        <label class="form-label small ss-label">Ngày kết thúc</label>
        <input
          :value="modelValue.endDate"
          @input="update('endDate', $event.target.value)"
          type="date"
          class="form-control"
        />
      </div>

      <div class="col-md-3">
        <label class="form-label small ss-label">Trạng thái</label>
        <select
          class="form-select shadow-none"
          :value="modelValue.status"
          @change="update('status', $event.target.value)"
        >
          <option v-for="opt in statusOptions" :key="opt.id" :value="opt.val">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const statusOptions = [
  { id: "all", label: "Tất cả", val: "" },
  { id: "active", label: "Đang hoạt động", val: "Đang hoạt động" },
  { id: "pending", label: "Chưa bắt đầu", val: "Chưa bắt đầu" },
  { id: "ended", label: "Đã kết thúc", val: "Đã kết thúc" },
];

const update = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};
</script>

<style scoped>
.ss-vfilter .ss-label {
  color: rgba(17, 24, 39, 0.62);
  font-weight: 400;
}
</style>
