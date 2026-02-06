package com.example.datn_sevenstrike.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuGiamGiaRequest {

    private String tenPhieuGiamGia;

    private Boolean loaiPhieuGiamGia;      // false: % | true: tiền
    private BigDecimal giaTriGiamGia;      // dùng cho %
    private BigDecimal soTienGiamToiDa;    // dùng cho tiền (hoặc max tiền khi %)

    private BigDecimal hoaDonToiThieu;
    private Integer soLuongSuDung;         // nếu là cá nhân: BE tự set theo số KH, FE không cần nhập

    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;

    private Boolean trangThai;             // bật/tắt voucher
    private String moTa;

    private Boolean xoaMem;

    // ✅ NEW: nếu có list này => xem như voucher cá nhân (gửi mail + lưu chi tiết)
    private List<Integer> idKhachHangs;
}
