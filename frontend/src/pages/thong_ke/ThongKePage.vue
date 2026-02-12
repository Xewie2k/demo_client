<!-- File: src/pages/thong_ke/ThongKePage.vue -->
<template>
  <div class="thong-ke-page container-fluid p-4">
    <h4 class="title mb-4">Bộ Lọc Thống Kê</h4>

    <!-- Filter Bar -->
    <div class="card p-3 mb-4 filter-bar">
      <div class="row align-items-center">
        <div class="col-md-6 text-muted">
          Chọn khoảng thời gian và kiểu biểu đồ để xem nhanh số liệu
        </div>

        <div class="col-md-6 text-end">
          <input
            type="date"
            class="form-control d-inline w-auto me-2"
            v-model="selectedDate"
          />

          <select class="form-select d-inline w-auto me-2" v-model="filterType">
            <option value="MONTH">Tháng này</option>
            <option value="WEEK">Tuần này</option>
            <option value="TODAY">Hôm nay</option>
            <option value="CUSTOM">Tùy chọn</option>
          </select>

          <button class="btn btn-outline-success me-2">Đường</button>
          <button class="btn btn-outline-success">Cột</button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="card p-3 mb-4">
      <div class="row text-center">
        <div class="col-md-4">
          <div class="stat-box">
            <div class="stat-title">Số đơn hàng</div>
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

    <!-- 4 Cards Dynamic -->
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

    <!-- Chart Area -->
    <div class="row">
      <div class="col-md-8">
        <div class="card p-3 chart-card">
          <h6>Biểu đồ doanh thu</h6>

          <div style="height: 300px">
            <RevenueChart :chart="revenueChart" />
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

    <!-- Bottom Table -->
    <div class="row mt-4">
      <div class="col-md-8">
        <div class="card p-3">
          <h6>Bảng Thống Kê Chi Tiết</h6>

          <table class="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Doanh thu</th>
                <th>Số đơn</th>
                <th>Giá trị TB/đơn</th>
                <th>Tăng trưởng</th>
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

      <div class="col-md-4">
        <div class="card p-3">
          <h6>Top sản phẩm bán chạy</h6>

          <table class="table table-bordered mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên SP</th>
                <th>Số lượng</th>
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
import { ref, onMounted, watch } from "vue";
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

const selectedDate = ref("");
const filterType = ref("MONTH");

const formatMoney = (money) => {
  if (!money) return "0 đ";
  return new Intl.NumberFormat("vi-VN").format(money) + " đ";
};

const getDateRange = () => {
  let from = "";
  let to = "";

  const today = new Date();

  if (filterType.value === "TODAY") {
    from = to = today.toISOString().split("T")[0];
  } else if (filterType.value === "WEEK") {
    const current = new Date();

    const first = current.getDate() - current.getDay() + 1;
    const last = first + 6;

    const startWeek = new Date(current);
    startWeek.setDate(first);

    const endWeek = new Date(current);
    endWeek.setDate(last);

    from = startWeek.toISOString().split("T")[0];
    to = endWeek.toISOString().split("T")[0];
  } else {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    from = firstDay.toISOString().split("T")[0];
    to = lastDay.toISOString().split("T")[0];
  }

  if (selectedDate.value) {
    from = to = selectedDate.value;
  }

  return { from, to };
};

const loadStatistics = async () => {
  try {
    const { from, to } = getDateRange();

    const params = { fromDate: from, toDate: to };

    const [
      ordersRes,
      revenueRes,
      realRevenueRes,
      chartRes,
      statusRes,
      topProductRes,
    ] = await Promise.all([
      axios.get("http://localhost:8080/api/statistic/total-orders", { params }),
      axios.get("http://localhost:8080/api/statistic/total-revenue", {
        params,
      }),
      axios.get("http://localhost:8080/api/statistic/real-revenue", { params }),
      axios.get("http://localhost:8080/api/statistic/revenue-chart", {
        params,
      }),
      axios.get("http://localhost:8080/api/statistic/order-status", { params }),
      axios.get("http://localhost:8080/api/statistic/top-products", { params }),
    ]);

    totalOrders.value = ordersRes.data;
    totalRevenue.value = revenueRes.data;
    realRevenue.value = realRevenueRes.data;

    revenueChart.value = chartRes.data;
    orderStatus.value = statusRes.data;
    topProducts.value = topProductRes.data;

    // load riêng mini cards
    try {
      // load bảng chi tiết
      const detailRes = await axios.get(
        "http://localhost:8080/api/statistic/detail-table",
      );

      detailTable.value = detailRes.data;

      // load mini cards
      const miniCardRes = await axios.get(
        "http://localhost:8080/api/statistic/mini-cards",
      );

      miniCards.value = miniCardRes.data;
    } catch (e) {
      console.warn("Mini cards API chưa sẵn sàng:", e);

      // fallback hiển thị tạm
      miniCards.value = [
        { label: "Hôm nay", revenue: 0, totalProducts: 0, totalOrders: 0 },
        { label: "Tuần này", revenue: 0, totalProducts: 0, totalOrders: 0 },
        { label: "Tháng này", revenue: 0, totalProducts: 0, totalOrders: 0 },
        { label: "Năm này", revenue: 0, totalProducts: 0, totalOrders: 0 },
      ];
    }
  } catch (error) {
    console.error("Lỗi load thống kê:", error);
  }
};

watch([selectedDate, filterType], () => {
  loadStatistics();
});

onMounted(() => {
  loadStatistics();
});
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