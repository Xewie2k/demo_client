package com.example.datn_sevenstrike.service.client;

import com.example.datn_sevenstrike.dto.client.ClientLoginResponse;
import com.example.datn_sevenstrike.dto.client.ClientRegisterRequest;
import com.example.datn_sevenstrike.dto.request.LoginRequest;
import com.example.datn_sevenstrike.entity.KhachHang;
import com.example.datn_sevenstrike.repository.KhachHangRepository;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientAuthService {

    private final KhachHangRepository khachHangRepo;

    public ClientLoginResponse authenticateClient(LoginRequest req) {
        if (req == null) {
            throw new RuntimeException("Dữ liệu đăng nhập không hợp lệ!");
        }

        String username = req.getUsername();
        String password = req.getPassword();

        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập tài khoản!");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập mật khẩu!");
        }

        String identifier = username.trim();
        KhachHang kh = khachHangRepo.findByTenTaiKhoanAndXoaMemFalse(identifier)
                .or(() -> khachHangRepo.findByEmailAndXoaMemFalse(identifier))
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        if (!Objects.equals(kh.getMatKhau(), password)) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        if (kh.getTrangThai() == null || !kh.getTrangThai()) {
            throw new RuntimeException("Tài khoản này hiện đang bị khóa!");
        }

        return ClientLoginResponse.builder()
                .id(kh.getId())
                .hoTen(kh.getTenKhachHang())
                .email(kh.getEmail())
                .soDienThoai(kh.getSoDienThoai())
                .anhDaiDien(kh.getAnhDaiDien())
                .role("CUSTOMER")
                .message("Đăng nhập thành công!")
                .build();
    }

    @Transactional
    public ClientLoginResponse registerClient(ClientRegisterRequest req) {
        if (req == null) {
            throw new RuntimeException("Dữ liệu đăng ký không hợp lệ!");
        }
        if (req.getTenKhachHang() == null || req.getTenKhachHang().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập họ tên!");
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập email!");
        }
        if (req.getMatKhau() == null || req.getMatKhau().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập mật khẩu!");
        }
        if (req.getTenTaiKhoan() == null || req.getTenTaiKhoan().trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập tên tài khoản!");
        }

        String email = req.getEmail().trim();
        String tenTaiKhoan = req.getTenTaiKhoan().trim();

        if (khachHangRepo.existsByEmailAndXoaMemFalse(email)) {
            throw new RuntimeException("Email đã được sử dụng!");
        }
        if (khachHangRepo.existsByTenTaiKhoanAndXoaMemFalse(tenTaiKhoan)) {
            throw new RuntimeException("Tên tài khoản đã tồn tại!");
        }

        KhachHang kh = new KhachHang();
        kh.setTenKhachHang(req.getTenKhachHang().trim());
        kh.setTenTaiKhoan(tenTaiKhoan);
        kh.setEmail(email);
        kh.setSoDienThoai(req.getSoDienThoai() != null ? req.getSoDienThoai().trim() : null);
        kh.setMatKhau(req.getMatKhau());
        kh.setTrangThai(true);
        kh.setXoaMem(false);
        kh.setNgayTao(LocalDateTime.now());

        KhachHang saved = khachHangRepo.save(kh);

        return ClientLoginResponse.builder()
                .id(saved.getId())
                .hoTen(saved.getTenKhachHang())
                .email(saved.getEmail())
                .soDienThoai(saved.getSoDienThoai())
                .anhDaiDien(saved.getAnhDaiDien())
                .role("CUSTOMER")
                .message("Đăng ký thành công!")
                .build();
    }
}