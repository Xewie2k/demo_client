<script setup>
import { computed } from "vue";
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  statusData: Array
});

const trangThaiMap = {
  1: { label: "Chờ xác nhận", bg: "#fff7ed", color: "#c2410c" },
  2: { label: "Chờ giao hàng", bg: "#eff6ff", color: "#1d4ed8" },
  3: { label: "Đang vận chuyển", bg: "#fef3c7", color: "#92400e" },
  4: { label: "Đã giao hàng", bg: "#ecfeff", color: "#0e7490" },
  5: { label: "Hoàn thành", bg: "#dcfce7", color: "#15803d" },

};

const chartData = computed(() => {
  if (!props.statusData) return {};

  const mapData = {};

  props.statusData.forEach(i => {
    mapData[i.status] = i.total;
  });

  const labels = [];
  const data = [];
  const colors = [];

  Object.keys(trangThaiMap).forEach(key => {
    labels.push(trangThaiMap[key].label);
    data.push(mapData[key] || 0);
    colors.push(trangThaiMap[key].color);
  });

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors
      }
    ]
  };
});

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right"
    }
  }
};
</script>

<template>
  <Pie :data="chartData" :options="options" />
</template>