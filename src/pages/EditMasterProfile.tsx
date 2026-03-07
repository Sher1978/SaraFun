import React, { useState, useEffect, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { updateMasterProfile } from '../services/userService';
import { t } from '../i18n';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';

const SECTORS = ['Auto', 'Health', 'Beauty', 'Tech', 'Legal', 'Home', 'Pets', 'Other'];

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

export default function EditMasterProfile() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [category, setCategory] = useState('Other');
    const [rate, setRate] = useState(0);
    const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Crop States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const uid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    useEffect(() => {
        const loadProfile = async () => {
            const snap = await getDoc(doc(db, 'Users', uid));
            if (snap.exists() && snap.data().master_profile) {
                const p = snap.data().master_profile;
                setName(p.business_name || '');
                setBio(p.bio || '');
                setCategory(p.category || 'Other');
                setRate(p.hourly_rate || 0);
                setPhotoDataUrl(p.photo_url || null);
            }
        };
        loadProfile();
    }, [uid]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            setPhotoDataUrl(croppedImage);
            setImageSrc(null); // Close crop modal
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels]);

    const handleSave = async () => {
        try {
            setLoading(true);
            WebApp.HapticFeedback.impactOccurred('medium');
            await updateMasterProfile(uid, {
                business_name: name,
                bio,
                category,
                hourly_rate: rate,
                photo_url: photoDataUrl || ''
            });
            WebApp.showAlert(t('save') + "!");
            navigate(-1);
        } catch (err: any) {
            console.error("Save error:", err);
            WebApp.showAlert("Failed to save: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3 bg-tg-main text-tg-primary min-h-screen space-y-6 pb-24">
            <header className="h-14 border-b border-tg-hint/10 flex items-center justify-between px-4 bg-tg-bg sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="text-tg-hint font-bold px-2 py-1 -ml-2 active:opacity-50">Back</button>
                <h1 className="text-base font-bold">Business Identity</h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="text-teal-500 font-bold px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {loading ? '...' : 'Save'}
                </button>
            </header>

            <section className="space-y-4">
                <div className="bg-tg-secondary rounded-xl overflow-hidden border border-tg-hint/10">

                    {/* Photo Upload Area */}
                    <div className="p-3 border-b border-tg-hint/10 flex flex-col items-center">
                        <label className="text-[10px] font-black text-tg-hint uppercase block w-full mb-4">Business Photo</label>
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-tg-main border-2 border-dashed border-tg-hint/30 flex items-center justify-center">
                            {photoDataUrl ? (
                                <img src={photoDataUrl} alt="Business" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-base opacity-50">📸</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] text-tg-hint mt-2 text-center uppercase tracking-widest">Tap to Upload Photo</p>
                    </div>

                    <div className="p-3 border-b border-tg-hint/10">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">Business Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Arctic Car Wash"
                            className="w-full bg-transparent text-sm focus:outline-none"
                        />
                    </div>

                    <div className="p-3 border-b border-tg-hint/10">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">{t('category')}</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-transparent text-sm focus:outline-none appearance-none"
                        >
                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="p-3 border-b border-tg-hint/10">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">{t('hourly_rate')} ($)</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full bg-transparent text-sm focus:outline-none"
                        />
                    </div>

                    <div className="p-3">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">{t('bio')}</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell clients why they should trust you..."
                            className="w-full bg-transparent text-sm focus:outline-none h-24"
                        />
                    </div>
                </div>
            </section>


            {/* Crop Modal */}
            {imageSrc && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col pt-10 pb-6 px-4">
                    <div className="flex-1 relative mb-4 rounded-xl overflow-hidden bg-tg-secondary">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="flex justify-between gap-3">
                        <button
                            onClick={() => setImageSrc(null)}
                            className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-bold active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={showCroppedImage}
                            className="flex-1 py-4 bg-yellow-500 text-black rounded-xl font-bold active:scale-95"
                        >
                            Crop Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
