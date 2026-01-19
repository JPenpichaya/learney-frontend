import { useEffect, useMemo, useRef, useState } from "react";

/* ===================== TYPES ===================== */
type ProgressStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
type Mode = "subject" | "note" | "all";
type DataMode = "mock" | "api" | "local";

type VideoProgress = {
  id: string;
  description: string;
  status: ProgressStatus;
  completedAt: number;
  title: string;
  url: string;
  duration: number;
  position: number;
};

type LessonProgressApi = {
  lessonId: string;
  videoes?: VideoProgress[];
  videos?: VideoProgress[];
};

type LessonSection = {
  lessonId: string;
  videos: VideoProgress[];
};

type Props = {
  userId?: string;
  courseId?: string;
  idToken?: string;
  apiBaseUrl?: string;

  /** ✅ 3 โหมด: mock | api | local */
  dataMode?: DataMode;

  /** ถ้าโหมด local แล้วหาไม่เจอ ให้ fallback ไป mock ไหม */
  localFallbackToMock?: boolean;

  /** persist ลง localStorage ไหม (สำหรับ local) */
  persistLocal?: boolean;
};

/* ===================== NOTE TYPES ===================== */
type NoteItem = {
  id: string;
  videoId: string;
  lessonId: string;
  time: number;
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
      return "bg-[#464B9F] text-white";
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
      return "bg-[#464B9F] text-white";
    case "LOCKED":
    default:
      return "bg-slate-500 text-white";
  }
}

/** ✅ status จริงของวิดีโอ (อิง completedAt/duration) */
function getEffectiveVideoStatus(v: VideoProgress): ProgressStatus {
  const dur = v.duration ?? 0;
  const done = v.completedAt ?? 0;

  if (v.status === "LOCKED") return "LOCKED";
  if (dur > 0 && done >= dur) return "COMPLETED";
  if (done > 0) return "IN_PROGRESS";
  return v.status ?? "AVAILABLE";
}

/** ✅ สีเส้นด้านนอกสุด */
function outerLineColor(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#FF7C92]";
    case "IN_PROGRESS":
      return "bg-[#FFEE91]";
    case "AVAILABLE":
      return "bg-[#464B9F]";
    case "LOCKED":
    default:
      return "bg-slate-500";
  }
}

function dotColor(status: ProgressStatus) {
  return outerLineColor(status);
}

/** ✅ Segments ของเส้นด้านนอกสุด */
function getLessonSegments(videos: VideoProgress[]): ProgressStatus[] {
  const raw = (videos ?? []).map(getEffectiveVideoStatus);
  if (raw.length === 0) return ["LOCKED"];

  const allAvailable = raw.every((s) => s === "AVAILABLE");
  if (allAvailable) return raw.map(() => "AVAILABLE");

  const hasInProgress = raw.includes("IN_PROGRESS");
  const hasAvailable = raw.includes("AVAILABLE");

  if (hasInProgress && !hasAvailable) return raw.map(() => "IN_PROGRESS");

  if (hasInProgress && hasAvailable) {
    const firstAvailIdx = raw.findIndex((s) => s === "AVAILABLE");
    return raw.map((s, i) => (i < firstAvailIdx ? "IN_PROGRESS" : s));
  }

  return raw;
}

function deriveLessonStatus(videos: VideoProgress[]): ProgressStatus {
  if (videos.length === 0) return "LOCKED";

  const statuses: ProgressStatus[] = videos.map(getEffectiveVideoStatus);
  const unique = new Set(statuses);

  if (unique.size === 1 && unique.has("LOCKED")) return "LOCKED";
  if (unique.has("IN_PROGRESS")) return "IN_PROGRESS";
  if (unique.size === 1 && unique.has("COMPLETED")) return "COMPLETED";
  if (unique.size === 1 && unique.has("AVAILABLE")) return "AVAILABLE";
  return "IN_PROGRESS";
}

function deriveLessonProgress(videos: VideoProgress[]) {
  const duration = videos.reduce((acc, v) => acc + (v.duration || 0), 0);
  const completedAt = videos.reduce(
    (acc, v) => acc + clamp(v.completedAt || 0, 0, v.duration || 0),
    0,
  );
  const pct = duration > 0 ? Math.round((completedAt / duration) * 100) : 0;
  return { duration, completedAt, pct };
}

function normalizeLessons(api: LessonProgressApi[]): LessonSection[] {
  return (api || []).map((l) => {
    const raw = l.videoes ?? l.videos ?? [];
    const videos = [...raw].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0),
    );
    return { lessonId: l.lessonId, videos };
  });
}

/* ===================== Mock (key by courseId) ===================== */
function makeMockApiResponse(courseId?: string): LessonProgressApi[] {
  // mock ให้ “ต่างกันตามคอร์ส” แบบง่าย ๆ
  const seed = (courseId ?? "demo")
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = (n: number) => (Math.sin(seed + n) + 1) / 2;

  const uuid = (tag: string) => `${tag}-${Math.floor(rnd(tag.length) * 1e9)}`;

  return [
    {
      lessonId: uuid("lesson-1"),
      videoes: [
        {
          id: uuid("v-1-1"),
          title: "Verb",
          description: "Understand what verbs are and how to use them.",
          status: "COMPLETED",
          completedAt: 600,
          duration: 600,
          url: "https://www.youtube.com/watch?v=_iIUGEOreiw",
          position: 1,
        },
        {
          id: uuid("v-1-2"),
          title: "Verb Examples",
          description: "Extra examples to reinforce verb usage.",
          status: "COMPLETED",
          completedAt: 300,
          duration: 300,
          url: "https://www.youtube.com/watch?v=2C4xsP1xR0Q",
          position: 2,
        },
      ],
    },
    {
      lessonId: uuid("lesson-2"),
      videoes: [
        {
          id: uuid("v-2-1"),
          title: "Past Simple",
          description: "Learn past simple structure and usage patterns.",
          status: "IN_PROGRESS",
          completedAt: 240,
          duration: 600,
          url: "https://www.youtube.com/watch?v=p0JFc5giu9U",
          position: 1,
        },
        {
          id: uuid("v-2-2"),
          title: "Past Simple Practice",
          description: "Practice questions for past simple.",
          status: "AVAILABLE",
          completedAt: 0,
          duration: 480,
          url: "https://www.youtube.com/watch?v=p0JFc5giu9U",
          position: 2,
        },
        {
          id: uuid("v-2-3"),
          title: "Past Simple Quiz",
          description: "Quick quiz to test your understanding.",
          status: "LOCKED",
          completedAt: 0,
          duration: 420,
          url: "https://www.youtube.com/watch?v=p0JFc5giu9U",
          position: 3,
        },
      ],
    },
  ];
}

/* ===================== API ===================== */
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
      `Fetch failed: ${res.status} ${res.statusText} ${text}`.trim(),
    );
  }

  const data = (await res.json()) as LessonProgressApi[];
  return normalizeLessons(data);
}

/* ===================== Local persistence for lessons ===================== */
function lessonsStorageKey(courseId?: string, userId?: string) {
  return `learney_lessons_${courseId || "demoCourse"}_${userId || "anon"}`;
}

function loadLessonsFromLocal(key: string): LessonSection[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LessonSection[];
    if (!Array.isArray(parsed)) return null;
    // basic validate
    if (parsed.some((l) => !l.lessonId || !Array.isArray(l.videos)))
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveLessonsToLocal(key: string, lessons: LessonSection[]) {
  try {
    localStorage.setItem(key, JSON.stringify(lessons));
  } catch {}
}

/* ===================== Notes storage ===================== */
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
  } catch {}
}

/* ===================== YouTube helpers ===================== */
function isProbablyYouTube(url: string) {
  return /youtube\.com|youtu\.be/i.test(url);
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (short?.[1]) return short[1];

    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;

    const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (embed?.[1]) return embed[1];

    return null;
  } catch {
    const m = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    return m?.[1] ?? null;
  }
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function useYouTubeApiReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setReady(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    ) as HTMLScriptElement | null;

    window.onYouTubeIframeAPIReady = () => setReady(true);

    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }

    const t = window.setInterval(() => {
      if (window.YT && window.YT.Player) {
        window.clearInterval(t);
        setReady(true);
      }
    }, 250);

    return () => window.clearInterval(t);
  }, []);

  return ready;
}

/* ===================== Component ===================== */
export default function LessonVideoTracker({
  userId,
  courseId,
  idToken,
  apiBaseUrl,
  dataMode,
  localFallbackToMock,
  persistLocal,
}: Props) {
  /** ✅ ไม่มี default mock แล้ว */
  const [lessons, setLessons] = useState<LessonSection[]>([]);
  const [expandedLessonIds, setExpandedLessonIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  const [panelOpen, setPanelOpen] = useState(true);
  const [mode, setMode] = useState<Mode>("subject");

  const TOP_OFFSET = 64;
  const PANEL_W = 390;

  /* ===== Notes ===== */
  const NOTES_KEY = useMemo(() => {
    const cid = courseId || "demoCourse";
    const uid2 = userId || "anon";
    return `learney_notes_${cid}_${uid2}`;
  }, [courseId, userId]);

  const [notesByVideo, setNotesByVideo] = useState<NotesByVideo>(() =>
    loadNotes(NOTES_KEY),
  );
  useEffect(() => setNotesByVideo(loadNotes(NOTES_KEY)), [NOTES_KEY]);
  useEffect(
    () => saveNotes(NOTES_KEY, notesByVideo),
    [NOTES_KEY, notesByVideo],
  );

  /* ===== 3-mode loader ===== */
  const LESSONS_KEY = useMemo(
    () => lessonsStorageKey(courseId, userId),
    [courseId, userId],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1) local
        if (dataMode === "local") {
          const local = loadLessonsFromLocal(LESSONS_KEY);
          if (local && !cancelled) {
            setLessons(local);
            return;
          }
          if (localFallbackToMock) {
            const mock = normalizeLessons(makeMockApiResponse(courseId));
            if (!cancelled) setLessons(mock);
            return;
          }
          if (!cancelled) setLessons([]);
          return;
        }

        // 2) api
        if (dataMode === "api") {
          if (!apiBaseUrl || !userId || !courseId || !idToken) {
            if (!cancelled) setLessons([]);
            return;
          }
          const real = await fetchLessonProgress({
            apiBaseUrl,
            userId,
            courseId,
            idToken,
          });
          if (!cancelled) setLessons(real);
          return;
        }

        // 3) mock
        const mock = normalizeLessons(makeMockApiResponse(courseId));
        if (!cancelled) setLessons(mock);
      } catch (e) {
        console.error(e);
        if (!cancelled) setLessons([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    dataMode,
    LESSONS_KEY,
    apiBaseUrl,
    userId,
    courseId,
    idToken,
    localFallbackToMock,
  ]);

  /** ✅ persist lessons (เฉพาะ dataMode=local หรืออยากเก็บไว้ใช้ต่อ) */
  useEffect(() => {
    if (!persistLocal) return;
    if (dataMode !== "local") return; // ถ้าอยากให้ api/mock ก็เก็บได้ ให้เอาเงื่อนไขนี้ออก
    if (!lessons.length) return;
    saveLessonsToLocal(LESSONS_KEY, lessons);
  }, [persistLocal, dataMode, LESSONS_KEY, lessons]);

  /* ===== scroll lock (mobile) ===== */
  useEffect(() => {
    const prev = document.body.style.overflow;
    const shouldLock =
      panelOpen && window.matchMedia("(max-width: 1023px)").matches;
    document.body.style.overflow = shouldLock ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panelOpen]);

  /* ===== derived views ===== */
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
    [flatVideos, activeVideoId],
  );

  /** ✅ default active (อันนี้ควรมี) */
  useEffect(() => {
    if (activeVideoId) return;
    if (flatVideos.length === 0) return;

    const firstUnlocked = flatVideos.find((x) => x.video.status !== "LOCKED");
    const pick = firstUnlocked ?? flatVideos[0];

    if (pick) {
      setActiveVideoId(pick.video.id);
      setExpandedLessonIds((prev) => new Set(prev).add(pick.lessonId));
    }
  }, [activeVideoId, flatVideos]);

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
          v.id === videoId ? { ...v, ...patch } : v,
        ),
      })),
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

    const completedAt = clamp(newCompletedAt, 0, v.duration || newCompletedAt);
    let status: ProgressStatus = v.status;

    if (completedAt <= 0)
      status = v.status === "LOCKED" ? "LOCKED" : "AVAILABLE";
    else if (v.duration > 0 && completedAt >= v.duration) status = "COMPLETED";
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

  function goNextVideo() {
    if (!active) return;
    markComplete(active.video.id);

    const idx = flatVideos.findIndex((x) => x.video.id === active.video.id);
    const next = flatVideos
      .slice(idx + 1)
      .find((x) => x.video.status !== "LOCKED");
    if (next) setActiveVideoId(next.video.id);
  }

  const overallPct = useMemo(() => {
    const total = flatVideos.reduce(
      (acc, x) => acc + (x.video.duration || 0),
      0,
    );
    const done = flatVideos.reduce(
      (acc, x) =>
        acc + clamp(x.video.completedAt || 0, 0, x.video.duration || 0),
      0,
    );
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [flatVideos]);

  /* ===================== Notes logic ===================== */
  const activeNotes = useMemo(() => {
    if (!activeVideoId) return [];
    return notesByVideo[activeVideoId] ?? [];
  }, [notesByVideo, activeVideoId]);

  const allNotes = useMemo(() => {
    const items: NoteItem[] = [];
    Object.values(notesByVideo).forEach((arr) => items.push(...arr));
    return items.sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    );
  }, [notesByVideo]);

  const [noteDraft, setNoteDraft] = useState({ text: "", tags: "" });

  useEffect(() => {
    setNoteDraft({ text: "", tags: "" });
  }, [activeVideoId]);

  /* ===================== PLAYER (Hybrid: YouTube + HTML5) ===================== */
  const ytReady = useYouTubeApiReady();
  const ytPlayerRef = useRef<any>(null);
  const htmlVideoRef = useRef<HTMLVideoElement | null>(null);

  const pendingSeekRef = useRef<{
    videoId: string;
    time: number;
    autoplay?: boolean;
  } | null>(null);
  const [pauseWhileTyping, setPauseWhileTyping] = useState(true);

  const ytPollRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  function stopYtPolling() {
    if (ytPollRef.current) {
      window.clearInterval(ytPollRef.current);
      ytPollRef.current = null;
    }
  }

  function startYtPolling() {
    stopYtPolling();
    ytPollRef.current = window.setInterval(() => {
      if (!active || !ytPlayerRef.current) return;

      const now = Date.now();
      if (now - lastTickRef.current < 800) return;
      lastTickRef.current = now;

      try {
        const t = Number(ytPlayerRef.current.getCurrentTime?.() ?? 0);
        setProgress(active.video.id, t);

        const dur = Number(ytPlayerRef.current.getDuration?.() ?? 0);
        if (dur > 0 && Math.abs((active.video.duration || 0) - dur) > 1) {
          updateVideo(active.video.id, { duration: Math.floor(dur) });
        }
      } catch {}
    }, 250);
  }

  function destroyYtPlayer() {
    stopYtPolling();
    try {
      ytPlayerRef.current?.destroy?.();
    } catch {}
    ytPlayerRef.current = null;
  }

  function handleHtmlTimeUpdate() {
    if (!active || !htmlVideoRef.current) return;

    const now = Date.now();
    if (now - lastTickRef.current < 800) return;
    lastTickRef.current = now;

    const t = htmlVideoRef.current.currentTime || 0;
    setProgress(active.video.id, t);
  }

  function handleHtmlLoadedMetadata() {
    if (!active || !htmlVideoRef.current) return;
    const el = htmlVideoRef.current;

    const dur = el.duration;
    if (
      Number.isFinite(dur) &&
      dur > 0 &&
      (!active.video.duration || active.video.duration <= 0)
    ) {
      updateVideo(active.video.id, { duration: Math.floor(dur) });
    }

    const ps = pendingSeekRef.current;
    if (ps && ps.videoId === active.video.id) {
      try {
        const maxD =
          active.video.duration || Math.floor(dur) || Number.MAX_SAFE_INTEGER;
        const tt = clamp(ps.time, 0, maxD);
        el.currentTime = tt;
        setProgress(active.video.id, tt);
        if (ps.autoplay) el.play().catch(() => {});
      } catch {}

      pendingSeekRef.current = null;
      return;
    }

    try {
      el.currentTime = clamp(
        active.video.completedAt || 0,
        0,
        active.video.duration || Math.floor(dur) || 0,
      );
    } catch {}
  }

  function handleHtmlEnded() {
    if (!active) return;
    markComplete(active.video.id);
  }

  function getNowTimeAny() {
    if (!active) return 0;

    if (isProbablyYouTube(active.video.url)) {
      const t = Number(ytPlayerRef.current?.getCurrentTime?.() ?? NaN);
      if (Number.isFinite(t)) return t;
      return active.video.completedAt || 0;
    }

    const t = Number(htmlVideoRef.current?.currentTime ?? NaN);
    if (Number.isFinite(t)) return t;
    return active.video.completedAt || 0;
  }

  function getDurationAny() {
    if (!active) return 0;

    if (isProbablyYouTube(active.video.url)) {
      const d = Number(ytPlayerRef.current?.getDuration?.() ?? NaN);
      if (Number.isFinite(d) && d > 0) return d;
      return active.video.duration || 0;
    }

    const d = Number(htmlVideoRef.current?.duration ?? NaN);
    if (Number.isFinite(d) && d > 0) return d;
    return active.video.duration || 0;
  }

  function pauseAny() {
    if (!active) return;
    if (isProbablyYouTube(active.video.url)) {
      ytPlayerRef.current?.pauseVideo?.();
      return;
    }
    htmlVideoRef.current?.pause();
  }

  function seekAny(time: number, autoplay = false) {
    if (!active) return;

    const dur = getDurationAny();
    const t = clamp(time, 0, dur > 0 ? dur : Number.MAX_SAFE_INTEGER);

    if (isProbablyYouTube(active.video.url)) {
      if (!ytPlayerRef.current?.seekTo) {
        pendingSeekRef.current = {
          videoId: active.video.id,
          time: t,
          autoplay,
        };
        return;
      }

      ytPlayerRef.current.seekTo(t, true);
      setProgress(active.video.id, t);
      if (autoplay) ytPlayerRef.current.playVideo?.();
      else ytPlayerRef.current.pauseVideo?.();
      return;
    }

    const el = htmlVideoRef.current;
    if (!el) {
      pendingSeekRef.current = { videoId: active.video.id, time: t, autoplay };
      return;
    }

    try {
      el.currentTime = t;
      setProgress(active.video.id, t);
      if (autoplay) el.play().catch(() => {});
    } catch {
      pendingSeekRef.current = { videoId: active.video.id, time: t, autoplay };
    }
  }

  useEffect(() => {
    if (!active) return;

    const isYT = isProbablyYouTube(active.video.url);
    if (!isYT) {
      destroyYtPlayer();
      return;
    }
    if (!ytReady) return;

    const vid = getYouTubeVideoId(active.video.url);
    if (!vid) return;

    const mountId = `yt-player-${active.video.id}`;
    const mount = document.getElementById(mountId);
    if (!mount) return;

    destroyYtPlayer();

    ytPlayerRef.current = new (window as any).YT.Player(mountId, {
      videoId: vid,
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          try {
            const dur = Number(ytPlayerRef.current.getDuration?.() ?? 0);
            if (
              dur > 0 &&
              (!active.video.duration || active.video.duration <= 0)
            ) {
              updateVideo(active.video.id, { duration: Math.floor(dur) });
            }

            const ps = pendingSeekRef.current;
            if (ps && ps.videoId === active.video.id) {
              const tt = clamp(
                ps.time,
                0,
                dur > 0 ? dur : Number.MAX_SAFE_INTEGER,
              );
              ytPlayerRef.current.seekTo?.(tt, true);
              setProgress(active.video.id, tt);
              if (ps.autoplay) ytPlayerRef.current.playVideo?.();
              else ytPlayerRef.current.pauseVideo?.();
              pendingSeekRef.current = null;
              return;
            }

            const base = clamp(
              active.video.completedAt || 0,
              0,
              dur > 0 ? dur : Number.MAX_SAFE_INTEGER,
            );
            ytPlayerRef.current.seekTo?.(base, true);
          } catch {}
        },
        onStateChange: (e: any) => {
          const st = e?.data;
          if (st === 1) startYtPolling();
          if (st === 2) stopYtPolling();
          if (st === 0) {
            stopYtPolling();
            markComplete(active.video.id);
          }
        },
      },
    });

    return () => destroyYtPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.video.id, ytReady]);

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#47304B]  to-[#070D2D] text-white">
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <div
        className="min-h-screen transition-[padding-right] duration-300"
        style={{ paddingRight: panelOpen ? PANEL_W : 0 }}
      >
        <div
          className="mx-auto max-w-6xl px-4"
          style={{ paddingTop: TOP_OFFSET + 24 }}
        >
          <section className="rounded-2xl p-6">
            {!active ?
              <p className="text-white/70">No video (dataMode: {dataMode})</p>
            : <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-white/70">
                      {active.lessonTitle}
                    </p>
                    <h3 className="truncate text-xl font-semibold">
                      {active.video.title}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${pill(
                      active.video.status,
                    )}`}
                  >
                    {active.video.status}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-black/25 ring-1 ring-white/10 overflow-hidden">
                  {isProbablyYouTube(active.video.url) ?
                    <div className="w-full aspect-video bg-black">
                      <div
                        id={`yt-player-${active.video.id}`}
                        className="w-full h-full"
                      />
                    </div>
                  : <video
                      ref={htmlVideoRef}
                      className="w-full aspect-video bg-black"
                      src={active.video.url}
                      controls
                      onTimeUpdate={handleHtmlTimeUpdate}
                      onLoadedMetadata={handleHtmlLoadedMetadata}
                      onEnded={handleHtmlEnded}
                      onPlay={(e) => {
                        if (active.video.status === "LOCKED")
                          (e.currentTarget as HTMLVideoElement).pause();
                      }}
                    />
                  }
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
            }
          </section>
        </div>
      </div>

      {/* RIGHT PANEL */}
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
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="absolute -left-10 top-15 h-12 w-10 rounded-l-2xl bg-pink-300/90 text-black grid place-items-center shadow-lg"
            aria-label="Toggle progress panel"
          >
            <span className="text-3xl ml-2 mt-0.5 leading-none">
              {panelOpen ? ">" : "<"}
            </span>
          </button>

          <div className="flex items-center justify-end gap-2 pr-20 mb-5 pt-5">
            <button
              type="button"
              onClick={() => setMode("subject")}
              className={[
                "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                mode === "subject" ?
                  "bg-yellow-300 text-black"
                : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              Subject
            </button>

            <button
              type="button"
              onClick={() => setMode("note")}
              className={[
                "rounded-full px-4 py-2 text-[12px] font-semibold transition",
                mode === "note" ?
                  "bg-pink-400 text-white"
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
                mode === "all" ?
                  "bg-violet-400 text-white"
                : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              All Note
            </button>
          </div>

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

            {/* debug */}
            <div className="text-center text-[10px] text-white/40">
              dataMode: {dataMode} • courseId: {courseId || "-"} • userId:{" "}
              {userId || "-"}
            </div>
          </div>

          <div className="px-6 pt-6 pb-10 overflow-auto h-[calc(100%-170px)]">
            {mode === "subject" && (
              <ul>
                {lessonView.map((lesson, idx) => {
                  const isLast = idx === lessonView.length - 1;
                  const isExpanded = expandedLessonIds.has(lesson.lessonId);
                  const segments = getLessonSegments(lesson.videos);
                  const hideOuterLine = isLast && !isExpanded;

                  return (
                    <li
                      key={lesson.lessonId}
                      className={`relative pl-12 ${!isLast ? "pb-6" : ""}`}
                    >
                      {!hideOuterLine && (
                        <div className="absolute left-[12px] top-0 bottom-0 w-1 rounded-full overflow-hidden z-0 bg-white/10">
                          <div className="h-full w-full flex flex-col">
                            {segments.map((st, i) => (
                              <div
                                key={`${lesson.lessonId}-seg-${i}`}
                                className={`flex-1 w-full ${outerLineColor(
                                  st,
                                )}`}
                              />
                            ))}
                          </div>
                        </div>
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

                        <div className="mt-2 text-xs text-white/60">
                          {formatTime(lesson.progress.completedAt)} /{" "}
                          {formatTime(lesson.progress.duration)} •{" "}
                          {lesson.progress.pct}%
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 ml-0">
                          {lesson.videos.map((v) => {
                            const isActive = v.id === activeVideoId;
                            const disabled = v.status === "LOCKED";

                            const pct =
                              v.duration > 0 ?
                                Math.round(
                                  (clamp(v.completedAt || 0, 0, v.duration) /
                                    v.duration) *
                                    100,
                                )
                              : 0;

                            const cur = getEffectiveVideoStatus(v);

                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  !disabled && setActiveVideoId(v.id)
                                }
                                className={[
                                  "w-full text-left rounded-2xl px-4 py-3 transition ring-1",
                                  isActive ?
                                    "bg-white/10 ring-white/15"
                                  : "bg-white/0 ring-white/10 hover:bg-white/5",
                                  disabled ?
                                    "opacity-60 cursor-not-allowed"
                                  : "cursor-pointer",
                                ].join(" ")}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <span
                                      className={[
                                        "mt-1 h-4 w-4 rounded-full inline-block shrink-0 ring-1 ring-white/20",
                                        dotColor(cur),
                                      ].join(" ")}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-base font-semibold truncate">
                                        {v.title}
                                      </p>
                                      <p className="text-sm text-white/70 line-clamp-2">
                                        {v.description}
                                      </p>
                                      <div className="mt-2 text-xs text-white/60">
                                        {formatTime(v.completedAt)} /{" "}
                                        {formatTime(v.duration)} • {pct}%
                                      </div>
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

            {mode === "note" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="text-xs text-white/60">Active video</div>
                  <div className="mt-1 font-semibold truncate">
                    {active?.video.title ?? "No active video"}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {active ?
                      `${formatTime(active.video.completedAt)} / ${formatTime(
                        active.video.duration,
                      )}`
                    : ""}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Pause while typing</div>
                    <div className="text-xs text-white/60">
                      โฟกัสช่องพิมพ์แล้ววิดีโอจะหยุดอัตโนมัติ
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPauseWhileTyping((v) => !v)}
                    className={[
                      "rounded-full px-4 py-2 text-xs font-semibold transition ring-1",
                      pauseWhileTyping ?
                        "bg-emerald-400 text-black ring-white/10"
                      : "bg-white/10 text-white ring-white/10 hover:bg-white/15",
                    ].join(" ")}
                  >
                    {pauseWhileTyping ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Add Note</div>
                    <div className="text-xs text-white/60">
                      {activeNotes.length} notes
                    </div>
                  </div>

                  <label className="mt-3 block text-xs text-white/70">
                    Text
                    <textarea
                      className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-white min-h-[90px]"
                      value={noteDraft.text}
                      onChange={(e) =>
                        setNoteDraft((d) => ({ ...d, text: e.target.value }))
                      }
                      onFocus={() => pauseWhileTyping && pauseAny()}
                      placeholder="พิมพ์โน้ต... "
                    />
                  </label>

                  <label className="mt-3 block text-xs text-white/70">
                    Tags (comma separated)
                    <input
                      className="mt-1 w-full rounded-xl bg-black/20 ring-1 ring-white/10 px-3 py-2 text-white"
                      value={noteDraft.tags}
                      onChange={(e) =>
                        setNoteDraft((d) => ({ ...d, tags: e.target.value }))
                      }
                      placeholder="grammar, verb, example"
                    />
                  </label>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!active || !activeVideoId) return;
                        const text = noteDraft.text.trim();
                        if (!text) return;

                        const duration = Math.max(0, getDurationAny());
                        const now = clamp(
                          getNowTimeAny(),
                          0,
                          duration || Number.MAX_SAFE_INTEGER,
                        );

                        const tags = noteDraft.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);

                        const item: NoteItem = {
                          id: uid(),
                          videoId: activeVideoId,
                          lessonId: active.lessonId,
                          time: now,
                          text,
                          tags,
                          createdAt: new Date().toISOString(),
                        };

                        setNotesByVideo((prev) => {
                          const next = { ...prev };
                          const arr =
                            next[activeVideoId] ? [...next[activeVideoId]] : [];
                          arr.unshift(item);
                          next[activeVideoId] = arr;
                          return next;
                        });

                        setNoteDraft((d) => ({ ...d, text: "" }));
                      }}
                      className="rounded-full bg-pink-400 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === "all" && (
              <AllNotesPanel
                allNotes={allNotes}
                videoTitleMap={useMemo(() => {
                  const m = new Map<
                    string,
                    { lessonTitle: string; videoTitle: string }
                  >();
                  flatVideos.forEach((x) =>
                    m.set(x.video.id, {
                      lessonTitle: x.lessonTitle,
                      videoTitle: x.video.title,
                    }),
                  );
                  return m;
                }, [flatVideos])}
                onJump={(videoId, t) => {
                  if (activeVideoId === videoId) {
                    seekAny(t, true);
                    return;
                  }
                  pendingSeekRef.current = { videoId, time: t, autoplay: true };
                  setActiveVideoId(videoId);
                  setMode("subject");
                }}
                onDelete={(videoId, noteId) => {
                  setNotesByVideo((prev) => {
                    const next = { ...prev };
                    const arr = (next[videoId] ?? []).filter(
                      (n) => n.id !== noteId,
                    );
                    if (arr.length === 0) delete next[videoId];
                    else next[videoId] = arr;
                    return next;
                  });
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
  onJump: (videoId: string, time: number) => void;
  onDelete: (videoId: string, noteId: string) => void;
}) {
  const { allNotes, videoTitleMap, onJump, onDelete } = props;
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

      {filtered.length === 0 ?
        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-white/70">
          ไม่เจอโน้ต
        </div>
      : filtered.map((n) => {
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
                    ⏱ {formatTime(n.time)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onJump(n.videoId, n.time)}
                    className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full"
                  >
                    Jump
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(n.videoId, n.id)}
                    className="text-xs bg-red-400/80 hover:bg-red-400 px-3 py-1 rounded-full text-black font-semibold"
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
          );
        })
      }
    </div>
  );
}
