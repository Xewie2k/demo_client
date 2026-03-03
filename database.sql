if db_id('DATN_SevenStrike') is null
begin
    create database DATN_SevenStrike;
end
go
 
use DATN_SevenStrike;
go

/* =========================================================
   1) DANH MỤC CHUNG (THUỘC TÍNH)
   ========================================================= */

create table dbo.xuat_xu (
    id int identity(1,1) primary key,
    ma_xuat_xu as 'XX' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_xuat_xu nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.thuong_hieu (
    id int identity(1,1) primary key,
    ma_thuong_hieu as 'TH' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_thuong_hieu nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.mau_sac (
    id int identity(1,1) primary key,
    ma_mau_sac as 'MS' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_mau_sac nvarchar(255) not null,

    ma_mau_hex varchar(7) null, -- #RRGGBB cho FE render
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0,

    constraint CK_mau_sac_hex_format
    check (ma_mau_hex is null or (len(ma_mau_hex) = 7 and left(ma_mau_hex, 1) = '#'))
);
go

create table dbo.kich_thuoc (
    id int identity(1,1) primary key,
    ma_kich_thuoc as 'KT' + right('00000' + cast(id as varchar(5)), 5) persisted,

    ten_kich_thuoc nvarchar(50) not null,
    gia_tri_kich_thuoc decimal(4,1) null,

    trang_thai bit not null default 1,
    xoa_mem bit not null default 0,

    constraint CK_kich_thuoc_range_bong_da_nam
    check (gia_tri_kich_thuoc is null or (gia_tri_kich_thuoc between 38.0 and 45.0))
);
go

create table dbo.loai_san (
    id int identity(1,1) primary key,
    ma_loai_san as 'LS' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_loai_san nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.vi_tri_thi_dau (
    id int identity(1,1) primary key,
    ma_vi_tri as 'VT' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_vi_tri nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.phong_cach_choi (
    id int identity(1,1) primary key,
    ma_phong_cach as 'PC' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_phong_cach nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.co_giay (
    id int identity(1,1) primary key,
    ma_co_giay as 'CG' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_co_giay nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.form_chan (
    id int identity(1,1) primary key,
    ma_form_chan as 'FC' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_form_chan nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.chat_lieu (
    id int identity(1,1) primary key,
    ma_chat_lieu as 'CL' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_chat_lieu nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

/* =========================================================
   2) PHÂN QUYỀN - NHÂN SỰ
   ========================================================= */

create table dbo.quyen_han (
    id int identity(1,1) primary key,
    ma_quyen_han as 'QH' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_quyen_han nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.nhan_vien (
    id int identity(1,1) primary key,
    id_quyen_han int not null,

    ma_nhan_vien as 'NV' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_nhan_vien nvarchar(255) not null,
    ten_tai_khoan varchar(255) not null,
    mat_khau varchar(255) not null,
    email varchar(255) null,
    so_dien_thoai varchar(12) null,
    anh_nhan_vien nvarchar(max) null,
    ngay_sinh date null,
    ghi_chu nvarchar(255) null,

    thanh_pho nvarchar(255) null,
    quan nvarchar(255) null,
    phuong nvarchar(255) null,
    dia_chi_cu_the varchar(255) null,

    trang_thai bit not null default 1,
    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_nv_qh foreign key (id_quyen_han) references dbo.quyen_han(id)
);
go

/* =========================================================
   3) KHÁCH HÀNG - ĐỊA CHỈ
   ========================================================= */

create table dbo.khach_hang (
    id int identity(1,1) primary key,
    ma_khach_hang as 'KH' + right('00000' + cast(id as varchar(5)), 5) persisted,

    ten_khach_hang nvarchar(255) not null,
    ten_tai_khoan varchar(255) not null,
    mat_khau varchar(255) not null,
    email varchar(255) null,
    so_dien_thoai varchar(12) null,
    gioi_tinh bit null,
    ngay_sinh date null,

    trang_thai bit not null default 1,
    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,
	anh_dai_dien varchar(500) null
);
go

create table dbo.dia_chi_khach_hang (
    id int identity(1,1) primary key,
    id_khach_hang int not null,

    ma_dia_chi as 'DC' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_dia_chi nvarchar(255) not null,

    thanh_pho nvarchar(255) null,
    quan nvarchar(255) null,
    phuong nvarchar(255) null,
    dia_chi_cu_the varchar(255) null,

    mac_dinh bit not null default 0,
    xoa_mem bit not null default 0,

    constraint FK_dckh_kh foreign key (id_khach_hang) references dbo.khach_hang(id)
);
go

/* =========================================================
   4) SẢN PHẨM - BIẾN THỂ - ẢNH
   ========================================================= */

create table dbo.san_pham (
    id int identity(1,1) primary key,

    id_thuong_hieu int not null,
    id_xuat_xu int null,

    id_vi_tri_thi_dau int null,
    id_phong_cach_choi int null,

    id_co_giay int null,
    id_chat_lieu int null,

    ma_san_pham as 'SP' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_san_pham nvarchar(255) not null,
    mo_ta_ngan nvarchar(500) null,
    mo_ta_chi_tiet nvarchar(max) null,

    trang_thai_kinh_doanh bit not null default 1,
    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_sp_th foreign key (id_thuong_hieu) references dbo.thuong_hieu(id),
    constraint FK_sp_xx foreign key (id_xuat_xu) references dbo.xuat_xu(id),
    constraint FK_sp_vt foreign key (id_vi_tri_thi_dau) references dbo.vi_tri_thi_dau(id),
    constraint FK_sp_pc foreign key (id_phong_cach_choi) references dbo.phong_cach_choi(id),
    constraint FK_sp_cg foreign key (id_co_giay) references dbo.co_giay(id),
    constraint FK_sp_cl foreign key (id_chat_lieu) references dbo.chat_lieu(id)
);
go

create table dbo.chi_tiet_san_pham (
    id int identity(1,1) primary key,
    id_san_pham int not null,

    id_mau_sac int not null,
    id_kich_thuoc int not null,
    id_loai_san int not null,
    id_form_chan int not null,

    ma_chi_tiet_san_pham as 'CTSP' + right('00000' + cast(id as varchar(5)), 5) persisted,

    so_luong int not null default 0 check (so_luong >= 0),
    gia_niem_yet decimal(18,2) not null check (gia_niem_yet >= 0),
    gia_ban decimal(18,2) null check (gia_ban >= 0),

    trang_thai bit not null default 1,
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_ctsp_sp foreign key (id_san_pham) references dbo.san_pham(id),
    constraint FK_ctsp_ms foreign key (id_mau_sac) references dbo.mau_sac(id),
    constraint FK_ctsp_kt foreign key (id_kich_thuoc) references dbo.kich_thuoc(id),
    constraint FK_ctsp_ls foreign key (id_loai_san) references dbo.loai_san(id),
    constraint FK_ctsp_fc foreign key (id_form_chan) references dbo.form_chan(id)
);
go

create table dbo.anh_chi_tiet_san_pham (
    id int identity(1,1) primary key,
    id_chi_tiet_san_pham int not null,
    duong_dan_anh varchar(255) not null,
    la_anh_dai_dien bit not null default 0,
    mo_ta nvarchar(255) null,
    xoa_mem bit not null default 0,

    constraint FK_anh_ctsp foreign key (id_chi_tiet_san_pham) references dbo.chi_tiet_san_pham(id)
);
go

/* =========================================================
   5) ĐỢT GIẢM GIÁ - CHI TIẾT ĐỢT
   ========================================================= */

create table dbo.dot_giam_gia (
    id int identity(1,1) primary key,
    ma_dot_giam_gia as 'DGG' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_dot_giam_gia nvarchar(255) not null,

    loai_giam_gia bit not null default 0, -- % (0)
    gia_tri_giam_gia decimal(18,2) not null check (gia_tri_giam_gia >= 0),

    ngay_bat_dau date not null,
    ngay_ket_thuc date not null,

    muc_uu_tien int not null default 0,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0,

    constraint CK_dgg_ngay check (ngay_ket_thuc >= ngay_bat_dau),
    constraint CK_dgg_chi_phan_tram check (loai_giam_gia = 0 and gia_tri_giam_gia between 0 and 100)
);
go

create table dbo.chi_tiet_dot_giam_gia (
    id int identity(1,1) primary key,
    id_dot_giam_gia int not null,
    id_chi_tiet_san_pham int not null,

    so_luong_ap_dung int null check (so_luong_ap_dung >= 0),
    gia_tri_giam_rieng decimal(18,2) null check (gia_tri_giam_rieng >= 0),
    so_tien_giam_toi_da_rieng decimal(18,2) null check (so_tien_giam_toi_da_rieng >= 0),

    trang_thai bit not null default 1,
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_ctdgg_dgg foreign key (id_dot_giam_gia) references dbo.dot_giam_gia(id),
    constraint FK_ctdgg_ctsp foreign key (id_chi_tiet_san_pham) references dbo.chi_tiet_san_pham(id)
);
go

/* =========================================================
   6) VOUCHER (PHIẾU GIẢM GIÁ) + CÁ NHÂN & CHI TIẾT
   ========================================================= */

create table dbo.phieu_giam_gia (
    id int identity(1,1) primary key,
    ma_phieu_giam_gia as 'PGG' + right('00000' + cast(id as varchar(5)), 5) persisted,

    ten_phieu_giam_gia nvarchar(255) not null,

    loai_phieu_giam_gia bit not null default 0,
    gia_tri_giam_gia decimal(18,2) not null check (gia_tri_giam_gia >= 0),
    so_tien_giam_toi_da decimal(18,2) null check (so_tien_giam_toi_da >= 0),

    hoa_don_toi_thieu decimal(18,2) null check (hoa_don_toi_thieu >= 0),
    so_luong_su_dung int not null check (so_luong_su_dung >= 0),

    ngay_bat_dau date not null,
    ngay_ket_thuc date not null,

    trang_thai bit not null default 1,

    mo_ta nvarchar(255) null,
    xoa_mem bit not null default 0,

    constraint CK_pgg_ngay check (ngay_ket_thuc >= ngay_bat_dau),
    constraint CK_pgg_phan_tram check (
        (loai_phieu_giam_gia = 0 and gia_tri_giam_gia between 0 and 100)
        or (loai_phieu_giam_gia = 1 and gia_tri_giam_gia >= 0)
    )
);
go

create table dbo.phieu_giam_gia_ca_nhan (
    id int identity(1,1) primary key,
    id_khach_hang int not null,
    id_phieu_giam_gia int not null,

    ma_phieu_giam_gia_ca_nhan as 'PGGCN' + right('00000' + cast(id as varchar(5)), 5) persisted,

    ngay_nhan date not null default cast(getdate() as date),
    da_su_dung bit not null default 0,

    xoa_mem bit not null default 0,

    da_gui_mail bit not null default 0,
    ngay_gui_mail datetime2 null,

    constraint FK_pggcn_kh foreign key (id_khach_hang) references dbo.khach_hang(id),
    constraint FK_pggcn_pgg foreign key (id_phieu_giam_gia) references dbo.phieu_giam_gia(id)
);
go

create table dbo.phieu_giam_gia_chi_tiet (
    id int identity(1,1) primary key,
    id_phieu_giam_gia int not null,
    id_khach_hang int not null,
    xoa_mem bit not null default 0,

    constraint FK_pggct_pgg foreign key (id_phieu_giam_gia) references dbo.phieu_giam_gia(id),
    constraint FK_pggct_kh foreign key (id_khach_hang) references dbo.khach_hang(id)
);
go

/* =========================================================
   7) MODULE GIAO CA (CA LÀM / LỊCH LÀM VIỆC / GIAO CA)
   ========================================================= */

create table dbo.ca_lam (
    id int identity(1,1) primary key,
    ma_ca as 'CA' + right('00000' + cast(id as varchar(5)), 5) persisted,

    ten_ca nvarchar(100) not null,
    gio_bat_dau time(0) not null,
    gio_ket_thuc time(0) not null,

    mo_ta nvarchar(255) null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0,

    constraint CK_ca_lam_gio check (gio_ket_thuc > gio_bat_dau)
);
go

create table dbo.lich_lam_viec (
    id int identity(1,1) primary key,

    id_ca_lam int not null,
    ngay_lam date not null,

    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_llv_ca foreign key (id_ca_lam) references dbo.ca_lam(id)
);
go

create table dbo.lich_lam_viec_nhan_vien (
    id int identity(1,1) primary key,

    id_lich_lam_viec int not null,
    id_nhan_vien int not null,

    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_llvnv_llv foreign key (id_lich_lam_viec) references dbo.lich_lam_viec(id),
    constraint FK_llvnv_nv foreign key (id_nhan_vien) references dbo.nhan_vien(id)
);
go

create table dbo.giao_ca (
    id int identity(1,1) primary key,
    ma_giao_ca as 'GC' + right('00000' + cast(id as varchar(5)), 5) persisted,

    id_lich_lam_viec int not null,
    id_nhan_vien int not null,

    id_giao_ca_truoc int null,

    thoi_gian_nhan_ca datetime2 not null default sysdatetime(),
    thoi_gian_ket_ca datetime2 null,

    tien_ban_giao_du_kien decimal(18,2) not null default 0,
    tien_dau_ca_nhap decimal(18,2) null,
    da_xac_nhan_tien_dau_ca bit not null default 0,

    trang_thai int not null default 0, -- 0: đang hoạt động, 1: đã đóng ca
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    ngay_tao datetime2 not null default sysdatetime(),
    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_gc_llv foreign key (id_lich_lam_viec) references dbo.lich_lam_viec(id),
    constraint FK_gc_nv foreign key (id_nhan_vien) references dbo.nhan_vien(id),
    constraint FK_gc_truoc foreign key (id_giao_ca_truoc) references dbo.giao_ca(id),

    constraint CK_gc_tien check (tien_ban_giao_du_kien >= 0 and (tien_dau_ca_nhap is null or tien_dau_ca_nhap >= 0)),
    constraint CK_gc_trang_thai check (trang_thai in (0,1)),
    constraint CK_gc_thoi_gian check (thoi_gian_ket_ca is null or thoi_gian_ket_ca >= thoi_gian_nhan_ca),

    constraint CK_gc_xac_nhan_tien check (
        da_xac_nhan_tien_dau_ca = 0
        or (tien_dau_ca_nhap is not null and tien_dau_ca_nhap = tien_ban_giao_du_kien)
    ),

    constraint CK_gc_dong_ca check (
        trang_thai = 0
        or (trang_thai = 1 and thoi_gian_ket_ca is not null)
    )
);
go

create trigger dbo.TR_gc_validate_nv_in_lich
on dbo.giao_ca
after insert, update
as
begin
    set nocount on;

    if exists (
        select 1
        from inserted i
        where i.xoa_mem = 0
          and not exists (
              select 1
              from dbo.lich_lam_viec_nhan_vien llvnv
              where llvnv.xoa_mem = 0
                and llvnv.id_lich_lam_viec = i.id_lich_lam_viec
                and llvnv.id_nhan_vien = i.id_nhan_vien
          )
    )
    begin
        raiserror(N'Nhân viên không nằm trong ca làm (lịch làm việc) nên không thể vào ca.', 16, 1);
        rollback transaction;
        return;
    end
end
go

/* =========================================================
   8) HÓA ĐƠN - HÓA ĐƠN CHI TIẾT 
   ========================================================= */

create table dbo.hoa_don (
    id int identity(1,1) primary key,

    id_khach_hang int null,
    id_nhan_vien int null,

    id_phieu_giam_gia int null,
    id_phieu_giam_gia_ca_nhan int null,

    id_giao_ca int null,

    ma_hoa_don as 'HD' + right('00000' + cast(id as varchar(5)), 5) persisted,

    loai_don bit not null default 0,

    phi_van_chuyen decimal(18,2) not null default 0 check (phi_van_chuyen >= 0),
    tong_tien decimal(18,2) not null check (tong_tien >= 0),
    tong_tien_sau_giam decimal(18,2) not null check (tong_tien_sau_giam >= 0),
    tong_tien_giam as cast((tong_tien - tong_tien_sau_giam) as decimal(18,2)) persisted,

    ten_khach_hang nvarchar(255) not null,
    dia_chi_khach_hang nvarchar(255) not null,
    so_dien_thoai_khach_hang varchar(12) not null,
    email_khach_hang varchar(255) null,

    trang_thai_hien_tai int not null default 1,

    ngay_tao datetime2 not null default sysdatetime(),
    ngay_thanh_toan datetime2 null,
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_hd_kh foreign key (id_khach_hang) references dbo.khach_hang(id),
    constraint FK_hd_nv foreign key (id_nhan_vien) references dbo.nhan_vien(id),
    constraint FK_hd_pgg foreign key (id_phieu_giam_gia) references dbo.phieu_giam_gia(id),
    constraint FK_hd_pggcn foreign key (id_phieu_giam_gia_ca_nhan) references dbo.phieu_giam_gia_ca_nhan(id),
    constraint FK_hd_giao_ca foreign key (id_giao_ca) references dbo.giao_ca(id),

    constraint CK_hd_voucher_ca_nhan check (
        id_phieu_giam_gia_ca_nhan is null
        or (id_khach_hang is not null and id_phieu_giam_gia is not null)
    ),

    constraint CK_hd_thanh_toan check (ngay_thanh_toan is null or ngay_thanh_toan >= ngay_tao),
    constraint CK_hd_tien check (tong_tien_sau_giam <= tong_tien),

    constraint CK_hd_trang_thai_code check (trang_thai_hien_tai in (1,2,3,4,5))
);
go

create table dbo.hoa_don_chi_tiet (
    id int identity(1,1) primary key,
    id_hoa_don int not null,
    id_chi_tiet_san_pham int not null,

    ma_hoa_don_chi_tiet as 'HDCT' + right('00000' + cast(id as varchar(5)), 5) persisted,

    so_luong int not null check (so_luong > 0),
    don_gia decimal(18,2) not null check (don_gia >= 0),

    thanh_tien as cast((so_luong * don_gia) as decimal(18,2)) persisted,

    ghi_chu nvarchar(255) null,
    xoa_mem bit not null default 0,

    constraint FK_hdct_hd foreign key (id_hoa_don) references dbo.hoa_don(id),
    constraint FK_hdct_ctsp foreign key (id_chi_tiet_san_pham) references dbo.chi_tiet_san_pham(id)
);
go

create trigger dbo.TR_hd_sync_nhan_vien_by_giao_ca
on dbo.hoa_don
after insert, update
as
begin
    set nocount on;

    if exists (
        select 1
        from inserted i
        join dbo.giao_ca gc on gc.id = i.id_giao_ca
        where i.id_giao_ca is not null
          and i.xoa_mem = 0
          and gc.xoa_mem = 0
          and i.id_nhan_vien is not null
          and i.id_nhan_vien <> gc.id_nhan_vien
    )
    begin
        raiserror(N'Hóa đơn đang gán giao ca nhưng nhân viên của hóa đơn không khớp nhân viên trong giao ca.', 16, 1);
        rollback transaction;
        return;
    end

    update hd
    set hd.id_nhan_vien = gc.id_nhan_vien
    from dbo.hoa_don hd
    join inserted i on i.id = hd.id
    join dbo.giao_ca gc on gc.id = i.id_giao_ca
    where i.id_giao_ca is not null
      and i.xoa_mem = 0
      and gc.xoa_mem = 0
      and i.id_nhan_vien is null;
end
go

/* =========================================================
   9) THANH TOÁN
   ========================================================= */

create table dbo.phuong_thuc_thanh_toan (
    id int identity(1,1) primary key,
    ma_phuong_thuc_thanh_toan as 'PTTT' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_phuong_thuc_thanh_toan nvarchar(255) not null,
    nha_cung_cap nvarchar(50) null,

    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.giao_dich_thanh_toan (
    id int identity(1,1) primary key,
    id_hoa_don int not null,
    id_phuong_thuc_thanh_toan int not null,

    ma_giao_dich_thanh_toan as 'GDTT' + right('00000' + cast(id as varchar(5)), 5) persisted,

    so_tien decimal(18,2) not null check (so_tien > 0),
    trang_thai nvarchar(30) not null default N'khoi_tao',

    ma_yeu_cau nvarchar(100) null,
    ma_giao_dich_ngoai nvarchar(100) null,
    ma_tham_chieu nvarchar(100) null,

    duong_dan_thanh_toan nvarchar(500) null,
    du_lieu_qr nvarchar(max) null,
    thoi_gian_het_han datetime2 null,

    du_lieu_phan_hoi nvarchar(max) null,
    thoi_gian_tao datetime2 not null default sysdatetime(),
    thoi_gian_cap_nhat datetime2 null,
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    constraint FK_gdtt_hd foreign key (id_hoa_don) references dbo.hoa_don(id),
    constraint FK_gdtt_pttt foreign key (id_phuong_thuc_thanh_toan) references dbo.phuong_thuc_thanh_toan(id)
);
go

/* =========================================================
   10) LỊCH SỬ HÓA ĐƠN (chốt 1..5)
   ========================================================= */

create table dbo.lich_su_hoa_don (
    id int identity(1,1) primary key,
    id_hoa_don int not null,

    trang_thai int not null,

    thoi_gian datetime2 not null default sysdatetime(),
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    constraint FK_lshd_hd foreign key (id_hoa_don) references dbo.hoa_don(id),
    constraint CK_lshd_trang_thai_code check (trang_thai in (1,2,3,4,5))
);
go

/* =========================================================
   11) AUTHORIZATION THEO CHỨC NĂNG
   ========================================================= */

create table dbo.chuc_nang (
    id int identity(1,1) primary key,
    ma_chuc_nang varchar(50) not null,
    ten_chuc_nang nvarchar(255) not null,
    mo_ta nvarchar(255) null,

    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table dbo.quyen_han_chuc_nang (
    id int identity(1,1) primary key,
    id_quyen_han int not null,
    id_chuc_nang int not null,

    xoa_mem bit not null default 0,

    constraint FK_qhcn_qh foreign key (id_quyen_han) references dbo.quyen_han(id),
    constraint FK_qhcn_cn foreign key (id_chuc_nang) references dbo.chuc_nang(id)
);
go

/* =========================================================
   12) INDEX / RÀNG BUỘC (FINAL)
   ========================================================= */

create unique index UX_ctsp_variant_alive
on dbo.chi_tiet_san_pham(id_san_pham, id_mau_sac, id_kich_thuoc, id_loai_san, id_form_chan)
where xoa_mem = 0;
go

create unique index UX_dckh_mac_dinh_alive
on dbo.dia_chi_khach_hang(id_khach_hang)
where mac_dinh = 1 and xoa_mem = 0;
go

create unique index UX_anh_ctsp_dai_dien_alive
on dbo.anh_chi_tiet_san_pham(id_chi_tiet_san_pham)
where la_anh_dai_dien = 1 and xoa_mem = 0;
go

create unique index UX_pggcn_alive
on dbo.phieu_giam_gia_ca_nhan(id_khach_hang, id_phieu_giam_gia)
where xoa_mem = 0;
go

create unique index UX_pggct_alive
on dbo.phieu_giam_gia_chi_tiet(id_khach_hang, id_phieu_giam_gia)
where xoa_mem = 0;
go

create unique index UX_nv_ten_tai_khoan_alive
on dbo.nhan_vien(ten_tai_khoan)
where xoa_mem = 0;
go

create unique index UX_nv_email_alive
on dbo.nhan_vien(email)
where xoa_mem = 0 and email is not null;
go

create unique index UX_kh_ten_tai_khoan_alive
on dbo.khach_hang(ten_tai_khoan)
where xoa_mem = 0;
go

create unique index UX_kh_email_alive
on dbo.khach_hang(email)
where xoa_mem = 0 and email is not null;
go

create unique index UX_ctdgg_alive
on dbo.chi_tiet_dot_giam_gia(id_dot_giam_gia, id_chi_tiet_san_pham)
where xoa_mem = 0;
go

alter table dbo.phieu_giam_gia_ca_nhan
add constraint UQ_pggcn_combo unique (id, id_khach_hang, id_phieu_giam_gia);
go

alter table dbo.hoa_don
add constraint FK_hd_pggcn_combo
foreign key (id_phieu_giam_gia_ca_nhan, id_khach_hang, id_phieu_giam_gia)
references dbo.phieu_giam_gia_ca_nhan(id, id_khach_hang, id_phieu_giam_gia);
go

create index IX_sp_ma_sp_alive
on dbo.san_pham(ma_san_pham)
where xoa_mem = 0;
go

create index IX_ctsp_ma_ctsp_alive
on dbo.chi_tiet_san_pham(ma_chi_tiet_san_pham)
where xoa_mem = 0;
go

create unique index UX_mau_sac_hex_alive
on dbo.mau_sac(ma_mau_hex)
where xoa_mem = 0 and ma_mau_hex is not null;
go

create unique index UX_kich_thuoc_value_alive
on dbo.kich_thuoc(gia_tri_kich_thuoc)
where xoa_mem = 0 and gia_tri_kich_thuoc is not null;
go

create index IX_ctsp_pick_thumb
on dbo.chi_tiet_san_pham(id_san_pham, trang_thai, so_luong, id)
where xoa_mem = 0;
go

create index IX_anh_ctsp_dai_dien_pick
on dbo.anh_chi_tiet_san_pham(id_chi_tiet_san_pham)
include (duong_dan_anh)
where xoa_mem = 0 and la_anh_dai_dien = 1;
go

create index IX_pggcn_gui_mail_alive
on dbo.phieu_giam_gia_ca_nhan(id_phieu_giam_gia, da_gui_mail, id_khach_hang)
where xoa_mem = 0;
go

create unique index UX_llv_ca_ngay_alive
on dbo.lich_lam_viec(id_ca_lam, ngay_lam)
where xoa_mem = 0;
go

create index IX_llv_ngay_alive
on dbo.lich_lam_viec(ngay_lam, id_ca_lam, id)
where xoa_mem = 0;
go

create unique index UX_llvnv_alive
on dbo.lich_lam_viec_nhan_vien(id_lich_lam_viec, id_nhan_vien)
where xoa_mem = 0;
go

create index IX_llvnv_nv_alive
on dbo.lich_lam_viec_nhan_vien(id_nhan_vien, id_lich_lam_viec)
where xoa_mem = 0;
go

create unique index UX_gc_nv_dang_hoat_dong_alive
on dbo.giao_ca(id_nhan_vien)
where xoa_mem = 0 and trang_thai = 0 and thoi_gian_ket_ca is null;
go

create index IX_gc_llv_alive
on dbo.giao_ca(id_lich_lam_viec, trang_thai, id)
where xoa_mem = 0;
go

create index IX_hd_giao_ca_alive
on dbo.hoa_don(id_giao_ca, ngay_tao, id)
where xoa_mem = 0;
go

create index IX_lshd_hd_time_alive
on dbo.lich_su_hoa_don(id_hoa_don, thoi_gian, id)
where xoa_mem = 0;
go

create index IX_gdtt_hd_time_alive
on dbo.giao_dich_thanh_toan(id_hoa_don, thoi_gian_tao, id)
where xoa_mem = 0;
go

create index IX_hdct_hd_alive
on dbo.hoa_don_chi_tiet(id_hoa_don, id_chi_tiet_san_pham, id)
where xoa_mem = 0;
go

create index IX_hd_trang_thai_ngay_alive
on dbo.hoa_don(trang_thai_hien_tai, ngay_tao, id)
where xoa_mem = 0;
go

create unique index UX_chuc_nang_ma_alive
on dbo.chuc_nang(ma_chuc_nang)
where xoa_mem = 0;
go

create unique index UX_qhcn_alive
on dbo.quyen_han_chuc_nang(id_quyen_han, id_chuc_nang)
where xoa_mem = 0;
go

/* =========================================================
   13) VIEW - THUMBNAIL SẢN PHẨM ONLINE
   ========================================================= */

create or alter view dbo.vw_san_pham_thumb
as
select
    sp.id as id_san_pham,
    sp.ma_san_pham,
    sp.ten_san_pham,
    sp.trang_thai_kinh_doanh,

    pick.id_ctsp_thumb,
    pick.duong_dan_anh_thumb
from dbo.san_pham sp
outer apply (
    select top 1
        ctsp.id as id_ctsp_thumb,
        a.duong_dan_anh as duong_dan_anh_thumb
    from dbo.chi_tiet_san_pham ctsp
    join dbo.anh_chi_tiet_san_pham a
        on a.id_chi_tiet_san_pham = ctsp.id
       and a.xoa_mem = 0
       and a.la_anh_dai_dien = 1
    where
        ctsp.id_san_pham = sp.id
        and ctsp.xoa_mem = 0
        and ctsp.trang_thai = 1
    order by
        case when ctsp.so_luong > 0 then 0 else 1 end,
        ctsp.id asc
) pick
where sp.xoa_mem = 0;
go

use DATN_SevenStrike;
go

set nocount on;

begin try
    begin transaction;

    /* =========================
       1) DANH MỤC THUỘC TÍNH
       ========================= */

    -- XUẤT XỨ
    if not exists (select 1 from dbo.xuat_xu)
    begin
        insert into dbo.xuat_xu(ten_xuat_xu, trang_thai, xoa_mem)
        values
        (N'Việt Nam', 1, 0),
        (N'Nhật Bản', 1, 0),
        (N'Thái Lan', 1, 0);
    end

    -- THƯƠNG HIỆU
    if not exists (select 1 from dbo.thuong_hieu)
    begin
        insert into dbo.thuong_hieu(ten_thuong_hieu, trang_thai, xoa_mem)
        values
        (N'Nike', 1, 0),
        (N'Adidas', 1, 0),
        (N'Puma', 1, 0);
    end

    -- MÀU SẮC (hex unique)
    if not exists (select 1 from dbo.mau_sac)
    begin
        insert into dbo.mau_sac(ten_mau_sac, ma_mau_hex, trang_thai, xoa_mem)
        values
        (N'Đen',  '#111827', 1, 0),
        (N'Trắng','#FFFFFF', 1, 0),
        (N'Đỏ',   '#DC2626', 1, 0),
        (N'Xanh dương', '#2563EB', 1, 0),
        (N'Vàng', '#F59E0B', 1, 0);
    end

    -- KÍCH THƯỚC (gia_tri unique, range 38-45)
    if not exists (select 1 from dbo.kich_thuoc)
    begin
        insert into dbo.kich_thuoc(ten_kich_thuoc, gia_tri_kich_thuoc, trang_thai, xoa_mem)
        values
        (N'38', 38.0, 1, 0),
        (N'39', 39.0, 1, 0),
        (N'40', 40.0, 1, 0),
        (N'41', 41.0, 1, 0),
        (N'42', 42.0, 1, 0),
        (N'43', 43.0, 1, 0),
        (N'44', 44.0, 1, 0),
        (N'45', 45.0, 1, 0);
    end

    -- LOẠI SÂN
    if not exists (select 1 from dbo.loai_san)
    begin
        insert into dbo.loai_san(ten_loai_san, trang_thai, xoa_mem)
        values
        (N'Sân cỏ tự nhiên (FG)', 1, 0),
        (N'Sân cỏ nhân tạo (TF)', 1, 0),
        (N'Sân futsal (IC)', 1, 0);
    end

    -- VỊ TRÍ THI ĐẤU
    if not exists (select 1 from dbo.vi_tri_thi_dau)
    begin
        insert into dbo.vi_tri_thi_dau(ten_vi_tri, trang_thai, xoa_mem)
        values
        (N'Tiền đạo', 1, 0),
        (N'Tiền vệ', 1, 0),
        (N'Hậu vệ', 1, 0),
        (N'Thủ môn', 1, 0);
    end

    -- PHONG CÁCH CHƠI
    if not exists (select 1 from dbo.phong_cach_choi)
    begin
        insert into dbo.phong_cach_choi(ten_phong_cach, trang_thai, xoa_mem)
        values
        (N'Tốc độ', 1, 0),
        (N'Kỹ thuật', 1, 0),
        (N'Sức mạnh', 1, 0);
    end

    -- CỔ GIÀY
    if not exists (select 1 from dbo.co_giay)
    begin
        insert into dbo.co_giay(ten_co_giay, trang_thai, xoa_mem)
        values
        (N'Cổ thấp', 1, 0),
        (N'Cổ cao', 1, 0);
    end

    -- FORM CHÂN
    if not exists (select 1 from dbo.form_chan)
    begin
        insert into dbo.form_chan(ten_form_chan, trang_thai, xoa_mem)
        values
        (N'Form ôm', 1, 0),
        (N'Form vừa', 1, 0),
        (N'Form rộng', 1, 0);
    end

    -- CHẤT LIỆU
    if not exists (select 1 from dbo.chat_lieu)
    begin
        insert into dbo.chat_lieu(ten_chat_lieu, trang_thai, xoa_mem)
        values
        (N'Da tổng hợp', 1, 0),
        (N'Da thật', 1, 0),
        (N'Vải dệt', 1, 0);
    end

    /* =========================
       2) QUYỀN HẠN + NHÂN VIÊN
       ========================= */

    if not exists (select 1 from dbo.quyen_han)
    begin
        insert into dbo.quyen_han(ten_quyen_han, trang_thai, xoa_mem)
        values
        (N'ADMIN', 1, 0),
        (N'NHAN_VIEN', 1, 0);
    end

    if not exists (select 1 from dbo.nhan_vien)
    begin
        declare @qhAdmin int = (select top 1 id from dbo.quyen_han where ten_quyen_han = N'ADMIN' and xoa_mem=0);
        declare @qhNv int = (select top 1 id from dbo.quyen_han where ten_quyen_han = N'NHAN_VIEN' and xoa_mem=0);

        insert into dbo.nhan_vien(
            id_quyen_han, ten_nhan_vien, ten_tai_khoan, mat_khau, email, so_dien_thoai,
            thanh_pho, quan, phuong, dia_chi_cu_the,
            trang_thai, xoa_mem
        )
        values
        (@qhAdmin, N'Quản trị hệ thống', 'admin', '123456', 'admin@sevenstrike.vn', '0900000001',
         N'Hà Nội', N'Đống Đa', N'Phường Láng Hạ', N'Số 1 Demo', 1, 0),

        (@qhNv, N'Nhân viên bán hàng', 'nvbanhang', '123456', 'nvbanhang@sevenstrike.vn', '0900000002',
         N'Hà Nội', N'Cầu Giấy', N'Phường Dịch Vọng', N'Số 2 Demo', 1, 0);
    end

    /* =========================
       3) KHÁCH HÀNG + ĐỊA CHỈ
       ========================= */

    if not exists (select 1 from dbo.khach_hang)
    begin
        insert into dbo.khach_hang(
            ten_khach_hang, ten_tai_khoan, mat_khau, email, so_dien_thoai, gioi_tinh, ngay_sinh,
            trang_thai, xoa_mem
        )
        values
        (N'Nguyễn Văn A', 'kha', '123456', 'kha.a@gmail.com', '0911111111', 1, '1999-05-10', 1, 0),
        (N'Trần Văn B',   'khb', '123456', 'khb.b@gmail.com', '0922222222', 1, '2000-01-20', 1, 0),
        (N'Lê Thị C',     'khc', '123456', 'khc.c@gmail.com', '0933333333', 0, '2001-08-15', 1, 0),
        (N'Phạm Văn D',   'khd', '123456', 'khd.d@gmail.com', '0944444444', 1, '1998-12-02', 1, 0);
    end

    if not exists (select 1 from dbo.dia_chi_khach_hang)
    begin
        declare @kh1 int = (select top 1 id from dbo.khach_hang where ten_tai_khoan='kha' and xoa_mem=0);
        declare @kh2 int = (select top 1 id from dbo.khach_hang where ten_tai_khoan='khb' and xoa_mem=0);
        declare @kh3 int = (select top 1 id from dbo.khach_hang where ten_tai_khoan='khc' and xoa_mem=0);
        declare @kh4 int = (select top 1 id from dbo.khach_hang where ten_tai_khoan='khd' and xoa_mem=0);

        insert into dbo.dia_chi_khach_hang(
            id_khach_hang, ten_dia_chi, thanh_pho, quan, phuong, dia_chi_cu_the, mac_dinh, xoa_mem
        )
        values
        (@kh1, N'Nhà riêng', N'Hà Nội', N'Đống Đa', N'Láng Hạ', N'Số 10 Demo', 1, 0),
        (@kh2, N'Công ty',   N'Hà Nội', N'Cầu Giấy', N'Dịch Vọng', N'Số 20 Demo', 1, 0),
        (@kh3, N'Nhà riêng', N'Hà Nội', N'Thanh Xuân', N'Khương Đình', N'Số 30 Demo', 1, 0),
        (@kh4, N'Nhà riêng', N'Hà Nội', N'Hoàng Mai', N'Đại Kim', N'Số 40 Demo', 1, 0);
    end

    /* =========================
       4) SẢN PHẨM + CTSP + ẢNH
       ========================= */

    if not exists (select 1 from dbo.san_pham)
    begin
        declare @thNike int = (select top 1 id from dbo.thuong_hieu where ten_thuong_hieu=N'Nike' and xoa_mem=0);
        declare @thAdi  int = (select top 1 id from dbo.thuong_hieu where ten_thuong_hieu=N'Adidas' and xoa_mem=0);

        declare @xxVN int = (select top 1 id from dbo.xuat_xu where ten_xuat_xu=N'Việt Nam' and xoa_mem=0);
        declare @xxJP int = (select top 1 id from dbo.xuat_xu where ten_xuat_xu=N'Nhật Bản' and xoa_mem=0);

        declare @vtTD int = (select top 1 id from dbo.vi_tri_thi_dau where ten_vi_tri=N'Tiền đạo' and xoa_mem=0);
        declare @pcTD int = (select top 1 id from dbo.phong_cach_choi where ten_phong_cach=N'Tốc độ' and xoa_mem=0);

        declare @cgThap int = (select top 1 id from dbo.co_giay where ten_co_giay=N'Cổ thấp' and xoa_mem=0);
        declare @clDaTH int = (select top 1 id from dbo.chat_lieu where ten_chat_lieu=N'Da tổng hợp' and xoa_mem=0);

        insert into dbo.san_pham(
            id_thuong_hieu, id_xuat_xu, id_vi_tri_thi_dau, id_phong_cach_choi, id_co_giay, id_chat_lieu,
            ten_san_pham, mo_ta_ngan, mo_ta_chi_tiet,
            trang_thai_kinh_doanh, xoa_mem
        )
        values
        (@thNike, @xxVN, @vtTD, @pcTD, @cgThap, @clDaTH,
         N'Nike Mercurial Vapor 15 Pro', N'Giày tốc độ, bám sân tốt', N'Demo mô tả chi tiết Mercurial Vapor 15 Pro',
         1, 0),

        (@thAdi, @xxJP, @vtTD, @pcTD, @cgThap, @clDaTH,
         N'Adidas X Crazyfast.1', N'Giày nhẹ, phù hợp bứt tốc', N'Demo mô tả chi tiết Adidas X Crazyfast.1',
         1, 0);
    end

    if not exists (select 1 from dbo.chi_tiet_san_pham)
    begin
        declare @sp1 int = (select top 1 id from dbo.san_pham where ten_san_pham like N'Nike Mercurial%' and xoa_mem=0);
        declare @sp2 int = (select top 1 id from dbo.san_pham where ten_san_pham like N'Adidas X Crazyfast%' and xoa_mem=0);

        declare @msDen int = (select top 1 id from dbo.mau_sac where ten_mau_sac=N'Đen' and xoa_mem=0);
        declare @msDo  int = (select top 1 id from dbo.mau_sac where ten_mau_sac=N'Đỏ' and xoa_mem=0);
        declare @msTrang int = (select top 1 id from dbo.mau_sac where ten_mau_sac=N'Trắng' and xoa_mem=0);

        declare @kt41 int = (select top 1 id from dbo.kich_thuoc where gia_tri_kich_thuoc=41.0 and xoa_mem=0);
        declare @kt42 int = (select top 1 id from dbo.kich_thuoc where gia_tri_kich_thuoc=42.0 and xoa_mem=0);
        declare @kt43 int = (select top 1 id from dbo.kich_thuoc where gia_tri_kich_thuoc=43.0 and xoa_mem=0);

        declare @lsTF int = (select top 1 id from dbo.loai_san where ten_loai_san like N'%TF%' and xoa_mem=0);
        declare @lsFG int = (select top 1 id from dbo.loai_san where ten_loai_san like N'%FG%' and xoa_mem=0);

        declare @fcVua int = (select top 1 id from dbo.form_chan where ten_form_chan=N'Form vừa' and xoa_mem=0);

        -- SP1: 4 biến thể
        insert into dbo.chi_tiet_san_pham(
            id_san_pham, id_mau_sac, id_kich_thuoc, id_loai_san, id_form_chan,
            so_luong, gia_niem_yet, gia_ban, trang_thai, ghi_chu, xoa_mem
        )
        values
        (@sp1, @msDen,  @kt41, @lsTF, @fcVua, 20, 2500000, 2200000, 1, N'Demo', 0),
        (@sp1, @msDen,  @kt42, @lsTF, @fcVua, 15, 2500000, 2200000, 1, N'Demo', 0),
        (@sp1, @msDo,   @kt42, @lsTF, @fcVua, 10, 2550000, 2250000, 1, N'Demo', 0),
        (@sp1, @msDo,   @kt43, @lsFG, @fcVua,  8, 2650000, 2350000, 1, N'Demo', 0);

        -- SP2: 4 biến thể
        insert into dbo.chi_tiet_san_pham(
            id_san_pham, id_mau_sac, id_kich_thuoc, id_loai_san, id_form_chan,
            so_luong, gia_niem_yet, gia_ban, trang_thai, ghi_chu, xoa_mem
        )
        values
        (@sp2, @msTrang, @kt41, @lsTF, @fcVua, 18, 2700000, 2400000, 1, N'Demo', 0),
        (@sp2, @msTrang, @kt42, @lsTF, @fcVua, 12, 2700000, 2400000, 1, N'Demo', 0),
        (@sp2, @msDen,   @kt42, @lsFG, @fcVua,  9, 2800000, 2500000, 1, N'Demo', 0),
        (@sp2, @msDen,   @kt43, @lsFG, @fcVua,  6, 2800000, 2500000, 1, N'Demo', 0);
    end

    -- Ảnh CTSP (mỗi CTSP có đúng 1 ảnh đại diện để đúng unique index filtered)
    if not exists (select 1 from dbo.anh_chi_tiet_san_pham)
    begin
        insert into dbo.anh_chi_tiet_san_pham(id_chi_tiet_san_pham, duong_dan_anh, la_anh_dai_dien, mo_ta, xoa_mem)
        select
            ctsp.id,
            concat('/uploads/demo/ctsp_', ctsp.id, '_thumb.jpg'),
            1,
            N'Ảnh đại diện demo',
            0
        from dbo.chi_tiet_san_pham ctsp
        where ctsp.xoa_mem = 0;

        insert into dbo.anh_chi_tiet_san_pham(id_chi_tiet_san_pham, duong_dan_anh, la_anh_dai_dien, mo_ta, xoa_mem)
        select
            ctsp.id,
            concat('/uploads/demo/ctsp_', ctsp.id, '_extra.jpg'),
            0,
            N'Ảnh phụ demo',
            0
        from dbo.chi_tiet_san_pham ctsp
        where ctsp.xoa_mem = 0;
    end

    /* =========================
       5) ĐỢT GIẢM GIÁ
       ========================= */

    if not exists (select 1 from dbo.dot_giam_gia)
    begin
        insert into dbo.dot_giam_gia(
            ten_dot_giam_gia, loai_giam_gia, gia_tri_giam_gia,
            ngay_bat_dau, ngay_ket_thuc,
            muc_uu_tien, trang_thai, xoa_mem
        )
        values
        (N'Demo Sale 10% - Tuần này', 0, 10,
         dateadd(day, -3, cast(getdate() as date)),
         dateadd(day, 10, cast(getdate() as date)),
         10, 1, 0);
    end

    if not exists (select 1 from dbo.chi_tiet_dot_giam_gia)
    begin
        declare @dgg int = (select top 1 id from dbo.dot_giam_gia where xoa_mem=0 order by id desc);

        insert into dbo.chi_tiet_dot_giam_gia(
            id_dot_giam_gia, id_chi_tiet_san_pham,
            so_luong_ap_dung, gia_tri_giam_rieng, so_tien_giam_toi_da_rieng,
            trang_thai, ghi_chu, xoa_mem
        )
        select top 3
            @dgg, ctsp.id,
            null, null, 300000,
            1, N'Demo áp dụng đợt giảm giá', 0
        from dbo.chi_tiet_san_pham ctsp
        where ctsp.xoa_mem=0
        order by ctsp.id;
    end

    /* =========================
       6) PHIẾU GIẢM GIÁ + CHI TIẾT (cá nhân)
       ========================= */

    if not exists (select 1 from dbo.phieu_giam_gia)
    begin
        insert into dbo.phieu_giam_gia(
            ten_phieu_giam_gia, loai_phieu_giam_gia, gia_tri_giam_gia, so_tien_giam_toi_da,
            hoa_don_toi_thieu, so_luong_su_dung, ngay_bat_dau, ngay_ket_thuc, trang_thai, mo_ta, xoa_mem
        )
        values
        (N'PGG 10% - Tối đa 200K', 0, 10, 200000, 1000000, 9999,
         dateadd(day, -1, cast(getdate() as date)), dateadd(day, 30, cast(getdate() as date)),
         1, N'Voucher công khai demo', 0),

        (N'PGG 100K', 1, 100000, 100000, 1500000, 9999,
         dateadd(day, -1, cast(getdate() as date)), dateadd(day, 30, cast(getdate() as date)),
         1, N'Voucher công khai demo', 0),

        (N'PGG Cá nhân 15% - Tối đa 300K', 0, 15, 300000, 800000, 3,
         dateadd(day, -1, cast(getdate() as date)), dateadd(day, 15, cast(getdate() as date)),
         1, N'Voucher cá nhân: gửi mail khi tạo (BE)', 0);
    end

    if not exists (select 1 from dbo.phieu_giam_gia_chi_tiet)
    begin
        declare @pggCaNhan int =
            (select top 1 id from dbo.phieu_giam_gia where ten_phieu_giam_gia like N'%Cá nhân 15%%' and xoa_mem=0);

        insert into dbo.phieu_giam_gia_chi_tiet(id_phieu_giam_gia, id_khach_hang, xoa_mem)
        select @pggCaNhan, kh.id, 0
        from (
            select top 3 id
            from dbo.khach_hang
            where xoa_mem=0
            order by id
        ) kh;
    end

    if not exists (select 1 from dbo.phieu_giam_gia_ca_nhan)
    begin
        declare @pggCaNhan2 int =
            (select top 1 id from dbo.phieu_giam_gia where ten_phieu_giam_gia like N'%Cá nhân 15%%' and xoa_mem=0);

        insert into dbo.phieu_giam_gia_ca_nhan(id_khach_hang, id_phieu_giam_gia, da_su_dung, xoa_mem)
        select ct.id_khach_hang, ct.id_phieu_giam_gia, 0, 0
        from dbo.phieu_giam_gia_chi_tiet ct
        where ct.xoa_mem=0 and ct.id_phieu_giam_gia = @pggCaNhan2;
    end

    /* =========================
       7) PHƯƠNG THỨC THANH TOÁN
       ========================= */

    if not exists (select 1 from dbo.phuong_thuc_thanh_toan)
    begin
        insert into dbo.phuong_thuc_thanh_toan(ten_phuong_thuc_thanh_toan, nha_cung_cap, trang_thai, xoa_mem)
        values
        (N'Tiền mặt', N'TAI_QUAY', 1, 0),
        (N'Chuyển khoản', N'BANK', 1, 0),
        (N'VNPay', N'VNPAY', 1, 0);
    end

    /* =========================
       8) CA LÀM + LỊCH LÀM VIỆC + GIAO CA (BẢNG MỚI)
       ========================= */

    if not exists (select 1 from dbo.ca_lam)
    begin
        insert into dbo.ca_lam(ten_ca, gio_bat_dau, gio_ket_thuc, mo_ta, trang_thai, xoa_mem)
        values
        (N'Ca sáng',  '08:00', '12:00', N'Demo', 1, 0),
        (N'Ca chiều', '13:30', '17:30', N'Demo', 1, 0);
    end

    declare @caSang int = (select top 1 id from dbo.ca_lam where ten_ca = N'Ca sáng' and xoa_mem=0);
    declare @ngayHomNay date = cast(getdate() as date);

    if not exists (select 1 from dbo.lich_lam_viec where xoa_mem=0 and id_ca_lam=@caSang and ngay_lam=@ngayHomNay)
    begin
        insert into dbo.lich_lam_viec(id_ca_lam, ngay_lam, ghi_chu, xoa_mem)
        values (@caSang, @ngayHomNay, N'Lịch demo hôm nay', 0);
    end

    declare @llv int = (select top 1 id from dbo.lich_lam_viec where xoa_mem=0 and id_ca_lam=@caSang and ngay_lam=@ngayHomNay);
    declare @nvBanHang int = (select top 1 id from dbo.nhan_vien where ten_tai_khoan='nvbanhang' and xoa_mem=0);

    if not exists (select 1 from dbo.lich_lam_viec_nhan_vien where xoa_mem=0 and id_lich_lam_viec=@llv and id_nhan_vien=@nvBanHang)
    begin
        insert into dbo.lich_lam_viec_nhan_vien(id_lich_lam_viec, id_nhan_vien, xoa_mem)
        values (@llv, @nvBanHang, 0);
    end

    -- Giao ca demo (mở ca) - trigger yêu cầu NV phải có trong lịch
    if not exists (select 1 from dbo.giao_ca where xoa_mem=0 and id_lich_lam_viec=@llv and id_nhan_vien=@nvBanHang and trang_thai=0)
    begin
        insert into dbo.giao_ca(
            id_lich_lam_viec, id_nhan_vien, id_giao_ca_truoc,
            thoi_gian_nhan_ca, thoi_gian_ket_ca,
            tien_ban_giao_du_kien, tien_dau_ca_nhap, da_xac_nhan_tien_dau_ca,
            trang_thai, ghi_chu, xoa_mem
        )
        values
        (@llv, @nvBanHang, null,
         sysdatetime(), null,
         1000000, 1000000, 1,
         0, N'Giao ca demo - đang mở', 0);
    end

    declare @gcDangMo int =
        (select top 1 id from dbo.giao_ca where xoa_mem=0 and id_lich_lam_viec=@llv and id_nhan_vien=@nvBanHang and trang_thai=0 order by id desc);

    /* =========================
       9) CHỨC NĂNG + MAP QUYỀN (BẢNG MỚI)
       ========================= */

    if not exists (select 1 from dbo.chuc_nang)
    begin
        insert into dbo.chuc_nang(ma_chuc_nang, ten_chuc_nang, mo_ta, trang_thai, xoa_mem)
        values
        ('BAN_HANG',       N'Bán hàng',         N'Demo', 1, 0),
        ('QL_SAN_PHAM',    N'Quản lý sản phẩm',  N'Demo', 1, 0),
        ('QL_HOA_DON',     N'Quản lý hóa đơn',   N'Demo', 1, 0),
        ('QL_KHACH_HANG',  N'Quản lý khách hàng',N'Demo', 1, 0),
        ('QL_GIAM_GIA',    N'Quản lý giảm giá',  N'Demo', 1, 0),
        ('QL_VOUCHER',     N'Quản lý voucher',   N'Demo', 1, 0),
        ('QL_LICH_LAM',    N'Quản lý lịch làm',  N'Demo', 1, 0),
        ('THONG_KE',       N'Thống kê',          N'Demo', 1, 0);
    end

    declare @qhAdminId int = (select top 1 id from dbo.quyen_han where ten_quyen_han=N'ADMIN' and xoa_mem=0);
    declare @qhNvId int    = (select top 1 id from dbo.quyen_han where ten_quyen_han=N'NHAN_VIEN' and xoa_mem=0);

    -- ADMIN: tất cả chức năng
    if not exists (select 1 from dbo.quyen_han_chuc_nang where xoa_mem=0 and id_quyen_han=@qhAdminId)
    begin
        insert into dbo.quyen_han_chuc_nang(id_quyen_han, id_chuc_nang, xoa_mem)
        select @qhAdminId, cn.id, 0
        from dbo.chuc_nang cn
        where cn.xoa_mem=0;
    end

    -- NHÂN_VIÊN: một số chức năng cơ bản
    if not exists (select 1 from dbo.quyen_han_chuc_nang where xoa_mem=0 and id_quyen_han=@qhNvId)
    begin
        insert into dbo.quyen_han_chuc_nang(id_quyen_han, id_chuc_nang, xoa_mem)
        select @qhNvId, cn.id, 0
        from dbo.chuc_nang cn
        where cn.xoa_mem=0
          and cn.ma_chuc_nang in ('BAN_HANG','QL_HOA_DON','QL_KHACH_HANG','QL_LICH_LAM');
    end

    /* =========================
       10) HÓA ĐƠN + CHI TIẾT + LỊCH SỬ (CHỈ 1..5)
       ========================= */

    if not exists (select 1 from dbo.hoa_don)
    begin
        declare @kh int = (select top 1 id from dbo.khach_hang where ten_tai_khoan='kha' and xoa_mem=0);

        declare @pggPublic int = (select top 1 id from dbo.phieu_giam_gia where ten_phieu_giam_gia like N'PGG 10%%' and xoa_mem=0);
        declare @pggCaNhanId int = (select top 1 id from dbo.phieu_giam_gia where ten_phieu_giam_gia like N'%Cá nhân 15%%' and xoa_mem=0);
        declare @pggcn int = (select top 1 id from dbo.phieu_giam_gia_ca_nhan where id_khach_hang=@kh and id_phieu_giam_gia=@pggCaNhanId and xoa_mem=0);

        declare @ctspA int = (select top 1 id from dbo.chi_tiet_san_pham where xoa_mem=0 order by id);
        declare @ctspB int = (select top 1 id from dbo.chi_tiet_san_pham where xoa_mem=0 order by id desc);

        /* (1) ĐƠN TẠI QUẦY - ĐÃ THANH TOÁN (5) - GẮN GIAO CA */
        insert into dbo.hoa_don(
            id_khach_hang, id_nhan_vien, id_phieu_giam_gia, id_phieu_giam_gia_ca_nhan,
            id_giao_ca,
            loai_don, phi_van_chuyen, tong_tien, tong_tien_sau_giam,
            ten_khach_hang, dia_chi_khach_hang, so_dien_thoai_khach_hang, email_khach_hang,
            trang_thai_hien_tai, ngay_tao, ngay_thanh_toan, ghi_chu, xoa_mem
        )
        values
        (null, null, null, null,
         @gcDangMo,
         0, 0, 2200000, 2200000,
         N'Khách lẻ', N'Tại quầy', '0909999999', null,
         5, sysdatetime(), sysdatetime(), N'Đơn tại quầy demo', 0);

        declare @hdQuay int = scope_identity();

        insert into dbo.hoa_don_chi_tiet(id_hoa_don, id_chi_tiet_san_pham, so_luong, don_gia, ghi_chu, xoa_mem)
        values
        (@hdQuay, @ctspA, 1, 2200000, N'Demo', 0);

        insert into dbo.lich_su_hoa_don(id_hoa_don, trang_thai, ghi_chu, xoa_mem)
        values
        (@hdQuay, 1, N'Tạo đơn tại quầy', 0),
        (@hdQuay, 5, N'Đã thanh toán tiền mặt', 0);

        /* (2) ĐƠN GIAO HÀNG/ONLINE - ĐANG VẬN CHUYỂN (3) - dùng voucher cá nhân (đủ FK combo) */
        insert into dbo.hoa_don(
            id_khach_hang, id_nhan_vien, id_phieu_giam_gia, id_phieu_giam_gia_ca_nhan,
            id_giao_ca,
            loai_don, phi_van_chuyen, tong_tien, tong_tien_sau_giam,
            ten_khach_hang, dia_chi_khach_hang, so_dien_thoai_khach_hang, email_khach_hang,
            trang_thai_hien_tai, ngay_tao, ngay_thanh_toan, ghi_chu, xoa_mem
        )
        values
        (@kh, @nvBanHang, @pggCaNhanId, @pggcn,
         null,
         1, 30000, 2400000, 2100000,
         N'Nguyễn Văn A', N'Số 10 Demo, Láng Hạ, Đống Đa, Hà Nội', '0911111111', 'kha.a@gmail.com',
         3, dateadd(hour, -5, sysdatetime()), null, N'Đơn giao hàng demo', 0);

        declare @hdShip int = scope_identity();

        insert into dbo.hoa_don_chi_tiet(id_hoa_don, id_chi_tiet_san_pham, so_luong, don_gia, ghi_chu, xoa_mem)
        values
        (@hdShip, @ctspB, 1, 2100000, N'Demo', 0);

        insert into dbo.lich_su_hoa_don(id_hoa_don, trang_thai, ghi_chu, xoa_mem)
        values
        (@hdShip, 1, N'Tạo đơn - chờ xác nhận', 0),
        (@hdShip, 2, N'Đã xác nhận - chờ giao hàng', 0),
        (@hdShip, 3, N'Đang vận chuyển', 0);

        /* Giao dịch thanh toán cho đơn online (demo) */
        declare @ptVnpay int = (select top 1 id from dbo.phuong_thuc_thanh_toan where nha_cung_cap=N'VNPAY' and xoa_mem=0);

        insert into dbo.giao_dich_thanh_toan(
            id_hoa_don, id_phuong_thuc_thanh_toan, so_tien, trang_thai,
            ma_yeu_cau, ma_giao_dich_ngoai, ma_tham_chieu,
            duong_dan_thanh_toan, du_lieu_qr, thoi_gian_het_han,
            du_lieu_phan_hoi, ghi_chu, xoa_mem
        )
        values
        (@hdShip, @ptVnpay, 2100000, N'khoi_tao',
         N'REQ_DEMO_001', null, null,
         N'https://sandbox.vnpay.vn/demo-pay', N'QR_DEMO_DATA', dateadd(minute, 30, sysdatetime()),
         null, N'Demo giao dịch', 0);

        /* (3) ĐƠN ONLINE - ĐÃ THANH TOÁN (5) - dùng voucher công khai (nếu có) */
        insert into dbo.hoa_don(
            id_khach_hang, id_nhan_vien, id_phieu_giam_gia, id_phieu_giam_gia_ca_nhan,
            id_giao_ca,
            loai_don, phi_van_chuyen, tong_tien, tong_tien_sau_giam,
            ten_khach_hang, dia_chi_khach_hang, so_dien_thoai_khach_hang, email_khach_hang,
            trang_thai_hien_tai, ngay_tao, ngay_thanh_toan, ghi_chu, xoa_mem
        )
        values
        (@kh, @nvBanHang, @pggPublic, null,
         null,
         1, 30000, 2500000, 2300000,
         N'Nguyễn Văn A', N'Số 10 Demo, Láng Hạ, Đống Đa, Hà Nội', '0911111111', 'kha.a@gmail.com',
         5, dateadd(hour, -2, sysdatetime()), sysdatetime(), N'Đơn online đã thanh toán demo', 0);

        declare @hdPaid int = scope_identity();

        insert into dbo.hoa_don_chi_tiet(id_hoa_don, id_chi_tiet_san_pham, so_luong, don_gia, ghi_chu, xoa_mem)
        values
        (@hdPaid, @ctspA, 1, 2300000, N'Demo', 0);

        insert into dbo.lich_su_hoa_don(id_hoa_don, trang_thai, ghi_chu, xoa_mem)
        values
        (@hdPaid, 1, N'Tạo đơn', 0),
        (@hdPaid, 2, N'Chờ giao hàng', 0),
        (@hdPaid, 5, N'Đã thanh toán', 0);
    end

    commit transaction;
    print N'✅ Seed demo data DONE (DB: DATN_SevenStrike_Test).';
end try
begin catch
    if @@trancount > 0 rollback transaction;
    print N'❌ Seed demo data FAILED: ' + error_message();
    throw;
end catch;