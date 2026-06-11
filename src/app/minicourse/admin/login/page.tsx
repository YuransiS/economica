'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { loginUser } from '../../actions';
import { useAuth } from '../../useAuth';
import { Sparkles, ArrowRight, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import InAppBrowserOverlay from '@/components/InAppBrowserOverlay';

function AdminLoginContent() {
  const { login } = useAuth();
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError("Будь ласка, заповніть всі поля для входу");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/minicourse/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: adminUsername.trim(),
          password: adminPassword.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        login(result.user);
      } else {
        setError(result.error || "Невірний пароль або логін адміністратора");
      }
    } catch (err: any) {
      console.error(err);
      setError("Помилка підключення до сервера");
    } finally {
      setLoading(false);
    }
  };

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
            <ShieldCheck className="w-8 h-8 text-[#81D8D0]" />
          </motion.div>
          <h1 className="font-montserrat text-3xl font-black uppercase tracking-wider text-white">
            Finsight <span className="text-[#81D8D0]">Team</span>
          </h1>
          <p className="font-narrow text-[#81D8D0]/80 text-sm uppercase tracking-widest mt-1">
            Вхід для Адміністраторів
          </p>
        </div>

        {/* Glass Box Container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <form 
            onSubmit={handleAdminSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#81D8D0] mb-2 font-narrow">
                Telegram нікнейм *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Введіть свій нікнейм"
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-montserrat placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#81D8D0] mb-2 font-narrow">
                Пароль Доступу *
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-montserrat placeholder-gray-500"
                />
              </div>
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
              <span>{loading ? 'Перевірка...' : 'Вхід для команди'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          {/* Link back to student dashboard */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link 
              href="/minicourse/login" 
              className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#81D8D0]" />
              <span>Кабінет учасника</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#81D8D0]"></div>
      </main>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
