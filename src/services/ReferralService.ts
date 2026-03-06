import WebApp from '@twa-dev/sdk';

/**
 * ReferralService handles the "Invite Friend" virality mechanics.
 */
export const ReferralService = {
    /**
     * Generates a t.me link with a start parameter for a referral.
     */
    generateInviteLink: (uid: string) => {
        const botUsername = 'SaraFunBot'; // Replace with actual bot handle
        return `https://t.me/${botUsername}/app?startapp=ref_${uid}`;
    },

    /**
     * Triggers the native Telegram share/invite flow.
     */
    shareInvite: (uid: string) => {
        const link = ReferralService.generateInviteLink(uid);
        const text = "Check out my Trusted Experts on SaraFun! 💎✨";

        // Option 1: Share to Story (Dopamine high)
        if (WebApp.shareToStory) {
            WebApp.shareToStory(link, { text });
        } else {
            // Option 2: Clipboard & Switch Inline Query
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
            WebApp.openTelegramLink(shareUrl);
        }

        WebApp.HapticFeedback.notificationOccurred('success');
    },

    /**
     * Fetches referral details for a user.
     */
    getReferralStats: async (uid: string) => {
        try {
            const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');

            // 1. Get who invited them
            let invitedBy = null;
            const userDocRef = doc(db, 'Users', uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.referred_by) {
                    const inviterSnap = await getDoc(doc(db, 'Users', userData.referred_by));
                    if (inviterSnap.exists()) {
                        invitedBy = { uid: inviterSnap.id, name: inviterSnap.data().display_name || 'Anonymous' };
                    }
                }
            }

            // 2. Get who they invited
            const usersRef = collection(db, 'Users');
            const q = query(usersRef, where('referred_by', '==', uid));
            const inviteesSnap = await getDocs(q);
            const invitees = inviteesSnap.docs.map(d => ({
                uid: d.id,
                name: d.data().display_name || 'Anonymous User',
                joinedAt: d.data().created_at // Assuming we have this
            }));

            return {
                invitedBy,
                invitees,
                totalInvited: invitees.length,
                starsEarned: Object.keys(userSnap.exists() ? userSnap.data().stars_balance || 0 : 0) // Mocking earned just returning balance or 0
            };
        } catch (error) {
            console.error("Error fetching referrers:", error);
            return {
                invitedBy: null,
                invitees: [],
                totalInvited: 0,
                starsEarned: 0
            };
        }
    }
};
