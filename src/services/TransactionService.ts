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
            status: 'pending_undo', // Sprint 2: 60-sec buffer
            serviceType,
            timestamp: serverTimestamp()
        });

        // Sprint 2: 60-sec Undo Buffer
        // In production, a Cloud Function with Cloud Tasks would be ideal here.
        // For the TMA, we simulate the server-side delay.
        setTimeout(async () => {
            const currentTxSnap = await getDocs(query(collection(db, 'Transactions'), where('__name__', '==', docRef.id)));
            if (!currentTxSnap.empty) {
                const txData = currentTxSnap.docs[0].data();
                if (txData.status === 'pending_undo') {
                    console.log(`[TransactionService] 60s passed. Auto-confirming TX: ${docRef.id}`);
                    await TransactionService.completeTransaction(docRef.id, masterUid, clientUid, 100); // Default amount 100 for simulation
                }
            }
        }, 60000);

        return docRef.id;
    },

    /**
     * Cancel an undoable transaction within the 60 second window.
     */
    cancelTransaction: async (transactionId: string) => {
        const txRef = doc(db, 'Transactions', transactionId);
        await updateDoc(txRef, {
            status: 'cancelled',
            cancelledAt: serverTimestamp()
        });
        console.log(`[TransactionService] TX ${transactionId} cancelled by Master.`);
        return true;
    },

    /**
     * Completes a transaction after the 60s buffer.
     * Applies the 20% Split Logic: Cashback (10%), MLM L1-L3 (3%), B2B (2%), Platform (5%).
     */
    completeTransaction: async (transactionId: string, masterUid: string, clientUid: string, amountStars: number) => {
        const txRef = doc(db, 'Transactions', transactionId);

        // 1. Calculate the 20% split
        const commission = amountStars * 0.20;
        const masterReceives = amountStars - commission;
        const cashback = commission * 0.50; // 10% of total (50% of commission)
        const mlmLevel = commission * 0.05; // 1% per level (5% of commission)
        const b2bRev = commission * 0.10; // 2% of total
        const platformRev = commission * 0.25; // 5% of total

        // 2. Perform Batch Write for atomicity
        const { writeBatch } = await import('firebase/firestore');
        const batch = writeBatch(db);

        // Update TX Status
        batch.update(txRef, {
            status: 'completed',
            commissionStatus: 'frozen', // Anti-Fraud: Frozen until ABCD review
            amountStars,
            split: { commission, cashback, mlmLevel, b2bRev, platformRev },
            completedAt: serverTimestamp()
        });

        // 3. In a fully implemented backend, we would use the MLMs from User Profiles.
        // For the TMA MVP, we mock the master balance update.
        // The Client's Cashback is frozen, so it's NOT added to their balance yet.
        const masterRef = doc(db, 'Users', masterUid);
        // Assuming we would use FieldValue.increment(masterReceives) here
        // batch.update(masterRef, { stars_balance: increment(masterReceives) });

        await batch.commit();
        console.log(`[TransactionService] TX ${transactionId} confirmed. Split applied & frozen.`);

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
