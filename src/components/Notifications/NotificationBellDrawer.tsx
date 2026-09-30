import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Video, 
  Calendar, 
  MessageSquare, 
  FolderKanban, 
  Vibrate, 
  ExternalLink,
  Trash2,
  BellRing,
  TrendingUp,
  Flame,
  CheckCircle,
  Volume2
} from 'lucide-react';
import { SharedAppData, PartnerRequest, AppNotification, UserProfile } from '../../types';
import { saveAppData } from '../../utils/storage';
import { triggerMobileAlert, requestMobilePermission, pushAppNotification, isMobileAlertsAllowed } from '../../utils/notifications';

interface NotificationBellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationBellDrawer: React.FC<NotificationBellDrawerProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateData,
  onNavigateToTab,
}) => {
  const [isAllowed, setIsAllowed] = useState<boolean>(() => isMobileAlertsAllowed());
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsAllowed(isMobileAlertsAllowed());
  }, [isOpen]);

  const activeUser = appData.founders[appData.activeFounderId] || {
    id: 'user_1',
    name: 'You',
    inviteCode: '',
    role: 'Co-Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  };

  const userInviteCode = activeUser.inviteCode || '';

  // Incoming partner requests directed to this user
  const incomingRequests = (appData.partnerRequests || []).filter(
    (req) => req.status === 'pending' && req.fromUserId !== activeUser.id && (req.targetInviteCode === userInviteCode || !req.targetInviteCode)
  );

  // App activity notifications
  const notifications: AppNotification[] = (appData.notifications || []).filter(
    (n) => n.targetUserId === 'all' || n.targetUserId === activeUser.id || n.senderId !== activeUser.id || n.targetUserId === userInviteCode
  );

  // Click Allow Mobile Notifications & Vibration
  const handleAllowNotifications = async () => {
    try {
      await requestMobilePermission();
      setIsAllowed(true);
      setFeedbackNotice('✅ Alerts, chime & mobile vibration active!');
      setTimeout(() => setFeedbackNotice(''), 3500);
    } catch (e) {
      setIsAllowed(true);
      triggerMobileAlert({
        title: '✅ Alerts & Vibration Active',
        message: 'Mobile alerts and haptic sound are active for your workspace.',
      });
      setFeedbackNotice('✅ Sound & vibration active!');
      setTimeout(() => setFeedbackNotice(''), 3500);
    }
  };

  // Test notification trigger
  const handleTestAlert = () => {
    triggerMobileAlert({
      title: '🔔 Test Notification Working!',
      message: 'Real-time bilateral notifications and mobile vibration are active.',
    });
    setFeedbackNotice('⚡ Test alert fired with sound & vibration!');
    setTimeout(() => setFeedbackNotice(''), 3000);
  };

  // Accept & Link Partner (Allow partner connection)
  const handleAcceptRequest = (req: PartnerRequest) => {
    const updatedRequests = (appData.partnerRequests || []).map((r) =>
      r.id === req.id ? { ...r, status: 'accepted' as const } : r
    );

    const partnerProfile: UserProfile = appData.founders[req.fromUserId] || {
      id: req.fromUserId,
      name: req.fromUserName,
      avatar: req.fromUserAvatar,
      role: req.fromUserRole,
      inviteCode: req.fromInviteCode,
      email: `${req.fromUserName.toLowerCase().replace(/\s+/g, '_')}@aimsh.agency`,
      username: req.fromUserName.toLowerCase().replace(/\s+/g, '_'),
      bio: 'Co-Founder & Workspace Partner',
      hobbies: [],
      habitStyles: [],
      screenTimeHours: '3 - 4 Hours',
      socials: {},
      focusAreas: [],
      primaryObjective: 'Scale agency and collaborate together.',
    };

    const updatedFounders = {
      ...appData.founders,
      [req.fromUserId]: partnerProfile,
      [activeUser.id]: activeUser,
    };

    const updatedData: SharedAppData = {
      ...appData,
      founders: updatedFounders,
      partnerRequests: updatedRequests,
      partnerConnection: {
        partnerInviteCode: req.fromInviteCode,
        status: 'accepted',
        pairedUserId: req.fromUserId,
        pairedAt: new Date().toISOString(),
      },
      partnerStatuses: {
        ...appData.partnerStatuses,
        [req.fromUserId]: {
          userId: req.fromUserId,
          isOnline: true,
          currentTask: 'Connected to shared agency workspace',
          availability: 'Available for Execution',
          lastSeen: 'Active now',
          sessionMinutes: 10,
        },
        [activeUser.id]: {
          userId: activeUser.id,
          isOnline: true,
          currentTask: 'Connected to shared agency workspace',
          availability: 'Available for Execution',
          lastSeen: 'Active now',
          sessionMinutes: 10,
        },
      },
    };

    const updatedWithNotif = pushAppNotification(
      updatedData,
      {
        type: 'partner',
        title: '🎉 Partner Linked Successfully!',
        message: `${activeUser.name} and ${req.fromUserName} are now connected in real-time.`,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderAvatar: activeUser.avatar,
        targetUserId: req.fromUserId,
        actionTab: 'partners',
        timestamp: 'Just now',
      }
    );

    saveAppData(updatedWithNotif, true);
    onUpdateData(updatedWithNotif);

    triggerMobileAlert({
      title: '🎉 Partner Connected!',
      message: `You are now linked with ${req.fromUserName}!`,
    });
  };

  // Decline / Reject partner request
  const handleDeclineRequest = (reqId: string) => {
    const updatedRequests = (appData.partnerRequests || []).map((r) =>
      r.id === reqId ? { ...r, status: 'declined' as const } : r
    );
    const updatedData: SharedAppData = {
      ...appData,
      partnerRequests: updatedRequests,
    };
    saveAppData(updatedData, true);
    onUpdateData(updatedData);
  };

  // Delete individual notification
  const handleDeleteNotification = (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(notifId);
    setTimeout(() => {
      const updatedNotifications = (appData.notifications || []).filter((n) => n.id !== notifId);
      const updatedData: SharedAppData = {
        ...appData,
        notifications: updatedNotifications,
      };
      saveAppData(updatedData, true);
      onUpdateData(updatedData);
      setDeletingId(null);
    }, 150);
  };

  // Clear all notifications
  const handleClearAllNotifications = () => {
    const updatedData: SharedAppData = {
      ...appData,
      notifications: [],
    };
    saveAppData(updatedData, true);
    onUpdateData(updatedData);
    setFeedbackNotice('🗑️ All notifications cleared.');
    setTimeout(() => setFeedbackNotice(''), 2000);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    // Mark as read
    const updatedNotifs = (appData.notifications || []).map((n) =>
      n.id === notif.id ? { ...n, isRead: true } : n
    );
    const updated = {
      ...appData,
      notifications: updatedNotifs,
    };
    saveAppData(updated, true);
    onUpdateData(updated);

    if (notif.actionTab && onNavigateToTab) {
      onNavigateToTab(notif.actionTab);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 pointer-events-none font-sans">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs pointer-events-auto"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative pointer-events-auto w-full max-w-sm mt-12 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900">Activity & Alerts (নোটিফিকেশন)</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Real-time sync notifications</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllNotifications}
                    className="p-1 px-2.5 text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer border border-transparent hover:border-rose-100"
                    title="Clear All Notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Notification & Vibration Permission Card (Allow button) */}
            {!isAllowed ? (
              <div className="p-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Vibrate className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-indigo-950 block truncate">
                      Enable Mobile Alerts & Vibration
                    </span>
                    <span className="text-[9px] text-indigo-600 font-medium block">
                      Tap Allow for instant sound & vibration
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAllowNotifications}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black shadow-md transition cursor-pointer shrink-0 active:scale-95"
                >
                  Allow
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/80 border-b border-emerald-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feedbackNotice || 'Alerts & Vibration Active'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestAlert}
                  className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Test Ring</span>
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* 1. Pending Incoming Partner Requests (Allow / Accept & Decline) */}
              {incomingRequests.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block px-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Incoming Partner Requests ({incomingRequests.length})</span>
                  </span>

                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.fromUserAvatar}
                          alt={req.fromUserName}
                          className="w-9 h-9 rounded-xl object-cover border border-white shadow-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {req.fromUserName}
                          </p>
                          <p className="text-[10px] text-amber-900 font-medium truncate">
                            {req.fromUserRole} • Code: {req.fromInviteCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-3" />
                          <span>Allow & Connect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-slate-200 cursor-pointer transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Real-Time Activity & Schedule Notifications */}
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-1">
                    Activity Stream
                  </span>

                  {notifications.map((notif) => {
                    const isMeeting = notif.type === 'meeting';
                    const isSchedule = notif.type === 'schedule';
                    const isClient = notif.type === 'client';
                    const isDeleting = deletingId === notif.id;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 1, height: 'auto' }}
                        animate={{ opacity: isDeleting ? 0 : 1, height: isDeleting ? 0 : 'auto' }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative group ${
                          isMeeting
                            ? 'bg-purple-50/70 border-purple-200 hover:border-purple-300'
                            : isSchedule
                            ? 'bg-orange-50/70 border-orange-200 hover:border-orange-300'
                            : isClient
                            ? 'bg-blue-50/70 border-blue-200 hover:border-blue-300'
                            : 'bg-white border-slate-200/80 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={notif.senderAvatar}
                              alt={notif.senderName}
                              className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs shrink-0"
                            />
                            <span className="text-xs font-black text-slate-900 leading-tight truncate">
                              {notif.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 font-medium">
                              {notif.timestamp}
                            </span>
                            {/* Individual Delete / Dismiss Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotification(notif.id, e)}
                              className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete notification"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 pl-8 leading-relaxed">
                          {notif.message}
                        </p>

                        {notif.actionTab && (
                          <div className="pl-8 pt-0.5">
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                              <span>Open {notif.actionTab.toUpperCase()}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : incomingRequests.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
                    <Bell className="w-5 h-5 stroke-1" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No New Notifications</h4>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    When your partner schedules a meeting, sends a message, or logs a client, it appears here in real-time.
                  </p>
                </div>
              ) : null}

            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium px-4">
              <span>Real-time Live Synced</span>
              <span className="font-mono font-bold text-slate-700">AIMS.H Workspace</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
