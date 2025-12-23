import React, { useEffect, useMemo, useState } from "react";

type ProgressStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

type VideoProgress = {
    id: string; // UUID
    description: string;
    status: ProgressStatus;
    completedAt: number; // seconds watched
    title: string;
    url: string;
    duration: number; // seconds total
    position: number;
};

type LessonProgressApi = {
    lessonId: string; // UUID
    videoes?: VideoProgress[]; // API typo support
    videos?: VideoProgress[];  // just in case
};

type LessonSection = {
    lessonId: string;
    videos: VideoProgress[];
};

type Props = {
    userId?: string;
    courseId?: string; // UUID
    idToken?: string;
    apiBaseUrl?: string; // e.g. https://your-domain.com
    useMock?: boolean;   // default true for demo
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function formatTime(seconds: number) {
    const s = Math.max(0, Math.floor(seconds));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
}

/** Lesson status derived from videos */
function deriveLessonStatus(videos: VideoProgress[]): ProgressStatus {
    if (videos.length === 0) return "LOCKED";
    const allCompleted = videos.every((v) => v.status === "COMPLETED" || v.completedAt >= v.duration);
    if (allCompleted) return "COMPLETED";
    const anyInProgress =
        videos.some((v) => v.status === "IN_PROGRESS") ||
        videos.some((v) => v.completedAt > 0 && v.completedAt < v.duration);
    if (anyInProgress) return "IN_PROGRESS";
    const anyAvailable = videos.some((v) => v.status === "AVAILABLE");
    if (anyAvailable) return "AVAILABLE";
    return "LOCKED";
}

/** Lesson progress derived from videos */
function deriveLessonProgress(videos: VideoProgress[]) {
    const duration = videos.reduce((acc, v) => acc + (v.duration || 0), 0);
    const completedAt = videos.reduce((acc, v) => acc + clamp(v.completedAt || 0, 0, v.duration || 0), 0);
    const pct = duration > 0 ? Math.round((completedAt / duration) * 100) : 0;
    return { duration, completedAt, pct };
}

function pill(status: ProgressStatus) {
    switch (status) {
        case "COMPLETED":
            return "bg-emerald-400 text-black";
        case "IN_PROGRESS":
            return "bg-yellow-300 text-black";
        case "AVAILABLE":
            return "bg-sky-400 text-black";
        case "LOCKED":
        default:
            return "bg-slate-600 text-white";
    }
}

function nodeColor(status: ProgressStatus) {
    switch (status) {
        case "COMPLETED":
            return "bg-emerald-400 text-black";
        case "IN_PROGRESS":
            return "bg-yellow-300 text-black";
        case "AVAILABLE":
            return "bg-sky-400 text-black";
        case "LOCKED":
        default:
            return "bg-slate-500 text-white";
    }
}

/** Normalize API payload: supports "videoes" misspelling */
function normalizeLessons(api: LessonProgressApi[]): LessonSection[] {
    return (api || []).map((l) => {
        const raw = l.videoes ?? l.videos ?? [];
        const videos = [...raw].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        return { lessonId: l.lessonId, videos };
    });
}

/** Mock data in your new structure */
function makeMockApiResponse(): LessonProgressApi[] {
    const uuid = () =>
        (globalThis.crypto as any)?.randomUUID?.() ??
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
            const r = (Math.random() * 16) | 0;
            const v = ch === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });

    return [
        {
            lessonId: uuid(),
            videoes: [
                {
                    id: uuid(),
                    title: "Verb",
                    description: "Understand what verbs are and how to use them in sentences.",
                    status: "COMPLETED",
                    completedAt: 600,
                    duration: 600,
                    url: "https://example.com/video/verb",
                    position: 1,
                },
                {
                    id: uuid(),
                    title: "Verb Examples",
                    description: "Extra examples to reinforce verb usage.",
                    status: "COMPLETED",
                    completedAt: 300,
                    duration: 300,
                    url: "https://example.com/video/verb-examples",
                    position: 2,
                },
            ],
        },
        {
            lessonId: uuid(),
            videoes: [
                {
                    id: uuid(),
                    title: "Past Simple",
                    description: "Learn past simple structure and common usage patterns.",
                    status: "IN_PROGRESS",
                    completedAt: 240,
                    duration: 600,
                    url: "https://example.com/video/past-simple",
                    position: 1,
                },
                {
                    id: uuid(),
                    title: "Past Simple Practice",
                    description: "Practice questions for past simple.",
                    status: "AVAILABLE",
                    completedAt: 0,
                    duration: 480,
                    url: "https://example.com/video/past-simple-practice",
                    position: 2,
                },
                {
                    id: uuid(),
                    title: "Past Simple Quiz",
                    description: "Quick quiz to test your understanding.",
                    status: "LOCKED",
                    completedAt: 0,
                    duration: 420,
                    url: "https://example.com/video/past-simple-quiz",
                    position: 3,
                },
            ],
        },

        {
            lessonId: uuid(),
            videoes: [
                {
                    id: uuid(),
                    title: "Past Simple",
                    description: "Learn past simple structure and common usage patterns.",
                    status: "IN_PROGRESS",
                    completedAt: 240,
                    duration: 600,
                    url: "https://example.com/video/past-simple",
                    position: 1,
                },
            ],
        },
    ];
}

/** API call: POST /api/lesson-progress/get-all-details */
async function fetchLessonProgress(params: {
    apiBaseUrl: string;
    userId: string;
    courseId: string;
    idToken: string;
}): Promise<LessonSection[]> {
    const { apiBaseUrl, userId, courseId, idToken } = params;

    const res = await fetch(`${apiBaseUrl}/api/lesson-progress/get-all-details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId, courseId }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Fetch failed: ${res.status} ${res.statusText} ${text}`.trim());
    }

    const data = (await res.json()) as LessonProgressApi[];
    return normalizeLessons(data);
}

export default function LessonVideoTracker({
    userId,
    courseId,
    idToken,
    apiBaseUrl,
    useMock = true,
}: Props) {
    const [lessons, setLessons] = useState<LessonSection[]>(() =>
        normalizeLessons(makeMockApiResponse())
    );

    const [expandedLessonIds, setExpandedLessonIds] = useState<Set<string>>(() => new Set());
    const [activeVideoId, setActiveVideoId] = useState<string>("");

    // Load real API if requested
    useEffect(() => {
        const shouldFetch = !useMock && apiBaseUrl && userId && courseId && idToken;
        if (!shouldFetch) return;

        let cancelled = false;
        fetchLessonProgress({ apiBaseUrl, userId, courseId, idToken })
            .then((normalized) => {
                if (cancelled) return;
                setLessons(normalized);
            })
            .catch((e) => {
                console.error(e);
            });

        return () => {
            cancelled = true;
        };
    }, [useMock, apiBaseUrl, userId, courseId, idToken]);

    const lessonView = useMemo(() => {
        return lessons.map((lesson, idx) => {
            const status = deriveLessonStatus(lesson.videos);
            const progress = deriveLessonProgress(lesson.videos);
            const title = `Lesson ${idx + 1}`; // if you have real titles elsewhere, swap this
            return { ...lesson, idx, title, status, progress };
        });
    }, [lessons]);

    const flatVideos = useMemo(() => {
        // Flatten in lesson order, video position order
        const out: Array<{
            lessonId: string;
            lessonIndex: number;
            lessonTitle: string;
            lessonStatus: ProgressStatus;
            video: VideoProgress;
        }> = [];

        lessonView.forEach((l) => {
            l.videos.forEach((v) => {
                out.push({
                    lessonId: l.lessonId,
                    lessonIndex: l.idx,
                    lessonTitle: l.title,
                    lessonStatus: l.status,
                    video: v,
                });
            });
        });

        return out;
    }, [lessonView]);

    const active = useMemo(() => {
        return flatVideos.find((x) => x.video.id === activeVideoId) ?? null;
    }, [flatVideos, activeVideoId]);

    // Choose default active video
    useEffect(() => {
        if (activeVideoId) return;

        const firstUnlocked = flatVideos.find((x) => x.video.status !== "LOCKED");
        const fallback = flatVideos[0];

        const pick = firstUnlocked ?? fallback;
        if (pick) {
            setActiveVideoId(pick.video.id);
            setExpandedLessonIds((prev) => new Set(prev).add(pick.lessonId));
        }
    }, [activeVideoId, flatVideos]);

    // Ensure lesson containing active video is expanded
    useEffect(() => {
        if (!active) return;
        setExpandedLessonIds((prev) => {
            if (prev.has(active.lessonId)) return prev;
            const next = new Set(prev);
            next.add(active.lessonId);
            return next;
        });
    }, [active]);

    function toggleLesson(lessonId: string) {
        setExpandedLessonIds((prev) => {
            const next = new Set(prev);
            if (next.has(lessonId)) next.delete(lessonId);
            else next.add(lessonId);
            return next;
        });
    }

    function updateVideo(videoId: string, patch: Partial<VideoProgress>) {
        setLessons((prev) =>
            prev.map((lesson) => ({
                ...lesson,
                videos: lesson.videos.map((v) => (v.id === videoId ? { ...v, ...patch } : v)),
            }))
        );
    }

    /** Optional unlock logic: when a video completes, unlock next locked video in same lesson; else next lesson's first locked video */
    function unlockNextAfter(videoId: string) {
        const idx = flatVideos.findIndex((x) => x.video.id === videoId);
        if (idx < 0) return;

        const current = flatVideos[idx];
        // Try next video in same lesson
        const nextSameLesson = flatVideos
            .slice(idx + 1)
            .find((x) => x.lessonId === current.lessonId);

        if (nextSameLesson && nextSameLesson.video.status === "LOCKED") {
            updateVideo(nextSameLesson.video.id, { status: "AVAILABLE" });
            return;
        }

        // Otherwise next unlocked candidate across all lessons
        const nextAny = flatVideos.slice(idx + 1).find((x) => x.video.status === "LOCKED");
        if (nextAny) updateVideo(nextAny.video.id, { status: "AVAILABLE" });
    }

    function setProgress(videoId: string, newCompletedAt: number) {
        const v = flatVideos.find((x) => x.video.id === videoId)?.video;
        if (!v) return;

        const completedAt = clamp(newCompletedAt, 0, v.duration);
        let status: ProgressStatus = v.status;

        if (completedAt <= 0) status = v.status === "LOCKED" ? "LOCKED" : "AVAILABLE";
        else if (completedAt >= v.duration) status = "COMPLETED";
        else status = "IN_PROGRESS";

        updateVideo(videoId, { completedAt, status });
        if (status === "COMPLETED") unlockNextAfter(videoId);
    }

    function markComplete(videoId: string) {
        const v = flatVideos.find((x) => x.video.id === videoId)?.video;
        if (!v) return;
        updateVideo(videoId, { completedAt: v.duration, status: "COMPLETED" });
        unlockNextAfter(videoId);
    }

    function resetVideo(videoId: string) {
        const v = flatVideos.find((x) => x.video.id === videoId)?.video;
        if (!v) return;
        updateVideo(videoId, { completedAt: 0, status: v.status === "LOCKED" ? "LOCKED" : "AVAILABLE" });
    }

    function goNextVideo() {
        if (!active) return;
        // mark current complete, then go next unlocked
        markComplete(active.video.id);

        const idx = flatVideos.findIndex((x) => x.video.id === active.video.id);
        const next = flatVideos.slice(idx + 1).find((x) => x.video.status !== "LOCKED");
        if (next) setActiveVideoId(next.video.id);
    }

    // === UI ===
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-6 md:grid-cols-[360px_1fr]">
                    {/* LEFT: Lessons timeline */}
                    <aside className="rounded-2xl bg-white/5 p-5 shadow-xl ring-1 ring-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold tracking-widest text-white/90">
                                PROGRESS
                            </h2>
                            <div className="flex gap-2">
                                <span className="rounded-full bg-yellow-300 px-2 py-1 text-[11px] font-semibold text-black">
                                    subject
                                </span>
                                <span className="rounded-full bg-pink-400 px-2 py-1 text-[11px] font-semibold text-white">
                                    Note
                                </span>
                                <span className="rounded-full bg-violet-400 px-2 py-1 text-[11px] font-semibold text-white">
                                    All Note
                                </span>
                            </div>
                        </div>

                        {/* Lessons timeline list */}
                        <div className="mt-5">
                            <ul>
                                {lessonView.map((lesson, idx) => {
                                    const isFirst = idx === 0;
                                    const isLast = idx === lessonView.length - 1;
                                    const isExpanded = expandedLessonIds.has(lesson.lessonId);

                                    // line segments connect lesson circles (perfectly)
                                    return (
                                        <li
                                            key={lesson.lessonId}
                                            className={`relative pl-12 ${!isLast ? "pb-5" : ""}`}
                                        >
                                            {/* CONNECTORS (lesson-to-lesson) */}
                                            {!isFirst && (
                                                <div
                                                    className="absolute left-[12px] top-0 h-[18px] w-1 rounded-full bg-violet-400/70 z-0"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {!isLast && (
                                                <div
                                                    className="absolute left-[12px] top-[18px] bottom-0 w-1 rounded-full bg-violet-400/70 z-0"
                                                    aria-hidden="true"
                                                />
                                            )}

                                            {/* LESSON CIRCLE */}
                                            <div
                                                className={[
                                                    "absolute left-0 top-1 grid h-7 w-7 place-items-center rounded-full text-xs font-bold z-10",
                                                    nodeColor(lesson.status),
                                                ].join(" ")}
                                            >
                                                {idx + 1}
                                            </div>

                                            {/* LESSON CARD */}
                                            <button
                                                type="button"
                                                onClick={() => toggleLesson(lesson.lessonId)}
                                                className="w-full text-left rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 hover:bg-white/10 transition"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold">{lesson.title}</p>
                                                        <p className="mt-1 text-xs text-white/70">
                                                            {formatTime(lesson.progress.completedAt)} / {formatTime(lesson.progress.duration)}
                                                        </p>
                                                    </div>
                                                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${pill(lesson.status)}`}>
                                                        {lesson.status}
                                                    </span>
                                                </div>

                                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full bg-white/50 transition-all"
                                                        style={{ width: `${lesson.progress.pct}%` }}
                                                    />
                                                </div>

                                                <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                                                    <span>{lesson.videos.length} videos</span>
                                                    <span className="text-white/60">{isExpanded ? "Hide" : "Show"}</span>
                                                </div>
                                            </button>

                                            {/* VIDEOS (nested) */}
                                            {isExpanded && (
                                                <div className="mt-3 space-y-2 ml-8">
                                                    {lesson.videos.map((v) => {
                                                        const isActive = v.id === activeVideoId;
                                                        const disabled = v.status === "LOCKED";
                                                        const pct = v.duration > 0 ? Math.round((v.completedAt / v.duration) * 100) : 0;

                                                        return (
                                                            <button
                                                                key={v.id}
                                                                type="button"
                                                                onClick={() => !disabled && setActiveVideoId(v.id)}
                                                                className={[
                                                                    "w-full rounded-xl px-3 py-2 text-left transition ring-1",
                                                                    isActive ? "bg-white/10 ring-white/15" : "bg-white/0 ring-white/10 hover:bg-white/5",
                                                                    disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                                                                ].join(" ")}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold">{v.title}</p>
                                                                        <p className="mt-1 text-[11px] text-white/70">
                                                                            {formatTime(v.completedAt)} / {formatTime(v.duration)}
                                                                        </p>
                                                                    </div>
                                                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${pill(v.status)}`}>
                                                                        {v.status}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                                                                    <div className="h-full bg-white/50 transition-all" style={{ width: `${pct}%` }} />
                                                                </div>

                                                                <p className="mt-2 line-clamp-2 text-xs text-white/65">
                                                                    {v.description}
                                                                </p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </aside>

                    {/* RIGHT: Active video details */}
                    <section className="rounded-2xl bg-white/5 p-6 shadow-xl ring-1 ring-white/10">
                        {active ? (
                            <>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs text-white/70">
                                            {active.lessonTitle}
                                        </p>
                                        <h3 className="truncate text-xl font-semibold">{active.video.title}</h3>
                                        <p className="mt-2 text-sm text-white/75">{active.video.description}</p>
                                    </div>

                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${pill(active.video.status)}`}>
                                        {active.video.status}
                                    </span>
                                </div>

                                <div className="mt-6 rounded-xl bg-black/20 p-4 ring-1 ring-white/10">
                                    <div className="flex items-center justify-between text-sm text-white/80">
                                        <span>Progress</span>
                                        <span>
                                            {formatTime(active.video.completedAt)} / {formatTime(active.video.duration)}
                                        </span>
                                    </div>

                                    <input
                                        className="mt-3 w-full"
                                        type="range"
                                        min={0}
                                        max={active.video.duration}
                                        value={active.video.completedAt}
                                        onChange={(e) => setProgress(active.video.id, Number(e.target.value))}
                                        disabled={active.video.status === "LOCKED"}
                                    />

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.open(active.video.url, "_blank", "noopener,noreferrer")}
                                            className="rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
                                            disabled={active.video.status === "LOCKED"}
                                        >
                                            Play Lesson
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => markComplete(active.video.id)}
                                            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
                                            disabled={active.video.status === "LOCKED"}
                                        >
                                            Mark Complete
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => resetVideo(active.video.id)}
                                            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                                            disabled={active.video.status === "LOCKED"}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={goNextVideo}
                                        className="rounded-full bg-pink-400 px-6 py-3 text-base font-semibold text-white hover:bg-pink-500"
                                    >
                                        Next Video
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-white/70">Select a video to see details.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
