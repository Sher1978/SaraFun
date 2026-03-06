import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const ADMIN_UID = '8524844089'; // Provided Admin ID

type Tab = 'dashboard' | 'settings' | 'users' | 'transactions' | 'referrals' | 'roles';

export default function SherlockAdminConsole() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [loading, setLoading] = useState(false);
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString();

    useEffect(() => {
        if (currentUserUid !== ADMIN_UID && currentUserUid !== 'dev_user_uid') {
            WebApp.showAlert("Unauthorized: God Mode Required.");
        }
    }, [currentUserUid]);

    if (currentUserUid !== ADMIN_UID && currentUserUid !== 'dev_user_uid') {
        return <div className="p-10 text-center font-black uppercase text-red-500">Access Denied</div>;
    }

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'dashboard', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users Log', icon: '👥' },
        { id: 'transactions', label: 'Tx Log', icon: '💸' },
        { id: 'referrals', label: 'Network', icon: '🕸️' },
        { id: 'settings', label: 'Parameters', icon: '⚙️' },
        { id: 'roles', label: 'Access Control', icon: '🛡️' },
    ];

    return (
        <div className="min-h-screen bg-tg-main text-tg-primary flex flex-col md:flex-row pb-20 md:pb-0">
            {/* Sidebar / Topnav */}
            <nav className="bg-tg-secondary/50 border-b md:border-b-0 md:border-r border-tg-hint/10 md:w-64 flex-shrink-0 z-10 sticky top-0 md:h-screen overflow-x-auto hide-scrollbar">
                <div className="p-3 md:p-3 hidden md:block">
                    <h1 className="text-base font-black italic uppercase text-yellow-500">Superadmin</h1>
                    <p className="text-[10px] text-tg-hint uppercase tracking-widest mt-1">Control Center</p>
                </div>
                <div className="flex md:flex-col p-2 md:p-3 gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                                : 'text-tg-hint hover:bg-tg-secondary'
                                }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-3 md:p-3">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'transactions' && <TransactionsTab />}
                {activeTab === 'referrals' && <ReferralsTab />}
                {activeTab === 'roles' && <RolesTab />}
            </main>
        </div>
    );
}

// --- TAB COMPONENTS ---

function DashboardTab() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black">City Heartbeat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-tg-secondary/50 border border-tg-hint/10 p-3 rounded-xl">
                    <div className="text-[10px] font-black tracking-widest text-tg-hint uppercase mb-2">Total Value Locked</div>
                    <div className="text-base font-bold text-yellow-500">142,500 ⭐</div>
                </div>
                <div className="bg-tg-secondary/50 border border-tg-hint/10 p-3 rounded-xl">
                    <div className="text-[10px] font-black tracking-widest text-tg-hint uppercase mb-2">Active Users (24h)</div>
                    <div className="text-base font-bold">1,245</div>
                </div>
                <div className="bg-tg-secondary/50 border border-tg-hint/10 p-3 rounded-xl">
                    <div className="text-[10px] font-black tracking-widest text-tg-hint uppercase mb-2">Open Disputes</div>
                    <div className="text-base font-bold text-red-500">3</div>
                </div>
            </div>
            {/* Placeholder for charts */}
            <div className="h-64 bg-tg-secondary/20 rounded-xl border border-tg-hint/10 flex items-center justify-center text-tg-hint text-sm italic">
                Analytics Chart Area
            </div>
        </div>
    );
}

function SettingsTab() {
    const [config, setConfig] = useState({ visibility_fee_usd: 5, platform_commission_percent: 5 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { getDoc, doc } = await import('firebase/firestore');
                const snap = await getDoc(doc(db, 'SystemConfig', 'global'));
                if (snap.exists()) {
                    setConfig({
                        visibility_fee_usd: snap.data().visibility_fee_usd ?? 5,
                        platform_commission_percent: snap.data().platform_commission_percent ?? 5
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { setDoc, doc } = await import('firebase/firestore');
            await setDoc(doc(db, 'SystemConfig', 'global'), config, { merge: true });
            WebApp.HapticFeedback.notificationOccurred('success');
            WebApp.showAlert("Global Parameters Updated");
        } catch (err) {
            console.error(err);
            WebApp.showAlert("Failed to save. Check permissions.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black">Global Parameters</h2>
            <div className="bg-tg-secondary/50 border border-tg-hint/10 rounded-xl p-3 space-y-4 max-w-2xl">
                {loading && <div className="text-sm italic text-tg-hint">Loading current parameters...</div>}
                {!loading && (
                    <>
                        <div>
                            <label className="text-xs font-bold text-tg-hint uppercase block mb-2">Visibility Fee ($USD)</label>
                            <input
                                type="number"
                                value={config.visibility_fee_usd}
                                onChange={(e) => setConfig({ ...config, visibility_fee_usd: Number(e.target.value) })}
                                className="w-full bg-tg-main border border-tg-hint/20 rounded-xl p-3 outline-none focus:border-yellow-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-tg-hint uppercase block mb-2">Platform Comission (%)</label>
                            <input
                                type="number"
                                value={config.platform_commission_percent}
                                onChange={(e) => setConfig({ ...config, platform_commission_percent: Number(e.target.value) })}
                                className="w-full bg-tg-main border border-tg-hint/20 rounded-xl p-3 outline-none focus:border-yellow-500"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`bg-yellow-500 text-black px-4 py-3 rounded-xl font-bold active:scale-95 transition-transform mt-4 ${saving ? 'opacity-50' : ''}`}
                        >
                            {saving ? 'Saving...' : 'Save Variables'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function UsersTab() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await getDocs(collection(db, 'Users'));
                setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black">User Registry</h2>
            <div className="w-full bg-tg-secondary/50 border border-tg-hint/10 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-tg-main text-tg-hint text-xs uppercase font-black">
                        <tr>
                            <th className="p-3">UID / Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Balance</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tg-hint/10">
                        {loading && <tr><td colSpan={4} className="p-3 text-center text-tg-hint italic">Loading users...</td></tr>}
                        {!loading && users.map(user => (
                            <tr key={user.id} className="hover:bg-tg-main/50 transition-colors">
                                <td className="p-3">
                                    <div className="font-bold">{user.display_name || user.first_name || 'Unknown'}</div>
                                    <div className="text-[10px] text-tg-hint font-mono">{user.id}</div>
                                </td>
                                <td className="p-3">
                                    {(user.is_master || user.is_business_mode) && (
                                        <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md text-[10px] font-bold">Master</span>
                                    )}
                                    {!(user.is_master || user.is_business_mode) && (
                                        <span className="bg-tg-hint/10 text-tg-hint px-2 py-1 rounded-md text-[10px] font-bold">Client</span>
                                    )}
                                </td>
                                <td className="p-3">{user.stars_balance || 0} ⭐</td>
                                <td className="p-3 text-right">
                                    <button className="text-teal-500 text-xs font-bold hover:underline">DETAILS</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TransactionsTab() {
    const [txs, setTxs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTxs = async () => {
            try {
                const snap = await getDocs(collection(db, 'Transactions'));
                const list = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
                setTxs(list.sort((a: any, b: any) => b.timestamp - a.timestamp));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTxs();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black">Transaction Ledger</h2>
            <div className="w-full bg-tg-secondary/50 border border-tg-hint/10 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-tg-main text-tg-hint text-xs uppercase font-black">
                        <tr>
                            <th className="p-3">TX ID</th>
                            <th className="p-3">Users (From → To)</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tg-hint/10">
                        {loading && <tr><td colSpan={4} className="p-3 text-center text-tg-hint italic">Loading ledger...</td></tr>}
                        {!loading && txs.map(tx => (
                            <tr key={tx.id} className="hover:bg-tg-main/50 transition-colors">
                                <td className="p-3 font-mono text-[10px] text-tg-hint">{tx.id}</td>
                                <td className="p-3">
                                    <div className="text-xs">
                                        <span className="text-red-400">{tx.clientUid?.substring(0, 8)}</span>
                                        {' → '}
                                        <span className="text-teal-400">{tx.masterUid?.substring(0, 8)}</span>
                                    </div>
                                </td>
                                <td className="p-3 font-bold">{tx.amount_stars} ⭐</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${tx.status === 'completed' ? 'bg-teal-500/10 text-teal-500' :
                                        tx.status === 'pending_undo' ? 'bg-yellow-500/10 text-yellow-500' :
                                            tx.status === 'frozen' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-red-500/10 text-red-500'
                                        }`}>
                                        {tx.status || 'unknown'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ReferralsTab() {
    const [referralsMap, setReferralsMap] = useState<Record<string, any[]>>({});
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const snap = await getDocs(collection(db, 'Users'));
                const map: Record<string, any[]> = {};
                const names: Record<string, string> = {};

                snap.docs.forEach(doc => {
                    const data = doc.data();
                    names[doc.id] = data.display_name || data.first_name || doc.id.substring(0, 6);

                    if (data.referred_by) {
                        if (!map[data.referred_by]) map[data.referred_by] = [];
                        map[data.referred_by].push({ id: doc.id, ...data });
                    }
                });

                setReferralsMap(map);
                setUserNames(names);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNetwork();
    }, []);

    // Only show top-level inviters (people who invited others)
    const topReferrers = Object.keys(referralsMap).sort((a, b) => referralsMap[b].length - referralsMap[a].length);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black">Network Topology</h2>
            <div className="bg-tg-secondary/50 border border-tg-hint/10 rounded-xl p-3">
                <p className="text-sm text-tg-hint mb-4">Tree view of referral relationships (grouped by Inviter)</p>
                {loading && <div className="text-sm italic text-tg-hint">Scanning network structure...</div>}

                <div className="space-y-6">
                    {!loading && topReferrers.map(inviterId => (
                        <div key={inviterId} className="pl-4 border-l-2 border-yellow-500/50 space-y-2">
                            <div className="font-bold text-sm">
                                ▶ {userNames[inviterId] || inviterId}
                                <span className="text-yellow-500 text-[10px] ml-2 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded">
                                    {referralsMap[inviterId].length} Invitees
                                </span>
                            </div>
                            <div className="pl-6 border-l-2 border-tg-hint/10 space-y-1">
                                {referralsMap[inviterId].map((invitee: any) => (
                                    <div key={invitee.id} className="text-xs text-tg-hint">
                                        ↳ {invitee.display_name || invitee.first_name || invitee.id.substring(0, 8)}
                                        <span className="text-yellow-500/50 ml-1">({invitee.stars_balance || 0} ⭐)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {!loading && topReferrers.length === 0 && (
                        <div className="text-sm italic text-tg-hint">No referral links detected yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RolesTab() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUid, setNewUid] = useState('');
    const [newRole, setNewRole] = useState('Admin'); // Superadmin, Admin, Manager

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const snap = await getDocs(collection(db, 'SystemAdmins'));
                setAdmins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    const handleAddAdmin = async () => {
        if (!newUid.trim()) return;
        try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'SystemAdmins', newUid.trim()), {
                role: newRole,
                added_at: new Date().toISOString()
            });
            setAdmins([...admins, { id: newUid.trim(), role: newRole, added_at: new Date().toISOString() }]);
            setNewUid('');
            WebApp.showAlert("Admin Added");
        } catch (err) {
            console.error(err);
            WebApp.showAlert("Error adding admin");
        }
    };

    const handleRemoveAdmin = async (uidToRemove: string) => {
        if (uidToRemove === '8524844089') {
            WebApp.showAlert("Cannot remove root Superadmin.");
            return;
        }
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'SystemAdmins', uidToRemove));
            setAdmins(admins.filter(a => a.id !== uidToRemove));
            WebApp.showAlert("Admin Removed");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-base font-black">Access Control</h2>
            <p className="text-xs text-tg-hint uppercase tracking-widest leading-relaxed max-w-2xl">
                Manage system administrators. Supported Roles:<br />
                <span className="text-yellow-500 font-bold">Superadmin</span> - Full access<br />
                <span className="text-teal-500 font-bold">Admin</span> - Full access except Roles Management<br />
                <span className="text-blue-500 font-bold">Manager</span> - View-only logs and Disputes resolving
            </p>

            {/* Add New Admin Form */}
            <div className="bg-tg-secondary/50 border border-tg-hint/10 rounded-xl p-3 flex flex-col md:flex-row gap-3 max-w-3xl items-end">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">Telegram UID</label>
                    <input
                        value={newUid}
                        onChange={e => setNewUid(e.target.value)}
                        placeholder="e.g. 123456789"
                        className="w-full bg-tg-main border border-tg-hint/20 rounded-xl p-3 outline-none focus:border-yellow-500 text-sm"
                    />
                </div>
                <div className="w-full md:w-48">
                    <label className="text-[10px] font-black text-tg-hint uppercase block mb-1">Assign Role</label>
                    <select
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                        className="w-full bg-tg-main border border-tg-hint/20 rounded-xl p-3 outline-none focus:border-yellow-500 text-sm appearance-none"
                    >
                        <option value="Superadmin">Superadmin</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <button
                    onClick={handleAddAdmin}
                    className="w-full md:w-auto bg-tg-button text-tg-button-text px-4 py-3 rounded-xl font-bold active:scale-95 transition-transform"
                >
                    Add User
                </button>
            </div>

            {/* Active Admins List */}
            <div className="w-full bg-tg-secondary/50 border border-tg-hint/10 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-tg-main text-tg-hint text-xs uppercase font-black">
                        <tr>
                            <th className="p-3">Telegram UID</th>
                            <th className="p-3">Assigned Role</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tg-hint/10">
                        {loading && <tr><td colSpan={3} className="p-3 text-center text-tg-hint italic">Loading admins...</td></tr>}
                        {!loading && admins.map(adm => (
                            <tr key={adm.id} className="hover:bg-tg-main/50 transition-colors">
                                <td className="p-3 font-mono font-bold text-tg-primary">{adm.id}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${adm.role === 'Superadmin' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            adm.role === 'Admin' ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' :
                                                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}>
                                        {adm.role}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => handleRemoveAdmin(adm.id)}
                                        className="text-red-500 text-xs font-bold hover:underline"
                                    >
                                        REVOKE
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {/* Always show the hardcoded root admin just in case */}
                        <tr className="bg-yellow-500/5">
                            <td className="p-3 font-mono font-bold text-yellow-500">8524844089</td>
                            <td className="p-3">
                                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                                    ROOT (Superadmin)
                                </span>
                            </td>
                            <td className="p-3 text-right text-[10px] text-tg-hint uppercase">
                                Immutable
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
