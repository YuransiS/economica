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
    <section className="py-20 bg-white text-[#4E0000]">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase leading-tight max-w-4xl mx-auto">
            Закладіть фундамент для формування свого 100.000$ капіталу вже в 2026 році, починаючи всього з 30$
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <h3 className="font-montserrat text-2xl font-bold uppercase mb-4 text-[#81D8D0]">{item.title}</h3>
              <p className="font-arimo text-lg text-gray-700">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={onOpenLead}
            className="font-montserrat relative overflow-hidden rounded-full bg-[#4E0000] px-12 py-5 text-xl font-bold uppercase tracking-wide text-white shadow-[0_0_40px_rgba(78,0,0,0.4)] transition-all hover:scale-105 hover:bg-[#3a0000]"
          >
            Зареєструватись
          </motion.button>
        </div>
      </div>
    </section>
  );
}
