import React from 'react';

interface AnalyticsProps {
    stats: {
        scans: number;
        reviews: number;
        reach: number;
        circles: number;
    };
}

export default function MasterAnalytics({ stats }: AnalyticsProps) {
    const conversionRate = stats.scans > 0 ? ((stats.reviews / stats.scans) * 100).toFixed(1) : '0';
    const dunbarPotential = ((stats.circles / 220) * 100).toFixed(1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-tg-secondary/40 p-3 rounded-xl border border-tg-hint/10 space-y-2">
                    <div className="text-[10px] font-black uppercase text-tg-hint tracking-widest leading-none">Conversion</div>
                    <div className="flex items-end gap-2 text-base font-bold">
                        {conversionRate}%
                        <span className="text-[10px] text-teal-500 mb-1 leading-none font-black italic">Active</span>
                    </div>
                    {/* Lightweight SVG Chart */}
                    <svg className="w-full h-8 overflow-visible mt-2" viewBox="0 0 100 20">
                        <path
                            d="M0 20 Q 25 5, 50 15 T 100 0"
                            fill="none"
                            stroke="url(#grad)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 0.2 }} />
                                <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="bg-tg-secondary/40 p-3 rounded-xl border border-tg-hint/10 space-y-2">
                    <div className="text-[10px] font-black uppercase text-tg-hint tracking-widest leading-none">Reach</div>
                    <div className="flex items-end gap-2 text-base font-bold">
                        {stats.reach}
                        <span className="text-[10px] text-blue-500 mb-1 leading-none font-black italic">Shadow</span>
                    </div>
                    <div className="w-full bg-blue-500/10 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(stats.reach / 10, 100)}%` }} />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/5 p-3 rounded-xl border border-teal-500/20 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-teal-500/80 tracking-widest leading-none">Dunbar Potential</div>
                    <div className="text-xs text-tg-hint">Interaction density in Circle 150</div>
                </div>
                <div className="text-right">
                    <div className="text-base font-black text-teal-500 italic leading-none">{dunbarPotential}%</div>
                    <div className="text-[8px] uppercase mt-1 opacity-60">Saturation</div>
                </div>
            </div>
        </div>
    );
}
