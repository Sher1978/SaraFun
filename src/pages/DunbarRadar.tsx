import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { updateSocialGraph, CircleId } from '../services/userService';
import { notifyGoldenFive } from '../services/RealTimeNotifications';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Radar Rings Configuration
const RINGS_CONFIG = [
    { id: '150', max: 150, radius: 170, opacity: 'rgba(13, 148, 136, 0.2)' },
    { id: '50', max: 50, radius: 130, opacity: 'rgba(13, 148, 136, 0.4)' },
    { id: '15', max: 15, radius: 90, opacity: 'rgba(13, 148, 136, 0.6)' },
    { id: 'Top5', max: 5, radius: 50, opacity: 'rgba(13, 148, 136, 0.8)' },
];

function DraggableAvatar({ uid, status }: { uid: string, status: string }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: uid,
        data: { currentStatus: status }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex flex-col items-center gap-1 snap-start relative touch-none"
        >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-medium border-2 shadow-sm ${isDragging ? 'bg-teal-500/30 border-teal-500 text-teal-100' : 'bg-tg-hint/20 border-tg-hint/10 text-tg-primary'
                }`}>
                {uid.substring(0, 2)}
            </div>
            <span className="text-[10px] text-tg-primary truncate w-14 text-center">{uid}</span>
        </div>
    );
}

function DroppableArc({ ring, currentCount, isActive, onClick, children }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: ring.id,
        data: { maxContent: ring.max, currentContent: currentCount }
    });

    // Logic: Glow red if full, green if available
    const isFull = currentCount >= ring.max;
    const strokeColor = isOver
        ? (isFull ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)') // Red or Green
        : ring.opacity;

    return (
        <g ref={setNodeRef as any} onClick={onClick} className="cursor-pointer">
            <path
                d={`M ${200 - ring.radius} 200 A ${ring.radius} ${ring.radius} 0 0 1 ${200 + ring.radius} 200`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="38"
                className={`transition-all duration-300 origin-bottom ${isActive || isOver ? 'drop-shadow-[0_0_10px_rgba(20,184,166,0.6)]' : ''}`}
            />
            <text
                x="200"
                y={200 - ring.radius + 4}
                textAnchor="middle"
                alignmentBaseline="middle"
                className={`fill-tg-primary text-[10px] font-bold pointer-events-none ${isOver && isFull ? 'fill-red-500' : ''}`}
            >
                {currentCount}/{ring.max}
            </text>
            {children}
        </g>
    );
}

export default function DunbarRadar() {
    const [activeRing, setActiveRing] = useState<string | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);

    // Real-time DB State
    const [socialGraph, setSocialGraph] = useState<Record<string, string>>({});
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    useEffect(() => {
        const userRef = doc(db, 'Users', currentUserUid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSocialGraph(data.social_graph || {});
            } else {
                // Dev mock
                setSocialGraph({ 'john': 'Shadow', 'alex': 'Top5' });
            }
        });

        return () => unsubscribe();
    }, [currentUserUid]);

    const getRingCount = (ringId: string) => {
        return Object.values(socialGraph).filter((status) => status === ringId).length;
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (over && active.id) {
            const targetRing = over.id as CircleId;
            const uidDragged = active.id;
            const currentCount = getRingCount(targetRing);
            const maxCount = over.data.current?.maxContent;

            if (currentCount < maxCount) {
                // Perform DB Update
                await updateSocialGraph(currentUserUid, uidDragged, targetRing);

                // Dopamine Trigger: Notify Master if promoted to Top 5
                if (targetRing === 'Top5') {
                    notifyGoldenFive(uidDragged, WebApp.initDataUnsafe?.user?.first_name || 'A user');
                }

                WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                WebApp.HapticFeedback.notificationOccurred('error');
                WebApp.showAlert(`Ring ${targetRing} is full!`);
            }
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    // ... (rest of the state)

    // Contacts to render in the bottom row (defaults to Shadow List, or currently active ring)
    const contactsToShow = Object.entries(socialGraph).filter(([uid, status]) => {
        const matchesRing = activeRing ? status === activeRing : status === 'Shadow';
        const matchesSearch = uid.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRing && matchesSearch;
    });

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="relative h-full w-full bg-tg-main text-tg-primary overflow-hidden flex flex-col justify-end">

                {/* Z-Index 8: Search Bar */}
                <div className={`absolute w-full px-4 transition-all duration-300 z-[8] ${isSearchActive ? 'top-10' : 'top-20'}`}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search semantic network..."
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={() => setIsSearchActive(false)}
                        className="w-full bg-tg-secondary/60 backdrop-blur-xl border border-tg-hint/20 text-tg-primary rounded-xl px-4 py-3 placeholder:text-tg-hint/60 outline-none"
                    />
                </div>

                {/* Z-Index 1: The Dunbar Radar */}
                <div className="absolute bottom-32 w-full flex justify-center z-[1] transition-transform duration-500">
                    <svg viewBox="0 0 400 200" className="w-[120%] max-w-[500px] overflow-visible">
                        {RINGS_CONFIG.map((ring) => {
                            const isActive = activeRing === ring.id;
                            const currentCount = getRingCount(ring.id);

                            return (
                                <DroppableArc
                                    key={ring.id}
                                    ring={ring}
                                    currentCount={currentCount}
                                    isActive={isActive}
                                    onClick={() => setActiveRing(activeRing === ring.id ? null : ring.id)}
                                />
                            );
                        })}

                        <circle cx="200" cy="200" r="20" className="fill-tg-main" />
                        <circle cx="200" cy="200" r="16" className="fill-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                        <text x="200" y="200" textAnchor="middle" alignmentBaseline="central" className="fill-white text-xl font-medium pointer-events-none">+</text>
                    </svg>
                </div>

                {/* Z-Index 9: Shadow List or Active Ring Contacts */}
                <div className="absolute bottom-0 w-full bg-tg-secondary/70 backdrop-blur-2xl border-t border-tg-hint/20 z-[9] pb-16 pt-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <div className="w-12 h-1.5 bg-tg-hint/30 rounded-full mx-auto mb-4" />

                    <div className="px-4 mb-2 flex justify-between items-end">
                        <h3 className="font-semibold text-sm">{activeRing ? `Ring: ${activeRing}` : 'Shadow List'}</h3>
                        <span className="text-[10px] text-tg-hint uppercase tracking-wider font-bold">Drag to Rings</span>
                    </div>

                    <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x hide-scrollbar h-24 items-center">
                        {contactsToShow.map(([uid, status]) => (
                            <DraggableAvatar key={uid} uid={uid} status={status} />
                        ))}
                        {contactsToShow.length === 0 && (
                            <div className="text-tg-hint text-sm italic w-full text-center">No contacts here</div>
                        )}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
