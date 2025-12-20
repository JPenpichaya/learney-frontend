import type { LessonProgress } from "../type/types";
import "./lessonTimeline.css";

interface Props {
    lessons: LessonProgress[];
}

const lessonProgressList: LessonProgress[] = [
    {
        id: "1",
        userId: "user-001",
        courseLessonId: "lesson-001",
        status: "COMPLETED",
        completedAt: 600,
    },
    {
        id: "2",
        userId: "user-001",
        courseLessonId: "lesson-002",
        status: "PROGRESS",
        completedAt: 120,
    },
    {
        id: "3",
        userId: "user-001",
        courseLessonId: "lesson-003",
        status: "NOT_START",
        completedAt: 0,
    },
];

function LessonTimeline({ lessons }: Props) {
    return (
        <div className="timeline">
            {lessons.map((lesson, index) => {
                const isLast = index === lessons.length - 1;

                return (
                    <div key={lesson.id} className="timeline-row">
                        {/* LEFT SIDE (dot + line) */}
                        <div className="timeline-left">
                            <div className={`dot ${lesson.status.toLowerCase()}`} />
                            {!isLast && (
                                <div className={`line ${lesson.status.toLowerCase()}`} />
                            )}
                        </div>

                        {/* CONTENT */}
                        <div className="timeline-content">
                            <h4>Lesson {index + 1}</h4>

                            <p>Status: {lesson.status}</p>

                            {lesson.status !== "NOT_START" && (
                                <span className="time">
                                    Watched: {lesson.completedAt}s
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function CourseTry() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Course Lesson Timeline</h2>
            <LessonTimeline lessons={lessonProgressList} />
        </div>
    );
}