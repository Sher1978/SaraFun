import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ReferralService } from '../services/ReferralService';
import { runStressTestSeed } from '../services/AdminStressTestSeed';

export default function Profile() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ stars: 0, ton: 0 });
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userRef = doc(db, 'Users', currentUserUid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setStats({
                        stars: data.stars_balance || 0,
                        ton: (data.stars_balance || 0) / 50 // Bible: 50 Stars = 1 USD/TON
                    });
                }
            } catch (err) {
                setStats({ stars: 14500, ton: 290 });
            }
        };
        fetchUser();
    }, [currentUserUid]);

    return (
        <div className="min-h-full bg-tg-main text-tg-primary px-4 pt-10 pb-24 space-y-8">
            {/* 1. Header: Bio & Avatar */}
            <header className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-tg-secondary rounded-full flex items-center justify-center text-3xl font-bold border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                    {WebApp.initDataUnsafe?.user?.first_name?.charAt(0) || 'U'}
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-black tracking-tight uppercase italic underline decoration-yellow-500 underline-offset-4">
                        {WebApp.initDataUnsafe?.user?.first_name || 'SaraFun User'}
                    </h1>
                    <p className="text-xs text-tg-hint mt-1 font-mono uppercase tracking-widest">
                        Reputation: Elite Master
                    </p>
                </div>
            </header>

            {/* 2. Wallet Block (Stars/TON) */}
            <section className="bg-gradient-to-br from-tg-secondary to-tg-main border border-tg-hint/10 rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full group-hover:bg-yellow-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[10px] uppercase font-black text-tg-hint tracking-[0.2em] mb-1">Total Assets</div>
                        <div className="text-4xl font-black text-tg-primary flex items-center gap-2">
                            {stats.stars.toLocaleString()} <span className="text-yellow-500">⭐</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-tg-hint/10 pt-4">
                    <div>
                        <div className="text-[10px] uppercase font-black text-tg-hint">Value in Ton</div>
                        <div className="text-xl font-bold">{stats.ton.toFixed(2)} TON</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-black text-tg-hint">Oracle Rate</div>
                        <div className="text-xs font-mono opacity-80">50 ⭐️ / $1</div>
                    </div>
                </div>
            </section>

            {/* 3. My QR Code (Digital Handshake) */}
            <button
                onClick={() => WebApp.showPopup({ title: 'My Handshake', message: 'Show this QR to establish a social deal session.' })}
                className="w-full h-12 bg-tg-button text-tg-button-text rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                My QR Code
            </button>

            {/* 4. List Menu */}
            <section className="space-y-3">
                {[
                    { label: 'Referral Empire', path: '/referrals', icon: '🎁' },
                    { label: 'Arbitration Center', path: '/master_dashboard', icon: '⚖️' }, // Using dash for logic for now
                    { label: 'Community Rules', path: '/rules', icon: '📜' },
                    { label: 'System Settings', path: '#', icon: '⚙️' },
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        className="w-full h-12 bg-tg-secondary/30 border border-tg-hint/10 rounded-xl px-4 flex items-center justify-between active:bg-tg-secondary/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                        </div>
                        <span className="text-tg-hint">→</span>
                    </button>
                ))}
            </section>

            {/* Admin Audit Tool (Dev Only) */}
            {currentUserUid === '8524844089' && (
                <button
                    onClick={async () => {
                        await runStressTestSeed();
                        WebApp.showPopup({ title: 'Engine Primed', message: 'Stress-test data injected. Audit mode active.' });
                    }}
                    className="w-full h-10 border border-yellow-500/30 text-yellow-500/50 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl active:bg-yellow-500/10 transition-colors"
                >
                    System Stress-Test Seeding
                </button>
            )}
        </div>
    );
}
