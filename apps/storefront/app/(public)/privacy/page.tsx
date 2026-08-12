'use client';

import React from 'react';
import { Card, Badge } from '@showroom/ui';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Badge variant="amber">GDPR Compliance</Badge>
      <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1]">Privacy Policy</h1>
      <Card hoverEffect={false} className="space-y-4 text-xs text-gray-300 leading-relaxed font-light p-8">
        <p>
          Apex Motors complies fully with EU General Data Protection Regulation (GDPR) standards. We collect customer data strictly for test drive scheduling, service appointments, and vehicle inquiries.
        </p>
        <h3 className="text-sm font-bold text-[#E8ECF1] uppercase">Data Encryption</h3>
        <p>All sensitive information is encrypted in transit via SSL/TLS and stored in MySQL multi-tenant isolated databases.</p>
      </Card>
    </div>
  );
}
