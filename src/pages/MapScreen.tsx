import React, { useState, useEffect, useMemo } from 'react';
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 00-5 5v6c0 .55.45 1 1 1h3M21 15a2 2 0 01-2 2v5" />
        </svg>
    ),
    Cafes: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1" />
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    ),
    Shops: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
        </svg>
    ),
    Nightlife: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 22h8M12 11v11M5 2l7 9 7-9H5z" />
        </svg>
    ),
    Gyms: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 10h2v4H2zM20 10h2v4h-2zM6 8V6a2 2 0 012-2h8a2 2 0 012 2v2M6 16v2a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
    ),
    Art: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
        </svg>
    ),
    Events: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
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

// ─── Mock data ──────────────────────────────────────────────────────────────
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

// ─── Clustering ──────────────────────────────────────────────────────────────
interface Cluster { lat: number; lng: number; pins: MockPin[]; }

function clusterPins(pins: MockPin[], zoom: number): Cluster[] {
    // Higher zoom → smaller merge radius. Below zoom 15 we cluster; at 17+ no clustering.
    if (zoom >= 17 || pins.length <= 1) return pins.map(p => ({ lat: p.lat, lng: p.lng, pins: [p] }));

    const gridSize = 0.003 / Math.pow(2, Math.max(0, zoom - 13));
    const used = new Set<number>();
    const clusters: Cluster[] = [];

    for (let i = 0; i < pins.length; i++) {
        if (used.has(i)) continue;
        const group: MockPin[] = [pins[i]];
        used.add(i);
        for (let j = i + 1; j < pins.length; j++) {
            if (used.has(j)) continue;
            const dLat = Math.abs(pins[i].lat - pins[j].lat);
            const dLng = Math.abs(pins[i].lng - pins[j].lng);
            if (dLat < gridSize && dLng < gridSize) {
                group.push(pins[j]);
                used.add(j);
            }
        }
        const avgLat = group.reduce((s, p) => s + p.lat, 0) / group.length;
        const avgLng = group.reduce((s, p) => s + p.lng, 0) / group.length;
        clusters.push({ lat: avgLat, lng: avgLng, pins: group });
    }
    return clusters;
}

// ─── Cluster pin (circle with +XX count) ─────────────────────────────────────
function ClusterPin({ cluster, onClick }: { cluster: Cluster; onClick: () => void }) {
    const count = cluster.pins.length;
    // Use the most "important" trust tier in the cluster for color
    const hasTrust = (t: TrustTier) => cluster.pins.some(p => p.trust === t);
    const color = hasTrust('gold') ? GOLD : hasTrust('teal') ? NEON : GREY_NEUTRAL;

    return (
        <AdvancedMarker position={{ lat: cluster.lat, lng: cluster.lng }} onClick={onClick}>
            <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(248,250,255,0.95)',
                border: `2.5px solid ${color}`,
                boxShadow: `0 2px 8px rgba(0,0,0,0.35), 0 0 12px ${color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
            }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: color, letterSpacing: '-0.03em' }}>
                    +{count}
                </span>
            </div>
        </AdvancedMarker>
    );
}

// ─── Business pin (Google Maps-style, short stem, big circle) ────────────────
// Body: soft-white (#F2F5FA), accent circle inside is maxed out.
// Selected: body fills accent color, inner circle becomes white, icon becomes white, glow added.
// SVG viewBox 30×36: stubby teardrop shape with r=13 circle occupying almost all of it.
function BusinessPin({ pin, isSelected, onClick }: { pin: MockPin; isSelected: boolean; onClick: () => void }) {
    const color = TIER_COLOR[pin.trust];
    const icon = SVG_ICONS[pin.category];

    const bodyFill = isSelected ? color : '#F2F5FA';
    const bodyStroke = isSelected ? color : '#D0D8E6';
    const circleFill = isSelected ? '#ffffff' : color;
    const iconColor = isSelected ? color : 'rgba(255,255,255,0.92)';

    return (
        <AdvancedMarker position={{ lat: pin.lat, lng: pin.lng }} onClick={onClick}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.15) translateY(-3px)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(.34,1.56,.64,1), filter 0.2s',
                filter: isSelected
                    ? `drop-shadow(0 0 8px ${color}) drop-shadow(0 3px 6px rgba(0,0,0,0.4))`
                    : 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
            }}>
                {/* Pin shape: 30×36, short stubby teardrop */}
                <svg width="30" height="36" viewBox="0 0 30 36" fill="none">
                    {/* Teardrop: large circle (r=13) with short point */}
                    <path
                        d="M15 1C7.27 1 1 7.27 1 15C1 23.5 15 35 15 35C15 35 29 23.5 29 15C29 7.27 22.73 1 15 1Z"
                        fill={bodyFill}
                        stroke={bodyStroke}
                        strokeWidth={1.2}
                    />
                    {/* Inner accent circle — large, touching pin edges */}
                    <circle cx="15" cy="15" r="11" fill={circleFill} />
                    {/* Icon */}
                    <foreignObject x="3" y="3" width="24" height="24">
                        <div style={{
                            width: 24, height: 24,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: iconColor,
                        }}>
                            {icon}
                        </div>
                    </foreignObject>
                </svg>

                {/* Gold idle pulse */}
                {pin.trust === 'gold' && !isSelected && (
                    <div style={{
                        position: 'absolute', top: -3, left: -3, right: -3, bottom: 6,
                        borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
                        background: `${color}12`,
                        animation: 'ping 2.4s cubic-bezier(0,0,.2,1) infinite',
                        pointerEvents: 'none',
                    }} />
                )}
            </div>
        </AdvancedMarker>
    );
}

// ─── Star rating for cards ───────────────────────────────────────────────────
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
                boxShadow: `0 8px 40px rgba(0,0,0,0.65), 0 0 36px ${color}33, 0 0 12px ${color}22, inset 0 0 0 1px ${color}18`,
                overflow: 'hidden',
            }}>
                {/* Hero */}
                <div style={{ position: 'relative', height: 104 }}>
                    <img src={pin.image} alt={pin.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65) saturate(0.75)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${color}22 100%)` }} />
                    <div style={{
                        position: 'absolute', top: 9, left: 10,
                        background: `${color}22`, backdropFilter: 'blur(10px)',
                        border: `1px solid ${color}55`, borderRadius: 8,
                        padding: '3px 10px', color: color, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em'
                    }}>{pin.category}</div>
                    <div style={{
                        position: 'absolute', top: 9, right: 36,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                        border: `1px solid ${color}44`, borderRadius: 8,
                        padding: '3px 9px', color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>{pin.trust === 'gold' ? '⭐ Trusted' : pin.trust === 'teal' ? '✓ Verified' : 'Global'}</div>
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

// ─── Side panel (legend + star filter) ───────────────────────────────────────
function SidePanel({ minRating, onChange }: { minRating: number; onChange: (v: number) => void }) {
    return (
        <div style={{
            background: 'rgba(8,11,20,0.82)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(0,229,204,0.18)', borderRadius: 14,
            padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
            {(['gold', 'teal', 'grey'] as const).map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_COLOR[t], boxShadow: `0 0 5px ${TIER_COLOR[t]}` }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.48)' }}>
                        {t === 'gold' ? 'Trusted' : t === 'teal' ? 'Verified' : 'Global'}
                    </span>
                </div>
            ))}
            <div style={{ height: 1, background: 'rgba(0,229,204,0.15)', margin: '0 -2px' }} />
            <div>
                <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Min ★</div>
                <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(star => {
                        const filled = star <= minRating;
                        return (
                            <button key={star}
                                onClick={() => { onChange(star === minRating ? 0 : star); WebApp.HapticFeedback.impactOccurred('light'); }}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 1 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24"
                                    fill={filled ? GOLD : 'none'}
                                    stroke={filled ? GOLD : 'rgba(255,255,255,0.25)'}
                                    strokeWidth={1.8}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </button>
                        );
                    })}
                </div>
            </div>
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
        const ratingOk = minRating === 0 || p.rating >= minRating;
        return catOk && ratingOk;
    });

    // Cluster pins based on zoom
    const clusters = useMemo(() => clusterPins(filteredPins, zoom), [filteredPins, zoom]);

    const onCameraChanged = (ev: MapCameraChangedEvent) => {
        setCenter(ev.detail.center);
        setZoom(ev.detail.zoom);
    };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <style>{`
                @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes ping { 0%,100% { transform: scale(1); opacity: .6; } 50% { transform: scale(1.6); opacity: 0; } }
            `}</style>

            <div className="relative w-full h-[calc(100vh-64px)]" style={{ background: '#0d111a' }}>

                {/* ── Category chips ── */}
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
                </div>

                {/* ── Side panel ── */}
                <div className="absolute right-3 z-20" style={{ top: 68 }}>
                    <SidePanel minRating={minRating} onChange={setMinRating} />
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

                        {/* Clustered or individual pins */}
                        {clusters.map((cluster, idx) => {
                            if (cluster.pins.length > 1) {
                                return (
                                    <ClusterPin key={`cluster-${idx}`} cluster={cluster}
                                        onClick={() => {
                                            // Zoom into cluster
                                            setCenter({ lat: cluster.lat, lng: cluster.lng });
                                            setZoom(z => Math.min(z + 2, 20));
                                            WebApp.HapticFeedback.impactOccurred('medium');
                                        }} />
                                );
                            }
                            const pin = cluster.pins[0];
                            return (
                                <BusinessPin key={pin.id} pin={pin}
                                    isSelected={selectedPin?.id === pin.id}
                                    onClick={() => {
                                        setSelectedPin(prev => prev?.id === pin.id ? null : pin);
                                        WebApp.HapticFeedback.impactOccurred('light');
                                    }} />
                            );
                        })}
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
