'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { loginUser } from '../supabase';
import { useAuth } from '../useAuth';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Send, User } from 'lucide-react';
import InAppBrowserOverlay from '@/components/InAppBrowserOverlay';
import TelegramLoginWidget from '@/components/TelegramLoginWidget';

function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const autologinParam = searchParams.get('autologin');

  
  const [telegram, setTelegram] = useState('');
  const [name, setName] = useState('');
  
  
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceUuid, setDeviceUuid] = useState('');

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

  useEffect(() => {
    if (autologinParam && deviceUuid) {
      const performAutologin = async () => {
        setLoading(true);
        setError('');
        try {
          const { user, progress } = await loginUser(autologinParam.trim(), undefined, deviceUuid);
          login(user, progress);
        } catch (err: any) {
          console.error("Autologin failed:", err);
          setError(err.message || "Помилка авто-входу. Спробуйте ввести дані вручну.");
        } finally {
          setLoading(false);
        }
      };
      performAutologin();
    }
  }, [autologinParam, deviceUuid, login]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!telegram.trim()) {
      setError("Будь ласка, введіть ваш Telegram нікнейм");
      return;
    }

    setLoading(true);
    try {
      const { user, progress } = await loginUser(telegram.trim(), name.trim() || undefined, deviceUuid);
      login(user, progress);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Помилка авторизації. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  ;

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
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                 <form 
            onSubmit={handleStudentSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#81D8D0] mb-2 font-narrow">
                Ваше Ім'я (необов'язково)
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введіть ваше ім'я"
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-montserrat placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#81D8D0] mb-2 font-narrow">
                Telegram нікнейм *
              </label>
              <div className="relative">
                <Send className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  required
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="Введіть ваш @telegram нікнейм"
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-montserrat placeholder-gray-500"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                * Використовуйте той самий Telegram нікнейм, що й при оплаті практикуму.
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="p-3 bg-red-950/50 border border-red-500/20 text-red-300 rounded-xl text-xs font-arimo"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(129,216,208,0.2)] disabled:opacity-50"
            >
              <span>{loading ? 'Вхід...' : 'Почати навчання'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between">
            <span className="h-px bg-white/10 w-full" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mx-3 whitespace-nowrap font-narrow">або увійдіть через</span>
            <span className="h-px bg-white/10 w-full" />
          </div>

          {/* Telegram Login Widget */}
          <div className="space-y-4">
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

                  // Successfully validated on server-side and fetched profile, trigger login hook
                  login(result.user, result.progress);
                } catch (err: any) {
                  console.error("TG Auth error:", err);
                  setError(err.message || "Помилка авторизації через Telegram. Спробуйте ще раз.");
                } finally {
                  setLoading(false);
                }
              }}
            />
            <p className="text-[9px] text-center text-gray-500">
              Безпечна авторизація в один клік без введення паролів.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#81D8D0]"></div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}

