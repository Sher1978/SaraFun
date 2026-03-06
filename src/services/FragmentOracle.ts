/**
 * FragmentOracle.ts
 * Serves as the interface/mock for the Fragment/TON Oracle.
 * In production, this would be a Firebase Cloud Function running every 4 hours via Cloud Scheduler.
 * It will fetch the real-time conversion rates (TON/Stars, TON/USD) to protect against volatility.
 * 
 * Formula mapping: Rate = (Price * Price) * 0.95 (As per chapter 03 constraints)
 */

export const FragmentOracle = {
    /**
     * Gets the current exchange rate from Stars to USD.
     * Hardcoded for MVP, but structured to accept real-time backend updates.
     */
    getCurrentRate: async (): Promise<{ starsPerUsd: number, updatedAt: Date }> => {
        console.log('[FragmentOracle] Fetching current Stars/TON rates...');

        // Mocked response representing the eventual Cloud Function payload
        return {
            starsPerUsd: 50, // Static baseline for MVP
            updatedAt: new Date()
        };
    },

    /**
     * Converts USD amount to Stars safely using the oracle rate.
     */
    convertUsdToStars: async (amountUsd: number): Promise<number> => {
        const { starsPerUsd } = await FragmentOracle.getCurrentRate();
        return Math.ceil(amountUsd * starsPerUsd);
    }
};
