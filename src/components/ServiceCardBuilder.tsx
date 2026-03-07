import React, { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ServiceCardBuilderProps {
    onClose: () => void;
    onSuccess: () => void;
}

type ServiceType = 'Standard' | 'Event' | 'Rental' | 'SOS';

export default function ServiceCardBuilder({ onClose, onSuccess }: ServiceCardBuilderProps) {
    const uid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    // 1. BASIC INFO BLOCK
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // 2. SERVICE TYPE SELECTOR
    const [type, setType] = useState<ServiceType>('Standard');

    // 3. DYNAMIC SETTINGS BLOCK
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [responseTime, setResponseTime] = useState('');
    const [requireDate, setRequireDate] = useState(false);
    const [requireAddress, setRequireAddress] = useState(false);

    const [saving, setSaving] = useState(false);

    const handlePublish = async () => {
        if (!title || !price) {
            WebApp.showAlert("Please fill in the title and price.");
            return;
        }

        setSaving(true);
        try {
            const servicesRef = collection(db, 'masters', uid, 'services');

            const payload: any = {
                title,
                description,
                price: parseFloat(price),
                imageUrl,
                type,
                createdAt: serverTimestamp(),
            };

            // Dynamic logic based on Type
            if (type === 'Event') {
                payload.eventDate = eventDate;
                payload.location = location;
            } else if (type === 'SOS') {
                payload.responseTimeMins = parseInt(responseTime) || 15;
            } else if (type === 'Standard' || type === 'Rental') {
                payload.requireDate = requireDate;
                payload.requireAddress = requireAddress;
            }

            await addDoc(servicesRef, payload);

            WebApp.HapticFeedback.notificationOccurred('success');
            onSuccess();
        } catch (err) {
            console.error("Publish error:", err);
            WebApp.showAlert("Ошибка при публикации услуги.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-tg-bg flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* HEADER */}
            <header className="h-14 border-b border-tg-hint/10 flex items-center justify-between px-4 bg-tg-bg shrink-0">
                <button
                    onClick={onClose}
                    className="text-tg-hint font-medium px-2 py-1 -ml-2 active:opacity-50 transition-opacity"
                >
                    Отмена
                </button>
                <h2 className="text-base font-bold">New Service</h2>
                <button
                    onClick={handlePublish}
                    disabled={saving}
                    className="text-teal-500 font-bold px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {saving ? '...' : 'Сохранить'}
                </button>
            </header>

            {/* MAIN FORM */}
            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

                {/* BASIC INFO BLOCK */}
                <section className="bg-tg-secondary rounded-xl p-4 space-y-4 border border-tg-hint/5">
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Service Title (e.g. Haircut)"
                            className="w-full bg-transparent border-b border-tg-hint/10 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>
                    <div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            rows={2}
                            className="w-full bg-transparent border-b border-tg-hint/10 py-2 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Price in USD"
                                className="w-full bg-transparent border-b border-tg-hint/10 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Cover Photo URL"
                                className="w-full bg-transparent border-b border-tg-hint/10 py-2 focus:outline-none focus:border-teal-500 transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* SERVICE TYPE SELECTOR */}
                <section className="space-y-2 px-1">
                    <label className="text-[11px] font-bold text-tg-hint uppercase">Service Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(['Standard', 'Event', 'Rental', 'SOS'] as ServiceType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`h-11 rounded-xl font-bold text-sm transition-all border ${type === t
                                        ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                                        : 'bg-tg-secondary border-tg-hint/10 text-tg-text'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </section>

                {/* DYNAMIC SETTINGS BLOCK */}
                {type === 'Event' && (
                    <section className="bg-tg-secondary rounded-xl p-4 space-y-3 border border-tg-hint/5 animate-in fade-in zoom-in-95 duration-200">
                        <h4 className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Event Configuration</h4>
                        <div className="space-y-3">
                            <input
                                type="datetime-local"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2 text-sm text-tg-text"
                            />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Meeting Location / Address"
                                className="w-full bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2 text-sm text-tg-text"
                            />
                        </div>
                    </section>
                )}

                {type === 'SOS' && (
                    <section className="bg-tg-secondary rounded-xl p-4 space-y-1 border border-tg-hint/5 animate-in fade-in zoom-in-95 duration-200">
                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-2 px-1">SOS Urgent Response</label>
                        <div className="flex items-center gap-3 bg-tg-bg border border-tg-hint/10 rounded-lg px-3 py-2">
                            <span className="text-sm">Response Time:</span>
                            <input
                                type="number"
                                value={responseTime}
                                onChange={(e) => setResponseTime(e.target.value)}
                                placeholder="15"
                                className="w-16 bg-transparent text-center font-bold text-sm focus:outline-none"
                            />
                            <span className="text-xs text-tg-hint">mins</span>
                        </div>
                    </section>
                )}

                {(type === 'Standard' || type === 'Rental') && (
                    <section className="bg-tg-secondary rounded-xl p-2 border border-tg-hint/5 divide-y divide-tg-hint/5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-3">
                            <span className="text-sm font-medium">Require Date from Client?</span>
                            <button
                                onClick={() => setRequireDate(!requireDate)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${requireDate ? 'bg-teal-500' : 'bg-tg-hint/20'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${requireDate ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3">
                            <span className="text-sm font-medium">Require Address?</span>
                            <button
                                onClick={() => setRequireAddress(!requireAddress)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${requireAddress ? 'bg-teal-500' : 'bg-tg-hint/20'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${requireAddress ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </section>
                )}

            </main>

            {/* BOTTOM ACTION */}
            <footer className="p-4 bg-tg-bg border-t border-tg-hint/10 pb-8">
                <button
                    onClick={handlePublish}
                    disabled={saving}
                    className="w-full h-12 bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-all"
                >
                    {saving ? 'Публикация...' : 'Опубликовать'}
                </button>
            </footer>
        </div>
    );
}
