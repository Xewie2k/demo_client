<template>
  <div class="p-4">
    <div class="d-flex align-items-center gap-2 mb-4">
      <button @click="goBack" class="btn btn-link p-0 text-dark">
        <span class="material-icons">arrow_back</span>
      </button>
      <h2 class="h5 fw-bold m-0 text-uppercase">
        {{ isLocked ? 'Chi tiết phiếu (Đã kết thúc)' : form.id ? 'Chi tiết phiếu giảm giá' : 'Thêm phiếu giảm giá' }}
      </h2>
    </div>

    <div class="row g-4">
      <div :class="form.loaiPhieuGiamGia ? 'col-lg-7' : 'col-lg-12'">
        <div class="card border-0 shadow-sm rounded-4 p-4" :class="{ 'bg-light': isLocked }">
          <VoucherForm
            v-model="form"
            v-model:isUnlimited="isUnlimited"
            :disabled="isLocked"
          />

          <div class="mt-5 d-flex justify-content-between align-items-center border-top pt-4">
            <div>
              <button v-if="form.id" @click="handleDelete" class="btn btn-outline-danger px-4 rounded-3 d-flex align-items-center gap-2">
                <span class="material-icons fs-5">delete_outline</span> Xóa phiếu
              </button>
            </div>
            <div class="d-flex gap-2">
              <button @click="goBack" class="btn ss-btn-outline px-4 rounded-3">Quay lại</button>
              
              <button v-if="!isLocked" @click="handleSave" :disabled="isSaving" class="btn ss-btn-primary px-4 rounded-3 shadow">
                {{ isSaving ? 'Đang xử lý...' : (form.id ? 'Cập nhật' : 'Thêm phiếu') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="form.loaiPhieuGiamGia" class="col-lg-5">
        <VoucherCustomerSelect
          v-model="selectedCustomerIds"
          :customers="customers"
          :disabled="isLocked"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import VoucherForm from '@/components/voucher/VoucherForm.vue';
import VoucherCustomerSelect from '@/components/voucher/VoucherCustomerSelect.vue';

const route = useRoute();
const router = useRouter();
const isSaving = ref(false);
const isLocked = ref(false);
const isUnlimited = ref(false);
const customers = ref([]);
const selectedCustomerIds = ref([]);

const form = ref({
  id: null,
  tenPhieuGiamGia: '',
  loaiPhieuGiamGia: false,
  hinhThucGiam: false,
  giaTriGiamGia: 0,
  soLuongSuDung: 0,
  hoaDonToiThieu: 0,
  ngayBatDau: new Date().toISOString().split('T')[0],
  ngayKetThuc: '',
  trangThai: 1
});

const goBack = () => router.push('/admin/Phieu_giam_gia');

const loadData = async () => {
  try {
    const cRes = await axios.get('http://localhost:8080/api/admin/khach-hang');
    customers.value = cRes.data;

    if (route.params.id) {
      const vRes = await axios.get(`http://localhost:8080/api/admin/phieu-giam-gia/${route.params.id}`);
      const data = vRes.data;

      form.value = {
        ...data,
        loaiPhieuGiamGia: Number(data.loaiPhieuGiamGia) === 1,
        hinhThucGiam: !!data.hinhThucGiam
      };
      isUnlimited.value = data.soLuongSuDung >= 999999;
      isLocked.value = data.trangThai === 0;

      if (form.value.loaiPhieuGiamGia) {
        const idsRes = await axios.get(`http://localhost:8080/api/admin/phieu-giam-gia/${data.id}/khach-hang-ids`);
        selectedCustomerIds.value = idsRes.data.map(id => Number(id));
      }
    }
  } catch (e) {
    console.error('Lỗi load dữ liệu:', e);
  }
};

const handleSave = async () => {
  if (!form.value.tenPhieuGiamGia.trim()) return Swal.fire('Thông báo', 'Vui lòng nhập tên phiếu', 'warning');

  isSaving.value = true;
  try {
    const payload = {
      ...form.value,
      loaiPhieuGiamGia: form.value.loaiPhieuGiamGia ? 1 : 0,
      hinhThucGiam: form.value.hinhThucGiam ? 1 : 0,
      giaTriGiamGia: Number(form.value.giaTriGiamGia),
      hoaDonToiThieu: Number(form.value.hoaDonToiThieu),
      soLuongSuDung: isUnlimited.value ? 999999 : Number(form.value.soLuongSuDung),
      idKhachHangs: form.value.loaiPhieuGiamGia 
        ? selectedCustomerIds.value.map(id => Number(id)) 
        : []
    };

    if (form.value.id) {
      await axios.put(`http://localhost:8080/api/admin/phieu-giam-gia/${form.value.id}`, payload);
    } else {
      await axios.post('http://localhost:8080/api/admin/phieu-giam-gia', payload);
    }

    await Swal.fire('Thành công', 'Dữ liệu đã được lưu', 'success');
    goBack();
  } catch (e) {
    console.error('Lỗi lưu dữ liệu:', e);
    // Hiển thị lỗi chi tiết từ Server để dễ debug lỗi Constraint
    Swal.fire('Lỗi', e.response?.data?.message || 'Không thể lưu dữ liệu', 'error');
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'Xác nhận xóa?',
    text: "Dữ liệu sẽ không thể khôi phục!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý xóa'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:8080/api/admin/phieu-giam-gia/${form.value.id}`);
      await Swal.fire('Đã xóa', 'Phiếu giảm giá đã được loại bỏ', 'success');
      goBack();
    } catch (e) {
      Swal.fire('Lỗi', 'Không thể xóa phiếu này', 'error');
    }
  }
};

onMounted(loadData);
</script>

<style scoped>
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
  color: #fff;
}
.ss-btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>