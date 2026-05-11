'use client';

import { motion } from 'framer-motion';
import AnimatedCheck from './icons/AnimatedCheck';

export default function WhatAwaitsSection({ onOpenLeadAction }: { onOpenLeadAction: () => void }) {
  const items = [
    "Щоденні прямі ефіри",
    "Перевірка Д\\З зі зворотнім зв'язком",
    "Бонусні матеріали, які точно допоможуть не відкладати інвестування",
    "Чат однодумців, де всі рухаються в єдиному темпі",
    "Можливість потрапити на індивідуальний ZOOM з Софією"
  ];

  return (
    <section className="bg-[#4E0000] py-24 text-white relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-3xl md:text-5xl font-black text-white uppercase mb-16"
        >
          Що на вас чекає <br/><span className="text-[#FBCBDA]">на триденному практикумі</span>
        </motion.h2>

        <div className="space-y-4 mb-16 text-left inline-block w-full max-w-2xl">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex-shrink-0 bg-[#FBCBDA]/20 p-2 rounded-full text-[#FBCBDA]">
                <AnimatedCheck className="w-5 h-5" />
              </div>
              <p className="font-arimo text-lg text-gray-200">{item}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <button
            onClick={onOpenLeadAction}
            className="font-montserrat inline-block rounded-full bg-[#81D8D0] px-12 py-5 text-lg font-bold uppercase tracking-wide text-[#4E0000] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)]"
          >
            Дізнатися умови
          </button>
        </div>
      </div>
    </section>
  );
}
