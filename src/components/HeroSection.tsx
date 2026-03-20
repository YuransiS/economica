'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection({ onOpenLead }: { onOpenLead: () => void }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#4E0000] text-white pt-32 pb-40">
      {/* Background Image Setup */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero.JPG"
          alt="Sofia — Financial Practicum"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-40 mix-blend-luminosity"
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
            <p className="font-narrow text-sm md:text-base tracking-widest uppercase mb-4 text-[#81D8D0]">
              3-денний онлайн-практикум • 09.04 - 11.04
            </p>

            <h1 className="font-montserrat text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-tight mb-8">
              Як почати інвестувати і накопичити <br /> 
              <span className="text-[#81D8D0]">перші <br /> 100 000$</span><br /> капіталу у 2026 році
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-4 mb-12 w-full max-w-xl"
          >
            {[
              "навіть під час кризи",
              "з вкладеннями 30$/місяць",
              "без досвіду в фінансах"
            ].map((item, index) => (
              <div 
                 key={index} 
                 className="flex items-center space-x-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform transition-all hover:translate-x-2 hover:bg-white/15"
              >
                <div className="w-2 h-2 rounded-full bg-[#81D8D0]"></div>
                <h3 className="font-arimo text-lg md:text-xl font-bold uppercase">{item}</h3>
              </div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={onOpenLead}
            className="font-montserrat relative overflow-hidden rounded-r-[40px] rounded-l-[4px] bg-[#81D8D0] px-12 py-5 text-xl font-bold uppercase tracking-wide text-[#4E0000] shadow-[0_0_40px_rgba(129,216,208,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(129,216,208,0.6)]"
          >
            <span className="relative z-10">Дізнатись умови зараз</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
