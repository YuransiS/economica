'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ReviewsSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
          className="font-montserrat text-4xl md:text-5xl font-black text-center text-[#FBCBDA] uppercase mb-4"
        >
          Відгуки
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[#FBCBDA]/60 font-montserrat text-sm uppercase tracking-widest mb-12"
        >
          Натисніть на відгук, щоб розглянути
        </motion.p>

        <div className="relative overflow-hidden w-full py-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          <div 
            className={`animate-marquee gap-4 md:gap-8 ${selectedImage ? 'marquee-paused' : ''}`}
          >
            {[...reviews, ...reviews].map((src, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(src);
                }}
                className="shrink-0 h-[320px] md:h-[500px] w-auto max-w-[85vw] md:max-w-none rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-white/5 cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <img 
                  src={src} 
                  alt={`Відгук ${index + 1}`} 
                  className="h-full w-auto object-contain pointer-events-none"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Gradient Overlays for smooth edges */}
          <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-gradient-to-r from-[#2D0000] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-gradient-to-l from-[#2D0000] to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-full max-h-full"
              >
                <img 
                  src={selectedImage} 
                  alt="Збільшений відгук" 
                  className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-[#FBCBDA] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

