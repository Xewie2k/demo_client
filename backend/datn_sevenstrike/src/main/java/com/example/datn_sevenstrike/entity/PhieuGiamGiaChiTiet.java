package com.example.datn_sevenstrike.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "phieu_giam_gia_chi_tiet")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PhieuGiamGiaChiTiet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "id_phieu_giam_gia", nullable = false)
    private Integer idPhieuGiamGia;

    @Column(name = "id_khach_hang", nullable = false)
    private Integer idKhachHang;

    @Column(name = "xoa_mem", nullable = false)
    private Boolean xoaMem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phieu_giam_gia", insertable = false, updatable = false)
    @ToString.Exclude
    private PhieuGiamGia phieuGiamGia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_khach_hang", insertable = false, updatable = false)
    @ToString.Exclude
    private KhachHang khachHang;
}
