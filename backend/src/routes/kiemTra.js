const router = require("express").Router();
const db = require("../config/database");
const { hashRecord } = require("../services/hashService");
const chain = require("../services/blockchainService");
const { pickData, strip0x } = require("../utils/recordUtils");

router.get("/", async (req, res) => {
    try {
        const { ma_benh_an, ma_ho_so } = req.query;
        const [rows] = await db.query(
            `SELECT ba.*, bn.ho_ten AS ten_benh_nhan, bn.ma_ho_so, nd.ho_ten AS ten_bac_si
             FROM benh_an ba
             JOIN benh_nhan bn ON bn.ma_benh_nhan = ba.ma_benh_nhan
             JOIN nguoi_dung nd ON nd.ma_nguoi_dung = ba.ma_bac_si
             WHERE ba.ma_benh_an = ? AND bn.ma_ho_so = ?`,
            [ma_benh_an, ma_ho_so]
        );
        if (!rows.length) return res.status(404).json({ error: "Không tìm thấy bệnh án, hãy kiểm tra lại mã bệnh án và mã hồ sơ" });

        const r = rows[0];
        const currentHash = strip0x(hashRecord(pickData(r)));
        const valid = await chain.verifyRecord(r.ma_benh_an, currentHash);

        res.json({
            valid,
            ten_benh_nhan: r.ten_benh_nhan,
            ma_ho_so: r.ma_ho_so,
            ten_bac_si: r.ten_bac_si,
            chan_doan: r.chan_doan,
            phuong_phap_dieu_tri: r.phuong_phap_dieu_tri,
            ghi_chu: r.ghi_chu,
            ngay_cap_nhat: r.ngay_cap_nhat,
            ma_hash: r.ma_hash,
            tx_hash: r.ma_giao_dich_blockchain,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;