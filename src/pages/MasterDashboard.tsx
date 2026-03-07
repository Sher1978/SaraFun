import React, { useState, useEffect, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import ServiceCardBuilder from '../components/ServiceCardBuilder';

const SECTORS = ['Auto', 'Beauty', 'Health', 'Events', 'Food', 'Rental', 'SOS'];

interface Service {
    id: string;
    title: string;
    price: number;
    type: string;
    imageUrl?: string;
    description: string;
}

export default function MasterDashboard() {
    const uid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    // Profile State
    const [avatarUrl, setAvatarUrl] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [bio, setBio] = useState('');
    const [sector, setSector] = useState('Auto');

    const [starsBalance, setStarsBalance] = useState(0);
    const [services, setServices] = useState<Service[]>([]);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!uid) return;

        // 1. Listen to Profile & Balance
        const userRef = doc(db, 'Users', uid);
        const unsubUser = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setStarsBalance(data.stars_balance || 0);
                const mp = data.master_profile || {};
                setAvatarUrl(mp.photo_url || '');
                setBusinessName(mp.business_name || '');
                setBio(mp.bio || '');
                setSector(mp.category || 'Auto');
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

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const userRef = doc(db, 'Users', uid);
            await updateDoc(userRef, {
                master_profile: {
                    photo_url: avatarUrl,
                    business_name: businessName,
                    bio: bio,
                    category: sector,
                    updatedAt: new Date().toISOString()
                }
            });
            WebApp.HapticFeedback.notificationOccurred('success');
            WebApp.showAlert("Профиль сохранен!");
        } catch (err) {
            console.error("Save error:", err);
            WebApp.showAlert("Ошибка при сохранении.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-tg-bg flex items-center justify-center text-tg-hint font-bold animate-pulse">
            LOADING BUSINESS HUB...
        </div>
    );

    return (
        <div className="min-h-screen bg-tg-bg text-tg-text pb-32">
            {/* 1. HEADER */}
            <header className="pt-6 pb-2 px-4">
                <h1 className="text-xl font-bold text-center">Business Profile</h1>
            </header>

            <main className="px-4 space-y-6">
                {/* 2. MASTER IDENTITY FORM */}
                <section className="bg-tg-secondary p-4 rounded-xl space-y-4 border border-tg-hint/5">
                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] font-bold text-tg-hint uppercase ml-1">Avatar Image URL</label>
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-tg-hint uppercase ml-1">Business Name</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                maxLength={40}
                                placeholder="Service or Brand Name"
                                className="w-full bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-tg-hint uppercase ml-1">Bio / Description (Max 200)</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={200}
                                rows={3}
                                placeholder="Tell clients about your expertise..."
                                className="w-full bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-tg-hint uppercase ml-1">Sector</label>
                            <div className="relative">
                                <select
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                    className="w-full bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 appearance-none"
                                >
                                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-tg-hint">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="w-full h-12 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
                    >
                        {saving ? 'Сохранение...' : 'Сохранить профиль'}
                    </button>
                </section>

                {/* 3. SERVICES LIST */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-tg-hint uppercase tracking-tight">
                            My Services ({services.length}/20)
                        </h2>
                    </div>

                    <div className="space-y-0.5 bg-tg-secondary rounded-xl overflow-hidden border border-tg-hint/5">
                        {services.length === 0 ? (
                            <div className="p-8 text-center text-tg-hint text-sm italic">
                                No services added yet
                            </div>
                        ) : (
                            services.map((svc) => (
                                <div key={svc.id} className="flex items-center gap-3 p-3 bg-tg-secondary active:bg-tg-hint/5 transition-colors border-b border-tg-hint/5 last:border-0">
                                    <div className="w-12 h-12 rounded-lg bg-tg-bg overflow-hidden flex-shrink-0 border border-tg-hint/10">
                                        {svc.imageUrl ? (
                                            <img src={svc.imageUrl} alt={svc.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl opacity-20">📦</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{svc.title}</div>
                                        <div className="text-xs text-tg-hint flex items-center gap-1.5 capitalize">
                                            <span>{svc.type}</span>
                                            <span className="w-1 h-1 rounded-full bg-tg-hint/30" />
                                            <span className="font-bold text-teal-500">${svc.price}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 text-tg-hint opacity-50">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={() => setIsBuilderOpen(true)}
                        disabled={services.length >= 20}
                        className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] ${services.length >= 20
                                ? 'bg-tg-hint/10 text-tg-hint cursor-not-allowed'
                                : 'border-2 border-teal-500/30 text-teal-500 hover:bg-teal-500/5'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Добавить услугу
                    </button>
                </section>
            </main>

            {/* SERVICE BUILDER MODAL */}
            {isBuilderOpen && (
                <ServiceCardBuilder
                    onClose={() => setIsBuilderOpen(false)}
                    onSuccess={() => setIsBuilderOpen(false)}
                />
            )}
        </div>
    );
}
