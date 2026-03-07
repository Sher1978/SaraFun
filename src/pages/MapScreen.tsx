import React, { useState, useEffect } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker } from '@vis.gl/react-google-maps';
import WebApp from '@twa-dev/sdk';

// ─── Design tokens ─────────────────────────────────────────────────────────
const NEON = '#00E5CC';
const GOLD = '#FFD700';
const GREY_NEUTRAL = '#8896A4';

// ─── Map styles ─────────────────────────────────────────────────────────────
const HIDE_POI = [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit.station', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

const MapStyleDark = [
    ...HIDE_POI,
    { elementType: 'geometry', stylers: [{ color: '#0d111a' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#4a5a7a' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d111a' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#161e2e' }] },
    { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#3a4a6b' }] },
    { featureType: 'landscape', stylers: [{ color: '#0d111a' }] },
    { featureType: 'landscape.man_made', stylers: [{ color: '#111827' }] },
    { featureType: 'landscape.natural', stylers: [{ color: '#0a0f19' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2236' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d111a' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#2a3a5a' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1e2a40' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e2d48' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#00E5CC33' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#00C4AD' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#1a2a48' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#05090f' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0a1830' }] },
];

const MapStyleLight = [
    ...HIDE_POI,
    { elementType: 'geometry', stylers: [{ color: '#edf2f7' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#5a6a88' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#edf2f7' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c8d5e8' }] },
    { featureType: 'landscape', stylers: [{ color: '#e8eff8' }] },
    { featureType: 'landscape.man_made', stylers: [{ color: '#dde8f5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#c8d5e8' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a8ba8' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f5f9ff' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d0e8f5' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#00C4AD' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#007a6a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#9ec8e0' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a88a8' }] },
];

// ─── SVG Icons (Google Maps–inspired, minimal stroke) ──────────────────────
const SVG_ICONS: Record<string, React.ReactNode> = {
    Restaurants: (
        // Fork left + knife right (Google Maps dining icon)
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 00-5 5v6c0 .55.45 1 1 1h3M21 15a2 2 0 01-2 2v5" />
        </svg>
    ),
    Cafes: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1" />
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    ),
    Shops: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
        </svg>
    ),
    Nightlife: (
        // Martini glass — Google Maps bar icon
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 22h8M12 11v11M5 2l7 9 7-9H5z" />
        </svg>
    ),
    Gyms: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 10h2v4H2zM20 10h2v4h-2zM6 8V6a2 2 0 012-2h8a2 2 0 012 2v2M6 16v2a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
    ),
    Art: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
        </svg>
    ),
    Events: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
    ),
};

// ─── Types ─────────────────────────────────────────────────────────────────
type TrustTier = 'gold' | 'teal' | 'grey';
const TIER_COLOR: Record<TrustTier, string> = { gold: GOLD, teal: NEON, grey: GREY_NEUTRAL };

interface MockPin {
    id: string; category: string; name: string; service: string;
    rating: number; distance: string; trust: TrustTier; lat: number; lng: number; image: string;
}

// ─── Mock data (Nha Trang area) ─────────────────────────────────────────────
const MOCK_PINS: MockPin[] = [
    { id: 'r1', category: 'Restaurants', name: 'Aurora Dining', service: 'Fine Dining', rating: 4.9, distance: '0.3 km', trust: 'gold', lat: 12.2415, lng: 109.1943, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80' },
    { id: 'r2', category: 'Restaurants', name: 'Sea Breeze', service: 'Seafood', rating: 4.6, distance: '0.8 km', trust: 'teal', lat: 12.2394, lng: 109.1972, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
    { id: 'r3', category: 'Restaurants', name: 'Pho Garden', service: 'Vietnamese', rating: 4.2, distance: '1.2 km', trust: 'grey', lat: 12.2378, lng: 109.1921, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
    { id: 'c1', category: 'Cafes', name: 'Neon Café', service: 'Coffee & Co-work', rating: 4.8, distance: '0.2 km', trust: 'gold', lat: 12.2432, lng: 109.1958, image: 'https://images.unsplash.com/photo-1559925393-1d6d879e60e5?w=400&q=80' },
    { id: 'c2', category: 'Cafes', name: 'Beach Brews', service: 'Specialty Coffee', rating: 4.5, distance: '0.9 km', trust: 'teal', lat: 12.2401, lng: 109.1985, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80' },
    { id: 'c3', category: 'Cafes', name: 'Roast & Roll', service: 'Pastries', rating: 4.0, distance: '1.5 km', trust: 'grey', lat: 12.2360, lng: 109.1935, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
    { id: 's1', category: 'Shops', name: 'Vi Silk', service: 'Silk & Fashion', rating: 4.7, distance: '0.5 km', trust: 'teal', lat: 12.2427, lng: 109.1930, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' },
    { id: 's2', category: 'Shops', name: 'Tech Hub', service: 'Electronics', rating: 3.9, distance: '1.1 km', trust: 'grey', lat: 12.2388, lng: 109.1963, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80' },
    { id: 'n1', category: 'Nightlife', name: 'Skyline Club', service: 'Rooftop Bar', rating: 4.8, distance: '0.7 km', trust: 'gold', lat: 12.2445, lng: 109.1978, image: 'https://images.unsplash.com/photo-1514525253361-bee243870d12?w=400&q=80' },
    { id: 'n2', category: 'Nightlife', name: 'Neon Lounge', service: 'Cocktail Bar', rating: 4.4, distance: '0.4 km', trust: 'teal', lat: 12.2418, lng: 109.1910, image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80' },
    { id: 'n3', category: 'Nightlife', name: 'Club 99', service: 'Nightclub', rating: 3.8, distance: '1.3 km', trust: 'grey', lat: 12.2367, lng: 109.1996, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
    { id: 'g1', category: 'Gyms', name: 'Alpha Fit', service: 'CrossFit & MMA', rating: 4.9, distance: '0.6 km', trust: 'gold', lat: 12.2439, lng: 109.1948, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
    { id: 'g2', category: 'Gyms', name: 'Zen Studio', service: 'Yoga & Pilates', rating: 4.5, distance: '1.0 km', trust: 'teal', lat: 12.2398, lng: 109.1912, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80' },
    { id: 'a1', category: 'Art', name: 'The Gallery', service: 'Contemporary Art', rating: 4.7, distance: '0.8 km', trust: 'gold', lat: 12.2422, lng: 109.1967, image: 'https://images.unsplash.com/photo-1545033131-485ea67fd7c3?w=400&q=80' },
    { id: 'a2', category: 'Art', name: 'Street Canvas', service: 'Urban Art Tours', rating: 4.3, distance: '1.2 km', trust: 'teal', lat: 12.2380, lng: 109.1950, image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },
    { id: 'e1', category: 'Events', name: 'Crypto Night', service: 'Networking · Mar 8', rating: 4.9, distance: '0.3 km', trust: 'gold', lat: 12.2450, lng: 109.1937, image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80' },
    { id: 'e2', category: 'Events', name: 'Rooftop Social', service: 'Business · Mar 9', rating: 4.6, distance: '0.7 km', trust: 'teal', lat: 12.2408, lng: 109.1975, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80' },
    { id: 'e3', category: 'Events', name: 'Beach Cleanup', service: 'Community · Mar 10', rating: 4.1, distance: '1.5 km', trust: 'grey', lat: 12.2370, lng: 109.1905, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
];

const CATEGORIES = ['All', 'Restaurants', 'Cafes', 'Shops', 'Nightlife', 'Gyms', 'Art', 'Events'];

// ─── Google Maps–style teardrop pin ─────────────────────────────────────────
// Size: 40×52px — comparable to a real Google Maps pin (slightly bigger for touch targets)
function BusinessPin({ pin, isSelected, onClick }: { pin: MockPin; isSelected: boolean; onClick: () => void }) {
    const color = TIER_COLOR[pin.trust];
    const icon = SVG_ICONS[pin.category];
    // Dark-on-gold for readability, white-on-teal/grey
    const iconColorDefault = 'rgba(255,255,255,0.60)';
    const iconColorSelected = '#ffffff';

    return (
        <AdvancedMarker position={{ lat: pin.lat, lng: pin.lng }} onClick={onClick}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transform: isSelected ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1)', filter: isSelected ? `drop-shadow(0 0 8px ${color})` : 'none' }}>

                {/* Teardrop SVG body */}
                <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
                    {/* Drop shape */}
                    <path
                        d="M20 2C11.16 2 4 9.16 4 18C4 29.5 20 48 20 48C20 48 36 29.5 36 18C36 9.16 28.84 2 20 2Z"
                        fill={color}
                        stroke={isSelected ? '#ffffff' : `${color}cc`}
                        strokeWidth={isSelected ? 2 : 1.5}
                    />
                    {/* Shine dot */}
                    <circle cx="14" cy="12" r="3.5" fill="rgba(255,255,255,0.20)" />
                    {/* Icon area — centered in circle portion (top ~36px) */}
                    <foreignObject x="8" y="8" width="24" height="24">
                        <div style={{
                            width: 24, height: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSelected ? iconColorSelected : iconColorDefault,
                        }}>
                            {icon}
                        </div>
                    </foreignObject>
                </svg>

                {/* Gold tier pulse */}
                {pin.trust === 'gold' && !isSelected && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 10,
                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                        background: `${color}18`,
                        animation: 'ping 2s cubic-bezier(0,0,.2,1) infinite',
                        pointerEvents: 'none',
                    }} />
                )}
            </div>
        </AdvancedMarker>
    );
}

// ─── Star rating ─────────────────────────────────────────────────────────────
function Stars({ rating, color }: { rating: number; color: string }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                    fill={i < Math.round(rating) ? color : 'none'}
                    stroke={color} strokeWidth={1.5}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ color, fontSize: 11, fontWeight: 800, marginLeft: 3 }}>{rating}</span>
        </span>
    );
}

// ─── Glassmorphism popup card ─────────────────────────────────────────────────
function PinCard({ pin, onClose }: { pin: MockPin; onClose: () => void }) {
    const color = TIER_COLOR[pin.trust];

    return (
        <div className="absolute bottom-6 left-4 right-4 z-30" style={{ animation: 'slideUp 0.25s ease-out' }}>
            <div style={{
                background: 'rgba(8,11,20,0.92)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: `1.5px solid ${color}55`,
                borderRadius: 18,
                // Glow effect on selected card
                boxShadow: `0 8px 40px rgba(0,0,0,0.65), 0 0 36px ${color}33, 0 0 12px ${color}22, inset 0 0 0 1px ${color}18`,
                overflow: 'hidden',
            }}>
                {/* Hero */}
                <div style={{ position: 'relative', height: 104 }}>
                    <img src={pin.image} alt={pin.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65) saturate(0.75)' }} />
                    {/* gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${color}22 100%)` }} />
                    {/* Category badge */}
                    <div style={{
                        position: 'absolute', top: 9, left: 10,
                        background: `${color}22`, backdropFilter: 'blur(10px)',
                        border: `1px solid ${color}55`, borderRadius: 8,
                        padding: '3px 10px', color: color, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em'
                    }}>{pin.category}</div>
                    {/* Trust badge */}
                    <div style={{
                        position: 'absolute', top: 9, right: 36,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                        border: `1px solid ${color}44`, borderRadius: 8,
                        padding: '3px 9px', color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>{pin.trust === 'gold' ? '⭐ Trusted' : pin.trust === 'teal' ? '✓ Verified' : 'Global'}</div>
                    {/* Close */}
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 9, right: 9,
                        width: 23, height: 23, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                    }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '12px 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pin.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 6 }}>{pin.service}</div>
                        <Stars rating={pin.rating} color={color} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            {pin.distance}
                        </div>
                        <button style={{
                            padding: '7px 16px', borderRadius: 9, border: 'none',
                            background: color, color: pin.trust === 'gold' ? '#000' : '#fff',
                            fontSize: 11, fontWeight: 900, cursor: 'pointer',
                            letterSpacing: '0.04em', textTransform: 'uppercase',
                            boxShadow: `0 0 14px ${color}55`,
                        }}>
                            Book →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Collapsible rating filter button ────────────────────────────────────────
const RATING_STEPS = [0, 3, 4, 4.5, 4.8];
const RATING_LABELS = ['All', '3+', '4+', '4.5+', '4.8+'];

function RatingButton({ min, onChange }: { min: number; onChange: (v: number) => void }) {
    const [open, setOpen] = useState(false);
    const label = min === 0 ? '★ Rating' : `★ ${min}+`;

    return (
        <div style={{ position: 'relative' }}>
            {/* Collapsed pill button */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    padding: '7px 13px', borderRadius: 20,
                    background: open || min > 0 ? NEON : 'rgba(10,13,22,0.82)',
                    backdropFilter: 'blur(14px)',
                    border: `1.5px solid ${open || min > 0 ? NEON : 'rgba(0,229,204,0.2)'}`,
                    color: open || min > 0 ? '#000' : 'rgba(255,255,255,0.65)',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    boxShadow: open || min > 0 ? `0 0 14px ${NEON}55` : 'none',
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
                <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 9 }}>{open ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown step panel */}
            {open && (
                <div style={{
                    position: 'absolute', top: 42, left: 0,
                    background: 'rgba(8,11,20,0.94)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid rgba(0,229,204,0.22)`,
                    borderRadius: 14, padding: '10px 10px',
                    display: 'flex', flexDirection: 'column', gap: 5,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${NEON}22`,
                    zIndex: 50, minWidth: 100,
                    animation: 'fadeDown 0.15s ease-out',
                }}>
                    {RATING_STEPS.map((step, i) => {
                        const isActive = min === step;
                        return (
                            <button key={step}
                                onClick={() => { onChange(step); setOpen(false); WebApp.HapticFeedback.impactOccurred('light'); }}
                                style={{
                                    padding: '7px 14px', borderRadius: 9, border: 'none',
                                    background: isActive ? NEON : 'rgba(255,255,255,0.05)',
                                    color: isActive ? '#000' : 'rgba(255,255,255,0.55)',
                                    fontSize: 12, fontWeight: 800, cursor: 'pointer',
                                    textAlign: 'left',
                                    boxShadow: isActive ? `0 0 10px ${NEON}55` : 'none',
                                    transition: 'all 0.14s',
                                }}>
                                {RATING_LABELS[i]}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Tier legend ─────────────────────────────────────────────────────────────
function TierLegend() {
    return (
        <div style={{
            background: 'rgba(8,11,20,0.82)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(0,229,204,0.18)', borderRadius: 12,
            padding: '7px 11px', display: 'flex', flexDirection: 'column', gap: 5,
        }}>
            {(['gold', 'teal', 'grey'] as const).map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_COLOR[t], boxShadow: `0 0 5px ${TIER_COLOR[t]}` }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.48)', textTransform: 'capitalize' }}>
                        {t === 'gold' ? 'Trusted' : t === 'teal' ? 'Verified' : 'Global'}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MapScreen() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [minRating, setMinRating] = useState(0);
    const [selectedPin, setSelectedPin] = useState<MockPin | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [center, setCenter] = useState({ lat: 12.240, lng: 109.195 });
    const [zoom, setZoom] = useState(14);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const update = () => setIsDark((WebApp.colorScheme || 'dark') === 'dark');
        update();
        WebApp.onEvent('themeChanged', update);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                setUserLocation({ lat: coords.latitude, lng: coords.longitude });
                setCenter({ lat: coords.latitude, lng: coords.longitude });
            });
        }
        return () => WebApp.offEvent('themeChanged', update);
    }, []);

    const filteredPins = MOCK_PINS.filter(p => {
        const catOk = activeCategory === 'All' || p.category === activeCategory;
        const ratingOk = p.rating >= (minRating || 0);
        return catOk && ratingOk;
    });

    const onCameraChanged = (ev: MapCameraChangedEvent) => {
        setCenter(ev.detail.center);
        setZoom(ev.detail.zoom);
    };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <style>{`
                @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeDown { from { transform: translateY(-6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes ping { 0%,100% { transform: scale(1); opacity: .6; } 50% { transform: scale(1.6); opacity: 0; } }
            `}</style>

            <div className="relative w-full h-[calc(100vh-64px)]" style={{ background: '#0d111a' }}>

                {/* ── Top bar: category chips + rating filter ── */}
                <div className="absolute top-4 w-full z-20 px-4 flex gap-2 items-center overflow-x-auto hide-scrollbar pointer-events-auto">
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <button key={cat}
                                onClick={() => { setActiveCategory(cat); setSelectedPin(null); WebApp.HapticFeedback.impactOccurred('light'); }}
                                className="flex-shrink-0 active:scale-95 transition-all"
                                style={{
                                    padding: '7px 14px', borderRadius: 20,
                                    background: isActive ? NEON : 'rgba(8,11,20,0.82)',
                                    backdropFilter: 'blur(14px)',
                                    border: `1.5px solid ${isActive ? NEON : 'rgba(0,229,204,0.2)'}`,
                                    color: isActive ? '#000' : 'rgba(255,255,255,0.65)',
                                    fontSize: 12, fontWeight: 800,
                                    boxShadow: isActive ? `0 0 14px ${NEON}55` : 'none',
                                    whiteSpace: 'nowrap',
                                }}>
                                {cat}
                            </button>
                        );
                    })}
                    {/* Separator */}
                    <div style={{ width: 1, height: 20, background: 'rgba(0,229,204,0.2)', flexShrink: 0 }} />
                    {/* Rating button */}
                    <div className="flex-shrink-0">
                        <RatingButton min={minRating} onChange={setMinRating} />
                    </div>
                </div>

                {/* ── Legend (top-right, below chips) ── */}
                <div className="absolute right-3 z-20" style={{ top: 68 }}>
                    <TierLegend />
                </div>

                {/* ── Map ── */}
                <div className="absolute inset-0">
                    <Map
                        center={center} zoom={zoom}
                        mapId="DEMO_MAP_ID"
                        gestureHandling="greedy"
                        disableDefaultUI={true}
                        styles={isDark ? MapStyleDark : MapStyleLight}
                        onCameraChanged={onCameraChanged}
                        onClick={() => setSelectedPin(null)}
                    >
                        {/* User location dot */}
                        {userLocation && (
                            <AdvancedMarker position={userLocation}>
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute rounded-full" style={{ width: 28, height: 28, background: `${NEON}20`, border: `1px solid ${NEON}50`, animation: 'ping 2s cubic-bezier(0,0,.2,1) infinite' }} />
                                    <div style={{ width: 13, height: 13, borderRadius: '50%', background: NEON, border: '3px solid #fff', boxShadow: `0 0 14px ${NEON}, 0 2px 6px rgba(0,0,0,0.5)` }} />
                                </div>
                            </AdvancedMarker>
                        )}

                        {/* Business pins */}
                        {filteredPins.map(pin => (
                            <BusinessPin key={pin.id} pin={pin}
                                isSelected={selectedPin?.id === pin.id}
                                onClick={() => {
                                    setSelectedPin(prev => prev?.id === pin.id ? null : pin);
                                    WebApp.HapticFeedback.impactOccurred('light');
                                }} />
                        ))}
                    </Map>
                </div>

                {/* ── Popup card ── */}
                {selectedPin && (
                    <PinCard pin={selectedPin} onClose={() => setSelectedPin(null)} />
                )}
            </div>
        </APIProvider>
    );
}
