import React, { useState, useEffect, useCallback, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';

const SECTORS = ['Auto', 'Beauty', 'Health', 'Education', 'Dining', 'Tech', 'Legal', 'Home', 'Pets', 'Rental', 'Other'];

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

export default function MasterProfileEditor() {
    const navigate = useNavigate();
    const uid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    // Form State
    const [businessName, setBusinessName] = useState('');
    const [bio, setBio] = useState('');
    const [sector, setSector] = useState('Other');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [starsBalance, setStarsBalance] = useState(0);
    const [maxServicePrice, setMaxServicePrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Crop States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get User Profile & Stars
                const userSnap = await getDoc(doc(db, 'Users', uid));
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setStarsBalance(data.stars_balance || 0);

                    const profile = data.master_profile || {};
                    setBusinessName(profile.business_name || '');
                    setBio(profile.bio || '');
                    setSector(profile.category || 'Other');
                    setLocation(profile.location || '');
                    setPhone(profile.phone || '');
                    setPhotoUrl(profile.photo_url || null);
                }

                // Get Max Service Price for Safety Status
                const servicesSnap = await getDocs(collection(db, 'masters', uid, 'services'));
                let max = 0;
                servicesSnap.forEach(doc => {
                    const price = Number(doc.data().price || 0);
                    if (price > max) max = price;
                });
                setMaxServicePrice(max);
            } catch (err) {
                console.error("Error fetching master data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [uid]);

    const safetyStatus = useMemo(() => {
        const threshold = maxServicePrice * 0.2;
        if (starsBalance <= 0) return { color: 'red', text: 'Hidden', sub: 'Profile is hidden. Full visibility restored after top-up.' };
        if (starsBalance <= threshold) return { color: 'yellow', text: 'Unsafe', sub: 'Balance low. Your profile may become hidden soon.' };
        return { color: 'green', text: 'Safe', sub: 'Profile is visible in Global Search.' };
    }, [starsBalance, maxServicePrice]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            WebApp.HapticFeedback.impactOccurred('medium');

            await updateDoc(doc(db, 'Users', uid), {
                'master_profile.business_name': businessName,
                'master_profile.bio': bio,
                'master_profile.category': sector,
                'master_profile.location': location,
                'master_profile.phone': phone,
                'master_profile.photo_url': photoUrl || '',
                'master_profile.updatedAt': new Date().toISOString()
            });

            WebApp.showAlert("Business Profile Saved!");
            navigate(-1);
        } catch (err: any) {
            console.error("Save error:", err);
            WebApp.showAlert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-tg-hint">Loading Profile...</div>;

    return (
        <div className="bg-tg-bg min-h-screen pb-24 text-tg-primary">
            {/* Header */}
            <header className="p-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-2 text-tg-button font-bold">Back</button>
                <h1 className="text-lg font-black tracking-tight">Business Identity</h1>
            </header>

            {/* Traffic Light Dashboard */}
            <div className="px-4 mb-6">
                <div className="bg-tg-secondary/50 backdrop-blur-xl border border-tg-hint/10 p-5 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-tg-hint mb-1">Star Balance</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black">⭐️ {starsBalance}</span>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${safetyStatus.color === 'green' ? 'bg-green-500/20 text-green-500' :
                                    safetyStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-500' :
                                        'bg-red-500/20 text-red-500'
                                    }`}>
                                    {safetyStatus.text}
                                </div>
                            </div>
                        </div>
                        <button className="bg-[#FFD700] text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                            Top Up
                        </button>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${safetyStatus.color === 'green' ? 'bg-green-500 text-green-500' :
                            safetyStatus.color === 'yellow' ? 'bg-yellow-500 text-yellow-500' :
                                'bg-red-500 text-red-500'
                            }`} />
                        <p className="text-xs text-tg-hint font-medium leading-relaxed">{safetyStatus.sub}</p>
                    </div>
                </div>
            </div>

            {/* Identity Form - Telegram Style */}
            <div className="space-y-6">
                {/* 1. Avatar Section */}
                <section>
                    <div className="px-4 py-2 text-[11px] uppercase tracking-widest font-black text-tg-hint bg-tg-secondary/30">Profile Image</div>
                    <div className="bg-tg-secondary px-4 py-6 flex flex-col items-center gap-4">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden bg-tg-bg border-4 border-tg-hint/10 flex items-center justify-center shadow-lg">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Business" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl opacity-30">🏢</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] text-tg-hint uppercase font-bold tracking-widest">Tap to change logo</p>
                    </div>
                </section>

                {/* 2. Basic Info Group */}
                <section>
                    <div className="px-4 py-2 text-[11px] uppercase tracking-widest font-black text-tg-hint bg-tg-secondary/30">Business Details</div>
                    <div className="bg-tg-secondary divide-y divide-tg-hint/10">
                        {/* Name */}
                        <div className="flex flex-col p-4 gap-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase">Brand Name</label>
                            <input
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Your Brand or Name"
                                maxLength={40}
                                className="bg-transparent text-sm focus:outline-none placeholder:text-tg-hint/30"
                            />
                        </div>
                        {/* Sector */}
                        <div className="flex flex-col p-4 gap-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase">Primary Sector</label>
                            <select
                                value={sector}
                                onChange={(e) => setSector(e.target.value)}
                                className="bg-transparent text-sm focus:outline-none appearance-none w-full"
                            >
                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {/* Location */}
                        <div className="flex flex-col p-4 gap-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase">Base Location</label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Street, City, Building"
                                className="bg-transparent text-sm focus:outline-none placeholder:text-tg-hint/30"
                            />
                        </div>
                        {/* Contact Phone */}
                        <div className="flex flex-col p-4 gap-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase">Contact Phone (Optional)</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+7 999 000-00-00"
                                className="bg-transparent text-sm focus:outline-none placeholder:text-tg-hint/30"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Bio Section */}
                <section>
                    <div className="px-4 py-2 text-[11px] uppercase tracking-widest font-black text-tg-hint bg-tg-secondary/30">About Business</div>
                    <div className="bg-tg-secondary p-4">
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Short pitch for your clients (max 200 chars)..."
                            maxLength={200}
                            className="w-full bg-transparent text-sm focus:outline-none min-h-[100px] resize-none placeholder:text-tg-hint/30"
                        />
                    </div>
                </section>
            </div>

            {/* Sticky Bottom Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-tg-bg via-tg-bg to-transparent">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-[#FFD700] text-black rounded-xl font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,215,0,0.3)] active:scale-95 transition-transform"
                >
                    {saving ? 'Saving...' : 'Save Business Profile'}
                </button>
            </div>

            {/* Crop Overlay (Simplified Reuse) */}
            {imageSrc && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col pt-10 pb-6 px-4">
                    <div className="flex-1 relative mb-6 rounded-2xl overflow-hidden bg-tg-secondary/30">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={(a, p) => setCroppedAreaPixels(p)}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={() => setImageSrc(null)} className="flex-1 py-4 bg-white/10 text-white rounded-xl font-bold active:scale-95">Cancel</button>
                        <button
                            onClick={async () => {
                                if (imageSrc && croppedAreaPixels) {
                                    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
                                    setPhotoUrl(cropped);
                                    setImageSrc(null);
                                }
                            }}
                            className="flex-1 py-4 bg-[#FFD700] text-black rounded-xl font-black uppercase tracking-widest active:scale-95"
                        >
                            Crop Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
