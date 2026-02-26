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
    <div v-if="!hasOrders" class="ss-card ss-border ss-card-main">
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
              <span v-if="tabItemCount(t) > 0" class="ss-tab-badge" :title="`Đơn có ${tabItemCount(t)} sản phẩm`">
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
            <button class="btn ss-btn-outline" type="button" @click="openQrModal">
              QUÉT QR SẢN PHẨM
            </button>
            <button class="btn ss-btn-primary" type="button" @click="openCtspModal">
              THÊM SẢN PHẨM
            </button>
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
            <div v-for="it in cartItems" :key="it.id" class="ss-cart-item">
              <input class="ss-cart-check" type="checkbox" v-model="it.checked" />

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
              </div>

              <div class="ss-cart-price">
                <div v-if="showGiaGoc(it)" class="ss-price-old">{{ formatMoney(getGiaGoc(it)) }}</div>
                <div class="ss-price-now">{{ formatMoney(getGiaThucTe(it)) }}</div>
              </div>

              <div class="ss-cart-qty">
                <button class="ss-qty-btn" type="button" @click="decQty(it)" :disabled="Number(it.qty || 1) <= 1">-</button>

                <input
                  class="ss-qty-input"
                  type="text"
                  :value="String(it.qty || 1)"
                  :title="`Tối đa: ${getMaxQtyForItem(it)}`"
                  @input="onQtyInput(it, $event)"
                  @blur="onQtyBlur(it)"
                />

                <button
                  class="ss-qty-btn"
                  type="button"
                  @click="incQty(it)"
                  :disabled="Number(it.qty || 1) >= getMaxQtyForItem(it)"
                  :title="Number(it.qty || 1) >= getMaxQtyForItem(it) ? 'Đã đạt tồn tối đa' : 'Tăng số lượng'"
                >
                  +
                </button>
              </div>

              <button class="ss-trash" type="button" title="Xóa" @click="removeItem(it.id)">
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
                <button class="btn ss-btn-outline" type="button" @click="openKhModal">
                  Chọn khách hàng
                </button>

                <button
                  class="btn ss-btn-outline"
                  type="button"
                  :disabled="isCounter || !selectedKh || diaChiList.length <= 1"
                  @click="openDiaChiModal"
                  title="Chỉ bật khi giao hàng và khách có nhiều địa chỉ"
                >
                  Chọn địa chỉ
                </button>
              </div>
            </div>

            <div class="ss-panel-body">
              <!-- TẠI QUẦY -->
              <template v-if="isCounter">
                <div class="ss-kv">
                  <div class="ss-k">Tên khách hàng</div>
                  <div class="ss-v">{{ selectedKh ? getKhName(selectedKh) : "Khách lẻ" }}</div>
                </div>
                <div class="ss-hint">Tại quầy: chỉ cần chọn sản phẩm và thanh toán.</div>
              </template>

              <!-- GIAO HÀNG -->
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
                      <span v-if="selectedDiaChi">{{ renderDiaChi(selectedDiaChi) }}</span>
                      <span v-else>Chưa chọn địa chỉ.</span>
                    </div>
                  </div>
                </template>

                <!-- KHÁCH VÃNG LAI -->
                <template v-else>
                  <div class="ss-guest-hint">Khách vãng lai (không cần tạo tài khoản)</div>

                  <div class="ss-guest-grid">
                    <div class="ss-field">
                      <div class="ss-filter-label">Tên khách hàng</div>
                      <input v-model.trim="guest.tenKhachHang" class="form-control ss-input" placeholder="Nhập tên khách..." />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Số điện thoại</div>
                      <input
                        v-model="guest.soDienThoai"
                        class="form-control ss-input"
                        placeholder="Nhập số điện thoại..."
                        @input="onGuestPhoneInput"
                      />
                    </div>

                    <div class="ss-field ss-guest-full">
                      <div class="ss-filter-label">Địa chỉ cụ thể</div>
                      <input v-model.trim="guest.diaChiCuThe" class="form-control ss-input" placeholder="Số nhà, ngõ, đường..." />
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Tỉnh/Thành phố</div>
                      <input
                        v-model.trim="guest.tinhThanh"
                        class="form-control ss-input"
                        list="ss-tinh-list"
                        placeholder="Chọn Tỉnh/Thành phố..."
                      />
                      <datalist id="ss-tinh-list">
                        <option v-for="x in tinhOptions" :key="x" :value="x" />
                      </datalist>
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Huyện/Quận</div>
                      <input
                        v-model.trim="guest.huyenQuan"
                        class="form-control ss-input"
                        list="ss-huyen-list"
                        placeholder="Chọn Huyện/Quận..."
                      />
                      <datalist id="ss-huyen-list">
                        <option v-for="x in huyenOptions" :key="x" :value="x" />
                      </datalist>
                    </div>

                    <div class="ss-field">
                      <div class="ss-filter-label">Xã/Phường</div>
                      <input
                        v-model.trim="guest.xaPhuong"
                        class="form-control ss-input"
                        list="ss-xa-list"
                        placeholder="Chọn Xã/Phường..."
                      />
                      <datalist id="ss-xa-list">
                        <option v-for="x in xaOptions" :key="x" :value="x" />
                      </datalist>
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

              <!-- Switch: OFF = giao hàng, ON = tại quầy -->
              <div class="ss-ship-toggle">
                <span class="ss-toggle-label">{{ isCounter ? "Tại quầy" : "Giao hàng" }}</span>
                <label class="ss-switch">
                  <input type="checkbox" v-model="isCounter" />
                  <span class="ss-slider"></span>
                </label>
              </div>
            </div>

            <div class="ss-panel-body">
              <!-- Voucher input -->
              <div class="ss-voucher-row">
                <div class="ss-field grow">
                  <div class="ss-filter-label">Mã phiếu giảm giá</div>
                  <input
                    v-model.trim="voucherCode"
                    class="form-control ss-input"
                    placeholder="Nhập mã (Enter để áp dụng)"
                    @keyup.enter="applyVoucherCode"
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
                  <span v-if="voucherManual" class="ss-voucher-tag">Đã nhập mã</span>
                </div>
              </div>

              <div class="ss-pay-kv">
                <div class="ss-pay-k">Tiền hàng</div>
                <div class="ss-pay-v">{{ formatMoney(tongTienHang) }}</div>
              </div>

              <div v-if="!isCounter" class="ss-pay-kv">
                <div class="ss-pay-k">Phí vận chuyển</div>
                <div class="ss-pay-v ss-pay-inline">
                  <input
                    class="form-control ss-input ss-ship-fee"
                    type="text"
                    :value="phiVanChuyenText"
                    @input="onShipFeeInput"
                    placeholder="0"
                  />
                  <span class="ss-currency">đ</span>
                </div>
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

              <button class="btn ss-btn-primary ss-confirm" type="button" :disabled="!canSubmit" @click="submitOrder">
                XÁC NHẬN ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========================= MODAL: CHỌN CTSP ========================= -->
    <div v-if="showCtspModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-lg">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Chọn biến thể để thêm vào đơn</div>
          <button class="ss-x" type="button" @click="closeCtspModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-filter">
            <div class="ss-field grow">
              <div class="ss-filter-label">Tìm kiếm</div>
              <input v-model.trim="ctspFilter.keyword" class="form-control ss-input" placeholder="Tìm mã, tên, màu, kích cỡ..." />
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Màu sắc</div>
              <select v-model="ctspFilter.mauSac" class="form-select ss-input">
                <option value="">Tất cả màu</option>
                <option v-for="m in ctspMauSacOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Kích cỡ</div>
              <select v-model="ctspFilter.kichCo" class="form-select ss-input">
                <option value="">Tất cả kích cỡ</option>
                <option v-for="k in ctspKichCoOptions" :key="k" :value="k">{{ k }}</option>
              </select>
            </div>

            <div class="ss-field">
              <div class="ss-filter-label">Sản phẩm</div>
              <select v-model="ctspFilter.tenSanPham" class="form-select ss-input">
                <option value="">Tất cả sản phẩm</option>
                <option v-for="p in ctspSanPhamOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <button class="btn ss-btn-outline ss-reset" type="button" @click="resetCtspFilter">Đặt lại</button>
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
                      <img v-if="resolveImage(row.anhUrl)" :src="resolveImage(row.anhUrl)" class="ss-thumb-img" alt="" @error="onImgErr" />
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

                  <td class="col-qty">{{ row.__available }}</td>

                  <td class="col-price">
                    <div v-if="showGiaGoc(row)" class="ss-price-old">{{ formatMoney(getGiaGoc(row)) }}</div>
                    <div class="ss-price-now">{{ formatMoney(getGiaThucTe(row)) }}</div>
                  </td>

                  <td class="col-action">
                    <div class="ss-pick-wrap">
                      <input
                        class="form-control ss-input ss-pick-qty"
                        type="text"
                        :value="String(ctspPickQty[row.id] ?? 1)"
                        :disabled="Number(row.__available || 0) <= 0"
                        @input="onCtspPickQtyInput(row, $event)"
                        :title="`Tối đa có thể thêm: ${Number(row.__available || 0)}`"
                      />

                      <button
                        class="btn ss-btn-outline ss-btn-mini"
                        type="button"
                        @click="pickCtsp(row, ctspPickQty[row.id] ?? 1)"
                        :disabled="Number(row.__available || 0) <= 0"
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
              <button class="btn ss-btn-outline ss-btn-mini" type="button" :disabled="ctspPage >= ctspTotalPages" @click="ctspPage++">
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
      <div class="ss-modal ss-modal-md">
        <div class="ss-modal-head">
          <div class="ss-modal-title">Quét QR sản phẩm</div>
          <button class="ss-x" type="button" @click="closeQrModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-qr-hint">Đưa QR vào khung, hệ thống sẽ tự nhận và thêm CTSP vào đơn.</div>

          <div class="ss-qr-wrap">
            <div id="ss-qr-reader" class="ss-qr-reader"></div>
          </div>

          <div v-if="qrError" class="ss-api-hint">
            {{ qrError }}
          </div>
        </div>

        <div class="ss-modal-actions">
          <button class="btn ss-btn-outline" type="button" @click="restartQr">Quét lại</button>
          <button class="btn ss-btn-primary" type="button" @click="closeQrModal">Đóng</button>
        </div>
      </div>
    </div>

    <!-- ========================= MODAL: CHỌN KH ========================= -->
    <div v-if="showKhModal" class="ss-modal-backdrop">
      <div class="ss-modal ss-modal-kh">
        <div class="ss-modal-head ss-kh-head">
          <div class="ss-modal-title">Chọn khách hàng</div>
          <button class="ss-x" type="button" @click="closeKhModal">×</button>
        </div>

        <div class="ss-modal-body ss-kh-body">
          <div class="ss-kh-top">
            <input v-model.trim="khFilter.keyword" class="form-control ss-kh-search" placeholder="Tìm theo tên, SĐT, địa chỉ..." />
            <button class="btn ss-kh-reload" type="button" @click="reloadKh">Tải lại</button>
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
                    <button class="btn ss-kh-pick" type="button" @click="pickKh(k)">Chọn</button>
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
      <div class="ss-modal ss-modal-md">
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
            >
              <div class="ss-dc-line">
                <span class="ss-dc-name">{{ dc.hoTenNguoiNhan || getKhName(selectedKh) || "Khách" }}</span>
                <span v-if="dc.macDinh" class="ss-badge">Mặc định</span>
              </div>
              <div class="ss-dc-text">{{ renderDiaChi(dc) }}</div>
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
      <div class="ss-modal ss-modal-pay">
        <div class="ss-modal-head ss-pay-head">
          <div class="ss-modal-title">Thanh toán</div>
          <button class="ss-x" type="button" @click="closePayModal">×</button>
        </div>

        <div class="ss-modal-body">
          <div class="ss-paybox">
            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tổng số tiền</div>
              <div class="ss-paybox-v ss-paybox-red">{{ formatMoney(tongPhaiTra) }}</div>
            </div>

            <div class="ss-paybox-method">
              <button class="ss-method" :class="{ active: payMethod === 'TIEN_MAT' }" type="button" @click="payMethod = 'TIEN_MAT'">
                Tiền mặt
              </button>
              <button class="ss-method" :class="{ active: payMethod === 'CHUYEN_KHOAN' }" type="button" @click="payMethod = 'CHUYEN_KHOAN'">
                Chuyển khoản
              </button>
            </div>

            <div class="ss-field">
              <div class="ss-label">Khách thanh toán</div>
              <input :value="payInputText" type="text" class="form-control ss-input" placeholder="Nhập số tiền..." @input="onPayInput" />
            </div>

            <div class="ss-paybox-row">
              <div class="ss-paybox-k">Tiền thiếu</div>
              <div class="ss-paybox-v">{{ formatMoney(Math.max(0, tongPhaiTra - payInputNum)) }}</div>
            </div>
          </div>
        </div>

        <div class="ss-modal-actions ss-pay-actions">
          <button class="btn ss-btn-outline" type="button" @click="closePayModal">Đóng</button>
          <button class="btn ss-btn-primary" type="button" @click="confirmPay">Xong</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Html5Qrcode } from "html5-qrcode";
import SalesService from "@/services/sales/salesService.js";
import apiClient from "@/services/apiClient";

export default {
  name: "SalesPage",
  data() {
    return {
      maxOrderTabs: 10,

      // người bán
      nguoiBan: null,

      // Tabs
      tabs: [],
      activeTab: 0,

      // Switch: OFF = giao hàng, ON = tại quầy
      isCounter: false,

      // cart
      cartItems: [],

      // Guest
      guest: {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      },

      tinhOptions: [],
      huyenOptions: [],
      xaOptions: [],

      // Phí vận chuyển
      phiVanChuyen: 0,
      phiVanChuyenText: "0",

      // Voucher
      voucherCode: "",
      voucherManual: null,

      // CTSP modal
      showCtspModal: false,
      ctspLoading: false,
      ctspErr: "",
      ctspList: [],
      ctspFilter: { keyword: "", mauSac: "", kichCo: "", tenSanPham: "" },
      ctspPage: 1,
      ctspPageSize: 5,

      // map tồn gốc
      ctspBaseQtyMap: {},

      // input nhập nhanh số lượng khi thêm ở modal
      ctspPickQty: {},

      // QR
      showQrModal: false,
      qr: null,
      qrError: "",

      // Customer
      showKhModal: false,
      khLoading: false,
      khErr: "",
      khList: [],
      khFilter: { keyword: "" },
      selectedKh: null,

      // Address
      showDiaChiModal: false,
      dcLoading: false,
      dcErr: "",
      diaChiList: [],
      selectedDiaChi: null,

      // Cache địa chỉ KH
      khAddrCache: {},
      khAddrLoading: {},

      // Voucher auto best
      autoVoucher: null,
      loadingVoucher: false,
      voucherDebounce: null,
      voucherCache: {
        all: [],
        personal: [],
        personalKhId: null,
        loadedAt: 0,
        loadedAtPersonal: 0,
      },

      // Payment
      showPayModal: false,
      payMethod: "TIEN_MAT",
      payInputText: "",
      khachThanhToan: 0,

      // toast
      toast: { show: false, msg: "", type: "success" },
      toastTimer: null,

      submitting: false,
    };
  },

  computed: {
    nguoiBanTen() {
      const u = this.nguoiBan || {};
      return u.hoTen || u.tenNhanVien || u.ten || u.username || "";
    },

    hasOrders() {
      return Array.isArray(this.tabs) && this.tabs.length > 0;
    },

    effectiveVoucher() {
      return this.voucherManual || this.autoVoucher;
    },

    reservedByCtsp() {
      const map = {};
      const snapTabs = Array.isArray(this.tabs)
        ? this.tabs.map((t, i) => {
            if (i === this.activeTab) return { ...t, cartItems: this.cartItems };
            return t;
          })
        : [];

      for (const t of snapTabs) {
        const items = Array.isArray(t?.cartItems) ? t.cartItems : [];
        for (const it of items) {
          const id = it?.id;
          if (id == null) continue;
          const qty = Math.max(0, Number(it?.qty || 0));
          map[id] = (map[id] || 0) + qty;
        }
      }
      return map;
    },

    getTongTienHangCore() {
      let s = 0;
      for (const it of this.cartItems) {
        const price = Number(this.getGiaThucTe(it) || 0);
        const qty = Number(it.qty || 0);
        s += price * qty;
      }
      return s;
    },

    tongTienHang() {
      return this.getTongTienHangCore;
    },

    phiVanChuyenNum() {
      const n = Number(this.phiVanChuyen || 0);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    },

    giamGia() {
      const v = this.effectiveVoucher;
      const tong = Number(this.tongTienHang || 0);
      if (!v || tong <= 0) return 0;

      const min = Number(v.hoaDonToiThieu ?? v.hoaDonToiThieuTien ?? 0);
      if (Number.isFinite(min) && min > 0 && tong < min) return 0;

      if (v.xoaMem === true || v.trangThai === false) return 0;

      const remain = Number(v.soLuongSuDung ?? 0);
      if (Number.isFinite(remain) && remain <= 0) return 0;

      const today = this.todayYmd();
      const start = this.toYmd(v.ngayBatDau);
      const end = this.toYmd(v.ngayKetThuc);
      if (start && today < start) return 0;
      if (end && today > end) return 0;

      // true = giảm %, false = giảm tiền
      const isPercent = v.loaiPhieuGiamGia === true;
      const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);

      let discount = 0;

      if (isPercent) {
        const pct = Math.max(0, Math.min(100, giaTri));
        discount = Math.round((tong * pct) / 100);

        const cap = Number(v.soTienGiamToiDa ?? 0);
        if (Number.isFinite(cap) && cap > 0) discount = Math.min(discount, cap);
      } else {
        discount = Math.round(Math.max(0, giaTri));
      }

      discount = Math.min(discount, tong);
      return discount > 0 ? discount : 0;
    },

    tongPhaiTra() {
      const ship = this.isCounter ? 0 : this.phiVanChuyenNum;
      return Math.max(0, this.tongTienHang - this.giamGia + ship);
    },

    tienThieu() {
      return Math.max(0, this.tongPhaiTra - Number(this.khachThanhToan || 0));
    },

    canSubmit() {
      if (!this.hasOrders) return false;
      if (this.cartItems.length === 0) return false;
      if (this.submitting) return false;

      for (const it of this.cartItems) {
        const qty = Number(it?.qty || 0);
        if (!Number.isFinite(qty) || qty < 1) return false;
        const max = this.getMaxQtyForItem(it);
        if (qty > max) return false;
      }

      if (this.isCounter && this.payMethod === "TIEN_MAT") {
        if (Number(this.khachThanhToan || 0) < Number(this.tongPhaiTra || 0)) return false;
      }

      if (!this.isCounter) {
        if (this.selectedKh) {
          if (!this.selectedDiaChi) return false;
          return true;
        }

        const sdt = String(this.guest.soDienThoai || "").replace(/\D/g, "");
        const dc = (this.guest.diaChiCuThe || "").trim();
        const tinh = (this.guest.tinhThanh || "").trim();
        const huyen = (this.guest.huyenQuan || "").trim();
        const xa = (this.guest.xaPhuong || "").trim();

        if (!/^\d{9,11}$/.test(sdt)) return false;
        if (!dc || !tinh || !huyen || !xa) return false;

        return true;
      }

      return true;
    },

    filteredCtsp() {
      const kw = (this.ctspFilter.keyword || "").toLowerCase();
      const ms = this.ctspFilter.mauSac || "";
      const kc = this.ctspFilter.kichCo || "";
      const sp = this.ctspFilter.tenSanPham || "";

      return this.ctspList
        .map((x) => ({
          ...x,
          __available: this.getAvailableQtyByCtspId(x.id),
        }))
        .filter((x) => {
          const s = `${x.maCtsp || ""} ${x.tenSanPham || ""} ${x.mauSac || ""} ${x.kichCo || ""}`.toLowerCase();
          if (kw && !s.includes(kw)) return false;
          if (ms && x.mauSac !== ms) return false;
          if (kc && x.kichCo !== kc) return false;
          if (sp && x.tenSanPham !== sp) return false;
          return true;
        });
    },

    ctspTotalPages() {
      return Math.max(1, Math.ceil(this.filteredCtsp.length / this.ctspPageSize));
    },

    pagedCtsp() {
      const start = (this.ctspPage - 1) * this.ctspPageSize;
      return this.filteredCtsp.slice(start, start + this.ctspPageSize);
    },

    ctspMauSacOptions() {
      return [...new Set(this.ctspList.map((x) => x.mauSac).filter(Boolean))].sort();
    },

    ctspKichCoOptions() {
      return [...new Set(this.ctspList.map((x) => x.kichCo).filter(Boolean))].sort();
    },

    ctspSanPhamOptions() {
      return [...new Set(this.ctspList.map((x) => x.tenSanPham).filter(Boolean))].sort();
    },

    filteredKh() {
      const kw = (this.khFilter.keyword || "").toLowerCase();
      if (!kw) return this.khList;

      return this.khList.filter((k) => {
        const addr = this.khAddrCache[k.id] || this.renderKhDiaChi(k) || "";
        const s = `${this.getKhName(k)} ${this.getKhPhone(k)} ${addr}`.toLowerCase();
        return s.includes(kw);
      });
    },

    payInputNum() {
      const digits = String(this.payInputText || "").replace(/\D/g, "");
      const n = digits ? Number(digits) : 0;
      return Number.isFinite(n) && n >= 0 ? n : 0;
    },

    voucherValueText() {
      const v = this.effectiveVoucher;
      if (!v) return "";

      const isPercent = v.loaiPhieuGiamGia === true;
      const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);
      if (isPercent) return `${Math.max(0, Math.min(100, giaTri))}%`;
      return this.formatMoney(giaTri);
    },
  },

  watch: {
    tongTienHang() {
      this.scheduleAutoVoucher();
      this.persistActiveTab();
    },
    cartItems: {
      deep: true,
      handler() {
        this.persistActiveTab();
      },
    },
    selectedKh() {
      this.scheduleAutoVoucher();
      this.persistActiveTab();
    },
    selectedDiaChi() {
      this.persistActiveTab();
    },
    khachThanhToan() {
      this.persistActiveTab();
    },
    payMethod() {
      this.persistActiveTab();
    },

    isCounter(val) {
      if (val) {
        this.selectedDiaChi = null;
        this.diaChiList = [];
        this.phiVanChuyen = 0;
        this.phiVanChuyenText = "0";
      } else {
        const khId = this.selectedKh?.id;
        if (khId) {
          if (!Array.isArray(this.diaChiList) || this.diaChiList.length === 0) {
            this.loadDiaChiAndPickDefault(khId);
          } else if (!this.selectedDiaChi) {
            let def = this.diaChiList.find((x) => x.macDinh === true || x.macDinh === 1);
            if (!def && this.diaChiList.length > 0) def = this.diaChiList[0];
            this.selectedDiaChi = def || null;
          }
        }
      }
      this.persistActiveTab();
    },
  },

  async mounted() {
    this.nguoiBan = this.getNguoiBanDangNhap();

    this.restoreCtspBaseQtyMap();

    const savedTabs = this.safeParse(localStorage.getItem("ss_pos_tabs") || "[]", []);
    if (Array.isArray(savedTabs) && savedTabs.length > 0) {
      this.tabs = savedTabs;
      this.activeTab = Number(localStorage.getItem("ss_pos_active_tab") || "0");
      if (this.activeTab < 0 || this.activeTab >= this.tabs.length) this.activeTab = 0;
      this.applyTabState(this.tabs[this.activeTab]);
    } else {
      this.resetPageState();
      this.persistTabs();
    }

    await this.ensureBaseQtyIfCartHasItems();
    await this.capNhatDotGiamGiaChoGioHang();
    this.scheduleAutoVoucher();
  },

  methods: {
    // ================== base qty persist ==================
    baseQtyKey() {
      return "ss_pos_ctsp_base_qty_map";
    },

    restoreCtspBaseQtyMap() {
      const raw = localStorage.getItem(this.baseQtyKey());
      const map = this.safeParse(raw || "{}", {});
      this.ctspBaseQtyMap = map && typeof map === "object" ? map : {};
    },

    persistCtspBaseQtyMap() {
      try {
        localStorage.setItem(this.baseQtyKey(), JSON.stringify(this.ctspBaseQtyMap || {}));
      } catch (e) {}
    },

    async ensureBaseQtyIfCartHasItems() {
      const hasCart = Array.isArray(this.cartItems) && this.cartItems.length > 0;
      const mapSize =
        this.ctspBaseQtyMap && typeof this.ctspBaseQtyMap === "object"
          ? Object.keys(this.ctspBaseQtyMap).length
          : 0;

      if (!hasCart) return;

      // chỉ cần load CTSP một lần để có tồn + đợt giảm giá (baseQtyMap có thể trống)
      if (mapSize > 0 && Array.isArray(this.ctspList) && this.ctspList.length > 0) return;

      try {
        await this.loadCtspForPos();
      } catch (e) {}
    },

    // ================== login user ==================
    getNguoiBanDangNhap() {
      const tryParse = (raw) => this.safeParse(raw || "null", null);
      const prefer = tryParse(localStorage.getItem("ss_nguoi_ban"));
      if (prefer) return prefer;

      const u1 = tryParse(localStorage.getItem("user"));
      if (u1) return this.normalizeNguoiBan(u1);

      const u2 = tryParse(sessionStorage.getItem("ss_nguoi_ban"));
      if (u2) return u2;

      const u3 = tryParse(sessionStorage.getItem("user"));
      if (u3) return this.normalizeNguoiBan(u3);

      return null;
    },

    normalizeNguoiBan(u) {
      if (!u || typeof u !== "object") return null;
      const id = u.idNhanVien || u.nhanVienId || u.id || u.userId || u.nhanVien?.id || null;
      const hoTen = u.hoTen || u.tenNhanVien || u.ten || u.fullName || u.name || u.username || "";
      return { id, hoTen, role: u.role || u.quyen || null };
    },

    // ================== toast ==================
    showToast(msg, type = "success") {
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toast = { show: true, msg, type };
      this.toastTimer = setTimeout(() => {
        this.toast.show = false;
      }, 2600);
    },
    hideToast() {
      this.toast.show = false;
    },

    // ================== HD sequential ==================
    nextHdCode() {
      const key = "ss_pos_hd_seq";
      let seq = parseInt(localStorage.getItem(key) || "1", 10);
      if (!Number.isFinite(seq) || seq <= 0) seq = 1;
      const code = this.pad3(seq);
      localStorage.setItem(key, String(seq + 1));
      return code;
    },

    pad3(n) {
      const x = Number(n || 0);
      if (x < 10) return `00${x}`;
      if (x < 100) return `0${x}`;
      return `${x}`;
    },

    makeEmptyTab(orderNo, hdCode) {
      return {
        id: Date.now() + Math.random(),
        orderNo,
        hdCode,
        name: `Đơn hàng ${orderNo} - HD-${hdCode}`,

        isCounter: false,
        cartItems: [],
        selectedKh: null,
        diaChiList: [],
        selectedDiaChi: null,
        autoVoucher: null,
        voucherManual: null,
        voucherCode: "",
        khachThanhToan: 0,
        payMethod: "TIEN_MAT",
        guest: {
          tenKhachHang: "",
          soDienThoai: "",
          diaChiCuThe: "",
          tinhThanh: "",
          huyenQuan: "",
          xaPhuong: "",
        },
        phiVanChuyen: 0,
        phiVanChuyenText: "0",
      };
    },

    resetPageState() {
      this.tabs = [];
      this.activeTab = 0;
      this.isCounter = false;
      this.cartItems = [];
      this.selectedKh = null;
      this.diaChiList = [];
      this.selectedDiaChi = null;
      this.autoVoucher = null;
      this.voucherManual = null;
      this.voucherCode = "";
      this.khachThanhToan = 0;
      this.payMethod = "TIEN_MAT";
      this.payInputText = "";
      this.guest = {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      };
      this.phiVanChuyen = 0;
      this.phiVanChuyenText = "0";
    },

    persistTabs() {
      localStorage.setItem("ss_pos_tabs", JSON.stringify(this.tabs || []));
      localStorage.setItem("ss_pos_active_tab", String(this.activeTab));
    },

    persistActiveTab() {
      const t = this.tabs[this.activeTab];
      if (!t) return;

      t.isCounter = this.isCounter;
      t.cartItems = Array.isArray(this.cartItems) ? this.cartItems.map((x) => ({ ...x })) : [];
      t.selectedKh = this.selectedKh;
      t.diaChiList = Array.isArray(this.diaChiList) ? this.diaChiList.map((x) => ({ ...x })) : [];
      t.selectedDiaChi = this.selectedDiaChi;
      t.autoVoucher = this.autoVoucher;
      t.voucherManual = this.voucherManual;
      t.voucherCode = this.voucherCode;
      t.khachThanhToan = this.khachThanhToan;
      t.payMethod = this.payMethod;
      t.guest = { ...(this.guest || {}) };
      t.phiVanChuyen = this.phiVanChuyen;
      t.phiVanChuyenText = this.phiVanChuyenText;

      this.persistTabs();
    },

    applyTabState(t) {
      this.isCounter = !!t.isCounter;
      this.cartItems = Array.isArray(t.cartItems) ? t.cartItems.map((x) => ({ ...x })) : [];
      this.selectedKh = t.selectedKh || null;
      this.diaChiList = Array.isArray(t.diaChiList) ? t.diaChiList.map((x) => ({ ...x })) : [];
      this.selectedDiaChi = t.selectedDiaChi || null;
      this.autoVoucher = t.autoVoucher || null;
      this.voucherManual = t.voucherManual || null;
      this.voucherCode = t.voucherCode || "";
      this.khachThanhToan = Number(t.khachThanhToan || 0) || 0;
      this.payMethod = t.payMethod || "TIEN_MAT";
      this.guest =
        t.guest || {
          tenKhachHang: "",
          soDienThoai: "",
          diaChiCuThe: "",
          tinhThanh: "",
          huyenQuan: "",
          xaPhuong: "",
        };
      this.phiVanChuyen = Number(t.phiVanChuyen || 0) || 0;
      this.phiVanChuyenText = String(t.phiVanChuyenText || "0");

      this.payInputText = this.formatNumberText(this.khachThanhToan);

      if (!this.isCounter && this.selectedKh?.id && this.diaChiList.length === 0) {
        this.loadDiaChiAndPickDefault(this.selectedKh.id);
      }
    },

    async switchTab(idx) {
      if (idx === this.activeTab) return;
      this.persistActiveTab();
      this.activeTab = idx;
      this.applyTabState(this.tabs[idx]);
      this.persistTabs();

      await this.ensureBaseQtyIfCartHasItems();
      await this.capNhatDotGiamGiaChoGioHang();
      this.scheduleAutoVoucher();
    },

    // ================== Tabs ==================
    tabItemCount(t) {
      const items = Array.isArray(t?.cartItems) ? t.cartItems : [];
      return items.reduce((sum, it) => sum + Math.max(0, Number(it?.qty || 0)), 0);
    },

    createOrderTab() {
      if (this.tabs.length >= this.maxOrderTabs) {
        this.showToast(`Chỉ được tạo tối đa ${this.maxOrderTabs} đơn để tránh spam.`, "error");
        return;
      }

      this.persistActiveTab();

      const n = this.tabs.length + 1;
      const hdCode = this.nextHdCode();
      const tab = this.makeEmptyTab(n, hdCode);

      this.tabs.push(tab);
      this.activeTab = this.tabs.length - 1;
      this.applyTabState(tab);
      this.persistTabs();

      this.showToast(`Đã tạo đơn hàng: HD-${hdCode}`, "success");
      this.scheduleAutoVoucher();
    },

    closeTab(idx) {
      this.persistActiveTab();

      const tab = this.tabs[idx];
      const hasItems = Array.isArray(tab?.cartItems) && tab.cartItems.length > 0;

      if (hasItems) {
        const ok = window.confirm("Đơn hàng đang có sản phẩm. Bạn có chắc muốn hủy đơn này không? (Hệ thống sẽ hoàn lại tồn kho)");
        if (!ok) return;
      }

      const wasActive = idx === this.activeTab;

      this.tabs.splice(idx, 1);

      this.tabs = this.tabs.map((t, i) => ({
        ...t,
        orderNo: i + 1,
        name: `Đơn hàng ${i + 1} - HD-${t.hdCode}`,
      }));

      if (this.tabs.length === 0) {
        this.resetPageState();
        this.persistTabs();
        return;
      }

      if (wasActive) {
        this.activeTab = idx > 0 ? idx - 1 : 0;
      } else if (idx < this.activeTab) {
        this.activeTab = Math.max(0, this.activeTab - 1);
      }

      if (this.activeTab >= this.tabs.length) this.activeTab = this.tabs.length - 1;

      this.applyTabState(this.tabs[this.activeTab]);
      this.persistTabs();
      this.scheduleAutoVoucher();
    },

    // ================== tồn khả dụng / validate qty ==================
    getBaseQtyByCtspId(ctspId) {
      const id = ctspId;
      const base = Number(this.ctspBaseQtyMap?.[id] ?? 0);
      return Number.isFinite(base) && base >= 0 ? base : 0;
    },

    getAvailableQtyByCtspId(ctspId) {
      const id = ctspId;
      const base = this.getBaseQtyByCtspId(id);
      const reserved = Number(this.reservedByCtsp?.[id] ?? 0);
      const avail = base - reserved;
      return Math.max(0, Number.isFinite(avail) ? avail : 0);
    },

    getMaxQtyForItem(it) {
      const id = it?.id;
      const base = this.getBaseQtyByCtspId(id);
      const reservedAll = Number(this.reservedByCtsp?.[id] ?? 0);
      const cur = Math.max(0, Number(it?.qty || 0));
      const max = base - (reservedAll - cur);
      return Math.max(0, Number.isFinite(max) ? max : 0);
    },

    clampInt(n, min, max) {
      let x = Number(n);
      if (!Number.isFinite(x)) x = min;
      x = Math.floor(x);
      if (x < min) x = min;
      if (x > max) x = max;
      return x;
    },

    // ================== Format ==================
    formatMoney(v) {
      const n = Number(v || 0);
      try {
        return n.toLocaleString("vi-VN") + " đ";
      } catch (e) {
        return n + " đ";
      }
    },

    formatNumberText(n) {
      const x = Number(n || 0);
      if (!Number.isFinite(x) || x <= 0) return "";
      try {
        return x.toLocaleString("vi-VN");
      } catch (e) {
        return String(x);
      }
    },

    resolveImage(url) {
      if (!url) return "";
      const u = String(url).trim();
      if (!u) return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;

      const base = import.meta.env.VITE_FILE_BASE_URL || "http://localhost:8080";
      if (u.startsWith("/")) return base + u;
      return base + "/" + u;
    },

    onImgErr(e) {
      if (e?.target) e.target.style.display = "none";
    },

    safeParse(str, fallback) {
      try {
        const v = JSON.parse(str);
        return v;
      } catch (e) {
        return fallback;
      }
    },

    // ================== Date helpers ==================
    todayYmd() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },

    toYmd(v) {
      if (!v) return "";
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return v.trim();

      try {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      } catch (e) {
        return "";
      }
    },

    // ================== Customer normalize ==================
    getKhName(k) {
      if (!k) return "";
      return k.hoTen || k.tenKhachHang || k.ten || k.fullName || k.name || "";
    },

    getKhPhone(k) {
      if (!k) return "";
      return k.sdt || k.soDienThoai || k.phone || k.soDienThoaiKhachHang || "";
    },

    getKhEmail(k) {
      if (!k) return "";
      return k.email || k.mail || "";
    },

    onGuestPhoneInput(e) {
      const raw = String(e?.target?.value || "");
      const digits = raw.replace(/\D/g, "");
      this.guest.soDienThoai = digits;
    },

    renderKhDiaChi(k) {
      if (!k) return "";

      const direct =
        k.diaChiDayDu ||
        k.diaChiMacDinh ||
        k.diaChiGiaoHang ||
        k.diaChiKhachHang ||
        k.diaChi ||
        k.address ||
        "";
      if (typeof direct === "string" && direct.trim()) return direct.trim();

      const soNha = k.soNha || k.diaChiCuThe || k.diaChiChiTiet || "";
      const xa = k.xaPhuong || k.phuongXa || k.xa || "";
      const huyen = k.quanHuyen || k.huyenQuan || k.huyen || "";
      const tinh = k.tinhThanh || k.thanhPho || k.tinh || "";
      const parts = [soNha, xa, huyen, tinh].filter((x) => String(x || "").trim());
      if (parts.length) return parts.join(", ");

      if (k.diaChiMacDinh && typeof k.diaChiMacDinh === "object") {
        const s = this.renderDiaChi(k.diaChiMacDinh);
        if (s) return s;
      }

      const list = k.diaChiList || k.danhSachDiaChi || k.diaChiKhachHangs || k.addresses || null;
      if (Array.isArray(list) && list.length > 0) {
        let def = list.find((x) => x.macDinh === true || x.macDinh === 1);
        if (!def) def = list[0];
        const s = this.renderDiaChi(def);
        if (s) return s;
      }

      return "";
    },

    // ================== Voucher label ==================
    getVoucherLabel(v) {
      if (!v) return "";
      const code = v.maPhieuGiamGia || v.ma || v.code || "";

      const isPercent = v.loaiPhieuGiamGia === true;
      const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);

      if (code && isPercent) return `${code} (${Math.max(0, Math.min(100, giaTri))}%)`;
      if (code && !isPercent) return `${code} (${this.formatMoney(giaTri)})`;
      if (code) return code;

      if (isPercent) return `${Math.max(0, Math.min(100, giaTri))}%`;
      return this.formatMoney(giaTri);
    },

    // ================== ĐỢT GIẢM GIÁ: lấy best theo CTSP (FIX CHÍNH) ==================
    async fetchBestDotGiamGiaByCtspIds(ids) {
      const list = [...new Set((ids || []).map((x) => Number(x)).filter((x) => Number.isFinite(x)))];
      if (!list.length) return [];

      const tries = [
        "/api/admin/chi-tiet-dot-giam-gia/ban-hang/best-by-ctsp-ids",
        "/api/chi-tiet-dot-giam-gia/ban-hang/best-by-ctsp-ids",
      ];

      let lastErr = null;
      for (const url of tries) {
        try {
          const res = await apiClient.post(url, list);
          const data = res?.data;
          return Array.isArray(data) ? data : [];
        } catch (e) {
          lastErr = e;
        }
      }

      // không throw để POS không crash
      console.error("Không lấy được đợt giảm giá theo CTSP:", lastErr);
      return [];
    },

    getCtspIdFromDotBestRow(x) {
      if (!x || typeof x !== "object") return null;
      const v =
        x.idChiTietSanPham ??
        x.idCtsp ??
        x.idChiTietSanPhamApDung ??
        x.idChiTietSanPhamId ??
        x.chiTietSanPhamId ??
        x.ctspId ??
        null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    },

    getLoaiGiamGiaFromDotBestRow(x) {
      if (!x || typeof x !== "object") return true; // mặc định: giảm %
      const v =
        x.loaiGiamGia ??
        x.loaiGiam ??
        x.isPercent ??
        x.laPhanTram ??
        x.phanTram ??
        true;
      return v === true || v === 1 || String(v).toLowerCase() === "true";
    },

    getGiaTriGiamFromDotBestRow(x) {
      if (!x || typeof x !== "object") return 0;
      const raw =
        x.giaTriGiamApDung ??
        x.giaTriGiam ??
        x.phanTramGiam ??
        x.phanTramGiamGia ??
        x.giaTri ??
        x.soTienGiam ??
        x.tienGiam ??
        0;
      return this.toNumberSafe(raw);
    },

    getDotInfoFromDotBestRow(x) {
      const dot = x?.dotGiamGia || x?.dot || x?.dotKhuyenMai || null;

      const idDot =
        x?.idDotGiamGia ??
        dot?.id ??
        x?.dotGiamGiaId ??
        x?.idDot ??
        null;

      const maDot =
        x?.maDotGiamGia ??
        dot?.maDotGiamGia ??
        dot?.maDot ??
        dot?.ma ??
        x?.maDot ??
        null;

      const tenDot =
        x?.tenDotGiamGia ??
        dot?.tenDotGiamGia ??
        dot?.tenDot ??
        dot?.ten ??
        x?.tenDot ??
        null;

      return { idDot, maDot, tenDot };
    },

    async ganDotGiamGiaChoDanhSachCtsp(dsCtsp) {
      const list = Array.isArray(dsCtsp) ? dsCtsp : [];
      const ids = [...new Set(list.map((x) => x?.id).filter((x) => x != null))];
      if (!ids.length) return;

      const dsBest = await this.fetchBestDotGiamGiaByCtspIds(ids);

      const map = new Map();
      for (const x of dsBest) {
        const idCtsp = this.getCtspIdFromDotBestRow(x);
        if (idCtsp != null) map.set(idCtsp, x);
      }

      for (const sp of list) {
        if (!sp || sp.id == null) continue;

        const best = map.get(Number(sp.id));

        // base price
        const giaBase =
          this.toNumberSafe(sp.giaGoc ?? 0) > 0
            ? Math.round(this.toNumberSafe(sp.giaGoc))
            : Math.round(this.toNumberSafe(sp.giaBan ?? 0));

        if (!best) {
          // không có giảm
          sp.phanTramGiam = 0;
          sp.idDotGiamGia = null;
          sp.maDotGiamGia = null;
          sp.tenDotGiamGia = null;

          // để không hiện giá gốc gạch, set giaGoc = 0 (getGiaGoc sẽ fallback giaBan)
          sp.giaGoc = 0;
          sp.giaBan = giaBase > 0 ? giaBase : Math.round(this.toNumberSafe(sp.giaBan ?? 0));
          continue;
        }

        const loaiPercent = this.getLoaiGiamGiaFromDotBestRow(best);
        let giaTri = this.getGiaTriGiamFromDotBestRow(best);

        // BE đôi khi trả 0.1 = 10%
        if (loaiPercent) {
          if (giaTri > 0 && giaTri <= 1) giaTri = giaTri * 100;
          giaTri = Math.max(0, Math.min(100, Math.round(giaTri)));
        } else {
          giaTri = Math.max(0, Math.round(giaTri));
        }

        const { idDot, maDot, tenDot } = this.getDotInfoFromDotBestRow(best);

        let giaSau = giaBase;
        if (giaBase > 0 && giaTri > 0) {
          if (loaiPercent) {
            giaSau = Math.round((giaBase * (100 - giaTri)) / 100);
          } else {
            giaSau = Math.round(Math.max(0, giaBase - giaTri));
          }
        }

        sp.giaGoc = giaBase > 0 ? giaBase : 0;
        sp.giaBan = giaSau > 0 ? giaSau : 0;

        sp.phanTramGiam =
          loaiPercent
            ? giaTri
            : giaBase > 0 && giaTri > 0
            ? Math.round(Math.min(100, (giaTri / giaBase) * 100))
            : 0;

        sp.idDotGiamGia = idDot ?? null;
        sp.maDotGiamGia = maDot ?? null;
        sp.tenDotGiamGia = tenDot ?? null;
      }
    },

    async capNhatDotGiamGiaChoGioHang() {
      if (!Array.isArray(this.cartItems) || this.cartItems.length === 0) return;
      await this.ganDotGiamGiaChoDanhSachCtsp(this.cartItems);
    },

    // ================== NORMALIZE ĐỢT GIẢM GIÁ (giữ lại để fallback) ==================
    toNumberSafe(v) {
      if (v == null) return 0;
      const n = Number(String(v).replace("%", "").trim());
      return Number.isFinite(n) ? n : 0;
    },

    normalizePercent(raw) {
      let n = this.toNumberSafe(raw);
      if (!Number.isFinite(n) || n <= 0) return 0;

      // BE hay trả 0.1 = 10%
      if (n > 0 && n <= 1) n = n * 100;

      n = Math.round(n);
      if (n < 0) n = 0;
      if (n > 100) n = 100;
      return n;
    },

    extractDotInfo(x) {
      const dot = x?.dotGiamGia || x?.dot_giam_gia || x?.dot || x?.dotKhuyenMai || null;
      const ct = x?.chiTietDotGiamGia || x?.chi_tiet_dot_giam_gia || x?.chiTietDot || null;

      const idDot =
        x?.idDotGiamGia ??
        dot?.id ??
        ct?.idDotGiamGia ??
        ct?.dotGiamGia?.id ??
        null;

      const maDot =
        x?.maDotGiamGia ??
        dot?.maDotGiamGia ??
        dot?.maDot ??
        dot?.ma ??
        ct?.maDotGiamGia ??
        ct?.dotGiamGia?.maDotGiamGia ??
        ct?.dotGiamGia?.maDot ??
        null;

      const tenDot =
        x?.tenDotGiamGia ??
        dot?.tenDotGiamGia ??
        dot?.tenDot ??
        dot?.ten ??
        ct?.tenDotGiamGia ??
        ct?.dotGiamGia?.tenDotGiamGia ??
        ct?.dotGiamGia?.tenDot ??
        null;

      return { idDot, maDot, tenDot, dot, ct };
    },

    extractDiscountPercent(x) {
      const { dot, ct } = this.extractDotInfo(x);

      const raw =
        x?.phanTramGiam ??
        x?.phanTramGiamGia ??
        x?.phanTramKhuyenMai ??
        x?.phanTram ??
        x?.giaTriGiamPhanTram ??
        x?.giaTriGiam ??
        ct?.phanTramGiam ??
        ct?.phanTramGiamGia ??
        ct?.giaTriGiam ??
        dot?.phanTramGiam ??
        dot?.phanTramGiamGia ??
        dot?.giaTriGiam ??
        0;

      return this.normalizePercent(raw);
    },

    extractDiscountAmount(x) {
      const { dot, ct } = this.extractDotInfo(x);
      const raw =
        x?.soTienGiam ??
        x?.tienGiam ??
        x?.giaTriGiamTien ??
        x?.soTienGiamGia ??
        x?.giaGiam ??
        ct?.soTienGiam ??
        ct?.tienGiam ??
        ct?.giaTriGiamTien ??
        ct?.soTienGiamGia ??
        ct?.giaGiam ??
        dot?.soTienGiam ??
        dot?.tienGiam ??
        dot?.giaTriGiamTien ??
        dot?.soTienGiamGia ??
        dot?.giaGiam ??
        0;

      const n = this.toNumberSafe(raw);
      return n > 0 ? Math.round(n) : 0;
    },

    extractGiaGoc(x) {
      const raw =
        x?.giaGoc ??
        x?.giaBanGoc ??
        x?.giaNiemYet ??
        x?.giaGocSanPham ??
        x?.donGiaGoc ??
        0;
      const n = this.toNumberSafe(raw);
      if (n > 0) return Math.round(n);

      const gb = this.toNumberSafe(x?.giaBan ?? 0);
      return gb > 0 ? Math.round(gb) : 0;
    },

    extractGiaSauGiam(x) {
      const raw =
        x?.giaSauGiam ??
        x?.giaSauGiamGia ??
        x?.giaKhuyenMai ??
        x?.giaDaGiam ??
        x?.giaBanSauGiam ??
        x?.giaSauKhuyenMai ??
        x?.donGiaSauGiam ??
        0;

      const n = this.toNumberSafe(raw);
      return n > 0 ? Math.round(n) : 0;
    },

    normalizeCtspRow(x) {
      if (!x || typeof x !== "object") return x;

      const { idDot, maDot, tenDot } = this.extractDotInfo(x);

      const giaGoc = this.extractGiaGoc(x);
      const pct = this.extractDiscountPercent(x);
      const amt = pct > 0 ? 0 : this.extractDiscountAmount(x);

      let giaSau = this.extractGiaSauGiam(x);

      if (!(giaSau > 0)) {
        if (giaGoc > 0 && pct > 0) {
          giaSau = Math.round((giaGoc * (100 - pct)) / 100);
        } else if (giaGoc > 0 && amt > 0) {
          giaSau = Math.round(Math.max(0, giaGoc - amt));
        } else {
          const gb = this.toNumberSafe(x?.giaBan ?? 0);
          giaSau = gb > 0 ? Math.round(gb) : giaGoc;
        }
      }

      if (giaGoc > 0 && pct > 0) {
        const expect = Math.round((giaGoc * (100 - pct)) / 100);
        const gb = this.toNumberSafe(x?.giaBan ?? 0);
        if (gb > 0 && Math.round(gb) === giaGoc) giaSau = expect;
      }

      const pctDisplay =
        pct > 0 ? pct : giaGoc > 0 && amt > 0 ? Math.round(Math.min(100, (amt / giaGoc) * 100)) : 0;

      return {
        ...x,

        idDotGiamGia: idDot ?? x?.idDotGiamGia ?? null,
        maDotGiamGia: maDot ?? x?.maDotGiamGia ?? null,
        tenDotGiamGia: tenDot ?? x?.tenDotGiamGia ?? null,

        giaGoc: giaGoc || 0,
        giaBan: giaSau || giaGoc || 0,

        phanTramGiam: pctDisplay,
      };
    },

    // ================== Giá bán (khớp BE mới) ==================
    getGiaGoc(it) {
      if (!it) return 0;

      const goc = Number(it.giaGoc);
      if (Number.isFinite(goc) && goc > 0) return goc;

      const giaBanOld = Number(it.giaBan || 0);
      return Number.isFinite(giaBanOld) && giaBanOld > 0 ? giaBanOld : 0;
    },

    getGiaThucTe(it) {
      if (!it) return 0;

      const gb = Number(it.giaBan ?? 0);
      if (Number.isFinite(gb) && gb > 0) return Math.round(gb);

      const giaGoc = this.getGiaGoc(it);
      const pct = this.normalizePercent(it.phanTramGiam ?? it.phanTramKhuyenMai ?? 0);
      if (giaGoc > 0 && pct > 0) return Math.round((giaGoc * (100 - pct)) / 100);

      return Math.round(giaGoc || 0);
    },

    showGiaGoc(it) {
      const giaGoc = Number(this.getGiaGoc(it) || 0);
      const giaThuc = Number(this.getGiaThucTe(it) || 0);
      return giaGoc > 0 && giaThuc > 0 && giaThuc < giaGoc;
    },

    getPhanTramGiamDisplay(it) {
      const p = this.normalizePercent(it?.phanTramGiam ?? it?.phanTramKhuyenMai ?? 0);
      if (!Number.isFinite(p) || p <= 0) return 0;
      return Math.round(p);
    },

    getGiamGiaTitle(it) {
      const pct = this.getPhanTramGiamDisplay(it);
      const tenDot = it?.tenDotGiamGia || it?.tenDot || "";
      const maDot = it?.maDotGiamGia || it?.maDot || "";
      if (maDot || tenDot) return `Đợt giảm giá: ${[maDot, tenDot].filter(Boolean).join(" - ")} · Giảm ${pct}%`;
      return `Giảm ${pct}%`;
    },

    // ================== Cart ==================
    incQty(it) {
      const max = this.getMaxQtyForItem(it);
      const cur = Number(it.qty || 1);
      if (cur >= max) {
        this.showToast("Số lượng mua không được vượt tồn kho.", "error");
        it.qty = Math.max(1, max);
        return;
      }
      it.qty = cur + 1;
    },

    decQty(it) {
      const cur = Number(it.qty || 1);
      if (cur > 1) it.qty = cur - 1;
    },

    onQtyInput(it, e) {
      const raw = String(e?.target?.value || "");
      const digits = raw.replace(/\D/g, "");
      const n = digits ? Number(digits) : 0;

      const max = this.getMaxQtyForItem(it);
      const next = this.clampInt(n, 1, Math.max(1, max));
      it.qty = next;

      if (next > max) this.showToast("Số lượng mua không được vượt tồn kho.", "error");
    },

    onQtyBlur(it) {
      const max = this.getMaxQtyForItem(it);
      const cur = Number(it.qty || 0);
      if (!Number.isFinite(cur) || cur < 1) it.qty = 1;
      if (cur > max) {
        it.qty = Math.max(1, max);
        this.showToast("Số lượng mua đã được tự điều chỉnh theo tồn kho.", "info");
      }
    },

    removeItem(id) {
      this.cartItems = this.cartItems.filter((x) => x.id !== id);
      this.scheduleAutoVoucher();
    },

    onCtspPickQtyInput(row, e) {
      const id = row?.id;
      if (id == null) return;

      const raw = String(e?.target?.value || "");
      const digits = raw.replace(/\D/g, "");
      const n = digits ? Number(digits) : 0;

      const max = Math.max(0, Number(row.__available || 0));
      const next = this.clampInt(n, 1, Math.max(1, max));

      this.ctspPickQty = { ...this.ctspPickQty, [id]: next };
    },

    pickCtsp(row, qtyToAdd = 1) {
      if (!row) return;

      // ✅ luôn normalize để không rơi case đợt giảm giá trả nested/0.1
      const nx = this.normalizeCtspRow(row);

      const id = nx?.id;
      if (id == null) return;

      const available = this.getAvailableQtyByCtspId(id);
      if (available <= 0) {
        this.showToast("Sản phẩm đã hết hàng.", "error");
        return;
      }

      const want = this.clampInt(qtyToAdd, 1, Math.max(1, available));
      const exist = this.cartItems.find((x) => x.id === id);

      if (exist) {
        const max = this.getMaxQtyForItem(exist);
        const newQty = Math.min(max, Number(exist.qty || 1) + want);

        if (newQty <= Number(exist.qty || 1)) {
          this.showToast("Số lượng mua không được vượt tồn kho.", "error");
          return;
        }

        exist.giaGoc = nx.giaGoc ?? exist.giaGoc ?? exist.giaBan;
        exist.giaBan = nx.giaBan ?? exist.giaBan;
        exist.phanTramGiam = nx.phanTramGiam ?? exist.phanTramGiam ?? 0;
        exist.idDotGiamGia = nx.idDotGiamGia ?? exist.idDotGiamGia ?? null;
        exist.maDotGiamGia = nx.maDotGiamGia ?? exist.maDotGiamGia ?? null;
        exist.tenDotGiamGia = nx.tenDotGiamGia ?? exist.tenDotGiamGia ?? null;

        exist.qty = newQty;
        exist.checked = true;
      } else {
        const addQty = Math.min(want, available);

        this.cartItems.unshift({
          id: nx.id,
          maCtsp: nx.maCtsp,
          tenSanPham: nx.tenSanPham,
          mauSac: nx.mauSac,
          kichCo: nx.kichCo,

          giaGoc: nx.giaGoc ?? nx.giaBan,
          giaBan: nx.giaBan,

          phanTramGiam: nx.phanTramGiam ?? 0,
          idDotGiamGia: nx.idDotGiamGia ?? null,
          maDotGiamGia: nx.maDotGiamGia ?? null,
          tenDotGiamGia: nx.tenDotGiamGia ?? null,

          anhUrl: nx.anhUrl,

          qty: addQty,
          checked: true,
        });
      }

      this.ctspPickQty = { ...this.ctspPickQty, [id]: 1 };

      this.scheduleAutoVoucher();
    },

    // ================== CTSP Modal ==================
    async openCtspModal() {
      this.showCtspModal = true;
      this.ctspPage = 1;
      this.ctspPickQty = {};
      await this.loadCtspForPos();
    },

    closeCtspModal() {
      this.showCtspModal = false;
    },

    resetCtspFilter() {
      this.ctspFilter = { keyword: "", mauSac: "", kichCo: "", tenSanPham: "" };
      this.ctspPage = 1;
    },

    async loadCtspForPos() {
      this.ctspLoading = true;
      this.ctspErr = "";
      try {
        const data = await SalesService.getCtspBanHang();
        const rawList = Array.isArray(data) ? data : [];

        // 1) normalize cơ bản (fallback)
        const list = rawList.map((x) => this.normalizeCtspRow(x));

        // 2) FIX CHÍNH: gọi API best đợt giảm giá theo CTSP IDs và merge vào list
        await this.ganDotGiamGiaChoDanhSachCtsp(list);

        this.ctspList = list;

        const map = { ...(this.ctspBaseQtyMap || {}) };
        for (const x of list) {
          const id = x?.id;
          if (id == null) continue;
          const base = Math.max(0, Number(x?.soLuong || 0));
          map[id] = base;
        }
        this.ctspBaseQtyMap = map;
        this.persistCtspBaseQtyMap();

        // đồng bộ giảm giá cho giỏ hàng (nếu giỏ có item từ localStorage)
        await this.capNhatDotGiamGiaChoGioHang();

        this.ctspPage = 1;
      } catch (e) {
        this.ctspErr = "Không tải được danh sách biến thể (API đang lỗi).";
        this.ctspList = [];
      } finally {
        this.ctspLoading = false;
      }
    },

    // ================== QR Modal ==================
    async openQrModal() {
      this.showQrModal = true;
      this.qrError = "";
      this.$nextTick(async () => {
        await this.startQr();
      });
    },

    async closeQrModal() {
      this.showQrModal = false;
      await this.stopQr();
    },

    async restartQr() {
      this.qrError = "";
      await this.stopQr();
      await this.startQr();
    },

    async startQr() {
      try {
        if (!this.qr) this.qr = new Html5Qrcode("ss-qr-reader");

        const config = { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 };

        await this.qr.start({ facingMode: "environment" }, config, async (decodedText) => {
          const text = String(decodedText || "").trim();
          if (!text) return;

          if (this.ctspList.length === 0) await this.loadCtspForPos();

          let row = this.ctspList.find((x) => String(x.maCtsp || "").trim() === text);

          if (!row) {
            const id = Number(text);
            if (Number.isFinite(id)) row = this.ctspList.find((x) => Number(x.id) === id);
          }

          if (row) {
            this.pickCtsp({ ...row, __available: this.getAvailableQtyByCtspId(row.id) }, 1);
            await this.stopQr();
            this.showQrModal = false;
          }
        });
      } catch (e) {
        this.qrError = "Không mở được camera/QR. Vui lòng cấp quyền camera hoặc dùng thiết bị khác.";
      }
    },

    async stopQr() {
      try {
        if (this.qr && (await this.qr.getState()) === 2) await this.qr.stop();
      } catch (e) {}
      try {
        if (this.qr) await this.qr.clear();
      } catch (e) {}
    },

    // ================== Customer Modal ==================
    async openKhModal() {
      this.showKhModal = true;
      await this.loadKh();
      this.preloadKhAddr(this.filteredKh.slice(0, 12));
    },

    closeKhModal() {
      this.showKhModal = false;
    },

    async reloadKh() {
      await this.loadKh();
      this.preloadKhAddr(this.filteredKh.slice(0, 12));
    },

    async loadKh() {
      this.khLoading = true;
      this.khErr = "";
      try {
        const data = await SalesService.getKhachHangAll();
        this.khList = Array.isArray(data) ? data : [];
      } catch (e) {
        this.khErr = "Không tải được dữ liệu khách hàng (API đang lỗi).";
        this.khList = [];
      } finally {
        this.khLoading = false;
      }
    },

    async pickKh(k) {
      this.selectedKh = k;
      this.showKhModal = false;

      this.guest = {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      };

      if (!this.isCounter && k?.id) {
        await this.loadDiaChiAndPickDefault(k.id);
      } else {
        this.diaChiList = [];
        this.selectedDiaChi = null;
      }

      this.ensureKhAddr(k);
      this.scheduleAutoVoucher();
    },

    preloadKhAddr(list) {
      if (!Array.isArray(list)) return;
      list.forEach((k) => this.ensureKhAddr(k));
    },

    async ensureKhAddr(k) {
      if (!k?.id) return;
      if (this.khAddrCache[k.id]) return;
      if (this.khAddrLoading[k.id]) return;

      const direct = this.renderKhDiaChi(k);
      if (direct) {
        this.khAddrCache = { ...this.khAddrCache, [k.id]: direct };
        return;
      }

      this.khAddrLoading = { ...this.khAddrLoading, [k.id]: true };
      try {
        const list = await SalesService.getDiaChiByKhachHangId(k.id);
        let def = list.find((x) => x.macDinh === true || x.macDinh === 1);
        if (!def && list.length > 0) def = list[0];

        const addr = def ? this.renderDiaChi(def) : "";
        if (addr) this.khAddrCache = { ...this.khAddrCache, [k.id]: addr };
      } catch (e) {
      } finally {
        const { [k.id]: _, ...rest } = this.khAddrLoading;
        this.khAddrLoading = rest;
      }
    },

    // ================== Address ==================
    async openDiaChiModal() {
      if (!this.selectedKh?.id) return;
      this.showDiaChiModal = true;
      await this.loadDiaChiAndPickDefault(this.selectedKh.id, false);
    },

    closeDiaChiModal() {
      this.showDiaChiModal = false;
    },

    async loadDiaChiAndPickDefault(khachHangId, autoCloseIfSingle = true) {
      this.dcLoading = true;
      this.dcErr = "";
      try {
        const list = await SalesService.getDiaChiByKhachHangId(khachHangId);

        this.diaChiList = Array.isArray(list) ? list : [];

        let def = this.diaChiList.find((x) => x.macDinh === true || x.macDinh === 1);
        if (!def && this.diaChiList.length > 0) def = this.diaChiList[0];

        this.selectedDiaChi = def || null;

        if (this.selectedKh?.id && this.selectedDiaChi) {
          const addr = this.renderDiaChi(this.selectedDiaChi);
          if (addr) this.khAddrCache = { ...this.khAddrCache, [this.selectedKh.id]: addr };
        }

        if (autoCloseIfSingle && this.diaChiList.length <= 1) {
          this.showDiaChiModal = false;
        }
      } catch (e) {
        this.dcErr = "Không tải được địa chỉ khách hàng (API đang lỗi).";
        this.diaChiList = [];
        this.selectedDiaChi = null;
      } finally {
        this.dcLoading = false;
      }
    },

    pickDiaChi(dc) {
      this.selectedDiaChi = dc;
      this.showDiaChiModal = false;

      if (this.selectedKh?.id && dc) {
        const addr = this.renderDiaChi(dc);
        if (addr) this.khAddrCache = { ...this.khAddrCache, [this.selectedKh.id]: addr };
      }
    },

    renderDiaChi(dc) {
      if (!dc) return "";
      const soNha = dc.soNha || dc.diaChiCuThe || dc.diaChi || dc.diaChiChiTiet || "";
      const xa = dc.xaPhuong || dc.phuongXa || dc.xa || "";
      const huyen = dc.quanHuyen || dc.huyenQuan || dc.huyen || "";
      const tinh = dc.tinhThanh || dc.thanhPho || dc.tinh || "";
      const parts = [soNha, xa, huyen, tinh].filter((x) => String(x || "").trim());
      return parts.join(", ");
    },

    // ================== Voucher (auto best) ==================
    scheduleAutoVoucher() {
      if (this.voucherDebounce) clearTimeout(this.voucherDebounce);
      this.voucherDebounce = setTimeout(async () => {
        await this.loadBestVoucher();
      }, 350);
    },

    async loadBestVoucher() {
      if (this.voucherManual) {
        this.persistActiveTab();
        return;
      }

      this.autoVoucher = null;

      const tong = Math.round(Number(this.tongTienHang || 0));
      if (tong <= 0) {
        this.persistActiveTab();
        return;
      }

      this.loadingVoucher = true;
      try {
        await this.loadPublicVouchersIfNeeded();

        const all = Array.isArray(this.voucherCache.all) ? this.voucherCache.all : [];
        let candidates = [...all];

        if (this.selectedKh?.id) {
          const personal = await this.loadPersonalVouchersMaybe(this.selectedKh.id);
          if (Array.isArray(personal) && personal.length) {
            const normalized = personal
              .map((x) => {
                if (x?.phieuGiamGia) {
                  return {
                    ...x.phieuGiamGia,
                    __pggcnId: x.id || x.idPhieuGiamGiaCaNhan || x.idPggcn || null,
                    __isPersonal: true,
                  };
                }
                return { ...x, __isPersonal: true };
              })
              .filter(Boolean);

            candidates = candidates.concat(normalized);
          }
        }

        const best = this.pickBestVoucher(candidates, tong);
        this.autoVoucher = best || null;
      } catch (e) {
        this.autoVoucher = null;
      } finally {
        this.loadingVoucher = false;
        this.persistActiveTab();
      }
    },

    async loadPublicVouchersIfNeeded() {
      const now = Date.now();
      if (this.voucherCache.loadedAt && now - this.voucherCache.loadedAt < 60_000 && Array.isArray(this.voucherCache.all)) {
        return;
      }

      const data = await SalesService.getVouchersPublic().catch(() => []);
      this.voucherCache.all = Array.isArray(data) ? data : [];
      this.voucherCache.loadedAt = now;
    },

    async loadPersonalVouchersMaybe(khachHangId) {
      const now = Date.now();
      if (
        this.voucherCache.loadedAtPersonal &&
        now - this.voucherCache.loadedAtPersonal < 30_000 &&
        Array.isArray(this.voucherCache.personal) &&
        this.voucherCache.personalKhId === khachHangId
      ) {
        return this.voucherCache.personal;
      }

      try {
        const data = await SalesService.getVouchersPersonalByKhachHangId(khachHangId).catch(() => []);
        this.voucherCache.personal = Array.isArray(data) ? data : [];
        this.voucherCache.personalKhId = khachHangId;
        this.voucherCache.loadedAtPersonal = now;
        return this.voucherCache.personal;
      } catch (e) {
        this.voucherCache.personal = [];
        this.voucherCache.personalKhId = khachHangId;
        this.voucherCache.loadedAtPersonal = now;
        return [];
      }
    },

    pickBestVoucher(list, tongTien) {
      if (!Array.isArray(list) || list.length === 0) return null;

      let best = null;
      let bestDiscount = 0;

      for (const v of list) {
        const discount = this.calcVoucherDiscount(v, tongTien);
        if (discount > bestDiscount) {
          bestDiscount = discount;
          best = v;
        }
      }

      return bestDiscount > 0 ? best : null;
    },

    calcVoucherDiscount(v, tongTien) {
      const tong = Number(tongTien || 0);
      if (!v || tong <= 0) return 0;

      if (v.xoaMem === true || v.trangThai === false) return 0;

      const remain = Number(v.soLuongSuDung ?? 0);
      if (Number.isFinite(remain) && remain <= 0) return 0;

      const min = Number(v.hoaDonToiThieu ?? 0);
      if (Number.isFinite(min) && min > 0 && tong < min) return 0;

      const today = this.todayYmd();
      const start = this.toYmd(v.ngayBatDau);
      const end = this.toYmd(v.ngayKetThuc);
      if (start && today < start) return 0;
      if (end && today > end) return 0;

      const isPercent = v.loaiPhieuGiamGia === true;
      const giaTri = Number(v.giaTriGiamGia ?? v.giaTriGiam ?? 0);
      let discount = 0;

      if (isPercent) {
        const pct = Math.max(0, Math.min(100, giaTri));
        discount = Math.round((tong * pct) / 100);

        const cap = Number(v.soTienGiamToiDa ?? 0);
        if (Number.isFinite(cap) && cap > 0) discount = Math.min(discount, cap);
      } else {
        discount = Math.round(Math.max(0, giaTri));
      }

      discount = Math.min(discount, tong);
      return discount > 0 ? discount : 0;
    },

    // ================== Voucher manual ==================
    async applyVoucherCode() {
      const code = (this.voucherCode || "").trim();
      if (!code) {
        this.voucherManual = null;
        this.showToast("Đã bỏ mã phiếu giảm giá.", "info");
        this.scheduleAutoVoucher();
        return;
      }

      try {
        await this.loadPublicVouchersIfNeeded();

        let candidates = Array.isArray(this.voucherCache.all) ? [...this.voucherCache.all] : [];

        if (this.selectedKh?.id) {
          const personal = await this.loadPersonalVouchersMaybe(this.selectedKh.id);
          if (Array.isArray(personal) && personal.length) {
            const normalized = personal
              .map((x) => (x?.phieuGiamGia ? { ...x.phieuGiamGia, __pggcnId: x.id, __isPersonal: true } : { ...x, __isPersonal: true }))
              .filter(Boolean);
            candidates = candidates.concat(normalized);
          }
        }

        const found = candidates.find((v) => String(v.maPhieuGiamGia || v.ma || v.code || "").trim() === code);

        if (!found) {
          this.voucherManual = null;
          this.showToast("Không tìm thấy mã phiếu giảm giá.", "error");
          return;
        }

        const disc = this.calcVoucherDiscount(found, Math.round(this.tongTienHang || 0));
        if (disc <= 0) {
          this.voucherManual = null;
          this.showToast("Mã không hợp lệ hoặc không đủ điều kiện áp dụng.", "error");
          return;
        }

        this.voucherManual = found;
        this.autoVoucher = null;
        this.showToast(`Đã áp dụng mã: ${code}`, "success");
        this.persistActiveTab();
      } catch (e) {
        this.voucherManual = null;
        this.showToast("Áp dụng mã thất bại (API đang lỗi).", "error");
      }
    },

    // ================== Payment modal ==================
    openPayModal() {
      this.showPayModal = true;
      this.payInputText = this.formatNumberText(this.khachThanhToan || 0);
    },

    closePayModal() {
      this.showPayModal = false;
    },

    onPayInput(e) {
      const raw = String(e?.target?.value || "");
      const digits = raw.replace(/\D/g, "");
      const n = digits ? Number(digits) : 0;
      this.payInputText = n > 0 ? n.toLocaleString("vi-VN") : "";
    },

    confirmPay() {
      this.khachThanhToan = this.payInputNum;
      this.showPayModal = false;
    },

    // ================== Ship fee input ==================
    onShipFeeInput(e) {
      const raw = String(e?.target?.value || "");
      const digits = raw.replace(/\D/g, "");
      const n = digits ? Number(digits) : 0;
      this.phiVanChuyen = n;
      this.phiVanChuyenText = n > 0 ? n.toLocaleString("vi-VN") : "0";
    },

    // ================== Submit helpers ==================
    buildHoaDonPayload() {
      const isShipping = !this.isCounter;

      let tenKh = "";
      if (this.selectedKh) tenKh = this.getKhName(this.selectedKh);
      else if (this.isCounter) tenKh = "Khách lẻ";
      else tenKh = (this.guest.tenKhachHang || "Khách vãng lai").trim();

      const sdtDigits = this.selectedKh
        ? String(this.getKhPhone(this.selectedKh) || "").replace(/\D/g, "")
        : String(this.guest.soDienThoai || "").replace(/\D/g, "");
      const sdtKh = sdtDigits || "0000000000";

      let diaChi = "Tại quầy";
      if (isShipping) {
        if (this.selectedKh) {
          diaChi = this.selectedDiaChi ? this.renderDiaChi(this.selectedDiaChi) : "";
        } else {
          const parts = [this.guest.diaChiCuThe, this.guest.xaPhuong, this.guest.huyenQuan, this.guest.tinhThanh].filter((x) => String(x || "").trim());
          diaChi = parts.join(", ");
        }
      }

      const emailKh = this.selectedKh ? this.getKhEmail(this.selectedKh) || null : null;

      const loaiDon = this.isCounter ? false : true;
      const shipFee = this.isCounter ? 0 : this.phiVanChuyenNum;

      const idNhanVien = this.nguoiBan?.id ?? null;

      return {
        idKhachHang: this.selectedKh?.id || null,
        idNhanVien,

        idPhieuGiamGia: this.effectiveVoucher?.id || null,
        idPhieuGiamGiaCaNhan: this.effectiveVoucher?.__pggcnId || null,

        loaiDon,
        phiVanChuyen: Math.round(shipFee),

        tongTien: Math.round(this.tongTienHang + shipFee),
        tongTienSauGiam: Math.round(this.tongPhaiTra),

        tenKhachHang: tenKh,
        diaChiKhachHang: diaChi || (this.isCounter ? "Tại quầy" : ""),
        soDienThoaiKhachHang: sdtKh,
        emailKhachHang: emailKh,

        ghiChu: null,
      };
    },

    buildHoaDonChiTietPayloadList(idHoaDon) {
      return (this.cartItems || []).map((it) => ({
        idHoaDon,
        idChiTietSanPham: it.id,
        soLuong: Number(it.qty || 1),
        donGia: Number(this.getGiaThucTe(it) || 0),
        ghiChu: null,
        xoaMem: false,
      }));
    },

    async saveHoaDonChiTiet(idHoaDon) {
      const list = this.buildHoaDonChiTietPayloadList(idHoaDon);
      if (!Array.isArray(list) || list.length === 0) return;

      const tries = [
        { url: `/api/admin/hoa-don/${idHoaDon}/chi-tiet`, data: list },
        { url: `/api/admin/hoa-don-chi-tiet`, data: list },
      ];

      let lastErr = null;
      for (const t of tries) {
        try {
          await apiClient.post(t.url, t.data);
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error("SAVE_CT_FAIL");
    },

    async rollbackHoaDonNeuCan(idHoaDon) {
      try {
        await apiClient.delete(`/api/admin/hoa-don/${idHoaDon}`);
      } catch (e) {}
    },

    // ================== Submit ==================
    async submitOrder() {
      if (!this.canSubmit) return;

      for (const it of this.cartItems) {
        const qty = Number(it.qty || 0);
        if (!Number.isFinite(qty) || qty < 1) {
          this.showToast("Số lượng mua không hợp lệ.", "error");
          return;
        }

        const max = this.getMaxQtyForItem(it);
        if (qty > max) {
          this.showToast(`Sản phẩm ${it.maCtsp || ""} vượt tồn kho.`, "error");
          it.qty = Math.max(1, max);
          return;
        }
      }

      const payload = this.buildHoaDonPayload();

      this.submitting = true;
      try {
        const res = await apiClient.post("/api/admin/hoa-don", payload);
        const created = res?.data;
        const hdId = created?.id;

        if (hdId == null) {
          this.showToast("Tạo hóa đơn thất bại (không nhận được id).", "error");
          return;
        }

        try {
          await this.saveHoaDonChiTiet(hdId);
        } catch (e) {
          await this.rollbackHoaDonNeuCan(hdId);
          this.showToast("Không lưu được chi tiết hóa đơn. Đã hủy hóa đơn vừa tạo.", "error");
          return;
        }

        if (this.isCounter && this.payMethod === "TIEN_MAT") {
          try {
            const note = "Chốt đơn tại quầy - tiền mặt";
            const done = await apiClient.put(`/api/admin/hoa-don/${hdId}/confirm-tai-quay-tien-mat`, { ghiChu: note });
            const finalHd = done?.data || created;
            this.goToHoaDon(finalHd);
          } catch (e) {
            this.showToast("Chốt tiền mặt thất bại. Vẫn đã tạo hóa đơn và chi tiết.", "error");
            this.goToHoaDon(created);
          }
        } else {
          if (this.isCounter && this.payMethod === "CHUYEN_KHOAN") {
            this.showToast("Chưa có endpoint chốt chuyển khoản. Đã tạo hóa đơn và chi tiết.", "info");
          }
          this.goToHoaDon(created);
        }

        this.resetActiveTabAfterSubmit();
      } catch (e) {
        this.showToast("Tạo hóa đơn thất bại. Kiểm tra API /api/admin/hoa-don hoặc dữ liệu bắt buộc.", "error");
      } finally {
        this.submitting = false;
      }
    },

    goToHoaDon(created) {
      const id = created?.id;
      try {
        if (id != null) {
          this.$router.push(`/admin/hoa-don/${id}`);
        } else {
          this.$router.push(`/admin/hoa-don`);
        }
      } catch (e) {
        try {
          this.$router.push(`/admin/hoa-don`);
        } catch (e2) {}
      }
    },

    resetActiveTabAfterSubmit() {
      const t = this.tabs[this.activeTab];
      if (!t) return;

      t.isCounter = false;
      t.cartItems = [];
      t.selectedKh = null;
      t.diaChiList = [];
      t.selectedDiaChi = null;
      t.autoVoucher = null;
      t.voucherManual = null;
      t.voucherCode = "";
      t.khachThanhToan = 0;
      t.payMethod = "TIEN_MAT";
      t.guest = {
        tenKhachHang: "",
        soDienThoai: "",
        diaChiCuThe: "",
        tinhThanh: "",
        huyenQuan: "",
        xaPhuong: "",
      };
      t.phiVanChuyen = 0;
      t.phiVanChuyenText = "0";

      this.applyTabState(t);
      this.persistTabs();
      this.scheduleAutoVoucher();
    },
  },
};
</script>

<style scoped>
/* ======= base ======= */
.ss-pos {
  padding-bottom: 18px;
}

/* ======= Badge giảm giá (đồng bộ) ======= */
/* ✅ Badge -% trên ảnh (đồng nhất theo AddDiscountPage) */
.thumb-wrap {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  overflow: visible; /* quan trọng: để badge không bị cắt */
}

.discount-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
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
  font-weight: 600;
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
}

.ss-btn-outline {
  background: #fff;
  border: 1px solid rgba(153, 27, 27, 0.28);
  color: rgba(153, 27, 27, 0.92);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
}

.ss-btn-mini {
  padding: 7px 10px;
  border-radius: 10px;
}

.ss-card-main {
  padding: 14px;
}

/* EMPTY */
.ss-empty-wrap {
  min-height: 320px;
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

/* Section head */
.ss-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.ss-section-title {
  font-size: 14px;
  font-weight: 500;
}
.ss-section-actions {
  display: flex;
  gap: 10px;
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

  /* FIX: chặn mọi rule làm ảnh tròn (rounded-circle / border-radius:50%...) */
  border-radius: 12px !important;
}
.ss-thumb-ph {
  width: 100%;
  height: 100%;
  background: rgba(153, 27, 27, 0.06);

  /* FIX: placeholder cũng bo góc như ảnh */
  border-radius: 12px;
}

/* FIX: nếu bạn đang gắn thumb-wrap trực tiếp lên ss-cart-thumb/ss-thumb
   thì overflow hidden của thumb bị override ngược lại hoặc làm badge bị cắt.
   Ưu tiên để badge không bị cắt. */
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
.ss-cart-code {
  color: rgba(17, 24, 39, 0.72);
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
  border-radius: 12px;
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

/* Guest */
.ss-guest-hint {
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
  font-weight: 500;
  margin-bottom: 2px;
}
.ss-guest-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ss-guest-full {
  grid-column: 1 / -1;
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
  font-weight: 600;
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
  font-weight: 600;
  color: rgba(17, 24, 39, 0.82);
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

/* Voucher input row */
.ss-voucher-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 10px;
  align-items: end;
}
.ss-voucher-val {
  max-width: 180px;
}

/* Voucher auto hint */
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

/* ======= Modal ======= */
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
  max-width: 720px;
}
.ss-modal-pay {
  max-width: 560px;
}
.ss-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.1);
}
.ss-pay-head {
  background: linear-gradient(90deg, rgba(153, 27, 27, 0.08), rgba(17, 24, 39, 0.05));
}
.ss-modal-title {
  font-size: 14px;
  font-weight: 600;
}
.ss-x {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  font-size: 20px;
  color: rgba(17, 24, 39, 0.72);
}
.ss-modal-body {
  padding: 20px;
}
.ss-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(17, 24, 39, 0.1);
}
.ss-pay-actions {
  background: rgba(17, 24, 39, 0.02);
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
  border-radius: 12px;
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

/* pick qty input */
.ss-pick-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.ss-pick-qty {
  width: 70px;
  height: 32px;
  text-align: center;
  border-radius: 10px;
  font-size: 12px;
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
}
.ss-dc-text {
  font-size: 12px;
  color: rgba(17, 24, 39, 0.62);
  margin-top: 6px;
}

/* Pay modal */
.ss-paybox {
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  padding: 12px;
  background: rgba(17, 24, 39, 0.02);
}
.ss-paybox-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
}
.ss-paybox-red {
  color: rgba(153, 27, 27, 0.92);
  font-weight: 700;
}
.ss-paybox-method {
  display: flex;
  gap: 10px;
  margin: 10px 0 12px;
}
.ss-method {
  flex: 1;
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.14);
  background: #fff;
  padding: 10px 12px;
  font-size: 13px;
  color: rgba(17, 24, 39, 0.72);
}
.ss-method.active {
  border-color: rgba(153, 27, 27, 0.35);
  background: rgba(153, 27, 27, 0.06);
  color: rgba(153, 27, 27, 0.92);
}

/* ===== Modal Chọn khách hàng ===== */
.ss-modal-kh {
  max-width: 900px;
}
.ss-kh-body {
  padding: 20px;
}
.ss-kh-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.ss-kh-search {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  font-size: 13px;
}
.ss-kh-reload {
  height: 36px;
  border-radius: 4px;
  font-size: 13px;
  padding: 0 12px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
}
.ss-kh-tablewrap {
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 4px;
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
  width: 48px;
  text-align: center;
}
.kh-col-name {
  width: 180px;
}
.kh-col-phone {
  width: 140px;
}
.kh-col-act {
  width: 120px;
  text-align: center;
}
.ss-kh-pick {
  height: 28px;
  min-width: 64px;
  border-radius: 4px;
  font-size: 12px;
  padding: 0 10px;
  border: none;
  background: rgba(153, 27, 27, 0.92);
  color: #fff;
}
.ss-kh-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.ss-kh-close {
  height: 32px;
  border-radius: 4px;
  font-size: 13px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  background: #fff;
  color: rgba(17, 24, 39, 0.82);
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

/* Responsive */
@media (max-width: 1100px) {
  .ss-bottom-grid {
    grid-template-columns: 1fr;
  }
  .ss-filter {
    grid-template-columns: 1fr 1fr;
  }
  .ss-guest-grid {
    grid-template-columns: 1fr;
  }
  .ss-voucher-row {
    grid-template-columns: 1fr;
  }
}
</style>
