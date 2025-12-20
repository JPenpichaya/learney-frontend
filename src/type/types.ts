export type LessonStatus = "COMPLETED" | "PROGRESS" | "NOT_START";

export interface LessonProgress {
    id: string;                // UUID
    userId: string;
    courseLessonId: string;    // UUID
    status: LessonStatus;
    completedAt: number;       // seconds (e.g. 40)
}
