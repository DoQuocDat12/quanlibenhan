const router = require("express").Router();
const db = require("../config/database");
const { auth, role } = require("../middleware/auth");
const { hashRecord } = require("../services/hashService");
const chain = require("../services/blockchainService");
const { pickData, strip0x, ghiLichSu } = require("../utils/recordUtils");

router.use(auth, role("bac_si"));

// Danh sách bệnh án của bác sĩ đang đăng nhập
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT ba.*, bn.ho_ten AS ten_benh_nhan, bn.ma_ho_so
             FROM benh_an ba JOIN benh_nhan bn ON bn.ma_benh_nhan = ba.ma_benh_nhan
             WHERE ba.ma_bac_si = ? ORDER BY ba.ma_benh_an DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Tạo: lưu DB -> hash -> ghi blockchain -> lưu hash vào DB
router.post("/", async (req, res) => {
    let id;
    try {
        const { ma_benh_nhan, chan_doan, phuong_phap_dieu_tri, ghi_chu } = req.body;
        const [r] = await db.query(
            "INSERT INTO benh_an (ma_benh_nhan, ma_bac_si, chan_doan, phuong_phap_dieu_tri, ghi_chu) VALUES (?, ?, ?, ?, ?)",
            [ma_benh_nhan, req.user.id, chan_doan, phuong_phap_dieu_tri || null, ghi_chu || null]
        );
        id = r.insertId;

        const [rows] = await db.query("SELECT * FROM benh_an WHERE ma_benh_an = ?", [id]);
        const hash = strip0x(hashRecord(pickData(rows[0])));
        const txHash = await chain.createRecord(id, hash);

        await db.query(
            "UPDATE benh_an SET ma_hash = ?, ma_giao_dich_blockchain = ?, dia_chi_smart_contract = ? WHERE ma_benh_an = ?",
            [hash, txHash, process.env.CONTRACT_ADDRESS, id]
        );
        await ghiLichSu(id, req.user.id, "TAO_MOI", `Tạo bệnh án, tx: ${txHash}`);
        res.json({ success: true, ma_benh_an: id, hash, txHash });
    } catch (e) {
        // Ghi blockchain lỗi thì xóa bản ghi vừa tạo để DB không bị lệch
        if (id) await db.query("DELETE FROM benh_an WHERE ma_benh_an = ?", [id]).catch(() => {});
        res.status(500).json({ error: e.message });
    }
});

// Sửa: chỉ sửa bệnh án của mình, ghi phiên bản mới lên blockchain
router.put("/:id", async (req, res) => {
    try {
        const [found] = await db.query("SELECT * FROM benh_an WHERE ma_benh_an = ?", [req.params.id]);
        if (!found.length) return res.status(404).json({ error: "Không tìm thấy bệnh án" });
        if (found[0].ma_bac_si !== req.user.id) return res.status(403).json({ error: "Đây không phải bệnh án của bạn" });

        const { chan_doan, phuong_phap_dieu_tri, ghi_chu } = req.body;
        await db.query(
            "UPDATE benh_an SET chan_doan = ?, phuong_phap_dieu_tri = ?, ghi_chu = ? WHERE ma_benh_an = ?",
            [chan_doan, phuong_phap_dieu_tri || null, ghi_chu || null, req.params.id]
        );
        const [rows] = await db.query("SELECT * FROM benh_an WHERE ma_benh_an = ?", [req.params.id]);
        const hash = strip0x(hashRecord(pickData(rows[0])));
        const txHash = await chain.updateRecord(req.params.id, hash);

        await db.query("UPDATE benh_an SET ma_hash = ?, ma_giao_dich_blockchain = ? WHERE ma_benh_an = ?", [hash, txHash, req.params.id]);
        await ghiLichSu(req.params.id, req.user.id, "CHINH_SUA", `Cập nhật, tx: ${txHash}`);
        res.json({ success: true, hash, txHash });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;