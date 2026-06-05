'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';


export default function IntensiveLeadModal({
  isOpen,
  onCloseAction,
  selectedTariff = 'Безкоштовно',
  selectedPrice = 0
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  selectedTariff?: string;
  selectedPrice?: number;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState<any>();
  const [telegram, setTelegram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Autofill from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedName = localStorage.getItem('user_name');
      const savedPhone = localStorage.getItem('user_phone');
      const savedTelegram = localStorage.getItem('user_telegram');

      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedTelegram) setTelegram(savedTelegram);
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
    
    // Clean and validate phone number
    const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : '';
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 15) {
      setError('Введіть коректний номер телефону');
      return;
    }

    setIsLoading(true);

    // Read or generate device UUID
    let deviceUuid = '';
    if (typeof window !== 'undefined') {
      deviceUuid = localStorage.getItem('minicourse_device_uuid') || '';
      if (!deviceUuid) {
        deviceUuid = 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem('minicourse_device_uuid', deviceUuid);
      }
    }

    // Collect analytics
    const analytics = {
      visitorId: localStorage.getItem('visitor_id'),
      firstUtms: JSON.parse(localStorage.getItem('first_utms') || '{}'),
      lastUtms: JSON.parse(localStorage.getItem('last_utms') || '{}'),
      journey: JSON.parse(localStorage.getItem('journey') || '[]'),
      pagePath: '/intensive',
      pageUrl: typeof window !== 'undefined' ? window.location.href : ''
    };

    // Format phone to have + prefix for API
    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+${phone.trim()}`;

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: formattedPhone,
          telegram,
          tariff: selectedTariff,
          price: selectedPrice,
          utms,
          analytics,
          targetSheet: 'Заявки на інтенсив',
          deviceUuid,
          clientDomain: typeof window !== 'undefined' ? window.location.hostname : '',
          clientOrigin: typeof window !== 'undefined' ? window.location.origin : ''
        })
      });

      const result = await response.json();

      if (result.success) {
        // Save user data to localStorage
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_phone', formattedPhone);
        localStorage.setItem('user_telegram', telegram);

        // Track Facebook Lead Event
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead');
        }

        // Redirect directly to the Telegram bot with a small delay for pixel tracking
        setTimeout(() => {
          window.location.href = 'https://t.me/SofiaFeduniak_bot?start=6a22e052a6453da635042cc6';
        }, 500);
      } else {
        setError('Помилка при реєстрації. Спробуйте пізніше.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Сталася непередбачена помилка. Перевірте з\'єднання.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
            >
              <button
                onClick={onCloseAction}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 text-center">
                <h3 className="font-montserrat text-2xl font-bold uppercase text-[#4E0000] select-none">
                  Реєстрація
                </h3>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                  Тариф {selectedTariff} — БЕЗКОШТОВНО
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ім'я</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше ім'я"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Номер телефону</label>
                  <input
                    type="tel"
                    required
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+380991234567"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Telegram Username</label>
                  <input
                    type="text"
                    required
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input
                        type="checkbox"
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
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 leading-tight">
                      Я погоджуюсь з <a href="/privacy-policy" target="_blank" className="text-[#4E0000] underline hover:text-[#81D8D0]">політикою конфіденційності</a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input
                        type="checkbox"
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
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 leading-tight">
                      Я погоджуюсь з <a href="/public-offer" target="_blank" className="text-[#4E0000] underline hover:text-[#81D8D0]">договором публічної оферти</a>
                    </span>
                  </label>
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-500 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isPrivacyAgreed || !isOfferAgreed}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#4E0000] py-4 text-center font-bold uppercase tracking-wider text-white transition-transform hover:enabled:scale-[1.02] active:enabled:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Зареєструватися'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
