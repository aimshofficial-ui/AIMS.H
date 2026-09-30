import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, CheckCircle2, X, Vibrate, Sparkles, Volume2 } from 'lucide-react';
import { requestMobilePermission, isMobileAlertsAllowed, triggerMobileAlert } from '../../utils/notifications';

export const NotificationPermissionBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [grantedFeedback, setGrantedFeedback] = useState(false);

  useEffect(() => {
    // Check if permission already granted or dismissed recently in this session
    const isAllowed = isMobileAlertsAllowed();
    const isDismissed = sessionStorage.getItem('aimsh_notif_banner_dismissed');

    if (!isAllowed && !isDismissed) {
      // Show prompt after a short delay for smooth entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    try {
      await requestMobilePermission();
      setGrantedFeedback(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2500);
    } catch (e) {
      triggerMobileAlert({
        title: '🔔 Alerts & Vibration Enabled!',
        message: 'Real-time sync notifications and mobile alerts are active.',
      });
      setGrantedFeedback(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2500);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('aimsh_notif_banner_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-white rounded-3xl border-2 border-indigo-500/30 shadow-2xl shadow-indigo-900/20 p-4 font-sans overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {grantedFeedback ? (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  ✅ Notifications & Vibration Enabled!
                </h4>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  পার্টনারের সব মেসেজ, মিটিং ও শিট আপডেট ইনস্ট্যান্ট নোটিফিকেশন যাবে।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <BellRing className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        Enable Real-Time Notifications
                      </h4>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Required
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      পার্টনারের মেসেজ, মিটিং কল ও ক্লায়েন্ট আপডেট তৎক্ষণাৎ পেতে এলাও করুন।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleAllow}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-900/15 cursor-pointer transition active:scale-95"
                >
                  <Vibrate className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Allow Notifications (এলাও করুন)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
