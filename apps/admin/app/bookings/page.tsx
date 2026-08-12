'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@showroom/ui';
import {
  Car,
  Wrench,
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  Filter,
} from 'lucide-react';

export default function AdminBookingsIndexPage() {
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);

  // CALENDAR DATE STATE (Defaults to current date)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TEST_DRIVE' | 'SERVICE'>('ALL');

  // FETCH LIVE BOOKINGS FROM APIs & LOCALSTORAGE
  const fetchAllAppointments = async () => {
    // 1. Test Drives
    let combinedTD: any[] = [];
    try {
      let resTD = await fetch('/api/bookings');
      if (!resTD.ok) {
        resTD = await fetch('http://localhost:3000/api/bookings');
      }
      if (resTD.ok) combinedTD = await resTD.json();
    } catch (err) {
      console.error(err);
    }
    try {
      const storedTD = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (storedTD) {
        const localTD = JSON.parse(storedTD);
        localTD.forEach((item: any) => {
          const idx = combinedTD.findIndex((c) => c.id === item.id);
          if (idx !== -1) combinedTD[idx].status = item.status || combinedTD[idx].status;
          else combinedTD.unshift(item);
        });
      }
    } catch (err) {
      console.error(err);
    }
    setTestDrives(combinedTD);

    // 2. Service Orders
    let combinedSRV: any[] = [];
    try {
      let resSRV = await fetch('/api/service-bookings');
      if (!resSRV.ok) {
        resSRV = await fetch('http://localhost:3000/api/service-bookings');
      }
      if (resSRV.ok) combinedSRV = await resSRV.json();
    } catch (err) {
      console.error(err);
    }
    try {
      const storedSRV = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (storedSRV) {
        const localSRV = JSON.parse(storedSRV);
        localSRV.forEach((item: any) => {
          const idx = combinedSRV.findIndex((c) => c.id === item.id);
          if (idx !== -1) {
            combinedSRV[idx] = {
              ...item,
              ...combinedSRV[idx],
              status: combinedSRV[idx].status || item.status,
              stage: combinedSRV[idx].stage || item.stage,
              progress: combinedSRV[idx].progress ?? item.progress,
            };
          } else combinedSRV.unshift(item);
        });
      }
    } catch (err) {
      console.error(err);
    }
    setServiceOrders(combinedSRV);
  };

  useEffect(() => {
    fetchAllAppointments();
    window.addEventListener('storage', fetchAllAppointments);
    const interval = setInterval(fetchAllAppointments, 2000);
    return () => {
      window.removeEventListener('storage', fetchAllAppointments);
      clearInterval(interval);
    };
  }, []);

  // COMPUTED CALENDAR GRID DAYS FOR CURRENT MONTH
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArr: Array<{ dateStr: string; dayNum: number | null; isCurrentMonth: boolean }> = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      daysArr.push({ dateStr: '', dayNum: null, isCurrentMonth: false });
    }

    // Days of month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      daysArr.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    return daysArr;
  }, [currentDate]);

  // MAP APPOINTMENTS BY DATE STRING YYYY-MM-DD
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, { testDrives: any[]; serviceOrders: any[] }> = {};

    testDrives.forEach((td) => {
      const dateKey = td.date;
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = { testDrives: [], serviceOrders: [] };
      map[dateKey].testDrives.push(td);
    });

    serviceOrders.forEach((srv) => {
      const dateKey = srv.scheduledDate || srv.date;
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = { testDrives: [], serviceOrders: [] };
      map[dateKey].serviceOrders.push(srv);
    });

    return map;
  }, [testDrives, serviceOrders]);

  // APPOINTMENTS FOR SELECTED DATE
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDateStr) return { testDrives: [], serviceOrders: [] };
    return appointmentsByDate[selectedDateStr] || { testDrives: [], serviceOrders: [] };
  }, [selectedDateStr, appointmentsByDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-8 font-mono">
      {/* PAGE HEADER & SUB-NAV TABS */}
      <div className="space-y-4 border-b border-[#3A3D42] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="amber">Live Dealership Calendar Console</Badge>
            <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#F5A623]" /> Master Booking Calendar
            </h1>
          </div>

          <div className="flex gap-2">
            <Link href="/bookings/test-drive">
              <Button variant="outline" size="sm">
                🏎️ Test Drives ({testDrives.length})
              </Button>
            </Link>
            <Link href="/bookings/service">
              <Button variant="outline" size="sm">
                🔧 Service Orders ({serviceOrders.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* SUB-NAVIGATION TAB SWITCHER */}
        <div className="flex border-b border-[#52565E]/40 font-mono text-xs uppercase pt-2">
          <Link
            href="/bookings"
            className="px-6 py-3 border-b-2 border-[#F5A623] text-[#F5A623] font-bold flex items-center gap-2 bg-[#3A3D42]/40 rounded-t-[12px]"
          >
            <CalendarIcon className="w-4 h-4" /> 📅 Calendar View
          </Link>
          <Link
            href="/bookings/test-drive"
            className="px-6 py-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Car className="w-4 h-4" /> 🏎️ Test Drives
          </Link>
          <Link
            href="/bookings/service"
            className="px-6 py-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Wrench className="w-4 h-4" /> 🔧 Service Orders
          </Link>
        </div>
      </div>

      {/* MONTH CONTROL BANNER & FILTER */}
      <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/60 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-[10px] bg-[#0D0D0D] text-gray-300 border border-[#52565E] hover:border-[#F5A623]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-extrabold text-[#E8ECF1] uppercase min-w-[200px] text-center">
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-[10px] bg-[#0D0D0D] text-gray-300 border border-[#52565E] hover:border-[#F5A623]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* TYPE FILTER BUTTONS */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-[8px] border uppercase font-bold transition-all ${
              typeFilter === 'ALL'
                ? 'bg-[#F5A623] text-[#0D0D0D] border-[#F5A623]'
                : 'bg-[#0D0D0D] text-gray-300 border-[#52565E]'
            }`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setTypeFilter('TEST_DRIVE')}
            className={`px-3 py-1.5 rounded-[8px] border uppercase font-bold transition-all ${
              typeFilter === 'TEST_DRIVE'
                ? 'bg-amber-500 text-[#0D0D0D] border-amber-500'
                : 'bg-[#0D0D0D] text-amber-400 border-[#52565E]'
            }`}
          >
            🏎️ Test Drives
          </button>
          <button
            onClick={() => setTypeFilter('SERVICE')}
            className={`px-3 py-1.5 rounded-[8px] border uppercase font-bold transition-all ${
              typeFilter === 'SERVICE'
                ? 'bg-blue-500 text-[#0D0D0D] border-blue-500'
                : 'bg-[#0D0D0D] text-blue-400 border-[#52565E]'
            }`}
          >
            🔧 Service
          </button>
        </div>
      </Card>

      {/* 📅 MAIN INTERACTIVE CALENDAR GRID */}
      <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/60 shadow-2xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#F5A623] uppercase pb-3 border-b border-[#52565E]/40">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 gap-2 pt-3">
          {calendarDays.map((cell, idx) => {
            if (!cell.dayNum) {
              return <div key={idx} className="h-28 bg-black/20 rounded-[10px]" />;
            }

            const appts = appointmentsByDate[cell.dateStr] || { testDrives: [], serviceOrders: [] };
            const tdList = appts.testDrives;
            const srvList = appts.serviceOrders;
            const hasAppts = tdList.length > 0 || srvList.length > 0;
            const isSelected = selectedDateStr === cell.dateStr;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`h-28 p-2 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                  isSelected
                    ? 'border-[#F5A623] bg-[#F5A623]/10 shadow-[0_0_15px_rgba(245,166,35,0.3)] ring-1 ring-[#F5A623]'
                    : hasAppts
                    ? 'bg-[#0D0D0D] border-[#52565E] hover:border-[#F5A623]'
                    : 'bg-[#0D0D0D]/60 border-[#52565E]/40 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-extrabold ${hasAppts ? 'text-[#E8ECF1]' : 'text-gray-500'}`}>
                    {cell.dayNum}
                  </span>
                  {hasAppts && (
                    <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
                  )}
                </div>

                {/* Badges inside Cell */}
                <div className="space-y-1 overflow-y-auto max-h-20 text-[9px] font-mono">
                  {(typeFilter === 'ALL' || typeFilter === 'TEST_DRIVE') &&
                    tdList.map((td) => (
                      <div
                        key={td.id}
                        className="bg-amber-950/80 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded-[4px] truncate"
                      >
                        🏎️ {td.vehicleModel} ({td.time})
                      </div>
                    ))}

                  {(typeFilter === 'ALL' || typeFilter === 'SERVICE') &&
                    srvList.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-blue-950/80 border border-blue-500/40 text-blue-300 px-1.5 py-0.5 rounded-[4px] truncate"
                      >
                        🔧 {srv.vehicleModel} ({srv.stage || 'Service'})
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 📋 SELECTED DATE APPOINTMENTS DETAIL DRAWER */}
      {selectedDateStr && (
        <Card hoverEffect={false} className="p-6 bg-[#0D0D0D] border-[#F5A623] space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-[#52565E]/60 pb-3">
            <h3 className="text-base font-extrabold uppercase text-[#E8ECF1] flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#F5A623]" /> Appointments for {selectedDateStr}
            </h3>
            <button
              onClick={() => setSelectedDateStr('')}
              className="text-xs text-gray-400 hover:text-white uppercase font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Drives for Selected Date */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#F5A623] uppercase flex items-center gap-1.5 border-b border-[#52565E]/40 pb-2">
                <Car className="w-4 h-4" /> Test Drive Appointments ({selectedDateAppointments.testDrives.length})
              </h4>

              {selectedDateAppointments.testDrives.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 italic">No test drive appointments on this date.</p>
              ) : (
                selectedDateAppointments.testDrives.map((td) => (
                  <div key={td.id} className="p-4 bg-[#3A3D42]/60 rounded-[12px] border border-[#52565E]/60 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-[#F5A623] font-bold">ID: {td.id}</span>
                        <h5 className="font-extrabold text-[#E8ECF1] uppercase">{td.vehicleModel}</h5>
                      </div>
                      <Badge variant={td.status === 'CONFIRMED' ? 'green' : 'amber'}>{td.status}</Badge>
                    </div>

                    <div className="text-gray-300 space-y-1 text-[11px]">
                      <div>👤 Client: <strong className="text-[#E8ECF1]">{td.customerName}</strong></div>
                      <div>📞 Phone: <span className="text-[#F5A623]">{td.customerPhone}</span></div>
                      <div>⏰ Slot: <strong className="text-[#E8ECF1]">{td.time}</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Service Appointments for Selected Date */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5 border-b border-[#52565E]/40 pb-2">
                <Wrench className="w-4 h-4" /> Service Appointments ({selectedDateAppointments.serviceOrders.length})
              </h4>

              {selectedDateAppointments.serviceOrders.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 italic">No service appointments on this date.</p>
              ) : (
                selectedDateAppointments.serviceOrders.map((srv) => (
                  <div key={srv.id} className="p-4 bg-[#3A3D42]/60 rounded-[12px] border border-[#52565E]/60 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-blue-400 font-bold">Work Order: {srv.id}</span>
                        <h5 className="font-extrabold text-[#E8ECF1] uppercase">{srv.vehicleModel}</h5>
                      </div>
                      <Badge variant={srv.status === 'COMPLETED' ? 'green' : 'amber'}>{srv.status}</Badge>
                    </div>

                    <div className="text-gray-300 space-y-1 text-[11px]">
                      <div>👤 Client: <strong className="text-[#E8ECF1]">{srv.customerName}</strong></div>
                      <div>🔧 Service: <span className="text-gray-300">{srv.serviceType}</span></div>
                      <div>⏰ Slot: <strong className="text-[#E8ECF1]">{srv.scheduledTime || srv.time}</strong></div>
                      <div>📊 Stage: <span className="text-[#F5A623]">{srv.stage} ({srv.progress}%)</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
