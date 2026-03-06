import React, { useState } from 'react';

interface InfoTooltipProps {
    text: string;
    title?: string;
}

export default function InfoTooltip({ text, title }: InfoTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block ml-1">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-4 h-4 rounded-full border border-tg-hint/30 text-tg-hint flex items-center justify-center text-[10px] font-bold pb-[1px] hover:text-white hover:border-white transition-colors"
            >
                i
            </button>

            {isOpen && (
                <>
                    {/* Invisible backdrop to dismiss click outside */}
                    <div
                        className="fixed inset-0 z-[110]"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                    />

                    {/* The popup */}
                    <div className="absolute z-[120] bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-tg-secondary/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl animate-fade-in pointer-events-none">
                        <div className="relative z-10 w-full">
                            {title && <h4 className="text-[10px] font-black uppercase tracking-widest text-tg-primary mb-1">{title}</h4>}
                            <p className="text-xs text-tg-primary/80 font-medium leading-relaxed">
                                {text}
                            </p>
                        </div>
                        {/* Caret */}
                        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-tg-secondary/90 border-b border-r border-white/10 rotate-45" />
                    </div>
                </>
            )}
        </div>
    );
}
