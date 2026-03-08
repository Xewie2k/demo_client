package com.example.datn_sevenstrike.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private Integer idKhachHang;
    private String tenKhachHang;
    private String soDienThoai;
    private String email;
    private String diaChi;
    private String ghiChu;
    private Integer idPhieuGiamGia;
    private List<OrderItemRequest> items;
    private Integer loaiThanhToan;
    // 0=tiền mặt/COD, 1=chuyển khoản
    private Integer idPhuongThucThanhToan; // ✅ Trường mới cần thêm


}
