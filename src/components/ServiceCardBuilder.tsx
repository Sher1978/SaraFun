import React, { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ServiceCardBuilderProps {
    onClose: () => void;
    onSuccess?: () => void;
}

type CardType = 'Standard' | 'Event' | 'Dining' | 'Rental' | 'SOS' | 'Custom';

export default function ServiceCardBuilder({ onClose, onSuccess }: ServiceCardBuilderProps) {
    const uid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    // Form State
    const [cardType, setCardType] = useState<CardType>('Standard');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');
    const [priceUsd, setPriceUsd] = useState('');

    // Dynamic Fields
    const [eventDate, setEventDate] = useState('');
    const [address, setAddress] = useState('');
    const [responseTimeMins, setResponseTimeMins] = useState('');

    // Custom Flags
    const [flags, setFlags] = useState({
        ask_date: false,
        ask_quantity: false,
        ask_location: false,
        is_urgent: false
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        // Validation
        if (!title || !description || !priceUsd) {
            WebApp.showAlert("Please fill in required fields (Title, Description, Price)");
            return;
        }

        setSaving(true);
        try {
            const servicesRef = collection(db, 'masters', uid, 'services');

            const payload: any = {
                title,
                description,
                imageUrl: coverPhoto,
                price: parseFloat(priceUsd),
                type: cardType,
                createdAt: serverTimestamp(),
            };

            // Dynamic additions
            if (cardType === 'Event') {
                payload.event_date = eventDate;
                payload.address = address;
                payload.ask_date = true;
            } else if (cardType === 'SOS') {
                payload.response_time_mins = parseInt(responseTimeMins);
                payload.is_urgent = true;
                payload.ask_location = true;
            } else if (cardType === 'Custom') {
                Object.assign(payload, flags);
            }

            await addDoc(servicesRef, payload);
            WebApp.HapticFeedback.notificationOccurred('success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Save error:", err);
            WebApp.showAlert("Failed to create service card.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col pt-10 px-0 animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <header className="px-4 pb-4 flex items-center justify-between border-b border-tg-hint/10">
                <button onClick={onClose} className="p-2 -ml-2 text-tg-hint font-bold">Cancel</button>
                <h2 className="text-base font-black uppercase tracking-tight">Create Service Card</h2>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Base Fields */}
                <section className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Card Type</label>
                        <select
                            value={cardType}
                            onChange={e => setCardType(e.target.value as CardType)}
                            className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm font-bold focus:outline-none appearance-none"
                        >
                            {['Standard', 'Event', 'Dining', 'Rental', 'SOS', 'Custom'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Service Title *</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            maxLength={50}
                            placeholder="e.g. Master Class, Luxury Wash"
                            className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Description *</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            maxLength={200}
                            rows={3}
                            placeholder="Describe your service..."
                            className="w-full bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Price (USD) *</label>
                            <input
                                type="number"
                                value={priceUsd}
                                onChange={e => setPriceUsd(e.target.value)}
                                placeholder="50"
                                className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm font-bold focus:outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Cover Photo URL</label>
                            <input
                                value={coverPhoto}
                                onChange={e => setCoverPhoto(e.target.value)}
                                placeholder="https://..."
                                className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm focus:outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Dynamic Fields */}
                {cardType === 'Event' && (
                    <section className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Event Settings</h4>
                        <div>
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Event Date & Time</label>
                            <input
                                type="datetime-local"
                                value={eventDate}
                                onChange={e => setEventDate(e.target.value)}
                                className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Event Address</label>
                            <input
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Location details..."
                                className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm focus:outline-none"
                            />
                        </div>
                    </section>
                )}

                {cardType === 'SOS' && (
                    <section className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest">SOS Urgent Settings</h4>
                        <div>
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 px-1">Expected Response Time (Mins)</label>
                            <input
                                type="number"
                                value={responseTimeMins}
                                onChange={e => setResponseTimeMins(e.target.value)}
                                placeholder="15"
                                className="w-full h-12 bg-tg-secondary border border-tg-hint/10 rounded-xl px-4 text-sm font-bold focus:outline-none"
                            />
                        </div>
                    </section>
                )}

                {cardType === 'Custom' && (
                    <section className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-purple-500 tracking-widest">Form Logic Settings</h4>

                        {[
                            { id: 'ask_date', label: 'Require Date & Time' },
                            { id: 'ask_quantity', label: 'Require Guests/Items count' },
                            { id: 'ask_location', label: 'Require Address' },
                            { id: 'is_urgent', label: 'SOS Priority Mode' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFlags(prev => ({ ...prev, [f.id]: !prev[f.id as keyof typeof flags] }))}
                                className={`w-full flex justify-between items-center p-3 rounded-xl transition-colors ${flags[f.id as keyof typeof flags] ? 'bg-purple-500/10' : 'bg-tg-bg/40'}`}
                            >
                                <span className="text-xs font-bold text-tg-text">{f.label}</span>
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${flags[f.id as keyof typeof flags] ? 'bg-purple-500' : 'bg-tg-hint/20'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${flags[f.id as keyof typeof flags] ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                        ))}
                    </section>
                )}
            </main>

            {/* Sticky Footer */}
            <footer className="p-4 bg-tg-bg border-t border-tg-hint/10">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-teal-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] active:scale-95 transition-all"
                >
                    {saving ? 'Saving...' : 'Save Service Card'}
                </button>
            </footer>
        </div>
    );
}
