'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function TargetAudienceSection({ onOpenLeadAction }: { onOpenLeadAction: () => void }) {
  const points = [
    "Ви вже замислюєтесь про майбутнє, і розумієте що працювати до пенсії і отримувати копійки на пенсії ви не хочете",
    "Вас лякають швидкі зміни в світі",
    "Ви відчуваєте що зберігати гроші просто в валюті стає небезпечно",
    "Ви хочете зрозуміти як зробити так щоб гроші почали працювати на вас, а не навпаки"
  ];

  return (
    <section className="py-20 bg-[#1A0000] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4E0000] rounded-full blur-[150px] opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#81D8D0] rounded-full blur-[150px] opacity-10"></div>
      
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-montserrat text-3xl md:text-5xl font-black uppercase text-white mb-4">
            Цей майстер-клас вам <span className="text-[#81D8D0]">необхідний</span>, якщо:
          </h2>
        </motion.div>

        <div className="space-y-6 mb-16">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <CheckCircle2 className="w-8 h-8 text-[#81D8D0] shrink-0 mt-1" />
              <p className="font-arimo text-xl md:text-2xl leading-relaxed">
                {point}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={onOpenLeadAction}
            className="font-montserrat relative overflow-hidden rounded-full bg-[#81D8D0] px-12 py-5 text-xl font-bold uppercase tracking-wide text-[#4E0000] shadow-[0_0_40px_rgba(129,216,208,0.4)] transition-all hover:scale-105 hover:bg-white"
          >
            Зареєструватись зараз
          </motion.button>
        </div>
      </div>
    </section>
  );
}
