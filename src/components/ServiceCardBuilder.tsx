import React, { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Cropper from 'react-easy-crop';

// Utility to create the cropped image
const createImage = (url: string) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

async function getCroppedImg(imageSrc: string, pixelCrop: any) {
    const image: any = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
}

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

    // Crop States
    const [imageFileSrc, setImageFileSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageFileSrc(reader.result?.toString() || null));
            reader.readAsDataURL(file);
        }
    };

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
        <div className="fixed inset-0 z-[1000] bg-[#0d0f14] flex flex-col animate-in slide-in-from-bottom duration-500 font-['Inter']">
            {/* HEADER */}
            <header className="h-14 border-b border-[#00E5CC]/10 flex items-center justify-between px-4 bg-[#0d0f14]/80 backdrop-blur-xl shrink-0">
                <button
                    onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); onClose(); }}
                    className="text-white/60 font-medium px-2 py-1 -ml-2 active:opacity-50 transition-opacity"
                >
                    Cancel
                </button>
                <h2 className="text-[17px] font-bold tracking-tight neon-text neon-glow">New Service</h2>
                <button
                    onClick={() => { WebApp.HapticFeedback.impactOccurred('medium'); handlePublish(); }}
                    disabled={saving}
                    className="text-[#00E5CC] font-bold px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {saving ? '...' : 'Publish'}
                </button>
            </header>

            {/* MAIN FORM */}
            <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

                {/* BASIC INFO BLOCK */}
                <section className="bg-[#121620]/40 backdrop-blur-md rounded-2xl p-5 space-y-5 border border-white/5 shadow-xl">
                    {/* Photo Upload Preview */}
                    <div className="flex flex-col items-center gap-3">
                        <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest block w-full text-left">Service Cover</label>
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0d0f14] border border-[#00E5CC]/20 flex items-center justify-center shadow-2xl group active-scale transition-all">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Service" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 opacity-40">
                                    <span className="text-4xl filter grayscale contrast-125">📸</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5CC]">Add Service Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-[#00E5CC]/5 opacity-0 group-active:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-medium tracking-[0.05em]">Tap box to upload (16:9)</p>
                    </div>

                    <div className="focus-within:translate-x-1 transition-transform duration-200">
                        <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest block mb-1">Service Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Premium Car Wash"
                            className="w-full bg-transparent border-b border-white/10 py-2 text-[15px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors placeholder:text-white/10"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest block mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Details about what you offer..."
                            rows={3}
                            className="w-full bg-transparent border-b border-white/10 py-2 text-[14px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors resize-none placeholder:text-white/10 leading-relaxed"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-widest block mb-1">Price ($)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent border-b border-white/10 py-2 text-[15px] font-medium text-white focus:outline-none focus:border-[#00E5CC]/50 transition-colors placeholder:text-white/10"
                            />
                        </div>
                    </div>
                </section>

                {/* SERVICE TYPE SELECTOR */}
                <section className="space-y-3 px-1">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Service Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['Standard', 'Event', 'Rental', 'SOS'] as ServiceType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setType(t); }}
                                className={`h-12 rounded-2xl font-bold text-[13px] transition-all border ${type === t
                                    ? 'bg-[#00E5CC] border-[#00E5CC] text-[#0d0f14] shadow-[0_4px_12px_rgba(0,229,204,0.3)] scale-[1.02]'
                                    : 'bg-[#121620]/60 border-white/5 text-white/40 active-scale'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </section>

                {/* DYNAMIC SETTINGS BLOCK */}
                {type === 'Event' && (
                    <section className="cyber-glass p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">📅</span>
                            <h4 className="text-[10px] font-bold text-[#00E5CC] uppercase tracking-widest">Event Configuration</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-white/30 uppercase font-bold ml-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full bg-[#0d0f14]/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#00E5CC]/30 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-white/30 uppercase font-bold ml-1">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Meeting Location / Address"
                                    className="w-full bg-[#0d0f14]/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#00E5CC]/30 transition-colors placeholder:text-white/10"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {type === 'SOS' && (
                    <section className="cyber-glass p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300 rounded-2xl border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm animate-pulse">🚨</span>
                            <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest">SOS Urgent Response</label>
                        </div>
                        <div className="flex items-center justify-between bg-[#0d0f14]/50 border border-white/10 rounded-xl px-5 py-4">
                            <span className="text-[14px] font-medium text-white/60">Response Time</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={responseTime}
                                    onChange={(e) => setResponseTime(e.target.value)}
                                    placeholder="15"
                                    className="w-12 bg-transparent text-right font-bold text-[15px] text-[#00E5CC] focus:outline-none"
                                />
                                <span className="text-[12px] text-white/20 font-bold uppercase">min</span>
                            </div>
                        </div>
                    </section>
                )}

                {(type === 'Standard' || type === 'Rental') && (
                    <section className="cyber-glass p-2 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-300 rounded-2xl">
                        <div className="flex items-center justify-between p-4 px-5">
                            <span className="text-[14px] font-medium text-white/80">Require Date from Client</span>
                            <button
                                onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setRequireDate(!requireDate); }}
                                className={`w-12 h-7 rounded-full transition-all relative ${requireDate ? 'bg-[#00E5CC] shadow-[0_0_10px_rgba(0,229,204,0.3)]' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${requireDate ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 px-5">
                            <span className="text-[14px] font-medium text-white/80">Require Address</span>
                            <button
                                onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setRequireAddress(!requireAddress); }}
                                className={`w-12 h-7 rounded-full transition-all relative ${requireAddress ? 'bg-[#00E5CC] shadow-[0_0_10px_rgba(0,229,204,0.3)]' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${requireAddress ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </section>
                )}

            </main>

            {/* Crop Overlay */}
            {imageFileSrc && (
                <div className="fixed inset-0 z-[2000] bg-[#0d0f14] flex flex-col pt-10 pb-6 px-4 animate-in fade-in duration-300">
                    <div className="flex-1 relative mb-6 rounded-3xl overflow-hidden cyber-glass">
                        <Cropper
                            image={imageFileSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onCropComplete={(a, p) => setCroppedAreaPixels(p)}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setImageFileSrc(null); }} className="flex-1 py-4 bg-[#1a1f2e] text-white/40 rounded-2xl font-bold active-scale">Cancel</button>
                        <button
                            onClick={async () => {
                                WebApp.HapticFeedback.impactOccurred('medium');
                                if (imageFileSrc && croppedAreaPixels) {
                                    const cropped = await getCroppedImg(imageFileSrc, croppedAreaPixels);
                                    if (cropped) setImageUrl(cropped);
                                    setImageFileSrc(null);
                                }
                            }}
                            className="flex-1 py-4 bg-[#00E5CC] text-[#0d0f14] rounded-2xl font-black uppercase tracking-widest active-scale shadow-[0_0_20px_rgba(0,229,204,0.4)]"
                        >
                            Crop Cover
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
