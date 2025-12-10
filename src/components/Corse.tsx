// src/components/Corse.tsx
import { useEffect, useState } from "react";
import Note from "./Note";
import { useToken } from "../context/TokenContext";
/* ---------- Types ---------- */
export type LessonStatus = "pending" | "current" | "done";

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
  idToken: string;
  baseUrl: string;
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
  const res = await fetch(`${baseUrl}/api/course-lessons/get-by-course`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uuid: courseId }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch lessons");
  }
  return await res.json();
}

/* ---------- API: Videos ---------- */
async function fetchVideosByLesson(
  lessonId: string,
  idToken: string,
  baseUrl: string
): Promise<VideoApi[]> {
  const res = await fetch(`${baseUrl}/api/course-video/get-by-lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uuid: lessonId }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch videos");
  }

  return await res.json();
}

/* ---------- API: User Course ---------- */
async function fetchUserCourse(
  payload: UserCourseApi,
  idToken: string,
  baseUrl: string
) {
  const res = await fetch(`${baseUrl}/api/user-course/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user course");
  }

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
  const baseUrl = "";

  /* ---------- Load Lessons + UserCourse + First Video ---------- */
  useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        // 👇 body สำหรับ user-course (ตอนนี้ hard-code userId ไว้ก่อน)
        const userCourseBody: UserCourseApi = {
          userId: "Yfi1Px8c4MNMsz9MfvWFkVnXmTr2", // TODO: ดึงจาก auth context ในอนาคต
          courseId,
        };

        // ยิง API พร้อมกัน 2 ตัว: lessons + userCourse
        const [lessonList, userCourse] = await Promise.all([
          fetchLessonsByCourse(courseId, idToken, baseUrl),
          fetchUserCourse(userCourseBody, idToken, baseUrl),
        ]);

        console.log("User course:", userCourse); // กัน unused + debug ดูใน console

        if (cancel) return;

        const lessons: Lesson[] = lessonList
          .sort((a: LessonApi, b: LessonApi) => a.position - b.position)
          .map((l: LessonApi, index: number) => ({
            id: l.id,
            title: l.title,
            status: index === 0 ? "current" : "pending",
            videoUrl: "",
          }));

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
        const firstLessonId = lessons[0]?.id ?? "";
        setCurrentLessonId(firstLessonId);

        // โหลดวิดีโออันแรก
        if (firstLessonId) {
          const videos = await fetchVideosByLesson(
            firstLessonId,
            idToken,
            baseUrl
          );
          if (!cancel && videos.length > 0) {
            setCurrentVideoUrl(videos[0].url);
          }
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

  /* ---------- Loading UI ---------- */
  if (!course || lessonsState.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-[#070D2D]">
        Loading course...
      </div>
    );
  }

  /* ---------- Current / Next lesson ---------- */
  const currentIndex = lessonsState.findIndex((l) => l.id === currentLessonId);
  const isLastLesson =
    currentIndex >= 0 && currentIndex === lessonsState.length - 1;

  const currentVideoId = extractYouTubeId(currentVideoUrl);

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

    // โหลดวิดีโอของ lesson ที่เลือก
    try {
      const videos = await fetchVideosByLesson(realId, idToken, baseUrl);
      if (videos.length > 0) {
        setCurrentVideoUrl(videos[0].url);
      } else {
        setCurrentVideoUrl("");
      }
    } catch (e) {
      console.error("ERROR fetch videos by lesson:", e);
    }
  };

  const goToNextLesson = () => {
    if (currentIndex === -1 || isLastLesson) return;
    const nextIndex = currentIndex + 1;
    const nextId = lessonsState[nextIndex].id;
    handleSelectLesson(nextId);
  };

  /* ---------- RENDER ---------- */
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
