import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import Layout from './components/Layout';
import Discovery from './pages/Discovery';
import MasterProfile from './pages/MasterProfile';
import MapScreen from './pages/MapScreen';
import DunbarRadar from './pages/DunbarRadar';
import MasterDashboard from './pages/MasterDashboard';
import Onboarding from './pages/Onboarding';
import SocialArbitration from './pages/SocialArbitration';
import EditMasterProfile from './pages/EditMasterProfile';
import BusinessLanding from './pages/BusinessLanding';
import RulesScreen from './pages/RulesScreen';
import AddUserScreen from './pages/AddUserScreen';
import Profile from './pages/Profile';
import ReferralDashboard from './pages/ReferralDashboard';
import SherlockAdminConsole from './pages/SherlockAdminConsole';
import CommunityPulse from './pages/CommunityPulse';
import TrustNotifications from './components/TrustNotifications';
import { openQRScanner } from './services/QRScannerService';

export default function App() {
    const [initData, setInitData] = useState<any | null>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
        // Instant check to avoid layout flicker
        return localStorage.getItem('sarafun_onboarded') === 'true';
    });
    const currentUserUid = WebApp.initDataUnsafe?.user?.id?.toString() || 'dev_user_uid';

    useEffect(() => {
        WebApp.ready();
        WebApp.expand();

        // Simulate Auth Check
        setIsAuthorized(true);
        setInitData(WebApp.initDataUnsafe?.user || { id: 'dev_local' });
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('sarafun_onboarded', 'true');
        setIsOnboarded(true);
        WebApp.HapticFeedback.notificationOccurred('success');
    };

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center h-screen bg-tg-main text-tg-primary">
                <div className="animate-pulse">Loading SaraFun...</div>
            </div>
        );
    }

    // Onboarding Gate (Prevents TabBar and main routes from rendering)
    if (!isOnboarded) {
        return <Onboarding uid={currentUserUid} onComplete={handleOnboardingComplete} />;
    }

    return (
        <>
            <TrustNotifications />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/discovery" replace />} />
                        <Route path="discovery" element={<Discovery />} />
                        <Route path="radar" element={<DunbarRadar />} />
                        <Route path="map" element={<MapScreen />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="dashboard" element={<MasterDashboard />} />

                        {/* Secondary Routes */}
                        <Route path="master/:uid" element={<MasterProfile />} />
                        <Route path="referrals" element={<ReferralDashboard />} />
                        <Route path="superadmin" element={<SherlockAdminConsole />} />
                        <Route path="arbitration" element={<SocialArbitration />} />
                        <Route path="edit-master" element={<EditMasterProfile />} />
                        <Route path="business-landing" element={<BusinessLanding />} />
                        <Route path="rules" element={<RulesScreen />} />
                        <Route path="add-user" element={<AddUserScreen />} />
                        <Route path="*" element={<Navigate to="/discovery" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}
