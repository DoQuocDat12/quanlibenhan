import { useEffect, useState } from "react";

const empty = { ma_benh_nhan: "", chan_doan: "", phuong_phap_dieu_tri: "", ghi_chu: "" };

export default function RecordForm({ patients, editing, busy, onSave, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(editing ? {
      ma_benh_nhan: editing.ma_benh_nhan, chan_doan: editing.chan_doan,
      phuong_phap_dieu_tri: editing.phuong_phap_dieu_tri || "", ghi_chu: editing.ghi_chu || "",
    } : empty);
  }, [editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (await onSave(form, editing?.ma_benh_an)) setForm(empty);
  };

  return (
    <form onSubmit={submit} className="panel">
      <h2>{editing ? `Sửa bệnh án #${editing.ma_benh_an}` : "Tạo bệnh án mới"}</h2>
      <label>Bệnh nhân
        <select required disabled={!!editing} value={form.ma_benh_nhan} onChange={set("ma_benh_nhan")}>
          <option value="">Chọn bệnh nhân</option>
          {patients.map((p) => <option key={p.ma_benh_nhan} value={p.ma_benh_nhan}>{p.ma_ho_so} - {p.ho_ten}</option>)}
        </select>
      </label>
      <label>Chẩn đoán<textarea required value={form.chan_doan} onChange={set("chan_doan")} /></label>
      <label>Phương pháp điều trị<textarea value={form.phuong_phap_dieu_tri} onChange={set("phuong_phap_dieu_tri")} /></label>
      <label>Ghi chú<textarea value={form.ghi_chu} onChange={set("ghi_chu")} /></label>
      <div className="row">
        <button disabled={busy}>{busy ? "Đang ghi blockchain..." : editing ? "Lưu thay đổi" : "Tạo bệnh án"}</button>
        {editing && <button type="button" className="ghost" onClick={onCancel}>Hủy sửa</button>}
      </div>
    </form>
  );
}