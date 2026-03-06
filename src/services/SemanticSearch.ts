/**
 * SemanticSearch.ts
 * Implements "Trusted First" filtering.
 */

export const SemanticSearch = {
    /**
     * Sorts a list of Masters based on their proximity to the User in the social graph.
     * Proximity: Top5 (0) > 15 (1) > 50 (2) > 150 (3) > Global (4)
     */
    filterByTrust: (masters: any[], socialGraph: Record<string, string>) => {
        const ringWeight: Record<string, number> = {
            'Top5': 0,
            '15': 1,
            '50': 2,
            '150': 3,
            'Shadow': 4,
            'Global': 5
        };

        return [...masters].sort((a, b) => {
            // 1. Primary Sort: Trust Ring Weight
            const ringA = socialGraph[a.id] || 'Global';
            const ringB = socialGraph[b.id] || 'Global';

            const weightA = ringWeight[ringA] ?? 5;
            const weightB = ringWeight[ringB] ?? 5;

            // 2. Secondary Sort: Sherlock's Verified Priority (The Golden Seal Boost)
            // Masters with this flag get a "Virtual Upgrade" in their weight
            const boostA = a.is_sherlock_verified ? 0.5 : 0;
            const boostB = b.is_sherlock_verified ? 0.5 : 0;

            const finalWeightA = weightA - boostA;
            const finalWeightB = weightB - boostB;

            if (finalWeightA !== finalWeightB) {
                return finalWeightA - finalWeightB;
            }

            // Tie-breaker: Use ABCD 'A' (Able) score
            return (b.abcd?.a || 0) - (a.abcd?.a || 0);
        });
    }
};
