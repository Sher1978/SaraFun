export const RING_WEIGHTS = {
    "Top5": 2.0,
    "15": 1.5,
    "50": 1.2,
    "150": 1.0,
    "Global": 0.5,
    "Shadow": 0.0,
};

export type TrustRing = keyof typeof RING_WEIGHTS;

export interface RatingData {
    rating: number; // $r_i$ (Rating given by user i)
    ring: TrustRing; // to determine $w_i$
}

/**
 * Calculates the weighted Dunbar Score for a master
 * Formula: R_dunbar = sum(r_i * w_i) / sum(w_i)
 */
export const calculateDunbarScore = (ratings: RatingData[]): number => {
    if (ratings.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const r of ratings) {
        // Accessing via string key to avoid TS numeric key vs string key ambiguity
        const weight = RING_WEIGHTS[r.ring as keyof typeof RING_WEIGHTS];
        weightedSum += r.rating * weight;
        totalWeight += weight;
    }

    if (totalWeight === 0) return 0;

    // Round to 2 decimal places (e.g., 4.95)
    return Math.round((weightedSum / totalWeight) * 100) / 100;
};

/**
 * Stars Oracle Conversion Logic
 * Formula: R_stars = Price_USD * Oracle_Rate
 */
export const STARS_PER_USD = 50;

export const convertUsdToStars = (usdAmount: number): number => {
    return Math.ceil(usdAmount * STARS_PER_USD);
};

/**
 * Updates a Master's aggregate ABCD scores.
 * (Mock implementation for MVP)
 */
export const updateMasterScores = async (masterId: string, newScores: { a: number, b: number, c: number, d: number }) => {
    console.log(`[Math] Updating Master ${masterId} with verified scores:`, newScores);
    // In production, this would calculate the moving average and write to Firestore
    return true;
};
