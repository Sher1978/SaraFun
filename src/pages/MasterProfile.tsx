import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ABCDChart from '../components/ABCDChart';
import WebApp from '@twa-dev/sdk';
import InfoTooltip from '../components/InfoTooltip';

// MOCK DATA matching Discovery
const MASTER_DB = {
    'master_1': {
        name: 'Alex Minov',
        category: 'Auto Detailer',
        bio: 'Professional Car Detailer. Ceramic coatings, interior deep cleaning, and paint correction.',
        ratingGlobal: 4.88,
        ratingDunbar: 4.95,
        reviewsCount: 124,
        abcd: { a: 4.8, b: 3.5, c: 5.0, d: 4.2 },
        services: [
            { id: 1, name: 'Premium Wash', price: '$50', time: '1h' },
            { id: 2, name: 'Ceramic Coating', price: '$350', time: '4h' },
            { id: 3, name: 'Interior Detail', price: '$120', time: '2h' },
            { id: 4, name: 'Engine Bay Wash', price: '$60', time: '1h' },
            { id: 5, name: 'Headlight Restoration', price: '$65', time: '45m' }
        ],
        trustedReviews: [
            { id: 1, author: 'Ivan D.', text: 'Best service in town! Highly recommend.', circle: 'Top5' },
            { id: 2, author: 'Maria K.', text: 'Very detailed and fast.', circle: '15' }
        ]
    }
};

export default function MasterProfile() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showABCDModal, setShowABCDModal] = useState(false);

    // Load master data or fallback
    const master = MASTER_DB[uid as keyof typeof MASTER_DB] || {
        name: 'Unknown Master',
        category: 'Service Provider',
        bio: 'No data available.',
        ratingGlobal: 0,
        ratingDunbar: 0,
        reviewsCount: 0,
        abcd: { a: 0, b: 0, c: 0, d: 0 },
        services: [],
        trustedReviews: []
    };

    const handleAction = (msg: string) => {
        WebApp.HapticFeedback.impactOccurred('medium');
        WebApp.showAlert(msg);
    };

    return (
        <div className="min-h-full bg-[#1a1c1e] text-[#f8fafc] pb-28">
            {/* Header Nav */}
            <div className="sticky top-0 z-50 bg-[#1a1c1e]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between p-3">
                <button onClick={() => navigate(-1)} className="text-tg-hint active:text-tg-primary transition-colors p-1">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="font-bold text-sm tracking-widest uppercase">{master.category}</span>
                <button onClick={() => { setIsFavorite(!isFavorite); WebApp.HapticFeedback.impactOccurred('light'); }} className={`p-1 transition-colors ${isFavorite ? 'text-red-500' : 'text-tg-hint'}`}>
                    <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
            </div>

            <div className="px-5 pt-4 space-y-6">

                {/* Hero / Identity Box */}
                <div className="glass-photo p-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#14b8a6]/5 blur-3xl rounded-full" />

                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-xl bg-teal-500/20 text-teal-500 flex items-center justify-center font-black text-base shadow-inner border border-teal-500/20 z-10 relative">
                                {master.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-var(--tg-theme-button-color, #2481cc) rounded-lg p-1 border border-tg-main text-white shadow-sm z-20">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-base font-black leading-tight">{master.name}</h1>
                            {/* Premium Double Circle Rating */}
                            <button
                                onClick={() => setShowABCDModal(true)}
                                className="flex items-center gap-3 mt-2 active:scale-95 transition-transform text-left"
                            >
                                <div className="flex items-center gap-1.5">
                                    <div className="relative w-8 h-8 flex items-center justify-center">
                                        <svg className="absolute inset-0 w-8 h-8 transform -rotate-90">
                                            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-tg-hint/20" />
                                            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="88" strokeDashoffset={`${88 - (88 * master.ratingDunbar / 5)}`} className="text-teal-500" />
                                        </svg>
                                        <span className="text-[10px] font-black">{master.ratingDunbar.toFixed(1)}</span>
                                    </div>
                                    <span className="text-[9px] uppercase font-bold text-tg-hint tracking-widest leading-tight flex items-center">
                                        Dunbar<br />Trust
                                        <InfoTooltip text="Average rating from clients within your extended social network." />
                                    </span>
                                </div>
                                <div className="h-6 w-px bg-tg-hint/20" />
                                <div className="flex items-center gap-1.5">
                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                        <svg className="absolute inset-0 w-7 h-7 transform -rotate-90">
                                            <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-tg-hint/20" />
                                            <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="75" strokeDashoffset={`${75 - (75 * master.ratingGlobal / 5)}`} className="text-yellow-500" />
                                        </svg>
                                        <span className="text-[9px] font-black">{master.ratingGlobal.toFixed(1)}</span>
                                    </div>
                                    <span className="text-[9px] uppercase font-bold text-tg-hint tracking-widest leading-tight flex items-center">
                                        Global<br />Rank
                                        <InfoTooltip text="Average rating from all clients on the platform." />
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                    <p className="mt-4 text-[13px] text-tg-hint leading-relaxed font-medium">
                        {master.bio}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleAction('Review Flow Opening...')}
                        className="h-11 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-white/10 transition-colors glass-button"
                    >
                        <svg className="w-4 h-4 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        Review
                    </button>
                    <button
                        onClick={() => handleAction('Lead Form Generated!')}
                        className="h-11 bg-[#14b8a6] text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#14b8a6]/10 active:scale-[0.98] transition-transform"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Contact
                    </button>
                </div>

                {/* Services Grid up to 20 */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-tg-hint tracking-widest">Services Portfolio</h3>
                    <div className="grid gap-2">
                        {master.services.map(srv => (
                            <div key={srv.id} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex flex-row items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-white">{srv.name}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{srv.time}</span>
                                </div>
                                <span className="font-mono font-bold text-[#14b8a6]">{srv.price}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trusted Reviews */}
                <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-xs font-black uppercase text-tg-hint tracking-widest">Network Reviews</h3>
                        <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-md">VERIFIED</span>
                    </div>
                    {master.trustedReviews.map(r => (
                        <div key={r.id} className="glass-photo p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-sm text-white">{r.author}</div>
                                <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded border ${r.circle === 'Top5' ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20' : 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/20'}`}>
                                    {r.circle === 'Top5' ? 'Inner Circle' : 'Node'}
                                </span>
                            </div>
                            <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{r.text}</p>
                        </div>
                    ))}
                </div>

                {/* Justice & Arbitration */}
                <button
                    onClick={() => navigate('/arbitration')}
                    className="w-full h-12 mt-5 border border-red-500/30 bg-red-500/5 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] active:bg-red-500/20 transition-colors glass-button"
                >
                    Open Dispute / Arbitration
                </button>

            </div>

            {/* ABCD Radar Modal */}
            {showABCDModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowABCDModal(false)}
                >
                    <div
                        className="bg-tg-secondary/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl w-full max-w-sm shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-tg-hint hover:text-white"
                            onClick={() => setShowABCDModal(false)}
                        >
                            ✕
                        </button>
                        <h3 className="text-base font-black uppercase tracking-widest mb-4 border-b border-tg-hint/10 pb-4">Reliability Index</h3>

                        <div className="space-y-5">
                            {[
                                { label: 'A - Authority', score: master.abcd.a, color: 'bg-blue-500' },
                                { label: 'B - Benevolence', score: master.abcd.b, color: 'bg-green-500' },
                                { label: 'C - Competence', score: master.abcd.c, color: 'bg-yellow-500' },
                                { label: 'D - Dependability', score: master.abcd.d, color: 'bg-red-500' }
                            ].map(item => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-tg-hint">
                                        <span>{item.label}</span>
                                        <span className="text-tg-primary">{item.score.toFixed(1)} / 5.0</span>
                                    </div>
                                    <div className="h-2 w-full bg-tg-main rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full`}
                                            style={{ width: `${(item.score / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
