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
        <div className="min-h-full bg-tg-bg overflow-y-auto pb-20">
            {/* Native Header */}
            <div className="relative">
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-50 text-white bg-black/20 backdrop-blur-md p-2 rounded-full active:scale-95 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <button onClick={() => { setIsFavorite(!isFavorite); WebApp.HapticFeedback.impactOccurred('light'); }} className={`p-2 rounded-full backdrop-blur-md bg-black/20 active:scale-95 transition-transform ${isFavorite ? 'text-red-500' : 'text-white'}`}>
                        <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                    {/* Ellipsis Menu (Business Settings) */}
                    <button
                        onClick={() => navigate('/edit-master')}
                        className="p-2 rounded-full backdrop-blur-md bg-black/20 text-white active:scale-95 transition-transform"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>

                {/* Cover / Profile Header */}
                <div className="h-64 bg-gradient-to-br from-teal-600 to-teal-900 flex items-end p-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white leading-tight">{master.name}</h1>
                        <p className="text-white/70 text-sm mt-1">{master.category}</p>
                    </div>
                </div>
            </div>

            {/* Reputation Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Reputation & Trust</div>
                <div className="tg-list-group-content">
                    <button onClick={() => setShowABCDModal(true)} className="tg-list-item">
                        <div className="tg-list-item-label">Reliability Index (A-D)</div>
                        <div className="tg-list-item-value flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <span className="text-teal-500 font-bold">{master.ratingDunbar.toFixed(1)}</span>
                                <span className="text-[10px] opacity-40">TRUST</span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-500 font-bold">{master.ratingGlobal.toFixed(1)}</span>
                                <span className="text-[10px] opacity-40">RANK</span>
                            </div>
                        </div>
                        <div className="tg-list-item-arrow">→</div>
                    </button>
                    <div className="tg-list-item">
                        <div className="tg-list-item-label">Verified Reviews</div>
                        <div className="tg-list-item-value">{master.reviewsCount}</div>
                    </div>
                </div>
            </div>

            {/* Bio Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">About</div>
                <div className="tg-list-group-content">
                    <div className="tg-list-item flex-col items-start gap-1 p-4">
                        <div className="text-sm text-white/90 leading-relaxed font-medium">
                            {master.bio}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions (Glass Buttons) */}
            <div className="px-4 py-2 grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleAction('Review Flow Opening...')}
                    className="h-12 glass-button rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Review
                </button>
                <button
                    onClick={() => handleAction('Contacting Master...')}
                    className="h-12 bg-teal-500 text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Message
                </button>
            </div>

            {/* Services Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Services Portfolio</div>
                <div className="tg-list-group-content">
                    {master.services.map(srv => (
                        <div key={srv.id} className="tg-list-item">
                            <div className="tg-list-item-label flex flex-col">
                                <span className="text-white">{srv.name}</span>
                                <span className="text-xs text-tg-hint">{srv.time}</span>
                            </div>
                            <div className="tg-list-item-value text-teal-500 font-bold">{srv.price}</div>
                        </div>
                    ))}
                    {master.services.length === 0 && (
                        <div className="p-4 text-center text-tg-hint italic">No services listed</div>
                    )}
                </div>
            </div>

            {/* Network Reviews Group */}
            <div className="tg-list-group">
                <div className="tg-list-group-label">Network Reviews</div>
                <div className="tg-list-group-content">
                    {master.trustedReviews.map(r => (
                        <div key={r.id} className="tg-list-item flex-col items-start p-4 gap-2">
                            <div className="flex justify-between w-full">
                                <span className="font-bold text-white">{r.author}</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${r.circle === 'Top5' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-teal-500/20 text-teal-500'}`}>
                                    {r.circle === 'Top5' ? 'Inner Circle' : 'Verified'}
                                </span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed italic">"{r.text}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Justice Section */}
            <div className="px-4 mt-6">
                <button
                    onClick={() => navigate('/arbitration')}
                    className="w-full py-4 glass-button text-red-500 rounded-xl text-sm font-bold uppercase tracking-wider"
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
