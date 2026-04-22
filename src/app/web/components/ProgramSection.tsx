'use client';

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function ProgramSection({ onOpenLead }: { onOpenLead: () => void }) {
  const modules = [
    {
      title: "Гроші — це система, а не подія",
      items: [
        "Розберемо, чому «розбагатіти раз і назавжди» не працює.",
        "Зрозумієш, чому багатство будується не через випадковий успіх, а через правильний фінансовий фундамент.",
        "Побачиш, чому виграють не найрозумніші, а найпослідовніші."
      ]
    },
    {
      title: "Чому дохід не робить тебе багатою",
      items: [
        "Розберемо різницю між активами та просто заробітком.",
        "Побачиш, чому обмін часу на гроші завжди має обмеження.",
        "Зрозумієш, як зробити так, щоб гроші почали працювати на тебе."
      ]
    },
    {
      title: "Як реально збільшити свій фінансовий потік",
      items: [
        "Дізнаєшся, чому економія не робить людей багатими.",
        "Розберемо, чому головний фокус має бути на збільшенні доходу.",
        "Поговоримо про сфери, де сьогодні найпростіше масштабувати свої заробітки."
      ]
    },
    {
      title: "Складний відсоток: головна магія багатства",
      items: [
        "Побачиш, як працює складний відсоток на простих прикладах.",
        "Зрозумієш, чому головний ресурс в інвестуванні — це час.",
        "Розберемо, як навіть невеликі суми можуть перетворитися на великі гроші."
      ]
    },
    {
      title: "Чому психологія важливіша за IQ",
      items: [
        "Розберемо головні помилки, через які люди втрачають гроші.",
        "Побачиш, чому більшість постійно чекає «ідеального моменту».",
        "Зрозумієш, як мислять люди, які реально створюють капітал."
      ]
    },
    {
      title: "Куди інвестувати у 2026 році",
      items: [
        "Розглянемо основні інструменти: ETF, акції, нерухомість та бізнес.",
        "Розберемо рівень ризику кожного варіанту.",
        "Поговоримо про те, яких фінансових помилок та схем потрібно уникати."
      ]
    },
    {
      title: "Як створити систему, яку важко зламати",
      items: [
        "Розберемо, чому важливо мати кілька джерел доходу.",
        "Поговоримо про фінансову подушку, регулярні інвестиції та диверсифікацію.",
        "Зрозумієш, як побудувати стабільну систему, яка буде працювати на тебе роками."
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50 text-[#1A0000]">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat text-4xl md:text-5xl font-black uppercase text-[#4E0000]">
            Програма майстер-класу
          </h2>
        </motion.div>

        <div className="space-y-8 mb-16">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:gap-10"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#81D8D0]/20 text-[#4E0000] font-black text-2xl">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-montserrat text-2xl font-bold uppercase mb-4 text-[#4E0000]">{module.title}</h3>
                <ul className="space-y-3">
                  {module.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#81D8D0] shrink-0 mt-2"></div>
                      <p className="font-arimo text-lg text-gray-700">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={onOpenLead}
            className="font-montserrat relative overflow-hidden rounded-full bg-[#4E0000] px-12 py-5 text-xl font-bold uppercase tracking-wide text-white shadow-[0_0_40px_rgba(78,0,0,0.3)] transition-all hover:scale-105 hover:bg-[#3a0000]"
          >
            Зареєструватись
          </motion.button>
        </div>
      </div>
    </section>
  );
}
