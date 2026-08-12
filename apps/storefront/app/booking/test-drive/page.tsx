'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card, Badge, PriceTag } from '@showroom/ui';
import { MOCK_VEHICLES } from '../../../lib/mockData';
import { Header } from '../../../components/shared/Header';
import { Footer } from '../../../components/shared/Footer';
import { AiChatDrawer } from '../../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../../components/shared/CookieConsent';
import {
  Calendar,
  Clock,
  Car,
  CheckCircle,
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
];

export default function TestDriveBookingPage() {
  const searchParams = useSearchParams();
  const carIdQuery = searchParams.get('carId');
  const carModelQuery = searchParams.get('car');

  const defaultVehicleId = useMemo(() => {
    if (carIdQuery) return carIdQuery;
    if (carModelQuery) {
      const match = MOCK_VEHICLES.find((v) => v.model.toLowerCase() === carModelQuery.toLowerCase());
      if (match) return match.id;
    }
    return MOCK_VEHICLES[0].id;
  }, [carIdQuery, carModelQuery]);

  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  function parseSlotToMinutes(slotStr: string): number {
    const match = slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  function isSlotInPast(dateStr: string, slotStr: string): boolean {
    if (!dateStr) return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = parseSlotToMinutes(slotStr);
    return slotMinutes <= currentMinutes;
  }

  const [formData, setFormData] = useState({
    vehicleId: defaultVehicleId,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '10:30 AM',
    notes: '',
  });

  const fetchBookings = async () => {
    try {
      const savedSession = localStorage.getItem('APEX_USER_SESSION');
      if (savedSession) {
        const u = JSON.parse(savedSession);
        setFormData((prev) => ({
          ...prev,
          customerName: prev.customerName || u.name || '',
          customerEmail: prev.customerEmail || u.email || '',
          customerPhone: prev.customerPhone || u.phone || '',
        }));
      }

      const res = await fetch('/api/bookings');
      if (res.ok) {
        const list = await res.json();
        setAllBookings(list);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    window.addEventListener('storage', fetchBookings);
    return () => window.removeEventListener('storage', fetchBookings);
  }, []);

  const bookedTimeSlotsForSelectedDate = useMemo(() => {
    if (!formData.preferredDate) return [];
    return allBookings
      .filter((b) => (b.date === formData.preferredDate || b.preferredDate === formData.preferredDate) && b.status !== 'CANCELLED')
      .map((b) => b.time || b.preferredTime);
  }, [allBookings, formData.preferredDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) return;

    if (isSlotInPast(formData.preferredDate, formData.preferredTime)) {
      alert('This time slot is in the past. Please select an upcoming date/time slot.');
      return;
    }

    if (bookedTimeSlotsForSelectedDate.includes(formData.preferredTime)) {
      alert('This time slot is already reserved. Please pick another available time slot.');
      return;
    }

    const selCar = MOCK_VEHICLES.find((v) => v.id === formData.vehicleId) || MOCK_VEHICLES[0];
    const newBooking = {
      id: `TD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: formData.customerName.trim(),
      customerEmail: formData.customerEmail.trim(),
      customerPhone: formData.customerPhone.trim(),
      vehicleModel: `${selCar.make} ${selCar.model}`,
      vehicleYear: selCar.year,
      date: formData.preferredDate,
      time: formData.preferredTime,
      locationType: 'SHOWROOM_TRACK',
      address: 'Flagship Showroom Track',
      status: 'PENDING',
      notes: formData.notes,
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });

      if (res.ok) {
        const updatedList = await res.json();
        setAllBookings(updatedList);
        try {
          localStorage.setItem('APEX_TEST_DRIVES_STORE', JSON.stringify(updatedList));
        } catch (e) {
          console.error(e);
        }
      } else {
        const stored = localStorage.getItem('APEX_TEST_DRIVES_STORE');
        let list: any[] = [];
        if (stored) list = JSON.parse(stored);
        list.unshift(newBooking);
        localStorage.setItem('APEX_TEST_DRIVES_STORE', JSON.stringify(list));
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }

    try {
      await fetch('http://localhost:3333/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TEST_DRIVE',
          customerName: newBooking.customerName,
          customerEmail: newBooking.customerEmail,
          customerPhone: newBooking.customerPhone,
          dateTime: `${newBooking.date}T10:30:00.000Z`,
          vehicleId: formData.vehicleId,
          notes: newBooking.vehicleModel,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setSubmitted(true);
  };

  const selectedVehicle = MOCK_VEHICLES.find((v) => v.id === formData.vehicleId) || MOCK_VEHICLES[0];

  return (
    <div className="min-h-screen bg-white text-[#000000] font-mono">
      <Header onOpenAiChat={() => setAiChatOpen(true)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="amber">Concierge VIP Experience</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#000000] tracking-tight">
            Schedule Private Track Drive
          </h1>
          <p className="text-xs sm:text-sm text-[#60605B] max-w-xl mx-auto font-bold">
            Experience peak aerodynamic performance on our private test track or request VIP white-glove home delivery.
          </p>
        </div>

        {submitted ? (
          <Card hoverEffect={false} className="p-8 bg-[#BFBAAF]/20 border-[#003082] text-center space-y-6 rounded-[28px] shadow-2xl">
            <div className="w-16 h-16 bg-[#003082]/15 border-2 border-[#003082] rounded-full flex items-center justify-center mx-auto text-[#003082]">
              <Sparkles className="w-8 h-8 text-[#003082]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold uppercase text-[#000000]">
                Test Drive Request Received!
              </h2>
              <p className="text-xs text-[#60605B] font-bold">
                Your reservation for <strong className="text-[#000000]">{selectedVehicle.make} {selectedVehicle.model}</strong> has been logged in our master concierge database.
              </p>
            </div>

            <div className="p-4 bg-white rounded-[16px] border border-[#BFBAAF] max-w-md mx-auto text-xs space-y-1.5 text-left text-[#000000] font-bold">
              <div className="flex justify-between text-[#60605B]">
                <span>Client Name:</span>
                <strong className="text-[#000000]">{formData.customerName}</strong>
              </div>
              <div className="flex justify-between text-[#60605B]">
                <span>Email Address:</span>
                <strong className="text-[#000000]">{formData.customerEmail}</strong>
              </div>
              <div className="flex justify-between text-[#60605B]">
                <span>Scheduled Date:</span>
                <strong className="text-[#000000]">{formData.preferredDate}</strong>
              </div>
              <div className="flex justify-between text-[#60605B]">
                <span>Time Slot:</span>
                <strong className="text-[#000000]">{formData.preferredTime}</strong>
              </div>
              <div className="flex justify-between text-[#60605B]">
                <span>Status:</span>
                <span className="text-[#003082] font-extrabold uppercase">PENDING ADMIN APPROVAL</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/profile">
                <Button variant="primary" size="md" className="bg-[#003082] text-white font-bold">
                  View in My Profile 👤
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={() => setSubmitted(false)} className="border-[#000000] text-[#000000]">
                Schedule Another Test Drive
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 font-mono">
            {/* STEP 1: VEHICLE SELECTION */}
            <Card hoverEffect={false} className="p-6 bg-[#BFBAAF]/20 border-[#BFBAAF] space-y-4 rounded-[24px]">
              <h3 className="text-sm font-extrabold uppercase text-[#000000] flex items-center gap-2 border-b border-[#BFBAAF] pb-3">
                <Car className="w-4 h-4 text-[#003082]" /> 1. Selected Vehicle
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs text-[#000000] uppercase mb-1 font-bold">Choose Model:</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none text-xs font-bold focus:border-[#003082]"
                  >
                    {MOCK_VEHICLES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.year}) - ${v.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-white rounded-[12px] border border-[#BFBAAF] flex items-center gap-3">
                  <img
                    src={selectedVehicle.images[0]}
                    alt={selectedVehicle.model}
                    className="w-16 h-12 object-cover rounded-[8px]"
                  />
                  <div>
                    <span className="text-[10px] text-[#60605B] uppercase font-bold block">{selectedVehicle.make}</span>
                    <span className="text-xs font-extrabold text-[#000000] block">{selectedVehicle.model}</span>
                    <span className="text-[10px] text-[#60605B] block font-bold">{selectedVehicle.horsepower} HP • {selectedVehicle.fuelType}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* STEP 2: DATE & TIME SLOT SELECTOR */}
            <Card hoverEffect={false} className="p-6 bg-[#BFBAAF]/20 border-[#BFBAAF] space-y-4 rounded-[24px]">
              <h3 className="text-sm font-extrabold uppercase text-[#000000] flex items-center gap-2 border-b border-[#BFBAAF] pb-3">
                <Calendar className="w-4 h-4 text-[#003082]" /> 2. Preferred Date & Available Time Slot
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#000000] uppercase mb-1 font-bold">Select Date:</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none text-xs font-bold focus:border-[#003082]"
                  />
                </div>
                <div className="flex items-end">
                  <span className="text-[11px] text-[#60605B] font-bold">
                    Showing slots for <strong className="text-[#000000]">{formData.preferredDate}</strong>
                  </span>
                </div>
              </div>

              {/* TIME SLOTS GRID WITH LOCKING */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs text-[#000000] uppercase font-bold">Choose Time Slot:</label>
                  {bookedTimeSlotsForSelectedDate.length > 0 && (
                    <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {bookedTimeSlotsForSelectedDate.length} Slot(s) Reserved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedTimeSlotsForSelectedDate.includes(slot);
                    const isPast = isSlotInPast(formData.preferredDate, slot);
                    const isDisabled = isBooked || isPast;
                    const isSelected = formData.preferredTime === slot;

                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isDisabled}
                        onClick={() => setFormData({ ...formData, preferredTime: slot })}
                        className={`p-3 rounded-[12px] border text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                          isPast
                            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed line-through'
                            : isBooked
                            ? 'bg-red-50 border-red-300 text-red-700 cursor-not-allowed opacity-80'
                            : isSelected
                            ? 'bg-[#003082] text-white border-[#003082] shadow-md scale-105'
                            : 'bg-white text-[#000000] border-[#60605B]/40 hover:border-[#003082]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot}</span>
                        <span className="text-[9px] font-extrabold uppercase">
                          {isPast ? 'PAST TIME' : isBooked ? '🔒 RESERVED' : isSelected ? '✓ SELECTED' : 'AVAILABLE'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* STEP 3: CUSTOMER CONTACT DETAILS */}
            <Card hoverEffect={false} className="p-6 bg-[#BFBAAF]/20 border-[#BFBAAF] space-y-4 rounded-[24px]">
              <h3 className="text-sm font-extrabold uppercase text-[#000000] flex items-center gap-2 border-b border-[#BFBAAF] pb-3">
                <User className="w-4 h-4 text-[#003082]" /> 3. Customer Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#000000] uppercase mb-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monika"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] uppercase mb-1 font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. monika008@gmail.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] uppercase mb-1 font-bold">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#000000] uppercase mb-1 font-bold">Special Requests / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specify any track requirements or accessibility preferences..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none text-xs focus:border-[#003082] resize-none font-bold"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full bg-[#003082] text-white font-bold">
                Confirm VIP Track Drive Reservation
              </Button>
            </Card>
          </form>
        )}
      </div>

      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </div>
  );
}
