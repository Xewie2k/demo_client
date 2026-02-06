<template>
  <AppModal :open="open" :title="computedTitle" @close="$emit('close')">
    <template #default>
      <div class="row g-2">
        <div class="col-12">
          <label class="form-label">Tên {{ title.toLowerCase() }} *</label>
          <input
            class="form-control"
            :value="nameValue"
            :disabled="mode === 'view'"
            @input="$emit('update:nameValue', $event.target.value)"
            placeholder="Nhập tên..."
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary ss-btn" @click="$emit('close')">Đóng</button>
        <button v-if="mode !== 'view'" class="btn btn-dark ss-btn" :disabled="saving" @click="$emit('save')">
          {{ saving ? "Đang lưu..." : "Lưu" }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { computed } from "vue";
import AppModal from "@/components/shared/AppModal.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: "create" }, // create | view
  title: { type: String, default: "THUỘC TÍNH" },
  saving: { type: Boolean, default: false },
  nameValue: { type: String, default: "" },
});

defineEmits(["close", "save", "update:nameValue"]);

const computedTitle = computed(() => {
  if (props.mode === "view") return `XEM ${props.title}`;
  return `THÊM ${props.title}`;
});
</script>

<style scoped>
.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
}
</style>
