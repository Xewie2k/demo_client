package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.HoaDonChiTiet;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HoaDonChiTietRepository extends JpaRepository<HoaDonChiTiet, Integer> {

    List<HoaDonChiTiet> findAllByXoaMemFalseOrderByIdDesc();

    Optional<HoaDonChiTiet> findByIdAndXoaMemFalse(Integer id);

    List<HoaDonChiTiet> findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(Integer idHoaDon);

    @Query("SELECT h FROM HoaDonChiTiet h JOIN FETCH h.chiTietSanPham ctsp JOIN FETCH ctsp.sanPham WHERE h.idHoaDon = :idHoaDon AND h.xoaMem = false ORDER BY h.id ASC")
    List<HoaDonChiTiet> findAllWithProductByIdHoaDon(@Param("idHoaDon") Integer idHoaDon);
}
