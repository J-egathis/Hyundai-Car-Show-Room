'use client';

import React, { useState } from 'react';
import { Button, Card, Badge } from '@showroom/ui';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="amber">Global Headquarters</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase text-[#E8ECF1]">
          Contact Apex Concierge
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          Connect with our executive sales directors or schedule a private private tour of our flagship showroom.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <Card hoverEffect={false} className="space-y-4">
            <div className="flex items-center gap-3 text-[#F5A623]">
              <MapPin className="w-5 h-5" />
              <span className="font-bold uppercase text-xs text-[#E8ECF1]">Flagship Showroom Address</span>
            </div>
            <p className="text-xs text-gray-300 font-mono">
              9450 Wilshire Boulevard, Suite 100, Beverly Hills, CA 90212
            </p>
          </Card>

          <Card hoverEffect={false} className="space-y-4">
            <div className="flex items-center gap-3 text-[#F5A623]">
              <Phone className="w-5 h-5" />
              <span className="font-bold uppercase text-xs text-[#E8ECF1]">Clickable Phone & Hotline</span>
            </div>
            <a href="tel:+18005552739" className="text-sm font-mono font-bold text-[#F5A623] hover:underline block">
              +1 (800) 555-APEX
            </a>
          </Card>

          <Card hoverEffect={false} className="space-y-4">
            <div className="flex items-center gap-3 text-[#F5A623]">
              <Mail className="w-5 h-5" />
              <span className="font-bold uppercase text-xs text-[#E8ECF1]">Concierge Email</span>
            </div>
            <p className="text-xs font-mono text-gray-300">concierge@apexmotors.com</p>
          </Card>
        </div>

        {/* Form */}
        <Card hoverEffect={false} className="p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-lg font-bold text-[#F5A623]">Message Sent Successfully!</p>
              <p className="text-xs text-gray-400">Our concierge team will respond within 30 minutes.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-gray-300 uppercase font-mono mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3.5 rounded-[12px] border border-[#52565E] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 uppercase font-mono mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3.5 rounded-[12px] border border-[#52565E] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 uppercase font-mono mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Inquiring about vehicle allocation..."
                  className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3.5 rounded-[12px] border border-[#52565E] outline-none"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Send Message <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
