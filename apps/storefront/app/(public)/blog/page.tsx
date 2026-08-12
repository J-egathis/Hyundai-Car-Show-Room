'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@showroom/ui';
import { ArrowRight, Calendar, User } from 'lucide-react';

const POSTS = [
  {
    slug: '2026-hypercar-trends',
    title: 'The Future of V8 Hybrid Hypercars in 2026',
    excerpt: 'How high-revving internal combustion engines paired with instant torque electric motors are reshaping track performance.',
    date: 'August 2, 2026',
    author: 'Elena Rostova',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'carbon-ceramic-brakes-guide',
    title: 'Essential Maintenance Guide for Carbon Ceramic Braking Systems',
    excerpt: 'Understanding heat dissipation, wear indicators, and track day rotor preservation techniques.',
    date: 'July 28, 2026',
    author: 'Marcus Vance',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="border-b border-[#3A3D42] pb-6">
        <Badge variant="amber">Automotive Intelligence</Badge>
        <h1 className="text-4xl font-extrabold uppercase text-[#E8ECF1] mt-2">
          Apex Automotive Journal
        </h1>
        <p className="text-xs text-gray-400 font-mono mt-1">
          Bespoke buying guides, engineering teardowns, and hypercar performance insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {POSTS.map((post) => (
          <Card key={post.slug} className="group overflow-hidden flex flex-col justify-between p-0">
            <img src={post.image} alt={post.title} className="w-full h-56 object-cover" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#F5A623]" /> {post.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#F5A623]" /> {post.author}</span>
              </div>
              <h2 className="text-xl font-bold uppercase text-[#E8ECF1] group-hover:text-[#F5A623] transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed font-light">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`}>
                <Button variant="outline" size="sm">
                  Read Article <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
