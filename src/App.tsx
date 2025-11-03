

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { CallPage } from "./components/VideoCall";
import "./index.css";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/call" element={<CallPage identity="anonymous" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
