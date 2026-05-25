'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import InAppBrowserOverlay from '@/components/InAppBrowserOverlay';
import { getLeaderboard, StudentLeaderboardEntry, getLessonsConfig } from './supabase';
import { MinicourseLessonConfig } from './types';
import { 
  Trophy, BookOpen, Send, Award, LogOut, CheckCircle, 
  AlertTriangle, Lock, Eye, CheckCircle2, XCircle, ArrowRight, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, progress, loading, logout } = useAuth();
  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [lessonConfigs, setLessonConfigs] = useState<MinicourseLessonConfig[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const configs = await getLessonsConfig();
        setLessonConfigs(configs);
      } catch (err) {
        console.error("Failed to load lesson configs:", err);
      }
    };
    fetchConfigs();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user, progress]);

  if (loading || !user || !progress) {
    return (
      <div className="min-h-screen bg-[#1A0000] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-narrow text-[#81D8D0] uppercase tracking-widest text-sm">Завантаження платформи...</p>
        </div>
      </div>
    );
  }

  // Find user's rank in leaderboard
  const userRank = leaderboard.findIndex(entry => entry.id === user.id) + 1;

  // Dynamically mapped lessons from database
  const lessonsMeta = [1, 2, 3].map(id => {
    const config = lessonConfigs.find(c => c.lesson_id === id);
    return {
      id,
      title: config?.title || (id === 1 ? "Перший ефір" : id === 2 ? "Другий ефір" : "Третій ефір"),
      description: config?.description || (id === 1 ? "Створення першого інвестиційного плану" : id === 2 ? "Робота з капіталом та брокерськими рахунками" : "Купівля першої акції та диверсифікація"),
      duration: id === 1 ? "1 година 20 хв" : id === 2 ? "1 година 15 хв" : "1 година 45 хв"
    };
  });

  return (
    <div className="min-h-screen bg-[#1A0000] text-white relative font-montserrat flex flex-col pb-16">
      <InAppBrowserOverlay />
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#81D8D0]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#4E0000]/40 rounded-full blur-[200px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/minicourse" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#81D8D0]/10 border border-[#81D8D0]/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#81D8D0]" />
            </div>
            <span className="font-bold text-lg tracking-wider uppercase">Sofia <span className="text-[#81D8D0]">Minicourse</span></span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-[#81D8D0] uppercase tracking-widest">@{user.telegram}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl border border-white/10 hover:border-[#81D8D0]/30 text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10"
              title="Вийти з кабінету"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 flex-1">
        
        {/* Left/Middle Column (Progress & Course map) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress Widget */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Award className="w-24 h-24 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold text-[#81D8D0] uppercase tracking-widest font-narrow">Особиста аналітика</span>
                <h2 className="text-2xl font-black uppercase text-white mt-1">Загальний прогрес</h2>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <span className="text-4xl font-black text-[#81D8D0]">{progress.progressPercent}%</span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Завершено кроків міні-курсу</p>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-full h-4 bg-black/40 rounded-full border border-white/5 overflow-hidden p-0.5 mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress.progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#81D8D0] to-[#5ec9bf] shadow-[0_0_15px_rgba(129,216,208,0.5)]"
              ></motion.div>
            </div>

            {/* Checkpoints info */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6 text-center">
              {[1, 2, 3].map(id => {
                const lesson = progress.lessons[id as 1 | 2 | 3];
                const viewChecked = !!lesson.openedAt;
                const hwChecked = lesson.hwStatus === 'accepted';
                
                return (
                  <div key={id} className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Етап {id}</p>
                    <div className="flex justify-center space-x-2">
                      <div className={`p-1.5 rounded-lg text-xs font-bold ${viewChecked ? 'bg-[#81D8D0]/10 text-[#81D8D0]' : 'bg-white/5 text-gray-600'}`}>
                        Ефір
                      </div>
                      <div className={`p-1.5 rounded-lg text-xs font-bold ${hwChecked ? 'bg-[#81D8D0]/10 text-[#81D8D0]' : 'bg-white/5 text-gray-600'}`}>
                        ДЗ
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Lesson Map / Timeline */}
          <section className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#81D8D0]" />
              <span>Карта Міні-Курсу</span>
            </h2>

            <div className="space-y-4">
              {lessonsMeta.map((lMeta, idx) => {
                const id = lMeta.id as 1 | 2 | 3;
                const lesson = progress.lessons[id];
                const isUnlocked = lesson.unlocked;

                let statusText = "Закрито";
                let statusColor = "text-gray-500 bg-white/5 border-white/5";
                let icon = <Lock className="w-5 h-5" />;

                if (isUnlocked) {
                  if (lesson.hwStatus === 'accepted') {
                    statusText = "Зараховано 🎉";
                    statusColor = "text-green-400 bg-green-950/20 border-green-500/20";
                    icon = <CheckCircle2 className="w-5 h-5" />;
                  } else if (lesson.hwStatus === 'pending') {
                    statusText = "На перевірці ⏳";
                    statusColor = "text-[#81D8D0] bg-[#81D8D0]/10 border-[#81D8D0]/20";
                    icon = <HelpCircle className="w-5 h-5" />;
                  } else if (lesson.hwStatus === 'needs_improvement') {
                    statusText = "Потребує допрацювання ⚠️";
                    statusColor = "text-amber-400 bg-amber-950/20 border-amber-500/20";
                    icon = <AlertTriangle className="w-5 h-5" />;
                  } else {
                    statusText = "Доступно";
                    statusColor = "text-blue-400 bg-blue-950/20 border-blue-500/20";
                    icon = <Eye className="w-5 h-5" />;
                  }
                }

                return (
                  <motion.div
                    key={id}
                    whileHover={isUnlocked ? { x: 5 } : {}}
                    className={`bg-white/5 border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm transition-all ${
                      isUnlocked 
                        ? 'border-white/10 hover:border-white/20' 
                        : 'border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Round badge indicator */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg ${
                        isUnlocked 
                          ? 'bg-[#81D8D0]/10 border-[#81D8D0]/30 text-[#81D8D0]' 
                          : 'bg-black/30 border-white/5 text-gray-500'
                      }`}>
                        0{id}
                      </div>

                      <div>
                        <h3 className={`font-montserrat font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                          {lMeta.title}
                        </h3>
                        <p className="text-xs text-gray-400 font-narrow uppercase tracking-widest">{lMeta.duration} • {lMeta.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${statusColor} flex items-center space-x-1.5`}>
                        {icon}
                        <span>{statusText}</span>
                      </span>

                      {isUnlocked ? (
                        <Link 
                          href={`/minicourse/lessons/${id}`}
                          className="px-4 py-2 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold text-xs uppercase rounded-lg flex items-center space-x-1.5 shadow-[0_0_10px_rgba(129,216,208,0.2)]"
                        >
                          <span>Вчитись</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div className="w-24 h-9 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-gray-600 text-xs">
                          Заблоковано
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Claim Bonuses banner */}
          <section className="bg-gradient-to-r from-[#4E0000] to-[#1A0000] border border-[#81D8D0]/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Award className="w-32 h-32 text-white" />
            </div>
            <div className="max-w-md">
              <span className="text-[10px] font-bold text-[#81D8D0] uppercase tracking-widest font-narrow">Ексклюзивні подарунки</span>
              <h3 className="text-2xl font-black uppercase text-white mt-1 mb-3">Забрати бонуси курсу</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-6 font-arimo">
                Бонусний урок про нерухомість на Балі (інвестиції від 50$) та повний інвестиційний портфель Софії з детальною стратегією!
              </p>
              <button 
                onClick={() => setIsBonusModalOpen(true)}
                className="px-8 py-3.5 bg-[#81D8D0] text-[#1A0000] hover:bg-[#97e3db] text-xs font-bold uppercase rounded-r-2xl rounded-l-sm tracking-wider flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(129,216,208,0.3)] hover:scale-105"
              >
                <span>Отримати матеріали</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>

        {/* Right Column (Leaderboard & Quick Help) */}
        <div className="space-y-8">
          
          {/* Leaderboard widget */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="font-montserrat font-black uppercase text-sm text-white flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-[#81D8D0] animate-bounce" />
                <span>Лідерборд</span>
              </h3>
              {userRank > 0 && (
                <span className="text-xs font-narrow font-bold text-[#81D8D0] bg-[#81D8D0]/10 border border-[#81D8D0]/20 px-2.5 py-1 rounded-lg">
                  Ваше місце: {userRank}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {leaderboardLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#81D8D0] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">Немає зареєстрованих учнів</p>
              ) : (
                leaderboard.map((item, idx) => {
                  const rank = idx + 1;
                  const isSelf = item.id === user.id;

                  return (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isSelf 
                          ? 'border-[#81D8D0] bg-[#81D8D0]/10 shadow-[0_0_15px_rgba(129,216,208,0.15)] scale-[1.02]' 
                          : 'border-white/5 bg-black/20 hover:bg-black/35 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Rank Badge */}
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-narrow ${
                          rank === 1 ? 'bg-amber-400 text-black' :
                          rank === 2 ? 'bg-slate-300 text-black' :
                          rank === 3 ? 'bg-amber-600 text-black' :
                          'bg-white/5 text-gray-400'
                        }`}>
                          {rank}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelf ? 'text-[#81D8D0]' : 'text-white'}`}>{item.name}</p>
                          {item.telegram && (
                            <p className="text-[9px] text-gray-400">@{item.telegram}</p>
                          )}
                        </div>
                      </div>

                      <span className={`text-xs font-bold font-narrow ${isSelf ? 'text-[#81D8D0]' : 'text-gray-300'}`}>
                        {item.progressPercent}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Quick Help widget */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
            <span className="text-[10px] font-bold text-[#81D8D0] uppercase tracking-widest font-narrow">Техпідтримка та Питання</span>
            <h4 className="text-lg font-black uppercase text-white mt-1 mb-2">Виникли запитання?</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-arimo">
              Якщо у вас виникли труднощі з домашнім завданням, таблицями, переказами чи загальними питаннями, пишіть нашому куратору!
            </p>
            <a 
              href="https://t.me/sofi_finsight" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#81D8D0]/10 border border-[#81D8D0]/30 text-[#81D8D0] hover:bg-[#81D8D0]/20 hover:text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Задати запитання в TG</span>
            </a>
          </section>
        </div>
      </main>

      {/* Floating Ask-a-Question widget on bottom right */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
        <a 
          href="https://t.me/sofi_finsight"
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] flex items-center justify-center shadow-[0_4px_25px_rgba(129,216,208,0.5)] transition-all hover:scale-110 group relative"
          title="Задати запитання у Telegram"
        >
          <Send className="w-6 h-6" />
          <span className="absolute right-16 top-3 bg-black/90 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Маєте питання? Напишіть нам!
          </span>
        </a>
      </div>

      {/* Bonus Modal */}
      <AnimatePresence>
        {isBonusModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A0000] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#81D8D0]/5 rounded-full blur-2xl"></div>
              
              <h3 className="font-montserrat font-black text-2xl uppercase text-white mb-2">
                Як забрати бонуси курсу? 🎁
              </h3>
              <p className="text-xs text-[#81D8D0] font-narrow font-bold uppercase tracking-widest mb-6">
                Ексклюзивні матеріали від Софії
              </p>

              <div className="space-y-4 text-xs font-arimo text-gray-300 leading-relaxed mb-8">
                <p>
                  Щоб забрати бонусний урок про <strong>нерухомість на Балі з стартовими вкладеннями всього 50$</strong>, та гайд мого інвестиційного портфелю з моєю стратегією інвестування:
                </p>
                
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-[#81D8D0] flex-shrink-0" />
                    <span>Бонусний відеоурок про нерухомість на Балі</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-[#81D8D0] flex-shrink-0" />
                    <span>PDF-гайд з інвестиційною стратегією Софії</span>
                  </div>
                </div>

                <p>
                  Заповніть коротку гугл форму за посиланням нижче, і ми надішлемо вам усі матеріали!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://docs.google.com/forms/d/1Cf6TPxQ64FjPkee4spgrSxd_PV6q4FcMLA540KqYXEw/preview"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-4 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] text-center font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(129,216,208,0.2)]"
                >
                  Заповнити форму
                </a>
                <button 
                  onClick={() => setIsBonusModalOpen(false)}
                  className="py-4 px-6 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-xs font-bold uppercase rounded-xl transition-all"
                >
                  Закрити
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
