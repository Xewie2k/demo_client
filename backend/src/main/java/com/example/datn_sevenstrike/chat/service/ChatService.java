package com.example.datn_sevenstrike.service;

import com.example.datn_sevenstrike.dto.chat.*;
import com.example.datn_sevenstrike.entity.*;
import com.example.datn_sevenstrike.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final PhienChatRepository phienChatRepo;
    private final TinNhanRepository tinNhanRepo;
    private final KhachHangRepository khachHangRepo;
    private final NhanVienRepository nhanVienRepo;
    private final GeminiService geminiService;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Trạng thái phiên ────────────────────────────────────────────────────
    public static final String TRANG_THAI_BOT       = "BOT_DANG_XU_LY";
    public static final String TRANG_THAI_CHO_NV    = "CHO_NHAN_VIEN";
    public static final String TRANG_THAI_DANG_XU_LY = "DANG_XU_LY";
    public static final String TRANG_THAI_DA_DONG   = "DA_DONG";

    // ─── Loại phiên ──────────────────────────────────────────────────────────
    public static final String LOAI_KHACH_HANG = "KHACH_HANG";
    public static final String LOAI_NOI_BO     = "NOI_BO";

    // ─── Khởi tạo phiên chat mới ─────────────────────────────────────────────
    @Transactional
    public PhienChatDTO khoiTaoPhien(KhoiTaoPhienRequest req) {
        String loai = (req.getLoai() != null && !req.getLoai().isBlank()) ? req.getLoai() : LOAI_KHACH_HANG;

        PhienChat phien = new PhienChat();
        phien.setTrangThai(TRANG_THAI_BOT);
        phien.setThoiGianBatDau(LocalDateTime.now());
        phien.setLoai(loai);

        if (LOAI_NOI_BO.equals(loai)) {
            // Nhân viên khởi tạo phiên nội bộ
            phien.setTenKhach(req.getTenKhach() != null ? req.getTenKhach() : "Nhân viên");
            if (req.getNhanVienId() != null) {
                nhanVienRepo.findById(req.getNhanVienId()).ifPresent(nv -> {
                    // Lưu nhân viên khởi tạo vào field nhanVien tạm (sẽ bị overwrite khi admin nhận)
                    // Dùng tenKhach để hiển thị tên
                    phien.setTenKhach(nv.getTenNhanVien() != null ? nv.getTenNhanVien() : req.getTenKhach());
                });
            }
        } else {
            phien.setTenKhach(req.getTenKhach() != null ? req.getTenKhach() : "Khách vãng lai");
            if (req.getKhachHangId() != null) {
                khachHangRepo.findById(req.getKhachHangId()).ifPresent(phien::setKhachHang);
            }
        }

        PhienChat saved = phienChatRepo.save(phien);

        // Gửi tin nhắn chào hỏi từ bot (khác nhau theo loại phiên)
        String loiChao = LOAI_NOI_BO.equals(loai)
                ? "Xin chào " + saved.getTenKhach() + "! Tôi là trợ lý AI nội bộ SevenStrike. " +
                  "Tôi có thể hỗ trợ bạn về quy trình bán hàng, hóa đơn, lịch làm việc và chính sách nội bộ. Bạn cần hỗ trợ gì?"
                : "Xin chào! Tôi là trợ lý AI của SevenStrike. Tôi có thể giúp bạn về sản phẩm, đơn hàng, và chính sách mua hàng. Bạn cần hỗ trợ gì?";

        TinNhan loiChaoTin = TinNhan.builder()
                .phienChat(saved)
                .nguoiGui("BOT")
                .tenNguoiGui("SevenStrike AI")
                .noiDung(loiChao)
                .thoiGian(LocalDateTime.now())
                .build();
        tinNhanRepo.save(loiChaoTin);

        return toDTO(saved);
    }

    // ─── Xử lý tin nhắn từ khách → gọi Gemini hoặc chuyển nhân viên ─────────
    @Transactional
    public void xuLyTinNhanKhach(Integer phienChatId, GuiTinNhanRequest req) {
        PhienChat phien = phienChatRepo.findById(phienChatId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại: " + phienChatId));

        // Lưu tin nhắn của khách
        TinNhan tinNhanKhach = TinNhan.builder()
                .phienChat(phien)
                .nguoiGui("KHACH")
                .tenNguoiGui(req.getTenNguoiGui() != null ? req.getTenNguoiGui() : phien.getTenKhach())
                .noiDung(req.getNoiDung())
                .thoiGian(LocalDateTime.now())
                .build();
        TinNhan savedKhach = tinNhanRepo.save(tinNhanKhach);

        // Broadcast tin nhắn khách
        TinNhanDTO khachDTO = toTinNhanDTO(savedKhach);
        messagingTemplate.convertAndSend("/topic/chat/" + phienChatId, khachDTO);

        // Nếu đang ở chế độ BOT → xử lý escalate hoặc gọi Gemini
        if (TRANG_THAI_BOT.equals(phien.getTrangThai())) {
            boolean isNoiBo = LOAI_NOI_BO.equals(phien.getLoai());
            String noiDung = req.getNoiDung() != null ? req.getNoiDung().trim() : "";

            // Kiểm tra yêu cầu escalate trực tiếp (bypass Gemini để đảm bảo độ tin cậy)
            boolean isDirectEscalate =
                    noiDung.contains("Tôi cần gặp Admin") ||
                    noiDung.contains("Tôi muốn nói chuyện với nhân viên hỗ trợ");

            if (isDirectEscalate) {
                xuLyEscalate(phien, isNoiBo);
            } else {
                String geminiReply = isNoiBo
                        ? geminiService.hoiGeminiNoiBo(noiDung)
                        : geminiService.hoiGemini(noiDung);

                if ("CHUYEN_NHAN_VIEN".equals(geminiReply)) {
                    xuLyEscalate(phien, isNoiBo);
                } else {
                    // Lưu và broadcast câu trả lời của bot
                    TinNhan botReply = TinNhan.builder()
                            .phienChat(phien)
                            .nguoiGui("BOT")
                            .tenNguoiGui("SevenStrike AI")
                            .noiDung(geminiReply)
                            .thoiGian(LocalDateTime.now())
                            .build();
                    TinNhan savedBot = tinNhanRepo.save(botReply);
                    messagingTemplate.convertAndSend("/topic/chat/" + phienChatId, toTinNhanDTO(savedBot));
                }
            }
        }
        // Nếu CHO_NHAN_VIEN hoặc DANG_XU_LY → chỉ broadcast, không gọi AI
    }

    // ─── Xử lý escalate: chuyển phiên sang chờ nhân viên/admin ──────────────
    private void xuLyEscalate(PhienChat phien, boolean isNoiBo) {
        phien.setTrangThai(TRANG_THAI_CHO_NV);
        phienChatRepo.save(phien);

        String thongBao = isNoiBo
                ? "Yêu cầu của bạn cần sự phê duyệt của Admin. Đang kết nối với Admin, vui lòng chờ..."
                : "Tôi đã kết nối bạn với nhân viên hỗ trợ. Vui lòng chờ trong giây lát...";

        TinNhan botNotify = TinNhan.builder()
                .phienChat(phien)
                .nguoiGui("BOT")
                .tenNguoiGui("SevenStrike AI")
                .noiDung(thongBao)
                .thoiGian(LocalDateTime.now())
                .build();
        TinNhan savedNotify = tinNhanRepo.save(botNotify);
        messagingTemplate.convertAndSend("/topic/chat/" + phien.getId(), toTinNhanDTO(savedNotify));

        // Thông báo đến đúng topic theo loại phiên
        String notifyTopic = isNoiBo ? "/topic/admin/noibo-notifications" : "/topic/admin/notifications";
        messagingTemplate.convertAndSend(notifyTopic, toDTO(phien));
    }

    // ─── Nhân viên gửi tin nhắn ──────────────────────────────────────────────
    @Transactional
    public void nhanVienGuiTin(Integer phienChatId, GuiTinNhanRequest req) {
        PhienChat phien = phienChatRepo.findById(phienChatId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại: " + phienChatId));

        TinNhan tin = TinNhan.builder()
                .phienChat(phien)
                .nguoiGui("NHAN_VIEN")
                .tenNguoiGui(req.getTenNguoiGui())
                .noiDung(req.getNoiDung())
                .thoiGian(LocalDateTime.now())
                .build();
        TinNhan saved = tinNhanRepo.save(tin);
        messagingTemplate.convertAndSend("/topic/chat/" + phienChatId, toTinNhanDTO(saved));
    }

    // ─── Nhân viên nhận phiên ────────────────────────────────────────────────
    @Transactional
    public PhienChatDTO nhanVienNhanPhien(Integer phienChatId, Integer nhanVienId) {
        PhienChat phien = phienChatRepo.findById(phienChatId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));

        if (nhanVienId != null) {
            nhanVienRepo.findById(nhanVienId).ifPresent(phien::setNhanVien);
        }
        phien.setTrangThai(TRANG_THAI_DANG_XU_LY);
        PhienChat saved = phienChatRepo.save(phien);

        // Thông báo cho khách
        String tenNV = saved.getNhanVien() != null
                ? (saved.getNhanVien().getTenNhanVien() != null ? saved.getNhanVien().getTenNhanVien() : "Nhân viên")
                : "Nhân viên";
        TinNhan notify = TinNhan.builder()
                .phienChat(saved)
                .nguoiGui("BOT")
                .tenNguoiGui("SevenStrike AI")
                .noiDung("Nhân viên " + tenNV + " đã tiếp nhận hỗ trợ bạn.")
                .thoiGian(LocalDateTime.now())
                .build();
        TinNhan savedNotify = tinNhanRepo.save(notify);
        messagingTemplate.convertAndSend("/topic/chat/" + phienChatId, toTinNhanDTO(savedNotify));

        // Cập nhật danh sách phiên đến đúng topic theo loại phiên
        boolean isNoiBo = LOAI_NOI_BO.equals(saved.getLoai());
        String notifyTopic = isNoiBo ? "/topic/admin/noibo-notifications" : "/topic/admin/notifications";
        messagingTemplate.convertAndSend(notifyTopic, toDTO(saved));

        return toDTO(saved);
    }

    // ─── Đóng phiên ──────────────────────────────────────────────────────────
    @Transactional
    public void dongPhien(Integer phienChatId) {
        PhienChat phien = phienChatRepo.findById(phienChatId)
                .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại"));
        phien.setTrangThai(TRANG_THAI_DA_DONG);
        phien.setThoiGianKetThuc(LocalDateTime.now());
        phienChatRepo.save(phien);

        TinNhan notify = TinNhan.builder()
                .phienChat(phien)
                .nguoiGui("BOT")
                .tenNguoiGui("SevenStrike AI")
                .noiDung("Phiên hỗ trợ đã kết thúc. Cảm ơn bạn đã liên hệ với SevenStrike!")
                .thoiGian(LocalDateTime.now())
                .build();
        TinNhan saved = tinNhanRepo.save(notify);
        messagingTemplate.convertAndSend("/topic/chat/" + phienChatId, toTinNhanDTO(saved));
    }

    // ─── Lấy danh sách phiên (cho admin) ────────────────────────────────────
    public List<PhienChatDTO> layDanhSachPhien(String trangThai, String loai) {
        List<PhienChat> list;
        if (loai != null && !loai.isBlank()) {
            // Lọc theo loại + trạng thái
            list = (trangThai != null && !trangThai.isBlank())
                    ? phienChatRepo.findByLoaiAndTrangThaiOrderByThoiGianBatDauDesc(loai, trangThai)
                    : phienChatRepo.findByLoaiAndTrangThaiNotOrderByThoiGianBatDauDesc(loai, TRANG_THAI_DA_DONG);
        } else {
            // Không lọc loại
            list = (trangThai != null && !trangThai.isBlank())
                    ? phienChatRepo.findByTrangThaiOrderByThoiGianBatDauDesc(trangThai)
                    : phienChatRepo.findByTrangThaiNotOrderByThoiGianBatDauDesc(TRANG_THAI_DA_DONG);
        }
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── Lấy thông tin một phiên ─────────────────────────────────────────────
    public Optional<PhienChatDTO> findById(Integer id) {
        return phienChatRepo.findById(id).map(this::toDTO);
    }

    // ─── Lấy lịch sử tin nhắn ───────────────────────────────────────────────
    public List<TinNhanDTO> layTinNhan(Integer phienChatId) {
        return tinNhanRepo.findByPhienChat_IdOrderByThoiGianAsc(phienChatId)
                .stream().map(this::toTinNhanDTO).collect(Collectors.toList());
    }

    // ─── Mappers ─────────────────────────────────────────────────────────────
    private PhienChatDTO toDTO(PhienChat p) {
        List<TinNhan> tinNhans = tinNhanRepo.findByPhienChat_IdOrderByThoiGianAsc(p.getId());
        String tinNhanCuoi = tinNhans.isEmpty() ? null : tinNhans.get(tinNhans.size() - 1).getNoiDung();
        return PhienChatDTO.builder()
                .id(p.getId())
                .tenKhach(p.getTenKhach())
                .loai(p.getLoai())
                .trangThai(p.getTrangThai())
                .thoiGianBatDau(p.getThoiGianBatDau())
                .tinNhanCuoi(tinNhanCuoi)
                .soTinNhan(tinNhans.size())
                .build();
    }

    private TinNhanDTO toTinNhanDTO(TinNhan t) {
        return TinNhanDTO.builder()
                .id(t.getId())
                .phienChatId(t.getPhienChat().getId())
                .nguoiGui(t.getNguoiGui())
                .tenNguoiGui(t.getTenNguoiGui())
                .noiDung(t.getNoiDung())
                .thoiGian(t.getThoiGian())
                .build();
    }
}
