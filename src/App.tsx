import { Routes, Route, Navigate } from "react-router-dom";
import Mainpage from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { CallPage } from "./components/VideoCall";
// import VideoSection from "./components/Corse.tsx";
import { TokenProvider } from "./context/TokenContext";
import Menubar from "./components/Navber.tsx";
import "./index.css";
import "./App.css";
import LessonVideoTracker from "./components/CourseTry.tsx";
import InfoCourse from "./components/InfoCourse.tsx";

export default function App() {
  return (
    <TokenProvider>
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
            <Route path="/InfoCourse" element={<InfoCourse />} />
            {/* คอร์สเรียน */}
            <Route path="/call" element={<CallPage identity="anonymous" />} />
            {/* <Route path="/reviews" element={<VideoSection />} /> */}
            <Route path="/courses" element={<LessonVideoTracker useMock />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </TokenProvider>
  );
}
