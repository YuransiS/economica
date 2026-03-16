'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function AboutAuthorSection({ onOpenLeadAction }: { onOpenLeadAction: () => void }) {
  return (
    <section className="bg-[#1A0000] py-24 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-[#FBCBDA] opacity-5 blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            {/* Image Placeholder */}
            <div className="aspect-[4/5] rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-arimo">
                [Фото Софії біля тексту]
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <blockquote className="font-script text-3xl md:text-4xl leading-relaxed text-[#FBCBDA] mb-8 relative">
              <span className="text-8xl text-white/10 absolute -top-8 -left-6 z-0">"</span>
              <span className="relative z-10">Завдяки моїм знанням, я бачу що відбувається на економічному ринку і хочу допомогти вам примножувати ваш капітал навіть під час світової кризи. Коли здається, що всі тільки втрачають в доході.</span>
            </blockquote>
          </motion.div>
        </div>



        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h3 className="font-montserrat text-2xl md:text-4xl font-bold text-[#FBCBDA] mb-6 leading-relaxed uppercase">
            Ви теж можете вийти на щомісячний пасивний дохід <br/><span className="text-white">навіть під час кризи.</span>
          </h3>
          <p className="font-arimo text-xl text-gray-400 mb-12">
            На практикумі будемо розбирати, як ситуація у світі впливає на ваш капітал та як його збільшувати навіть у складні часи
          </p>

          <button
            onClick={onOpenLeadAction}
            className="font-montserrat inline-flex flex-col items-center group"
          >
            <span className="rounded-full bg-[#81D8D0] px-12 py-5 text-lg font-bold uppercase tracking-wide text-[#4E0000] transition-transform group-hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)] mb-4">
              Дізнатися умови
            </span>
            <ChevronDown className="w-8 h-8 text-[#81D8D0] animate-bounce" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
