import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ErorrPage() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(3); // ⏱ ปรับเวลานับถอยหลังได้

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          navigate("/Shop"); // ✅ ไปหน้า Shop อัตโนมัติ
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <section
      className="w-screen h-screen flex flex-col items-center justify-center text-center bg-white"
      id="ErorrPage"
    >
      <img
        src="/img/icon/ErrorBuy.svg"
        alt="Payment Failed"
        className="w-[20rem] ml-14"
      />
      <h1 className="text-3xl mb-4 text-black font-semibold">
        การชำระสินค้าไม่สำเร็จ
      </h1>
      {/* แสดงเวลานับถอยหลัง */}
      <p className="text-red-500 text-xl font-light" aria-live="polite">
        กรุณาทำรายการใหม่อีกครั้งที่หน้า{" "}
        <span className="font-light">Shop</span> ภายใน{" "}
        <span className="font-light text-black">{seconds}</span> วินาที...
      </p>

      {/* แถบ progress bar */}
      <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-1000"
          style={{ width: `${(seconds / 3) * 100}%` }}
        ></div>
      </div>
    </section>
  );
}
