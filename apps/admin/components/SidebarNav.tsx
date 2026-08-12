'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Calendar, Users, UserCheck, Layers } from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'KPI Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Vehicle Inventory',
      href: '/inventory',
      icon: Car,
    },
    {
      name: 'Bookings Calendar',
      href: '/bookings',
      icon: Calendar,
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Layers,
    },
    {
      name: 'CRM Lead Pipeline',
      href: '/customers',
      icon: Users,
    },
    {
      name: 'User Management',
      href: '/users',
      icon: UserCheck,
    },
  ];

  return (
    <nav className="space-y-2 text-xs font-mono uppercase tracking-wider">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ||
          (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '/'));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-[12px] transition-all border ${
              isActive
                ? 'bg-[#3A3D42] text-[#F5A623] border-[#F5A623] font-bold shadow-[0_0_15px_rgba(245,166,35,0.3)]'
                : 'bg-transparent text-gray-300 border-transparent hover:bg-[#3A3D42]/60 hover:text-[#F5A623] hover:border-[#52565E]/40'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5A623]' : 'text-gray-400'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
