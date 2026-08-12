'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@showroom/ui';
import {
  Calendar,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  User,
  Search,
  Filter,
  Wrench,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';

export default function AdminTestDriveBookingsPage() {
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // FETCH LIVE BOOKINGS FROM STOREFRONT persistent API & SQLite API
  const fetchBookings = async () => {
    let combined: any[] = [];
    try {
      let res = await fetch('http://localhost:3000/api/bookings');
      if (res.ok) {
        const data = await res.json();
        combined = [...data];
      }
    } catch (err) {
      console.error('Failed to fetch live bookings from storefront API:', err);
    }

    try {
      let res2 = await fetch('http://localhost:3333/bookings');
      if (res2.ok) {
        const dbData = await res2.json();
        dbData.forEach((dbItem: any) => {
          const idx = combined.findIndex((c) => c.id === dbItem.id);
          if (idx !== -1) {
            combined[idx].status = dbItem.status || combined[idx].status;
          } else {
            combined.unshift({
              id: dbItem.id,
              customerName: dbItem.customerName,
              customerEmail: dbItem.customerEmail,
              customerPhone: dbItem.customerPhone,
              vehicleModel: dbItem.vehicle?.model || dbItem.notes || 'Apex CyberSUV Ultra',
              vehicleYear: 2026,
              date: dbItem.dateTime ? dbItem.dateTime.split('T')[0] : '2026-08-11',
              time: '10:30 AM',
              locationType: 'SHOWROOM_TRACK',
              address: 'Flagship Showroom Track',
              status: dbItem.status || 'PENDING',
              notes: dbItem.notes || '',
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const stored = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (stored) {
        const localList = JSON.parse(stored);
        localList.forEach((item: any) => {
          const idx = combined.findIndex((c) => c.id === item.id);
          if (idx !== -1) {
            combined[idx].status = item.status || combined[idx].status;
          } else {
            combined.unshift(item);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    setTestDrives(combined);
  };

  useEffect(() => {
    fetchBookings();
    window.addEventListener('storage', fetchBookings);
    const interval = setInterval(fetchBookings, 2000);
    return () => {
      window.removeEventListener('storage', fetchBookings);
      clearInterval(interval);
    };
  }, []);

  // ⚡ UPDATE STATUS IN BOTH STOREFRONT PERSISTENT FILE & SQLITE DATABASE
  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setTestDrives((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    // 1. Update Storefront API persistent JSON (.test_drives.json)
    try {
      await fetch('http://localhost:3000/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }

    // 2. Update NestJS SQLite Database via API
    try {
      await fetch(`http://localhost:3333/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }

    // 3. Update Local Storage
    try {
      const stored = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((b: any) => (b.id === id ? { ...b, status: newStatus } : b));
        localStorage.setItem('APEX_TEST_DRIVES_STORE', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🗑️ SINGLE & BULK DELETE HANDLER
  const handleDeleteBookings = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${targetIds.length} test drive appointment(s)?`)) return;

    setTestDrives((prev) => prev.filter((item) => !targetIds.includes(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));

    try {
      const stored = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.filter((b: any) => !targetIds.includes(b.id));
        localStorage.setItem('APEX_TEST_DRIVES_STORE', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
    }

    try {
      await fetch('http://localhost:3000/api/bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDrives = useMemo(() => {
    return testDrives.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (
        searchQuery &&
        !item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.customerPhone.includes(searchQuery)
      ) {
        return false;
      }
      return true;
    });
  }, [testDrives, statusFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDrives.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDrives.map((d) => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalCount = testDrives.length;
  const pendingCount = testDrives.filter((d) => d.status === 'PENDING').length;
  const confirmedCount = testDrives.filter((d) => d.status === 'CONFIRMED').length;
  const completedCount = testDrives.filter((d) => d.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 font-mono">
      {/* PAGE HEADER & SUB-NAVIGATION TABS */}
      <div className="space-y-4 border-b border-[#3A3D42] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="amber">Live Synchronized Concierge</Badge>
            <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-2">
              <Car className="w-8 h-8 text-[#F5A623]" /> Test Drive Appointments
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteBookings(selectedIds)}
                className="flex items-center gap-1.5 font-bold bg-red-950/80 text-red-400 border border-red-500/40 hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4" /> Bulk Delete ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* SUB-NAVIGATION TAB SWITCHER */}
        <div className="flex border-b border-[#52565E]/40 font-mono text-xs uppercase pt-2">
          <Link
            href="/bookings"
            className="px-6 py-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4" /> 📅 Calendar View
          </Link>
          <Link
            href="/bookings/test-drive"
            className="px-6 py-3 border-b-2 border-[#F5A623] text-[#F5A623] font-bold flex items-center gap-2 bg-[#3A3D42]/40 rounded-t-[12px]"
          >
            <Car className="w-4 h-4 text-[#F5A623]" /> 🏎️ Test Drive Requests
          </Link>
          <Link
            href="/bookings/service"
            className="px-6 py-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Wrench className="w-4 h-4" /> 🔧 Service Orders
          </Link>
        </div>
      </div>

      {/* KPI METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverEffect={false} className="space-y-1 border-[#52565E]/40 bg-[#3A3D42]/60">
          <p className="text-[10px] text-gray-400 uppercase font-mono">Total Test Drives</p>
          <p className="text-3xl font-black text-white font-mono">{totalCount}</p>
        </Card>
        <Card hoverEffect={false} className="space-y-1 border-[#F5A623]/60 bg-[#3A3D42]/60">
          <p className="text-[10px] text-[#F5A623] uppercase font-mono">Pending Concierge</p>
          <p className="text-3xl font-black text-[#F5A623] font-mono">{pendingCount}</p>
        </Card>
        <Card hoverEffect={false} className="space-y-1 border-emerald-500/40 bg-[#3A3D42]/60">
          <p className="text-[10px] text-emerald-400 uppercase font-mono">Confirmed Scheduled</p>
          <p className="text-3xl font-black text-emerald-400 font-mono">{confirmedCount}</p>
        </Card>
        <Card hoverEffect={false} className="space-y-1 border-indigo-500/40 bg-[#3A3D42]/60">
          <p className="text-[10px] text-indigo-400 uppercase font-mono">Completed Drives</p>
          <p className="text-3xl font-black text-indigo-400 font-mono">{completedCount}</p>
        </Card>
      </div>

      {/* CONTROLS: FILTER BAR & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#3A3D42]/40 rounded-[16px] border border-[#52565E]/40">
        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase transition-all ${
                statusFilter === st
                  ? 'bg-[#F5A623] text-[#0D0D0D] shadow-md scale-105'
                  : 'bg-[#0D0D0D] text-gray-300 hover:text-white border border-[#52565E]/40'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client or car model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D0D] text-white text-xs pl-9 pr-4 py-2 rounded-[10px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
          />
        </div>
      </div>

      {/* DATA TABLE VIEW */}
      <Card hoverEffect={false} className="p-0 overflow-hidden border-[#52565E]/60 bg-[#0D0D0D]/90">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#3A3D42]/80 text-[#F5A623] uppercase text-[10px] tracking-wider border-b border-[#52565E]/60">
              <tr>
                <th className="p-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="focus:outline-none">
                    {selectedIds.length > 0 && selectedIds.length === filteredDrives.length ? (
                      <CheckSquare className="w-4 h-4 text-[#F5A623]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="p-4">Appt ID</th>
                <th className="p-4">Client Contact</th>
                <th className="p-4">Requested Vehicle</th>
                <th className="p-4">Date & Time Slot</th>
                <th className="p-4">Location & Delivery</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions & Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#52565E]/40 text-gray-300">
              {filteredDrives.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 text-xs">
                    No test drive requests found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDrives.map((drive) => {
                  const isSelected = selectedIds.includes(drive.id);
                  return (
                    <tr
                      key={drive.id}
                      className={`hover:bg-[#3A3D42]/30 transition-colors ${
                        isSelected ? 'bg-[#F5A623]/10' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <button onClick={() => toggleSelectOne(drive.id)} className="focus:outline-none">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#F5A623]" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-white uppercase">{drive.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white">{drive.customerName}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#F5A623]" /> {drive.customerPhone}
                          </p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" /> {drive.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#F5A623]">{drive.vehicleModel}</p>
                        <p className="text-[10px] text-gray-400">Year {drive.vehicleYear || 2026}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {drive.date}
                        </p>
                        <p className="text-[10px] text-[#F5A623] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {drive.time}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge variant="gray">
                          {drive.locationType || 'SHOWROOM TRACK'}
                        </Badge>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {drive.address || 'Flagship Showroom Track'}
                        </p>
                      </td>
                      <td className="p-4">
                        {/* SELECTABLE STATUS DROPDOWN & BADGE */}
                        <select
                          value={drive.status || 'PENDING'}
                          onChange={(e) => updateStatus(drive.id, e.target.value)}
                          className={`bg-[#0D0D0D] border rounded-[8px] px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer ${
                            drive.status === 'CONFIRMED'
                              ? 'text-[#F5A623] border-[#F5A623]'
                              : drive.status === 'COMPLETED'
                              ? 'text-emerald-400 border-emerald-500'
                              : drive.status === 'CANCELLED'
                              ? 'text-red-400 border-red-500'
                              : 'text-gray-300 border-gray-600'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteBookings([drive.id])}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-[8px] hover:bg-red-500/10"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
