import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { openQRScanner } from '../services/QRScannerService';

const Icons = {
    Discovery: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Map: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    Scanner: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm-3-3h2v2h-2v-2zm0-3h2v2h-2v-2zm3-3h2v2h-2v-2z" /></svg>,
    Radar: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 4c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" /></svg>,
    Profile: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export default function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    const tabs = [
        { id: 'discovery', path: '/discovery', icon: Icons.Discovery, label: 'Explore' },
        { id: 'map', path: '/map', icon: Icons.Map, label: 'Map' },
        { id: 'scanner', path: '#', icon: Icons.Scanner, label: 'Scanner', action: () => openQRScanner(currentUserUid) },
        { id: 'radar', path: '/radar', icon: Icons.Radar, label: 'Radar' },
        { id: 'profile', path: '/profile', icon: Icons.Profile, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 w-full h-[50px] bg-tg-secondary border-t border-tg-hint/10 flex items-center justify-around pb-safe z-50">
            {tabs.map((tab) => {
                const isActive = tab.path !== '#' && location.pathname.startsWith(tab.path);

                const isScanner = tab.id === 'scanner';

                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (isScanner && tab.action) {
                                tab.action();
                            } else {
                                navigate(tab.path);
                            }
                        }}
                        className={`flex flex-col items-center justify-center transition-all duration-200 relative ${isScanner
                            ? 'w-16 h-16 bg-teal-500 rounded-full -translate-y-6 border-[3px] border-tg-bg shadow-xl'
                            : 'w-[20%] h-full'
                            } ${!isScanner && isActive ? 'text-teal-500' : 'text-tg-hint'}`}
                    >
                        <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'} ${isScanner ? 'text-black' : ''}`}>
                            {React.createElement(tab.icon, { size: isScanner ? 30 : 26, strokeWidth: (isActive || isScanner) ? 2.5 : 2 })}
                        </div>
                        {!isScanner && (
                            <span className={`text-[10px] mt-[2px] font-medium leading-none tracking-tight ${isActive ? 'font-semibold' : 'opacity-80'}`}>
                                {tab.label}
                            </span>
                        )}
                        {isScanner && (
                            <span className="absolute -bottom-6 text-[10px] font-black text-teal-500 uppercase tracking-widest">
                                SCAN
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
