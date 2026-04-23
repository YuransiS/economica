'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

export default function LeadModal({
  isOpen,
  onClose,
  selectedTariff = 'PRO',
  selectedPrice = 19
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedTariff?: string;
  selectedPrice?: number;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState<any>();
  const [telegram, setTelegram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [wayForPayData, setWayForPayData] = useState<any>(null);
  
  // Test Mode Logic (Hidden)
  const [isTestMode, setIsTestMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleTitleClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) { // 5th click
      setIsTestMode(!isTestMode);
      setClickCount(0);
    }
    // Reset click count after 2.5 seconds
    setTimeout(() => setClickCount(0), 2500);
  };

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

  // When wayForPayData is set, automatically submit the form
  useEffect(() => {
    if (wayForPayData) {
      // Create a form dynamically to bypass Next.js 15+ interception of the <form action="..."> attribute
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.wayforpay.com/pay';
      form.style.display = 'none';

      // Map our properties to hidden inputs
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
      
      // Small delay to ensure pixel event is sent
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
    if (!phone || !isValidPhoneNumber(phone)) {
      setError('Введіть коректний номер телефону');
      return;
    }
    if (!telegram.trim()) {
      setError('Введіть ваш нік у Telegram');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          telegram,
          tariff: selectedTariff,
          price: selectedPrice,
          utms,
          isTest: isTestMode
        })
      });

      const result = await response.json();

      if (result.success) {
        // Track Facebook Lead Event
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead');
        }
        
        setWayForPayData(result.data);
      } else {
        setError('Помилка при створенні замовлення. Спробуйте пізніше.');
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
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 text-center">
                <h3 
                  onClick={handleTitleClick}
                  className="cursor-pointer font-montserrat text-2xl font-bold uppercase text-[#4E0000] select-none"
                >
                  Реєстрація
                  {isTestMode && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" title="Test Mode Active" />}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Тариф {selectedTariff} — {isTestMode ? '1 грн' : `$${selectedPrice}`}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ім'я</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше ім'я"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#81D8D0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#81D8D0]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Номер телефону</label>
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base transition-colors focus-within:border-[#81D8D0] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#81D8D0]">
                    <PhoneInput
                      international
                      defaultCountry="UA"
                      value={phone}
                      onChange={setPhone}
                      className="PhoneInput-custom w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Нік у Telegram</label>
                  <input
                    type="text"
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
                  disabled={isLoading || !!wayForPayData || !isPrivacyAgreed || !isOfferAgreed}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#4E0000] py-4 text-center font-bold uppercase tracking-wider text-white transition-transform hover:enabled:scale-[1.02] active:enabled:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || wayForPayData ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Оплатити'
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
