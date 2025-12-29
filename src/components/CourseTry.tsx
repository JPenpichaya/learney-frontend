import React, { useEffect, useMemo, useState } from "react";

type ProgressStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
type Mode = "subject" | "note" | "all";

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
  videos?: VideoProgress[]; // just in case
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
  useMock?: boolean; // default true for demo
};

/* ===================== NOTE TYPES ===================== */
type NoteItem = {
  id: string;
  videoId: string;
  lessonId: string;
  start: number; // seconds
  end: number; // seconds
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
};

type NotesByVideo = Record<string, NoteItem[]>;

/* ===================== Utils ===================== */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function pill(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#FF7C92] text-white";
    case "IN_PROGRESS":
      return "bg-[#FFEE91] text-black";
    case "AVAILABLE":
      return "bg-[#464B9F] text-black";
    case "LOCKED":
    default:
      return "bg-slate-600 text-white";
  }
}

function nodeColor(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#FF7C92] text-black";
    case "IN_PROGRESS":
      return "bg-[#FFEE91] text-black";
    case "AVAILABLE":
      return "bg-[#464B9F] text-black";
    case "LOCKED":
    default:
      return "bg-slate-500 text-white";
  }
}

/** Lesson status derived from videos */
function deriveLessonStatus(videos: VideoProgress[]): ProgressStatus {
  if (videos.length === 0) return "LOCKED";
  const allCompleted = videos.every(
    (v) => v.status === "COMPLETED" || v.completedAt >= v.duration
  );
  if (allCompleted) return "COMPLETED";

  const anyInProgress =
    videos.some((v) => v.status === "IN_PROGRESS") ||
    videos.some((v) => v.completedAt > 0 && v.completedAt < v.duration);
  if (anyInProgress) return "IN_PROGRESS";

  const anyAvailable = videos.some((v) => v.status === "AVAILABLE");
  if (anyAvailable) return "AVAILABLE";

  return "LOCKED";
}

function deriveLessonProgress(videos: VideoProgress[]) {
  const duration = videos.reduce((acc, v) => acc + (v.duration || 0), 0);
  const completedAt = videos.reduce(
    (acc, v) => acc + clamp(v.completedAt || 0, 0, v.duration || 0),
    0
  );
  const pct = duration > 0 ? Math.round((completedAt / duration) * 100) : 0;
  return { duration, completedAt, pct };
}

/** Normalize API payload: supports "videoes" misspelling */
function normalizeLessons(api: LessonProgressApi[]): LessonSection[] {
  return (api || []).map((l) => {
    const raw = l.videoes ?? l.videos ?? [];
    const videos = [...raw].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );
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
          description:
            "Understand what verbs are and how to use them in sentences.",
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
          title: "Verb + ing",
          description: "Gerund and present participle basics.",
          status: "LOCKED",
          completedAt: 0,
          duration: 600,
          url: "https://example.com/video/verb-ing",
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
    throw new Error(
      `Fetch failed: ${res.status} ${res.statusText} ${text}`.trim()
    );
  }

  const data = (await res.json()) as LessonProgressApi[];
  return normalizeLessons(data);
}

/* ===================== Notes Storage =====================
   - localStorage key แยกตาม courseId + userId (ถ้ามี)
*/
function uid() {
  return (
    (globalThis.crypto as any)?.randomUUID?.() ??
    `note_${Date.now()}_${Math.random().toString(16).slice(2)}`
  );
}

function loadNotes(key: string): NotesByVideo {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NotesByVideo;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveNotes(key: string, data: NotesByVideo) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
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
  const [expandedLessonIds, setExpandedLessonIds] = useState<Set<string>>(
    () => new Set()
  );
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  // ✅ panel toggle (เหมือนรูป)
  const [panelOpen, setPanelOpen] = useState(true);

  // ✅ mode: subject/note/all
  const [mode, setMode] = useState<Mode>("subject");

  // ====== ปรับให้ตรงโปรเจกต์คุณ ======
  const TOP_OFFSET = 64; // ความสูง Menubar (px)
  const PANEL_W = 390; // ความกว้าง panel ด้านขวา
  // ===================================

  // ✅ Notes key / state
  const NOTES_KEY = useMemo(() => {
    const cid = courseId || "demoCourse";
    const uid2 = userId || "anon";
    return `learney_notes_${cid}_${uid2}`;
  }, [courseId, userId]);

  const [notesByVideo, setNotesByVideo] = useState<NotesByVideo>(() =>
    loadNotes(NOTES_KEY)
  );

  useEffect(() => {
    setNotesByVideo(loadNotes(NOTES_KEY));
  }, [NOTES_KEY]);

  useEffect(() => {
    saveNotes(NOTES_KEY, notesByVideo);
  }, [NOTES_KEY, notesByVideo]);

  // ✅ menubar-style scroll lock + backdrop (จอเล็ก)
  useEffect(() => {
    const prev = document.body.style.overflow;
    // เวลาพาเนลเปิดบนมือถือ: ล็อกสกอลล์
    const shouldLock =
      panelOpen && window.matchMedia("(max-width: 1023px)").matches;
    document.body.style.overflow = shouldLock ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panelOpen]);

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
      .catch((e) => console.error(e));

    return () => {
      cancelled = true;
    };
  }, [useMock, apiBaseUrl, userId, courseId, idToken]);

  const lessonView = useMemo(() => {
    return lessons.map((lesson, idx) => {
      const status = deriveLessonStatus(lesson.videos);
      const progress = deriveLessonProgress(lesson.videos);
      const title = `Lesson ${idx + 1}`;
      return { ...lesson, idx, title, status, progress };
    });
  }, [lessons]);

  const flatVideos = useMemo(() => {
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

  const active = useMemo(
    () => flatVideos.find((x) => x.video.id === activeVideoId) ?? null,
    [flatVideos, activeVideoId]
  );

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
        videos: lesson.videos.map((v) =>
          v.id === videoId ? { ...v, ...patch } : v
        ),
      }))
    );
  }

  function unlockNextAfter(videoId: string) {
    const idx = flatVideos.findIndex((x) => x.video.id === videoId);
    if (idx < 0) return;

    const current = flatVideos[idx];
    const nextSameLesson = flatVideos
      .slice(idx + 1)
      .find((x) => x.lessonId === current.lessonId);

    if (nextSameLesson && nextSameLesson.video.status === "LOCKED") {
      updateVideo(nextSameLesson.video.id, { status: "AVAILABLE" });
      return;
    }

    const nextAny = flatVideos
      .slice(idx + 1)
      .find((x) => x.video.status === "LOCKED");
    if (nextAny) updateVideo(nextAny.video.id, { status: "AVAILABLE" });
  }

  function setProgress(videoId: string, newCompletedAt: number) {
    const v = flatVideos.find((x) => x.video.id === videoId)?.video;
    if (!v) return;

    const completedAt = clamp(newCompletedAt, 0, v.duration);
    let status: ProgressStatus = v.status;

    if (completedAt <= 0)
      status = v.status === "LOCKED" ? "LOCKED" : "AVAILABLE";
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
    updateVideo(videoId, {
      completedAt: 0,
      status: v.status === "LOCKED" ? "LOCKED" : "AVAILABLE",
    });
  }

  function goNextVideo() {
    if (!active) return;
    markComplete(active.video.id);

    const idx = flatVideos.findIndex((x) => x.video.id === active.video.id);
    const next = flatVideos
      .slice(idx + 1)
      .find((x) => x.video.status !== "LOCKED");
    if (next) setActiveVideoId(next.video.id);
  }

  // ✅ progress bar แบบในรูป (รวมทั้งคอร์ส)
  const overallPct = useMemo(() => {
    const total = flatVideos.reduce(
      (acc, x) => acc + (x.video.duration || 0),
      0
    );
    const done = flatVideos.reduce(
      (acc, x) =>
        acc + clamp(x.video.completedAt || 0, 0, x.video.duration || 0),
      0
    );
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [flatVideos]);

  /* ===================== NOTES LOGIC ===================== */
  const activeNotes = useMemo(() => {
    if (!activeVideoId) return [];
    return notesByVideo[activeVideoId] ?? [];
  }, [notesByVideo, activeVideoId]);

  const allNotes = useMemo(() => {
    const items: NoteItem[] = [];
    Object.values(notesByVideo).forEach((arr) => items.push(...arr));
    // newest first
    return items.sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)
    );
  }, [notesByVideo]);

  const [noteDraft, setNoteDraft] = useState({
    start: 0,
    end: 10,
    text: "",
    tags: "",
  });

  const [editing, setEditing] = useState<{
    videoId: string;
    noteId: string;
  } | null>(null);

  // reset draft when active video changes
  useEffect(() => {
    setEditing(null);
    setNoteDraft({ start: 0, end: 10, text: "", tags: "" });
  }, [activeVideoId]);

  function addNote() {
    if (!active || !activeVideoId) return;
    const text = noteDraft.text.trim();
    if (!text) return;

    const start = clamp(Number(noteDraft.start) || 0, 0, active.video.duration);
    const end = clamp(
      Number(noteDraft.end) || start,
      start,
      active.video.duration
    );
    const tags = noteDraft.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const item: NoteItem = {
      id: uid(),
      videoId: activeVideoId,
      lessonId: active.lessonId,
      start,
      end,
      text,
      tags,
      createdAt: new Date().toISOString(),
    };

    setNotesByVideo((prev) => {
      const next = { ...prev };
      const arr = next[activeVideoId] ? [...next[activeVideoId]] : [];
      arr.unshift(item);
      next[activeVideoId] = arr;
      return next;
    });

    setNoteDraft((d) => ({ ...d, text: "" }));
  }

  function deleteNote(videoId: string, noteId: string) {
    setNotesByVideo((prev) => {
      const next = { ...prev };
      const arr = (next[videoId] ?? []).filter((n) => n.id !== noteId);
      if (arr.length === 0) delete next[videoId];
      else next[videoId] = arr;
      return next;
    });
  }

  function beginEdit(videoId: string, note: NoteItem) {
    setEditing({ videoId, noteId: note.id });
    setMode("note");
    setNoteDraft({
      start: note.start,
      end: note.end,
      text: note.text,
      tags: note.tags.join(", "),
    });
  }

  function saveEdit() {
    if (!editing || !active) return;
    const { videoId, noteId } = editing;
    const text = noteDraft.text.trim();
    if (!text) return;

    const duration = active.video.duration;
    const start = clamp(Number(noteDraft.start) || 0, 0, duration);
    const end = clamp(Number(noteDraft.end) || start, start, duration);
    const tags = noteDraft.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setNotesByVideo((prev) => {
      const next = { ...prev };
      const arr = [...(next[videoId] ?? [])];
      const idx = arr.findIndex((n) => n.id === noteId);
      if (idx >= 0) {
        arr[idx] = {
          ...arr[idx],
          start,
          end,
          text,
          tags,
          updatedAt: new Date().toISOString(),
        };
        next[videoId] = arr;
      }
      return next;
    });

    setEditing(null);
    setNoteDraft({ start: 0, end: 10, text: "", tags: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setNoteDraft({ start: 0, end: 10, text: "", tags: "" });
  }

  // Map videoId -> titles for All Note
  const videoTitleMap = useMemo(() => {
    const m = new Map<string, { lessonTitle: string; videoTitle: string }>();
    flatVideos.forEach((x) =>
      m.set(x.video.id, {
        lessonTitle: x.lessonTitle,
        videoTitle: x.video.title,
      })
    );
    return m;
  }, [flatVideos]);

  // ===================== UI =====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#47304B]  to-[#070D2D] text-white">
      {/* ✅ Backdrop แบบ Menubar (เฉพาะมือถือ) */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* MAIN CONTENT: เว้นที่ด้านขวาให้ panel (ไม่โดนทับ) */}
      <div
        className="min-h-screen transition-[padding-right] duration-300"
        style={{ paddingRight: panelOpen ? PANEL_W : 0 }}
      >
        <div
          className="mx-auto max-w-6xl px-4"
          style={{ paddingTop: TOP_OFFSET + 24 }}
        >
          {/* เนื้อหาเดิมฝั่งซ้าย/กลาง (Active video details) */}
          <section className="rounded-2xl bg-white/5 p-6 shadow-xl ring-1 ring-white/10">
            {active ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-white/70">
                      {active.lessonTitle}
                    </p>
                    <h3 className="truncate text-xl font-semibold">
                      {active.video.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/75">
                      {active.video.description}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${pill(
                      active.video.status
                    )}`}
                  >
                    {active.video.status}
                  </span>
                </div>

                <div className="mt-6 rounded-xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Progress</span>
                    <span>
                      {formatTime(active.video.completedAt)} /{" "}
                      {formatTime(active.video.duration)}
                    </span>
                  </div>

                  <input
                    className="mt-3 w-full"
                    type="range"
                    min={0}
                    max={active.video.duration}
                    value={active.video.completedAt}
                    onChange={(e) =>
                      setProgress(active.video.id, Number(e.target.value))
                    }
                    disabled={active.video.status === "LOCKED"}
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          active.video.url,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
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

      {/* RIGHT PANEL (เหมือนรูป) */}
      <aside
        className="fixed right-0 bg-[#23213B] z-50 transition-transform duration-300 ease-in-out"
        style={{
          top: TOP_OFFSET,
          height: `calc(100% - ${TOP_OFFSET}px)`,
          width: PANEL_W,
          transform: panelOpen ? "translateX(0px)" : `translateX(${PANEL_W}px)`,
        }}
      >
        <div className="h-full bg-white/5 backdrop-blur-md ring-1 ring-white/10 relative">
          {/* Arrow handle (โผล่ออกซ้าย) */}
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="absolute -left-14 top-6 h-14 w-14 rounded-l-2xl bg-pink-300/90 text-black grid place-items-center shadow-lg"
            aria-label="Toggle progress panel"
          >
            <span className="text-4xl leading-none">
              {panelOpen ? ">" : "<"}
            </span>
          </button>

          {/* Tabs row (✅ กดได้ เปลี่ยนโหมด) */}
          <div className="flex items-center justify-end gap-2 pr-20 mb-5 pt-5">
            <button
              type="button"
              onClick={() => setMode("subject")}
              className={[
                "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                mode === "subject"
                  ? "bg-yellow-300 text-black"
                  : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              subject
            </button>

            <button
              type="button"
              onClick={() => setMode("note")}
              className={[
                "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                mode === "note"
                  ? "bg-pink-400 text-white"
                  : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              Note
            </button>

            <button
              type="button"
              onClick={() => setMode("all")}
              className={[
                "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                mode === "all"
                  ? "bg-violet-400 text-white"
                  : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              All Note
            </button>
          </div>

          {/* Title + progress bar */}
          <div className="px-6 pt-3">
            <div className="text-center text-4xl font-extrabold tracking-wide">
              PROGRESS
            </div>

            <div className="mt-4 mb-5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#464B9F] via-[#EA688E] to-[#F1F069] transition-all"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          {/* Content area */}
          <div className="px-6  pt-6 pb-10 overflow-auto h-[calc(100%-150px)]">
            {/* ===================== SUBJECT ===================== */}
            {mode === "subject" && (
              <ul>
                {lessonView.map((lesson, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === lessonView.length - 1;
                  const isExpanded = expandedLessonIds.has(lesson.lessonId);

                  return (
                    <li
                      key={lesson.lessonId}
                      className={`relative  pl-12 ${!isLast ? "pb-6" : ""}`}
                    >
                      {!isFirst && (
                        <div
                          className="absolute left-[12px] top-0 h-[18px] w-1 rounded-full bg-yellow-200/80 z-0"
                          aria-hidden="true"
                        />
                      )}
                      {!isLast && (
                        <div
                          className="absolute left-[12px] top-[18px] bottom-0 w-1 rounded-full bg-yellow-200/80 z-0"
                          aria-hidden="true"
                        />
                      )}

                      <div
                        className={[
                          "absolute -left-0.5 -top-1 grid h-8 w-8 place-items-center rounded-full text-xs font-bold z-10",
                          nodeColor(lesson.status),
                        ].join(" ")}
                      >
                        {idx + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleLesson(lesson.lessonId)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center mt-[0.5px] justify-between gap-3">
                          <div className="text-lg font-medium text-white/90">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-white/60">
                            {isExpanded ? "Hide" : "Show"}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 ml-0">
                          {lesson.videos.map((v) => {
                            const isActive = v.id === activeVideoId;
                            const disabled = v.status === "LOCKED";

                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  !disabled && setActiveVideoId(v.id)
                                }
                                className={[
                                  "w-full text-left rounded-2xl px-4 py-3 transition ring-1",
                                  isActive
                                    ? "bg-white/10 ring-white/15"
                                    : "bg-white/0 ring-white/10 hover:bg-white/5",
                                  disabled
                                    ? "opacity-60 cursor-not-allowed"
                                    : "cursor-pointer",
                                ].join(" ")}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <span className="mt-1 h-4 w-4 rounded-full bg-yellow-200 inline-block shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-base font-semibold truncate">
                                        {v.title}
                                      </p>
                                      <p className="text-sm text-white/70 line-clamp-2">
                                        {v.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-white/80 shrink-0">
                                    {formatTime(v.duration)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ===================== NOTE (active video) ===================== */}
            {mode === "note" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="text-xs text-white/60">Active video</div>
                  <div className="mt-1 font-semibold truncate">
                    {active?.video.title ?? "No active video"}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {active
                      ? `${formatTime(active.video.completedAt)} / ${formatTime(
                          active.video.duration
                        )}`
                      : ""}
                  </div>
                </div>

                {/* editor */}
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      {editing ? "Edit Note" : "Add Note"}
                    </div>
                    <div className="text-xs text-white/60">
                      {activeNotes.length} notes
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="text-xs text-white/70">
                      Start (sec)
                      <input
                        className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-white"
                        type="number"
                        value={noteDraft.start}
                        onChange={(e) =>
                          setNoteDraft((d) => ({
                            ...d,
                            start: Number(e.target.value),
                          }))
                        }
                      />
                    </label>

                    <label className="text-xs text-white/70">
                      End (sec)
                      <input
                        className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-white"
                        type="number"
                        value={noteDraft.end}
                        onChange={(e) =>
                          setNoteDraft((d) => ({
                            ...d,
                            end: Number(e.target.value),
                          }))
                        }
                      />
                    </label>
                  </div>

                  <label className="mt-3 block text-xs text-white/70">
                    Text
                    <textarea
                      className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-white min-h-[90px]"
                      value={noteDraft.text}
                      onChange={(e) =>
                        setNoteDraft((d) => ({ ...d, text: e.target.value }))
                      }
                      placeholder="พิมพ์โน้ต..."
                    />
                  </label>

                  <label className="mt-3 block text-xs text-white/70">
                    Tags (comma)
                    <input
                      className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-white"
                      value={noteDraft.tags}
                      onChange={(e) =>
                        setNoteDraft((d) => ({ ...d, tags: e.target.value }))
                      }
                      placeholder="grammar, tense, exam"
                    />
                  </label>

                  <div className="mt-3 flex justify-end gap-2">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={addNote}
                        className="rounded-full bg-pink-400 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500"
                      >
                        Add Note
                      </button>
                    )}
                  </div>
                </div>

                {/* list */}
                <div className="space-y-3">
                  {activeNotes.length === 0 ? (
                    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-white/70">
                      ยังไม่มีโน้ตของวิดีโอนี้
                    </div>
                  ) : (
                    activeNotes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-white/70">
                            {formatTime(n.start)} - {formatTime(n.end)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full"
                              onClick={() => beginEdit(n.videoId, n)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full"
                              onClick={() => deleteNote(n.videoId, n.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-sm">{n.text}</div>

                        {n.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {n.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/80"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===================== ALL NOTE ===================== */}
            {mode === "all" && (
              <AllNotesPanel
                allNotes={allNotes}
                videoTitleMap={videoTitleMap}
                onJump={(videoId) => {
                  setActiveVideoId(videoId);
                  setMode("subject"); // กระโดดไป subject เพื่อเห็น video ใน timeline (เลือกได้)
                }}
              />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ===================== All Notes UI ===================== */
function AllNotesPanel(props: {
  allNotes: NoteItem[];
  videoTitleMap: Map<string, { lessonTitle: string; videoTitle: string }>;
  onJump: (videoId: string) => void;
}) {
  const { allNotes, videoTitleMap, onJump } = props;
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return allNotes;
    return allNotes.filter((n) => {
      const meta = videoTitleMap.get(n.videoId);
      const hay = [
        n.text,
        n.tags.join(" "),
        meta?.lessonTitle ?? "",
        meta?.videoTitle ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [allNotes, q, videoTitleMap]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">All Notes</div>
        <div className="text-xs text-white/60">{filtered.length} items</div>
      </div>

      <input
        className="w-full rounded-2xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40"
        placeholder="Search notes, tags, lesson, video..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-white/70">
          ไม่เจอโน้ต
        </div>
      ) : (
        filtered.map((n) => {
          const meta = videoTitleMap.get(n.videoId);
          return (
            <div
              key={n.id}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-white/60 truncate">
                    {meta?.lessonTitle ?? "Lesson"} •{" "}
                    {meta?.videoTitle ?? "Video"}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {formatTime(n.start)} - {formatTime(n.end)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onJump(n.videoId)}
                  className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full shrink-0"
                >
                  Jump
                </button>
              </div>

              <div className="mt-2 text-sm">{n.text}</div>

              {n.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {n.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/80"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
