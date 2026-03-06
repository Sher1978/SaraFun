import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { updateMasterProfile } from '../services/userService';
import { t } from '../i18n';

const SECTORS = ['Auto', 'Health', 'Beauty', 'Tech', 'Legal', 'Home', 'Pets', 'Other'];

export default function EditMasterProfile() {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [category, setCategory] = useState('Other');
    const [rate, setRate] = useState(0);
    const [loading, setLoading] = useState(false);

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
            }
        };
        loadProfile();
    }, [uid]);

    const handleSave = async () => {
        setLoading(true);
        WebApp.HapticFeedback.impactOccurred('medium');
        await updateMasterProfile(uid, {
            business_name: name,
            bio,
            category,
            hourly_rate: rate
        });
        setLoading(false);
        WebApp.showAlert(t('save') + "!");
    };

    return (
        <div className="p-6 bg-tg-main text-tg-primary min-h-screen space-y-6">
            <header>
                <h1 className="text-2xl font-black">{t('business_identity')}</h1>
                <p className="text-xs text-tg-hint uppercase tracking-widest font-bold">Master Profile Edit</p>
            </header>

            <section className="space-y-4">
                <div className="bg-tg-secondary rounded-2xl overflow-hidden border border-tg-hint/10">
                    <div className="p-4 border-b border-tg-hint/10">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">Business Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Arctic Car Wash"
                            className="w-full bg-transparent text-sm focus:outline-none"
                        />
                    </div>

                    <div className="p-4 border-b border-tg-hint/10">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">{t('category')}</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-transparent text-sm focus:outline-none appearance-none"
                        >
                            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="p-4 border-b border-tg-hint/10">
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">{t('hourly_rate')}</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full bg-transparent text-sm focus:outline-none"
                        />
                    </div>

                    <div className="p-4">
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

            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-tg-button text-tg-button-text py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/10 active:scale-95 transition-transform"
            >
                {loading ? '...' : t('save')}
            </button>
        </div>
    );
}
