'use client';

import { useState } from "react";
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
import LeadModal from "@/components/LeadModal";
import TariffSelectionModal from "@/components/TariffSelectionModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState('PRO');
  const [selectedPrice, setSelectedPrice] = useState(19);

  const openLeadModal = (tariff: string = 'PRO', price: number = 19) => {
    setSelectedTariff(tariff);
    setSelectedPrice(price);
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectTariff = (tariff: string, price: number) => {
    setIsTariffModalOpen(false);
    openLeadModal(tariff, price);
  };

  const scrollToProgram = () => {
    const programElement = document.getElementById('program');
    if (programElement) {
      programElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="w-full relative overflow-x-hidden">
      <HeroSection onOpenLead={scrollToProgram} />
      <BonusSection />
      <TargetAudienceSection onOpenLead={scrollToProgram} />
      <WhatAwaitsSection onOpenLead={scrollToProgram} />
      <AboutAuthorSection onOpenLead={scrollToProgram} />
      <ProgramSection />
      <PricingSection onOpenLead={openLeadModal} />
      <ReviewsSection />
      <ResultsSection onOpenLead={() => setIsTariffModalOpen(true)} />
      <FinalCTASection onOpenLead={() => setIsTariffModalOpen(true)} />
      <FAQSection onOpenLead={() => setIsTariffModalOpen(true)} />
      
      <TariffSelectionModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        onSelectTariff={handleSelectTariff}
      />

      <LeadModal 
        isOpen={isModalOpen} 
        onClose={closeLeadModal} 
        selectedTariff={selectedTariff}
        selectedPrice={selectedPrice}
      />
    </main>
  );
}

