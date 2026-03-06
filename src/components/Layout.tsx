import React from 'react';
import { Outlet } from 'react-router-dom';
import CyberBottomNav from './CyberBottomNav';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen w-full bg-[#0d0f14] text-white overflow-hidden font-sans">
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[72px]">
                <Outlet />
            </main>
            <CyberBottomNav />
        </div>
    );
}
