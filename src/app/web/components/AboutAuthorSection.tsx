'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';

export default function AboutAuthorSection() {
  return (
    <section className="py-16 md:py-24 bg-[#4E0000] text-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-20"
        >
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase mb-4 text-balance">
            Хто проводить цей майстер-клас?
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Photos Side */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10 rounded-[2rem] overflow-hidden border-2 border-[#81D8D0]/30 shadow-2xl aspect-[4/5] max-w-md mx-auto lg:mx-0"
            >
              <Image 
                src="/images/hero.JPG" 
                alt="Софія Фединяк" 
                fill 
                className="object-cover"
              />
            </motion.div>
            
            {/* Second Photo (Floating) */}
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-4 md:-right-8 z-20 w-32 h-40 md:w-48 md:h-64 rounded-2xl overflow-hidden border-4 border-[#4E0000] shadow-2xl hidden sm:block"
            >
              <Image 
                src="/images/hero.JPG" 
                alt="Софія Фединяк — Фінансовий радник" 
                fill 
                className="object-cover scale-150"
              />
            </motion.div>

            {/* Decorative Background Element */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#81D8D0] rounded-full blur-[100px] opacity-20"></div>
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-montserrat text-3xl md:text-4xl font-bold text-[#81D8D0] mb-4 uppercase">Софія Фединяк</h3>
              <p className="font-arimo text-lg md:text-xl text-gray-200 mb-8 italic leading-relaxed border-l-2 border-[#81D8D0]/50 pl-6">
                Я — ліцензований фінансовий радник і щодня працюю з реальними людьми, які:
              </p>
              
              <ul className="grid grid-cols-1 gap-4 mb-10">
                {[
                  "не мріяли про 100 000$, а досягли;",
                  "вийшли з боргів;",
                  "збудували подушку безпеки;",
                  "навчилися не просто інвестувати, а робити це системно."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <CheckCircle className="w-6 h-6 text-[#81D8D0] shrink-0 mt-0.5" />
                    <span className="font-arimo text-base md:text-lg text-gray-100">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-[#1A0000]/40 rounded-2xl p-6 md:p-8 border border-[#81D8D0]/20">
                <h4 className="font-montserrat text-lg md:text-xl font-bold mb-6 text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-[#81D8D0]"></span> Я не розповідаю:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {[
                    { text: "казок про «легкі гроші»", icon: <XCircle className="w-5 h-5 text-red-400" /> },
                    { text: "лайфхаків для лінивих", icon: <XCircle className="w-5 h-5 text-red-400" /> },
                    { text: "схем «зроби 10 000$ за 10 днів»", icon: <XCircle className="w-5 h-5 text-red-400" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300">
                      {item.icon}
                      <span className="font-arimo text-sm md:text-base">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
