import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#BFBAAF]/20 border-t border-[#BFBAAF] text-[#000000] py-16 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-10 rounded-[12px] overflow-hidden bg-white border border-[#003082]/30 flex items-center justify-center p-0.5 shadow-md">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN64oTdKISaR5X4Ta0q5F8sFN85kOqW_inzifw8-_n7kKrd5ykp2BxPFjs&s=10"
                  alt="HYUNDAI MOTORS Logo"
                  className="w-full h-full object-contain rounded-[10px]"
                />
              </div>
              <span className="text-lg font-bold text-[#000000] uppercase">
                HYUNDAI <span className="text-[#003082]">MOTORS</span>
              </span>
            </div>
            <p className="text-xs text-[#60605B] leading-relaxed font-bold">
              Engineering blueprint precision, hyper-performance electric & hybrid supercars, and bespoke concierge test drives.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-extrabold text-[#000000] uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs uppercase tracking-wider font-bold text-[#000000]">
              <li><Link href="/inventory" className="hover:text-[#003082]">Inventory Catalog</Link></li>
              <li><Link href="/compare" className="hover:text-[#003082]">Vehicle Comparison</Link></li>
              <li><Link href="/booking/test-drive" className="hover:text-[#003082]">Book Test Drive</Link></li>
              <li><Link href="/booking/service" className="hover:text-[#003082]">Service Center</Link></li>
              <li><Link href="/blog" className="hover:text-[#003082]">Automotive Blog</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-extrabold text-[#000000] uppercase tracking-widest mb-4">Trust & Legal</h4>
            <ul className="space-y-2 text-xs uppercase tracking-wider font-bold text-[#000000]">
              <li><Link href="/testimonials" className="hover:text-[#003082]">Customer Reviews</Link></li>
              <li><Link href="/faq" className="hover:text-[#003082]">Frequently Asked Questions</Link></li>
              <li><Link href="/team" className="hover:text-[#003082]">Executive Team</Link></li>
              <li><Link href="/privacy" className="hover:text-[#003082]">Privacy Policy (GDPR)</Link></li>
              <li><Link href="/terms" className="hover:text-[#003082]">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-[#003082]">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-extrabold text-[#000000] uppercase tracking-widest mb-4">Showroom Hours</h4>
            <div className="text-xs space-y-1 text-[#60605B] font-bold">
              <p>Mon - Fri: 8:00 AM - 8:00 PM</p>
              <p>Saturday: 9:00 AM - 6:00 PM</p>
              <p>Sunday: Executive Private Appointments</p>
              <p className="pt-2 text-[#003082] font-black text-sm font-mono">+1 (800) 555-HYUNDAI</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#BFBAAF] flex flex-col sm:flex-row justify-between items-center text-xs text-[#60605B] font-bold">
          <p>© 2026 Hyundai Motors. Sapphire Blueprint Series.</p>
          <p>Powered by Next.js 15, Fastify NestJS, Meilisearch & MySQL.</p>
        </div>
      </div>
    </footer>
  );
}
