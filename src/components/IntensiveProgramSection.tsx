'use client';

import { motion } from 'framer-motion';
import AnimatedCheck from './icons/AnimatedCheck';

export default function IntensiveProgramSection() {
  const days = [
    {
      day: "День 1",
      date: "",
      theme: "Розберемо готову стратегію, яка захищає гроші від інфляції (а не просто лежать на картці)",
      points: [
        "Зрозумієте, які існують класи активів, в які можна інвестувати.",
        "Пройдемось по базі - що таке інвестиції.",
        "Отримаєте практичне домашнє завдання, щоб закріпити отримаі знання на практиці."
      ],
      color: "bg-[#81D8D0]"
    },
    {
      day: "День 2",
      date: "",
      theme: "Покроковий план, як стартувати у 2026 без хайпу і \"гарячих\" порад з телеграму.",
      points: [
        "Дізнаєтесь, що потрібно для того щоб почати інвестувати, окрім грошей.",
        "Де реєструватись та через які сервіси поповнювати рахунок.",
        "Зрозумієте, як аналізувати активи перед покупкою в свій портфель.",
        "Розберетесь за яким принципом створювати інвестиційний портфель, щоб він приносив дохід, а не проблеми",
        "Домашнє завдання, яке покладе старт у формуванні вашого портфелю"
      ],
      color: "bg-[#FBCBDA]"
    },
    {
      day: "День 3",
      date: "",
      theme: "Розбір мого реального портфелю, який приносить 18% річних, +$20.000 пасиву за 6 років.",
      points: [
        "Детально розберу свою стратегію інвестування, то покажу свій портфель, який працює на мене останні 6 років",
        "Розберемо 2 портфелі відомих інвесторів",
        "Як реагувати на новини в світі аби не втрачати гроші та не панікувати",
        "Практичне домашнє завдання, яке навчить критичному мисленню в інвестуванні"
      ],
      color: "bg-[#B7D1EA]"
    }
  ];

  return (
    <section id="program" className="bg-[#2D0000] py-24 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#81D8D0] opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-4xl md:text-5xl font-black text-center text-[#FBCBDA] uppercase mb-16 tracking-tight"
        >
          Програма інтенсиву:
        </motion.h2>

        <div className="space-y-12">
          {days.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Colored Theme Tag */}
              <div className={`relative z-10 w-full max-w-3xl -mb-6 ml-4 md:ml-8 rounded-2xl ${item.color} p-6 shadow-lg shadow-[#81D8D0]/10`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-[#4E0000]">
                    <span className="font-narrow text-sm font-bold uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full">
                      {item.day}
                    </span>
                  </div>
                  <h3 className="font-montserrat text-lg md:text-xl font-bold text-[#4E0000] flex-1 md:text-right">
                    Тема: {item.theme}
                  </h3>
                </div>
              </div>

              {/* Transparent Box with Border */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 pt-14 md:p-12 md:pt-16 backdrop-blur-md">
                <ul className="space-y-4">
                  {item.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <AnimatedCheck className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0 text-[#81D8D0]" />
                      <span className="font-arimo text-lg text-gray-200">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
