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
                is_master: true,
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

    if (loading) return <div className="bg-[#0d0f14] min-h-screen p-4 text-center text-white/20 font-medium">Loading Profile...</div>;

    return (
        <div className="bg-[#0d0f14] min-h-screen pb-24 text-white font-['Inter']">
            {/* Header */}
            <header className="h-14 border-b border-[#00E5CC]/10 flex items-center justify-between px-4 bg-[#0d0f14]/80 backdrop-blur-xl sticky top-0 z-50">
                <button onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate(-1); }} className="text-white/60 font-medium px-2 py-1 -ml-2 active:opacity-50 transition-opacity">Back</button>
                <h1 className="text-[18px] font-bold tracking-tight neon-text neon-glow">Business Identity</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-[#00E5CC] font-bold px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {saving ? '...' : 'Save'}
                </button>
            </header>

            {/* Traffic Light Dashboard */}
            <div className="px-4 mb-6 mt-4">
                <div className="cyber-glass p-5 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.08em] font-bold text-white/40 mb-1">Star Balance</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-white">⭐️ {starsBalance}</span>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${safetyStatus.color === 'green' ? 'bg-[#00E5CC]/20 text-[#00E5CC]' :
                                    safetyStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-500' :
                                        'bg-red-500/20 text-red-500'
                                    }`}>
                                    {safetyStatus.text}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => WebApp.HapticFeedback.impactOccurred('medium')}
                            className="bg-[#00E5CC] text-[#0d0f14] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider active-scale shadow-[0_4px_12px_rgba(0,229,204,0.3)]"
                        >
                            Top Up
                        </button>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${safetyStatus.color === 'green' ? 'text-[#00E5CC] bg-[#00E5CC]' :
                            safetyStatus.color === 'yellow' ? 'text-yellow-500 bg-yellow-500' :
                                'text-red-500 bg-red-500'
                            }`} />
                        <p className="text-[13px] text-white/60 font-medium leading-tight">{safetyStatus.sub}</p>
                    </div>
                </div>
            </div>

            {/* Identity Form - Cyber Style */}
            <div className="space-y-4">
                {/* 1. Avatar Section */}
                <section>
                    <div className="px-5 py-2 text-[10px] uppercase tracking-[0.1em] font-bold text-white/30">Profile Image</div>
                    <div className="bg-[#121620]/40 backdrop-blur-md px-4 py-6 flex flex-col items-center gap-4 border-y border-white/5">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0d0f14] border border-[#00E5CC]/20 flex items-center justify-center shadow-2xl group active-scale transition-all">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Business" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 opacity-40">
                                    <span className="text-4xl filter grayscale contrast-125">🏢</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5CC]">Add Business Cover</span>
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
                        <p className="text-[10px] text-white/40 uppercase font-medium tracking-[0.05em]">16:9 Aspect Ratio recommended</p>
                    </div>
                </section>

                {/* 2. Basic Info Group */}
                <section>
                    <div className="px-5 py-2 text-[10px] uppercase tracking-[0.1em] font-bold text-white/30">Business Details</div>
                    <div className="bg-[#121620]/40 backdrop-blur-md divide-y divide-white/5 border-y border-white/5">
                        {/* Name */}
                        <div className="flex flex-col px-5 py-4 gap-1.5 focus-within:bg-[#00E5CC]/5 transition-colors">
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-wider">Brand Name</label>
                            <input
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Your Brand or Name"
                                maxLength={40}
                                className="bg-transparent text-[15px] font-medium text-white focus:outline-none placeholder:text-white/10"
                            />
                        </div>
                        {/* Sector */}
                        <div className="flex flex-col px-5 py-4 gap-1.5 focus-within:bg-[#00E5CC]/5 transition-colors">
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-wider">Primary Sector</label>
                            <div className="relative">
                                <select
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                    className="bg-transparent text-[15px] font-medium text-white focus:outline-none appearance-none w-full relative z-10"
                                >
                                    {SECTORS.map(s => <option key={s} value={s} className="bg-[#0d0f14]">{s}</option>)}
                                </select>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20"><path d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                        {/* Location */}
                        <div className="flex flex-col px-5 py-4 gap-1.5 focus-within:bg-[#00E5CC]/5 transition-colors">
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-wider">Base Location</label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Street, City, Building"
                                className="bg-transparent text-[15px] font-medium text-white focus:outline-none placeholder:text-white/10"
                            />
                        </div>
                        {/* Contact Phone */}
                        <div className="flex flex-col px-5 py-4 gap-1.5 focus-within:bg-[#00E5CC]/5 transition-colors">
                            <label className="text-[10px] font-bold text-[#00E5CC]/60 uppercase tracking-wider">Contact Phone (Optional)</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+7 999 000-00-00"
                                className="bg-transparent text-[15px] font-medium text-white focus:outline-none placeholder:text-white/10"
                            />
                        </div>
                    </div>
                </section>

                {/* 3. Bio Section */}
                <section>
                    <div className="px-5 py-2 text-[10px] uppercase tracking-[0.1em] font-bold text-white/30">About Business</div>
                    <div className="bg-[#121620]/40 backdrop-blur-md p-5 border-y border-white/5 focus-within:bg-[#00E5CC]/5 transition-colors">
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Short pitch for your clients (max 200 chars)..."
                            maxLength={200}
                            className="w-full bg-transparent text-[15px] font-medium text-white focus:outline-none min-h-[120px] resize-none placeholder:text-white/10 leading-relaxed"
                        />
                    </div>
                </section>
            </div>


            {/* Crop Overlay */}
            {imageSrc && (
                <div className="fixed inset-0 z-[1000] bg-[#0d0f14] flex flex-col pt-10 pb-6 px-4 animate-in fade-in duration-300">
                    <div className="flex-1 relative mb-6 rounded-3xl overflow-hidden cyber-glass">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onCropComplete={(a, p) => setCroppedAreaPixels(p)}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="flex justify-between gap-4">
                        <button onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); setImageSrc(null); }} className="flex-1 py-4 bg-[#1a1f2e] text-white/40 rounded-2xl font-bold active-scale">Cancel</button>
                        <button
                            onClick={async () => {
                                WebApp.HapticFeedback.impactOccurred('medium');
                                if (imageSrc && croppedAreaPixels) {
                                    const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
                                    setPhotoUrl(cropped);
                                    setImageSrc(null);
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
