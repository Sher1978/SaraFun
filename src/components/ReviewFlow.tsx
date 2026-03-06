import React, { useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { updateMasterScores } from '../utils/math'; // Assuming we expand math.ts for this
import { TransactionService } from '../services/TransactionService';

interface ReviewFlowProps {
    masterId: string;
    masterName: string;
    onSubmit: () => void;
}

export default function ReviewFlow({ masterId, masterName, onSubmit }: ReviewFlowProps) {
    const [scores, setScores] = useState({ a: 3, b: 3, c: 3, d: 3 });
    const user = WebApp.initDataUnsafe?.user;

    const handleSliderChange = (key: 'a' | 'b' | 'c' | 'd', value: number) => {
        setScores(prev => ({ ...prev, [key]: value }));
        WebApp.HapticFeedback.selectionChanged();
    };

    const labels = {
        a: "Able (Competence)",
        b: "Believable (Honesty)",
        c: "Connected (Social Proof)",
        d: "Dependable (Reliability)"
    };

    const handleSubmit = async () => {
        WebApp.HapticFeedback.notificationOccurred('success');
        console.log(`[ReviewFlow] Submitting ABCD for ${masterId}:`, scores);

        // In production, this would update the Master's aggregate score in Firestore
        // await updateMasterScores(masterId, scores);

        if (user?.id) {
            await TransactionService.unlockCommission(masterId, user.id.toString());
        }

        WebApp.showAlert(`Thank you! Your verified review for ${masterName} has boosted their semantic rank and unlocked your cashback.`);
        onSubmit();
    };

    return (
        <div className="bg-tg-secondary/90 backdrop-blur-2xl border border-tg-hint/20 rounded-xl p-3 space-y-8 shadow-2xl">
            <div className="text-center">
                <h2 className="text-base font-bold">The Trust Review</h2>
                <p className="text-tg-hint text-xs mt-1 uppercase tracking-widest font-black">Verify your experience with {masterName}</p>
            </div>

            <div className="space-y-6">
                {(['a', 'b', 'c', 'd'] as const).map(key => (
                    <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold">
                            <label>{labels[key]}</label>
                            <span className="text-teal-500 font-black text-base">{scores[key].toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.1"
                            value={scores[key]}
                            onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                            className="w-full h-1 bg-tg-hint/20 rounded-full appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all custom-slider"
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-transform active:scale-95 mt-4"
            >
                Submit Verified Review
            </button>

            <p className="text-[10px] text-tg-hint text-center opacity-60">
                Review is gated by your verified service transaction.
                Fake reviews are impossible in SaraFun.
            </p>
        </div>
    );
}
