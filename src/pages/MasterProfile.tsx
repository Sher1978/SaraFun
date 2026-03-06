import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ABCDChart from '../components/ABCDChart';

// MOCK DATA matching Discovery
const MASTER_DB = {
    'master_1': {
        name: 'Alex Minov',
        bio: 'Professional Car Detailer. Ceramic coatings, interior deep cleaning, and paint correction.',
        rating: 4.88,
        reviewsCount: 124,
        abcd: { a: 4.8, b: 3.5, c: 5.0, d: 4.2 },
        trustedReviews: [
            { id: 1, author: 'Ivan D.', text: 'Best service in town! Highly recommend.', circle: 'Top5' },
            { id: 2, author: 'Maria K.', text: 'Very detailed and fast.', circle: '15' }
        ]
    }
};

export default function MasterProfile() {
    const { uid } = useParams();
    const navigate = useNavigate();

    // Load master data or fallback
    const master = MASTER_DB[uid as keyof typeof MASTER_DB] || {
        name: 'Unknown Master',
        bio: 'No data available.',
        rating: 0,
        reviewsCount: 0,
        abcd: { a: 0, b: 0, c: 0, d: 0 },
        trustedReviews: []
    };

    return (
        <div className="min-h-full bg-tg-main text-tg-primary pb-28">
            {/* Back Header Nav */}
            <div className="sticky top-0 z-10 bg-tg-main/80 backdrop-blur-xl border-b border-tg-hint/10 flex items-center justify-between p-4">
                <button onClick={() => navigate(-1)} className="text-tg-button font-medium flex items-center gap-1 group">
                    <svg className="w-5 h-5 transition-transform group-active:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <span className="font-semibold">{master.name}</span>
                <div className="w-16" /> {/* Spacer */}
            </div>

            <div className="p-4 space-y-6">

                {/* Core Profile Info */}
                <div className="flex flex-col items-center justify-center pt-4">
                    <div className="relative">
                        {/* Massive ABCD Chart background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-2xl z-0 scale-150">
                            <ABCDChart a={master.abcd.a} b={master.abcd.b} c={master.abcd.c} d={master.abcd.d} size={150} />
                        </div>
                        {/* Avatar inside */}
                        <div className="w-24 h-24 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-tg-main relative z-10">
                            {master.name.charAt(0)}
                        </div>
                        {/* Trusted Badge overlaid on avatar */}
                        <div className="absolute -bottom-2 -right-2 bg-var(--tg-theme-button-color, #2481cc) rounded-full p-1.5 border-2 border-tg-main text-white shadow-sm z-20">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mt-4">{master.name}</h1>
                    <p className="text-center text-tg-hint mt-2 text-sm leading-relaxed px-4">{master.bio}</p>
                </div>

                {/* Global Stats bar */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-tg-secondary/50 border border-tg-hint/10 rounded-2xl p-4 flex flex-col items-center justify-center backdrop-blur-md">
                        <span className="text-3xl font-extrabold text-teal-600">★ {master.rating}</span>
                        <span className="text-xs text-tg-hint mt-1 uppercase tracking-wider font-semibold">Dunbar Score</span>
                    </div>

                    <div className="bg-tg-secondary/50 border border-tg-hint/10 rounded-2xl p-4 flex items-center justify-center backdrop-blur-md">
                        {/* Explicitly large ABCD radar for analytics view */}
                        <ABCDChart a={master.abcd.a} b={master.abcd.b} c={master.abcd.c} d={master.abcd.d} size={70} />
                    </div>
                </div>

                {/* Trusted Reviews Section */}
                <div className="mt-8">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        Trusted Network Reviews
                        <span className="bg-teal-500/20 text-teal-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
                            VERIFIED
                        </span>
                    </h3>

                    <div className="space-y-3">
                        {master.trustedReviews.map(r => (
                            <div key={r.id} className="bg-tg-secondary border border-tg-hint/10 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-semibold text-sm">{r.author}</div>
                                    {/* Blue Check or Ring Badge */}
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${r.circle === 'Top5' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' : 'bg-teal-500/10 text-teal-600 border-teal-500/30'
                                        }`}>
                                        {r.circle === 'Top5' ? '★ Top 5 Friend' : 'Network Friend'}
                                    </span>
                                </div>
                                <p className="text-sm text-tg-hint">{r.text}</p>
                            </div>
                        ))}
                        {master.trustedReviews.length === 0 && (
                            <p className="text-sm text-tg-hint italic">No reviews found from your trusted circles yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
