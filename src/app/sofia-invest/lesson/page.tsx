'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUTMs } from "@/hooks/useUTMs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { validatePhoneNumber } from "@/utils/phone";
import { Loader2, ArrowRight, Play, ArrowDown, CalendarCheck, CheckCircle2, Info, Star, X, Check } from 'lucide-react';

export default function SofiaInvestLessonPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [income, setIncome] = useState("");
  const [debt, setDebt] = useState("");
  const [timeline, setTimeline] = useState("");
  const [goal, setGoal] = useState("");
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("ua");
  const utms = useUTMs();

  // Parallax effect for floating dollar
  useEffect(() => {
    const handleScroll = () => {
      const dollar = document.getElementById('floating-dollar');
      if (dollar) {
        dollar.style.transform = `translateY(-${window.scrollY * 1.2}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/country")
      .then((res) => res.json())
      .then((data) => {
        if (data.country) {
          setCountry(data.country.toLowerCase());
        }
      })
      .catch(() => setCountry("ua"));
  }, []);

  const validatePhone = (phone: string) => validatePhoneNumber(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePhone(phone)) {
      setError("Будь ласка, введіть коректний номер телефону");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      phone: "+" + phone,
      targetSheet: "VLS Урок",
      isFree: true,
      income,
      debt,
      timeline,
      goal,
      utm_source: utms.source,
      utm_medium: utms.medium,
      utm_campaign: utms.campaign,
      utm_content: utms.content,
      utm_term: utms.term,
      date: new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kiev" }),
    };

    try {
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", { content_name: "Sofia Invest Lesson" });
      }

      await fetch("https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      // Optional redirect
      // setTimeout(() => { window.location.href = "YOUR_REDIRECT_URL"; }, 2500);

    } catch (error) {
      console.error("Submission failed", error);
      setError("Виникла помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#111] text-white min-h-screen font-[sans-serif] scroll-smooth antialiased relative">
      {/* Background image from original design */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-no-repeat bg-cover opacity-100"
        style={{ 
          backgroundImage: "url('/sofia-invest-lesson/bg-dollar.png')",
          backgroundPosition: 'top right'
        }}
      ></div>

      <img src="/sofia-invest-lesson/floating-dollar.png" id="floating-dollar" alt="Долар" className="fixed top-0 right-0 z-10 w-[220px] min-[380px]:w-[260px] sm:w-[440px] md:w-[700px] lg:w-[850px] drop-shadow-2xl pointer-events-none transition-transform duration-100 ease-out origin-top-right mix-blend-lighten" />

      {/* HERO / VSL SECTION */}
      <section className="relative z-20 pt-16 pb-4 md:pb-10 md:pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-8 md:mb-10 text-white text-left" style={{ textShadow: '1px 2px 6px rgba(0,0,0,0.8), 0px 0px 15px rgba(0,0,0,0.5)' }}>
            <span className="block text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase">
              Як накопичити перші 
              <span className="block mt-1 sm:mt-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">100 000$</span>
            </span>
            <span className="block text-sm sm:text-base md:text-xl lg:text-2xl font-light leading-snug mt-1 md:mt-2 normal-case tracking-wide text-white/90">
              та стабільно отримувати пасивний дохід завдяки інвестиціям
            </span>
          </h1>

          {/* Video Container */}
          <div 
            className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-white/20 cursor-pointer group" 
            id="video-container"
            onClick={() => setIsPlaying(true)}
          >
            {!isPlaying ? (
              <>
                <img src="https://img.youtube.com/vi/d-TCdHfYob4/maxresdefault.jpg" alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-10 h-10 text-[#4E0000] ml-1 fill-current" />
                  </div>
                </div>
              </>
            ) : (
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/d-TCdHfYob4?autoplay=1&rel=0" 
                title="Sofia Invest Lesson"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            )}
          </div>

          <div className="mt-6 md:mt-10 flex flex-col items-center justify-center text-center animate-bounce">
            <p className="text-lg md:text-xl font-medium text-white mb-2 drop-shadow-md">Подивились відео? Тоді саме час забрати бонус</p>
            <ArrowDown className="w-8 h-8 text-white/90 stroke-[1] drop-shadow-md" />
          </div>
        </div>
      </section>

      {/* INFO SECTION (BULLETS + BONUSES) */}
      <section className="relative z-20 pt-2 pb-12 md:pt-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative pt-2">
            <div className="text-center mb-6 w-full flex justify-center">
              <a href="#consultation" className="inline-block bg-black/40 backdrop-blur-md border border-red-400 rounded-full px-8 py-3 text-lg sm:text-xl md:text-2xl font-bold text-white shadow-[0_0_20px_rgba(248,113,113,0.4)] hover:bg-white/10 hover:scale-105 hover:shadow-[0_0_30px_rgba(248,113,113,0.6)] transition-all duration-300 cursor-pointer">
                Головний бонус після уроку
              </a>
            </div>
            
            <div className="border-l-4 border-white/40 pl-4 md:pl-5 mb-10 text-left">
              <p className="text-base md:text-lg font-normal text-white/90 leading-relaxed drop-shadow-md">
                Якщо ви подивились урок — значить ви вже готові діяти. Але різниця між тими, хто "знає", і тими, хто накопичує 100 000 $, — <span className="font-medium text-white">в персональній стратегії</span>.
              </p>
            </div>
            
            <div className="text-left mb-8 w-full">
              <h3 className="text-lg min-[380px]:text-xl md:text-3xl font-bold text-white flex items-start gap-2 md:gap-3 w-full drop-shadow-lg">
                <CalendarCheck className="text-white w-6 h-6 md:w-8 md:h-8 shrink-0 mt-0.5 md:mt-1" />
                <span className="flex-1 leading-tight">Безкоштовна стратегічна консультація</span>
              </h3>
              <p className="text-base md:text-2xl text-white/90 mt-1 md:mt-2 font-medium pl-8 min-[380px]:pl-9 md:pl-11 drop-shadow-md">по інвестуванню</p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl">
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-1.5 text-sm md:text-base font-bold text-white mb-6 uppercase tracking-wider backdrop-blur-md">
                Бонус №1
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/50" />
              </div>
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-4 text-white/95 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
                  <span>Розберемо вашу фінансову точку А без прикрас.</span>
                </li>
                <li className="flex items-start gap-4 text-white/95 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
                  <span>Порахуємо реальний математичний план накопичення.</span>
                </li>
                <li className="flex items-start gap-4 text-white/95 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
                  <span>Визначимо вашу безпечну стратегію інвестування.</span>
                </li>
                <li className="flex items-start gap-4 text-white/95 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
                  <span>Пропишемо чіткі цифри на найближчі 12 місяців.</span>
                </li>
              </ul>
              <div className="pt-6 border-t border-white/20 flex gap-4 items-start">
                <Info className="w-6 h-6 text-white/80 shrink-0 mt-0.5" />
                <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
                  Це не теорія. Це конкретний план під ваші доходи. Заповніть анкету нижче максимально чесно, щоб я міг підготуватись до нашої зустрічі.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/30 rounded-full px-4 py-1.5 text-sm md:text-base font-bold text-white mb-4 uppercase tracking-wider backdrop-blur-md">
                Бонус №2
                <div className="flex gap-0.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/50" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/50" />
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg leading-snug">
                    Спеціальні умови на менторство "Перший мільйон" для учасників
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section id="consultation" className="relative z-20 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

            <div className="text-center mb-10 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">Заповни анкету – отримай бонуси</h2>
              <p className="text-white/80">Відповіді допоможуть скласти вашу стратегію</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Ваше Ім'я *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder-white/40" placeholder="Олександр" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Телефон *</label>
                  <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden focus-within:border-white transition-colors phone-input-dark">
                    <PhoneInput
                      country={country}
                      value={phone}
                      onChange={(val) => setPhone(val)}
                      inputClass="!w-full !h-full !py-3 !px-12 !bg-transparent !border-none !text-white !text-base"
                      buttonClass="!bg-transparent !border-none !rounded-l-xl !pl-3 hover:!bg-white/5"
                      dropdownClass="!bg-[#1a1a1a] !text-white !border-white/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Ваш рівень доходу зараз:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Нижче бажаного', 'Задовільний', 'Вище бажаного'].map(val => (
                    <label key={val} className="cursor-pointer">
                      <input type="radio" name="income" value={val} checked={income === val} onChange={(e) => setIncome(e.target.value)} className="peer hidden" required />
                      <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm text-white/80 hover:bg-white/10 peer-checked:bg-white peer-checked:text-[#4E0000] peer-checked:font-bold peer-checked:border-white transition-all">
                        {val}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Чи є у вас кредити/борги?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Так', 'Ні'].map(val => (
                    <label key={val} className="cursor-pointer">
                      <input type="radio" name="debt" value={val} checked={debt === val} onChange={(e) => setDebt(e.target.value)} className="peer hidden" required />
                      <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm text-white/80 hover:bg-white/10 peer-checked:bg-white peer-checked:text-[#4E0000] peer-checked:font-bold peer-checked:border-white transition-all">
                        {val === 'Так' ? 'Так, є' : 'Ні, немає'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">За який термін хочете досягти 100 000 $?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['1 рік', '5 років', '10 років'].map(val => (
                    <label key={val} className="cursor-pointer">
                      <input type="radio" name="timeline" value={val} checked={timeline === val} onChange={(e) => setTimeline(e.target.value)} className="peer hidden" required />
                      <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm text-white/80 hover:bg-white/10 peer-checked:bg-white peer-checked:text-[#4E0000] peer-checked:font-bold peer-checked:border-white transition-all">
                        За {val}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Ваша головна фінансова ціль *</label>
                <textarea required value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors placeholder-white/40 resize-none" placeholder="Опишіть коротко, для чого вам потрібен цей капітал..."></textarea>
              </div>

              {error && (
                <div className="text-red-400 text-sm font-bold text-center mt-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-white text-[#4E0000] font-bold text-lg uppercase tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:hover:scale-100">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>Записатись на консультацію</span> <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="relative z-20 bg-black/50 text-white/50 py-8 text-center text-sm border-t border-white/10 backdrop-blur-sm">
        <p>© 2026. Всі права захищено.</p>
      </footer>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-[#4E0000]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Заявка прийнята!</h3>
            <p className="text-gray-600 mb-6">Я отримав ваші дані. Найближчим часом зв'яжусь з вами для узгодження часу консультації.</p>
            <button onClick={() => setSuccess(false)} className="w-full bg-[#4E0000] text-white font-bold py-3 rounded-xl hover:bg-[#3a0000] transition-colors">
              Зрозуміло
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .phone-input-dark .react-tel-input .flag-dropdown {
          background-color: transparent !important;
          border: none !important;
        }
        .phone-input-dark .react-tel-input .country-list {
          background-color: #1a1a1a !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
        }
        .phone-input-dark .react-tel-input .country-list .country:hover,
        .phone-input-dark .react-tel-input .country-list .country.highlight {
          background-color: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </main>
  );
}
