// InfoCourse.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ===================== TYPES ===================== */
type ProgressStatus = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";

type CourseDetail = {
  id: string;
  totalStudents: number;
  totalLessons: number;
  totalDuration: string;
  rating: number;
};

type VideoProgress = {
  id: string;
  title: string;
  description: string;
  url: string;
  status: ProgressStatus;
  completedAt: number; // seconds
  duration: string; // "10:54"
  position: number;
};

type LessonProgress = {
  lessonId: string;
  title: string;
  position: number;
  status: ProgressStatus;
  videos: VideoProgress[];
};

type TutorProfile = {
  id: string;
  name: string;
  bio: string;
};

/* ===================== CourseTry Stored Shape ===================== */
type TrackerVideo = {
  id: string;
  description: string;
  status: ProgressStatus;
  completedAt: number;
  title: string;
  url: string;
  duration: number; // seconds
  position: number;
};
type TrackerLessonSection = { lessonId: string; videos: TrackerVideo[] };

/* ===================== Shared helpers ===================== */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function parseMMSS(s: string) {
  const m = String(s || "")
    .trim()
    .match(/^(\d+):(\d{1,2})$/);
  if (!m) return 0;
  const mm = Number(m[1] || 0);
  const ss = Number(m[2] || 0);
  return mm * 60 + ss;
}

function makeProgressKey(courseId?: string, userId?: string) {
  return `learney_progress_${courseId || "demoCourse"}_${userId || "anon"}`;
}

function loadProgress(key: string): TrackerLessonSection[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrackerLessonSection[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** ✅ เอา progress จาก CourseTry มาทับบน mock ของ InfoCourse (match ตาม video.id) */
function applyTrackerToInfoLessonProgress(
  infoLessons: LessonProgress[],
  tracker: TrackerLessonSection[],
): LessonProgress[] {
  const trackerVideoMap = new Map<string, TrackerVideo>();
  tracker.forEach((l) => l.videos.forEach((v) => trackerVideoMap.set(v.id, v)));

  // 1. Update videos & Self Status
  let lessons = infoLessons.map((lesson) => {
    const updatedVideos = lesson.videos.map((v) => {
      const tv = trackerVideoMap.get(v.id);
      if (!tv) return v;
      return {
        ...v,
        completedAt: tv.completedAt,
        status: tv.status,
        duration: formatTime(tv.duration),
      };
    });

    let newStatus = lesson.status;
    const isAllCompleted =
      updatedVideos.length > 0 &&
      updatedVideos.every((v) => v.status === "COMPLETED");
    const isAnyInProgress = updatedVideos.some(
      (v) => v.status === "IN_PROGRESS",
    );
    const isAnyCompleted = updatedVideos.some((v) => v.status === "COMPLETED");

    if (isAllCompleted) {
      newStatus = "COMPLETED";
    } else if (isAnyInProgress || (isAnyCompleted && !isAllCompleted)) {
      newStatus = "IN_PROGRESS";
    }

    return {
      ...lesson,
      videos: updatedVideos,
      status: newStatus,
    };
  });

  // 2. Unlock next lesson logic (Sequential Unlock)
  // เรียงตาม position ก่อนเพื่อให้ unlock ถูกลำดับ
  lessons.sort((a, b) => a.position - b.position);

  for (let i = 0; i < lessons.length - 1; i++) {
    if (lessons[i].status === "COMPLETED") {
      const nextLesson = lessons[i + 1];
      if (nextLesson.status === "LOCKED") {
        // Unlock Lesson
        const unlockedVideos = [...nextLesson.videos];
        // Unlock first video if needed
        if (
          unlockedVideos.length > 0 &&
          unlockedVideos[0].status === "LOCKED"
        ) {
          unlockedVideos[0] = { ...unlockedVideos[0], status: "AVAILABLE" };
        }

        lessons[i + 1] = {
          ...nextLesson,
          status: "AVAILABLE",
          videos: unlockedVideos,
        };
      }
    }
  }

  return lessons;
}

/** ✅ คำนวณ % แบบเดียวกับ CourseTry (sum time) */
function computeOverallPctFromInfoLessons(lessons: LessonProgress[]) {
  const total = lessons.reduce(
    (acc, l) => acc + l.videos.reduce((a, v) => a + parseMMSS(v.duration), 0),
    0,
  );
  const done = lessons.reduce(
    (acc, l) =>
      acc +
      l.videos.reduce(
        (a, v) => a + clamp(v.completedAt, 0, parseMMSS(v.duration)),
        0,
      ),
    0,
  );
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, pct };
}

function isLessonCompleted(lesson: LessonProgress) {
  if (lesson.videos.length === 0) return false;
  return lesson.videos.every((v) => {
    const dur = parseMMSS(v.duration);
    return dur > 0 && v.completedAt >= dur;
  });
}

function statusDotClass(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#FF8FA1]";
    case "IN_PROGRESS":
      return "bg-[#FFEE91]";
    case "AVAILABLE":
      return "bg-[#464B9F]";
    default:
      return "bg-white/20";
  }
}

/** ✅ สีเส้น (เหมือน CourseTry concept) */
function statusLineClass(status: ProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#FF8FA1]";
    case "IN_PROGRESS":
      return "bg-[#FFEE91]";
    case "AVAILABLE":
      return "bg-[#464B9F]";
    default:
      return "bg-white/15";
  }
}

function countCompletedVideos(videos: VideoProgress[]) {
  const total = videos.length;
  const done = videos.filter((v) => v.status === "COMPLETED").length;
  return { done, total };
}

function pickHero(lessons: LessonProgress[]) {
  const lIP =
    lessons.find((l) => l.status === "IN_PROGRESS") ??
    lessons.find((l) => l.status === "AVAILABLE") ??
    lessons[0];
  if (!lIP) return null;

  const sortedVideos = [...lIP.videos].sort((a, b) => a.position - b.position);
  const vIP =
    sortedVideos.find((v) => v.status === "IN_PROGRESS") ??
    sortedVideos.find((v) => v.status === "AVAILABLE") ??
    sortedVideos[0];

  const { done, total } = countCompletedVideos(sortedVideos);

  return {
    lesson: lIP,
    video: vIP ?? null,
    progressText: `PART ${lIP.position} | ${String(lIP.position).padStart(
      2,
      "0",
    )} - ${lIP.title} (${sortedVideos[0]?.duration ?? "00:00"}) : ${done} / ${total}`,
  };
}

/* ===================== Mock DB (เหมือนเดิม) ===================== */
const MOCK_DB: Record<
  string,
  {
    course: CourseDetail;
    tutor: TutorProfile;
    lessonProgressByUser: Record<string, LessonProgress[]>;
  }
> = {
  "course-english-001": {
    course: {
      id: "course-english-001",
      totalStudents: 1234,
      totalLessons: 20,
      totalDuration: "8 สัปดาห์",
      rating: 4.9,
    },
    tutor: {
      id: "tutor-001",
      name: "คอร์ส english",
      bio: "สอนโดยผู้เชี่ยวชาญด้านภาษาอังกฤษกว่า 10 ปี\nมีประสบการณ์สอนนักเรียนมากกว่า 10,000 คน",
    },
    lessonProgressByUser: {
      "user-demo": [
        {
          lessonId: "lesson-01",
          title: "Verb",
          position: 1,
          status: "COMPLETED",
          videos: Array.from({ length: 5 }).map((_, i) => ({
            id: `v-01-0${i + 1}`,
            title: [
              "Verb Intro",
              "Verb Examples",
              "Verb Practice",
              "Verb Quiz",
              "Verb Recap",
            ][i],
            description: "detail for video a little about this video",
            url: "https://example.com/video.mp4",
            status: "COMPLETED",
            completedAt: 600,
            duration: "10:00",
            position: i + 1,
          })),
        },
        {
          lessonId: "lesson-02",
          title: "Past Simple",
          position: 2,
          status: "IN_PROGRESS",
          videos: [
            {
              id: "v-02-01",
              title: "Past Positive",
              description:
                "เหมาะสำหรับผู้ที่ต้องการคำแนะนำอย่างต่อเนื่องและต้องการพัฒนาทักษะอย่างจริงจัง",
              url: "https://www.youtube.com/watch?v=p0JFc5giu9U",
              status: "IN_PROGRESS",
              completedAt: 120,
              duration: "10:54",
              position: 1,
            },
            {
              id: "v-02-02",
              title: "Past Negative",
              description: "detail for video a little about this video",
              url: "https://www.youtube.com/watch?v=p0JFc5giu9U",
              status: "AVAILABLE",
              completedAt: 0,
              duration: "10:00",
              position: 2,
            },
          ],
        },
        {
          lessonId: "lesson-03",
          title: "Verb + ing",
          position: 3,
          status: "AVAILABLE",
          videos: [
            {
              id: "v-03-01",
              title: "Gerund Basics",
              description: "detail for video a little about this video",
              url: "https://example.com/video.mp4",
              status: "AVAILABLE",
              completedAt: 0,
              duration: "10:00",
              position: 1,
            },
            {
              id: "v-03-02",
              title: "Rules",
              description: "detail ...",
              url: "https://example.com/video.mp4",
              status: "LOCKED",
              completedAt: 0,
              duration: "10:00",
              position: 2,
            },
            {
              id: "v-03-03",
              title: "Examples",
              description: "detail ...",
              url: "https://example.com/video.mp4",
              status: "LOCKED",
              completedAt: 0,
              duration: "10:00",
              position: 3,
            },
            {
              id: "v-03-04",
              title: "Practice",
              description: "detail ...",
              url: "https://example.com/video.mp4",
              status: "LOCKED",
              completedAt: 0,
              duration: "10:00",
              position: 4,
            },
            {
              id: "v-03-05",
              title: "Quiz",
              description: "detail ...",
              url: "https://example.com/video.mp4",
              status: "LOCKED",
              completedAt: 0,
              duration: "10:00",
              position: 5,
            },
          ],
        },
      ],
    },
  },
};

/* ===================== Component ===================== */
export default function InfoCourse(props?: {
  courseId?: string;
  userId?: string;
}) {
  const params = useParams();
  const navigate = useNavigate();

  const courseId =
    props?.courseId ?? (params.courseId as string) ?? "course-english-001";
  const userId = props?.userId ?? "user-demo";

  const data = MOCK_DB[courseId];
  if (!data) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-b from-[#47304B] from-60% to-[#070D2D] text-white grid place-items-center px-6">
        <div className="max-w-xl text-center">
          <div className="text-2xl font-bold">Course not found (mock)</div>
          <div className="mt-2 text-white/70">courseId: {courseId}</div>
        </div>
      </section>
    );
  }

  const course = data.course;
  const tutor = data.tutor;

  /** ✅ mock (base) */
  const baseLessonProgress = data.lessonProgressByUser[userId] ?? [];

  /** ✅ overlay จาก CourseTry progress (ถ้ามี) */
  const progressKey = useMemo(
    () => makeProgressKey(courseId, userId),
    [courseId, userId],
  );
  const storedTracker = useMemo(() => loadProgress(progressKey), [progressKey]);

  const lessonProgress = useMemo(() => {
    if (!storedTracker) return baseLessonProgress;
    return applyTrackerToInfoLessonProgress(baseLessonProgress, storedTracker);
  }, [baseLessonProgress, storedTracker]);

  /** ✅ % แบบเดียวกับ CourseTry */
  const overall = useMemo(
    () => computeOverallPctFromInfoLessons(lessonProgress),
    [lessonProgress],
  );

  /** ✅ completed lesson count แบบเดียวกัน */
  const completedLessons = useMemo(
    () => lessonProgress.filter(isLessonCompleted).length,
    [lessonProgress],
  );

  const completedPercent = overall.pct;

  const hero = useMemo(() => pickHero(lessonProgress), [lessonProgress]);

  const [openLessonIds, setOpenLessonIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleLesson(lessonId: string) {
    setOpenLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-[#47304B] from-60% to-[#070D2D] text-white">
      <div className="h-screen overflow-y-auto hide-scrollbar px-6 lg:px-10 pt-20 pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-wide mb-8">
            English Mastery Course
          </h1>

          {/* HERO */}
          <div className="w-full rounded-3xl bg-[#23213B]/60 p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                <div className="h-64 lg:h-72 w-full bg-white/5 flex items-center justify-center">
                  <span className="text-white/60">
                    {hero?.video ? "Video Preview" : "No active lesson"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-6 lg:p-7 flex flex-col justify-center">
                <p className="text-sm text-white/70 tracking-wide mb-2">
                  {hero?.progressText ?? "-"}
                </p>

                <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                  {hero?.video ?
                    `${hero.lesson.position}.${String(
                      hero.video.position,
                    ).padStart(2, "0")} - ${hero.video.title}`
                  : "-"}
                </h2>

                <p className="text-white/70 leading-relaxed mb-6">
                  {hero?.video?.description ?? "—"}
                </p>

                <button
                  onClick={() =>
                    navigate("/courses", {
                      state: {
                        courseId,
                        userId,
                        lessonId: hero?.lesson.lessonId,
                        videoId: hero?.video?.id,
                      },
                    })
                  }
                  className="w-fit px-10 py-3 rounded-full bg-[#FF8FA1] text-white font-semibold shadow-[0_10px_30px_rgba(255,143,161,0.35)] hover:brightness-110 active:brightness-95 transition"
                >
                  Start Lesson
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              {lessonProgress
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((l) => {
                  const { done, total } = countCompletedVideos(l.videos);
                  const isOpen = openLessonIds.has(l.lessonId);

                  return (
                    <PartRow
                      key={l.lessonId}
                      title={`PART ${l.position} - ${l.title}`}
                      sub={`${done} / ${total} Complete`}
                      open={isOpen}
                      onToggle={() => toggleLesson(l.lessonId)}
                    >
                      {/* Videos list (timeline เส้นต่อกัน) */}
                      <div className="mt-4 rounded-2xl p-4">
                        <div>
                          {l.videos
                            .slice()
                            .sort((a, b) => a.position - b.position)
                            .map((v, idx, arr) => {
                              const prev = idx > 0 ? arr[idx - 1] : null;

                              const topStatus = prev?.status ?? v.status; // สีเส้นบน
                              const bottomStatus = v.status; // สีเส้นล่าง

                              const showTop = idx !== 0;
                              const showBottom = idx !== arr.length - 1;

                              return (
                                // ✅ ทำช่องว่างด้วย padding-bottom แทน margin gap
                                <div
                                  key={v.id}
                                  className={
                                    idx !== arr.length - 1 ? "pb-4" : "pb-0"
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate("/courses", {
                                        state: {
                                          courseId,
                                          userId,
                                          lessonId: l.lessonId,
                                          videoId: v.id,
                                        },
                                      })
                                    }
                                    className="
              w-full text-left
              flex items-stretch justify-between gap-4
              rounded-2xl px-3 py-3
              hover:bg-white/5 active:bg-white/10
              transition
            "
                                  >
                                    <div className="flex items-stretch gap-4 min-w-0">
                                      {/* ✅ Timeline column */}
                                      <div className="relative w-12 shrink-0">
                                        {/* base line (จาง) — ยื่นออกไปเชื่อมช่องว่าง */}
                                        <div
                                          className="
                    absolute left-1/2 -translate-x-1/2
                    top-[-16px] bottom-[-16px]
                    w-1 bg-white/15 rounded-full
                  "
                                        />

                                        {/* top segment (สีตาม prev) */}
                                        {/* top segment */}
                                        {showTop && (
                                          <div
                                            className={[
                                              "absolute left-1/2 -translate-x-1/2",
                                              "top-[-16px] bottom-[calc(50%+24px)] w-1 rounded-full",
                                              statusLineClass(topStatus),
                                            ].join(" ")}
                                          />
                                        )}

                                        {/* bottom segment */}
                                        {showBottom && (
                                          <div
                                            className={[
                                              "absolute left-1/2 -translate-x-1/2",
                                              "top-[calc(50%+24px)] bottom-[-16px] w-1 rounded-full",
                                              statusLineClass(bottomStatus),
                                            ].join(" ")}
                                          />
                                        )}

                                        {/* dot */}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                                          <div
                                            className={[
                                              "relative z-10 h-12 w-12 rounded-full grid place-items-center",
                                              statusDotClass(v.status),
                                            ].join(" ")}
                                          >
                                            {v.status === "COMPLETED" ?
                                              <img
                                                src="/img/icon/checked 1.svg"
                                                alt="completed"
                                                className="w-6 h-6"
                                              />
                                            : v.status === "IN_PROGRESS" ?
                                              <img
                                                src="/img/icon/bookmark.svg"
                                                alt="in progress"
                                                className="w-6 h-6"
                                              />
                                            : v.status === "LOCKED" ?
                                              "🔒"
                                            : <img
                                                src="/img/icon/time-left 1.svg"
                                                alt="available"
                                                className="w-6 h-6"
                                              />
                                            }
                                          </div>
                                        </div>
                                      </div>

                                      {/* text */}
                                      <div className="min-w-0 py-1">
                                        <div className="text-lg font-semibold truncate">
                                          {v.title}
                                        </div>
                                        <div className="text-white/60 text-sm truncate">
                                          {v.description}
                                        </div>
                                      </div>
                                    </div>

                                    {/* duration */}
                                    <div className="text-white/80 text-lg shrink-0 flex items-center">
                                      {v.duration}
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </PartRow>
                  );
                })}
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* COMPLETE */}
              <div className="rounded-2xl bg-[#23213B]/70 border border-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
                <div className="flex items-end justify-between mb-4">
                  <h3 className="text-3xl font-extrabold tracking-wide">
                    {completedPercent}% COMPLETE
                  </h3>
                </div>

                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#FF8FA1] rounded-full"
                    style={{ width: `${completedPercent}%` }}
                  />
                </div>

                <p className="mt-3 text-white/70">
                  {completedLessons} of {course.totalLessons} lessons completed
                </p>
              </div>

              {/* Teacher */}
              <div className="rounded-2xl bg-[#23213B]/70 border border-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white/70">👤</span>
                  </div>
                  <div>
                    <p className="text-white/80">อาจาร</p>
                    <p className="font-semibold">{tutor.name}</p>
                  </div>
                </div>

                <p className="mt-4 text-white/70 leading-relaxed whitespace-pre-line">
                  {tutor.bio}
                </p>
              </div>

              {/* Stats (ไอคอนเป็นรูปภาพ) */}
              <div className="rounded-2xl bg-[#23213B]/70 border border-white/5 p-3 space-y-3 text-white/85">
                <StatRow
                  iconSrc="/img/icon/customer 2 (1).svg"
                  alt="students"
                  text={course.totalStudents.toLocaleString()}
                />
                <StatRow
                  iconSrc="/img/icon/Book open (1).svg"
                  alt="lessons"
                  text={`${course.totalLessons} Lessons`}
                />
                <StatRow
                  iconSrc="/img/icon/Clock (1).svg"
                  alt="duration"
                  text={course.totalDuration}
                />
                <StatRow
                  iconSrc="/img/icon/Star.svg"
                  alt="rating"
                  text={`${course.rating} Rating`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------- Small Components ------- */
function PartRow(props: {
  title: string;
  sub: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const { title, sub, open, onToggle, children } = props;
  return (
    <div className="rounded-2xl bg-[#23213B]/70 border border-white/5 px-6 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="text-left">
          <p className="text-xl lg:text-2xl font-semibold">{title}</p>
          <p className="text-white/65 mt-1">{sub}</p>
        </div>

        <div className="h-10 w-10 rounded-full flex items-center justify-center">
          <span className="text-2xl text-white/70">
            {open ?
              <img src="/img/icon/arrow-Up.svg" alt="" className="h-5 w-5" />
            : <img src="/img/icon/arrow-down.svg" alt="" className="h-5 w-5" />
            }
          </span>
        </div>
      </button>

      {open ?
        <div>{children}</div>
      : null}
    </div>
  );
}

function StatRow({
  iconSrc,
  text,
  alt,
}: {
  iconSrc: string;
  text: string;
  alt: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <img src={iconSrc} alt={alt} className="w-6 h-6 object-contain" />
      <div className="text-lg">{text}</div>
    </div>
  );
}
