import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { ArbitrationService } from '../services/ArbitrationService';

export default function SocialArbitration({ masterUid, reviewId, reviewText }: { masterUid: string, reviewId: string, reviewText: string }) {
    const navigate = useNavigate();
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
        <div className="p-6 bg-tg-main text-tg-primary min-h-screen flex flex-col gap-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-black">Social Arbitration</h1>
                <p className="text-xs text-tg-hint uppercase tracking-widest font-bold">Dispute Center</p>
            </header>

            <section className="bg-tg-secondary/50 border border-tg-hint/10 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-tg-hint mb-2 uppercase">Original Review</h3>
                <p className="text-sm italic">"{reviewText}"</p>
            </section>

            <div className="flex flex-col gap-4">
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

            <div className="mt-auto flex flex-col gap-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-3 items-center">
                    <span className="text-2xl">⚖️</span>
                    <p className="text-[10px] text-yellow-500 font-bold uppercase leading-tight">
                        Bible 2.4: You must stake 500⭐️ ($10). <br />
                        If Dispute is lost, the amount is burnt & karma is lost.
                    </p>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-tg-hint/20 text-tg-hint' : 'bg-tg-button text-tg-button-text shadow-lg active:scale-[0.98]'
                        }`}
                >
                    {isSubmitting ? 'Submitting...' : 'Stake 500⭐️ & Submit Dispute'}
                </button>
            </div>
        </div>
    );
}
