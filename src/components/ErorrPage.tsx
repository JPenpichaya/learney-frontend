import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function ErorrPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [seconds, setSeconds] = useState(3);

  const courseId = sp.get("courseId") || "";
  const isMock = sp.get("mock") === "1";

  // ✅ Mainpage จริงของระบบ
  const redirectTo = useMemo(() => "/", []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          navigate(redirectTo, { replace: true });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [navigate, redirectTo]);

  return (
    <section className="w-screen h-screen flex flex-col items-center justify-center text-center bg-white px-6">
      <img
        src="/img/ErrorBuy.svg"
        alt="Payment Failed"
        className="w-[20rem] ml-14"
      />

      <h1 className="text-3xl mb-3 text-black font-semibold">
        การชำระเงินไม่สำเร็จ ❌
      </h1>

      <p className="text-red-600 text-lg font-light" aria-live="polite">
        {isMock ? "โหมดทดสอบ (MOCK)" : "มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง"}
        {courseId && (
          <>
            {" "}
            <span className="text-black/60">Course:</span>{" "}
            <span className="text-black font-normal">{courseId}</span>
          </>
        )}
        <br />
        กำลังพากลับไปหน้า{" "}
        <span className="font-normal text-black">หน้าหลัก</span> ใน{" "}
        <span className="font-normal text-black">{seconds}</span> วินาที...
      </p>

      {/* progress bar */}
      <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-1000"
          style={{ width: `${(seconds / 3) * 100}%` }}
        />
      </div>

      {/* actions */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          กลับหน้าหลัก
        </button>

        <Link
          to="/CoursesPage"
          className="px-4 py-2 rounded-xl border border-black bg-white text-black"
        >
          ไปหน้า Courses
        </Link>
      </div>
    </section>
  );
}
