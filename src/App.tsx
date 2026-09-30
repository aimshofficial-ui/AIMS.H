/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNavBar, BottomTabId } from './components/BottomNavBar';
import { MissionBoard } from './components/MissionControl/MissionBoard';
import { DriveHub } from './components/SharedDrive/DriveHub';
import { SkillMatrix } from './components/Skills/SkillMatrix';
import { SmartMediaHub } from './components/MediaHub/SmartMediaHub';
import { HabitHeatmap } from './components/Habits/HabitHeatmap';
import { PartnerChat } from './components/Messenger/PartnerChat';
import { PartnerProfileTab } from './components/Profile/PartnerProfileTab';
import { ZigzagAnalyticsTab } from './components/Analytics/ZigzagAnalyticsTab';
import { PartnersHubTab } from './components/Partners/PartnersHubTab';
import { NotificationBellDrawer } from './components/Notifications/NotificationBellDrawer';
import { NotificationPermissionBanner } from './components/Notifications/NotificationPermissionBanner';
import { GlobalSearchModal } from './components/Search/GlobalSearchModal';
import { GlobalSearchIntelligenceHub } from './components/Search/GlobalSearchIntelligenceHub';
import { OpeningAnimationModal } from './components/Splash/OpeningAnimationModal';
import { CleanLightOnboarding } from './components/Auth/CleanLightOnboarding';
import { PWAGuideModal } from './components/PWAGuideModal';
import { MeetingHub } from './components/Meetings/MeetingHub';
import { AgencyClientsHub } from './components/Clients/AgencyClientsHub';
import { SharedAppData } from './types';
import { loadAppData, saveAppData, subscribeToDataSync } from './utils/storage';
import { cloudSync } from './utils/cloudSync';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [appData, setAppData] = useState<SharedAppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<BottomTabId>('missions');
  const [isPWAGuideOpen, setIsPWAGuideOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash animation on session open
    return !sessionStorage.getItem('aimsh_splash_shown');
  });

  const { isInstallable, install } = usePWAInstall();

  // Subscribe to real-time updates across multiple tabs / windows & remote cloud SSE
  useEffect(() => {
    const unsubLocal = subscribeToDataSync((newData) => {
      setAppData(newData);
    });

    const unsubCloud = cloudSync.subscribe((cloudData) => {
      setAppData(cloudData);
    });

    cloudSync.init((cloudData) => {
      setAppData(cloudData);
    });

    return () => {
      unsubLocal();
      unsubCloud();
    };
  }, []);

  const activeUser = appData.activeFounderId ? appData.founders[appData.activeFounderId] : null;

  // Auto-register active user on cloud server so partners on different devices can find them by invite code
  useEffect(() => {
    if (activeUser && activeUser.id && activeUser.inviteCode) {
      cloudSync.registerUser(activeUser);
    }
  }, [activeUser?.id, activeUser?.inviteCode, activeUser?.name, activeUser?.avatar]);

  // If no user is logged in or active, show the clean onboarding / login screen
  if (!activeUser) {
    return (
      <>
        {showSplash && (
          <OpeningAnimationModal
            onComplete={() => {
              sessionStorage.setItem('aimsh_splash_shown', 'true');
              setShowSplash(false);
            }}
          />
        )}
        <CleanLightOnboarding appData={appData} onUpdateData={setAppData} />
      </>
    );
  }

  const handleLogOut = () => {
    localStorage.removeItem('aimsh_active_founder_id');
    localStorage.setItem('aimsh_logged_out', 'true');
    const updated = {
      ...appData,
      activeFounderId: '',
    };
    saveAppData(updated);
    setAppData(updated);
  };

  const isSynced = appData.partnerConnection.status === 'accepted';
  const activeMissionCount = appData.missions.filter((m) => m.status !== 'Completed').length;
  const unreadMessageCount = appData.messages.length > 0 ? 1 : 0;
  const pendingRequestsCount = appData.partnerRequests.filter(
    (r) => r.status === 'pending' && (r.targetInviteCode === activeUser.inviteCode || !r.targetInviteCode)
  ).length;
  const unreadNotificationsCount = (appData.notifications || []).filter((n) => !n.isRead).length;
  const totalAlertCount = pendingRequestsCount + unreadNotificationsCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-700">
      
      {/* Opening Splash Landing Animation */}
      {showSplash && (
        <OpeningAnimationModal
          onComplete={() => {
            sessionStorage.setItem('aimsh_splash_shown', 'true');
            setShowSplash(false);
          }}
        />
      )}

      {/* Proactive Real-Time Notification Permission Request Banner */}
      <NotificationPermissionBanner />

      {/* Top Header with Brand, Desktop Segmented Navigation, Bell Icon, and Sync Status */}
      <Header
        appData={appData}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPartnerTab={() => setActiveTab('partners')}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenPWAGuide={() => setIsPWAGuideOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogOut={handleLogOut}
        missionCount={activeMissionCount}
        messageCount={unreadMessageCount}
        pendingRequestsCount={totalAlertCount}
      />

      {/* Main Content Area - Generous, Responsive Layout for Desktop & Mobile */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-5 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'missions' && (
              <MissionBoard 
                appData={appData} 
                onUpdateData={setAppData} 
                onSelectTab={setActiveTab} 
              />
            )}

            {activeTab === 'meetings' && (
              <MeetingHub appData={appData} onUpdateData={setAppData} />
            )}

            {activeTab === 'clients' && (
              <AgencyClientsHub
                appData={appData}
                onUpdateData={setAppData}
                onBackToHome={() => setActiveTab('missions')}
              />
            )}

            {activeTab === 'skills' && (
              <SkillMatrix appData={appData} onUpdateData={setAppData} />
            )}

            {activeTab === 'drive' && (
              <DriveHub appData={appData} onUpdateData={setAppData} />
            )}

            {activeTab === 'media' && (
              <SmartMediaHub appData={appData} onUpdateData={setAppData} />
            )}

            {activeTab === 'habits' && (
              <HabitHeatmap appData={appData} onUpdateData={setAppData} />
            )}

            {activeTab === 'chat' && (
              <PartnerChat appData={appData} onUpdateData={setAppData} />
            )}

            {activeTab === 'search' && (
              <GlobalSearchIntelligenceHub
                appData={appData}
                onUpdateData={setAppData}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'analytics' && (
              <ZigzagAnalyticsTab appData={appData} />
            )}

            {activeTab === 'partners' && (
              <PartnersHubTab
                appData={appData}
                onUpdateData={setAppData}
                onNavigateToChat={() => setActiveTab('chat')}
              />
            )}

            {activeTab === 'profile' && (
              <PartnerProfileTab
                appData={appData}
                onUpdateData={setAppData}
                onOpenPWAGuide={() => setIsPWAGuideOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Circular Navigation Dock */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        missionCount={activeMissionCount}
        messageCount={unreadMessageCount}
        pendingRequestsCount={pendingRequestsCount}
        isPartnerConnected={isSynced}
      />

      {/* Notification Bell Drawer Modal */}
      <NotificationBellDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        appData={appData}
        onUpdateData={setAppData}
        onNavigateToTab={(tab) => setActiveTab(tab as any)}
      />

      {/* PWA & Native Packaging Guide Modal */}
      <PWAGuideModal
        isOpen={isPWAGuideOpen}
        onClose={() => setIsPWAGuideOpen(false)}
        onInstallClick={install}
        isInstallable={isInstallable}
      />

      {/* Global Workspace Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        appData={appData}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

    </div>
  );
}
