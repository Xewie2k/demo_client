<!-- File: src/pages/thong_ke/ThongKePage.vue -->
<template>
  <div class="thong-ke-page container-fluid p-4">
    <h4 class="title mb-2">BÁO CÁO THỐNG KÊ KINH DOANH</h4>

    <!-- Badge trạng thái -->
    <div class="mb-3">
      <span v-if="filterType === 'TODAY'" class="badge bg-success">
        Đang hiển thị dữ liệu của HÔM NAY ({{ todayString }})
      </span>
      <span v-else class="badge bg-primary">
        Khoảng thời gian đang xem: {{ currentRange.from }} →
        {{ currentRange.to }}
      </span>
    </div>

    <!-- Filter Bar -->
    <div class="card p-3 mb-4 filter-bar">
      <div class="row align-items-center">
        <div class="col-md-6 text-muted">
          Lựa chọn khoảng thời gian để xem thống kê doanh thu và đơn hàng
        </div>

        <div class="col-md-6 text-end">
          <select class="form-select d-inline w-auto me-2" v-model="filterType">
            <option value="TODAY">Hôm nay</option>
            <option value="WEEK">Tuần này</option>
            <option value="MONTH">Tháng này</option>
            <option value="CUSTOM">Tùy chọn</option>
          </select>

          <!-- FROM -->
          <input
            v-if="filterType === 'CUSTOM'"
            type="date"
            class="form-control d-inline w-auto me-2"
            v-model="fromDate"
          />

          <!-- TO -->
          <input
            v-if="filterType === 'CUSTOM'"
            type="date"
            class="form-control d-inline w-auto me-2"
            v-model="toDate"
          />

          <button
            class="btn me-2"
            :class="
              chartType === 'line' ? 'btn-success' : 'btn-outline-success'
            "
            @click="chartType = 'line'"
          >
            Biểu đồ đường
          </button>

          <button
            class="btn"
            :class="chartType === 'bar' ? 'btn-success' : 'btn-outline-success'"
            @click="chartType = 'bar'"
          >
            Biểu đồ cột
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="card p-3 mb-4">
      <div class="row text-center">
        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Tổng số đơn hàng</div>
            <div class="stat-value">{{ totalOrders }}</div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Tổng doanh thu</div>
            <div class="stat-value text-success">
              {{ formatMoney(totalRevenue) }}
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Doanh thu thực tế</div>
            <div class="stat-value text-primary">
              {{ formatMoney(realRevenue) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Cards -->
    <div class="row mb-4">
      <div class="col-md-3" v-for="(card, index) in miniCards" :key="index">
        <div class="card p-3 mini-card">
          <div class="mini-title">{{ card.label }}</div>
          <div class="mini-value">
            {{ formatMoney(card.revenue) }}
          </div>
          <div class="mini-desc">
            Sản phẩm: {{ card.totalProducts }} | Đơn hàng:
            {{ card.totalOrders }}
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="row">
      <div class="col-md-8">
        <div class="card p-3 chart-card">
          <h6>Biểu đồ doanh thu theo thời gian</h6>
          <div style="height: 300px">
            <RevenueChart :chart="revenueChart" :type="chartType" />

          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card p-3 chart-card">
          <h6>Phân bố trạng thái đơn hàng</h6>
          <div style="height: 300px">
            <OrderStatusChart :statusData="orderStatus" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom -->
    <div class="row mt-4">
      <div class="col-md-8">
        <div class="card p-3">
          <h6>Bảng thống kê chi tiết theo thời gian</h6>

          <table class="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Doanh thu</th>
                <th>Số đơn</th>
                <th>Giá trị trung bình/đơn</th>
                <th>Tăng trưởng (%)</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in detailTable" :key="index">
                <td>{{ item.time }}</td>
                <td>{{ formatMoney(item.revenue) }}</td>
                <td>{{ item.totalOrders }}</td>
                <td>{{ formatMoney(item.avgPerOrder) }}</td>
                <td :class="item.growth >= 0 ? 'text-success' : 'text-danger'">
                  {{ item.growth.toFixed(2) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TOP 30 NGÀY -->
      <div class="col-md-4">
        <div class="card p-3">
          <h6>
            Top sản phẩm bán chạy trong 30 ngày gần nhất
            <br />
            <small class="text-muted">
              (Từ {{ lastMonthRange.from }} đến {{ lastMonthRange.to }})
            </small>
          </h6>

          <table class="table table-bordered mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng bán</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in topProducts" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.productName }}</td>
                <td>{{ item.quantity }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import RevenueChart from "./RevenueChart.vue";
import OrderStatusChart from "./OrderStatusChart.vue";

const totalOrders = ref(0);
const totalRevenue = ref(0);
const realRevenue = ref(0);

const revenueChart = ref([]);
const orderStatus = ref([]);
const topProducts = ref([]);
const miniCards = ref([]);
const detailTable = ref([]);

const filterType = ref("TODAY");
const fromDate = ref("");
const toDate = ref("");

const today = ref(new Date());

const chartType = ref("line");

setInterval(() => {
  today.value = new Date();
}, 60000);

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayString = computed(() => formatDate(today.value));

const formatMoney = (money) => {
  if (!money) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(money) + " đ";
};

const currentRange = computed(() => {
  let from = "";
  let to = "";
  const now = today.value;

  if (filterType.value === "CUSTOM") {
    return { from: fromDate.value, to: toDate.value };
  }

  if (filterType.value === "TODAY") {
    from = to = formatDate(now);
  } else if (filterType.value === "WEEK") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    from = formatDate(start);
    to = formatDate(end);
  } else if (filterType.value === "MONTH") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    from = formatDate(firstDay);
    to = formatDate(lastDay);
  }

  return { from, to };
});

const lastMonthRange = computed(() => {
  const current = today.value;
  const to = formatDate(current);
  const fromDateObj = new Date(current);
  fromDateObj.setDate(current.getDate() - 30);
  const from = formatDate(fromDateObj);
  return { from, to };
});

const loadStatistics = async () => {
  try {
    const params = {
      fromDate: currentRange.value.from,
      toDate: currentRange.value.to,
    };

    const [ordersRes, revenueRes, realRevenueRes, chartRes, statusRes] =
      await Promise.all([
        axios.get("http://localhost:8080/api/statistic/total-orders", {
          params,
        }),
        axios.get("http://localhost:8080/api/statistic/total-revenue", {
          params,
        }),
        axios.get("http://localhost:8080/api/statistic/real-revenue", {
          params,
        }),
        axios.get("http://localhost:8080/api/statistic/revenue-chart", {
          params,
        }),
        axios.get("http://localhost:8080/api/statistic/order-status", {
          params,
        }),
      ]);

    totalOrders.value = ordersRes.data || 0;
    totalRevenue.value = revenueRes.data || 0;
    realRevenue.value = realRevenueRes.data || 0;
    revenueChart.value = chartRes.data || [];
    orderStatus.value = statusRes.data || [];

    const topRes = await axios.get(
      "http://localhost:8080/api/statistic/top-products",
      {
        params: {
          fromDate: lastMonthRange.value.from,
          toDate: lastMonthRange.value.to,
        },
      },
    );

    topProducts.value = topRes.data || [];

    const detailRes = await axios.get(
      "http://localhost:8080/api/statistic/detail-table",
      { params },
    );
    detailTable.value = detailRes.data || [];

    const miniCardRes = await axios.get(
      "http://localhost:8080/api/statistic/mini-cards",
      { params },
    );
    miniCards.value = miniCardRes.data || [];
  } catch (error) {
    console.error("Lỗi load thống kê:", error);
  }
};

watch([filterType, fromDate, toDate, today], loadStatistics);

onMounted(loadStatistics);
</script>

<style scoped>
.thong-ke-page {
  background: #f5f7fb;
  min-height: 100vh;
}

.title {
  font-weight: bold;
  color: #2c3e50;
}

.filter-bar {
  border-radius: 10px;
}

.stat-box {
  padding: 15px;
  border-radius: 10px;
  background: #f9fafc;
  transition: 0.3s;
}

.stat-box:hover {
  background: #eef2f7;
}

.stat-title {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.mini-card {
  border-radius: 10px;
  transition: 0.3s;
  cursor: pointer;
}

.mini-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.mini-title {
  font-size: 14px;
  color: #555;
}

.mini-value {
  font-size: 20px;
  font-weight: bold;
  margin-top: 5px;
}

.mini-desc {
  font-size: 12px;
  color: #888;
}

.chart-card {
  border-radius: 10px;
}

.chart-placeholder {
  height: 260px;
  background: #f1f3f7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.table {
  background: white;
}

.table thead {
  background: #f1f3f7;
}

@media (max-width: 768px) {
  .mini-card {
    margin-bottom: 10px;
  }
}
</style>