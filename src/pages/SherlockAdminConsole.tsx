import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_UID = '8524844089'; // Provided Admin ID

export default function SherlockAdminConsole() {
    const [masters, setMasters] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalStars: 0, disputes: 0, trustDensity: 0 });
    const [loading, setLoading] = useState(true);
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString();

    useEffect(() => {
        if (currentUserUid !== ADMIN_UID && currentUserUid !== 'dev_user_uid') {
            WebApp.showAlert("Unauthorized: God Mode Required.");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const mastersSnap = await getDocs(collection(db, 'Users')); // Assuming masters are in Users with is_master flag
                const mastersList = mastersSnap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter((u: any) => u.is_master || u.is_business_mode);
                setMasters(mastersList);

                // Mocking Heartbeat Stats for now
                setStats({
                    totalStars: 45200,
                    disputes: 5,
                    trustDensity: 4.2
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUserUid]);

    const toggleVerification = async (masterId: string, currentStatus: boolean) => {
        WebApp.HapticFeedback.impactOccurred('medium');
        try {
            const masterRef = doc(db, 'Users', masterId);
            await updateDoc(masterRef, { is_sherlock_verified: !currentStatus });
            setMasters(prev => prev.map(m => m.id === masterId ? { ...m, is_sherlock_verified: !currentStatus } : m));
            WebApp.showAlert(`Master ${!currentStatus ? 'VERIFIED' : 'DE-VERIFIED'}`);
        } catch (err) {
            WebApp.showAlert("Operation failed: Check Permissions");
        }
    };

    if (currentUserUid !== ADMIN_UID && currentUserUid !== 'dev_user_uid') {
        return <div className="p-10 text-center font-black uppercase text-red-500">Access Denied</div>;
    }

    return (
        <div className="min-h-full bg-tg-main text-tg-primary px-4 pt-6 pb-24 space-y-8">
            <header className="space-y-1">
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-yellow-500">Admin Overlord</h1>
                <p className="text-tg-hint text-xs">The Final Pillar of Governance</p>
            </header>

            {/* City Heartbeat */}
            <section className="bg-tg-secondary/50 border border-yellow-500/20 rounded-3xl p-6 space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-yellow-500">City Heartbeat</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">{stats.totalStars.toLocaleString()}</div>
                        <div className="text-[10px] text-tg-hint uppercase">Stars Circulating</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">{stats.disputes}</div>
                        <div className="text-[10px] text-tg-hint uppercase">Active Disputes</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">{stats.trustDensity}</div>
                        <div className="text-[10px] text-tg-hint uppercase">Trust Density</div>
                    </div>
                </div>
            </section>

            {/* Master Sealer */}
            <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-tg-hint px-2">Master Sealer</h2>
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-10 opacity-50 italic">Scanning city for signals...</div>
                    ) : (
                        masters.map(m => (
                            <div key={m.id} className="bg-tg-secondary/30 border border-tg-hint/10 p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <div className="font-bold flex items-center gap-1">
                                        {m.name || m.first_name || 'Anonymous Master'}
                                        {m.is_sherlock_verified && <span className="text-yellow-500 text-xs">★</span>}
                                    </div>
                                    <div className="text-[10px] text-tg-hint truncate w-32">{m.id}</div>
                                </div>
                                <button
                                    onClick={() => toggleVerification(m.id, !!m.is_sherlock_verified)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-colors ${m.is_sherlock_verified ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500 text-black'
                                        }`}
                                >
                                    {m.is_sherlock_verified ? 'UNSEAL' : 'SEAL'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
