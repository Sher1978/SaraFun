import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { openQRScanner } from '../services/QRScannerService';

const Icons = {
    Discovery: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    Map: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-11.25V18.75m-9-13.5L3.75 6v11.25l4.5-2.25M9 6.75l4.5 2.25m0 0l4.5-2.25m-4.5 2.25v11.25m4.5-13.5V17.25L15 18.75m-6-13.5L3.75 6v11.25l4.5-2.25" />
        </svg>
    ),
    Scanner: () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-black">
            <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm0 2h1v1h-1v-1zm-2-2h1v1h-1v-1zm0 2h1v1h-1v-1zm-2 0h1v1h-1v-1zm0-2h1v1h-1v-1zm4 4h1v1h-1v-1zm-2 2h1v1h-1v-1zm-2 0h1v1h-1v-1zm4 0h1v1h-1v-1zm-6 0h1v1h-1v-1zm0-2h1v1h-1v-1z" />
        </svg>
    ),
    Radar: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    ),
    Profile: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
};

export default function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    const tabs = [
        { id: 'discovery', path: '/discovery', icon: Icons.Discovery, label: 'EXPLORE' },
        { id: 'map', path: '/map', icon: Icons.Map, label: 'MAP' },
        { id: 'scanner', path: '#', icon: Icons.Scanner, label: '', action: () => openQRScanner(currentUserUid) },
        { id: 'radar', path: '/radar', icon: Icons.Radar, label: 'RADAR' },
        { id: 'profile', path: '/profile', icon: Icons.Profile, label: 'PROFILE' },
    ];

    return (
        <nav className="fixed bottom-0 w-full h-[65px] bg-[#000000e6] backdrop-blur-xl border-t border-white/5 flex items-end justify-around pb-2 z-50">
            {tabs.map((tab) => {
                const isActive = tab.path !== '#' && location.pathname.startsWith(tab.path);

                if (tab.id === 'scanner') {
                    return (
                        <div key={tab.id} className="relative w-[20%] h-full flex justify-center">
                            <button
                                onClick={tab.action}
                                className="absolute -top-10 w-20 h-20 bg-[#14b8a6] rounded-full border-[6px] border-[#0a0c0e] shadow-[0_0_25px_rgba(20,184,166,0.4)] flex items-center justify-center transition-transform active:scale-95"
                            >
                                {React.createElement(tab.icon)}
                            </button>
                        </div>
                    );
                }

                return (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`flex flex-col items-center justify-center w-[20%] h-full gap-1 transition-all duration-200 ${isActive ? 'text-[#14b8a6]' : 'text-slate-500'}`}
                    >
                        <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                            {React.createElement(tab.icon)}
                        </div>
                        <span className={`text-[9px] font-black tracking-[0.1em] ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {tab.label}
                        </span>
                        {isActive && <div className="absolute bottom-[2px] w-1 h-1 bg-[#14b8a6] rounded-full shadow-[0_0_8px_#14b8a6]" />}
                    </button>
                );
            })}
        </nav>
    );
}
