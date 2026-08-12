'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@showroom/ui';
import {
  ShieldCheck,
  Award,
  Zap,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 font-mono text-[#000000] bg-white">
      {/* 1. ABOUT US LEGACY HEADER */}
      <div className="text-center space-y-4">
        <Badge variant="amber">Hyundai Legacy & Philosophy</Badge>
        <h1 className="text-4xl sm:text-6xl font-black uppercase text-[#000000]">
          Hyundai Motors Engineering Excellence
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-[#60605B] font-bold leading-relaxed">
          Hyundai Motors was founded on a singular engineering philosophy: combining cutting-edge electric hybrid technology with timeless mechanical mastery.
        </p>
      </div>

      {/* MISSION & SHOWROOM PHOTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <Card hoverEffect={false} className="space-y-4 p-8 bg-[#BFBAAF]/20 border-[#BFBAAF] shadow-lg rounded-[24px]">
          <h3 className="text-2xl font-extrabold uppercase text-[#000000]">Our Mission</h3>
          <p className="text-xs text-[#60605B] leading-relaxed font-bold">
            We curate and deliver the world's most elite hypercars and bespoke luxury vehicles. Every car in our inventory undergoes a 250-point engineering diagnosis before entering our blueprint collection.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#BFBAAF] font-mono text-xs text-[#000000]">
            <div>
              <p className="text-2xl font-black text-[#003082]">1,200+</p>
              <p className="text-[#60605B] font-bold">Vehicles Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#003082]">99.8%</p>
              <p className="text-[#60605B] font-bold">Client Satisfaction</p>
            </div>
          </div>
        </Card>

        <div className="rounded-[20px] overflow-hidden border border-[#BFBAAF] shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1000&q=80"
            alt="Flagship Showroom"
            className="w-full h-80 object-cover"
          />
        </div>
      </div>

      {/* 2. CONTACT US SECTION */}
      <div className="border-t border-[#BFBAAF] pt-16 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="amber">Get In Touch</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#000000]">
            Contact Us & Showroom Location
          </h2>
          <p className="text-xs sm:text-sm text-[#60605B] font-bold max-w-xl mx-auto font-mono">
            Visit our flagship dealership or send us an instant inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* SHOWROOM DETAILS & EMBEDDED MAP */}
          <div className="space-y-6">
            <Card hoverEffect={false} className="space-y-6 bg-[#BFBAAF]/20 border-[#BFBAAF] p-6 rounded-[24px]">
              <h3 className="text-lg font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#003082]" /> Showroom Location Pin
              </h3>

              <div className="space-y-4 text-xs font-mono text-[#000000]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#003082] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#000000] block uppercase text-sm">Vetri Hyundai, Nagapattinam</span>
                    <p className="text-[#60605B] leading-relaxed font-bold">
                      ECR Main Road, Near New Bus Stand, Nagapattinam, Tamil Nadu 611001, India
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#003082] shrink-0" />
                  <div>
                    <span className="text-[#60605B] font-bold block">Phone Enquiries:</span>
                    <a href="tel:+914365240000" className="font-extrabold text-[#000000] hover:underline">
                      +91 98424 12345 / +91 4365 240000
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#003082] shrink-0" />
                  <div>
                    <span className="text-[#60605B] font-bold block">Email Support:</span>
                    <a href="mailto:contact@vetrihyundai-nagapattinam.com" className="font-extrabold text-[#000000] hover:underline">
                      contact@vetrihyundai-nagapattinam.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#003082] shrink-0" />
                  <div>
                    <span className="text-[#60605B] font-bold block">Showroom Hours:</span>
                    <span className="font-extrabold text-[#000000]">Monday – Saturday: 9:00 AM – 8:00 PM</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="rounded-[20px] overflow-hidden border-2 border-[#003082] h-72 shadow-2xl relative bg-white">
              <iframe
                title="Vetri Hyundai Nagapattinam Location Map"
                src="https://maps.google.com/maps?q=Vetri+Hyundai+Nagapattinam&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-[8px] border border-[#003082] text-[10px] font-mono text-[#000000] font-bold">
                📍 Pinned: Vetri Hyundai, Nagapattinam
              </div>
            </div>
          </div>

          {/* CONTACT ENQUIRY FORM */}
          <div>
            <Card hoverEffect={false} className="p-8 bg-[#BFBAAF]/20 border-[#BFBAAF] space-y-6 rounded-[24px]">
              <h3 className="text-lg font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#003082]" /> Send Us A Message
              </h3>

              {formSubmitted ? (
                <div className="py-12 text-center space-y-3 bg-white rounded-[16px] border border-[#003082] p-6">
                  <CheckCircle2 className="w-12 h-12 text-[#003082] mx-auto animate-bounce" />
                  <h4 className="text-lg font-extrabold uppercase text-[#000000]">Message Received!</h4>
                  <p className="text-xs text-[#60605B] font-mono font-bold">
                    Thank you for contacting Vetri Hyundai, Nagapattinam. Our specialist will call you shortly.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setFormSubmitted(false)} className="border-[#000000] text-[#000000]">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#000000] uppercase mb-1 font-bold">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#000000] uppercase mb-1 font-bold">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98424 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#000000] uppercase mb-1 font-bold">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#000000] uppercase mb-1 font-bold">Your Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Enquiring about vehicle pricing and test drive booking at Nagapattinam showroom..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>

                  <Button variant="primary" size="lg" type="submit" className="w-full bg-[#003082] text-white font-bold">
                    Submit Contact Enquiry
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
