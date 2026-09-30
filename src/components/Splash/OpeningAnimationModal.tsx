import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface OpeningAnimationModalProps {
  onComplete: () => void;
  autoDismissMs?: number;
}

export const OpeningAnimationModal: React.FC<OpeningAnimationModalProps> = ({
  onComplete,
  autoDismissMs = 2600,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 400);
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, onComplete]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl text-white p-4"
        >
          {/* Subtle Ambient Background Glows */}
          <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

          <div className="relative max-w-md w-full text-center space-y-6">
            
            {/* Glowing Logo Icon */}
            <motion.div
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-blue-500 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-400/20"
            >
              <span className="font-mono font-black text-2xl tracking-tighter text-white">
                AIMSH
              </span>
            </motion.div>

            {/* Typography */}
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-mono font-bold tracking-widest uppercase border border-white/10"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Agency Partner Hub
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-2xl sm:text-3xl font-black tracking-tight text-white"
              >
                AIMS.H Agency Hub
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto"
              >
                Private Co-Founder Workspace, High-Leverage Missions & Real-Time Sync.
              </motion.p>
            </div>

            {/* Animated Loading Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-48 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
                className="h-full bg-linear-to-r from-indigo-500 to-blue-400 rounded-full"
              />
            </motion.div>

            {/* Quick Enter Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={handleSkip}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
