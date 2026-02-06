package com.example.datn_sevenstrike.service;

import com.example.datn_sevenstrike.dto.request.PhieuGiamGiaRequest;
import com.example.datn_sevenstrike.dto.response.PhieuGiamGiaResponse;
import com.example.datn_sevenstrike.entity.PhieuGiamGia;
import com.example.datn_sevenstrike.entity.PhieuGiamGiaChiTiet;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.exception.NotFoundEx;
import com.example.datn_sevenstrike.repository.KhachHangRepository;
import com.example.datn_sevenstrike.repository.PhieuGiamGiaChiTietRepository;
import com.example.datn_sevenstrike.repository.PhieuGiamGiaRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhieuGiamGiaService {

    private final PhieuGiamGiaRepository repo;
    private final KhachHangRepository khachHangRepo;
    private final PhieuGiamGiaChiTietRepository chiTietRepo;
    private final ModelMapper mapper;
    private final JavaMailSender mailSender;

    public List<PhieuGiamGiaResponse> all() {
        return repo.findAllByXoaMemFalseOrderByIdDesc()
                .stream().map(this::toResponse).toList();
    }

    public PhieuGiamGiaResponse one(Integer id) {
        PhieuGiamGia e = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy PhieuGiamGia id=" + id));
        return toResponse(e);
    }

    @Transactional
    public PhieuGiamGiaResponse create(PhieuGiamGiaRequest req) {
        if (req == null) throw new BadRequestEx("Thiếu dữ liệu tạo mới");

        PhieuGiamGia e = mapper.map(req, PhieuGiamGia.class);
        e.setId(null);

        applyDefaults(e);

        // ✅ voucher cá nhân => tự set số lượng theo số KH
        if (isCaNhan(req)) {
            e.setSoLuongSuDung(req.getIdKhachHangs().size());
        }

        validate(e, req);

        PhieuGiamGia saved = repo.saveAndFlush(e);

        // ✅ chỉ lưu detail + gửi mail khi cá nhân
        if (isCaNhan(req)) {
            chiTietRepo.deleteByPhieuGiamGia(saved); // soft delete (đã override trong repo)
            saveVoucherDetails(saved, req.getIdKhachHangs(), true); // create: gửi mail
        }

        return toResponse(saved);
    }

    @Transactional
    public PhieuGiamGiaResponse update(Integer id, PhieuGiamGiaRequest req) {
        if (req == null) throw new BadRequestEx("Thiếu dữ liệu cập nhật");

        PhieuGiamGia db = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy PhieuGiamGia id=" + id));

        if (req.getTenPhieuGiamGia() != null) db.setTenPhieuGiamGia(req.getTenPhieuGiamGia());
        if (req.getLoaiPhieuGiamGia() != null) db.setLoaiPhieuGiamGia(req.getLoaiPhieuGiamGia());
        if (req.getGiaTriGiamGia() != null) db.setGiaTriGiamGia(req.getGiaTriGiamGia());
        if (req.getSoTienGiamToiDa() != null) db.setSoTienGiamToiDa(req.getSoTienGiamToiDa());
        if (req.getHoaDonToiThieu() != null) db.setHoaDonToiThieu(req.getHoaDonToiThieu());
        if (req.getNgayBatDau() != null) db.setNgayBatDau(req.getNgayBatDau());
        if (req.getNgayKetThuc() != null) db.setNgayKetThuc(req.getNgayKetThuc());
        if (req.getTrangThai() != null) db.setTrangThai(req.getTrangThai()); // ✅ bật/tắt thủ công
        if (req.getMoTa() != null) db.setMoTa(req.getMoTa());
        if (req.getXoaMem() != null) db.setXoaMem(req.getXoaMem());

        applyDefaults(db);

        // ✅ cá nhân => tự set số lượng theo list KH
        if (isCaNhan(req)) {
            db.setSoLuongSuDung(req.getIdKhachHangs().size());
        } else {
            // ✅ công khai: FE có thể gửi số lượng (nếu bạn cho phép)
            if (req.getSoLuongSuDung() != null) db.setSoLuongSuDung(req.getSoLuongSuDung());
        }

        validate(db, req);

        PhieuGiamGia saved = repo.saveAndFlush(db);

        // ✅ update list KH nếu FE có gửi list (update: không gửi mail để tránh spam)
        if (req.getIdKhachHangs() != null) {
            chiTietRepo.deleteByPhieuGiamGia(saved); // soft delete
            if (isCaNhan(req)) {
                saveVoucherDetails(saved, req.getIdKhachHangs(), false);
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public void delete(Integer id) {
        PhieuGiamGia db = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy PhieuGiamGia id=" + id));
        db.setXoaMem(true);
        repo.save(db);
    }

    // =========================
    // Helpers
    // =========================

    private boolean isCaNhan(PhieuGiamGiaRequest req) {
        return req != null && req.getIdKhachHangs() != null && !req.getIdKhachHangs().isEmpty();
    }

    private void applyDefaults(PhieuGiamGia e) {
        if (e.getXoaMem() == null) e.setXoaMem(false);

        // false: % | true: tiền
        if (e.getLoaiPhieuGiamGia() == null) e.setLoaiPhieuGiamGia(false);

        // bật/tắt voucher thủ công
        if (e.getTrangThai() == null) e.setTrangThai(true);

        if (e.getTenPhieuGiamGia() != null) e.setTenPhieuGiamGia(e.getTenPhieuGiamGia().trim());
        if (e.getMoTa() != null) e.setMoTa(e.getMoTa().trim());

        if (e.getGiaTriGiamGia() == null) e.setGiaTriGiamGia(BigDecimal.ZERO);
        if (e.getSoTienGiamToiDa() == null) e.setSoTienGiamToiDa(BigDecimal.ZERO);
        if (e.getHoaDonToiThieu() == null) e.setHoaDonToiThieu(BigDecimal.ZERO);

        if (e.getSoLuongSuDung() == null) e.setSoLuongSuDung(0);
    }

    private void validate(PhieuGiamGia e, PhieuGiamGiaRequest req) {
        if (e.getTenPhieuGiamGia() == null || e.getTenPhieuGiamGia().isBlank())
            throw new BadRequestEx("Tên phiếu không được để trống");

        if (e.getNgayBatDau() == null || e.getNgayKetThuc() == null)
            throw new BadRequestEx("Thiếu ngày bắt đầu/kết thúc");

        if (e.getNgayKetThuc().isBefore(e.getNgayBatDau()))
            throw new BadRequestEx("Ngày kết thúc phải >= ngày bắt đầu");

        if (e.getHoaDonToiThieu() != null && e.getHoaDonToiThieu().compareTo(BigDecimal.ZERO) < 0)
            throw new BadRequestEx("Hóa đơn tối thiểu phải >= 0");

        if (e.getSoLuongSuDung() != null && e.getSoLuongSuDung() < 0)
            throw new BadRequestEx("Số lượng sử dụng phải >= 0");

        boolean laGiamTien = Boolean.TRUE.equals(e.getLoaiPhieuGiamGia());

        // ✅ Align DB check:
        // loai=0: gia_tri_giam_gia 0..100
        // loai=1: gia_tri_giam_gia >=0 (bạn đang dùng soTienGiamToiDa làm tiền)
        if (!laGiamTien) {
            if (e.getGiaTriGiamGia() == null || e.getGiaTriGiamGia().compareTo(BigDecimal.ZERO) <= 0)
                throw new BadRequestEx("Giảm %: giá trị giảm phải > 0");
            if (e.getGiaTriGiamGia().compareTo(new BigDecimal("100")) > 0)
                throw new BadRequestEx("Giảm %: giá trị giảm tối đa 100%");
            if (e.getSoTienGiamToiDa() != null && e.getSoTienGiamToiDa().compareTo(BigDecimal.ZERO) < 0)
                throw new BadRequestEx("Giảm %: số tiền giảm tối đa phải >= 0");
        } else {
            if (e.getSoTienGiamToiDa() == null || e.getSoTienGiamToiDa().compareTo(BigDecimal.ZERO) <= 0)
                throw new BadRequestEx("Giảm tiền: số tiền giảm phải > 0");
            if (e.getGiaTriGiamGia() != null && e.getGiaTriGiamGia().compareTo(BigDecimal.ZERO) < 0)
                throw new BadRequestEx("Giảm tiền: gia_tri_giam_gia không hợp lệ");
        }

        // ✅ cá nhân: list KH không được rỗng
        if (req != null && req.getIdKhachHangs() != null && req.getIdKhachHangs().isEmpty()) {
            throw new BadRequestEx("Voucher cá nhân: danh sách khách hàng không được rỗng");
        }
    }

    private void saveVoucherDetails(PhieuGiamGia saved, List<Integer> idKhachHangs, boolean shouldSendEmail) {
        List<String> listEmail = new ArrayList<>();

        for (Integer idKh : idKhachHangs) {
            khachHangRepo.findById(idKh).ifPresent(kh -> {
                PhieuGiamGiaChiTiet ct = PhieuGiamGiaChiTiet.builder()
                        .phieuGiamGia(saved)
                        .khachHang(kh)
                        .xoaMem(false) // ✅ QUAN TRỌNG: DB not null
                        .build();
                chiTietRepo.save(ct);

                if (kh.getEmail() != null && !kh.getEmail().isBlank()) {
                    listEmail.add(kh.getEmail().trim());
                }
            });
        }

        if (shouldSendEmail && !listEmail.isEmpty()) {
            sendEmailVoucher(listEmail, saved);
        }
    }

    @Async
    protected void sendEmailVoucher(List<String> emails, PhieuGiamGia voucher) {
        try {
            NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            boolean laGiamTien = Boolean.TRUE.equals(voucher.getLoaiPhieuGiamGia());

            String hienThiGiam = laGiamTien
                    ? formatter.format(voucher.getSoTienGiamToiDa() == null ? BigDecimal.ZERO : voucher.getSoTienGiamToiDa()) + " VNĐ"
                    : (voucher.getGiaTriGiamGia() == null ? "0" : voucher.getGiaTriGiamGia().stripTrailingZeros().toPlainString()) + "%";

            ClassPathResource htmlResource = new ClassPathResource("voucher_email_template.html");
            String htmlTemplate;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(htmlResource.getInputStream(), "UTF-8"))) {
                htmlTemplate = reader.lines().collect(Collectors.joining(System.lineSeparator()));
            }

            String finalHtmlContent = htmlTemplate
                    .replace("{{MA_GIAM_GIA}}", voucher.getMaPhieuGiamGia())
                    .replace("{{GIA_TRI_GIAM}}", hienThiGiam)
                    .replace("{{HOA_DON_TOI_THIEU}}", formatter.format(voucher.getHoaDonToiThieu() == null ? BigDecimal.ZERO : voucher.getHoaDonToiThieu()))
                    .replace("{{NGAY_KET_THUC}}", voucher.getNgayKetThuc().format(dateFormatter))
                    .replace("{{CURRENT_YEAR}}", String.valueOf(Year.now().getValue()));

            for (String email : emails) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(email);
                helper.setSubject("Mã giảm giá đặc biệt từ SevenStrike");
                helper.setText(finalHtmlContent, true);
                mailSender.send(message);
            }
        } catch (Exception ex) {
            System.err.println("Lỗi gửi mail: " + ex.getMessage());
        }
    }

    private PhieuGiamGiaResponse toResponse(PhieuGiamGia e) {
        return mapper.map(e, PhieuGiamGiaResponse.class);
    }

    public List<Integer> getCustomerIdsByVoucher(Integer voucherId) {
        PhieuGiamGia p = repo.findById(voucherId).orElse(null);
        if (p == null) return new ArrayList<>();
        return chiTietRepo.findAllByPhieuGiamGiaAndXoaMemFalse(p)
                .stream()
                .map(ct -> ct.getKhachHang().getId())
                .collect(Collectors.toList());
    }

}
