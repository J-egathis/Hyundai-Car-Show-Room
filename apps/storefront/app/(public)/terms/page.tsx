'use client';

import React from 'react';
import { Card, Badge } from '@showroom/ui';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Badge variant="amber">Legal Terms</Badge>
      <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1]">Terms & Conditions</h1>
      <Card hoverEffect={false} className="space-y-4 text-xs text-gray-300 leading-relaxed font-light p-8">
        <p>By accessing Apex Motors platform, you agree to comply with all vehicle test drive regulations, deposit requirements, and purchase contract disclosures.</p>
      </Card>
    </div>
  );
}
