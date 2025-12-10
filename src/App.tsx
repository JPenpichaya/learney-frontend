import { Routes, Route, Navigate } from "react-router-dom";
import Mainpage from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { CallPage } from "./components/VideoCall";
import VideoSection from "./components/Corse.tsx";
import { TokenProvider } from "./context/TokenContext";
import Menubar from "./components/Navber.tsx";
import "./index.css";
import "./App.css";

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

            {/* คอร์สเรียน */}
            <Route path="/call" element={<CallPage identity="anonymous" />} />
            <Route
              path="/reviews"
              element={
                <VideoSection courseId="1eb885ee-b4b9-4be5-a6d3-d6e037e0c0a7" />
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </TokenProvider>
  );
}
