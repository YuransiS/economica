'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser } from '../supabase';
import { useAuth } from '../useAuth';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Send, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [emailOrTg, setEmailOrTg] = useState('');
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
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

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!emailOrTg.trim()) {
      setError("Будь ласка, введіть ваш Email або Telegram нікнейм");
      return;
    }

    setLoading(true);
    try {
      const { user, progress } = await loginUser(emailOrTg.trim(), name.trim() || undefined, deviceUuid);
      login(user, progress);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Помилка авторизації. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError("Будь ласка, заповніть всі поля для входу");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/minicourse/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: adminEmail.trim(),
          password: adminPassword.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        login(result.user);
      } else {
        setError(result.error || "Невірний пароль адміністратора");
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
          
          {/* Tab Switches */}
          <div className="flex border-b border-white/10 mb-8 p-1 bg-black/20 rounded-xl">
            <button
              onClick={() => { setActiveTab('student'); setError(''); }}
              className={`flex-1 py-3 text-center rounded-lg font-arimo font-bold uppercase text-sm transition-all ${
                activeTab === 'student'
                  ? 'bg-[#81D8D0] text-[#1A0000] shadow-[0_0_15px_rgba(129,216,208,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Учасник
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setError(''); }}
              className={`flex-1 py-3 text-center rounded-lg font-arimo font-bold uppercase text-sm transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#81D8D0] text-[#1A0000] shadow-[0_0_15px_rgba(129,216,208,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Адміністратор
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'student' ? (
              <motion.form 
                key="student-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
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
                    Email або Telegram нікнейм *
                  </label>
                  <div className="relative">
                    <Send className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                      type="text"
                      required
                      value={emailOrTg}
                      onChange={(e) => setEmailOrTg(e.target.value)}
                      placeholder="Введіть ваш Email або @telegram"
                      className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-montserrat placeholder-gray-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    * Використовуйте ті ж дані, що й при реєстрації на практикум для синхронізації.
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
              </motion.form>
            ) : (
              <motion.form 
                key="admin-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleAdminSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#81D8D0] mb-2 font-narrow">
                    Логін або Email Адміністратора *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                      type="text"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="sofifinsight"
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
                  <p className="text-[10px] text-gray-400 mt-2">
                    * Для входу використовуйте секретний ключ адмін-панелі.
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
                  <span>{loading ? 'Перевірка...' : 'Вхід для команди'}</span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
