const { pickData, strip0x, add0x } = require("./utils/recordUtils");

// 1. Dữ liệu hồ sơ bệnh án mẫu
const benhAn = {
    ma_benh_an: 1,
    ma_benh_nhan: 5,
    ma_bac_si: 2,
    chan_doan: "Viêm họng",
    phuong_phap_dieu_tri: "Uống thuốc",
    ghi_chu: "Tái khám sau 7 ngày",
    ngay_tao: "2026-11-15",
    ma_hash: "abc123"
};

console.log("=== 1. DỮ LIỆU BAN ĐẦU ===");
console.log(benhAn);

// 2. Chọn dữ liệu cần Hash
const data = pickData(benhAn);

console.log("\n=== 2. DỮ LIỆU SAU KHI PICK ===");
console.log(data);

// 3. Bỏ tiền tố 0x
const hash = "0xabcdef123456";

console.log("\n=== 3. STRIP 0x ===");
console.log(strip0x(hash));

// 4. Thêm tiền tố 0x
console.log("\n=== 4. ADD 0x ===");
console.log(add0x("abcdef123456"));