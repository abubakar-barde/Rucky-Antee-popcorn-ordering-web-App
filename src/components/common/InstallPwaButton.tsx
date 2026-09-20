import React, { useState, useEffect } from 'react';
import { Download, Smartphone, ExternalLink } from 'lucide-react';

export const InstallPwaButton: React.FC = () => {
  const [hasPrompt, setHasPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOS);

    const handleInstallReady = () => {
      setHasPrompt(true);
    };

    window.addEventListener('pwa-install-ready', handleInstallReady);

    return () => {
      window.removeEventListener('pwa-install-ready', handleInstallReady);
    };
  }, []);

  if (isStandalone) {
    return null; // Already installed as standalone app
  }

  const handleInstallClick = async () => {
    if ((window as any).triggerPwaInstall) {
      const outcome = await (window as any).triggerPwaInstall();
      if (outcome) {
        return;
      }
    }
    setShowModal(true);
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-medium transition-all"
        title="Install Ruckyn Antee App on your device"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span className="hidden xs:inline">Install App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-stone-200 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-100">Install Ruckyn Antee</h3>
                <p className="text-xs text-stone-400">Add to your home screen for quick access</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
                <p className="font-semibold mb-1">💡 Tip for Preview Mode:</p>
                Because this app is currently viewed inside the editor preview, browsers restrict direct installation prompts. Tap <span className="font-bold underline">"Open in New Tab"</span> below to open the app directly, then install it!
              </div>

              {isIOS ? (
                <div className="space-y-2 text-xs text-stone-300 bg-stone-800/60 p-4 rounded-xl border border-stone-700/60">
                  <p className="font-semibold text-amber-400">How to install on iPhone & iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Open this app in Safari (or tap <span className="text-amber-300 font-bold">Open in New Tab</span>).</li>
                    <li>Tap the <span className="font-bold text-amber-300">Share</span> button <span className="inline-block px-1.5 py-0.5 bg-stone-700 rounded text-stone-200">⎋</span> in Safari's bottom toolbar.</li>
                    <li>Scroll down and tap <span className="font-bold text-amber-300">"Add to Home Screen"</span> ➕.</li>
                    <li>Tap <span className="font-bold text-amber-300">Add</span> in the top right corner.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-stone-300 bg-stone-800/60 p-4 rounded-xl border border-stone-700/60">
                  <p className="font-semibold text-amber-400">How to install on Android / Chrome:</p>
                  <p>
                    Open in a new browser tab, tap your browser menu (<span className="font-bold text-amber-300">⋮</span>), and select <span className="font-bold text-amber-300">"Install app"</span> or <span className="font-bold text-amber-300">"Add to Home screen"</span>.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-800">
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-all shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open in New Tab
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
