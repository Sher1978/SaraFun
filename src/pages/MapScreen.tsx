import React, { useState, useEffect } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker } from '@vis.gl/react-google-maps';
import WebApp from '@twa-dev/sdk';

// ─── Design tokens ─────────────────────────────────────────────────────────
const NEON = '#00E5CC';
const GOLD = '#FFD700';
const GREY = '#8896A4';

// ─── Map dark style ─────────────────────────────────────────────────────────
const MapStyleDark = [
    { elementType: 'all', stylers: [{ color: '#0B1118' }] },
    { elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'landscape', stylers: [{ color: '#0d0f14' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1C252E' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#00E5CC', weight: 1 }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070C12' }] },
];

// ─── SVG icons ──────────────────────────────────────────────────────────────
const SVG_ICONS: Record<string, React.ReactNode> = {
    Restaurants: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2v20M5 2v4M8 2v4M5 6h3M10 20c0 1.1.9 2 2 2s2-.9 2-2V8h-4v12z" />
        </svg>
    ),
    Cafes: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" />
        </svg>
    ),
    Shops: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    Nightlife: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-12c-1.1 0-2 .9-2 2v1l8 7.5L20 5V4c0-1.1-.9-2-2-2zM12 11.5v7.5M8 22h8" />
        </svg>
    ),
    Gyms: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 4h3M18 20h3M3 4h3M3 20h3M18 4v16M6 4v16M2 12h20" />
        </svg>
    ),
    Art: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    Events: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

// ─── Trust tiers → pin colors ───────────────────────────────────────────────
type TrustTier = 'gold' | 'teal' | 'grey';
const TIER_COLOR: Record<TrustTier, string> = { gold: GOLD, teal: NEON, grey: GREY };

// ─── Mock pin data (Nha Trang area) ─────────────────────────────────────────
interface MockPin {
    id: string;
    category: string;
    name: string;
    service: string;
    rating: number;
    distance: string;
    trust: TrustTier;
    lat: number;
    lng: number;
    image: string;
}

const MOCK_PINS: MockPin[] = [
    // Restaurants
    { id: 'r1', category: 'Restaurants', name: 'Aurora Dining', service: 'Fine Dining', rating: 4.9, distance: '0.3 km', trust: 'gold', lat: 12.2415, lng: 109.1943, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80' },
    { id: 'r2', category: 'Restaurants', name: 'Sea Breeze', service: 'Seafood', rating: 4.6, distance: '0.8 km', trust: 'teal', lat: 12.2394, lng: 109.1972, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
    { id: 'r3', category: 'Restaurants', name: 'Pho Garden', service: 'Vietnamese', rating: 4.3, distance: '1.2 km', trust: 'grey', lat: 12.2378, lng: 109.1921, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },

    // Cafes
    { id: 'c1', category: 'Cafes', name: 'Neon Café', service: 'Coffee & Co-work', rating: 4.8, distance: '0.2 km', trust: 'gold', lat: 12.2432, lng: 109.1958, image: 'https://images.unsplash.com/photo-1559925393-1d6d879e60e5?w=400&q=80' },
    { id: 'c2', category: 'Cafes', name: 'Beach Brews', service: 'Specialty Coffee', rating: 4.5, distance: '0.9 km', trust: 'teal', lat: 12.2401, lng: 109.1985, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80' },
    { id: 'c3', category: 'Cafes', name: 'Roast & Roll', service: 'Coffee & Pastries', rating: 4.1, distance: '1.5 km', trust: 'grey', lat: 12.2360, lng: 109.1935, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },

    // Shops
    { id: 's1', category: 'Shops', name: 'Vi Silk', service: 'Silk & Fashion', rating: 4.7, distance: '0.5 km', trust: 'teal', lat: 12.2427, lng: 109.1930, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80' },
    { id: 's2', category: 'Shops', name: 'Tech Hub', service: 'Electronics', rating: 4.4, distance: '1.1 km', trust: 'grey', lat: 12.2388, lng: 109.1963, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80' },

    // Nightlife
    { id: 'n1', category: 'Nightlife', name: 'Skyline Club', service: 'Rooftop Bar', rating: 4.8, distance: '0.7 km', trust: 'gold', lat: 12.2445, lng: 109.1978, image: 'https://images.unsplash.com/photo-1514525253361-bee243870d12?w=400&q=80' },
    { id: 'n2', category: 'Nightlife', name: 'Neon Lounge', service: 'Cocktail Bar', rating: 4.5, distance: '0.4 km', trust: 'teal', lat: 12.2418, lng: 109.1910, image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80' },
    { id: 'n3', category: 'Nightlife', name: 'Club 99', service: 'Nightclub', rating: 4.0, distance: '1.3 km', trust: 'grey', lat: 12.2367, lng: 109.1996, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },

    // Gyms
    { id: 'g1', category: 'Gyms', name: 'Alpha Fit', service: 'CrossFit & MMA', rating: 4.9, distance: '0.6 km', trust: 'gold', lat: 12.2439, lng: 109.1948, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
    { id: 'g2', category: 'Gyms', name: 'Zen Studio', service: 'Yoga & Pilates', rating: 4.6, distance: '1.0 km', trust: 'teal', lat: 12.2398, lng: 109.1912, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80' },

    // Art
    { id: 'a1', category: 'Art', name: 'The Gallery', service: 'Contemporary Art', rating: 4.7, distance: '0.8 km', trust: 'gold', lat: 12.2422, lng: 109.1967, image: 'https://images.unsplash.com/photo-1545033131-485ea67fd7c3?w=400&q=80' },
    { id: 'a2', category: 'Art', name: 'Street Canvas', service: 'Urban Art Tours', rating: 4.4, distance: '1.2 km', trust: 'teal', lat: 12.2380, lng: 109.1950, image: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80' },

    // Events
    { id: 'e1', category: 'Events', name: 'Crypto Night', service: 'Networking · Mar 8', rating: 4.9, distance: '0.3 km', trust: 'gold', lat: 12.2450, lng: 109.1937, image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80' },
    { id: 'e2', category: 'Events', name: 'Rooftop Social', service: 'Business · Mar 9', rating: 4.6, distance: '0.7 km', trust: 'teal', lat: 12.2408, lng: 109.1975, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80' },
    { id: 'e3', category: 'Events', name: 'Beach Cleanup', service: 'Community · Mar 10', rating: 4.2, distance: '1.5 km', trust: 'grey', lat: 12.2370, lng: 109.1905, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
];

const CATEGORIES = ['All', 'Restaurants', 'Cafes', 'Shops', 'Nightlife', 'Gyms', 'Art', 'Events'];

// ─── Pin component ───────────────────────────────────────────────────────────
function BusinessPin({ pin, isSelected, onClick }: { pin: MockPin; isSelected: boolean; onClick: () => void }) {
    const color = TIER_COLOR[pin.trust];
    const icon = SVG_ICONS[pin.category];

    return (
        <AdvancedMarker position={{ lat: pin.lat, lng: pin.lng }} onClick={onClick}>
            <div
                className="relative flex items-center justify-center cursor-pointer active:scale-90 transition-all"
                style={{ zIndex: isSelected ? 20 : 10 }}
            >
                {/* Pulse ring for gold tier */}
                {pin.trust === 'gold' && (
                    <div
                        className="absolute rounded-full animate-ping"
                        style={{ width: 44, height: 44, background: `${color}30`, border: `1.5px solid ${color}60` }}
                    />
                )}
                {/* Main pin circle */}
                <div
                    style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: isSelected ? color : `${color}20`,
                        border: `2.5px solid ${color}`,
                        boxShadow: `0 0 ${isSelected ? 20 : 10}px ${color}${isSelected ? 'aa' : '55'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isSelected ? (pin.trust === 'gold' ? '#000' : '#fff') : color,
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s',
                    }}
                >
                    {icon}
                </div>
                {/* Selection indicator dot */}
                {isSelected && (
                    <div
                        style={{
                            position: 'absolute', bottom: -6,
                            width: 6, height: 6, borderRadius: '50%',
                            background: color,
                            boxShadow: `0 0 8px ${color}`,
                        }}
                    />
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
                    fill={i < Math.floor(rating) ? color : 'none'}
                    stroke={color} strokeWidth={1.5}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
            <span style={{ color, fontSize: 11, fontWeight: 800, marginLeft: 3 }}>{rating}/5</span>
        </span>
    );
}

// ─── Popup card ───────────────────────────────────────────────────────────────
function PinCard({ pin, onClose }: { pin: MockPin; onClose: () => void }) {
    const color = TIER_COLOR[pin.trust];

    return (
        <div
            className="absolute bottom-6 left-4 right-4 z-30 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
            <div
                style={{
                    background: 'rgba(13,15,20,0.88)',
                    backdropFilter: 'blur(24px)',
                    border: `1.5px solid ${color}55`,
                    borderRadius: 16,
                    boxShadow: `0 0 32px rgba(0,0,0,0.5), 0 0 20px ${color}22`,
                    overflow: 'hidden',
                }}
            >
                {/* Hero image */}
                <div style={{ position: 'relative', height: 100 }}>
                    <img src={pin.image} alt={pin.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) saturate(0.8)' }} />
                    {/* Category badge */}
                    <div style={{
                        position: 'absolute', top: 8, left: 10,
                        background: `${color}22`, backdropFilter: 'blur(8px)',
                        border: `1px solid ${color}55`, borderRadius: 8,
                        padding: '3px 10px',
                        color: color, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em'
                    }}>
                        {pin.category}
                    </div>
                    {/* Trust tier badge */}
                    <div style={{
                        position: 'absolute', top: 8, right: 36,
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                        border: `1px solid ${color}44`, borderRadius: 8,
                        padding: '3px 9px', color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>
                        {pin.trust === 'gold' ? '⭐ Trusted' : pin.trust === 'teal' ? '✓ Verified' : 'Global'}
                    </div>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 8, right: 8,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                        }}
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '12px 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pin.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>{pin.service}</div>
                        <Stars rating={pin.rating} color={color} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            {pin.distance}
                        </div>
                        <button
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                                color: pin.trust === 'gold' ? '#000' : '#fff',
                                fontSize: 11, fontWeight: 900, cursor: 'pointer',
                                letterSpacing: '0.04em', textTransform: 'uppercase',
                                boxShadow: `0 0 12px ${color}44`,
                            }}
                        >
                            Book →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MapScreen() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedPin, setSelectedPin] = useState<MockPin | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [center, setCenter] = useState({ lat: 12.240, lng: 109.195 });
    const [zoom, setZoom] = useState(14);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                setCenter(loc);
                setUserLocation(loc);
            });
        }
    }, []);

    const filteredPins = activeCategory === 'All'
        ? MOCK_PINS
        : MOCK_PINS.filter(p => p.category === activeCategory);

    const onCameraChanged = (ev: MapCameraChangedEvent) => {
        setCenter(ev.detail.center);
        setZoom(ev.detail.zoom);
    };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className="relative w-full h-[calc(100vh-64px)]" style={{ background: '#0d0f14' }}>

                {/* ── Category filter chips ── */}
                <div
                    className="absolute top-4 w-full z-20 px-4 flex gap-2 overflow-x-auto hide-scrollbar pointer-events-auto"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setSelectedPin(null); WebApp.HapticFeedback.impactOccurred('light'); }}
                                className="flex-shrink-0 active:scale-95 transition-all"
                                style={{
                                    padding: '7px 14px', borderRadius: 20,
                                    background: isActive ? NEON : 'rgba(13,15,20,0.80)',
                                    backdropFilter: 'blur(12px)',
                                    border: `1.5px solid ${isActive ? NEON : 'rgba(0,229,204,0.2)'}`,
                                    color: isActive ? '#000' : 'rgba(255,255,255,0.7)',
                                    fontSize: 12, fontWeight: 800,
                                    boxShadow: isActive ? `0 0 16px ${NEON}55` : 'none',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* ── Map ── */}
                <div className="absolute inset-0">
                    <Map
                        center={center}
                        zoom={zoom}
                        mapId="DEMO_MAP_ID"
                        gestureHandling="greedy"
                        disableDefaultUI={true}
                        styles={MapStyleDark}
                        onCameraChanged={onCameraChanged}
                        onClick={() => setSelectedPin(null)}
                    >
                        {/* User location */}
                        {userLocation && (
                            <AdvancedMarker position={userLocation}>
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-20 h-20 rounded-full animate-ping" style={{ background: `${NEON}20`, border: `1px solid ${NEON}40` }} />
                                    <div className="absolute w-10 h-10 rounded-full animate-pulse blur-md" style={{ background: `${NEON}30` }} />
                                    <div className="w-5 h-5 rounded-full border-[3px] border-white shadow-2xl" style={{ background: NEON, boxShadow: `0 0 16px ${NEON}` }} />
                                </div>
                            </AdvancedMarker>
                        )}

                        {/* Business pins */}
                        {filteredPins.map(pin => (
                            <BusinessPin
                                key={pin.id}
                                pin={pin}
                                isSelected={selectedPin?.id === pin.id}
                                onClick={() => {
                                    setSelectedPin(prev => prev?.id === pin.id ? null : pin);
                                    WebApp.HapticFeedback.impactOccurred('light');
                                }}
                            />
                        ))}
                    </Map>
                </div>

                {/* ── Legend ── */}
                <div
                    className="absolute right-4 z-20"
                    style={{
                        top: 72,
                        background: 'rgba(13,15,20,0.82)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(0,229,204,0.2)',
                        borderRadius: 12,
                        padding: '8px 12px',
                        display: 'flex', flexDirection: 'column', gap: 6,
                    }}
                >
                    {(['gold', 'teal', 'grey'] as TrustTier[]).map(tier => (
                        <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: TIER_COLOR[tier], boxShadow: `0 0 6px ${TIER_COLOR[tier]}` }} />
                            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>
                                {tier === 'gold' ? 'Trusted' : tier === 'teal' ? 'Verified' : 'Global'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Selected pin card ── */}
                {selectedPin && (
                    <PinCard pin={selectedPin} onClose={() => setSelectedPin(null)} />
                )}

            </div>
        </APIProvider>
    );
}
