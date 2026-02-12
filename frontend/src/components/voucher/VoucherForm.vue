<!-- File: src/components/voucher/VoucherForm.vue -->
<template>
  <div class="row g-3">
    <div class="col-12">
      <label class="form-label fw-bold small">
        Mã phiếu giảm giá <span class="text-danger">*</span>
      </label>
      <input
        :value="modelValue.maPhieuGiamGia"
        readonly
        type="text"
        class="form-control rounded-3 ss-input-readonly"
        placeholder="Mã sẽ được hệ thống tự động tạo..."
      />
    </div>

    <div class="col-12">
      <label class="form-label fw-bold small">Tên giảm giá</label>
      <input
        :value="modelValue.tenPhieuGiamGia"
        @input="update('tenPhieuGiamGia', $event.target.value)"
        :disabled="disabled"
        type="text"
        class="form-control rounded-3"
      />
    </div>

    <div class="col-md-6">
      <label class="form-label fw-bold small">Hình thức giảm</label>
      <div class="d-flex gap-4 pt-1">
        <label>
          <input
            type="radio"
            :checked="modelValue.hinhThucGiam === false"
            @change="handleTypeChange(false)"
            :disabled="disabled"
          />
          VNĐ
        </label>
        <label>
          <input
            type="radio"
            :checked="modelValue.hinhThucGiam === true"
            @change="handleTypeChange(true)"
            :disabled="disabled"
          />
          %
        </label>
      </div>
    </div>

    <div class="col-md-6">
      <label class="form-label fw-bold small">Giá trị giảm ({{ modelValue.hinhThucGiam ? '%' : 'VNĐ' }})</label>

      <input
        v-if="modelValue.hinhThucGiam === true"
        :value="modelValue.giaTriGiamGia"
        @input="update('giaTriGiamGia', toNumber($event.target.value))"
        :disabled="disabled"
        type="number"
        class="form-control rounded-3"
        placeholder="1 - 100"
      />

      <input
        v-else
        :value="formatDisplay(modelValue.soTienGiamToiDa)"
        @input="handleMoneyInput('soTienGiamToiDa', $event.target.value)"
        :disabled="disabled"
        type="text"
        class="form-control rounded-3"
        placeholder="Nhập số tiền VNĐ"
      />
    </div>

    <div class="col-md-6">
      <div class="d-flex justify-content-between align-items-center">
        <label class="form-label fw-bold small mb-0">Số lượng sử dụng</label>

        <div class="form-check form-switch small">
          <input
            class="form-check-input"
            type="checkbox"
            :checked="isUnlimited"
            @change="handleUnlimitedChange"
            :disabled="disabled || modelValue.loaiPhieuGiamGia === true"
          />
          <label class="form-check-label">Vô hạn</label>
        </div>
      </div>

      <input
        :value="modelValue.loaiPhieuGiamGia === true ? '' : (isUnlimited ? '' : modelValue.soLuongSuDung)"
        @input="update('soLuongSuDung', toNumber($event.target.value))"
        :disabled="disabled || isUnlimited || modelValue.loaiPhieuGiamGia === true"
        type="number"
        class="form-control rounded-3 mt-2"
        :placeholder="modelValue.loaiPhieuGiamGia === true ? 'Số lượng theo khách hàng chọn' : (isUnlimited ? '∞ Không giới hạn' : 'Nhập số lượng')"
      />
    </div>

    <div class="col-md-6">
      <label class="form-label fw-bold small">Hóa đơn tối thiểu</label>
      <input
        :value="formatDisplay(modelValue.hoaDonToiThieu)"
        @input="handleMoneyInput('hoaDonToiThieu', $event.target.value)"
        :disabled="disabled"
        type="text"
        class="form-control rounded-3"
      />
    </div>

    <div class="col-md-6">
      <label class="form-label fw-bold small">Ngày bắt đầu</label>
      <input
        :value="modelValue.ngayBatDau"
        @input="update('ngayBatDau', $event.target.value)"
        :disabled="disabled"
        type="date"
        class="form-control rounded-3"
      />
    </div>

    <div class="col-md-6">
      <label class="form-label fw-bold small">Ngày kết thúc</label>
      <input
        :value="modelValue.ngayKetThuc"
        @input="update('ngayKetThuc', $event.target.value)"
        :disabled="disabled"
        type="date"
        class="form-control rounded-3"
      />
    </div>

    <div class="col-md-6">
      <label class="form-label fw-bold small">Loại phiếu</label>
      <div class="d-flex gap-4 pt-1">
        <label>
          <input
            type="radio"
            :checked="modelValue.loaiPhieuGiamGia === false"
            @change="handleLoaiPhieuChange(false)"
            :disabled="disabled"
          />
          Công khai
        </label>

        <label>
          <input
            type="radio"
            :checked="modelValue.loaiPhieuGiamGia === true"
            @change="handleLoaiPhieuChange(true)"
            :disabled="disabled"
          />
          Cá nhân
        </label>
      </div>
    </div>

    <div class="col-12 mt-2">
      <label class="form-label fw-bold small">Mô tả phiếu giảm giá</label>
      <textarea
        :value="modelValue.moTa"
        @input="update('moTa', $event.target.value)"
        :disabled="disabled"
        class="form-control rounded-4 ss-textarea"
        rows="3"
        placeholder="Nhập ghi chú hoặc điều kiện áp dụng phiếu..."
      ></textarea>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(["modelValue", "disabled", "isUnlimited"]);
const emit = defineEmits(["update:modelValue", "update:isUnlimited"]);

// ✅ parse number an toàn (tránh NaN)
const toNumber = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

// Hàm chuyển số thành chuỗi có dấu chấm để hiển thị
const formatDisplay = (val) => {
  if (val === undefined || val === null || val === "") return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Hàm xử lý khi người dùng gõ tiền: Xóa dấu chấm để lấy số nguyên
const handleMoneyInput = (key, rawValue) => {
  const numberValue = Number(String(rawValue || "").replace(/\./g, ""));
  update(key, Number.isFinite(numberValue) ? numberValue : 0);
};

const update = (key, value) => {
  let finalValue = value;

  if (key === "giaTriGiamGia" && props.modelValue.hinhThucGiam === true) {
    if (finalValue > 100) finalValue = 100;
  }

  if (["giaTriGiamGia", "soTienGiamToiDa", "soLuongSuDung", "hoaDonToiThieu"].includes(key) && finalValue < 0) {
    finalValue = 0;
  }

  emit("update:modelValue", { ...props.modelValue, [key]: finalValue });
};

const handleTypeChange = (isPercent) => {
  emit("update:modelValue", {
    ...props.modelValue,
    hinhThucGiam: isPercent,
    giaTriGiamGia: 0,
    soTienGiamToiDa: 0,
  });
};

const handleUnlimitedChange = (event) => {
  const checked = event.target.checked;
  emit("update:isUnlimited", checked);

  if (checked) update("soLuongSuDung", 999999);
  else update("soLuongSuDung", 0);
};

// ✅ QUAN TRỌNG: đổi công khai/cá nhân => reset các state liên quan số lượng
// - Tránh emit modelValue 2 lần (dễ bị overwrite / loop)
// - Nếu chọn "Cá nhân": tắt "vô hạn" + reset soLuongSuDung về 0 (UI), BE sẽ set theo list KH
const handleLoaiPhieuChange = (isCaNhan) => {
  const nextModel = {
    ...props.modelValue,
    loaiPhieuGiamGia: isCaNhan,
    ...(isCaNhan ? { soLuongSuDung: 0 } : {}),
  };

  emit("update:modelValue", nextModel);

  if (isCaNhan) {
    emit("update:isUnlimited", false);
  }
};
</script>

<style scoped>
.ss-input-readonly {
  background-color: #f8f9fa !important;
  border: 1px solid rgba(255, 77, 79, 0.1) !important;
  color: #6c757d;
  cursor: not-allowed;
}

.ss-textarea {
  border: 1px solid rgba(255, 77, 79, 0.2) !important;
  resize: none;
  transition: all 0.2s ease;
}

.ss-textarea:focus {
  border-color: #ff4d4f !important;
  box-shadow: 0 0 0 0.2rem rgba(255, 77, 79, 0.1) !important;
  outline: none;
}

.form-control:not(.ss-input-readonly) {
  border: 1px solid rgba(255, 77, 79, 0.2);
}
.form-control:focus {
  border-color: #ff4d4f;
  /* ✅ FIX TYPO: 0.2srem -> 0.2rem */
  box-shadow: 0 0 0 0.2rem rgba(255, 77, 79, 0.1);
}
</style>
