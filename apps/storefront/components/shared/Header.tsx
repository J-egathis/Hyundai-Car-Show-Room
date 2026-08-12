'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@showroom/ui';
import { Car, Calendar, Wrench, Menu, X, Bot, ShieldCheck, User, LogIn, ChevronDown } from 'lucide-react';

export function Header({ onOpenAiChat }: { onOpenAiChat?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Read User Session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('APEX_USER_SESSION');
      if (stored) {
        setLoggedInUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAuthDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#BFBAAF] shadow-sm font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-10 rounded-[12px] overflow-hidden bg-white border border-[#003082]/30 flex items-center justify-center p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN64oTdKISaR5X4Ta0q5F8sFN85kOqW_inzifw8-_n7kKrd5ykp2BxPFjs&s=10"
              alt="HYUNDAI MOTORS Logo"
              className="w-full h-full object-contain rounded-[10px]"
            />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-widest text-[#000000] uppercase block leading-none">
              HYUNDAI <span className="text-[#003082]">MOTORS</span>
            </span>
            <span className="text-[10px] tracking-widest text-[#60605B] uppercase font-mono font-bold">
              Sapphire Blueprint Series
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#000000]">
          <Link href="/inventory" className="hover:text-[#003082] transition-colors flex items-center gap-1.5 font-mono">
            <Car className="w-4 h-4 text-[#003082]" /> Inventory
          </Link>

          <Link href="/compare" className="hover:text-[#003082] transition-colors font-mono">
            Compare
          </Link>

          <Link href="/booking/test-drive" className="hover:text-[#003082] transition-colors flex items-center gap-1.5 font-mono">
            <Calendar className="w-4 h-4 text-[#003082]" /> Test Drive
          </Link>

          <Link href="/booking/service" className="hover:text-[#003082] transition-colors flex items-center gap-1.5 font-mono">
            <Wrench className="w-4 h-4 text-[#003082]" /> Service
          </Link>

          <Link href="/about" className="hover:text-[#003082] transition-colors font-mono">
            About
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[12px] bg-[#BFBAAF]/30 text-[#000000] border border-[#60605B]/40 hover:border-[#003082] text-xs font-bold uppercase tracking-wider transition-all font-mono shadow-sm"
          >
            <Bot className="w-4 h-4 text-[#003082]" /> AI Concierge
          </button>

          {/* USER ACCOUNT SESSION BUTTON */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
              className="flex items-center gap-2 font-mono bg-[#003082] text-white hover:bg-[#000000]"
            >
              {loggedInUser ? (
                <>
                  <User className="w-4 h-4 text-[#BFBAAF]" /> {loggedInUser.name.split(' ')[0]}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> My Account
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </Button>

            {authDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#BFBAAF] rounded-[16px] shadow-2xl p-2 text-xs space-y-1 font-mono z-50">
                {loggedInUser ? (
                  <>
                    <div className="p-3 border-b border-[#BFBAAF] bg-[#BFBAAF]/20 rounded-[12px]">
                      <p className="font-extrabold text-[#000000] truncate">{loggedInUser.name}</p>
                      <p className="text-[10px] text-[#60605B] truncate font-bold">{loggedInUser.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="block px-3 py-2 text-[#000000] hover:bg-[#BFBAAF]/30 rounded-[8px] font-bold"
                    >
                      👤 My Profile & Reservations
                    </Link>
                    <Link
                      href="http://localhost:3002"
                      target="_blank"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="block px-3 py-2 text-[#003082] hover:bg-[#003082]/10 rounded-[8px] font-extrabold"
                    >
                      ⚙️ Admin Portal Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('APEX_USER_SESSION');
                        setLoggedInUser(null);
                        setAuthDropdownOpen(false);
                        window.location.reload();
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-[8px] font-bold"
                    >
                      🚪 Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-2 text-[11px] text-[#60605B] font-bold">Sign in or register to track bookings:</div>
                    <Link
                      href="/profile"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="block px-3 py-2.5 bg-[#003082] text-white rounded-[10px] font-extrabold text-center"
                    >
                      Sign In / Register
                    </Link>
                    <Link
                      href="http://localhost:3002"
                      target="_blank"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="block px-3 py-2 text-[#003082] hover:bg-[#003082]/10 rounded-[8px] font-bold text-center pt-2"
                    >
                      Launch Admin Portal ⚙️
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#000000] hover:text-[#003082]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#BFBAAF] bg-white px-4 pt-2 pb-6 space-y-3 font-mono text-xs uppercase font-bold text-[#000000]">
          <Link href="/inventory" className="block py-2 hover:text-[#003082]">
            Inventory Catalog
          </Link>
          <Link href="/compare" className="block py-2 hover:text-[#003082]">
            Compare Models
          </Link>
          <Link href="/booking/test-drive" className="block py-2 hover:text-[#003082]">
            Test Drive
          </Link>
          <Link href="/booking/service" className="block py-2 hover:text-[#003082]">
            Service Center
          </Link>
          <Link href="/profile" className="block py-2 hover:text-[#003082]">
            My Account & Profile
          </Link>
          <Link href="/about" className="block py-2 hover:text-[#003082]">
            About Hyundai
          </Link>
        </div>
      )}
    </header>
  );
}
