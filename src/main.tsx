import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Capture beforeinstallprompt event globally for PWA installation
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA beforeinstallprompt event captured successfully in main.tsx');
  window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: e }));
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was successfully installed');
  deferredPrompt = null;
});

// Expose helper to trigger deferred prompt
(window as any).triggerPwaInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    if (outcome === 'accepted') {
      deferredPrompt = null;
    }
    return outcome;
  }
  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

