package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.PhieuGiamGia;
import com.example.datn_sevenstrike.entity.PhieuGiamGiaChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PhieuGiamGiaChiTietRepository extends JpaRepository<PhieuGiamGiaChiTiet, Integer> {

    // ✅ dùng cho getCustomerIdsByVoucher
    List<PhieuGiamGiaChiTiet> findAllByPhieuGiamGiaAndXoaMemFalse(PhieuGiamGia phieuGiamGia);

    // ✅ soft delete toàn bộ detail của voucher
    @Modifying
    @Query("""
        update PhieuGiamGiaChiTiet ct
           set ct.xoaMem = true
         where ct.phieuGiamGia = :pgg
           and ct.xoaMem = false
    """)
    void deleteByPhieuGiamGia(@Param("pgg") PhieuGiamGia phieuGiamGia);
}
