'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';

export default function AboutAuthorSection() {
  return (
    <section className="py-20 bg-[#4E0000] text-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat text-4xl md:text-5xl font-black uppercase mb-4">
            Хто проводить цей майстер-клас?
          </h2>
        </motion.div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <div className="flex-1">
              <h3 className="font-montserrat text-3xl font-bold text-[#81D8D0] mb-2 uppercase">Софія Фединяк</h3>
              <p className="font-arimo text-xl text-gray-300 mb-8 italic">Я — ліцензований фінансовий радник і щодня працюю з реальними людьми, які:</p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#81D8D0] shrink-0" />
                  <span className="font-arimo text-lg">не мріяли про 100 000$, а досягли;</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#81D8D0] shrink-0" />
                  <span className="font-arimo text-lg">вийшли з боргів;</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#81D8D0] shrink-0" />
                  <span className="font-arimo text-lg">збудували подушку безпеки;</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#81D8D0] shrink-0" />
                  <span className="font-arimo text-lg">навчилися не просто інвестувати, а робити це системно.</span>
                </li>
              </ul>
            </div>

            <div className="flex-1 bg-[#1A0000]/50 rounded-2xl p-8 border border-[#81D8D0]/20">
              <h4 className="font-montserrat text-2xl font-bold mb-6 text-white uppercase">Я не розповідаю:</h4>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="font-arimo text-lg">казок про «легкі гроші»,</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="font-arimo text-lg">лайфхаків для лінивих,</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="font-arimo text-lg">схем «зроби 10 000$ за 10 днів».</span>
                </li>
              </ul>

              <div className="bg-[#81D8D0]/10 p-4 rounded-xl border-l-4 border-[#81D8D0]">
                <p className="font-arimo text-lg font-bold text-[#81D8D0]">
                  "Я розповідаю те, що працює насправді, — і перевірено на десятках людей."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
