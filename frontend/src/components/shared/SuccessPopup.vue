<template>
  <div v-if="open" class="ss-success-backdrop">
    <div class="ss-success-box">
      <div class="ss-success-ring"></div>
      <div class="ss-success-title">Thành công</div>
      <div class="text-muted">{{ message }}</div>

      <button class="btn btn-primary mt-3" @click="$emit('ok')">OK</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  message: { type: String, default: "Thao tác thành công!" },
});

defineEmits(["ok"]);
</script>

<style scoped>
.ss-success-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.ss-success-box {
  width: 520px;
  max-width: calc(100vw - 24px);
  background: #fff;
  border-radius: 10px;
  padding: 32px 18px 22px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.ss-success-ring {
  width: 86px;
  height: 86px;
  border-radius: 999px;
  border: 6px solid rgba(34,197,94,0.25);
  margin: 0 auto 14px;
  position: relative;
}
.ss-success-ring::after {
  content: "";
  position: absolute;
  inset: 10px;
  border-radius: 999px;
  border: 4px solid rgba(34,197,94,0.25);
}
.ss-success-title {
  font-size: 34px;
  font-weight: 900;
  margin-bottom: 6px;
}
</style>
