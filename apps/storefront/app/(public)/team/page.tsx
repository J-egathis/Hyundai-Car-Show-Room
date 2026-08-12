'use client';

import React from 'react';
import { Card, Badge } from '@showroom/ui';

const TEAM = [
  {
    name: 'Julian Sterling',
    role: 'Managing Director & Founder',
    bio: '20+ years executive leadership in European hypercar distribution.',
  },
  {
    name: 'Elena Rostova',
    role: 'Head of Client Experience',
    bio: 'Pioneered private home delivery test drive concierge operations.',
  },
  {
    name: 'Marcus Vance',
    role: 'Master Master Technician',
    bio: 'Certified V12 & Dual-Motor high voltage specialist.',
  },
];

export default function TeamPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="amber">Leadership Team</Badge>
        <h1 className="text-4xl font-extrabold uppercase text-[#E8ECF1]">
          Executive Leadership
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TEAM.map((member, idx) => (
          <Card key={idx} hoverEffect={false} className="space-y-3 text-center p-8">
            <div className="w-20 h-20 rounded-[12px] bg-[#0D0D0D] border border-[#F5A623] mx-auto flex items-center justify-center text-xl font-bold text-[#F5A623]">
              {member.name[0]}
            </div>
            <h3 className="text-lg font-extrabold uppercase text-[#E8ECF1]">{member.name}</h3>
            <p className="text-xs font-mono text-[#F5A623] uppercase">{member.role}</p>
            <p className="text-xs text-gray-300 font-light leading-relaxed">{member.bio}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
