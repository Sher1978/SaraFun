import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';

export interface TrustMarkerProps {
    uid: string;
    name: string;
    lat: number;
    lng: number;
    circle: 'Top5' | '15' | '50' | '150' | 'Global';
    onClick: () => void;
}

export default function TrustMarker({ uid, name, lat, lng, circle, onClick }: TrustMarkerProps) {
    // Dunbar "Gold" marker for Top5, Teal markers for others
    const isTop5 = circle === 'Top5';

    const ringColors = {
        Top5: '#FFD700',   // Dunbar Gold
        '15': 'rgba(20, 184, 166, 1)',   // Teal
        '50': 'rgba(20, 184, 166, 0.7)',
        '150': 'rgba(20, 184, 166, 0.5)',
        Global: '#C0C0C0' // Global Silver
    };

    const ringShadow = {
        Top5: 'drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]',
        '15': 'drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]',
        '50': '',
        '150': '',
        Global: 'drop-shadow-[0_0_8px_rgba(192,192,192,0.4)]'
    };

    return (
        <AdvancedMarker position={{ lat, lng }} onClick={onClick} className="cursor-pointer z-10 transition-transform active:scale-90">
            <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg ${ringShadow[circle]} border-2 border-tg-main animate-fade-in`}
                style={{ backgroundColor: ringColors[circle] }}
            >
                {isTop5 && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-[#FFD700] animate-ping opacity-75" />
                        <div className="absolute -inset-1 rounded-full bg-[#FFD700]/20 animate-pulse" />
                    </>
                )}
                <span className={`text-xs font-black leading-none ${isTop5 ? 'text-black' : 'text-white'}`}>
                    {name.charAt(0)}
                </span>
            </div>
        </AdvancedMarker>
    );
}
