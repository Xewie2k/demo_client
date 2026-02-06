package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.PhieuGiamGiaCaNhan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhieuGiamGiaCaNhanRepository extends JpaRepository<PhieuGiamGiaCaNhan, Integer> {

    List<PhieuGiamGiaCaNhan> findAllByXoaMemFalseOrderByIdDesc();

    Optional<PhieuGiamGiaCaNhan> findByIdAndXoaMemFalse(Integer id);

    boolean existsByIdKhachHangAndIdPhieuGiamGiaAndXoaMemFalse(Integer idKhachHang, Integer idPhieuGiamGia);

    List<PhieuGiamGiaCaNhan> findAllByIdKhachHangAndXoaMemFalseOrderByIdDesc(Integer idKhachHang);

    List<PhieuGiamGiaCaNhan> findAllByIdKhachHangAndDaSuDungFalseAndXoaMemFalseOrderByIdDesc(Integer idKhachHang);
}
