import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebApp from '@twa-dev/sdk';
import { setOnboarded } from '../services/userService';

const STEPS = [
    {
        title: "Quality over Quantity",
        description: "In SaraFun, trust is finite. You only have 220 slots in your network. Use them wisely for experts you actually know.",
        icon: "💎",
        color: "from-teal-500/20 to-teal-600/10"
    },
    {
        title: "Spatial Trust",
        description: "Your Top 5 closest friends glow gold on the map. Find reliable services through the eyes of people you trust.",
        icon: "🗺️",
        color: "from-yellow-400/20 to-teal-500/10"
    },
    {
        title: "Earn with Stars",
        description: "Become a Master and earn Telegram Stars. Every deal you make builds your global Trust Index.",
        icon: "⭐",
        color: "from-teal-400/20 to-blue-500/10"
    }
];

export default function Onboarding({ uid, onComplete }: { uid: string, onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        WebApp.HapticFeedback.impactOccurred('light');
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
            setOnboarded(uid);
        }
    };

    const handleSkip = () => {
        WebApp.HapticFeedback.impactOccurred('light');
        onComplete();
        setOnboarded(uid);
    };

    const step = STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-[100] bg-tg-main flex items-center justify-center p-3 overflow-hidden">
            {/* Skip Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={handleSkip}
                className="absolute top-8 right-8 z-10 px-4 py-2 rounded-full bg-tg-secondary/50 border border-tg-hint/10 text-xs font-bold text-tg-hint backdrop-blur-md active:scale-95 transition-transform"
            >
                Skip
            </motion.button>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`w-full max-w-sm aspect-[4/5] bg-gradient-to-br ${step.color} rounded-[40px] border border-tg-hint/10 p-3 flex flex-col items-center text-center backdrop-blur-3xl shadow-2xl relative overflow-hidden`}
                >
                    {/* Decorative background blobs */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/5 blur-3xl rounded-full" />

                    <div className="text-7xl mb-5 mt-4 drop-shadow-lg">{step.icon}</div>
                    <h2 className="text-base font-black mb-4 tracking-tight">{step.title}</h2>
                    <p className="text-tg-hint text-sm leading-relaxed mb-12 px-2">
                        {step.description}
                    </p>

                    <div className="mt-auto w-full space-y-4">
                        {/* Progress indicators */}
                        <div className="flex gap-2 justify-center mb-4">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-teal-500' : 'w-2 bg-tg-hint/20'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-tg-button text-tg-button-text h-12 rounded-xl font-bold shadow-xl transition-transform active:scale-95"
                        >
                            {currentStep === STEPS.length - 1 ? "Enter SaraFun" : "Next"}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
