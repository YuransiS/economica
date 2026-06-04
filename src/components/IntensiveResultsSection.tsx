'use client';

import { motion } from 'framer-motion';
import AnimatedTarget from './icons/AnimatedTarget';

export default function IntensiveResultsSection({ onOpenLeadAction }: { onOpenLeadAction: () => void }) {
  const results = [
    "РОЗБЕРЕТЕ БАЗУ, БЕЗ ЯКОЇ НЕ МОЖНА ПОЧИНАТИ",
    "ДІЗНАЄТЕСЬ, ЯКІ БУВАЮТЬ КЛАСИ АКТИВІВ, ЩОБ ЗНАТИ КУДИ І ЯК ПОТРІБНО ІНВЕСТУВАТИ",
    "НАВЧИТЕСЬ АНАЛІЗУВАТИ АКТИВИ ПЕРЕД ЇХ ПОКУПКОЮ",
    "СТВОРИТЕ СВІЙ ВЛАСНИЙ ШАБЛОН ІНВЕСТИЦІЙНОГО ПОРТФЕЛЮ",
    "ПОБАЧИТЕ ПОРТФЕЛЬ, ЯКИЙ ПРИНІС 20.000$ ПАСИВНОГО ДОХОДУ",
    "РОЗБЕРЕТЕСЬ ЗА ЯКИМ ПРИНЦИПОМ ФОРМУВАТИ СВІЙ ІНВЕСТИЦІЙ ПОРТФЕЛЬ, ТАК АБИ ВІН ВІДПОВІДАВ ВАШИМ ЦІЛЯМ"
  ];

  return (
    <section className="bg-[#1A0000] py-24 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 h-96 w-96 rounded-full bg-[#81D8D0] opacity-5 blur-[100px]"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-3xl md:text-5xl font-black text-center text-white uppercase mb-16 leading-tight"
        >
          Ваші результати <br/><span className="text-[#81D8D0]">після інтенсиву:</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/10 shadow-lg flex items-start group hover:border-[#81D8D0]/50 hover:bg-white/10 transition-all"
            >
              <div className="mr-4 mt-1 bg-[#81D8D0] p-2 text-[#1A0000] rounded-xl shadow-[0_0_15px_rgba(129,216,208,0.4)] group-hover:scale-110 transition-transform flex-shrink-0">
                 <AnimatedTarget className="w-6 h-6" />
              </div>
              <p className="font-arimo text-lg md:text-xl font-bold text-gray-200 leading-snug">
                {result}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onOpenLeadAction}
            className="font-montserrat inline-block rounded-2xl bg-[#81D8D0] px-16 py-6 text-xl font-bold uppercase tracking-widest text-[#4E0000] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.4)]"
          >
            Зареєструватися безкоштовно
          </button>
        </div>
      </div>
    </section>
  );
}
