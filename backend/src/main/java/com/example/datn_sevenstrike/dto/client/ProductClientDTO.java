package com.example.datn_sevenstrike.dto.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;

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

    // discount info
    private BigDecimal giaGocThapNhat;
    private BigDecimal giaSauGiamThapNhat;
    private Integer phanTramGiam;

    // variants for quick add-to-cart
    private List<VariantClientDTO> variants;
}
