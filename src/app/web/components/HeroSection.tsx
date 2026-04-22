'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection({ onOpenLead }: { onOpenLead: () => void }) {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#4E0000] text-white flex flex-col justify-end md:justify-center pt-20 pb-12 md:pb-52">
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero.JPG"
          alt="Financial Practicum"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] md:object-center opacity-30 md:opacity-40 mix-blend-luminosity scale-105"
        />
        {/* Multilayered Gradients for Premium Feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#4E0000] via-[#4E0000]/60 to-transparent md:via-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#4E0000]/20 via-transparent to-[#4E0000] lg:hidden"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#4E0000] via-[#4E0000]/40 to-transparent hidden lg:block"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10 flex flex-col items-start mb-6 md:mb-0">
        
        <div className="w-full lg:w-3/5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="inline-block px-3 py-1 bg-[#81D8D0]/10 backdrop-blur-sm border border-[#81D8D0]/20 rounded-full mb-6">
              <p className="font-narrow text-[10px] md:text-sm tracking-[0.2em] uppercase text-[#81D8D0] font-bold">
                28.04 в 19:00 за українським часом
              </p>
            </div>

            <h1 className="font-montserrat text-[2.2rem] leading-[1.1] sm:text-5xl md:text-7xl font-black uppercase mb-4 md:mb-6 text-balance">
              Як розбагатіти <br className="hidden sm:block" /> 
              <span className="text-[#81D8D0]">назавжди?</span>
            </h1>
            
            <p className="font-montserrat text-base sm:text-xl md:text-3xl font-medium mb-6 md:mb-8 text-[#81D8D0]/90 leading-tight max-w-2xl text-balance">
              Система інвестицій для накопичення перших 100 000$ капіталу у 2026 році
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-2 md:gap-3 mb-8 md:mb-12 w-full max-w-lg"
          >
            {[
              "навіть під час кризи",
              "без досвіду в фінансах",
              "почати можна з 30$/місяць"
            ].map((item, index) => (
              <div 
                 key={index} 
                 className="flex items-center space-x-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 transform transition-all hover:bg-white/10"
              >
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#81D8D0] shadow-[0_0_10px_#81D8D0]"></div>
                <h3 className="font-arimo text-xs md:text-lg font-bold uppercase tracking-wide">{item}</h3>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full sm:w-auto"
          >
            <button
              onClick={onOpenLead}
              className="font-montserrat w-full sm:w-auto relative overflow-hidden group rounded-full bg-[#81D8D0] px-10 py-4 md:py-5 text-base md:text-xl font-black uppercase tracking-widest text-[#4E0000] shadow-[0_20px_40px_rgba(129,216,208,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_25px_50px_rgba(129,216,208,0.5)] active:scale-[0.98]"
            >
              <span className="relative z-10">Зареєструватись</span>
              <div className="absolute inset-0 bg-white translate-y-full transition-transform group-hover:translate-y-0 opacity-20"></div>
            </button>
            <p className="mt-4 text-center sm:text-left text-[10px] md:text-xs uppercase tracking-widest text-white/40 font-bold">
              Вхід безкоштовний • Реєстрація відкрита
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 animate-bounce hidden md:flex">
        <div className="w-0.5 h-10 bg-gradient-to-b from-[#81D8D0] to-transparent rounded-full"></div>
      </div>
    </section>x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
        <div className="w-1 h-12 bg-gradient-to-b from-[#81D8D0] to-transparent rounded-full"></div>
      </div>
    </section>
  );
}
