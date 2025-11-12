

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { CallPage } from "./components/VideoCall";
import "./index.css";
import "./App.css";
import Menubar  from "./components/Navber.tsx";

export default function App() {
  return (
    // เต็มหน้าจอ ปิดสกรอลล์แกน X และทำเลย์เอาต์คอลัมน์
    <div className="min-h-screen w-screen overflow-x-hidden flex flex-col">
      {/* ถ้าทำเมนูให้ติดบน ให้ใส่ sticky ได้ */}
      <header className="sticky top-0 z-50">
        <Menubar />
      </header>

      {/* คอนเทนต์ยืดพื้นที่ที่เหลือ และมี padding ด้านใน */}
      <main className="">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/call" element={<CallPage identity="anonymous" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}