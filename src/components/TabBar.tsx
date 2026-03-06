import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Icons = {
    Discovery: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Radar: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 4c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" /></svg>,
    Map: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
    Profile: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Dashboard: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export default function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'discovery', path: '/discovery', icon: Icons.Discovery, label: 'Explore' },
        { id: 'radar', path: '/radar', icon: Icons.Map, label: 'Radar' }, // Using Map icon for Radar temporarily
        { id: 'map', path: '/map', icon: Icons.Map, label: 'Map' },
        { id: 'profile', path: '/profile', icon: Icons.Profile, label: 'Profile' },
        { id: 'business', path: '/dashboard', icon: Icons.Dashboard, label: 'Business' },
    ];

    return (
        <nav className="fixed bottom-0 w-full h-16 bg-tg-secondary border-t border-tg-hint/20 flex items-center justify-around px-2 pb-safe">
            {tabs.map((tab) => {
                const isActive = location.pathname.startsWith(tab.path);

                return (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 ${isActive ? 'text-tg-button' : 'text-tg-hint hover:text-tg-primary'
                            }`}
                    >
                        <tab.icon />
                        <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
