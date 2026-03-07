-- Migration: Nghiệp vụ bán hàng online phức tạp
-- Ngày: 2026-03-05

-- 1. Thêm cột giá cũ vào hoa_don_chi_tiet
ALTER TABLE hoa_don_chi_tiet
    ADD don_gia_cu DECIMAL(18, 2) NULL;

-- 2. Thêm cột actor vào lich_su_hoa_don
ALTER TABLE lich_su_hoa_don
    ADD nguoi_thuc_hien INT NULL,
    ADD loai_nguoi_thuc_hien VARCHAR(20) NULL;

-- 3. Thêm cột loại thanh toán và trạng thái hoàn phí vào hoa_don
ALTER TABLE hoa_don
    ADD loai_thanh_toan INT NULL,         -- 0=tiền mặt/COD, 1=chuyển khoản
    ADD da_hoan_phi BIT NULL;             -- NULL=không cần hoàn, 0=chờ hoàn, 1=đã hoàn

-- Ghi chú:
-- TrangThaiHoaDon đã thêm HUY_DON (6) vào Java enum
-- Trạng thái 6 là trạng thái terminal (cùng với 5 = HOAN_THANH)
-- Validate trong LichSuHoaDonService.validate() đã cho phép 1..7, nên 6 hợp lệ
