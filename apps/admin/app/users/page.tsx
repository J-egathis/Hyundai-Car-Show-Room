'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@showroom/ui';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Globe,
  Clock,
  Laptop,
  CheckCircle2,
  Lock,
  Search,
  Activity,
  LogOut,
  Mail,
  Phone,
  Key,
  Trash2,
  Car,
  Wrench,
  Calendar,
  Filter,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [sectionTab, setSectionTab] = useState<'ALL' | 'TEST_DRIVE' | 'SERVICE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // DYNAMICALLY FETCH ALL USER RECORDS FROM TEST DRIVES, SERVICE BOOKINGS & LOCALSTORAGE
  const fetchAllUsersFromBookings = async () => {
    const userMap = new Map<string, any>();

    // 1. Fetch Test Drive Bookings
    try {
      let resTD = await fetch('/api/bookings');
      if (!resTD.ok) resTD = await fetch('http://localhost:3000/api/bookings');
      if (resTD.ok) {
        const testDrives = await resTD.json();
        testDrives.forEach((td: any) => {
          const key = `TD_${(td.customerEmail || td.customerPhone || td.customerName || td.id).toLowerCase().trim()}`;
          userMap.set(key, {
            id: `USR-${td.id}`,
            bookingId: td.id,
            name: td.customerName || 'Test Drive Client',
            email: td.customerEmail || 'client@showroom.com',
            phone: td.customerPhone || 'N/A',
            role: 'CUSTOMER',
            type: 'TEST_DRIVE',
            tier: '🏎️ Test Drive Client',
            status: td.status === 'CONFIRMED' ? 'ONLINE' : 'ACTIVE',
            loginTime: `Appt Date: ${td.date}`,
            lastActive: `🏎️ ${td.vehicleModel} @ ${td.time}`,
            device: `Appt ID: ${td.id}`,
            ipAddress: 'Storefront Track Session',
            vehicleModel: td.vehicleModel,
            date: td.date,
            time: td.time,
            notes: td.notes || '',
            bookingStatus: td.status || 'PENDING',
          });
        });
      }
    } catch (err) {
      console.error('Error fetching test drives for user management:', err);
    }

    // 2. Fetch Service Bookings
    try {
      let resSRV = await fetch('/api/service-bookings');
      if (!resSRV.ok) resSRV = await fetch('http://localhost:3000/api/service-bookings');
      if (resSRV.ok) {
        const serviceOrders = await resSRV.json();
        serviceOrders.forEach((srv: any) => {
          const key = `SRV_${(srv.customerPhone || srv.customerName || srv.id).toLowerCase().trim()}`;
          userMap.set(key, {
            id: `USR-${srv.id}`,
            bookingId: srv.id,
            name: srv.customerName || 'Service Client',
            email: srv.customerEmail || 'service.client@showroom.com',
            phone: srv.customerPhone || 'N/A',
            role: 'CUSTOMER',
            type: 'SERVICE',
            tier: '🔧 Service Client',
            status: srv.status === 'IN_PROGRESS' ? 'ONLINE' : 'ACTIVE',
            loginTime: `Appt Date: ${srv.scheduledDate || srv.date}`,
            lastActive: `🔧 ${srv.vehicleModel} (${srv.serviceType || 'Maintenance'})`,
            device: `Work Order: ${srv.id}`,
            ipAddress: 'Service Bay Session',
            vehicleModel: srv.vehicleModel,
            serviceType: srv.serviceType,
            date: srv.scheduledDate || srv.date,
            time: srv.scheduledTime || srv.time,
            bookingStatus: srv.status || 'PENDING',
          });
        });
      }
    } catch (err) {
      console.error('Error fetching service orders for user management:', err);
    }

    // 3. Check localStorage
    try {
      const storedSession = localStorage.getItem('APEX_USER_SESSION');
      if (storedSession) {
        const userObj = JSON.parse(storedSession);
        const key = `SESSION_${(userObj.email || userObj.phone || userObj.name).toLowerCase().trim()}`;
        if (!userMap.has(key)) {
          userMap.set(key, {
            id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: userObj.name || 'Storefront Customer',
            email: userObj.email || 'user@showroom.com',
            phone: userObj.phone || 'N/A',
            role: 'CUSTOMER',
            type: 'SESSION',
            tier: 'Active Web Session',
            status: 'ONLINE',
            loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastActive: 'Active Now (Storefront)',
            device: 'Browser Web Session',
            ipAddress: '127.0.0.1 (Localhost)',
            vehicleModel: 'Browsing Showroom',
            date: new Date().toISOString().split('T')[0],
            time: 'Live Now',
            bookingStatus: 'ACTIVE',
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    setUsers(Array.from(userMap.values()));
  };

  useEffect(() => {
    fetchAllUsersFromBookings();
    window.addEventListener('storage', fetchAllUsersFromBookings);
    const interval = setInterval(fetchAllUsersFromBookings, 2500);
    return () => {
      window.removeEventListener('storage', fetchAllUsersFromBookings);
      clearInterval(interval);
    };
  }, []);

  const handleForceLogout = (userName: string, userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'OFFLINE', lastActive: 'Session Terminated' } : u))
    );
    setToastMessage(`Logged out user session for ${userName}`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 🗑️ DELETE USER ACCOUNTS & BOOKINGS
  const handleDeleteUsers = async (targetIds: string[]) => {
    if (targetIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${targetIds.length} user account(s)?`)) return;

    setUsers((prev) => prev.filter((u) => !targetIds.includes(u.id)));
    setSelectedUserIds((prev) => prev.filter((id) => !targetIds.includes(id)));
    setToastMessage(`Successfully deleted ${targetIds.length} user record(s)`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // SEPARATED USERS BY SECTION
  const testDriveUsers = useMemo(() => {
    return users.filter((u) => u.type === 'TEST_DRIVE' && matchesSearch(u, searchQuery));
  }, [users, searchQuery]);

  const serviceUsers = useMemo(() => {
    return users.filter((u) => u.type === 'SERVICE' && matchesSearch(u, searchQuery));
  }, [users, searchQuery]);

  const otherUsers = useMemo(() => {
    return users.filter((u) => u.type === 'SESSION' && matchesSearch(u, searchQuery));
  }, [users, searchQuery]);

  function matchesSearch(u: any, query: string) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.vehicleModel && u.vehicleModel.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  }

  return (
    <div className="space-y-8 font-mono">
      {/* PAGE HEADER */}
      <div className="border-b border-[#3A3D42] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="amber">Live Customer Console</Badge>
          <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-[#F5A623]" /> User Management & Appointment Sessions
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organized sections showing active Test Drive clients, Service Appointment clients, and web sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedUserIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteUsers(selectedUserIds)}
              className="flex items-center gap-1.5 font-bold bg-red-950/80 text-red-400 border border-red-500/40 hover:bg-red-900"
            >
              <Trash2 className="w-4 h-4" /> Bulk Delete Users ({selectedUserIds.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const name = prompt('Enter User Name:');
              const email = prompt('Enter User Email:');
              if (name && email) {
                const newUser = {
                  id: `USR-TD-${Math.floor(1000 + Math.random() * 9000)}`,
                  name,
                  email,
                  phone: '+1 (555) 123-4567',
                  role: 'CUSTOMER',
                  type: 'TEST_DRIVE',
                  tier: '🏎️ Test Drive Client',
                  status: 'ONLINE',
                  loginTime: 'Just Now',
                  lastActive: 'Active Now',
                  device: 'Manual Entry',
                  ipAddress: '192.168.1.155',
                  vehicleModel: 'Apex Hypercar',
                  date: new Date().toISOString().split('T')[0],
                  time: '10:00 AM',
                  bookingStatus: 'CONFIRMED',
                };
                setUsers([newUser, ...users]);
              }
            }}
          >
            + Add Customer Record
          </Button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-amber-950/60 border border-[#F5A623] text-[#F5A623] rounded-[12px] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* KPI METRICS SECTION COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/40">
          <span className="text-gray-400 text-[10px] uppercase block">Total Active User Records</span>
          <span className="text-2xl font-extrabold text-[#E8ECF1]">{users.length}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#F5A623]/40">
          <span className="text-[#F5A623] text-[10px] uppercase block font-bold">🏎️ Test Drive Users</span>
          <span className="text-2xl font-extrabold text-[#F5A623]">{testDriveUsers.length}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-blue-500/40">
          <span className="text-blue-400 text-[10px] uppercase block font-bold">🔧 Service Appointment Users</span>
          <span className="text-2xl font-extrabold text-blue-400">{serviceUsers.length}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-emerald-500/40">
          <span className="text-emerald-400 text-[10px] uppercase block font-bold">🟢 Active Sessions</span>
          <span className="text-2xl font-extrabold text-emerald-400">{users.filter((u) => u.status === 'ONLINE').length}</span>
        </Card>
      </div>

      {/* SECTION TABS & SEARCH */}
      <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSectionTab('ALL')}
              className={`px-4 py-2 rounded-[10px] border uppercase font-bold transition-all ${
                sectionTab === 'ALL'
                  ? 'bg-[#F5A623] text-[#0D0D0D] border-[#F5A623] shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                  : 'bg-[#0D0D0D] text-gray-300 border-[#52565E]/60 hover:border-[#F5A623]'
              }`}
            >
              All Sections ({users.length})
            </button>

            <button
              onClick={() => setSectionTab('TEST_DRIVE')}
              className={`px-4 py-2 rounded-[10px] border uppercase font-bold transition-all ${
                sectionTab === 'TEST_DRIVE'
                  ? 'bg-amber-500 text-[#0D0D0D] border-amber-500 shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                  : 'bg-[#0D0D0D] text-amber-400 border-[#52565E]/60 hover:border-amber-400'
              }`}
            >
              🏎️ Test Drive Appointments ({testDriveUsers.length})
            </button>

            <button
              onClick={() => setSectionTab('SERVICE')}
              className={`px-4 py-2 rounded-[10px] border uppercase font-bold transition-all ${
                sectionTab === 'SERVICE'
                  ? 'bg-blue-500 text-[#0D0D0D] border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  : 'bg-[#0D0D0D] text-blue-400 border-[#52565E]/60 hover:border-blue-400'
              }`}
            >
              🔧 Service Appointments ({serviceUsers.length})
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search user, email, phone, car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D0D0D] text-[#E8ECF1] px-3.5 py-2 rounded-[12px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* SECTION 1: TEST DRIVE APPOINTMENT USERS */}
      {/* ============================================================ */}
      {(sectionTab === 'ALL' || sectionTab === 'TEST_DRIVE') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold uppercase text-[#F5A623] flex items-center gap-2">
              <Car className="w-5 h-5 text-[#F5A623]" /> 1. Test Drive Appointment Users ({testDriveUsers.length})
            </h2>
            <Link href="/bookings/test-drive" className="text-xs text-[#F5A623] hover:underline">
              View Master Test Drive List →
            </Link>
          </div>

          {testDriveUsers.length === 0 ? (
            <Card className="text-center py-10 text-xs text-gray-400 bg-[#3A3D42]/40 border-[#52565E]/40">
              No Test Drive appointment users recorded yet.
            </Card>
          ) : (
            <Card hoverEffect={false} className="p-0 overflow-hidden bg-[#3A3D42]/60 border-[#F5A623]/40 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D0D0D] text-[#F5A623] uppercase border-b border-[#52565E]">
                    <tr>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Reserved Vehicle</th>
                      <th className="p-4">Scheduled Slot</th>
                      <th className="p-4">Booking ID & Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#52565E]/40">
                    {testDriveUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#3A3D42]/80 transition-colors">
                        <td className="p-4 space-y-1">
                          <span className="font-extrabold text-[#E8ECF1] text-sm block">{u.name}</span>
                          <span className="text-[11px] text-gray-300 block">✉️ {u.email}</span>
                          <span className="text-[11px] text-gray-300 block">📞 {u.phone}</span>
                        </td>

                        <td className="p-4 space-y-1">
                          <span className="font-extrabold text-[#E8ECF1] text-xs uppercase block">{u.vehicleModel}</span>
                          <Badge variant="amber">Flagship Track</Badge>
                        </td>

                        <td className="p-4 space-y-1 text-gray-300">
                          <span className="block font-bold text-[#E8ECF1]">📅 {u.date}</span>
                          <span className="block text-[#F5A623] text-[11px]">⏰ {u.time}</span>
                        </td>

                        <td className="p-4 space-y-1">
                          <span className="text-[11px] text-[#F5A623] font-bold block">{u.device}</span>
                          <Badge variant={u.bookingStatus === 'CONFIRMED' ? 'green' : 'amber'}>
                            {u.bookingStatus}
                          </Badge>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUsers([u.id])}
                            title="Delete User Record"
                            className="p-2 rounded-[8px] bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: SERVICE APPOINTMENT USERS */}
      {/* ============================================================ */}
      {(sectionTab === 'ALL' || sectionTab === 'SERVICE') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold uppercase text-blue-400 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" /> 2. Service Appointment Users ({serviceUsers.length})
            </h2>
            <Link href="/bookings/service" className="text-xs text-blue-400 hover:underline">
              View Master Service Orders →
            </Link>
          </div>

          {serviceUsers.length === 0 ? (
            <Card className="text-center py-10 text-xs text-gray-400 bg-[#3A3D42]/40 border-[#52565E]/40">
              No Service appointment users recorded yet.
            </Card>
          ) : (
            <Card hoverEffect={false} className="p-0 overflow-hidden bg-[#3A3D42]/60 border-blue-500/40 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0D0D0D] text-blue-400 uppercase border-b border-[#52565E]">
                    <tr>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Vehicle & Service Type</th>
                      <th className="p-4">Scheduled Slot</th>
                      <th className="p-4">Work Order ID & Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#52565E]/40">
                    {serviceUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#3A3D42]/80 transition-colors">
                        <td className="p-4 space-y-1">
                          <span className="font-extrabold text-[#E8ECF1] text-sm block">{u.name}</span>
                          <span className="text-[11px] text-gray-300 block">✉️ {u.email}</span>
                          <span className="text-[11px] text-gray-300 block">📞 {u.phone}</span>
                        </td>

                        <td className="p-4 space-y-1">
                          <span className="font-extrabold text-[#E8ECF1] text-xs uppercase block">{u.vehicleModel}</span>
                          <span className="text-[11px] text-blue-400 block">{u.serviceType || 'Comprehensive Service'}</span>
                        </td>

                        <td className="p-4 space-y-1 text-gray-300">
                          <span className="block font-bold text-[#E8ECF1]">📅 {u.date}</span>
                          <span className="block text-blue-400 text-[11px]">⏰ {u.time}</span>
                        </td>

                        <td className="p-4 space-y-1">
                          <span className="text-[11px] text-blue-400 font-bold block">{u.device}</span>
                          <Badge variant={u.bookingStatus === 'COMPLETED' ? 'green' : u.bookingStatus === 'IN_PROGRESS' ? 'amber' : 'blue'}>
                            {u.bookingStatus}
                          </Badge>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteUsers([u.id])}
                            title="Delete User Record"
                            className="p-2 rounded-[8px] bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: OTHER STOREFRONT WEB SESSIONS (IF ANY) */}
      {/* ============================================================ */}
      {sectionTab === 'ALL' && otherUsers.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-extrabold uppercase text-emerald-400 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" /> 3. Storefront Web Sessions ({otherUsers.length})
          </h2>
          <Card hoverEffect={false} className="p-0 overflow-hidden bg-[#3A3D42]/60 border-emerald-500/40 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0D0D0D] text-emerald-400 uppercase border-b border-[#52565E]">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Session Info</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#52565E]/40">
                  {otherUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#3A3D42]/80 transition-colors">
                      <td className="p-4 space-y-1">
                        <span className="font-extrabold text-[#E8ECF1] text-sm block">{u.name}</span>
                        <span className="text-[11px] text-gray-300 block">✉️ {u.email} • 📞 {u.phone}</span>
                      </td>
                      <td className="p-4 text-gray-300">
                        <span className="block font-bold text-emerald-400">🟢 {u.lastActive}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUsers([u.id])}
                          className="p-2 rounded-[8px] bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
