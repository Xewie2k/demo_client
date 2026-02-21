package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.ChiTietDotGiamGia;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietDotGiamGiaRepository extends JpaRepository<ChiTietDotGiamGia, Integer> {

    @Query("""
        SELECT ct FROM ChiTietDotGiamGia ct
        JOIN FETCH ct.dotGiamGia dgg
        WHERE ct.idChiTietSanPham = :variantId
          AND ct.xoaMem = false AND ct.trangThai = true
          AND dgg.xoaMem = false AND dgg.trangThai = true
          AND dgg.ngayBatDau <= :today AND dgg.ngayKetThuc >= :today
        ORDER BY dgg.mucUuTien DESC
    """)
    List<ChiTietDotGiamGia> findActiveDiscountsByVariantId(
            @Param("variantId") Integer variantId,
            @Param("today") LocalDate today);


    List<ChiTietDotGiamGia> findAllByXoaMemFalseOrderByIdDesc();

    Optional<ChiTietDotGiamGia> findByIdAndXoaMemFalse(Integer id);

    List<ChiTietDotGiamGia> findAllByIdDotGiamGiaAndXoaMemFalseOrderByIdDesc(Integer idDotGiamGia);

    List<ChiTietDotGiamGia> findAllByIdChiTietSanPhamAndXoaMemFalseOrderByIdDesc(Integer idChiTietSanPham);

    boolean existsByIdDotGiamGiaAndIdChiTietSanPhamAndXoaMemFalse(Integer idDotGiamGia, Integer idChiTietSanPham);

    boolean existsByIdDotGiamGiaAndIdChiTietSanPhamAndXoaMemFalseAndIdNot(
            Integer idDotGiamGia, Integer idChiTietSanPham, Integer id
    );
}
