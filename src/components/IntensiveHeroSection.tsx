'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function IntensiveHeroSection({ onOpenLeadAction }: { onOpenLeadAction: () => void }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#4E0000] text-white pt-32 pb-40">
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero.JPG"
          alt="Sofia — Financial Intensive"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-25 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4E0000] via-[#4E0000]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#4E0000] via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10 flex flex-col md:flex-row items-center">
        
        <div className="w-full md:w-3/5">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <p className="font-narrow text-xl md:text-3xl tracking-widest uppercase mb-6 text-[#81D8D0] font-bold">
              3 денний інтенсив
            </p>

            <h1 className="font-montserrat text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-tight mb-8">
              За 3 дні покажу, як зібрати портфель, що приносить <br /> 
              <span className="text-[#81D8D0]">пасивний дохід</span><br /> навіть якщо ти ніколи не інвестував
            </h1>
          </motion.div>

          <div className="mb-6 text-xl font-bold uppercase text-[#FBCBDA] font-montserrat tracking-wide">
            На цьому інтенсиві ти отримаєш:
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-4 mb-12 w-full max-w-2xl"
          >
            {[
              "Готову стратегію, яка захищає гроші від інфляції (а не просто лежать на картці)",
              "Покроковий план, як стартувати у 2026 без хайпу і \"гарячих\" порад з телеграму",
              "Розбір мого реального портфелю 18% річних, +$20.000 пасиву за 6 років."
            ].map((item, index) => (
              <div 
                 key={index} 
                 className="flex items-start space-x-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform transition-all hover:translate-x-2 hover:bg-white/15"
              >
                <div className="w-2 h-2 rounded-full bg-[#81D8D0] mt-2 flex-shrink-0"></div>
                <h3 className="font-arimo text-base md:text-lg font-bold uppercase leading-relaxed">{item}</h3>
              </div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={onOpenLeadAction}
            className="font-montserrat relative overflow-hidden rounded-r-[40px] rounded-l-[4px] bg-[#81D8D0] px-12 py-5 text-xl font-bold uppercase tracking-wide text-[#4E0000] shadow-[0_0_40px_rgba(129,216,208,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(129,216,208,0.6)]"
          >
            <span className="relative z-10">Зареєструватися безкоштовно</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
