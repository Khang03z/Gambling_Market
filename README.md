from pathlib import Path

readme_content = """
# 🪙 Gambling Market DApp

Một ứng dụng phi tập trung (DApp) cho phép người dùng đặt cược vào các sự kiện có kết quả nhị phân (Yes/No), sử dụng ví MetaMask và smart contract trên Ethereum.

---

## 🚀 Tính năng

- Kết nối ví MetaMask
- Nạp và rút ETH vào/from contract
- Hiển thị số dư người dùng và quỹ contract
- Hiển thị danh sách các sự kiện
- Đặt cược vào sự kiện đang hoạt động
- Hộp thoại đặt cược hiển thị khi rê chuột vào card sự kiện (active)

---

## 🏗️ Cấu trúc thư mục
├── artifacts/ # (Tùy chọn) Tệp build đầu ra từ Hardhat
├── cache/ # (Tùy chọn) Bộ nhớ tạm của Hardhat
├── contracts/ # Smart contracts (Solidity)
├── frontend/ # Ứng dụng React (UI)
├── scripts/ # Script deploy contract
├── test/ # Kiểm thử contract
├── hardhat.config.js # Cấu hình Hardhat



