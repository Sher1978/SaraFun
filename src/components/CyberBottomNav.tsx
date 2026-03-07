import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { openQRScanner } from '../services/QRScannerService';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const NEON = '#00E5CC';

// ─── SVG Icons (matching Stitch design reference) ───────────────────────────
function ExploreIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function MapIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function QrIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round">
            {/* Top-left corner */}
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="5" y="5" width="3" height="3" fill="currentColor" />
            {/* Top-right corner */}
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="16" y="5" width="3" height="3" fill="currentColor" />
            {/* Bottom-left corner */}
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="5" y="16" width="3" height="3" fill="currentColor" />
            {/* Bottom-right quadrant pattern */}
            <rect x="14" y="14" width="3" height="3" />
            <rect x="18" y="14" width="3" height="3" />
            <rect x="14" y="18" width="3" height="3" />
            <rect x="18" y="18" width="3" height="3" />
        </svg>
    );
}

function RadarIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <line x1="12" y1="2" x2="12" y2="6" />
        </svg>
    );
}

function ProfileIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
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
            borderTop: `1px solid rgba(0,229,204,0.15)`,
            height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 100,
        }}>
            {items.map((item) => {
                const Icon = item.icon;
                if (item.center) {
                    // QR Scanner button — always glowing
                    return (
                        <button
                            key={item.id}
                            onClick={() => handlePress(item.id, item.path)}
                            style={{
                                width: 58, height: 58,
                                borderRadius: '50%',
                                background: `radial-gradient(circle at 40% 35%, ${NEON}, #009980)`,
                                boxShadow: `0 0 24px ${NEON}99, 0 0 48px ${NEON}44, 0 4px 16px rgba(0,0,0,0.6)`,
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: -18,
                                flexShrink: 0,
                                transition: 'transform 0.1s',
                                color: '#0d0f14',
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
                            color: isActive ? NEON : 'rgba(255,255,255,0.35)',
                            transition: 'color 0.2s, transform 0.1s, filter 0.2s',
                            minWidth: 48,
                            // Active icon glow
                            filter: isActive ? `drop-shadow(0 0 6px ${NEON}88)` : 'none',
                        }}
                        className="active:scale-95"
                    >
                        <Icon active={isActive} />
                        <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                            // Active label glow via text-shadow
                            textShadow: isActive ? `0 0 8px ${NEON}88` : 'none',
                        }}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
