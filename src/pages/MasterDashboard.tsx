import React, { useState, useEffect, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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
                'master_profile.photo_url': avatarUrl,
                'master_profile.business_name': businessName,
                'master_profile.bio': bio,
                'master_profile.category': sector,
                'master_profile.updatedAt': new Date().toISOString()
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
        <div className="min-h-screen bg-[#0d0f14] text-white pb-32 font-['Inter']">
            {/* 1. HEADER */}
            <header className="h-14 border-b border-[#00E5CC]/10 flex items-center justify-between px-4 bg-[#0d0f14]/80 backdrop-blur-xl sticky top-0 z-50">
                <button onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate(-1); }} className="text-white/60 font-medium px-2 py-1 -ml-2 active:opacity-50 transition-opacity">Back</button>
                <h1 className="text-[17px] font-bold tracking-tight neon-text neon-glow">Business Hub</h1>
                <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="text-[#00E5CC] font-bold px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {saving ? '...' : 'Save'}
                </button>
            </header>

            <main className="px-4 py-6 space-y-8">
                {/* 2. MASTER IDENTITY FORM */}
                <section className="cyber-glass p-5 rounded-2xl space-y-5 border border-white/5 shadow-xl">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest ml-1 block mb-2">Business Cover</label>
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0d0f14] border border-[#00E5CC]/20 flex items-center justify-center shadow-2xl group active-scale transition-all"
                                onClick={() => {
                                    WebApp.HapticFeedback.impactOccurred('light');
                                    // Trigger file input or crop logic if needed, 
                                    // but for now we'll match the Editor's logic if the user requests it specifically.
                                }}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                        <span className="text-4xl filter grayscale contrast-125">🏢</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5CC]">Add Cover Photo</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-[#00E5CC]/5 opacity-0 group-active:opacity-100 pointer-events-none transition-opacity" />
                            </div>
                            <input
                                type="text"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="Image URL (or use Editor for upload)"
                                className="w-full bg-transparent border-b border-white/10 py-2 mt-2 text-[14px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors placeholder:text-white/10"
                            />
                        </div>

                        <div className="focus-within:translate-x-1 transition-transform duration-200">
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest ml-1 block">Brand Name</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                maxLength={40}
                                placeholder="Your Business Name"
                                className="w-full bg-transparent border-b border-white/10 py-2 text-[15px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors placeholder:text-white/10"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest ml-1 block">Bio / Pitch</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={200}
                                rows={2}
                                placeholder="Tell clients why they should trust you..."
                                className="w-full bg-transparent border-b border-white/10 py-2 text-[14px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors placeholder:text-white/10 resize-none leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest ml-1 block">Sector</label>
                            <div className="relative">
                                <select
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 py-2 text-[15px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors appearance-none"
                                >
                                    {SECTORS.map(s => <option key={s} value={s} className="bg-[#0d0f14]">{s}</option>)}
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. SERVICES GRID (2x10) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                            Service Matrix ({services.length}/20)
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 justify-items-center mx-auto max-w-[350px]">
                        {/* Render existing services */}
                        {services.map((svc) => (
                            <div
                                key={svc.id}
                                className="active-scale group relative overflow-hidden"
                                style={{
                                    width: 160,
                                    background: 'rgba(14,19,30,0.9)',
                                    borderRadius: 14,
                                    border: `1px solid rgba(0,229,204,0.35)`,
                                    boxShadow: `0 0 10px rgba(0,229,204,0.12)`,
                                }}
                                onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); /* Edit trigger */ }}
                            >
                                <div style={{ height: 110, position: 'relative' }} className="bg-[#0d0f14] overflow-hidden">
                                    {svc.imageUrl ? (
                                        <img src={svc.imageUrl} alt={svc.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.72) saturate(0.8)' }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">📦</div>
                                    )}
                                </div>
                                <div style={{ padding: '10px 12px 12px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 2 }} className="truncate">{svc.title}</div>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: '#00E5CC' }}>${svc.price}</div>
                                </div>
                                <div className="absolute inset-0 bg-[#00E5CC]/5 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))}

                        {/* Render empty slots (Dashed) */}
                        {Array.from({ length: 20 - services.length }).map((_, i) => (
                            <button
                                key={`empty-${i}`}
                                onClick={() => { WebApp.HapticFeedback.impactOccurred('medium'); setIsBuilderOpen(true); }}
                                className="rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 group active:border-[#00E5CC]/30 transition-all active:bg-[#00E5CC]/5"
                                style={{ width: 160, height: 158 }}
                            >
                                <span className="text-2xl text-white/10 group-active:text-[#00E5CC]/50 transition-colors">+</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/10 group-active:text-[#00E5CC]/40 transition-colors">Add Slot</span>
                            </button>
                        ))}
                    </div>
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
