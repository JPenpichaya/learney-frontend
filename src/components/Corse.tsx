// src/components/Corse.tsx  (หรือ CoursePage.tsx ก็ได้ตามที่ตั้งชื่อไฟล์)
import { useMemo, useState } from "react";
import Note from "./Note";

/* ---------- Types ---------- */
interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
}
interface Section {
  id: number;
  title: string;
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
      lessons: [
        {
          id: 1,
          title: "Verb",
          videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
        },
        {
          id: 2,
          title: "Past Simple",
          videoUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
        },
        {
          id: 3,
          title: "Past Positive",
          videoUrl: "https://www.youtube.com/watch?v=4UZrsTqkcW4",
        },
        {
          id: 4,
          title: "Verb + ing",
          videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
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
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    course.sections[0].lessons[0]
  );

  // flatten ทุก lesson
  const flatLessons = useMemo<Lesson[]>(
    () => course.sections.flatMap((s) => s.lessons),
    [course]
  );

  const currentIndex = flatLessons.findIndex((l) => l.id === currentLesson.id);
  const isLastLesson =
    currentIndex >= 0 && currentIndex === flatLessons.length - 1;

  const currentVideoId = extractYouTubeId(currentLesson.videoUrl);

  const goToNextLesson = () => {
    const idx = flatLessons.findIndex((l) => l.id === currentLesson.id);
    if (idx === -1) return;
    const next = flatLessons[idx + 1];
    if (next) setCurrentLesson(next);
  };

  return (
    <div className="min-h-screen w-full bg-[#070D2D] text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 mt-10">
        <div className="w-full max-w-screen flex flex-col gap-4 mt-5">
          <Note
            key={currentLesson.id}
            videoId={currentVideoId}
            videoUrl={currentLesson.videoUrl}
            courseTitle={course.title}
            lessons={flatLessons.map((l) => ({
              id: l.id,
              title: l.title,
            }))}
            currentLessonId={currentLesson.id}
            onSelectLesson={(id: number | string) => {
              const numericId = typeof id === "string" ? Number(id) : id;
              const next = flatLessons.find((l) => l.id === numericId);
              if (next) setCurrentLesson(next);
            }}
            onNextLesson={goToNextLesson}
            isLastLesson={isLastLesson}
          />
        </div>
      </div>
    </div>
  );
}
