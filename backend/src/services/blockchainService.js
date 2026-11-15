require("dotenv").config();
const { ethers } = require("ethers");
const artifact = require("../config/MedicalRecordABI.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, artifact.abi || artifact, wallet);

// Contract không có updateRecord, nên mình giả định createRecord gọi lại
// với cùng recordId sẽ thêm một phiên bản mới (vì có getVersionCount)
async function createRecord(id, hash) {
    const tx = await contract.createRecord(String(id), hash);
    return (await tx.wait()).hash;
}
const updateRecord = createRecord;

// Gom mọi giá trị trong kết quả trả về (kể cả struct lồng nhau) thành một mảng phẳng
function flatten(v) {
    if (Array.isArray(v)) return v.flatMap(flatten);
    return [v];
}

// So hash hiện tại với phiên bản MỚI NHẤT đang lưu trên blockchain
async function verifyRecord(id, hash) {
    try {
        const latest = await contract.getLatestRecord(String(id));
        return flatten(Array.from(latest)).some((x) => x === hash);
    } catch {
        return false; // chưa có bệnh án này trên blockchain
    }
}

async function getVersionCount(id) {
    return Number(await contract.getVersionCount(String(id)));
}

module.exports = { createRecord, updateRecord, verifyRecord, getVersionCount };