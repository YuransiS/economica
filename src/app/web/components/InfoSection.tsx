'use client';

import { motion } from 'framer-motion';

export default function InfoSection({ onOpenLead }: { onOpenLead: () => void }) {
  const items = [
    {
      title: "Чітка інвестиційна стратегія",
      description: "Отримаєте покроковий план дій з чого почати ваш шлях в створенні капіталу"
    },
    {
      title: "Всього 30$ для старту",
      description: "Щоб придбати свою першу акцію достатньо всього 30$"
    },
    {
      title: "Без досвіду",
      description: "Для того щоб почати інвестувати не потрібні додаткові знання та купу годин за підручниками"
    },
    {
      title: "З будь-якої точки світу",
      description: "Для того щоб інвестувати вам не потрібно знаходитись тільки в Україні або тільки в США 😁"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-[#4E0000] text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#81D8D0] rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#81D8D0] rounded-full blur-[120px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-montserrat text-2xl sm:text-3xl md:text-5xl font-black uppercase leading-tight max-w-4xl mx-auto text-balance">
            Закладіть фундамент для формування свого <span className="text-[#81D8D0]">100.000$</span> капіталу вже в 2026 році, починаючи всього з 30$
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-12 md:mb-16">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-all hover:translate-y-[-4px]"
            >
              <h3 className="font-montserrat text-lg md:text-2xl font-bold uppercase mb-2 md:mb-4 text-[#81D8D0]">{item.title}</h3>
              <p className="font-arimo text-base md:text-lg text-gray-200 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={onOpenLead}
            className="font-montserrat w-full sm:w-auto relative overflow-hidden rounded-full bg-[#81D8D0] px-10 py-4 md:px-12 md:py-5 text-lg md:text-xl font-bold uppercase tracking-wide text-[#4E0000] shadow-[0_15px_30px_rgba(129,216,208,0.2)] transition-all hover:scale-105 hover:bg-white active:scale-[0.98]"
          >
            Зареєструватись
          </motion.button>
        </div>
      </div>
    </section>
  );
}
