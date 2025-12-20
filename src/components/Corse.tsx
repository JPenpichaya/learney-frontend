// src/components/Corse.tsx
import { useEffect, useState } from "react";
import Note from "./Note";
import { useToken } from "../context/TokenContext";

/* ---------- Types ---------- */
export type LessonStatus = "pending" | "current" | "done";
type ApiStatus = "COMPLETED" | "PROGRESS" | "NOT_START";

const toLessonStatus = (s: ApiStatus): LessonStatus => {
  if (s === "COMPLETED") return "done";
  if (s === "PROGRESS") return "current";
  return "pending";
};

interface LessonApi {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
}

interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
  videoUrl: string;
  parentId?: string;
}

interface Section {
  id: string;
  title: string;
  status: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
}

interface CoursePageProps {
  courseId: string;
}

interface VideoApi {
  id: string;
  lessonId: string;
  title: string;
  url: string;
  duration: number;
  position: number;
}

interface UserCourseApi {
  userId: string;
  courseId: string;
}

interface LessonProgressApi {
  id: string;
  userId: string;
  courseLessonId: string;
  status: ApiStatus;
  completedAt?: number;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/* ---------- MOCK ---------- */
const mockLessonApi: LessonApi[] = [
  {
    id: "lesson-1",
    courseId: "1eb885ee-b4b9-4be5-a6d3-d6e037e0c0a7",
    title: "Intro",
    description: "Welcome!",
    position: 1,
  },
  {
    id: "lesson-2",
    courseId: "1eb885ee-b4b9-4be5-a6d3-d6e037e0c0a7",
    title: "Lesson 2",
    description: "Deep dive",
    position: 2,
  },
];

const mockVideosByLesson: Record<string, VideoApi[]> = {
  "lesson-1": [
    {
      id: "video-1",
      lessonId: "lesson-1",
      title: "Intro Video",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: 120,
      position: 1,
    },
  ],
  "lesson-2": [
    {
      id: "video-2",
      lessonId: "lesson-2",
      title: "Lesson 2 Video",
      url: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      duration: 240,
      position: 1,
    },
  ],
};

/* ---------- helper: extract YT id ---------- */
function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return "";
  try {
    const u = new URL(urlOrId);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return u.searchParams.get("v") || "";
    if (u.hostname === "youtu.be") return u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/"))
      return u.pathname.split("/").pop() || "";
  } catch {
    return urlOrId;
  }
  return urlOrId;
}

/* ---------- API: Lessons ---------- */
async function fetchLessonsByCourse(
  courseId: string,
  idToken: string,
  baseUrl: string
): Promise<LessonApi[]> {
  if (USE_MOCK) {
    console.warn("🧪 FORCE MOCK lessons");
    const filtered = mockLessonApi.filter((l) => l.courseId === courseId);
    return filtered.length ? filtered : mockLessonApi;
  }

  const res = await fetch(`${baseUrl}/api/course-lessons/get-by-course`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ UUID: courseId }),
  });

  if (!res.ok) throw new Error(`Lessons API failed: ${res.status}`);
  return await res.json();
}

/* ---------- API: Videos ---------- */
async function fetchVideosByLesson(
  lessonId: string,
  idToken: string,
  baseUrl: string
): Promise<VideoApi[]> {
  if (USE_MOCK) {
    console.warn("🧪 FORCE MOCK videos");
    return mockVideosByLesson[lessonId] ?? [];
  }

  const res = await fetch(`${baseUrl}/api/course-video/get-by-lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ UUID: lessonId }),
  });

  if (!res.ok) throw new Error(`Videos API failed: ${res.status}`);
  return await res.json();
}

/* ---------- API: User Course ---------- */
async function fetchUserCourse(
  payload: UserCourseApi,
  idToken: string,
  baseUrl: string
) {
  if (USE_MOCK) {
    console.warn("🧪 FORCE MOCK userCourse");
    return { userId: payload.userId, courseId: payload.courseId };
  }

  const res = await fetch(`${baseUrl}/api/user-course/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`UserCourse API failed: ${res.status}`);
  return await res.json();
}

/* ---------- API: Lesson Progress (by course) ---------- */
async function fetchLessonProgressByCourse(
  userId: string,
  courseId: string,
  idToken: string,
  baseUrl: string
): Promise<LessonProgressApi[]> {
  if (USE_MOCK) {
    console.warn("🧪 FORCE MOCK lesson-progress");
    return [];
  }

  const res = await fetch(`${baseUrl}/api/lesson-progress/get-by-user-lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ userId, courseId }),
  });

  if (!res.ok) throw new Error(`LessonProgress API failed: ${res.status}`);
  return await res.json();
}

/* ---------- COMPONENT ---------- */
export default function VideoSection({ courseId }: CoursePageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessonsState, setLessonsState] = useState<Lesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

  const { token } = useToken();
  const idToken = token || "";
  const baseUrl = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        const userCourseBody: UserCourseApi = {
          userId: "Yfi1Px8c4MNMsz9MfvWFkVnXmTr2",
          courseId,
        };

        const [lessonList, userCourse, lessonProgress] = await Promise.all([
          fetchLessonsByCourse(courseId, idToken, baseUrl),
          fetchUserCourse(userCourseBody, idToken, baseUrl),
          fetchLessonProgressByCourse(
            userCourseBody.userId,
            courseId,
            idToken,
            baseUrl
          ),
        ]);

        console.log("User course:", userCourse);

        if (cancel) return;

        // map progress: lessonId -> ApiStatus
        const progressMap = new Map<string, ApiStatus>();
        lessonProgress.forEach((p) =>
          progressMap.set(String(p.courseLessonId), p.status)
        );

        const lessons: Lesson[] = lessonList
          .sort((a, b) => a.position - b.position)
          .map((l, index) => {
            // ถ้ามี progress ใช้ตามจริง, ถ้าไม่มีให้ fallback แบบเดิม
            const apiStatus = progressMap.get(String(l.id));
            const status: LessonStatus = apiStatus
              ? toLessonStatus(apiStatus)
              : index === 0
              ? "current"
              : "pending";

            return {
              id: l.id,
              title: l.title,
              status,
              videoUrl: "",
            };
          });

        const section: Section = {
          id: courseId,
          title: "All Lessons",
          status: "",
          lessons,
        };

        setCourse({
          id: courseId,
          title: "My Course",
          sections: [section],
        });

        setLessonsState(lessons);

        const current =
          lessons.find((x) => x.status === "current")?.id ??
          lessons.find((x) => x.status === "pending")?.id ??
          lessons[0]?.id ??
          "";

        setCurrentLessonId(current);

        if (current) {
          const videos = await fetchVideosByLesson(current, idToken, baseUrl);
          if (!cancel && videos.length > 0) setCurrentVideoUrl(videos[0].url);
          if (!cancel && videos.length === 0) setCurrentVideoUrl("");
        }
      } catch (err) {
        console.error("ERROR loading course:", err);
      }
    }

    load();
    return () => {
      cancel = true;
    };
  }, [courseId, idToken, baseUrl]);

  if (!course || lessonsState.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-[#070D2D]">
        Loading course...
      </div>
    );
  }

  const currentIndex = lessonsState.findIndex((l) => l.id === currentLessonId);
  const isLastLesson =
    currentIndex >= 0 && currentIndex === lessonsState.length - 1;

  const currentVideoId = extractYouTubeId(currentVideoUrl);

  // local update UI (ยังไม่ได้ยิง update progress)
  const setStatusByIndex = (targetIndex: number) => {
    setLessonsState((prev) =>
      prev.map((l, idx) => {
        if (idx < targetIndex) return { ...l, status: "done" };
        if (idx === targetIndex) return { ...l, status: "current" };
        return { ...l, status: "pending" };
      })
    );
  };

  const handleSelectLesson = async (id: string | number) => {
    const realId = String(id);
    const idx = lessonsState.findIndex((l) => l.id === realId);
    if (idx === -1) return;

    setStatusByIndex(idx);
    setCurrentLessonId(realId);

    try {
      const videos = await fetchVideosByLesson(realId, idToken, baseUrl);
      setCurrentVideoUrl(videos[0]?.url ?? "");
    } catch (e) {
      console.error("ERROR fetch videos by lesson:", e);
    }
  };

  const goToNextLesson = () => {
    if (currentIndex === -1 || isLastLesson) return;
    const nextId = lessonsState[currentIndex + 1].id;
    handleSelectLesson(nextId);
  };

  return (
    <div className="min-h-screen w-full bg-[#070D2D] text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 mt-10">
        <div className="w-full max-w-screen flex flex-col gap-4 mt-5">
          <Note
            key={currentLessonId}
            videoId={currentVideoId}
            videoUrl={currentVideoUrl}
            lessons={lessonsState.map((l) => ({
              id: l.id,
              title: l.title,
              status: l.status,
              parentId: l.parentId,
            }))}
            currentLessonId={currentLessonId}
            onSelectLesson={handleSelectLesson}
            onNextLesson={goToNextLesson}
            isLastLesson={isLastLesson}
          />
        </div>
      </div>
    </div>
  );
}
