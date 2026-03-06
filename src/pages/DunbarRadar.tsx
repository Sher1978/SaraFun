import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import WebApp from '@twa-dev/sdk';
import { db } from '../firebase';
import { updateSocialGraph, CircleId } from '../services/userService';
import { notifyGoldenFive } from '../services/RealTimeNotifications';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';

// Radar Rings Configuration - Optimized spacing
const RINGS_CONFIG = [
    { id: '150', max: 150, radius: 180, color: '#f43f5e', opacity: 0.15, delay: '0.8s' }, // Reddish-Rose
    { id: '50', max: 50, radius: 135, color: '#0ea5e9', opacity: 0.25, delay: '0.6s' },  // Blue
    { id: '15', max: 15, radius: 95, color: '#d4af37', opacity: 0.35, delay: '0.4s' },   // Gold
    { id: 'Top5', max: 5, radius: 55, color: '#14b8a6', opacity: 0.55, delay: '0.2s' },   // Teal
];

function DraggableAvatar({ uid, status, photo, isOverlay = false }: { uid: string, status: string, photo?: string, isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: uid,
        data: { currentStatus: status }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        opacity: (isDragging && !isOverlay) ? 0 : 1,
    } : undefined;

    // Determine colors based on status
    const ringColors: Record<string, string> = {
        Top5: '#14b8a6',
        '15': '#d4af37',
        '50': '#0ea5e9',
        '150': '#f43f5e',
        Shadow: '#64748b'
    };

    const activeColor = ringColors[status] || ringColors.Shadow;

    if (isOverlay) {
        return (
            <div className="flex flex-col items-center gap-1 z-[100] pointer-events-none scale-110">
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black border-2 backdrop-blur-xl bg-tg-secondary/80 overflow-hidden"
                    style={{ borderColor: activeColor, boxShadow: `0 0 15px ${activeColor}40` }}
                >
                    {photo ? (
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                    ) : uid.substring(0, 2).toUpperCase()}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex flex-col items-center gap-1 snap-start relative touch-none group"
        >
            <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-black border-2 backdrop-blur-md transition-all overflow-hidden ${isDragging ? 'opacity-0' : 'hover:scale-105'}`}
                style={{
                    borderColor: activeColor,
                    backgroundColor: `${activeColor}10`,
                    boxShadow: status !== 'Shadow' ? `0 0 10px ${activeColor}20` : 'none'
                }}
            >
                {photo ? (
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : uid.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-[10px] text-tg-hint truncate w-14 text-center font-bold">{uid}</span>
        </div>
    );
}

function DroppableArc({ ring, currentCount, isActive, onClick, isDraggingAny }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: ring.id,
        data: { maxContent: ring.max, currentContent: currentCount }
    });

    const gradId = `grad-${ring.id}`;
    const glintId = `glint-${ring.id}`;

    const isFull = currentCount >= ring.max;
    const isNinetyPercent = currentCount >= ring.max * 0.9 && !isFull;

    let strokeColor = ring.color;
    if (isOver) strokeColor = isFull ? '#ef4444' : '#22c55e';

    return (
        <g ref={setNodeRef as any} onClick={onClick} className="cursor-pointer group">
            <defs>
                {/* Volumetric Gradient */}
                <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="50%" stopColor={strokeColor} stopOpacity="1" />
                    <stop offset="100%" stopColor="black" stopOpacity="0.3" />
                </linearGradient>
                {/* Glint Filter for volume effect */}
                <filter id={glintId}>
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#ffffff" result="specular">
                        <fePointLight x="200" y="50" z="100" />
                    </feSpecularLighting>
                    <feComposite in="specular" in2="SourceAlpha" operator="in" result="composite" />
                    <feMerge>
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode in="composite" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background Arch Shadow */}
            <path
                d={`M ${200 - ring.radius} 200 A ${ring.radius} ${ring.radius} 0 0 1 ${200 + ring.radius} 200`}
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="48"
                className="transition-all duration-300 pointer-events-none"
            />
            {/* Main Volumetric Arch */}
            <path
                d={`M ${200 - ring.radius} 200 A ${ring.radius} ${ring.radius} 0 0 1 ${200 + ring.radius} 200`}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth="42"
                strokeOpacity={isDraggingAny ? 0.3 : ring.opacity}
                filter={`url(#${glintId})`}
                className={`transition-all duration-500 origin-bottom animate-radar-pulse ${isActive || isOver ? 'scale-[1.02]' : ''}`}
                style={{
                    animationDelay: ring.delay,
                    // @ts-ignore
                    '--pulse-color': strokeColor,
                    '--base-opacity': isDraggingAny ? 0.3 : ring.opacity,
                    strokeDasharray: '2000',
                    strokeDashoffset: (isActive || isOver) ? '0' : '0'
                } as any}
            />
            <text
                x="200"
                y={200 - ring.radius}
                textAnchor="middle"
                alignmentBaseline="middle"
                className={`fill-white text-[12px] font-black pointer-events-none transition-all ${isOver ? 'scale-125' : ''}`}
            >
                {currentCount}/{ring.max}
            </text>
        </g>
    );
}

function CreateContactModal({ isOpen, onClose, onSave }: any) {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [telegram, setTelegram] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-sm glass-photo p-6 rounded-3xl space-y-6 animate-in fade-in zoom-in duration-300 border border-white/10">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black">Create Contact</h2>
                    <button onClick={onClose} className="p-2 text-tg-hint hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 ml-1">First Name</label>
                            <input
                                autoFocus
                                value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-teal-500/50 transition-colors text-white"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 ml-1">Last Name</label>
                            <input
                                value={lastName} onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-teal-500/50 transition-colors text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1 ml-1">
                            <label className="text-[10px] font-black text-tg-hint uppercase">Email</label>
                            <span className="text-[8px] font-bold text-tg-hint/40 uppercase">Optional</span>
                        </div>
                        <input
                            value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                            placeholder="alex@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-teal-500/50 transition-colors text-white"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-tg-hint uppercase block mb-1 ml-1">Telegram @</label>
                        <div className="relative">
                            <input
                                value={telegram} onChange={(e) => setTelegram(e.target.value)}
                                placeholder="@username"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-teal-500/50 transition-colors text-white"
                            />
                        </div>
                        <p className="mt-2 text-[10px] leading-relaxed text-tg-hint/60 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-teal-500 font-bold mr-1">💡 Tip:</span>
                            Minimize this popup using the <span className="inline-flex items-center text-white"><svg className="w-3 h-3 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span> arrow to find and copy a contact's username from Telegram.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => onSave({ name, lastName, email, telegram })}
                    className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                >
                    Save to Radar
                </button>
            </div>
        </div>
    );
}

export default function DunbarRadar() {
    const navigate = useNavigate();
    const [activeRing, setActiveRing] = useState<string | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pendingPromotion, setPendingPromotion] = useState<string | null>(null);

    // Real-time DB State
    const [socialGraph, setSocialGraph] = useState<Record<string, string>>({});
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    useEffect(() => {
        // First Load Sync Check
        const hasRequestedSync = localStorage.getItem('sarafun_contact_sync_requested');
        if (!hasRequestedSync) {
            WebApp.showConfirm(
                "Sync Contacts? \n\nSaraFun needs access to your contacts to help you build your trust network efficiently.",
                (ok) => {
                    if (ok) {
                        WebApp.showAlert("Syncing... (Demo Mode: Contacts added to Shadow List)");
                        // In real production, we would call a backend service here
                    }
                    localStorage.setItem('sarafun_contact_sync_requested', 'true');
                }
            );
        }

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

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
        setPendingPromotion(null); // Clear once moved
        WebApp.HapticFeedback.impactOccurred('medium');
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);

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

    const handleCreateContact = async (data: any) => {
        const fakeUid = data.telegram ? data.telegram.replace('@', '') : `user_${Date.now()}`;
        await updateSocialGraph(currentUserUid, fakeUid, 'Shadow');
        setIsCreateModalOpen(false);
        setPendingPromotion(fakeUid); // Trigger vibration overlay
        WebApp.HapticFeedback.notificationOccurred('success');
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
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={`relative h-full w-full bg-[#1a1c1e] text-[#e2e8f0] overflow-hidden flex flex-col justify-end transition-colors duration-500 ${activeId ? 'bg-[#0f1113]' : ''}`}>

                {/* Z-Index 8: Search Bar */}
                <div className={`absolute w-full px-4 transition-all duration-300 z-[10] top-4`}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search semantic network..."
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={() => setIsSearchActive(false)}
                        className="w-full bg-[#2a2d31] backdrop-blur-xl border border-white/10 text-white rounded-xl px-4 py-3 placeholder:text-slate-500 outline-none shadow-lg focus:border-teal-500/50 transition-colors"
                    />
                </div>

                {/* Z-Index 1: The Dunbar Radar */}
                <div className="absolute bottom-[112px] w-full flex justify-center z-[1] transition-transform duration-500 scale-125 origin-bottom">
                    <div className="relative w-full max-w-[500px]">
                        <svg viewBox="0 0 400 200" className="w-full overflow-visible">
                            {RINGS_CONFIG.map((ring) => {
                                const isActive = activeRing === ring.id;
                                const currentCount = getRingCount(ring.id);

                                return (
                                    <DroppableArc
                                        key={ring.id}
                                        ring={ring}
                                        currentCount={currentCount}
                                        isActive={isActive}
                                        isDraggingAny={!!activeId}
                                        onClick={() => setActiveRing(activeRing === ring.id ? null : ring.id)}
                                    />
                                );
                            })}
                        </svg>

                        {/* Pending Promotion Overlay */}
                        {pendingPromotion && (
                            <div className="absolute left-1/2 bottom-[-32px] -translate-x-1/2 z-[12] animate-vibrate pointer-events-none">
                                <DraggableAvatar
                                    uid={pendingPromotion}
                                    status="Shadow"
                                />
                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-teal-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap animate-bounce shadow-lg">
                                    DRAG TO RING
                                </div>
                            </div>
                        )}

                        {/* Center "+" Button Overlay - Positioned exactly on the contact block top edge */}
                        <div
                            onClick={() => setIsCreateModalOpen(true)}
                            className="absolute left-1/2 bottom-[-32px] -translate-x-1/2 w-16 h-16 bg-[#14b8a6] rounded-full border-[3px] border-[#1a1c1e] shadow-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all z-[11]"
                        >
                            <span className="text-black text-3xl font-black mb-1">+</span>
                        </div>
                    </div>
                </div>

                <CreateContactModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateContact}
                />

                {/* Z-Index 9: Shadow List or Active Ring Contacts - Increased height, removed divider, button overlap */}
                <div className="absolute bottom-0 w-full bg-tg-secondary/90 backdrop-blur-2xl z-[9] pb-4 pt-4 rounded-t-3xl shadow-2xl border-t border-white/5">
                    <div className="px-4 mb-3 flex justify-between items-center">
                        <h3 className="font-bold text-[11px] text-tg-hint uppercase tracking-widest">{activeRing ? `Ring: ${activeRing}` : 'Shadow List'}</h3>
                        <span className="text-[10px] text-tg-hint font-medium">Drag to promote</span>
                    </div>

                    <div className="flex overflow-x-auto gap-4 px-4 pb-2 snap-x hide-scrollbar h-[5.5rem] items-center">
                        {contactsToShow.map(([uid, status]) => (
                            <DraggableAvatar
                                key={uid}
                                uid={uid}
                                status={status}
                                photo={uid === 'alex' ? 'https://avatar.iran.liara.run/public/boy?username=alex' : undefined}
                            />
                        ))}
                        {contactsToShow.length === 0 && (
                            <div className="text-tg-hint text-[11px] italic w-full text-center py-6">No contacts matching filter</div>
                        )}
                    </div>
                </div>

                {/* DND Overlay Layer */}
                <DragOverlay dropAnimation={null}>
                    {activeId ? (
                        <DraggableAvatar
                            uid={activeId}
                            status={socialGraph[activeId] || 'Shadow'}
                            isOverlay={true}
                        />
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
