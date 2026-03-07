import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { ArbitrationService } from '../services/ArbitrationService';

export default function SocialArbitration() {
    const navigate = useNavigate();
    const location = useLocation();

    // Read from route state or use defaults
    const state = location.state || {};
    const masterUid = state.masterUid || 'unknown';
    const reviewId = state.reviewId || 'unknown';
    const reviewText = state.reviewText || 'MOCK REVIEW FOR DISPUTE';

    const [evidence, setEvidence] = useState('');
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!evidence || !response) {
            WebApp.showAlert('Please provide evidence and response.');
            return;
        }

        setIsSubmitting(true);
        const success = await ArbitrationService.submitDispute(masterUid, reviewId, evidence, response);
        setIsSubmitting(false);

        if (success) {
            WebApp.HapticFeedback.impactOccurred('medium');
            navigate(-1);
        }
    };

    return (
        <div className="p-3 bg-tg-main text-tg-primary min-h-screen flex flex-col gap-3 pb-24">
            <header className="h-14 border-b border-tg-hint/10 flex items-center justify-between px-4 bg-tg-bg sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="text-tg-hint font-bold px-2 py-1 -ml-2 active:opacity-50">Back</button>
                <h1 className="text-base font-bold">Dispute Center</h1>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="text-red-500 font-bold px-2 py-1 -mr-2 active:opacity-50 disabled:opacity-30 transition-opacity"
                >
                    {isSubmitting ? '...' : 'Stake'}
                </button>
            </header>

            <section className="bg-tg-secondary/50 border border-tg-hint/10 rounded-xl p-3">
                <h3 className="text-xs font-bold text-tg-hint mb-2 uppercase">Original Review</h3>
                <p className="text-sm italic">"{reviewText}"</p>
            </section>

            <div className="flex flex-col gap-3">
                <div>
                    <label className="text-xs font-bold mb-2 block text-tg-hint uppercase">Your Public Response</label>
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Explain your side to the community..."
                        className="w-full bg-tg-secondary border border-tg-hint/20 rounded-xl p-3 text-sm focus:border-teal-500 outline-none h-24"
                    />
                </div>

                <div>
                    <label className="text-xs font-bold mb-2 block text-tg-hint uppercase">Evidence Link (Photo/Video)</label>
                    <input
                        type="text"
                        value={evidence}
                        onChange={(e) => setEvidence(e.target.value)}
                        placeholder="Link to media in chat or drive..."
                        className="w-full bg-tg-secondary border border-tg-hint/20 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-3 items-center">
                    <span className="text-base">⚖️</span>
                    <p className="text-[10px] text-yellow-500 font-bold uppercase leading-tight">
                        Bible 2.4: You must stake 500⭐️ ($10). <br />
                        If Dispute is lost, the amount is burnt & karma is lost.
                    </p>
                </div>
            </div>
        </div>
    );
}
