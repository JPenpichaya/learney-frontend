// src/pages/CoursesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import type { CoursePageUser, CoursePageResponse } from "../types/course";

const API_BASE = import.meta.env.VITE_API_BASE;
const USE_MOCK = true;

// ===== MOCK COURSES (Spring PageResponse style) =====
const MOCK_COURSES = {
  content: [
    {
      id: "course-1",
      title: "React for Beginners",
      description: "Learn React from scratch with hands-on examples.",
      priceThb: 990,
      priceId: "price_mock_1",
      isLive: false,
      tutorProfileId: "tutor-1",
      imageUrl: "https://placehold.co/600x400",
      badge: "NEW",
    },
    {
      id: "course-2",
      title: "Live Coding Bootcamp",
      description: "Real-time live coding session with instructor.",
      priceThb: 1490,
      priceId: "price_mock_2",
      isLive: true,
      tutorProfileId: "tutor-1",
      imageUrl: "https://placehold.co/600x400",
      badge: "LIVE",
    },
    {
      id: "course-3",
      title: "Advanced TypeScript",
      description: "Deep dive into TypeScript for real-world apps.",
      priceThb: 1290,
      priceId: "price_mock_3",
      isLive: false,
      tutorProfileId: "tutor-2",
      imageUrl: "https://placehold.co/600x400",
      badge: "PRO",
    },
    {
      id: "course-4",
      title: "SQL for Data Work",
      description: "Querying, joins, and real-world data tasks.",
      priceThb: 790,
      priceId: "price_mock_4",
      isLive: false,
      tutorProfileId: "tutor-3",
      imageUrl: "https://placehold.co/600x400",
      badge: "HOT",
    },
    {
      id: "course-5",
      title: "Live Security Lab",
      description: "Hands-on live lab sessions with guidance.",
      priceThb: 1990,
      priceId: "price_mock_5",
      isLive: true,
      tutorProfileId: "tutor-4",
      imageUrl: "https://placehold.co/600x400",
      badge: "LIVE",
    },
    {
      id: "course-6",
      title: "Live Security Lab",
      description: "Hands-on live lab sessions with guidance.",
      priceThb: 1990,
      priceId: "price_mock_5",
      isLive: true,
      tutorProfileId: "tutor-4",
      imageUrl: "https://placehold.co/600x400",
      badge: "LIVE",
    },
  ],
  pageable: {
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false,
    sort: { empty: true, sorted: false, unsorted: true },
  },
  last: true,
  first: true,
  size: 20,
  number: 0,
  sort: { empty: true, sorted: false, unsorted: true },
  totalPages: 1,
  totalElements: 5,
  numberOfElements: 5,
  empty: false,
} satisfies CoursePageUser;

const MOCK_ENROLLMENTS = [
  { id: "enr-1", courseId: "course-2", userId: "mock-user" },
] satisfies CoursePageResponse[];

export default function CoursesPage() {
  const nav = useNavigate();
  const [courses, setCourses] = useState<CoursePageUser | null>(null);
  const [ent, setEnt] = useState<CoursePageResponse[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  // ===== Pagination state =====
  const PAGE_SIZE = 6; // ปรับไซส์สไลด์จ้าา
  const [page, setPage] = useState(0);

  const owned = useMemo(() => new Set(ent.map((e) => e.courseId)), [ent]);
  const isOwned = (courseId: string) => owned.has(courseId);

  const totalPages = useMemo(() => {
    const n = courses?.content?.length ?? 0;
    return Math.max(1, Math.ceil(n / PAGE_SIZE));
  }, [courses, PAGE_SIZE]);

  const pageCourses = useMemo(() => {
    const list = courses?.content ?? [];
    const start = page * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [courses, page, PAGE_SIZE]);

  // กัน page เกินเมื่อ data เปลี่ยน
  useEffect(() => {
    setPage(0);
  }, [courses]);

  async function fetchWithAuth(url: string, body?: any) {
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

  useEffect(() => {
    if (USE_MOCK) {
      setCourses(MOCK_COURSES);
      setEnt(MOCK_ENROLLMENTS);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const c = await fetchWithAuth(`${API_BASE}/api/course`, {
          pageNumber: 0,
          pageSize: 20,
        });
        const e = await fetchWithAuth(`${API_BASE}/api/enrollment/by-user-id`);
        setCourses(c);
        setEnt(e);
      } catch (err) {
        console.error(err);
        alert("Load courses failed.");
      }
    });

    return () => unsub();
  }, []);

  async function startCheckout(courseId: string, priceId: string) {
    if (busy) return;
    setBusy(courseId);

    if (USE_MOCK) {
      setTimeout(() => {
        alert("Mock checkout success 🎉");
        setBusy(null);
      }, 600);
      return;
    }

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
    if (isOwned(courseId)) return enterLive(courseId);
    if (!priceId)
      return alert("This live course cannot be purchased (missing priceId).");
    startCheckout(courseId, priceId);
  }

  return (
    <div className="min-h-screen bg-[#FDF5DE] p-8" id="coursesPage">
      <h1 className="text-3xl font-extrabold mb-6">LearneyJourney Courses</h1>

      {/* ===== Cards Grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageCourses.map((c) => (
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
        ))}
      </div>

      {/* ===== Pagination ===== */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          className="px-3 py-2 rounded-lg border bg-white text-black disabled:opacity-40"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-2 rounded-lg border ${
              page === i ? "bg-white text-black" : "bg-white"
            }`}
            aria-current={page === i ? "page" : undefined}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="px-3 py-2 rounded-lg border bg-white text-black disabled:opacity-40"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
