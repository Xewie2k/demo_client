package com.example.datn_sevenstrike.controller;

import com.example.datn_sevenstrike.dto.response.HoaDonResponse;
import com.example.datn_sevenstrike.entity.HoaDon;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.exception.NotFoundEx;
import com.example.datn_sevenstrike.repository.HoaDonRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client/hoa-don")
@RequiredArgsConstructor
public class ClientHoaDonController {

    private final HoaDonRepository repo;
    private final ModelMapper mapper;

    @GetMapping("/tracking")
    public HoaDonResponse trackOrder(@RequestParam Integer id, @RequestParam String email) {
        HoaDon hd = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy đơn hàng"));

        if (hd.getEmailKhachHang() == null || !hd.getEmailKhachHang().equalsIgnoreCase(email.trim())) {
            throw new BadRequestEx("Thông tin xác thực không chính xác (Email không khớp)");
        }

        return mapper.map(hd, HoaDonResponse.class);
    }
}
