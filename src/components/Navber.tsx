import { Link } from "react-router-dom";
import { useState } from "react";

export default function Menubar() {
  const [lang, setLang] = useState<"TH" | "EN">("TH");

  const toggleLang = () => setLang((prev) => (prev === "TH" ? "EN" : "TH"));

  return (
    <div className="fixed top-0 left-0 w-full h-16 flex items-center border-b-[3px] border-[#EA688E] bg-white z-50">
      {/* โลโก้ */}
      <div className="ml-4 flex-1 flex items-center">
        <img
          src="/img/Logo/(Long)Learney-Journey_logo.png"
          alt="Learney Journey Logo"
          className="h-15 object-contain"
        />
      </div>

      {/* เมนู */}
      <nav className="flex-auto flex items-center justify-end mr-8">
        <ul className="flex items-center space-x-6 font-light">
          <Link to="/call" className="hover:text-[#EA688E] transition-colors">
            <li className="ibm-plex-sans-thai-light">
              {lang === "TH" ? "คอร์สเรียน" : "Courses"}
            </li>
          </Link>
          <Link to="/call" className="hover:text-[#EA688E] transition-colors">
            <li className="ibm-plex-sans-thai-light">
              {lang === "TH" ? "รีวิว" : "Reviews"}
            </li>
          </Link>
          <Link to="/call" className="hover:text-[#EA688E] transition-colors">
            <li className="ibm-plex-sans-thai-light">
              {lang === "TH" ? "เกี่ยวกับเรา" : "About Us"}
            </li>
          </Link>
          <Link to="/call" className="hover:text-[#EA688E] transition-colors">
            <li className="ibm-plex-sans-thai-light">
              {lang === "TH" ? "ติดต่อเรา" : "Contact"}
            </li>
          </Link>
          <Link to="/" className="hover:text-[#EA688E] transition-colors">
            <li className="ibm-plex-sans-thai-light">
              {lang === "TH" ? "เข้าสู่ระบบ" : "Login"}
            </li>
          </Link>

          {/* ปุ่มสลับภาษาเป็นไอคอน SVG */}
          <li>
            <button
              onClick={toggleLang}
              className="ml-4 w-10 h-10 flex items-center justify-center rounded-full border border-[#EA688E] hover:bg-[#EA688E]/10 transition-transform duration-300 hover:scale-110"
              title={lang === "TH" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
              aria-label={
                lang === "TH" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"
              }
            >
              <img
                src="/img/imgMunu/Lang-icon.svg"
                alt="Language"
                className="w-6 h-6 object-contain"
              />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
