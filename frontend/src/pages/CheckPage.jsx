import { useState } from "react";
import { api } from "../services/api";

export default function CheckPage() {
  const [maBenhAn, setMaBenhAn] = useState("");
  const [maHoSo, setMaHoSo] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(""); setResult(null);
    try {
      const q = new URLSearchParams({ ma_benh_an: maBenhAn, ma_ho_so: maHoSo });
      setResult(await api.get(`/api/kiem-tra?${q}`));
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="page narrow">
      <form onSubmit={check} className="panel">
        <h2>Kiểm tra bệnh án</h2>
        <p className="empty">Nhập mã bệnh án và mã hồ sơ bệnh nhân để xem nội dung và kiểm tra bệnh án có bị chỉnh sửa hay không.</p>
        <label>Mã bệnh án<input required value={maBenhAn} onChange={(e) => setMaBenhAn(e.target.value)} /></label>
        <label>Mã hồ sơ bệnh nhân<input required value={maHoSo} onChange={(e) => setMaHoSo(e.target.value)} /></label>
        <button disabled={busy}>{busy ? "Đang kiểm tra..." : "Kiểm tra"}</button>
      </form>

      {err && <div className="msg bad">{err}</div>}

      {result && (
        <div className="panel">
          <p className={`verdict ${result.valid ? "valid" : "invalid"}`}>
            {result.valid ? "Bệnh án nguyên vẹn, khớp với dữ liệu trên blockchain" : "Cảnh báo: dữ liệu bệnh án đã bị thay đổi so với blockchain"}
          </p>
          <dl className="detail">
            <dt>Bệnh nhân</dt><dd>{result.ten_benh_nhan} ({result.ma_ho_so})</dd>
            <dt>Bác sĩ</dt><dd>{result.ten_bac_si}</dd>
            <dt>Chẩn đoán</dt><dd>{result.chan_doan}</dd>
            <dt>Điều trị</dt><dd>{result.phuong_phap_dieu_tri || "-"}</dd>
            <dt>Ghi chú</dt><dd>{result.ghi_chu || "-"}</dd>
            <dt>Cập nhật lần cuối</dt><dd>{new Date(result.ngay_cap_nhat).toLocaleString("vi-VN")}</dd>
            <dt>Mã hash</dt><dd className="mono">{result.ma_hash}</dd>
            <dt>Mã giao dịch</dt><dd className="mono">{result.tx_hash}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}