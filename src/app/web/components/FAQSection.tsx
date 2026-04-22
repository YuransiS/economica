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
    <section className="py-24 bg-white text-[#1A0000]">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat text-4xl md:text-5xl font-black uppercase text-[#4E0000]">
            Часті запитання
          </h2>
        </motion.div>

        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-montserrat font-bold text-lg text-[#4E0000] pr-8">{faq.q}</span>
                <div className="shrink-0 text-[#81D8D0]">
                  {openIndex === index ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
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
                    <div className="px-6 pb-5 font-arimo text-gray-700 text-lg leading-relaxed">
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
            className="font-montserrat relative overflow-hidden rounded-full bg-[#4E0000] px-12 py-5 text-xl font-bold uppercase tracking-wide text-white shadow-[0_0_40px_rgba(78,0,0,0.3)] transition-all hover:scale-105 hover:bg-[#3a0000]"
          >
            Зареєструватись
          </motion.button>
        </div>
      </div>
    </section>
  );
}
