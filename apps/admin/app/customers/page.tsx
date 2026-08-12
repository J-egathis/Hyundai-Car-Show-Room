'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button } from '@showroom/ui';
import {
  Sparkles,
  PhoneCall,
  Mail,
  Activity,
  User,
  Car,
  Wrench,
  Calendar,
  MapPin,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const SEED_CUSTOMERS = [
  {
    id: 'CRM-101',
    customerName: 'Alexander Mercer',
    customerEmail: 'alexander@mercer-capital.com',
    customerPhone: '+1 (555) 019-2834',
    customerAddress: '742 Evergreen Terrace, Beverly Hills, CA',
    type: 'SERVICE',
    vehicleModel: 'Apex CyberSUV Ultra',
    vehicleYear: '2026',
    serviceType: 'Comprehensive 10,000 Mi Maintenance & Battery Calibration',
    date: '2026-08-12',
    time: '09:00 AM',
    leadScore: 95,
    tier: 'HIGH_PRIORITY_HOT_LEAD',
    lastActivity: 'Service Scheduled: Comprehensive 10,000 Mi Maintenance',
    recommendedAction: 'Prepare Master Tech inspection report & offer EV battery health certificate.',
  },
  {
    id: 'CRM-102',
    customerName: 'Sir Charles Montgomery',
    customerEmail: 'charles@montgomery.co.uk',
    customerPhone: '+1 (555) 998-1122',
    customerAddress: '100 Wilshire Blvd, Los Angeles, CA',
    type: 'TEST_DRIVE',
    vehicleModel: 'Veloce Phantom Roadster GT',
    vehicleYear: '2026',
    serviceType: 'VIP Track Test Drive',
    date: '2026-08-07',
    time: '11:30 AM',
    leadScore: 88,
    tier: 'VIP_CUSTOMER',
    lastActivity: 'Test Drive Confirmed: Veloce Phantom Roadster GT',
    recommendedAction: 'Arrange VIP showroom reception & prepare trade-in evaluation.',
  },
];

export default function AdminCustomersPage() {
  const [leads, setLeads] = useState<any[]>(SEED_CUSTOMERS);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // LIVE SYNCHRONIZE TEST DRIVE & SERVICE CUSTOMERS FROM API AND LOCALSTORAGE
  const fetchLiveCustomers = async () => {
    let combinedLeads: any[] = [];

    // 1. Fetch Test Drive Bookings
    try {
      const resTD = await fetch('http://localhost:3000/api/bookings');
      if (resTD.ok) {
        const dataTD = await resTD.json();
        dataTD.forEach((td: any) => {
          combinedLeads.push({
            id: `TD-${td.id}`,
            customerName: td.customerName || td.name || 'Anonymous Client',
            customerEmail: td.customerEmail || td.email || 'client@showroom.com',
            customerPhone: td.customerPhone || td.phone || '+1 (555) 000-1122',
            customerAddress: td.address || 'Flagship Showroom Track',
            type: 'TEST_DRIVE',
            vehicleModel: td.vehicleModel || td.carModel || 'Apex CyberSUV Ultra',
            vehicleYear: td.year || '2026',
            serviceType: 'VIP Test Drive Session',
            date: td.date || '2026-08-12',
            time: td.time || '10:00 AM',
            leadScore: 92,
            tier: 'HOT_TEST_DRIVE_LEAD',
            lastActivity: `Scheduled Test Drive (${td.vehicleModel || td.carModel || 'Showroom Vehicle'})`,
            recommendedAction: 'Send tailored financing terms & instant trade-in quote.',
          });
        });
      }
    } catch (err) {
      console.error(err);
    }

    // 2. Fetch Service Bookings
    try {
      const resSRV = await fetch('http://localhost:3000/api/service-bookings');
      if (resSRV.ok) {
        const dataSRV = await resSRV.json();
        dataSRV.forEach((srv: any) => {
          combinedLeads.push({
            id: `SRV-${srv.id}`,
            customerName: srv.customerName || 'Anonymous Client',
            customerEmail: srv.customerEmail || 'client@showroom.com',
            customerPhone: srv.customerPhone || '+1 (555) 000-1122',
            customerAddress: srv.customerAddress || 'Showroom Service Bay',
            type: 'SERVICE',
            vehicleModel: srv.vehicleModel || 'Apex Vehicle',
            vehicleYear: srv.vehicleYear || '2026',
            serviceType: srv.serviceType || 'General Maintenance',
            date: srv.scheduledDate || srv.date || '2026-08-12',
            time: srv.scheduledTime || srv.time || '09:00 AM',
            leadScore: 89,
            tier: 'ACTIVE_SERVICE_CLIENT',
            lastActivity: `Service Appointment: ${srv.serviceType}`,
            recommendedAction: 'Send digital inspection video & offer complimentary valet pickup.',
          });
        });
      }
    } catch (err) {
      console.error(err);
    }

    // 3. Merge LocalStorage items from both stores if any
    try {
      const storedTD = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (storedTD) {
        const localTD = JSON.parse(storedTD);
        localTD.forEach((td: any) => {
          if (!combinedLeads.some((l) => l.id.includes(td.id))) {
            combinedLeads.unshift({
              id: `TD-${td.id}`,
              customerName: td.customerName || td.name || 'Anonymous Client',
              customerEmail: td.customerEmail || td.email || 'client@showroom.com',
              customerPhone: td.customerPhone || td.phone || '+1 (555) 000-1122',
              customerAddress: td.address || 'Flagship Showroom Track',
              type: 'TEST_DRIVE',
              vehicleModel: td.vehicleModel || td.carModel || 'Apex CyberSUV Ultra',
              vehicleYear: td.year || '2026',
              serviceType: 'VIP Test Drive Session',
              date: td.date || '2026-08-12',
              time: td.time || '10:00 AM',
              leadScore: 94,
              tier: 'HOT_TEST_DRIVE_LEAD',
              lastActivity: `Scheduled Test Drive (${td.vehicleModel || td.carModel || 'Showroom Vehicle'})`,
              recommendedAction: 'Send tailored financing terms & instant trade-in quote.',
            });
          }
        });
      }

      const storedSRV = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (storedSRV) {
        const localSRV = JSON.parse(storedSRV);
        localSRV.forEach((srv: any) => {
          if (!combinedLeads.some((l) => l.id.includes(srv.id))) {
            combinedLeads.unshift({
              id: `SRV-${srv.id}`,
              customerName: srv.customerName || 'Anonymous Client',
              customerEmail: srv.customerEmail || 'client@showroom.com',
              customerPhone: srv.customerPhone || '+1 (555) 000-1122',
              customerAddress: srv.customerAddress || 'Showroom Service Bay',
              type: 'SERVICE',
              vehicleModel: srv.vehicleModel || 'Apex Vehicle',
              vehicleYear: srv.vehicleYear || '2026',
              serviceType: srv.serviceType || 'General Maintenance',
              date: srv.scheduledDate || srv.date || '2026-08-12',
              time: srv.scheduledTime || srv.time || '09:00 AM',
              leadScore: 90,
              tier: 'ACTIVE_SERVICE_CLIENT',
              lastActivity: `Service Appointment: ${srv.serviceType}`,
              recommendedAction: 'Send digital inspection video & offer complimentary valet pickup.',
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (combinedLeads.length === 0) {
      combinedLeads = SEED_CUSTOMERS;
    }

    // De-duplicate leads by customerPhone or customerName
    const uniqueMap = new Map();
    combinedLeads.forEach((item) => {
      const key = `${item.customerName}-${item.customerPhone}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    setLeads(Array.from(uniqueMap.values()));
  };

  useEffect(() => {
    fetchLiveCustomers();
    window.addEventListener('storage', fetchLiveCustomers);
    const interval = setInterval(fetchLiveCustomers, 2000);
    return () => {
      window.removeEventListener('storage', fetchLiveCustomers);
      clearInterval(interval);
    };
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (activeFilter === 'TEST_DRIVE' && item.type !== 'TEST_DRIVE') return false;
      if (activeFilter === 'SERVICE' && item.type !== 'SERVICE') return false;
      if (activeFilter === 'HOT' && item.leadScore < 90) return false;

      if (
        searchQuery &&
        !item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [leads, activeFilter, searchQuery]);

  const totalLeadsCount = leads.length;
  const testDriveCount = leads.filter((l) => l.type === 'TEST_DRIVE').length;
  const serviceCount = leads.filter((l) => l.type === 'SERVICE').length;
  const hotLeadsCount = leads.filter((l) => l.leadScore >= 90).length;

  return (
    <div className="space-y-8 font-mono">
      {/* PAGE HEADER */}
      <div className="border-b border-[#3A3D42] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="amber">Live Synchronized CRM Intelligence</Badge>
          <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-3">
            <User className="w-8 h-8 text-[#F5A623]" /> Customer Pipeline & Lead Scoring
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time customer contact information synced dynamically from storefront Test Drives & Service Bookings.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/40">
          <span className="text-gray-400 text-[10px] uppercase block">Total CRM Leads</span>
          <span className="text-2xl font-extrabold text-[#E8ECF1]">{totalLeadsCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#F5A623]/40">
          <span className="text-[#F5A623] text-[10px] uppercase block font-bold">🏎️ Test Drive Clients</span>
          <span className="text-2xl font-extrabold text-[#F5A623]">{testDriveCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-amber-500/40">
          <span className="text-amber-400 text-[10px] uppercase block font-bold">🔧 Service Clients</span>
          <span className="text-2xl font-extrabold text-amber-400">{serviceCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-emerald-500/40">
          <span className="text-emerald-400 text-[10px] uppercase block font-bold">🔥 Hot Leads (&gt;90 Score)</span>
          <span className="text-2xl font-extrabold text-emerald-400">{hotLeadsCount}</span>
        </Card>
      </div>

      {/* FILTER TABS & SEARCH */}
      <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'ALL LEADS' },
              { id: 'TEST_DRIVE', label: '🏎️ TEST DRIVES' },
              { id: 'SERVICE', label: '🔧 SERVICE APPOINTMENTS' },
              { id: 'HOT', label: '🔥 HOT LEADS (>90)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-[10px] border uppercase font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#F5A623] text-[#0D0D0D] border-[#F5A623] shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                    : 'bg-[#0D0D0D] text-gray-300 border-[#52565E]/60 hover:border-[#F5A623]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search customer, phone, car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D0D0D] text-[#E8ECF1] px-3.5 py-2 rounded-[12px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
      </Card>

      {/* CRM CUSTOMER PIPELINE TABLE */}
      <Card hoverEffect={false} className="p-0 overflow-hidden bg-[#3A3D42]/60 border-[#52565E]/60 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0D0D0D] text-[#F5A623] uppercase border-b border-[#52565E]">
              <tr>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Applied Category & Vehicle</th>
                <th className="p-4">Appointment Date & Slot</th>
                <th className="p-4">AI Lead Score</th>
                <th className="p-4">AI Recommended Next Action</th>
                <th className="p-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#52565E]/40">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-xs">
                    No customer contact entries found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#3A3D42]/80 transition-colors">
                    {/* CUSTOMER NAME, PHONE, EMAIL */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#E8ECF1] text-sm block">{lead.customerName}</span>
                        <Badge variant={lead.type === 'TEST_DRIVE' ? 'amber' : 'blue'}>
                          {lead.type === 'TEST_DRIVE' ? 'TEST DRIVE' : 'SERVICE'}
                        </Badge>
                      </div>
                      <div className="text-gray-300 text-[11px] space-y-0.5">
                        <span className="block font-bold text-[#F5A623]">📞 {lead.customerPhone}</span>
                        <span className="block text-gray-400">✉️ {lead.customerEmail}</span>
                        {lead.customerAddress && (
                          <span className="block text-gray-400 text-[10px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#F5A623]" /> {lead.customerAddress}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* APPLIED CATEGORY & VEHICLE */}
                    <td className="p-4 space-y-1">
                      <span className="font-bold text-[#E8ECF1] text-xs block uppercase">
                        {lead.vehicleModel} ({lead.vehicleYear || '2026'})
                      </span>
                      <span className="text-[11px] text-gray-300 block">{lead.serviceType}</span>
                    </td>

                    {/* APPOINTMENT DATE & TIME */}
                    <td className="p-4 space-y-1">
                      <span className="text-[#F5A623] font-bold block text-xs">📅 {lead.date}</span>
                      <span className="text-gray-300 text-[11px] block">⏰ {lead.time}</span>
                    </td>

                    {/* AI LEAD SCORE */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#F5A623] animate-pulse" />
                        <span className="text-lg font-black text-[#F5A623]">{lead.leadScore}/100</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 uppercase font-bold block mt-0.5">
                        {lead.tier}
                      </span>
                    </td>

                    {/* AI RECOMMENDED NEXT ACTION */}
                    <td className="p-4 text-gray-300 italic text-[11px] leading-relaxed max-w-xs">
                      {lead.recommendedAction}
                    </td>

                    {/* QUICK CONTACT ACTIONS */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`tel:${lead.customerPhone}`}
                          title={`Call ${lead.customerName}`}
                          className="p-2.5 rounded-[10px] bg-[#0D0D0D] border border-[#F5A623]/60 text-[#F5A623] hover:bg-[#F5A623] hover:text-[#0D0D0D] transition-all shadow-md"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${lead.customerEmail}`}
                          title={`Email ${lead.customerName}`}
                          className="p-2.5 rounded-[10px] bg-[#0D0D0D] border border-[#52565E] text-[#E8ECF1] hover:bg-[#E8ECF1] hover:text-[#0D0D0D] transition-all shadow-md"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
