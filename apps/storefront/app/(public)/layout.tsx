'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../components/shared/Header';
import { Footer } from '../../components/shared/Footer';
import { AiChatDrawer } from '../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../components/shared/CookieConsent';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* INTERACTIVE MOUSE SPOTLIGHT GLOW ON BLUEPRINT GRID */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(550px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(245, 166, 35, 0.22), transparent 75%)`,
        }}
      />

      <Header onOpenAiChat={() => setAiChatOpen(true)} />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </>
  );
}
