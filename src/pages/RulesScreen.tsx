import React from 'react';
import { t } from '../i18n';
import { useNavigate } from 'react-router-dom';

const LAWS = [
    { id: 1, title: "DUNBAR LIMITS", body: "No user shall exceed 220 trusted nodes. Quality is the only currency." },
    { id: 2, title: "TRUTH IN STAKING", body: "Every dispute requires a skin-in-the-game stake. False claims burn Stars." },
    { id: 3, title: "TRANSPARENCY", body: "All reviews are public and permanent. Trust is built in the open." },
    { id: 4, title: "COMMUNITY HONOR", body: "Harassment or spam leads to immediate burning of your trust index." },
    { id: 5, title: "MASTER SOVEREIGNTY", body: "Masters are independent nodes. SaraFun is the bridge, not the owner." }
];

export default function RulesScreen() {
    const navigate = useNavigate();

    return (
        <div className="p-3 bg-tg-main text-tg-primary min-h-screen space-y-8">
            <header className="relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute -left-2 -top-2 p-2 text-tg-hint active:text-tg-primary transition-colors"
                >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-base font-black italic tracking-tighter pl-8 pt-1">{t('laws_title')}</h1>
                <div className="h-1 w-20 bg-teal-500 mt-2 rounded-full ml-8" />
            </header>

            <div className="space-y-6">
                {LAWS.map(law => (
                    <div key={law.id} className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-teal-500 font-black text-base">0{law.id}</span>
                            <h3 className="font-bold uppercase tracking-widest text-sm text-tg-hint">{law.title}</h3>
                        </div>
                        <p className="pl-9 text-tg-primary leading-relaxed font-medium">
                            {law.body}
                        </p>
                    </div>
                ))}
            </div>

            <footer className="pt-12 pb-6 border-t border-tg-hint/10">
                <p className="text-[10px] text-tg-hint uppercase font-black text-center tracking-[0.2em]">
                    Community Law v1.0 • Enforcement via TWA 3.0
                </p>
            </footer>
        </div>
    );
}
