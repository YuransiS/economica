'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function TariffSelectionModal({
  isOpen,
  onClose,
  onSelectTariff
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectTariff: (tariff: string, price: number) => void;
}) {
  const tariffs = [
    {
      name: "PRO",
      price: 19,
      oldPrice: 29,
      features: [
        "Доступ до чату",
        "3 прямі ефіри",
        "Зворотній зв'язок"
      ],
      color: "bg-gradient-to-br from-[#81D8D0]/20 to-[#81D8D0]/5 border-[#81D8D0]/30",
      buttonColor: "bg-[#81D8D0] text-[#4E0000]",
      badge: null
    },
    {
      name: "VIP",
      price: 49,
      oldPrice: 69,
      features: [
        "Все з PRO",
        "Індивідуальний zoom",
        "Особисте ведення"
      ],
      color: "bg-gradient-to-br from-[#4E0000] to-[#2D0000] border-amber-500/30",
      buttonColor: "bg-amber-400 text-[#4E0000]",
      badge: "Найкращий вибір"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { 
                type: "spring", 
                damping: 25, 
                stiffness: 300 
              }
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-[#1A0000] border border-white/10 p-6 md:p-10 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-8 text-center">
              <h3 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white">
                ОБЕРІТЬ ВАШ <span className="text-[#81D8D0]">ТАРИФ</span>
              </h3>
              <p className="mt-2 text-gray-400">
                Щоб продовжити оплату, будь ласка, виберіть один із варіантів
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tariffs.map((tariff, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (index + 1), type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all shadow-xl hover:shadow-[#81D8D0]/10 ${tariff.color}`}
                >
                  {tariff.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#4E0000] shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                      {tariff.badge}
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="font-montserrat text-2xl font-black text-white text-center mb-6">
                      {tariff.name}
                    </h4>

                    <div className="space-y-3 mb-8">
                      {tariff.features.map((feature, i) => (
                        <div key={i} className="flex items-start text-sm md:text-base">
                          <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 text-[#81D8D0]" />
                          <span className="text-gray-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-end justify-center gap-3 mb-6">
                      <span className="font-arimo text-xl line-through text-gray-500">
                        ${tariff.oldPrice}
                      </span>
                      <span className="font-montserrat text-5xl font-black text-white">
                        ${tariff.price}
                      </span>
                    </div>

                    {tariff.name === 'VIP' && (
                      <CountdownTimer />
                    )}

                    <button
                      onClick={() => onSelectTariff(tariff.name, tariff.price)}
                      className={`w-full rounded-xl py-4 text-base md:text-lg font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${tariff.buttonColor}`}
                    >
                      Обрати {tariff.name}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
