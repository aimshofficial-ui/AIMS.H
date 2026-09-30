import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const AppInstallFloatingBanner: React.FC<{ onOpenPWAGuide: () => void }> = ({ onOpenPWAGuide }) => {
  const { isInstallable, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('aimsh_install_banner_dismissed') === 'true';
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('aimsh_install_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      onOpenPWAGuide();
    }
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 select-none pointer-events-auto"
      >
        <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-900/40 border border-slate-700/80 flex items-center justify-between gap-3 relative overflow-hidden backdrop-blur-md">
          {/* Subtle 3D Ambient Glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-40 pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-white tracking-tight">Download AIMS.H App</h4>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  Fast PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium line-clamp-1 mt-0.5">
                ১-ক্লিকে ইনস্টল করুন ও অফলাইন মোবাইল নোটিফিকেশন পান!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
