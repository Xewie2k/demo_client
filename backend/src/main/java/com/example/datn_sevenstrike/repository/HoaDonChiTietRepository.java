package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.HoaDonChiTiet;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface HoaDonChiTietRepository extends JpaRepository<HoaDonChiTiet, Integer> {

    List<HoaDonChiTiet> findAllByXoaMemFalseOrderByIdDesc();

    Optional<HoaDonChiTiet> findByIdAndXoaMemFalse(Integer id);

    List<HoaDonChiTiet> findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(Integer idHoaDon);
    List<HoaDonChiTiet> findByIdHoaDon(Integer idHoaDon);

    List<HoaDonChiTiet> findAllWithProductByIdHoaDon(Integer id);

    // Trả về idSanPham bán chạy nhất trong tháng hiện tại (đơn hoàn thành - trạng thái 5)
    @Query(value = """
        SELECT ctsp.id_san_pham
        FROM hoa_don_chi_tiet hdct
        JOIN hoa_don hd ON hd.id = hdct.id_hoa_don
        JOIN chi_tiet_san_pham ctsp ON ctsp.id = hdct.id_chi_tiet_san_pham
        WHERE hd.trang_thai_hien_tai = 5
          AND hd.xoa_mem = 0
          AND hdct.xoa_mem = 0
          AND ctsp.xoa_mem = 0
          AND hd.ngay_tao >= :thangNay
        GROUP BY ctsp.id_san_pham
        ORDER BY SUM(hdct.so_luong) DESC
        """, nativeQuery = true)
    List<Integer> findBestSellingProductIds(@Param("thangNay") LocalDateTime thangNay, Pageable pageable);
}
