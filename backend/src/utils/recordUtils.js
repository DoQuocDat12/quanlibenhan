const db = require("../config/database");

// Chỉ hash các trường nghiệp vụ, không hash ngày tạo/cập nhật hay ma_hash
const pickData = (r) => ({
    ma_benh_an: Number(r.ma_benh_an),
    ma_benh_nhan: Number(r.ma_benh_nhan),
    ma_bac_si: Number(r.ma_bac_si),
    chan_doan: r.chan_doan ?? null,
    phuong_phap_dieu_tri: r.phuong_phap_dieu_tri ?? null,
    ghi_chu: r.ghi_chu ?? null,
});

const strip0x = (h) => h.replace(/^0x/, ""); // cột ma_hash là CHAR(64), không có 0x
const add0x = (h) => "0x" + h;               // blockchain nhận có 0x

const ghiLichSu = (maBenhAn, maNguoiDung, hanhDong, moTa) =>
    db.query(
        "INSERT INTO lich_su_benh_an (ma_benh_an, ma_nguoi_dung, hanh_dong, mo_ta) VALUES (?, ?, ?, ?)",
        [maBenhAn, maNguoiDung, hanhDong, moTa]
    );

module.exports = { pickData, strip0x, add0x, ghiLichSu };