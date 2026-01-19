

export type Entitlements = {
    courseIds: string[];
};

export type CoursePageResponse = {
    id: string;
    userId: string;
    courseId: string;
};

export type CourseBadge = "TRENDING" | "BEST_SELLER" | string;

export interface CourseSummary {
    id: string;
    title: string;
    description: string;
    tutorProfileId: string;
    imageUrl: string;
    isLive: boolean;
    badge: CourseBadge;
    priceThb: number;
    priceId: string | null;
}

export interface SortInfo {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: SortInfo;
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface PageResponse<T> {
    content: T[];

    pageable: Pageable;

    totalPages: number;
    totalElements: number;
    last: boolean;

    size: number;
    number: number;

    sort: SortInfo;

    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

// Your concrete response type:
export type CoursePageUser = PageResponse<CourseSummary>;