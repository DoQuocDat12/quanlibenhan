import { useState } from "react";

const empty = { ma_ho_so: "", ho_ten: "", ngay_sinh: "", gioi_tinh: "Nam", so_dien_thoai: "", dia_chi: "" };

export default function PatientForm({ onSave }) {
  const [p, setP] = useState(empty);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (await onSave(p)) setP(empty);
  };

  return (
    <form onSubmit={submit} className="panel">
      <h2>Thêm bệnh nhân</h2>
      <label>Mã hồ sơ<input required value={p.ma_ho_so} onChange={set("ma_ho_so")} /></label>
      <label>Họ tên<input required value={p.ho_ten} onChange={set("ho_ten")} /></label>
      <div className="row">
        <label>Ngày sinh<input type="date" value={p.ngay_sinh} onChange={set("ngay_sinh")} /></label>
        <label>Giới tính
          <select value={p.gioi_tinh} onChange={set("gioi_tinh")}>
            <option value="Nam">Nam</option><option value="Nu">Nữ</option><option value="Khac">Khác</option>
          </select>
        </label>
      </div>
      <label>Số điện thoại<input value={p.so_dien_thoai} onChange={set("so_dien_thoai")} /></label>
      <label>Địa chỉ<input value={p.dia_chi} onChange={set("dia_chi")} /></label>
      <button>Thêm bệnh nhân</button>
    </form>
  );
}