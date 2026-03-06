import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ABCDChart from '../components/ABCDChart';
import SkeletonCard from '../components/SkeletonCard';
import { calculateDunbarScore, RatingData } from '../utils/math';
import { createInvoice } from '../services/paymentService';
import { SemanticSearch } from '../services/SemanticSearch';
import ReviewFlow from '../components/ReviewFlow';
import TrustStream from '../components/TrustStream';
import WebApp from '@twa-dev/sdk';

// Jobs To Be Done (JTBD) Categories
const JTBD_CATEGORIES = [
    { id: 'auto', title: 'Fix my transport', icon: '🚗' },
    { id: 'health', title: 'Boost my health', icon: '❤️' },
    { id: 'home', title: 'Improve my home', icon: '🏠' },
    { id: 'learn', title: 'Learn a new skill', icon: '🧠' },
    { id: 'events', title: 'Plan an event', icon: '🎉' },
    { id: 'other', title: 'Solve another problem', icon: '✨' },
];

// MOCK MASTERS with ABCD ratings matching the new chart
const MOCK_MASTERS = [
    {
        id: 'master_1',
        name: 'Alex Minov',
        service: 'Car Detailing',
        price: 50,
        ratings: [
            { rating: 4.8, ring: 'Top5' as const },
            { rating: 4.2, ring: '15' as const }
        ] as RatingData[],
        abcd: { a: 4.8, b: 3.5, c: 5.0, d: 4.2 },
        is_sherlock_verified: true, // GOLDEN SEAL
        distance: 2.4, // km
        category: 'auto'
    },
    {
        id: 'master_2',
        name: 'Sarah J.',
        service: 'Yoga Instructor',
        price: 30,
        ratings: [
            { rating: 5.0, ring: '15' as const },
            { rating: 4.5, ring: '50' as const }
        ] as RatingData[],
        abcd: { a: 5.0, b: 4.8, c: 4.5, d: 3.9 },
        distance: 1.2,
        category: 'health'
    },
    {
        id: 'master_3',
        name: 'Mike Tkach',
        service: 'Plumbing',
        price: 80,
        ratings: [
            { rating: 3.8, ring: '50' as const },
            { rating: 4.0, ring: '150' as const }
        ] as RatingData[],
        abcd: { a: 4.2, b: 3.8, c: 4.0, d: 4.5 },
        distance: 5.8,
        category: 'home'
    },
];

export default function Discovery() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reviewMaster, setReviewMaster] = useState<{ id: string, name: string } | null>(null);
    const [socialGraph, setSocialGraph] = useState<Record<string, string>>({});

    // Sorting: 'trust' | 'priceAsc' | 'priceDesc' | 'distance'
    const [sortOption, setSortOption] = useState<Record<string, string>>({
        auto: 'trust', health: 'trust', home: 'trust', learn: 'trust', events: 'trust', other: 'trust'
    });

    useEffect(() => {
        // Mock social graph for sorting demo
        setSocialGraph({ 'master_1': 'Top5', 'master_2': '15' });

        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handlePayment = async (e: React.MouseEvent, master: any, priceUsd: number) => {
        e.stopPropagation(); // Prevent opening the master profile when clicking "Pay"
        const success = await createInvoice(`${master.id}_mainService`, priceUsd);
        if (success) {
            // Transition to Review Flow after "verified" transaction
            setReviewMaster({ id: master.id, name: master.name });
        } else {
            console.log("Payment cancelled or failed.");
        }
    };

    // Base Trust Network sorting
    const trustSortedMasters = SemanticSearch.filterByTrust(MOCK_MASTERS, socialGraph);

    // Apply specific sorting per category
    const getSortedCategory = (categoryId: string) => {
        const option = sortOption[categoryId] || 'trust';
        let filtered = trustSortedMasters.filter(m => m.category === categoryId);

        // If empty mock data, just show all for demo purposes
        if (filtered.length === 0) filtered = [...trustSortedMasters];

        if (option === 'priceAsc') {
            return filtered.sort((a, b) => a.price - b.price);
        } else if (option === 'priceDesc') {
            return filtered.sort((a, b) => b.price - a.price);
        } else if (option === 'distance') {
            return filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        return filtered; // Trust default
    };

    const handleSortChange = (categoryId: string, value: string) => {
        setSortOption(prev => ({ ...prev, [categoryId]: value }));
    };

    return (
        <div className="relative min-h-full bg-[#1a1c1e] text-[#e2e8f0] px-4 pt-6 pb-24 space-y-10">
            {/* Review Flow Overlay */}
            {reviewMaster && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-md">
                    <ReviewFlow
                        masterId={reviewMaster.id}
                        masterName={reviewMaster.name}
                        onSubmit={() => setReviewMaster(null)}
                    />
                </div>
            )}

            {/* Header */}
            <header className="space-y-4">
                <div>
                    <h1 className="text-base font-bold tracking-tight text-white">Discovery</h1>
                    <p className="text-slate-400 text-sm mt-1">Services matched from your trust network</p>
                </div>

                {/* Social Proof Ticker (NEW) */}
                <TrustStream />
            </header>

            {/* JTBD Categories Carousels */}
            {JTBD_CATEGORIES.map((jtbd) => {
                const categoryMasters = getSortedCategory(jtbd.id);

                return (
                    <section key={jtbd.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-tg-hint/10 pb-2">
                            <h2 className="text-base font-black flex items-center gap-2">
                                <span>{jtbd.icon}</span>
                                {jtbd.title}
                            </h2>

                            <select
                                value={sortOption[jtbd.id]}
                                onChange={(e) => handleSortChange(jtbd.id, e.target.value)}
                                className="bg-transparent text-[#14b8a6] font-bold text-xs uppercase tracking-widest outline-none text-right appearance-none cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <option value="trust" className="text-black">★ Trust First</option>
                                <option value="priceAsc" className="text-black">Price: Low - High</option>
                                <option value="priceDesc" className="text-black">Price: High - Low</option>
                                <option value="distance" className="text-black">Nearest to Me</option>
                            </select>
                        </div>

                        {/* Horizontal Scroll Area */}
                        <div className="flex overflow-x-auto gap-3 pb-4 snap-x hide-scrollbar">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                            ) : (
                                categoryMasters.map((master) => {
                                    // Recalculate personal Dunbar Score
                                    const dunkbarScore = calculateDunbarScore(master.ratings);
                                    const isTop5 = master.ratings.some((r: any) => r.ring === 'Top5');

                                    return (
                                        <div
                                            key={`${jtbd.id}-${master.id}`}
                                            onClick={() => navigate(`/master/${master.id}`)}
                                            className={`relative flex-shrink-0 w-48 p-3 rounded-xl snap-start glass-photo transition-transform active:scale-95 cursor-pointer flex flex-col justify-between ${master.is_sherlock_verified ? 'ring-1 ring-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' :
                                                isTop5 ? 'ring-1 ring-[#14b8a6]/30 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : ''
                                                }`}
                                        >
                                            <div className="flex flex-col mb-2 relative group w-full">
                                                {/* Large Photo/Avatar Area */}
                                                <div className="w-full h-36 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 flex items-center justify-center mb-3 relative overflow-hidden border border-tg-hint/10">
                                                    <span className="text-5xl font-black text-teal-500/40">{master.name.charAt(0)}</span>
                                                    {master.is_sherlock_verified && (
                                                        <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1 shadow-md border border-white/20">
                                                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-tg-main/80 backdrop-blur-sm p-1 rounded-lg border border-white/10 shadow-sm">
                                                        <ABCDChart a={master.abcd.a} b={master.abcd.b} c={master.abcd.c} d={master.abcd.d} size={30} />
                                                    </div>
                                                    <div className="absolute bottom-2 left-2 bg-tg-main/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold shadow-sm border border-white/10 text-tg-primary flex items-center gap-1">
                                                        <span className="text-yellow-500 text-[10px]">★</span> {dunkbarScore}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Content & Score */}
                                            <div className="flex items-center justify-between gap-1 w-full">
                                                <div className="flex items-center gap-1 overflow-hidden">
                                                    <h3 className="font-black text-[15px] truncate">{master.name}</h3>
                                                    {master.abcd.c > 4.5 && (
                                                        <span className="text-blue-500 text-xs" title="Community Verified">☑️</span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-black text-tg-primary ml-2">${master.price}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-0.5 mb-2 relative">
                                                <p className="text-[10px] uppercase font-bold text-tg-hint tracking-wider truncate">
                                                    {master.service}
                                                </p>
                                                <span className="text-[9px] font-mono text-tg-hint/80 uppercase flex items-center gap-0.5 whitespace-nowrap">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {master.distance}km
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => handlePayment(e, master, master.price)}
                                                className="w-full mt-4 h-12 bg-[#14b8a6] text-white rounded-lg font-bold text-sm shadow-lg transition-all active:scale-[0.98] active:opacity-90 flex items-center justify-center gap-1"
                                            >
                                                <span>Pay with</span>
                                                <svg className="w-3.5 h-3.5 fill-[#d4af37]" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
