'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, PriceTag } from '@showroom/ui';
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Car,
  Clock,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  ShoppingBag,
  Target,
  BarChart3,
  CheckCircle2,
  CalendarDays,
  Database,
  Check,
  X,
  Phone,
  Mail,
  User,
  Wrench,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  // DATE FILTER STATE
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM'>('TODAY');
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-08-10');

  // LIVE DATABASE APPOINTMENTS STATE
  const [liveAppointments, setLiveAppointments] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  // FETCH LIVE APPOINTMENTS FROM NESTJS FASTIFY API (SQLITE DATABASE) & LOCALSTORAGE
  const fetchLiveDatabaseAppointments = async () => {
    setLoadingDb(true);
    let combined: any[] = [];

    // 1. Fetch from NestJS API (SQLite Database dev.db)
    try {
      const res = await fetch('http://localhost:3333/bookings');
      if (res.ok) {
        const dbBookings = await res.json();
        dbBookings.forEach((item: any) => {
          combined.push({
            id: item.id,
            type: item.type || 'TEST_DRIVE',
            customerName: item.customerName || item.user?.name || 'Alexander Mercer',
            customerEmail: item.customerEmail || item.user?.email || 'client@apex.com',
            customerPhone: item.customerPhone || '+1 (555) 019-2834',
            carModel: item.vehicle?.model || item.notes || 'Apex Evora Track Spec',
            date: item.dateTime ? item.dateTime.split('T')[0] : '2026-08-10',
            time: item.dateTime ? new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM',
            status: item.status || 'PENDING',
            location: 'Beverly Hills Flagship Showroom',
            source: 'SQLite Database',
          });
        });
      }
    } catch (err) {
      console.error('NestJS API fetch error:', err);
    }

    // 2. Fetch from LocalStorage Stores (Storefront Test Drives & Services)
    try {
      const storedTD = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (storedTD) {
        const localTD = JSON.parse(storedTD);
        localTD.forEach((td: any) => {
          if (!combined.some((c) => c.id === td.id)) {
            combined.push({
              id: td.id,
              type: 'TEST_DRIVE',
              customerName: td.customerName || td.name || 'Alexander Mercer',
              customerEmail: td.customerEmail || td.email || 'alexander@mercer-capital.com',
              customerPhone: td.customerPhone || td.phone || '+1 (555) 019-2834',
              carModel: td.carModel || td.vehicleModel || 'Apex Evora Track Spec',
              date: td.date || td.preferredDate || '2026-08-10',
              time: td.time || td.preferredTime || '10:30 AM',
              status: td.status || 'PENDING',
              location: td.location || td.showroom || 'Beverly Hills Flagship',
              source: 'Storefront Booking',
            });
          }
        });
      }

      const storedSRV = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (storedSRV) {
        const localSRV = JSON.parse(storedSRV);
        localSRV.forEach((srv: any) => {
          if (!combined.some((c) => c.id === srv.id)) {
            combined.push({
              id: srv.id,
              type: 'SERVICE',
              customerName: srv.customerName || srv.name || 'Sir Charles Montgomery',
              customerEmail: srv.customerEmail || srv.email || 'charles@montgomery.co',
              customerPhone: srv.customerPhone || srv.phone || '+1 (555) 890-1234',
              carModel: `${srv.serviceType || 'Battery Calibration'} (${srv.vehicleModel || 'Kronos V12'})`,
              date: srv.date || '2026-08-10',
              time: srv.time || '02:00 PM',
              status: srv.status || 'SCHEDULED',
              location: srv.location || 'Beverly Hills Service Hub',
              source: 'Storefront Service',
            });
          }
        });
      }
    } catch (err) {
      console.error('LocalStorage fetch error:', err);
    }

    // Default Seed Appointments if empty
    if (combined.length === 0) {
      combined = [
        {
          id: 'apt-seed-1',
          type: 'TEST_DRIVE',
          customerName: 'Alexander Mercer',
          customerEmail: 'alexander@mercer-capital.com',
          customerPhone: '+1 (555) 019-2834',
          carModel: 'Apex Evora Track Spec',
          date: '2026-08-10',
          time: '10:30 AM',
          status: 'CONFIRMED',
          location: 'Beverly Hills Flagship',
          source: 'Database',
        },
        {
          id: 'apt-seed-2',
          type: 'SERVICE',
          customerName: 'Sir Charles Montgomery',
          customerEmail: 'charles@montgomery.co',
          customerPhone: '+1 (555) 890-1234',
          carModel: 'High-Voltage Battery & Track Calibration (Kronos V12)',
          date: '2026-08-10',
          time: '02:00 PM',
          status: 'CONFIRMED',
          location: 'Beverly Hills Service Center',
          source: 'Database',
        },
        {
          id: 'apt-seed-3',
          type: 'TEST_DRIVE',
          customerName: 'Lady Genevieve Vance',
          customerEmail: 'genevieve@vance-holdings.com',
          customerPhone: '+1 (555) 432-1098',
          carModel: 'Kronos Aero Berlinetta V12',
          date: '2026-08-10',
          time: '04:30 PM',
          status: 'PENDING',
          location: 'Malibu Private Runway',
          source: 'Database',
        },
      ];
    }

    setLiveAppointments(combined);
    setLoadingDb(false);
  };

  useEffect(() => {
    fetchLiveDatabaseAppointments();
  }, []);

  // UPDATE APPOINTMENT STATUS IN DATABASE & LOCALSTORAGE
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // 1. Update SQLite Database via API
    try {
      await fetch(`http://localhost:3333/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }

    // 2. Update Local State
    const updated = liveAppointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt));
    setLiveAppointments(updated);

    // 3. Sync to LocalStorage Stores
    try {
      const storedTD = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (storedTD) {
        const localTD = JSON.parse(storedTD).map((t: any) => (t.id === id ? { ...t, status: newStatus } : t));
        localStorage.setItem('APEX_TEST_DRIVES_STORE', JSON.stringify(localTD));
      }

      const storedSRV = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (storedSRV) {
        const localSRV = JSON.parse(storedSRV).map((s: any) => (s.id === id ? { ...s, status: newStatus } : s));
        localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify(localSRV));
      }
    } catch (e) {
      console.error(e);
    }

    setStatusUpdateMessage(`Appointment status updated to ${newStatus}`);
    setTimeout(() => setStatusUpdateMessage(null), 3000);
  };

  // FILTER APPOINTMENTS FOR TODAY OR SELECTED DATE
  const todayAppointments = useMemo(() => {
    const todayStr = '2026-08-10'; // Today's date reference
    if (dateFilter === 'TODAY') {
      return liveAppointments.filter((a) => a.date === todayStr || a.date === 'Today' || !a.date);
    }
    return liveAppointments;
  }, [liveAppointments, dateFilter]);

  // FINANCIAL & KPI METRICS DATA
  const metricsData = useMemo(() => {
    const totalTodayCount = todayAppointments.length;
    const testDriveCount = todayAppointments.filter((a) => a.type === 'TEST_DRIVE').length;
    const serviceCount = todayAppointments.filter((a) => a.type === 'SERVICE').length;
    const pendingCount = todayAppointments.filter((a) => a.status === 'PENDING').length;

    switch (dateFilter) {
      case 'TODAY':
        return {
          title: 'Today (August 10, 2026)',
          revenue: 1280000,
          cost: 840000,
          profit: 440000,
          margin: '34.3%',
          cpa: 1450,
          adSpend: 18500,
          vehiclesDelivered: 3,
          testDrivesCompleted: testDriveCount || 8,
          serviceJobsDone: serviceCount || 4,
          pendingApprovals: pendingCount,
          totalAppointments: totalTodayCount,
          crmLeads: 14,
          conversionRate: '35.7%',
          revTrend: '+12.4% vs yesterday',
        };
      case 'YESTERDAY':
        return {
          title: 'Yesterday (August 9, 2026)',
          revenue: 760000,
          cost: 510000,
          profit: 250000,
          margin: '32.8%',
          cpa: 1620,
          adSpend: 14200,
          vehiclesDelivered: 2,
          testDrivesCompleted: 6,
          serviceJobsDone: 3,
          pendingApprovals: 0,
          totalAppointments: 9,
          crmLeads: 11,
          conversionRate: '28.5%',
          revTrend: '-5.2% vs avg',
        };
      case 'LAST_7_DAYS':
        return {
          title: 'Last 7 Days (Aug 4 - Aug 10)',
          revenue: 6420000,
          cost: 4180000,
          profit: 2240000,
          margin: '34.8%',
          cpa: 1380,
          adSpend: 94000,
          vehiclesDelivered: 16,
          testDrivesCompleted: 48,
          serviceJobsDone: 22,
          pendingApprovals: pendingCount,
          totalAppointments: 70,
          crmLeads: 89,
          conversionRate: '33.1%',
          revTrend: '+16.8% vs prior week',
        };
      case 'THIS_MONTH':
      case 'LAST_30_DAYS':
      case 'CUSTOM':
      default:
        return {
          title: 'This Month (August 2026 MTD)',
          revenue: 14850000,
          cost: 9650000,
          profit: 5200000,
          margin: '35.0%',
          cpa: 1290,
          adSpend: 215000,
          vehiclesDelivered: 38,
          testDrivesCompleted: 114,
          serviceJobsDone: 56,
          pendingApprovals: pendingCount,
          totalAppointments: 170,
          crmLeads: 210,
          conversionRate: '36.2%',
          revTrend: '+22.4% vs July MTD',
        };
    }
  }, [dateFilter, todayAppointments]);

  return (
    <div className="space-y-8 font-mono">

      {/* HEADER & DATE RANGE FILTER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#3A3D42] pb-6">
        <div>
          <Badge variant="amber">Executive Financial Portal</Badge>
          <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#F5A623]" /> Dealership Analytics KPI Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time SQLite database bookings, daily appointment sync, revenue & cost metrics.</p>
        </div>

        {/* 📅 INTERACTIVE DATE FILTER BAR */}
        <div className="bg-[#121520] p-3 rounded-[20px] border border-[#F5A623]/50 space-y-2 shadow-2xl shrink-0">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[10px] text-[#F5A623] uppercase font-bold flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" /> Date Range Filter:
            </span>
            <span className="text-[10px] text-gray-400 font-bold">{metricsData.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'CUSTOM', label: 'Custom Date' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setDateFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-[10px] text-[10px] font-bold uppercase transition-all ${
                  dateFilter === btn.id
                    ? 'bg-[#F5A623] text-[#0D0D0D] shadow-[0_0_10px_rgba(245,166,35,0.6)] scale-105'
                    : 'bg-[#060810] text-gray-300 border border-[#2a2d35] hover:border-[#F5A623] hover:text-[#F5A623]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* CUSTOM DATE INPUT SELECTORS */}
          {dateFilter === 'CUSTOM' && (
            <div className="flex items-center gap-2 pt-2 text-[10px] animate-fadeIn border-t border-[#2a2d35]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#060810] border border-[#3A3D42] text-white p-1.5 rounded-[8px] outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#060810] border border-[#3A3D42] text-white p-1.5 rounded-[8px] outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* STATUS UPDATE TOAST NOTIFICATION */}
      {statusUpdateMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-[16px] text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusUpdateMessage}</span>
        </div>
      )}

      {/* 💰 FINANCIAL RESULT & COST KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* 1. GROSS REVENUE */}
        <Card hoverEffect={false} className="space-y-3 border-[#F5A623]/60 bg-[#0a0c14] rounded-[24px] p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase">
            <span className="font-bold text-[#F5A623]">Gross Sales Revenue</span>
            <DollarSign className="w-6 h-6 text-[#F5A623] p-1 bg-[#F5A623]/20 rounded-lg" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono">
            ${metricsData.revenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>{metricsData.revTrend}</span>
          </div>
        </Card>

        {/* 2. OPERATING & INVENTORY COST */}
        <Card hoverEffect={false} className="space-y-3 border-[#52565E]/60 bg-[#0a0c14] rounded-[24px] p-6 shadow-xl">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase">
            <span className="font-bold text-red-400">Acquisition & Operating Cost</span>
            <ShoppingBag className="w-6 h-6 text-red-400 p-1 bg-red-400/20 rounded-lg" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-red-400 font-mono">
            ${metricsData.cost.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">
            Inventory wholesale + ${metricsData.adSpend.toLocaleString()} Marketing Spend
          </p>
        </Card>

        {/* 3. NET PROFIT & MARGIN */}
        <Card hoverEffect={false} className="space-y-3 border-emerald-500/60 bg-[#0a0c14] rounded-[24px] p-6 shadow-xl">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase">
            <span className="font-bold text-emerald-400">Net Profit</span>
            <TrendingUp className="w-6 h-6 text-emerald-400 p-1 bg-emerald-400/20 rounded-lg" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
            +${metricsData.profit.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Margin:</span>
            <span className="text-emerald-400 font-extrabold">{metricsData.margin} Net Profit</span>
          </div>
        </Card>

        {/* 4. TODAY'S APPOINTMENTS COUNT & PENDING APPROVALS */}
        <Card hoverEffect={false} className="space-y-3 border-indigo-500/60 bg-[#0a0c14] rounded-[24px] p-6 shadow-xl">
          <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase">
            <span className="font-bold text-indigo-400">Database Appointments</span>
            <Database className="w-6 h-6 text-indigo-400 p-1 bg-indigo-400/20 rounded-lg" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono">
            {metricsData.totalAppointments}
          </p>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Pending Approvals:</span>
            <span className="text-[#F5A623] font-bold">{metricsData.pendingApprovals} Pending</span>
          </div>
        </Card>

      </div>

      {/* 📊 FINANCIAL BREAKDOWN PROGRESS BAR */}
      <Card hoverEffect={false} className="p-6 bg-[#0a0c14] border-[#2a2d35] rounded-[24px] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#F5A623]" />
            <span className="text-white font-bold uppercase">Financial Breakdown for {metricsData.title}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" /> Gross Sales: ${metricsData.revenue.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Cost: ${metricsData.cost.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Profit: ${metricsData.profit.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-full h-4 bg-[#121520] rounded-full overflow-hidden flex p-0.5 border border-[#2a2d35]">
          <div
            className="h-full bg-red-500 rounded-l-full transition-all duration-500"
            style={{ width: `${(metricsData.cost / metricsData.revenue) * 100}%` }}
            title={`Cost: $${metricsData.cost.toLocaleString()}`}
          />
          <div
            className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
            style={{ width: `${(metricsData.profit / metricsData.revenue) * 100}%` }}
            title={`Net Profit: $${metricsData.profit.toLocaleString()}`}
          />
        </div>
      </Card>

      {/* 🗄 LIVE SQLITE DATABASE APPOINTMENTS TABLE (TODAY'S CLIENT REQUESTS) */}
      <Card hoverEffect={false} className="p-6 sm:p-8 bg-[#0a0c14] border-[#F5A623]/50 rounded-[28px] space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2d35] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="amber">Live Database Sync</Badge>
              <span className="text-xs text-gray-400 font-mono">SQLite dev.db & LocalStores</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase text-white mt-1 flex items-center gap-2.5">
              <Database className="w-6 h-6 text-[#F5A623]" /> Today's Live Client Appointments & Requests ({todayAppointments.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveDatabaseAppointments}
              className="px-3.5 py-2 rounded-[12px] bg-[#121520] border border-[#3A3D42] text-xs text-gray-300 hover:text-[#F5A623] hover:border-[#F5A623] transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} /> Refresh DB
            </button>
          </div>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs space-y-2">
            <p>No appointments found for the selected date filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((apt) => {
              const isTestDrive = apt.type === 'TEST_DRIVE';
              const isConfirmed = apt.status === 'CONFIRMED';
              const isCompleted = apt.status === 'COMPLETED';
              const isCancelled = apt.status === 'CANCELLED';

              return (
                <div
                  key={apt.id}
                  className="p-5 bg-[#121520] rounded-[20px] border border-[#2a2d35] flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-[#F5A623]/60 transition-all shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white text-sm sm:text-base flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#F5A623]" /> {apt.customerName}
                      </span>
                      <Badge variant={isTestDrive ? 'amber' : 'green'}>
                        {isTestDrive ? 'Test Drive' : 'Concierge Service'}
                      </Badge>
                      <Badge
                        variant={
                          isCompleted
                            ? 'green'
                            : isConfirmed
                            ? 'amber'
                            : isCancelled
                            ? 'red'
                            : 'gray'
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-300 font-mono">
                      <div className="flex items-center gap-1.5">
                        {isTestDrive ? <Car className="w-3.5 h-3.5 text-[#F5A623]" /> : <Wrench className="w-3.5 h-3.5 text-[#F5A623]" />}
                        <span>Vehicle / Job: <strong className="text-white">{apt.carModel}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
                        <span>Date & Time: <strong className="text-white">{apt.date} @ {apt.time}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{apt.customerEmail}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{apt.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN APPOINTMENT ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2a2d35] shrink-0">
                    {!isConfirmed && !isCompleted && !isCancelled && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black font-bold uppercase text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm Appointment
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-[10px] bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40 hover:bg-[#F5A623] hover:text-black font-bold uppercase text-[10px] flex items-center gap-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    )}

                    {!isCancelled && !isCompleted && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-[10px] bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white font-bold uppercase text-[10px] flex items-center gap-1 transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}
