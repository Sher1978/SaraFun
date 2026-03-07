import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

// ─── Constants ───────────────────────────────────────────────────────────────
const DUNBAR_GOLD = '#FFD700';

type DunbarMode = 'My 220' | 'Friends of Friends' | 'Global';

// ─── Mock Data ───────────────────────────────────────────────────────────────
interface MasterCard {
    id: string;
    name: string;
    service: string;
    rating: number;
    distance: string;
    image: string;
    isSafe: boolean;
    dunbarWeight: number;
    abcd: [number, number, number, number];
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

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Reusable ABCD score bar, compact */
function AbcdBar({ abcd }: { abcd: [number, number, number, number] }) {
    const avg = (abcd.reduce((a, b) => a + b, 0) / 4).toFixed(1);
    return (
        <span className="text-[10px] font-bold" style={{ color: DUNBAR_GOLD }}>
            ⭐ {avg}
        </span>
    );
}

/** Master service card — used in all shelves */
function MasterCardComp({ card, mode }: { card: MasterCard; mode: DunbarMode }) {
    const navigate = useNavigate();
    const isTop5 = card.dunbarWeight === 2.0 && mode === 'My 220';

    return (
        <div
            onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate('/lead-form'); }}
            className="flex-shrink-0 bg-tg-secondary rounded-xl overflow-hidden active:scale-[0.97] transition-transform cursor-pointer"
            style={{
                width: 160,
                border: isTop5 ? `1.5px solid ${DUNBAR_GOLD}` : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isTop5 ? `0 0 14px rgba(255,215,0,0.15)` : 'none',
                scrollSnapAlign: 'start',
            }}
        >
            <div className="relative" style={{ height: 110 }}>
                <img src={card.image} alt={card.name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.82)' }} />
                {/* Safe dot */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', letterSpacing: '0.04em' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: card.isSafe ? '#22c55e' : '#eab308', flexShrink: 0 }} />
                    {card.isSafe ? 'SAFE' : 'CHECK'}
                </div>
                {/* Distance */}
                <div className="absolute bottom-2 right-2 text-[9px] font-bold text-white/60 bg-black/50 rounded px-1.5 py-0.5">
                    {card.distance}
                </div>
            </div>
            <div className="p-2.5 space-y-1">
                <div className="text-[12px] font-black leading-tight text-tg-primary truncate">{card.name}</div>
                <div className="text-[10px] text-tg-hint truncate">{card.service}</div>
                <AbcdBar abcd={card.abcd} />
            </div>
        </div>
    );
}

/** Event card — used in Hot Events shelf */
function EventCard({ event }: { event: typeof MOCK_EVENTS[0] }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate('/lead-form'); }}
            className="flex-shrink-0 bg-tg-secondary rounded-xl overflow-hidden active:scale-[0.97] transition-transform cursor-pointer"
            style={{ width: 200, border: '1px solid rgba(255,255,255,0.06)', scrollSnapAlign: 'start' }}
        >
            <div className="relative" style={{ height: 110 }}>
                <img src={event.image} alt={event.name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.75)' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-2.5"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)' }}>
                    <div className="text-[11px] font-black leading-tight text-white">{event.name}</div>
                    <div className="text-[9px] font-bold mt-0.5" style={{ color: DUNBAR_GOLD }}>{event.date}</div>
                </div>
            </div>
            <div className="px-2.5 py-2 flex items-center justify-between">
                <span className="text-[10px] text-tg-hint">from your 220</span>
                <span className="text-[10px] font-black" style={{ color: DUNBAR_GOLD }}>+{event.attendees} going</span>
            </div>
        </div>
    );
}

/** Horizontal shelf with title and scroll row */
function Shelf({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="px-4 text-sm font-black uppercase tracking-wider text-tg-primary">{title}</h2>
            <div
                className="flex gap-3 px-4 overflow-x-auto hide-scrollbar pb-1"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {children}
            </div>
        </section>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Discovery() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [ring, setRing] = useState<DunbarMode>('My 220');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const rings: DunbarMode[] = ['My 220', 'Friends of Friends', 'Global'];

    // Filter logic based on ring
    const filterByRing = (card: MasterCard): boolean => {
        if (ring === 'My 220') return card.dunbarWeight >= 1.0;
        if (ring === 'Friends of Friends') return card.dunbarWeight >= 0.5 && card.dunbarWeight < 2.0;
        return true; // Global
    };

    const top5Masters = MOCK_MASTERS.filter(m => m.dunbarWeight === 2.0 && filterByRing(m));
    const safeMasters = MOCK_MASTERS.filter(m => m.isSafe && filterByRing(m));
    const allFiltered = MOCK_MASTERS.filter(filterByRing);

    const categoryCounts: Record<string, number> = {
        'SOS': Math.max(1, allFiltered.filter(m => !m.isSafe).length),
        'Auto': allFiltered.filter(m => m.service.toLowerCase().includes('auto') || m.service.toLowerCase().includes('car')).length || 1,
        'Beauty': allFiltered.filter(m => m.service.toLowerCase().includes('spa') || m.service.toLowerCase().includes('hair')).length || 2,
        'Health': allFiltered.filter(m => m.service.toLowerCase().includes('health') || m.name.toLowerCase().includes('dr')).length || 1,
        'Events': MOCK_EVENTS.length,
        'Market': Math.floor(allFiltered.length / 2) + 1,
    };

    const QUICK_LINKS = [
        { id: 'SOS', label: 'SOS', emoji: '🚨', isSOS: true },
        { id: 'Auto', label: 'Auto', emoji: '🚘', isSOS: false },
        { id: 'Beauty', label: 'Beauty', emoji: '💆', isSOS: false },
        { id: 'Health', label: 'Health', emoji: '🩺', isSOS: false },
        { id: 'Events', label: 'Events', emoji: '🎉', isSOS: false },
        { id: 'Market', label: 'Market', emoji: '🛒', isSOS: false },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-dark)', paddingBottom: 96 }}>

            {/* ═══════════ BLOCK 1: STICKY HEADER ═══════════ */}
            <header className="sticky top-0 z-50 space-y-3 px-4 pt-3 pb-3"
                style={{ background: 'rgba(13,15,20,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

                {/* Location Row */}
                <div className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DUNBAR_GOLD} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-[13px] font-bold text-tg-primary">Nha Trang</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="text-tg-hint">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <div className="ml-auto flex items-center gap-2">
                        <button className="text-tg-hint active:text-tg-primary transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                                <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Omni-Search Bar */}
                <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                        <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find who my friends trust..."
                            className="w-full text-[13px] text-tg-primary placeholder:text-tg-hint outline-none rounded-xl"
                            style={{
                                height: 44,
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                paddingLeft: 38, paddingRight: 12,
                            }}
                        />
                    </div>
                    <button
                        className="flex items-center justify-center rounded-xl active:scale-90 transition-transform"
                        style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', flexShrink: 0 }}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={DUNBAR_GOLD} strokeWidth={2} strokeLinecap="round">
                            <path d="M4 21v-7m0-4V3m8 18V11m0-4V3m8 18v-5m0-4V3M2 14h4m4-9h4m4 9h4" />
                        </svg>
                    </button>
                </div>

                {/* ═══════════ BLOCK 2: DUNBAR SEGMENTED CONTROL ═══════════ */}
                <div className="flex rounded-xl p-1 gap-1"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {rings.map(r => {
                        const isActive = ring === r;
                        return (
                            <button
                                key={r}
                                onClick={() => { setRing(r); WebApp.HapticFeedback.impactOccurred('light'); }}
                                className="flex-1 text-[10px] font-black uppercase tracking-wide rounded-lg transition-all active:scale-95"
                                style={{
                                    height: 32,
                                    background: isActive ? DUNBAR_GOLD : 'transparent',
                                    color: isActive ? '#000' : 'rgba(255,255,255,0.45)',
                                    boxShadow: isActive ? `0 0 16px rgba(255,215,0,0.25)` : 'none',
                                    border: 'none',
                                }}
                            >
                                {r}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* ═══════════ BLOCK 3: QUICK LINKS ═══════════ */}
            <div className="flex gap-3 px-4 pt-5 overflow-x-auto hide-scrollbar pb-1">
                {QUICK_LINKS.map(cat => {
                    const count = categoryCounts[cat.id] ?? 0;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(prev => prev === cat.id ? null : cat.id); WebApp.HapticFeedback.impactOccurred('light'); }}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-90 transition-transform"
                        >
                            <div
                                className="flex items-center justify-center text-2xl rounded-full"
                                style={{
                                    width: 56, height: 56,
                                    background: isActive ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: cat.isSOS
                                        ? `2px solid ${isActive ? '#ef4444' : 'rgba(239,68,68,0.4)'}`
                                        : `1px solid ${isActive ? DUNBAR_GOLD : 'rgba(255,255,255,0.08)'}`,
                                    boxShadow: cat.isSOS ? '0 0 10px rgba(239,68,68,0.2)' : isActive ? `0 0 12px rgba(255,215,0,0.2)` : 'none',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {cat.emoji}
                            </div>
                            <span className="text-[9px] font-bold text-tg-hint">{cat.label}</span>
                            {count > 0 && (
                                <span className="text-[8px] font-black" style={{ color: cat.isSOS ? '#ef4444' : DUNBAR_GOLD, marginTop: -4 }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ═══════════ BLOCK 4: TRUST MAP WIDGET ═══════════ */}
            <div className="mx-4 mt-5">
                <div
                    className="relative rounded-xl overflow-hidden"
                    style={{ height: 140, background: 'rgba(18,22,32,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                    {/* Static map placeholder with gradient */}
                    <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,229,204,0.06), rgba(13,15,20,0.9))' }} />

                    {/* Grid overlay (map feel) */}
                    <svg className="absolute inset-0 opacity-10" width="100%" height="100%">
                        <defs>
                            <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(0,229,204,0.5)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Gold pins */}
                    {[
                        { x: '28%', y: '38%' }, { x: '55%', y: '55%' }, { x: '72%', y: '30%' },
                    ].map((pos, i) => (
                        <div key={i} className="absolute flex items-center justify-center text-[11px] font-black"
                            style={{
                                left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)',
                                width: 22, height: 22, borderRadius: '50% 50% 50% 0',
                                background: DUNBAR_GOLD, color: '#000',
                                boxShadow: `0 0 10px rgba(255,215,0,0.5)`,
                                rotate: '-45deg', fontSize: 9,
                            }}
                        />
                    ))}

                    {/* Text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between"
                        style={{ background: 'linear-gradient(to top, rgba(13,15,20,0.9) 0%, transparent 100%)' }}>
                        <span className="text-[12px] font-bold text-tg-primary">
                            <span style={{ color: DUNBAR_GOLD }}>{allFiltered.length}</span> trusted masters nearby
                        </span>
                        <button
                            onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate('/map'); }}
                            className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg active:scale-90 transition-transform"
                            style={{ background: 'rgba(255,215,0,0.15)', color: DUNBAR_GOLD, border: `1px solid rgba(255,215,0,0.3)` }}
                        >
                            Expand →
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════ BLOCK 5: SMART FEEDS ═══════════ */}
            <div className="mt-6 space-y-6">

                {/* Shelf 1 – Top 5 Choice */}
                {top5Masters.length > 0 && (
                    <Shelf title="⭐ Top 5 Choice">
                        {top5Masters.map(m => <MasterCardComp key={m.id} card={m} mode={ring} />)}
                    </Shelf>
                )}

                {/* Shelf 2 – Safe Business */}
                {safeMasters.length > 0 && (
                    <Shelf title="✅ Safe Business">
                        {safeMasters.map(m => <MasterCardComp key={m.id} card={m} mode={ring} />)}
                    </Shelf>
                )}

                {/* Shelf 3 – Hot Events */}
                <Shelf title="🔥 Hot Events">
                    {MOCK_EVENTS.map(e => <EventCard key={e.id} event={e} />)}
                </Shelf>

            </div>
        </div>
    );
}
