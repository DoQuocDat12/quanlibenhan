import { useState } from "react";
import { loginWithMetaMask } from "../services/wallet";

export default function LoginPage({ onLogin }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true); setErr("");
    try {
      const { token, user } = await loginWithMetaMask();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="page narrow">
      <div className="panel">
        <h2>Đăng nhập dành cho bác sĩ</h2>
        <p className="empty">Chọn đúng tài khoản ví đã được cấp quyền trong MetaMask rồi bấm đăng nhập.</p>
        <button disabled={busy} onClick={go}>{busy ? "Đang chờ chữ ký..." : "Đăng nhập bằng MetaMask"}</button>
        {err && <div className="msg bad" style={{ marginTop: 16 }}>{err}</div>}
      </div>
    </div>
  );
}