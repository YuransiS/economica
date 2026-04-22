import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Minus, ChevronDown } from 'lucide-react';

export default function ProgramSection({ onOpenLead }: { onOpenLead: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

  const toggleModule = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50 text-[#1A0000]">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase text-[#4E0000]">
            Програма майстер-класу
          </h2>
        </motion.div>

        <div className="space-y-4 mb-16">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                openIndex === index ? 'border-[#81D8D0] shadow-md' : 'border-gray-100'
              }`}
            >
              <button
                onClick={() => toggleModule(index)}
                className="w-full px-6 py-6 flex items-center gap-6 text-left focus:outline-none"
              >
                <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-lg md:text-xl transition-colors ${
                  openIndex === index ? 'bg-[#81D8D0] text-[#4E0000]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <h3 className="flex-1 font-montserrat text-lg md:text-xl font-bold uppercase text-[#4E0000]">{module.title}</h3>
                <div className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#81D8D0]' : 'text-gray-300'}`}>
                  <ChevronDown className="w-6 h-6" />
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-8 md:pl-24 md:pr-12">
                      <ul className="space-y-4 pt-2 border-t border-gray-50">
                        {module.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#81D8D0] shrink-0 mt-2"></div>
                            <p className="font-arimo text-base md:text-lg text-gray-700 leading-relaxed">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={onOpenLead}
            className="font-montserrat w-full sm:w-auto relative overflow-hidden rounded-full bg-[#4E0000] px-12 py-5 text-xl font-bold uppercase tracking-wide text-white shadow-[0_15px_30px_rgba(78,0,0,0.2)] transition-all hover:scale-105 hover:bg-[#3a0000] active:scale-[0.98]"
          >
            Зареєструватись
          </motion.button>
        </div>
      </div>
    </section>
  );
}
