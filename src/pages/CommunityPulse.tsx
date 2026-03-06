import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { motion } from 'framer-motion';

const MOCK_LEADERBOARD = [
    { name: "Alex Minov", sector: "Auto", trustScore: 4.9, trending: true },
    { name: "Sarah J.", sector: "Health", trustScore: 4.8, trending: false },
    { name: "Ocean Spa", sector: "Beauty", trustScore: 4.7, trending: true },
    { name: "Mike T.", sector: "Home", trustScore: 4.6, trending: false },
    { name: "Elite Coffee", sector: "Other", trustScore: 4.5, trending: true },
    { name: "Yoga Loft", sector: "Health", trustScore: 4.4, trending: false },
    { name: "Fast Fix", sector: "Auto", trustScore: 4.3, trending: false },
    { name: "Zen Den", sector: "Health", trustScore: 4.2, trending: true },
    { name: "Clean Pros", sector: "Home", trustScore: 4.1, trending: false },
    { name: "Green Garden", sector: "Other", trustScore: 4.0, trending: false },
];

export default function CommunityPulse() {
    const [city, setCity] = useState("Nha Trang");

    return (
        <div className="min-h-full bg-tg-main text-tg-primary px-4 pt-6 pb-24 space-y-8">
            <header className="text-center space-y-2">
                <div className="inline-block px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-black text-teal-500 uppercase tracking-widest">
                    Live Feed • {city}
                </div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic">Community Pulse</h1>
                <p className="text-tg-hint text-sm">Real-time trust density across the network.</p>
            </header>

            {/* Leaderboard */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black uppercase text-tg-hint tracking-widest">Top 10 Trusted</h2>
                    <span className="text-[10px] text-teal-500 font-bold">Updated Now</span>
                </div>

                <div className="space-y-3">
                    {MOCK_LEADERBOARD.map((item, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={item.name}
                            className="bg-tg-secondary/30 border border-tg-hint/10 p-4 rounded-2xl flex items-center gap-4 group active:scale-[0.98] transition-all"
                        >
                            <div className="w-8 flex-shrink-0 text-lg font-black italic text-tg-hint group-hover:text-teal-500 transition-colors">
                                #{i + 1}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold flex items-center gap-2">
                                    {item.name}
                                    {item.trending && <span className="text-teal-500 text-[8px] animate-pulse">🔥 TRENDING</span>}
                                </div>
                                <div className="text-[10px] text-tg-hint uppercase tracking-wider">{item.sector}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-teal-500">★ {item.trustScore}</div>
                                <div className="text-[8px] uppercase opacity-60">Avg Trust</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Global Density Map Placeholder */}
            <section className="bg-tg-secondary/50 p-6 rounded-3xl border border-tg-hint/10 text-center space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest">Network Saturation</h3>
                <div className="h-2 w-full bg-tg-main rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500" style={{ width: '68%' }} />
                </div>
                <p className="text-[10px] text-tg-hint">3,420 Active Trusted Connections in this Cell</p>
            </section>
        </div>
    );
}
