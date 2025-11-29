// src/components/Note.tsx
import React, { useEffect, useMemo, useRef, useState, useId } from "react";

/* ---------- Global typings for YT ---------- */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    _ytApiPromise?: Promise<any>;
  }
}

/* ---------- Types ---------- */
type NoteItem = {
  id: string;
  start: number;
  end: number;
  text: string;
  tags: string[];
  createdAt: string;
};

type SaveAfterMode = "pause" | "continue" | "nochange";
type Mode = "course" | "note" | "all";

type LessonOption = {
  id: number | string;
  title: string;
};

interface YouTubeNotesProps {
  videoId?: string;
  videoUrl?: string;

  courseTitle?: string;
  lessons?: LessonOption[];
  currentLessonId?: number | string;
  onSelectLesson?: (id: number | string) => void;

  onNextLesson?: () => void;
  isLastLesson?: boolean;
}

/* ---------- Utils ---------- */
function sToStamp(s: number) {
  if (isNaN(s)) return "0:00";
  const sec = Math.max(0, Math.floor(s));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = String(sec % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

function stampToS(stamp: string) {
  const parts = stamp.split(":").map((n) => Number(n));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(stamp) || 0;
}

function extractYouTubeId(urlOrId?: string) {
  if (!urlOrId) return "";
  try {
    const u = new URL(urlOrId);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return u.searchParams.get("v") || "";
    if (u.hostname === "youtu.be") return u.pathname.replace("/", "");
  } catch {
    return urlOrId;
  }
  return urlOrId;
}

/* ---------- YouTube API loader ---------- */
function loadYouTubeAPI() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (window._ytApiPromise) return window._ytApiPromise;

  window._ytApiPromise = new Promise((resolve) => {
    const exists = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!exists) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev && prev();
      resolve(window.YT);
    };

    const start = Date.now();
    (function waitYT() {
      if (window.YT?.Player) return resolve(window.YT);
      if (Date.now() - start > 6000) return resolve(window.YT);
      requestAnimationFrame(waitYT);
    })();
  });

  return window._ytApiPromise;
}

/* ============================================================
   COMPONENT
============================================================ */
export default function Note({
  videoId,
  videoUrl,
  courseTitle,
  lessons,
  currentLessonId,
  onSelectLesson,
  onNextLesson,
  isLastLesson,
}: YouTubeNotesProps) {
  const resolvedVideoId = extractYouTubeId(videoId || videoUrl);
  const playerRef = useRef<any>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const reactId = useId().replace(/:/g, "_");
  const containerId = `yt-player-${reactId}`;

  if (!resolvedVideoId) {
    return (
      <div className="p-4 text-sm text-red-400">
        ไม่พบวิดีโอสำหรับแสดง (videoId/videoUrl ว่าง)
      </div>
    );
  }

  const storageKey = `yt-notes-${resolvedVideoId}`;
  const MODE_STORAGE = `yt-save-mode-${resolvedVideoId}`;
  const FOCUS_STORAGE = `yt-pause-on-focus-${resolvedVideoId}`;

  const [ready, setReady] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((n) => ({
            ...n,
            tags: Array.isArray(n.tags) ? n.tags : [],
          }))
        : [];
    } catch {
      return [];
    }
  });

  const [saveAfterMode] = useState<SaveAfterMode>(() => {
    try {
      const saved = localStorage.getItem(MODE_STORAGE);
      if (["continue", "pause", "nochange"].includes(saved ?? "")) {
        return saved as SaveAfterMode;
      }
      return "pause";
    } catch {
      return "pause";
    }
  });

  const [pauseOnFocus, setPauseOnFocus] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(FOCUS_STORAGE);
      return saved == null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  const [form, setForm] = useState({
    start: "",
    end: "",
    text: "",
    tags: "",
  });
  const [autoStamped, setAutoStamped] = useState(false);
  const [mode, setMode] = useState<Mode>("course");
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);

  /* sync note -> localStorage */
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {}
  }, [notes, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(FOCUS_STORAGE, String(pauseOnFocus));
    } catch {}
  }, [pauseOnFocus, FOCUS_STORAGE]);

  /* init YT player */
  useEffect(() => {
    let active = true;

    (async () => {
      const YT = await loadYouTubeAPI();
      if (!active || !YT) return;

      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = "";

      const player = new YT.Player(container, {
        videoId: resolvedVideoId,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: () => {
            if (!active) return;
            playerRef.current = player;
            setReady(true);
          },
          onError: (e: any) => console.warn("YT Player error:", e?.data),
        },
      });
    })();

    return () => {
      active = false;
      try {
        playerRef.current?.destroy();
        playerRef.current = null;
      } catch {}
      setReady(false);
      const c = document.getElementById(containerId);
      if (c) c.innerHTML = "";
    };
  }, [resolvedVideoId, containerId]);

  /* shortcuts */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!ready) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        saveNote();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [ready, form, saveAfterMode]);

  const filtered = useMemo(() => {
    const sorted = [...notes].sort((a, b) => a.start - b.start);
    const term = search.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter(
      (n) =>
        n.text.toLowerCase().includes(term) ||
        n.tags.join(" ").toLowerCase().includes(term)
    );
  }, [notes, search]);

  /* actions */
  const maybePauseOnFocus = () => {
    if (!ready) return;
    if (pauseOnFocus) {
      try {
        playerRef.current?.pauseVideo();
      } catch {}
    }
  };

  const ensureStartStampedOnFirstType = () => {
    if (autoStamped || !ready) return;
    try {
      const p = playerRef.current;
      if (!p) return;
      const t = Math.floor(p.getCurrentTime());
      if (!form.start) {
        setForm((f) => ({ ...f, start: sToStamp(t) }));
      }
      setAutoStamped(true);
    } catch {}
  };

  const saveNote = () => {
    const startS = stampToS(form.start);
    const endS = form.end ? stampToS(form.end) : startS;
    if (!form.text.trim()) return alert("กรอกข้อความโน้ตก่อนนะ");
    if (isNaN(startS) || isNaN(endS)) return alert("เวลาไม่ถูกต้อง");
    if (endS < startS) return alert("end ต้องมากกว่าหรือเท่ากับ start");

    const tagList = (form.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newNote: NoteItem = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      start: startS,
      end: endS,
      text: form.text.trim(),
      tags: tagList,
      createdAt: new Date().toISOString(),
    };

    setNotes((p) => [...p, newNote]);
    setForm({ start: "", end: "", text: "", tags: "" });
    setAutoStamped(false);

    const p = playerRef.current;
    if (p && saveAfterMode === "pause") {
      p.pauseVideo();
    } else if (p && saveAfterMode === "continue") {
      p.playVideo();
    }
  };

  const removeNote = (id: string) => {
    setNotes((p) => p.filter((n) => n.id !== id));
  };

  const jumpAndEdit = (note: NoteItem) => {
    const p = playerRef.current;
    if (!p || !ready) return;
    p.seekTo(note.start, true);
    p.pauseVideo();
    setForm({
      start: sToStamp(note.start),
      end: sToStamp(note.end ?? note.start),
      text: note.text,
      tags: note.tags.join(", "),
    });
    setAutoStamped(true);
    textRef.current?.focus();
    setMode("note");
  };

  const currentTimeStamp = sToStamp(
    Math.floor(playerRef.current?.getCurrentTime?.() || 0)
  );

  /* progress for header */
  let progressPercent = 0;
  let currentIndex = -1;
  if (lessons && lessons.length > 0 && currentLessonId != null) {
    currentIndex = lessons.findIndex(
      (l) => String(l.id) === String(currentLessonId)
    );
    const completed = currentIndex >= 0 ? currentIndex + 1 : 0;
    progressPercent = Math.round(
      Math.min(100, Math.max(0, (completed / lessons.length) * 100))
    );
  }

  const headerLabel = courseTitle
    ? `${courseTitle} ${progressPercent}%`
    : "PROGRESS";

  /* ============================================================== */
  return (
    <div className="flex min-h-screen w-full items-stretch gap-4">
      {/* LEFT — VIDEO */}
      <div className="flex-1 p-10 pl-20 min-w-0 flex flex-col items-center">
        <div className="w-full max-w-[70rem]">
          <div
            id={containerId}
            className="w-full aspect-video bg-black rounded-2xl overflow-hidden"
          />
        </div>

        {/* NEXT BUTTON */}
        <div className="mt-6">
          <button
            onClick={onNextLesson}
            disabled={isLastLesson}
            className={[
              "px-10 py-3 rounded-full text-lg font-semibold transition",
              isLastLesson
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[#DD81B8] hover:bg-pink-500 text-[#070D2D] shadow-lg shadow-pink-500/40",
            ].join(" ")}
          >
            {isLastLesson ? "คุณดูครบทุกคลิปแล้ว" : "Next Video"}
          </button>
        </div>
      </div>

      {/* RIGHT — NOTE PANEL */}
      <div className="flex min-h-screen items-start -mr-4">
        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="mt-10 w-12 h-12 rounded-l-xl bg-[#DE8391] hover:bg-[#f193a4]
          text-[#2a1330] text-2xl font-bold flex items-center justify-center shadow-lg shadow-pink-500/40"
        >
          {panelOpen ? ">" : "<"}
        </button>

        {panelOpen && (
          <aside className="w-80 pt-10 h-full items-center bg-[#23213B] p-4 flex flex-col">
            {/* MODE BUTTONS (อยู่ด้านบนสุด) */}
            <div className="flex justify-end gap-2  mb-4">
              <button
                onClick={() => setMode("course")}
                className={`px-4 py-1 rounded-full text-sm  font-medium ${
                  mode === "course"
                    ? "bg-[#FFEE91] text-[#FF7C92]"
                    : "bg-[#DD81B8] text-white/90"
                }`}
              >
                subject
              </button>
              <button
                onClick={() => setMode("note")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  mode === "note"
                    ? "bg-[#FFEE91] text-[#FF7C92]"
                    : "bg-[#DD81B8] text-white/90"
                }`}
              >
                Note
              </button>
              <button
                onClick={() => setMode("all")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  mode === "all"
                    ? "bg-[#FFEE91] text-[#464B9F]"
                    : "bg-[#DD81B8] text-white/90"
                }`}
              >
                All Note
              </button>
            </div>

            {/* ====== COURSE HEADER + PROGRESS BAR (อยู่ใต้ปุ่ม) ====== */}
            {mode === "course" && lessons && lessons.length > 0 && (
              <div className="w-full mb-4 px-4">
                <div className=" flex flex-col items-center justify-center py-3">
                  <span className="text-white font-semibold text-3xl">
                    PROGRESS
                  </span>

                  {/* ขีดใต้ข้อความ */}
                  {/* bar ด้านบนที่กินตามเปอร์เซ็นต์ */}
                  <div className="w-full h-1.5 bg-[#464B9F] mt-2 rounded-full ">
                    <div
                      className="h-full bg-[#F6F14F] transition-all rounded-full duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* ปุ่มบทเรียน */}
                <div className="mt-4">
                  {lessons.map((lesson, idx) => {
                    const isCurrent =
                      currentLessonId != null &&
                      String(lesson.id) === String(currentLessonId);
                    const isDone = currentIndex >= 0 && idx < currentIndex;

                    const dotColors = [
                      "bg-[#FF8BA7]",
                      "bg-[#FFE066]",
                      "bg-[#9D8CFF]",
                      "bg-[#4D6CFA]",
                    ];
                    const dotColor =
                      dotColors[idx % dotColors.length] || "bg-[#9D8CFF]";

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson?.(lesson.id)}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2 rounded-full mb-2 text-sm transition",
                          isCurrent
                            ? "bg-[#3B356C] text-white font-semibold"
                            : isDone
                            ? " text-white/90"
                            : "bg-[#221F3F] text-white/80 hover:bg-[#2E2A55]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "w-4 h-4 rounded-full border-2 border-[#4D4FAE]",
                            dotColor,
                          ].join(" ")}
                        />
                        <span className="flex-1 text-left">{lesson.title}</span>
                        {isCurrent ? (
                          <span className="text-xs text-pink-200">
                            (กำลังเรียน)
                          </span>
                        ) : isDone ? (
                          <span className="text-xs text-emerald-300">
                            ทำแล้ว
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NOTE / ALL NOTE CONTENT */}
            {mode === "note" ? (
              <div className="flex flex-col flex-1 w-full p-4">
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Note It
                </h3>

                <div className="inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-medium bg-[#f2a1c0] text-[#2a1330] mb-3">
                  Time: {currentTimeStamp}
                </div>

                <label className="text-sm text-white mb-1">Your Note</label>
                <textarea
                  ref={textRef}
                  value={form.text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, text: e.target.value }))
                  }
                  onFocus={maybePauseOnFocus}
                  onKeyDown={ensureStartStampedOnFirstType}
                  onInput={ensureStartStampedOnFirstType}
                  rows={7}
                  placeholder="สรุปใจความสำคัญ…"
                  className="w-full rounded-2xl border border-[#f3aec4] px-3 py-2 bg-white text-[#1a1630] text-sm resize-none"
                />

                <div className="mt-4 flex flex-col justify-between items-center">
                  <label className="flex items-center mb-3 gap-2 text-xs text-white/80">
                    <input
                      type="checkbox"
                      checked={pauseOnFocus}
                      onChange={(e) => setPauseOnFocus(e.target.checked)}
                    />
                    pause video ตอนพิมพ์โน้ต
                  </label>

                  <button
                    onClick={saveNote}
                    className="px-6 py-2 rounded-2xl bg-[#4A4EB4] hover:bg-[#5A5FCA] text-white text-sm font-semibold shadow-md shadow-black/30"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : mode === "all" ? (
              <div className="flex flex-col flex-1 w-full p-4">
                <h3 className="text-xl font-semibold mb-3 text-white">
                  All Note
                </h3>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="search bar"
                  className="w-full rounded-full border border-[#f3aec4] bg-white px-4 py-2 text-sm mb-4 placeholder:text-gray-400 text-[#2a1330]"
                />

                <div className="flex-1 overflow-auto space-y-3 pr-1">
                  {filtered.length === 0 && (
                    <p className="text-xs text-white">
                      ยังไม่มีโน้ตในคลิปนี้เลยน้า ✨
                    </p>
                  )}

                  {filtered.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white rounded-full px-3 py-2 flex  gap-3 shadow-sm"
                    >
                      <button
                        onClick={() => jumpAndEdit(n)}
                        className=" text-xs font-mono px-2 py-1 rounded-full bg-[#DE8391] text-white"
                      >
                        {sToStamp(n.start)}
                      </button>
                      <p className="text-sm text-[#2a1330] justify-self-center content-center line-clamp-2 flex-1">
                        {n.text}
                      </p>
                      <button
                        onClick={() => removeNote(n.id)}
                        className="text-[11px] text-[#d46c8c] justify-self-center content-center hover:text-[#b24b6e]"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        )}
      </div>
    </div>
  );
}
