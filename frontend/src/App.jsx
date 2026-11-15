import { useState } from "react";
import "./App.css";
import DoctorPage from "./pages/DoctorPage";
import CheckPage from "./pages/CheckPage";

export default function App() {
  const [tab, setTab] = useState("check");
  return (
    <>
      <nav className="tabs">
        <button className={tab === "check" ? "active" : ""} onClick={() => setTab("check")}>Kiểm tra bệnh án</button>
        <button className={tab === "doctor" ? "active" : ""} onClick={() => setTab("doctor")}>Bác sĩ</button>
      </nav>
      {tab === "check" ? <CheckPage /> : <DoctorPage />}
    </>
  );
}