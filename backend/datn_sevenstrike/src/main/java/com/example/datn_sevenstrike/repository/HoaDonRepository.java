package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.HoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    List<HoaDon> findAllByXoaMemFalseOrderByIdDesc();

    Page<HoaDon> findAllByXoaMemFalse(Pageable pageable);

    Optional<HoaDon> findByIdAndXoaMemFalse(Integer id);

    List<HoaDon> findAllByIdKhachHangAndXoaMemFalseOrderByIdDesc(Integer idKhachHang);
}
