<template>
  <div class="order-timeline w-100">
    <div class="d-flex justify-content-between position-relative">
      <!-- Background Line -->
      <div class="position-absolute top-0 start-0 w-100 mt-3" style="height: 4px; background-color: #e9ecef; z-index: 0;"></div>
      
      <!-- Progress Line (approximate based on active step) -->
      <div class="position-absolute top-0 start-0 mt-3" :style="{ width: progressPercentage + '%', height: '4px', backgroundColor: '#198754', zIndex: 0 }"></div>

      <!-- Steps -->
      <div v-for="(step, index) in steps" :key="index" class="text-center position-relative z-1" style="flex: 1;">
        <div 
          class="rounded-circle mx-auto d-flex align-items-center justify-content-center border"
          :class="[
            step.active ? 'bg-success text-white border-success' : (step.completed ? 'bg-success text-white border-success' : 'bg-white text-muted border-light')
          ]"
          style="width: 40px; height: 40px; font-size: 1.2rem;"
        >
           <i v-if="step.active" class="bi bi-clock-history"></i>
           <i v-else-if="step.completed" class="bi bi-check-lg"></i>
           <div v-else class="rounded-circle bg-secondary" style="width: 10px; height: 10px;"></div>
        </div>
        <div class="mt-2 small fw-bold" :class="step.active ? 'text-success' : 'text-muted'">
          {{ step.status }}
        </div>
        <div v-if="step.time" class="text-muted" style="font-size: 0.75rem;">
          {{ formatDate(step.time) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderTimeline",
  props: {
    timeline: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    steps() {
        // If we want a fixed set of steps (Confirmed -> Shipping -> Delivered), we should map the timeline to it.
        // Or if the timeline ITSELF is the list of events.
        // The DTO returns the history of what happened. 
        // But a timeline usually shows what IS GOING TO happen too.
        // For now, I'll just display the provided timeline events. 
        // To make it look like a full progress bar, I might need to merge with "Expected" steps.
        // For this task, I will just display what I have.
        return this.timeline;
    },
    progressPercentage() {
        if (!this.steps.length) return 0;
        const activeIndex = this.steps.findIndex(s => s.active);
        if (activeIndex === -1) return 100; // All done?
        return (activeIndex / (this.steps.length - 1)) * 100;
    }
  },
  methods: {
    formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    }
  }
}
</script>
