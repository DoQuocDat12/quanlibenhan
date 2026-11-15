const crypto = require("crypto");

// Sắp xếp key để cùng dữ liệu luôn ra cùng hash
function canonical(obj) {
    if (Array.isArray(obj)) return obj.map(canonical);
    if (obj && typeof obj === "object") {
        return Object.keys(obj).sort().reduce((r, k) => {
            r[k] = canonical(obj[k]);
            return r;
        }, {});
    }
    return obj;
}

function hashRecord(data) {
    return "0x" + crypto.createHash("sha256").update(JSON.stringify(canonical(data))).digest("hex");
}

module.exports = { hashRecord };