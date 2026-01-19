import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function SuccessfullyBuy() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [seconds, setSeconds] = useState(3); // ⏱ เวลานับถอยหลัง

  const courseId = sp.get("courseId") || "";
  const isMock = sp.get("mock") === "1";

  // ✅ ปลายทางหลังชำระเงินสำเร็จ
  const redirectTo = useMemo(() => {
    // ส่ง courseId ไปหน้า InfoCourse ด้วย
    return courseId ?
        `/InfoCourse?courseId=${encodeURIComponent(courseId)}`
      : "/InfoCourse";
  }, [courseId]);

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
        src="./img/icon/SuccessfullyBuy.svg"
        alt="Payment Success"
        className="w-[20rem] ml-14"
      />

      <h1 className="text-3xl mb-3 text-black font-semibold">
        การชำระเงินสำเร็จ ✅
      </h1>

      <p className="text-green-600 text-lg font-light" aria-live="polite">
        {isMock ? "โหมดทดสอบ (MOCK)" : "ขอบคุณที่สั่งซื้อ!"}
        {courseId && (
          <>
            {" "}
            <span className="text-black/60">Course:</span>{" "}
            <span className="text-black font-normal">{courseId}</span>
          </>
        )}
        <br />
        กำลังพาไปหน้า <span className="font-normal text-black">
          บทเรียน
        </span> ใน <span className="font-normal text-black">{seconds}</span>{" "}
        วินาที...
      </p>

      {/* progress bar */}
      <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000"
          style={{ width: `${(seconds / 3) * 100}%` }}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(redirectTo, { replace: true })}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          เข้าเรียนเลย
        </button>

        <Link
          to="/CoursesPage"
          className="px-4 py-2 rounded-xl border border-black bg-white text-black"
        >
          กลับหน้าคอร์ส
        </Link>
      </div>
    </section>
  );
}
