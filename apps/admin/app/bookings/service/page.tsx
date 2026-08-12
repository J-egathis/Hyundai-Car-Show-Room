'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@showroom/ui';
import {
  Wrench,
  Car,
  Clock,
  User,
  Truck,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Search,
  Filter,
  Activity,
  ChevronRight,
  ShieldCheck,
  Plus,
  Trash2,
  CheckSquare,
} from 'lucide-react';

const SEED_SERVICE_ORDERS: any[] = [];

export default function AdminServiceBookingsPage() {
  const [serviceOrders, setServiceOrders] = useState<any[]>(SEED_SERVICE_ORDERS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // FETCH LIVE SERVICE ORDERS FROM API AND LOCALSTORAGE
  const fetchServiceOrders = async () => {
    let combined: any[] = [];
    try {
      const res = await fetch('http://localhost:3000/api/service-bookings');
      if (res.ok) {
        const apiData = await res.json();
        combined = [...apiData];
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (stored) {
        const localData = JSON.parse(stored);
        localData.forEach((item: any) => {
          const idx = combined.findIndex((c) => c.id === item.id);
          if (idx !== -1) {
            const apiStatus = combined[idx].status;
            const apiStage = combined[idx].stage;
            const apiProgress = combined[idx].progress;
            combined[idx] = {
              ...item,
              ...combined[idx],
              status: apiStatus || item.status,
              stage: apiStage || item.stage,
              progress: apiProgress ?? item.progress,
            };
          } else {
            combined.unshift(item);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    setServiceOrders(combined);
  };

  useEffect(() => {
    fetchServiceOrders();
    window.addEventListener('storage', fetchServiceOrders);
    const interval = setInterval(fetchServiceOrders, 2000);
    return () => {
      window.removeEventListener('storage', fetchServiceOrders);
      clearInterval(interval);
    };
  }, []);

  const updateServiceStatus = async (id: string, progress: number, stage: string, status: string) => {
    const updated = serviceOrders.map((s) =>
      s.id === id ? { ...s, progress, stage, status } : s
    );
    setServiceOrders(updated);

    try {
      const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      let localList: any[] = stored ? JSON.parse(stored) : [];
      const idx = localList.findIndex((item: any) => item.id === id);
      if (idx !== -1) {
        localList[idx] = { ...localList[idx], progress, stage, status };
      } else {
        const targetOrder = serviceOrders.find((s) => s.id === id);
        if (targetOrder) {
          localList.unshift({ ...targetOrder, progress, stage, status });
        }
      }
      localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify(localList));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }

    try {
      await fetch('http://localhost:3000/api/service-bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, progress, stage, status }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🗑️ SINGLE & BULK DELETE HANDLER
  const handleDeleteOrders = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${targetIds.length} service work order(s)?`)) return;

    setServiceOrders((prev) => prev.filter((item) => !targetIds.includes(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));

    try {
      const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.filter((s: any) => !targetIds.includes(s.id));
        localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error(err);
    }

    try {
      await fetch('http://localhost:3000/api/service-bookings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = useMemo(() => {
    return serviceOrders.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (
        searchQuery &&
        !item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [serviceOrders, statusFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalCount = serviceOrders.length;
  const pendingCount = serviceOrders.filter((s) => s.status === 'PENDING').length;
  const workingCount = serviceOrders.filter((s) => s.status === 'WORKING' || s.status === 'IN_PROGRESS').length;
  const readyCount = serviceOrders.filter((s) => s.status === 'READY').length;
  const completedCount = serviceOrders.filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 font-mono">
      {/* PAGE HEADER & SUB-NAVIGATION TABS */}
      <div className="space-y-4 border-b border-[#3A3D42] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="amber">Master Technician Service Console</Badge>
            <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-2">
              <Wrench className="w-8 h-8 text-[#F5A623]" /> Master Service Work Orders
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteOrders(selectedIds)}
                className="flex items-center gap-1.5 font-bold bg-red-950/80 text-red-400 border border-red-500/40 hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4" /> Bulk Delete ({selectedIds.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const name = prompt('Client Name:');
                const car = prompt('Vehicle Model:', 'Apex CyberSUV Ultra');
                const service = prompt('Service Description:', 'Full System Diagnostic & EV Calibration');
                if (name) {
                  const created = {
                    id: `SRV-${Math.floor(10000 + Math.random() * 90000)}`,
                    customerName: name,
                    customerPhone: '+1 (555) 019-2834',
                    customerAddress: 'Beverly Hills, CA',
                    vehicleModel: car || 'Apex CyberSUV Ultra',
                    vehicleYear: '2026',
                    serviceType: service || 'General Maintenance',
                    technician: 'Marcus Vance (Master Tech)',
                    progress: 10,
                    stage: 'Checked In',
                    pickupType: 'VALET_PICKUP',
                    scheduledDate: new Date().toISOString().split('T')[0],
                    scheduledTime: '10:00 AM',
                    status: 'PENDING',
                  };

                  try {
                    const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
                    const list = stored ? JSON.parse(stored) : [];
                    localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify([created, ...list]));
                    window.dispatchEvent(new Event('storage'));

                    await fetch('http://localhost:3000/api/service-bookings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(created),
                    });
                    fetchServiceOrders();
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
            >
              + Create Service Order
            </Button>
          </div>
        </div>

        {/* SUB-NAVIGATION TAB SWITCHER BETWEEN TEST DRIVE & SERVICE */}
        <div className="flex border-b border-[#52565E]/40 font-mono text-xs uppercase pt-2">
          <Link
            href="/bookings/test-drive"
            className="px-6 py-3 border-b-2 border-transparent text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Car className="w-4 h-4" /> 🏎️ Test Drive Appointments
          </Link>
          <Link
            href="/bookings/service"
            className="px-6 py-3 border-b-2 border-[#F5A623] text-[#F5A623] font-bold flex items-center gap-2 bg-[#3A3D42]/40 rounded-t-[12px]"
          >
            <Wrench className="w-4 h-4" /> 🔧 Service Appointments ({totalCount})
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/40">
          <span className="text-gray-400 text-[10px] uppercase block">Total Work Orders</span>
          <span className="text-2xl font-extrabold text-[#E8ECF1]">{totalCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#F5A623]/40">
          <span className="text-[#F5A623] text-[10px] uppercase block font-bold">Pending / Accepted</span>
          <span className="text-2xl font-extrabold text-[#F5A623]">{pendingCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-amber-500/40">
          <span className="text-amber-400 text-[10px] uppercase block font-bold">Service Working</span>
          <span className="text-2xl font-extrabold text-amber-400">{workingCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-emerald-500/40">
          <span className="text-emerald-400 text-[10px] uppercase block font-bold">Ready & Test Drive</span>
          <span className="text-2xl font-extrabold text-emerald-400">{readyCount + completedCount}</span>
        </Card>
      </div>

      {/* FILTER TABS & SEARCH */}
      <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs font-mono">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'ACCEPTED', 'WORKING', 'READY', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-[10px] border uppercase font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-[#F5A623] text-[#0D0D0D] border-[#F5A623] shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                    : 'bg-[#0D0D0D] text-gray-300 border-[#52565E]/60 hover:border-[#F5A623]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search client, car, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D0D0D] text-[#E8ECF1] px-3.5 py-2 rounded-[12px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
      </Card>

      {/* WORK ORDERS TABLE LIST WITH ACCEPT, WORKING, READY, TEST DRIVE ACTIONS */}
      <Card hoverEffect={false} className="p-0 overflow-hidden border-[#52565E]/60 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-[#0D0D0D] text-[#F5A623] uppercase border-b border-[#52565E]">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                  />
                </th>
                <th className="p-4">Work Order ID</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Vehicle & Service Required</th>
                <th className="p-4">Workflow Stage & Progress</th>
                <th className="p-4">Assigned Tech</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Workflow Stage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#52565E]/40">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No service work orders match your selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#F5A623]/10' : 'hover:bg-[#3A3D42]/80'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(order.id)}
                          className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                        />
                      </td>

                      <td className="p-4 font-bold text-[#E8ECF1]">{order.id}</td>

                      <td className="p-4">
                        <span className="font-bold text-[#E8ECF1] block">{order.customerName}</span>
                        <span className="text-[10px] text-[#F5A623] block">📞 {order.customerPhone}</span>
                        {order.pickupType === 'VALET_PICKUP' && (
                          <span className="text-[9px] text-amber-400 block mt-0.5">🚚 Valet Flatbed Service</span>
                        )}
                      </td>

                      <td className="p-4 space-y-0.5">
                        <span className="font-bold text-[#E8ECF1] block">{order.vehicleModel} ({order.vehicleYear})</span>
                        <span className="text-[11px] text-gray-300 block">{order.serviceType}</span>
                        <span className="text-[10px] text-gray-400 block">📅 {order.scheduledDate || order.date} ⏰ {order.scheduledTime || order.time}</span>
                      </td>

                      {/* WORKFLOW STAGE & PROGRESS */}
                      <td className="p-4 space-y-2 min-w-[200px]">
                        <div className="flex justify-between text-[10px] text-gray-300 font-bold">
                          <span>{order.stage || 'Checked In'}</span>
                          <span className="text-[#F5A623]">{order.progress || 10}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#0D0D0D] rounded-full overflow-hidden border border-[#52565E]">
                          <div
                            className="h-full bg-gradient-to-r from-[#F5A623] to-emerald-400 transition-all duration-500"
                            style={{ width: `${order.progress || 10}%` }}
                          />
                        </div>
                      </td>

                      <td className="p-4 text-gray-300 text-xs">
                        {order.technician}
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={
                            order.status === 'COMPLETED'
                              ? 'green'
                              : order.status === 'READY'
                              ? 'blue'
                              : order.status === 'WORKING' || order.status === 'IN_PROGRESS'
                              ? 'amber'
                              : 'titanium'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>

                      {/* 🛠️ SPECIFIC STAGE ACTIONS: ACCEPT -> WORKING -> READY -> TEST DRIVE */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. ACCEPT BUTTON */}
                          <button
                            onClick={() =>
                              updateServiceStatus(
                                order.id,
                                25,
                                'Order Accepted & Scheduled',
                                'ACCEPTED'
                              )
                            }
                            className={`px-2.5 py-1 rounded-[8px] border text-[10px] font-bold uppercase transition-all ${
                              order.status === 'ACCEPTED'
                                ? 'bg-amber-500 text-black border-amber-500'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/40'
                            }`}
                          >
                            Accept (25%)
                          </button>

                          {/* 2. WORKING BUTTON */}
                          <button
                            onClick={() =>
                              updateServiceStatus(
                                order.id,
                                50,
                                'Service & Tuning In Progress',
                                'WORKING'
                              )
                            }
                            className={`px-2.5 py-1 rounded-[8px] border text-[10px] font-bold uppercase transition-all ${
                              order.status === 'WORKING' || order.status === 'IN_PROGRESS'
                                ? 'bg-blue-500 text-black border-blue-500'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/40'
                            }`}
                          >
                            Working (50%)
                          </button>

                          {/* 3. READY BUTTON */}
                          <button
                            onClick={() =>
                              updateServiceStatus(
                                order.id,
                                75,
                                'Vehicle Serviced & Delivery Ready',
                                'READY'
                              )
                            }
                            className={`px-2.5 py-1 rounded-[8px] border text-[10px] font-bold uppercase transition-all ${
                              order.status === 'READY'
                                ? 'bg-emerald-500 text-black border-emerald-500'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/40'
                            }`}
                          >
                            Ready (75%)
                          </button>

                          {/* 4. TEST DRIVE BUTTON */}
                          <button
                            onClick={() =>
                              updateServiceStatus(
                                order.id,
                                100,
                                'Final Track Test Drive & Delivery Completed',
                                'COMPLETED'
                              )
                            }
                            className={`px-2.5 py-1 rounded-[8px] border text-[10px] font-bold uppercase transition-all ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-400 text-black border-emerald-400'
                                : 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-400/40'
                            }`}
                          >
                            🏎️ Test Drive (100%)
                          </button>

                          {/* DELETE ICON */}
                          <button
                            onClick={() => handleDeleteOrders([order.id])}
                            title="Delete Service Order"
                            className="p-1.5 rounded-[8px] bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900/80 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
