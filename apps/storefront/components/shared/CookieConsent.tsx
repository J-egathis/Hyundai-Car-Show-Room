'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@showroom/ui';
import { ShieldCheck, Cookie } from 'lucide-react';

export function CookieConsent() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('apex_cookie_consent');
    if (!consent) setAccepted(false);
  }, []);

  if (accepted) return null;

  const handleAccept = () => {
    localStorage.setItem('apex_cookie_consent', 'true');
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-40 bg-[#3A3D42] border border-[#F5A623]/40 p-5 rounded-[12px] shadow-2xl backdrop-blur-xl text-[#E8ECF1] text-xs space-y-3">
      <div className="flex items-center gap-2 text-[#F5A623] font-bold uppercase tracking-wider">
        <Cookie className="w-5 h-5" /> Cookie & GDPR Preferences
      </div>
      <p className="text-gray-300 leading-relaxed">
        We use essential cookies and anonymized analytics to deliver real-time inventory updates, instant AI concierge chat, and personalized test drive bookings.
      </p>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleAccept}
          className="text-gray-400 hover:text-white text-xs uppercase"
        >
          Decline Optional
        </button>
        <Button variant="primary" size="sm" onClick={handleAccept}>
          Accept All
        </Button>
      </div>
    </div>
  );
}
