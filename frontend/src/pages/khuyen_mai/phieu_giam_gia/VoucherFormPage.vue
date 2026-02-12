<!-- File: src/pages/khuyen_mai/phieu_giam_gia/VoucherFormPage.vue -->
<template>
  <div class="p-4">
    <!-- ✅ BỎ nút quay lại ở header (chỉ giữ tiêu đề) -->
    <div class="d-flex align-items-center gap-2 mb-4">
      <h2 class="h5 m-0 text-uppercase ss-page-title">
        {{ isLocked ? "Chi tiết phiếu (Đã kết thúc)" : form.id ? "Chi tiết phiếu giảm giá" : "Thêm phiếu giảm giá" }}
      </h2>
    </div>

    <div class="row g-4">
      <!-- FORM PHIẾU -->
      <div class="col-12" :class="{ 'locked-content': isLocked }">
        <div class="card border-0 shadow-sm rounded-4 p-4" :class="{ 'bg-light': isLocked }">
          <VoucherForm v-model="form" v-model:isUnlimited="isUnlimited" :disabled="isLocked" />

          <div class="mt-4 d-flex justify-content-between align-items-center border-top pt-3">
            <div>
              <button
                v-if="form.id"
                @click="handleDelete"
                class="btn btn-outline-danger px-3 rounded-3 d-flex align-items-center gap-2"
                type="button"
              >
                <span class="material-icons fs-6">delete_outline</span> Xóa phiếu
              </button>
            </div>

            <!-- ✅ Nếu là phiếu công khai: nút nằm dưới form (phiếu cá nhân sẽ đưa xuống dưới bảng KH) -->
            <div v-if="!form.loaiPhieuGiamGia" class="d-flex gap-2">
              <button @click="goBack" class="btn ss-btn-outline px-4 rounded-3" type="button" :disabled="isSaving">
                Hủy
              </button>

              <button
                v-if="!isLocked"
                @click="handleSave"
                :disabled="isSaving"
                class="btn ss-btn-primary px-4 rounded-3 shadow"
                type="button"
              >
                {{ isSaving ? "Đang xử lý..." : (form.id ? "Cập nhật" : "Tạo mới") }}
              </button>

              <button v-else disabled class="btn btn-secondary px-4 rounded-3 opacity-50" type="button">
                Không thể cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CHỌN KHÁCH HÀNG (CÁ NHÂN) - NẰM DƯỚI FORM -->
      <div v-if="form.loaiPhieuGiamGia" class="col-12" :class="{ 'locked-content': isLocked }">
        <div class="card border-0 shadow-sm rounded-4 p-4" :class="{ 'bg-light': isLocked }">
          <!-- DÒNG TRẠNG THÁI -->
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div class="ss-muted">Đã chọn: {{ normalizeCustomerIds(selectedCustomerIds).length }} khách hàng</div>

            <button
              class="btn btn-outline-primary rounded-3 d-flex align-items-center gap-2 ss-btn-mail"
              type="button"
              @click="handleSendMail"
              :disabled="isLocked || isSendingMail || normalizeCustomerIds(selectedCustomerIds).length === 0 || !form.id"
              title="Cần lưu phiếu trước khi gửi mail"
            >
              <span class="material-icons" style="font-size: 18px">mail_outline</span>
              {{ isSendingMail ? "Đang gửi..." : "Gửi mail cho khách đã chọn" }}
            </button>
          </div>

          <!-- FILTER BAR (GIỐNG MẪU) -->
          <div class="ss-kh-filter d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <button
                class="btn btn-primary px-3 ss-btn-compact"
                type="button"
                @click="reloadCustomers"
                :disabled="loadingCustomers"
              >
                {{ loadingCustomers ? "Đang tải..." : "Làm mới" }}
              </button>

              <input
                v-model="keywordTen"
                class="form-control ss-input"
                type="text"
                placeholder="Tìm theo tên..."
                :disabled="isLocked"
              />

              <input
                v-model="keywordSdt"
                class="form-control ss-input"
                type="text"
                placeholder="Tìm theo SĐT..."
                :disabled="isLocked"
              />

              <select v-model="filterTrangThai" class="form-select ss-select" :disabled="isLocked">
                <option value="">Tất cả trạng thái</option>
                <option value="VIP">VIP</option>
                <option value="THUONG_XUYEN">THƯỜNG XUYÊN</option>
                <option value="MOI">MỚI</option>
              </select>

              <button class="btn btn-secondary px-3 ss-btn-compact" type="button" @click="clearFilter" :disabled="isLocked">
                Xóa lọc
              </button>

              <label class="form-check d-flex align-items-center gap-2 m-0">
                <input class="form-check-input" type="checkbox" v-model="onlyUnsent" :disabled="isLocked" />
                <span class="ss-muted">Chỉ hiện chưa gửi</span>
              </label>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="ss-muted">Hiển thị:</span>
              <select v-model.number="pageSize" class="form-select ss-select ss-select-sm" :disabled="isLocked">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>

          <!-- TABLE -->
          <div class="table-responsive ss-kh-table-wrap">
            <table class="table table-hover align-middle mb-0 ss-kh-table">
              <!-- ✅ chia đều cột + tránh tràn -->
              <colgroup>
                <col style="width: 40px" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
                <col style="width: 12.5%" />
              </colgroup>

              <thead class="table-light">
                <tr>
                  <th>
                    <!-- ✅ select all chỉ áp dụng cho khách CHƯA gửi -->
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isAllPageChecked"
                      @change="toggleAllInPage($event.target.checked)"
                      :disabled="isLocked || selectablePagedIds.length === 0"
                      title="Chỉ chọn khách chưa gửi"
                    />
                  </th>
                  <th>Tên</th>
                  <th>SĐT</th>
                  <th>Email</th>
                  <th>Ngày sinh</th>
                  <th>Tổng chi tiêu</th>
                  <th>Số đơn hàng</th>
                  <th>Đơn hàng gần nhất</th>
                  <th>Gửi mail</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="pagedCustomers.length === 0">
                  <td colspan="9" class="text-center text-muted py-4">Không có khách hàng phù hợp</td>
                </tr>

                <tr v-for="kh in pagedCustomers" :key="kh.id">
                  <td>
                    <!-- ✅ KHÓA checkbox nếu đã gửi -->
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isSelected(kh.id)"
                      @change="toggleOne(kh.id, $event.target.checked)"
                      :disabled="isLocked || isSent(kh.id)"
                      :title="isSent(kh.id) ? 'Khách này đã được gửi mail, không thể chọn' : ''"
                    />
                  </td>

                  <td class="ss-ellipsis">
                    {{ getField(kh, ["hoTen", "tenKhachHang", "ten", "ho_ten"], "-") }}
                  </td>

                  <td class="ss-ellipsis">
                    {{ getField(kh, ["soDienThoai", "sdt", "so_dien_thoai"], "-") }}
                  </td>

                  <td class="ss-ellipsis">
                    {{ getField(kh, ["email"], "-") }}
                  </td>

                  <td class="ss-ellipsis">
                    {{ formatNgay(getField(kh, ["ngaySinh", "ngay_sinh"], "")) || "Chưa có" }}
                  </td>

                  <td class="ss-ellipsis">
                    {{ formatTien(getField(kh, ["tongChiTieu", "tong_chi_tieu", "tongTien", "tong_tien"], 0)) }}
                  </td>

                  <td class="ss-ellipsis">
                    {{ Number(getField(kh, ["soDonHang", "so_don_hang"], 0)) || 0 }}
                  </td>

                  <td class="ss-ellipsis">
                    {{
                      formatNgay(
                        getField(kh, ["donHangGanNhat", "don_hang_gan_nhat", "ngayDonGanNhat", "ngay_don_gan_nhat"], "")
                      ) || "Chưa có"
                    }}
                  </td>

                  <td>
                    <span v-if="isSent(kh.id)" class="badge text-bg-success rounded-pill ss-badge">Đã gửi</span>
                    <span v-else class="badge text-bg-secondary rounded-pill ss-badge">Chưa gửi</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- FOOTER: RANGE + PAGINATION -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mt-2">
            <div class="ss-muted" style="font-size: 13px">
              Hiển thị {{ startIndex }} - {{ endIndex }} trong {{ totalItems }} khách hàng
            </div>

            <nav v-if="pageCount > 1">
              <ul class="pagination mb-0 ss-pagination">
                <li class="page-item" :class="{ disabled: pageNo === 1 }">
                  <button class="page-link" type="button" @click="pageNo = Math.max(1, pageNo - 1)">‹</button>
                </li>

                <li
                  v-for="p in pagesToShow"
                  :key="p"
                  class="page-item"
                  :class="{ active: p === pageNo, disabled: p === '...' }"
                >
                  <button class="page-link" type="button" @click="setPage(p)" :disabled="p === '...'">
                    {{ p }}
                  </button>
                </li>

                <li class="page-item" :class="{ disabled: pageNo === pageCount }">
                  <button class="page-link" type="button" @click="pageNo = Math.min(pageCount, pageNo + 1)">›</button>
                </li>
              </ul>
            </nav>
          </div>

          <!-- SELECTED LIST -->
          <div class="mt-4">
            <div class="ss-selected-title">Chọn khách hàng từ bảng trên</div>

            <div v-if="selectedCustomers.length === 0" class="ss-muted mt-2">Chưa chọn khách hàng nào</div>

            <div v-else class="d-flex flex-column gap-2 mt-2">
              <div
                v-for="kh in selectedCustomers"
                :key="kh.id"
                class="border rounded-3 p-3 d-flex justify-content-between align-items-center ss-selected-item"
              >
                <div class="ss-ellipsis">
                  <div class="ss-selected-name ss-ellipsis">{{ kh.ten }}</div>
                  <div class="ss-muted" style="font-size: 13px">{{ kh.sdt }}</div>
                </div>

                <button
                  class="btn btn-outline-danger btn-sm ss-btn-x"
                  type="button"
                  title="Bỏ chọn"
                  @click="toggleOne(kh.id, false)"
                  :disabled="isLocked"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- ✅ NÚT HỦY + TẠO MỚI/CẬP NHẬT ĐƯA XUỐNG DƯỚI -->
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button @click="goBack" class="btn ss-btn-outline px-4 rounded-3" type="button" :disabled="isSaving || isSendingMail">
                Hủy
              </button>

              <button
                v-if="!isLocked"
                @click="handleSave"
                :disabled="isSaving"
                class="btn ss-btn-primary px-4 rounded-3 shadow"
                type="button"
              >
                {{ isSaving ? "Đang xử lý..." : (form.id ? "Cập nhật" : "Tạo mới") }}
              </button>

              <button v-else disabled class="btn btn-secondary px-4 rounded-3 opacity-50" type="button">
                Không thể cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- /CHỌN KHÁCH HÀNG -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";
import VoucherForm from "@/components/voucher/VoucherForm.vue";

const route = useRoute();
const router = useRouter();

const API_BASE = "http://localhost:8080/api/admin";

const isSaving = ref(false);
const isLocked = ref(false);
const isUnlimited = ref(false);

const loadingCustomers = ref(false);
const customers = ref([]);

const selectedCustomerIds = ref([]);
const sentCustomerIds = ref([]);

const isSendingMail = ref(false);

// filter
const keywordTen = ref("");
const keywordSdt = ref("");
const filterTrangThai = ref(""); // "" | VIP | THUONG_XUYEN | MOI
const onlyUnsent = ref(false);

// paging
const pageNo = ref(1);
const pageSize = ref(10);

const form = ref({
  id: null,
  maPhieuGiamGia: "",
  tenPhieuGiamGia: "",
  moTa: "",
  loaiPhieuGiamGia: false,
  hinhThucGiam: false,
  giaTriGiamGia: 0,
  soTienGiamToiDa: 0,
  soLuongSuDung: 0,
  hoaDonToiThieu: 0,
  ngayBatDau: new Date().toISOString().split("T")[0],
  ngayKetThuc: "",
  trangThai: true,
});

const goBack = () => {
  router.replace("/admin/giam-gia/phieu");
};

const normalizeCustomerIds = (arr) =>
  [...new Set((arr || []).map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0))];

const getField = (obj, keys, fallback = "-") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return fallback;
};

const formatNgay = (v) => {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return "";
  }
};

const formatTien = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0 ₫";
  return n.toLocaleString("vi-VN") + " ₫";
};

// map trạng thái khách hàng để lọc (không hiển thị cột trạng thái)
const getLoaiKhachHangKey = (kh) => {
  const raw =
    getField(kh, ["trangThai", "loaiKhachHang", "phanLoai", "xepLoai", "capDo", "hang"], "") ||
    getField(kh, ["trang_thai", "loai_khach_hang", "phan_loai", "xep_loai", "cap_do", "hang"], "");

  const s = String(raw || "").trim().toLowerCase();
  if (s.includes("vip")) return "VIP";
  if (s.includes("thuong") || s.includes("xuyen") || s.includes("frequent") || s.includes("regular") || s.includes("tx"))
    return "THUONG_XUYEN";
  if (s.includes("moi") || s.includes("new")) return "MOI";

  if (raw === 1 || String(raw) === "1") return "VIP";
  if (raw === 2 || String(raw) === "2") return "THUONG_XUYEN";
  if (raw === 3 || String(raw) === "3") return "MOI";

  return "MOI";
};

// chọn/đã gửi
const selectedSet = computed(() => new Set(normalizeCustomerIds(selectedCustomerIds.value)));
const sentSet = computed(() => new Set(normalizeCustomerIds(sentCustomerIds.value)));

const isSelected = (id) => selectedSet.value.has(Number(id));
const isSent = (id) => sentSet.value.has(Number(id));

const toggleOne = (id, checked) => {
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) return;

  // ✅ đã gửi => không cho tick lại
  if (isSent(n)) return;

  if (checked) {
    selectedCustomerIds.value = normalizeCustomerIds([...selectedCustomerIds.value, n]);
  } else {
    selectedCustomerIds.value = normalizeCustomerIds(selectedCustomerIds.value.filter((x) => Number(x) !== n));
  }
};

// filter + paging
const filteredCustomers = computed(() => {
  const ten = (keywordTen.value || "").trim().toLowerCase();
  const sdt = (keywordSdt.value || "").trim().toLowerCase();
  const stt = filterTrangThai.value || "";

  let arr = Array.isArray(customers.value) ? customers.value : [];

  if (ten) {
    arr = arr.filter((kh) =>
      String(getField(kh, ["hoTen", "tenKhachHang", "ten", "ho_ten"], "")).toLowerCase().includes(ten)
    );
  }
  if (sdt) {
    arr = arr.filter((kh) =>
      String(getField(kh, ["soDienThoai", "sdt", "so_dien_thoai"], "")).toLowerCase().includes(sdt)
    );
  }
  if (stt) {
    arr = arr.filter((kh) => getLoaiKhachHangKey(kh) === stt);
  }
  if (onlyUnsent.value) {
    arr = arr.filter((kh) => !isSent(kh.id));
  }

  return arr;
});

const totalItems = computed(() => filteredCustomers.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(totalItems.value / Math.max(1, pageSize.value))));

watch([keywordTen, keywordSdt, filterTrangThai, onlyUnsent, pageSize], () => {
  pageNo.value = 1;
});

watch(pageNo, (v) => {
  if (v < 1) pageNo.value = 1;
  if (v > pageCount.value) pageNo.value = pageCount.value;
});

const pagedCustomers = computed(() => {
  const start = (pageNo.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCustomers.value.slice(start, end);
});

const startIndex = computed(() => {
  if (totalItems.value === 0) return 0;
  return (pageNo.value - 1) * pageSize.value + 1;
});
const endIndex = computed(() => {
  if (totalItems.value === 0) return 0;
  return Math.min(pageNo.value * pageSize.value, totalItems.value);
});

// ✅ chỉ những khách CHƯA gửi trong trang hiện tại mới selectable
const selectablePagedIds = computed(() =>
  normalizeCustomerIds(
    pagedCustomers.value
      .filter((kh) => !isSent(kh.id))
      .map((x) => x.id)
  )
);

const isAllPageChecked = computed(() => {
  const ids = selectablePagedIds.value;
  if (ids.length === 0) return false;
  return ids.every((id) => isSelected(id));
});

const toggleAllInPage = (checked) => {
  const ids = selectablePagedIds.value;
  if (ids.length === 0) return;

  if (checked) {
    selectedCustomerIds.value = normalizeCustomerIds([...selectedCustomerIds.value, ...ids]);
  } else {
    const rm = new Set(ids);
    selectedCustomerIds.value = normalizeCustomerIds(selectedCustomerIds.value.filter((x) => !rm.has(Number(x))));
  }
};

const pagesToShow = computed(() => {
  const total = pageCount.value;
  const cur = pageNo.value;

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (cur > 3) pages.push("...");

  const start = Math.max(2, cur - 1);
  const end = Math.min(total - 1, cur + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (cur < total - 2) pages.push("...");

  pages.push(total);
  return pages;
});

const setPage = (p) => {
  if (p === "...") return;
  pageNo.value = Number(p);
};

const clearFilter = () => {
  keywordTen.value = "";
  keywordSdt.value = "";
  filterTrangThai.value = "";
  onlyUnsent.value = false;
};

// ✅ selected list: chỉ hiển thị các khách CHƯA gửi (đỡ nhầm)
const selectedCustomers = computed(() => {
  const sent = new Set(normalizeCustomerIds(sentCustomerIds.value));
  const ids = normalizeCustomerIds(selectedCustomerIds.value).filter((id) => !sent.has(Number(id)));

  const map = new Map((customers.value || []).map((x) => [Number(x.id), x]));
  return ids.map((id) => {
    const kh = map.get(id);
    return {
      id,
      ten: kh ? getField(kh, ["hoTen", "tenKhachHang", "ten", "ho_ten"], `#${id}`) : `#${id}`,
      sdt: kh ? getField(kh, ["soDienThoai", "sdt", "so_dien_thoai"], "-") : "-",
    };
  });
});

// ✅ auto bỏ chọn những khách đã gửi (khi load/fetch hoặc sau khi gửi)
watch(
  sentCustomerIds,
  () => {
    const sent = new Set(normalizeCustomerIds(sentCustomerIds.value));
    selectedCustomerIds.value = normalizeCustomerIds(selectedCustomerIds.value).filter((id) => !sent.has(Number(id)));
  },
  { deep: true }
);

// ====== CHỐNG GỬI TRÙNG: ưu tiên BE, fallback localStorage ======
const sentKey = (voucherId) => `ss_voucher_sent_${voucherId}`;

const loadSentLocal = (voucherId) => {
  try {
    const raw = localStorage.getItem(sentKey(voucherId));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return normalizeCustomerIds(arr);
  } catch {
    return [];
  }
};

const saveSentLocal = (voucherId, ids) => {
  try {
    localStorage.setItem(sentKey(voucherId), JSON.stringify(normalizeCustomerIds(ids)));
  } catch {
    // ignore
  }
};

const fetchSentCustomerIds = async (voucherId) => {
  if (!voucherId) return;

  sentCustomerIds.value = loadSentLocal(voucherId);

  try {
    const res = await axios.get(`${API_BASE}/phieu-giam-gia/${voucherId}/khach-hang-da-gui-ids`);
    sentCustomerIds.value = normalizeCustomerIds(res.data);
    saveSentLocal(voucherId, sentCustomerIds.value);
  } catch {
    // giữ localStorage nếu BE lỗi/thiếu
  }
};

const sendVoucherMailRaw = async (voucherId, ids) => {
  const uniqueIds = normalizeCustomerIds(ids);

  await fetchSentCustomerIds(voucherId);

  const sent = new Set(normalizeCustomerIds(sentCustomerIds.value));
  const toSend = uniqueIds.filter((x) => !sent.has(x));

  if (toSend.length === 0) {
    return { sent: 0, skipped: uniqueIds.length };
  }

  const res = await axios.post(`${API_BASE}/phieu-giam-gia/${voucherId}/gui-mail`, {
    idKhachHangs: toSend,
  });

  const beIds = res?.data?.danhSachDaGuiIds;
  if (Array.isArray(beIds)) {
    sentCustomerIds.value = normalizeCustomerIds(beIds);
  } else {
    sentCustomerIds.value = normalizeCustomerIds([...sentCustomerIds.value, ...toSend]);
  }

  saveSentLocal(voucherId, sentCustomerIds.value);

  return { sent: toSend.length, skipped: uniqueIds.length - toSend.length };
};

const handleSendMail = async () => {
  if (isLocked.value) return;

  const voucherId = Number(form.value.id || 0);
  if (!voucherId) {
    return Swal.fire("Thông báo", "Vui lòng lưu phiếu trước khi gửi mail", "warning");
  }

  const ids = normalizeCustomerIds(selectedCustomerIds.value);
  if (ids.length === 0) {
    return Swal.fire("Thông báo", "Vui lòng chọn ít nhất một khách hàng", "warning");
  }

  isSendingMail.value = true;
  try {
    const rs = await sendVoucherMailRaw(voucherId, ids);
    if (rs.sent === 0) {
      await Swal.fire("Thông báo", "Tất cả khách hàng đã được gửi phiếu này trước đó", "info");
    } else {
      const extra = rs.skipped > 0 ? ` (Bỏ qua ${rs.skipped} khách đã gửi trước đó)` : "";
      await Swal.fire("Thành công", `Đã gửi mail cho ${rs.sent} khách hàng.${extra}`, "success");
    }
  } catch (e) {
    const msg = e?.response?.data?.detail || e?.response?.data?.message || "Gửi mail thất bại";
    Swal.fire("Lỗi", msg, "error");
  } finally {
    isSendingMail.value = false;
  }
};

// ====== LOAD DATA ======
const reloadCustomers = async () => {
  loadingCustomers.value = true;
  try {
    const cRes = await axios.get(`${API_BASE}/khach-hang`);
    customers.value = Array.isArray(cRes.data) ? cRes.data : cRes.data?.content || [];
  } catch (e) {
    console.error("Lỗi load khách hàng:", e);
  } finally {
    loadingCustomers.value = false;
  }
};

const loadData = async () => {
  await reloadCustomers();

  const id = route.params.id ? Number(route.params.id) : null;
  if (!id) return;

  try {
    const vRes = await axios.get(`${API_BASE}/phieu-giam-gia/${id}`);
    const data = vRes.data || {};

    const loaiCaNhan = data.loaiPhieuGiamGia === true || Number(data.loaiPhieuGiamGia) === 1;
    const isPercent = Number(data.giaTriGiamGia || 0) > 0;

    form.value = {
      ...form.value,
      ...data,
      id: Number(data.id || id),
      loaiPhieuGiamGia: loaiCaNhan,
      hinhThucGiam: isPercent,
      giaTriGiamGia: Number(data.giaTriGiamGia || 0),
      soTienGiamToiDa: Number(data.soTienGiamToiDa || 0),
      soLuongSuDung: Number(data.soLuongSuDung || 0),
      hoaDonToiThieu: Number(data.hoaDonToiThieu || 0),
      trangThai: data.trangThai === true || Number(data.trangThai) === 1,
    };

    isUnlimited.value = Number(data.soLuongSuDung || 0) >= 999999;
    isLocked.value = !(data.trangThai === true || Number(data.trangThai) === 1);

    if (form.value.loaiPhieuGiamGia) {
      const idsRes = await axios.get(`${API_BASE}/phieu-giam-gia/${form.value.id}/khach-hang-ids`);
      selectedCustomerIds.value = normalizeCustomerIds(idsRes.data);

      await fetchSentCustomerIds(form.value.id);
    }
  } catch (e) {
    console.error("Lỗi load phiếu:", e);
  }
};

// ====== SAVE ======
const handleSave = async () => {
  if (isLocked.value) return;

  if (!form.value.tenPhieuGiamGia?.trim()) {
    return Swal.fire("Thông báo", "Vui lòng nhập tên phiếu", "warning");
  }

  if (!form.value.ngayBatDau || !form.value.ngayKetThuc) {
    return Swal.fire("Thông báo", "Vui lòng chọn đủ ngày bắt đầu/kết thúc", "warning");
  }
  if (new Date(form.value.ngayKetThuc) < new Date(form.value.ngayBatDau)) {
    return Swal.fire("Thông báo", "Ngày kết thúc phải >= ngày bắt đầu", "warning");
  }

  const uniqueCustomerIds = normalizeCustomerIds(selectedCustomerIds.value);
  if (form.value.loaiPhieuGiamGia && uniqueCustomerIds.length === 0) {
    return Swal.fire("Thông báo", "Vui lòng chọn ít nhất một khách hàng cho phiếu cá nhân", "warning");
  }

  isSaving.value = true;
  try {
    const payload = {
      tenPhieuGiamGia: (form.value.tenPhieuGiamGia || "").trim(),
      moTa: (form.value.moTa || "").trim(),
      loaiPhieuGiamGia: !!form.value.loaiPhieuGiamGia,
      giaTriGiamGia: Number(form.value.giaTriGiamGia || 0),
      soTienGiamToiDa: Number(form.value.soTienGiamToiDa || 0),
      hoaDonToiThieu: Number(form.value.hoaDonToiThieu || 0),
      soLuongSuDung: form.value.loaiPhieuGiamGia
        ? uniqueCustomerIds.length
        : isUnlimited.value
          ? 999999
          : Number(form.value.soLuongSuDung || 0),
      ngayBatDau: form.value.ngayBatDau,
      ngayKetThuc: form.value.ngayKetThuc,
      trangThai: !!form.value.trangThai,
      ...(form.value.loaiPhieuGiamGia ? { idKhachHangs: uniqueCustomerIds } : {}),
    };

    let savedId = Number(form.value.id || 0);

    if (form.value.id) {
      const res = await axios.put(`${API_BASE}/phieu-giam-gia/${form.value.id}`, payload);
      savedId = Number(res?.data?.id || form.value.id);
    } else {
      const res = await axios.post(`${API_BASE}/phieu-giam-gia`, payload);
      savedId = Number(res?.data?.id || res?.data?.data?.id || 0);
    }

    if (savedId) form.value.id = savedId;

    // ✅ tự gửi mail cho phiếu cá nhân (không gửi trùng)
    if (form.value.loaiPhieuGiamGia && savedId) {
      try {
        isSendingMail.value = true;
        const rs = await sendVoucherMailRaw(savedId, uniqueCustomerIds);
        const extra = rs.skipped > 0 ? ` (Bỏ qua ${rs.skipped} khách đã gửi trước đó)` : "";
        const msg =
          rs.sent === 0
            ? "Đã lưu phiếu. Tất cả khách hàng đã được gửi phiếu này trước đó."
            : `Đã lưu phiếu và gửi mail cho ${rs.sent} khách hàng.${extra}`;

        await Swal.fire("Thành công", msg, "success");
        router.push("/admin/giam-gia/phieu");
        return;
      } catch (e) {
        const msg = e?.response?.data?.detail || e?.response?.data?.message || "Gửi mail thất bại";
        await Swal.fire("Thông báo", `Đã lưu phiếu nhưng gửi mail thất bại: ${msg}`, "warning");
        return;
      } finally {
        isSendingMail.value = false;
      }
    }

    await Swal.fire("Thành công", "Dữ liệu đã được lưu!", "success");
    router.push("/admin/giam-gia/phieu");
  } catch (e) {
    const msg = e?.response?.data?.detail || e?.response?.data?.message || "Không thể lưu dữ liệu";
    Swal.fire("Lỗi", msg, "error");
  } finally {
    isSaving.value = false;
  }
};

// ====== DELETE ======
const handleDelete = async () => {
  const result = await Swal.fire({
    title: "Xác nhận xóa?",
    text: "Dữ liệu sẽ không thể khôi phục!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý xóa",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_BASE}/phieu-giam-gia/${form.value.id}`);
      await Swal.fire("Đã xóa", "Phiếu giảm giá đã được loại bỏ", "success");
      router.push("/admin/giam-gia/phieu");
    } catch (e) {
      Swal.fire("Lỗi", "Không thể xóa phiếu này", "error");
    }
  }
};

// đổi công khai <-> cá nhân
watch(
  () => form.value.loaiPhieuGiamGia,
  (isCaNhan) => {
    if (!isCaNhan) {
      selectedCustomerIds.value = [];
      sentCustomerIds.value = [];
      clearFilter();
    }
  }
);

onMounted(loadData);
</script>

<style scoped>
/* lock */
.locked-content {
  opacity: 0.6;
  pointer-events: none;
  user-select: none;
}
.locked-content button,
.locked-content .mt-4,
.locked-content .mt-3 {
  pointer-events: auto;
}

/* title */
.ss-page-title {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* shared */
.ss-muted {
  color: rgba(17, 24, 39, 0.7);
  font-weight: 400;
}

.ss-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* buttons */
.ss-btn-outline {
  background: #fff;
  color: #111827;
  border: 1px solid rgba(17, 24, 39, 0.28);
  transition: all 0.2s ease;
}
.ss-btn-outline:hover {
  border-color: rgba(255, 77, 79, 0.55);
  background: rgba(255, 77, 79, 0.06);
  color: #111827;
}

.ss-btn-primary {
  color: #fff;
  border: none;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  transition: all 0.2s ease;
}
.ss-btn-primary:hover {
  filter: brightness(1.1);
}

.ss-btn-compact {
  height: 36px;
  font-size: 14px;
  border-radius: 10px;
}

.ss-btn-mail {
  height: 36px;
  font-size: 14px;
  border-radius: 10px;
}

/* filter inputs */
.ss-kh-filter .ss-input {
  width: 210px;
  max-width: 100%;
  height: 36px;
  font-size: 14px;
  border-radius: 10px;
}
.ss-kh-filter .ss-select {
  width: 200px;
  max-width: 100%;
  height: 36px;
  font-size: 14px;
  border-radius: 10px;
}
.ss-kh-filter .ss-select-sm {
  width: 90px;
}

/* table compact + not bold */
.ss-kh-table-wrap {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  overflow: hidden;
}
.ss-kh-table {
  table-layout: fixed;
  width: 100%;
}
.ss-kh-table th,
.ss-kh-table td {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 400;
  border-color: rgba(17, 24, 39, 0.08);
  vertical-align: middle;
}
.ss-kh-table thead th {
  font-weight: 400;
}

/* badge nhỏ gọn */
.ss-badge {
  font-weight: 400;
  font-size: 12px;
  padding: 6px 10px;
}

/* pagination gọn như mẫu */
.ss-pagination .page-link {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-left: 6px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  color: #111827;
  font-weight: 400;
}
.ss-pagination .page-item.active .page-link {
  background: #2f6fed;
  border-color: #2f6fed;
  color: #fff;
}

/* selected list */
.ss-selected-title {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 10px;
  background: #2f6fed;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
}
.ss-selected-item {
  background: #fff;
}
.ss-selected-name {
  font-weight: 400;
}
.ss-btn-x {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 10px;
}
</style>
