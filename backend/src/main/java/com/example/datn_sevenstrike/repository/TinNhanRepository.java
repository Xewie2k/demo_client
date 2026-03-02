package com.example.datn_sevenstrike.repository;

import com.example.datn_sevenstrike.entity.TinNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TinNhanRepository extends JpaRepository<TinNhan, Integer> {

    List<TinNhan> findByPhienChat_IdOrderByThoiGianAsc(Integer phienChatId);
}
