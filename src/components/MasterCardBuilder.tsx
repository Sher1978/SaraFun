import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface MasterCardBuilderProps {
    onClose: () => void;
    onSuccess?: () => void;
}

type CardType = 'Service' | 'Item' | 'Event' | 'Dining' | 'Rental' | 'SOS' | 'Custom';

export default function MasterCardBuilder({ onClose, onSuccess }: MasterCardBuilderProps) {
    const [type, setType] = useState<CardType>('Service');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');

    // Flags
    const [flags, setFlags] = useState({
        ask_date: false,
        ask_time: false,
        ask_quantity: false,
        is_fixed_date: false,
        ask_period: false,
        is_urgent: false,
        ask_location: false
    });

    useEffect(() => {
        // Reset flags based on type
        const newFlags = {
            ask_date: false,
            ask_time: false,
            ask_quantity: false,
            is_fixed_date: false,
            ask_period: false,
            is_urgent: false,
            ask_location: false
        };

        switch (type) {
            case 'Service':
            case 'Dining':
                newFlags.ask_date = true;
                newFlags.ask_time = true;
                break;
            case 'Item':
                newFlags.ask_quantity = true;
                break;
            case 'Event':
                newFlags.is_fixed_date = true;
                break;
            case 'Rental':
                newFlags.ask_period = true;
                break;
            case 'SOS':
                newFlags.is_urgent = true;
                break;
            default:
                // 'Custom' is handled by manual toggles, so we don't reset here if it was already custom
                break;
        }

        if (type !== 'Custom') {
            setFlags(newFlags);
        }
    }, [type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const masterId = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user';

        try {
            const servicesRef = collection(db, 'masters', masterId, 'services');
            await addDoc(servicesRef, {
                type,
                title,
                description,
                imageUrl,
                price: parseFloat(price) || 0,
                ...flags,
                createdAt: serverTimestamp()
            });

            WebApp.HapticFeedback.notificationOccurred('success');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error adding service:', err);
            WebApp.showAlert('Failed to save service.');
        }
    };

    const toggleFlag = (flagName: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [flagName]: !prev[flagName] }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-tg-bg rounded-t-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300"
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'rgba(var(--tg-theme-bg-color-rgb, 255, 255, 255), 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Handle for drag indicator */}
                <div className="w-12 h-1.5 bg-gray-400/30 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-tg-text">Add New Card</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pb-6 px-1">
                    {/* Card Type Selector */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-tg-hint mb-2">Card Type</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {(['Service', 'Item', 'Event', 'Dining', 'Rental', 'SOS', 'Custom'] as CardType[]).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => { setType(t); WebApp.HapticFeedback.impactOccurred('light'); }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${type === t
                                            ? 'bg-tg-button text-tg-button-text shadow-lg shadow-tg-button/20 scale-105'
                                            : 'bg-black/5 text-tg-text'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div>
                            <input
                                type="text"
                                placeholder="Service Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 text-tg-text focus:ring-2 focus:ring-tg-button"
                            />
                        </div>

                        <div>
                            <textarea
                                placeholder="Description (max 200 chars)"
                                maxLength={200}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                rows={3}
                                className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 text-tg-text focus:ring-2 focus:ring-tg-button resize-none"
                            />
                            <div className="text-right text-[10px] text-tg-hint mt-1">{description.length}/200</div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="url"
                                    placeholder="Image URL"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 text-tg-text focus:ring-2 focus:ring-tg-button"
                                />
                            </div>
                            <div className="w-32">
                                <input
                                    type="number"
                                    placeholder="Price $"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 text-tg-text focus:ring-2 focus:ring-tg-button"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Type-Specific Flags / Custom Toggles */}
                    <div className="bg-black/5 rounded-2xl p-4 mt-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-tg-hint mb-3">Context Requirements</h3>

                        {type === 'Custom' ? (
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(flags).map((flag) => (
                                    <button
                                        key={flag}
                                        type="button"
                                        onClick={() => toggleFlag(flag as keyof typeof flags)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${flags[flag as keyof typeof flags]
                                                ? 'border-tg-button bg-tg-button/10 text-tg-text'
                                                : 'border-transparent bg-white/5 text-tg-hint'
                                            }`}
                                    >
                                        <span className="text-xs font-medium capitalize">{flag.replace('ask_', '').replace('is_', '').replace('_', ' ')}</span>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${flags[flag as keyof typeof flags] ? 'bg-tg-button' : 'bg-gray-500/20'}`}>
                                            {flags[flag as keyof typeof flags] && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(flags).filter(([_, val]) => val).length > 0 ? (
                                    Object.entries(flags).filter(([_, val]) => val).map(([key]) => (
                                        <span key={key} className="px-3 py-1.5 bg-tg-button/10 text-tg-button text-[10px] font-bold uppercase rounded-lg border border-tg-button/20">
                                            {key.replace('ask_', '').replace('is_', '').replace('_', ' ')}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-tg-hint italic">No extra requirements</span>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full h-12 bg-[#FFD700] text-black font-extrabold rounded-2xl shadow-xl shadow-[#FFD700]/20 active:scale-95 transition-all mt-6"
                        style={{ fontSize: '16px' }}
                    >
                        Create Card
                    </button>
                </form>
            </div>
        </div>
    );
}
