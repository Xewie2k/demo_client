package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.PhieuGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, Integer> {

    List<PhieuGiamGia> findAllByXoaMemFalseOrderByIdDesc();

    Optional<PhieuGiamGia> findByIdAndXoaMemFalse(Integer id);
}
