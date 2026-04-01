'use client';

import { motion } from 'framer-motion';
import AnimatedCheck from './icons/AnimatedCheck';
import CountdownTimer from './CountdownTimer';

export default function PricingSection({ onOpenLead }: { onOpenLead: (tariff: string, price: number) => void }) {
  const tariffs = [
    {
      name: "PRO",
      oldPrice: 29,
      price: 19,
      features: [
        "Доступ до чату",
        "3 прямі ефіри",
        "Зворотній зв'язок",
        "Перевірка домашнього завдання",
      ],
      missing: [
        "Без індивідуального zoom з Софією або її командою"
      ],
      color: "bg-white/5 text-white backdrop-blur-md",
      buttonColor: "bg-[#81D8D0] text-[#4E0000]",
      badge: null
    },
    {
      name: "VIP",
      oldPrice: 69,
      price: 39,
      features: [
        "Доступ до чату",
        "3 прямі ефіри",
        "Зворотній зв'язок",
        "Перевірка домашнього завдання",
        "Індивідуальний zoom з Софією або її командою"
      ],
      missing: [],
      color: "bg-[#4E0000] text-white backdrop-blur-md",
      buttonColor: "bg-[#81D8D0] text-[#4E0000]",
      badge: "Найкращий вибір"
    }
  ];

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
          Тарифи
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
          {tariffs.map((tariff, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`relative rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/10 flex flex-col ${tariff.name === 'VIP' ? 'bg-[#4E0000] text-white backdrop-blur-md' : 'bg-white/5 text-white backdrop-blur-md'}`}
            >
              {tariff.badge && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#81D8D0] px-6 py-2 font-bold uppercase tracking-widest text-[#4E0000] text-sm shadow-[0_0_20px_rgba(129,216,208,0.4)]">
                  {tariff.badge}
                </div>
              )}

              <h3 className={`font-montserrat text-4xl font-black mb-8 text-center ${tariff.name === 'PRO' ? 'text-[#FBCBDA]' : ''}`}>{tariff.name}</h3>

              <div className="flex-1 space-y-6 mb-12">
                <ul className="space-y-4">
                  {tariff.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <AnimatedCheck className={`w-6 h-6 mr-3 flex-shrink-0 ${tariff.name === 'VIP' ? 'text-[#81D8D0]' : 'text-[#FBCBDA]'}`} />
                      <span className={`font-arimo text-lg font-medium ${feature.includes("Індивідуальний зідзвон") ? (tariff.name === 'VIP' ? 'text-[#81D8D0]' : '') : 'text-gray-200'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {tariff.missing.length > 0 && (
                  <ul className="space-y-4 opacity-50">
                    {tariff.missing.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center font-bold">✕</span>
                        <span className="font-arimo text-lg line-through text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="text-center mb-8">
                <span className={`font-arimo text-2xl line-through mr-4 ${tariff.name === 'VIP' ? 'text-[#FBCBDA]/50' : 'text-gray-400/50'}`}>
                  ${tariff.oldPrice}
                </span>
                <span className={`font-montserrat text-6xl font-black ${tariff.name === 'PRO' ? 'text-[#81D8D0]' : ''}`}>
                  ${tariff.price}
                </span>
              </div>

              {tariff.name === 'VIP' && (
                <CountdownTimer />
              )}

              <button
                onClick={() => onOpenLead(tariff.name, tariff.price)}
                className={`w-full rounded-2xl py-5 text-xl font-bold uppercase tracking-widest transition-transform hover:scale-105 shadow-xl ${tariff.buttonColor}`}
              >
                Оплатити
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
