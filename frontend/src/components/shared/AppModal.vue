<template>
  <teleport to="body">
    <div
      v-if="open"
      class="ss-modal-backdrop"
      @click.self="onBackdrop"
    >
      <div class="ss-modal-card ss-card ss-border">
        <div class="ss-modal-header ss-header d-flex align-items-center justify-content-between">
          <div class="fw-semibold">{{ title }}</div>

          <button
            class="btn btn-sm btn-outline-secondary ss-modal-close"
            type="button"
            @click="emitClose"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="ss-modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="ss-modal-footer border-top">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
  closeOnBackdrop: { type: Boolean, default: true },
});

const emit = defineEmits(["close"]);

function emitClose() {
  emit("close");
}

function onBackdrop() {
  if (props.closeOnBackdrop) emitClose();
}
</script>

<style scoped>
.ss-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 2000;
}

.ss-modal-card {
  width: min(920px, 100%);
  max-height: calc(100vh - 36px);
  overflow: hidden;
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--ss-shadow);
}

.ss-modal-header {
  padding: 12px 14px;
  background: #fff;
}

.ss-modal-body {
  padding: 14px;
  overflow: auto;
  max-height: calc(100vh - 220px);
}

.ss-modal-footer {
  padding: 12px 14px;
  background: #fff;
}

.ss-modal-close {
  border-radius: 10px;
  width: 36px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
