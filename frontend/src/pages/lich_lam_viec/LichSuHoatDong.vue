<!-- File: src/pages/lich_lam_viec/LichSuHoatDong.vue -->
<template>
  <div class="ls-page ss-font">
    <div class="ls-head">
      <div class="ls-title">LỊCH SỬ HOẠT ĐỘNG</div>
      <div class="ls-subtitle">
        Theo dõi lịch sử đóng/mở ca và dòng tiền mặt trong két
      </div>
    </div>

    <!-- FILTER -->
    <div class="ls-card ls-filter-card">
      <div class="ls-filter-grid">
        <div class="ls-field ls-search-field">
          <label class="ls-label">Tìm kiếm</label>
          <div class="ls-input-wrap">
            <span class="material-icons-outlined ls-input-icon">search</span>
            <input
              v-model.trim="keyword"
              type="text"
              class="form-control ls-input ls-input-search"
              placeholder="Tìm theo tài khoản / mã ca / mã hóa đơn..."
            />
          </div>
        </div>

        <div class="ls-field">
          <label class="ls-label">Từ ngày:</label>
          <input v-model="tuNgay" type="date" class="form-control ls-input" />
        </div>

        <div class="ls-field">
          <label class="ls-label">Đến ngày:</label>
          <input v-model="denNgay" type="date" class="form-control ls-input" />
        </div>

        <div class="ls-field ls-btn-field">
          <button class="btn ls-btn-refresh" type="button" @click="loadData">
            <i class="fa-solid fa-rotate-right"></i>
            <span>Tải lại</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="ls-card ls-table-card">
      <div class="table-responsive">
        <table class="table ls-table mb-0">
          <colgroup>
            <col style="width: 4%" />
            <col style="width: 23%" />
            <col style="width: 12%" />
            <col style="width: 11%" />
            <col style="width: 11%" />
            <col style="width: 16%" />
            <col style="width: 11%" />
            <col style="width: 12%" />
          </colgroup>

          <thead>
            <tr>
              <th class="text-center">#</th>
              <th>TÀI KHOẢN</th>
              <th>CA</th>
              <th>MỞ</th>
              <th>ĐÓNG</th>
              <th class="text-end">TIỀN MẶT</th>
              <th class="text-end">CHÊNH LỆCH</th>
              <th class="text-center">TRẠNG THÁI</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isLoading">
              <td colspan="8" class="text-center py-4">Đang tải dữ liệu...</td>
            </tr>

            <tr v-else-if="displayData.length === 0">
              <td colspan="8" class="text-center py-4">Không có dữ liệu phù hợp.</td>
            </tr>

            <tr
              v-else
              v-for="(item, index) in displayData"
              :key="`${item.loaiBanGhi || 'GIAO_CA'}-${item.id}-${index}`"
            >
              <td class="text-center">{{ index + 1 }}</td>

              <td>
                <div class="ls-account" :title="item.tenNhanVien || ''">
                  {{ item.tenNhanVien || "—" }}
                </div>

                <div
                  v-if="item.maHoaDon"
                  class="ls-subline"
                  :title="item.maHoaDon"
                >
                  Hóa đơn: <span class="ls-code">{{ item.maHoaDon }}</span>
                </div>

                <div
                  v-else-if="item.maGiaoCa"
                  class="ls-subline"
                  :title="item.maGiaoCa"
                >
                  Mã ca: <span class="ls-code">{{ item.maGiaoCa }}</span>
                </div>
              </td>

              <td>
                <span :class="getCaBadgeClass(item)">
                  {{ getCaDisplay(item) }}
                </span>
              </td>

              <td>
                <div class="ls-time">{{ formatTime(getStartTime(item)) }}</div>
                <div class="ls-date">{{ formatDate(getStartTime(item)) }}</div>
              </td>

              <td>
                <template v-if="item.thoiGianKetCa">
                  <div class="ls-time">{{ formatTime(item.thoiGianKetCa) }}</div>
                  <div class="ls-date">{{ formatDate(item.thoiGianKetCa) }}</div>
                </template>
                <template v-else>—</template>
              </td>

              <td class="text-end">
                <span class="ls-money">{{ formatMoney(item.tienMatTrongCa) }} đ</span>
              </td>

              <td class="text-end">
                <template v-if="getChenhLechDisplay(item) === null">—</template>
                <span
                  v-else
                  class="ls-diff"
                  :class="{
                    'ls-diff-green': getChenhLechDisplay(item) >= 0,
                    'ls-diff-red': getChenhLechDisplay(item) < 0,
                  }"
                >
                  {{ formatMoney(getChenhLechDisplay(item)) }} đ
                </span>
              </td>

              <td class="text-center">
                <span class="ls-status" :class="getTrangThaiBadgeClass(item)">
                  {{ getTrangThaiText(item) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getLichSuGiaoCa } from "@/services/lich_lam_viec/giao_caService.js";

const rawData = ref([]);
const isLoading = ref(false);
const keyword = ref("");

const getTodayYMD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const tuNgay = ref(getTodayYMD());
const denNgay = ref(getTodayYMD());

const loadData = async () => {
  isLoading.value = true;
  try {
    const res = await getLichSuGiaoCa(0, 100);

    if (res?.content) {
      rawData.value = res.content;
    } else if (res?.data?.content) {
      rawData.value = res.data.content;
    } else if (Array.isArray(res?.data)) {
      rawData.value = res.data;
    } else if (Array.isArray(res)) {
      rawData.value = res;
    } else {
      rawData.value = [];
    }
  } catch (error) {
    console.error("❌ Lỗi lấy lịch sử hoạt động:", error);
    rawData.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const getStartTime = (item) =>
  item?.thoiGianPhatSinh || item?.thoiGianNhanCa || item?.ngayTao || null;

const displayData = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  const fromDate = tuNgay.value ? new Date(`${tuNgay.value}T00:00:00`) : null;
  const toDate = denNgay.value ? new Date(`${denNgay.value}T23:59:59`) : null;

  return (rawData.value || []).filter((item) => {
    const searchText = [
      item?.tenNhanVien,
      item?.maGiaoCa,
      item?.tenCaLam,
      item?.maHoaDon,
      item?.ghiChu,
      item?.loaiBanGhi,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesKeyword = !kw || searchText.includes(kw);

    const timeValue = getStartTime(item);
    const itemDate = timeValue ? new Date(timeValue) : null;

    const matchesFrom = !fromDate || (itemDate && itemDate >= fromDate);
    const matchesTo = !toDate || (itemDate && itemDate <= toDate);

    return matchesKeyword && matchesFrom && matchesTo;
  });
});

const getCaDisplay = (item) => {
  if (item?.loaiBanGhi === "ADMIN_CASH") return "ADMIN";
  return item?.tenCaLam || item?.maGiaoCa || "—";
};

const getCaBadgeClass = (item) => {
  if (item?.loaiBanGhi === "ADMIN_CASH") return "ls-pill ls-pill-admin";

  const text = String(item?.tenCaLam || "").toLowerCase();
  if (text.includes("chiều")) return "ls-pill ls-pill-afternoon";
  if (text.includes("sáng")) return "ls-pill ls-pill-morning";
  return "ls-pill ls-pill-default";
};

const getTrangThaiText = (item) => {
  if (item?.loaiBanGhi === "ADMIN_CASH") return "Hoàn tất";
  return item?.trangThai === 1 ? "Đã đóng" : "Đang làm";
};

const getTrangThaiBadgeClass = (item) => {
  if (item?.loaiBanGhi === "ADMIN_CASH") return "ls-status-done";
  return item?.trangThai === 1 ? "ls-status-closed" : "ls-status-active";
};

const getChenhLechDisplay = (item) => {
  if (item?.loaiBanGhi === "ADMIN_CASH") return 0;
  if (item?.trangThai !== 1) return null;

  const dauCa = Number(item?.tienDauCaNhap || 0);
  const duKien = Number(item?.tienBanGiaoDuKien || 0);
  return dauCa - duKien;
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN");
};

const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "0";
  return Number(amount).toLocaleString("vi-VN");
};
</script>

<style scoped>
.ls-page {
  min-height: 100vh;
  padding: 20px;
  background: #f6f7fb;
}

.ls-head {
  margin-bottom: 16px;
}

.ls-title {
  font-size: 20px;
  line-height: 1.25;
  font-weight: 600;
  color: #202632;
  text-transform: uppercase;
}

.ls-subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 400;
  color: #7b8391;
}

.ls-card {
  background: #fff;
  border: 1px solid #eceef3;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
}

.ls-filter-card {
  margin-bottom: 16px;
  padding: 16px;
}

.ls-filter-grid {
  display: grid;
  grid-template-columns: 2.2fr 1.1fr 1.1fr auto;
  gap: 14px;
  align-items: end;
}

.ls-field {
  min-width: 0;
}

.ls-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 500;
  color: #566070;
}

.ls-input-wrap {
  position: relative;
}

.ls-input-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  font-size: 18px;
  color: #9aa3b2;
}

.ls-input {
  height: 40px;
  border-radius: 12px;
  border: 1px solid #d9deea;
  background: #fff;
  color: #2a3140;
  font-size: 14px;
  font-weight: 400;
  box-shadow: none;
}

.ls-input:focus {
  border-color: #d8dde8;
  box-shadow: none;
}

.ls-input-search {
  padding-left: 38px;
}

.ls-btn-field {
  display: flex;
}

.ls-btn-refresh {
  height: 40px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid #d9deea;
  background: #fff;
  color: #4c5563;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ls-btn-refresh:hover {
  background: #f8fafc;
  border-color: #d9deea;
  color: #2f3745;
}

.ls-table-card {
  overflow: hidden;
}

.ls-table {
  width: 100%;
  table-layout: fixed;
  margin-bottom: 0;
  color: #27303f;
  font-size: 14px;
}

.ls-table thead th {
  padding: 16px 14px;
  background: #fafbfc;
  border-bottom: 1px solid #eceef3;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 600;
  color: #576172;
  white-space: nowrap;
  vertical-align: middle;
}

.ls-table tbody td {
  padding: 16px 14px;
  border-bottom: 1px solid #f0f2f6;
  vertical-align: middle;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 400;
  color: #2b3342;
}

.ls-table tbody tr:hover {
  background: #fcfcfd;
}

.ls-account {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 400;
  color: #2b3342;
}

.ls-subline {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 400;
  color: #8a93a2;
}

.ls-code {
  color: #687283;
}

.ls-time {
  font-size: 14px;
  line-height: 1.25;
  font-weight: 500;
  color: #2b3342;
}

.ls-date {
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 400;
  color: #9ca3af;
}

.ls-money {
  font-size: 14px;
  line-height: 1.2;
  font-weight: 600;
  color: #2b3342;
}

.ls-diff {
  font-size: 14px;
  line-height: 1.2;
  font-weight: 600;
}

.ls-diff-green {
  color: #1f9d61;
}

.ls-diff-red {
  color: #dc5d5d;
}

.ls-pill,
.ls-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;
}

.ls-pill-default,
.ls-pill-morning {
  background: #f4f5f8;
  color: #727b89;
  border: 1px solid #eaedf2;
}

.ls-pill-afternoon {
  background: #fff4f2;
  color: #cf6d5e;
  border: 1px solid #f6ddd8;
}

.ls-pill-admin {
  background: #fff4f4;
  color: #d66060;
  border: 1px solid #f5d9d9;
}

.ls-status-active {
  background: #fff7ed;
  color: #d8a14e;
  border: 1px solid #f4dfbf;
}

.ls-status-closed {
  background: #fff1f3;
  color: #d67684;
  border: 1px solid #f3d6dc;
}

.ls-status-done {
  background: #f0fcf5;
  color: #59a677;
  border: 1px solid #d5efdf;
}

@media (max-width: 1100px) {
  .ls-filter-grid {
    grid-template-columns: 1fr;
  }

  .ls-btn-field,
  .ls-btn-refresh {
    width: 100%;
  }

  .ls-table {
    min-width: 980px;
  }
}
</style>