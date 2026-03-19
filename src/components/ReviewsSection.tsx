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

        {/* Infinite Carousel */}
        <div className="relative overflow-hidden w-full py-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          <motion.div 
            className="flex items-center gap-4 md:gap-8"
            animate={{
              x: [0, "-50%"],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: "max-content" }}
          >
            {[...reviews, ...reviews].map((src, index) => (
              <div
                key={index}
                className="shrink-0 h-[320px] md:h-[500px] w-auto rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-white/5"
              >
                <img 
                  src={src} 
                  alt={`Відгук ${index + 1}`} 
                  className="h-full w-auto object-contain pointer-events-none"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>

          {/* Gradient Overlays for smooth edges */}
          <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-gradient-to-r from-[#2D0000] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-gradient-to-l from-[#2D0000] to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
