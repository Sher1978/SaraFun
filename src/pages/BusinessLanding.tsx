import React from 'react';
import WebApp from '@twa-dev/sdk';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BusinessLanding() {
    const navigate = useNavigate();

    const handleStartBusiness = () => {
        WebApp.HapticFeedback.impactOccurred('heavy');
        navigate('/edit-master');
    };

    return (
        <div className="min-h-screen bg-tg-main text-tg-primary px-4 pt-8 pb-24 relative overflow-hidden flex flex-col justify-between">
            {/* Background elements for glassmorphism */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />

            <div className="relative z-10 flex-1 flex flex-col items-center text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.4)] flex items-center justify-center mb-4"
                >
                    <span className="text-5xl">💼</span>
                </motion.div>

                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">
                    Ignite Your <br /> <span className="text-yellow-500">Empire</span>
                </h1>

                <p className="text-tg-hint text-sm px-4">
                    Transform your skills into a thriving digital business on SaraFun. Connect with clients through the web of trust.
                </p>

                <div className="w-full space-y-4 pt-4 text-left">
                    {[
                        { icon: '⭐', title: 'Earn Stars', desc: 'Get paid instantly in crypto.' },
                        { icon: '🛡️', title: 'Zero Scam', desc: 'Protected by our 60-sec undo buffer.' },
                        { icon: '🕸️', title: 'Viral Growth', desc: 'Leverage the Dunbar referral network.' }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3 shadow-xl"
                        >
                            <div className="text-base">{feature.icon}</div>
                            <div>
                                <h3 className="font-bold text-sm">{feature.title}</h3>
                                <p className="text-xs text-tg-hint">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 w-full mt-5">
                <button
                    onClick={handleStartBusiness}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black h-12 rounded-xl font-black text-base uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.5)] active:scale-95 transition-all"
                >
                    Create Business Profile
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full text-tg-hint text-xs font-bold uppercase tracking-widest mt-4 p-2 active:text-tg-primary transition-colors"
                >
                    Not Now
                </button>
            </div>
        </div>
    );
}
