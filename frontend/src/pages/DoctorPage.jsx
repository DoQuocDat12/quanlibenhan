import { useEffect, useState } from "react";
import { api } from "../services/api";
import LoginPage from "./LoginPage";
import RecordForm from "../components/RecordForm";
import PatientForm from "../components/PatientForm";
import RecordTable from "../components/RecordTable";

export default function DoctorPage() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const logout = () => { localStorage.clear(); setUser(null); };

  if (!user) return <LoginPage onLogin={setUser} />;
  if (user.vai_tro !== "bac_si") {
    return (
      <div className="page narrow">
        <div className="msg bad">Tài khoản này không phải bác sĩ nên không nhập được bệnh án.</div>
        <button className="ghost" onClick={logout}>Đăng xuất</button>
      </div>
    );
  }
  return <DoctorWork user={user} onLogout={logout} />;
}

function DoctorWork({ user, onLogout }) {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const notify = (text, ok = true) => setMsg({ text, ok });

  const load = async () => {
    try {
      const [r, p] = await Promise.all([api.get("/api/benh-an"), api.get("/api/benh-nhan")]);
      setRecords(r); setPatients(p);
    } catch (e) { notify(e.message, false); }
  };

  useEffect(() => { load(); }, []);

  const run = async (action, okText) => {
    try { await action(); notify(okText); await load(); return true; }
    catch (e) { notify(e.message, false); return false; }
  };

  const saveRecord = async (form, id) => {
    setBusy(true);
    const ok = await run(
      () => (id ? api.put(`/api/benh-an/${id}`, form) : api.post("/api/benh-an", form)),
      id ? "Đã cập nhật và ghi phiên bản mới lên blockchain" : "Đã tạo bệnh án và ghi hash lên blockchain"
    );
    setBusy(false);
    if (ok) setEditing(null);
    return ok;
  };

  const savePatient = (data) => run(() => api.post("/api/benh-nhan", data), "Đã thêm bệnh nhân");

  return (
    <div className="page">
      <div className="who bar">
        <span>Bác sĩ <b>{user.ho_ten}</b></span>
        <button className="ghost" onClick={onLogout}>Đăng xuất</button>
      </div>
      {msg && <div className={`msg ${msg.ok ? "ok" : "bad"}`} onClick={() => setMsg(null)}>{msg.text}</div>}

      <div className="grid">
        <RecordForm patients={patients} editing={editing} busy={busy} onSave={saveRecord} onCancel={() => setEditing(null)} />
        <PatientForm onSave={savePatient} />
      </div>

      <RecordTable records={records} onEdit={(r) => { setEditing(r); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </div>
  );
}