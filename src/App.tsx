import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Mainpage from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { CallPage } from "./components/VideoCall";
import VideoSection from "./components//Corse.tsx";
// ✅ แก้ชื่อให้ถูก (ไม่ใช่ Corse.tsx)

// Layout
import Menubar from "./components/Navber.tsx";

// Styles
import "./index.css";
import "./App.css";

export default function App() {
  return (
    <div className="min-h-screen max-w-screen overflow-x-hidden flex flex-col">
      <header className="sticky top-0 z-50">
        <Menubar />
      </header>

      <main className="ibm-plex-sans-thai-light">
        <Routes>
          {/* หน้า Home */}
          <Route path="/" element={<Mainpage />} />

          {/* หน้า Login */}
          <Route path="/login" element={<Login />} />

          {/* คอร์สเรียน */}
          <Route path="/call" element={<CallPage identity="anonymous" />} />
          <Route path="/reviews" element={<VideoSection />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
