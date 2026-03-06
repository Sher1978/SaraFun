import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { ReferralService } from '../services/ReferralService';
import { useNavigate } from 'react-router-dom';

export default function ReferralDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalInvited: 0, starsEarned: 0 });
    const [invitedBy, setInvitedBy] = useState<{ uid: string, name: string } | null>(null);
    const [invitees, setInvitees] = useState<{ uid: string, name: string, joinedAt: any }[]>([]);
    const [copyFeedback, setCopyFeedback] = useState(false);

    // Fallback ID to test easily in browser if user isn't available
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user';
    const inviteLink = ReferralService.generateInviteLink(currentUserUid);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await ReferralService.getReferralStats(currentUserUid);
            setStats({ totalInvited: data.totalInvited, starsEarned: Number(data.starsEarned) || 0 });
            setInvitedBy(data.invitedBy);
            setInvitees(data.invitees);
        };
        fetchStats();
    }, [currentUserUid]);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        WebApp.HapticFeedback.notificationOccurred('success');
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    return (
        <div className="min-h-full bg-tg-main text-tg-primary px-4 pt-6 pb-24 space-y-8">
            <header className="relative text-center space-y-2">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 top-0 p-2 text-tg-hint active:text-tg-primary transition-colors"
                >
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic pt-1">Referral Empire</h1>
                <p className="text-tg-hint text-sm">Scale your network. Earn together.</p>
            </header>

            {/* Invited By Banner */}
            {invitedBy && (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-3 flex items-center justify-center gap-2 text-sm font-medium">
                    <span className="text-teal-500 font-bold uppercase tracking-widest text-[10px]">Invited By:</span>
                    <span className="text-tg-primary">{invitedBy.name}</span>
                </div>
            )}

            {/* Stats Cards */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-tg-secondary/50 border border-tg-hint/10 p-5 rounded-3xl text-center">
                    <div className="text-[10px] uppercase font-black text-tg-hint mb-1">Friends Joined</div>
                    <div className="text-3xl font-bold text-teal-500">{stats.totalInvited}</div>
                </div>
                <div className="bg-tg-secondary/50 border border-tg-hint/10 p-5 rounded-3xl text-center">
                    <div className="text-[10px] uppercase font-black text-tg-hint mb-1">Stars Earned</div>
                    <div className="text-3xl font-bold text-yellow-500">⭐ {stats.starsEarned}</div>
                </div>
            </section>

            {/* Invite Action */}
            <section className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <h2 className="text-xl font-bold">Your Unique Invite Key</h2>
                    <div className="bg-tg-main/40 p-4 rounded-xl font-mono text-xs break-all border border-tg-hint/10">
                        {inviteLink}
                    </div>

                    <button
                        onClick={handleCopy}
                        className="w-full bg-teal-500 text-white h-12 rounded-2xl font-bold text-lg shadow-[0_0_25px_rgba(20,184,166,0.3)] relative"
                    >
                        {copyFeedback ? 'Link Copied!' : 'Copy Invite Link'}

                        <AnimatePresence>
                            {copyFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: -40 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-1/2 -translate-x-1/2 text-teal-400 font-bold text-sm whitespace-nowrap"
                                >
                                    🚀 Expanding Empire...
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />
            </section>

            {/* Invitees List */}
            {invitees.length > 0 && (
                <section className="space-y-3 px-2">
                    <h3 className="text-sm font-black uppercase text-tg-hint tracking-widest leading-none">Your Network Level 1</h3>
                    <div className="space-y-2">
                        {invitees.map((invitee, idx) => (
                            <div key={idx} className="bg-tg-secondary/50 border border-tg-hint/10 rounded-xl p-3 flex justify-between items-center">
                                <span className="font-semibold text-sm">{invitee.name}</span>
                                <span className="text-xs text-teal-500 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">Active</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Rules/Info */}
            <section className="space-y-4 px-2">
                <h3 className="text-sm font-black uppercase text-tg-hint tracking-widest leading-none">The Network Protocol</h3>
                <div className="space-y-3">
                    {[
                        "Earn a % from transactions in your 3-level network (1% default).",
                        "Building a web of trust increases your Dunbar Reputation.",
                        "Rewards flow via smart contracts instantly to your balance."
                    ].map((text, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm opacity-80">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0 mt-1.5" />
                            <p className="leading-tight">{text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
