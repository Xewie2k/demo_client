package com.example.datn_sevenstrike.controller;

import com.example.datn_sevenstrike.dto.response.ChiTietDotGiamGiaResponse;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.service.ChiTietDotGiamGiaService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chi-tiet-dot-giam-gia")
@RequiredArgsConstructor
public class ChiTietDotGiamGiaBanHangController {

    private final ChiTietDotGiamGiaService service;

    @GetMapping("/ban-hang/ctsp/{idChiTietSanPham}")
    public ChiTietDotGiamGiaResponse bestForCtspBanHang(@PathVariable Integer idChiTietSanPham) {
        return service.bestForCtspBanHang(idChiTietSanPham);
    }

    @PostMapping("/ban-hang/best-by-ctsp-ids")
    public List<ChiTietDotGiamGiaResponse> bestForCtspIdsBanHang(@RequestBody List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BadRequestEx("Danh sách idChiTietSanPhams đang trống.");
        }
        return service.bestForCtspIdsBanHang(ids);
    }
}
