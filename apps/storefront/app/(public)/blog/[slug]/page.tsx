'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@showroom/ui';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function BlogArticlePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link href="/blog" className="text-xs text-[#F5A623] hover:underline flex items-center gap-1 uppercase font-mono">
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </Link>

      <div className="space-y-4">
        <Badge variant="amber">Engineering Insights</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#E8ECF1]">
          The Future of V8 Hybrid Hypercars in 2026
        </h1>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <span>Published: August 2, 2026</span>
          <span>•</span>
          <span>By Elena Rostova, Chief Automotive Editor</span>
        </div>
      </div>

      <div className="rounded-[12px] overflow-hidden border border-[#52565E]">
        <img
          src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80"
          alt="Hypercar"
          className="w-full h-80 object-cover"
        />
      </div>

      <Card hoverEffect={false} className="space-y-6 text-sm leading-relaxed text-gray-300 font-light p-8">
        <p>
          As emissions regulations tighten globally, hypercar engineering has reached a golden era of hybrid synergy. Rather than diluting internal combustion, twin-turbo V8 engines are paired with high-voltage axial-flux electric motors to eliminate turbo lag completely.
        </p>
        <h3 className="text-lg font-extrabold uppercase text-[#E8ECF1]">
          1. Instant Torque Vectoring
        </h3>
        <p>
          With dual front electric motors providing instantaneous micro-adjustments to individual wheels, cornering speeds reach forces previously restricted to GT3 race cars.
        </p>
        <h3 className="text-lg font-extrabold uppercase text-[#E8ECF1]">
          2. Lightweight Carbon Monocoque Integration
        </h3>
        <p>
          Structural battery packs housed directly inside carbon chassis tubs allow weight distribution to achieve a razor-sharp 42:58 rear bias.
        </p>
      </Card>
    </div>
  );
}
