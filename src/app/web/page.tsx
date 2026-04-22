'use client';

import { useState } from "react";
import HeroSection from "./components/HeroSection";
import InfoSection from "./components/InfoSection";
import TargetAudienceSection from "./components/TargetAudienceSection";
import ProgramSection from "./components/ProgramSection";
import AboutAuthorSection from "./components/AboutAuthorSection";
import FAQSection from "./components/FAQSection";
import WebLeadModal from "./components/WebLeadModal";
import Footer from "@/components/Footer";

export default function WebLandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openLeadModal = () => {
    setIsModalOpen(true);
  };

  const closeLeadModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="w-full relative overflow-x-hidden bg-[#1A0000]">
      <HeroSection onOpenLead={openLeadModal} />
      <InfoSection onOpenLead={openLeadModal} />
      <TargetAudienceSection onOpenLead={openLeadModal} />
      <ProgramSection onOpenLead={openLeadModal} />
      <AboutAuthorSection />
      <FAQSection onOpenLead={openLeadModal} />
      
      <WebLeadModal 
        isOpen={isModalOpen} 
        onClose={closeLeadModal} 
      />

      <Footer />
    </main>
  );
}
