package com.example.datn_sevenstrike.service;

import com.example.datn_sevenstrike.constants.TrangThaiHoaDon;
import com.example.datn_sevenstrike.dto.request.HoaDonRequest;
import com.example.datn_sevenstrike.dto.response.HoaDonResponse;
import com.example.datn_sevenstrike.entity.HoaDon;
import com.example.datn_sevenstrike.entity.LichSuHoaDon;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.exception.NotFoundEx;
import com.example.datn_sevenstrike.repository.HoaDonRepository;
import com.example.datn_sevenstrike.repository.LichSuHoaDonRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository repo;
    private final LichSuHoaDonRepository lichSuRepo;
    private final ModelMapper mapper;

    public List<HoaDonResponse> all() {
        return repo.findAllByXoaMemFalseOrderByIdDesc()
                .stream().map(this::toResponse).toList();
    }

    public Page<HoaDonResponse> page(int pageNo, int pageSize) {
        int p = Math.max(pageNo, 0);
        int s = Math.max(pageSize, 1);
        var pageable = PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "id"));
        return repo.findAllByXoaMemFalse(pageable).map(this::toResponse);
    }

    public HoaDonResponse one(Integer id) {
        HoaDon e = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + id));
        return toResponse(e);
    }

    /**
     * CHỐT LUỒNG TẠO:
     * - loaiDon=false (tại quầy) -> HOÀN_THÀNH + set ngày thanh toán
     * - loaiDon=true (giao hàng/online) -> CHỜ_XÁC_NHẬN
     * => luôn ghi lịch sử ngay lúc tạo
     */
    @Transactional
    public HoaDonResponse create(HoaDonRequest req) {
        if (req == null) throw new BadRequestEx("Thiếu dữ liệu tạo mới");

        HoaDon hd = mapper.map(req, HoaDon.class);
        hd.setId(null);

        applyDefaults(hd);

        boolean taiQuay = Boolean.FALSE.equals(hd.getLoaiDon());
        if (taiQuay) {
            hd.setTrangThaiHienTai(TrangThaiHoaDon.HOAN_THANH.code);
            if (hd.getNgayThanhToan() == null) hd.setNgayThanhToan(LocalDateTime.now());
        } else {
            hd.setTrangThaiHienTai(TrangThaiHoaDon.CHO_XAC_NHAN.code);
        }

        validate(hd);

        HoaDon saved = repo.save(hd);

        // ghi lịch sử theo trạng thái hiện tại
        pushHistory(saved.getId(), saved.getTrangThaiHienTai(),
                taiQuay ? "Tạo đơn tại quầy (đã thu tiền mặt)" : "Tạo đơn (chờ xác nhận)");

        return toResponse(saved);
    }

    /**
     * Đổi trạng thái có kiểm soát + auto ghi lịch sử.
     * - Không cho lùi trạng thái
     * - Không cho đổi nếu terminal (HOÀN_THÀNH / GIAO_THẤT_BẠI)
     * - Giao thất bại (7) chỉ hợp lệ với đơn giao hàng/online và đang ở (2/3/4)
     */
    @Transactional
    public HoaDonResponse changeStatus(Integer idHoaDon, Integer newStatus, String note) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");
        if (newStatus == null) throw new BadRequestEx("Thiếu trạng thái mới");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + idHoaDon));

        Integer oldStatus = hd.getTrangThaiHienTai();
        if (oldStatus == null) oldStatus = TrangThaiHoaDon.CHO_XAC_NHAN.code;

        if (TrangThaiHoaDon.isTerminal(oldStatus)) {
            throw new BadRequestEx("Đơn đã kết thúc, không thể đổi trạng thái");
        }

        // validate range
        if (newStatus < 1 || newStatus > 7) {
            throw new BadRequestEx("trang_thai_hien_tai không hợp lệ (1..7)");
        }

        // Không cho lùi
        if (newStatus < oldStatus) {
            throw new BadRequestEx("Không thể chuyển trạng thái lùi");
        }

        // Rule giao thất bại
        if (newStatus == TrangThaiHoaDon.GIAO_THAT_BAI.code) {
            if (Boolean.FALSE.equals(hd.getLoaiDon())) {
                throw new BadRequestEx("Đơn tại quầy không có trạng thái giao thất bại");
            }
            // chỉ fail khi đang xử lý giao hàng
            if (!(oldStatus == TrangThaiHoaDon.CHO_GIAO_HANG.code
                    || oldStatus == TrangThaiHoaDon.DANG_VAN_CHUYEN.code
                    || oldStatus == TrangThaiHoaDon.DA_GIAO_HANG.code)) {
                throw new BadRequestEx("Chỉ được chuyển giao thất bại khi đang giao hàng");
            }
        }

        hd.setTrangThaiHienTai(newStatus);

        // nếu sang ĐÃ THANH TOÁN hoặc HOÀN THÀNH -> set ngày thanh toán nếu chưa có
        if ((newStatus == TrangThaiHoaDon.DA_THANH_TOAN.code
                || newStatus == TrangThaiHoaDon.HOAN_THANH.code)
                && hd.getNgayThanhToan() == null) {
            hd.setNgayThanhToan(LocalDateTime.now());
        }

        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);

        pushHistory(saved.getId(), newStatus,
                (note == null || note.isBlank()) ? "Cập nhật trạng thái" : note.trim());

        return toResponse(saved);
    }

    /**
     * Helper: thu tiền mặt tại quầy -> HOÀN THÀNH
     * (dùng khi bạn muốn tạo đơn trước, rồi bấm xác nhận thanh toán sau)
     */
    @Transactional
    public HoaDonResponse payCashAndComplete(Integer idHoaDon, String note) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + idHoaDon));

        Integer st = hd.getTrangThaiHienTai();
        if (TrangThaiHoaDon.isTerminal(st)) return toResponse(hd);

        hd.setLoaiDon(false);
        hd.setTrangThaiHienTai(TrangThaiHoaDon.HOAN_THANH.code);
        hd.setNgayThanhToan(LocalDateTime.now());
        hd.setNgayCapNhat(LocalDateTime.now());

        HoaDon saved = repo.save(hd);

        pushHistory(saved.getId(), TrangThaiHoaDon.HOAN_THANH.code,
                (note == null || note.isBlank()) ? "Thanh toán tiền mặt tại quầy" : note.trim());

        return toResponse(saved);
    }

    @Transactional
    public void delete(Integer id) {
        HoaDon hd = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + id));
        hd.setXoaMem(true);
        hd.setNgayCapNhat(LocalDateTime.now());
        repo.save(hd);
    }

    // ================== PRIVATE ==================

    private void pushHistory(Integer idHoaDon, Integer trangThai, String ghiChu) {
        LichSuHoaDon h = new LichSuHoaDon();
        h.setId(null);
        h.setIdHoaDon(idHoaDon);
        h.setTrangThai(trangThai);
        h.setGhiChu(ghiChu);
        h.setXoaMem(false);
        // thoiGian lấy default sysdatetime() từ DB (insertable=false)
        lichSuRepo.save(h);
    }

    private void applyDefaults(HoaDon hd) {
        if (hd.getXoaMem() == null) hd.setXoaMem(false);
        if (hd.getNgayTao() == null) hd.setNgayTao(LocalDateTime.now());

        if (hd.getLoaiDon() == null) hd.setLoaiDon(false); // default: tại quầy

        if (hd.getPhiVanChuyen() == null) hd.setPhiVanChuyen(BigDecimal.ZERO);

        if (hd.getTenKhachHang() != null) hd.setTenKhachHang(hd.getTenKhachHang().trim());
        if (hd.getDiaChiKhachHang() != null) hd.setDiaChiKhachHang(hd.getDiaChiKhachHang().trim());
        if (hd.getSoDienThoaiKhachHang() != null) hd.setSoDienThoaiKhachHang(hd.getSoDienThoaiKhachHang().trim());
        if (hd.getEmailKhachHang() != null) hd.setEmailKhachHang(hd.getEmailKhachHang().trim());
        if (hd.getGhiChu() != null) hd.setGhiChu(hd.getGhiChu().trim());

        if (hd.getTongTien() == null) hd.setTongTien(BigDecimal.ZERO);
        if (hd.getTongTienSauGiam() == null) hd.setTongTienSauGiam(BigDecimal.ZERO);
    }

    private void validate(HoaDon hd) {
        if (hd.getTenKhachHang() == null || hd.getTenKhachHang().isBlank())
            throw new BadRequestEx("Thiếu ten_khach_hang");
        if (hd.getDiaChiKhachHang() == null || hd.getDiaChiKhachHang().isBlank())
            throw new BadRequestEx("Thiếu dia_chi_khach_hang");
        if (hd.getSoDienThoaiKhachHang() == null || hd.getSoDienThoaiKhachHang().isBlank())
            throw new BadRequestEx("Thiếu so_dien_thoai_khach_hang");

        if (hd.getTongTien() == null || hd.getTongTien().signum() < 0)
            throw new BadRequestEx("tong_tien không hợp lệ");
        if (hd.getTongTienSauGiam() == null || hd.getTongTienSauGiam().signum() < 0)
            throw new BadRequestEx("tong_tien_sau_giam không hợp lệ");
        if (hd.getTongTienSauGiam().compareTo(hd.getTongTien()) > 0)
            throw new BadRequestEx("tong_tien_sau_giam không được lớn hơn tong_tien");

        if (hd.getTrangThaiHienTai() == null)
            throw new BadRequestEx("Thiếu trang_thai_hien_tai");

        if (hd.getTrangThaiHienTai() < 1 || hd.getTrangThaiHienTai() > 7)
            throw new BadRequestEx("trang_thai_hien_tai không hợp lệ (1..7)");
    }

    private HoaDonResponse toResponse(HoaDon e) {
        return mapper.map(e, HoaDonResponse.class);
    }
}
