import WebApp from '@twa-dev/sdk';
import { updateSocialGraph } from './userService';

/**
 * Mocks phone contact synchronization.
 * In a real scenario, this would use a native bridge or clipboard permission.
 */
export const syncPhoneContacts = async (currentUserUid: string): Promise<number> => {
    return new Promise((resolve) => {
        // Show native Telegram loading state
        WebApp.MainButton.showProgress();

        // Simulate a 1.5s delay for "Scanning contacts..."
        setTimeout(async () => {
            const mockContacts = ['+123456789', '+987654321', '+555666777'];

            try {
                // Automatically add these to the Shadow List in Firestore
                for (const phone of mockContacts) {
                    // In real logic, we'd find the UID by phone first
                    const targetUid = `user_phone_${phone.slice(-4)}`;
                    await updateSocialGraph(currentUserUid, targetUid, 'Shadow');
                }

                WebApp.MainButton.hideProgress();
                WebApp.HapticFeedback.notificationOccurred('success');
                resolve(mockContacts.length);
            } catch (err) {
                WebApp.MainButton.hideProgress();
                resolve(0);
            }
        }, 1500);
    });
};
