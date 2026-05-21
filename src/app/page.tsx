'use client';

import { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, X } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import BonusSection from "@/components/BonusSection";
import TargetAudienceSection from "@/components/TargetAudienceSection";
import WhatAwaitsSection from "@/components/WhatAwaitsSection";
import AboutAuthorSection from "@/components/AboutAuthorSection";
import ProgramSection from "@/components/ProgramSection";
import PricingSection from "@/components/PricingSection";
import ReviewsSection from "@/components/ReviewsSection";
import ResultsSection from "@/components/ResultsSection";
import FinalCTASection from "@/components/FinalCTASection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import LeadModal from "@/components/LeadModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState('Практикум');
  const [selectedPrice, setSelectedPrice] = useState(9);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const warn = params.get('warning');
      if (warn) {
        setWarning(warn);
        // Clean URL query parameters without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const openLeadModal = (tariff: string = 'Практикум', price: number = 9) => {
    setSelectedTariff(tariff);
    setSelectedPrice(price);
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
  };

  const scrollToProgram = () => {
    const programElement = document.getElementById('program');
    if (programElement) {
      programElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="w-full relative overflow-x-hidden">
      {/* Floating Glass Warning Toast */}
      {warning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
          <div className="bg-[#4E0000]/95 backdrop-blur-md border border-[#81D8D0]/30 rounded-2xl p-4 shadow-[0_10px_30px_rgba(26,0,0,0.5)] flex items-start space-x-3 text-white">
            <div className="mt-0.5 p-1 rounded-lg bg-[#81D8D0]/10 border border-[#81D8D0]/20 text-[#81D8D0]">
              {warning === 'blocked' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h4 className="font-montserrat font-bold text-[#81D8D0] uppercase tracking-wider text-sm">
                {warning === 'blocked' ? 'Доступ Заблоковано' : 'Доступ Обмежено'}
              </h4>
              <p className="font-arimo text-xs text-gray-300 mt-1 leading-relaxed">
                {warning === 'blocked' 
                  ? 'Зафіксовано вхід з 5 або більше унікальних пристроїв. В цілях безпеки ваш доступ тимчасово призупинено. Зверніться до підтримки.'
                  : 'Ви намагалися отримати доступ до кабінету практикуму, але оплата ще не була підтверджена. Будь ласка, завершіть оплату нижче.'}
              </p>
            </div>
            <button 
              onClick={() => setWarning(null)}
              className="text-gray-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <HeroSection onOpenLeadAction={scrollToProgram} />
      <BonusSection />
      <TargetAudienceSection onOpenLeadAction={scrollToProgram} />
      <WhatAwaitsSection onOpenLeadAction={scrollToProgram} />
      <AboutAuthorSection onOpenLeadAction={scrollToProgram} />
      <ProgramSection />
      <PricingSection onOpenLeadAction={openLeadModal} />
      <ReviewsSection />
      <ResultsSection onOpenLeadAction={() => openLeadModal('Практикум', 9)} />
      <FinalCTASection onOpenLeadAction={() => openLeadModal('Практикум', 9)} />
      <FAQSection onOpenLeadAction={() => openLeadModal('Практикум', 9)} />
      
      <LeadModal 
        isOpen={isModalOpen} 
        onCloseAction={closeLeadModal} 
        selectedTariff={selectedTariff}
        selectedPrice={selectedPrice}
      />

      <Footer />
    </main>
  );
}

