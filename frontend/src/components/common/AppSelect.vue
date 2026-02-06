<template>
  <Multiselect
    v-model="innerValue"
    :options="options"
    :searchable="true"
    :can-clear="true"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    :noOptionsText="'Không có dữ liệu'"
    :noResultsText="'Không tìm thấy'"
    :track-by="trackBy"
    :label="label"
  />
</template>

<script setup>
import { computed } from "vue";
import Multiselect from "@vueform/multiselect";

const props = defineProps({
  modelValue: { type: [Object, Number, String, null], default: null },
  options: { type: Array, default: () => [] }, // [{ id, label, ... }]
  trackBy: { type: String, default: "id" },
  label: { type: String, default: "label" },
  placeholder: { type: String, default: "Chọn..." },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const innerValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<style scoped>
/* nắn nhẹ cho giống input bootstrap */
:deep(.multiselect) { min-height: 38px; }
:deep(.multiselect-input) { min-height: 38px; padding-top: 6px; }
</style>
