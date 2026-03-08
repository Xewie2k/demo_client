<!-- File: src/pages/sales/SalesPage.vue -->
<template>
  <div class="ss-page ss-font ss-pos">
    <!-- HEAD -->
    <div class="ss-head">
      <div class="ss-head-left">
        <div class="ss-title">Bán hàng</div>
        <div class="ss-subtitle">
          Người bán:
          <span class="ss-seller-name">{{ nguoiBanTen || "—" }}</span>
        </div>
      </div>

      <div class="ss-head-right">
        <button class="btn ss-btn-primary" type="button" @click="createOrderTab" :disabled="submitting">
          <span class="material-icons-outlined" style="font-size: 18px">add</span>
          Tạo đơn hàng
        </button>
      </div>
    </div>

    <!-- TOAST -->
    <div v-if="toast.show" class="ss-toast" :class="toast.type">
      <div class="ss-toast-left">
        <span class="ss-toast-dot"></span>
      </div>
      <div class="ss-toast-msg">{{ toast.msg }}</div>
      <button class="ss-toast-x" type="button" @click="hideToast">×</button>
    </div>

    <!-- ========================= EMPTY: CHƯA CÓ ĐƠN HÀNG ========================= -->
    <div v-if="!hasOrders" class="ss-card ss-border ss-card-main ss-empty-card">
      <div class="ss-empty-wrap">
        <div class="ss-empty-icon" aria-hidden="true">
          <svg width="54" height="54" viewBox="0 0 64 64">
            <path
              d="M18 22h28c2.2 0 4 1.8 4 4v22c0 4.4-3.6 8-8 8H22c-4.4 0-8-3.6-8-8V26c0-2.2 1.8-4 4-4z"
              fill="#d1d5db"
            />
            <path
              d="M24 22c0-4.4 3.6-8 8-8s8 3.6 8 8"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="6"
              stroke-linecap="round"
            />
            <path d="M26 28h12" stroke="#e5e7eb" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>
        <div class="ss-empty-text">Chưa có đơn hàng</div>
      </div>
    </div>

    <!-- ========================= ORDER UI (có đơn hàng) ========================= -->
    <template v-else>
      <!-- TABS -->
      <div class="ss-tabs">
        <div class="ss-tab-list">
          <button
            v-for="(t, idx) in tabs"
            :key="t.id"
            class="ss-tab"
            :class="{ active: idx === activeTab }"
            type="button"
            @click="switchTab(idx)"
          >
            <span class="ss-tab-name">
              {{ t.name }}
              <span
                v-if="tabItemCount(t) > 0"
                class="ss-tab-badge"
                :title="`Đơn có ${tabItemCount(t)} sản phẩm`"
              >
                {{ tabItemCount(t) }}
              </span>
            </span>

            <span class="ss-tab-x" title="Đóng" @click.stop="closeTab(idx)">×</span>
          </button>
        </div>
      </div>

      <!-- MAIN CARD -->
      <div class="ss-card ss-border ss-card-main">
        <!-- Product Section Head -->
        <div class="ss-section-head">
          <div class="ss-section-title">Sản phẩm</div>

          <div class="ss-section-actions">
            <button class="btn ss-btn-outline" type="button" @click="openQrModal">QUÉT QR SẢN PHẨM</button>
            <button class="btn ss-btn-primary" type="button" @click="openCtspModal">THÊM SẢN PHẨM</button>
          </div>
        </div>

        <!-- Cart -->
        <div class="ss-cart-box ss-border">
          <div v-if="cartItems.length === 0" class="ss-empty-wrap ss-empty-cart">
            <div class="ss-empty-icon" aria-hidden="true">
              <svg width="54" height="54" viewBox="0 0 64 64">
                <path
                  d="M18 22h28c2.2 0 4 1.8 4 4v22c0 4.4-3.6-8-8-8H22c-4.4 0-8-3.6-8-8V26c0-2.2 1.8-4 4-4z"
                  fill="#d1d5db"
                />
                <path
                  d="M24 22c0-4.4 3.6-8 8-8s8 3.6 8 8"
                  fill="none"
                  stroke="#e5e7eb"
                  stroke-width="6"
                  stroke-linecap="round"
                />
                <path d="M26 28h12" stroke="#e5e7eb" stroke-width="4" stroke-linecap="round" />
              </svg>
            </div>
            <div class="ss-empty-text ss-empty-eng">Không có dữ liệu</div>
          </div>

          <div v-else class="ss-cart-list">
            <div v-for="it in cartItems" :key="it.__rowId || it.id" class="ss-cart-item">
              <input class="ss-cart-check" type="checkbox" v-model="it.checked" :disabled="!hasPermission" />

              <div class="ss-cart-thumb thumb-wrap">
                <img
                  v-if="resolveImage(it.anhUrl)"
                  :src="resolveImage(it.anhUrl)"
                  class="ss-thumb-img"
                  alt=""
                  @error="onImgErr"
                />
                <div v-else class="ss-thumb-ph"></div>

                <span
                  v-if="getPhanTramGiamDisplay(it) > 0"
                  class="discount-badge sm"
                  :title="getGiamGiaTitle(it)"
                >
                  -{{ getPhanTramGiamDisplay(it) }}%
                </span>
              </div>

              <div class="ss-cart-info">
                <div class="ss-cart-name">{{ it.tenSanPham }}</div>
                <div class="ss-cart-sub">
                  <span class="ss-cart-code">{{ it.maCtsp }}</span>
                  <span class="ss-dot">•</span>
                  <span>{{ it.mauSac }}</span>
                  <span class="ss-dot">•</span>
                  <span>{{ it.kichCo }}</span>
                </div>

                <div v-if="getThongBaoBienDongGia(it)" class="ss-cart-price-change">
                  {{ getThongBaoBienDongGia(it) }}
                </div>
              </div>

              <div class="ss-cart-price">
                <div v-if="showGiaGoc(it)" class="ss-price-old">{{ formatMoney(getGiaGoc(it)) }}</div>
                <div class="ss-price-now">{{ formatMoney(getGiaThucTe(it)) }}</div>
              </div>

              <div class="ss-cart-qty">
                <button
                  class="ss-qty-btn"
                  type="button"
                  @click="decQty(it)"
                  :disabled="Number(it.qty || 1) <= 1 || !hasPermission"
                >
                  -
                </button>

                <input
                  class="ss-qty-input"
                  type="text"
                  :value="String(it.qty || 1)"
                  :title="
                    isGiaDaDoiTrongGio(it)
                      ? 'Giá sản phẩm đã thay đổi, chỉ được giảm hoặc xóa dòng giá cũ.'
                      : `Tối đa: ${getMaxQtyForItem(it)}`
                  "
                  :disabled="!hasPermission || isGiaDaDoiTrongGio(it)"
                  @input="onQtyInput(it, $event)"
                  @blur="onQtyBlur(it)"
                />

                <button
                  class="ss-qty-btn"
                  type="button"
                  @click="incQty(it)"
                  :disabled="
                    Number(it.qty || 1) >= getMaxQtyForItem(it) ||
                    !hasPermission ||
                    isGiaDaDoiTrongGio(it)
                  "
                  :title="
                    isGiaDaDoiTrongGio(it)
                      ? 'Giá sản phẩm đã thay đổi, chỉ được giảm hoặc xóa dòng giá cũ.'
                      : Number(it.qty || 1) >= getMaxQtyForItem(it)
                        ? 'Đã đạt tồn tối đa'
                        : 'Tăng số lượng'
                  "
                >
                  +
                </button>
              </div>

              <button
                class="ss-trash"
                type="button"
                title="Xóa"
                @click="removeItem(it.__rowId || it.id)"
                :disabled="!hasPermission"
              >
                <span class="material-icons-outlined">delete</span>
              </button>
            </div>

            <div class="ss-cart-total">
              <div class="ss-cart-total-label">Tổng tiền</div>
              <div class="ss-cart-total-val">{{ formatMoney(tongTienHang) }}</div>
            </div>
          </div>
        </div>

        <!-- Bottom: chỉ hiện khi đã có sản phẩm -->
        <div v-if="cartItems.length > 0" class="ss-bottom-grid">
          <!-- Customer card -->
          <div class="ss-panel ss-border">
            <div class="ss-panel-head">
              <div class="ss-panel-title">Thông tin khách hàng</div>

              <div class="ss-panel-actions">
                <button class="btn ss-btn-outline" type="button" @click="openKhModal">Chọn khách hàng</button>

                <button
                  v-if="selectedKh"
                  class="btn ss-btn-outline"
                  type="button"
                  :disabled="!hasPermission"
                  @click="chonKhachVangLai"
                  title="Chuyển về khách vãng lai (không cần tạo đơn mới)"
                >
                  Khách vãng lai
                </button>

                <button
                  class="btn ss-btn-outline"
                  type="button"
                  :disabled="!isCounter || !selectedKh || diaChiList.length <= 1"
                  @click="openDiaChiModal"
                  title="Chỉ bật khi giao hàng và khách có nhiều địa chỉ"
                >
                  Chọn địa chỉ
                </button>
              </div>
            </div>

            <div class="ss-panel-body">
              <!-- ✅ TẠI QUẦY (OFF) -->
              <template v-if="!isCounter">
                <div class="ss-kv">
                  <div class="ss-k">Tên khách hàng</div>
                  <div class="ss-v">{{ selectedKh ? getKhName(selectedKh) : "Khách lẻ" }}</div>
                </div>
                <div class="ss-hint">Tại quầy: chỉ cần chọn sản phẩm và thanh toán.</div>
              </template>

              <!-- ✅ GIAO HÀNG (ON) -->
              <template v-else>
                <!-- ĐÃ CHỌN KH -->
                <template v-if="selectedKh">
                  <div class="ss-kv">
                    <div class="ss-k">Tên khách hàng</div>
                    <div class="ss-v">{{ getKhName(selectedKh) }}</div>
                  </div>

                  <div class="ss-kv">
                    <div class="ss-k">Số điện thoại</div>
                    <div class="ss-v">{{ getKhPhone(selectedKh) || "—" }}</div>
                  </div>

                  <div class="ss-kv">
                    <div class="ss-k">Email</div>
                    <div class="ss-v">{{ getKhEmail(selectedKh) || "—" }}</div>
                  </div>

                  <div class="ss-kv">
                    <div class="ss-k">Địa chỉ giao hàng</div>
                    <div class="ss-v">
                      <span v-if="selectedDiaChi">{{ getDiaChiGiaoHangHienThi() }}</span>
                      <span v-else>Chưa chọn địa chỉ.</span>
                    </div>
                  </div>
                </template>

                <!-- KHÁCH VÃNG LAI -->
                <template v-else>
                  <div class="ss-guest-title">
                    Tên khách hàng: <span class="ss-guest-name">Khách lẻ</span>
                  </div>

                  <!-- 1 hàng: SĐT + Địa chỉ cụ thể -->
                  <div class="ss-guest-row2">
                    <div class="ss-field">
                      <div class="ss-filter-label">Số điện thoại <span class="ss-req">*</span></div>
                      <input
                        v-model="guest.soDienThoai"
                        class="form-control ss-input"
                        placeholder="Nhập số điện thoại..."
                        @input="onGuestPhoneInput"
                        :disabled="!hasPermission"
                      />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Địa chỉ cụ thể <span class="ss-req">*</span></div>
                      <input
                        v-model.trim="guest.diaChiCuThe"
                        class="form-control ss-input"
                        placeholder="Số nhà, ngõ, đường..."
                        :disabled="!hasPermission"
                      />
                    </div>
                  </div>

                  <!-- 1 hàng: Tỉnh - Quận - Xã -->
                  <div class="ss-guest-row3">
                    <div class="ss-field">
                      <div class="ss-filter-label">Tỉnh/Thành phố <span class="ss-req">*</span></div>
                      <v-select
                        v-model="guestTinh"
                        :options="guestTinhOptions"
                        label="name"
                        placeholder="Chọn Tỉnh/Thành phố..."
                        :clearable="true"
                        :disabled="!hasPermission"
                      />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Quận/Huyện <span class="ss-req">*</span></div>
                      <v-select
                        v-model="guestHuyen"
                        :options="guestHuyenOptions"
                        label="name"
                        placeholder="Chọn Quận/Huyện..."
                        :clearable="true"
                        :disabled="!hasPermission || !guestTinh"
                      />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Xã/Phường <span class="ss-req">*</span></div>
                      <v-select
                        v-model="guestXa"
                        :options="guestXaOptions"
                        label="name"
                        placeholder="Chọn Xã/Phường..."
                        :clearable="true"
                        :disabled="!hasPermission || !guestHuyen"
                      />
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>

          <!-- Payment card -->
          <div class="ss-panel ss-border">
            <div class="ss-panel-head">
              <div class="ss-panel-title">Thông tin thanh toán</div>

              <!-- ✅ Switch: OFF = tại quầy, ON = giao hàng -->
              <div class="ss-ship-toggle">
                <span class="ss-toggle-label">{{ isCounter ? "Giao hàng" : "Tại quầy" }}</span>
                <label class="ss-switch">
                  <input type="checkbox" v-model="isCounter" :disabled="!hasPermission" />
                  <span class="ss-slider"></span>
                </label>
              </div>
            </div>

            <div class="ss-panel-body">
              <!-- =========================
                   ✅ VOUCHER
                   ========================= -->
              <div class="ss-voucher-row">
                <div class="ss-field grow">
                  <div class="ss-filter-label">Mã phiếu giảm giá</div>
                  <input
                    v-model.trim="voucherCode"
                    class="form-control ss-input"
                    placeholder="Nhập mã (Enter để áp dụng)"
                    @keyup.enter="applyVoucherCode"
                    :disabled="!hasPermission"
                  />
                </div>

                <div class="ss-field ss-voucher-val">
                  <div class="ss-filter-label">Giá trị</div>
                  <input class="form-control ss-input" :value="voucherValueText" disabled />
                </div>
              </div>

              <div v-if="effectiveVoucher && tongTienHang > 0" class="ss-voucher-auto">
                <div class="ss-voucher-auto-line">
                  Áp dụng thành công phiếu giảm giá
                  <span class="ss-voucher-strong">{{ getVoucherLabel(effectiveVoucher) }}</span>
                </div>
                <div class="ss-voucher-auto-sub">
                  Giảm {{ formatMoney(giamGia) }}
                  <span v-if="voucherManual && voucherManual.__pinnedPos !== true" class="ss-voucher-tag">Đã nhập mã</span>
                  <span v-else-if="voucherManual && voucherManual.__pinnedPos === true" class="ss-voucher-tag">Đã giữ</span>
                </div>
                <div class="ss-voucher-auto-note">
                  Hệ thống kiểm tra ưu đãi theo thời gian thực. Nếu phiếu ngừng hoạt động, ưu đãi phù hợp nhất sẽ được tự động cập nhật.
                </div>
              </div>

              <!-- ✅ Gợi ý mua thêm để áp dụng voucher tốt hơn -->
              <div v-if="voucherSuggest && tongTienHang > 0" class="ss-voucher-suggest">
                Gợi ý: Mua thêm <b>{{ formatMoney(voucherSuggest.soTienCanThem) }}</b> để áp dụng
                <b>{{ getVoucherLabel(voucherSuggest.voucher) }}</b>
                và được giảm thêm khoảng <b>{{ formatMoney(voucherSuggest.giamThemDuKien) }}</b>.
              </div>
              <!-- ========================= END VOUCHER ========================= -->

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Tiền hàng</div>
                <div class="ss-pay-v">{{ formatMoney(tongTienHang) }}</div>
              </div>

              <!-- Phí vận chuyển: chỉ hiện khi giao hàng -->
              <div v-if="isCounter" class="ss-pay-kv">
                <div class="ss-pay-k ss-pay-k-ship">
                  <span>Phí vận chuyển</span>
                  <img class="ss-ghn-inline-logo" :src="ghnLogoUrl" alt="GHN Express" />
                </div>

                <div class="ss-pay-v ss-pay-inline">
                  <input class="form-control ss-input ss-ship-fee" type="text" :value="phiVanChuyenText" placeholder="0" disabled />

                  <button
                    class="ss-ship-refresh"
                    type="button"
                    title="Tính lại phí GHN"
                    @click="refreshShipFee"
                    :disabled="shipLoading || !hasPermission"
                  >
                    <span class="material-icons-outlined">refresh</span>
                  </button>

                  <span class="ss-currency">đ</span>
                </div>
              </div>

              <div v-if="isCounter" class="ss-ship-note" :class="{ err: !!shipErr }">
                <template v-if="shipLoading">Đang tính phí vận chuyển GHN...</template>
                <template v-else-if="shipErr">{{ shipErr }}</template>
                <template v-else>Phí vận chuyển lấy theo GHN.</template>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Giảm giá</div>
                <div class="ss-pay-v ss-red">- {{ formatMoney(giamGia) }}</div>
              </div>

              <div class="ss-pay-kv ss-pay-total">
                <div class="ss-pay-k">Tổng số tiền</div>
                <div class="ss-pay-v">{{ formatMoney(tongPhaiTra) }}</div>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k ss-pay-k-strong">
                  Khách thanh toán
                  <button class="ss-icon-btn ss-icon-inline" type="button" title="Nhập thanh toán" @click="openPayModal">
                    <span class="material-icons-outlined">payments</span>
                  </button>
                </div>

                <div class="ss-pay-v">{{ formatMoney(khachThanhToan) }}</div>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Tiền thiếu</div>
                <div class="ss-pay-v">{{ formatMoney(tienThieu) }}</div>
              </div>

              <button
                class="btn ss-btn-primary ss-confirm"
                type="button"
                :disabled="!canSubmit || showBetterVoucherModal || showInvalidVoucherModal"
                @click="openSubmitConfirm"
              >
                XÁC NHẬN ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========================= MODAL: CHỌN CTSP ========================= -->
    <div v-if="showCtspModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-lg" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Chọn biến thể để thêm vào đơn</div>
          <button class="ss-x" type="button" @click="closeCtspModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-filter">
            <div class="ss-field grow">
              <div class="ss-filter-label">Tìm kiếm</div>
              <input
                v-model.trim="ctspFilter.keyword"
                class="form-control ss-input"
                placeholder="Tìm mã, tên, màu, kích cỡ..."
                :disabled="!hasPermission"
              />
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Màu sắc</div>
              <select v-model="ctspFilter.mauSac" class="form-select ss-input" :disabled="!hasPermission">
                <option value="">Tất cả màu</option>
                <option v-for="m in ctspMauSacOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Kích cỡ</div>
              <select v-model="ctspFilter.kichCo" class="form-select ss-input" :disabled="!hasPermission">
                <option value="">Tất cả kích cỡ</option>
                <option v-for="k in ctspKichCoOptions" :key="k" :value="k">{{ k }}</option>
              </select>
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Sản phẩm</div>
              <select v-model="ctspFilter.tenSanPham" class="form-select ss-input" :disabled="!hasPermission">
                <option value="">Tất cả sản phẩm</option>
                <option v-for="p in ctspSanPhamOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <button class="btn ss-btn-outline ss-reset" type="button" @click="resetCtspFilter" :disabled="!hasPermission">
              Đặt lại
            </button>
          </div>

          <div class="ss-table-wrap">
            <table class="table ss-table mb-0">
              <thead>
                <tr>
                  <th class="col-stt">STT</th>
                  <th class="col-code">Mã</th>
                  <th class="col-img">Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Màu sắc</th>
                  <th>Kích cỡ</th>
                  <th class="col-qty">Số lượng</th>
                  <th class="col-price">Giá bán</th>
                  <th class="col-action">Hành động</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(row, idx) in pagedCtsp" :key="row.id">
                  <td class="col-stt">{{ (ctspPage - 1) * ctspPageSize + idx + 1 }}</td>
                  <td class="col-code">{{ row.maCtsp }}</td>
                  <td class="col-img">
                    <div class="ss-thumb thumb-wrap">
                      <img
                        v-if="resolveImage(row.anhUrl)"
                        :src="resolveImage(row.anhUrl)"
                        class="ss-thumb-img"
                        alt=""
                        @error="onImgErr"
                      />
                      <div v-else class="ss-thumb-ph"></div>

                      <span
                        v-if="getPhanTramGiamDisplay(row) > 0"
                        class="discount-badge sm"
                        :title="getGiamGiaTitle(row)"
                      >
                        -{{ getPhanTramGiamDisplay(row) }}%
                      </span>
                    </div>
                  </td>
                  <td>{{ row.tenSanPham }}</td>
                  <td>{{ row.mauSac }}</td>
                  <td>{{ row.kichCo }}</td>

                  <td class="col-qty" :title="`Tồn kho DB: ${Number(row.soLuong || 0)}`">
                    {{ Number(row.__available || 0) }}
                  </td>

                  <td class="col-price">
                    <div v-if="showGiaGoc(row)" class="ss-price-old">{{ formatMoney(getGiaGoc(row)) }}</div>
                    <div class="ss-price-now">{{ formatMoney(getGiaThucTe(row)) }}</div>
                  </td>

                  <td class="col-action">
                    <div class="ss-pick-wrap">
                      <button
                        class="btn ss-btn-outline ss-btn-mini"
                        type="button"
                        @click="pickCtsp(row, 1)"
                        :disabled="Number(row.__available || 0) <= 0 || !hasPermission"
                        :title="Number(row.__available || 0) <= 0 ? 'Hết hàng' : 'Thêm vào đơn'"
                      >
                        Thêm
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="pagedCtsp.length === 0">
                  <td colspan="9" class="ss-empty-row">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ss-pagi">
            <div class="ss-pageinfo">Trang {{ ctspPage }} / {{ ctspTotalPages }} · {{ filteredCtsp.length }} biến thể</div>
            <div class="ss-pagebtns">
              <button class="btn ss-btn-outline ss-btn-mini" type="button" :disabled="ctspPage <= 1" @click="ctspPage--">
                Trước
              </button>
              <button
                class="btn ss-btn-outline ss-btn-mini"
                type="button"
                :disabled="ctspPage >= ctspTotalPages"
                @click="ctspPage++"
              >
                Sau
              </button>
            </div>
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="closeCtspModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: QR ========================= -->
    <div v-if="showQrModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Quét QR sản phẩm</div>
          <button class="ss-x" type="button" @click="closeQrModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-qr-hint">Đưa QR vào khung, hệ thống sẽ tự nhận và thêm CTSP vào đơn.</div>

          <div class="ss-qr-wrap">
            <div id="ss-qr-reader" class="ss-qr-reader"></div>
          </div>

          <div v-if="qrError" class="ss-api-hint">{{ qrError }}</div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="restartQr">Quét lại</button>
          <button class="btn ss-btn-primary" type="button" @click="closeQrModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CHỌN KH ========================= -->
    <div v-if="showKhModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-kh" role="dialog" aria-modal="true">
        <div class="ss-modal-head ss-kh-head">
          <div class="ss-modal-title">Chọn khách hàng</div>
          <button class="ss-x" type="button" @click="closeKhModal">×</button>
        </div>

        <div class="ss-kh-body">
          <div class="ss-kh-top">
            <input
              v-model.trim="khFilter.keyword"
              class="form-control ss-kh-search"
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              :disabled="!hasPermission"
            />
            <button class="btn ss-kh-reload" type="button" @click="reloadKh" :disabled="!hasPermission">
              Tải lại
            </button>
          </div>

          <div v-if="khErr" class="ss-api-hint">{{ khErr }}</div>

          <div v-else class="ss-kh-tablewrap">
            <table class="table ss-kh-table mb-0">
              <thead>
                <tr>
                  <th class="kh-col-stt">#</th>
                  <th class="kh-col-name">Tên khách</th>
                  <th class="kh-col-phone">Số điện thoại</th>
                  <th class="kh-col-addr">Địa chỉ</th>
                  <th class="kh-col-act">Hành động</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(k, idx) in filteredKh" :key="k.id">
                  <td class="kh-col-stt">{{ idx + 1 }}</td>
                  <td class="kh-col-name">{{ getKhName(k) }}</td>
                  <td class="kh-col-phone">{{ getKhPhone(k) }}</td>
                  <td class="kh-col-addr">{{ khAddrCache[k.id] || renderKhDiaChi(k) || "—" }}</td>
                  <td class="kh-col-act">
                    <button class="btn ss-kh-pick" type="button" @click="pickKh(k)" :disabled="!hasPermission">
                      Chọn
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredKh.length === 0">
                  <td colspan="5" class="ss-empty-row">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ss-kh-foot">
            <button class="btn ss-kh-close" type="button" @click="closeKhModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CHỌN ĐỊA CHỈ ========================= -->
    <div v-if="showDiaChiModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Chọn địa chỉ</div>
          <button class="ss-x" type="button" @click="closeDiaChiModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div v-if="dcErr" class="ss-api-hint">{{ dcErr }}</div>

          <div v-else class="ss-dc-list">
            <button
              v-for="dc in diaChiList"
              :key="dc.id"
              class="ss-dc-item"
              :class="{ active: selectedDiaChi && selectedDiaChi.id === dc.id }"
              type="button"
              @click="pickDiaChi(dc)"
              :disabled="!hasPermission"
            >
              <div class="ss-dc-line">
                <span class="ss-dc-name">{{ dc.hoTenNguoiNhan || getKhName(selectedKh) || "Khách" }}</span>
                <span v-if="dc.macDinh" class="ss-badge">Mặc định</span>
              </div>
              <div class="ss-dc-text">{{ renderDiaChiDayDuTheoObj(dc) }}</div>
            </button>

            <div v-if="diaChiList.length === 0" class="ss-empty-row">Khách hàng chưa có địa chỉ.</div>
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="closeDiaChiModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: THANH TOÁN ========================= -->
    <div v-if="showPayModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-pay" role="dialog" aria-modal="true">
        <div class="ss-modal-head ss-pay-head">
          <div class="ss-modal-title">Thanh toán</div>
          <button class="ss-x" type="button" @click="closePayModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-paybox">
            <div class="ss-paybox-row ss-paybox-row-first">
              <div class="ss-paybox-k">Tổng số tiền</div>
              <div class="ss-paybox-v ss-paybox-red">{{ formatMoney(tongPhaiTra) }}</div>
            </div>

            <div class="ss-paygrid">
              <div class="ss-field">
                <div class="ss-label-row">
                  <div class="ss-label">Tiền mặt</div>
                  <button class="ss-link" type="button" @click="fillPayConLai('TIEN_MAT')" :disabled="!hasPermission">
                    Còn lại
                  </button>
                </div>
                <input
                  :value="payTienMatText"
                  type="text"
                  class="form-control ss-input"
                  placeholder="Nhập tiền mặt..."
                  @input="onPayTienMatInput"
                  :disabled="!hasPermission"
                />
              </div>

              <div class="ss-field">
                <div class="ss-label-row">
                  <div class="ss-label">Chuyển khoản</div>
                  <button class="ss-link" type="button" @click="fillPayConLai('CHUYEN_KHOAN')" :disabled="!hasPermission">
                    Còn lại
                  </button>
                </div>
                <input
                  :value="payChuyenKhoanText"
                  type="text"
                  class="form-control ss-input"
                  placeholder="Nhập chuyển khoản..."
                  @input="onPayChuyenKhoanInput"
                  :disabled="!hasPermission"
                />
              </div>
            </div>

            <div v-if="payChuyenKhoanNum > 0" class="ss-field ss-mt-8">
              <div class="ss-label">Mã tham chiếu</div>
              <input
                v-model.trim="payMaThamChieu"
                type="text"
                class="form-control ss-input"
                placeholder="VD: CK123..."
                :disabled="!hasPermission"
              />
            </div>

            <div class="ss-paybox-stat">
              <div class="ss-paybox-row">
                <div class="ss-paybox-k">Đã nhập</div>
                <div class="ss-paybox-v">{{ formatMoney(payTotalNum) }}</div>
              </div>

              <div class="ss-paybox-row">
                <div class="ss-paybox-k">Tiền thiếu</div>
                <div class="ss-paybox-v">{{ formatMoney(Math.max(0, tongPhaiTra - payTotalNum)) }}</div>
              </div>

              <div class="ss-paybox-row">
                <div class="ss-paybox-k">Tiền thừa</div>
                <div class="ss-paybox-v">{{ formatMoney(Math.max(0, payTotalNum - tongPhaiTra)) }}</div>
              </div>
            </div>

            <div class="ss-pay-note">
              <div class="ss-pay-note-line" v-if="payTienMatNum > 0 && payChuyenKhoanNum > 0">
                Hình thức: Kết hợp (tiền mặt + chuyển khoản)
              </div>
              <div class="ss-pay-note-line" v-else-if="payChuyenKhoanNum > 0">Hình thức: Chuyển khoản</div>
              <div class="ss-pay-note-line" v-else-if="payTienMatNum > 0">Hình thức: Tiền mặt</div>
            </div>
          </div>
        </div>

        <div class="ss-modal-actions ss-pay-actions">
          <button class="btn ss-btn-outline" type="button" @click="closePayModal">Đóng</button>
          <button class="btn ss-btn-primary" type="button" @click="confirmPay" :disabled="!hasPermission">Xong</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CONFIRM ĐẶT HÀNG ========================= -->
    <div v-if="showSubmitConfirmModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Xác nhận đặt hàng</div>
          <button class="ss-x" type="button" @click="closeSubmitConfirm">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-paybox">
            <div class="ss-paybox-row ss-paybox-row-first">
              <div class="ss-paybox-k">Loại đơn</div>
              <div class="ss-paybox-v">{{ isCounter ? "Giao hàng" : "Tại quầy" }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tiền hàng</div>
              <div class="ss-paybox-v">{{ formatMoney(tongTienHang) }}</div>
            </div>

            <div v-if="isCounter" class="ss-paybox-row">
              <div class="ss-paybox-k">Phí vận chuyển</div>
              <div class="ss-paybox-v">{{ formatMoney(phiVanChuyenNum) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Giảm giá</div>
              <div class="ss-paybox-v">- {{ formatMoney(giamGia) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tổng phải trả</div>
              <div class="ss-paybox-v ss-paybox-red">{{ formatMoney(tongPhaiTra) }}</div>
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Khách thanh toán</div>
              <div class="ss-paybox-v">{{ formatMoney(khachThanhToan) }}</div>
            </div>
          </div>

          <div class="ss-submit-note">
            Bạn có chắc muốn xác nhận? Sau khi xác nhận, hệ thống sẽ lưu/chốt đơn và cập nhật tồn kho.
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="closeSubmitConfirm">Hủy</button>
          <button class="btn ss-btn-primary" type="button" :disabled="submitting || !hasPermission" @click="confirmSubmitOrder">
            {{ submitting ? "Đang xử lý..." : "Xác nhận" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: VOUCHER MỚI TỐT HƠN ========================= -->
    <div v-if="showBetterVoucherModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">{{ betterVoucherModalTitleText }}</div>
          <button class="ss-x" type="button" @click="boQuaVoucherMoiTotHon">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-api-hint">
            Hệ thống vừa cập nhật phiếu giảm giá tốt hơn:
            <b>{{ getVoucherLabel(betterVoucherCandidate) }}</b>.
            <div style="margin-top: 8px"><b>{{ betterVoucherQuestionText }}</b></div>
          </div>

          <div class="ss-paybox" style="margin-top: 10px">
            <div class="ss-paybox-row ss-paybox-row-first">
              <div class="ss-paybox-k">Giảm hiện tại</div>
              <div class="ss-paybox-v">- {{ formatMoney(betterVoucherCurrentDiscount) }}</div>
            </div>
            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Giảm nếu áp dụng phiếu mới</div>
              <div class="ss-paybox-v ss-paybox-red">- {{ formatMoney(betterVoucherNewDiscount) }}</div>
            </div>
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="boQuaVoucherMoiTotHon">Giữ phiếu hiện tại</button>
          <button class="btn ss-btn-primary" type="button" @click="apDungVoucherMoiTotHon">Áp dụng phiếu mới</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: VOUCHER VỪA NGỪNG HOẠT ĐỘNG ========================= -->
    <div v-if="showInvalidVoucherModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-md" role="dialog" aria-modal="true">
        <div class="ss-modal-head">
          <div class="ss-modal-title">{{ invalidVoucherModalTitleText }}</div>
          <button class="ss-x" type="button" @click="dongModalVoucherInvalidUi">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-api-hint">
            {{ invalidVoucherMessageText }}
          </div>

          <div class="ss-paybox" style="margin-top: 10px">
            <div v-if="invalidVoucherPrevious" class="ss-paybox-row ss-paybox-row-first">
              <div class="ss-paybox-k">Phiếu vừa ngừng</div>
              <div class="ss-paybox-v">{{ getVoucherLabel(invalidVoucherPrevious) }}</div>
            </div>

            <div class="ss-paybox-row" :class="{ 'ss-paybox-row-first': !invalidVoucherPrevious }">
              <div class="ss-paybox-k">Giảm trước đó</div>
              <div class="ss-paybox-v">- {{ formatMoney(invalidVoucherPreviousDiscount) }}</div>
            </div>

            <template v-if="invalidVoucherReplacement">
              <div class="ss-paybox-row">
                <div class="ss-paybox-k">Phiếu tối ưu mới</div>
                <div class="ss-paybox-v">{{ getVoucherLabel(invalidVoucherReplacement) }}</div>
              </div>
              <div class="ss-paybox-row">
                <div class="ss-paybox-k">Giảm sau cập nhật</div>
                <div class="ss-paybox-v ss-paybox-red">- {{ formatMoney(invalidVoucherReplacementDiscount) }}</div>
              </div>
            </template>

            <template v-else>
              <div class="ss-paybox-row">
                <div class="ss-paybox-k">Phiếu tối ưu mới</div>
                <div class="ss-paybox-v">Không có</div>
              </div>
            </template>
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-primary" type="button" @click="dongModalVoucherInvalidUi">Đã hiểu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import SalesService from "@/services/sales/salesService.js";
import apiClient from "@/services/apiClient";
import vnAddressService from "@/services/vnAddressService";

import ghnLogoUrl from "@/assets/images/logo/Logo_GHN.webp";

import { useBanHangHoaDonSubmit } from "./composables/useBanHangHoaDonSubmit";
import { useBanHangKhachHang } from "./composables/useBanHangKhachHang";
import { useBanHangQr } from "./composables/useBanHangQr";
import { useBanHangSanPham } from "./composables/useBanHangSanPham";
import { useBanHangTabs } from "./composables/useBanHangTabs";
import { useBanHangTienIch } from "./composables/useBanHangTienIch";
import { useBanHangToast } from "./composables/useBanHangToast";
import { useBanHangTonKho } from "./composables/useBanHangTonKho";
import { useBanHangVoucherThanhToan } from "./composables/useBanHangVoucherThanhToan";
import { useBanHangQuyenCaLam } from "./composables/useBanHangQuyenCaLam";

defineOptions({ name: "SalesPage" });

const router = useRouter();

/* =========================
   TOAST + TIỆN ÍCH
========================= */
const { toast, showToast, hideToast } = useBanHangToast();
const tienIch = useBanHangTienIch();

/* =========================
   QUYỀN CA LÀM (CHỈ XEM / THAO TÁC)
========================= */
const quyenCaLam = useBanHangQuyenCaLam();
const hasPermission = quyenCaLam.hasPermission;

/* =========================
   CORE STATE
========================= */
const nguoiBan = ref(null);
const isCounter = ref(false);
const cartItems = ref([]);

/* =========================
   TỒN KHO LOCAL
========================= */
const tonKho = useBanHangTonKho({ safeParse: tienIch.safeParse });

/* =========================
   PLACEHOLDER callbacks
========================= */
let scheduleAutoVoucher = () => {};
let scheduleSyncHoaDon = () => {};
let persistActiveTab = () => {};
let persistTabs = () => {};
let applyTabState = () => {};

/* =========================
   KHÁCH HÀNG
========================= */
const kh = useBanHangKhachHang({
  SalesService,
  isCounter,
  showToast,
  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  persistActiveTab: () => persistActiveTab(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
  blurActive: tienIch.blurActive,
});

function ensureGuestDefaultName() {
  try {
    kh.guest.tenKhachHang = "Khách lẻ";
  } catch (e) {}
}

/* =========================
   ĐỊA CHỈ (KHÁCH VÃNG LAI) - VSELECT
========================= */
const guestTinhOptions = ref([]);
const guestHuyenOptions = ref([]);
const guestXaOptions = ref([]);

const guestTinh = ref(null);
const guestHuyen = ref(null);
const guestXa = ref(null);

function normName(x) {
  return String(x ?? "").trim().toLowerCase();
}
function findByName(options, name) {
  const key = normName(name);
  if (!key) return null;
  const arr = Array.isArray(options) ? options : [];
  return arr.find((o) => normName(o?.name) === key) || null;
}

async function loadTinhOptionsIfNeed() {
  if (guestTinhOptions.value.length) return;
  try {
    guestTinhOptions.value = await vnAddressService.getProvinces();
  } catch (e) {
    guestTinhOptions.value = [];
  }
}

async function syncGuestAddrFromStrings() {
  try {
    if (!isCounter.value) return;
    if (kh.selectedKh.value) return;

    await loadTinhOptionsIfNeed();

    const tinhName = (kh.guest.tinhThanh || "").trim();
    const huyenName = (kh.guest.huyenQuan || "").trim();
    const xaName = (kh.guest.xaPhuong || "").trim();

    const t = findByName(guestTinhOptions.value, tinhName);
    guestTinh.value = t || null;

    guestHuyenOptions.value = [];
    guestXaOptions.value = [];
    guestHuyen.value = null;
    guestXa.value = null;

    if (t?.code) {
      try {
        guestHuyenOptions.value = await vnAddressService.getDistricts(t.code);
      } catch {
        guestHuyenOptions.value = [];
      }

      const h = findByName(guestHuyenOptions.value, huyenName);
      guestHuyen.value = h || null;

      if (h?.code) {
        try {
          guestXaOptions.value = await vnAddressService.getWards(h.code);
        } catch {
          guestXaOptions.value = [];
        }
        const x = findByName(guestXaOptions.value, xaName);
        guestXa.value = x || null;
      }
    }
  } catch (e) {}
}

watch(guestTinh, async (nv) => {
  if (!isCounter.value) return;
  if (kh.selectedKh.value) return;

  kh.guest.tinhThanh = nv?.name || "";
  kh.guest.huyenQuan = "";
  kh.guest.xaPhuong = "";

  guestHuyen.value = null;
  guestXa.value = null;
  guestXaOptions.value = [];

  if (!nv?.code) {
    guestHuyenOptions.value = [];
    persistActiveTab();
    return;
  }

  try {
    guestHuyenOptions.value = await vnAddressService.getDistricts(nv.code);
  } catch {
    guestHuyenOptions.value = [];
  }

  persistActiveTab();
});

watch(guestHuyen, async (nv) => {
  if (!isCounter.value) return;
  if (kh.selectedKh.value) return;

  kh.guest.huyenQuan = nv?.name || "";
  kh.guest.xaPhuong = "";

  guestXa.value = null;

  if (!nv?.code) {
    guestXaOptions.value = [];
    persistActiveTab();
    return;
  }

  try {
    guestXaOptions.value = await vnAddressService.getWards(nv.code);
  } catch {
    guestXaOptions.value = [];
  }

  persistActiveTab();
});

watch(guestXa, (nv) => {
  if (!isCounter.value) return;
  if (kh.selectedKh.value) return;

  kh.guest.xaPhuong = nv?.name || "";
  persistActiveTab();
});

/* =========================
   SẢN PHẨM / GIỎ HÀNG
========================= */
const sp = useBanHangSanPham({
  SalesService,
  apiClient,
  cartItems,

  getAvailableQtyByCtspId: tonKho.getAvailableQtyByCtspId,
  getBaseQtyByCtspId: tonKho.getBaseQtyByCtspId,
  capNhatTonLocal: tonKho.capNhatTonLocal,
  dongBoTonKhoTuApi: tonKho.dongBoTonKhoTuApi,
  persistCtspBaseQtyMap: tonKho.persistCtspBaseQtyMap,

  showToast,
  clampInt: tienIch.clampInt,
  safeParse: tienIch.safeParse,
  resolveImage: tienIch.resolveImage,
  normalizePercent: tienIch.normalizePercent,
  toNumberSafe: tienIch.toNumberSafe,

  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
  blurActive: tienIch.blurActive,
});

/* =========================
   GĐ3: kiểm tra dòng giá cũ trong giỏ
========================= */
function isGiaDaDoiTrongGio(it) {
  try {
    return !!sp.isGiaDaThayDoiSoVoiServer(it);
  } catch (e) {
    return false;
  }
}

function getCtspIdByAny(obj) {
  const id = Number(obj?.idCtsp ?? obj?.ctspId ?? obj?.chiTietSanPhamId ?? obj?.id ?? 0);
  return Number.isFinite(id) ? id : 0;
}

function timCtspMoiNhatTheoItem(it) {
  try {
    const ctspId = getCtspIdByAny(it);
    if (!ctspId) return null;

    const list = Array.isArray(sp.ctspList?.value) ? sp.ctspList.value : [];
    return list.find((row) => getCtspIdByAny(row) === ctspId) || null;
  } catch (e) {
    return null;
  }
}

function getGiaThucTeDongHienTai(it) {
  try {
    return Number(sp.getGiaThucTe(it) || 0);
  } catch (e) {
    return 0;
  }
}

function getGiaThucTeMoiNhatTheoItem(it) {
  try {
    const row = timCtspMoiNhatTheoItem(it);
    if (!row) return getGiaThucTeDongHienTai(it);
    return Number(sp.getGiaThucTe(row) || 0);
  } catch (e) {
    return getGiaThucTeDongHienTai(it);
  }
}

function getThongBaoBienDongGia(it) {
  try {
    if (!isGiaDaDoiTrongGio(it)) return "";

    const giaCu = getGiaThucTeDongHienTai(it);
    const giaMoi = getGiaThucTeMoiNhatTheoItem(it);

    if (!Number.isFinite(giaCu) || !Number.isFinite(giaMoi) || giaCu === giaMoi) return "";

    return `Giá đã thay đổi: ${tienIch.formatMoney(giaCu)} → ${tienIch.formatMoney(giaMoi)}`;
  } catch (e) {
    return "";
  }
}

/* =========================
   TỔNG TIỀN HÀNG
========================= */
const tongTienHang = computed(() => {
  let s = 0;
  for (const it of cartItems.value) {
    const price = Number(sp.getGiaThucTe(it) || 0);
    const qty = Number(it.qty || 0);
    s += price * qty;
  }
  return s;
});

/* =========================
   VOUCHER + THANH TOÁN + SHIP
========================= */
const pay = useBanHangVoucherThanhToan({
  SalesService,
  isCounter,
  selectedKh: kh.selectedKh,
  tongTienHang,

  todayYmd: tienIch.todayYmd,
  toYmd: tienIch.toYmd,
  formatMoney: tienIch.formatMoney,
  parseMoneyText: tienIch.parseMoneyText,
  formatNumberText: tienIch.formatNumberText,

  showToast,
  persistActiveTab: () => persistActiveTab(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
});

scheduleAutoVoucher = pay.scheduleAutoVoucher;

/* =========================
   HIỂN THỊ ĐỊA CHỈ KHÁCH HÀNG (ĐẦY ĐỦ)
========================= */
function pickString(obj, keys) {
  try {
    for (const k of keys) {
      const v = String(obj?.[k] ?? "").trim();
      if (v) return v;
    }
  } catch (e) {}
  return "";
}

function renderDiaChiDayDuTheoObj(dc) {
  try {
    if (!dc) return "";

    const fullText = pickString(dc, ["diaChiDayDu", "diaChi", "fullAddress", "addressText", "shopAddress"]);
    if (fullText) return fullText;

    const cuThe = pickString(dc, ["diaChiCuThe", "diaChiChiTiet", "soNha", "duong", "address", "addressDetail"]);
    const xa = pickString(dc, ["xaPhuong", "phuongXa", "tenXa", "phuong", "xa", "wardName"]);
    const huyen = pickString(dc, ["huyenQuan", "quanHuyen", "tenHuyen", "quan", "huyen", "districtName"]);
    const tinh = pickString(dc, ["tinhThanh", "thanhPho", "tinh", "tenTinh", "provinceName"]);

    const parts = [];
    if (cuThe) parts.push(cuThe);
    if (xa) parts.push(xa);
    if (huyen) parts.push(huyen);
    if (tinh) parts.push(tinh);

    return parts.join(", ");
  } catch (e) {
    return "";
  }
}

function getDiaChiGiaoHangHienThi() {
  try {
    if (!isCounter.value) return "";
    const khach = kh.selectedKh.value;
    const dc = kh.selectedDiaChi.value;

    const textDc = dc ? renderDiaChiDayDuTheoObj(dc) : "";
    if (textDc) return textDc;

    const id = khach?.id;
    const cacheText = id != null ? String(kh.khAddrCache?.[id] || "").trim() : "";
    if (cacheText) return cacheText;

    if (khach && typeof kh.renderKhDiaChi === "function") {
      const t = String(kh.renderKhDiaChi(khach) || "").trim();
      if (t) return t;
    }

    return "";
  } catch (e) {
    return "";
  }
}

/* =========================
   GHN - TÍNH PHÍ VẬN CHUYỂN (BẮT BUỘC CALL API)
========================= */
const GHN_API_PREFIX = "/api/admin/ghn";

const shipLoading = ref(false);
const shipErr = ref("");

const ghnTinhOptions = ref([]);
const cacheQuanHuyenTheoTinh = new Map();
const cachePhuongXaTheoHuyen = new Map();

let shipTimer = null;

function setPhiVanChuyenNum(n) {
  const val = Math.max(0, Math.round(Number(n || 0)));
  pay.phiVanChuyen.value = val;
  pay.phiVanChuyenText.value = tienIch.formatNumberText(val);
  persistActiveTab();
  scheduleSyncHoaDon();
}

function boDauTiengViet(s) {
  try {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  } catch (e) {
    return String(s || "");
  }
}

function normalizeTenDiaChi(s) {
  const x = boDauTiengViet(s)
    .toLowerCase()
    .replace(/\b(tp|tp\.|thanh pho|tinh|quan|q\.|huyen|h\.|phuong|p\.|xa|x\.|thi tran|tt\.|thi xa)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return x;
}

function timTheoTenGanDung(options, tenCanTim) {
  const key = normalizeTenDiaChi(tenCanTim);
  if (!key) return null;

  const arr = Array.isArray(options) ? options : [];
  let found = arr.find((o) => normalizeTenDiaChi(o?.name) === key);
  if (found) return found;

  found =
    arr.find((o) => normalizeTenDiaChi(o?.name).includes(key)) ||
    arr.find((o) => key.includes(normalizeTenDiaChi(o?.name)));

  return found || null;
}

function mapTinhThanh(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((x) => ({
      code: Number(x?.provinceId),
      name: String(x?.provinceName || "").trim(),
    }))
    .filter((x) => Number.isFinite(x.code) && x.code > 0 && x.name);
}

function mapQuanHuyen(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((x) => ({
      code: Number(x?.districtId),
      name: String(x?.districtName || "").trim(),
    }))
    .filter((x) => Number.isFinite(x.code) && x.code > 0 && x.name);
}

function mapPhuongXa(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((x) => ({
      code: String(x?.wardCode || "").trim(),
      name: String(x?.wardName || "").trim(),
    }))
    .filter((x) => x.code && x.name);
}

async function loadGhnTinhOptionsIfNeed() {
  if (ghnTinhOptions.value.length) return;
  try {
    const res = await apiClient.get(`${GHN_API_PREFIX}/tinh-thanh`);
    ghnTinhOptions.value = mapTinhThanh(res?.data || []);
  } catch (e) {
    ghnTinhOptions.value = [];
  }
}

async function layQuanHuyenTheoTinhId(provinceId) {
  const pid = Number(provinceId);
  if (!Number.isFinite(pid) || pid <= 0) return [];
  if (cacheQuanHuyenTheoTinh.has(pid)) return cacheQuanHuyenTheoTinh.get(pid);

  try {
    const res = await apiClient.get(`${GHN_API_PREFIX}/quan-huyen/${pid}`);
    const list = mapQuanHuyen(res?.data || []);
    cacheQuanHuyenTheoTinh.set(pid, list);
    return list;
  } catch (e) {
    cacheQuanHuyenTheoTinh.set(pid, []);
    return [];
  }
}

async function layPhuongXaTheoHuyenId(districtId) {
  const did = Number(districtId);
  if (!Number.isFinite(did) || did <= 0) return [];
  if (cachePhuongXaTheoHuyen.has(did)) return cachePhuongXaTheoHuyen.get(did);

  try {
    const res = await apiClient.get(`${GHN_API_PREFIX}/phuong-xa/${did}`);
    const list = mapPhuongXa(res?.data || []);
    cachePhuongXaTheoHuyen.set(did, list);
    return list;
  } catch (e) {
    cachePhuongXaTheoHuyen.set(did, []);
    return [];
  }
}

function tachTinhHuyenXaTuChuoiDiaChi(diaChiText) {
  const parts = String(diaChiText || "")
    .split(",")
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  if (parts.length < 3) return { tinh: "", huyen: "", xa: "" };

  const last = normalizeTenDiaChi(parts[parts.length - 1]);
  if (last === "viet nam" && parts.length >= 4) {
    parts.pop();
  }

  const tinh = parts[parts.length - 1] || "";
  const huyen = parts[parts.length - 2] || "";
  const xa = parts[parts.length - 3] || "";

  return { tinh, huyen, xa };
}

async function resolveToDistrictWardByTenDiaChi({ tinh, huyen, xa }) {
  await loadGhnTinhOptionsIfNeed();

  const tinhOpt = timTheoTenGanDung(ghnTinhOptions.value, tinh);
  const provinceId = tinhOpt?.code;
  if (!provinceId) return null;

  const dsHuyen = await layQuanHuyenTheoTinhId(provinceId);
  const huyenOpt = timTheoTenGanDung(dsHuyen, huyen);
  const districtId = huyenOpt?.code;
  if (!districtId) return null;

  const dsXa = await layPhuongXaTheoHuyenId(districtId);
  const xaOpt = timTheoTenGanDung(dsXa, xa);
  const wardCode = xaOpt?.code ? String(xaOpt.code).trim() : "";
  if (!wardCode) return null;

  return { toDistrictId: Number(districtId), toWardCode: wardCode };
}

async function getToDistrictWardForShipAsync() {
  try {
    if (!isCounter.value) return null;

    if (kh.selectedKh.value && kh.selectedDiaChi.value) {
      const dc = kh.selectedDiaChi.value;

      const directDistrictId = Number(
        pickString(dc, ["toDistrictId", "districtId", "ghnDistrictId", "maQuanHuyenGhn", "district_id"]),
      );
      const directWardCode = pickString(dc, ["toWardCode", "wardCode", "ghnWardCode", "maPhuongXaGhn", "ward_code"]);
      if (Number.isFinite(directDistrictId) && directDistrictId > 0 && directWardCode) {
        return { toDistrictId: directDistrictId, toWardCode: directWardCode };
      }

      const textFull = getDiaChiGiaoHangHienThi();
      const parsedFull = tachTinhHuyenXaTuChuoiDiaChi(textFull);
      if (parsedFull.tinh && parsedFull.huyen && parsedFull.xa) {
        return await resolveToDistrictWardByTenDiaChi(parsedFull);
      }

      const tinh = pickString(dc, ["tinhThanh", "tinh", "tenTinh", "provinceName"]);
      const huyen = pickString(dc, ["huyenQuan", "quanHuyen", "tenHuyen", "districtName"]);
      const xa = pickString(dc, ["xaPhuong", "phuongXa", "tenXa", "wardName"]);
      if (tinh && huyen && xa) {
        return await resolveToDistrictWardByTenDiaChi({ tinh, huyen, xa });
      }

      return null;
    }

    const tinhName = String(kh.guest.tinhThanh || "").trim();
    const huyenName = String(kh.guest.huyenQuan || "").trim();
    const xaName = String(kh.guest.xaPhuong || "").trim();

    if (!tinhName || !huyenName || !xaName) return null;

    return await resolveToDistrictWardByTenDiaChi({
      tinh: tinhName,
      huyen: huyenName,
      xa: xaName,
    });
  } catch (e) {
    return null;
  }
}

async function tinhPhiVanChuyenTuGhn(forceToast = false) {
  try {
    shipErr.value = "";

    if (!isCounter.value) {
      setPhiVanChuyenNum(0);
      return true;
    }
    if (!Array.isArray(cartItems.value) || cartItems.value.length === 0) {
      setPhiVanChuyenNum(0);
      shipErr.value = "Chưa có sản phẩm để tính phí GHN.";
      return false;
    }

    shipLoading.value = true;

    const to = await getToDistrictWardForShipAsync();
    if (!to?.toDistrictId || !to?.toWardCode) {
      setPhiVanChuyenNum(0);
      shipErr.value = "Chưa đủ địa chỉ để tính phí GHN.";
      if (forceToast) showToast(shipErr.value, "info", 4200);
      shipLoading.value = false;
      return false;
    }

    const body = {
      toDistrictId: Number(to.toDistrictId),
      toWardCode: String(to.toWardCode),
      tongGiaTriHang: Math.max(0, Math.round(Number(tongTienHang.value || 0))),
      tongCanNang: 1200,
      dai: 30,
      rong: 20,
      cao: 10,
    };

    const res = await apiClient.post(`${GHN_API_PREFIX}/tinh-phi-van-chuyen`, body);
    const data = res?.data || {};
    const fee = Number(data?.total ?? data?.phiVanChuyen ?? 0);

    if (!Number.isFinite(fee) || fee < 0) {
      setPhiVanChuyenNum(0);
      shipErr.value = "Không lấy được phí vận chuyển từ GHN.";
      if (forceToast) showToast(shipErr.value, "error", 4200);
      shipLoading.value = false;
      return false;
    }

    setPhiVanChuyenNum(fee);
    shipErr.value = "";
    shipLoading.value = false;
    return true;
  } catch (e) {
    setPhiVanChuyenNum(0);

    const msg =
      e?.response?.data?.message ||
      e?.message ||
      "Không tính được phí vận chuyển GHN. Vui lòng thử lại.";

    shipErr.value = String(msg);
    if (forceToast) showToast(shipErr.value, "error", 4200);

    shipLoading.value = false;
    return false;
  }
}

function scheduleShipFee(ms = 450) {
  try {
    clearTimeout(shipTimer);
    shipTimer = setTimeout(() => {
      tinhPhiVanChuyenTuGhn(false);
    }, ms);
  } catch (e) {}
}

function refreshShipFee() {
  tinhPhiVanChuyenTuGhn(true);
}

/* =========================
   TABS + AUTO CLEAR
========================= */
function dongTatCaModal() {
  sp.showCtspModal.value = false;
  qr.showQrModal.value = false;
  kh.showKhModal.value = false;
  kh.showDiaChiModal.value = false;
  pay.showPayModal.value = false;
  hd.showSubmitConfirmModal.value = false;

  try {
    if (pay?.showBetterVoucherModal?.value) {
      if (typeof pay?.boQuaVoucherMoiTotHon === "function") pay.boQuaVoucherMoiTotHon();
      else pay.showBetterVoucherModal.value = false;
    }
  } catch (e) {}

  try {
    if (pay?.showInvalidVoucherModal?.value) {
      if (typeof pay?.dongModalVoucherInvalid === "function") pay.dongModalVoucherInvalid();
      else pay.showInvalidVoucherModal.value = false;
    }
  } catch (e) {}
}

const tabsApi = useBanHangTabs({
  isCounter,
  cartItems,

  selectedKh: kh.selectedKh,
  diaChiList: kh.diaChiList,
  selectedDiaChi: kh.selectedDiaChi,

  autoVoucher: pay.autoVoucher,
  voucherManual: pay.voucherManual,
  voucherCode: pay.voucherCode,

  khachThanhToan: pay.khachThanhToan,
  payMethod: pay.payMethod,
  payTienMat: pay.payTienMat,
  payChuyenKhoan: pay.payChuyenKhoan,
  payMaThamChieu: pay.payMaThamChieu,
  payTienMatText: pay.payTienMatText,
  payChuyenKhoanText: pay.payChuyenKhoanText,

  guest: kh.guest,

  phiVanChuyen: pay.phiVanChuyen,
  phiVanChuyenText: pay.phiVanChuyenText,

  apiClient,
  showToast,
  capNhatTonLocal: tonKho.capNhatTonLocal,

  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  scheduleSyncHoaDon: () => scheduleSyncHoaDon(),
  ensureBaseQtyIfCartHasItems: sp.ensureBaseQtyIfCartHasItems,
  capNhatDotGiamGiaChoGioHang: sp.capNhatDotGiamGiaChoGioHang,
  loadDiaChiAndPickDefault: kh.loadDiaChiAndPickDefault,

  xoaTonKhoLocal: tonKho.xoaTonKhoLocal,
  dongTatCaModal,
  blurActive: tienIch.blurActive,
  formatNumberText: tienIch.formatNumberText,
});

const tabs = tabsApi.tabs;
const activeTab = tabsApi.activeTab;

persistActiveTab = tabsApi.persistActiveTab;
persistTabs = tabsApi.persistTabs;
applyTabState = tabsApi.applyTabState;

/* =========================
   ĐỒNG BỘ DB + SUBMIT
========================= */
const hd = useBanHangHoaDonSubmit({
  apiClient,
  router,

  tabs,
  activeTab,

  isCounter,
  cartItems,

  selectedKh: kh.selectedKh,
  selectedDiaChi: kh.selectedDiaChi,
  diaChiList: kh.diaChiList,
  guest: kh.guest,

  nguoiBan,

  effectiveVoucher: pay.effectiveVoucher,
  phiVanChuyenNum: pay.phiVanChuyenNum,
  tongTienHang,
  tongPhaiTra: pay.tongPhaiTra,

  ctspList: sp.ctspList,
  loadCtspForPos: sp.loadCtspForPos,
  ensureBaseQtyIfCartHasItems: sp.ensureBaseQtyIfCartHasItems,
  capNhatDotGiamGiaChoGioHang: sp.capNhatDotGiamGiaChoGioHang,

  scheduleAutoVoucher: () => scheduleAutoVoucher(),
  persistActiveTab: () => persistActiveTab(),
  persistTabs: () => persistTabs(),
  applyTabState: (t) => applyTabState(t),

  showToast,

  getKhName: kh.getKhName,
  getKhPhone: kh.getKhPhone,
  getKhEmail: kh.getKhEmail,
  renderDiaChi: kh.renderDiaChi,

  blurActive: tienIch.blurActive,
  getMaxQtyForItem: sp.getMaxQtyForItem,
});

scheduleSyncHoaDon = hd.scheduleSyncHoaDon;
const submitting = hd.submitting;

/* =========================
   QR
========================= */
const qr = useBanHangQr({
  ctspList: sp.ctspList,
  loadCtspForPos: sp.loadCtspForPos,
  pickCtsp: (row, qty = 1) => sp.pickCtsp(row, qty),
  getAvailableQtyByCtspId: tonKho.getAvailableQtyByCtspId,
  blurActive: tienIch.blurActive,
});

/* =========================
   COMPUTED HIỂN THỊ
========================= */
const nguoiBanTen = computed(() => {
  const u = nguoiBan.value || {};
  return u.hoTen || u.tenNhanVien || u.ten || u.username || "";
});

const hasOrders = computed(() => Array.isArray(tabs.value) && tabs.value.length > 0);

const canSubmit = computed(() => {
  if (!hasOrders.value) return false;
  if (cartItems.value.length === 0) return false;
  if (submitting.value) return false;
  if (pay.showBetterVoucherModal.value) return false;
  if (pay.showInvalidVoucherModal.value) return false;

  for (const it of cartItems.value) {
    const qty = Number(it?.qty || 0);
    if (!Number.isFinite(qty) || qty < 1) return false;
    const max = sp.getMaxQtyForItem(it);
    if (qty > max) return false;
  }

  if (isCounter.value) {
    if (kh.selectedKh.value) {
      if (!kh.selectedDiaChi.value) return false;
    } else {
      const sdt = String(kh.guest.soDienThoai || "").replace(/\D/g, "");
      const dc = (kh.guest.diaChiCuThe || "").trim();
      const tinh = String(kh.guest.tinhThanh || "").trim();
      const huyen = String(kh.guest.huyenQuan || "").trim();
      const xa = String(kh.guest.xaPhuong || "").trim();

      if (!/^\d{9,11}$/.test(sdt)) return false;
      if (!dc || !tinh || !huyen || !xa) return false;
    }
  }

  const payNum = Number(pay.khachThanhToan.value || 0);
  const total = Number(pay.tongPhaiTra.value || 0);
  if (!Number.isFinite(payNum) || payNum <= 0) return false;

  if (pay.payMethod.value === "CHUYEN_KHOAN" || pay.payMethod.value === "KET_HOP") {
    if (payNum !== total) return false;
  } else {
    if (payNum < total) return false;
  }

  return true;
});

const anyModalOpen = computed(() => {
  return !!(
    sp.showCtspModal.value ||
    qr.showQrModal.value ||
    kh.showKhModal.value ||
    kh.showDiaChiModal.value ||
    pay.showPayModal.value ||
    hd.showSubmitConfirmModal.value ||
    pay.showBetterVoucherModal.value ||
    pay.showInvalidVoucherModal.value
  );
});

watch(anyModalOpen, (val) => {
  try {
    document.body.style.overflow = val ? "hidden" : "";
  } catch (e) {}
});

watch(tongTienHang, () => {
  scheduleAutoVoucher();
  persistActiveTab();
  if (isCounter.value) scheduleShipFee();
});

watch(
  cartItems,
  () => {
    persistActiveTab();
  },
  { deep: true },
);

watch(kh.selectedKh, async () => {
  scheduleAutoVoucher();
  persistActiveTab();

  if (!kh.selectedKh.value) {
    ensureGuestDefaultName();
    await syncGuestAddrFromStrings();
  }

  if (isCounter.value) scheduleShipFee(200);
});

watch(kh.selectedDiaChi, () => {
  scheduleAutoVoucher();
  persistActiveTab();
  if (isCounter.value) scheduleShipFee(200);
});

watch(
  () => [kh.guest.tinhThanh, kh.guest.huyenQuan, kh.guest.xaPhuong],
  () => {
    if (isCounter.value && !kh.selectedKh.value) scheduleShipFee(200);
  },
  { deep: true },
);

watch(pay.khachThanhToan, () => {
  persistActiveTab();
});

watch(pay.payMethod, () => {
  persistActiveTab();
});

watch(pay.payTienMatText, () => {
  persistActiveTab();
});

watch(pay.payChuyenKhoanText, () => {
  persistActiveTab();
});

watch(pay.payMaThamChieu, () => {
  persistActiveTab();
});

watch(activeTab, async () => {
  if (isCounter.value && !kh.selectedKh.value) {
    ensureGuestDefaultName();
    await syncGuestAddrFromStrings();
  }

  if (isCounter.value) scheduleShipFee(250);
});

watch(isCounter, async (val) => {
  if (val) {
    const khId = kh.selectedKh.value?.id;
    if (khId) {
      if (!Array.isArray(kh.diaChiList.value) || kh.diaChiList.value.length === 0) {
        await kh.loadDiaChiAndPickDefault(khId);
      } else if (!kh.selectedDiaChi.value) {
        let def = kh.diaChiList.value.find((x) => x.macDinh === true || x.macDinh === 1);
        if (!def && kh.diaChiList.value.length > 0) def = kh.diaChiList.value[0];
        kh.selectedDiaChi.value = def || null;
      }
    } else {
      ensureGuestDefaultName();
      await syncGuestAddrFromStrings();
    }

    scheduleShipFee(200);
  } else {
    kh.selectedDiaChi.value = null;
    kh.diaChiList.value = [];
    shipErr.value = "";
    shipLoading.value = false;
    setPhiVanChuyenNum(0);
  }

  persistActiveTab();
  scheduleSyncHoaDon();
});

watch(
  () => pay?.voucherPinned?.value,
  (v) => {
    try {
      if (!v) return;

      if (!pay.voucherManual.value) {
        pay.voucherManual.value = { ...v, __pinnedPos: true };

        const code = String(v.maPhieuGiamGia || v.ma || v.code || "").trim();
        if (code) pay.voucherCode.value = code;

        pay.voucherPinned.value = null;

        persistActiveTab();
        scheduleSyncHoaDon();
      } else {
        pay.voucherPinned.value = null;
      }
    } catch (e) {}
  },
);

/* =========================
   LOGIN USER
========================= */
function normalizeNguoiBan(u) {
  if (!u || typeof u !== "object") return null;
  const id = u.idNhanVien || u.nhanVienId || u.id || u.userId || u.nhanVien?.id || null;
  const hoTen = u.hoTen || u.tenNhanVien || u.ten || u.fullName || u.name || u.username || "";
  return { id, hoTen, role: u.role || u.quyen || null };
}

function getNguoiBanDangNhap() {
  const tryParse = (raw) => tienIch.safeParse(raw || "null", null);

  const prefer = tryParse(localStorage.getItem("ss_nguoi_ban"));
  if (prefer) return prefer;

  const u1 = tryParse(localStorage.getItem("user"));
  if (u1) return normalizeNguoiBan(u1);

  const u2 = tryParse(sessionStorage.getItem("ss_nguoi_ban"));
  if (u2) return u2;

  const u3 = tryParse(sessionStorage.getItem("user"));
  if (u3) return normalizeNguoiBan(u3);

  return null;
}

/* =========================
   MOUNT / UNMOUNT
========================= */
onMounted(async () => {
  try {
    quyenCaLam.reloadPermission?.();
  } catch (e) {}

  tabsApi.khoiTaoAutoClearVaSyncStorage();

  nguoiBan.value = getNguoiBanDangNhap();

  tonKho.restoreCtspBaseQtyMap();
  tabsApi.khoiPhucTabsTuLocal();

  ensureGuestDefaultName();
  await loadTinhOptionsIfNeed();
  await syncGuestAddrFromStrings();

  await sp.ensureBaseQtyIfCartHasItems();
  await sp.capNhatDotGiamGiaChoGioHang();
  scheduleAutoVoucher();

  if (hasOrders.value) scheduleSyncHoaDon();

  if (isCounter.value) scheduleShipFee(250);
});

onBeforeUnmount(() => {
  try {
    qr.stopQr?.();
  } catch (e) {}
  try {
    document.body.style.overflow = "";
  } catch (e) {}
  try {
    clearTimeout(shipTimer);
  } catch (e) {}
});

/* =========================
   HÀM PHỤ CHO TEMPLATE
========================= */
function getVoucherLabel(v) {
  if (!v) return "";

  const code = v.maPhieuGiamGia || v.ma || v.code || "";
  const giaTriRaw = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);

  const isPercent =
    typeof pay?.isVoucherPercent === "function"
      ? pay.isVoucherPercent(v)
      : (() => {
          const raw = v?.loaiPhieuGiamGia;
          if (raw === false || raw === 0 || raw === "0") return true;
          if (raw === true || raw === 1 || raw === "1") return false;
          const s = String(raw ?? "").trim().toLowerCase();
          if (s === "false" || s === "0") return true;
          if (s === "true" || s === "1") return false;
          const n = Number(giaTriRaw || 0);
          if (Number.isFinite(n) && n > 100) return false;
          return true;
        })();

  const normalizePct = (x) => {
    let n = Number(x ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (n > 0 && n <= 1) n = n * 100;
    n = Math.round(n);
    return Math.max(0, Math.min(100, n));
  };

  if (code && isPercent) return `${code} (${normalizePct(giaTriRaw)}%)`;
  if (code && !isPercent) return `${code} (${tienIch.formatMoney(giaTriRaw)})`;
  if (code) return code;

  if (isPercent) return `${normalizePct(giaTriRaw)}%`;
  return tienIch.formatMoney(giaTriRaw);
}

/* =========================
   CHUYỂN VỀ KHÁCH VÃNG LAI
========================= */
async function chonKhachVangLaiNoiBo() {
  try {
    if (!kh.selectedKh.value) return;

    kh.selectedKh.value = null;
    kh.selectedDiaChi.value = null;
    kh.diaChiList.value = [];

    ensureGuestDefaultName();

    if (isCounter.value) {
      await syncGuestAddrFromStrings();
      scheduleShipFee(200);
    } else {
      shipErr.value = "";
      shipLoading.value = false;
      setPhiVanChuyenNum(0);
    }

    scheduleAutoVoucher();
    persistActiveTab();
    scheduleSyncHoaDon();

    showToast("Đã chuyển về khách vãng lai.", "success", 2200);
  } catch (e) {
    showToast("Không thể chuyển về khách vãng lai.", "error", 3000);
  }
}

/* =========================
   ALIAS
========================= */
const formatMoney = tienIch.formatMoney;

const tabItemCount = tabsApi.tabItemCount;
const createOrderTab = quyenCaLam.guard(tabsApi.createOrderTab);
const switchTab = tabsApi.switchTab;
const closeTab = quyenCaLam.guard(tabsApi.closeTab);

const showCtspModal = sp.showCtspModal;
const openCtspModal = quyenCaLam.guard(sp.openCtspModal);
const closeCtspModal = sp.closeCtspModal;

const ctspFilter = sp.ctspFilter;
const filteredCtsp = sp.filteredCtsp;
const ctspPage = sp.ctspPage;
const ctspPageSize = sp.ctspPageSize;
const ctspTotalPages = sp.ctspTotalPages;
const pagedCtsp = sp.pagedCtsp;

const ctspMauSacOptions = sp.ctspMauSacOptions;
const ctspKichCoOptions = sp.ctspKichCoOptions;
const ctspSanPhamOptions = sp.ctspSanPhamOptions;

const resolveImage = sp.resolveImage;
const onImgErr = sp.onImgErr;

const getGiaGoc = sp.getGiaGoc;
const getGiaThucTe = sp.getGiaThucTe;
const showGiaGoc = sp.showGiaGoc;

const getPhanTramGiamDisplay = sp.getPhanTramGiamDisplay;
const getGiamGiaTitle = sp.getGiamGiaTitle;

const getMaxQtyForItem = sp.getMaxQtyForItem;
const incQty = sp.incQty;
const decQty = sp.decQty;
const onQtyInput = sp.onQtyInput;
const onQtyBlur = sp.onQtyBlur;
const removeItem = sp.removeItem;

const pickCtsp = quyenCaLam.guard((row, qty = 1) => sp.pickCtsp(row, qty));
const resetCtspFilter = sp.resetCtspFilter;

const showQrModal = qr.showQrModal;
const qrError = qr.qrError;
const openQrModal = quyenCaLam.guard(qr.openQrModal);
const closeQrModal = qr.closeQrModal;
const restartQr = qr.restartQr;

const showKhModal = kh.showKhModal;
const khErr = kh.khErr;
const khFilter = kh.khFilter;
const filteredKh = kh.filteredKh;

const selectedKh = kh.selectedKh;
const guest = kh.guest;

const showDiaChiModal = kh.showDiaChiModal;
const dcErr = kh.dcErr;
const diaChiList = kh.diaChiList;
const selectedDiaChi = kh.selectedDiaChi;

const khAddrCache = kh.khAddrCache;

const getKhName = kh.getKhName;
const getKhPhone = kh.getKhPhone;
const getKhEmail = kh.getKhEmail;
const renderDiaChi = kh.renderDiaChi;
const renderKhDiaChi = kh.renderKhDiaChi;

const onGuestPhoneInput = kh.onGuestPhoneInput;
const chonKhachVangLai = quyenCaLam.guard(chonKhachVangLaiNoiBo);

const openKhModal = quyenCaLam.guard(kh.openKhModal);
const closeKhModal = kh.closeKhModal;
const reloadKh = kh.reloadKh;
const pickKh = quyenCaLam.guard(kh.pickKh);

const openDiaChiModal = quyenCaLam.guard(kh.openDiaChiModal);
const closeDiaChiModal = kh.closeDiaChiModal;
const pickDiaChi = quyenCaLam.guard(kh.pickDiaChi);

const voucherCode = pay.voucherCode;
const voucherManual = pay.voucherManual;
const effectiveVoucher = pay.effectiveVoucher;
const voucherValueText = pay.voucherValueText;
const giamGia = pay.giamGia;

const voucherSuggest = pay.voucherSuggest;

const showBetterVoucherModal = pay.showBetterVoucherModal;
const betterVoucherCandidate = pay.betterVoucherCandidate;
const betterVoucherCurrentDiscount = pay.betterVoucherCurrentDiscount;
const betterVoucherNewDiscount = pay.betterVoucherNewDiscount;
const apDungVoucherMoiTotHon = pay.apDungVoucherMoiTotHon;
const boQuaVoucherMoiTotHon = pay.boQuaVoucherMoiTotHon;

const betterVoucherModalTitleText = pay.betterVoucherModalTitleText;
const betterVoucherQuestionText = pay.betterVoucherQuestionText;

const showInvalidVoucherModal = pay.showInvalidVoucherModal;
const invalidVoucherPrevious = pay.invalidVoucherPrevious;
const invalidVoucherReplacement = pay.invalidVoucherReplacement;
const invalidVoucherPreviousDiscount = pay.invalidVoucherPreviousDiscount;
const invalidVoucherReplacementDiscount = pay.invalidVoucherReplacementDiscount;
const invalidVoucherModalTitleText = pay.invalidVoucherModalTitleText;
const invalidVoucherMessageText = pay.invalidVoucherMessageText;

function dongModalVoucherInvalidUi() {
  pay.dongModalVoucherInvalid();
}

const phiVanChuyenText = pay.phiVanChuyenText;
const phiVanChuyenNum = pay.phiVanChuyenNum;

const tongPhaiTra = pay.tongPhaiTra;
const khachThanhToan = pay.khachThanhToan;
const tienThieu = pay.tienThieu;

const applyVoucherCode = pay.applyVoucherCode;

const showPayModal = pay.showPayModal;
const payMethod = pay.payMethod;

const payTienMatText = pay.payTienMatText;
const payChuyenKhoanText = pay.payChuyenKhoanText;
const payTienMatNum = pay.payTienMatNum;
const payChuyenKhoanNum = pay.payChuyenKhoanNum;
const payTotalNum = pay.payTotalNum;

const payMaThamChieu = pay.payMaThamChieu;

const openPayModal = quyenCaLam.guard(pay.openPayModal);
function closePayModal() {
  pay.closePayModal(tienIch.blurActive);
}
const confirmPay = quyenCaLam.guard(() => {
  pay.confirmPay(tienIch.blurActive);
});
const onPayTienMatInput = pay.onPayTienMatInput;
const onPayChuyenKhoanInput = pay.onPayChuyenKhoanInput;
const fillPayConLai = pay.fillPayConLai;

const showSubmitConfirmModal = hd.showSubmitConfirmModal;

const openSubmitConfirm = quyenCaLam.guard(async () => {
  if (pay.showBetterVoucherModal.value) return;
  if (pay.showInvalidVoucherModal.value) return;

  if (isCounter.value) {
    const ok = await tinhPhiVanChuyenTuGhn(true);
    if (!ok) return;
  }

  if (pay.showBetterVoucherModal.value) return;
  if (pay.showInvalidVoucherModal.value) return;
  hd.openSubmitConfirm(canSubmit);
});

const closeSubmitConfirm = hd.closeSubmitConfirm;

const confirmSubmitOrder = quyenCaLam.guard(async () => {
  if (pay.showBetterVoucherModal.value) {
    hd.closeSubmitConfirm();
    return;
  }

  if (pay.showInvalidVoucherModal.value) {
    hd.closeSubmitConfirm();
    return;
  }

  if (isCounter.value) {
    const ok = await tinhPhiVanChuyenTuGhn(true);
    if (!ok) return;
  }

  if (pay.showBetterVoucherModal.value) {
    hd.closeSubmitConfirm();
    return;
  }

  if (pay.showInvalidVoucherModal.value) {
    hd.closeSubmitConfirm();
    return;
  }

  await hd.confirmSubmitOrder(() => hd.submitOrder(canSubmit, pay));
});
</script>

<style scoped>
/* ======= base ======= */
.ss-pos {
  padding-bottom: 18px;
}
.ss-pos :deep(b),
.ss-pos :deep(strong) {
  font-weight: 400 !important;
}
.ss-pos :deep(.form-control),
.ss-pos :deep(.form-select),
.ss-pos :deep(.ss-input),
.ss-pos :deep(.ss-qty-input),
.ss-pos :deep(.ss-kh-search) {
  border-radius: 0 !important;
}
.ss-pos :deep(.vs__dropdown-toggle) {
  min-height: 40px !important;
  border-radius: 0 !important;
  border: 1px solid rgba(17, 24, 39, 0.14) !important;
  padding: 0 10px !important;
  background: #fff !important;
}
.ss-pos :deep(.vs__dropdown-menu) {
  border-radius: 0 !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  box-shadow: 0 18px 50px rgba(17, 24, 39, 0.1) !important;
}

.thumb-wrap {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  overflow: visible;
}
.discount-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 999px;
  border: 1.5px solid #fff;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  pointer-events: none;
  white-space: nowrap;
  line-height: 1.3;
  z-index: 2;
}
.discount-badge.sm {
  font-size: 8px;
  padding: 1px 3px;
  top: -3px;
  right: -3px;
}

.ss-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ss-head-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ss-title {
  font-size: 20px;
  font-weight: 500;
}
.ss-subtitle {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-seller-name {
  color: rgba(17, 24, 39, 0.82);
  font-weight: 500;
}

/* Toast */
.ss-toast {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 9999;
  min-width: 280px;
  max-width: 440px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
  display: grid;
  grid-template-columns: 20px 1fr 34px;
  gap: 10px;
  align-items: center;
  padding: 12px 12px;
}
.ss-toast-left {
  display: grid;
  place-items: center;
}
.ss-toast-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.9);
}
.ss-toast.success .ss-toast-dot {
  background: rgba(34, 197, 94, 0.9);
}
.ss-toast.error .ss-toast-dot {
  background: rgba(239, 68, 68, 0.9);
}
.ss-toast.info .ss-toast-dot {
  background: rgba(59, 130, 246, 0.9);
}
.ss-toast-msg {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-toast-x {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  font-size: 18px;
  color: rgba(17, 24, 39, 0.72);
}

/* Tabs */
.ss-tabs {
  margin-bottom: 10px;
}
.ss-tab-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ss-tab {
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-tab-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-tab-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(153, 27, 27, 0.92);
  color: #fff;
  font-size: 11px;
  display: inline-grid;
  place-items: center;
  font-weight: 500;
}
.ss-tab.active {
  border-color: rgba(153, 27, 27, 0.35);
  background: rgba(153, 27, 27, 0.04);
}
.ss-tab-x {
  font-size: 16px;
  line-height: 1;
  opacity: 0.6;
}
.ss-tab-x:hover {
  opacity: 1;
}

/* Buttons */
.ss-btn-primary {
  background: linear-gradient(90deg, rgba(153, 27, 27, 0.95), rgba(17, 24, 39, 0.95));
  border: none;
  color: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 400;
}
.ss-btn-outline {
  background: #fff;
  border: 1px solid rgba(153, 27, 27, 0.28);
  color: rgba(153, 27, 27, 0.92);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 400;
}
.ss-btn-mini {
  padding: 7px 10px;
  border-radius: 10px;
}
.ss-card-main {
  padding: 14px;
}

/* Cart */
.ss-cart-box {
  border-radius: 14px;
  padding: 10px;
  margin-bottom: 12px;
  min-height: 92px;
}
.ss-cart-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ss-cart-item {
  display: grid;
  grid-template-columns: 24px 48px 1fr 140px 140px 40px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
}
.ss-cart-check {
  width: 16px;
  height: 16px;
}
.ss-cart-thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: rgba(17, 24, 39, 0.03);
}
.ss-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px !important;
}
.ss-thumb-ph {
  width: 100%;
  height: 100%;
  background: rgba(153, 27, 27, 0.06);
  border-radius: 12px;
}
.ss-cart-thumb.thumb-wrap,
.ss-thumb.thumb-wrap {
  overflow: visible;
}
.ss-cart-name {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-cart-sub {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.6);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.ss-cart-price-change {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(220, 38, 38, 0.96);
  font-weight: 500;
}
.ss-dot {
  opacity: 0.5;
}
.ss-cart-price {
  text-align: right;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-price-old {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.45);
  text-decoration: line-through;
}
.ss-price-now {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-cart-qty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.ss-qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  font-size: 14px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-qty-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-qty-input {
  width: 56px;
  height: 32px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  text-align: center;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
  outline: none;
}
.ss-trash {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(153, 27, 27, 0.18);
  background: rgba(153, 27, 27, 0.04);
  color: rgba(153, 27, 27, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-trash .material-icons-outlined {
  font-size: 20px;
}
.ss-cart-total {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 6px 4px 2px;
}
.ss-cart-total-label {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-cart-total-val {
  font-size: 13px;
  color: rgba(153, 27, 27, 0.92);
  font-weight: 500;
}

/* Bottom grid */
.ss-bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 12px;
}
.ss-panel {
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}
.ss-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.ss-panel-title {
  font-size: 14px;
  font-weight: 500;
}
.ss-panel-actions {
  display: flex;
  gap: 10px;
}
.ss-panel-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ss-kv {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  font-size: 13px;
}
.ss-k {
  color: rgba(17, 24, 39, 0.62);
}
.ss-v {
  color: rgba(17, 24, 39, 0.82);
}
.ss-hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.55);
}

/* Guest layout */
.ss-guest-title {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
  margin-bottom: 2px;
}
.ss-guest-name {
  color: rgba(17, 24, 39, 0.88);
  font-weight: 500;
}
.ss-req {
  color: rgba(239, 68, 68, 0.95);
  font-weight: 600;
  margin-left: 2px;
}
.ss-guest-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ss-guest-row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

/* Payment */
.ss-pay-kv {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-top: 1px dashed rgba(17, 24, 39, 0.08);
}
.ss-pay-kv:first-of-type {
  border-top: none;
}
.ss-pay-total {
  border-top: 1px solid rgba(17, 24, 39, 0.12);
  margin-top: 4px;
  padding-top: 10px;
}
.ss-pay-total .ss-pay-k,
.ss-pay-total .ss-pay-v {
  color: rgba(153, 27, 27, 0.92);
  font-weight: 500;
}
.ss-red {
  color: rgba(153, 27, 27, 0.92);
}
.ss-pay-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}
.ss-pay-k-strong {
  font-weight: 500;
  color: rgba(17, 24, 39, 0.82);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-pay-k-ship {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-ghn-inline-logo {
  height: 18px;
  width: auto;
  object-fit: contain;
  display: block;
}
.ss-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-icon-inline {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}
.ss-icon-btn .material-icons-outlined {
  font-size: 20px;
  color: rgba(17, 24, 39, 0.88);
}
.ss-confirm {
  width: 100%;
  margin-top: 10px;
  height: 46px;
  border-radius: 14px;
}

/* ship fee input */
.ss-ship-fee {
  max-width: 140px;
  text-align: right;
}
.ss-currency {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-ship-refresh {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ss-ship-refresh:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.ss-ship-refresh .material-icons-outlined {
  font-size: 20px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-ship-note {
  margin-top: 8px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.16);
  color: rgba(17, 24, 39, 0.72);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
}
.ss-ship-note.err {
  background: rgba(153, 27, 27, 0.06);
  border-color: rgba(153, 27, 27, 0.14);
}

/* Voucher */
.ss-voucher-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 10px;
  align-items: end;
}
.ss-voucher-val {
  max-width: 180px;
}
.ss-voucher-auto {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
}
.ss-voucher-auto-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ss-voucher-strong {
  color: rgba(17, 24, 39, 0.82);
  font-weight: 500;
}
.ss-voucher-auto-sub {
  font-size: 12px;
  margin-top: 4px;
  color: rgba(17, 24, 39, 0.6);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ss-voucher-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(153, 27, 27, 0.18);
  background: rgba(153, 27, 27, 0.06);
  color: rgba(153, 27, 27, 0.92);
}
.ss-voucher-auto-note {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(17, 24, 39, 0.62);
}
.ss-voucher-suggest {
  margin-top: 10px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
}

/* Switch */
.ss-ship-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.ss-toggle-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 26px;
}
.ss-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.ss-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(17, 24, 39, 0.14);
  transition: 0.2s;
  border-radius: 99px;
}
.ss-slider:before {
  content: "";
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  top: 3px;
  background: #fff;
  transition: 0.2s;
  border-radius: 50%;
}
.ss-switch input:checked + .ss-slider {
  background: rgba(153, 27, 27, 0.55);
}
.ss-switch input:checked + .ss-slider:before {
  transform: translateX(18px);
}

/* Modal base */
.ss-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 20px;
}
.ss-modal {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}
.ss-modal-lg {
  max-width: 980px;
}
.ss-modal-md {
  max-width: 640px;
}
.ss-modal-pay {
  max-width: 680px;
}
.ss-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.1);
  background: #fff;
}
.ss-pay-head {
  background: #fff;
}
.ss-modal-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(17, 24, 39, 0.9);
}
.ss-x {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  font-size: 20px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-modal-body {
  padding: 20px;
}
.ss-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
}
.ss-pay-actions {
  background: #fff;
}

/* old modal ui */
.ss-paybox {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  background: #fff;
}
.ss-paybox-stat {
  margin-top: 8px;
}
.ss-paybox-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  font-size: 13px;
}
.ss-paybox-row:not(.ss-paybox-row-first) {
  border-top: 1px dashed rgba(17, 24, 39, 0.08);
}
.ss-paybox-k {
  color: rgba(17, 24, 39, 0.66);
}
.ss-paybox-v {
  color: rgba(17, 24, 39, 0.86);
  text-align: right;
}
.ss-paybox-red {
  color: rgba(153, 27, 27, 0.92);
  font-weight: 500;
}
.ss-paygrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}
.ss-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ss-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.66);
}
.ss-link {
  border: none;
  background: transparent;
  color: rgba(153, 27, 27, 0.92);
  font-size: 12px;
  padding: 0;
  line-height: 1;
}
.ss-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ss-mt-8 {
  margin-top: 8px;
}
.ss-pay-note {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ss-pay-note-line {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-submit-note {
  margin-top: 10px;
  background: rgba(153, 27, 27, 0.05);
  border: 1px solid rgba(153, 27, 27, 0.12);
  color: rgba(17, 24, 39, 0.68);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
}

/* Filter row inside modal */
.ss-filter {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  margin-bottom: 12px;
}
.ss-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ss-field.grow {
  flex: 1;
}
.ss-filter-label {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-input {
  font-size: 13px;
}
.ss-reset {
  height: 42px;
}

/* Table wrap */
.ss-table-wrap {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  overflow: hidden;
}
.ss-empty-row {
  text-align: center;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.55);
  padding: 18px 8px;
}

.col-stt {
  width: 70px;
}
.col-code {
  width: 120px;
}
.col-img {
  width: 90px;
}
.col-qty {
  width: 110px;
  text-align: center;
}
.col-price {
  width: 140px;
  text-align: right;
}
.col-action {
  width: 180px;
  text-align: center;
}

/* Thumb in table */
.ss-thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: rgba(17, 24, 39, 0.03);
  margin: 0 auto;
}

/* pick wrap */
.ss-pick-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Pagination */
.ss-pagi {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
}
.ss-pageinfo {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.62);
}
.ss-pagebtns {
  display: flex;
  gap: 10px;
}

/* QR */
.ss-qr-hint {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
  margin-bottom: 10px;
}
.ss-qr-wrap {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  display: grid;
  place-items: center;
  padding: 10px;
}
.ss-qr-reader {
  width: 280px;
  height: 280px;
}

/* API hint */
.ss-api-hint {
  margin-top: 10px;
  background: rgba(153, 27, 27, 0.06);
  border: 1px solid rgba(153, 27, 27, 0.14);
  color: rgba(17, 24, 39, 0.72);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
}

/* Address list */
.ss-dc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ss-dc-item {
  text-align: left;
  border: 1px solid rgba(17, 24, 39, 0.14);
  border-radius: 14px;
  padding: 10px 12px;
  background: #fff;
}
.ss-dc-item.active {
  border-color: rgba(153, 27, 27, 0.35);
  background: rgba(153, 27, 27, 0.04);
}
.ss-dc-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ss-dc-name {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.82);
}
.ss-badge {
  font-size: 12px;
  border-radius: 999px;
  padding: 3px 8px;
  border: 1px solid rgba(153, 27, 27, 0.22);
  background: rgba(153, 27, 27, 0.06);
  color: rgba(153, 27, 27, 0.92);
  font-weight: 400;
}
.ss-dc-text {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
  margin-top: 6px;
}

/* Responsive */
@media (max-width: 1100px) {
  .ss-bottom-grid {
    grid-template-columns: 1fr;
  }
  .ss-filter {
    grid-template-columns: 1fr 1fr;
  }
  .ss-voucher-row {
    grid-template-columns: 1fr;
  }
  .ss-paygrid {
    grid-template-columns: 1fr;
  }
  .ss-guest-row2 {
    grid-template-columns: 1fr;
  }
  .ss-guest-row3 {
    grid-template-columns: 1fr;
  }
}
.ss-empty-card {
  min-height: 360px;
  display: grid;
  place-items: center;
}
.ss-empty-card .ss-empty-wrap {
  min-height: auto;
}
.ss-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.ss-section-title {
  font-size: 14px;
  font-weight: 500;
}
.ss-section-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.ss-empty-wrap {
  width: 100%;
  min-height: 260px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 10px;
}
.ss-empty-cart {
  min-height: 260px;
}
.ss-empty-icon {
  opacity: 0.95;
}
.ss-empty-text {
  font-size: 14px;
  color: rgba(17, 24, 39, 0.62);
  font-weight: 500;
}
.ss-empty-eng {
  font-weight: 400;
  color: rgba(17, 24, 39, 0.55);
}

/* =========================
   MODAL CHỌN KHÁCH HÀNG (khôi phục giao diện)
========================= */
.ss-modal-kh {
  max-width: 920px;
}

.ss-kh-head {
  background: #fff;
}

.ss-kh-body {
  padding: 18px 20px 16px;
}

.ss-kh-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.ss-kh-search {
  flex: 1;
  height: 38px;
  font-size: 13px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
}

.ss-kh-reload {
  height: 38px;
  border-radius: 12px;
  font-size: 13px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
}

.ss-kh-tablewrap {
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 14px;
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;
}

.ss-kh-table {
  width: 100%;
  font-size: 13px;
}

.ss-kh-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(17, 24, 39, 0.03);
  border-bottom: 1px solid rgba(17, 24, 39, 0.12);
  font-weight: 500;
}

.ss-kh-table td,
.ss-kh-table th {
  vertical-align: middle;
  padding: 10px 12px;
}

.kh-col-stt {
  width: 56px;
  text-align: center;
}

.kh-col-name {
  width: 200px;
}

.kh-col-phone {
  width: 160px;
}

.kh-col-act {
  width: 140px;
  text-align: center;
}

.ss-kh-pick {
  height: 30px;
  min-width: 72px;
  border-radius: 12px;
  font-size: 12px;
  padding: 0 12px;
  border: none;
  background: rgba(153, 27, 27, 0.92);
  color: #fff;
  font-weight: 400;
}

.ss-kh-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.ss-kh-close {
  height: 36px;
  border-radius: 12px;
  font-size: 13px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
}
</style>