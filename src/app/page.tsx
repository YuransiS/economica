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

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <main className="w-full relative overflow-x-hidden">
      <HeroSection onOpenLeadAction={() => openLeadModal()} />
      <BonusSection />
      <TargetAudienceSection onOpenLeadAction={() => openLeadModal()} />
      <WhatAwaitsSection onOpenLeadAction={() => openLeadModal()} />
      <AboutAuthorSection onOpenLeadAction={() => openLeadModal()} />
      <ProgramSection />
      <PricingSection onOpenLeadAction={openLeadModal} />
      <ReviewsSection />
      <ResultsSection onOpenLeadAction={() => openLeadModal()} />
      <FinalCTASection onOpenLeadAction={() => openLeadModal()} />
      <FAQSection onOpenLeadAction={() => openLeadModal()} />
      
      <LeadModal 
        isOpen={isModalOpen} 
        onCloseAction={closeLeadModal} 
        selectedTariff={selectedTariff}
        selectedPrice={selectedPrice}
      />
    </main>
  );
}

