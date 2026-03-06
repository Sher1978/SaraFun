import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { updateSocialGraph, CircleId } from '../services/userService';
import { notifyGoldenFive } from '../services/RealTimeNotifications';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Radar Rings Configuration
// 15 = Gold, 50 = Silver (light blue), 150 = Bronze, Top5 = Teal/Diamond
const RINGS_CONFIG = [
    { id: '150', max: 150, radius: 170, color: 'rgba(180, 83, 9, 0.3)' }, // Bronze
    { id: '50', max: 50, radius: 130, color: 'rgba(125, 211, 252, 0.3)' }, // Silver/Light Blue
    { id: '15', max: 15, radius: 90, color: 'rgba(234, 179, 8, 0.4)' }, // Gold
    { id: 'Top5', max: 5, radius: 50, color: 'rgba(20, 184, 166, 0.7)' }, // Teal
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

    // Determine styling based on ring status
    let statusStyle = 'bg-tg-hint/10 border-tg-hint/30 text-tg-primary grayscale'; // Default (Shadow)
    if (status === 'Top5') statusStyle = 'bg-teal-500/10 border-teal-500 text-teal-100 shadow-[0_0_8px_rgba(20,184,166,0.6)]';
    if (status === '15') statusStyle = 'bg-yellow-500/10 border-yellow-500 text-yellow-100 shadow-[0_0_8px_rgba(234,179,8,0.6)]';
    if (status === '50') statusStyle = 'bg-sky-300/10 border-sky-300 text-sky-100 shadow-[0_0_8px_rgba(125,211,252,0.4)]';
    if (status === '150') statusStyle = 'bg-amber-700/10 border-amber-700 text-amber-100 shadow-[0_0_8px_rgba(180,83,9,0.4)]';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex flex-col items-center gap-1 snap-start relative touch-none group"
        >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-black border-2 backdrop-blur-sm transition-all ${isDragging ? 'scale-110 opacity-80' : ''} ${statusStyle}`}>
                {uid.substring(0, 2)}
            </div>
            <span className="text-[10px] text-tg-primary/80 truncate w-14 text-center font-medium group-hover:text-tg-primary">{uid}</span>
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
        : ring.color;

    // Match glow color to ring color
    const glowColor = ring.id === '15' ? 'rgba(234,179,8,0.5)' :
        ring.id === '50' ? 'rgba(125,211,252,0.5)' :
            ring.id === '150' ? 'rgba(180,83,9,0.5)' :
                'rgba(20,184,166,0.6)';

    return (
        <g ref={setNodeRef as any} onClick={onClick} className="cursor-pointer group">
            <path
                d={`M ${200 - ring.radius} 200 A ${ring.radius} ${ring.radius} 0 0 1 ${200 + ring.radius} 200`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="38"
                style={{ filter: isActive || isOver ? `drop-shadow(0 0 12px ${glowColor})` : 'none' }}
                className={`transition-all duration-300 origin-bottom`}
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
    const navigate = useNavigate();
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
                <div className={`absolute w-full px-4 transition-all duration-300 z-[10] top-4`}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search semantic network..."
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={() => setIsSearchActive(false)}
                        className="w-full bg-tg-secondary/80 backdrop-blur-xl border border-tg-hint/30 text-tg-primary rounded-xl px-4 py-3 placeholder:text-tg-hint/60 outline-none shadow-lg"
                    />
                </div>

                {/* Z-Index 1: The Dunbar Radar */}
                <div className="absolute bottom-[40%] w-full flex justify-center z-[1] transition-transform duration-500 scale-125 origin-bottom">
                    <svg viewBox="0 0 400 200" className="w-full max-w-[600px] overflow-visible">
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

                        <g onClick={() => navigate('/add-user')} className="cursor-pointer hover:drop-shadow-[0_0_15px_rgba(20,184,166,1)] transition-all">
                            <circle cx="200" cy="200" r="24" className="fill-tg-main pointer-events-none" />
                            <circle cx="200" cy="200" r="20" className="fill-teal-500 drop-shadow-[0_0_12px_rgba(20,184,166,0.9)] pointer-events-none" />
                            <text x="200" y="200" textAnchor="middle" alignmentBaseline="central" className="fill-white text-2xl font-black pointer-events-none">+</text>
                        </g>
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
