import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Menubar() {
  const [isOpen, setIsOpen] = useState(false); // เปิด/ปิดเมนูมือถือ
  const [lang, setLang] = useState<"TH" | "EN">("TH"); // ภาษา

  const toggleMenu = () => setIsOpen((v) => !v);
  const toggleLang = () => setLang((prev) => (prev === "TH" ? "EN" : "TH"));

  // ล็อกสกรอลล์พื้นหลังเวลาเมนูมือถือเปิด
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // คลิกลิงก์แล้วปิดเมนูมือถือ
  const linkProps = { onClick: () => setIsOpen(false) };

  return (
    <>
      {/* แถบด้านบน (ใช้ทั้ง mobile + desktop) */}
      <header className="fixed text-black top-0 left-0 w-full h-14.5 lg:h-16 flex items-center border-b-[3px] border-[#EA688E] bg-white z-40">
        {/* โลโก้ */}
        <div className="ml-2 lg:ml-4 flex-1 flex items-center">
          <a href="/#Home" className="hover:text-[#EA688E] transition-colors">
            {/* โลโก้ยาวสำหรับจอใหญ่ */}
            <img
              src="/img/Logo/(Long)Learney-Journey_logo.png"
              alt="Learney Journey Logo"
              className="hidden lg:flex h-full max-h-15 object-contain"
            />
            {/* โลโก้สั้นสำหรับมือถือ */}
            <img
              src="/img/Logo/Learney-Journey_logo.png"
              alt="Learney Journey Logo"
              className="lg:hidden h-full max-h-12 object-contain"
            />
          </a>
        </div>

        {/* เมนูเดสก์ท็อป */}
        <nav className="hidden lg:flex items-center justify-end mr-8">
          <ul className="flex items-center space-x-6 font-light">
            <a
              href="/#Courespackage"
              className="hover:text-[#EA688E] transition-colors"
            >
              <li className="ibm-plex-sans-thai-light">
                {lang === "TH" ? "คอร์สเรียน" : "Courses"}
              </li>
            </a>

            <a
              href="/#Reviews"
              className="hover:text-[#EA688E] transition-colors"
            >
              <li className="ibm-plex-sans-thai-light">
                {lang === "TH" ? "รีวิว" : "Reviews"}
              </li>
            </a>

            <a
              href="/#AboutUs"
              className="hover:text-[#EA688E] transition-colors"
            >
              <li className="ibm-plex-sans-thai-light">
                {lang === "TH" ? "เกี่ยวกับเรา" : "About Us"}
              </li>
            </a>
            <a
              href="/#Contact"
              className="hover:text-[#EA688E] transition-colors"
            >
              <li className="ibm-plex-sans-thai-light">
                {lang === "TH" ? "ติดต่อเรา" : "Contact"}
              </li>
            </a>
            <Link
              to="/Login"
              className="hover:text-[#EA688E] transition-colors"
            >
              <li className="ibm-plex-sans-thai-light">
                {lang === "TH" ? "เข้าสู่ระบบ" : "Login"}
              </li>
            </Link>

            {/* ปุ่มสลับภาษา */}
            <li>
              <button
                onClick={toggleLang}
                className="ml-2 w-10 h-10 flex items-center justify-center rounded-full border border-[#EA688E] hover:bg-[#EA688E]/10 transition-transform duration-300 hover:scale-110"
                title={
                  lang === "TH" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"
                }
                aria-label={
                  lang === "TH" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"
                }
              >
                <img src="/img/imgMunu/Lang-icon.svg" alt="" className="w-5" />
              </button>
            </li>
          </ul>
        </nav>

        {/* ปุ่ม Hamburger สำหรับมือถือ */}
        {/* ปุ่ม Hamburger สำหรับมือถือ */}
        <button
          className="lg:hidden flex-none -mt-1.5 mr-3 h-5 w-6 relative"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="side-menu"
        >
          <img src="/img/icon/menu_4204600.png" alt="" className="" />
        </button>
      </header>

      {/* Backdrop มือถือ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Side menu มือถือ */}
      <aside
        id="side-menu"
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 w-[250px] h-full shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } bg-white z-90 overflow-hidden lg:hidden`}
      >
        <nav className="w-full pt-14 pb-8 text-sm">
          <ul className="list-none relative">
            <Link to="/call" {...linkProps}>
              <li className="mb-[3px] h-[60px] bg-[#BEEBE9] hover:bg-[url('/img/Star.gif')] hover:text-white flex items-center text-black">
                <p className="px-4 font-medium">
                  {lang === "TH" ? "คอร์สเรียน" : "Courses"}
                </p>
              </li>
            </Link>

            <Link to="/call" {...linkProps}>
              <li className="mb-[3px] h-[60px] bg-[#F6EEC7] hover:bg-[url('/img/Star.gif')] hover:text-white flex items-center text-black">
                <p className="px-4 font-medium">
                  {lang === "TH" ? "รีวิว" : "Reviews"}
                </p>
              </li>
            </Link>

            <Link to="/call" {...linkProps}>
              <li className="mb-[3px] h-[60px] bg-[#F4DADA] hover:bg-[url('/img/Star.gif')] hover:text-white flex items-center text-black">
                <p className="px-4 font-medium">
                  {lang === "TH" ? "เกี่ยวกับเรา" : "About Us"}
                </p>
              </li>
            </Link>

            <Link to="/call" {...linkProps}>
              <li className="mb-[3px] h-[60px] bg-[#FFB6B9] hover:bg-[url('/img/Star.gif')] hover:text-white flex items-center text-black">
                <p className="px-4 font-medium">
                  {lang === "TH" ? "ติดต่อเรา" : "Contact"}
                </p>
              </li>
            </Link>

            <Link to="/Login" {...linkProps}>
              <li className="mb-[3px] h-[60px] bg-[#FFB6B9] hover:bg-[url('/img/Star.gif')] hover:text-white flex items-center text-black">
                <p className="px-4 font-medium">
                  {lang === "TH" ? "เข้าสู่ระบบ" : "Login"}
                </p>
              </li>
            </Link>
          </ul>

          {/* ปุ่มกลับ Home / Brand */}
          <Link to="/">
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-black font-bold text-center">
              <img
                src="/img/Logo/Learney-Journey_logo.png"
                alt="Learney Journey Logo"
                className="lg:hidden h-full max-h-14 object-contain"
              />
            </div>
          </Link>
        </nav>

        {/* ปุ่มปิดเมนู (ไอคอน X เพิ่มเติมถ้าอยากใช้รูป) */}
        <button
          className="absolute top-4 left-4 text-black text-3xl z-50"
          onClick={toggleMenu}
          aria-label="Close"
        >
          <img src="/img/icon/Close-icon.svg" alt="" className="w-3 mt-1" />
        </button>
      </aside>
    </>
  );
}
