import React from 'react';
import { X, Download, Smartphone, Monitor, Apple, CheckCircle2, Terminal, ExternalLink, Copy } from 'lucide-react';

interface PWAGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallClick?: () => void;
  isInstallable?: boolean;
}

export const PWAGuideModal: React.FC<PWAGuideModalProps> = ({
  isOpen,
  onClose,
  onInstallClick,
  isInstallable,
}) => {
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 text-slate-800 shadow-2xl relative border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                PWA & App Install Guide
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Install as a standalone native app on iPhone, Android, or PC.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick In-App Install if browser supports it */}
        {isInstallable && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-indigo-900">Direct Browser Install Ready</h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">Click below to install directly to home screen / dock.</p>
            </div>
            <button
              onClick={() => {
                onInstallClick?.();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          </div>
        )}

        {/* Platform Guides */}
        <div className="mt-5 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Installation by Device
          </h3>

          {/* iOS Safari */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Apple className="w-4 h-4" />
              <span>iPhone & iPad (Safari)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside pl-1">
              <li>Open this page in <strong>Safari</strong> on your iPhone.</li>
              <li>Tap the <strong>Share</strong> button (square icon with upward arrow) at bottom.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
            </ol>
          </div>

          {/* Android */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>Android (Chrome)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside pl-1">
              <li>Tap the three dots <strong>(⋮)</strong> menu in Chrome.</li>
              <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
            </ol>
          </div>

          {/* Desktop */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-xs">
              <Monitor className="w-4 h-4" />
              <span>Desktop (Chrome / Edge / Mac)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside pl-1">
              <li>Click the <strong>Install</strong> icon in your browser's address bar.</li>
              <li>Or click browser menu (⋮) → "Install AIMS.H Hub".</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
