import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { runStressTestSeed } from '../services/AdminStressTestSeed';
import { ReferralService } from '../services/ReferralService';
import InfoTooltip from '../components/InfoTooltip';

export default function Profile() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ stars: 0, ton: 0 });
    const [isMaster, setIsMaster] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [avatarClickCount, setAvatarClickCount] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);

    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';
    const referralLink = `https://t.me/sarafun_bot/app?startapp=${currentUserUid}`;
    const qrData = referralLink; // User specifically asked for this bot link in handshake

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
                    setIsMaster(data.is_master || false);
                }
            } catch (err) {
                console.error("Failed to load user data:", err);
                // We don't set mock 14500 anymore.
                setStats({ stars: 0, ton: 0 });
            }
        };
        fetchUser();
    }, [currentUserUid]);

    const handleAvatarClick = () => {
        const now = Date.now();
        if (now - lastClickTime < 2000) {
            const newCount = avatarClickCount + 1;
            setAvatarClickCount(newCount);
            if (newCount >= 5) {
                // Check if user is authorized (Superadmin UID)
                if (currentUserUid === '8524844089') {
                    WebApp.HapticFeedback.notificationOccurred('success');
                    navigate('/superadmin');
                } else {
                    WebApp.HapticFeedback.notificationOccurred('error');
                    WebApp.showAlert('Access Denied: You are not a Superadmin.');
                }
                setAvatarClickCount(0);
            }
        } else {
            setAvatarClickCount(1);
        }
        setLastClickTime(now);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        WebApp.HapticFeedback.notificationOccurred('success');
        WebApp.showAlert('Referral link copied to clipboard!');
    };

    return (
        <div className="min-h-full bg-[#1a1c1e] text-[#f8fafc] px-4 pt-10 pb-24 space-y-6">
            {/* Header: Bio & Avatar */}
            <header className="flex flex-col items-center space-y-4">
                <div
                    onClick={handleAvatarClick}
                    className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-base font-bold border-4 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer active:scale-95 transition-transform select-none"
                >
                    {WebApp.initDataUnsafe?.user?.last_name?.charAt(0) || WebApp.initDataUnsafe?.user?.first_name?.charAt(0) || 'U'}
                </div>
                <div className="text-center">
                    <h1 className="text-base font-black tracking-tight uppercase italic underline decoration-[#14b8a6] underline-offset-4 text-white">
                        {WebApp.initDataUnsafe?.user?.first_name || 'SaraFun User'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">
                        Reputation: Elite
                    </p>
                    <p className="text-[10px] text-teal-500/80 font-mono mt-1 tracking-wider">
                        UID: {currentUserUid}
                    </p>
                </div>
            </header>

            {/* Wallet Block */}
            <section className="glass-photo p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full" />

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1 flex items-center">
                            Total Assets
                            <InfoTooltip text="Your available balance of ⭐️ used for platform payments." />
                        </div>
                        <div className="text-xl font-black text-white flex items-center gap-2">
                            {stats.stars.toLocaleString()} <span className="text-[#d4af37]">⭐</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                    <div>
                        <div className="text-[10px] uppercase font-black text-slate-400">Value in Ton</div>
                        <div className="text-base font-bold text-white tracking-widest">{stats.ton.toFixed(2)} TON</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-end">
                            Oracle Rate
                            <InfoTooltip text="Platform's internal exchange rate pegged to TON/USD." />
                        </div>
                        <div className="text-[11px] font-mono text-[#14b8a6]">50 ⭐️ / $1</div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setShowQRModal(true)}
                    className="h-12 bg-[#14b8a6] text-white rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#14b8a6]/20 active:scale-[0.98] transition-transform"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    My QR Code
                </button>
                <button
                    onClick={() => navigate(isMaster ? '/dashboard' : '/business-landing')}
                    className="h-12 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:bg-white/10 transition-transform"
                >
                    <svg className="w-5 h-5 text-[#14b8a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {isMaster ? 'Dashboard' : 'Start Biz'}
                </button>
            </div>
            {/* Lower Actions & Menu */}
            <div className="grid grid-cols-1 gap-4">
                {/* Referral prominent block */}
                <section className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-3">Invite Friends, Earn 1%</span>
                    <button
                        onClick={handleCopyLink}
                        className="w-full h-12 bg-white/5 text-white rounded-xl font-mono text-[11px] border border-white/5 flex items-center justify-between px-4 active:bg-white/10 transition-colors"
                    >
                        <span className="truncate mr-4 opacity-60">{referralLink}</span>
                        <svg className="w-5 h-5 flex-shrink-0 text-[#14b8a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                </section>

                {/* List Menu */}
                <section className="space-y-2">
                    {[
                        { label: 'Referral Empire', path: '/referrals', icon: '🎁' },
                        { label: 'Community Rules', path: '/rules', icon: '📜' },
                        { label: 'System Settings', path: '#', icon: '⚙️', action: () => WebApp.showAlert("System Settings coming soon.") },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => item.action ? item.action() : navigate(item.path)}
                            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-5 flex items-center justify-between active:bg-white/10 transition-all active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                            </div>
                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    ))}
                </section>
            </div>
            {/* Admin Audit Tool (Dev Only) */}
            {currentUserUid === '8524844089' && (
                <button
                    onClick={async () => {
                        await runStressTestSeed();
                        WebApp.showPopup({ title: 'Engine Primed', message: 'Stress-test data injected. Audit mode active.' });
                    }}
                    className="w-full h-10 border border-yellow-500/30 text-yellow-500/50 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl active:bg-yellow-500/10 transition-colors mt-5"
                >
                    System Stress-Test Seeding
                </button>
            )}

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-3 backdrop-blur-sm animate-fade-in" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white p-3 rounded-xl shadow-2xl flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-base font-black text-black mb-4 uppercase tracking-wider">Digital Handshake</h2>
                        <QRCodeSVG value={qrData} size={250} level={"H"} fgColor={"#000000"} bgColor={"#ffffff"} />
                        <p className="mt-4 text-xs text-gray-500 font-mono tracking-widest uppercase">ID: {currentUserUid}</p>
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="mt-5 px-8 py-3 bg-gray-200 text-black rounded-xl font-bold uppercase tracking-widest text-sm active:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
