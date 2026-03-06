import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDunbarScore, RatingData } from '../utils/math';
import { createInvoice } from '../services/paymentService';
import { SemanticSearch } from '../services/SemanticSearch';
import ReviewFlow from '../components/ReviewFlow';
import WebApp from '@twa-dev/sdk';

// ─── Design Tokens (Using CSS Variables) ────────────────────────────────────
const NEON = 'var(--neon)';
const CARD_BG = 'var(--card-bg)';
const BG = 'var(--bg-dark)';

// ─── Category Data ───────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'restaurants', label: 'Restaurants', icon: CategoryRestaurantIcon },
    { id: 'cafes', label: 'Cafes', icon: CategoryCafeIcon },
    { id: 'shops', label: 'Shops', icon: CategoryShopIcon },
    { id: 'nightlife', label: 'Nightlife', icon: CategoryNightlifeIcon },
    { id: 'gyms', label: 'Gyms', icon: CategoryGymIcon },
    { id: 'art', label: 'Art', icon: CategoryArtIcon },
    { id: 'events', label: 'Events', icon: CategoryEventsIcon },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const TRUST_CARDS = [
    {
        id: 'p1',
        name: 'Aurora Dining',
        rating: 4.8,
        total: 5,
        distance: '1.2 km away',
        count: 15,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
        category: 'restaurants',
    },
    {
        id: 'p2',
        name: 'Neon Lounge',
        rating: 4.5,
        total: 5,
        distance: '0.8 km away',
        count: 15,
        image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80',
        category: 'nightlife',
    },
    {
        id: 'p3',
        name: 'Skyline Café',
        rating: 4.7,
        total: 5,
        distance: '2.1 km away',
        count: 15,
        image: 'https://images.unsplash.com/photo-1559925393-1d6d879e60e5?w=600&q=80',
        category: 'cafes',
    },
];

const NEARBY_CARDS = [
    {
        id: 'n1',
        name: 'The Brewloft',
        rating: 4.3,
        total: 5,
        distance: '0.4 km',
        count: 20,
        image: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80',
    },
    {
        id: 'n2',
        name: 'Urban Bites',
        rating: 4.1,
        total: 5,
        distance: '1.0 km',
        count: 20,
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    },
    {
        id: 'n3',
        name: 'Zen Garden',
        rating: 4.6,
        total: 5,
        distance: '3.2 km',
        count: 20,
        image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
    },
];

const DISCOVERY_CARDS = [
    {
        id: 'd1',
        name: 'Galerie Noire',
        rating: 4.9,
        total: 5,
        distance: '1.5 km',
        count: 10,
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    },
    {
        id: 'd2',
        name: 'Sky Gym Alpha',
        rating: 4.4,
        total: 5,
        distance: '0.9 km',
        count: 10,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    },
];

// ─── SVG Icon Components ─────────────────────────────────────────────────────
function CategoryRestaurantIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M3 2v7c0 1.66 1.34 3 3 3h0c1.66 0 3-1.34 3-3V2" />
            <line x1="6" y1="5" x2="6" y2="2" />
            <path d="M16 2v4a4 4 0 00-4 4v0a4 4 0 004 4h0V2" />
            <line x1="3" y1="22" x2="21" y2="22" />
            <line x1="3" y1="11" x2="21" y2="11" />
        </svg>
    );
}
function CategoryCafeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M18 8h1a4 4 0 010 8h-1" />
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    );
}
function CategoryShopIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
        </svg>
    );
}
function CategoryNightlifeIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M8 22V12l-6-6h20L16 12v10" />
            <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
    );
}
function CategoryGymIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M6.5 6.5h11M6.5 17.5h11" />
            <path d="M3 9.5v5M21 9.5v5M6.5 6.5v11M17.5 6.5v11" />
        </svg>
    );
}
function CategoryArtIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}
function CategoryEventsIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

// ─── Star Row ────────────────────────────────────────────────────────────────
function Stars({ rating, total }: { rating: number; total: number }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {Array.from({ length: total }).map((_, i) => {
                const filled = i < Math.floor(rating);
                const half = !filled && i < rating;
                return (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={filled ? NEON : half ? 'url(#half)' : 'none'} stroke={NEON} strokeWidth={1.5}>
                        {half && (
                            <defs>
                                <linearGradient id="half">
                                    <stop offset="50%" stopColor={NEON} />
                                    <stop offset="50%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        )}
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            })}
            <span style={{ color: NEON, fontSize: 12, fontWeight: 700, marginLeft: 4 }}>{rating}/{total}</span>
        </span>
    );
}

// ─── Place Card (wide, for Circles Trust) ───────────────────────────────────
function PlaceCardWide({ card, active }: { card: typeof TRUST_CARDS[0]; active: boolean }) {
    return (
        <div
            style={{
                position: 'relative',
                width: active ? 260 : 210,
                height: active ? 200 : 170,
                borderRadius: 18,
                overflow: 'hidden',
                border: active ? `2px solid ${NEON}` : '2px solid rgba(255,255,255,0.1)',
                boxShadow: active ? `0 0 24px ${NEON}55, 0 8px 32px rgba(0,0,0,0.8)` : '0 4px 20px rgba(0,0,0,0.6)',
                flexShrink: 0,
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
            }}
        >
            <img
                src={card.image}
                alt={card.name}
                style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: active ? 'brightness(0.85)' : 'brightness(0.5) saturate(0.6)',
                    transition: 'filter 0.35s ease',
                }}
            />
            {/* Counter badge */}
            <div style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, padding: '2px 8px',
                color: '#fff', fontSize: 11, fontWeight: 700,
            }}>
                1/{card.count}
            </div>
            {/* Info overlay – only on active */}
            {active && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
                    padding: '14px 14px 14px',
                }}>
                    <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{card.name}</div>
                    <div style={{ marginTop: 4 }}><Stars rating={card.rating} total={card.total} /></div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 }}>{card.distance}</div>
                </div>
            )}
            {/* Blurred name for non-active */}
            {!active && (
                <div style={{
                    position: 'absolute', bottom: 10, left: 10,
                    color: '#fff', fontSize: 14, fontWeight: 700,
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                }}>
                    {card.name.slice(0, 4)}…
                </div>
            )}
        </div>
    );
}

// ─── Place Card (compact, for Popular / Discovery rows) ──────────────────────
function PlaceCardCompact({ card }: { card: typeof NEARBY_CARDS[0] }) {
    return (
        <div style={{
            position: 'relative', width: 180, height: 120,
            borderRadius: 14, overflow: 'hidden',
            border: '1.5px solid rgba(255,255,255,0.12)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            flexShrink: 0, cursor: 'pointer',
        }}>
            <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }} />
            <div style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6, padding: '1px 6px',
                color: '#fff', fontSize: 10, fontWeight: 700,
            }}>
                1/{card.count}
            </div>
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                padding: '8px 10px 8px',
            }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{card.name}</div>
            </div>
        </div>
    );
}

// ─── Deleted local bottom nav components ───

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Discovery() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeTrustIdx, setActiveTrustIdx] = useState(0);
    const [reviewMaster, setReviewMaster] = useState<{ id: string; name: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleCategoryTap = (id: string) => {
        try { WebApp.HapticFeedback.impactOccurred('light'); } catch (e) { }
        setActiveCategory(prev => (prev === id ? null : id));
    };

    const handleTrustScroll = (dir: 1 | -1) => {
        setActiveTrustIdx(prev => Math.max(0, Math.min(TRUST_CARDS.length - 1, prev + dir)));
    };

    // Touch swipe for trust carousel
    const trustTouchStart = useRef(0);
    const onTrustTouchStart = (e: React.TouchEvent) => { trustTouchStart.current = e.touches[0].clientX; };
    const onTrustTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientX - trustTouchStart.current;
        if (Math.abs(delta) > 50) handleTrustScroll(delta < 0 ? 1 : -1);
    };

    return (
        <div className="disc-root" style={{ paddingBottom: 20 }}>

            {/* Review Flow Overlay */}
            {reviewMaster && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
                }}>
                    <ReviewFlow
                        masterId={reviewMaster.id}
                        masterName={reviewMaster.name}
                        onSubmit={() => setReviewMaster(null)}
                    />
                </div>
            )}

            {/* ── Header ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(10,14,22,0.96)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0,229,204,0.12)',
                padding: '14px 16px 10px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', color: NEON, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </button>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>Discovery</h1>
                    <button
                        style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `linear-gradient(135deg, #2a3050, #1a2240)`,
                            border: `1.5px solid ${NEON}55`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                    <svg
                        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="disc-search"
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', height: 44,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1.5px solid rgba(255,255,255,0.1)',
                            borderRadius: 14,
                            paddingLeft: 42, paddingRight: 14,
                            color: '#fff', fontSize: 14,
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                    />
                </div>
            </header>

            {/* ── Category Icons Row ── */}
            <div style={{ padding: '16px 0 8px', overflowX: 'auto' }} className="disc-scroll-row">
                <div style={{ display: 'flex', gap: 10, padding: '0 16px', flexShrink: 0 }}>
                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                className={`disc-cat-btn${isActive ? ' active' : ''}`}
                                onClick={() => handleCategoryTap(cat.id)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1.5px solid rgba(255,255,255,0.12)',
                                    borderRadius: 14,
                                    minWidth: 64, cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <span style={{ color: isActive ? NEON : 'rgba(255,255,255,0.75)' }}>
                                    <Icon />
                                </span>
                                <span style={{
                                    fontSize: 9.5, fontWeight: 700,
                                    color: isActive ? NEON : 'rgba(255,255,255,0.5)',
                                    letterSpacing: '0.02em',
                                    textAlign: 'center', lineHeight: 1.2,
                                }}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Circles Trust ── */}
            <section style={{ padding: '18px 0 8px' }}>
                <h2 className="disc-neon-pulse disc-neon-text" style={{
                    margin: '0 0 14px 16px', fontSize: 22, fontWeight: 800,
                    letterSpacing: '-0.02em',
                }}>
                    Circles Trust
                </h2>

                {/* Trust Carousel */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 16, overflowX: 'hidden' }}
                    onTouchStart={onTrustTouchStart}
                    onTouchEnd={onTrustTouchEnd}
                >
                    {TRUST_CARDS.map((card, idx) => {
                        const diff = idx - activeTrustIdx;
                        const visible = Math.abs(diff) <= 1;
                        return (
                            <div
                                key={card.id}
                                style={{
                                    display: visible ? 'block' : 'none',
                                    transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                                }}
                            >
                                <PlaceCardWide card={card} active={idx === activeTrustIdx} />
                            </div>
                        );
                    })}
                </div>

                {/* Dot indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                    {TRUST_CARDS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTrustIdx(i)}
                            style={{
                                width: i === activeTrustIdx ? 18 : 6, height: 6,
                                borderRadius: 3, border: 'none', cursor: 'pointer',
                                background: i === activeTrustIdx ? NEON : 'rgba(255,255,255,0.25)',
                                transition: 'all 0.3s',
                            }}
                        />
                    ))}
                </div>
            </section>

            {/* ── Popular Nearby ── */}
            <section style={{ padding: '22px 0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 12 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.02em' }}>
                        Popular Nearby
                    </h2>
                    <span style={{ fontSize: 12, color: NEON, fontWeight: 600, cursor: 'pointer' }}>See all →</span>
                </div>
                <div className="disc-scroll-row" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    {NEARBY_CARDS.map(card => (
                        <div key={card.id} className="disc-section-card">
                            <PlaceCardCompact card={card} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── New Discoveries ── */}
            <section style={{ padding: '22px 0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 12 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.82)', letterSpacing: '-0.02em' }}>
                        New Discoveries
                    </h2>
                    <span style={{ fontSize: 12, color: NEON, fontWeight: 600, cursor: 'pointer' }}>See all →</span>
                </div>
                <div className="disc-scroll-row" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    {DISCOVERY_CARDS.map(card => (
                        <div key={card.id} className="disc-section-card">
                            <PlaceCardCompact card={card} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Nav removed (handled by Layout) */}
        </div>
    );
}
