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
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Mock social graph for sorting demo
        setSocialGraph({ 'master_1': 'Top5', 'master_2': '15' });

        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [deckOrder, setDeckOrder] = useState(JTBD_CATEGORIES.map(c => c.id));
    const [expandedDeck, setExpandedDeck] = useState<string | null>(null);

    const filterOptions = [
        { id: 'auto', label: 'Auto', icon: '🚗' },
        { id: 'health', label: 'Health', icon: '❤️' },
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'learn', label: 'Learn', icon: '🧠' },
        { id: 'events', label: 'Events', icon: '🎉' },
        { id: 'shopping', label: 'Shopping', icon: '🛍️' },
        { id: 'services', label: 'Services', icon: '🛠️' },
    ];

    const toggleFilter = (id: string) => {
        WebApp.HapticFeedback.impactOccurred('light');
        setSelectedFilters(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleSearchToggle = () => {
        WebApp.HapticFeedback.impactOccurred('medium');
        setIsSearchExpanded(!isSearchExpanded);
    };

    const toggleDeck = (id: string) => {
        WebApp.HapticFeedback.impactOccurred('light');
        setExpandedDeck(expandedDeck === id ? null : id);
    };

    const handlePayment = async (e: React.MouseEvent, master: any, priceUsd: number) => {
        e.stopPropagation();
        const success = await createInvoice(`${master.id}_mainService`, priceUsd);
        if (success) {
            setReviewMaster({ id: master.id, name: master.name });
        }
    };

    // Base Trust Network sorting
    const trustSortedMasters = SemanticSearch.filterByTrust(MOCK_MASTERS, socialGraph);

    const getSortedCategory = (categoryId: string) => {
        let filtered = trustSortedMasters.filter(m => m.category === categoryId);
        if (filtered.length === 0) filtered = [...trustSortedMasters];
        return filtered;
    };

    // Decks data: First is always 'Trust Circles'
    const trustCircleMasters = trustSortedMasters.filter(m => socialGraph[m.id]);

    return (
        <div className="relative min-h-full bg-tg-bg px-4 pt-6 pb-24 space-y-6 overflow-x-hidden">
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

            {/* Smart Header with Search and Scrollable Filters */}
            <header className="flex items-center gap-3 px-1 overflow-hidden sticky top-0 z-50 bg-tg-bg/80 backdrop-blur-xl py-2">
                <div className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSearchExpanded ? '-translate-x-full opacity-0 absolute pointer-events-none' : 'translate-x-0 opacity-100 relative'}`}>
                    <h1 className="text-xl font-bold text-white mr-4">Discovery</h1>
                    <button
                        onClick={handleSearchToggle}
                        className="p-2.5 bg-tg-secondary/50 rounded-full border border-white/10 active:scale-90 transition-transform flex-shrink-0"
                    >
                        <svg className="w-5 h-5 text-tg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    <div className="flex gap-2 ml-4 overflow-x-auto hide-scrollbar pr-4">
                        {filterOptions.map(f => (
                            <button
                                key={f.id}
                                onClick={() => toggleFilter(f.id)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${selectedFilters.includes(f.id)
                                    ? 'bg-tg-primary border-tg-primary text-black'
                                    : 'bg-white/5 border-white/10 text-tg-hint'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isSearchExpanded && (
                    <div className="flex-1 flex gap-3 animate-slide-in-right">
                        <div className="flex-1 relative">
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search intent..."
                                className="w-full h-10 bg-[#2a2d31] border border-white/10 rounded-xl px-4 text-white outline-none focus:border-tg-primary/50 text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSearchToggle}
                            className="h-10 px-4 bg-tg-secondary/50 rounded-xl border border-white/10 text-tg-hint text-xs font-bold active:scale-95 transition-transform"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </header>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* FIXED DECK: Your Trust Circles */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-tg-primary">
                        Your Trust Circles
                    </h2>
                    <span className="text-[10px] font-bold text-tg-hint bg-white/5 px-2 py-0.5 rounded-full uppercase">
                        Fixed
                    </span>
                </div>
                <DeckView masters={trustCircleMasters} id="trust_circles" loading={loading} onPay={handlePayment} />
            </section>

            {/* COLLAPSED & REORDERABLE DECKS */}
            {deckOrder.map((catId) => {
                const jtbd = JTBD_CATEGORIES.find(c => c.id === catId);
                if (!jtbd) return null;
                const masters = getSortedCategory(catId);
                const isExpanded = expandedDeck === catId;

                return (
                    <section
                        key={catId}
                        className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'space-y-4' : 'h-16 overflow-hidden mt-[-20px] active:scale-[0.98]'}`}
                    >
                        <div
                            onClick={() => toggleDeck(catId)}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl bg-[#2a2d31] border border-white/10 cursor-pointer transition-colors ${isExpanded ? 'bg-tg-secondary/20 border-tg-primary/30' : 'bg-[#2a2d31]/50 backdrop-blur-sm shadow-xl'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl opacity-60">{jtbd.icon}</span>
                                <h2 className={`text-sm font-bold tracking-tight uppercase ${isExpanded ? 'text-tg-primary' : 'text-white/60'}`}>
                                    {jtbd.title}
                                </h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-tg-hint opacity-40">{masters.length}</span>
                                <svg className={`w-4 h-4 text-tg-hint transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="animate-slide-in">
                                <DeckView masters={masters} id={catId} loading={loading} onPay={handlePayment} />
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

// Sub-component for the Stacked Deck View
function DeckView({ masters, id, loading, onPay }: {
    masters: any[],
    id: string,
    loading: boolean,
    onPay: (e: any, m: any, p: number) => void
}) {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [dragX, setDragX] = useState(0);

    const handleDragEnd = () => {
        if (dragX < -80) {
            setActiveIndex((activeIndex + 1) % masters.length);
            WebApp.HapticFeedback.impactOccurred('medium');
        }
        setDragX(0);
    };

    if (loading) return (
        <div className="h-[280px] w-full flex items-center justify-center bg-tg-secondary/10 rounded-3xl border border-white/5">
            <SkeletonCard />
        </div>
    );

    return (
        <div className="relative h-[280px] w-full mt-2 select-none">
            {masters.map((master, idx) => {
                const isTop = idx === activeIndex;
                const isNext = idx === (activeIndex + 1) % masters.length;
                if (!isTop && !isNext) return null;

                const dunkbarScore = calculateDunbarScore(master.ratings);

                return (
                    <div
                        key={master.id}
                        onTouchStart={() => isTop && setDragX(0)}
                        onTouchMove={(e) => {
                            if (isTop) {
                                // Real drag pos logic omitted for brevity, using hint
                                setDragX(-40);
                            }
                        }}
                        onTouchEnd={handleDragEnd}
                        onClick={() => navigate(`/master/${master.id}`)}
                        style={{
                            zIndex: isTop ? 10 : 5,
                            transform: isTop
                                ? `translateX(${dragX}px) rotate(${dragX / 20}deg) scale(1)`
                                : `translateX(15px) rotate(2deg) scale(0.96)`,
                            opacity: isTop ? 1 : 0.4,
                        }}
                        className="absolute inset-0 bg-[#313439] border border-white/10 rounded-3xl p-5 shadow-2xl transition-all duration-300 flex flex-col"
                    >
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tg-primary/20 to-transparent border border-white/10 flex items-center justify-center text-2xl font-black text-white/30">
                                {master.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">{master.name}</h3>
                                <p className="text-[10px] text-tg-hint font-black uppercase tracking-widest">{master.service}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between bg-black/20 p-3 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-white font-bold text-sm tracking-tight">{dunkbarScore}</span>
                            </div>
                            <ABCDChart a={master.abcd.a} b={master.abcd.b} c={master.abcd.c} d={master.abcd.d} size={28} />
                        </div>

                        <button
                            onClick={(e) => onPay(e, master, master.price)}
                            className="mt-auto w-full h-11 bg-tg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-transform"
                        >
                            Instant Book (${master.price})
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
