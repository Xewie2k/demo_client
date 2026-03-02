USE DATN_SevenStrike
-- ── 1. Tạo bảng phien_chat ───────────────────────────────────
CREATE TABLE phien_chat (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    khach_hang_id       INT NULL,
    nhan_vien_id        INT NULL,
    ten_khach           NVARCHAR(255) NULL,
    loai                NVARCHAR(20)  NOT NULL DEFAULT 'KHACH_HANG',  -- KHACH_HANG | NOI_BO
    trang_thai          NVARCHAR(50)  NULL,
    thoi_gian_bat_dau   DATETIME2     NULL,
    thoi_gian_ket_thuc  DATETIME2     NULL,

    CONSTRAINT FK_phienchat_khachhang FOREIGN KEY (khach_hang_id) REFERENCES khach_hang(id),
    CONSTRAINT FK_phienchat_nhanvien  FOREIGN KEY (nhan_vien_id)  REFERENCES nhan_vien(id)
);

-- ── 2. Tạo bảng tin_nhan ─────────────────────────────────────
CREATE TABLE tin_nhan (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    phien_chat_id   INT           NOT NULL,
    nguoi_gui       NVARCHAR(20)  NULL,   -- BOT | KHACH | NHAN_VIEN
    ten_nguoi_gui   NVARCHAR(255) NULL,
    noi_dung        NVARCHAR(MAX) NULL,
    thoi_gian       DATETIME2     NULL,

    CONSTRAINT FK_tinnhan_phienchat FOREIGN KEY (phien_chat_id) REFERENCES phien_chat(id)
);

-- ── 3. Index tăng tốc query ──────────────────────────────────
CREATE INDEX IDX_phienchat_trangthai    ON phien_chat(trang_thai);
CREATE INDEX IDX_phienchat_loai         ON phien_chat(loai);
CREATE INDEX IDX_phienchat_thoigian     ON phien_chat(thoi_gian_bat_dau DESC);
CREATE INDEX IDX_tinnhan_phienchat      ON tin_nhan(phien_chat_id);