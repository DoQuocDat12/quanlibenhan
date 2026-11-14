
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecord", function () {

    let medicalRecord;
    let doctor;
    let anotherDoctor;

    const recordId = "BA001";
    const hashV1 = "a".repeat(64);
    const hashV2 = "b".repeat(64);
    const hashV3 = "c".repeat(64);

    // Triển khai Contract trước mỗi test
    beforeEach(async function () {
        [doctor, anotherDoctor] = await ethers.getSigners();

        const MedicalRecord = await ethers.getContractFactory(
            "MedicalRecord"
        );

        medicalRecord = await MedicalRecord.deploy();
        await medicalRecord.waitForDeployment();
    });

    // 1. Kiểm tra triển khai Contract
    it("Should deploy successfully", async function () {
        expect(await medicalRecord.getAddress()).to.be.properAddress;
        expect(await medicalRecord.owner()).to.equal(doctor.address);
    });

    // 2. Bác sĩ tạo bệnh án lần đầu
    it("Should create the first medical record version", async function () {
        await medicalRecord.createRecord(recordId, hashV1);

        expect(
            await medicalRecord.getVersionCount(recordId)
        ).to.equal(1);

        const record = await medicalRecord.getRecord(recordId, 1);

        expect(record.fileHash).to.equal(hashV1);
        expect(record.doctor).to.equal(doctor.address);
        expect(record.createdAt).to.be.greaterThan(0n);
    });

    // 3. Bác sĩ chỉnh sửa và tạo phiên bản mới
    it("Should create a new version without overwriting the old one", async function () {
        await medicalRecord.createRecord(recordId, hashV1);
        await medicalRecord.createRecord(recordId, hashV2);

        expect(
            await medicalRecord.getVersionCount(recordId)
        ).to.equal(2);

        const version1 = await medicalRecord.getRecord(recordId, 1);
        const version2 = await medicalRecord.getRecord(recordId, 2);

        expect(version1.fileHash).to.equal(hashV1);
        expect(version2.fileHash).to.equal(hashV2);
    });

    // 4. Lấy phiên bản mới nhất
    it("Should return the latest version correctly", async function () {
        await medicalRecord.createRecord(recordId, hashV1);
        await medicalRecord.createRecord(recordId, hashV2);
        await medicalRecord.createRecord(recordId, hashV3);

        const latest = await medicalRecord.getLatestRecord(recordId);

        expect(latest.fileHash).to.equal(hashV3);
        expect(latest.doctor).to.equal(doctor.address);
        expect(latest.version).to.equal(3n);
    });

    // 5. Xác minh hash hợp lệ
    it("Should verify a correct file hash", async function () {
        await medicalRecord.createRecord(recordId, hashV1);

        const result = await medicalRecord.verifyRecord(
            recordId,
            1,
            hashV1
        );

        expect(result).to.equal(true);
    });

    // 6. Phát hiện file bị chỉnh sửa
    it("Should detect a modified file hash", async function () {
        await medicalRecord.createRecord(recordId, hashV1);

        const result = await medicalRecord.verifyRecord(
            recordId,
            1,
            hashV2
        );

        expect(result).to.equal(false);
    });

    // 7. Không cho phép ví khác tạo bệnh án
    it("Should reject transactions from unauthorized wallets", async function () {
        await expect(
            medicalRecord.connect(anotherDoctor).createRecord(
                recordId,
                hashV1
            )
        ).to.be.revertedWith(
            "Only doctor can perform this action"
        );
    });

    // 8. Không cho phép mã bệnh án rỗng
    it("Should reject an empty record ID", async function () {
        await expect(
            medicalRecord.createRecord("", hashV1)
        ).to.be.revertedWith("Record ID is required");
    });

    // 9. Không cho phép mã hash không đủ 64 ký tự
    it("Should reject an invalid SHA-256 hash", async function () {
        await expect(
            medicalRecord.createRecord(recordId, "abc123")
        ).to.be.revertedWith("Invalid SHA-256 hash");
    });

    // 10. Không cho phép lấy phiên bản không tồn tại
    it("Should reject an invalid version", async function () {
        await medicalRecord.createRecord(recordId, hashV1);

        await expect(
            medicalRecord.getRecord(recordId, 2)
        ).to.be.revertedWith("Invalid record version");
    });

    // 11. Không tìm thấy bệnh án chưa tồn tại
    it("Should reject getting a non-existing record", async function () {
        await expect(
            medicalRecord.getLatestRecord("BA999")
        ).to.be.revertedWith("Record does not exist");
    });

    // 12. Không xác minh được phiên bản không tồn tại
    it("Should return false for a non-existing version", async function () {
        const result = await medicalRecord.verifyRecord(
            recordId,
            1,
            hashV1
        );

        expect(result).to.equal(false);
    });

});
