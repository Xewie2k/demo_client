package com.example.datn_sevenstrike.dto.response;

import com.example.datn_sevenstrike.entity.CaLam;
import com.example.datn_sevenstrike.entity.NhanVien;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichLamViecResponse {

    private Integer id;

    private String tenCa;
    private LocalTime gioBatDau;
    private LocalTime gioKetThuc;

    private LocalDate ngayLam;
    private String ghiChu;

    private Boolean xoaMem;

    private LocalDateTime ngayTao;
}
