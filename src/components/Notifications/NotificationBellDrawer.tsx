import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { SharedAppData, PartnerRequest } from '../../types';
import { saveAppData } from '../../utils/storage';

interface NotificationBellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appData: SharedAppData;
  onUpdateData: (data: SharedAppData) => void;
  onNavigateToChat: () => void;
}

export const NotificationBellDrawer: React.FC<NotificationBellDrawerProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateData,
  onNavigateToChat,
}) => {
  const activeUser = appData.founders[appData.activeFounderId];
  const userInviteCode = activeUser?.inviteCode || '';

  // Incoming requests directed to this user's invite code (or pending)
  const incomingRequests = appData.partnerRequests.filter(
    (req) => req.status === 'pending' && (req.targetInviteCode === userInviteCode || !req.targetInviteCode)
  );

  const pastNotifications = appData.partnerRequests.filter(
    (req) => req.status !== 'pending'
  );

  const handleAcceptRequest = (req: PartnerRequest) => {
    // 1. Mark request as accepted
    const updatedRequests = appData.partnerRequests.map((r) =>
      r.id === req.id ? { ...r, status: 'accepted' as const } : r
    );

    // 2. Pair co-founders in partnerConnection
    const updatedData: SharedAppData = {
      ...appData,
      partnerRequests: updatedRequests,
      partnerConnection: {
        partnerInviteCode: req.fromInviteCode,
        status: 'accepted',
        pairedUserId: req.fromUserId,
        pairedAt: new Date().toISOString(),
      },
    };

    saveAppData(updatedData);
    onUpdateData(updatedData);
  };

  const handleDeclineRequest = (reqId: string) => {
    const updatedRequests = appData.partnerRequests.map((r) =>
      r.id === reqId ? { ...r, status: 'declined' as const } : r
    );
    const updatedData: SharedAppData = {
      ...appData,
      partnerRequests: updatedRequests,
    };
    saveAppData(updatedData);
    onUpdateData(updatedData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-5 pointer-events-none">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs pointer-events-auto"
          />

          {/* Drawer Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative pointer-events-auto w-full max-w-sm mt-12 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Partner Notifications
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="p-3 max-h-[380px] overflow-y-auto space-y-2.5">
              {incomingRequests.length === 0 && pastNotifications.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-600">All caught up!</p>
                  <p className="text-[11px]">When a partner enters your invite code, a connection request will appear here.</p>
                </div>
              )}

              {/* Pending Incoming Requests */}
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={req.fromUserAvatar}
                      alt={req.fromUserName}
                      className="w-9 h-9 rounded-xl object-cover border border-indigo-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {req.fromUserName}
                      </h4>
                      <p className="text-[10px] text-indigo-600 font-medium truncate">
                        {req.fromUserRole} · Code: {req.fromInviteCode}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Wants to connect and collaborate in this agency workspace.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-indigo-100">
                    <button
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-200/60 transition cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Pair</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Past Notification Logs */}
              {pastNotifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Connected with <strong>{item.fromUserName}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToChat();
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Your Code: {userInviteCode || 'AIMSH'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
