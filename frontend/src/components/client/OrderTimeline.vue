<template>
  <div class="order-timeline w-100 px-2">
    <div class="d-flex justify-content-between position-relative" style="padding-top: 20px;">
      <!-- Background line -->
      <div class="position-absolute w-100" style="height:4px; background:#e9ecef; top:40px; left:0; z-index:0;"></div>
      <!-- Progress line -->
      <div
        class="position-absolute"
        :style="{ width: progressPercentage + '%', height: '4px', backgroundColor: isCancelled ? '#dc3545' : 'var(--ss-accent, #e53935)', top: '40px', left: 0, zIndex: 0, transition: 'width 0.5s ease' }"
      ></div>

      <!-- Steps -->
      <div v-for="step in allSteps" :key="step.code" class="text-center position-relative" style="flex:1; z-index:1;">
        <!-- Circle -->
        <div
          class="rounded-circle mx-auto d-flex align-items-center justify-content-center border shadow-sm"
          :style="circleStyle(step.code)"
          style="width:40px; height:40px; font-size:1.1rem; transition:all 0.3s;"
        >
          <i v-if="isCancelled && step.code === 1" class="bi bi-x-lg"></i>
          <i v-else-if="!isCancelled && step.code < statusCode" class="bi bi-check-lg"></i>
          <i v-else :class="step.icon"></i>
        </div>
        <!-- Label -->
        <div class="mt-2 fw-bold" :style="stepLabelStyle(step.code)" style="font-size:0.72rem; line-height:1.3; transition:color 0.3s;">
          {{ step.label }}
        </div>
        <!-- Timestamp (nếu có) -->
        <div v-if="getStepTime(step.code)" class="text-muted" style="font-size:0.68rem; margin-top:2px;">
          {{ formatDate(getStepTime(step.code)) }}
        </div>
      </div>
    </div>

    <!-- Banner đơn hủy -->
    <div v-if="isCancelled" class="alert alert-danger text-center mt-4 py-2 mb-0" style="font-size:0.9rem;">
      <i class="bi bi-x-circle-fill me-1"></i> Đơn hàng này đã bị hủy
    </div>
  </div>
</template>

<script>
const ALL_STEPS = [
  { code: 1, label: 'Chờ xác nhận',    icon: 'bi bi-clipboard' },
  { code: 2, label: 'Chờ giao hàng',   icon: 'bi bi-box-seam' },
  { code: 3, label: 'Đang vận chuyển', icon: 'bi bi-truck' },
  { code: 4, label: 'Đã giao hàng',    icon: 'bi bi-truck-front' },
  { code: 5, label: 'Hoàn thành',      icon: 'bi bi-check-circle' },
];

// Map status label → code (for when only string labels available in timeline)
const LABEL_TO_CODE = {
  'chờ xác nhận': 1, 'chờ giao hàng': 2, 'đang vận chuyển': 3, 'đã giao hàng': 4, 'hoàn thành': 5
};

export default {
  name: 'OrderTimeline',
  props: {
    statusCode: { type: Number, default: 1 },
    timeline: { type: Array, default: () => [] },
  },
  computed: {
    allSteps() { return ALL_STEPS; },
    isCancelled() { return this.statusCode >= 6; },
    progressPercentage() {
      if (this.isCancelled) return 0;
      const st = this.statusCode || 1;
      return Math.max(0, (st - 1) / (ALL_STEPS.length - 1) * 100);
    },
  },
  methods: {
    circleStyle(code) {
      if (this.isCancelled) {
        if (code === 1) return { backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#fff' };
        return { backgroundColor: '#fff', borderColor: '#dee2e6', color: '#bbb' };
      }
      if (code <= this.statusCode) {
        return { backgroundColor: 'var(--ss-accent, #e53935)', borderColor: 'var(--ss-accent, #e53935)', color: '#fff' };
      }
      return { backgroundColor: '#fff', borderColor: '#dee2e6', color: '#bbb' };
    },
    stepLabelStyle(code) {
      if (this.isCancelled) {
        return code === 1 ? { color: '#dc3545' } : { color: '#bbb' };
      }
      return code <= this.statusCode ? { color: 'var(--ss-accent, #e53935)' } : { color: '#bbb' };
    },
    getStepTime(code) {
      if (!this.timeline || !this.timeline.length) return null;
      const step = ALL_STEPS.find(s => s.code === code);
      if (!step) return null;
      const match = this.timeline.find(t => {
        const label = (t.status || '').toLowerCase().trim();
        return LABEL_TO_CODE[label] === code || label === step.label.toLowerCase();
      });
      return match?.time || null;
    },
    formatDate(value) {
      if (!value) return '';
      const d = new Date(value);
      return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },
  },
};
</script>
