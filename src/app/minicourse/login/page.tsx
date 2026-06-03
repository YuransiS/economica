'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../useAuth';
import { Sparkles, Loader2, AlertTriangle, Send } from 'lucide-react';
import InAppBrowserOverlay from '@/components/InAppBrowserOverlay';
import TelegramLoginWidget from '@/components/TelegramLoginWidget';

function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get('token');
  const redirectParam = searchParams.get('redirect') || '/minicourse';
  const warningParam = searchParams.get('warning');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenVerifying, setTokenVerifying] = useState(false);
  const [deviceUuid, setDeviceUuid] = useState('');

  // 1. Get or generate device UUID for device tracking limits
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let uuid = localStorage.getItem('minicourse_device_uuid');
      if (!uuid) {
        uuid = 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem('minicourse_device_uuid', uuid);
      }
      setDeviceUuid(uuid);
    }
  }, []);

  // 2. Detect warning parameters and show descriptive error messages
  useEffect(() => {
    if (warningParam) {
      if (warningParam === 'expired') {
        setError('Термін дії Вашого доступу до міні-курсу закінчився. Доступ надається на 2 тижні з моменту оплати.');
      } else if (warningParam === 'unpaid') {
        setError('Доступ обмежено. Оплата практикуму ще не підтверджена.');
      } else if (warningParam === 'blocked') {
        setError('Доступ заблоковано через перевищення ліміту унікальних пристроїв. Будь ласка, зверніться до підтримки.');
      }
    }
  }, [warningParam]);

  // 3. Auto-authenticate when coming from bot with autologin token
  useEffect(() => {
    if (tokenParam && deviceUuid) {
      const performTokenAuth = async () => {
        setLoading(true);
        setTokenVerifying(true);
        setError('');
        try {
          const res = await fetch('/api/minicourse/token-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenParam, deviceUuid })
          });
          const result = await res.json();

          if (!res.ok || !result.success) {
            if (result.error === 'access_expired') {
              setError('Термін дії Вашого доступу до міні-курсу закінчився (доступ надається на 2 тижні з моменту оплати).');
            } else {
              setError(result.error || 'Не вдалося авторизуватися. Можливо, посилання застаріло або вже використовувалось.');
            }
            return;
          }

          // Successfully authenticated, store session and redirect
          login(result.user, result.progress);
          router.push(redirectParam);
        } catch (err: any) {
          console.error("Autologin via token failed:", err);
          setError("Помилка автоматичного входу. Будь ласка, спробуйте пізніше.");
        } finally {
          setLoading(false);
          setTokenVerifying(false);
        }
      };
      performTokenAuth();
    }
  }, [tokenParam, deviceUuid, login, redirectParam, router]);

  return (
    <main className="min-h-screen bg-[#1A0000] relative flex items-center justify-center p-4 overflow-hidden">
      <InAppBrowserOverlay />

      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#81D8D0]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#4E0000]/60 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-[#81D8D0]/10 border border-[#81D8D0]/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(129,216,208,0.1)]"
          >
            <Sparkles className="w-8 h-8 text-[#81D8D0]" />
          </motion.div>
          <h1 className="font-montserrat text-3xl font-black uppercase tracking-wider text-white">
            Sofia <span className="text-[#81D8D0]">Finsight</span>
          </h1>
          <p className="font-narrow text-[#81D8D0]/80 text-lg uppercase tracking-widest mt-1">
            Платформа Міні-Курсу
          </p>
        </div>

        {/* Glass Box Container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-6">

          {tokenVerifying ? (
            /* Loading State for Token Verification */
            <div className="py-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-[#81D8D0] animate-spin mx-auto" />
              <p className="font-narrow text-[#81D8D0] uppercase tracking-widest text-sm font-bold animate-pulse">
                Авторизація через Telegram...
              </p>
              <p className="text-xs text-gray-400 font-arimo">
                Будь ласка, зачекайте. Ми перевіряємо Ваше посилання для авто-входу.
              </p>
            </div>
          ) : (
            /* Standard Telegram Auth Info and Widget */
            <>
              <div className="text-center space-y-2">
                <h2 className="text-white font-montserrat font-bold text-lg uppercase tracking-wider">
                  Вхід на Платформу
                </h2>
                <p className="text-xs text-gray-300 font-arimo leading-relaxed">
                  Вхід до кабінету практикуму здійснюється виключно через Telegram.
                  Перейдіть за посиланням, отриманим у нашому Telegram-боті після оплати, або скористайтеся кнопкою швидкої авторизації нижче.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-950/50 border border-red-500/25 text-red-200 rounded-xl text-xs font-arimo flex items-start space-x-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Divider */}
              <div className="flex items-center justify-between">
                <span className="h-px bg-white/10 w-full" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mx-3 whitespace-nowrap font-narrow">
                  Авторизація
                </span>
                <span className="h-px bg-white/10 w-full" />
              </div>

              {/* Telegram Login Widget */}
              <div className="space-y-4 flex flex-col items-center">
                <TelegramLoginWidget
                  botName="sofifmc_bot"
                  onAuth={async (tgUser) => {
                    setLoading(true);
                    setError('');
                    try {
                      const res = await fetch('/api/minicourse/telegram-auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tgUser)
                      });
                      const result = await res.json();

                      if (!res.ok || !result.success) {
                        throw new Error(result.error || "Не вдалося авторизуватися через Telegram.");
                      }

                      login(result.user, result.progress);
                    } catch (err: any) {
                      console.error("TG Auth error:", err);
                      setError(err.message || "Помилка авторизації через Telegram. Спробуйте ще раз.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
                <p className="text-[9px] text-center text-gray-500 font-arimo">
                  Безпечна авторизація в один клік через офіційний Telegram API.
                </p>
                <div className="pt-2 text-center border-t border-white/5">
                  <p className="text-[10px] text-gray-400 font-arimo">
                    Виникли проблеми з доступом? Напишіть у техпідтримку:{" "}
                    <a href="https://t.me/YuransiS" target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline font-bold">
                      Написати у Телеграм
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-[#81D8D0] animate-spin" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
