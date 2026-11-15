const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    try {
        req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn" });
    }
}

const role = (...allowed) => (req, res, next) =>
    allowed.includes(req.user.vai_tro)
        ? next()
        : res.status(403).json({ error: "Bạn không đủ quyền thực hiện thao tác này" });

module.exports = { auth, role };