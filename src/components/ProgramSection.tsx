'use client';

import { motion } from 'framer-motion';
import AnimatedCheck from './icons/AnimatedCheck';

export default function ProgramSection() {
  const days = [
    {
      day: "ДЕНЬ 1",
      date: "26.03",
      theme: "Складна економіка простою мовою",
      points: [
        "Зрозумієте, які правила гри на економічному ринку та як знаючи ці правила примножувати дохід навіть під час кризи",
        "Розберемо що відбувається з цінами у світі, чому така висока волатильність?",
        "Що відбувається з активами і пасивами під час кризи",
        "Планова криза це погано чи добре? Хто на ній заробить?",
        "Розбираємось чому гроші під подушкою в 2026 році - це не шанс зберегти, а прямий шлях до втрати всього, що накопичив"
      ],
      ps: "P.S.: І навіть якщо ви гуманітарій вас це теж стосується 🤭",
      color: "bg-[#81D8D0]"
    },
    {
      day: "ДЕНЬ 2",
      date: "27.03",
      theme: "Яку фінансову стратегію обрати під час кризи",
      points: [
        "Які активи варто зберігати під час кризи? А які потрібно було ще вчора продати",
        "Як зараз зберігати ваші активи в нинішніх умовах",
        "Антикризова стратегія збереження доходів (диверсифікація доходів)",
        "Чому турбулентність на ринку - це найкращий час для входу саме вам"
      ],
      color: "bg-[#FBCBDA]"
    },
    {
      day: "ДЕНЬ 3",
      date: "28.03",
      theme: "Як почати формувати пасивний дохід вже сьогодні",
      points: [
        "Відкриваємо ваш перший брокерський рахунок",
        "Купуємо перші активи",
        "Розбираємо, як виводити та заводити кошти на брокерські рахунки",
        "Ділюсь особистою стратегією в кризовий час"
      ],
      color: "bg-[#B7D1EA]"
    }
  ];

  return (
    <section className="bg-[#2D0000] py-24 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#81D8D0] opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-4xl md:text-5xl font-black text-center text-[#FBCBDA] uppercase mb-16 tracking-tight"
        >
          Програма практикуму:
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
                    <span className="font-narrow text-sm font-bold opacity-80">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-montserrat text-xl md:text-2xl font-bold text-[#4E0000]">
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
                {item.ps && (
                  <p className="mt-8 font-script text-xl text-[#FBCBDA] border-t border-white/10 pt-6">
                    {item.ps}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
