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
    }
};
