require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Backend QuanLyBenhAnBlockchain is running!" }));

app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/benh-nhan", require("./routes/benhNhan"));
app.use("/api/benh-an", require("./routes/benhAn"));
app.use("/api/kiem-tra", require("./routes/kiemTra"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));