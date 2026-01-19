// src/pages/CoursesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import type { CoursePageUser, CoursePageResponse } from "../types/course";

const API_BASE = import.meta.env.VITE_API_BASE;

type ClassType = "all" | "live" | "video";
type BadgeType = "BEST_SELLER" | "TRENDING" | "NEW";

/** ===== MOCK (ใช้เมื่อ API ยิงไม่ได้/ยังไม่ login) ===== */
const MOCK_ALL_COURSES = [
    {
        id: "course-1",
        title: "Mock Course",
        description: "This course is for mocking only",
        priceThb: 498,
        priceId: "price_mock_1",
        isLive: false,
        tutorProfileId: "tutor-1",
        imageUrl: "https://placehold.co/600x400",
        badge: "NEW",
    },
    {
        id: "course-2",
        title: "Mock Live",
        description: "This course is for mocking only",
        priceThb: 790,
        priceId: "price_mock_2",
        isLive: true,
        tutorProfileId: "tutor-1",
        imageUrl: "https://placehold.co/600x400",
        badge: "BEST_SELLER",
    },
    {
        id: "course-3",
        title: "Mock TypeScript",
        description: "Deep dive into TypeScript (mock).",
        priceThb: 1290,
        priceId: "price_mock_3",
        isLive: false,
        tutorProfileId: "tutor-2",
        imageUrl: "https://placehold.co/600x400",
        badge: "TRENDING",
    },
    {
        id: "course-4",
        title: "Mock SQL",
        description: "Querying and joins (mock).",
        priceThb: 790,
        priceId: "price_mock_4",
        isLive: false,
        tutorProfileId: "tutor-3",
        imageUrl: "https://placehold.co/600x400",
        badge: "NEW",
    },
    {
        id: "course-5",
        title: "Mock Security Live",
        description: "Hands-on security lab (mock).",
        priceThb: 1990,
        priceId: "price_mock_5",
        isLive: true,
        tutorProfileId: "tutor-4",
        imageUrl: "https://placehold.co/600x400",
        badge: "TRENDING",
    },
    {
        id: "course-6",
        title: "Mock Video Editing",
        description: "Video course example (mock).",
        priceThb: 599,
        priceId: "price_mock_6",
        isLive: false,
        tutorProfileId: "tutor-5",
        imageUrl: "https://placehold.co/600x400",
        badge: "BEST_SELLER",
    },
    {
        id: "course-7",
        title: "Mock Video Editings",
        description: "Video course example (mock).",
        priceThb: 599,
        priceId: "price_mock_7",
        isLive: false,
        tutorProfileId: "tutor-5",
        imageUrl: "https://placehold.co/600x400",
        badge: "BEST_SELLER",
    },
];

const MOCK_ENROLLMENTS: CoursePageResponse[] = [
    { id: "enr-1", courseId: "course-2", userId: "mock-user" },
];

function buildMockPage(params: {
    pageNumber: number;
    pageSize: number;
    searchText: string;
    classType: ClassType;
    badgeType: BadgeType[];
}): CoursePageUser {
    const { pageNumber, pageSize, searchText, classType, badgeType } = params;

    let list = [...MOCK_ALL_COURSES];

    // search
    const q = searchText.trim().toLowerCase();
    if (q) {
        list = list.filter(
            (c) =>
                c.title.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q)
        );
    }

    // classType
    if (classType === "live") list = list.filter((c) => c.isLive);
    if (classType === "video") list = list.filter((c) => !c.isLive);

    // badgeType
    if (badgeType.length) {
        list = list.filter((c) => badgeType.includes(c.badge as BadgeType));
    }

    const totalElements = list.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage = Math.min(Math.max(pageNumber, 0), totalPages - 1);
    const start = safePage * pageSize;
    const content = list.slice(start, start + pageSize);

    return {
        content: content as any,
        pageable: {
            pageNumber: safePage,
            pageSize,
            offset: start,
            paged: true,
            unpaged: false,
            sort: { empty: true, sorted: false, unsorted: true },
        },
        last: safePage >= totalPages - 1,
        first: safePage === 0,
        size: pageSize,
        number: safePage,
        sort: { empty: true, sorted: false, unsorted: true },
        totalPages,
        totalElements,
        numberOfElements: content.length,
        empty: content.length === 0,
    } as CoursePageUser;
}

export default function CoursesPage() {
    const nav = useNavigate();

    const [courses, setCourses] = useState<CoursePageUser | null>(null);
    const [ent, setEnt] = useState<CoursePageResponse[]>([]);
    const [busy, setBusy] = useState<string | null>(null);

    // ✅ pagination (server-side)
    const [pageNumber, setPageNumber] = useState(0);
    const pageSize = 6; // ✅ 1 หน้าไม่เกิน 5

    // ✅ filters
    const [searchText, setSearchText] = useState("");
    const [classType, setClassType] = useState<ClassType>("all");
    const [badgeType, setBadgeType] = useState<BadgeType[]>([]);

    // ✅ status: ใช้ mock อยู่ไหม
    const [usingMock, setUsingMock] = useState(false);

    const owned = useMemo(() => new Set(ent.map((e) => e.courseId)), [ent]);
    const isOwned = (courseId: string) => owned.has(courseId);

    async function fetchWithAuth<T = any>(url: string, body?: any): Promise<T> {
        const user = auth.currentUser;
        if (!user) throw new Error("Not signed in yet");

        const token = await getIdToken(user, false);
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

    function applyMockCourses() {
        setUsingMock(true);
        setCourses(
            buildMockPage({ pageNumber, pageSize, searchText, classType, badgeType })
        );
    }

    function applyMockEnrollments() {
        setUsingMock(true);
        setEnt(MOCK_ENROLLMENTS);
    }

    async function loadEnrollmentsWithFallback() {
        if (!auth.currentUser) {
            applyMockEnrollments();
            return;
        }

        try {
            const e = await fetchWithAuth<CoursePageResponse[]>(
                `${API_BASE}/api/enrollment/by-user-id`
            );
            setEnt(e);
        } catch (err) {
            console.error("enrollment failed -> mock", err);
            applyMockEnrollments();
        }
    }

    async function loadCoursesWithFallback() {
        // ✅ ถ้ายังไม่มี user → mock ทันที
        if (!auth.currentUser) {
            applyMockCourses();
            return;
        }

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

        try {
            const c = await fetchWithAuth<CoursePageUser>(
                `${API_BASE}/api/course/search`,
                body
            );
            setCourses(c);
            setUsingMock(false);
        } catch (err) {
            console.error("course failed -> mock", err);
            applyMockCourses();
        }
    }

    // ✅ useEffect เดียว: auth + reload เมื่อ filter/page เปลี่ยน
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                applyMockEnrollments();
                applyMockCourses();
                return;
            }

            await loadEnrollmentsWithFallback();
            await loadCoursesWithFallback();
        });

        // และเรียกทันที 1 ครั้ง (กรณี auth มีค่าอยู่แล้ว)
        loadCoursesWithFallback();

        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber, searchText, classType, badgeType]);

    async function startCheckout(courseId: string, priceId: string) {
        if (busy) return;
        setBusy(courseId);

        // mock mode -> success fake
        if (usingMock) {
            setTimeout(() => {
                alert("Mock checkout success 🎉");
                setBusy(null);
            }, 600);
            return;
        }

        try {
            const { url } = await fetchWithAuth<{ url: string }>(
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
        if (isOwned(courseId)) return enterLive(courseId);
        if (!priceId)
            return alert("This live course cannot be purchased (missing priceId).");
        startCheckout(courseId, priceId);
    }

    return (
        <div className="min-h-screen bg-[#FDF5DE] p-8">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-3xl font-extrabold text-black">
                    LearneyJourney Courses
                </h1>
                {usingMock && (
                    <span className="text-xs px-2 py-1 rounded-full border border-black bg-white text-black">
                        Offline mode (MOCK)
                    </span>
                )}
            </div>

            {/* 🔍 Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <input
                    className="px-4 py-2 rounded-xl border border-black text-black bg-white"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => {
                        setPageNumber(0);
                        setSearchText(e.target.value);
                    }}
                />

                <select
                    className="px-4 py-2 rounded-xl border border-black text-black bg-white"
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

                {(["BEST_SELLER", "TRENDING", "NEW"] as BadgeType[]).map((b) => (
                    <button
                        key={b}
                        type="button"
                        onClick={() => {
                            setPageNumber(0);
                            setBadgeType((prev) =>
                                prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
                            );
                        }}
                        className={`px-3 py-2 rounded-xl border border-black ${badgeType.includes(b)
                            ? "bg-black text-white"
                            : "bg-white text-black"
                            }`}
                    >
                        {b}
                    </button>
                ))}
            </div>

            {/* 🧩 Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses?.content?.map((c) => (
                    <div
                        key={c.id}
                        className="bg-white rounded-3xl p-5 border shadow-sm flex flex-col h-full text-black"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-extrabold text-lg">{c.title}</h2>
                            <span className="text-xs px-2 py-1 rounded-full border bg-white">
                                {c.badge}
                            </span>
                        </div>

                        <p className="text-sm opacity-80 mt-1">{c.description}</p>

                        {c.imageUrl ? (
                            <img
                                src={c.imageUrl}
                                alt={c.title}
                                className="mt-4 w-full h-40 object-cover rounded-2xl"
                                loading="lazy"
                            />
                        ) : null}

                        <div className="mt-auto flex justify-between items-center pt-4">
                            <span className="font-bold">{c.priceThb} THB</span>

                            {c.isLive ? (
                                <button
                                    type="button"
                                    onClick={() => handleLiveAction(c.id, c.priceId ?? null)}
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
                                    type="button"
                                    onClick={() => {
                                        if (!c.priceId) return alert("Missing priceId");
                                        startCheckout(c.id, c.priceId);
                                    }}
                                    disabled={busy === c.id}
                                    className="btn-primary"
                                >
                                    {busy === c.id ? "Redirecting…" : isOwned(c.id)
                                        ? "Buy"
                                        : "Start Learning"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {courses?.content?.length === 0 && (
                <div className="text-center opacity-60 mt-12 text-black">
                    No courses found.
                </div>
            )}

            {/* 🔄 Pagination */}
            <div className="flex justify-between items-center mt-6 text-black">
                <span className="opacity-70">
                    Page {courses ? courses.number + 1 : pageNumber + 1} /{" "}
                    {courses?.totalPages ?? 1}
                </span>

                <div className="flex gap-2">
                    <button
                        type="button"
                        disabled={pageNumber === 0 || (courses?.first ?? pageNumber === 0)}
                        onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                        className="px-4 py-2 rounded-xl border border-black bg-white disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <button
                        type="button"
                        disabled={courses?.last ?? false}
                        onClick={() => setPageNumber((p) => p + 1)}
                        className="px-4 py-2 rounded-xl border border-black bg-white disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
