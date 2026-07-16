'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Award,
  Shield,
  ArrowRight,
  Target,
  FileText,
  Users,
  Video
} from 'lucide-react';
import Image from 'next/image';
import ReviewsSection from '@/components/ReviewsSection';
import Footer from '@/components/Footer';
import DiagnosticsLeadModal from '@/components/DiagnosticsLeadModal';

// Offers copywriting configurations
const OFFERS = {
  1: {
    badge: "Для тих, хто будує пасивний дохід",
    title: "Дізнайся, що потрібно зробити вже сьогодні, щоб на пенсії отримувати $2 000 пасивного доходу щомісяця.",
    description: "На фінансовій діагностиці розрахуємо необхідний капітал, суму щомісячних інвестицій і складемо твій покроковий план до фінансово незалежної пенсії — без залежності від державних виплат та фінансової допомоги дітей.",
    bullets: [
      "Розрахунок необхідного капіталу для пенсії в $2 000/міс",
      "Визначення оптимальної суми щомісячних інвестицій",
      "Покроковий план побудови незалежного пенсійного капіталу"
    ]
  },
  2: {
    badge: "Для тих, хто хоче контролювати фінанси",
    title: "Заробляєш нормально, але наприкінці місяця знову нуль і незрозуміло, куди зникають гроші?",
    description: "На фінансовій діагностиці знайдемо, куди насправді йдуть твої гроші, визначимо, скільки ти можеш регулярно зберігати та інвестувати, та складемо план накопичення капіталу під твій дохід.",
    bullets: [
      "Аналіз та виявлення прихованих витрат («сліпих зон»)",
      "Визначення комфортної норми заощаджень без жорсткої економії",
      "Створення плану накопичення капіталу під ваш поточний дохід"
    ]
  },
  3: {
    badge: "Для тих, хто має заощадження",
    title: "Гроші є, але вони просто лежать на рахунку, знецінюються, а ти не знаєш, куди їх вкладати?",
    description: "На фінансовій діагностиці визначимо, які інвестиційні інструменти підходять під твою суму, цілі та готовність до ризику, та складемо конкретний план: куди, скільки та навіщо інвестувати.",
    bullets: [
      "Підбір надійних інструментів під ваш бюджет та ризик-профіль",
      "Чітке розуміння: куди, скільки та на який термін вкладати",
      "Захист накопичень від інфляції та валютних ризиків у 2026 році"
    ]
  }
};

export default function DiagnosticsClient() {
  const searchParams = useSearchParams();
  const [offerNum, setOfferNum] = useState<1 | 2 | 3>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Read offer query param (?o=1, 2, 3)
  useEffect(() => {
    const o = searchParams.get('o');
    if (o === '2') setOfferNum(2);
    else if (o === '3') setOfferNum(3);
    else setOfferNum(1);
  }, [searchParams]);

  // Persistent 24h Countdown Timer
  useEffect(() => {
    const STORAGE_KEY = 'diagnostics_timer_deadline';
    let deadline = localStorage.getItem(STORAGE_KEY);

    if (!deadline) {
      const now = new Date();
      const target = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      deadline = target.toISOString();
      localStorage.setItem(STORAGE_KEY, deadline);
    }

    const calculateTimeLeft = () => {
      const difference = new Date(deadline!).getTime() - new Date().getTime();
      if (difference <= 0) {
        // Reset timer if elapsed to start a new 24h cycle
        const now = new Date();
        const target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_KEY, target.toISOString());
        return { hours: 23, minutes: 59, seconds: 59 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const openLeadModal = () => {
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
  };

  const activeOffer = OFFERS[offerNum];

  // FAQ Content
  const faqs = [
    {
      q: "Якщо я ніколи не інвестував?",
      a: "Саме для цього і проводиться розбір, щоб у вас з'явилось розуміння, що для цього потрібно і з чого почати."
    },
    {
      q: "Якщо зараз я не планую інвестувати?",
      a: "Діагностика фінансів в будь-котрому випадку зайвою не буде, ви зможете розібратись в \"сліпих зонах\" в ваших розходах та скоригувати витрати на накопичення."
    },
    {
      q: "Якщо я хочу почати інвестувати одразу?",
      a: "Тоді аудит ваших фінансів це маст хев на старті, щоб ви могли тверезо глянути на всю ситуацію та зрозуміти, що робити, щоб інвестиції стали системою, а не випадковою подією."
    },
    {
      q: "Чи вистачить мені однієї консультації, щоб почати формувати свій пасивний дохід?",
      a: "Все залежить від ваших знань. Комусь дійсно достатньо тільки отримати фідбек на сформований інвестиційний портфель, а комусь потрібно починати з самого нуля. Але на аудиті ми точно розберемо ваш конкретний випадок."
    }
  ];

  return (
    <main className="w-full relative overflow-x-hidden bg-[#1A0000] text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4E0000]/60 via-[#1A0000]/0 to-transparent -z-10"></div>
      
      {/* 1 & 2. HERO SECTION */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 overflow-hidden">
        {/* Dynamic Animated Money Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 select-none" aria-hidden="true">
          <style>{`
            @keyframes float-money-slow {
              0% {
                transform: translateY(110vh) rotate(0deg) translateX(0);
                opacity: 0;
              }
              10% {
                opacity: 0.3;
              }
              90% {
                opacity: 0.3;
              }
              100% {
                transform: translateY(-10vh) rotate(360deg) translateX(80px);
                opacity: 0;
              }
            }
            .floating-money {
              position: absolute;
              bottom: -100px;
              animation-name: float-money-slow;
              animation-iteration-count: infinite;
              animation-timing-function: linear;
            }
          `}</style>
          {[
            { left: '5%', delay: '0s', duration: '14s', scale: 0.8, type: 'note' },
            { left: '15%', delay: '4s', duration: '18s', scale: 1.1, type: 'coin' },
            { left: '28%', delay: '2s', duration: '16s', scale: 0.9, type: 'note' },
            { left: '40%', delay: '7s', duration: '13s', scale: 1.2, type: 'note' },
            { left: '52%', delay: '1s', duration: '15s', scale: 0.7, type: 'coin' },
            { left: '65%', delay: '9s', duration: '17s', scale: 1.0, type: 'note' },
            { left: '78%', delay: '3s', duration: '14s', scale: 1.3, type: 'coin' },
            { left: '90%', delay: '5s', duration: '16s', scale: 0.8, type: 'note' },
            { left: '10%', delay: '8s', duration: '15s', scale: 1.0, type: 'note' },
            { left: '33%', delay: '10s', duration: '19s', scale: 0.8, type: 'coin' },
            { left: '58%', delay: '6s', duration: '14s', scale: 1.2, type: 'note' },
            { left: '83%', delay: '11s', duration: '16s', scale: 0.9, type: 'coin' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="floating-money text-[#81D8D0]"
              style={{
                left: item.left,
                animationDelay: item.delay,
                animationDuration: item.duration,
                transform: `scale(${item.scale})`,
              }}
            >
              {item.type === 'note' ? (
                <svg width="60" height="30" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
                  <rect x="2" y="2" width="96" height="46" rx="4" />
                  <circle cx="50" cy="25" r="10" />
                  <path d="M50 18v14M47 21h5a2.5 2.5 0 0 0 0-5h-4a2.5 2.5 0 0 1 0-5h5" />
                </svg>
              ) : (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
                  <circle cx="15" cy="15" r="13" />
                  <path d="M15 8v14M13 10h4a2 2 0 0 0 0-4h-3.2a2 2 0 0 1 0-4h3.2" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-6 text-[#81D8D0] font-narrow uppercase tracking-wider text-xs md:text-sm"
          >
            {activeOffer.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-montserrat text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-tight mb-8 max-w-4xl mx-auto"
          >
            {activeOffer.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-arimo text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {activeOffer.description}
          </motion.p>

          {/* Hero Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16"
          >
            {activeOffer.bullets.map((bullet, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 text-left flex items-start space-x-3 transition-transform hover:scale-[1.02]"
              >
                <div className="rounded-full bg-[#81D8D0]/25 p-1 text-[#81D8D0] shrink-0 mt-0.5" aria-hidden="true">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-arimo text-sm font-semibold leading-relaxed text-gray-200">{bullet}</span>
              </div>
            ))}
          </motion.div>

          {/* Pricing & CTA Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-md mx-auto bg-gradient-to-br from-[#4E0000] to-[#2D0000] border border-[#81D8D0]/30 rounded-3xl p-8 md:p-10 shadow-2xl relative"
          >
            <div className="absolute inset-0 rounded-3xl border border-[#81D8D0]/10 pointer-events-none"></div>

            <p className="text-gray-400 font-narrow uppercase tracking-widest text-xs mb-1">
              Спеціальна вартість діагностики
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gray-400 line-through text-xl md:text-2xl font-bold">1 200 грн</span>
              <span className="text-[#81D8D0] text-4xl md:text-5xl font-black font-montserrat">390 грн</span>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center justify-center gap-2 text-[#FBCBDA] bg-white/5 border border-white/5 rounded-xl py-2.5 px-4 mb-6 text-xs md:text-sm font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#81D8D0] animate-pulse" aria-hidden="true" />
              <span>
                Ціна збільшиться за: {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
              </span>
            </div>

            <button
              onClick={openLeadModal}
              className="w-full font-montserrat rounded-xl bg-[#81D8D0] py-4 md:py-5 text-base md:text-lg font-bold uppercase tracking-wider text-[#4E0000] transition-all hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)] hover:shadow-[0_0_40px_rgba(129,216,208,0.5)] focus:outline-none focus:ring-4 focus:ring-[#81D8D0]"
            >
              Хочу аудит фінансів
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. CURRENT SITUATION */}
      <section className="bg-[#100000] py-24 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-[#FBCBDA] tracking-wide mb-4">
              Можливо, зараз у вас саме така ситуація
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-arimo max-w-2xl mx-auto">
              Багато людей роками працюють, але не бачать фінансового зростання через певні системні помилки.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Заробляєте більше, ніж кілька років тому, але грошей більше не стало.",
                desc: "Ваш дохід зростає, проте витрати пропорційно збільшуються, не залишаючи вільного капіталу."
              },
              {
                title: "Наприкінці місяця знову виникає питання: «Куди все поділося?»",
                desc: "Відсутність контролю за потоками створює відчуття, що гроші просто витікають крізь пальці."
              },
              {
                title: "Начебто відкладаєте, але накопичення постійно доводиться витрачати.",
                desc: "Немає чіткої системи розподілу бюджету, тому заощадження регулярно йдуть на незаплановані покупки."
              },
              {
                title: "Хочете інвестувати, але боїтеся зробити помилку.",
                desc: "Різноманіття інструментів лякає, а відсутність стратегії та знань зупиняє перед першим кроком."
              },
              {
                title: "Розумієте, що потрібно створювати пасивний дохід, але не знаєте, з чого почати.",
                desc: "Маєте бажання мати незалежні гроші на майбутнє, але бракує покрокового алгоритму дій."
              },
              {
                title: "Відчуваєте, що працюєте багато, але фінансова свобода так і не стає ближче.",
                desc: "Ви перебуваєте в постійному стресі та рутині, обмінюючи свій час на гроші без довгострокової перспективи."
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#1A0000] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#81D8D0]/30 transition-colors"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-[#4E0000] flex items-center justify-center text-[#81D8D0] mb-5" aria-hidden="true">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-montserrat font-bold text-base md:text-lg text-white mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-arimo text-xs md:text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OUTCOMES IN 40 MIN */}
      <section className="py-24 px-4 bg-[#1A0000] border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-[#81D8D0] tracking-wide mb-4">
              За 40 хвилин ви отримаєте:
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-arimo max-w-2xl mx-auto">
              Конкретна, вимірна користь від онлайн-діагностики без зайвої теорії.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Аналіз вашої фінансової ситуації", desc: "Детальний погляд на поточний стан ваших грошових потоків." },
              { title: "Розбір ваших доходів та витрат", desc: "Структуруємо ваші фінанси для виявлення можливостей оптимізації." },
              { title: "Розуміння, чому зараз не виходить накопичувати", desc: "Визначимо психологічні та технічні тригери, які заважають вам рости." },
              { title: "Покроковий план дій під вашу ситуацію", desc: "Індивідуальна інструкція: що робити у вашому випадку." },
              { title: "Рекомендації щодо фінансової подушки", desc: "Як розрахувати та де правильно зберігати ваш резервний фонд." },
              { title: "Розуміння часу для старту інвестицій", desc: "Коли саме вам варто купувати перші активи для пасивного доходу." },
              { title: "Відповіді на всі ваші запитання", desc: "Живий діалог з ліцензованим спеціалістом по вашому кейсу." }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#2D0000]/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#81D8D0]/20 transition-all hover:bg-[#2D0000]/50"
              >
                <div>
                  <div className="text-[#81D8D0] font-black text-3xl font-narrow mb-4" aria-hidden="true">0{idx + 1}</div>
                  <h3 className="font-montserrat font-bold text-base md:text-lg text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="font-arimo text-xs md:text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THIS AUDIT IS FOR YOU IF */}
      <section className="py-24 px-4 bg-[#100000] border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-[#FBCBDA] tracking-wide mb-4">
              Цей розбір для вас, якщо ви:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {[
              "хочете перестати жити від зарплати до зарплати",
              "хочете створити стабільний капітал",
              "хочете підготуватися до фінансово безпечної пенсії",
              "хочете створити пасивний дохід у валюті",
              "хочете почати інвестувати без хаосу та помилок",
              "хочете зрозуміти, що робити саме у вашій ситуації"
            ].map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center space-x-4 bg-white/5 border border-white/5 rounded-xl p-4 transition-all hover:bg-white/10"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#81D8D0] flex-shrink-0" aria-hidden="true"></div>
                <span className="font-arimo text-sm md:text-base font-bold uppercase tracking-wide leading-relaxed text-gray-200">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={openLeadModal}
              className="font-montserrat rounded-xl bg-[#81D8D0] px-12 py-5 text-base md:text-lg font-bold uppercase tracking-wide text-[#4E0000] transition-all hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)] focus:outline-none focus:ring-4 focus:ring-[#81D8D0]"
            >
              Хочу аудит фінансів
            </button>
          </div>
        </div>
      </section>

      {/* 6. WHO CONDUCTS */}
      <section className="py-24 px-4 bg-[#1A0000] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-[#81D8D0] opacity-5 blur-[100px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-white tracking-wide mb-4">
              Хто проводить розбір
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-arimo max-w-2xl mx-auto">
              Ваш кейс буде аналізувати команда ліцензованих фінансових радників з практичним досвідом.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Sofia */}
            <div className="bg-[#2D0000]/20 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-stretch gap-6">
              <div className="w-48 h-64 relative rounded-2xl overflow-hidden shrink-0 border border-white/10">
                <Image 
                  src="/sofia-invest/photo_2026-03-03_10-14-10.webp" 
                  alt="Софія Фединяк"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-montserrat text-xl md:text-2xl font-black text-[#FBCBDA] uppercase mb-1">
                    Софія Фединяк
                  </h3>
                  <p className="text-xs text-[#81D8D0] font-narrow uppercase tracking-widest font-bold mb-4">
                    Ліцензований фінансовий радник
                  </p>
                  <ul className="space-y-2 text-xs md:text-sm font-arimo text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81D8D0] mt-0.5" aria-hidden="true">•</span>
                      <span>Працюю з тими, хто прагне будувати довгостроковий капітал та фінансову свободу.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81D8D0] mt-0.5" aria-hidden="true">•</span>
                      <span>Я не продаю «легкі гроші» чи сумнівні чарівні схеми швидкого збагачення.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81D8D0] mt-0.5" aria-hidden="true">•</span>
                      <span>Моя задача — допомогти побудувати систему, яка працюватиме на вас роками.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Anna */}
            <div className="bg-[#2D0000]/20 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-stretch gap-6">
              <div className="w-48 h-64 relative rounded-2xl overflow-hidden shrink-0 border border-white/10">
                <Image 
                  src="/images/anna_1.jpg" 
                  alt="Анна"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-montserrat text-xl md:text-2xl font-black text-[#FBCBDA] uppercase mb-1">
                    Анна
                  </h3>
                  <p className="text-xs text-[#81D8D0] font-narrow uppercase tracking-widest font-bold mb-4">
                    Фінансова радниця
                  </p>
                  <ul className="space-y-2 text-xs md:text-sm font-arimo text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81D8D0] mt-0.5" aria-hidden="true">•</span>
                      <span>Радниця міжнародної брокерської компанії, ліцензована НБУ.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81D8D0] mt-0.5" aria-hidden="true">•</span>
                      <span>Активно працює з клієнтами та допомагає будувати персональні фінансові плани.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#81D8D0] mt-0.5" aria-hidden="true">•</span>
                      <span>Після розбору, за потреби, ви зможете продовжити навчання разом із Софією на менторстві.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section className="py-24 px-4 bg-[#100000] border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-[#81D8D0] tracking-wide mb-4">
              Як проходить розбір
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-arimo max-w-xl mx-auto">
              Ми максимально спростили шлях взаємодії для економії вашого часу.
            </p>
          </div>

          <div className="relative border-l-2 border-[#81D8D0]/30 pl-8 md:pl-12 space-y-12 max-w-2xl mx-auto mb-16">
            {[
              { title: "Залишаєте заявку", desc: "Заповнюєте форму реєстрації та вносите оплату 390 грн." },
              { title: "З вами зв'язується команда", desc: "Узгоджуємо зручний час та дату проведення розбору." },
              { title: "Онлайн Zoom-зустріч", desc: "Спілкуємося протягом 40 хвилин у форматі відеодзвінка." },
              { title: "Отримуєте персональний фінансовий план", desc: "Отримуєте індивідуальні рекомендації та розрахунки капіталу." }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className="absolute -left-[41px] md:-left-[57px] top-1.5 h-6 w-6 rounded-full border-4 border-[#100000] bg-[#81D8D0] flex items-center justify-center" aria-hidden="true">
                  <span className="text-[10px] font-black text-[#4E0000]">{idx + 1}</span>
                </div>
                <h3 className="font-montserrat font-bold text-lg md:text-xl text-white mb-2">
                  {step.title}
                </h3>
                <p className="font-arimo text-sm md:text-base text-gray-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={openLeadModal}
              className="font-montserrat rounded-xl bg-[#81D8D0] px-12 py-5 text-base md:text-lg font-bold uppercase tracking-wide text-[#4E0000] transition-all hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)] focus:outline-none focus:ring-4 focus:ring-[#81D8D0]"
            >
              Хочу аудит фінансів
            </button>
          </div>
        </div>
      </section>

      {/* 8. POST-MEETING UNDERSTANDING */}
      <section className="py-24 px-4 bg-[#1A0000] border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-[#FBCBDA] tracking-wide mb-4">
              Після зустрічі ви будете чітко розуміти:
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-arimo max-w-2xl mx-auto">
              Ваші конкретні орієнтири після закінчення 40-хвилинного розбору.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "скільки грошей потрібно саме вам для фінансової свободи;",
              "як правильно і без стресу сформувати подушку безпеки;",
              "як почати регулярно накопичувати без жорсткої економії та обмежень;",
              "які інвестиційні інструменти можуть підійти саме вашим цілям;",
              "що зробити вже протягом найближчого місяця."
            ].map((outcome, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#81D8D0]/30 transition-colors"
              >
                <div>
                  <div className="h-10 w-10 rounded-full bg-[#81D8D0]/10 border border-[#81D8D0]/20 flex items-center justify-center text-[#81D8D0] mb-4" aria-hidden="true">
                    <Target className="w-5 h-5" />
                  </div>
                  <p className="font-montserrat font-bold text-sm md:text-base leading-relaxed text-gray-200">
                    {outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <ReviewsSection />

      {/* 10. FAQ */}
      <section className="py-24 px-4 bg-[#1A0000] border-t border-white/5">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-montserrat text-2xl md:text-4xl font-black uppercase text-center text-[#FBCBDA] tracking-wide mb-12">
            FAQ
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-6 flex justify-between items-center gap-4 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#81D8D0] rounded-2xl"
                  >
                    <span className="font-montserrat font-bold text-sm md:text-base text-white">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#81D8D0] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 border-t border-white/5 text-xs md:text-sm font-arimo text-gray-400 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-24 px-4 bg-gradient-to-t from-[#4E0000]/60 to-[#100000] text-center border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase text-white mb-6 leading-tight">
            Ви можете ще довго відкладати фінансові зміни.<br/>
            <span className="text-[#81D8D0]">А можете вже сьогодні отримати персональний план дій.</span>
          </h2>
          <p className="text-gray-400 font-arimo text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Всього 40 хвилин спілкування, які замінять місяці хаотичного пошуку інформації в інтернеті.
          </p>

          <button
            onClick={openLeadModal}
            className="font-montserrat rounded-xl bg-[#81D8D0] px-16 py-6 text-lg font-bold uppercase tracking-wider text-[#4E0000] transition-all hover:scale-105 shadow-[0_0_45px_rgba(129,216,208,0.4)] focus:outline-none focus:ring-4 focus:ring-[#81D8D0]"
          >
            Хочу аудит фінансів
          </button>
        </div>
      </section>

      <Footer />

      {/* LEAD MODAL */}
      <DiagnosticsLeadModal 
        isOpen={isModalOpen} 
        onCloseAction={closeLeadModal} 
        offerNumber={offerNum}
      />
    </main>
  );
}
