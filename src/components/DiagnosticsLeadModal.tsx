'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { validatePhoneNumber, getCallingCodeForCountry } from '@/utils/phone';

interface DiagnosticsLeadModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  offerNumber: number;
}

export default function DiagnosticsLeadModal({
  isOpen,
  onCloseAction,
  offerNumber
}: DiagnosticsLeadModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [wayForPayData, setWayForPayData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  
  // Test Mode Logic (Hidden - triggered by 5 clicks on the title)
  const [isTestMode, setIsTestMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Trigger progress bar increment when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          // Fast at first, then slower towards 95%
          const increment = prev < 50 ? 8 : (prev < 80 ? 3 : 1);
          return Math.min(prev + increment, 95);
        });
      }, 60);
    } else {
      setProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Focus Trapping and Escape Key Listeners
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus modal container
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading && !wayForPayData) {
          onCloseAction();
        }
        if (e.key === 'Tab') {
          const focusable = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable && focusable.length > 0) {
            const first = focusable[0] as HTMLElement;
            const last = focusable[focusable.length - 1] as HTMLElement;
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocus.current?.focus();
      };
    }
  }, [isOpen, onCloseAction, isLoading, wayForPayData]);

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      setIsTestMode(!isTestMode);
      setClickCount(0);
    }
    setTimeout(() => setClickCount(0), 2500);
  };

  // Autofill from localStorage and country prefill
  useEffect(() => {
    if (isOpen) {
      const savedName = localStorage.getItem('user_name');
      const savedPhone = localStorage.getItem('user_phone');
      const savedTelegram = localStorage.getItem('user_telegram');

      if (savedName) setName(savedName);
      if (savedTelegram) setTelegram(savedTelegram);

      if (savedPhone) {
        setPhone(savedPhone);
      } else {
        fetch('/api/country')
          .then((res) => res.json())
          .then((data) => {
            if (data.country) {
              const callingCode = getCallingCodeForCountry(data.country);
              setPhone(`+${callingCode}`);
            } else {
              setPhone('+380');
            }
          })
          .catch(() => setPhone('+380'));
      }
    }
  }, [isOpen]);

  // Parse UTMs
  const [utms, setUtms] = useState({});
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setUtms({
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
      });
    }
  }, []);

  // When wayForPayData is set, automatically submit to secure.wayforpay.com
  useEffect(() => {
    if (wayForPayData) {
      setProgress(100);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.wayforpay.com/pay';
      form.style.display = 'none';

      const fields = {
        merchantAccount: wayForPayData.merchantAccount,
        merchantDomainName: wayForPayData.merchantDomainName,
        orderReference: wayForPayData.orderReference,
        orderDate: wayForPayData.orderDate,
        amount: wayForPayData.amount,
        currency: wayForPayData.currency,
        "productName[]": wayForPayData.productName[0],
        "productCount[]": wayForPayData.productCount[0],
        "productPrice[]": wayForPayData.productPrice[0],
        clientFirstName: wayForPayData.clientName,
        clientPhone: wayForPayData.clientPhone,
        merchantSignature: wayForPayData.merchantSignature,
        clientPaymentMethods: wayForPayData.clientPaymentMethods || "card;googlePay;applePay",
        returnUrl: wayForPayData.returnUrl,
        serviceUrl: wayForPayData.serviceUrl
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      setTimeout(() => {
        form.submit();
      }, 500);
    }
  }, [wayForPayData]);

  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [isOfferAgreed, setIsOfferAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPrivacyAgreed || !isOfferAgreed) {
      setError('Ви повинні погодитися з політикою конфіденційності та офертою');
      return;
    }

    if (!name.trim()) {
      setError('Введіть ваше ім\'я');
      return;
    }

    if (!phone || !validatePhoneNumber(phone.trim())) {
      setError('Введіть коректний номер телефону з кодом країни (наприклад, +380...)');
      return;
    }

    if (!telegram.trim()) {
      setError('Введіть ваш нік у Telegram');
      return;
    }

    setIsLoading(true);

    let deviceUuid = '';
    if (typeof window !== 'undefined') {
      deviceUuid = localStorage.getItem('minicourse_device_uuid') || '';
      if (!deviceUuid) {
        deviceUuid = 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem('minicourse_device_uuid', deviceUuid);
      }
    }

    const analytics = {
      visitorId: localStorage.getItem('visitor_id'),
      firstUtms: JSON.parse(localStorage.getItem('first_utms') || '{}'),
      lastUtms: JSON.parse(localStorage.getItem('last_utms') || '{}'),
      journey: JSON.parse(localStorage.getItem('journey') || '[]'),
    };

    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;
    const formattedTelegram = telegram.trim().startsWith('@') ? telegram.trim() : `@${telegram.trim()}`;

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: formattedPhone,
          telegram: formattedTelegram,
          tariff: `Діагностика (Офер ${offerNumber})`,
          price: 390,
          currency: 'UAH',
          targetSheet: 'Заявки на діагностику',
          utms,
          analytics,
          isTest: isTestMode,
          deviceUuid,
          clientDomain: typeof window !== 'undefined' ? window.location.hostname : '',
          clientOrigin: typeof window !== 'undefined' ? window.location.origin : ''
        })
      });

      const result = await response.json();

      if (result.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_name', name.trim());
          localStorage.setItem('user_phone', formattedPhone);
          localStorage.setItem('user_telegram', formattedTelegram);
        }

        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead');
        }

        setWayForPayData(result.data);
      } else {
        setError(result.error || 'Помилка при створенні замовлення. Спробуйте пізніше.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Сталася непередбачена помилка. Перевірте з\'єднання.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!isLoading && !wayForPayData) {
              onCloseAction();
            }
          }}
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button only visible when not loading */}
            {!isLoading && !wayForPayData && (
              <button
                onClick={onCloseAction}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#81D8D0]"
                aria-label="Закрити модальне вікно"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {isLoading || wayForPayData ? (
              /* Sleek Progress Bar Loading Screen */
              <div className="space-y-6 py-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full bg-[#81D8D0]/10 p-4 animate-pulse">
                    <Loader2 className="h-12 w-12 text-[#81D8D0] animate-spin" />
                  </div>
                </div>
                <h3 className="font-montserrat text-xl font-bold text-[#4E0000] uppercase tracking-wide">
                  Підготовка платежу
                </h3>
                <p className="text-sm text-gray-500 font-arimo max-w-sm mx-auto leading-relaxed">
                  Будь ласка, зачекайте. Ми створюємо безпечне замовлення та перенаправляємо вас на платіжну сторінку WayForPay...
                </p>
                <div className="space-y-2 max-w-xs mx-auto pt-2">
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className="bg-[#81D8D0] h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(129,216,208,0.7)]" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-gray-400 font-narrow">
                    ЗАВАНТАЖЕННЯ: {Math.floor(progress)}%
                  </div>
                </div>
              </div>
            ) : (
              /* Form Screen */
              <>
                <div className="mb-6 text-center">
                  <h3 
                    id="modal-title"
                    onClick={handleTitleClick}
                    className="cursor-pointer font-montserrat text-2xl font-bold uppercase text-[#4E0000] select-none"
                  >
                    Реєстрація на аудит
                    {isTestMode && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" title="Test Mode Active" />}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 font-montserrat font-bold text-[#4E0000]">
                    Вартість розбору: {isTestMode ? '1 грн (тест)' : '390 грн'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="diagnostics-name" className="mb-1 block text-sm font-medium text-gray-700">
                      Ім'я <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="diagnostics-name"
                      type="text"
                      required
                      aria-required="true"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше ім'я"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                    />
                  </div>

                  <div>
                    <label htmlFor="diagnostics-phone" className="mb-1 block text-sm font-medium text-gray-700">
                      Номер телефону <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="diagnostics-phone"
                      type="tel"
                      required
                      aria-required="true"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+380991234567"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                    />
                  </div>

                  <div>
                    <label htmlFor="diagnostics-telegram" className="mb-1 block text-sm font-medium text-gray-700">
                      Нік у Telegram <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="diagnostics-telegram"
                      type="text"
                      required
                      aria-required="true"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="@username"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label htmlFor="diagnostics-privacy" className="flex items-start gap-3 cursor-pointer group select-none">
                      <div className="relative flex items-center mt-1">
                        <input
                          id="diagnostics-privacy"
                          type="checkbox"
                          required
                          aria-required="true"
                          checked={isPrivacyAgreed}
                          onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-200 transition-all checked:border-[#81D8D0] checked:bg-[#81D8D0]"
                        />
                        <svg
                          className="absolute h-3.5 w-3.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5 top-0.5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 leading-tight">
                        Я погоджуюсь з <a href="/privacy-policy" target="_blank" className="text-[#4E0000] underline hover:text-[#81D8D0] focus:outline-none focus:ring-2 focus:ring-[#81D8D0] rounded-sm">політикою конфіденційності</a>
                      </span>
                    </label>

                    <label htmlFor="diagnostics-offer" className="flex items-start gap-3 cursor-pointer group select-none">
                      <div className="relative flex items-center mt-1">
                        <input
                          id="diagnostics-offer"
                          type="checkbox"
                          required
                          aria-required="true"
                          checked={isOfferAgreed}
                          onChange={(e) => setIsOfferAgreed(e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-200 transition-all checked:border-[#81D8D0] checked:bg-[#81D8D0]"
                        />
                        <svg
                          className="absolute h-3.5 w-3.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5 top-0.5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 leading-tight">
                        Я погоджуюсь з <a href="/public-offer" target="_blank" className="text-[#4E0000] underline hover:text-[#81D8D0] focus:outline-none focus:ring-2 focus:ring-[#81D8D0] rounded-sm">договором публічної оферти</a>
                      </span>
                    </label>
                  </div>

                  {error && (
                    <p role="alert" className="text-sm font-medium text-red-500 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !!wayForPayData || !isPrivacyAgreed || !isOfferAgreed}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#4E0000] py-4 text-center font-bold uppercase tracking-wider text-white transition-transform hover:enabled:scale-[1.02] active:enabled:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#81D8D0]"
                  >
                    Перейти до оплати
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
