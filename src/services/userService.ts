import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type CircleId = 'Top5' | '15' | '50' | '150' | 'Shadow';

/**
 * Updates the user's social graph ring assignment in real-time.
 */
export const updateSocialGraph = async (
    currentUserUid: string,
    targetUid: string,
    circleId: CircleId
): Promise<void> => {
    try {
        const userRef = doc(db, 'Users', currentUserUid);
        await setDoc(userRef, {
            social_graph: {
                [targetUid]: circleId
            }
        }, { merge: true });
    } catch (err) {
        console.error("updateSocialGraph error", err);
    }
};

/**
 * Marks the user as having completed the onboarding flow.
 */
export const setOnboarded = async (uid: string): Promise<void> => {
    try {
        const userRef = doc(db, 'Users', uid);
        await setDoc(userRef, { is_onboarded: true }, { merge: true });
    } catch (err) {
        console.warn("Firestore setOnboarded failed, falling back to local state", err);
    }
};

/**
 * Updates the business identity of a Master.
 */
export const updateMasterProfile = async (uid: string, profile: {
    business_name: string;
    bio: string;
    category: string;
    hourly_rate: number;
}): Promise<void> => {
    try {
        const userRef = doc(db, 'Users', uid);
        await setDoc(userRef, {
            master_profile: profile,
            is_business_mode: true
        }, { merge: true });
    } catch (err) {
        console.error("updateMasterProfile error", err);
    }
};
