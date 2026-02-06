package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.MauSac;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MauSacRepository extends JpaRepository<MauSac, Integer> {

    List<MauSac> findAllByXoaMemFalseOrderByIdDesc();

    List<MauSac> findAllByXoaMemFalseAndTrangThaiTrueOrderByIdDesc();

    Optional<MauSac> findByIdAndXoaMemFalse(Integer id);

    boolean existsByMaMauHexAndXoaMemFalse(String maMauHex);

    boolean existsByMaMauHexAndXoaMemFalseAndIdNot(String maMauHex, Integer id);
}
