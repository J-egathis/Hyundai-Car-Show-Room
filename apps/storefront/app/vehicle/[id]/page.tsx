'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_VEHICLES } from '../../../lib/mockData';
import { Header } from '../../../components/shared/Header';
import { Footer } from '../../../components/shared/Footer';
import { AiChatDrawer } from '../../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../../components/shared/CookieConsent';
import { Scroll3DCarShowcase } from '../../../components/shared/Scroll3DCarShowcase';

export default function VehicleDetailPage() {
  const params = useParams();
  const carId = (params?.id as string) || 'h1';

  // Find matching vehicle or fallback to first
  const vehicle = MOCK_VEHICLES.find((v) => v.id === carId) || MOCK_VEHICLES[0];
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060810] text-[#E8ECF1]">
      <Header onOpenAiChat={() => setAiChatOpen(true)} />

      {/* 🚀 REAL 3D FULLSCREEN SCROLL CAMERA SHOWCASE & REVIEWS */}
      <Scroll3DCarShowcase
        vehicle={vehicle}
        onOpenAiChat={() => setAiChatOpen(true)}
      />

      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </div>
  );
}
