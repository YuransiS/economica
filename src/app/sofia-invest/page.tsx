'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import LeadForm from '@/components/LeadForm';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Check, TrendingDown, Receipt, AlertCircle, CloudOff, Target, Calculator, TrendingUp, PieChart, ChevronRight, ChevronLeft, X } from 'lucide-react';

export default function SofiaInvestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="antialiased scroll-smooth font-[sans-serif] bg-[#111] text-[#111] overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <header className="relative text-white py-12 md:py-20 px-5 overflow-hidden min-h-[85vh] flex items-center justify-center bg-[#4E0000]">
        <div className="absolute inset-0 z-0 bg-transparent">
          <img src="/sofia-invest/IMG_5574.webp" alt="Софія Фединяк" fetchPriority="high" className="w-full h-full object-cover object-top opacity-100" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-3/4 z-10 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-20 text-center w-full flex flex-col items-center pt-[160px] md:pt-32 pb-10">
          <div className="relative mb-5 max-w-3xl w-full animate-on-load" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-heading heading-style text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-white text-shadow-strong relative z-10">
              Як накопичити
              <span className="relative inline-block ml-2 mr-2">
                перш<span className="relative z-10">і</span>
                <img src="/sofia-invest/IMG_5575.PNG" alt="Бантик із доларів" fetchPriority="high" className="absolute bottom-[60%] left-[85%] -translate-x-1/2 w-20 md:w-24 drop-shadow-2xl z-0 hover:scale-105 transition-transform duration-300 pointer-events-none" style={{ maxWidth: 'unset' }} />
              </span> <span className="whitespace-nowrap">100 000$</span><br />
              <span className="text-xl md:text-3xl mt-2 block font-bold">та стабільно отримувати пасивний дохід завдяки інвестиціям</span>
            </h1>
          </div>

          <div className="flex flex-col gap-3 mb-8 text-base md:text-xl font-medium text-gray-100 bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full max-w-2xl animate-on-load" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center gap-3">
              <Check className="text-green-400 w-6 h-6 shrink-0" />
              <span>За моєю авторською методикою</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Check className="text-green-400 w-6 h-6 shrink-0" />
              <span>Без дихання маткою</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Check className="text-green-400 w-6 h-6 shrink-0" />
              <span>Навіть без досвіду в фінансах та інвестуванні</span>
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-white text-[#4E0000] font-bold text-xl py-4 px-12 rounded-full uppercase font-heading tracking-wider shadow-xl animate-on-load" style={{ animationDelay: '0.5s' }}>
            Дивитись урок
          </button>
        </div>
      </header>

      {/* 2. PAIN POINTS SECTION */}
      <section className="pt-8 pb-12 md:pt-14 md:pb-16 px-5 text-white relative overflow-hidden -mt-[1px] z-10">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/sofia-invest/Golden Cash Flow Explosion.webp')" }}></div>
        <div className="absolute inset-0 bg-black/75 z-10"></div>

        <div className="max-w-3xl mx-auto relative z-20">
          <h2 className="font-heading heading-style text-3xl md:text-4xl text-center text-white font-bold mb-8 drop-shadow-lg">
            Знайома ситуація?
          </h2>

          <p className="text-xl text-center mb-8 font-semibold text-gray-200">
            Ви прекрасно заробляєте, але:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl p-6 rounded-2xl flex gap-4 items-center">
              <div className="p-3 bg-white/5 rounded-full shrink-0 border border-white/10">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-100">наприкінці місяця не залишається нічого;</p>
            </div>
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl p-6 rounded-2xl flex gap-4 items-center">
              <div className="p-3 bg-white/5 rounded-full shrink-0 border border-white/10">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-100">рахунки ростуть, а збережень — нуль;</p>
            </div>
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl p-6 rounded-2xl flex gap-4 items-center">
              <div className="p-3 bg-white/5 rounded-full shrink-0 border border-white/10">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-100">борги нагадують про себе щоразу, коли отримуєте зарплату;</p>
            </div>
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl p-6 rounded-2xl flex gap-4 items-center">
              <div className="p-3 bg-white/5 rounded-full shrink-0 border border-white/10">
                <CloudOff className="w-7 h-7 text-white" />
              </div>
              <p className="text-lg font-medium text-gray-100">мрії про фінансову свободу виглядають як недосяжна казка.</p>
            </div>
          </div>

          <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl p-8 rounded-2xl mb-10 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/50"></div>
            <p className="text-xl mb-4 leading-relaxed font-medium">Ви багато працюєте, намагаєтесь зекономити, але все одно: <br /><b className="text-white font-bold tracking-wide">гроші просто прослизають крізь пальці.</b></p>
            <p className="text-lg text-gray-300">Можливо, ви вже пробували «зберігати» — але виходить не більше ніж 50–100 $ на місяць… Або навіть менше.</p>
          </div>

          <div className="text-center">
            <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-white text-[#4E0000] font-bold text-lg py-4 px-10 rounded-full uppercase font-heading tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-100 transition-colors">
              Дивитись урок
            </button>
          </div>
        </div>
      </section>

      {/* 3. RESULTS SECTION выка*/}
      <section className="relative py-12 md:py-16 px-5 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/sofia-invest/zebra.webp')" }}></div>
        <div className="absolute inset-0 bg-black/75 z-10"></div>

        <div className="max-w-4xl mx-auto relative z-20">
          <h2 className="font-heading heading-style text-3xl md:text-4xl text-center text-white font-bold mb-6 drop-shadow-lg">Результат після уроку</h2>
          <p className="text-center text-lg md:text-xl mb-12 text-gray-200 max-w-2xl mx-auto font-medium">Після цього уроку ти отримаєш не абстрактні мрії — ти отримаєш план із практичними цифрами й діями:</p>

          <div className="space-y-6 mb-14">
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl flex gap-5 p-6 rounded-2xl">
              <div className="h-fit shrink-0 mt-1 p-3 bg-white/5 border border-white/10 rounded-full"><Target className="w-6 h-6 text-white" /></div>
              <div>
                <p className="font-bold text-xl text-white mb-2 tracking-wide">Твій персональний план:</p>
                <p className="text-gray-300 text-lg">як заробляти, відкладати і примножувати гроші без шаленого стресу і «випадкового багатства».</p>
              </div>
            </div>
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl flex gap-5 p-6 rounded-2xl">
              <div className="h-fit shrink-0 mt-1 p-3 bg-white/5 border border-white/10 rounded-full"><Calculator className="w-6 h-6 text-white" /></div>
              <div>
                <p className="font-bold text-xl text-white mb-2 tracking-wide">Чітку формулу:</p>
                <p className="text-gray-200 font-mono bg-black/50 px-4 py-2 rounded-lg inline-block mt-1 text-sm md:text-base border border-white/10">100 000 = річні цілі + місячні майлстоуни + система накопичення</p>
              </div>
            </div>
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl flex gap-5 p-6 rounded-2xl">
              <div className="h-fit shrink-0 mt-1 p-3 bg-white/5 border border-white/10 rounded-full"><TrendingUp className="w-6 h-6 text-white" /></div>
              <div>
                <p className="font-bold text-xl text-white mb-2 tracking-wide">Реальні способи:</p>
                <p className="text-gray-300 text-lg">як збільшити дохід, навіть якщо зараз він «всього» на оплату рахунків.</p>
              </div>
            </div>
            <div className="bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl flex gap-5 p-6 rounded-2xl">
              <div className="h-fit shrink-0 mt-1 p-3 bg-white/5 border border-white/10 rounded-full"><PieChart className="w-6 h-6 text-white" /></div>
              <div>
                <p className="font-bold text-xl text-white mb-2 tracking-wide">Розбір інвестицій:</p>
                <p className="text-gray-300 text-lg">що саме почати робити сьогодні, щоб твій капітал почав працювати на тебе.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-white text-[#4E0000] font-bold text-lg py-4 px-10 rounded-full hover:bg-gray-100 transition-colors uppercase font-heading tracking-wider">
              Дивитись урок
            </button>
          </div>
        </div>
      </section>

      {/* 4. SPEAKER SECTION */}
      <section className="py-12 md:py-16 px-5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/sofia-invest/Без названия (3).webp')" }}></div>
        <div className="absolute inset-0 bg-[#ffffff]/60 z-10 backdrop-blur-[2px]"></div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-20">
          <div className="w-full md:w-5/12">
            <img src="/sofia-invest/photo_2026-03-03_10-14-10.webp" alt="Софія Фединяк" loading="lazy" className="rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-black/5 w-full object-cover aspect-[3/4]" />
          </div>

          <div className="w-full md:w-7/12 text-black">
            <h2 className="font-heading heading-style text-4xl md:text-5xl font-extrabold mb-2">Софія Фединяк</h2>
            <h3 className="text-xl md:text-2xl font-bold text-[#4E0000] mb-8 uppercase tracking-wide">Я — ліцензований фінансовий радник</h3>

            <p className="text-xl mb-5 font-bold">і щодня працюю з реальними людьми, які:</p>
            <ul className="space-y-4 mb-10 pl-5 border-l-2 border-black/20 text-lg font-medium">
              <li className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-black shrink-0"></div>не мріяли про 100 000$, а досягли;</li>
              <li className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-black shrink-0"></div>вийшли з боргів;</li>
              <li className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-black shrink-0"></div>збудували подушку безпеки;</li>
              <li className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-black shrink-0"></div>навчилися не просто інвестувати, а робити це системно.</li>
            </ul>

            <p className="text-xl font-bold mb-5">Я не розповідаю:</p>
            <ul className="space-y-3 mb-10 text-lg font-medium">
              <li className="flex items-center gap-3"><X className="text-[#4E0000] w-6 h-6 shrink-0" /> казок про «легкі гроші»,</li>
              <li className="flex items-center gap-3"><X className="text-[#4E0000] w-6 h-6 shrink-0" /> лайфхаків для лінивих,</li>
              <li className="flex items-center gap-3"><X className="text-[#4E0000] w-6 h-6 shrink-0" /> схем «зроби 10 000$ за 10 днів».</li>
            </ul>

            <div className="bg-white/65 backdrop-blur-md border border-white/60 shadow-xl p-6 rounded-2xl">
              <p className="text-xl font-bold italic text-black">"Я розповідаю те, що працює насправді, — і перевірено на десятках людей."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REVIEWS SECTION */}
      <section className="py-12 md:py-16 px-0 overflow-hidden relative">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/sofia-invest/chocolate.webp')" }}></div>
        <div className="absolute inset-0 bg-[#2d1205]/40 z-10"></div>

        <div className="max-w-5xl mx-auto px-5 relative z-20">
          <h2 className="font-heading heading-style text-4xl text-center text-white font-bold mb-4 drop-shadow-lg">Відгуки</h2>
          <p className="text-center text-white/80 font-bold tracking-widest uppercase text-[11px] sm:text-sm mb-12 animate-bounce whitespace-nowrap">
            <ChevronRight className="inline w-4 h-4 mr-1" /> Гортайте в бік, щоб переглянути <ChevronLeft className="inline w-4 h-4 ml-1" />
          </p>
        </div>

        <div className="pl-5 relative z-20 pb-10">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 }
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            className="mySwiper"
          >
            {[
              "photo_2026-03-03_09-23-19.webp", "photo_2026-03-03_09-23-32.webp", "photo_2026-03-03_09-23-36.webp",
              "photo_2026-03-03_09-23-40.webp", "photo_2026-03-03_09-23-44.webp", "photo_2026-03-03_09-23-47.webp",
              "photo_2026-03-04_21-36-26.webp", "photo_2026-03-04_21-36-26 (2).webp", "photo_2026-03-04_21-36-27.webp",
              "photo_2026-03-04_21-36-27 (2).webp", "photo_2026-03-04_21-36-28 (2).webp"
            ].map((img, i) => (
              <SwiperSlide key={i} className="flex justify-center h-auto">
                <img src={`/sofia-invest/${img}`} loading="lazy" alt={`Відгук ${i + 1}`} className="shadow-[0_15px_30px_rgba(0,0,0,0.5)] rounded-xl border border-white/10 max-h-[500px] object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="py-14 md:py-24 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/sofia-invest/dollars.webp')" }}></div>
        <div className="absolute inset-0 bg-black/80 z-10"></div>

        <div className="max-w-4xl mx-auto relative z-20">
          <h2 className="font-heading heading-style text-3xl md:text-4xl text-white font-bold mb-12 leading-tight drop-shadow-2xl">
            Цей урок - про інструменти, які працюють вже зараз та виведуть ваш <span className="text-white">капітал</span> на новий рівень
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-white text-[#4E0000] font-bold text-2xl py-5 px-14 rounded-full uppercase font-heading tracking-wider shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
            Дивитись урок
          </button>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 z-10 text-[#4E0000]/60 hover:text-[#4E0000] hover:bg-[#4E0000]/5 transition-all rounded-full p-2"
              aria-label="Закрити"
            >
              <X className="w-6 h-6" />
            </button>
            <LeadForm
              title="Отримайте доступ до уроку"
              targetSheet="VSL Трафик"
              pixelEventName="Lead"
              pixelEventContent="Sofia Invest Main"
              redirectUrl="https://t.me/SofiaFeduniak_bot?start=69b01a17b0523e81800ee835"
              webhookUrl="https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec"
            />
          </div>
        </div>
      )}
    </main>
  );
}
