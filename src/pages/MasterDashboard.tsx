import React, { useState, useEffect, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc, updateDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import ServiceCardBuilder from '../components/ServiceCardBuilder';
import { useNavigate } from 'react-router-dom';

const SECTORS = ['Auto', 'Beauty', 'Health', 'Events', 'Food', 'Rental', 'SOS', 'Other'];

interface Service {
    id: string;
    title: string;
    price: number;
    type: string;
    imageUrl?: string;
    description: string;
}

export default function MasterDashboard() {
    const navigate = useNavigate();
    const uid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    // Profile State
    const [profile, setProfile] = useState({
        business_name: '',
        bio: '',
        category: 'Other',
        location: '',
        photo_url: ''
    });
    const [starsBalance, setStarsBalance] = useState(0);
    const [services, setServices] = useState<Service[]>([]);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // 1. Listen to Profile & Balance
        const userRef = doc(db, 'Users', uid);
        const unsubUser = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setStarsBalance(data.stars_balance || 0);
                setProfile({
                    business_name: data.master_profile?.business_name || '',
                    bio: data.master_profile?.bio || '',
                    category: data.master_profile?.category || 'Other',
                    location: data.master_profile?.location || '',
                    photo_url: data.master_profile?.photo_url || ''
                });
            }
            setLoading(false);
        });

        // 2. Listen to Services
        const servicesRef = collection(db, 'masters', uid, 'services');
        const q = query(servicesRef, orderBy('createdAt', 'desc'), limit(20));
        const unsubServices = onSnapshot(q, (snap) => {
            const list: Service[] = [];
            snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Service));
            setServices(list);
        });

        return () => {
            unsubUser();
            unsubServices();
        };
    }, [uid]);

    const trafficStatus = useMemo(() => {
        if (starsBalance > 0) return { color: 'green', text: 'Safe - Visible in Search' };
        return { color: 'yellow', text: 'Unsafe - Hidden' };
    }, [starsBalance]);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const userRef = doc(db, 'Users', uid);
            await updateDoc(userRef, {
                master_profile: {
                    ...profile,
                    updatedAt: new Date().toISOString()
                }
            });
            WebApp.HapticFeedback.notificationOccurred('success');
            WebApp.showAlert("Profile saved successfully!");
        } catch (err) {
            console.error("Save error:", err);
            WebApp.showAlert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-tg-hint">Initializing Dashboard...</div>;

    return (
        <div className="min-h-screen bg-tg-bg text-tg-text pb-28 px-4 pt-4 space-y-6">

            {/* 1. Traffic Light Status */}
            <section className="bg-tg-secondary/40 backdrop-blur-xl border border-tg-hint/10 p-4 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-[10px] uppercase font-black text-tg-hint tracking-widest mb-1">Star Balance</p>
                        <h2 className="text-2xl font-black">⭐️ {starsBalance}</h2>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${trafficStatus.color === 'green' ? 'bg-green-500 text-green-500' : 'bg-yellow-500 text-yellow-500'}`} />
                            <span className={`text-[10px] font-bold uppercase ${trafficStatus.color === 'green' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {trafficStatus.text}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Master Profile Form */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-tg-hint px-1">Identity & Brand</h3>
                <div className="bg-tg-secondary/70 rounded-2xl p-4 border border-tg-hint/5 space-y-4">
                    {/* Avatar preview and input */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-tg-bg border-2 border-tg-hint/10 flex-shrink-0">
                            {profile.photo_url ? <img src={profile.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20">🏢</div>}
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-tg-hint uppercase block mb-1">Avatar URL</label>
                            <input
                                value={profile.photo_url}
                                onChange={e => setProfile({ ...profile, photo_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-tg-bg/50 border border-tg-hint/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-tg-hint uppercase block mb-1">Business Name</label>
                            <input
                                value={profile.business_name}
                                onChange={e => setProfile({ ...profile, business_name: e.target.value })}
                                maxLength={40}
                                placeholder="Your Brand or Name"
                                className="w-full bg-tg-bg/50 border border-tg-hint/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-tg-hint uppercase block mb-1">Bio Pitch (Max 200)</label>
                            <textarea
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                maxLength={200}
                                rows={2}
                                placeholder="Short pitch for your clients"
                                className="w-full bg-tg-bg/50 border border-tg-hint/10 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-tg-hint uppercase block mb-1">Sector</label>
                                <select
                                    value={profile.category}
                                    onChange={e => setProfile({ ...profile, category: e.target.value })}
                                    className="w-full bg-tg-bg/50 border border-tg-hint/10 rounded-lg px-3 py-2 text-sm focus:outline-none appearance-none"
                                >
                                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-tg-hint uppercase block mb-1">Base Location</label>
                                <input
                                    value={profile.location}
                                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                                    placeholder="Address"
                                    className="w-full bg-tg-bg/50 border border-tg-hint/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full h-12 bg-teal-500 text-white font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </section>

            {/* 3. Services Management Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-tg-hint">My Services ({services.length}/20)</h3>
                </div>

                <div className="space-y-3">
                    {services.map(s => (
                        <div key={s.id} className="bg-tg-secondary/70 border border-tg-hint/5 p-3 rounded-2xl flex items-center gap-3">
                            <div className="w-12 h-12 bg-tg-bg rounded-xl overflow-hidden flex-shrink-0">
                                {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10">📄</div>}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold truncate">{s.title}</div>
                                <div className="text-[10px] text-tg-hint uppercase font-black">{s.type} • ${s.price}</div>
                            </div>
                            <button className="text-tg-hint p-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    ))}

                    <button
                        disabled={services.length >= 20}
                        onClick={() => setIsBuilderOpen(true)}
                        className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-widest border-2 transition-all active:scale-95
                            ${services.length >= 20 ? 'border-tg-hint/10 text-tg-hint cursor-not-allowed' : 'border-teal-500/30 text-teal-500 hover:bg-teal-500/10'}
                        `}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add New Service
                    </button>
                </div>
            </section>

            {/* Builder Modal */}
            {isBuilderOpen && (
                <ServiceCardBuilder
                    onClose={() => setIsBuilderOpen(false)}
                    onSuccess={() => {
                        setIsBuilderOpen(false);
                    }}
                />
            )}
        </div>
    );
}
