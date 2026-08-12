'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@showroom/ui';
import { Header } from '../../../components/shared/Header';
import { Footer } from '../../../components/shared/Footer';
import { AiChatDrawer } from '../../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../../components/shared/CookieConsent';
import {
  Wrench,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  Activity,
  User,
  MapPin,
  Calendar,
  Car,
  Building,
  Check,
  Lock,
  Edit3,
  Mail,
  Phone,
} from 'lucide-react';

const SERVICE_TIME_SLOTS = [
  { value: '09:00 AM', label: '09:00 AM (Morning Service)' },
  { value: '11:30 AM', label: '11:30 AM (Midday Service)' },
  { value: '02:00 PM', label: '02:00 PM (Afternoon Service)' },
  { value: '04:30 PM', label: '04:30 PM (Evening Service)' },
];

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

export default function ServiceBookingPage() {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [serviceData, setServiceData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupType: 'VALET_PICKUP' as 'VALET_PICKUP' | 'SHOWROOM_DROPOFF',
    customerAddress: '',
    vehicleName: '',
    vehicleYear: '2026',
    serviceType: '',
    customServiceText: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM',
    notes: '',
  });

  const [allServiceOrders, setAllServiceOrders] = useState<any[]>([]);

  const fetchServiceOrders = async () => {
    try {
      const savedSession = localStorage.getItem('APEX_USER_SESSION');
      if (savedSession) {
        const u = JSON.parse(savedSession);
        setServiceData((prev) => ({
          ...prev,
          customerName: prev.customerName || u.name || '',
          customerEmail: prev.customerEmail || u.email || '',
          customerPhone: prev.customerPhone || u.phone || '',
          customerAddress: prev.customerAddress || u.address || '',
        }));
      }
    } catch (err) {
      console.error(err);
    }

    try {
      let combined: any[] = [];
      const res = await fetch('/api/service-bookings');
      if (res.ok) {
        combined = await res.json();
      }

      const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (stored) {
        const localList = JSON.parse(stored);
        if (Array.isArray(localList)) {
          localList.forEach((item: any) => {
            const idx = combined.findIndex((s) => s.id === item.id);
            if (idx !== -1) {
              combined[idx].status = combined[idx].status || item.status;
            } else {
              combined.push(item);
            }
          });
        }
      }

      setAllServiceOrders(combined);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServiceOrders();
    window.addEventListener('storage', fetchServiceOrders);
    return () => window.removeEventListener('storage', fetchServiceOrders);
  }, []);

  const reservedTimeSlotsForSelectedDate = useMemo(() => {
    if (!serviceData.date) return [];
    return allServiceOrders
      .filter((s) => (s.scheduledDate === serviceData.date || s.date === serviceData.date) && s.status !== 'CANCELLED')
      .map((s) => s.scheduledTime || s.time);
  }, [allServiceOrders, serviceData.date]);

  const [trackingActive, setTrackingActive] = useState(false);

  const handleConfirmBooking = async () => {
    if (!serviceData.customerName || !serviceData.customerEmail) {
      alert('Please fill out your contact details.');
      setStep(1);
      return;
    }

    if (isSlotInPast(serviceData.date, serviceData.time)) {
      alert('This time slot is in the past. Please select an upcoming date/time slot.');
      return;
    }

    if (reservedTimeSlotsForSelectedDate.includes(serviceData.time)) {
      alert('This service time slot is already reserved by another appointment. Please pick another slot.');
      return;
    }

    const finalServiceType = serviceData.serviceType === 'Others'
      ? `Others: ${serviceData.customServiceText}`
      : serviceData.serviceType || 'Comprehensive Maintenance';

    const newOrder = {
      id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: serviceData.customerName.trim(),
      customerEmail: serviceData.customerEmail.trim(),
      customerPhone: serviceData.customerPhone.trim() || '+1 (555) 000-1122',
      vehicleModel: serviceData.vehicleName || 'Apex CyberSUV Ultra',
      scheduledDate: serviceData.date,
      scheduledTime: serviceData.time,
      serviceType: finalServiceType,
      notes: `Logistics: ${serviceData.pickupType === 'VALET_PICKUP' ? 'Valet Pick-Up from ' + (serviceData.customerAddress || 'Customer Address') : 'Showroom Self Drop-off (Nagapattinam Vetri Showroom)'}`,
      status: 'PENDING',
    };

    try {
      const res = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        const updatedList = await res.json();
        setAllServiceOrders(updatedList);
        try {
          localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify(updatedList));
        } catch (e) {
          console.error(e);
        }
      } else {
        const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
        let list: any[] = [];
        if (stored) list = JSON.parse(stored);
        list.unshift(newOrder);
        localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify(list));
        fetchServiceOrders();
      }
    } catch (err) {
      console.error(err);
    }

    try {
      await fetch('http://localhost:3333/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SERVICE',
          customerName: newOrder.customerName,
          customerEmail: newOrder.customerEmail,
          customerPhone: newOrder.customerPhone,
          dateTime: `${newOrder.scheduledDate}T09:00:00.000Z`,
          serviceType: finalServiceType,
          notes: newOrder.vehicleModel,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setTrackingActive(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#000000] font-mono">
      <Header onOpenAiChat={() => setAiChatOpen(true)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="amber">Concierge Service & Maintenance</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#000000] tracking-tight">
            Book Factory Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-[#60605B] max-w-xl mx-auto font-bold">
            Book maintenance with our factory-trained master technicians featuring live service progress tracking & admin synchronization.
          </p>
        </div>

        {/* LIVE TRACKER WIDGET */}
        {trackingActive ? (
          <Card className="space-y-6 border-[#003082] bg-[#BFBAAF]/20 p-8 shadow-2xl rounded-[24px]">
            <div className="flex items-center justify-between border-b border-[#BFBAAF] pb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-[#003082] animate-pulse" />
                <div>
                  <h3 className="text-lg font-extrabold uppercase text-[#000000]">
                    Live Service Status Tracker
                  </h3>
                  <p className="text-xs text-[#60605B] font-mono font-bold">Work Order: #SRV-{Math.floor(10000 + Math.random() * 90000)}</p>
                </div>
              </div>
              <Badge variant="amber">Pending Admin Approval</Badge>
            </div>

            {/* CONFIRMED DETAILS SUMMARY */}
            <div className="bg-white p-4 rounded-[16px] border border-[#BFBAAF] text-xs font-mono space-y-2 text-[#000000]">
              <div className="flex justify-between text-[#000000] font-bold">
                <span>Client: {serviceData.customerName} ({serviceData.customerEmail})</span>
                <span>{serviceData.date} at {serviceData.time}</span>
              </div>
              <div className="text-[#60605B] font-bold">
                Vehicle: {serviceData.vehicleName || 'Apex CyberSUV Ultra'} ({serviceData.vehicleYear || '2026'})
              </div>
              <div className="text-[#60605B] font-bold">
                Service: {serviceData.serviceType === 'Others' ? `Others: ${serviceData.customServiceText}` : serviceData.serviceType || 'Comprehensive Maintenance'}
              </div>
              <div className="text-[#60605B] text-[11px] font-bold">
                Transport Mode: {serviceData.pickupType === 'VALET_PICKUP' ? `🚚 Valet Pick-Up from ${serviceData.customerAddress || 'your address'}` : '🏢 Self Showroom Drop-off (Vetri Showroom, Nagapattinam)'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#000000] font-bold">Master Technician Inspection</span>
                <span className="text-[#003082] font-bold">40% Completed</span>
              </div>
              <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-[#BFBAAF]">
                <div className="h-full bg-[#003082] w-[40%] transition-all duration-500" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] uppercase font-mono text-center pt-2">
              <div className="text-[#000000] font-bold">1. Checked In ✓</div>
              <div className="text-[#000000] font-bold">2. Diagnostics ✓</div>
              <div className="text-[#003082] font-bold animate-pulse">3. Service In Progress</div>
              <div className="text-[#60605B]">4. Quality Test & Delivery</div>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs text-[#60605B] font-bold">
              <p>Assigned Technician: Marcus Vance (Master Tech)</p>
              <div className="flex gap-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="border-[#000000] text-[#000000]">
                    View in My Profile 👤
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={() => setTrackingActive(false)} className="bg-[#003082] text-white font-bold">
                  Book Another Service
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* STEP-BY-STEP SERVICE FORM WIZARD */
          <Card hoverEffect={false} className="p-8 bg-[#BFBAAF]/20 border-[#BFBAAF] space-y-8 rounded-[24px]">
            {/* Step Indicator */}
            <div className="flex justify-between border-b border-[#BFBAAF] pb-4 text-xs font-mono uppercase">
              <span className={step >= 1 ? 'text-[#000000] font-extrabold' : 'text-[#60605B]'}>1. Client & Contact</span>
              <span className={step >= 2 ? 'text-[#000000] font-extrabold' : 'text-[#60605B]'}>2. Service Selection</span>
              <span className={step >= 3 ? 'text-[#000000] font-extrabold' : 'text-[#60605B]'}>3. Date & Time</span>
            </div>

            {/* STEP 1: NAME, EMAIL, PHONE, VEHICLE NAME & YEAR */}
            {step === 1 && (
              <div className="space-y-6 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#000000] uppercase mb-1 flex items-center gap-1.5 font-bold">
                      <User className="w-4 h-4 text-[#003082]" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monika"
                      value={serviceData.customerName}
                      onChange={(e) => setServiceData({ ...serviceData, customerName: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#000000] uppercase mb-1 flex items-center gap-1.5 font-bold">
                      <Mail className="w-4 h-4 text-[#003082]" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. monika008@gmail.com"
                      value={serviceData.customerEmail}
                      onChange={(e) => setServiceData({ ...serviceData, customerEmail: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#000000] uppercase mb-1 flex items-center gap-1.5 font-bold">
                      <Car className="w-4 h-4 text-[#003082]" /> Vehicle Name & Model
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex CyberSUV Ultra"
                      value={serviceData.vehicleName}
                      onChange={(e) => setServiceData({ ...serviceData, vehicleName: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#000000] uppercase mb-1 flex items-center gap-1.5 font-bold">
                      <Phone className="w-4 h-4 text-[#003082]" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 019-2834"
                      value={serviceData.customerPhone}
                      onChange={(e) => setServiceData({ ...serviceData, customerPhone: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#000000] uppercase font-bold">Service Logistics Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceData({ ...serviceData, pickupType: 'VALET_PICKUP' })}
                      className={`p-3.5 rounded-[12px] border text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                        serviceData.pickupType === 'VALET_PICKUP'
                          ? 'border-[#003082] bg-[#003082] text-white shadow-md'
                          : 'border-[#60605B]/30 bg-white text-[#000000]'
                      }`}
                    >
                      <Truck className="w-4 h-4" /> 🚚 Valet Pick-Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceData({ ...serviceData, pickupType: 'SHOWROOM_DROPOFF' })}
                      className={`p-3.5 rounded-[12px] border text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                        serviceData.pickupType === 'SHOWROOM_DROPOFF'
                          ? 'border-[#003082] bg-[#003082] text-white shadow-md'
                          : 'border-[#60605B]/30 bg-white text-[#000000]'
                      }`}
                    >
                      <Building className="w-4 h-4" /> 🏢 Showroom Drop-off
                    </button>
                  </div>
                </div>

                {serviceData.pickupType === 'VALET_PICKUP' && (
                  <div>
                    <label className="block text-[#000000] uppercase mb-1 flex items-center gap-1.5 font-bold">
                      <MapPin className="w-4 h-4 text-[#003082]" /> Valet Pick-Up Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 742 Evergreen Terrace, Beverly Hills, CA"
                      value={serviceData.customerAddress}
                      onChange={(e) => setServiceData({ ...serviceData, customerAddress: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>
                )}

                <Button variant="primary" size="md" className="w-full bg-[#003082] text-white font-bold" onClick={() => {
                  if (!serviceData.customerName.trim() || !serviceData.customerEmail.trim()) {
                    alert('Please enter your Full Name and Email Address to proceed.');
                    return;
                  }
                  setStep(2);
                }}>
                  Next Step: Select Required Service
                </Button>
              </div>
            )}

            {/* STEP 2: SERVICE TYPE SELECTION */}
            {step === 2 && (
              <div className="space-y-6 text-xs font-mono">
                <label className="block text-[#000000] uppercase font-extrabold text-sm">
                  Which Service Type Do You Require?
                </label>
                <div className="space-y-3">
                  {[
                    'Comprehensive 10,000 Mi Maintenance & Battery Calibration',
                    'High-Performance Synthetic Oil & Filter Service',
                    'Carbon Ceramic Brake Pad Inspection & Fluid Flush',
                    'Autonomous Air Suspension & Wheel Alignment',
                    'AC Climate Sanitization & Cabin HEPA Filter Replace',
                    'Others',
                  ].map((srv, idx) => (
                    <div
                      key={idx}
                      onClick={() => setServiceData({ ...serviceData, serviceType: srv })}
                      className={`p-4 rounded-[12px] border cursor-pointer transition-all flex items-center justify-between font-bold ${
                        serviceData.serviceType === srv
                          ? 'border-[#003082] bg-[#003082] text-white shadow-md'
                          : 'border-[#60605B]/30 bg-white text-[#000000] hover:border-[#003082]'
                      }`}
                    >
                      <span>{srv === 'Others' ? '🛠️ Others (Specify Custom Service Request)' : srv}</span>
                      {serviceData.serviceType === srv && <CheckCircle className="w-4 h-4 text-[#BFBAAF]" />}
                    </div>
                  ))}
                </div>

                {serviceData.serviceType === 'Others' && (
                  <div className="space-y-2 p-4 bg-white rounded-[12px] border border-[#003082]">
                    <label className="block text-[#000000] uppercase font-bold flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#003082]" /> Specify Custom Service Details:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Specify your custom repair, diagnostics, or modification request..."
                      value={serviceData.customServiceText}
                      onChange={(e) => setServiceData({ ...serviceData, customServiceText: e.target.value })}
                      className="w-full bg-[#BFBAAF]/20 text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="secondary" size="md" className="w-1/2 bg-[#000000] text-white" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="primary" size="md" className="w-1/2 bg-[#003082] text-white font-bold" onClick={() => {
                    if (!serviceData.serviceType) {
                      alert('Please select a service type.');
                      return;
                    }
                    setStep(3);
                  }}>
                    Next Step: Pick Date & Time
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: DATE, TIME & TIME SLOT LOCKING */}
            {step === 3 && (
              <div className="space-y-6 text-xs font-mono">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#000000] uppercase mb-2 flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-[#003082]" /> Select Service Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={serviceData.date}
                      onChange={(e) => setServiceData({ ...serviceData, date: e.target.value })}
                      className="w-full bg-white text-[#000000] p-3.5 rounded-[12px] border border-[#60605B]/40 outline-none font-bold focus:border-[#003082]"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[#000000] uppercase font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#003082]" /> Choose Time Slot
                      </label>
                      {reservedTimeSlotsForSelectedDate.length > 0 && (
                        <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {reservedTimeSlotsForSelectedDate.length} Slot(s) Reserved
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SERVICE_TIME_SLOTS.map((slot) => {
                        const isBooked = reservedTimeSlotsForSelectedDate.includes(slot.value);
                        const isPast = isSlotInPast(serviceData.date, slot.value);
                        const isDisabled = isBooked || isPast;
                        const isSelected = serviceData.time === slot.value;

                        return (
                          <button
                            type="button"
                            key={slot.value}
                            disabled={isDisabled}
                            onClick={() => setServiceData({ ...serviceData, time: slot.value })}
                            className={`p-4 rounded-[14px] border text-xs font-bold uppercase transition-all flex items-center justify-between ${
                              isPast
                                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed line-through'
                                : isBooked
                                ? 'bg-red-50 border-red-300 text-red-700 cursor-not-allowed opacity-80'
                                : isSelected
                                ? 'bg-[#003082] text-white border-[#003082] shadow-md scale-105'
                                : 'bg-white text-[#000000] border-[#60605B]/40 hover:border-[#003082]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{slot.label}</span>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase">
                              {isPast ? 'PAST TIME' : isBooked ? '🔒 RESERVED' : isSelected ? '✓ SELECTED' : 'AVAILABLE'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-[#BFBAAF]">
                  <Button variant="secondary" size="md" className="w-1/2 bg-[#000000] text-white" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-1/2 bg-[#003082] text-white font-bold"
                    onClick={handleConfirmBooking}
                  >
                    Confirm Booking & View Tracker
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </div>
  );
}
