import { doc, setDoc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * AdminStressTestSeed.ts
 * Complex trust network for auditing math.ts and referral hooks.
 */

export const runStressTestSeed = async () => {
    console.log("🚀 Initiating System Stress-Test Seeding...");
    const batch = writeBatch(db);

    // 1. Users
    const userA_Id = 'user_A_influencer';
    const userB_Id = 'user_B_newbie';
    const userC_Id = 'user_C_master_client';

    // User A: Influencer with dense social graph
    const socialGraphA: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) socialGraphA[`m_top5_${i}`] = 'Top5';
    for (let i = 1; i <= 10; i++) socialGraphA[`m_circle15_${i}`] = '15';
    for (let i = 1; i <= 50; i++) socialGraphA[`m_shadow_${i}`] = 'Shadow';
    socialGraphA['master_3_beauty'] = 'Top5'; // For sorting test

    batch.set(doc(db, 'Users', userA_Id), {
        display_name: 'User A (Influencer)',
        stars_balance: 5000,
        social_graph: socialGraphA,
        is_onboarded: true
    });

    // User B: Newbie referred by User A
    batch.set(doc(db, 'Users', userB_Id), {
        display_name: 'User B (Newbie)',
        referred_by: userA_Id,
        stars_balance: 100,
        social_graph: {},
        is_onboarded: true
    });

    // User C: Master Client with high deposit
    batch.set(doc(db, 'Users', userC_Id), {
        display_name: 'User C (Wealthy)',
        stars_balance: 10000,
        is_master: true,
        is_business_mode: true,
        business_deposit: 1000 // Stars staked
    });

    // 2. Masters
    // Master 1: Auto, Sherlock Verified, Disputed Tx
    batch.set(doc(db, 'Users', 'master_1_auto'), {
        display_name: 'Alex Auto',
        is_master: true,
        is_business_mode: true,
        is_sherlock_verified: true,
        master_profile: { business_name: 'Alex Auto', category: 'Auto', bio: 'Expert service.', hourly_rate: 100 },
        abcd: { a: 4.8, b: 4.5, c: 3.2, d: 3.0 },
        lat: 12.238, lng: 109.196
    });

    // Master 2: Health, NO DEPOSIT (Should be hidden in Discovery)
    batch.set(doc(db, 'Users', 'master_2_health'), {
        display_name: 'Hidden Health',
        is_master: true,
        is_business_mode: true,
        business_deposit: 0,
        master_profile: { business_name: 'Hidden Health', category: 'Health', bio: 'No stake yet.', hourly_rate: 50 },
        lat: 12.245, lng: 109.194
    });

    // Master 3: Beauty, User A's Top 5
    batch.set(doc(db, 'Users', 'master_3_beauty'), {
        display_name: 'Top 5 Glow',
        is_master: true,
        is_business_mode: true,
        business_deposit: 500,
        master_profile: { business_name: 'Top 5 Glow', category: 'Beauty', bio: 'Trusted by A.', hourly_rate: 40 },
        lat: 12.251, lng: 109.188
    });

    // 3. Transactions & Arbitration
    const tx1 = doc(collection(db, 'Transactions'));
    batch.set(tx1, {
        clientUid: userA_Id,
        masterUid: 'master_1_auto',
        amountStars: 100,
        status: 'completed',
        serviceType: 'Tuning',
        timestamp: serverTimestamp()
    });

    const tx2 = doc(collection(db, 'Transactions'));
    batch.set(tx2, {
        clientUid: userB_Id,
        masterUid: 'master_3_beauty',
        amountStars: 200,
        status: 'pending',
        serviceType: 'Facial',
        timestamp: serverTimestamp()
    });

    // Dispute for Master 1
    batch.set(doc(db, 'Disputes', 'dispute_1'), {
        masterUid: 'master_1_auto',
        reviewId: 'review_fail_1',
        status: 'pending',
        stakeStars: 500,
        timestamp: serverTimestamp()
    });

    await batch.commit();
    console.log("✅ Seeding complete! Database stress-tested.");
};
