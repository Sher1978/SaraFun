import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TrustEvent {
    id: string;
    type: 'Top5' | '15' | 'ReviewVerified' | 'Referral';
    message: string;
}

export default function TrustNotifications() {
    const [notifications, setNotifications] = useState<TrustEvent[]>([]);

    // Simulation: Add a mock dopamine event on mount for Phase 9 demo
    useEffect(() => {
        const timer = setTimeout(() => {
            addEvent({
                id: Date.now().toString(),
                type: 'Top5',
                message: "Someone added you to their Top 5 circle! 🔥"
            });
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const addEvent = (event: TrustEvent) => {
        setNotifications(prev => [...prev, event]);
        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== event.id));
        }, 4000);
    };

    return (
        <div className="fixed top-[env(safe-area-inset-top,8px)] left-0 right-0 z-[110] pointer-events-none px-4 flex flex-col gap-2">
            <AnimatePresence>
                {notifications.map(n => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="w-full max-w-sm mx-auto bg-tg-secondary/80 backdrop-blur-xl border border-teal-500/30 rounded-xl p-3 shadow-xl flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-base shadow-lg shadow-teal-500/20">
                            {n.type === 'Top5' ? '💎' : '📢'}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] uppercase font-black text-teal-500 tracking-tighter">New Trust Event</p>
                            <p className="text-xs font-bold leading-tight">{n.message}</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
