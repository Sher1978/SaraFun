import React from 'react';
import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen w-full bg-tg-main text-tg-primary overflow-hidden font-sans">
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16">
                <Outlet />
            </main>
            <TabBar />
        </div>
    );
}
