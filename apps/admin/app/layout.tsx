import './globals.css';
import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';

export const metadata = {
  title: 'Apex Admin Dashboard | Dealership Management Portal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0D0D0D] text-[#E8ECF1] min-h-screen flex">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-[#0A0A0A] border-r border-[#3A3D42] p-6 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-[#F5A623] text-[#0D0D0D] font-extrabold flex items-center justify-center text-lg shadow-[0_0_15px_rgba(245,166,35,0.4)]">
                A
              </div>
              <div>
                <span className="text-sm font-extrabold text-[#E8ECF1] uppercase block">
                  APEX <span className="text-[#F5A623]">ADMIN</span>
                </span>
                <span className="text-[9px] font-mono text-gray-400 uppercase">
                  Multi-Tenant Portal
                </span>
              </div>
            </div>

            {/* DYNAMIC SIDEBAR NAV WITH ACTIVE HIGHLIGHT */}
            <SidebarNav />
          </div>

          <div className="pt-6 border-t border-[#3A3D42] text-xs font-mono text-gray-400 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> System Operational
            </div>
            <Link href="http://localhost:3000" target="_blank" className="block hover:text-[#F5A623]">
              ↗ View Storefront
            </Link>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
