<template>
  <div class="ss-combo" ref="wrap">
    <div class="input-group">
      <input
        class="form-control"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        :value="displayText"
        @input="onInput"
        @focus="open = true"
        @keydown.down.prevent="open = true"
        @keydown.esc.prevent="open = false"
      />

      <button
        class="btn btn-outline-secondary"
        type="button"
        :disabled="disabled || loading"
        @click="toggle"
        title="Mở danh sách"
      >
        ▾
      </button>

      <button
        v-if="modelValue !== null && modelValue !== undefined && modelValue !== ''"
        class="btn btn-outline-secondary"
        type="button"
        :disabled="disabled || loading"
        @click="clear"
        title="Xóa"
      >
        ✕
      </button>
    </div>

    <div v-if="open" class="ss-dropdown shadow-sm">
      <div class="ss-dropdown-inner">
        <div v-if="loading" class="px-3 py-2 text-muted small">Đang tải...</div>

        <button
          v-for="opt in filteredOptions"
          :key="opt.id"
          class="ss-item"
          type="button"
          @click="select(opt)"
        >
          <div class="ss-item-main">{{ opt.label }}</div>
          <div class="ss-item-sub">ID: {{ opt.id }}</div>
        </button>

        <div v-if="!loading && filteredOptions.length === 0" class="px-3 py-2 text-muted small">
          Không có dữ liệu phù hợp
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  options: { type: Array, default: () => [] }, // [{id,label,raw}]
  placeholder: { type: String, default: "Gõ để tìm..." },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const keyword = ref("");
const wrap = ref(null);

const selected = computed(() => {
  const id = props.modelValue;
  return props.options.find((x) => String(x.id) === String(id)) || null;
});

const displayText = computed(() => {
  // nếu user đang gõ thì show keyword, còn không show label đã chọn
  if (keyword.value) return keyword.value;
  return selected.value?.label || "";
});

const filteredOptions = computed(() => {
  const k = (keyword.value || "").trim().toLowerCase();
  if (!k) return props.options.slice(0, 200);

  return props.options
    .filter((x) => {
      const label = (x.label || "").toLowerCase();
      const id = String(x.id);
      return label.includes(k) || id.includes(k);
    })
    .slice(0, 200);
});

const select = (opt) => {
  emit("update:modelValue", opt.id);
  keyword.value = ""; // reset để hiển thị label
  open.value = false;
};

const clear = () => {
  emit("update:modelValue", null);
  keyword.value = "";
  open.value = false;
};

const toggle = () => {
  open.value = !open.value;
};

const onInput = (e) => {
  keyword.value = e.target.value;
  open.value = true;

  // nếu user gõ đúng số ID thì set luôn (khi trùng)
  const onlyNumber = String(keyword.value).trim();
  if (/^\d+$/.test(onlyNumber)) {
    const found = props.options.find((x) => String(x.id) === onlyNumber);
    if (found) {
      emit("update:modelValue", found.id);
      keyword.value = ""; // hiển thị label
      open.value = false;
    }
  }
};

// click ngoài để đóng
const onDocClick = (e) => {
  if (!wrap.value) return;
  if (!wrap.value.contains(e.target)) open.value = false;
};

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
.ss-combo { position: relative; }
.ss-dropdown {
  position: absolute;
  z-index: 50;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  background: #fff;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 10px;
}
.ss-dropdown-inner{
  max-height: 280px;
  overflow: auto;
  padding: 6px;
}
.ss-item{
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 8px 10px;
  border-radius: 8px;
}
.ss-item:hover{ background: rgba(0,0,0,.06); }
.ss-item-main{ font-size: 14px; }
.ss-item-sub{ font-size: 12px; color: #6c757d; }
</style>
