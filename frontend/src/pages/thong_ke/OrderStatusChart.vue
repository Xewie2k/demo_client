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
  1: { label: "Chờ xác nhận", bg: "#fff7ed", color: "#FF6B6B" }, // Đỏ san hô tươi
  2: { label: "Chờ giao hàng", bg: "#eff6ff", color: "#409EFF" }, // Xanh lam sáng
  3: { label: "Đang vận chuyển", bg: "#fef3c7", color: "#FFB822" }, // Vàng cam tươi
  4: { label: "Đã giao hàng", bg: "#ecfeff", color: "#36CBCB" }, // Xanh ngọc
  5: { label: "Hoàn thành", bg: "#dcfce7", color: "#67C23A" }, // Xanh lá mạ
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
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#ffffff"
      }
    ]
  };
});

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          size: 13
        }
      }
    }
  }
};
</script>

<template>
  <Pie :data="chartData" :options="options" />
</template>