import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const NEON = '#00E5CC';
const NEON_DIM = 'rgba(0,229,204,0.15)';
const NEON_BORDER = 'rgba(0,229,204,0.35)';
const BG = '#0d0f14';
const CARD_BG = 'rgba(14,19,30,0.9)';
const DUNBAR_GOLD = '#FFD700';

type DunbarMode = 'My 20' | 'Friends of Friends' | 'Global';

// ─── Category SVG Icons ───────────────────────────────────────────────────────
const IconRestaurant = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2v20M4 2v3.1c0 .8.6 1.4 1.4 1.4H8M5 2v4M8 2v4" /><path d="M13 2.1c0 .9-.7 1.6-1.5 1.6S10 3 10 2.1V2h3v.1zM10 20c0 1.1.9 2 2 2s2-.9 2-2V8h-4v12z" />
    </svg>
);

const IconCafe = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" />
    </svg>
);

const IconShop = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const IconNightlife = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-12c-1.1 0-2 .9-2 2v1l8 7.5L20 5V4c0-1.1-.9-2-2-2zM12 11.5v7.5M8 22h8" />
    </svg>
);

const IconGym = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 4h3M18 20h3M3 4h3M3 20h3M18 4v16M6 4v16M2 12h20" />
    </svg>
);

const IconArt = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
);

const IconEvents = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
interface MasterCard {
    id: string; name: string; service: string; rating: number;
    distance: string; image: string; isSafe: boolean;
    dunbarWeight: number; abcd: [number, number, number, number];
}

const MOCK_MASTERS: MasterCard[] = [
    { id: 'm1', name: 'Alex Barber', service: 'Haircut & Styling', rating: 4.9, distance: '0.4 km', image: 'https://images.unsplash.com/photo-1503467913725-8484b65b0715?w=400&q=80', isSafe: true, dunbarWeight: 2.0, abcd: [5, 4.8, 5, 4.9] },
    { id: 'm2', name: 'Marina SPA', service: 'Full Body Massage', rating: 4.8, distance: '1.1 km', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80', isSafe: true, dunbarWeight: 2.0, abcd: [4.8, 5, 4.7, 4.8] },
    { id: 'm3', name: 'Dr. Nguyen', service: 'General Practice', rating: 4.7, distance: '0.9 km', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', isSafe: true, dunbarWeight: 1.5, abcd: [4.9, 4.7, 4.8, 4.6] },
    { id: 'm4', name: 'AutoMaster+', service: 'Full Diagnostics', rating: 4.6, distance: '2.2 km', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80', isSafe: false, dunbarWeight: 1.2, abcd: [4.6, 4.4, 4.5, 4.3] },
    { id: 'm5', name: 'Neon Café', service: 'Coffee & Co-work', rating: 4.5, distance: '0.3 km', image: 'https://images.unsplash.com/photo-1559925393-1d6d879e60e5?w=400&q=80', isSafe: true, dunbarWeight: 1.5, abcd: [4.5, 4.6, 4.7, 4.5] },
    { id: 'm6', name: 'Global Fix', service: 'Home Repairs', rating: 4.2, distance: '3.1 km', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80', isSafe: true, dunbarWeight: 0.5, abcd: [4.2, 4.1, 4.0, 4.3] },
];

const MOCK_EVENTS = [
    { id: 'e1', name: 'Crypto Night 2025', date: 'Mar 8 · 20:00', image: 'https://images.unsplash.com/photo-1514525253361-bee243870d12?w=400&q=80', attendees: 8 },
    { id: 'e2', name: 'Rooftop Networking', date: 'Mar 9 · 19:30', image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80', attendees: 5 },
    { id: 'e3', name: 'Beach Cleanup + BBQ', date: 'Mar 10 · 09:00', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', attendees: 12 },
];

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24"
                    fill={i < Math.floor(rating) ? NEON : 'none'}
                    stroke={NEON} strokeWidth={1.5}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ color: NEON, fontSize: 12, fontWeight: 800, marginLeft: 4 }}>{rating}/5</span>
        </span>
    );
}

// ─── Master Card ──────────────────────────────────────────────────────────────
function MasterCardComp({ card, mode }: { card: MasterCard; mode: DunbarMode }) {
    const navigate = useNavigate();
    const isTop5 = card.dunbarWeight === 2.0 && mode === 'My 20';
    return (
        <div
            onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate('/lead-form'); }}
            className="flex-shrink-0 active:scale-[0.97] transition-transform cursor-pointer"
            style={{
                width: 160,
                background: CARD_BG,
                borderRadius: 14,
                overflow: 'hidden',
                // Updated border: Top 5 gets a thicker glowing NEON border instead of gold
                border: isTop5 ? `2px solid ${NEON}` : `1px solid ${NEON_BORDER}`,
                boxShadow: isTop5 ? `0 0 18px ${NEON}44` : `0 0 10px rgba(0,229,204,0.12)`,
                scrollSnapAlign: 'start',
            }}
        >
            <div style={{ position: 'relative', height: 110 }}>
                <img src={card.image} alt={card.name} className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.72) saturate(0.8)' }} />
                {/* Count badge */}
                <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                    border: `1px solid ${NEON_BORDER}`, borderRadius: 7, padding: '2px 7px',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                }}>1/15</div>
                {/* Safe dot */}
                <div style={{
                    position: 'absolute', bottom: 8, left: 8,
                    width: 8, height: 8, borderRadius: '50%',
                    background: card.isSafe ? '#22c55e' : '#eab308',
                    boxShadow: `0 0 6px ${card.isSafe ? '#22c55e' : '#eab308'}`,
                }} />
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>{card.name}</div>
                <Stars rating={card.rating} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{card.distance} away</div>
            </div>
        </div>
    );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event }: { event: typeof MOCK_EVENTS[0] }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate('/lead-form'); }}
            className="flex-shrink-0 active:scale-[0.97] transition-transform cursor-pointer"
            style={{
                width: 200, background: CARD_BG, borderRadius: 14, overflow: 'hidden',
                border: `1.5px solid ${NEON_BORDER}`,
                boxShadow: `0 0 10px rgba(0,229,204,0.1)`,
                scrollSnapAlign: 'start',
            }}
        >
            <div style={{ position: 'relative', height: 110 }}>
                <img src={event.image} alt={event.name} className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.65) saturate(0.7)' }} />
                <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                    border: `1px solid ${NEON_BORDER}`, borderRadius: 7, padding: '2px 7px',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                }}>1/10</div>
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{event.name}</div>
                </div>
            </div>
            <div style={{ padding: '8px 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{event.date}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: NEON }}>+{event.attendees} going</span>
            </div>
        </div>
    );
}

// ─── Section Shelf ────────────────────────────────────────────────────────────
function Shelf({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 style={{
                margin: '0 0 14px 16px',
                fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
                color: NEON,
                textShadow: `0 0 12px ${NEON}88, 0 0 24px ${NEON}33`,
            }}>
                {title}
            </h2>
            <div
                className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {children}
            </div>
        </section>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Discovery() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [ring, setRing] = useState<DunbarMode>('My 20');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const rings: DunbarMode[] = ['My 20', 'Friends of Friends', 'Global'];

    const filterByRing = (card: MasterCard): boolean => {
        if (ring === 'My 20') return card.dunbarWeight >= 1.0;
        if (ring === 'Friends of Friends') return card.dunbarWeight >= 0.5 && card.dunbarWeight < 2.0;
        return true;
    };

    const top5Masters = MOCK_MASTERS.filter(m => m.dunbarWeight === 2.0 && filterByRing(m));
    const safeMasters = MOCK_MASTERS.filter(m => m.isSafe && filterByRing(m));
    const allFiltered = MOCK_MASTERS.filter(filterByRing);

    const categoryCounts: Record<string, number> = {
        'Restaurants': 1, 'Cafes': 2, 'Shops': 1, 'Nightlife': 1, 'Gyms': 1, 'Art': 1, 'Events': 2
    };

    // Updated Quick Links to use SVG matching the photo
    const QUICK_LINKS = [
        { id: 'Restaurants', label: 'Restaurants', icon: <IconRestaurant />, sos: false },
        { id: 'Cafes', label: 'Cafes', icon: <IconCafe />, sos: false },
        { id: 'Shops', label: 'Shops', icon: <IconShop />, sos: false },
        { id: 'Nightlife', label: 'Nightlife', icon: <IconNightlife />, sos: false },
        { id: 'Gyms', label: 'Gyms', icon: <IconGym />, sos: false },
        { id: 'Art', label: 'Art', icon: <IconArt />, sos: false },
        { id: 'Events', label: 'Events', icon: <IconEvents />, sos: false },
    ];

    const hexBg: React.CSSProperties = {
        background: BG,
        backgroundImage: `
            radial-gradient(ellipse at 50% -10%, rgba(0,229,204,0.07) 0%, transparent 60%),
            repeating-linear-gradient(
                60deg, transparent, transparent 30px,
                rgba(0,229,204,0.025) 30px, rgba(0,229,204,0.025) 31px
            ),
            repeating-linear-gradient(
                -60deg, transparent, transparent 30px,
                rgba(0,229,204,0.025) 30px, rgba(0,229,204,0.025) 31px
            )
        `,
    };

    return (
        <div style={{ ...hexBg, minHeight: '100vh', paddingBottom: 100 }}>

            {/* ══ BLOCK 1: STICKY HEADER ══ */}
            <header
                className="sticky top-0 z-50 space-y-3 px-4 pt-3 pb-3"
                style={{
                    background: 'rgba(13,15,20,0.96)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${NEON_BORDER}`,
                    boxShadow: `0 1px 0 ${NEON_BORDER}`,
                }}
            >
                <div className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth={2.5} strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Nha Trang</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2.5} strokeLinecap="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>

                <div style={{ position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name..."
                        style={{
                            width: '100%', height: 46,
                            background: 'rgba(255,255,255,0.06)',
                            border: `1.5px solid ${NEON_BORDER}`,
                            boxShadow: `0 0 12px rgba(0,229,204,0.08)`,
                            borderRadius: 12,
                            paddingLeft: 42, paddingRight: 46,
                            color: '#fff', fontSize: 14, outline: 'none',
                        }}
                    />
                    <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>

                <div
                    className="flex rounded-xl p-0.5 gap-0.5"
                    style={{ background: 'rgba(0,229,204,0.06)', border: `1px solid ${NEON_BORDER}` }}
                >
                    {rings.map(r => {
                        const isActive = ring === r;
                        const isMy20 = r === 'My 20';
                        const accentColor = isMy20 ? DUNBAR_GOLD : NEON;
                        const accentDim = isMy20 ? 'rgba(255,215,0,0.15)' : NEON_DIM;
                        const accentHighlight = isMy20 ? 'rgba(255,215,0,0.35)' : NEON_BORDER;

                        return (
                            <button
                                key={r}
                                onClick={() => { setRing(r); WebApp.HapticFeedback.impactOccurred('light'); }}
                                className="flex-1 rounded-[10px] text-[10px] font-black uppercase tracking-wide transition-all active:scale-95"
                                style={{
                                    height: 30, border: 'none', letterSpacing: '0.03em',
                                    background: isActive ? accentDim : 'transparent',
                                    color: isActive ? accentColor : 'rgba(255,255,255,0.38)',
                                    boxShadow: isActive ? `inset 0 0 0 1px ${accentHighlight}, 0 0 12px ${accentColor}33` : 'none',
                                    textShadow: isActive ? `0 0 8px ${accentColor}99` : 'none',
                                }}
                            >
                                {r}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* ══ BLOCK 3: QUICK LINKS ══ */}
            <div className="flex gap-3 px-4 pt-5 pb-1 overflow-x-auto hide-scrollbar">
                {QUICK_LINKS.map(cat => {
                    const count = categoryCounts[cat.id] ?? 0;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(p => p === cat.id ? null : cat.id); WebApp.HapticFeedback.impactOccurred('light'); }}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-90 transition-transform"
                        >
                            <div
                                style={{
                                    width: 58, height: 58,
                                    borderRadius: 12,
                                    background: isActive ? NEON_DIM : 'rgba(14,19,30,0.85)',
                                    border: `1.5px solid ${isActive ? NEON : NEON_BORDER}`,
                                    boxShadow: isActive ? `0 0 14px rgba(0,229,204,0.25)` : `0 0 8px rgba(0,229,204,0.08)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: isActive ? NEON : 'rgba(255,255,255,0.6)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {cat.icon}
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: isActive ? NEON : 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
                                {cat.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ══ BLOCK 4: TRUST MAP WIDGET ══ */}
            <div className="mx-4 mt-5">
                <div
                    style={{
                        height: 140, borderRadius: 14, overflow: 'hidden', position: 'relative',
                        background: 'rgba(10,14,22,0.9)',
                        border: `1.5px solid ${NEON_BORDER}`,
                        boxShadow: `0 0 18px rgba(0,229,204,0.08)`,
                    }}
                >
                    <svg className="absolute inset-0 opacity-[0.12]" width="100%" height="100%">
                        <defs>
                            <pattern id="hexgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                                <path d="M 28 0 L 0 0 0 28" fill="none" stroke={NEON} strokeWidth="0.6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hexgrid)" />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,229,204,0.06) 0%, transparent 70%)',
                    }} />
                    {/* Updated pins: both gold and teal */}
                    {[
                        { x: '28%', y: '35%', color: DUNBAR_GOLD },
                        { x: '56%', y: '52%', color: NEON },
                        { x: '75%', y: '28%', color: DUNBAR_GOLD },
                        { x: '42%', y: '20%', color: NEON }
                    ].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', left: pos.x, top: pos.y,
                            transform: 'translate(-50%, -50%)',
                            width: 20, height: 20, borderRadius: '50% 50% 50% 0',
                            background: pos.color, rotate: '-45deg',
                            boxShadow: `0 0 12px ${pos.color}aa`,
                        }} />
                    ))}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '10px 14px 12px',
                        background: 'linear-gradient(to top, rgba(10,14,22,0.92) 0%, transparent 100%)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                            <span style={{ color: NEON, fontWeight: 900, textShadow: `0 0 8px ${NEON}66` }}>
                                {allFiltered.length}
                            </span> trusted masters nearby
                        </span>
                        <button
                            onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate('/map'); }}
                            style={{
                                fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                                padding: '5px 12px', borderRadius: 8,
                                background: NEON_DIM, color: NEON,
                                border: `1px solid ${NEON_BORDER}`,
                                letterSpacing: '0.05em',
                            }}
                        >
                            Expand →
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ BLOCK 5: SMART FEEDS ══ */}
            <div className="mt-7 space-y-7">
                {top5Masters.length > 0 && (
                    <Shelf title="Circles Trust">
                        {top5Masters.map(m => <MasterCardComp key={m.id} card={m} mode={ring} />)}
                    </Shelf>
                )}
                {safeMasters.length > 0 && (
                    <Shelf title="Popular Nearby">
                        {safeMasters.map(m => <MasterCardComp key={m.id} card={m} mode={ring} />)}
                    </Shelf>
                )}
                <Shelf title="New Discoveries">
                    {MOCK_EVENTS.map(e => <EventCard key={e.id} event={e} />)}
                </Shelf>
            </div>
        </div>
    );
}
