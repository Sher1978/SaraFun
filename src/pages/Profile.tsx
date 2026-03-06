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

    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || '260669598';
    const referralLink = `https://t.me/sarafun_bot/app?startapp=${currentUserUid}`;
    const qrData = referralLink;

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
        <div className="min-h-full bg-tg-bg overflow-y-auto pb-20">
            {/* Native Header */}
            <header className="flex flex-col items-center pt-8 pb-4 bg-tg-bg">
                <div
                    onClick={handleAvatarClick}
                    className="w-[100px] h-[100px] bg-teal-500 rounded-full flex items-center justify-center text-3xl font-semibold border-4 border-tg-bg shadow-xl cursor-pointer active:scale-95 transition-transform"
                >
                    {WebApp.initDataUnsafe?.user?.last_name?.charAt(0) || WebApp.initDataUnsafe?.user?.first_name?.charAt(0) || 'U'}
                </div>
                <h1 className="mt-3 text-xl font-semibold text-white">
                    {WebApp.initDataUnsafe?.user?.first_name || 'SaraFun User'}
                </h1>
                <p className="text-sm text-tg-hint">
                    +{currentUserUid.substring(0, 3)} {currentUserUid.substring(3, 6)} {currentUserUid.substring(6)}
                </p>
            </header>

            {/* Account Info Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Account</div>
                <div className="tg-list-group-content">
                    <div className="tg-list-item">
                        <div className="tg-list-item-label">UID</div>
                        <div className="tg-list-item-value">{currentUserUid}</div>
                    </div>
                    <button onClick={handleCopyLink} className="tg-list-item">
                        <div className="tg-list-item-label">Referral Link</div>
                        <div className="tg-list-item-value truncate max-w-[150px] opacity-60">{referralLink}</div>
                        <div className="tg-list-item-arrow">→</div>
                    </button>
                </div>
            </div>

            {/* Wallet Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Wallet & Assets</div>
                <div className="tg-list-group-content">
                    <div className="tg-list-item">
                        <div className="tg-list-item-label">Star Balance</div>
                        <div className="tg-list-item-value text-yellow-500 font-bold">{stats.stars.toLocaleString()} ⭐</div>
                    </div>
                    <div className="tg-list-item">
                        <div className="tg-list-item-label">Value in TON</div>
                        <div className="tg-list-item-value">{stats.ton.toFixed(2)} TON</div>
                    </div>
                </div>
            </div>

            {/* Business & Actions Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Business & Sharing</div>
                <div className="tg-list-group-content">
                    <button onClick={() => setShowQRModal(true)} className="tg-list-item glass-button">
                        <div className="tg-list-item-label text-teal-500 font-semibold">My QR Code</div>
                        <div className="tg-list-item-arrow">→</div>
                    </button>
                    <button
                        onClick={() => navigate(isMaster ? '/dashboard' : '/business-landing')}
                        className="tg-list-item"
                    >
                        <div className="tg-list-item-label">{isMaster ? 'Dashboard' : 'Start Business'}</div>
                        <div className="tg-list-item-arrow">→</div>
                    </button>
                </div>
            </div>

            {/* Settings & Info Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Settings</div>
                <div className="tg-list-group-content">
                    <button onClick={() => navigate('/referrals')} className="tg-list-item">
                        <div className="tg-list-item-label">Referral Empire</div>
                        <div className="tg-list-item-arrow">→</div>
                    </button>
                    <button onClick={() => navigate('/rules')} className="tg-list-item">
                        <div className="tg-list-item-label">Community Rules</div>
                        <div className="tg-list-item-arrow">→</div>
                    </button>
                </div>
            </div>
            {/* Admin Audit Tool (Dev Only) */}
            {currentUserUid === '8524844089' && (
                <div className="tg-list-group px-4">
                    <button
                        onClick={async () => {
                            await runStressTestSeed();
                            WebApp.showPopup({ title: 'Engine Primed', message: 'Stress-test data injected. Audit mode active.' });
                        }}
                        className="w-full py-2 border border-yellow-500/30 text-yellow-500/50 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl active:bg-yellow-500/10 transition-colors"
                    >
                        System Stress-Test Seeding
                    </button>
                </div>
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
