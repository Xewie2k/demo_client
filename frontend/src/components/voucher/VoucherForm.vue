<template>
  <div class="row g-3">
    <div class="col-12">
      <label class="form-label fw-bold small">Tên giảm giá</label>
      <input :value="modelValue.tenPhieuGiamGia" @input="update('tenPhieuGiamGia', $event.target.value)" :disabled="disabled" type="text" class="form-control rounded-3" />
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold small">Hình thức giảm</label>
      <div class="d-flex gap-4 pt-1">
        <label><input type="radio" :checked="modelValue.hinhThucGiam === false" @change="update('hinhThucGiam', false)" :disabled="disabled" /> VNĐ</label>
        <label><input type="radio" :checked="modelValue.hinhThucGiam === true" @change="update('hinhThucGiam', true)" :disabled="disabled" /> %</label>
      </div>
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold small">Giá trị giảm</label>
      <input :value="modelValue.giaTriGiamGia" @input="update('giaTriGiamGia', Number($event.target.value))" :disabled="disabled" type="number" class="form-control rounded-3" />
    </div>
    <div class="col-md-6">
      <div class="d-flex justify-content-between align-items-center">
        <label class="form-label fw-bold small mb-0">Số lượng sử dụng</label>
        <div class="form-check form-switch small">
          <input class="form-check-input" type="checkbox" :checked="isUnlimited" @change="$emit('update:isUnlimited', $event.target.checked)" :disabled="disabled">
          <label class="form-check-label">Vô hạn</label>
        </div>
      </div>
      <input :value="modelValue.soLuongSuDung" @input="update('soLuongSuDung', Number($event.target.value))" :disabled="disabled || isUnlimited" type="number" class="form-control rounded-3 mt-2" :placeholder="isUnlimited ? '∞ Không giới hạn' : 'Nhập số lượng'" />
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold small">Hóa đơn tối thiểu</label>
      <input :value="modelValue.hoaDonToiThieu" @input="update('hoaDonToiThieu', Number($event.target.value))" :disabled="disabled" type="number" class="form-control rounded-3" />
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold small">Ngày bắt đầu</label>
      <input :value="modelValue.ngayBatDau" @input="update('ngayBatDau', $event.target.value)" :disabled="disabled" type="date" class="form-control rounded-3" />
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold small">Ngày kết thúc</label>
      <input :value="modelValue.ngayKetThuc" @input="update('ngayKetThuc', $event.target.value)" :disabled="disabled" type="date" class="form-control rounded-3" />
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold small">Loại phiếu</label>
      <div class="d-flex gap-4 pt-1">
        <label><input type="radio" :checked="modelValue.loaiPhieuGiamGia === false" @change="update('loaiPhieuGiamGia', false)" :disabled="disabled" /> Công khai</label>
        <label><input type="radio" :checked="modelValue.loaiPhieuGiamGia === true" @change="update('loaiPhieuGiamGia', true)" :disabled="disabled" /> Cá nhân</label>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['modelValue', 'disabled', 'isUnlimited']);
const emit = defineEmits(['update:modelValue', 'update:isUnlimited']);

const update = (key, value) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>
