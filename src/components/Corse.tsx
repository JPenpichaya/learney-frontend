// src/components/Corse.tsx
import { useMemo, useState } from "react";
import Note from "./Note";

/* ---------- Types ---------- */
export type LessonStatus = "pending" | "current" | "done";

interface Lesson {
  id: number;
  title: string;
  status: LessonStatus;
  videoUrl: string;
}
interface Section {
  id: number;
  title: string;
  status: string;
  lessons: Lesson[];
}
interface Course {
  id: number;
  title: string;
  sections: Section[];
}
interface CoursePageProps {
  course?: Course;
}

/* ---------- Mock data ---------- */
const mockCourse: Course = {
  id: 1,
  title: "English",
  sections: [
    {
      id: 1,
      title: "Basic Tense",
      status: "",
      lessons: [
        {
          id: 1,
          title: "Verb",
          videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
          status: "current",
        },
        {
          id: 2,
          title: "Past Simple",
          videoUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
          status: "pending",
        },
        {
          id: 3,
          title: "Past Positive",
          videoUrl: "https://www.youtube.com/watch?v=4UZrsTqkcW4",
          status: "pending",
        },
        {
          id: 4,
          title: "Verb + ing",
          videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
          status: "pending",
        },
      ],
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

export default function Corse({ course = mockCourse }: CoursePageProps) {
  // flatten เป็น array เดียว
  const initialFlatLessons = useMemo<Lesson[]>(
    () =>
      course.sections.flatMap((s) =>
        s.lessons.map((l, idx) => ({
          ...l,
          // ถ้าไม่มี status จาก backend ให้เซ็ตเอง
          status: l.status || (idx === 0 ? "current" : "pending"),
        }))
      ),
    [course]
  );

  const [lessonsState, setLessonsState] =
    useState<Lesson[]>(initialFlatLessons);
  const [currentLessonId, setCurrentLessonId] = useState<number>(
    initialFlatLessons[0]?.id ?? 0
  );

  const currentLesson = useMemo(
    () => lessonsState.find((l) => l.id === currentLessonId) || lessonsState[0],
    [lessonsState, currentLessonId]
  );

  const currentIndex = lessonsState.findIndex((l) => l.id === currentLessonId);
  const isLastLesson =
    currentIndex >= 0 && currentIndex === lessonsState.length - 1;

  const currentVideoId = extractYouTubeId(currentLesson.videoUrl);

  const setStatusByIndex = (targetIndex: number) => {
    setLessonsState((prev) =>
      prev.map((l, idx) => {
        if (idx < targetIndex) return { ...l, status: "done" };
        if (idx === targetIndex) return { ...l, status: "current" };
        return { ...l, status: "pending" };
      })
    );
  };

  const handleSelectLesson = (id: number | string) => {
    const numericId = typeof id === "string" ? Number(id) : id;
    const idx = lessonsState.findIndex((l) => l.id === numericId);
    if (idx === -1) return;

    setStatusByIndex(idx);
    setCurrentLessonId(numericId);
  };

  const goToNextLesson = () => {
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= lessonsState.length) return;

    setStatusByIndex(nextIndex);
    setCurrentLessonId(lessonsState[nextIndex].id);
  };

  return (
    <div className="min-h-screen w-full bg-[#070D2D] text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 mt-10">
        <div className="w-full max-w-screen flex flex-col gap-4 mt-5">
          <Note
            key={currentLessonId}
            videoId={currentVideoId}
            videoUrl={currentLesson.videoUrl}
            courseTitle={course.title}
            lessons={lessonsState.map((l) => ({
              id: l.id,
              title: l.title,
              status: l.status,
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
