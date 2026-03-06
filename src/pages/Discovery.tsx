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

// Mock Data
const SECTORS = ['Auto', 'Health', 'Beauty', 'Home', 'Education', 'Events', 'Other'];

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
        is_sherlock_verified: true // GOLDEN SEAL
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
        abcd: { a: 5.0, b: 4.8, c: 4.5, d: 3.9 }
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
        abcd: { a: 4.2, b: 3.8, c: 4.0, d: 4.5 }
    },
];

export default function Discovery() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reviewMaster, setReviewMaster] = useState<{ id: string, name: string } | null>(null);
    const [socialGraph, setSocialGraph] = useState<Record<string, string>>({});

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

    const sortedMasters = SemanticSearch.filterByTrust(MOCK_MASTERS, socialGraph);

    return (
        <div className="relative min-h-full bg-tg-main text-tg-primary px-4 pt-6 pb-24 space-y-8">
            {/* Review Flow Overlay */}
            {reviewMaster && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-tg-main/80 backdrop-blur-md">
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
                    <h1 className="text-2xl font-bold tracking-tight">Discovery</h1>
                    <p className="text-tg-hint text-sm mt-1">Services matched from your trust network</p>
                </div>

                {/* Social Proof Ticker (NEW) */}
                <TrustStream />
            </header>

            {/* 7 Sectors Carousels */}
            {SECTORS.map((sector) => (
                <section key={sector} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{sector}</h2>
                        <button className="text-teal-500 text-sm font-medium">See all</button>
                    </div>

                    {/* Horizontal Scroll Area */}
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            sortedMasters.map((master) => {
                                // Recalculate personal Dunbar Score
                                const dunkbarScore = calculateDunbarScore(master.ratings);
                                const isTop5 = master.ratings.some((r: any) => r.ring === 'Top5');

                                return (
                                    <div
                                        key={`${sector}-${master.id}`}
                                        onClick={() => navigate(`/master/${master.id}`)}
                                        className={`relative flex-shrink-0 w-44 p-4 rounded-2xl snap-start bg-tg-secondary/80 backdrop-blur-xl border border-tg-hint/20 transition-transform active:scale-95 cursor-pointer flex flex-col justify-between ${master.is_sherlock_verified ? 'shadow-[0_0_20px_rgba(234,179,8,0.2)] ring-1 ring-yellow-500/50 bg-gradient-to-b from-yellow-500/5 to-transparent' :
                                            isTop5 ? 'shadow-[0_0_15px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/30' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-600 flex flex-shrink-0 items-center justify-center font-bold">
                                                    {master.name.charAt(0)}
                                                </div>
                                                {master.is_sherlock_verified && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 border border-tg-main shadow-lg">
                                                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Dynamic ABCD Chart instead of Text Rating */}
                                            <ABCDChart a={master.abcd.a} b={master.abcd.b} c={master.abcd.c} d={master.abcd.d} size={40} />
                                        </div>

                                        {/* Card Content & Score */}
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-semibold text-[15px] truncate">{master.name}</h3>
                                            {master.abcd.c > 4.5 && (
                                                <span className="text-blue-500 text-[10px]" title="Community Verified">☑️</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] uppercase font-black text-tg-hint tracking-wider mt-0.5">
                                            {master.is_sherlock_verified ? "Sherlock's Verified" : (master.id === 'master_1' ? 'AUTO' : master.id === 'master_2' ? 'HEALTH' : 'HOME')}
                                        </p>

                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="bg-tg-main text-tg-primary px-2 py-0.5 rounded text-xs font-bold shadow-sm border border-tg-hint/10">
                                                ★ {dunkbarScore}
                                            </div>
                                            <span className="text-sm font-bold text-tg-primary truncate pl-2">${master.price}</span>
                                        </div>

                                        <button
                                            onClick={(e) => handlePayment(e, master, master.price)}
                                            className="w-full mt-4 h-12 bg-tg-button text-tg-button-text rounded-lg font-bold text-sm shadow-md transition-opacity active:opacity-80 flex items-center justify-center gap-1"
                                        >
                                            <span>Pay with</span>
                                            <svg className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
}
