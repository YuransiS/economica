'use client';

import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

export default function BonusSection() {
  return (
    <section className="relative w-full bg-[#1A0000] py-24 text-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center space-x-2 rounded-full bg-[#FBCBDA] px-6 py-2 mb-8 text-[#4E0000] font-bold uppercase font-narrow tracking-widest shadow-[0_0_20px_rgba(251,203,218,0.4)]">
            <Gift className="w-5 h-5 mr-2" />
            Бонус для всіх учасників
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-10 shadow-2xl relative overflow-hidden group flex flex-col items-start text-left">
              <div className="absolute inset-0 bg-gradient-to-br from-[#81D8D0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="font-script text-3xl md:text-5xl text-[#FBCBDA] mb-4 relative z-10 w-full text-center md:text-left">Бонус 1</h3>
              <h4 className="font-montserrat text-xl md:text-2xl font-bold text-white mb-4 relative z-10">
                Як використовувати штучний інтелект у своїх інвестиціях
              </h4>
              <p className="font-arimo text-gray-300 relative z-10 leading-relaxed">
                Отримаєте файл в якому пояснюємо, як полегшити своє інвестування завдяки ШІ, а що навпаки не варто перекладати на ШІ.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-10 shadow-2xl relative overflow-hidden group flex flex-col items-start text-left">
              <div className="absolute inset-0 bg-gradient-to-br from-[#81D8D0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="font-script text-3xl md:text-5xl text-[#FBCBDA] mb-4 relative z-10 w-full text-center md:text-left">Бонус 2</h3>
              <h4 className="font-montserrat text-xl md:text-2xl font-bold text-white mb-4 relative z-10">
                Відео-урок: Як інвестувати в нерухомість на Балі з 50$
              </h4>
              <p className="font-arimo text-gray-300 relative z-10 leading-relaxed">
                В уроці ділюсь покроковою інструкцією що робити та як почати інвестувати в нерухомість на Балі.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
