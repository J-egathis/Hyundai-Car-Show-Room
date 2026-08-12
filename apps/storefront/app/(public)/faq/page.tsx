'use client';

import React, { useState } from 'react';
import { Card, Badge } from '@showroom/ui';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the Home Delivery Test Drive service operate?',
    a: 'Once scheduled via our portal, an Apex Brand Specialist delivers the vehicle in an enclosed transport trailer directly to your preferred address. You receive a 45-minute private drive session.',
  },
  {
    q: 'What warranty coverage is included with Apex Certified vehicles?',
    a: 'Every pre-owned hypercar includes a comprehensive 3-Year / 36,000 Mile Bumper-to-Bumper Warranty including 24/7 Roadside Assistance and annual battery calibration.',
  },
  {
    q: 'Can I track my vehicle during service appointments?',
    a: 'Yes. Our Service Portal features real-time WebSocket progress tracking showing inspection completion %, technician notes, and estimated completion times.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="amber">Help & Knowledge Base</Badge>
        <h1 className="text-4xl font-extrabold uppercase text-[#E8ECF1]">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div key={idx} onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
            <Card
              hoverEffect={false}
              className="cursor-pointer space-y-2 p-6"
            >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#E8ECF1] uppercase flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#F5A623]" /> {faq.q}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#F5A623] transition-transform ${
                  openIndex === idx ? 'rotate-180' : ''
                }`}
              />
            </div>
            {openIndex === idx && (
              <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-[#52565E]/40 font-light">
                {faq.a}
              </p>
            )}
          </Card>
        </div>
        ))}
      </div>
    </div>
  );
}
