
const { ethers } = require("hardhat");

async function main() {
    console.log("================================");
    console.log("DEPLOY MEDICAL RECORD CONTRACT");
    console.log("================================");

    // Lấy tài khoản triển khai
    const [doctor] = await ethers.getSigners();

    console.log("Doctor wallet:", doctor.address);

    // Lấy Smart Contract
    const MedicalRecord = await ethers.getContractFactory(
        "MedicalRecord"
    );

    // Triển khai Contract
    const medicalRecord = await MedicalRecord.deploy();

    // Chờ triển khai hoàn tất
    await medicalRecord.waitForDeployment();

    // Lấy địa chỉ Contract
    const contractAddress = await medicalRecord.getAddress();

    console.log("--------------------------------");
    console.log("Contract deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("Doctor address:", await medicalRecord.owner());
    console.log("--------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
