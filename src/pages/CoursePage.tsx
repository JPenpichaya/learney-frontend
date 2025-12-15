// src/pages/CoursesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import "swiper/css/bundle";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { getIdToken } from "firebase/auth";
import type { Course, Entitlements } from "../types/course";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function CoursesPage() {
    const nav = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [ent, setEnt] = useState<Entitlements>({ ownedCourseIds: [] });
    const [busy, setBusy] = useState<string | null>(null);

    const owned = useMemo(() => new Set(ent.ownedCourseIds), [ent]);

    async function fetchWithAuth(url: string, body?: any) {
        const token = await getIdToken(auth.currentUser!, false);
        const res = await fetch(url, {
            method: body ? "POST" : "GET",
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
            const c = await fetchWithAuth(`${API_BASE}/api/course`);
            const e = await fetchWithAuth(`${API_BASE}/entitlements`);
            setCourses(c.courses);
            setEnt(e);
        })();
    }, []);

    async function buyCourse(courseId: string, priceId?: string) {
        setBusy(courseId);
        const { checkoutUrl } = await fetchWithAuth(
            `${API_BASE}/api/checkout/create-session`,
            {
                courseId,               // UUID string
                items: [{ qty: 1, priceId }],
            }
        );
        window.location.href = checkoutUrl;
    }

    function enterLive(courseId: string) {
        nav(`/live?courseId=${courseId}`);
    }

    return (
        <div className="min-h-screen bg-[#FDF5DE] p-8">
            <h1 className="text-3xl font-extrabold mb-6">LearneyJourney Courses</h1>

            <Swiper slidesPerView={1.1} spaceBetween={16} breakpoints={{
                640: { slidesPerView: 2.1 },
                1024: { slidesPerView: 3.1 },
            }}>
                {courses.map((c) => {
                    const isOwned = owned.has(c.id);

                    return (
                        <SwiperSlide key={c.id}>
                            <div className="bg-white rounded-3xl p-5 border shadow-sm flex flex-col h-full">
                                <h2 className="font-extrabold text-lg">{c.title}</h2>
                                <p className="text-sm opacity-80 mt-1">{c.description}</p>

                                <div className="mt-auto flex justify-between items-center pt-4">
                                    <span className="font-bold">{c.priceTHB} THB</span>

                                    {c.isLive ? (
                                        isOwned ? (
                                            <button
                                                onClick={() => enterLive(c.id)}
                                                className="btn-live"
                                            >
                                                Enter Live
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => buyCourse(c.id, c.priceId)}
                                                disabled={busy === c.id}
                                                className="btn-live"
                                            >
                                                Pay to Join
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => buyCourse(c.id, c.priceId)}
                                            disabled={busy === c.id}
                                            className="btn-primary"
                                        >
                                            Buy
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
