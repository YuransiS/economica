'use client';

import { motion } from 'framer-motion';
import AnimatedCheck from './icons/AnimatedCheck';
import CountdownTimer from './CountdownTimer';

export default function PricingSection({ onOpenLeadAction }: { onOpenLeadAction: (tariff: string, price: number) => void }) {
  const tariff = {
    name: "Практикум",
    oldPrice: 19,
    price: 9,
    features: [
      "Повна інвестиційна стратегія",
      "3 практичні ефіри / уроки",
      "Доступ до платформи та лідерборду",
      "Перевірка домашніх завдань куратором",
      "Шаблони таблиць для розрахунків",
    ],
    color: "bg-[#4E0000] text-white backdrop-blur-md",
    buttonColor: "bg-[#81D8D0] text-[#4E0000]",
    badge: "Спеціальна пропозиція"
  };

  return (
    <section className="bg-[#1A0000] py-24 relative" id="tariffs">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#2D0000] rounded-b-[100px]"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-4xl md:text-5xl font-black text-center text-white uppercase mb-16"
        >
          Тариф
        </motion.h2>

        <div className="max-w-xl mx-auto text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/10 flex flex-col bg-[#4E0000] text-white backdrop-blur-md`}
          >
            {tariff.badge && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#81D8D0] px-6 py-2 font-bold uppercase tracking-widest text-[#4E0000] text-sm shadow-[0_0_20px_rgba(129,216,208,0.4)] whitespace-nowrap">
                {tariff.badge}
              </div>
            )}

            <h3 className="font-montserrat text-4xl font-black mb-8 text-center text-[#FBCBDA]">{tariff.name}</h3>

            <div className="flex-1 space-y-6 mb-12">
              <ul className="space-y-4">
                {tariff.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <AnimatedCheck className="w-6 h-6 mr-3 flex-shrink-0 text-[#81D8D0]" />
                    <span className="font-arimo text-lg font-medium text-gray-200">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center mb-8">
              <span className="font-arimo text-2xl line-through mr-4 text-[#FBCBDA]/50">
                ${tariff.oldPrice}
              </span>
              <span className="font-montserrat text-6xl font-black text-[#81D8D0]">
                ${tariff.price}
              </span>
            </div>

            <CountdownTimer />

            <button
              onClick={() => onOpenLeadAction(tariff.name, tariff.price)}
              className={`w-full rounded-2xl py-5 text-xl font-bold uppercase tracking-widest transition-transform hover:scale-105 shadow-xl ${tariff.buttonColor}`}
            >
              Придбати участь
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
