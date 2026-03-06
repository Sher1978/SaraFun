import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_EVENTS = [
    "🔥 Alex M. just added Sherlock to their Top 5!",
    "✨ Sarah J. completed a verified deal in Beauty.",
    "🌟 Mike T. reached 'Master' status in Nha Trang.",
    "🚀 New Circle connection in 'Auto' sector!",
    "🔥 Reputation spike for 'Ocean Spa' in 50-ring."
];

export default function TrustStream() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex(prev => (prev + 1) % MOCK_EVENTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-10 bg-tg-secondary/30 backdrop-blur-md border border-tg-hint/10 rounded-full flex items-center px-4 overflow-hidden relative shadow-sm">
            <div className="flex-shrink-0 mr-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-[11px] font-bold text-tg-primary whitespace-nowrap tracking-tight uppercase italic opacity-80"
                    >
                        {MOCK_EVENTS[index]}
                    </motion.p>
                </AnimatePresence>
            </div>

            <div className="flex-shrink-0 ml-3 text-[10px] font-black text-teal-500 uppercase">Live</div>
        </div>
    );
}
