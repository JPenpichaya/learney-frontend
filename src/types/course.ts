
export type Course = {
    id: string;
    title: string;
    description: string;
    priceTHB: number;
    imageUrl?: string;
    isLive: boolean;        // true for the special live course card
    badge?: string;
    priceId?: string;        // e.g. "Best Seller", "LIVE"
};

export type Entitlements = {
    ownedCourseIds: string[];
};