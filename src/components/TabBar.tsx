import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { openQRScanner } from '../services/QRScannerService';

const Icons = {
    Discovery: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Map: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    Scanner: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>,
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

                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (tab.id === 'scanner' && tab.action) {
                                tab.action();
                            } else {
                                navigate(tab.path);
                            }
                        }}
                        className={`flex flex-col items-center justify-center w-[20%] h-full transition-all duration-200 ${tab.id === 'scanner'
                            ? 'bg-teal-500/20 rounded-2xl mx-1'
                            : isActive ? 'text-teal-500' : 'text-tg-hint'
                            }`}
                    >
                        <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'} ${tab.id === 'scanner' ? 'text-teal-400' : ''}`}>
                            {React.createElement(tab.icon, { size: 26, strokeWidth: (isActive || tab.id === 'scanner') ? 2.5 : 2 })}
                        </div>
                        <span className={`text-[10px] mt-[2px] font-medium leading-none tracking-tight ${(isActive || tab.id === 'scanner') ? 'font-semibold' : 'opacity-80'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
