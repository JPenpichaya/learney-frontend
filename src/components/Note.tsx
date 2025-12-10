// src/components/Note.tsx
import { useEffect, useMemo, useRef, useState, useId } from "react";
import type { LessonStatus } from "./Corse";

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
  id: string;
  title: string;
  status?: LessonStatus;
  parentId?: string;
};

type DisplayLesson = {
  lesson: LessonOption;
  depth: 0 | 1; // 0 = main, 1 = sub
  indexLabel: string; // "1", "2", "2.1", ...
  status: LessonStatus;
};

interface YouTubeNotesProps {
  videoId?: string;
  videoUrl?: string;

  courseTitle?: string;
  lessons?: LessonOption[];
  currentLessonId?: string;
  onSelectLesson?: (id: string) => void;

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
        ? parsed.map((n: any) => ({
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

  /* progress / timeline logic (ใช้ displayLessons รวม main + sub) */
  const displayLessons: DisplayLesson[] = useMemo(() => {
    if (!lessons || lessons.length === 0) return [];

    const makeStatus = (lesson: LessonOption): LessonStatus => {
      const fallbackCurrent =
        currentLessonId != null &&
        String(lesson.id) === String(currentLessonId);

      return (
        (lesson.status as LessonStatus | undefined) ||
        (fallbackCurrent ? "current" : "pending")
      );
    };

    // group ตาม parentId
    const childrenMap = new Map<string, LessonOption[]>();
    for (const l of lessons) {
      if (l.parentId != null) {
        const key = String(l.parentId);
        if (!childrenMap.has(key)) childrenMap.set(key, []);
        childrenMap.get(key)!.push(l);
      }
    }

    const roots = lessons.filter((l) => l.parentId == null);

    const result: DisplayLesson[] = [];
    roots.forEach((root, rootIdx) => {
      const mainNo = rootIdx + 1;

      // main topic
      result.push({
        lesson: root,
        depth: 0,
        indexLabel: String(mainNo),
        status: makeStatus(root),
      });

      // sub topics
      const children = childrenMap.get(String(root.id)) ?? [];
      children.forEach((child, childIdx) => {
        result.push({
          lesson: child,
          depth: 1,
          indexLabel: `${mainNo}.${childIdx + 1}`,
          status: makeStatus(child),
        });
      });
    });

    return result;
  }, [lessons, currentLessonId]);

  const totalNodes = displayLessons.length;

  let doneCount = 0;
  let lastDoneIndex = -1;
  let currentIndex = -1;

  displayLessons.forEach((node, idx) => {
    if (node.status === "done") {
      doneCount += 1;
      lastDoneIndex = idx;
    }
    if (node.status === "current") {
      currentIndex = idx;
    }
  });

  // bar ด้านบน (PROGRESS) ใช้รวม done + current
  let progressPercent = 0;
  if (totalNodes > 0) {
    const headerCompleted = doneCount + (currentIndex >= 0 ? 1 : 0);
    progressPercent = Math.round(
      Math.min(100, Math.max(0, (headerCompleted / totalNodes) * 100))
    );
  }

  // ใช้สัดส่วน (0–100%) แทนการล็อก px เพื่อให้ยืดหยุ่นตามความสูงจริง
  const hasMultiNodes = totalNodes > 1;

  const doneRatio =
    hasMultiNodes && lastDoneIndex >= 0 ? lastDoneIndex / (totalNodes - 1) : 0;

  const currentRatio =
    hasMultiNodes && currentIndex >= 0
      ? currentIndex / (totalNodes - 1)
      : doneRatio;

  // 👇 ตัวคูณลดสเกล (ลอง 0.75–0.85 แล้วดูที่ชอบ)
  const SCALE = 0.8;

  const donePercent = Math.max(0, Math.min(100, doneRatio * 100 * SCALE));
  const currentStartPercent = donePercent;
  const currentHeightPercent = Math.max(
    0,
    Math.min(100, currentRatio * 100 * SCALE - donePercent)
  );

  /* ============================================================== */
  return (
    <div className="flex min-h-screen w-full items-stretch gap-4">
      {/* LEFT — VIDEO */}
      <div className="flex-1 p-10 pl-20 min-w-0 flex flex-col items-center ">
        <div className="w-full max-w-[70rem]">
          <div
            id={containerId}
            className="w-full aspect-video bg-black rounded-2xl overflow-hidden"
          />
        </div>

        {/* NEXT BUTTON */}
        <div className="mt-6 ml-215">
          <button
            onClick={onNextLesson}
            disabled={isLastLesson}
            className={[
              "px-8 py-3 rounded-full  text-lg font-semibold transition",
              isLastLesson
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[#DD81B8] hover:bg-pink-500 text-white shadow-lg shadow-pink-500/40",
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
            {/* MODE BUTTONS */}
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
                    ? "bg-[#FFEE91] text-[#FF7C92]"
                    : "bg-[#DD81B8] text-white/90"
                }`}
              >
                All Note
              </button>
            </div>

            {/* ====== COURSE / TIMELINE ====== */}
            {mode === "course" && displayLessons.length > 0 && (
              <div className="w-full mb-4 px-4">
                {/* HEADER PROGRESS */}
                <div className="flex flex-col items-center justify-center py-3">
                  <span className="text-white font-semibold text-3xl">
                    PROGRESS
                  </span>

                  <div className="w-full h-1.5 bg-[#464B9F] mt-2 rounded-full ">
                    <div
                      className="h-full bg-[#F6F14F] transition-all rounded-full duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="relative mt-6 pl-10 pb-4">
                  {/* เส้นพื้นของทุกหัวข้อ = ยังไม่เรียน #464B9F */}
                  {totalNodes > 0 && (
                    <div className="absolute left-6 top-3 bottom-3 w-[3px] rounded-full translate-x-1/2 z-0 bg-[#464B9F]" />
                  )}

                  {/* เส้นเรียนจบแล้ว #FF7C92 */}
                  {donePercent > 0 && (
                    <div
                      className="absolute left-6 top-3 w-[3px] rounded-full translate-x-1/2 z-0 bg-[#FF7C92] transition-all duration-500"
                      style={{ height: `${donePercent}%` }}
                    />
                  )}

                  {/* เส้นกำลังเรียน #FFEE91 */}
                  {currentHeightPercent > 0 && (
                    <div
                      className="absolute left-6 translate-x-1/2 w-[3px] rounded-full z-0 bg-[#FFEE91] transition-all duration-500"
                      style={{
                        top: `calc(3px + ${currentStartPercent}%)`,
                        height: `${currentHeightPercent}%`,
                      }}
                    />
                  )}

                  {/* NODES */}
                  {displayLessons.map((node) => {
                    const { lesson, depth, indexLabel, status } = node;

                    let circleBg = "#464B9F"; // pending
                    let titleColor = "#FFFFFF";
                    let labelText: string | null = null;
                    let labelColor = "#FFFFFF";

                    if (status === "done") {
                      circleBg = "#FF7C92";
                      titleColor = "#FF7C92";
                      labelColor = "#FF7C92";
                    } else if (status === "current") {
                      circleBg = "#FFEE91";
                      titleColor = "#FFEE91";
                      labelText = "(กำลังเรียน)";
                      labelColor = "#FFEE91";
                    }

                    const circleTextColor =
                      status === "done" || status === "current"
                        ? "#2A1330"
                        : "#FFEE91";

                    const isChild = depth === 1;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson?.(lesson.id)}
                        className="relative w-full flex items-start gap-3 py-4 text-left"
                      >
                        {/* จุดบนเส้น */}
                        {isChild ? (
                          <span
                            className="absolute -ml-9.5 left-6 -translate-x-1/2 top-2 w-3 h-3 rounded-full z-10 shadow-md"
                            style={{ backgroundColor: circleBg }}
                          />
                        ) : (
                          <span
                            className="absolute -ml-9.5 left-6 -translate-x-1/2 top-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10"
                            style={{
                              backgroundColor: circleBg,
                              color: circleTextColor,
                            }}
                          >
                            {indexLabel}
                          </span>
                        )}

                        <div className={isChild ? "ml-11" : "ml-13"}>
                          <div
                            className={isChild ? "text-xs" : "text-sm"}
                            style={{ color: titleColor }}
                          >
                            {isChild
                              ? `${indexLabel} ${lesson.title}`
                              : lesson.title}
                          </div>

                          {labelText && (
                            <div
                              className="text-xs"
                              style={{ color: labelColor }}
                            >
                              {labelText}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NOTE / ALL NOTE CONTENT */}
            {mode === "note" ? (
              <div className="flex flex-col flex-1  max-w-[18rem] min-w-full p-4">
                <h3 className="text-3xl  text-center font-light mb-2 text-white">
                  Note It
                </h3>

                <div className="inline-flex text-center max-w-[8rem] content-end ml-32 mt-1 px-2 w-full py-2 rounded-full text-sm font-medium bg-[#464B9F] text-white mb-2">
                  <p className=" text-center w-full">
                    Time: {currentTimeStamp}
                  </p>
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
                <h3 className="text-3xl text-center font-light mb-3 text-white">
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
