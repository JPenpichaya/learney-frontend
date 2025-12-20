// src/pages/CoursesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { getIdToken } from "firebase/auth";
import type { CoursePageUser, CoursePageResponse } from "../types/course";

const API_BASE = import.meta.env.VITE_API_BASE;

type ClassType = "all" | "live" | "video";
type BadgeType = "BEST_SELLER" | "TRENDING" | "NEW";

export default function CoursesPage() {
    const nav = useNavigate();

    const [courses, setCourses] = useState<CoursePageUser | null>(null);
    const [ent, setEnt] = useState<CoursePageResponse[]>([]);
    const [busy, setBusy] = useState<string | null>(null);

    // 🔹 pagination
    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize] = useState(6);

    // 🔹 filters
    const [searchText, setSearchText] = useState("");
    const [classType, setClassType] = useState<ClassType>("all");
    const [badgeType, setBadgeType] = useState<BadgeType[]>([]);

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

    // 🔹 load courses
    async function loadCourses() {
        const body = {
            pageNumber,
            pageSize,
            sortBy: "createdAt",
            direction: "ASC",
            condition: {
                searchText: searchText || undefined,
                classType,
                badgeType: badgeType.length ? badgeType : undefined,
            },
        };

        const c = await fetchWithAuth(`${API_BASE}/api/course`, body);
        setCourses(c);
    }

    // 🔹 initial load + filters reload
    useEffect(() => {
        loadCourses();
    }, [pageNumber, classType, badgeType, searchText]);

    // 🔹 load enrollment once
    useEffect(() => {
        (async () => {
            const e = await fetchWithAuth(
                `${API_BASE}/api/enrollment/by-user-id`
            );
            setEnt(e);
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
            <h1 className="text-3xl font-extrabold mb-6">
                LearneyJourney Courses
            </h1>

            {/* 🔍 Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <input
                    className="px-4 py-2 rounded-xl border"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => {
                        setPageNumber(0);
                        setSearchText(e.target.value);
                    }}
                />

                <select
                    className="px-4 py-2 rounded-xl border"
                    value={classType}
                    onChange={(e) => {
                        setPageNumber(0);
                        setClassType(e.target.value as ClassType);
                    }}
                >
                    <option value="all">All</option>
                    <option value="live">Live</option>
                    <option value="video">Video</option>
                </select>

                {(["BEST_SELLER", "TRENDING", "NEW"] as BadgeType[]).map(b => (
                    <button
                        key={b}
                        onClick={() => {
                            setPageNumber(0);
                            setBadgeType(prev =>
                                prev.includes(b)
                                    ? prev.filter(x => x !== b)
                                    : [...prev, b]
                            );
                        }}
                        className={`px-3 py-2 rounded-xl border ${badgeType.includes(b)
                            ? "bg-black text-white"
                            : "bg-white"
                            }`}
                    >
                        {b}
                    </button>
                ))}
            </div>

            {/* 🧩 Course slider */}
            <Swiper
                key={`${pageNumber}-${classType}-${badgeType.join(",")}-${searchText}`}
                slidesPerView={1.1}
                spaceBetween={16}
                breakpoints={{
                    640: { slidesPerView: 2.1 },
                    1024: { slidesPerView: 3.1 },
                }}
            >
                {courses?.content.map((c) => (
                    <SwiperSlide key={c.id}>
                        <div className="bg-white rounded-3xl p-5 border shadow-sm flex flex-col h-full text-black">
                            <h2 className="font-extrabold text-lg">{c.title}</h2>
                            <p className="text-sm opacity-80 mt-1">
                                {c.description}
                            </p>

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
                ))}
            </Swiper>

            {/* 🔄 Pagination */}
            <div className="flex justify-between items-center mt-6">
                <span className="opacity-70">
                    Page {courses ? courses.number + 1 : 1} / {courses?.totalPages ?? 1}
                </span>

                <div className="flex gap-2">
                    <button
                        disabled={pageNumber === 0}
                        onClick={() => setPageNumber(p => p - 1)}
                        className="px-4 py-2 rounded-xl border disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <button
                        disabled={courses?.last}
                        onClick={() => setPageNumber(p => p + 1)}
                        className="px-4 py-2 rounded-xl border disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
