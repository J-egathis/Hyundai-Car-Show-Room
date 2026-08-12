'use client';

import React from 'react';
import { Card, Badge } from '@showroom/ui';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Sir Charles Montgomery',
    title: 'Owner - Apex CyberSUV Ultra',
    comment: 'The private home test drive was exceptional. The brand specialist brought the covered transport directly to my residence in Bel Air.',
    rating: 5,
  },
  {
    name: 'Dr. Harrison Vance',
    title: 'Owner - Veloce Phantom Roadster GT',
    comment: 'Instant 1020 HP torque delivery is astounding. The white-glove delivery experience set a new standard for luxury automotive procurement.',
    rating: 5,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="amber">Client Verified Reviews</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase text-[#E8ECF1]">
          Owner Testimonials
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {REVIEWS.map((rev, idx) => (
          <Card key={idx} hoverEffect={false} className="space-y-4 p-8 bg-[#3A3D42]/60">
            <Quote className="w-8 h-8 text-[#F5A623]" />
            <div className="flex gap-1">
              {Array.from({ length: rev.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
              ))}
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed font-light">"{rev.comment}"</p>
            <div className="pt-2 border-t border-[#52565E]/40 font-mono text-xs">
              <p className="font-bold text-[#E8ECF1] uppercase">{rev.name}</p>
              <p className="text-[#F5A623]">{rev.title}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
