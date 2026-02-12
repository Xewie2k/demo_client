package com.example.datn_sevenstrike.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantClientDTO {
    private Integer id;
    private String tenMauSac;
    private String tenKichThuoc;
    private BigDecimal giaBan;
    private Integer soLuong;
}
