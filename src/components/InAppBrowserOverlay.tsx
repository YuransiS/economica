'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';

export default function InAppBrowserOverlay() {
  const [isInApp, setIsInApp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [intentUrl, setIntentUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isInstagram = /Instagram/i.test(ua);
    const isFacebook = /FBAN|FBAV/i.test(ua);
    const isTelegram = /Telegram/i.test(ua);
    const detectInApp = isInstagram || isFacebook || isTelegram;

    const detectAndroid = /Android/i.test(ua);

    setIsInApp(detectInApp);
    setIsAndroid(detectAndroid);
    setCurrentUrl(window.location.href);

    if (detectInApp && detectAndroid) {
      const rawUrl = window.location.href;
      // Strip protocol for Android Intent
      const strippedUrl = rawUrl.replace(/^https?:\/\//, '');
      const formedIntent = `intent://${strippedUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      setIntentUrl(formedIntent);

      // Auto redirect Android users immediately
      window.location.href = formedIntent;
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!isInApp) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A0000]/95 px-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1A0000]/80 p-8 shadow-2xl backdrop-blur-xl text-white font-montserrat"
        >
          {/* Background decorative blur glow */}
          <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-[#81D8D0]/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 -z-10 h-40 w-40 rounded-full bg-[#4E0000]/30 blur-3xl" />

          <div className="flex flex-col items-center text-center">
            {/* Header Icon */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#81D8D0]/10 border border-[#81D8D0]/30 text-[#81D8D0]">
              <Compass className="h-8 w-8 animate-pulse" />
            </div>

            <h3 className="mb-2 text-xl font-black uppercase tracking-wider text-white">
              Відкрийте у браузері
            </h3>
            <p className="mb-6 text-xs leading-relaxed text-gray-300 font-arimo">
              Ви відкрили платформу через вбудований браузер соцмережі. Щоб не втратити прогрес навчання та зберегти сесію при закритті реклами, будь ласка, перейдіть у звичайний браузер вашого телефону.
            </p>

            {/* Instruction Steps */}
            <div className="mb-6 w-full space-y-3 rounded-2xl bg-white/5 border border-white/5 p-5 text-left text-xs text-gray-300 font-arimo">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0]">
                  1
                </span>
                <p className="leading-5">
                  Натисніть на іконку меню <span className="font-bold text-[#81D8D0]">три крапки (⋮ або ...)</span> або кнопку поділитися у верхньому правому кутку.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0]">
                  2
                </span>
                <p className="leading-5">
                  Оберіть опцію <span className="font-bold text-[#81D8D0]">«Відкрити в браузері»</span> або <span className="font-bold text-[#81D8D0]">«Open in Safari / Chrome»</span>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col gap-3">
              {isAndroid && intentUrl && (
                <a
                  href={intentUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#81D8D0] py-4 text-center text-xs font-black uppercase tracking-wider text-[#1A0000] transition-all hover:bg-[#97e3db] active:scale-[0.98] shadow-[0_0_20px_rgba(129,216,208,0.2)]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Відкрити в Chrome</span>
                </a>
              )}

              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-4 text-center text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#81D8D0]" />
                    <span className="text-[#81D8D0]">Посилання скопійовано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Скопіювати посилання</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-[9px] text-gray-400 font-arimo">
              <AlertCircle className="h-3 w-3" />
              <span>Це збереже ваш прогрес і триматиме вас авторизованими.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
