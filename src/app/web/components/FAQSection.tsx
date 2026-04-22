'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection({ onOpenLead }: { onOpenLead: () => void }) {
  const faqs = [
    {
      q: "З якої суми треба починати інвестувати?",
      a: "Для старту достатньо всього 30$ на місяць."
    },
    {
      q: "Я не можу виділяти великі суми для інвестицій, значить це не для мене.",
      a: "Навіть на не великих сумах працює складний відсоток. І інвестуючи кожного місяця 30-50$ ви здивуєтесь, як може збільшитись ця сума."
    },
    {
      q: "Зараз всі прогнозують світову кризу це не найкращій час щоб інвестувати.",
      a: "Все в точності навпаки, всі кризи це найнижчий поріг входу. Всі інвестори в світі чекають кризи для збільшення портфелю."
    },
    {
      q: "Я повний 0 в інвестиціях, мені страшно.",
      a: "Боятись чогось нового це нормально, але цей майстер-клас якраз і разрахований на тих хто ще не інвестував і хоче почати."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-white text-[#1A0000]">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase text-[#4E0000] text-balance">
            Часті запитання
          </h2>
        </motion.div>

        <div className="space-y-4 mb-12 md:mb-16">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50 backdrop-blur-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 md:px-6 md:py-5 flex items-center justify-between text-left focus:outline-none transition-colors hover:bg-gray-100/50"
              >
                <span className="font-montserrat font-bold text-base md:text-lg text-[#4E0000] pr-4">{faq.q}</span>
                <div className="shrink-0 text-[#81D8D0]">
                  {openIndex === index ? <Minus className="w-5 h-5 md:w-6 md:h-6" /> : <Plus className="w-5 h-5 md:w-6 md:h-6" />}
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
                    <div className="px-5 pb-5 md:px-6 md:pb-6 font-arimo text-gray-700 text-base md:text-lg leading-relaxed border-t border-gray-100 pt-4">
                      {faq.a}
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
            className="font-montserrat w-full sm:w-auto relative overflow-hidden rounded-full bg-[#4E0000] px-10 py-4 md:px-12 md:py-5 text-lg md:text-xl font-bold uppercase tracking-wide text-white shadow-[0_15px_30px_rgba(78,0,0,0.2)] transition-all hover:scale-105 hover:bg-[#3a0000] active:scale-[0.98]"
          >
            Зареєструватись
          </motion.button>
        </div>
      </div>
    </section>
  );
}
