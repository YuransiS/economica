'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';

export default function InAppBrowserOverlay() {
  const [isInApp, setIsInApp] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [appType, setAppType] = useState<'telegram' | 'instagram' | 'facebook' | 'generic'>('generic');
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [intentUrl, setIntentUrl] = useState('');

  const [autologinUrl, setAutologinUrl] = useState('');
  const [isPostPayment, setIsPostPayment] = useState(false);
  const [isMinicourseTariff, setIsMinicourseTariff] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const detectAndroid = /Android/i.test(ua);
    const detectIOS = /iPhone|iPad|iPod/i.test(ua);

    const isInstagram = /Instagram/i.test(ua);
    const isFacebook = /FBAN|FBAV/i.test(ua);
    const isTelegram = /Telegram/i.test(ua) || 
                       (typeof window !== 'undefined' && (
                         !!(window as any).Telegram || 
                         !!(window as any).TelegramWebview || 
                         !!(window as any).TelegramWebviewProxy || 
                         !!(window as any).TelegramWebviewProxyProto
                       ));
    const isTikTok = /TikTok/i.test(ua);
    const isViber = /Viber/i.test(ua);
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isLine = /Line/i.test(ua);
    const isWeChat = /MicroMessenger/i.test(ua);
    const isTwitter = /Twitter|TwitterAndroid/i.test(ua);

    const detectInApp = isInstagram || isFacebook || isTelegram || isTikTok || isViber || isWhatsApp || isLine || isWeChat || isTwitter;

    setIsInApp(detectInApp);
    setIsAndroid(detectAndroid);
    setIsIOS(detectIOS);
    setCurrentUrl(window.location.href);

    if (isTelegram) {
      setAppType('telegram');
    } else if (isInstagram) {
      setAppType('instagram');
    } else if (isFacebook) {
      setAppType('facebook');
    } else {
      setAppType('generic');
    }

    // Post-payment intermediate checker pages check
    const path = window.location.pathname;
    const postPaymentDetected = path.includes('/checking-payment') || path.includes('/thank-you');
    setIsPostPayment(postPaymentDetected);

    const searchParams = new URLSearchParams(window.location.search);
    const tariff = searchParams.get('tariff') || '';
    const isMinicourse = tariff === 'Практикум' || tariff === 'PRO' || tariff === 'VIP';
    setIsMinicourseTariff(isMinicourse);

    const savedTelegram = localStorage.getItem('user_telegram') || '';
    const savedPhone = localStorage.getItem('user_phone') || '';
    const identifier = savedTelegram || savedPhone;
    setUserIdentifier(identifier);

    let targetUrl = window.location.href;
    if (postPaymentDetected && isMinicourse && identifier) {
      const cleanIdentifier = identifier.trim();
      const loginUrl = `${window.location.origin}/minicourse/login?autologin=${encodeURIComponent(cleanIdentifier)}`;
      setAutologinUrl(loginUrl);
      targetUrl = loginUrl;
    }

    if (detectInApp && detectAndroid) {
      // Strip protocol
      let strippedUrl = targetUrl.replace(/^https?:\/\//, '');
      // Strip any hash fragments to prevent intent parser crashes
      const hashIndex = strippedUrl.indexOf('#');
      if (hashIndex !== -1) {
        strippedUrl = strippedUrl.substring(0, hashIndex);
      }
      const formedIntent = `intent://${strippedUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      setIntentUrl(formedIntent);

      // Auto redirect Android users immediately
      window.location.href = formedIntent;
    }
  }, []);

  const handleCopy = async () => {
    const textToCopy = (isPostPayment && isMinicourseTariff && autologinUrl) ? autologinUrl : currentUrl;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getInstructions = () => {
    if (appType === 'telegram') {
      if (isIOS) {
        return [
          <>
            Натисніть на значок <span className="font-bold text-[#81D8D0]">Компаса (🧭)</span> або значок Safari у правому нижньому кутку екрана Telegram.
          </>,
          <>
            Це автоматично відкриє платформу у вашому стандартному браузері <span className="font-bold text-[#81D8D0]">Safari</span>.
          </>
        ];
      } else {
        return [
          <>
            Натисніть на значок меню <span className="font-bold text-[#81D8D0]">три крапки (⋮)</span> у правому верхньому кутку екрана.
          </>,
          <>
            Оберіть опцію <span className="font-bold text-[#81D8D0]">«Відкрити в Chrome»</span> або «Відкрити в системному браузері».
          </>
        ];
      }
    }

    if (appType === 'instagram' || appType === 'facebook') {
      if (isIOS) {
        return [
          <>
            Натисніть на значок меню <span className="font-bold text-[#81D8D0]">три крапки (•••)</span> у правому верхньому кутку екрана.
          </>,
          <>
            Оберіть опцію <span className="font-bold text-[#81D8D0]">«Відкрити в Safari»</span> (або «Open in Browser»).
          </>
        ];
      } else {
        return [
          <>
            Натисніть на значок меню <span className="font-bold text-[#81D8D0]">три крапки (⋮)</span> у правому верхньому кутку.
          </>,
          <>
            Оберіть опцію <span className="font-bold text-[#81D8D0]">«Відкрити в браузері»</span> або «Open in Chrome».
          </>
        ];
      }
    }

    // Generic fallback instructions
    if (isIOS) {
      return [
        <>
          Натисніть на кнопку <span className="font-bold text-[#81D8D0]">«Поділитися»</span> (квадрат зі стрілкою вгору) або меню <span className="font-bold text-[#81D8D0]">(...)</span>.
        </>,
        <>
          Оберіть опцію <span className="font-bold text-[#81D8D0]">«Відкрити в Safari»</span>.
        </>
      ];
    } else {
      return [
        <>
          Натисніть на значок меню <span className="font-bold text-[#81D8D0]">три крапки (⋮)</span> або кнопку додаткових дій.
        </>,
        <>
          Оберіть опцію <span className="font-bold text-[#81D8D0]">«Відкрити в браузері»</span> (Chrome).
        </>
      ];
    }
  };

  if (!isInApp) return null;

  const instructions = getInstructions();
  const showAutologinUI = isIOS && isPostPayment && isMinicourseTariff && userIdentifier;

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
              {showAutologinUI ? "🎉 Доступ активовано!" : "Відкрийте у браузері"}
            </h3>

            {showAutologinUI && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#81D8D0]/10 px-3 py-1 border border-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0] uppercase tracking-wider">
                Аккаунт: {userIdentifier.startsWith('@') ? '' : '@'}{userIdentifier}
              </div>
            )}

            <p className="mb-6 text-xs leading-relaxed text-gray-300 font-arimo">
              {showAutologinUI 
                ? "Вітаємо з успішною оплатою практикуму! Щоб ви не втратили свій кабінет після закриття цієї сторінки, вхід через вбудований браузер соцмережі обмежено. Будь ласка, скопіюйте посилання та відкрийте його в стандартному Safari."
                : "Ви відкрили платформу через вбудований браузер соцмережі. Щоб не втратити прогрес навчання та зберегти сесію при закритті реклами, будь ласка, перейдіть у звичайний браузер вашого телефону."
              }
            </p>

            {/* Instruction Steps */}
            <div className="mb-6 w-full space-y-4 rounded-2xl bg-white/5 border border-white/5 p-5 text-left text-xs text-gray-300 font-arimo">
              {showAutologinUI ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0]">
                      1
                    </span>
                    <p className="leading-5">
                      Натисніть на кнопку <span className="font-bold text-[#81D8D0]">«Скопіювати посилання для авто-входу»</span> нижче.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0]">
                      2
                    </span>
                    <p className="leading-5">
                      Відкрийте стандартний браузер <span className="font-bold text-[#81D8D0]">Safari</span> (або Chrome) на вашому iPhone.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0]">
                      3
                    </span>
                    <p className="leading-5">
                      Вставте посилання в адресний рядок і перейдіть. Ви увійдете в кабінет навчання <span className="font-bold text-[#81D8D0]">миттєво та назавжди</span>.
                    </p>
                  </div>
                </>
              ) : (
                instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#81D8D0]/20 text-[10px] font-bold text-[#81D8D0]">
                      {idx + 1}
                    </span>
                    <p className="leading-5">{step}</p>
                  </div>
                ))
              )}
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
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-center text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] ${
                  showAutologinUI
                    ? "bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] shadow-[0_0_25px_rgba(129,216,208,0.2)]"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                }`}
              >
                {copied ? (
                  <>
                    <Check className={`h-4 w-4 ${showAutologinUI ? 'text-[#1A0000]' : 'text-[#81D8D0]'}`} />
                    <span>Посилання скопійовано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>{showAutologinUI ? "Скопіювати посилання для авто-входу" : "Скопіювати посилання"}</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-[9px] text-gray-400 font-arimo">
              <AlertCircle className="h-3 w-3" />
              <span>{showAutologinUI ? "Це гарантує безпечне збереження вашого кабінету." : "Це збереже ваш прогрес і триматиме вас авторизованими."}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
