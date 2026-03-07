import React from 'react';
import WebApp from '@twa-dev/sdk';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BusinessLanding() {
    const navigate = useNavigate();

    const handleStartBusiness = () => {
        WebApp.HapticFeedback.impactOccurred('heavy');
        navigate('/master-editor');
    };

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white px-6 pt-10 pb-24 relative overflow-hidden flex flex-col justify-between font-['Inter']">
            {/* Background elements for glassmorphism */}
            <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-[#00E5CC]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[15%] right-[-10%] w-72 h-72 bg-[#00E5CC]/10 rounded-full blur-[100px]" />

            <div className="relative z-10 flex-1 flex flex-col items-center text-center space-y-8 mt-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-24 h-24 bg-gradient-to-br from-[#00E5CC]/20 to-[#00E5CC]/5 rounded-2xl cyber-glass flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(0,229,204,0.15)]"
                >
                    <span className="text-5xl filter drop-shadow-[0_0_10px_rgba(0,229,204,0.5)]">💼</span>
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-[34px] font-black tracking-tight uppercase leading-[0.9] neon-text neon-glow">
                        Ignite Your <br /> Empire
                    </h1>
                    <p className="text-white/40 text-[13px] font-medium px-6 leading-relaxed">
                        Transform your skills into a thriving digital business on SaraFun. <br /> Connect through the web of trust.
                    </p>
                </div>

                <div className="w-full space-y-3 pt-4 text-left">
                    {[
                        { icon: '⭐', title: 'Earn Stars', desc: 'Secure payments in digital assets.' },
                        { icon: '🛡️', title: 'Zero Scam', desc: 'Protected by our 60-sec undo buffer.' },
                        { icon: '🕸️', title: 'Viral Growth', desc: 'Leverage the Dunbar referral network.' }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + 0.1 * i }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-xl active-scale"
                            onClick={() => WebApp.HapticFeedback.impactOccurred('light')}
                        >
                            <div className="text-xl">{feature.icon}</div>
                            <div>
                                <h3 className="font-bold text-[14px] text-white/90">{feature.title}</h3>
                                <p className="text-[11px] text-white/40 font-medium uppercase tracking-wide">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 w-full flex flex-col gap-3 mt-8">
                <button
                    onClick={handleStartBusiness}
                    className="w-full bg-[#00E5CC] text-[#0d0f14] h-14 rounded-2xl font-black text-base uppercase tracking-widest shadow-[0_0_25px_rgba(0,229,204,0.4)] active-scale transition-all"
                >
                    Create Business Profile
                </button>
                <button
                    onClick={() => { WebApp.HapticFeedback.impactOccurred('light'); navigate(-1); }}
                    className="w-full text-white/30 text-[11px] font-bold uppercase tracking-[0.2em] py-4 active:text-[#00E5CC] transition-colors"
                >
                    Not Now
                </button>
            </div>
        </div>
    );
}
