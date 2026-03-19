'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection({ onOpenLead }: { onOpenLead: () => void }) {
  const faqs = [
    {
      question: "Чи підійде мені якщо я зараз не маю відкладених коштів?",
      answer: "Так, для початку достатньо почати з 30$ в місяць."
    },
    {
      question: "Чи потрібен мені практикум, якщо я вже маю інвестиційний портфель?",
      answer: "Тільки у випадку якщо ви купуєте акції хаотично і не маєте ніякого пасивного доходу."
    },
    {
      question: "Боюсь, що всеодно буде складно технічно розібратись з реєстраціями.",
      answer: "На практикумі у вас буде підтримка, для того що кожен зміг пройти весь процес реєстрацій та купівля пройшла максимально легко."
    },
    {
      question: "Я поки не планую інвестувати",
      answer: "Пройшовши практикум ви точно зможете оцінити всі ризики, які є зараз в світі та прийняти для себе рішення чи починати вам все ж інвестувати зараз чи ні."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#2D0000] py-24 pb-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-4xl md:text-5xl font-black text-center text-white uppercase mb-16"
        >
          Часті запитання:
        </motion.h2>

        <div className="space-y-4 mb-20">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl bg-white/5 border border-white/10 shadow-lg overflow-hidden backdrop-blur-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left transition-colors hover:bg-white/10 text-white"
              >
                <span className="font-arimo text-xl font-bold pr-8">{faq.question}</span>
                <span className="flex-shrink-0 text-[#4E0000] bg-[#FBCBDA] p-2 rounded-full shadow-[0_0_15px_rgba(251,203,218,0.5)]">
                  {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 md:p-8 pt-0 font-arimo text-lg text-gray-300 leading-relaxed border-t border-white/10 mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onOpenLead}
            className="font-montserrat inline-block rounded-2xl bg-[#81D8D0] px-16 py-6 text-xl font-bold uppercase tracking-widest text-[#4E0000] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.4)]"
          >
            Оплатити
          </button>
        </div>
      </div>
    </section>
  );
}
