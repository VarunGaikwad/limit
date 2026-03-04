"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show notice for iOS if not already installed
    if (
      isIosDevice &&
      !(window.navigator as any).standalone &&
      !window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsVisible(true);
    }

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert(
        "To install Limit: Tap the 'Share' icon in your browser and select 'Add to Home Screen' 📲",
      );
      setIsVisible(false);
      return;
    }

    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }
    // We've used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 z-[60] md:left-auto md:right-8 md:w-96"
      >
        <div className="bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Download size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 leading-tight">
                Install Limit
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Get the full experience on your home screen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Install
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
