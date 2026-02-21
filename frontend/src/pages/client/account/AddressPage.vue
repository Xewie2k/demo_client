<template>
  <div class="bg-white p-4 shadow-sm h-100">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
      <h5 class="fw-bold m-0">Địa chỉ của tôi</h5>
      <button class="btn btn-danger btn-sm" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i> Thêm địa chỉ
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <div v-else-if="addresses.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-geo-alt" style="font-size: 3rem;"></i>
      <p class="mt-2">Chưa có địa chỉ nào</p>
    </div>

    <div v-else>
      <div v-for="addr in addresses" :key="addr.id" class="border rounded-3 p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-bold">
              {{ addr.tenDiaChi }}
              <span v-if="addr.macDinh" class="badge bg-danger ms-2">Mặc định</span>
            </div>
            <div class="text-muted small mt-1">
              {{ [addr.diaChiCuThe, addr.phuong, addr.quan, addr.thanhPho].filter(Boolean).join(', ') }}
            </div>
          </div>
          <div class="d-flex gap-2">
            <button v-if="!addr.macDinh" class="btn btn-sm btn-outline-primary" @click="setDefault(addr.id)">
              <i class="bi bi-star me-1"></i>Mặc định
            </button>
            <button class="btn btn-sm btn-outline-secondary" @click="openEditModal(addr)">Sửa</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteAddress(addr.id)">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="addressModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">{{ editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="modalError" class="alert alert-danger py-2 small">{{ modalError }}</div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Tên địa chỉ <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="addrForm.tenDiaChi" placeholder="Ví dụ: Nhà, Công ty..." required>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Tỉnh/Thành phố</label>
              <select class="form-select" v-model="addrCodes.city" @change="onCityChange">
                <option value="">Chọn Tỉnh/Thành</option>
                <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Quận/Huyện</label>
              <select class="form-select" v-model="addrCodes.district" @change="onDistrictChange" :disabled="!addrCodes.city">
                <option value="">Chọn Quận/Huyện</option>
                <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Xã/Phường</label>
              <select class="form-select" v-model="addrCodes.ward" @change="onWardChange" :disabled="!addrCodes.district">
                <option value="">Chọn Xã/Phường</option>
                <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Địa chỉ cụ thể</label>
              <input type="text" class="form-control" v-model="addrForm.diaChiCuThe" placeholder="Số nhà, ngõ, đường...">
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-model="addrForm.macDinh" id="defaultCheck">
              <label class="form-check-label small" for="defaultCheck">Đặt làm địa chỉ mặc định</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="saveAddress" :disabled="modalSaving">
              <span v-if="modalSaving" class="spinner-border spinner-border-sm me-1"></span>
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useClientAuth } from '@/services/authClient';
import axios from 'axios';
import { Modal } from 'bootstrap';

const { customer } = useClientAuth();
const loading = ref(true);
const addresses = ref([]);
const editingId = ref(null);
const modalError = ref('');
const modalSaving = ref(false);
const modalRef = ref(null);
let bsModal = null;

const addrForm = reactive({
  tenDiaChi: '',
  thanhPho: '',
  quan: '',
  phuong: '',
  diaChiCuThe: '',
  macDinh: false,
});

const addrCodes = reactive({ city: '', district: '', ward: '' });
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const fetchAddresses = async () => {
  try {
    const res = await apiClient.get(`/api/client/account/addresses/${customer.value.id}`);
    addresses.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchProvinces = async () => {
  try {
    const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
    provinces.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const onCityChange = async () => {
  addrCodes.district = '';
  addrCodes.ward = '';
  districts.value = [];
  wards.value = [];
  addrForm.quan = '';
  addrForm.phuong = '';
  if (!addrCodes.city) { addrForm.thanhPho = ''; return; }
  const p = provinces.value.find(x => x.code === addrCodes.city);
  addrForm.thanhPho = p ? p.name : '';
  try {
    const res = await axios.get(`https://provinces.open-api.vn/api/p/${addrCodes.city}?depth=2`);
    districts.value = res.data.districts || [];
  } catch (err) { console.error(err); }
};

const onDistrictChange = async () => {
  addrCodes.ward = '';
  wards.value = [];
  addrForm.phuong = '';
  if (!addrCodes.district) { addrForm.quan = ''; return; }
  const d = districts.value.find(x => x.code === addrCodes.district);
  addrForm.quan = d ? d.name : '';
  try {
    const res = await axios.get(`https://provinces.open-api.vn/api/d/${addrCodes.district}?depth=2`);
    wards.value = res.data.wards || [];
  } catch (err) { console.error(err); }
};

const onWardChange = () => {
  const w = wards.value.find(x => x.code === addrCodes.ward);
  addrForm.phuong = w ? w.name : '';
};

const resetForm = () => {
  addrForm.tenDiaChi = '';
  addrForm.thanhPho = '';
  addrForm.quan = '';
  addrForm.phuong = '';
  addrForm.diaChiCuThe = '';
  addrForm.macDinh = false;
  addrCodes.city = '';
  addrCodes.district = '';
  addrCodes.ward = '';
  districts.value = [];
  wards.value = [];
  editingId.value = null;
  modalError.value = '';
};

const getModal = () => {
  if (!bsModal && modalRef.value) {
    bsModal = new Modal(modalRef.value);
  }
  return bsModal;
};

const openAddModal = () => {
  resetForm();
  getModal()?.show();
};

const openEditModal = async (addr) => {
  resetForm();
  editingId.value = addr.id;
  addrForm.tenDiaChi = addr.tenDiaChi || '';
  addrForm.thanhPho = addr.thanhPho || '';
  addrForm.quan = addr.quan || '';
  addrForm.phuong = addr.phuong || '';
  addrForm.diaChiCuThe = addr.diaChiCuThe || '';
  addrForm.macDinh = !!addr.macDinh;

  // Reverse-lookup province/district/ward codes for dropdowns
  try {
    if (addr.thanhPho) {
      const matchedProvince = provinces.value.find(p => p.name === addr.thanhPho);
      if (matchedProvince) {
        addrCodes.city = matchedProvince.code;
        const dRes = await axios.get(`https://provinces.open-api.vn/api/p/${matchedProvince.code}?depth=2`);
        districts.value = dRes.data.districts || [];

        if (addr.quan) {
          const matchedDistrict = districts.value.find(d => d.name === addr.quan);
          if (matchedDistrict) {
            addrCodes.district = matchedDistrict.code;
            const wRes = await axios.get(`https://provinces.open-api.vn/api/d/${matchedDistrict.code}?depth=2`);
            wards.value = wRes.data.wards || [];

            if (addr.phuong) {
              const matchedWard = wards.value.find(w => w.name === addr.phuong);
              if (matchedWard) {
                addrCodes.ward = matchedWard.code;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load address codes', err);
  }

  getModal()?.show();
};

const saveAddress = async () => {
  modalSaving.value = true;
  modalError.value = '';
  try {
    const payload = { ...addrForm, idKhachHang: customer.value.id };
    if (editingId.value) {
      await apiClient.put(`/api/client/account/addresses/${editingId.value}`, payload);
    } else {
      await apiClient.post('/api/client/account/addresses', payload);
    }
    getModal()?.hide();
    loading.value = true;
    await fetchAddresses();
  } catch (err) {
    modalError.value = err.userMessage || 'Lưu thất bại!';
  } finally {
    modalSaving.value = false;
  }
};

const setDefault = async (id) => {
  try {
    await apiClient.put(`/api/client/account/addresses/${id}`, {
      macDinh: true,
      idKhachHang: customer.value.id
    });
    loading.value = true;
    await fetchAddresses();
  } catch (err) {
    alert(err.userMessage || 'Đặt mặc định thất bại!');
  }
};

const deleteAddress = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
  try {
    await apiClient.delete(`/api/client/account/addresses/${id}`);
    addresses.value = addresses.value.filter(a => a.id !== id);
  } catch (err) {
    alert(err.userMessage || 'Xóa thất bại!');
  }
};

onMounted(() => {
  fetchAddresses();
  fetchProvinces();
});
</script>
