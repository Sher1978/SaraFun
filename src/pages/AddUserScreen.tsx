import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { updateSocialGraph } from '../services/userService';

export default function AddUserScreen() {
    const navigate = useNavigate();
    const [uid, setUid] = useState('');
    const [loading, setLoading] = useState(false);

    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    const handleAdd = async () => {
        if (!uid.trim()) return;
        setLoading(true);
        WebApp.HapticFeedback.impactOccurred('medium');
        try {
            // Add to Shadow list by default
            await updateSocialGraph(currentUserUid, uid.trim(), 'Shadow');
            WebApp.showAlert("User added to your Shadow List!");
            navigate(-1);
        } catch (err) {
            console.error(err);
            WebApp.showAlert("Error adding user to Radar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-tg-main text-tg-primary min-h-screen space-y-6 pb-24">
            <header className="relative pl-8 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute -left-2 top-0 p-2 text-tg-hint active:text-tg-primary transition-colors"
                >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-2xl font-black">Add to Radar</h1>
                <p className="text-xs text-tg-hint uppercase tracking-widest font-bold">Grow your network</p>
            </header>

            <section className="bg-tg-secondary/50 rounded-3xl p-6 border border-tg-hint/10 space-y-4">
                <p className="text-sm text-tg-hint mb-2">
                    Enter the Telegram UID of the user you wish to track. They will be added to your <span className="text-tg-primary font-bold">Shadow List</span> by default.
                </p>

                <div>
                    <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">Telegram UID</label>
                    <input
                        type="text"
                        value={uid}
                        onChange={(e) => setUid(e.target.value)}
                        placeholder="e.g. 123456789"
                        className="w-full bg-tg-main border border-tg-hint/20 rounded-xl p-4 outline-none focus:border-teal-500 font-mono"
                    />
                </div>

                <button
                    onClick={handleAdd}
                    disabled={loading || !uid.trim()}
                    className={`w-full mt-4 py-4 rounded-xl font-bold uppercase tracking-widest transition-transform ${loading || !uid.trim() ? 'bg-tg-hint/20 text-tg-hint' : 'bg-teal-500 text-black active:scale-95 shadow-lg shadow-teal-500/20'}`}
                >
                    {loading ? 'Adding...' : 'Add User'}
                </button>
            </section>
        </div>
    );
}
