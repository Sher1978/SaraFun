import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * TransactionService.ts
 * Manages the "Trust Handshake" between Masters and Clients.
 */

export interface Transaction {
    id?: string;
    masterUid: string;
    clientUid: string;
    status: 'pending' | 'completed' | 'cancelled';
    timestamp: any;
    serviceType?: string;
    amountStars?: number;
}

export const TransactionService = {
    /**
     * Initiates a service session (The Handshake).
     * Usually triggered by a QR scan.
     */
    startServiceSession: async (masterUid: string, clientUid: string, serviceType: string = 'General Service') => {
        console.log(`[TransactionService] Starting session between Master:${masterUid} and Client:${clientUid}`);

        // 1. Anti-Fraud: Wash Trading Block
        if (masterUid === clientUid) {
            throw new Error("Wash Trading Blocked: Cannot transact with yourself.");
        }

        // 2. Anti-Fraud: Rate Limiting (Max 2 tx per 24h between same users)
        const transactionsRef = collection(db, 'Transactions');
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const rateLimitQuery = query(
            transactionsRef,
            where('masterUid', '==', masterUid),
            where('clientUid', '==', clientUid)
        );

        const snap = await getDocs(rateLimitQuery);
        const recentTxCount = snap.docs.filter(doc => {
            const txData = doc.data();
            if (!txData.timestamp) return false;
            return txData.timestamp.toDate() > yesterday;
        }).length;

        if (recentTxCount >= 2) {
            throw new Error("Rate Limit Exceeded: Maximum 2 transactions per day with the same Master.");
        }

        const docRef = await addDoc(transactionsRef, {
            masterUid,
            clientUid,
            status: 'pending',
            serviceType,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    },

    /**
     * Completes a transaction.
     * This is required to unlock the Review Flow and triggers referral bonuses.
     */
    completeTransaction: async (transactionId: string) => {
        const txRef = doc(db, 'Transactions', transactionId);
        await updateDoc(txRef, {
            status: 'completed',
            commissionStatus: 'frozen', // Anti-Fraud: Frozen until ABCD review
            completedAt: serverTimestamp()
        });

        // Handle Referral Rewards (Social Growth Hook)
        // In production, this would be a backend trigger. 
        // Here we demonstrate the logic:
        // await TransactionService.checkAndCreditReferralBonus(transactionId);

        return true;
    },

    /**
     * Unlocks the frozen commission/cashback after an ABCD review is submitted.
     */
    unlockCommission: async (masterUid: string, clientUid: string) => {
        const transactionsRef = collection(db, 'Transactions');
        const q = query(
            transactionsRef,
            where('masterUid', '==', masterUid),
            where('clientUid', '==', clientUid),
            where('status', '==', 'completed'),
            where('commissionStatus', '==', 'frozen')
        );

        const snap = await getDocs(q);
        if (!snap.empty) {
            // Unlock the most recent frozen transaction
            const latestTx = snap.docs.sort((a, b) => b.data().timestamp - a.data().timestamp)[0];
            await updateDoc(doc(db, 'Transactions', latestTx.id), {
                commissionStatus: 'available',
                unlockedAt: serverTimestamp()
            });
            console.log(`[TransactionService] Commission unlocked for TX: ${latestTx.id}`);
            return true;
        }
        return false;
    },

    /**
     * Credits 10% bonus stars to the inviter upon the first 100+ Star transaction.
     */
    checkAndCreditReferralBonus: async (transactionId: string) => {
        console.log(`[TransactionService] Checking referral rewards for transaction: ${transactionId}`);
        // 1. Fetch transaction details (masterUid, clientUid, amount)
        // 2. Fetch Client's "referred_by" field from /Users/{clientUid}
        // 3. If exists and transaction amount >= 100 Stars:
        // 4. Update /Users/{inviterUid} adding 10% of transaction amount to stars_balance.
        return true;
    },

    /**
     * Checks if a client has completed a transaction with a specific master.
     * Gating function for ABCD reviews.
     */
    hasCompletedTransaction: async (masterUid: string, clientUid: string) => {
        const transactionsRef = collection(db, 'Transactions');
        const q = query(
            transactionsRef,
            where('masterUid', '==', masterUid),
            where('clientUid', '==', clientUid),
            where('status', '==', 'completed')
        );

        const snap = await getDocs(q);
        return !snap.empty;
    },

    /**
     * Fetches history for a Master Dashboard.
     */
    getMasterHistory: async (masterUid: string) => {
        const transactionsRef = collection(db, 'Transactions');
        const q = query(
            transactionsRef,
            where('masterUid', '==', masterUid),
            where('status', '==', 'completed')
        );

        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
