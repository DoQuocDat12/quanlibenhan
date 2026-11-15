// đăng nhập bằng chữ ký MetaMask
const crypto = require("crypto");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const db = require("../config/database");

const nonces = new Map(); // địa chỉ ví (chữ thường) -> chuỗi cần ký

router.get("/nonce", (req, res) => {
    const address = String(req.query.address || "").toLowerCase();
    const message = `Đăng nhập Quản lý bệnh án\nMã: ${crypto.randomUUID()}`;
    nonces.set(address, message);
    res.json({ message });
});

router.post("/login", async (req, res) => {
    try {
        const address = String(req.body.address || "").toLowerCase();
        const message = nonces.get(address);
        if (!message) return res.status(400).json({ error: "Phiên đăng nhập hết hạn, hãy thử lại" });
        nonces.delete(address);

        const signer = ethers.verifyMessage(message, req.body.signature).toLowerCase();
        if (signer !== address) return res.status(401).json({ error: "Chữ ký không hợp lệ" });

        const [rows] = await db.query(
            "SELECT ma_nguoi_dung, ho_ten, dia_chi_vi, vai_tro FROM nguoi_dung WHERE LOWER(dia_chi_vi) = ? AND trang_thai = 1",
            [address]
        );
        if (!rows.length) return res.status(403).json({ error: "Ví này chưa được cấp quyền hoặc đã bị khóa" });

        const user = rows[0];
        const token = jwt.sign({ id: user.ma_nguoi_dung, vai_tro: user.vai_tro }, process.env.JWT_SECRET, { expiresIn: "8h" });
        res.json({ token, user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;