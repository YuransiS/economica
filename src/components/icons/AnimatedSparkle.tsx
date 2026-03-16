'use client';

import { motion } from 'framer-motion';

export default function AnimatedSparkle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <motion.path 
        initial={{ pathLength: 0, rotate: -45, scale: 0.5, opacity: 0 }}
        whileInView={{ pathLength: 1, rotate: 0, scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z"
      />
    </svg>
  );
}
