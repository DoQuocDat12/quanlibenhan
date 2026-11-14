
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicalRecord {

    // Thông tin của từng phiên bản bệnh án
    struct RecordVersion {
        string fileHash;
        address doctor;
        uint256 createdAt;
    }

    // Ví bác sĩ triển khai Smart Contract
    address public immutable owner;

    // Mỗi mã bệnh án có nhiều phiên bản
    mapping(string => RecordVersion[]) private records;

    // Sự kiện khi tạo phiên bản bệnh án
    event RecordCreated(
        string indexed recordId,
        uint256 version,
        string fileHash,
        address indexed doctor,
        uint256 createdAt
    );

    // Chỉ bác sĩ sở hữu Contract mới được ghi bệnh án
    modifier onlyDoctor() {
        require(msg.sender == owner, "Only doctor can perform this action");
        _;
    }

    // Người triển khai Contract là bác sĩ
    constructor() {
        owner = msg.sender;
    }

    // Tạo bệnh án hoặc thêm phiên bản mới
    function createRecord(
        string memory _recordId,
        string memory _fileHash
    ) public onlyDoctor {

        require(
            bytes(_recordId).length > 0,
            "Record ID is required"
        );

        require(
            bytes(_fileHash).length == 64,
            "Invalid SHA-256 hash"
        );

        records[_recordId].push(
            RecordVersion({
                fileHash: _fileHash,
                doctor: msg.sender,
                createdAt: block.timestamp
            })
        );

        uint256 version = records[_recordId].length;

        emit RecordCreated(
            _recordId,
            version,
            _fileHash,
            msg.sender,
            block.timestamp
        );
    }

    // Đếm số phiên bản của bệnh án
    function getVersionCount(
        string memory _recordId
    ) public view returns (uint256) {
        return records[_recordId].length;
    }

    // Lấy thông tin một phiên bản cụ thể
    // version bắt đầu từ 1
    function getRecord(
        string memory _recordId,
        uint256 _version
    )
        public
        view
        returns (
            string memory fileHash,
            address doctor,
            uint256 createdAt
        )
    {
        require(
            _version > 0 &&
            _version <= records[_recordId].length,
            "Invalid record version"
        );

        RecordVersion memory record =
            records[_recordId][_version - 1];

        return (
            record.fileHash,
            record.doctor,
            record.createdAt
        );
    }

    // Lấy phiên bản mới nhất
    function getLatestRecord(
        string memory _recordId
    )
        public
        view
        returns (
            string memory fileHash,
            address doctor,
            uint256 createdAt,
            uint256 version
        )
    {
        uint256 count = records[_recordId].length;

        require(count > 0, "Record does not exist");

        RecordVersion memory record =
            records[_recordId][count - 1];

        return (
            record.fileHash,
            record.doctor,
            record.createdAt,
            count
        );
    }

    // Xác minh file với một phiên bản cụ thể
    function verifyRecord(
        string memory _recordId,
        uint256 _version,
        string memory _fileHash
    ) public view returns (bool) {

        if (
            _version == 0 ||
            _version > records[_recordId].length
        ) {
            return false;
        }

        return keccak256(
            bytes(records[_recordId][_version - 1].fileHash)
        ) == keccak256(bytes(_fileHash));
    }
}
