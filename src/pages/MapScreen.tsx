import React, { useState, useEffect } from 'react'; // Triggering build with new API Key logic
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker } from '@vis.gl/react-google-maps';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import TrustMarker, { TrustMarkerProps } from '../components/TrustMarker';
import ABCDChart from '../components/ABCDChart';
import WebApp from '@twa-dev/sdk';

const MapStyleDark = [
    { "elementType": "all", "stylers": [{ "color": "#0B1118" }] },
    { "elementType": "labels", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative", "stylers": [{ "visibility": "off" }] },
    { "featureType": "landscape", "stylers": [{ "color": "#0B1118" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1C252E" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#14b8a6", "weight": 1 }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#070C12" }] }
];

const MapStyleLight = [
    { "elementType": "geometry", "stylers": [{ "color": "#F3F4F6" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#4B5563" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#F3F4F6" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#D1D5DB" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#374151" }] },
    { "featureType": "landscape", "stylers": [{ "color": "#F3F4F6" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#E5E7EB" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#14b8a6", "weight": 1 }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#BFDBFE" }] }
];

const CATEGORIES = ['All', 'Auto', 'Health', 'Beauty', 'Home', 'Education', 'Events'];

export default function MapScreen() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedMaster, setSelectedMaster] = useState<any | null>(null);
    const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);
    const [masters, setMasters] = useState<any[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [center, setCenter] = useState({ lat: 12.238, lng: 109.196 }); // Default Nha Trang
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Detect theme from Telegram WebApp dynamically
        const updateTheme = () => {
            const theme = WebApp.colorScheme || 'light';
            setIsDarkMode(theme === 'dark');
        };
        updateTheme();
        WebApp.onEvent('themeChanged', updateTheme);

        // Geolocation
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCenter(loc);
                setUserLocation(loc);
            });
        }

        return () => {
            WebApp.offEvent('themeChanged', updateTheme);
        };
    }, []);

    useEffect(() => {
        const fetchMasters = async () => {
            const mastersRef = collection(db, 'Users');
            const q = query(mastersRef, where('is_master', '==', true), limit(50));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMasters(data);
        };
        fetchMasters();
    }, []);

    const filteredMasters = activeCategory === 'All'
        ? masters
        : masters.filter(m => m.master_profile?.category === activeCategory);

    const [zoom, setZoom] = useState(14); // Increased default zoom level for a more local view

    const onCameraChanged = (ev: MapCameraChangedEvent) => {
        setBounds(ev.detail.bounds);
        setCenter(ev.detail.center); // Update center state so it doesn't snap back
        setZoom(ev.detail.zoom);     // Keep track of zoom level
    };

    const isInside = (lat: number, lng: number) => {
        if (!bounds) return true;
        return (
            lat >= bounds.south &&
            lat <= bounds.north &&
            lng >= bounds.west &&
            lng <= bounds.east
        );
    };

    const visibleMasters = filteredMasters.filter(m => m.lat && m.lng && isInside(m.lat, m.lng));

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className="relative w-full h-[calc(100vh-64px)] bg-tg-main text-tg-primary flex flex-col">

                {/* Category Chips */}
                <div className="absolute top-4 w-full z-10 px-4 flex overflow-x-auto gap-2 snap-x hide-scrollbar pointer-events-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black shadow-lg transition-all snap-start backdrop-blur-md border glass-button ${activeCategory === cat
                                ? 'bg-teal-500 text-white border-teal-400 !bg-opacity-100'
                                : 'border-white/10 text-slate-300 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Map Layer */}
                <div className="flex-1 w-full h-full">
                    <Map
                        center={center}
                        zoom={zoom}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        styles={isDarkMode ? MapStyleDark : MapStyleLight}
                        onCameraChanged={onCameraChanged}
                    // Removed mapId to prioritize local styles property
                    >
                        {/* Current User Marker */}
                        {userLocation && (
                            <AdvancedMarker position={userLocation}>
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-24 h-24 bg-teal-500/20 rounded-full animate-ping" />
                                    <div className="absolute w-12 h-12 bg-teal-500/40 rounded-full animate-pulse blur-md" />
                                    <div className="w-6 h-6 bg-teal-400 rounded-full border-4 border-white shadow-2xl" />
                                </div>
                            </AdvancedMarker>
                        )}

                        {visibleMasters.map(m => (
                            <TrustMarker
                                key={m.id}
                                uid={m.id}
                                name={m.display_name || 'Master'}
                                lat={m.lat}
                                lng={m.lng}
                                circle={(m.circle as any) || 'Global'}
                                onClick={() => setSelectedMaster(m)}
                            />
                        ))}
                    </Map>
                </div>

                {/* Info Sheet */}
                <div className={`absolute bottom-6 w-full px-4 z-10 transition-transform duration-300 ease-in-out ${selectedMaster ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                    {selectedMaster && (
                        <div className="bg-tg-secondary/80 backdrop-blur-xl border border-tg-hint/20 rounded-xl p-3 shadow-xl flex items-center justify-between pointer-events-auto">
                            <div className="flex items-center gap-3">
                                {selectedMaster.abcd && (
                                    <ABCDChart
                                        a={selectedMaster.abcd.a}
                                        b={selectedMaster.abcd.b}
                                        c={selectedMaster.abcd.c}
                                        d={selectedMaster.abcd.d}
                                        size={48}
                                    />
                                )}
                                <div>
                                    <h3 className="font-bold text-[15px]">{selectedMaster.display_name}</h3>
                                    <p className="text-xs text-tg-hint">{selectedMaster.master_profile?.business_name}</p>
                                    <div className="text-xs font-bold text-teal-500 mt-1">${selectedMaster.master_profile?.hourly_rate}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button onClick={() => setSelectedMaster(null)} className="p-1 rounded-full bg-tg-hint/20 text-tg-hint">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedMaster.circle === 'Top5' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-teal-500/10 text-teal-500 border-teal-500/30'}`}>
                                    {selectedMaster.circle === 'Global' || !selectedMaster.circle ? 'Global' : `Ring: ${selectedMaster.circle}`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </APIProvider>
    );
}
