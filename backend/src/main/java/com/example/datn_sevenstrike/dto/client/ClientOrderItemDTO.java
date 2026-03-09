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
    private BigDecimal donGiaCu; // giá hiện tại (real-time) để FE so sánh
    private int soLuong;
    private BigDecimal thanhTien;
    private Integer idChiTietSanPham;
}