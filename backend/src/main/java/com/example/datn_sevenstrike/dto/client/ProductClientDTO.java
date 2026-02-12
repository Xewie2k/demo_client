package com.example.datn_sevenstrike.dto.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductClientDTO {
    private Integer id;
    private String tenSanPham;
    private String tenThuongHieu;
    private BigDecimal giaThapNhat;
    private BigDecimal giaCaoNhat;
    private String anhDaiDien;
    private String moTaNgan;
}
