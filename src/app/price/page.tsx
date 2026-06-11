'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCheck from "@/components/icons/AnimatedCheck";
import PriceLeadModal from "@/components/PriceLeadModal";

export default function PricePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState('Invest Baby');

  const openLeadModal = (tariff: string) => {
    setSelectedTariff(tariff);
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
  };

  const scrollToTariffs = () => {
    const tariffsElement = document.getElementById('tariffs');
    if (tariffsElement) {
      tariffsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const modules = [
    "Модуль 1. Як ставити фінансові цілі так, аби гарантовано їх досягати",
    "Модуль 2. Як ДОзаробляти на своєму досвіді і кратно рости в доході (запрошена експертка Альона Рижук)",
    "Модуль 3. Фінансові звички багатих людей. Робочі стратегії та інструменти",
    "Модуль 4. Як досягнути свого першого мільйону на інвестиціях",
    "Модуль 5. Складаємо інвестиційний портфель, який буде приносити регулярний пасивний дохід",
    "Модуль 6: Як застрахувати себе та своїх близьких від фінансових ризиків",
    "Модуль 7. Податки інвестора",
    "Модуль 8: Як стати успішним та багатим фінансовим радником"
  ];

  const tariffs = [
    {
      name: "Invest Baby",
      color: "bg-white/5",
      buttonColor: "bg-[#81D8D0] text-[#4E0000]",
      disabledModules: [5, 6, 7]
    },
    {
      name: "Business Baby",
      color: "bg-[#4E0000]",
      buttonColor: "bg-[#81D8D0] text-[#4E0000]",
      badge: "Популярний вибір",
      disabledModules: [7]
    },
    {
      name: "Finance Baby",
      color: "bg-white/5",
      buttonColor: "bg-[#81D8D0] text-[#4E0000]",
      disabledModules: []
    }
  ];

  return (
    <main className="w-full relative overflow-x-hidden bg-[#1A0000] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 px-4">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4E0000]/40 via-[#1A0000]/0 to-transparent -z-10"></div>
        
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-montserrat text-4xl md:text-6xl lg:text-7xl font-black uppercase text-[#81D8D0] mb-6 leading-tight"
          >
            ПЕРШИЙ МІЛЬЙОН
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-arimo text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            За 10 тижнів отримаєте персональну стратегію досягнення першого мільйону на інвестиціях
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12"
          >
            <div className="flex items-center gap-3">
              <AnimatedCheck className="text-[#81D8D0] w-6 h-6 shrink-0" />
              <span className="font-arimo text-lg">навіть під час кризи</span>
            </div>
            <div className="flex items-center gap-3">
              <AnimatedCheck className="text-[#81D8D0] w-6 h-6 shrink-0" />
              <span className="font-arimo text-lg">почати можна з будь-якого капіталу</span>
            </div>
            <div className="flex items-center gap-3">
              <AnimatedCheck className="text-[#81D8D0] w-6 h-6 shrink-0" />
              <span className="font-arimo text-lg">навіть без досвіду в фінансах та інвестуванні</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-12 border border-white/10"
          >
            <div className="flex flex-col sm:flex-row gap-6 text-center sm:text-left">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Старт</p>
                <p className="text-xl font-bold text-[#FBCBDA]">10 липня</p>
              </div>
              <div className="hidden sm:block w-px bg-white/20"></div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Тривалість</p>
                <p className="text-xl font-bold text-[#FBCBDA]">10 тижнів</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button 
              onClick={scrollToTariffs}
              className="bg-[#4E0000] text-white px-10 py-5 rounded-2xl text-xl font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(78,0,0,0.6)] hover:bg-[#600000] hover:scale-105 transition-all"
            >
              Хочу дізнатися умови участі
            </button>
          </motion.div>
        </div>
      </section>

      {/* Tariffs Section */}
      <section id="tariffs" className="py-24 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="font-montserrat text-4xl md:text-5xl font-black text-center text-white uppercase mb-16">
            Формати участі
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tariffs.map((tariff, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-5 md:p-8 shadow-2xl border border-white/10 flex flex-col backdrop-blur-md ${tariff.color} ${index === 1 ? 'lg:scale-105 lg:z-10' : ''}`}
              >
                {tariff.badge && (
                  <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#81D8D0] px-4 md:px-6 py-1.5 md:py-2 font-bold uppercase tracking-widest text-[#4E0000] text-xs md:text-sm shadow-[0_0_20px_rgba(129,216,208,0.4)] whitespace-nowrap">
                    {tariff.badge}
                  </div>
                )}
                
                <h3 className="font-montserrat text-2xl md:text-3xl font-black mb-6 md:mb-8 text-center text-[#FBCBDA]">{tariff.name}</h3>
                
                <div className="flex-1 space-y-3 md:space-y-4 mb-8">
                  <ul className="space-y-3 md:space-y-4">
                    {modules.map((feature, i) => {
                      const isDisabled = tariff.disabledModules.includes(i);
                      return (
                        <li key={i} className={`flex items-start ${isDisabled ? 'opacity-50' : ''}`}>
                          {isDisabled ? (
                            <span className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 mt-0.5">✕</span>
                          ) : (
                            <AnimatedCheck className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex-shrink-0 text-[#81D8D0] mt-0.5" />
                          )}
                          <span className={`font-arimo text-xs md:text-base leading-tight ${isDisabled ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <button
                    onClick={() => openLeadModal(tariff.name)}
                    className={`w-full rounded-2xl py-4 text-lg font-bold uppercase tracking-widest transition-transform hover:scale-105 shadow-xl ${tariff.buttonColor}`}
                  >
                    Хочу дізнатися умови участі
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus Section */}
      <section className="py-24 relative bg-[#2D0000]/30 border-y border-white/5">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#4E0000] rounded-3xl p-10 md:p-16 border border-[#81D8D0]/30 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#81D8D0] rounded-full blur-[100px] opacity-20"></div>
            
            <h2 className="font-montserrat text-3xl md:text-4xl font-black text-white uppercase mb-8 leading-tight">
              Що ви отримуєте після того як залишите заявку
            </h2>
            
            <div className="max-w-2xl mx-auto mb-10 text-center">
              <p className="font-arimo text-xl md:text-2xl text-gray-200 leading-relaxed">
                Відео-урок: Як накопичити перші 100 000$ та стабільно отримувати пасивний дохід завдяки інвестиціям
              </p>
            </div>

            <button 
              onClick={scrollToTariffs}
              className="bg-[#81D8D0] text-[#4E0000] px-10 py-5 rounded-2xl text-xl font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(129,216,208,0.4)] hover:bg-[#a6e8e2] hover:scale-105 transition-all w-full md:w-auto"
            >
              Хочу дізнатися умови участі
            </button>
          </motion.div>
        </div>
      </section>

      <PriceLeadModal 
        isOpen={isModalOpen}
        onCloseAction={closeLeadModal}
        selectedTariff={selectedTariff}
        selectedPrice={0}
      />
    </main>
  );
}
