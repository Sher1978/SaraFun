import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';

export default function ProfileHub() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ stars: 0, ton: 0 });
    const [isMaster, setIsMaster] = useState(false);
    const [referralCount, setReferralCount] = useState(0);
    const [showQRModal, setShowQRModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';
    const referralLink = `https://t.me/sarafun_bot/app?startapp=${currentUserUid}`;
    const userFirstName = WebApp.initDataUnsafe?.user?.first_name || 'SaraFun User';
    const userPhoto = WebApp.initDataUnsafe?.user?.photo_url || null;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRef = doc(db, 'Users', currentUserUid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setStats({
                        stars: data.stars_balance || 0,
                        ton: (data.stars_balance || 0) / 50 // 50 Stars = 1 USD approx
                    });
                    setIsMaster(data.is_master || false);
                    setReferralCount(data.referral_stats?.total_invited || 0);
                }
            } catch (err) {
                console.error("Failed to load profile data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [currentUserUid]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        WebApp.HapticFeedback.notificationOccurred('success');
        WebApp.showAlert('Referral link copied!');
    };

    if (loading) return <div className="p-4 text-center text-tg-hint">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-tg-bg text-tg-primary pb-28 pt-4">

            {/* 1. HEADER (Identification) */}
            <header className="px-4 flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-tg-hint/10 shadow-xl mb-4 bg-tg-secondary flex items-center justify-center">
                    {userPhoto ? (
                        <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-black opacity-30">
                            {userFirstName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-black tracking-tight">{userFirstName}</h1>
                <p className="text-[10px] text-tg-hint font-bold uppercase tracking-[0.2em] mt-1">Trust Node Active</p>
            </header>

            {/* 2. WALLET & ASSETS (Premium Card) */}
            <div className="px-4 mb-6">
                <div className="bg-tg-secondary/40 backdrop-blur-2xl border border-tg-hint/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-3xl" />

                    <p className="text-[10px] uppercase tracking-widest font-black text-tg-hint mb-3">Total Assets Balance</p>
                    <div className="flex flex-col mb-6">
                        <span className="text-5xl font-black tracking-tighter text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                            ⭐️ {stats.stars.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-tg-hint mt-1">≈ ${stats.ton.toFixed(2)} USD</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="h-12 bg-[#FFD700] text-black rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                            Top Up ⭐️
                        </button>
                        <button className="h-12 bg-tg-secondary border border-tg-hint/20 text-tg-primary rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-transform">
                            History
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. DIGITAL HANDSHAKE (QR Button) */}
            <div className="px-4 mb-8">
                <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full h-14 bg-gradient-to-r from-tg-secondary/50 to-tg-secondary/20 border border-[#FFD700]/30 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg"
                >
                    <span className="text-xl">🔲</span>
                    <span className="font-black uppercase tracking-[0.15em] text-[#FFD700] text-sm">Show My QR Code</span>
                </button>
            </div>

            {/* 4. MY EMPIRE (MLM & Growth) */}
            <div className="space-y-6">
                <section>
                    <div className="px-4 py-2 text-[11px] uppercase tracking-widest font-black text-tg-hint bg-tg-secondary/30">My Social Empire</div>
                    <div className="bg-tg-secondary divide-y divide-tg-hint/10 text-sm">
                        <button onClick={handleCopyLink} className="w-full flex items-center justify-between p-4 active:bg-tg-bg transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🔗</span>
                                <span className="font-bold">Referral Link</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-tg-hint font-mono">Copy</span>
                                <span className="text-tg-hint opacity-30">›</span>
                            </div>
                        </button>
                        <button onClick={() => navigate('/referrals')} className="w-full flex items-center justify-between p-4 active:bg-tg-bg transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">👥</span>
                                <span className="font-bold">Referral Network (L1-L3)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-[#FFD700]">{referralCount}</span>
                                <span className="text-tg-hint opacity-30">›</span>
                            </div>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 active:bg-tg-bg transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">⭐</span>
                                <span className="font-bold">My Deals & Reviews</span>
                            </div>
                            <span className="text-tg-hint opacity-30">›</span>
                        </button>
                    </div>
                </section>

                {/* 5. BUSINESS GATEWAY */}
                <div className="px-4">
                    <button
                        onClick={() => navigate(isMaster ? '/dashboard' : '/business-landing')}
                        className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#FFD700]/10 to-transparent border border-[#FFD700]/20 flex flex-col items-center text-center gap-2 active:scale-95 transition-transform group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">💼</span>
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#FFD700]">
                            {isMaster ? 'Go to Master Dashboard' : 'Become a Master'}
                        </h3>
                        <p className="text-[10px] text-tg-hint font-medium uppercase tracking-wider">
                            {isMaster ? 'Manage your services and leads' : 'Upgrade to start earning stars'}
                        </p>
                    </button>
                </div>

                {/* 6. FOOTER (Settings & Support) */}
                <section>
                    <div className="px-4 py-2 text-[11px] uppercase tracking-widest font-black text-tg-hint bg-tg-secondary/30">Support & Legal</div>
                    <div className="bg-tg-secondary divide-y divide-tg-hint/10 text-sm">
                        <button onClick={() => navigate('/rules')} className="w-full flex items-center justify-between p-4 active:bg-tg-bg transition-colors">
                            <span className="font-bold">Community Rules</span>
                            <span className="text-tg-hint opacity-30">›</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 active:bg-tg-bg transition-colors">
                            <span className="font-bold">Support 24/7</span>
                            <span className="text-tg-hint opacity-30">›</span>
                        </button>
                    </div>
                </section>
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-fade-in" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white p-6 rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <h2 className="text-sm font-black text-black mb-6 uppercase tracking-[0.2em]">Digital Handshake</h2>
                        <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-gray-100">
                            <QRCodeSVG value={referralLink} size={220} level={"H"} fgColor={"#000000"} bgColor={"#ffffff"} />
                        </div>
                        <p className="mt-6 text-[10px] text-gray-400 font-mono tracking-widest uppercase">NODE ID: {currentUserUid}</p>
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="mt-8 w-full h-12 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs active:bg-gray-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
