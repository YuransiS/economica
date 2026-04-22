'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';

export default function AboutAuthorSection() {
  return (
    <section className="py-16 md:py-24 bg-[#4E0000] text-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase mb-4 text-balance">
            Хто проводить цей майстер-клас?
          </h2>
        </motion.div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-12 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-10 md:gap-12 items-start">
            <div className="flex-1 w-full">
              <h3 className="font-montserrat text-2xl md:text-3xl font-bold text-[#81D8D0] mb-2 uppercase">Софія Фединяк</h3>
              <p className="font-arimo text-lg md:text-xl text-gray-300 mb-8 italic leading-relaxed">Я — ліцензований фінансовий радник і щодня працюю з реальними людьми, які:</p>
              
              <ul className="space-y-4 mb-8 lg:mb-10">
                {[
                  "не мріяли про 100 000$, а досягли;",
                  "вийшли з боргів;",
                  "збудували подушку безпеки;",
                  "навчилися не просто інвестувати, а робити це системно."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#81D8D0] shrink-0 mt-1" />
                    <span className="font-arimo text-base md:text-lg text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 w-full bg-[#1A0000]/50 rounded-2xl p-6 md:p-8 border border-[#81D8D0]/20">
              <h4 className="font-montserrat text-xl md:text-2xl font-bold mb-6 text-white uppercase tracking-wide">Я не розповідаю:</h4>
              <ul className="space-y-4 mb-8">
                {[
                  "казок про «легкі гроші»,",
                  "лайфхаків для лінивих,",
                  "схем «зроби 10 000$ за 10 днів»."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-1" />
                    <span className="font-arimo text-base md:text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-[#81D8D0]/10 p-5 rounded-xl border-l-4 border-[#81D8D0] backdrop-blur-sm">
                <p className="font-arimo text-base md:text-lg font-bold text-[#81D8D0] leading-snug">
                  "Я розповідаю те, що працює насправді, — і перевірено на десятках людей."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
