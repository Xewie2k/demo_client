create database DATN_SevenStrike;
go

use DATN_SevenStrike;
go

/* =========================================================
   1) DANH MỤC CHUNG (THUỘC TÍNH)
   ========================================================= */

create table xuat_xu (
    id int identity(1,1) primary key,
    ma_xuat_xu as 'XX' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_xuat_xu nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table thuong_hieu (
    id int identity(1,1) primary key,
    ma_thuong_hieu as 'TH' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_thuong_hieu nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table mau_sac (
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

create table kich_thuoc (
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

create table loai_san (
    id int identity(1,1) primary key,
    ma_loai_san as 'LS' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_loai_san nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table vi_tri_thi_dau (
    id int identity(1,1) primary key,
    ma_vi_tri as 'VT' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_vi_tri nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table phong_cach_choi (
    id int identity(1,1) primary key,
    ma_phong_cach as 'PC' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_phong_cach nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table co_giay (
    id int identity(1,1) primary key,
    ma_co_giay as 'CG' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_co_giay nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table form_chan (
    id int identity(1,1) primary key,
    ma_form_chan as 'FC' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_form_chan nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table chat_lieu (
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

create table quyen_han (
    id int identity(1,1) primary key,
    ma_quyen_han as 'QH' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_quyen_han nvarchar(255) not null,
    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table nhan_vien (
    id int identity(1,1) primary key,
    id_quyen_han int not null,

    ma_nhan_vien as 'NV' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_nhan_vien nvarchar(255) not null,
    ten_tai_khoan varchar(255) not null,
    mat_khau varchar(255) not null,
    email varchar(255) null,
    so_dien_thoai varchar(12) null,
    anh_nhan_vien varchar(255) null,
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

    constraint FK_nv_qh foreign key (id_quyen_han) references quyen_han(id)
);
go

/* =========================================================
   3) KHÁCH HÀNG - ĐỊA CHỈ
   ========================================================= */

create table khach_hang (
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
    nguoi_cap_nhat int null
);
go

create table dia_chi_khach_hang (
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

    constraint FK_dckh_kh foreign key (id_khach_hang) references khach_hang(id)
);
go

/* =========================================================
   4) SẢN PHẨM - BIẾN THỂ - ẢNH
   ========================================================= */

create table san_pham (
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

    constraint FK_sp_th foreign key (id_thuong_hieu) references thuong_hieu(id),
    constraint FK_sp_xx foreign key (id_xuat_xu) references xuat_xu(id),
    constraint FK_sp_vt foreign key (id_vi_tri_thi_dau) references vi_tri_thi_dau(id),
    constraint FK_sp_pc foreign key (id_phong_cach_choi) references phong_cach_choi(id),
    constraint FK_sp_cg foreign key (id_co_giay) references co_giay(id),
    constraint FK_sp_cl foreign key (id_chat_lieu) references chat_lieu(id)
);
go

create table chi_tiet_san_pham (
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

    constraint FK_ctsp_sp foreign key (id_san_pham) references san_pham(id),
    constraint FK_ctsp_ms foreign key (id_mau_sac) references mau_sac(id),
    constraint FK_ctsp_kt foreign key (id_kich_thuoc) references kich_thuoc(id),
    constraint FK_ctsp_ls foreign key (id_loai_san) references loai_san(id),
    constraint FK_ctsp_fc foreign key (id_form_chan) references form_chan(id)
);
go

create table anh_chi_tiet_san_pham (
    id int identity(1,1) primary key,
    id_chi_tiet_san_pham int not null,
    duong_dan_anh varchar(255) not null,
    la_anh_dai_dien bit not null default 0,
    mo_ta nvarchar(255) null,
    xoa_mem bit not null default 0,

    constraint FK_anh_ctsp foreign key (id_chi_tiet_san_pham) references chi_tiet_san_pham(id)
);
go

/* =========================================================
   5) ĐỢT GIẢM GIÁ - CHI TIẾT ĐỢT
   ========================================================= */

create table dot_giam_gia (
    id int identity(1,1) primary key,
    ma_dot_giam_gia as 'DGG' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_dot_giam_gia nvarchar(255) not null,

    loai_giam_gia bit not null default 0, -- chốt: % (0) khi demo bạn muốn
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

create table chi_tiet_dot_giam_gia (
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

    constraint FK_ctdgg_dgg foreign key (id_dot_giam_gia) references dot_giam_gia(id),
    constraint FK_ctdgg_ctsp foreign key (id_chi_tiet_san_pham) references chi_tiet_san_pham(id)
);
go

/* =========================================================
   6) VOUCHER (PHIẾU GIẢM GIÁ) + CÁ NHÂN & CHI TIẾT
   ========================================================= */

create table phieu_giam_gia (
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

    -- CHỐT: bit để admin bật/tắt thủ công (demo). Trạng thái "sắp/đang/kết thúc" tính từ ngày.
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

create table phieu_giam_gia_ca_nhan (
    id int identity(1,1) primary key,
    id_khach_hang int not null,
    id_phieu_giam_gia int not null,

    ma_phieu_giam_gia_ca_nhan as 'PGGCN' + right('00000' + cast(id as varchar(5)), 5) persisted,

    ngay_nhan date not null default cast(getdate() as date),
    da_su_dung bit not null default 0,

    xoa_mem bit not null default 0,

    constraint FK_pggcn_kh foreign key (id_khach_hang) references khach_hang(id),
    constraint FK_pggcn_pgg foreign key (id_phieu_giam_gia) references phieu_giam_gia(id)
);
go

create table phieu_giam_gia_chi_tiet (
    id int identity(1,1) primary key,
    id_phieu_giam_gia int not null,
    id_khach_hang int not null,
    xoa_mem bit not null default 0,

    constraint FK_pggct_pgg foreign key (id_phieu_giam_gia) references phieu_giam_gia(id),
    constraint FK_pggct_kh foreign key (id_khach_hang) references khach_hang(id)
);
go

/* =========================================================
   7) HÓA ĐƠN - HÓA ĐƠN CHI TIẾT
   ========================================================= */

create table hoa_don (
    id int identity(1,1) primary key,

    id_khach_hang int null,
    id_nhan_vien int null,

    id_phieu_giam_gia int null,
    id_phieu_giam_gia_ca_nhan int null,

    ma_hoa_don as 'HD' + right('00000' + cast(id as varchar(5)), 5) persisted,

    loai_don bit not null default 0, -- 0: tại quầy | 1: giao hàng/online

    phi_van_chuyen decimal(18,2) not null default 0 check (phi_van_chuyen >= 0),
    tong_tien decimal(18,2) not null check (tong_tien >= 0),
    tong_tien_sau_giam decimal(18,2) not null check (tong_tien_sau_giam >= 0),
    tong_tien_giam as cast((tong_tien - tong_tien_sau_giam) as decimal(18,2)) persisted,

    ten_khach_hang nvarchar(255) not null,
    dia_chi_khach_hang nvarchar(255) not null,
    so_dien_thoai_khach_hang varchar(12) not null,
    email_khach_hang varchar(255) null,

    -- CHỐT: INT CODE trạng thái hóa đơn (1..7)
    trang_thai_hien_tai int not null default 1,

    ngay_tao datetime2 not null default sysdatetime(),
    ngay_thanh_toan datetime2 null,
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    nguoi_tao int null,
    ngay_cap_nhat datetime2 null,
    nguoi_cap_nhat int null,

    constraint FK_hd_kh foreign key (id_khach_hang) references khach_hang(id),
    constraint FK_hd_nv foreign key (id_nhan_vien) references nhan_vien(id),
    constraint FK_hd_pgg foreign key (id_phieu_giam_gia) references phieu_giam_gia(id),
    constraint FK_hd_pggcn foreign key (id_phieu_giam_gia_ca_nhan) references phieu_giam_gia_ca_nhan(id),

    constraint CK_hd_voucher_ca_nhan check (
        id_phieu_giam_gia_ca_nhan is null
        or (id_khach_hang is not null and id_phieu_giam_gia is not null)
    ),

    constraint CK_hd_thanh_toan check (ngay_thanh_toan is null or ngay_thanh_toan >= ngay_tao),
    constraint CK_hd_tien check (tong_tien_sau_giam <= tong_tien),

    constraint CK_hd_trang_thai_code check (trang_thai_hien_tai in (1,2,3,4,5,6,7))
);
go

create table hoa_don_chi_tiet (
    id int identity(1,1) primary key,
    id_hoa_don int not null,
    id_chi_tiet_san_pham int not null,

    ma_hoa_don_chi_tiet as 'HDCT' + right('00000' + cast(id as varchar(5)), 5) persisted,

    so_luong int not null check (so_luong > 0),
    don_gia decimal(18,2) not null check (don_gia >= 0),

    thanh_tien as cast((so_luong * don_gia) as decimal(18,2)) persisted,

    ghi_chu nvarchar(255) null,
    xoa_mem bit not null default 0,

    constraint FK_hdct_hd foreign key (id_hoa_don) references hoa_don(id),
    constraint FK_hdct_ctsp foreign key (id_chi_tiet_san_pham) references chi_tiet_san_pham(id)
);
go

/* =========================================================
   8) THANH TOÁN
   ========================================================= */

create table phuong_thuc_thanh_toan (
    id int identity(1,1) primary key,
    ma_phuong_thuc_thanh_toan as 'PTTT' + right('00000' + cast(id as varchar(5)), 5) persisted,
    ten_phuong_thuc_thanh_toan nvarchar(255) not null,
    nha_cung_cap nvarchar(50) null,

    trang_thai bit not null default 1,
    xoa_mem bit not null default 0
);
go

create table giao_dich_thanh_toan (
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

    constraint FK_gdtt_hd foreign key (id_hoa_don) references hoa_don(id),
    constraint FK_gdtt_pttt foreign key (id_phuong_thuc_thanh_toan) references phuong_thuc_thanh_toan(id)
);
go

/* =========================================================
   9) LỊCH SỬ HÓA ĐƠN
   ========================================================= */

create table lich_su_hoa_don (
    id int identity(1,1) primary key,
    id_hoa_don int not null,

    -- CHỐT: INT CODE trạng thái hóa đơn (1..7)
    trang_thai int not null,

    thoi_gian datetime2 not null default sysdatetime(),
    ghi_chu nvarchar(255) null,

    xoa_mem bit not null default 0,

    constraint FK_lshd_hd foreign key (id_hoa_don) references hoa_don(id),
    constraint CK_lshd_trang_thai_code check (trang_thai in (1,2,3,4,5,6,7))
);
go

/* =========================================================
   10) INDEX / RÀNG BUỘC
   ========================================================= */

create unique index UX_ctsp_variant_alive
on chi_tiet_san_pham(id_san_pham, id_mau_sac, id_kich_thuoc, id_loai_san, id_form_chan)
where xoa_mem = 0;
go

create unique index UX_dckh_mac_dinh_alive
on dia_chi_khach_hang(id_khach_hang)
where mac_dinh = 1 and xoa_mem = 0;
go

create unique index UX_anh_ctsp_dai_dien_alive
on anh_chi_tiet_san_pham(id_chi_tiet_san_pham)
where la_anh_dai_dien = 1 and xoa_mem = 0;
go

create unique index UX_pggcn_alive
on phieu_giam_gia_ca_nhan(id_khach_hang, id_phieu_giam_gia)
where xoa_mem = 0;
go

create unique index UX_pggct_alive
on phieu_giam_gia_chi_tiet(id_khach_hang, id_phieu_giam_gia)
where xoa_mem = 0;
go

create unique index UX_nv_ten_tai_khoan_alive
on nhan_vien(ten_tai_khoan)
where xoa_mem = 0;
go

create unique index UX_nv_email_alive
on nhan_vien(email)
where xoa_mem = 0 and email is not null;
go

create unique index UX_kh_ten_tai_khoan_alive
on khach_hang(ten_tai_khoan)
where xoa_mem = 0;
go

create unique index UX_kh_email_alive
on khach_hang(email)
where xoa_mem = 0 and email is not null;
go

create unique index UX_ctdgg_alive
on chi_tiet_dot_giam_gia(id_dot_giam_gia, id_chi_tiet_san_pham)
where xoa_mem = 0;
go

alter table phieu_giam_gia_ca_nhan
add constraint UQ_pggcn_combo unique (id, id_khach_hang, id_phieu_giam_gia);
go

alter table hoa_don
add constraint FK_hd_pggcn_combo
foreign key (id_phieu_giam_gia_ca_nhan, id_khach_hang, id_phieu_giam_gia)
references phieu_giam_gia_ca_nhan(id, id_khach_hang, id_phieu_giam_gia);
go

/* ===== INDEX HỖ TRỢ SEARCH / LIST ONLINE ===== */

create index IX_sp_ma_sp_alive
on san_pham(ma_san_pham)
where xoa_mem = 0;
go

create index IX_ctsp_ma_ctsp_alive
on chi_tiet_san_pham(ma_chi_tiet_san_pham)
where xoa_mem = 0;
go

create unique index UX_mau_sac_hex_alive
on mau_sac(ma_mau_hex)
where xoa_mem = 0 and ma_mau_hex is not null;
go

create unique index UX_kich_thuoc_value_alive
on kich_thuoc(gia_tri_kich_thuoc)
where xoa_mem = 0 and gia_tri_kich_thuoc is not null;
go

create index IX_ctsp_pick_thumb
on chi_tiet_san_pham(id_san_pham, trang_thai, so_luong, id)
where xoa_mem = 0;
go

create index IX_anh_ctsp_dai_dien_pick
on anh_chi_tiet_san_pham(id_chi_tiet_san_pham, la_anh_dai_dien, xoa_mem);
go

/* =========================================================
   11) VIEW - THUMBNAIL SẢN PHẨM ONLINE
   ========================================================= */

create or alter view vw_san_pham_thumb
as
select
    sp.id as id_san_pham,
    sp.ma_san_pham,
    sp.ten_san_pham,
    sp.trang_thai_kinh_doanh,

    pick.id_ctsp_thumb,
    pick.duong_dan_anh_thumb
from san_pham sp
outer apply (
    select top 1
        ctsp.id as id_ctsp_thumb,
        a.duong_dan_anh as duong_dan_anh_thumb
    from chi_tiet_san_pham ctsp
    join anh_chi_tiet_san_pham a
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

/* =========================================================
   SEED DEMO DATA - SevenStrike
   - Chạy 1 lần, có IF NOT EXISTS để hạn chế trùng
   ========================================================= */

set nocount on;

begin try
    begin transaction;

    /* =========================
       1) DANH MỤC THUỘC TÍNH
       ========================= */

    -- XUẤT XỨ
    if not exists (select 1 from xuat_xu)
    begin
        insert into xuat_xu(ten_xuat_xu, trang_thai, xoa_mem)
        values
        (N'Việt Nam', 1, 0),
        (N'Nhật Bản', 1, 0),
        (N'Thái Lan', 1, 0);
    end

    -- THƯƠNG HIỆU
    if not exists (select 1 from thuong_hieu)
    begin
        insert into thuong_hieu(ten_thuong_hieu, trang_thai, xoa_mem)
        values
        (N'Nike', 1, 0),
        (N'Adidas', 1, 0),
        (N'Puma', 1, 0);
    end

    -- MÀU SẮC (hex unique)
    if not exists (select 1 from mau_sac)
    begin
        insert into mau_sac(ten_mau_sac, ma_mau_hex, trang_thai, xoa_mem)
        values
        (N'Đen',  '#111827', 1, 0),
        (N'Trắng','#FFFFFF', 1, 0),
        (N'Đỏ',   '#DC2626', 1, 0),
        (N'Xanh dương', '#2563EB', 1, 0),
        (N'Vàng', '#F59E0B', 1, 0);
    end

    -- KÍCH THƯỚC (gia_tri unique, range 38-45)
    if not exists (select 1 from kich_thuoc)
    begin
        insert into kich_thuoc(ten_kich_thuoc, gia_tri_kich_thuoc, trang_thai, xoa_mem)
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
    if not exists (select 1 from loai_san)
    begin
        insert into loai_san(ten_loai_san, trang_thai, xoa_mem)
        values
        (N'Sân cỏ tự nhiên (FG)', 1, 0),
        (N'Sân cỏ nhân tạo (TF)', 1, 0),
        (N'Sân futsal (IC)', 1, 0);
    end

    -- VỊ TRÍ THI ĐẤU
    if not exists (select 1 from vi_tri_thi_dau)
    begin
        insert into vi_tri_thi_dau(ten_vi_tri, trang_thai, xoa_mem)
        values
        (N'Tiền đạo', 1, 0),
        (N'Tiền vệ', 1, 0),
        (N'Hậu vệ', 1, 0),
        (N'Thủ môn', 1, 0);
    end

    -- PHONG CÁCH CHƠI
    if not exists (select 1 from phong_cach_choi)
    begin
        insert into phong_cach_choi(ten_phong_cach, trang_thai, xoa_mem)
        values
        (N'Tốc độ', 1, 0),
        (N'Kỹ thuật', 1, 0),
        (N'Sức mạnh', 1, 0);
    end

    -- CỔ GIÀY
    if not exists (select 1 from co_giay)
    begin
        insert into co_giay(ten_co_giay, trang_thai, xoa_mem)
        values
        (N'Cổ thấp', 1, 0),
        (N'Cổ cao', 1, 0);
    end

    -- FORM CHÂN
    if not exists (select 1 from form_chan)
    begin
        insert into form_chan(ten_form_chan, trang_thai, xoa_mem)
        values
        (N'Form ôm', 1, 0),
        (N'Form vừa', 1, 0),
        (N'Form rộng', 1, 0);
    end

    -- CHẤT LIỆU
    if not exists (select 1 from chat_lieu)
    begin
        insert into chat_lieu(ten_chat_lieu, trang_thai, xoa_mem)
        values
        (N'Da tổng hợp', 1, 0),
        (N'Da thật', 1, 0),
        (N'Vải dệt', 1, 0);
    end

    /* =========================
       2) QUYỀN HẠN + NHÂN VIÊN
       ========================= */

    if not exists (select 1 from quyen_han)
    begin
        insert into quyen_han(ten_quyen_han, trang_thai, xoa_mem)
        values
        (N'ADMIN', 1, 0),
        (N'NHAN_VIEN', 1, 0);
    end

    if not exists (select 1 from nhan_vien)
    begin
        declare @qhAdmin int = (select top 1 id from quyen_han where ten_quyen_han = N'ADMIN' and xoa_mem=0);
        declare @qhNv int = (select top 1 id from quyen_han where ten_quyen_han = N'NHAN_VIEN' and xoa_mem=0);

        insert into nhan_vien(
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

    if not exists (select 1 from khach_hang)
    begin
        insert into khach_hang(
            ten_khach_hang, ten_tai_khoan, mat_khau, email, so_dien_thoai, gioi_tinh, ngay_sinh,
            trang_thai, xoa_mem
        )
        values
        (N'Nguyễn Văn A', 'kha', '123456', 'kha.a@gmail.com', '0911111111', 1, '1999-05-10', 1, 0),
        (N'Trần Văn B',   'khb', '123456', 'khb.b@gmail.com', '0922222222', 1, '2000-01-20', 1, 0),
        (N'Lê Thị C',     'khc', '123456', 'khc.c@gmail.com', '0933333333', 0, '2001-08-15', 1, 0),
        (N'Phạm Văn D',   'khd', '123456', 'khd.d@gmail.com', '0944444444', 1, '1998-12-02', 1, 0);
    end

    if not exists (select 1 from dia_chi_khach_hang)
    begin
        declare @kh1 int = (select top 1 id from khach_hang where ten_tai_khoan='kha' and xoa_mem=0);
        declare @kh2 int = (select top 1 id from khach_hang where ten_tai_khoan='khb' and xoa_mem=0);
        declare @kh3 int = (select top 1 id from khach_hang where ten_tai_khoan='khc' and xoa_mem=0);
        declare @kh4 int = (select top 1 id from khach_hang where ten_tai_khoan='khd' and xoa_mem=0);

        insert into dia_chi_khach_hang(
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

    if not exists (select 1 from san_pham)
    begin
        declare @thNike int = (select top 1 id from thuong_hieu where ten_thuong_hieu=N'Nike' and xoa_mem=0);
        declare @thAdi  int = (select top 1 id from thuong_hieu where ten_thuong_hieu=N'Adidas' and xoa_mem=0);

        declare @xxVN int = (select top 1 id from xuat_xu where ten_xuat_xu=N'Việt Nam' and xoa_mem=0);
        declare @xxJP int = (select top 1 id from xuat_xu where ten_xuat_xu=N'Nhật Bản' and xoa_mem=0);

        declare @vtTD int = (select top 1 id from vi_tri_thi_dau where ten_vi_tri=N'Tiền đạo' and xoa_mem=0);
        declare @pcTD int = (select top 1 id from phong_cach_choi where ten_phong_cach=N'Tốc độ' and xoa_mem=0);

        declare @cgThap int = (select top 1 id from co_giay where ten_co_giay=N'Cổ thấp' and xoa_mem=0);
        declare @clDaTH int = (select top 1 id from chat_lieu where ten_chat_lieu=N'Da tổng hợp' and xoa_mem=0);

        insert into san_pham(
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

    if not exists (select 1 from chi_tiet_san_pham)
    begin
        declare @sp1 int = (select top 1 id from san_pham where ten_san_pham like N'Nike Mercurial%' and xoa_mem=0);
        declare @sp2 int = (select top 1 id from san_pham where ten_san_pham like N'Adidas X Crazyfast%' and xoa_mem=0);

        declare @msDen int = (select top 1 id from mau_sac where ten_mau_sac=N'Đen' and xoa_mem=0);
        declare @msDo  int = (select top 1 id from mau_sac where ten_mau_sac=N'Đỏ' and xoa_mem=0);
        declare @msTrang int = (select top 1 id from mau_sac where ten_mau_sac=N'Trắng' and xoa_mem=0);

        declare @kt41 int = (select top 1 id from kich_thuoc where gia_tri_kich_thuoc=41.0 and xoa_mem=0);
        declare @kt42 int = (select top 1 id from kich_thuoc where gia_tri_kich_thuoc=42.0 and xoa_mem=0);
        declare @kt43 int = (select top 1 id from kich_thuoc where gia_tri_kich_thuoc=43.0 and xoa_mem=0);

        declare @lsTF int = (select top 1 id from loai_san where ten_loai_san like N'%TF%' and xoa_mem=0);
        declare @lsFG int = (select top 1 id from loai_san where ten_loai_san like N'%FG%' and xoa_mem=0);

        declare @fcVua int = (select top 1 id from form_chan where ten_form_chan=N'Form vừa' and xoa_mem=0);

        -- SP1: 4 biến thể
        insert into chi_tiet_san_pham(
            id_san_pham, id_mau_sac, id_kich_thuoc, id_loai_san, id_form_chan,
            so_luong, gia_niem_yet, gia_ban, trang_thai, ghi_chu, xoa_mem
        )
        values
        (@sp1, @msDen,  @kt41, @lsTF, @fcVua, 20, 2500000, 2200000, 1, N'Demo', 0),
        (@sp1, @msDen,  @kt42, @lsTF, @fcVua, 15, 2500000, 2200000, 1, N'Demo', 0),
        (@sp1, @msDo,   @kt42, @lsTF, @fcVua, 10, 2550000, 2250000, 1, N'Demo', 0),
        (@sp1, @msDo,   @kt43, @lsFG, @fcVua,  8, 2650000, 2350000, 1, N'Demo', 0);

        -- SP2: 4 biến thể
        insert into chi_tiet_san_pham(
            id_san_pham, id_mau_sac, id_kich_thuoc, id_loai_san, id_form_chan,
            so_luong, gia_niem_yet, gia_ban, trang_thai, ghi_chu, xoa_mem
        )
        values
        (@sp2, @msTrang, @kt41, @lsTF, @fcVua, 18, 2700000, 2400000, 1, N'Demo', 0),
        (@sp2, @msTrang, @kt42, @lsTF, @fcVua, 12, 2700000, 2400000, 1, N'Demo', 0),
        (@sp2, @msDen,   @kt42, @lsFG, @fcVua,  9, 2800000, 2500000, 1, N'Demo', 0),
        (@sp2, @msDen,   @kt43, @lsFG, @fcVua,  6, 2800000, 2500000, 1, N'Demo', 0);
    end

    if not exists (select 1 from anh_chi_tiet_san_pham)
    begin
        -- Gán ảnh đại diện cho từng CTSP (mỗi CTSP có 1 ảnh la_anh_dai_dien=1 để đúng index filtered)
        declare @ctsp cursor;
        declare @idCtsp int;

        set @ctsp = cursor fast_forward for
            select id from chi_tiet_san_pham where xoa_mem=0 order by id;

        open @ctsp;
        fetch next from @ctsp into @idCtsp;

        while @@fetch_status = 0
        begin
            insert into anh_chi_tiet_san_pham(id_chi_tiet_san_pham, duong_dan_anh, la_anh_dai_dien, mo_ta, xoa_mem)
            values (@idCtsp, concat('/uploads/demo/ctsp_', @idCtsp, '_thumb.jpg'), 1, N'Ảnh đại diện demo', 0);

            -- thêm 1 ảnh phụ (không đại diện)
            insert into anh_chi_tiet_san_pham(id_chi_tiet_san_pham, duong_dan_anh, la_anh_dai_dien, mo_ta, xoa_mem)
            values (@idCtsp, concat('/uploads/demo/ctsp_', @idCtsp, '_extra.jpg'), 0, N'Ảnh phụ demo', 0);

            fetch next from @ctsp into @idCtsp;
        end

        close @ctsp;
        deallocate @ctsp;
    end

    /* =========================
       5) ĐỢT GIẢM GIÁ
       ========================= */

    if not exists (select 1 from dot_giam_gia)
    begin
        insert into dot_giam_gia(
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

    if not exists (select 1 from chi_tiet_dot_giam_gia)
    begin
        declare @dgg int = (select top 1 id from dot_giam_gia where xoa_mem=0 order by id desc);

        -- lấy 3 CTSP đầu để áp dụng demo
        insert into chi_tiet_dot_giam_gia(
            id_dot_giam_gia, id_chi_tiet_san_pham,
            so_luong_ap_dung, gia_tri_giam_rieng, so_tien_giam_toi_da_rieng,
            trang_thai, ghi_chu, xoa_mem
        )
        select top 3
            @dgg, ctsp.id,
            null, null, 300000,
            1, N'Demo áp dụng đợt giảm giá', 0
        from chi_tiet_san_pham ctsp
        where ctsp.xoa_mem=0
        order by ctsp.id;
    end

    /* =========================
       6) PHIẾU GIẢM GIÁ + CHI TIẾT (cá nhân)
       ========================= */

    if not exists (select 1 from phieu_giam_gia)
    begin
        -- Voucher công khai - giảm %
        insert into phieu_giam_gia(
            ten_phieu_giam_gia, loai_phieu_giam_gia, gia_tri_giam_gia, so_tien_giam_toi_da,
            hoa_don_toi_thieu, so_luong_su_dung, ngay_bat_dau, ngay_ket_thuc, trang_thai, mo_ta, xoa_mem
        )
        values
        (N'PGG 10% - Tối đa 200K', 0, 10, 200000, 1000000, 9999,
         dateadd(day, -1, cast(getdate() as date)), dateadd(day, 30, cast(getdate() as date)),
         1, N'Voucher công khai demo', 0),

        -- Voucher công khai - giảm tiền (loai=1)
        (N'PGG 100K', 1, 100000, 100000, 1500000, 9999,
         dateadd(day, -1, cast(getdate() as date)), dateadd(day, 30, cast(getdate() as date)),
         1, N'Voucher công khai demo', 0),

        -- Voucher cá nhân demo (bit trang_thai bật/tắt thủ công)
        (N'PGG Cá nhân 15% - Tối đa 300K', 0, 15, 300000, 800000, 3,
         dateadd(day, -1, cast(getdate() as date)), dateadd(day, 15, cast(getdate() as date)),
         1, N'Voucher cá nhân: gửi mail khi tạo (BE)', 0);
    end

    -- Tạo mapping khách hàng nhận voucher cá nhân (phieu_giam_gia_chi_tiet)
    if not exists (select 1 from phieu_giam_gia_chi_tiet)
    begin
        declare @pggCaNhan int =
            (select top 1 id from phieu_giam_gia where ten_phieu_giam_gia like N'%Cá nhân 15%%' and xoa_mem=0);

        -- lấy 3 KH đầu
        insert into phieu_giam_gia_chi_tiet(id_phieu_giam_gia, id_khach_hang, xoa_mem)
        select @pggCaNhan, kh.id, 0
        from (
            select top 3 id from khach_hang where xoa_mem=0 order by id
        ) kh;
    end

    -- Tạo bản ghi voucher cá nhân (phieu_giam_gia_ca_nhan) để có thể gắn vào hóa đơn theo FK combo
    if not exists (select 1 from phieu_giam_gia_ca_nhan)
    begin
        declare @pggCaNhan2 int =
            (select top 1 id from phieu_giam_gia where ten_phieu_giam_gia like N'%Cá nhân 15%%' and xoa_mem=0);

        insert into phieu_giam_gia_ca_nhan(id_khach_hang, id_phieu_giam_gia, da_su_dung, xoa_mem)
        select ct.id_khach_hang, ct.id_phieu_giam_gia, 0, 0
        from phieu_giam_gia_chi_tiet ct
        where ct.xoa_mem=0 and ct.id_phieu_giam_gia = @pggCaNhan2;
    end

    /* =========================
       7) PHƯƠNG THỨC THANH TOÁN + GIAO DỊCH
       ========================= */

    if not exists (select 1 from phuong_thuc_thanh_toan)
    begin
        insert into phuong_thuc_thanh_toan(ten_phuong_thuc_thanh_toan, nha_cung_cap, trang_thai, xoa_mem)
        values
        (N'Tiền mặt', N'TAI_QUAY', 1, 0),
        (N'Chuyển khoản', N'BANK', 1, 0),
        (N'VNPay', N'VNPAY', 1, 0);
    end

    /* =========================
       8) HÓA ĐƠN + CHI TIẾT + LỊCH SỬ
       ========================= */

    if not exists (select 1 from hoa_don)
    begin
        declare @nv int = (select top 1 id from nhan_vien where ten_tai_khoan='nvbanhang' and xoa_mem=0);
        declare @kh int = (select top 1 id from khach_hang where ten_tai_khoan='kha' and xoa_mem=0);

        declare @pggPublic int = (select top 1 id from phieu_giam_gia where ten_phieu_giam_gia like N'PGG 10%%' and xoa_mem=0);
        declare @pggCaNhanId int = (select top 1 id from phieu_giam_gia where ten_phieu_giam_gia like N'%Cá nhân 15%%' and xoa_mem=0);
        declare @pggcn int = (select top 1 id from phieu_giam_gia_ca_nhan where id_khach_hang=@kh and id_phieu_giam_gia=@pggCaNhanId and xoa_mem=0);

        -- Lấy 2 CTSP để tạo đơn
        declare @ctspA int = (select top 1 id from chi_tiet_san_pham where xoa_mem=0 order by id);
        declare @ctspB int = (select top 1 id from chi_tiet_san_pham where xoa_mem=0 order by id desc);

        /* (1) ĐƠN TẠI QUẦY - mặc định HOÀN THÀNH (6) */
        insert into hoa_don(
            id_khach_hang, id_nhan_vien, id_phieu_giam_gia, id_phieu_giam_gia_ca_nhan,
            loai_don, phi_van_chuyen, tong_tien, tong_tien_sau_giam,
            ten_khach_hang, dia_chi_khach_hang, so_dien_thoai_khach_hang, email_khach_hang,
            trang_thai_hien_tai, ngay_tao, ngay_thanh_toan, ghi_chu, xoa_mem
        )
        values
        (null, @nv, null, null,
         0, 0, 2200000, 2200000,
         N'Khách lẻ', N'Tại quầy', '0909999999', null,
         6, sysdatetime(), sysdatetime(), N'Đơn tại quầy demo', 0);

        declare @hdQuay int = scope_identity();

        insert into hoa_don_chi_tiet(id_hoa_don, id_chi_tiet_san_pham, so_luong, don_gia, ghi_chu, xoa_mem)
        values
        (@hdQuay, @ctspA, 1, 2200000, N'Demo', 0);

        insert into lich_su_hoa_don(id_hoa_don, trang_thai, ghi_chu, xoa_mem)
        values
        (@hdQuay, 6, N'Tạo đơn tại quầy và đã thanh toán tiền mặt', 0);

        /* (2) ĐƠN GIAO HÀNG/ONLINE - đang vận chuyển (3), dùng voucher cá nhân (đủ FK combo) */
        insert into hoa_don(
            id_khach_hang, id_nhan_vien, id_phieu_giam_gia, id_phieu_giam_gia_ca_nhan,
            loai_don, phi_van_chuyen, tong_tien, tong_tien_sau_giam,
            ten_khach_hang, dia_chi_khach_hang, so_dien_thoai_khach_hang, email_khach_hang,
            trang_thai_hien_tai, ngay_tao, ngay_thanh_toan, ghi_chu, xoa_mem
        )
        values
        (@kh, @nv, @pggCaNhanId, @pggcn,
         1, 30000, 2400000, 2100000,
         N'Nguyễn Văn A', N'Số 10 Demo, Láng Hạ, Đống Đa, Hà Nội', '0911111111', 'kha.a@gmail.com',
         3, dateadd(hour, -5, sysdatetime()), null, N'Đơn giao hàng demo', 0);

        declare @hdShip int = scope_identity();

        insert into hoa_don_chi_tiet(id_hoa_don, id_chi_tiet_san_pham, so_luong, don_gia, ghi_chu, xoa_mem)
        values
        (@hdShip, @ctspB, 1, 2100000, N'Demo', 0);

        insert into lich_su_hoa_don(id_hoa_don, trang_thai, ghi_chu, xoa_mem)
        values
        (@hdShip, 1, N'Tạo đơn - chờ xác nhận', 0),
        (@hdShip, 2, N'Đã xác nhận - chờ giao hàng', 0),
        (@hdShip, 3, N'Đang vận chuyển', 0);

        /* Giao dịch thanh toán cho đơn online (demo) */
        declare @ptVnpay int = (select top 1 id from phuong_thuc_thanh_toan where nha_cung_cap=N'VNPAY' and xoa_mem=0);

        insert into giao_dich_thanh_toan(
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
    end

    commit transaction;
    print N'✅ Seed demo data DONE.';
end try
begin catch
    if @@trancount > 0 rollback transaction;
    print N'❌ Seed demo data FAILED: ' + error_message();
    throw;
end catch;
