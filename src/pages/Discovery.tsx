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
        <div className="relative min-h-full bg-tg-bg px-4 pt-6 pb-24 space-y-8">
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
            <header className="px-1">
                <h1 className="text-2xl font-bold text-white leading-tight">Discovery</h1>
                <p className="text-tg-hint text-sm mt-1">Services matched from your trust network</p>

                <div className="mt-6">
                    <TrustStream />
                </div>
            </header>

            {/* JTBD Categories Section */}
            {JTBD_CATEGORIES.map((jtbd) => {
                const categoryMasters = getSortedCategory(jtbd.id);

                return (
                    <section key={jtbd.id} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-tg-hint flex items-center gap-2">
                                <span>{jtbd.icon}</span>
                                {jtbd.title}
                            </h2>

                            <select
                                value={sortOption[jtbd.id]}
                                onChange={(e) => handleSortChange(jtbd.id, e.target.value)}
                                className="bg-transparent text-tg-primary font-bold text-[10px] uppercase tracking-widest outline-none text-right appearance-none cursor-pointer"
                            >
                                <option value="trust">★ Trust</option>
                                <option value="priceAsc">Price ↑</option>
                                <option value="priceDesc">Price ↓</option>
                                <option value="distance">Near</option>
                            </select>
                        </div>

                        {/* Horizontal Scroll Area */}
                        <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                            ) : (
                                categoryMasters.map((master) => {
                                    const dunkbarScore = calculateDunbarScore(master.ratings);
                                    const isTop5 = master.ratings.some((r: any) => r.ring === 'Top5');

                                    return (
                                        <div
                                            key={`${jtbd.id}-${master.id}`}
                                            onClick={() => navigate(`/master/${master.id}`)}
                                            className="relative flex-shrink-0 w-44 p-3 rounded-2xl snap-start bg-tg-secondary/30 border border-white/5 active:scale-95 transition-transform cursor-pointer flex flex-col"
                                        >
                                            <div className="relative w-full aspect-square rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center mb-3 overflow-hidden border border-white/5">
                                                <span className="text-4xl font-black text-white/20">{master.name.charAt(0)}</span>

                                                {master.is_sherlock_verified && (
                                                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1 shadow-lg ring-2 ring-tg-bg">
                                                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10">
                                                    <ABCDChart a={master.abcd.a} b={master.abcd.b} c={master.abcd.c} d={master.abcd.d} size={24} />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-sm text-white truncate">{master.name}</h3>
                                                    <span className="text-xs font-black text-tg-primary">${master.price}</span>
                                                </div>
                                                <p className="text-[10px] text-tg-hint uppercase font-bold tracking-tight truncate">{master.service}</p>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                                                        <span>★</span>
                                                        <span>{dunkbarScore}</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5 text-[9px] text-tg-hint font-medium">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {master.distance}km
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => handlePayment(e, master, master.price)}
                                                className="w-full mt-3 py-2.5 bg-tg-primary text-black rounded-xl font-bold text-xs active:scale-[0.98] transition-transform shadow-lg shadow-tg-primary/10"
                                            >
                                                Book Now
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
