// File: src/main/java/com/example/datn_sevenstrike/service/HoaDonService.java
package com.example.datn_sevenstrike.service;

import com.example.datn_sevenstrike.constants.TrangThaiHoaDon;
import com.example.datn_sevenstrike.dto.request.HoaDonChiTietRequest;
import com.example.datn_sevenstrike.dto.request.HoaDonRequest;
import com.example.datn_sevenstrike.dto.response.HoaDonChiTietResponse;
import com.example.datn_sevenstrike.dto.response.HoaDonResponse;
import com.example.datn_sevenstrike.entity.FormChan;
import com.example.datn_sevenstrike.entity.GiaoDichThanhToan;
import com.example.datn_sevenstrike.entity.HoaDon;
import com.example.datn_sevenstrike.entity.HoaDonChiTiet;
import com.example.datn_sevenstrike.entity.PhuongThucThanhToan;
import com.example.datn_sevenstrike.entity.KichThuoc;
import com.example.datn_sevenstrike.entity.LichSuHoaDon;
import com.example.datn_sevenstrike.entity.LoaiSan;
import com.example.datn_sevenstrike.entity.MauSac;
import com.example.datn_sevenstrike.entity.PhieuGiamGia;
import com.example.datn_sevenstrike.entity.PhieuGiamGiaCaNhan;
import com.example.datn_sevenstrike.entity.SanPham;
import com.example.datn_sevenstrike.entity.ChiTietSanPham;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.exception.NotFoundEx;
import com.example.datn_sevenstrike.repository.ChiTietDotGiamGiaRepository;
import com.example.datn_sevenstrike.repository.ChiTietSanPhamRepository;
import com.example.datn_sevenstrike.repository.GiaoDichThanhToanRepository;
import com.example.datn_sevenstrike.repository.HoaDonChiTietRepository;
import com.example.datn_sevenstrike.repository.HoaDonRepository;
import com.example.datn_sevenstrike.repository.LichSuHoaDonRepository;
import com.example.datn_sevenstrike.repository.PhieuGiamGiaCaNhanRepository;
import com.example.datn_sevenstrike.repository.PhieuGiamGiaRepository;
import com.example.datn_sevenstrike.repository.PhuongThucThanhToanRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HoaDonService {

    private final HoaDonRepository repo;
    private final LichSuHoaDonRepository lichSuRepo;
    private final ModelMapper mapper;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    // POS deps
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final ChiTietDotGiamGiaRepository chiTietDotGiamGiaRepository;
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final PhieuGiamGiaCaNhanRepository phieuGiamGiaCaNhanRepository;
    private final GiaoDichThanhToanRepository giaoDichThanhToanRepository;
    private final PhuongThucThanhToanRepository phuongThucThanhToanRepository;

        public List<HoaDonResponse> all() {
        return repo.getDanhSachHoaDon();
    }

    public Page<HoaDonResponse> page(int pageNo, int pageSize) {
        int p = Math.max(pageNo, 0);
        int s = Math.max(pageSize, 1);
        var pageable = PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "id"));
        return repo.findAllByXoaMemFalse(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public HoaDonResponse one(Integer id) {
        HoaDon hd = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn id=" + id));

        HoaDonResponse res = toResponse(hd);

        List<HoaDonChiTiet> listCT = hoaDonChiTietRepository.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(id);

        List<HoaDonChiTietResponse> chiTietList = listCT.stream()
                .map(ct -> {
                    ChiTietSanPham ctsp = ct.getChiTietSanPham();
                    SanPham sp = (ctsp == null) ? null : ctsp.getSanPham();

                    String mauSac = null;
                    String kichCo = null;
                    String loaiSan = null;
                    String formChan = null;

                    if (ctsp != null) {
                        MauSac ms = ctsp.getMauSac();
                        if (ms != null) {
                            mauSac = ms.getTenMauSac();
                        }

                        KichThuoc kt = ctsp.getKichThuoc();
                        if (kt != null) {
                            if (kt.getGiaTriKichThuoc() != null) {
                                kichCo = String.valueOf(kt.getGiaTriKichThuoc());
                            } else {
                                kichCo = kt.getTenKichThuoc();
                            }
                        }

                        LoaiSan ls = ctsp.getLoaiSan();
                        if (ls != null) {
                            loaiSan = ls.getTenLoaiSan();
                        }

                        FormChan fc = ctsp.getFormChan();
                        if (fc != null) {
                            formChan = fc.getTenFormChan();
                        }
                    }

                    BigDecimal donGia = ct.getDonGia() == null ? BigDecimal.ZERO : ct.getDonGia();
                    int soLuong = ct.getSoLuong() == null ? 0 : ct.getSoLuong();

                    // Lấy giá hiện tại (real-time) để FE so sánh
                    BigDecimal giaHienTai = tinhGiaBanSauGiamTheoDot(ct.getIdChiTietSanPham(), ctsp != null ? ctsp.getGiaBan() : BigDecimal.ZERO);

                    return HoaDonChiTietResponse.builder()
                            .id(ct.getId())
                            .idHoaDon(ct.getIdHoaDon())
                            .idChiTietSanPham(ct.getIdChiTietSanPham())
                            .maHoaDonChiTiet(ct.getMaHoaDonChiTiet())
                            .soLuong(soLuong)
                            .donGia(donGia)
                            .donGiaCu(giaHienTai) // Reuse field này để gửi giá hiện tại xuống FE
                            .thanhTien(donGia.multiply(BigDecimal.valueOf(soLuong)))

                            .ghiChu(ct.getGhiChu())
                            .xoaMem(ct.getXoaMem())

                            .maHoaDon(hd.getMaHoaDon())

                            .maChiTietSanPham(ctsp == null ? null : ctsp.getMaChiTietSanPham())
                            .maSanPham(sp == null ? null : sp.getMaSanPham())
                            .tenSanPham(sp == null ? null : sp.getTenSanPham())

                            .mauSac(mauSac)
                            .kichCo(kichCo)
                            .loaiSan(loaiSan)
                            .formChan(formChan)

                            .duongDanAnhDaiDien(null)
                            .build();
                })
                .toList();

        // Logic xác định loại thanh toán để FE hiển thị (0: Tiền mặt/COD, 1: Chuyển khoản/VNPAY)
        // Vì đã bỏ cột loai_thanh_toan trong DB, cần check trong giao_dich_thanh_toan
        res.setLoaiThanhToan(isDonChuyenKhoan(id) ? 1 : 0);
        res.setChiTietHoaDon(chiTietList);
        return res;
    }

    @Transactional
    public HoaDonResponse create(HoaDonRequest req) {
        if (req == null) throw new BadRequestEx("Thiếu dữ liệu tạo mới");

        HoaDon hd = mapper.map(req, HoaDon.class);
        hd.setId(null);

        applyDefaults(hd);

        if (hd.getTrangThaiHienTai() == null) {
            hd.setTrangThaiHienTai(TrangThaiHoaDon.CHO_XAC_NHAN.code);
        }

        validateTheoLoaiDon(hd);

        HoaDon saved = repo.save(hd);
        pushHistory(saved.getId(), saved.getTrangThaiHienTai(), "Tạo đơn");
        return toResponse(saved);
    }

    /**
     * - BE tự tính đơn giá theo đợt giảm giá (nếu có) để luôn khớp nghiệp vụ.
     * - FE gửi donGia vẫn OK nhưng BE không phụ thuộc vào giá FE gửi.
     */
    @Transactional
    public HoaDonResponse upsertChiTiet(Integer idHoaDon, List<HoaDonChiTietRequest> items) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");
        if (items == null || items.isEmpty()) throw new BadRequestEx("Danh sách sản phẩm trống");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + idHoaDon));

        if (TrangThaiHoaDon.isTerminal(hd.getTrangThaiHienTai())) {
            throw new BadRequestEx("Đơn đã kết thúc, không thể cập nhật sản phẩm");
        }

        // 1. Gộp tổng số lượng yêu cầu theo ID sản phẩm (để xử lý trường hợp FE gửi nhiều dòng cùng 1 SP)
        Map<Integer, Integer> requestQtyMap = new HashMap<>();
        Map<Integer, String> requestNoteMap = new HashMap<>();
        
        for (HoaDonChiTietRequest x : items) {
            if (x == null || x.getIdChiTietSanPham() == null) continue;
            if (Boolean.TRUE.equals(x.getXoaMem())) continue; // Bỏ qua yêu cầu xóa trong map này
            
            if (x.getSoLuong() == null || x.getSoLuong() <= 0) {
                throw new BadRequestEx("Số lượng phải lớn hơn 0");
            }
            
            requestQtyMap.merge(x.getIdChiTietSanPham(), x.getSoLuong(), Integer::sum);
            if (x.getGhiChu() != null) requestNoteMap.put(x.getIdChiTietSanPham(), x.getGhiChu());
        }

        // 2. Lấy danh sách hiện tại trong DB
        List<HoaDonChiTiet> current = hoaDonChiTietRepository.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(idHoaDon);

        // 3. Xử lý Xóa: Những SP có trong DB nhưng không có trong Request -> Xóa mềm
        Set<Integer> requestedIds = requestQtyMap.keySet();
        for (HoaDonChiTiet old : current) {
            if (!requestedIds.contains(old.getIdChiTietSanPham())) {
                old.setXoaMem(true);
            }
        }

        // 4. Xử lý Thêm/Sửa (Delta Logic)
        for (Map.Entry<Integer, Integer> entry : requestQtyMap.entrySet()) {
            Integer ctspId = entry.getKey();
            Integer targetQty = entry.getValue();
            String ghiChu = requestNoteMap.get(ctspId);

            ChiTietSanPham ctsp = chiTietSanPhamRepository.findByIdAndXoaMemFalse(ctspId)
                    .orElseThrow(() -> new BadRequestEx("CTSP không tồn tại hoặc đã xóa: id=" + ctspId));

            BigDecimal giaGoc = ctsp.getGiaBan() == null ? BigDecimal.ZERO : ctsp.getGiaBan();
            BigDecimal donGiaApDung = tinhGiaBanSauGiamTheoDot(ctspId, giaGoc);

            // ✅ [CASE KHÓ] Logic tách dòng khi đổi giá:
            // 1. Tính tổng số lượng hiện có của sản phẩm này (bất kể giá nào)
            List<HoaDonChiTiet> existingItems = current.stream()
                    .filter(ct -> ctspId.equals(ct.getIdChiTietSanPham()) && !Boolean.TRUE.equals(ct.getXoaMem()))
                    .toList();

            int currentTotalQty = existingItems.stream().mapToInt(HoaDonChiTiet::getSoLuong).sum();
            int delta = targetQty - currentTotalQty;

            if (delta > 0) {
                // Tăng số lượng: Thêm phần chênh lệch vào dòng có GIÁ MỚI (hoặc tạo mới)
                HoaDonChiTiet samePriceItem = existingItems.stream()
                        .filter(ct -> ct.getDonGia() != null && ct.getDonGia().compareTo(donGiaApDung) == 0)
                        .findFirst().orElse(null);

                if (samePriceItem != null) {
                    samePriceItem.setSoLuong(samePriceItem.getSoLuong() + delta);
                    if (ghiChu != null) samePriceItem.setGhiChu(ghiChu);
                } else {
                    HoaDonChiTiet ctNew = new HoaDonChiTiet();
                    ctNew.setId(null);
                    ctNew.setIdHoaDon(idHoaDon);
                    ctNew.setIdChiTietSanPham(ctspId);
                    ctNew.setSoLuong(delta);
                    ctNew.setDonGia(donGiaApDung);
                    ctNew.setGhiChu(ghiChu);
                    ctNew.setXoaMem(false);
                    current.add(ctNew);
                }
            } else if (delta < 0) {
                // Giảm số lượng: Trừ dần vào các dòng hiện có (ưu tiên trừ dòng giá cũ hoặc mới tùy logic, ở đây trừ dòng cuối cùng tìm thấy)
                int toRemove = -delta;
                for (int i = existingItems.size() - 1; i >= 0; i--) {
                    if (toRemove <= 0) break;
                    HoaDonChiTiet ct = existingItems.get(i);
                    int qty = ct.getSoLuong();
                    if (qty > toRemove) {
                        ct.setSoLuong(qty - toRemove);
                        toRemove = 0;
                    } else {
                        ct.setSoLuong(0);
                        ct.setXoaMem(true);
                        toRemove -= qty;
                    }
                }
            }
            // Nếu delta == 0: Giữ nguyên (không cập nhật giá cũ thành giá mới)
        }

        hoaDonChiTietRepository.saveAll(current);

        hd.setNgayCapNhat(LocalDateTime.now());
        repo.save(hd);

        pushHistory(idHoaDon, hd.getTrangThaiHienTai(), "Cập nhật sản phẩm trong hóa đơn");

        return one(idHoaDon);
    }

    @Transactional
    public HoaDonResponse confirmTaiQuayTienMat(Integer idHoaDon, String note) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + idHoaDon));

        if (TrangThaiHoaDon.isTerminal(hd.getTrangThaiHienTai())) {
            return toResponse(hd);
        }

        hd.setLoaiDon(0);

        List<HoaDonChiTiet> items = hoaDonChiTietRepository.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(idHoaDon);
        if (items == null || items.isEmpty()) {
            throw new BadRequestEx("Hóa đơn chưa có sản phẩm, không thể chốt");
        }

        BigDecimal tongTienHang = BigDecimal.ZERO;
        for (HoaDonChiTiet ct : items) {
            if (ct.getSoLuong() == null || ct.getSoLuong() <= 0) {
                throw new BadRequestEx("Số lượng không hợp lệ ở chi tiết hóa đơn id=" + ct.getId());
            }
            if (ct.getDonGia() == null || ct.getDonGia().signum() < 0) {
                throw new BadRequestEx("Đơn giá không hợp lệ ở chi tiết hóa đơn id=" + ct.getId());
            }
            tongTienHang = tongTienHang.add(ct.getDonGia().multiply(BigDecimal.valueOf(ct.getSoLuong())));
        }

        BigDecimal tienGiam = tinhVaConsumeVoucherNeuCo(hd, tongTienHang);

        BigDecimal tongTien = tongTienHang.add(hd.getPhiVanChuyen() == null ? BigDecimal.ZERO : hd.getPhiVanChuyen());
        BigDecimal tongTienSauGiam = tongTien.subtract(tienGiam);
        if (tongTienSauGiam.signum() < 0) tongTienSauGiam = BigDecimal.ZERO;

        hd.setTongTien(tongTien);
        hd.setTongTienSauGiam(tongTienSauGiam);

        for (HoaDonChiTiet ct : items) {
            Integer ctspId = ct.getIdChiTietSanPham();
            Integer qty = ct.getSoLuong();
            if (ctspId == null) {
                throw new BadRequestEx("Thiếu id_chi_tiet_san_pham ở chi tiết hóa đơn id=" + ct.getId());
            }

            int updated = chiTietSanPhamRepository.giamTonNeuDu(ctspId, qty);
            if (updated == 0) {
                ChiTietSanPham ctsp = chiTietSanPhamRepository.findByIdAndXoaMemFalse(ctspId)
                        .orElseThrow(() -> new BadRequestEx("CTSP không tồn tại hoặc đã xóa: id=" + ctspId));

                String ma = ctsp.getMaChiTietSanPham();
                Integer ton = ctsp.getSoLuong();
                throw new BadRequestEx("Không đủ tồn kho cho CTSP " + (ma == null ? ("id=" + ctspId) : ma)
                        + " (tồn hiện tại: " + (ton == null ? 0 : ton) + ")");
            }
        }

        PhuongThucThanhToan pttt = phuongThucThanhToanRepository
                .findFirstByTenPhuongThucThanhToanIgnoreCaseAndTrangThaiTrueAndXoaMemFalse("Tiền mặt")
                .orElseThrow(() -> new BadRequestEx("Chưa cấu hình phương thức thanh toán 'Tiền mặt'"));

        GiaoDichThanhToan gd = new GiaoDichThanhToan();
        gd.setId(null);
        gd.setIdHoaDon(idHoaDon);
        gd.setIdPhuongThucThanhToan(pttt.getId());
        gd.setSoTien(tongTienSauGiam);
        gd.setTrangThai("SUCCESS");
        gd.setThoiGianTao(LocalDateTime.now());
        gd.setXoaMem(false);
        gd.setGhiChu((note == null || note.isBlank()) ? "Chốt đơn tại quầy - tiền mặt" : note.trim());
        giaoDichThanhToanRepository.save(gd);

        hd.setTrangThaiHienTai(TrangThaiHoaDon.HOAN_THANH.code);
        hd.setNgayThanhToan(LocalDateTime.now());
        hd.setNgayCapNhat(LocalDateTime.now());

        validateTheoLoaiDon(hd);

        HoaDon saved = repo.save(hd);

        pushHistory(saved.getId(), TrangThaiHoaDon.HOAN_THANH.code,
                (note == null || note.isBlank()) ? "Chốt đơn tại quầy - tiền mặt" : note.trim());

        return toResponse(saved);
    }

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

        if (!isTrangThaiHopLe(newStatus)) {
            throw new BadRequestEx("trang_thai_hien_tai không hợp lệ");
        }

        if (newStatus == TrangThaiHoaDon.HUY_DON.code) {
            throw new BadRequestEx("Dùng endpoint /huy để hủy đơn hàng");
        }

        if (newStatus < oldStatus) {
            throw new BadRequestEx("Không thể chuyển trạng thái lùi");
        }

        if (Boolean.FALSE.equals(hd.getLoaiDon()) && (newStatus == 2 || newStatus == 3 || newStatus == 4)) {
            throw new BadRequestEx("Đơn tại quầy không có trạng thái giao hàng");
        }

        if (newStatus == TrangThaiHoaDon.HOAN_THANH.code) {
            List<HoaDonChiTiet> items = hoaDonChiTietRepository.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(idHoaDon);
            if (items == null || items.isEmpty()) {
                throw new BadRequestEx("Hóa đơn chưa có sản phẩm, không thể hoàn thành");
            }
            if (hd.getNgayThanhToan() == null) {
                hd.setNgayThanhToan(LocalDateTime.now());
            }
        }

        // Trừ tồn kho khi xác nhận đơn online (trạng thái 1 → 2)
        if (newStatus == TrangThaiHoaDon.CHO_GIAO_HANG.code
                && oldStatus == TrangThaiHoaDon.CHO_XAC_NHAN.code
                && hd.getLoaiDon() != null && hd.getLoaiDon() == 2) {
            List<HoaDonChiTiet> items = hoaDonChiTietRepository.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(idHoaDon);
            for (HoaDonChiTiet ct : items) {
                ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(ct.getIdChiTietSanPham())
                        .orElseThrow(() -> new BadRequestEx("Sản phẩm không tồn tại id=" + ct.getIdChiTietSanPham()));
                if (ctsp.getSoLuong() < ct.getSoLuong()) {
                    throw new BadRequestEx("Sản phẩm \"" + (ctsp.getSanPham() != null ? ctsp.getSanPham().getTenSanPham() : ct.getIdChiTietSanPham()) + "\" không đủ số lượng tồn kho");
                }
                ctsp.setSoLuong(ctsp.getSoLuong() - ct.getSoLuong());
                chiTietSanPhamRepository.save(ctsp);
            }
        }

        hd.setTrangThaiHienTai(newStatus);

        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);

        pushHistory(saved.getId(), newStatus,
                (note == null || note.isBlank()) ? "Cập nhật trạng thái" : note.trim());

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

    @Transactional
    public HoaDonResponse cancelOrder(Integer idHoaDon, Integer actorId, String actorType, String lyDo) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + idHoaDon));

        if (hd.getTrangThaiHienTai() == null || hd.getTrangThaiHienTai() != TrangThaiHoaDon.CHO_XAC_NHAN.code) {
            throw new BadRequestEx("Chỉ được hủy đơn khi ở trạng thái Chờ xác nhận");
        }

        // Hoàn voucher nếu có
        if (hd.getIdPhieuGiamGiaCaNhan() != null) {
            phieuGiamGiaCaNhanRepository.unmarkUsed(hd.getIdPhieuGiamGiaCaNhan());
            if (hd.getIdPhieuGiamGia() != null) {
                phieuGiamGiaRepository.restoreOne(hd.getIdPhieuGiamGia());
            }
        } else if (hd.getIdPhieuGiamGia() != null) {
            phieuGiamGiaRepository.restoreOne(hd.getIdPhieuGiamGia());
        }

        hd.setTrangThaiHienTai(TrangThaiHoaDon.HUY_DON.code);
        hd.setNgayCapNhat(LocalDateTime.now());

        boolean canHoanTien = false;
        // ✅ [CASE KHÓ] Đơn chuyển khoản cần hoàn phí
        // Chỉ hoàn khi: Không phải hệ thống hủy VÀ Đơn là chuyển khoản VÀ Đã thanh toán thành công
        if (!"HE_THONG".equals(actorType) && isDonChuyenKhoan(idHoaDon)) {
            if (isDonChuyenKhoan(idHoaDon) && hd.getNgayThanhToan() != null) {
                hd.setDaHoanPhi(false);
                canHoanTien = true;
            }
        }

        HoaDon saved = repo.save(hd);

        String prefix = switch (actorType == null ? "" : actorType) {
            case "NHAN_VIEN" -> "Nhân viên hủy đơn";
            case "KHACH_HANG" -> "Khách hàng hủy đơn";
            default -> "Hệ thống tự động hủy đơn";
        };
        String ghiChuHuy = (lyDo == null || lyDo.isBlank()) ? prefix : prefix + ": " + lyDo.trim();
        if (canHoanTien) {
            ghiChuHuy += " (Đơn hàng cần hoàn tiền lại cho khách)";
        }
        pushHistory(saved.getId(), TrangThaiHoaDon.HUY_DON.code, ghiChuHuy, actorId, actorType);

        return toResponse(saved);
    }

    @Transactional
    public HoaDonResponse requestCancelByCustomer(Integer idHoaDon, Integer khachHangId, String lyDo) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn id=" + idHoaDon));

        if (hd.getTrangThaiHienTai() == null || hd.getTrangThaiHienTai() != TrangThaiHoaDon.CHO_XAC_NHAN.code) {
            throw new BadRequestEx("Chỉ được yêu cầu hủy khi đơn đang ở trạng thái Chờ xác nhận");
        }
        if (hd.getIdKhachHang() == null || !hd.getIdKhachHang().equals(khachHangId)) {
            throw new BadRequestEx("Đơn hàng không thuộc về khách hàng này");
        }

        hd.setTrangThaiHienTai(TrangThaiHoaDon.YEU_CAU_HUY.code);
        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);

        String ghiChu = "Khách hàng yêu cầu hủy đơn"
                + (lyDo != null && !lyDo.isBlank() ? ": " + lyDo.trim() : "");
        if (isDonChuyenKhoan(idHoaDon) && hd.getNgayThanhToan() != null) {
            ghiChu += " (Đơn đã thanh toán VNPay - cần hoàn tiền nếu xác nhận hủy)";
        }
        pushHistory(saved.getId(), TrangThaiHoaDon.YEU_CAU_HUY.code, ghiChu, khachHangId, "KHACH_HANG");

        return toResponse(saved);
    }

    @Transactional
    public HoaDonResponse adminConfirmCancel(Integer idHoaDon, Integer nhanVienId, String lyDo) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn id=" + idHoaDon));

        if (hd.getTrangThaiHienTai() == null || hd.getTrangThaiHienTai() != TrangThaiHoaDon.YEU_CAU_HUY.code) {
            throw new BadRequestEx("Đơn hàng không ở trạng thái Yêu cầu hủy");
        }

        // Hoàn voucher
        if (hd.getIdPhieuGiamGiaCaNhan() != null) {
            phieuGiamGiaCaNhanRepository.unmarkUsed(hd.getIdPhieuGiamGiaCaNhan());
            if (hd.getIdPhieuGiamGia() != null) phieuGiamGiaRepository.restoreOne(hd.getIdPhieuGiamGia());
        } else if (hd.getIdPhieuGiamGia() != null) {
            phieuGiamGiaRepository.restoreOne(hd.getIdPhieuGiamGia());
        }

        boolean canHoanTien = false;
        if (isDonChuyenKhoan(idHoaDon) && hd.getNgayThanhToan() != null) {
            hd.setDaHoanPhi(false);
            canHoanTien = true;
        }

        hd.setTrangThaiHienTai(TrangThaiHoaDon.HUY_DON.code);
        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);

        String ghiChu = "Nhân viên xác nhận hủy đơn theo yêu cầu khách"
                + (lyDo != null && !lyDo.isBlank() ? ": " + lyDo.trim() : "");
        if (canHoanTien) ghiChu += " (Đơn hàng cần hoàn tiền lại cho khách)";
        pushHistory(saved.getId(), TrangThaiHoaDon.HUY_DON.code, ghiChu, nhanVienId, "NHAN_VIEN");

        return toResponse(saved);
    }

    @Transactional
    public HoaDonResponse adminRejectCancel(Integer idHoaDon, Integer nhanVienId, String lyDo) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn id=" + idHoaDon));

        if (hd.getTrangThaiHienTai() == null || hd.getTrangThaiHienTai() != TrangThaiHoaDon.YEU_CAU_HUY.code) {
            throw new BadRequestEx("Đơn hàng không ở trạng thái Yêu cầu hủy");
        }

        hd.setTrangThaiHienTai(TrangThaiHoaDon.CHO_XAC_NHAN.code);
        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);

        String ghiChu = "Nhân viên từ chối yêu cầu hủy đơn"
                + (lyDo != null && !lyDo.isBlank() ? ": " + lyDo.trim() : "");
        pushHistory(saved.getId(), TrangThaiHoaDon.CHO_XAC_NHAN.code, ghiChu, nhanVienId, "NHAN_VIEN");

        return toResponse(saved);
    }

    @Transactional
    public HoaDonResponse confirmHoanPhi(Integer idHoaDon, Integer nhanVienId) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy HoaDon id=" + idHoaDon));

        if (!Boolean.FALSE.equals(hd.getDaHoanPhi())) {
            throw new BadRequestEx("Đơn hàng này không cần xác nhận hoàn phí");
        }

        hd.setDaHoanPhi(true);
        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);

        pushHistory(saved.getId(), saved.getTrangThaiHienTai(), "Đã hoàn tiền cho khách hàng", nhanVienId, "NHAN_VIEN");

        return toResponse(saved);
    }

    @Transactional
    public void confirmVnpayPayment(Integer idHoaDon, String transactionId) {
        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon).orElse(null);
        if (hd == null) return;
        if (hd.getNgayThanhToan() != null) return; // idempotent

        hd.setNgayThanhToan(LocalDateTime.now());
        hd.setNgayCapNhat(LocalDateTime.now());
        repo.save(hd);

        List<GiaoDichThanhToan> gds = giaoDichThanhToanRepository.findAllByIdHoaDon(idHoaDon);
        for (GiaoDichThanhToan gd : gds) {
            if ("khoi_tao".equals(gd.getTrangThai())) {
                gd.setTrangThai("SUCCESS");
                if (transactionId != null) gd.setMaGiaoDichNgoai(transactionId);
                giaoDichThanhToanRepository.save(gd);
            }
        }

        String note = "Thanh toán VNPay thành công"
                + (transactionId != null ? " - Mã GD: " + transactionId : "");
        pushHistory(idHoaDon, hd.getTrangThaiHienTai(), note, null, "HE_THONG");
    }

    public List<HoaDonResponse> getDonCanHoanPhi() {
        return repo.findAllByDaHoanPhiFalseAndXoaMemFalseOrderByIdDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public HoaDonResponse updateDeliveryInfo(Integer idHoaDon, Integer khachHangId,
                                              String tenKhachHang, String soDienThoai, String diaChi) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn"));

        if (hd.getIdKhachHang() == null || !hd.getIdKhachHang().equals(khachHangId)) {
            throw new BadRequestEx("Đơn hàng không thuộc về khách hàng này");
        }
        if (!Integer.valueOf(2).equals(hd.getLoaiDon())) {
            throw new BadRequestEx("Chỉ áp dụng cho đơn hàng online");
        }
        // Logic cũ check loaiThanhToan == 0 (COD). Giờ check qua giao dịch.
        // Nếu đã thanh toán chuyển khoản thành công thì hạn chế sửa? 
        // Tạm thời bỏ check cứng loaiThanhToan, hoặc check isDonChuyenKhoan(id)
        if (hd.getTrangThaiHienTai() == null || hd.getTrangThaiHienTai() != TrangThaiHoaDon.CHO_XAC_NHAN.code) {
            throw new BadRequestEx("Chỉ được sửa thông tin khi đơn đang ở trạng thái Chờ xác nhận");
        }
        // CASE KHÓ: Đơn chuyển khoản không được sửa thông tin giao hàng
        if (isDonChuyenKhoan(idHoaDon)) {
            throw new BadRequestEx("Đơn hàng đã thanh toán (Chuyển khoản/VNPAY) không được thay đổi thông tin giao hàng.");
        }

        if (tenKhachHang != null && !tenKhachHang.isBlank()) hd.setTenKhachHang(tenKhachHang.trim());
        if (soDienThoai != null && !soDienThoai.isBlank()) hd.setSoDienThoaiKhachHang(soDienThoai.trim());
        if (diaChi != null && !diaChi.isBlank()) hd.setDiaChiKhachHang(diaChi.trim());
        hd.setNgayCapNhat(LocalDateTime.now());

        HoaDon saved = repo.save(hd);
        pushHistory(saved.getId(), saved.getTrangThaiHienTai(), "Cập nhật thông tin giao hàng", khachHangId, "KHACH_HANG");

        return toResponse(saved);
    }

    @Transactional
    public HoaDonResponse adminUpdateThongTinGiaoHang(Integer id, String tenKhachHang,
                                                       String sdt, String email, String diaChi) {
        HoaDon hd = repo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn"));
        if (tenKhachHang != null && !tenKhachHang.isBlank()) hd.setTenKhachHang(tenKhachHang.trim());
        if (sdt != null && !sdt.isBlank()) hd.setSoDienThoaiKhachHang(sdt.trim());
        if (email != null && !email.isBlank()) hd.setEmailKhachHang(email.trim());
        if (diaChi != null && !diaChi.isBlank()) hd.setDiaChiKhachHang(diaChi.trim());
        hd.setNgayCapNhat(LocalDateTime.now());
        HoaDon saved = repo.save(hd);
        pushHistory(saved.getId(), saved.getTrangThaiHienTai(), "Admin cập nhật thông tin giao hàng", null, "NHAN_VIEN");
        return toResponse(saved);
    }

    @Transactional
    public HoaDonResponse clientUpdateItems(Integer idHoaDon, Integer khachHangId, List<HoaDonChiTietRequest> items) {
        if (idHoaDon == null) throw new BadRequestEx("Thiếu id hóa đơn");
        if (items == null || items.isEmpty()) throw new BadRequestEx("Danh sách sản phẩm trống");

        HoaDon hd = repo.findByIdAndXoaMemFalse(idHoaDon)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn"));

        if (hd.getIdKhachHang() == null || !hd.getIdKhachHang().equals(khachHangId)) {
            throw new BadRequestEx("Đơn hàng không thuộc về khách hàng này");
        }
        if (!Integer.valueOf(2).equals(hd.getLoaiDon())) {
            throw new BadRequestEx("Chỉ áp dụng cho đơn hàng online");
        }
        if (hd.getTrangThaiHienTai() == null || hd.getTrangThaiHienTai() != TrangThaiHoaDon.CHO_XAC_NHAN.code) {
            throw new BadRequestEx("Chỉ được sửa sản phẩm khi đơn đang ở trạng thái Chờ xác nhận");
        }
        // CASE KHÓ: Đơn chuyển khoản không được sửa sản phẩm
        if (isDonChuyenKhoan(idHoaDon)) {
            throw new BadRequestEx("Đơn hàng đã thanh toán (Chuyển khoản/VNPAY) không được thay đổi sản phẩm.");
        }

        // Validate: sau update phải còn ít nhất 1 item với soLuong >= 1
        long activeCount = items.stream()
                .filter(x -> !Boolean.TRUE.equals(x.getXoaMem()) && x.getSoLuong() != null && x.getSoLuong() >= 1)
                .count();
        if (activeCount < 1) {
            throw new BadRequestEx("Đơn hàng phải có ít nhất 1 sản phẩm với số lượng tối thiểu 1");
        }

        HoaDonResponse result = upsertChiTiet(idHoaDon, items);
        pushHistory(idHoaDon, hd.getTrangThaiHienTai(), "Khách hàng cập nhật sản phẩm trong đơn hàng", khachHangId, "KHACH_HANG");
        return result;
    }

    // ================== PRIVATE ==================

    private boolean isDonChuyenKhoan(Integer hoaDonId) {
        List<GiaoDichThanhToan> gds = giaoDichThanhToanRepository.findAllByIdHoaDon(hoaDonId);
        for (GiaoDichThanhToan gd : gds) {
            if (gd.getIdPhuongThucThanhToan() != null) {
                PhuongThucThanhToan pt = phuongThucThanhToanRepository.findById(gd.getIdPhuongThucThanhToan()).orElse(null);
                if (pt != null && pt.getTenPhuongThucThanhToan() != null) {
                    String name = pt.getTenPhuongThucThanhToan().toLowerCase();
                    if (name.contains("chuyển khoản") || name.contains("vnpay")) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private void pushHistory(Integer idHoaDon, Integer trangThai, String ghiChu) {
        pushHistory(idHoaDon, trangThai, ghiChu, null, "HE_THONG");
    }

    private void pushHistory(Integer idHoaDon, Integer trangThai, String ghiChu,
                              Integer nguoiThucHien, String loaiNguoiThucHien) {
        LichSuHoaDon h = new LichSuHoaDon();
        h.setId(null);
        h.setIdHoaDon(idHoaDon);
        h.setTrangThai(trangThai);
        h.setGhiChu(ghiChu);
        h.setXoaMem(false);
        h.setNguoiThucHien(nguoiThucHien);
        h.setLoaiNguoiThucHien(loaiNguoiThucHien != null ? loaiNguoiThucHien : "HE_THONG");
        lichSuRepo.save(h);
    }

    private void applyDefaults(HoaDon hd) {
        if (hd.getXoaMem() == null) hd.setXoaMem(false);
        if (hd.getNgayTao() == null) hd.setNgayTao(LocalDateTime.now());

        if (hd.getLoaiDon() == null) hd.setLoaiDon(0);
        if (hd.getPhiVanChuyen() == null) hd.setPhiVanChuyen(BigDecimal.ZERO);

        if (hd.getTenKhachHang() != null) hd.setTenKhachHang(hd.getTenKhachHang().trim());
        if (hd.getDiaChiKhachHang() != null) hd.setDiaChiKhachHang(hd.getDiaChiKhachHang().trim());
        if (hd.getSoDienThoaiKhachHang() != null) hd.setSoDienThoaiKhachHang(hd.getSoDienThoaiKhachHang().trim());
        if (hd.getEmailKhachHang() != null) hd.setEmailKhachHang(hd.getEmailKhachHang().trim());
        if (hd.getGhiChu() != null) hd.setGhiChu(hd.getGhiChu().trim());

        if (hd.getTongTien() == null) hd.setTongTien(BigDecimal.ZERO);
        if (hd.getTongTienSauGiam() == null) hd.setTongTienSauGiam(BigDecimal.ZERO);
    }

    private void validateTheoLoaiDon(HoaDon hd) {
        if (hd.getTenKhachHang() == null || hd.getTenKhachHang().isBlank()) {
            throw new BadRequestEx("Thiếu ten_khach_hang");
        }
        if (hd.getSoDienThoaiKhachHang() == null || hd.getSoDienThoaiKhachHang().isBlank()) {
            throw new BadRequestEx("Thiếu so_dien_thoai_khach_hang");
        }

        if (hd.getLoaiDon() != null && hd.getLoaiDon() >= 1) {
            if (hd.getDiaChiKhachHang() == null || hd.getDiaChiKhachHang().isBlank()) {
                throw new BadRequestEx("Thiếu dia_chi_khach_hang (đơn giao hàng)");
            }
        } else {
            if (hd.getDiaChiKhachHang() == null) hd.setDiaChiKhachHang("");
        }

        if (hd.getTongTien() == null || hd.getTongTien().signum() < 0) {
            throw new BadRequestEx("tong_tien không hợp lệ");
        }
        if (hd.getTongTienSauGiam() == null || hd.getTongTienSauGiam().signum() < 0) {
            throw new BadRequestEx("tong_tien_sau_giam không hợp lệ");
        }
        if (hd.getTongTienSauGiam().compareTo(hd.getTongTien()) > 0) {
            throw new BadRequestEx("tong_tien_sau_giam không được lớn hơn tong_tien");
        }

        if (hd.getTrangThaiHienTai() == null) {
            throw new BadRequestEx("Thiếu trang_thai_hien_tai");
        }

        if (!isTrangThaiHopLe(hd.getTrangThaiHienTai())) {
            throw new BadRequestEx("trang_thai_hien_tai không hợp lệ");
        }
    }

    private boolean isTrangThaiHopLe(Integer code) {
        if (code == null) return false;
        for (TrangThaiHoaDon t : TrangThaiHoaDon.values()) {
            if (t.code == code) return true;
        }
        return false;
    }

    private BigDecimal tinhGiaBanSauGiamTheoDot(Integer ctspId, BigDecimal giaGoc) {
        if (ctspId == null) return giaGoc == null ? BigDecimal.ZERO : giaGoc;
        BigDecimal base = giaGoc == null ? BigDecimal.ZERO : giaGoc;
        if (base.signum() <= 0) return BigDecimal.ZERO;

        LocalDate today = LocalDate.now();
        var bestOpt = chiTietDotGiamGiaRepository.findBestActiveDotByCtspId(ctspId, today);
        if (bestOpt.isEmpty()) return base.setScale(2, RoundingMode.HALF_UP);

        var best = bestOpt.get();
        BigDecimal pct = best.getGiaTriGiam() == null ? BigDecimal.ZERO : best.getGiaTriGiam();
        if (pct.signum() <= 0) return base.setScale(2, RoundingMode.HALF_UP);

        BigDecimal soTienGiam = base.multiply(pct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal max = best.getSoTienGiamToiDa();
        if (max != null && max.signum() > 0 && soTienGiam.compareTo(max) > 0) {
            soTienGiam = max.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal out = base.subtract(soTienGiam);
        if (out.signum() < 0) out = BigDecimal.ZERO;
        return out.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal tinhVaConsumeVoucherNeuCo(HoaDon hd, BigDecimal tongTienHang) {
        BigDecimal giam = BigDecimal.ZERO;
        LocalDate today = LocalDate.now();

        if (hd.getIdPhieuGiamGiaCaNhan() != null) {
            if (hd.getIdKhachHang() == null) {
                throw new BadRequestEx("Đơn dùng voucher cá nhân nhưng thiếu id_khach_hang");
            }

            PhieuGiamGiaCaNhan caNhan = phieuGiamGiaCaNhanRepository
                    .findByIdAndXoaMemFalse(hd.getIdPhieuGiamGiaCaNhan())
                    .orElseThrow(() -> new BadRequestEx("Voucher cá nhân không tồn tại hoặc đã xóa"));

            if (!hd.getIdKhachHang().equals(caNhan.getIdKhachHang())) {
                throw new BadRequestEx("Voucher cá nhân không thuộc khách hàng này");
            }
            if (Boolean.TRUE.equals(caNhan.getDaSuDung())) {
                throw new BadRequestEx("Voucher cá nhân đã sử dụng");
            }

            PhieuGiamGia pgg = caNhan.getPhieuGiamGia();
            if (pgg == null) {
                pgg = phieuGiamGiaRepository.findByIdAndXoaMemFalse(caNhan.getIdPhieuGiamGia())
                        .orElseThrow(() -> new BadRequestEx("Phiếu giảm giá gốc không tồn tại"));
            }

            validateVoucher(pgg, tongTienHang, today);

            if (hd.getIdPhieuGiamGia() == null) {
                hd.setIdPhieuGiamGia(pgg.getId());
            } else if (!hd.getIdPhieuGiamGia().equals(pgg.getId())) {
                throw new BadRequestEx("Voucher cá nhân không khớp id_phieu_giam_gia trên hóa đơn");
            }

            giam = tinhSoTienGiam(pgg, tongTienHang);

            int okConsume = phieuGiamGiaRepository.consumeNeuCon(pgg.getId());
            if (okConsume == 0) {
                throw new BadRequestEx("Phiếu giảm giá đã hết lượt sử dụng");
            }

            int okMark = phieuGiamGiaCaNhanRepository.markUsedNeuHopLe(caNhan.getId(), hd.getIdKhachHang());
            if (okMark == 0) {
                throw new BadRequestEx("Không thể đánh dấu dùng voucher cá nhân (có thể đã dùng/không hợp lệ)");
            }

            return giam;
        }

        if (hd.getIdPhieuGiamGia() != null) {
            PhieuGiamGia pgg = phieuGiamGiaRepository.findByIdAndXoaMemFalse(hd.getIdPhieuGiamGia())
                    .orElseThrow(() -> new BadRequestEx("Phiếu giảm giá không tồn tại hoặc đã xóa"));

            validateVoucher(pgg, tongTienHang, today);

            giam = tinhSoTienGiam(pgg, tongTienHang);

            int ok = phieuGiamGiaRepository.consumeNeuCon(pgg.getId());
            if (ok == 0) {
                throw new BadRequestEx("Phiếu giảm giá đã hết lượt sử dụng");
            }
        }

        return giam;
    }

    private void validateVoucher(PhieuGiamGia pgg, BigDecimal tongTienHang, LocalDate today) {
        if (Boolean.TRUE.equals(pgg.getXoaMem()) || !Boolean.TRUE.equals(pgg.getTrangThai())) {
            throw new BadRequestEx("Phiếu giảm giá không hoạt động");
        }
        if (pgg.getNgayBatDau() != null && today.isBefore(pgg.getNgayBatDau())) {
            throw new BadRequestEx("Phiếu giảm giá chưa đến ngày áp dụng");
        }
        if (pgg.getNgayKetThuc() != null && today.isAfter(pgg.getNgayKetThuc())) {
            throw new BadRequestEx("Phiếu giảm giá đã hết hạn");
        }
        if (pgg.getHoaDonToiThieu() != null && tongTienHang.compareTo(pgg.getHoaDonToiThieu()) < 0) {
            throw new BadRequestEx("Chưa đạt hóa đơn tối thiểu để áp dụng phiếu giảm giá");
        }
        if (pgg.getSoLuongSuDung() == null || pgg.getSoLuongSuDung() <= 0) {
            throw new BadRequestEx("Phiếu giảm giá đã hết lượt sử dụng");
        }
    }

    private BigDecimal tinhSoTienGiam(PhieuGiamGia pgg, BigDecimal tongTienHang) {
        BigDecimal giam;

        if (Boolean.FALSE.equals(pgg.getLoaiPhieuGiamGia())) {
            BigDecimal percent = pgg.getGiaTriGiamGia();
            if (percent == null || percent.signum() <= 0) return BigDecimal.ZERO;

            giam = tongTienHang.multiply(percent)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            giam = pgg.getGiaTriGiamGia();
            if (giam == null || giam.signum() <= 0) return BigDecimal.ZERO;
            giam = giam.setScale(2, RoundingMode.HALF_UP);
        }

        if (pgg.getSoTienGiamToiDa() != null && pgg.getSoTienGiamToiDa().signum() > 0) {
            if (giam.compareTo(pgg.getSoTienGiamToiDa()) > 0) giam = pgg.getSoTienGiamToiDa();
        }

        if (giam.compareTo(tongTienHang) > 0) giam = tongTienHang;
        if (giam.signum() < 0) giam = BigDecimal.ZERO;

        return giam;
    }

    private HoaDonResponse toResponse(HoaDon e) {
        return mapper.map(e, HoaDonResponse.class);
    }
}
