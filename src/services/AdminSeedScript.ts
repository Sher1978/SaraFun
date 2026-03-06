import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * AdminSeedScript.ts
 * Seeding 10 "Starter Masters" in Nha Trang.
 * Coordinates are localized to popular spots.
 */

const NHA_TRANG_MASTERS = [
    { id: 'm_nt_1', name: 'Sherlock Auto', category: 'Auto', service: 'Elite Car Tuning', lat: 12.238, lng: 109.196, bio: 'Precision tuning for the true speed enthusiast.', price: 120 },
    { id: 'm_nt_2', name: 'Zen Yoga', category: 'Health', service: 'Sunrise Hatha', lat: 12.245, lng: 109.194, bio: 'Find your center on the shores of Vietnam.', price: 15 },
    { id: 'm_nt_3', name: 'Arctic Coffee', category: 'Beauty', service: 'Premium Beans', lat: 12.251, lng: 109.188, bio: 'Cold brew, hot soul.', price: 5 },
    { id: 'm_nt_4', name: 'Beauty Lab', category: 'Health', service: 'Organic Skin Care', lat: 12.232, lng: 109.192, bio: 'Science-backed beauty secrets.', price: 45 },
    { id: 'm_nt_5', name: 'Mike Plumber', category: 'Home', service: 'Emergency Fix', lat: 12.240, lng: 109.201, bio: 'If it leaks, Mike peaks.', price: 30 },
    { id: 'm_nt_6', name: 'Tech Ninja', category: 'Tech', service: 'Device Surgeon', lat: 12.255, lng: 109.185, bio: 'Fixing phones since the flip days.', price: 20 },
    { id: 'm_nt_7', name: 'Legal Eagle', category: 'Legal', service: 'Contracts & Visa', lat: 12.248, lng: 109.198, bio: 'Smooth paths through heavy papers.', price: 100 },
    { id: 'm_nt_8', name: 'Pets Paradise', category: 'Pets', service: 'Dog Grooming', lat: 12.235, lng: 109.182, bio: 'Every tail deserves a trim.', price: 25 },
    { id: 'm_nt_9', name: 'Home Chef', category: 'Food', service: 'Gourmet Delivery', lat: 12.242, lng: 109.190, bio: 'Michlin taste at your doorstep.', price: 40 },
    { id: 'm_nt_10', name: 'Event Pro', category: 'Events', service: 'Party Planner', lat: 12.250, lng: 109.175, bio: 'Moments that turn into memories.', price: 200 },
];

export const seedMasters = async () => {
    console.log("Seeding Nha Trang Masters...");
    const batch = writeBatch(db);

    for (const m of NHA_TRANG_MASTERS) {
        const ref = doc(db, 'Users', m.id);
        batch.set(ref, {
            display_name: m.name,
            is_master: true,
            is_business_mode: true,
            master_profile: {
                business_name: m.name,
                category: m.category,
                bio: m.bio,
                hourly_rate: m.price
            },
            lat: m.lat,
            lng: m.lng,
            abcd: { a: 4.5, b: 4.8, c: 5.0, d: 4.2 } // Starter ratings
        }, { merge: true });
    }

    await batch.commit();
    console.log("Seeding complete!");
};
