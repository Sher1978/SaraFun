import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ServiceCard {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    type: string;
    ask_date?: boolean;
    ask_time?: boolean;
    ask_quantity?: boolean;
    ask_period?: boolean;
    is_urgent?: boolean;
    is_fixed_date?: boolean;
    ask_location?: boolean;
}

export default function LeadForm() {
    const { masterId, serviceId } = useParams<{ masterId: string; serviceId: string }>();
    const navigate = useNavigate();

    const [service, setService] = useState<ServiceCard | null>(null);
    const [loading, setLoading] = useState(true);

    // Form fields
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            if (!masterId || !serviceId) return;
            try {
                const docRef = doc(db, 'masters', masterId, 'services', serviceId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setService({ id: docSnap.id, ...docSnap.data() } as ServiceCard);
                } else {
                    WebApp.showAlert('Service not found');
                    navigate(-1);
                }
            } catch (err) {
                console.error('Error fetching service:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [masterId, serviceId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!service) return;

        setSubmitting(true);
        const userId = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user';
        const userFirstName = WebApp.initDataUnsafe?.user?.first_name || 'Guest';

        const leadData = {
            serviceId,
            masterId,
            userId,
            userFirstName,
            title: service.title,
            date: service.ask_date ? date : null,
            time: service.ask_time ? time : null,
            quantity: service.ask_quantity ? quantity : null,
            period: service.ask_period ? { start: startDate, end: endDate } : null,
            details,
            status: 'new',
            createdAt: serverTimestamp()
        };

        try {
            const docRef = await addDoc(collection(db, 'leads'), leadData);
            WebApp.HapticFeedback.notificationOccurred('success');

            // Construct Telegram deep link
            // Ideally we should have the master's telegram username. 
            // For now, using a placeholder or assuming we can redirect based on uid if available.
            // PHILOSOPHY: Pre-fill first message with context.
            const contextMessage = `Hello! I'm interested in "${service.title}".\n` +
                (date ? `Date: ${date}\n` : '') +
                (time ? `Time: ${time}\n` : '') +
                (quantity > 1 ? `Quantity: ${quantity}\n` : '') +
                (startDate ? `Period: ${startDate} to ${endDate}\n` : '') +
                (details ? `Details: ${details}` : '');

            const encodedMsg = encodeURIComponent(contextMessage);
            // In a real scenario, we'd fetch master.telegram_username. Using a dev fallback.
            const masterUsername = 'SaraFunBot'; // Placeholder
            const tgLink = `https://t.me/${masterUsername}?text=${encodedMsg}`;

            WebApp.showConfirm('Request sent! Open chat with Master?', (ok) => {
                if (ok) WebApp.openTelegramLink(tgLink);
                navigate(-1);
            });

        } catch (err) {
            console.error('Error submitting lead:', err);
            WebApp.showAlert('Failed to send request.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen bg-[#0d0f14] flex items-center justify-center text-[#00E5CC] font-black animate-pulse uppercase tracking-[0.2em]">Synchronizing...</div>;
    if (!service) return null;

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Inter']">
            {/* Header with Hero Image */}
            <div className="absolute top-0 left-0 w-full h-48 -z-10 opacity-20 blur-2xl overflow-hidden scale-110">
                <img src={service.imageUrl} className="w-full h-full object-cover" alt="" />
            </div>

            {/* Sticky Header with Action */}
            <header className="h-14 border-b border-[#00E5CC]/10 flex items-center justify-between px-4 bg-[#0d0f14]/80 backdrop-blur-xl sticky top-0 z-50 -mx-6 -mt-6 mb-8">
                <button onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate(-1); }} className="text-white/40 font-bold px-2 py-1 -ml-2 active:opacity-50 transition-opacity">
                    Back
                </button>
                <h1 className="text-[17px] font-black tracking-tight neon-text neon-glow">Create Request</h1>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="text-[#00E5CC] font-black px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {submitting ? '...' : 'Send'}
                </button>
            </header>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#00E5CC]/30 shadow-lg shadow-[#00E5CC]/10">
                    <img src={service.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight leading-tight">{service.title}</h1>
                    <p className="text-[10px] font-black text-[#00E5CC] uppercase tracking-[0.2em] opacity-60 mt-0.5">{service.type}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="cyber-glass rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5CC]/20 to-transparent" />

                    {/* Dynamic Fields */}
                    <div className="space-y-8">
                        {(service.ask_date || service.ask_time) && (
                            <div>
                                <label className="block text-[10px] font-black uppercase text-[#00E5CC]/60 mb-3 ml-1 tracking-[0.2em]">Schedule Slot</label>
                                <div className="flex gap-3">
                                    {service.ask_date && (
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="flex-1 bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors appearance-none"
                                        />
                                    )}
                                    {service.ask_time && (
                                        <input
                                            type="time"
                                            required
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            className="w-32 bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors appearance-none"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {service.ask_quantity && (
                            <div>
                                <label className="block text-[10px] font-black uppercase text-[#00E5CC]/60 mb-3 ml-1 tracking-[0.2em]">Load / Capacity</label>
                                <div className="flex items-center gap-8 bg-[#0d0f14] border border-white/10 rounded-2xl p-2 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setQuantity(q => Math.max(1, q - 1)); }}
                                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform text-[#00E5CC]"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                    </button>
                                    <span className="text-xl font-black min-w-[1.5rem] text-center neon-text">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setQuantity(q => q + 1); }}
                                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform text-[#00E5CC]"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {service.ask_period && (
                            <div>
                                <label className="block text-[10px] font-black uppercase text-[#00E5CC]/60 mb-3 ml-1 tracking-[0.2em]">Operational Window</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="flex-1 bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-3.5 text-[13px] text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors"
                                    />
                                    <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">to</div>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="flex-1 bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-3.5 text-[13px] text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black uppercase text-[#00E5CC]/60 mb-3 ml-1 tracking-[0.2em]">Mission Intel / Details</label>
                            <textarea
                                placeholder="State your requirements here..."
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors resize-none leading-relaxed"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>
            </form>

            <div className="mt-8 px-2 flex items-center gap-3 opacity-40">
                <div className="w-2 h-2 rounded-full bg-[#00E5CC] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Link Stable</span>
            </div>

            {/* Decorative glass elements */}
            <div className="fixed top-1/4 -right-20 w-48 h-48 bg-[#00E5CC]/5 rounded-full blur-3xl -z-20" />
            <div className="fixed bottom-1/4 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-20" />
        </div>
    );
}
