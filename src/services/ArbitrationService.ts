import WebApp from '@twa-dev/sdk';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { convertUsdToStars } from '../utils/math';

/**
 * ArbitrationService handles review disputes and staking.
 */
export const ArbitrationService = {
    /**
     * Submits a dispute for a review.
     * Costs 500 Stars ($10 deposit) according to Bible 2.4.
     */
    submitDispute: async (
        masterUid: string,
        reviewId: string,
        evidence: string,
        response: string
    ): Promise<boolean> => {
        const stakeAmount = 10; // USD
        const starsToPay = convertUsdToStars(stakeAmount);

        return new Promise((resolve) => {
            // 1. Trigger Payment flow
            WebApp.showConfirm(`Staking ${starsToPay}⭐️ ($${stakeAmount}) for Arbitration?`, async (confirmed) => {
                if (!confirmed) return resolve(false);

                // Simulation of payment success
                WebApp.MainButton.showProgress();
                setTimeout(async () => {
                    try {
                        const disputeRef = doc(collection(db, 'Disputes'));
                        await setDoc(disputeRef, {
                            master_uid: masterUid,
                            review_id: reviewId,
                            evidence_link: evidence,
                            master_response: response,
                            stake_stars: starsToPay,
                            status: 'pending',
                            created_at: serverTimestamp()
                        });

                        WebApp.MainButton.hideProgress();
                        WebApp.showAlert('Dispute submitted. Arbitrators will review your evidence.');
                        WebApp.HapticFeedback.notificationOccurred('success');
                        resolve(true);
                    } catch (err) {
                        WebApp.MainButton.hideProgress();
                        WebApp.showAlert('Error submitting dispute.');
                        resolve(false);
                    }
                }, 1500);
            });
        });
    }
};
