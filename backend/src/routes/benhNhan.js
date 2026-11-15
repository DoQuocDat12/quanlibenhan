const router = require("express").Router();
const db = require("../config/database");
const { auth, role } = require("../middleware/auth");

router.use(auth, role("bac_si"));

router.get("/", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM benh_nhan ORDER BY ma_benh_nhan DESC");
    res.json(rows);
});

router.post("/", async (req, res) => {
    try {
        const { ma_ho_so, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi } = req.body;
        const [r] = await db.query(
            "INSERT INTO benh_nhan (ma_ho_so, ho_ten, ngay_sinh, gioi_tinh, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)",
            [ma_ho_so, ho_ten, ngay_sinh || null, gioi_tinh || null, so_dien_thoai || null, dia_chi || null]
        );
        res.json({ success: true, ma_benh_nhan: r.insertId });
    } catch (e) {
        res.status(500).json({ error: e.code === "ER_DUP_ENTRY" ? "Mã hồ sơ đã tồn tại" : e.message });
    }
});

module.exports = router;