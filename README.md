# MediChain — Hồ sơ bệnh án trên blockchain

Ứng dụng mẫu gồm React/Vite, API Node.js/Express, MySQL và smart contract Solidity. MetaMask ký giao dịch trên Sepolia; ứng dụng chỉ ghi mã hồ sơ ngẫu nhiên và SHA-256 của tệp lên blockchain. Tệp bệnh án không được tải lên server hay blockchain.

> Đây là bản demo học tập, chưa phải hệ thống y tế sẵn sàng sử dụng thực tế. Không dùng dữ liệu bệnh nhân thật. Blockchain công khai và không thể xóa; hash cũng có thể bị đối chiếu nếu dữ liệu đầu vào dễ đoán.

## 1. Chuẩn bị môi trường

- Node.js LTS và npm
- XAMPP/MySQL hoặc MySQL Server
- MetaMask trên trình duyệt
- Ví thử nghiệm đã chuyển sang **Sepolia** và có Sepolia ETH testnet

Các thư mục `frontend`, `backend`, `blockchain` đã được tạo sẵn trong dự án. Cài dependencies (nếu chưa có):

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

## 2. Tạo database MySQL

Khởi động MySQL trong XAMPP, mở phpMyAdmin/Workbench và chạy:

```sql
CREATE DATABASE medical_records
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

API tự tạo bảng `medical_records` khi khởi động lần đầu. Bảng lưu mã tham chiếu, loại hồ sơ, hash, địa chỉ ví và mã giao dịch; không lưu tệp bệnh án.

## 3. Cấu hình `.env`

Tạo file `backend/.env` từ `backend/.env.example`, rồi chỉnh thông tin MySQL của máy:

```env
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=medical_records
```

Sau khi deploy contract bằng Remix (bước 4), tạo `frontend/.env` từ `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_MEDICAL_RECORD_CONTRACT_ADDRESS=0xDiaChiContractSauKhiDeploy
```

Địa chỉ contract ở dòng cuối là địa chỉ **được deploy trên Sepolia**. Không đặt private key hoặc seed phrase vào bất kỳ file `.env` nào của frontend. Khởi động lại Vite sau khi đổi env.

## 4. Biên dịch và deploy contract bằng Remix IDE

1. Mở [Remix IDE](https://remix.ethereum.org/) và tạo file `MedicalRecord.sol`.
2. Sao chép nội dung từ `blockchain/contracts/MedicalRecord.sol` vào file Remix.
3. Mở **Solidity Compiler**, chọn phiên bản `0.8.28` (hoặc bản tương thích `^0.8.28`) rồi chọn **Compile MedicalRecord.sol**.
4. Mở MetaMask, chọn mạng **Sepolia** và tài khoản bác sĩ dùng để triển khai. Nạp Sepolia ETH testnet để trả gas.
5. Trong **Deploy & Run Transactions**, chọn **Injected Provider - MetaMask**. Kiểm tra chain là Sepolia, chọn contract `MedicalRecord`, nhấn **Deploy** và xác nhận trong MetaMask.
6. Sao chép địa chỉ contract vừa deploy từ **Deployed Contracts**, điền vào `VITE_MEDICAL_RECORD_CONTRACT_ADDRESS` trong `frontend/.env`.
7. Tài khoản deploy trở thành `owner`/bác sĩ duy nhất được gọi `createRecord`. Cần dùng đúng tài khoản đó khi tạo hồ sơ trong website.

Contract hiện có các hàm `createRecord(recordId, fileHash)`, `getRecord`, `getLatestRecord`, `getVersionCount` và `verifyRecord`. Bản website tính hash SHA-256 tại trình duyệt trước khi gửi giao dịch.

## 5. Chạy website và API

Mở hai terminal riêng:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Mở URL Vite hiển thị trên terminal (mặc định `http://localhost:5173`), kết nối MetaMask và xác nhận Sepolia. `/api/health` trả trạng thái kết nối MySQL; nếu backend/MySQL chưa chạy, giao diện hiển thị chế độ xem trước.

## 6. Luồng tạo hồ sơ

1. Kết nối MetaMask bằng tài khoản deploy contract trên Sepolia.
2. Chọn **Tạo hồ sơ mới**, nhập mã tham chiếu không định danh trực tiếp và chọn loại hồ sơ.
3. Chọn tệp. Trình duyệt chỉ đọc tệp để tính SHA-256; tệp gốc không được tải lên.
4. Xác nhận giao dịch trong MetaMask. Khi giao dịch được xác nhận, API lưu metadata và transaction hash vào MySQL.

Nếu giao dịch thành công nhưng lưu MySQL thất bại, website sẽ báo rõ transaction hash; không gửi lại giao dịch một cách tự động.

## Lưu ý bảo mật và giới hạn

- Không ghi tên, CCCD, chẩn đoán hoặc dữ liệu sức khỏe lên blockchain. Mã bệnh án và hash giao dịch là dữ liệu công khai.
- Contract mẫu chỉ cho owner ghi hồ sơ, chưa có phân quyền bác sĩ/bệnh nhân, thu hồi quyền, quản lý khóa hay kiểm soát truy cập hồ sơ.
- Dữ liệu MySQL của bản demo chưa mã hóa và API chưa có xác thực người dùng. Không triển khai lên môi trường thật nếu chưa bổ sung xác thực, phân quyền, mã hóa và đánh giá pháp lý/bảo mật.
- Nếu cần tra cứu/đối chiếu trên-chain, dùng Remix Read Contract hoặc bổ sung backend/indexer đọc các event; website hiện tập trung vào luồng tạo hồ sơ.
