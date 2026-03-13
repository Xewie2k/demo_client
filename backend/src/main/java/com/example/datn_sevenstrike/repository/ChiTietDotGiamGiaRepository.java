// File: src/main/java/com/example/datn_sevenstrike/repository/ChiTietDotGiamGiaRepository.java
package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.ChiTietDotGiamGia;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietDotGiamGiaRepository extends JpaRepository<ChiTietDotGiamGia, Integer> {

    List<ChiTietDotGiamGia> findAllByXoaMemFalseOrderByIdDesc();

    Optional<ChiTietDotGiamGia> findByIdAndXoaMemFalse(Integer id);

    List<ChiTietDotGiamGia> findAllByIdDotGiamGiaAndXoaMemFalseOrderByIdDesc(Integer idDotGiamGia);

    List<ChiTietDotGiamGia> findAllByIdChiTietSanPhamAndXoaMemFalseOrderByIdDesc(Integer idChiTietSanPham);

    boolean existsByIdDotGiamGiaAndIdChiTietSanPhamAndXoaMemFalse(Integer idDotGiamGia, Integer idChiTietSanPham);

    boolean existsByIdDotGiamGiaAndIdChiTietSanPhamAndXoaMemFalseAndIdNot(
            Integer idDotGiamGia, Integer idChiTietSanPham, Integer id
    );

    // =========================
    // POS: lấy "đợt giảm giá tốt nhất" cho CTSP (đang active, đúng ngày)
    // =========================

    interface BestDotGiamGiaView {
        Integer getIdChiTietDotGiamGia();

        Integer getCtspId();

        Integer getIdDotGiamGia();
        String getMaDotGiamGia();
        String getTenDotGiamGia();
        Integer getMucUuTien();

        LocalDate getNgayBatDau();
        LocalDate getNgayKetThuc();

        BigDecimal getGiaTriGiamGiaDot();
        BigDecimal getGiaTriGiamRieng();

        BigDecimal getGiaTriGiamApDung();
        BigDecimal getSoTienGiamToiDa();  // Lấy giới hạn tối đa từ bảng dot_giam_gia
        default BigDecimal getGiaTriGiam() {
            return getGiaTriGiamApDung();
        }
    }

    @Query(value = """
        with ranked as (
            select
                ctdgg.id as idChiTietDotGiamGia,
                ctdgg.id_chi_tiet_san_pham as ctspId,
                dgg.id as idDotGiamGia,
                dgg.ma_dot_giam_gia as maDotGiamGia,
                dgg.ten_dot_giam_gia as tenDotGiamGia,
                dgg.muc_uu_tien as mucUuTien,
                dgg.ngay_bat_dau as ngayBatDau,
                dgg.ngay_ket_thuc as ngayKetThuc,
                dgg.gia_tri_giam_gia as giaTriGiamGiaDot,
                ctdgg.gia_tri_giam_rieng as giaTriGiamRieng,
                coalesce(ctdgg.gia_tri_giam_rieng, dgg.gia_tri_giam_gia) as giaTriGiamApDung,
                dgg.so_tien_giam_toi_da as soTienGiamToiDa, -- SỬA Ở ĐÂY: Lấy từ bảng dgg thay vì ctdgg
                row_number() over (
                    partition by ctdgg.id_chi_tiet_san_pham
                    order by
                        dgg.muc_uu_tien desc,
                        coalesce(ctdgg.gia_tri_giam_rieng, dgg.gia_tri_giam_gia) desc,
                        dgg.id desc,
                        ctdgg.id desc
                ) as rn
            from chi_tiet_dot_giam_gia ctdgg
            join dot_giam_gia dgg
              on dgg.id = ctdgg.id_dot_giam_gia
             and dgg.xoa_mem = 0
             and dgg.trang_thai = 1
            where ctdgg.xoa_mem = 0
              and ctdgg.trang_thai = 1
              and ctdgg.id_chi_tiet_san_pham in (:ctspIds)
              and :today between dgg.ngay_bat_dau and dgg.ngay_ket_thuc
        )
        select
            idChiTietDotGiamGia,
            ctspId,
            idDotGiamGia,
            maDotGiamGia,
            tenDotGiamGia,
            mucUuTien,
            ngayBatDau,
            ngayKetThuc,
            giaTriGiamGiaDot,
            giaTriGiamRieng,
            giaTriGiamApDung,
            soTienGiamToiDa
        from ranked
        where rn = 1
    """, nativeQuery = true)
    List<BestDotGiamGiaView> findBestActiveDotsByCtspIds(
            @Param("ctspIds") List<Integer> ctspIds,
            @Param("today") LocalDate today
    );

    @Query(value = """
        select top 1
            ctdgg.id as idChiTietDotGiamGia,
            ctdgg.id_chi_tiet_san_pham as ctspId,
            dgg.id as idDotGiamGia,
            dgg.ma_dot_giam_gia as maDotGiamGia,
            dgg.ten_dot_giam_gia as tenDotGiamGia,
            dgg.muc_uu_tien as mucUuTien,
            dgg.ngay_bat_dau as ngayBatDau,
            dgg.ngay_ket_thuc as ngayKetThuc,
            dgg.gia_tri_giam_gia as giaTriGiamGiaDot,
            ctdgg.gia_tri_giam_rieng as giaTriGiamRieng,
            coalesce(ctdgg.gia_tri_giam_rieng, dgg.gia_tri_giam_gia) as giaTriGiamApDung,
            dgg.so_tien_giam_toi_da as soTienGiamToiDa -- SỬA Ở ĐÂY: Lấy từ bảng dgg thay vì ctdgg
        from chi_tiet_dot_giam_gia ctdgg
        join dot_giam_gia dgg
          on dgg.id = ctdgg.id_dot_giam_gia
         and dgg.xoa_mem = 0
         and dgg.trang_thai = 1
        where ctdgg.xoa_mem = 0
          and ctdgg.trang_thai = 1
          and ctdgg.id_chi_tiet_san_pham = :ctspId
          and :today between dgg.ngay_bat_dau and dgg.ngay_ket_thuc
        order by
            dgg.muc_uu_tien desc,
            coalesce(ctdgg.gia_tri_giam_rieng, dgg.gia_tri_giam_gia) desc,
            dgg.id desc,
            ctdgg.id desc
    """, nativeQuery = true)
    Optional<BestDotGiamGiaView> findBestActiveDotByCtspId(
            @Param("ctspId") Integer ctspId,
            @Param("today") LocalDate today
    );
}