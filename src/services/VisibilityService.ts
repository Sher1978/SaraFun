import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { notifySubscription } from './RealTimeNotifications';

/**
 * VisibilityService.ts
 * Manages the $5/mo (250 Stars) Visibility Fee for Masters.
 * According to Project Bible 03_FINANCIAL_LOGIC.
 */

const VISIBILITY_FEE_STARS = 250; // $5 USD equivalent

export const VisibilityService = {
    /**
     * Deducts the monthly fee from a Master's balance.
     * In production, this runs via a scheduled Cloud Function every month per active master.
     */
    processMonthlyFee: async (masterUid: string): Promise<boolean> => {
        console.log(`[VisibilityService] Processing monthly fee for Master: ${masterUid}`);
        const userRef = doc(db, 'Users', masterUid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return false;

        const data = userSnap.data();
        const currentBalance = data.stars_balance || 0;

        if (currentBalance >= VISIBILITY_FEE_STARS) {
            // Deduct fee and ensure status is active
            await updateDoc(userRef, {
                stars_balance: currentBalance - VISIBILITY_FEE_STARS,
                visibility_status: 'active'
            });
            await notifySubscription(masterUid, 'deducted');
            return true;
        } else {
            // Insufficient funds -> Shadow Mode
            await updateDoc(userRef, {
                visibility_status: 'shadowed'
            });
            await notifySubscription(masterUid, 'shadowed');
            return false;
        }
    },

    /**
     * Utility to check all active masters and apply fees (Mock Cron Job)
     */
    runGlobalFeeCycle: async () => {
        console.log(`[VisibilityService] Running Global Fee Cycle...`);
        const q = query(collection(db, 'Users'), where('is_master', '==', true), where('visibility_status', '==', 'active'));
        const snap = await getDocs(q);

        for (const userDoc of snap.docs) {
            await VisibilityService.processMonthlyFee(userDoc.id);
        }
        console.log(`[VisibilityService] Global Fee Cycle Complete.`);
    }
};
