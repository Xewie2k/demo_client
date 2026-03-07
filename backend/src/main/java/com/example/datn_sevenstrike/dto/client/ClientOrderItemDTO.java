package com.example.datn_sevenstrike.dto.client;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientOrderItemDTO {
    private String tenSanPham;
    private String anhDaiDien;
    private String phanLoai; // e.g. "Kich thuoc: Nho, Mau: Xanh"
    private BigDecimal donGia;
    // Giá cũ trước khi thay đổi (null nếu chưa thay đổi)
    private BigDecimal donGiaCu;
    private int soLuong;
    private BigDecimal thanhTien;
    // ID biến thể để frontend sửa số lượng
    private Integer idChiTietSanPham;
}
