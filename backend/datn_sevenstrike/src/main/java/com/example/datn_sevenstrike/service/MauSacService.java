package com.example.datn_sevenstrike.service;

import com.example.datn_sevenstrike.dto.request.MauSacRequest;
import com.example.datn_sevenstrike.dto.response.MauSacResponse;
import com.example.datn_sevenstrike.entity.MauSac;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.exception.NotFoundEx;
import com.example.datn_sevenstrike.repository.MauSacRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MauSacService {

    private final MauSacRepository repo;
    private final ModelMapper mapper;

    public List<MauSacResponse> all() {
        return repo.findAllByXoaMemFalseOrderByIdDesc()
                .stream().map(this::toResponse).toList();
    }

    // ✅ cho combobox: chỉ lấy đang hoạt động
    public List<MauSacResponse> allActive() {
        return repo.findAllByXoaMemFalseAndTrangThaiTrueOrderByIdDesc()
                .stream().map(this::toResponse).toList();
    }

    public MauSacResponse one(Integer id) {
        MauSac e = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy MauSac id=" + id));
        return toResponse(e);
    }

    @Transactional
    public MauSacResponse create(MauSacRequest req) {
        if (req == null) throw new BadRequestEx("Thiếu dữ liệu tạo mới");

        MauSac e = mapper.map(req, MauSac.class);
        e.setId(null);

        applyDefaults(e);
        validateCreate(e);

        return toResponse(repo.save(e));
    }

    @Transactional
    public MauSacResponse update(Integer id, MauSacRequest req) {
        if (req == null) throw new BadRequestEx("Thiếu dữ liệu cập nhật");

        MauSac db = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy MauSac id=" + id));

        if (req.getTenMauSac() != null) db.setTenMauSac(req.getTenMauSac());
        if (req.getMaMauHex() != null) db.setMaMauHex(req.getMaMauHex());
        if (req.getTrangThai() != null) db.setTrangThai(req.getTrangThai());
        if (req.getXoaMem() != null) db.setXoaMem(req.getXoaMem());

        applyDefaults(db);
        validateUpdate(db);

        return toResponse(repo.save(db));
    }

    @Transactional
    public void delete(Integer id) {
        MauSac db = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy MauSac id=" + id));
        db.setXoaMem(true);
        repo.save(db);
    }

    // ================== PRIVATE ==================

    private void applyDefaults(MauSac e) {
        if (e.getXoaMem() == null) e.setXoaMem(false);
        if (e.getTrangThai() == null) e.setTrangThai(true);

        if (e.getTenMauSac() != null) e.setTenMauSac(e.getTenMauSac().trim());

        if (e.getMaMauHex() != null) {
            String hex = e.getMaMauHex().trim();
            if (hex.isBlank()) hex = null;
            e.setMaMauHex(hex);
        }
    }

    private void validateCreate(MauSac e) {
        if (e.getTenMauSac() == null || e.getTenMauSac().isBlank())
            throw new BadRequestEx("Thiếu ten_mau_sac");

        validateHexFormat(e.getMaMauHex());

        // unique index alive cho ma_mau_hex
        if (e.getMaMauHex() != null && repo.existsByMaMauHexAndXoaMemFalse(e.getMaMauHex())) {
            throw new BadRequestEx("Mã màu HEX đã tồn tại: " + e.getMaMauHex());
        }
    }

    private void validateUpdate(MauSac e) {
        if (e.getTenMauSac() == null || e.getTenMauSac().isBlank())
            throw new BadRequestEx("Thiếu ten_mau_sac");

        validateHexFormat(e.getMaMauHex());

        if (e.getMaMauHex() != null && repo.existsByMaMauHexAndXoaMemFalseAndIdNot(e.getMaMauHex(), e.getId())) {
            throw new BadRequestEx("Mã màu HEX đã tồn tại: " + e.getMaMauHex());
        }
    }

    private void validateHexFormat(String maMauHex) {
        if (maMauHex == null) return;
        // đúng #RRGGBB
        if (!maMauHex.matches("^#[0-9A-Fa-f]{6}$")) {
            throw new BadRequestEx("ma_mau_hex không hợp lệ, đúng định dạng #RRGGBB");
        }
    }

    private MauSacResponse toResponse(MauSac e) {
        return mapper.map(e, MauSacResponse.class);
    }
}
