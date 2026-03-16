'use client';

import { motion } from 'framer-motion';

export default function ReviewsSection() {
  const reviews = [
    '/images/otziv_1.jpg',
    '/images/otziv_2.jpg',
    '/images/otziv_3.jpg',
    '/images/otziv_4.jpg',
    '/images/otziv_5.jpg',
    '/images/otziv_6.jpg',
    '/images/otziv_7.jpg'
  ];

  return (
    <section className="bg-[#2D0000] py-24 overflow-hidden relative">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-96 w-96 rounded-full bg-[#FBCBDA] opacity-5 blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-montserrat text-4xl md:text-5xl font-black text-center text-[#FBCBDA] uppercase mb-16"
        >
          Відгуки
        </motion.h2>

        {/* Carousel */}
        <div className="flex space-x-6 overflow-x-auto pb-8 snap-x scrollbar-thin scrollbar-thumb-[#FBCBDA]/30 scrollbar-track-transparent">
          {reviews.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="snap-center shrink-0 h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl relative border border-white/10"
            >
              <img 
                src={src} 
                alt={`Відгук ${index + 1}`} 
                className="h-full w-auto object-contain"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
