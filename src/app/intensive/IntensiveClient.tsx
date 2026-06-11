'use client';

import { useState } from "react";
import IntensiveHeroSection from "@/components/IntensiveHeroSection";
import BonusSection from "@/components/BonusSection";
import IntensiveTargetAudienceSection from "@/components/IntensiveTargetAudienceSection";
import IntensiveWhatAwaitsSection from "@/components/IntensiveWhatAwaitsSection";
import IntensiveAboutAuthorSection from "@/components/IntensiveAboutAuthorSection";
import IntensiveProgramSection from "@/components/IntensiveProgramSection";
import IntensivePricingSection from "@/components/IntensivePricingSection";
import ReviewsSection from "@/components/ReviewsSection";
import IntensiveResultsSection from "@/components/IntensiveResultsSection";
import IntensiveFinalCTASection from "@/components/IntensiveFinalCTASection";
import IntensiveFAQSection from "@/components/IntensiveFAQSection";
import Footer from "@/components/Footer";
import IntensiveLeadModal from "@/components/IntensiveLeadModal";

export default function IntensiveClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openLeadModal = () => {
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
      <IntensiveHeroSection onOpenLeadAction={scrollToProgram} />
      <BonusSection />
      <IntensiveTargetAudienceSection onOpenLeadAction={scrollToProgram} />
      <IntensiveWhatAwaitsSection onOpenLeadAction={scrollToProgram} />
      <IntensiveAboutAuthorSection onOpenLeadAction={scrollToProgram} />
      <IntensiveProgramSection />
      <IntensivePricingSection onOpenLeadAction={openLeadModal} />
      <ReviewsSection />
      <IntensiveResultsSection onOpenLeadAction={openLeadModal} />
      <IntensiveFinalCTASection onOpenLeadAction={openLeadModal} />
      <IntensiveFAQSection onOpenLeadAction={openLeadModal} />
      
      <IntensiveLeadModal 
        isOpen={isModalOpen} 
        onCloseAction={closeLeadModal} 
        selectedTariff="Безкоштовно"
        selectedPrice={0}
      />

      <Footer />
    </main>
  );
}
