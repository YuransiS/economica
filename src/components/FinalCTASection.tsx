'use client';

import { motion } from 'framer-motion';

export default function FinalCTASection({ onOpenLead }: { onOpenLead: () => void }) {
  return (
    <section className="bg-[#4E0000] py-32 relative text-center text-white overflow-hidden">
      {/* Decorative Blur and Textures */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full max-w-4xl bg-[#81D8D0] opacity-10 blur-[150px] rounded-full"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-script text-3xl md:text-5xl leading-relaxed md:leading-snug mb-16 text-[#FBCBDA]"
        >
          "Так і будете спостерігати і вичікувати кращих часів чи все ж почнете формувати свій пасивний дохід вже сьогодні, щоб через 10 років сказати собі <span className="text-[#81D8D0]">«Дякую, що тоді зробив\ла той перший крок»</span>"
        </motion.h2>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onClick={onOpenLead}
          className="font-montserrat relative inline-block overflow-hidden rounded-2xl bg-[#81D8D0] px-16 py-6 text-xl font-bold uppercase tracking-widest text-[#4E0000] shadow-[0_0_40px_rgba(129,216,208,0.3)] transition-transform hover:scale-105"
        >
          <span className="relative z-10">Оплатити</span>
        </motion.button>
      </div>
    </section>
  );
}
