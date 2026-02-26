<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const props = defineProps({
  chart: Array,
  type: {
    type: String,
    default: "line"
  }
});

const chartRef = ref(null);
let chartInstance = null;

const renderChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartRef.value, {
    type: props.type,
    data: {
      labels: props.chart.map(i => i.time),
      datasets: [
  {
    label: "Doanh thu",
    data: props.chart.map(i => i.revenue),
    borderColor: "#28a745",
    backgroundColor:
      props.type === "line"
        ? "rgba(40,167,69,0.2)"
        : "rgba(40,167,69,0.6)",

    tension: 0.4,
    fill: props.type === "line",

    // 👇 CHỈ ÁP DỤNG KHI LÀ BAR
    barPercentage: 0.4,        // nhỏ lại (mặc định 0.9)
    categoryPercentage: 0.5,   // giảm độ chiếm ngang
    maxBarThickness: 40        // giới hạn độ dày tối đa
  }
]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
};

onMounted(renderChart);

watch(
  () => [props.chart, props.type],
  () => {
    renderChart();
  },
  { deep: true }
);
</script>