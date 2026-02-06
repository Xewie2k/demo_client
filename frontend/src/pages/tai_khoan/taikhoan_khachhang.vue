<!-- File: src/pages/tai_khoan/khach_hang/taikhoan_khachhang.vue -->
<template>
  <div class="taikhoan-khachhang" v-if="!isPage">
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input v-model="filters.keyword" type="text" placeholder="Tìm kiếm" class="search-input" />
        </div>
      </div>

      <div class="toolbar-right">
        <button class="btn btn-newaccount" @click="themkh">
          <i class="fa-solid fa-plus"></i> Thêm khách hàng
        </button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã khách hàng</th>
            <th>Ảnh</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Email</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in khachhangList" :key="item.id">
            <td class="text-gray">{{ pageNo * pageSize + index + 1 }}</td>

            <td class="text-dark fw-700">{{ item.maKhachHang ?? "---" }}</td>

            <!-- DTO chưa có ảnh -> placeholder -->
            <td>
              <div class="avatar">
                <div class="avatar-fallback">{{ initials(item.tenKhachHang) }}</div>
              </div>
            </td>

            <td class="text-dark fw-700">{{ item.tenKhachHang ?? "---" }}</td>
            <td class="text-gray">{{ item.soDienThoai ?? "---" }}</td>
            <td class="text-gray">{{ item.email ?? "---" }}</td>

            <!-- ✅ Địa chỉ: ưu tiên macDinh -->
            <td class="text-gray">{{ addrMap.get(item.id) ?? "---" }}</td>

            <td>
              <span class="badge" :class="!item.xoaMem ? 'status-active' : 'status-ended'">
                {{ !item.xoaMem ? "Hoạt động" : "Ngừng hoạt động" }}
              </span>
            </td>

            <td class="text-center">
              <button class="ss-icon-btn-view" @click="updatedkh(item.id)" title="Xem" type="button">
                <span class="material-icons-outlined">visibility</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-container">
      <button class="page-btn" :class="{ disabled: pageNo === 0 }" @click="prevPage" :disabled="pageNo === 0">
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      <button class="page-btn active">{{ pageNo + 1 }}</button>

      <button
        class="page-btn"
        :class="{ disabled: pageNo >= totalPages - 1 }"
        :disabled="pageNo >= totalPages - 1"
        @click="nextPage"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </div>

  <router-view />
</template>

<script setup>
import { searchKhachHang, pagingKhachHang } from "@/services/tai_khoan/khach_hang/khach_hangService";
import { getAllDiaChiKhachHang } from "@/services/tai_khoan/khach_hang/diaChiKhachHangService";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const pageNo = ref(0);
const pageSize = ref(5);
const totalPages = ref(0);

const khachhangList = ref([]);
const khachhangOrigin = ref([]);

const addrMap = ref(new Map()); // idKhachHang -> "text"

const filters = ref({ keyword: "", status: "" });

const themkh = () => router.push({ name: "tai-khoan-khach-hang-them" });
const updatedkh = (id) => router.push({ name: "tai-khoan-khach-hang-cap-nhat", params: { id } });

const isPage = computed(() => {
  return (
    route.path.includes("/admin/tai-khoan/khach-hang/them") ||
    route.path.includes("/admin/tai-khoan/khach-hang/cap-nhat")
  );
});

const sortNewestFirst = (arr) => (arr || []).slice().sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));

/* ✅ FIX LỖI: initials() */
const initials = (name) => {
  const t = (name ?? "").toString().trim();
  if (!t) return "KH";
  const parts = t.split(/\s+/).filter(Boolean);
  const last2 = parts.slice(-2);
  return last2.map((p) => (p[0] ? p[0].toUpperCase() : "")).join("");
};

const buildAddrText = (a) => {
  const parts = [a?.diaChiCuThe, a?.phuong, a?.quan, a?.thanhPho]
    .map((x) => (x ?? "").toString().trim())
    .filter(Boolean);
  return parts.join(", ");
};

const loadAddressMap = async () => {
  try {
    const all = await getAllDiaChiKhachHang();
    const arr = Array.isArray(all) ? all : [];

    const m = new Map();
    // ưu tiên macDinh = true
    for (const a of arr) {
      if (a?.xoaMem) continue;
      const idkh = a?.idKhachHang;
      if (!idkh) continue;

      const txt = buildAddrText(a) || a?.tenDiaChi || "---";

      // set nếu chưa có, hoặc nếu đây là macDinh
      if (!m.has(idkh) || a?.macDinh) m.set(idkh, txt);
    }

    addrMap.value = m;
  } catch (e) {
    console.log("Load address map error", e);
    addrMap.value = new Map();
  }
};

const handleFilter = async () => {
  try {
    if (filters.value.keyword.trim()) {
      const res = await searchKhachHang(filters.value.keyword.trim());
      const arr = Array.isArray(res) ? res : res?.content ?? [];
      khachhangOrigin.value = sortNewestFirst(arr);
      totalPages.value = 1;
    } else {
      const res = await pagingKhachHang(pageNo.value, pageSize.value);
      khachhangOrigin.value = sortNewestFirst(res?.content ?? []);
      totalPages.value = res?.totalPages ?? 0;
    }

    khachhangList.value = khachhangOrigin.value;

    // load address map để hiển thị cột địa chỉ
    await loadAddressMap();
  } catch (e) {
    console.log("Filter error", e);
  }
};

const prevPage = async () => {
  if (pageNo.value === 0) return;
  pageNo.value--;
  await handleFilter();
};

const nextPage = async () => {
  if (pageNo.value >= totalPages.value - 1) return;
  pageNo.value++;
  await handleFilter();
};

watch(
  filters,
  async () => {
    pageNo.value = 0;
    await handleFilter();
  },
  { deep: true }
);

watch(
  () => route.path,
  async (newPath) => {
    const isChild =
      newPath.includes("/admin/tai-khoan/khach-hang/them") ||
      newPath.includes("/admin/tai-khoan/khach-hang/cap-nhat");
    if (!isChild) await handleFilter();
  }
);

onMounted(handleFilter);
</script>

<style scoped>
.taikhoan-khachhang {
  font-family: var(--admin-font);
  color: var(--ss-text);
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  margin: 20px;
  border: 1px solid var(--ss-border);
  box-shadow: var(--ss-shadow-soft);
}

.text-center { text-align: center; }
.text-gray { color: var(--ss-text-muted); }
.text-dark { color: rgba(17,24,39,0.88); }
.fw-700 { font-weight: 800; }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 24px;
}

.toolbar-left, .toolbar-right { display: flex; align-items: center; }

.btn{
  height: 34px;
  padding: 0 14px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;
  transition: all 0.2s;
}
.btn:hover { opacity: 0.96; }

.btn-newaccount{
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  color:#fff;
  display:inline-flex;
  align-items:center;
  gap:8px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  box-shadow: 0 10px 18px rgba(255,77,79,0.16);
}
.btn-newaccount i { font-size: 12px; }

/* Badge */
.badge{
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 900;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1.1;
}
.status-active{
  background: rgba(255,77,79,0.10);
  color: #b42324;
  border: 1px solid rgba(255,77,79,0.35);
}
.status-ended{
  background: rgba(17,24,39,0.06);
  color: rgba(17,24,39,0.88);
  border: 1px solid rgba(17,24,39,0.14);
}

/* Table */
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: separate; border-spacing: 0; }

th{
  padding: 16px;
  background:#F9FAFB;
  font-size: 13.5px;
  font-weight: 900;
  text-align:left;
  color: rgba(17,24,39,0.88);
  border-bottom: 1px solid #E5E7EB;
  white-space: nowrap;
}
td{
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  font-size: 13.5px;
  vertical-align: middle;
  color: rgba(17,24,39,0.72);
}
tbody tr:hover { background:#F9FAFB; }

/* Avatar placeholder */
.avatar{
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(17,24,39,0.14);
  background: #fff;
  overflow: hidden;
  display:flex;
  align-items:center;
  justify-content:center;
}
.avatar-fallback{
  width:100%; height:100%;
  display:flex; align-items:center; justify-content:center;
  background: rgba(17,24,39,0.04);
  color: rgba(17,24,39,0.78);
  font-weight: 900;
}

/* Pagination */
.pagination-container{
  display:flex; justify-content:center; align-items:center; gap:8px; margin-top: 24px;
}
.page-btn{
  width:32px; height:32px; border-radius: 8px;
  border:1px solid #E5E7EB;
  background:#fff;
  color:#374151;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer;
  transition: 0.2s;
  font-size: 14px;
  font-weight: 600;
}
.page-btn:hover:not(.disabled){ background:#F3F4F6; border-color:#D1D5DB; }
.page-btn.active{ background:#111827; color:#fff; border-color:#111827; }
.page-btn.disabled{ color:#D1D5DB; background:#F9FAFB; }

/* Search */
.search-wrapper { position: relative; display:flex; align-items:center; }
.search-icon { position:absolute; left:12px; color:#9CA3AF; font-size: 14px; pointer-events:none; }
.search-input{
  height: 40px;
  padding: 0 16px 0 36px;
  border-radius: 20px;
  border: 1px solid #E5E7EB;
  outline: none;
  min-width: 320px;
  color: rgba(17,24,39,0.78);
  font-size: 14px;
  background:#F9FAFB;
}
.search-input:focus{
  border-color: rgba(255,77,79,0.65);
  background:#fff;
  box-shadow: 0 0 0 3px rgba(255,77,79,0.10);
}

/* ✅ Eye icon unified */
.ss-icon-btn-view{
  width:36px; height:36px;
  border-radius:10px;
  background:#fff;
  border:1px solid rgba(17,24,39,0.14);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition: 0.15s ease;
  padding:0;
}
.ss-icon-btn-view span{
  font-size: 20px;
  color: rgba(17,24,39,0.88);
}
.ss-icon-btn-view:hover{
  background: rgba(17,24,39,0.04);
  border-color: rgba(17,24,39,0.22);
}
</style>
