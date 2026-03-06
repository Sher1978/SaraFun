import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { openQRScanner } from '../services/QRScannerService';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const NEON = '#00E5CC';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
function ExploreIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}
function MapIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    );
}
function QrIcon() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d0f14" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
            <line x1="5" y1="5" x2="5" y2="7" /><line x1="16" y1="5" x2="16" y2="7" /><line x1="5" y1="16" x2="5" y2="18" />
        </svg>
    );
}
function RadarIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 010 8.49" /><path d="M7.76 16.24a6 6 0 010-8.49" />
            <path d="M20.07 3.93a10 10 0 010 16.14" /><path d="M3.93 20.07a10 10 0 010-16.14" />
        </svg>
    );
}
function ProfileIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CyberBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    const items = [
        { id: 'explore', label: 'EXPLORE', path: '/discovery', icon: ExploreIcon },
        { id: 'map', label: 'MAP', path: '/map', icon: MapIcon },
        { id: 'qr', label: '', path: '/scanner', icon: QrIcon, center: true },
        { id: 'radar', label: 'RADAR', path: '/radar', icon: RadarIcon },
        { id: 'profile', label: 'PROFILE', path: '/profile', icon: ProfileIcon },
    ];

    const handlePress = (id: string, path: string) => {
        try { WebApp.HapticFeedback.impactOccurred('light'); } catch (e) { }
        if (id === 'qr') {
            openQRScanner(currentUserUid);
        } else {
            navigate(path);
        }
    };

    return (
        <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(10,14,22,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: `1px solid rgba(0,229,204,0.2)`,
            height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 100,
        }}>
            {items.map((item) => {
                const Icon = item.icon;
                if (item.center) {
                    return (
                        <button
                            key={item.id}
                            onClick={() => handlePress(item.id, item.path)}
                            style={{
                                width: 58, height: 58,
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 40% 35%, #00E5CC, #009980)`,
                                boxShadow: `0 0 28px ${NEON}88, 0 4px 16px rgba(0,0,0,0.6)`,
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: -18,
                                flexShrink: 0,
                                transition: 'transform 0.1s',
                            }}
                            className="active:scale-90"
                        >
                            <Icon />
                        </button>
                    );
                }
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <button
                        key={item.id}
                        onClick={() => handlePress(item.id, item.path)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: isActive ? NEON : 'rgba(255,255,255,0.4)',
                            transition: 'color 0.2s, transform 0.1s',
                            minWidth: 48,
                        }}
                        className="active:scale-95"
                    >
                        <Icon />
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em' }}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
