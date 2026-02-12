<!-- File: src/pages/thong_ke/RevenueChart.vue -->
<template>
  <Line :data="chartData" :options="options" />
</template>

<script setup>
import { computed } from "vue";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "vue-chartjs";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  chart: {
    type: Array,
    default: () => []
  }
});

const chartData = computed(() => {
  return {
    labels: props.chart.map((item) => item.time),
    datasets: [
      {
        label: "Doanh thu",
        data: props.chart.map((item) => item.revenue),
        borderColor: "#28a745",
        backgroundColor: "rgba(40,167,69,0.2)",
        tension: 0.3
      }
    ]
  };
});

const options = {
  responsive: true,
  maintainAspectRatio: false
};
</script>