'use client';

import { motion } from 'framer-motion';
import AnimatedAlert from './icons/AnimatedAlert';

export default function TargetAudienceSection({ onOpenLeadAction }: { onOpenLeadAction: () => void }) {
  const points = [
    "Ще жодного разу не інвестували",
    "Маєте накопичення, але не знаєте, як змусити їх працювати на вас",
    "Хочете почати інвестувати, але боїтесь не розібратись що і як",
    "Страшно помилитися з вибором активів",
    "Мали негативний досвід в інвестиціях",
    "Якщо ви просто в шоці з того що відбувається у світі і як при цьому не втратити те, що вже накопичили",
    "Якщо вас втомили казки про успішний успіх і вам потрібні дійсно діючі інструменти"
  ];

  return (
    <section className="bg-[#2D0000] py-24 relative overflow-hidden text-white">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[#81D8D0] opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-3xl md:text-5xl font-black text-center text-[#FBCBDA] uppercase mb-16"
        >
          Вам точно треба бути на практикумі, якщо ви:
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 p-6 rounded-2xl bg-white/5 border border-[#81D8D0]/20 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="flex-shrink-0 mt-1 text-[#81D8D0]">
                <AnimatedAlert className="w-6 h-6" />
              </div>
              <p className="font-arimo text-lg text-gray-200 leading-relaxed">{point}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onOpenLeadAction}
            className="font-montserrat inline-block rounded-full bg-[#81D8D0] px-12 py-5 text-lg font-bold uppercase tracking-wide text-[#4E0000] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)]"
          >
            Дізнатися умови
          </button>
        </div>
      </div>
    </section>
  );
}
