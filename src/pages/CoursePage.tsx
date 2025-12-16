// src/pages/CoursesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { getIdToken } from "firebase/auth";
import type { CoursePageUser, CoursePageResponse } from "../types/course";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function CoursesPage() {
    const nav = useNavigate();
    const [courses, setCourses] = useState<CoursePageUser | null>(null);
    const [ent, setEnt] = useState<CoursePageResponse[]>([]);
    const [busy, setBusy] = useState<string | null>(null);

    const owned = useMemo(() => new Set(ent.map(e => e.courseId)), [ent]);
    const isOwned = (courseId: string) => owned.has(courseId);

    async function fetchWithAuth(url: string, body?: any) {
        const token = await getIdToken(auth.currentUser!, false);
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    useEffect(() => {
        (async () => {
            const c = await fetchWithAuth(`${API_BASE}/api/course`,
                {
                    "pageNumber": 0,
                    "pageSize": 20
                }
            );
            const e = await fetchWithAuth(`${API_BASE}/api/enrollment/by-user-id`);
            setCourses(c);
            setEnt(e);
            console.log("Fetched courses and enrollments", c, e);
        })();
    }, []);

    async function startCheckout(courseId: string, priceId: string) {
        if (busy) return;
        setBusy(courseId);

        try {
            const { url } = await fetchWithAuth(
                `${API_BASE}/api/checkout/create-session`,
                {
                    courseId,
                    items: [{ qty: 1, priceId }],
                    // (optional) ให้ backend ใช้เป็น success/cancel
                    successUrl: `${window.location.origin}/courses?success=1`,
                    cancelUrl: `${window.location.origin}/courses?canceled=1`,
                }
            );

            if (!url) throw new Error("Missing checkoutUrl");
            window.location.assign(url);
        } catch (e) {
            console.error(e);
            alert("Checkout failed. Please try again.");
            setBusy(null);
        }
    }

    function enterLive(roomName: string) {
        nav(`/call?room=${encodeURIComponent(roomName)}`);
    }
    // Live course: ถ้า owned เข้าห้องได้เลย ไม่งั้นไปจ่าย
    function handleLiveAction(courseId: string, priceId: string | null) {
        if (isOwned(courseId)) {
            enterLive(courseId);
            return;
        }
        if (!priceId) {
            alert("This live course cannot be purchased (missing priceId).");
            return;
        }
        startCheckout(courseId, priceId);
    }


    return (
        <div className="min-h-screen bg-[#FDF5DE] p-8">
            <h1 className="text-3xl font-extrabold mb-6">LearneyJourney Courses</h1>

            <Swiper slidesPerView={1.1} spaceBetween={16} breakpoints={{
                640: { slidesPerView: 2.1 },
                1024: { slidesPerView: 3.1 },
            }}>
                {courses?.content.map((c) => {
                    console.log(c);

                    return (
                        <SwiperSlide key={c.id}>
                            <div className="bg-white rounded-3xl p-5 border shadow-sm flex flex-col h-full text-black">
                                <h2 className="font-extrabold text-lg">{c.title}</h2>
                                <p className="text-sm opacity-80 mt-1">{c.description}</p>

                                <div className="mt-auto flex justify-between items-center pt-4">
                                    <span className="font-bold">{c.priceThb} THB</span>

                                    {c.isLive ? (
                                        <button
                                            onClick={() => handleLiveAction(c.id, c.priceId)}
                                            disabled={busy === c.id}
                                            className="btn-live"
                                        >
                                            {busy === c.id
                                                ? "Redirecting…"
                                                : isOwned(c.id)
                                                    ? "Enter Live"
                                                    : "Pay to Join"}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!c.priceId) return alert("Missing priceId");
                                                startCheckout(c.id, c.priceId);
                                            }}
                                            disabled={busy === c.id}
                                            className="btn-primary"
                                        >
                                            {busy === c.id ? "Redirecting…" : "Buy"}
                                        </button>
                                    )}

                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
