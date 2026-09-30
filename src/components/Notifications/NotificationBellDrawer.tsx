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
  Volume2,
  Send,
  Zap,
  CheckCheck
} from 'lucide-react';
import { SharedAppData, PartnerRequest, AppNotification, UserProfile } from '../../types';
import { saveAppData } from '../../utils/storage';
import { cloudSync } from '../../utils/cloudSync';
import { triggerMobileAlert, requestMobilePermission, pushAppNotification, isMobileAlertsAllowed } from '../../utils/notifications';

interface NotificationBellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onNavigateToTab?: (tab: string) => void;
}

const PRESET_REMINDERS = [
  '⏰ Meeting starting in 10 minutes! Get ready.',
  '🚀 Please review the new client deliverable in Drive!',
  '⚡ Time for a 25-minute execution focus sprint!',
  '🎯 New high-ticket client lead added to Client Sheet!',
  '📊 Check the new agency skills added to Skills Matrix.',
];

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
  const [showSendNudge, setShowSendNudge] = useState(false);
  const [customNudgeText, setCustomNudgeText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  useEffect(() => {
    setIsAllowed(isMobileAlertsAllowed());
    if (isOpen) {
      // Mark notifications as read when opening drawer
      const hasUnread = (appData.notifications || []).some((n) => !n.isRead);
      if (hasUnread) {
        const marked = (appData.notifications || []).map((n) => ({ ...n, isRead: true }));
        const updated = { ...appData, notifications: marked };
        saveAppData(updated, false);
        cloudSync.syncState(updated);
        onUpdateData(updated);
      }
    }
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

  // Send Partner Nudge / Reminder
  const handleSendNudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = customNudgeText.trim() || selectedPreset;
    if (!textToSend) return;

    await cloudSync.sendPartnerNudge(
      activeUser.id,
      `⏰ Reminder from ${activeUser.name}`,
      textToSend
    );

    triggerMobileAlert({
      title: `⏰ Reminder Sent!`,
      message: textToSend,
    });

    setCustomNudgeText('');
    setSelectedPreset('');
    setShowSendNudge(false);
    setFeedbackNotice('🚀 Reminder notification sent to partner!');
    setTimeout(() => setFeedbackNotice(''), 3500);
  };

  // Accept & Link Partner (Allow partner connection)
  const handleAcceptRequest = async (req: PartnerRequest) => {
    await cloudSync.acceptPartnerRequest(req.id, activeUser.id);
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
    cloudSync.syncState(updatedData);
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
      cloudSync.syncState(updatedData);
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
    cloudSync.syncState(updatedData);
    onUpdateData(updatedData);
    setFeedbackNotice('🗑️ All notifications cleared.');
    setTimeout(() => setFeedbackNotice(''), 2000);
  };

  const handleNotificationClick = (notif: AppNotification) => {
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
                  <h3 className="text-xs font-black text-slate-900">Activity & Nudges (নোটিফিকেশন)</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Real-time cloud sync notifications</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSendNudge(!showSendNudge)}
                  className={`p-1 px-2.5 text-[10px] font-black rounded-xl transition flex items-center gap-1 cursor-pointer border ${
                    showSendNudge
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title="Send custom reminder notification to partner"
                >
                  <Send className="w-3 h-3" />
                  <span>Nudge Partner</span>
                </button>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllNotifications}
                    className="p-1 px-2 text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 cursor-pointer border border-transparent hover:border-rose-100"
                    title="Clear All Notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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

            {/* SEND PARTNER NUDGE FORM MODULE */}
            <AnimatePresence>
              {showSendNudge && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleSendNudgeSubmit}
                  className="p-3 bg-indigo-50/90 border-b border-indigo-200 space-y-2 shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-indigo-950 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Send Instant Reminder to Partner (রিমাইন্ডার পাঠাও)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSendNudge(false)}
                      className="text-indigo-400 hover:text-indigo-800 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Preset Reminders */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700">Quick Presets:</span>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_REMINDERS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(preset);
                            setCustomNudgeText(preset);
                          }}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition cursor-pointer text-left truncate max-w-full ${
                            selectedPreset === preset
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Message Text */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={customNudgeText}
                      onChange={(e) => {
                        setCustomNudgeText(e.target.value);
                        setSelectedPreset('');
                      }}
                      placeholder="Or type custom reminder message..."
                      className="flex-1 bg-white border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={!customNudgeText.trim() && !selectedPreset}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-xs ${
                        customNudgeText.trim() || selectedPreset
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                          : 'bg-indigo-200 text-indigo-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Mobile Notification & Vibration Permission Banner */}
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

              {/* 2. Real-Time Activity & Nudge Notifications */}
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block px-1">
                    Activity Stream
                  </span>

                  {notifications.map((notif) => {
                    const isReminder = notif.type === 'reminder';
                    const isPartner = notif.type === 'partner';
                    const isDeleting = deletingId === notif.id;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 1, height: 'auto' }}
                        animate={{ opacity: isDeleting ? 0 : 1, height: isDeleting ? 0 : 'auto' }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 relative group ${
                          isReminder
                            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-300'
                            : isPartner
                            ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-slate-200/80 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {notif.senderAvatar ? (
                              <img
                                src={notif.senderAvatar}
                                alt={notif.senderName}
                                className="w-6 h-6 rounded-full object-cover border border-white shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                🔔
                              </div>
                            )}
                            <span className="text-xs font-black text-slate-900 leading-tight truncate">
                              {notif.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 font-medium">
                              {notif.timestamp}
                            </span>
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

                        <p className="text-[11px] text-slate-700 pl-8 leading-relaxed font-medium">
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
                    When your partner schedules a meeting, sends a reminder, or connects, it appears here in real-time.
                  </p>
                </div>
              ) : null}

            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium px-4">
              <span>Firebase Cloud Real-Time</span>
              <span className="font-mono font-bold text-slate-700">AIMS.H Workspace</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
