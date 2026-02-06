package com.example.datn_sevenstrike.service;

import com.example.datn_sevenstrike.dto.client.*;
import com.example.datn_sevenstrike.entity.*;
import com.example.datn_sevenstrike.constants.TrangThaiHoaDon;
import com.example.datn_sevenstrike.exception.BadRequestEx;
import com.example.datn_sevenstrike.exception.NotFoundEx;
import com.example.datn_sevenstrike.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BanHangOnlineService {

    private final SanPhamRepository sanPhamRepo;
    private final ChiTietSanPhamRepository ctspRepo;
    private final AnhChiTietSanPhamRepository anhRepo;
    private final PhieuGiamGiaRepository phieuRepo;
    private final HoaDonRepository hoaDonRepo;
    private final HoaDonChiTietRepository hdctRepo;
    private final LichSuHoaDonRepository lsHdRepo;

    // List all products for client
    @Transactional(readOnly = true)
    public List<ProductClientDTO> getProducts() {
        List<SanPham> list = sanPhamRepo.findAllByXoaMemFalseAndTrangThaiKinhDoanhTrueOrderByIdDesc();
        return list.stream().map(this::mapToProductClientDTO).collect(Collectors.toList());
    }

    // Detail product
    @Transactional(readOnly = true)
    public ProductDetailClientDTO getProductDetail(Integer id) {
        SanPham sp = sanPhamRepo.findByIdAndXoaMemFalse(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy sản phẩm id=" + id));
        
        return mapToProductDetailClientDTO(sp);
    }

    // Vouchers
    @Transactional(readOnly = true)
    public List<VoucherClientDTO> getVouchers() {
        LocalDate today = LocalDate.now();
        return phieuRepo.findAllByXoaMemFalseOrderByIdDesc().stream()
                .filter(p -> Boolean.TRUE.equals(p.getTrangThai()) && p.getSoLuongSuDung() > 0)
                .filter(p -> !p.getNgayBatDau().isAfter(today) && !p.getNgayKetThuc().isBefore(today))
                .map(p -> VoucherClientDTO.builder()
                        .id(p.getId())
                        .maPhieuGiamGia(p.getMaPhieuGiamGia())
                        .tenPhieuGiamGia(p.getTenPhieuGiamGia())
                        .loaiPhieuGiamGia(p.getLoaiPhieuGiamGia())
                        .giaTriGiamGia(p.getGiaTriGiamGia())
                        .soTienGiamToiDa(p.getSoTienGiamToiDa())
                        .hoaDonToiThieu(p.getHoaDonToiThieu())
                        .ngayKetThuc(p.getNgayKetThuc())
                        .build())
                .collect(Collectors.toList());
    }

    // My Orders
    @Transactional(readOnly = true)
    public List<ClientOrderHistoryDTO> getOrdersByCustomerId(Integer customerId) {
        if (customerId == null) return new ArrayList<>();
        List<HoaDon> list = hoaDonRepo.findAllByIdKhachHangAndXoaMemFalseOrderByIdDesc(customerId);
        return list.stream().map(this::mapToClientOrderHistoryDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientOrderDetailDTO getOrderDetail(Integer id) {
        HoaDon hd = hoaDonRepo.findById(id)
                .orElseThrow(() -> new NotFoundEx("Không tìm thấy hóa đơn id=" + id));

        // Items
        List<HoaDonChiTiet> details = hdctRepo.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(hd.getId());
        List<ClientOrderItemDTO> items = details.stream().map(this::mapToClientOrderItemDTO).collect(Collectors.toList());

        // Timeline
        List<LichSuHoaDon> history = lsHdRepo.findAllByIdHoaDonAndXoaMemFalseOrderByThoiGianAsc(hd.getId());

        List<ClientTimelineDTO> timeline = new ArrayList<>();
        // We want to show all possible statuses or just the history?
        // Usually tracking shows the flow: Placed -> Confirmed -> Shipping -> Delivered.
        // For simplicity, let's just return what happened.
        for (LichSuHoaDon h : history) {
            TrangThaiHoaDon statusEnum = TrangThaiHoaDon.fromCode(h.getTrangThai());
            timeline.add(ClientTimelineDTO.builder()
                    .status(statusEnum != null ? statusEnum.label : "Unknown")
                    .description(h.getGhiChu())
                    .time(h.getThoiGian())
                    .completed(true)
                    .active(h.getTrangThai().equals(hd.getTrangThaiHienTai()))
                    .build());
        }

        TrangThaiHoaDon currentStatus = TrangThaiHoaDon.fromCode(hd.getTrangThaiHienTai());

        return ClientOrderDetailDTO.builder()
                .id(hd.getId())
                .maHoaDon(hd.getMaHoaDon())
                .ngayTao(hd.getNgayTao())
                .trangThai(currentStatus != null ? currentStatus.label : "")
                .tenNguoiNhan(hd.getTenKhachHang())
                .soDienThoai(hd.getSoDienThoaiKhachHang())
                .diaChi(hd.getDiaChiKhachHang())
                .tamTinh(hd.getTongTien())
                .phiVanChuyen(hd.getPhiVanChuyen())
                .giamGia(hd.getTongTien().subtract(hd.getTongTienSauGiam()))
                .tongTien(hd.getTongTienSauGiam())
                .items(items)
                .timeline(timeline)
                .daThanhToan(hd.getNgayThanhToan() != null)
                .phuongThucThanhToan("Thanh toán khi nhận hàng") // Placeholder logic
                .build();
    }

    private ClientOrderHistoryDTO mapToClientOrderHistoryDTO(HoaDon hd) {
        List<HoaDonChiTiet> details = hdctRepo.findAllByIdHoaDonAndXoaMemFalseOrderByIdAsc(hd.getId());
        String thumb = null;
        String firstProductName = "";
        
        if (!details.isEmpty()) {
             HoaDonChiTiet first = details.get(0);
             ChiTietSanPham ctsp = ctspRepo.findById(first.getIdChiTietSanPham()).orElse(null);
             if (ctsp != null && ctsp.getSanPham() != null) {
                 firstProductName = ctsp.getSanPham().getTenSanPham();
                 // find thumb
                 List<AnhChiTietSanPham> imgs = anhRepo.findAllByIdChiTietSanPhamAndXoaMemFalseOrderByIdDesc(ctsp.getId());
                 if (!imgs.isEmpty()) thumb = imgs.get(0).getDuongDanAnh();
             }
        }
        
        TrangThaiHoaDon status = TrangThaiHoaDon.fromCode(hd.getTrangThaiHienTai());

        return ClientOrderHistoryDTO.builder()
                .id(hd.getId())
                .maHoaDon(hd.getMaHoaDon())
                .ngayTao(hd.getNgayTao())
                .trangThai(status != null ? status.label : "")
                .tongTien(hd.getTongTienSauGiam())
                .soLuongSanPham(details.size())
                .sanPhamDaiDien(firstProductName)
                .anhDaiDien(thumb)
                .build();
    }

    private ClientOrderItemDTO mapToClientOrderItemDTO(HoaDonChiTiet item) {
        ChiTietSanPham ctsp = ctspRepo.findById(item.getIdChiTietSanPham()).orElse(null);
        String name = "";
        String thumb = null;
        String variant = "";
        
        if (ctsp != null) {
            if (ctsp.getSanPham() != null) name = ctsp.getSanPham().getTenSanPham();
            variant = (ctsp.getMauSac() != null ? ctsp.getMauSac().getTenMauSac() : "") + " - " + 
                      (ctsp.getKichThuoc() != null ? ctsp.getKichThuoc().getTenKichThuoc() : "");
            
            List<AnhChiTietSanPham> imgs = anhRepo.findAllByIdChiTietSanPhamAndXoaMemFalseOrderByIdDesc(ctsp.getId());
             if (!imgs.isEmpty()) thumb = imgs.get(0).getDuongDanAnh();
        }

        return ClientOrderItemDTO.builder()
                .tenSanPham(name)
                .anhDaiDien(thumb)
                .phanLoai(variant)
                .donGia(item.getDonGia())
                .soLuong(item.getSoLuong())
                .thanhTien(item.getDonGia().multiply(BigDecimal.valueOf(item.getSoLuong())))
                .build();
    }

    // Order
    @Transactional
    public OrderResponse createOrder(OrderRequest req) {
        // 1. Validate
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BadRequestEx("Giỏ hàng trống");
        }

        BigDecimal tongTien = BigDecimal.ZERO;
        List<HoaDonChiTiet> hdcts = new ArrayList<>();

        // Check Items & Stock
        for (OrderItemRequest itemReq : req.getItems()) {
            ChiTietSanPham ctsp = ctspRepo.findByIdAndXoaMemFalse(itemReq.getIdChiTietSanPham())
                    .orElseThrow(() -> new BadRequestEx("Sản phẩm không tồn tại id=" + itemReq.getIdChiTietSanPham()));
            
            if (ctsp.getSoLuong() < itemReq.getSoLuong()) {
                 throw new BadRequestEx("Sản phẩm không đủ hàng");
            }

            BigDecimal price = ctsp.getGiaBan() != null ? ctsp.getGiaBan() : ctsp.getGiaNiemYet();
            BigDecimal subTotal = price.multiply(BigDecimal.valueOf(itemReq.getSoLuong()));
            tongTien = tongTien.add(subTotal);

            // Deduct stock
            ctsp.setSoLuong(ctsp.getSoLuong() - itemReq.getSoLuong());
            ctspRepo.save(ctsp);

            HoaDonChiTiet hdct = HoaDonChiTiet.builder()
                    .idChiTietSanPham(ctsp.getId())
                    .soLuong(itemReq.getSoLuong())
                    .donGia(price)
                    .xoaMem(false)
                    .build();
            hdcts.add(hdct);
        }

        // Voucher
        BigDecimal tienGiam = BigDecimal.ZERO;
        PhieuGiamGia voucher = null;
        if (req.getIdPhieuGiamGia() != null) {
            voucher = phieuRepo.findByIdAndXoaMemFalse(req.getIdPhieuGiamGia())
                    .orElseThrow(() -> new BadRequestEx("Voucher không tồn tại"));
            
             LocalDate today = LocalDate.now();
             if (!Boolean.TRUE.equals(voucher.getTrangThai()) || 
                 voucher.getSoLuongSuDung() <= 0 || 
                 voucher.getNgayBatDau().isAfter(today) || 
                 voucher.getNgayKetThuc().isBefore(today)) {
                 throw new BadRequestEx("Voucher không khả dụng");
             }
             
             if (voucher.getHoaDonToiThieu() != null && tongTien.compareTo(voucher.getHoaDonToiThieu()) < 0) {
                  throw new BadRequestEx("Đơn hàng chưa đạt giá trị tối thiểu của voucher");
             }

             if (Boolean.TRUE.equals(voucher.getLoaiPhieuGiamGia()) && voucher.getGiaTriGiamGia() != null) {
                 // Percent
                 tienGiam = tongTien.multiply(voucher.getGiaTriGiamGia()).divide(BigDecimal.valueOf(100));
                 if (voucher.getSoTienGiamToiDa() != null && tienGiam.compareTo(voucher.getSoTienGiamToiDa()) > 0) {
                     tienGiam = voucher.getSoTienGiamToiDa();
                 }
             } else {
                 // Amount
                 tienGiam = voucher.getSoTienGiamToiDa();
             }
             
             if (tienGiam.compareTo(tongTien) > 0) tienGiam = tongTien;

             voucher.setSoLuongSuDung(voucher.getSoLuongSuDung() - 1);
             phieuRepo.save(voucher);
        }

        BigDecimal thanhTien = tongTien.subtract(tienGiam); // Ship free

        // Create HoaDon
        HoaDon hd = HoaDon.builder()
                .tenKhachHang(req.getTenKhachHang())
                .soDienThoaiKhachHang(req.getSoDienThoai())
                .diaChiKhachHang(req.getDiaChi())
                .emailKhachHang(req.getEmail())
                .ghiChu(req.getGhiChu())
                .idPhieuGiamGia(voucher != null ? voucher.getId() : null)
                .tongTien(tongTien)
                .tongTienSauGiam(thanhTien)
                .phiVanChuyen(BigDecimal.ZERO)
                .loaiDon(true)
                .trangThaiHienTai(1)
                .ngayTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .xoaMem(false)
                .build();
        
        hd = hoaDonRepo.save(hd);

        // Save HDCT
        for (HoaDonChiTiet item : hdcts) {
            item.setIdHoaDon(hd.getId());
            hdctRepo.save(item);
        }

        // History
        LichSuHoaDon ls = LichSuHoaDon.builder()
                .idHoaDon(hd.getId())
                .trangThai(1)
                .ghiChu("Khách hàng đặt hàng online")
                .xoaMem(false)
                .build();
        lsHdRepo.save(ls);

        return OrderResponse.builder()
                .id(hd.getId())
                .maHoaDon(hd.getMaHoaDon())
                .message("Đặt hàng thành công")
                .build();
    }


    private ProductClientDTO mapToProductClientDTO(SanPham sp) {
        List<ChiTietSanPham> variants = ctspRepo.findAllByIdSanPhamAndXoaMemFalseOrderByIdDesc(sp.getId());
        
        BigDecimal min = variants.stream().map(v -> v.getGiaBan() != null ? v.getGiaBan() : v.getGiaNiemYet()).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        BigDecimal max = variants.stream().map(v -> v.getGiaBan() != null ? v.getGiaBan() : v.getGiaNiemYet()).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);

        String thumb = null;
        // Find main image
        for (ChiTietSanPham v : variants) {
            List<AnhChiTietSanPham> imgs = anhRepo.findAllByIdChiTietSanPhamAndXoaMemFalseOrderByIdDesc(v.getId());
            for (AnhChiTietSanPham img : imgs) {
                if (Boolean.TRUE.equals(img.getLaAnhDaiDien())) {
                    thumb = img.getDuongDanAnh();
                    break;
                }
            }
            if (thumb == null && !imgs.isEmpty()) thumb = imgs.get(0).getDuongDanAnh();
            if (thumb != null) break;
        }

        return ProductClientDTO.builder()
                .id(sp.getId())
                .tenSanPham(sp.getTenSanPham())
                .tenThuongHieu(sp.getThuongHieu() != null ? sp.getThuongHieu().getTenThuongHieu() : "")
                .giaThapNhat(min)
                .giaCaoNhat(max)
                .anhDaiDien(thumb)
                .moTaNgan(sp.getMoTaNgan())
                .build();
    }

    private ProductDetailClientDTO mapToProductDetailClientDTO(SanPham sp) {
        List<ChiTietSanPham> variants = ctspRepo.findAllByIdSanPhamAndXoaMemFalseOrderByIdDesc(sp.getId());
        
        BigDecimal min = variants.stream().map(v -> v.getGiaBan() != null ? v.getGiaBan() : v.getGiaNiemYet()).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        BigDecimal max = variants.stream().map(v -> v.getGiaBan() != null ? v.getGiaBan() : v.getGiaNiemYet()).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);

        String thumb = null;
        Set<String> imgSet = new LinkedHashSet<>();
        List<VariantClientDTO> variantDTOs = new ArrayList<>();

        for (ChiTietSanPham v : variants) {
            List<AnhChiTietSanPham> imgs = anhRepo.findAllByIdChiTietSanPhamAndXoaMemFalseOrderByIdDesc(v.getId());
            for (AnhChiTietSanPham img : imgs) {
                imgSet.add(img.getDuongDanAnh());
                if (Boolean.TRUE.equals(img.getLaAnhDaiDien()) && thumb == null) {
                    thumb = img.getDuongDanAnh();
                }
            }
            if (thumb == null && !imgs.isEmpty()) thumb = imgs.get(0).getDuongDanAnh();

            variantDTOs.add(VariantClientDTO.builder()
                    .id(v.getId())
                    .tenMauSac(v.getMauSac() != null ? v.getMauSac().getTenMauSac() : "")
                    .tenKichThuoc(v.getKichThuoc() != null ? v.getKichThuoc().getTenKichThuoc() : "")
                    .giaBan(v.getGiaBan() != null ? v.getGiaBan() : v.getGiaNiemYet())
                    .soLuong(v.getSoLuong())
                    .build());
        }
        
        if (thumb == null && !imgSet.isEmpty()) thumb = imgSet.iterator().next();

        return ProductDetailClientDTO.builder()
                .id(sp.getId())
                .tenSanPham(sp.getTenSanPham())
                .tenThuongHieu(sp.getThuongHieu() != null ? sp.getThuongHieu().getTenThuongHieu() : "")
                .giaThapNhat(min)
                .giaCaoNhat(max)
                .anhDaiDien(thumb)
                .moTaNgan(sp.getMoTaNgan())
                .maSanPham(sp.getMaSanPham())
                .moTaChiTiet(sp.getMoTaChiTiet())
                .tenXuatXu(sp.getXuatXu() != null ? sp.getXuatXu().getTenXuatXu() : "")
                .tenViTriThiDau(sp.getViTriThiDau() != null ? sp.getViTriThiDau().getTenViTri() : "")
                .tenPhongCachChoi(sp.getPhongCachChoi() != null ? sp.getPhongCachChoi().getTenPhongCach() : "")
                .tenCoGiay(sp.getCoGiay() != null ? sp.getCoGiay().getTenCoGiay() : "")
                .tenChatLieu(sp.getChatLieu() != null ? sp.getChatLieu().getTenChatLieu() : "")
                .images(new ArrayList<>(imgSet))
                .variants(variantDTOs)
                .build();
    }
}
