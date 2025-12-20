import { Routes, Route, Navigate } from "react-router-dom";

// Pages
// import Mainpage from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { CallPage } from "./components/VideoCall";
// import VideoSection from "./components//Corse.tsx";
// ✅ แก้ชื่อให้ถูก (ไม่ใช่ Corse.tsx)
import CoursePage from "./pages/CoursePage.tsx";
import LiveRoomPage from "./pages/LiveRoomPage.tsx";

// Layout
import Menubar from "./components/Navber.tsx";

// Styles
import "./index.css";
import "./App.css";
import { RequireAuth } from "./components/RequireAuth.tsx";
import { auth } from "./lib/firebase";
// @ts-ignore
function CallRoute() {
  const identity = auth.currentUser?.uid ?? "anonymous";
  return <CallPage identity={identity} />;
}

export default function App() {
  return (
    <div className="min-h-screen max-w-screen overflow-x-hidden flex flex-col">
      <header className="sticky top-0 z-50">
        <Menubar />
      </header>

      <main className="ibm-plex-sans-thai-light">
        <Routes>
          {/* หน้า Home */}
          <Route path="/" element={<Login />} />

          {/* หน้า Login */}
          <Route path="/login" element={<Login />} />

          <Route path="/coursesPage" element={<CoursePage />} />

          <Route path="/call" element={<CallPage identity="anonymous" />} />
          <Route path="/live" element={<LiveRoomPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
