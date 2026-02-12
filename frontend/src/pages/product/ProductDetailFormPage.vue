<!-- File: src/pages/product/ProductDetailFormPage.vue -->
<template>
  <div class="ss-page ss-one-font">
    <!-- HEAD -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="ss-page-title">
        {{ isEdit ? "SỬA CHI TIẾT SẢN PHẨM" : "THÊM CHI TIẾT SẢN PHẨM" }}
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary ss-btn" @click="back" type="button">
          ← Quay lại danh sách
        </button>
      </div>
    </div>

    <!-- 2 CARD TRÊN -->
    <div class="row g-3">
      <!-- (1) THÔNG TIN SẢN PHẨM -->
      <div class="col-lg-6">
        <div class="ss-card ss-border p-3 h-100">
          <div class="ss-card-title">Thêm thông tin sản phẩm</div>

          <!-- ✅ Mã (đặt trước tên/sản phẩm) -->
          <div class="mb-3">
            <label class="form-label mb-1">Mã</label>
            <input class="form-control" :value="form.maSanPham || '(Tự sinh)'" disabled />
          </div>

          <!-- Sản phẩm -->
          <div class="mb-3">
            <label class="form-label mb-1">
              Sản phẩm
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>

            <!-- ✅ Combobox: vừa tìm vừa nhập + dấu X nằm trong input (đồng nhất các ô thuộc tính) -->
            <v-select
              v-model="selectedProduct"
              :options="productOptions"
              label="tenSanPham"
              placeholder="Chọn hoặc nhập tên sản phẩm..."
              taggable
              :clearable="true"
              :create-option="(label) => createTagOption(label, 'tenSanPham')"
              @option:created="onCreateProductTag"
            >
              <template #option="opt">
                <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                  <span>Thêm mới "{{ opt.tenSanPham }}"</span>
                  <small class="text-muted">Sản phẩm</small>
                </div>

                <!-- ✅ Mã trước tên -->
                <div v-else class="d-flex justify-content-between" style="gap:10px">
                  <span class="text-truncate">{{ opt.maSanPham ?? opt.ma }}</span>
                  <small class="text-muted">{{ opt.tenSanPham ?? opt.ten }}</small>
                </div>
              </template>

              <!-- ✅ Mã trước tên -->
              <template #selected-option="opt">
                <span>
                  {{ (opt.maSanPham ?? opt.ma) ? (opt.maSanPham ?? opt.ma) + " - " : "" }}
                  {{ opt.tenSanPham ?? opt.ten }}
                </span>
              </template>
            </v-select>

            <div v-if="errors.sanPham" class="ss-err">{{ errors.sanPham }}</div>
          </div>

          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label">
                Thương hiệu
                <span class="ss-required" :title="requiredTooltip">*</span>
              </label>
              <v-select
                v-model="selectedThuongHieu"
                :options="thuongHieuOptions"
                label="tenThuongHieu"
                placeholder="Chọn hoặc nhập thương hiệu..."
                taggable
                :clearable="true"
                :create-option="(label) => createTagOption(label, 'tenThuongHieu')"
                @option:created="(opt) => onCreateRef('thuongHieu', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                    <span>Thêm mới "{{ opt.tenThuongHieu ?? opt.ten }}"</span>
                    <small class="text-muted">Thương hiệu</small>
                  </div>
                  <div v-else class="d-flex justify-content-between" style="gap:10px">
                    <span class="text-truncate">{{ opt.tenThuongHieu ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maThuongHieu ?? opt.ma }}</small>
                  </div>
                </template>
              </v-select>
              <div v-if="errors.thuongHieu" class="ss-err">{{ errors.thuongHieu }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Xuất xứ</label>
              <v-select
                v-model="selectedXuatXu"
                :options="xuatXuOptions"
                label="tenXuatXu"
                placeholder="Chọn hoặc nhập xuất xứ..."
                taggable
                :clearable="true"
                :create-option="(label) => createTagOption(label, 'tenXuatXu')"
                @option:created="(opt) => onCreateRef('xuatXu', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                    <span>Thêm mới "{{ opt.tenXuatXu ?? opt.ten }}"</span>
                    <small class="text-muted">Xuất xứ</small>
                  </div>
                  <div v-else class="d-flex justify-content-between" style="gap:10px">
                    <span class="text-truncate">{{ opt.tenXuatXu ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maXuatXu ?? opt.ma }}</small>
                  </div>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Cổ giày</label>
              <v-select
                v-model="selectedCoGiay"
                :options="coGiayOptions"
                label="tenCoGiay"
                placeholder="Chọn hoặc nhập cổ giày..."
                taggable
                :clearable="true"
                :create-option="(label) => createTagOption(label, 'tenCoGiay')"
                @option:created="(opt) => onCreateRef('coGiay', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                    <span>Thêm mới "{{ opt.tenCoGiay ?? opt.ten }}"</span>
                    <small class="text-muted">Cổ giày</small>
                  </div>
                  <div v-else class="d-flex justify-content-between" style="gap:10px">
                    <span class="text-truncate">{{ opt.tenCoGiay ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maCoGiay ?? opt.ma }}</small>
                  </div>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Chất liệu</label>
              <v-select
                v-model="selectedChatLieu"
                :options="chatLieuOptions"
                label="tenChatLieu"
                placeholder="Chọn hoặc nhập chất liệu..."
                taggable
                :clearable="true"
                :create-option="(label) => createTagOption(label, 'vtenChatLieu')"
                @option:created="(opt) => onCreateRef('chatLieu', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                    <span>Thêm mới "{{ opt.tenChatLieu ?? opt.ten }}"</span>
                    <small class="text-muted">Chất liệu</small>
                  </div>
                  <div v-else class="d-flex justify-content-between" style="gap:10px">
                    <span class="text-truncate">{{ opt.tenChatLieu ?? opt.ten }}</span>
                    <small class="text-muted">{{ opt.maChatLieu ?? opt.ma }}</small>
                  </div>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Vị trí thi đấu</label>
              <v-select
                v-model="selectedViTriThiDau"
                :options="viTriThiDauOptions"
                :get-option-label="(o) => pickLabel(o, ['tenViTri','tenViTriThiDau','ten_vi_tri_thi_dau','ten','name'])"
                placeholder="Chọn hoặc nhập vị trí..."
                taggable
                :taggable="false"
                :clearable="true"
                :create-option="(label) => createTagOption(label, 'tenViTri')"
                @option:created="(opt) => onCreateRef('viTriThiDau', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                    <span>Thêm mới "{{ pickLabel(opt, ['tenViTri','tenViTriThiDau','ten_vi_tri_thi_dau','ten','name']) }}"</span>
                    <small class="text-muted">Vị trí</small>
                  </div>
                  <div v-else class="d-flex justify-content-between" style="gap:10px">
                    <span class="text-truncate">{{ pickLabel(opt, ['tenViTri','tenViTriThiDau','ten_vi_tri_thi_dau','ten','name']) }}</span>
                    <small class="text-muted">{{ opt.maViTri ?? opt.ma ?? '' }}</small>
                  </div>
                </template>
                <template #selected-option="opt">
                  <span>{{ pickLabel(opt, ['tenViTri','tenViTriThiDau','ten_vi_tri_thi_dau','ten','name']) }}</span>
                </template>
              </v-select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Phong cách chơi</label>
              <v-select
                v-model="selectedPhongCachChoi"
                :options="phongCachChoiOptions"
                :get-option-label="(o) => pickLabel(o, ['tenPhongCach','tenPhongCachChoi','ten_phong_cach_choi','ten','name'])"
                placeholder="Chọn hoặc nhập phong cách..."
                taggable
                :taggable="false"
                :clearable="true"
                :create-option="(label) => createTagOption(label, 'tenPhongCach')"
                @option:created="(opt) => onCreateRef('phongCachChoi', opt)"
              >
                <template #option="opt">
                  <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                    <span>Thêm mới "{{ pickLabel(opt, ['tenPhongCach','tenPhongCachChoi','ten_phong_cach_choi','ten','name']) }}"</span>
                    <small class="text-muted">Phong cách</small>
                  </div>
                  <div v-else class="d-flex justify-content-between" style="gap:10px">
                    <span class="text-truncate">{{ pickLabel(opt, ['tenPhongCach','tenPhongCachChoi','ten_phong_cach_choi','ten','name']) }}</span>
                    <small class="text-muted">{{ opt.maPhongCach ?? opt.ma ?? '' }}</small>
                  </div>
                </template>
                <template #selected-option="opt">
                  <span>{{ pickLabel(opt, ['tenPhongCach','tenPhongCachChoi','ten_phong_cach_choi','ten','name']) }}</span>
                </template>
              </v-select>
            </div>

            <div class="col-12">
              <label class="form-label">Mô tả ngắn</label>
              <textarea class="form-control" rows="3" v-model="form.moTaNgan" />
            </div>
          </div>
        </div>
      </div>

      <!-- (2) BIẾN THỂ -->
      <div class="col-lg-6">
        <div class="ss-card ss-border p-3 h-100">
          <div class="ss-card-title">Biến thể sản phẩm</div>

          <!-- Màu sắc -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">
                Màu sắc
                <span class="ss-required" :title="requiredTooltip">*</span>
              </label>
              <button class="btn btn-outline-secondary ss-btn-sm" type="button" @click="openAddColor" :disabled="loading">
                Thêm màu
              </button>
            </div>

            <!-- ✅ bỏ phần chip hiển thị thừa, chỉ còn 1 nơi hiển thị trong v-select -->

            <v-select
              v-model="selectedMauSac"
              :options="mauSacOptions"
              label="tenMauSac"
              placeholder="Chọn màu..."
              multiple
              :clearable="true"
              :close-on-select="false"
            >
              <template #option="opt">
                <div class="d-flex align-items-center justify-content-between" style="gap:10px">
                  <div class="d-flex align-items-center" style="gap:10px;min-width:0">
                    <span
                      class="ss-color-dot"
                      :style="{
                        background: pickColorHex(opt),
                        borderColor: isLight(pickColorHex(opt)) ? 'rgba(17,24,39,0.25)' : 'transparent'
                      }"
                    />
                    <span class="text-truncate">{{ opt.tenMauSac ?? opt.ten }}</span>
                  </div>
                  <small class="text-muted">{{ opt.maMauSac ?? opt.ma }}</small>
                </div>
              </template>

              <!-- ✅ luôn có chấm màu cạnh tên (trong tag đã chọn) -->
              <template #selected-option="opt">
                <span class="d-inline-flex align-items-center" style="gap:8px">
                  <span
                    class="ss-color-dot"
                    :style="{
                      background: pickColorHex(opt),
                      borderColor: isLight(pickColorHex(opt)) ? 'rgba(17,24,39,0.25)' : 'transparent'
                    }"
                  />
                  <span>{{ opt.tenMauSac ?? opt.ten }}</span>
                </span>
              </template>
            </v-select>

            <div v-if="errors.mauSac" class="ss-err">{{ errors.mauSac }}</div>
          </div>

          <!-- Kích cỡ -->
          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between">
              <label class="form-label mb-1">
                Kích cỡ
                <span class="ss-required" :title="requiredTooltip">*</span>
              </label>
            </div>
            <div class="ss-size-line">
              <button class="btn btn-outline-secondary ss-btn-sm" type="button" @click="openSizeModal" :disabled="loading">
                Chọn kích cỡ
              </button>
              <div class="ss-chip-wrap" v-if="selectedKichThuoc?.length">
                <div v-for="s in selectedKichThuoc" :key="s.id" class="ss-chip ss-chip-sm">
                  <span class="ss-chip-text">{{ pickTen(s, 'tenKichThuoc', 'maKichThuoc') }}</span>
                  <button class="ss-chip-x" type="button" @click="removeSelectedSize(s)" title="Bỏ size">
                    <span class="material-icons-outlined">close</span>
                  </button>
                </div>
              </div>
              
            </div>
            <div v-if="errors.kichThuoc" class="ss-err">{{ errors.kichThuoc }}</div>
          </div>
          <!-- Loại sân -->
          <div class="mb-3">
            <label class="form-label mb-1">
              Loại sân
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <v-select
              v-model="selectedLoaiSan"
              :options="loaiSanOptions"
              label="tenLoaiSan"
              placeholder="Chọn hoặc nhập loại sân..."
              multiple
              taggable
              :clearable="true"
              :create-option="(label) => createTagOption(label, 'tenLoaiSan')"
              @option:created="(opt) => onCreateRef('loaiSan', opt)"
            >
              <template #option="opt">
                <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                  <span>Thêm mới "{{ opt.tenLoaiSan ?? opt.ten }}"</span>
                  <small class="text-muted">Loại sân</small>
                </div>
                <div v-else class="d-flex justify-content-between" style="gap:10px">
                  <span class="text-truncate">{{ opt.tenLoaiSan ?? opt.ten }}</span>
                  <small class="text-muted">{{ opt.maLoaiSan ?? opt.ma }}</small>
                </div>
              </template>
            </v-select>
            <div v-if="errors.loaiSan" class="ss-err">{{ errors.loaiSan }}</div>
          </div>

          <!-- Form chân -->
          <div class="mb-3">
            <label class="form-label mb-1">
              Form chân
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <v-select
              v-model="selectedFormChan"
              :options="formChanOptions"
              label="tenFormChan"
              placeholder="Chọn hoặc nhập form chân..."
              multiple
              taggable
              :clearable="true"
              :create-option="(label) => createTagOption(label, 'tenFormChan')"
              @option:created="(opt) => onCreateRef('formChan', opt)"
            >
              <template #option="opt">
                <div v-if="opt.__isNew" class="d-flex align-items-center justify-content-between">
                  <span>Thêm mới "{{ opt.tenFormChan ?? opt.ten }}"</span>
                  <small class="text-muted">Form chân</small>
                </div>
                <div v-else class="d-flex justify-content-between" style="gap:10px">
                  <span class="text-truncate">{{ opt.tenFormChan ?? opt.ten }}</span>
                  <small class="text-muted">{{ opt.maFormChan ?? opt.ma }}</small>
                </div>
              </template>
            </v-select>
            <div v-if="errors.formChan" class="ss-err">{{ errors.formChan }}</div>
          </div>

          <button class="btn btn-primary ss-btn ss-generate" type="button" @click="generateVariants" :disabled="loading">
            Tạo biến thể tự động
          </button>
        </div>
      </div>
    </div>

    <!-- (3) DANH SÁCH BIẾN THỂ -->
    <div class="ss-card ss-border p-0 mt-3">
      <div class="ss-variant-bar">
        <div class="ss-bar-left">
          <span class="material-icons-outlined ss-bar-ic">grid_view</span>
          <span>Danh sách biến thể</span>
        </div>
        <div class="ss-bar-right">
          <button class="btn ss-bar-btn ss-bar-btn-dark" type="button" @click="openBulkAll" :disabled="!rows.length || loading">
            <span class="material-icons-outlined">bolt</span>
            <span>Thêm nhanh tất cả</span>
          </button>
          <button class="btn ss-bar-btn ss-bar-btn-danger" type="button" @click="clearAllVariants" :disabled="!rows.length || loading">
            <span class="material-icons-outlined">delete_outline</span>
            <span>Xóa tất cả</span>
          </button>
        </div>
      </div>

      <div class="p-3" v-if="!rows.length">
        <div class="ss-empty">Chưa có biến thể nào</div>
      </div>

      <div class="p-3" v-else>
        <!-- Group theo màu -->
        <div v-for="g in groupedRows" :key="g.groupKey" class="ss-color-group">
          <div class="ss-color-header">
            <div class="d-flex align-items-center gap-2" style="min-width:0">
              <span
                class="ss-dot"
                :style="{ background: g.colorHex, borderColor: isLight(g.colorHex) ? 'rgba(17,24,39,0.20)' : 'transparent' }"
              ></span>
              <span class="text-truncate">{{ g.colorName }}</span>
              <span class="ss-muted">({{ g.items.length }} biến thể)</span>
            </div>
            <button class="btn ss-bar-btn ss-bar-btn-dark" type="button" @click="openBulkColor(g)" :disabled="loading">
              <span class="material-icons-outlined">bolt</span>
              <span>Thêm nhanh</span>
            </button>
          </div>

          <div class="table-responsive">
            <table class="table ss-table-lite align-middle mb-0">
              <thead>
                <tr>
                  <th style="min-width:320px">Kích cỡ</th>
                  <th style="min-width:240px">Số lượng</th>
                  <th style="min-width:260px">Giá bán (VNĐ)</th>
                  <th style="width:90px" class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in g.items" :key="r.key">
                  <td>
                    <div class="ss-line">
                      <span>{{ r.labelKichThuoc }}</span>
                      <span class="ss-muted">•</span>
                      <span class="ss-muted">{{ r.labelLoaiSan }}</span>
                      <span class="ss-muted">•</span>
                      <span class="ss-muted">{{ r.labelFormChan }}</span>
                    </div>
                  </td>
                  <td>
                    <input
                      :value="fmtNumberInput(r.soLuong)"
                      type="text"
                      inputmode="numeric"
                      class="form-control"
                      placeholder="Nhập số lượng"
                      @input="(e) => onNumberInputRow(r, 'soLuong', e)"
                      @blur="() => validateRow(r)"
                    />
                    <div v-if="r.errSoLuong" class="ss-err">{{ r.errSoLuong }}</div>
                  </td>
                  <td>
                    <input
                      :value="fmtNumberInput(r.gia)"
                      type="text"
                      inputmode="numeric"
                      class="form-control"
                      placeholder="Nhập giá bán"
                      @input="(e) => onNumberInputRow(r, 'gia', e)"
                      @blur="() => validateRow(r)"
                    />
                    <div v-if="r.errGia" class="ss-err">{{ r.errGia }}</div>
                  </td>
                  <td class="text-center">
                    <button class="btn ss-del" type="button" title="Xóa" @click="removeRow(r)" :disabled="loading">
                      <span class="material-icons-outlined">delete_outline</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Ảnh theo màu sắc -->
        <div class="ss-image-block ss-image-block-bottom">
          <div class="ss-image-title">
            <span class="material-icons-outlined">image</span>
            <span>Ảnh theo màu sắc</span>
          </div>
          <div class="ss-image-grid">
            <div v-for="c in selectedMauSac" :key="c.id" class="ss-image-card">
              <div class="ss-image-head">
                <div class="d-flex align-items-center gap-2" style="min-width:0">
                  <span
                    class="ss-dot"
                    :style="{
                      background: pickColorHex(c),
                      borderColor: isLight(pickColorHex(c)) ? 'rgba(17,24,39,0.20)' : 'transparent'
                    }"
                  ></span>
                  <span class="text-truncate">{{ pickTen(c, 'tenMauSac', 'maMauSac') }}</span>
                </div>
                <button
                  v-if="colorFiles[String(c.id)]?.file"
                  class="btn ss-img-x"
                  type="button"
                  title="Bỏ ảnh"
                  @click="clearColorImage(String(c.id))"
                >
                  <span class="material-icons-outlined">close</span>
                </button>
              </div>
              <div class="ss-image-preview">
                <img
                  v-if="colorFiles[String(c.id)]?.previewUrl"
                  :src="colorFiles[String(c.id)].previewUrl"
                  alt="preview"
                />
                <div v-else class="ss-image-empty">
                  <span class="material-icons-outlined">image</span>
                  <div>Chưa có ảnh</div>
                </div>
              </div>
              <input
                class="d-none"
                type="file"
                :id="`file-ms-${c.id}`"
                accept="image/*"
                @change="(e) => onColorFileChange(e, { groupKey: String(c.id) })"
              />
              <button
                class="btn btn-outline-secondary ss-img-btn"
                type="button"
                @click="triggerColorFile(String(c.id))"
                :disabled="loading"
              >
                Thêm ảnh {{ pickTen(c, 'tenMauSac', 'maMauSac') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="ss-footer-actions">
        <button class="btn btn-outline-secondary ss-btn" type="button" @click="back" :disabled="loading">
          Hủy bỏ
        </button>
        <button class="btn btn-primary ss-btn" type="button" :disabled="loading" @click="openConfirm">
          {{ isEdit ? "Lưu chi tiết sản phẩm" : "Thêm chi tiết sản phẩm" }}
        </button>
      </div>
    </div>

    <!-- ✅ MODAL: CHỌN KÍCH CỠ 38-45 (1 ô input + chọn nhanh) -->
    <div v-if="sizeModal.open" class="ss-overlay" @click.self="closeSizeModal">
      <div class="ss-modal">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Chọn kích cỡ</div>
        </div>

        <div class="ss-modal-body">
          <!-- ✅ 1 ô input (combobox) giống ảnh: chọn + tìm -->
          <div class="ss-size-select">
            <v-select
              v-model="sizeModal.tempSelected"
              :options="sizeModal.options"
              :get-option-label="(o) => pickTen(o, 'tenKichThuoc', 'maKichThuoc')"
              placeholder="Chọn hoặc tìm kích cỡ (38 - 45)..."
              multiple
              :clearable="true"
              :close-on-select="false"
              @search="onSizeModalSearch"
            >
              <template #option="opt">
                <span>{{ pickTen(opt, "tenKichThuoc", "maKichThuoc") }}</span>
              </template>
              <template #selected-option="opt">
                <span>{{ pickTen(opt, "tenKichThuoc", "maKichThuoc") }}</span>
              </template>
            </v-select>
          </div>

          <!-- ✅ vẫn giữ chọn nhanh -->
          <div class="ss-size-grid mt-3">
            <button
              v-for="s in sizeModalFilteredOptions"
              :key="s.id"
              class="ss-size-item"
              type="button"
              :class="{ active: sizeModalTempIds.has(s.id) }"
              @click="toggleSizeTemp(s.id)"
            >
              {{ pickTen(s, "tenKichThuoc", "maKichThuoc") }}
            </button>
          </div>

          <div v-if="!sizeModalFilteredOptions.length" class="ss-size-empty">
            Không có kết quả phù hợp
          </div>
        </div>

        <div class="ss-modal-foot">
          <button class="btn btn-outline-secondary ss-btn" type="button" @click="closeSizeModal">
            Hủy bỏ
          </button>
          <button class="btn btn-primary ss-btn" type="button" @click="confirmSizeModal">
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: THÊM MÀU -->
    <div v-if="addColor.open" class="ss-overlay" @click.self="closeAddColor">
      <div class="ss-modal">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Thêm màu</div>
        </div>
        <div class="ss-modal-body">
          <div class="mb-3">
            <label class="form-label">
              Tên màu
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <input v-model="addColor.ten" class="form-control" placeholder="Ví dụ: Đỏ, Trắng, Xanh lá..." />
          </div>

          <!-- ✅ không phải nhập tay HEX nữa: chỉ chọn bằng color picker -->
          <div class="mb-2">
            <label class="form-label">Chọn màu</label>
            <div class="d-flex align-items-center gap-2">
              <input v-model="addColor.hex" type="color" class="form-control form-control-color" />
              <div class="ss-muted">{{ addColor.hex }}</div>
            </div>
          </div>

          <div v-if="addColor.err" class="ss-err">{{ addColor.err }}</div>
        </div>
        <div class="ss-modal-foot">
          <button class="btn btn-outline-secondary ss-btn" type="button" @click="closeAddColor">
            Hủy bỏ
          </button>
          <button class="btn btn-primary ss-btn" type="button" @click="confirmAddColor" :disabled="loading">
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: THÊM NHANH TẤT CẢ -->
    <div v-if="bulkAll.open" class="ss-overlay" @click.self="closeBulkAll">
      <div class="ss-modal">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Thêm nhanh tất cả biến thể</div>
        </div>
        <div class="ss-modal-body">
          <div class="ss-bulk-preview">
            <div class="ss-bulk-line">
              <span class="ss-muted">Màu:</span>
              <div class="ss-chip-wrap ss-chip-wrap-sm">
                <div v-for="c in selectedMauSac" :key="c.id" class="ss-chip ss-chip-sm">
                  <span
                    class="ss-dot"
                    :style="{
                      background: pickColorHex(c),
                      borderColor: isLight(pickColorHex(c)) ? 'rgba(17,24,39,0.20)' : 'transparent'
                    }"
                  ></span>
                  <span class="ss-chip-text">{{ pickTen(c, "tenMauSac", "maMauSac") }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">
              Số lượng
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <input
              :value="fmtNumberInput(bulkAll.soLuong)"
              type="text"
              inputmode="numeric"
              class="form-control"
              placeholder="Nhập số lượng chung..."
              @input="(e) => onNumberInputBulk(bulkAll, 'soLuong', e)"
            />
          </div>
          <div class="mb-2">
            <label class="form-label">
              Giá bán
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <input
              :value="fmtNumberInput(bulkAll.gia)"
              type="text"
              inputmode="numeric"
              class="form-control"
              placeholder="Nhập giá bán chung..."
              @input="(e) => onNumberInputBulk(bulkAll, 'gia', e)"
            />
          </div>
          <div v-if="bulkAll.err" class="ss-err">{{ bulkAll.err }}</div>
        </div>
        <div class="ss-modal-foot">
          <button class="btn btn-outline-secondary ss-btn" type="button" @click="closeBulkAll">
            Hủy bỏ
          </button>
          <button class="btn btn-primary ss-btn" type="button" @click="applyBulkAll" :disabled="loading">
            Áp dụng
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: THÊM NHANH THEO MÀU -->
    <div v-if="bulkColor.open" class="ss-overlay" @click.self="closeBulkColor">
      <div class="ss-modal">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Thêm nhanh: {{ bulkColor.colorName }}</div>
        </div>
        <div class="ss-modal-body">
          <div class="ss-bulk-preview">
            <div class="ss-bulk-line">
              <span class="ss-muted">Màu:</span>
              <div class="ss-chip-wrap ss-chip-wrap-sm">
                <div class="ss-chip ss-chip-sm">
                  <span
                    class="ss-dot"
                    :style="{
                      background: bulkColor.colorHex,
                      borderColor: isLight(bulkColor.colorHex) ? 'rgba(17,24,39,0.20)' : 'transparent'
                    }"
                  ></span>
                  <span class="ss-chip-text">{{ bulkColor.colorName }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">
              Số lượng
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <input
              :value="fmtNumberInput(bulkColor.soLuong)"
              type="text"
              inputmode="numeric"
              class="form-control"
              placeholder="Nhập số lượng chung..."
              @input="(e) => onNumberInputBulk(bulkColor, 'soLuong', e)"
            />
          </div>
          <div class="mb-2">
            <label class="form-label">
              Giá bán
              <span class="ss-required" :title="requiredTooltip">*</span>
            </label>
            <input
              :value="fmtNumberInput(bulkColor.gia)"
              type="text"
              inputmode="numeric"
              class="form-control"
              placeholder="Nhập giá bán chung..."
              @input="(e) => onNumberInputBulk(bulkColor, 'gia', e)"
            />
          </div>
          <div class="ss-muted">Áp dụng cho tất cả biến thể thuộc màu này.</div>
          <div v-if="bulkColor.err" class="ss-err mt-2">{{ bulkColor.err }}</div>
        </div>
        <div class="ss-modal-foot">
          <button class="btn btn-outline-secondary ss-btn" type="button" @click="closeBulkColor">
            Hủy bỏ
          </button>
          <button class="btn btn-primary ss-btn" type="button" @click="applyBulkColor" :disabled="loading">
            Áp dụng
          </button>
        </div>
      </div>
    </div>

    <!-- CONFIRM POPUP -->
    <div v-if="confirm.open" class="ss-overlay" @click.self="closeConfirm">
      <div class="ss-confirm">
        <div class="ss-confirm-header">
          <div class="ss-confirm-title">Xác nhận</div>
        </div>
        <div class="ss-confirm-body">
          <div class="ss-confirm-text">
            Bạn có chắc chắn muốn {{ isEdit ? "cập nhật" : "thêm mới" }} chi tiết sản phẩm cho "{{ confirmProductName }}" không?
          </div>
          <div class="ss-confirm-sub">
            <template v-if="isEdit">
              Chi tiết sản phẩm sẽ được cập nhật theo dữ liệu bạn vừa chỉnh sửa.
            </template>
            <template v-else>
              Sẽ tạo {{ confirmCount }} biến thể chi tiết sản phẩm.
            </template>
          </div>
        </div>
        <div class="ss-confirm-footer">
          <button class="btn btn-outline-secondary ss-btn" type="button" :disabled="loading" @click="closeConfirm">
            Hủy bỏ
          </button>
          <button class="btn btn-primary ss-btn" type="button" :disabled="loading" @click="confirmSubmit">
            {{ loading ? "Đang lưu..." : "Xác nhận" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import productService from "@/services/productService";
import productDetailService from "@/services/productDetailService";
import anhChiTietSanPhamService from "@/services/anhChiTietSanPhamService";
import { refDataService } from "@/services/refDataService";

const primeToast = useToast();
const requiredTooltip = "Trường bắt buộc";

function toastSuccess(detail) {
  primeToast.add({ severity: "success", summary: "Thành công", detail, life: 3000 });
}
function toastError(detail) {
  primeToast.add({ severity: "error", summary: "Thất bại", detail, life: 3500 });
}
function toastInfo(detail) {
  primeToast.add({ severity: "info", summary: "Thông báo", detail, life: 3000 });
}
function stopWithError(msg) {
  toastError(msg);
  return false;
}

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params?.id);
const isEdit = computed(() => !!id.value && String(id.value).toLowerCase() !== "new");
const productIdQuery = computed(() => {
  const v = route.query?.productId;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
});

// ====== OPTIONS ======
const loading = ref(false);
const productOptions = ref([]);
const thuongHieuOptions = ref([]);
const xuatXuOptions = ref([]);
const coGiayOptions = ref([]);
const chatLieuOptions = ref([]);
const viTriThiDauOptions = ref([]);
const phongCachChoiOptions = ref([]);
const mauSacOptions = ref([]);
const kichThuocOptions = ref([]);
const loaiSanOptions = ref([]);
const formChanOptions = ref([]);

// ====== FORM ======
const form = reactive({
  idSanPham: null,
  maSanPham: "",
  tenSanPham: "",
  moTaNgan: "",
});

// ===== chọn thuộc tính sản phẩm =====
const selectedThuongHieu = ref(null);
const selectedXuatXu = ref(null);
const selectedCoGiay = ref(null);
const selectedChatLieu = ref(null);
const selectedViTriThiDau = ref(null);
const selectedPhongCachChoi = ref(null);

// ===== biến thể =====
const selectedMauSac = ref([]);
const selectedKichThuoc = ref([]);
const selectedLoaiSan = ref([]);
const selectedFormChan = ref([]);

// ====== errors =====
const errors = reactive({
  sanPham: "",
  thuongHieu: "",
  mauSac: "",
  kichThuoc: "",
  loaiSan: "",
  formChan: "",
});

// ===== confirm state =====
const confirm = reactive({ open: false });
const confirmProductName = computed(() => String(form.tenSanPham || "").trim() || "(chưa đặt tên)");
const confirmCount = computed(() => (rows.value || []).length || 0);

function openConfirm() {
  if (loading.value) return;
  if (!validateRequiredTop()) return;
  if (!rows.value.length) return stopWithError('Bạn chưa tạo biến thể. Hãy bấm “Tạo biến thể tự động”.');
  const bad = rows.value.find((r) => !isValidNonNeg(r.soLuong) || !isValidNonNeg(r.gia));
  if (bad) return stopWithError("Vui lòng nhập Số lượng/Giá hợp lệ (>= 0) cho tất cả biến thể.");
  confirm.open = true;
}

function closeConfirm() {
  confirm.open = false;
}

async function confirmSubmit() {
  confirm.open = false;
  await submitReal();
}

// ===== helpers =====
function normalizeArr(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  return [];
}

function createTagOption(label, field) {
  const name = String(label ?? "").trim();
  return { __isNew: true, [field]: name, ten: name };
}

function lc(s) {
  return String(s ?? "").trim().toLowerCase();
}

function pickTen(obj, tenField, maField) {
  return obj?.[tenField] ?? obj?.ten ?? obj?.[maField] ?? obj?.ma ?? obj?.id;
}

function pickLabel(opt, keys = []) {
  if (!opt) return "";
  for (const k of keys) {
    const v = opt?.[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function parseVnNumber(v) {
  const s = String(v ?? "");
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return NaN;
  const n = Number(digits);
  return Number.isFinite(n) ? n : NaN;
}

function isValidNonNeg(v) {
  const n = parseVnNumber(v);
  return Number.isFinite(n) && n >= 0;
}

function fmtNumberInput(v) {
  const n = parseVnNumber(v);
  if (!Number.isFinite(n)) return String(v ?? "");
  try {
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

function onNumberInputRow(row, field, e) {
  const raw = String(e?.target?.value ?? "");
  row[field] = raw.replace(/[^\d]/g, "");
}

function onNumberInputBulk(obj, field, e) {
  const raw = String(e?.target?.value ?? "");
  obj[field] = raw.replace(/[^\d]/g, "");
}

function asHexColor(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s;
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s}`;
  return "";
}

function extractColorHex(m) {
  const candidates = [
    m?.maMau, m?.ma_mau, m?.maHex, m?.ma_hex, m?.hex, m?.hexCode, m?.hex_code,
    m?.giaTri, m?.gia_tri, m?.color, m?.colorHex, m?.color_hex,
    m?.mauHex, m?.mau_hex, m?.maMauHex, m?.ma_mau_hex, m?.giaTriHex, m?.gia_tri_hex,
  ];
  for (const c of candidates) {
    const hex = asHexColor(c);
    if (hex) return hex;
  }
  return "";
}

function pickColorHex(m) {
  const stored = extractColorHex(m);
  if (stored) return stored;

  const name = (m?.tenMauSac || m?.ten || "").toLowerCase().trim();
  if (name.includes("trắng") || name.includes("trang") || name.includes("white")) return "#ffffff";
  if (name.includes("đen") || name.includes("den") || name.includes("black")) return "#111827";
  if (name.includes("hồng") || name.includes("hong") || name.includes("pink") || name.includes("rose")) return "#fb7185";
  if (name.includes("tím") || name.includes("tim") || name.includes("purple")) return "#a855f7";
  if (name.includes("xanh lá") || name.includes("xanh la") || name.includes("green")) return "#22c55e";
  if (name.includes("xanh dương") || name.includes("xanh duong") || name.includes("blue")) return "#2563eb";
  if (name.includes("xanh da trời") || name.includes("xanh da troi") || name.includes("sky")) return "#38bdf8";
  if (name.includes("xanh")) return "#2563eb";
  if (name.includes("đỏ") || name.includes("do") || name.includes("red")) return "#ff4d4f";
  if (name.includes("vàng") || name.includes("vang") || name.includes("yellow")) return "#f59e0b";
  return "#e5e7eb";
}

function isLight(hex) {
  try {
    const h = String(hex || "").replace("#", "");
    if (h.length < 6) return false;
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 200;
  } catch {
    return false;
  }
}

function pickIdFrom(obj, keys = []) {
  for (const k of keys) {
    const v = obj?.[k];
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function setSelectedById(optionsRef, selectedRef, idValue) {
  const idNum = Number(idValue);
  if (!Number.isFinite(idNum) || idNum <= 0) return;
  const found = (optionsRef.value || []).find((x) => Number(x?.id) === idNum) || null;
  if (found) selectedRef.value = found;
}

function syncAttributesFromProduct(p) {
  if (!p) return;
  const idThuongHieu = pickIdFrom(p, ["idThuongHieu", "thuongHieuId", "id_thuong_hieu"]);
  const idXuatXu = pickIdFrom(p, ["idXuatXu", "xuatXuId", "id_xuat_xu"]);
  const idCoGiay = pickIdFrom(p, ["idCoGiay", "coGiayId", "id_co_giay"]);
  const idChatLieu = pickIdFrom(p, ["idChatLieu", "chatLieuId", "id_chat_lieu"]);
  const idViTriThiDau = pickIdFrom(p, ["idViTriThiDau", "viTriThiDauId", "id_vi_tri_thi_dau"]);
  const idPhongCachChoi = pickIdFrom(p, ["idPhongCachChoi", "phongCachChoiId", "id_phong_cach_choi"]);
  setSelectedById(thuongHieuOptions, selectedThuongHieu, idThuongHieu);
  setSelectedById(xuatXuOptions, selectedXuatXu, idXuatXu);
  setSelectedById(coGiayOptions, selectedCoGiay, idCoGiay);
  setSelectedById(chatLieuOptions, selectedChatLieu, idChatLieu);
  setSelectedById(viTriThiDauOptions, selectedViTriThiDau, idViTriThiDau);
  setSelectedById(phongCachChoiOptions, selectedPhongCachChoi, idPhongCachChoi);
}

// ===== PRODUCT SELECT =====
const selectedProduct = computed({
  get() {
    if (!form.idSanPham && String(form.tenSanPham || "").trim()) {
      return { __isNew: true, tenSanPham: form.tenSanPham };
    }
    return productOptions.value.find((x) => x.id === form.idSanPham) || null;
  },
  set(val) {
    if (!val) {
      resetProduct();
      return;
    }
    if (!val.__isNew) {
      form.idSanPham = val.id ?? null;
      form.maSanPham = val.maSanPham ?? val.ma ?? "";
      form.tenSanPham = val.tenSanPham ?? val.ten ?? "";
      form.moTaNgan = val.moTaNgan ?? val.moTa ?? "";
      syncAttributesFromProduct(val);
      clearVariantsOnly();
      return;
    }
    form.idSanPham = null;
    form.maSanPham = "";
    form.tenSanPham = val.tenSanPham ?? val.ten ?? "";
    applyDefaultProductAttributes();
    clearVariantsOnly();
  },
});

function onCreateProductTag() {}

function resetProduct() {
  form.idSanPham = null;
  form.maSanPham = "";
  form.tenSanPham = "";
  form.moTaNgan = "";
  selectedThuongHieu.value = null;
  selectedXuatXu.value = null;
  selectedCoGiay.value = null;
  selectedChatLieu.value = null;
  selectedViTriThiDau.value = null;
  selectedPhongCachChoi.value = null;
  applyDefaultProductAttributes();
  clearVariantsOnly();
  clearErrors();
}

function applyDefaultProductAttributes() {
  if (!selectedThuongHieu.value && thuongHieuOptions.value.length) selectedThuongHieu.value = thuongHieuOptions.value[0];
  if (!selectedXuatXu.value && xuatXuOptions.value.length) selectedXuatXu.value = xuatXuOptions.value[0];
  if (!selectedCoGiay.value && coGiayOptions.value.length) selectedCoGiay.value = coGiayOptions.value[0];
  if (!selectedChatLieu.value && chatLieuOptions.value.length) selectedChatLieu.value = chatLieuOptions.value[0];
  if (!selectedViTriThiDau.value && viTriThiDauOptions.value.length) selectedViTriThiDau.value = viTriThiDauOptions.value[0];
  if (!selectedPhongCachChoi.value && phongCachChoiOptions.value.length) selectedPhongCachChoi.value = phongCachChoiOptions.value[0];
}

// ======= CREATE REF =======
const _creatingRefKey = new Set();

function _lockCreate(key, name) {
  const token = `${key}:${lc(name)}`;
  if (_creatingRefKey.has(token)) return false;
  _creatingRefKey.add(token);
  return token;
}

function _unlockCreate(token) {
  if (token) _creatingRefKey.delete(token);
}

const refConfig = {
  thuongHieu: {
    label: "Thương hiệu",
    listRef: thuongHieuOptions,
    selectedRef: selectedThuongHieu,
    getter: () => refDataService.getThuongHieu(),
    creator: (name) => refDataService.createThuongHieu({ tenThuongHieu: name }),
    nameField: "tenThuongHieu",
  },
  xuatXu: {
    label: "Xuất xứ",
    listRef: xuatXuOptions,
    selectedRef: selectedXuatXu,
    getter: () => refDataService.getXuatXu(),
    creator: (name) => refDataService.createXuatXu({ tenXuatXu: name, trangThai: true, xoaMem: false }),
    nameField: "tenXuatXu",
  },
  coGiay: {
    label: "Cổ giày",
    listRef: coGiayOptions,
    selectedRef: selectedCoGiay,
    getter: () => refDataService.getCoGiay(),
    creator: (name) => refDataService.createCoGiay({ tenCoGiay: name }),
    nameField: "tenCoGiay",
  },
  chatLieu: {
    label: "Chất liệu",
    listRef: chatLieuOptions,
    selectedRef: selectedChatLieu,
    getter: () => refDataService.getChatLieu(),
    creator: (name) => refDataService.createChatLieu({ tenChatLieu: name }),
    nameField: "tenChatLieu",
  },
  viTriThiDau: {
    label: "Vị trí thi đấu",
    listRef: viTriThiDauOptions,
    selectedRef: selectedViTriThiDau,
    getter: () => refDataService.getViTriThiDau(),
    creator: (name) => refDataService.createViTriThiDau({
      tenViTri: name,
      trangThai: true,
      xoaMem: false
    }),
    nameField: "tenViTriThiDau",
  },
  phongCachChoi: {
    label: "Phong cách chơi",
    listRef: phongCachChoiOptions,
    selectedRef: selectedPhongCachChoi,
    getter: () => refDataService.getPhongCachChoi(),
    creator: (name) => refDataService.createPhongCachChoi({
      tenPhongCach: name,
      trangThai: true,
      xoaMem: false
    }),
    nameField: "tenPhongCachChoi",
  },
  loaiSan: {
    label: "Loại sân",
    listRef: loaiSanOptions,
    selectedRef: selectedLoaiSan,
    getter: () => refDataService.getLoaiSan(),
    creator: (name) => refDataService.createLoaiSan({ tenLoaiSan: name }),
    nameField: "tenLoaiSan",
  },
  formChan: {
    label: "Form chân",
    listRef: formChanOptions,
    selectedRef: selectedFormChan,
    getter: () => refDataService.getFormChan(),
    creator: (name) => refDataService.createFormChan({ tenFormChan: name }),
    nameField: "tenFormChan",
  },
};

async function onCreateRef(key, opt) {
  const cfg = refConfig[key];
  if (!cfg) return;

  const name = String(opt?.[cfg.nameField] ?? opt?.ten ?? "").trim();
  if (!name) return;

  const token = _lockCreate(key, name);
  if (!token) return;

  try {
    const existed = (cfg.listRef.value || []).find((x) => lc(x?.[cfg.nameField] ?? x?.ten) === lc(name));
    if (existed) {
      if (!Array.isArray(cfg.selectedRef.value)) cfg.selectedRef.value = existed;
      toastInfo(`"${name}" đã tồn tại trong ${cfg.label}.`);
      return;
    }

    loading.value = true;
    await cfg.creator(name);

    const fresh = await cfg.getter();
    cfg.listRef.value = normalizeArr(fresh);

    const found = (cfg.listRef.value || []).find((x) => lc(x?.[cfg.nameField] ?? x?.ten) === lc(name)) || null;

    if (Array.isArray(cfg.selectedRef.value)) {
      const prev = cfg.selectedRef.value || [];
      cfg.selectedRef.value = Array.from(new Set([...prev, ...(found ? [found] : [])]));
    } else {
      cfg.selectedRef.value = found;
    }

    toastSuccess(`Thêm mới ${cfg.label}: "${name}" thành công`);
  } catch (e) {
    console.error(`Lỗi tạo ${cfg.label}:`, e);
    const msg = e?.response?.data?.message || e?.message || "Lỗi server không xác định. Vui lòng kiểm tra backend.";
    toastError(`Không tạo được ${cfg.label} "${name}". ${msg}`);
  } finally {
    loading.value = false;
    _unlockCreate(token);
  }
}

watch(selectedThuongHieu, (v) => { if (v?.__isNew) onCreateRef("thuongHieu", v); });
watch(selectedXuatXu, (v) => { if (v?.__isNew) onCreateRef("xuatXu", v); });
watch(selectedCoGiay, (v) => { if (v?.__isNew) onCreateRef("coGiay", v); });
watch(selectedChatLieu, (v) => { if (v?.__isNew) onCreateRef("chatLieu", v); });
watch(selectedViTriThiDau, (v) => { if (v?.__isNew) onCreateRef("viTriThiDau", v); });
watch(selectedPhongCachChoi, (v) => { if (v?.__isNew) onCreateRef("phongCachChoi", v); });

// ====== Required validation ======
function clearErrors() {
  errors.sanPham = "";
  errors.thuongHieu = "";
  errors.mauSac = "";
  errors.kichThuoc = "";
  errors.loaiSan = "";
  errors.formChan = "";
}

function validateRequiredTop() {
  clearErrors();

  if (!String(form.tenSanPham || "").trim()) errors.sanPham = "Vui lòng chọn hoặc nhập tên sản phẩm.";
  if (!selectedThuongHieu.value?.id) errors.thuongHieu = "Vui lòng chọn thương hiệu.";
  if (!selectedMauSac.value?.length) errors.mauSac = "Vui lòng chọn ít nhất 1 màu sắc.";
  if (!selectedKichThuoc.value?.length) errors.kichThuoc = "Vui lòng chọn ít nhất 1 kích cỡ.";
  if (!selectedLoaiSan.value?.length) errors.loaiSan = "Vui lòng chọn ít nhất 1 loại sân.";
  if (!selectedFormChan.value?.length) errors.formChan = "Vui lòng chọn ít nhất 1 form chân.";

  const ok = !Object.values(errors).some(Boolean);
  if (!ok) toastError("Vui lòng kiểm tra các trường bắt buộc (*).");
  return ok;
}

// ====== Kích cỡ modal ======
const sizeModal = reactive({
  open: false,
  options: [],
  tempSelected: [],
  keyword: "",
});

const sizeModalFilteredOptions = computed(() => {
  const q = lc(sizeModal.keyword);
  const list = sizeModal.options || [];
  if (!q) return list;
  return list.filter((x) => {
    const label = String(pickTen(x, "tenKichThuoc", "maKichThuoc") ?? "");
    return lc(label).includes(q) || label.includes(q);
  });
});

const sizeModalTempIds = computed(() => new Set((sizeModal.tempSelected || []).map((x) => x.id)));

function onSizeModalSearch(q) {
  sizeModal.keyword = String(q ?? "");
}

function openSizeModal() {
  const list = (kichThuocOptions.value || []).filter((x) => {
    const t = String(pickTen(x, "tenKichThuoc", "maKichThuoc"));
    const n = Number(t);
    return Number.isFinite(n) && n >= 38 && n <= 45;
  });
  sizeModal.options = list.sort((a, b) => Number(pickTen(a, "tenKichThuoc")) - Number(pickTen(b, "tenKichThuoc")));
  const selectedIds = new Set((selectedKichThuoc.value || []).map((x) => x.id));
  sizeModal.tempSelected = sizeModal.options.filter((x) => selectedIds.has(x.id));
  sizeModal.keyword = "";
  sizeModal.open = true;
}

function closeSizeModal() {
  sizeModal.open = false;
  sizeModal.keyword = "";
}

function toggleSizeTemp(id) {
  const opt = (sizeModal.options || []).find((x) => x.id === id);
  if (!opt) return;
  const idx = (sizeModal.tempSelected || []).findIndex((x) => x.id === id);
  if (idx >= 0) sizeModal.tempSelected.splice(idx, 1);
  else sizeModal.tempSelected.push(opt);
}

function confirmSizeModal() {
  selectedKichThuoc.value = (sizeModal.tempSelected || []).slice();
  sizeModal.open = false;
  onVariantSelectionChanged();
}

function removeSelectedSize(s) {
  selectedKichThuoc.value = (selectedKichThuoc.value || []).filter((x) => x.id !== s.id);
  onVariantSelectionChanged();
}

// ====== Tạo biến thể ======
const rows = ref([]);
const removedKeys = ref(new Set());
const variantsGenerated = ref(false);

function onVariantSelectionChanged() {
  if (!variantsGenerated.value) return;
  variantsGenerated.value = false;
  rows.value = [];
  removedKeys.value = new Set();
  toastInfo("Bạn vừa thay đổi thuộc tính biến thể. Vui lòng bấm “Tạo biến thể tự động” để sinh lại.");
}

/**
 * ✅ Khi bỏ chọn màu trong v-select, cần:
 * - dọn ảnh theo màu (revoke objectURL)
 * - reset biến thể (nếu đã generate)
 */
watch(
  selectedMauSac,
  (nv, ov) => {
    const nextIds = new Set((nv || []).map((x) => String(x?.id ?? "")));
    const prevIds = new Set((ov || []).map((x) => String(x?.id ?? "")));

    for (const pid of prevIds) {
      if (pid && !nextIds.has(pid)) clearColorImage(pid);
    }
    for (const nid of nextIds) {
      if (nid) ensureColorFileKey(nid);
    }

    onVariantSelectionChanged();
  },
  { deep: true }
);

watch([selectedLoaiSan, selectedFormChan], onVariantSelectionChanged, { deep: true });

function clearVariantsOnly() {
  selectedMauSac.value = [];
  selectedKichThuoc.value = [];
  selectedLoaiSan.value = [];
  selectedFormChan.value = [];
  rows.value = [];
  removedKeys.value = new Set();
  variantsGenerated.value = false;
  Object.keys(colorFiles).forEach((k) => delete colorFiles[k]);
}

function buildKey(ms, kt, ls, fc) {
  return `${ms}-${kt}-${ls}-${fc}`;
}

function sortByName(a, b, field) {
  return String(a?.[field] ?? a?.ten ?? "").localeCompare(String(b?.[field] ?? b?.ten ?? ""), "vi");
}

function ensureColorFileKey(colorId) {
  const k = String(colorId);
  if (!k) return;
  if (colorFiles[k] == null) colorFiles[k] = { file: null, fileName: "", previewUrl: "" };
}

function dedupeById(list = []) {
  const seen = new Set();
  const out = [];
  for (const it of list) {
    const key = it?.id != null ? String(it.id) : `name:${lc(it?.tenMauSac ?? it?.ten ?? "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function generateVariants() {
  if (loading.value) return;
  if (!validateRequiredTop()) return;

  const colors = (selectedMauSac.value || []).slice().sort((a, b) => sortByName(a, b, "tenMauSac"));
  const sizes = (selectedKichThuoc.value || []).slice().sort((a, b) => sortByName(a, b, "tenKichThuoc"));
  const loais = (selectedLoaiSan.value || []).slice().sort((a, b) => sortByName(a, b, "tenLoaiSan"));
  const forms = (selectedFormChan.value || []).slice().sort((a, b) => sortByName(a, b, "tenFormChan"));

  if (!colors.length || !sizes.length || !loais.length || !forms.length) return;

  const removed = removedKeys.value;
  const next = [];

  for (const c of colors) {
    ensureColorFileKey(c.id);
    for (const s of sizes) {
      for (const ls of loais) {
        for (const fc of forms) {
          const key = buildKey(c.id, s.id, ls.id, fc.id);
          if (removed.has(key)) continue;
          next.push({
            key,
            idSanPham: form.idSanPham || null,
            idMauSac: c.id,
            idKichThuoc: s.id,
            idLoaiSan: ls.id,
            idFormChan: fc.id,
            labelKichThuoc: pickTen(s, "tenKichThuoc", "maKichThuoc"),
            labelLoaiSan: pickTen(ls, "tenLoaiSan", "maLoaiSan"),
            labelFormChan: pickTen(fc, "tenFormChan", "maFormChan"),
            soLuong: "",
            gia: "",
            errSoLuong: "",
            errGia: "",
          });
        }
      }
    }
  }

  rows.value = next;
  variantsGenerated.value = true;
  toastSuccess("Đã tạo danh sách biến thể.");
}

function validateRow(r) {
  r.errSoLuong = "";
  r.errGia = "";
  if (!isValidNonNeg(r.soLuong)) r.errSoLuong = "Vui lòng nhập số lượng (>= 0).";
  if (!isValidNonNeg(r.gia)) r.errGia = "Vui lòng nhập giá bán (>= 0).";
}

function removeRow(row) {
  removedKeys.value.add(row.key);
  rows.value = rows.value.filter((r) => r.key !== row.key);
}

function clearAllVariants() {
  rows.value = [];
  removedKeys.value = new Set();
  variantsGenerated.value = false;
  toastInfo("Đã xóa toàn bộ biến thể.");
}

// ===== group rows by color =====
const groupedRows = computed(() => {
  const list = rows.value || [];
  const groups = new Map();
  for (const r of list) {
    const k = String(r.idMauSac);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const order = (selectedMauSac.value || []).map((x) => String(x.id));
  const result = [];
  for (const colorId of order) {
    const items = groups.get(colorId);
    if (!items?.length) continue;
    const colorObj = (selectedMauSac.value || []).find((x) => String(x.id) === colorId);
    const colorName = pickTen(colorObj, "tenMauSac", "maMauSac");
    result.push({
      groupKey: String(colorId),
      colorName,
      colorHex: pickColorHex(colorObj),
      items,
    });
  }
  return result;
});

// ===== Thêm nhanh =====
const bulkAll = reactive({
  open: false,
  soLuong: "",
  gia: "",
  err: "",
});

function openBulkAll() {
  bulkAll.open = true;
  bulkAll.soLuong = "";
  bulkAll.gia = "";
  bulkAll.err = "";
}

function closeBulkAll() {
  bulkAll.open = false;
}

function applyBulkAll() {
  if (!isValidNonNeg(bulkAll.soLuong) || !isValidNonNeg(bulkAll.gia)) {
    bulkAll.err = "Vui lòng nhập Số lượng và Giá hợp lệ (>= 0).";
    return;
  }
  bulkAll.err = "";
  rows.value = rows.value.map((r) => ({
    ...r,
    soLuong: String(parseVnNumber(bulkAll.soLuong)),
    gia: String(parseVnNumber(bulkAll.gia)),
    errSoLuong: "",
    errGia: "",
  }));
  bulkAll.open = false;
  toastSuccess("Đã áp dụng cho tất cả biến thể.");
}

const bulkColor = reactive({
  open: false,
  colorId: "",
  colorName: "",
  colorHex: "#e5e7eb",
  soLuong: "",
  gia: "",
  err: "",
});

function openBulkColor(g) {
  bulkColor.open = true;
  bulkColor.colorId = String(g.groupKey);
  bulkColor.colorName = g.colorName;
  bulkColor.colorHex = g.colorHex;
  bulkColor.soLuong = "";
  bulkColor.gia = "";
  bulkColor.err = "";
}

function closeBulkColor() {
  bulkColor.open = false;
}

function applyBulkColor() {
  if (!isValidNonNeg(bulkColor.soLuong) || !isValidNonNeg(bulkColor.gia)) {
    bulkColor.err = "Vui lòng nhập Số lượng và Giá hợp lệ (>= 0).";
    return;
  }
  bulkColor.err = "";
  const sl = String(parseVnNumber(bulkColor.soLuong));
  const gia = String(parseVnNumber(bulkColor.gia));
  rows.value = rows.value.map((r) =>
    String(r.idMauSac) === bulkColor.colorId
      ? { ...r, soLuong: sl, gia: gia, errSoLuong: "", errGia: "" }
      : r
  );
  bulkColor.open = false;
  toastSuccess(`Đã áp dụng cho màu ${bulkColor.colorName}.`);
}

// ===== FILE per color =====
const colorFiles = reactive({}); // { [colorId]: { file, fileName, previewUrl } }

function triggerColorFile(colorId) {
  const el = document.getElementById(`file-ms-${colorId}`);
  el?.click();
}

function onColorFileChange(e, group) {
  const f = e.target.files?.[0];
  const key = String(group.groupKey);
  if (!colorFiles[key]) colorFiles[key] = { file: null, fileName: "", previewUrl: "" };
  colorFiles[key].file = f || null;
  colorFiles[key].fileName = f?.name || "";
  colorFiles[key].previewUrl = f ? URL.createObjectURL(f) : "";
}

function clearColorImage(colorId) {
  const key = String(colorId);
  if (!colorFiles[key]) return;
  if (colorFiles[key].previewUrl) {
    try {
      URL.revokeObjectURL(colorFiles[key].previewUrl);
    } catch {}
  }
  colorFiles[key].file = null;
  colorFiles[key].fileName = "";
  colorFiles[key].previewUrl = "";
}

// ====== Thêm màu modal ======
const addColor = reactive({
  open: false,
  ten: "",
  hex: "#ff4d4f",
  err: "",
});

function openAddColor() {
  addColor.open = true;
  addColor.ten = "";
  addColor.hex = "#ff4d4f";
  addColor.err = "";
}

function closeAddColor() {
  addColor.open = false;
}

async function confirmAddColor() {
  const ten = String(addColor.ten || "").trim();
  if (!ten) {
    addColor.err = "Vui lòng nhập tên màu.";
    return;
  }
  addColor.err = "";

  const pickedHex = asHexColor(addColor.hex) || "#e5e7eb";
  addColor.hex = pickedHex;

  const existed = (mauSacOptions.value || []).find((x) => lc(x.tenMauSac ?? x.ten) === lc(ten));
  if (existed) {
    // ✅ nếu màu tồn tại mà backend chưa trả hex, vẫn đảm bảo UI có màu theo picker
    if (!extractColorHex(existed)) existed.maMau = pickedHex;

    selectedMauSac.value = dedupeById([...(selectedMauSac.value || []), existed]);
    ensureColorFileKey(String(existed.id));
    addColor.open = false;
    toastInfo(`"${ten}" đã tồn tại.`);
    onVariantSelectionChanged();
    return;
  }

  try {
    loading.value = true;

    // ✅ vẫn gửi mã màu lên BE (nhưng user không phải gõ tay)
    const payload = { tenMauSac: ten, maMau: pickedHex };
    await refDataService.createMauSac(payload);

    const fresh = await refDataService.getMauSac();
    mauSacOptions.value = normalizeArr(fresh);

    const found = mauSacOptions.value.find((x) => lc(x.tenMauSac ?? x.ten) === lc(ten)) || null;

    if (found) {
      // ✅ nếu BE chưa trả/không lưu hex -> inject để UI hiển thị đúng ngay
      if (!extractColorHex(found)) found.maMau = pickedHex;

      selectedMauSac.value = dedupeById([...(selectedMauSac.value || []), found]);
      ensureColorFileKey(String(found.id));
    }

    addColor.open = false;
    toastSuccess(`Thêm màu "${ten}" thành công`);
    onVariantSelectionChanged();
  } catch (e) {
    console.error(e);
    const msg = e?.userMessage || e?.response?.data?.message || e?.message || "Lỗi không xác định";
    toastError(`Không thêm được màu. ${msg}`);
  } finally {
    loading.value = false;
  }
}

// ===== upload ảnh =====
async function uploadImagesAfterCreate(createdCtspList) {
  const list = createdCtspList || [];
  if (!list.length) return;

  const byColor = new Map();
  for (const it of list) {
    const ctspId = Number(it?.id);
    const colorId = String(it?.idMauSac ?? it?.id_mau_sac ?? "");
    if (!ctspId || !colorId) continue;
    if (!byColor.has(colorId)) byColor.set(colorId, []);
    byColor.get(colorId).push(ctspId);
  }

  for (const [colorId, ctspIds] of byColor.entries()) {
    const f = colorFiles[colorId]?.file || null;
    if (!f || !ctspIds.length) continue;
    const tasks = ctspIds.map((ctspId) =>
      anhChiTietSanPhamService.uploadNew({
        idChiTietSanPham: ctspId,
        file: f,
        laAnhDaiDien: true,
        moTa: "",
      })
    );
    await Promise.all(tasks);
  }
}

async function uploadImageAfterEdit(ctspId) {
  const colorId = String(selectedMauSac.value?.[0]?.id ?? "");
  const f = colorId ? colorFiles[colorId]?.file || null : null;
  if (!ctspId || !f) return;

  try {
    const res = await anhChiTietSanPhamService.byChiTietSanPham(ctspId);
    const imgs = normalizeArr(res);
    const daiDien = imgs.find((x) => (x?.laAnhDaiDien ?? x?.la_anh_dai_dien) === true) || imgs[0] || null;
    const imgId = daiDien?.id ? Number(daiDien.id) : null;

    if (imgId) {
      try {
        await anhChiTietSanPhamService.updateUpload({
          id: imgId,
          file: f,
          laAnhDaiDien: true,
          moTa: daiDien?.moTa ?? "",
        });
        return;
      } catch {
        await anhChiTietSanPhamService.uploadNew({
          idChiTietSanPham: ctspId,
          file: f,
          laAnhDaiDien: true,
          moTa: "",
        });
        return;
      }
    }

    await anhChiTietSanPhamService.uploadNew({
      idChiTietSanPham: ctspId,
      file: f,
      laAnhDaiDien: true,
      moTa: "",
    });
  } catch {
    await anhChiTietSanPhamService.uploadNew({
      idChiTietSanPham: ctspId,
      file: f,
      laAnhDaiDien: true,
      moTa: "",
    });
  }
}

// ===== navigation =====
function back() {
  const pid = productIdQuery.value || form.idSanPham;
  if (pid) return router.push(`/admin/chi-tiet-san-pham?productId=${pid}`);
  return router.push("/admin/chi-tiet-san-pham");
}

// ===== LOAD edit =====
async function loadEditIfNeeded() {
  if (!isEdit.value) return;

  const res = await productDetailService.getOne(id.value);
  const row = res?.data ?? res;

  const idSanPham = row.idSanPham ?? row.sanPhamId ?? row.id_san_pham;
  const idMauSac = row.idMauSac ?? row.mauSacId ?? row.id_mau_sac;
  const idKichThuoc = row.idKichThuoc ?? row.kichThuocId ?? row.id_kich_thuoc;
  const idLoaiSan = row.idLoaiSan ?? row.loaiSanId ?? row.id_loai_san;
  const idFormChan = row.idFormChan ?? row.formChanId ?? row.id_form_chan;

  form.idSanPham = Number(idSanPham) || null;
  const p = productOptions.value.find((x) => Number(x.id) === Number(form.idSanPham));
  if (p) {
    form.maSanPham = p.maSanPham ?? p.ma ?? "";
    form.tenSanPham = p.tenSanPham ?? p.ten ?? "";
    form.moTaNgan = p.moTaNgan ?? p.moTa ?? "";
    syncAttributesFromProduct(p);
  }

  const ms = mauSacOptions.value.find((x) => Number(x.id) === Number(idMauSac));
  const kt = kichThuocOptions.value.find((x) => Number(x.id) === Number(idKichThuoc));
  const ls = loaiSanOptions.value.find((x) => Number(x.id) === Number(idLoaiSan));
  const fc = formChanOptions.value.find((x) => Number(x.id) === Number(idFormChan));

  selectedMauSac.value = ms ? [ms] : [];
  selectedKichThuoc.value = kt ? [kt] : [];
  selectedLoaiSan.value = ls ? [ls] : [];
  selectedFormChan.value = fc ? [fc] : [];

  variantsGenerated.value = true;
  rows.value = [{
    key: buildKey(ms?.id, kt?.id, ls?.id, fc?.id),
    idSanPham: form.idSanPham,
    idMauSac: ms?.id,
    idKichThuoc: kt?.id,
    idLoaiSan: ls?.id,
    idFormChan: fc?.id,
    labelKichThuoc: pickTen(kt, "tenKichThuoc", "maKichThuoc"),
    labelLoaiSan: pickTen(ls, "tenLoaiSan", "maLoaiSan"),
    labelFormChan: pickTen(fc, "tenFormChan", "maFormChan"),
    soLuong: String(row.soLuong ?? ""),
    gia: String(row.giaBan ?? row.giaNiemYet ?? row.gia ?? ""),
    errSoLuong: "",
    errGia: "",
  }];

  if (ms?.id) ensureColorFileKey(ms.id);
}

// ===== mounted =====
onMounted(async () => {
  loading.value = true;
  try {
    const [
      p, th, xx, cg, cl, vt, pc, ms, kt, ls, fc,
    ] = await Promise.all([
      productService.getAll(),
      refDataService.getThuongHieu(),
      refDataService.getXuatXu(),
      refDataService.getCoGiay(),
      refDataService.getChatLieu(),
      refDataService.getViTriThiDau(),
      refDataService.getPhongCachChoi(),
      refDataService.getMauSac(),
      refDataService.getKichThuoc(),
      refDataService.getLoaiSan(),
      refDataService.getFormChan(),
    ]);

    productOptions.value = normalizeArr(p);
    thuongHieuOptions.value = normalizeArr(th);
    xuatXuOptions.value = normalizeArr(xx);
    coGiayOptions.value = normalizeArr(cg);
    chatLieuOptions.value = normalizeArr(cl);
    viTriThiDauOptions.value = normalizeArr(vt);
    phongCachChoiOptions.value = normalizeArr(pc);
    mauSacOptions.value = normalizeArr(ms);
    kichThuocOptions.value = normalizeArr(kt);
    loaiSanOptions.value = normalizeArr(ls);
    formChanOptions.value = normalizeArr(fc);

    if (!isEdit.value && productIdQuery.value) {
      const found = productOptions.value.find((x) => Number(x.id) === Number(productIdQuery.value));
      if (found) selectedProduct.value = found;
      else form.idSanPham = productIdQuery.value;
    }

    applyDefaultProductAttributes();
    await loadEditIfNeeded();

    if (form.idSanPham) {
      const p2 = productOptions.value.find((x) => Number(x.id) === Number(form.idSanPham));
      if (p2) syncAttributesFromProduct(p2);
    }
  } catch (e) {
    console.error(e);
    const msg = e?.userMessage || e?.response?.data?.message || e?.message || "Lỗi không xác định";
    toastError(`Không tải được dữ liệu tham chiếu. ${msg}`);
  } finally {
    loading.value = false;
  }
});

// ===== CREATE PRODUCT IF NEEDED =====
async function createProductIfNeeded() {
  if (form.idSanPham) return;

  const ten = String(form.tenSanPham || "").trim();
  if (!ten) throw new Error("Vui lòng nhập tên sản phẩm.");
  if (!selectedThuongHieu.value?.id) throw new Error("Vui lòng chọn Thương hiệu.");

  const payload = {
    tenSanPham: ten,
    moTaNgan: form.moTaNgan ?? null,
    idThuongHieu: selectedThuongHieu.value.id,
    idXuatXu: selectedXuatXu.value?.id ?? null,
    idCoGiay: selectedCoGiay.value?.id ?? null,
    idChatLieu: selectedChatLieu.value?.id ?? null,
    idViTriThiDau: selectedViTriThiDau.value?.id ?? null,
    idPhongCachChoi: selectedPhongCachChoi.value?.id ?? null,
    trangThaiKinhDoanh: true,
    xoaMem: false,
  };

  const res = await productService.create(payload);
  const created = res?.data ?? res;
  const createdId = created?.id;

  if (!createdId) throw new Error("Tạo sản phẩm thành công nhưng không nhận được id.");

  const list = await productService.getAll();
  productOptions.value = normalizeArr(list);

  const found = productOptions.value.find((x) => Number(x.id) === Number(createdId)) || { ...created, id: createdId };
  form.idSanPham = found.id;
  form.maSanPham = found.maSanPham ?? found.ma ?? form.maSanPham;
  form.tenSanPham = found.tenSanPham ?? found.ten ?? form.tenSanPham;

  toastSuccess("Thêm sản phẩm thành công");
}

// ===== SUBMIT =====
async function submitReal() {
  try {
    if (!validateRequiredTop()) return;
    await createProductIfNeeded();

    if (!form.idSanPham) return stopWithError("Không xác định được sản phẩm.");
    if (!rows.value.length) return stopWithError("Chưa có biến thể nào để lưu.");

    const bad = rows.value.find((r) => !isValidNonNeg(r.soLuong) || !isValidNonNeg(r.gia));
    if (bad) return stopWithError("Vui lòng nhập Số lượng/Giá hợp lệ (>= 0) cho tất cả biến thể.");

    loading.value = true;

    if (isEdit.value) {
      const r = rows.value[0];
      const price = parseVnNumber(r.gia);
      const payload = {
        idSanPham: form.idSanPham,
        idMauSac: r.idMauSac,
        idKichThuoc: r.idKichThuoc,
        idLoaiSan: r.idLoaiSan,
        idFormChan: r.idFormChan,
        soLuong: parseVnNumber(r.soLuong),
        giaNiemYet: price,
        giaBan: price,
        trangThai: true,
      };

      await productDetailService.update(id.value, payload);
      await uploadImageAfterEdit(Number(id.value));

      toastSuccess("Lưu chi tiết sản phẩm thành công");
      router.push(`/admin/chi-tiet-san-pham?productId=${form.idSanPham}&saved=1&mode=update`);
      return;
    }

    const createdResList = await Promise.all(
      rows.value.map((r) => {
        const price = parseVnNumber(r.gia);
        const payload = {
          idSanPham: form.idSanPham,
          idMauSac: r.idMauSac,
          idKichThuoc: r.idKichThuoc,
          idLoaiSan: r.idLoaiSan,
          idFormChan: r.idFormChan,
          soLuong: parseVnNumber(r.soLuong),
          giaNiemYet: price,
          giaBan: price,
          trangThai: true,
        };
        return productDetailService.create(payload);
      })
    );

    const createdCtspList = createdResList.map((x) => x?.data ?? x).filter(Boolean);
    await uploadImagesAfterCreate(createdCtspList);

    toastSuccess("Thêm chi tiết sản phẩm thành công");
    router.push(`/admin/chi-tiet-san-pham?productId=${form.idSanPham}&saved=1&mode=create`);
  } catch (e) {
    console.error(e);
    const msg = e?.userMessage || e?.response?.data?.message || e?.message || (isEdit.value ? "Lưu thất bại." : "Thêm thất bại.");
    toastError(msg);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* ===== ÉP 1 font + không in đậm ===== */
.ss-one-font,
.ss-one-font * {
  font-weight: 400 !important;
}

/* ===== Vue Select: đồng nhất dấu X (clear) như các ô thuộc tính ===== */
:deep(.vs__clear) {
  opacity: 1 !important;
  width: 28px !important;
  height: 28px !important;
  border-radius: 10px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-right: 6px !important;
  padding: 0 !important;
  color: rgba(17, 24, 39, 0.35) !important;
  font-size: 18px !important;
  line-height: 1 !important;
}
:deep(.vs__clear:hover) {
  color: rgba(17, 24, 39, 0.55) !important;
  background: rgba(17, 24, 39, 0.04);
}
:deep(.vs__deselect) {
  color: rgba(17, 24, 39, 0.45) !important;
}

/* ===== Layout ===== */
.ss-page-title {
  font-size: 18px;
  letter-spacing: 0.2px;
  color: rgba(17, 24, 39, 0.92);
}
.ss-card-title {
  margin-bottom: 12px;
  color: rgba(17, 24, 39, 0.92);
}

/* ✅ note validate */
.ss-note {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed rgba(17, 24, 39, 0.16);
  background: rgba(17, 24, 39, 0.02);
  margin-bottom: 12px;
}
.ss-note-line {
  color: rgba(17, 24, 39, 0.70);
  font-size: 12.5px;
  line-height: 1.45;
}

/* ===== required star ===== */
.ss-required {
  color: #ff4d4f;
  margin-left: 4px;
  cursor: help;
}

/* ===== error ===== */
.ss-err {
  margin-top: 6px;
  color: #ff4d4f;
  font-size: 12.5px;
}

/* ===== Chips ===== */
.ss-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.ss-chip-wrap-sm { gap: 8px; margin-bottom: 0; }
.ss-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
}
.ss-chip-sm {
  padding: 6px 10px;
  border-radius: 12px;
}
.ss-chip-text {
  white-space: nowrap;
}
.ss-chip-x {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: rgba(17, 24, 39, 0.88);
}
.ss-chip-x:hover {
  background: rgba(17, 24, 39, 0.04);
}

.ss-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.10);
}

.ss-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  flex: 0 0 auto;
}

.ss-size-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===== Buttons ===== */
.ss-btn {
  border-radius: 10px;
  padding: 10px 14px;
}
.ss-btn-sm {
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
}
.ss-generate {
  width: fit-content;
  min-width: 210px;
}
.ss-muted {
  color: rgba(17, 24, 39, 0.6);
  font-size: 13px;
}
.ss-empty {
  padding: 20px 10px;
  text-align: center;
  color: rgba(17, 24, 39, 0.6);
}

/* ===== Variant bar ===== */
.ss-variant-bar {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}
.ss-bar-left {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}
.ss-bar-ic { font-size: 18px; }
.ss-bar-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-bar-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid transparent;
  font-size: 13px;
}
.ss-bar-btn span.material-icons-outlined { font-size: 18px; }
.ss-bar-btn-dark {
  background: rgba(17, 24, 39, 0.92);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.14);
}
.ss-bar-btn-dark:hover { filter: brightness(1.02); }
.ss-bar-btn-danger {
  background: rgba(255, 77, 79, 0.96);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.16);
}
.ss-bar-btn-danger:hover { filter: brightness(0.98); }

/* ===== Color group ===== */
.ss-color-group {
  border: 1px solid rgba(17, 24, 39, 0.10);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 14px;
  background: #fff;
}
.ss-color-header {
  padding: 10px 12px;
  background: rgba(17, 24, 39, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ===== Table ===== */
.ss-table-lite thead th {
  background: rgba(17, 24, 39, 0.03);
  border-bottom: 1px solid rgba(17, 24, 39, 0.10);
}
.ss-table-lite td, .ss-table-lite th { vertical-align: middle; }
.ss-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* ===== Delete button ===== */
.ss-del {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 77, 79, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.16);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
}
.ss-del:hover { filter: brightness(0.98); }

/* ===== Image block ===== */
.ss-image-block {
  padding: 12px;
  border-top: 1px solid rgba(17, 24, 39, 0.10);
  background: #fff;
  margin-top: 10px;
  border-radius: 14px;
}
.ss-image-block-bottom {
  border: 1px solid rgba(17,24,39,0.10);
}
.ss-image-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(17, 24, 39, 0.92);
  margin-bottom: 10px;
}
.ss-image-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;
}
@media (min-width: 992px) {
  .ss-image-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.ss-image-card {
  border: 1px solid rgba(17, 24, 39, 0.10);
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}
.ss-image-head {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ss-img-x {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: rgba(17, 24, 39, 0.88);
}
.ss-img-x:hover { background: rgba(17, 24, 39, 0.04); }
.ss-image-preview {
  height: 210px;
  background: rgba(17, 24, 39, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ss-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.ss-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(17, 24, 39, 0.55);
}
.ss-img-btn {
  width: 100%;
  border-radius: 0;
  border-top: 1px solid rgba(17, 24, 39, 0.10) !important;
  padding: 10px 12px;
}

/* ===== Footer actions ===== */
.ss-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

/* ===== Buttons palette ===== */
.btn-primary {
  border: none !important;
  background: linear-gradient(90deg, #ff4d4f 0%, #111827 100%) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(255, 77, 79, 0.16);
}
.btn-primary:hover {
  filter: brightness(0.98);
  box-shadow: 0 12px 26px rgba(17, 24, 39, 0.18), 0 10px 22px rgba(255, 77, 79, 0.14);
}
.btn-primary:disabled,
.btn-primary.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-outline-secondary {
  background: #fff !important;
  color: rgba(17, 24, 39, 0.92) !important;
  border: 1px solid rgba(17, 24, 39, 0.22) !important;
}
.btn-outline-secondary:hover {
  border-color: rgba(255, 77, 79, 0.55) !important;
  background: rgba(255, 77, 79, 0.06) !important;
  color: rgba(17, 24, 39, 0.92) !important;
}

/* ===== Modal ===== */
.ss-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.ss-modal {
  width: 560px;
  max-width: calc(100vw - 28px);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.ss-modal-head {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}
.ss-modal-title { color: rgba(17, 24, 39, 0.92); }
.ss-modal-body { padding: 16px; }
.ss-modal-foot {
  padding: 14px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}

/* ===== Size select in modal ===== */
.ss-size-select :deep(.vs__dropdown-toggle) {
  min-height: 42px;
  border-radius: 10px;
}

/* ===== Size grid ===== */
.ss-size-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.ss-size-item {
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.92);
}
.ss-size-item:hover { background: rgba(17, 24, 39, 0.04); }
.ss-size-item.active {
  border-color: rgba(255, 77, 79, 0.75);
  background: rgba(255, 77, 79, 0.08);
}
.ss-size-empty {
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.60);
  font-size: 13px;
}

/* ===== Bulk preview ===== */
.ss-bulk-preview {
  border: 1px dashed rgba(17,24,39,0.16);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: rgba(17,24,39,0.02);
}
.ss-bulk-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

/* ===== Confirm ===== */
.ss-confirm {
  width: 560px;
  max-width: calc(100vw - 28px);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.ss-confirm-header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}
.ss-confirm-title { color: rgba(17, 24, 39, 0.92); }
.ss-confirm-body { padding: 16px; }
.ss-confirm-text {
  color: rgba(17, 24, 39, 0.86);
  font-size: 14px;
  line-height: 1.5;
}
.ss-confirm-sub {
  margin-top: 6px;
  color: rgba(17, 24, 39, 0.6);
  font-size: 12.5px;
}
.ss-confirm-footer {
  padding: 14px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
}
</style>
