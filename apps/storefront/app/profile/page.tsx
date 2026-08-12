'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Badge, PriceTag } from '@showroom/ui';
import { Header } from '../../components/shared/Header';
import { Footer } from '../../components/shared/Footer';
import { AiChatDrawer } from '../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../components/shared/CookieConsent';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Car,
  Wrench,
  Edit3,
  CheckCircle2,
  Sparkles,
  LogOut,
  Trash2,
  Plus,
  PlusCircle,
  RefreshCw,
  Clock,
  Check,
} from 'lucide-react';

export interface UserSession {
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
  membershipTier: string;
  memberId: string;
}

export default function UserProfilePage() {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'MY_VEHICLES' | 'TEST_DRIVES' | 'SERVICE'>('PROFILE');

  // DYNAMIC USER SESSION STATE
  const [userInfo, setUserInfo] = useState<UserSession | null>(null);

  // Profile setup form fields
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputAddress, setInputAddress] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // LOGGED IN USER DATA ONLY & REAL-TIME ADMIN SYNCED BOOKINGS
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [userCustomVehicles, setUserCustomVehicles] = useState<any[]>([]);

  // ADD CUSTOM VEHICLE MODAL STATE
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false);
  const [newCarMake, setNewCarMake] = useState('');
  const [newCarModel, setNewCarModel] = useState('');
  const [newCarYear, setNewCarYear] = useState(2026);
  const [newCarPrice, setNewCarPrice] = useState(350000);
  const [newCarEngine, setNewCarEngine] = useState('Twin-Turbo V8 Hybrid');
  const [newCarHP, setNewCarHP] = useState(950);
  const [newCarFuel, setNewCarFuel] = useState('V8 Twin-Turbo Hybrid');
  const [newCarTrans, setNewCarTrans] = useState('7-Speed Dual Clutch');
  const [newCarDesc, setNewCarDesc] = useState('');
  const [newCarImg, setNewCarImg] = useState('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80');
  const [newCarGlb, setNewCarGlb] = useState('/models/ferrari.glb');
  const [vehicleAddedSuccess, setVehicleAddedSuccess] = useState(false);

  // ⚡ REUSABLE REAL-TIME DATA SYNC FUNCTION
  const loadLiveUserData = useCallback(async () => {
    // 1. Read User Session from localStorage
    let currentSession: UserSession | null = null;
    try {
      const savedSession = localStorage.getItem('APEX_USER_SESSION');
      if (savedSession) {
        currentSession = JSON.parse(savedSession);
        setUserInfo(currentSession);
        if (!inputName && currentSession) {
          setInputName(currentSession.name || '');
          setInputEmail(currentSession.email || '');
          setInputPhone(currentSession.phone || '');
          setInputAddress(currentSession.address || '');
        }
      }
    } catch (err) {
      console.error(err);
    }

    const uEmail = (currentSession?.email || '').toLowerCase().trim();
    const uName = (currentSession?.name || '').toLowerCase().trim();

    // 2. Load User Custom Uploaded Vehicles
    try {
      const storedVehicles = localStorage.getItem('APEX_USER_CUSTOM_VEHICLES');
      if (storedVehicles) {
        setUserCustomVehicles(JSON.parse(storedVehicles));
      } else {
        setUserCustomVehicles([]);
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Sync Test Drives (Filtered strictly for current logged in user)
    let allTDs: any[] = [];
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        allTDs = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const localTDsStore = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (localTDsStore) {
        const localTDs = JSON.parse(localTDsStore);
        if (Array.isArray(localTDs)) {
          localTDs.forEach((item: any) => {
            const idx = allTDs.findIndex((t) => t.id === item.id);
            if (idx !== -1) {
              allTDs[idx].status = allTDs[idx].status || item.status;
            } else {
              allTDs.push(item);
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    const myTDs = allTDs.filter((item: any) => {
      if (!uEmail && !uName) return false;
      const cEmail = (item.customerEmail || item.email || '').toLowerCase().trim();
      const cName = (item.customerName || item.name || '').toLowerCase().trim();

      const matchEmail = uEmail && cEmail && (cEmail === uEmail || cEmail.includes(uEmail) || uEmail.includes(cEmail));
      const matchName = uName && cName && (cName === uName || cName.includes(uName) || uName.includes(cName));

      return matchEmail || matchName;
    });

    setTestDrives(myTDs);

    // 4. Sync Service Orders (Filtered strictly for current logged in user)
    let allSRVs: any[] = [];
    try {
      const res = await fetch('/api/service-bookings');
      if (res.ok) {
        allSRVs = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const localSRVsStore = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (localSRVsStore) {
        const localSRV = JSON.parse(localSRVsStore);
        if (Array.isArray(localSRV)) {
          localSRV.forEach((item: any) => {
            const idx = allSRVs.findIndex((s) => s.id === item.id);
            if (idx !== -1) {
              allSRVs[idx].status = allSRVs[idx].status || item.status;
            } else {
              allSRVs.push(item);
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    const mySRVs = allSRVs.filter((item: any) => {
      if (!uEmail && !uName) return false;
      const cEmail = (item.customerEmail || item.email || '').toLowerCase().trim();
      const cName = (item.customerName || item.name || '').toLowerCase().trim();

      const matchEmail = uEmail && cEmail && (cEmail === uEmail || cEmail.includes(uEmail) || uEmail.includes(cEmail));
      const matchName = uName && cName && (cName === uName || cName.includes(uName) || uName.includes(cName));

      return matchEmail || matchName;
    });

    setServiceOrders(mySRVs);
  }, [inputName]);

  useEffect(() => {
    loadLiveUserData();

    const timer = setInterval(() => {
      loadLiveUserData();
    }, 1500);

    const handleStorageChange = () => {
      loadLiveUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [loadLiveUserData]);

  // Save User Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputEmail.trim()) return;

    const updatedProfile: UserSession = {
      name: inputName.trim(),
      email: inputEmail.trim(),
      phone: inputPhone.trim() || '+1 (555) 000-0000',
      address: inputAddress.trim() || 'Private Executive Suite',
      memberSince: userInfo?.memberSince || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      membershipTier: userInfo?.membershipTier || 'Apex VIP Member',
      memberId: userInfo?.memberId || `APX-VIP-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    setUserInfo(updatedProfile);

    try {
      localStorage.setItem('APEX_USER_SESSION', JSON.stringify(updatedProfile));
      setSavedSuccess(true);
      setEditMode(false);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Logout / Clear User Session
  const handleLogout = () => {
    try {
      localStorage.removeItem('APEX_USER_SESSION');
      localStorage.removeItem('apex_token');
    } catch (err) {
      console.error(err);
    }
    setUserInfo(null);
    setInputName('');
    setInputEmail('');
    setInputPhone('');
    setInputAddress('');
    window.location.href = '/login';
  };

  // Upload / Add Custom Vehicle
  const handleAddCustomVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarMake.trim() || !newCarModel.trim()) return;

    const customCar = {
      id: `custom-${Date.now()}`,
      make: newCarMake.trim(),
      model: newCarModel.trim(),
      year: Number(newCarYear),
      price: Number(newCarPrice),
      mileage: 50,
      fuelType: newCarFuel,
      transmission: newCarTrans,
      bodyStyle: 'Hypercar',
      color: 'Bespoke Client Upload',
      engine: newCarEngine,
      horsepower: Number(newCarHP),
      description: newCarDesc.trim() || `${newCarMake} ${newCarModel} custom specification uploaded by ${userInfo?.name || 'Owner'}.`,
      images: [newCarImg || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'],
      status: 'AVAILABLE',
      featured: true,
      createdAt: new Date().toISOString(),
      mainCategory: 'Hypercars & Supercars',
      subCategory: 'Bespoke Client Upload',
      modelPath: newCarGlb,
    };

    const updatedUserCars = [customCar, ...userCustomVehicles];
    setUserCustomVehicles(updatedUserCars);

    try {
      localStorage.setItem('APEX_USER_CUSTOM_VEHICLES', JSON.stringify(updatedUserCars));
      const existingCatalog = localStorage.getItem('APEX_VEHICLES_STORE');
      let catalogList: any[] = [];
      if (existingCatalog) {
        catalogList = JSON.parse(existingCatalog);
      }
      catalogList.unshift(customCar);
      localStorage.setItem('APEX_VEHICLES_STORE', JSON.stringify(catalogList));
    } catch (err) {
      console.error(err);
    }

    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customCar),
      });
    } catch (e) {
      console.error(e);
    }

    setNewCarMake('');
    setNewCarModel('');
    setNewCarDesc('');
    setAddVehicleModalOpen(false);
    setVehicleAddedSuccess(true);
    setTimeout(() => setVehicleAddedSuccess(false), 4000);
  };

  const handleDeleteTestDrive = (id: string) => {
    const updated = testDrives.filter((td) => td.id !== id);
    setTestDrives(updated);
    try {
      const stored = localStorage.getItem('APEX_TEST_DRIVES_STORE');
      if (stored) {
        const list = JSON.parse(stored).filter((item: any) => item.id !== id);
        localStorage.setItem('APEX_TEST_DRIVES_STORE', JSON.stringify(list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteServiceOrder = (id: string) => {
    const updated = serviceOrders.filter((item) => item.id !== id);
    setServiceOrders(updated);
    try {
      const stored = localStorage.getItem('APEX_SERVICE_BOOKINGS_STORE');
      if (stored) {
        const list = JSON.parse(stored).filter((item: any) => item.id !== id);
        localStorage.setItem('APEX_SERVICE_BOOKINGS_STORE', JSON.stringify(list));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomVehicle = (id: string) => {
    const updated = userCustomVehicles.filter((v) => v.id !== id);
    setUserCustomVehicles(updated);
    try {
      localStorage.setItem('APEX_USER_CUSTOM_VEHICLES', JSON.stringify(updated));
      const catalog = localStorage.getItem('APEX_VEHICLES_STORE');
      if (catalog) {
        const catalogList = JSON.parse(catalog).filter((v: any) => v.id !== id);
        localStorage.setItem('APEX_VEHICLES_STORE', JSON.stringify(catalogList));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#000000] font-mono">
      <Header onOpenAiChat={() => setAiChatOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* 👤 TOP USER PROFILE BANNER WITH LIVE SYNC BADGE */}
        <Card hoverEffect={false} className="p-8 bg-[#BFBAAF]/20 border-[#BFBAAF] shadow-xl rounded-[28px] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

            <div className="flex items-center gap-5">
              {/* AVATAR INITIALS */}
              <div className="w-20 h-20 rounded-2xl bg-[#003082] border-2 border-[#BFBAAF] flex items-center justify-center text-white font-black text-3xl shadow-xl shrink-0">
                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
              </div>

              <div className="space-y-1">
                {userInfo ? (
                  <>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-[#000000] tracking-tight">
                        {userInfo.name}
                      </h1>
                      <Badge variant="amber">{userInfo.membershipTier}</Badge>
                      <span className="text-[10px] text-[#000000] font-bold bg-[#BFBAAF]/40 px-2.5 py-1 rounded-full border border-[#003082] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#003082] animate-ping" /> Live Admin Sync Active
                      </span>
                    </div>
                    <p className="text-xs text-[#60605B] font-mono font-bold">
                      Client ID: <span className="text-[#000000] font-bold">{userInfo.memberId}</span> · Member since {userInfo.memberSince}
                    </p>
                    <p className="text-xs text-[#000000] font-mono font-bold flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#003082]" /> {userInfo.email}
                      <span className="text-gray-400">|</span>
                      <Phone className="w-3.5 h-3.5 text-[#003082]" /> {userInfo.phone}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-extrabold uppercase text-[#000000]">No Profile Configured</h1>
                    <p className="text-xs text-[#60605B] font-bold">Please enter your name & details below or Sign In.</p>
                  </>
                )}
              </div>
            </div>

            {/* TOP ACTIONS */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={loadLiveUserData}
                className="p-2.5 rounded-[12px] bg-white border border-[#60605B]/40 text-xs text-[#000000] hover:bg-[#BFBAAF]/30 font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="Refresh Live Admin Updates"
              >
                <RefreshCw className="w-4 h-4 text-[#003082]" /> Refresh
              </button>

              {userInfo && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setAddVehicleModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#003082] text-white hover:bg-[#000000]"
                >
                  <PlusCircle className="w-4 h-4 text-[#BFBAAF]" /> Upload / Add Vehicle
                </Button>
              )}

              {userInfo ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-700 border-red-400 hover:bg-red-50 font-bold"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="md" className="bg-[#003082] text-white">
                    Sign In To Your Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* FEEDBACK BANNERS */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-[16px] text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {vehicleAddedSuccess && (
          <div className="p-4 bg-[#BFBAAF]/30 border border-[#003082] rounded-[16px] text-[#000000] text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
            <Sparkles className="w-5 h-5 shrink-0 text-[#003082]" />
            <span>Custom Vehicle published! Viewable in Catalog & 3D Showcase.</span>
          </div>
        )}

        {/* 🎛 TABS NAVIGATION */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#BFBAAF] pb-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-5 py-2.5 rounded-[14px] font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'PROFILE'
                ? 'bg-[#003082] text-white shadow-lg scale-105'
                : 'bg-[#BFBAAF]/20 text-[#000000] hover:bg-[#003082] hover:text-white border border-[#BFBAAF]'
            }`}
          >
            <User className="w-4 h-4" /> My Profile Details
          </button>

          <button
            onClick={() => setActiveTab('MY_VEHICLES')}
            className={`px-5 py-2.5 rounded-[14px] font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'MY_VEHICLES'
                ? 'bg-[#003082] text-white shadow-lg scale-105'
                : 'bg-[#BFBAAF]/20 text-[#000000] hover:bg-[#003082] hover:text-white border border-[#BFBAAF]'
            }`}
          >
            <Car className="w-4 h-4" /> My Uploaded Vehicles ({userCustomVehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('TEST_DRIVES')}
            className={`px-5 py-2.5 rounded-[14px] font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'TEST_DRIVES'
                ? 'bg-[#003082] text-white shadow-lg scale-105'
                : 'bg-[#BFBAAF]/20 text-[#000000] hover:bg-[#003082] hover:text-white border border-[#BFBAAF]'
            }`}
          >
            <Calendar className="w-4 h-4" /> My Live Test Drives ({testDrives.length})
          </button>

          <button
            onClick={() => setActiveTab('SERVICE')}
            className={`px-5 py-2.5 rounded-[14px] font-bold uppercase transition-all flex items-center gap-2 ${
              activeTab === 'SERVICE'
                ? 'bg-[#003082] text-white shadow-lg scale-105'
                : 'bg-[#BFBAAF]/20 text-[#000000] hover:bg-[#003082] hover:text-white border border-[#BFBAAF]'
            }`}
          >
            <Wrench className="w-4 h-4" /> My Live Service Orders ({serviceOrders.length})
          </button>
        </div>

        {/* 📝 TAB 1: EDIT / VIEW PROFILE DETAILS */}
        {activeTab === 'PROFILE' && (
          <Card hoverEffect={false} className="p-8 bg-white border-[#BFBAAF] space-y-6 rounded-[24px] shadow-lg">
            <div className="flex items-center justify-between border-b border-[#BFBAAF] pb-4">
              <h2 className="text-xl font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <User className="w-5 h-5 text-[#003082]" /> Personal Account Information
              </h2>
              {userInfo && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="px-4 py-2 rounded-[12px] bg-[#BFBAAF]/20 border border-[#60605B]/30 text-xs font-bold text-[#000000] hover:border-[#003082] transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#003082]" /> {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              )}
            </div>

            {(!userInfo || editMode) ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#000000] font-bold uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[12px] p-3 text-[#000000] outline-none focus:border-[#003082] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#000000] font-bold uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@domain.com"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[12px] p-3 text-[#000000] outline-none focus:border-[#003082] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#000000] font-bold uppercase mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[12px] p-3 text-[#000000] outline-none focus:border-[#003082] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#000000] font-bold uppercase mb-1">Residence Address</label>
                    <input
                      type="text"
                      placeholder="123 Executive Way, CA"
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                      className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[12px] p-3 text-[#000000] outline-none focus:border-[#003082] font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button variant="primary" size="md" type="submit" className="bg-[#003082] text-white font-bold">
                    Save My Details
                  </Button>
                  {userInfo && (
                    <Button variant="outline" size="md" type="button" onClick={() => setEditMode(false)} className="border-[#000000] text-[#000000]">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                <div className="bg-[#BFBAAF]/20 p-4 rounded-[18px] border border-[#BFBAAF] space-y-1">
                  <span className="text-[#60605B] uppercase text-[10px] font-bold">Full Name</span>
                  <span className="text-[#000000] font-black block text-base">{userInfo.name}</span>
                </div>

                <div className="bg-[#BFBAAF]/20 p-4 rounded-[18px] border border-[#BFBAAF] space-y-1">
                  <span className="text-[#60605B] uppercase text-[10px] font-bold">Email Address</span>
                  <span className="text-[#000000] font-black block text-base">{userInfo.email}</span>
                </div>

                <div className="bg-[#BFBAAF]/20 p-4 rounded-[18px] border border-[#BFBAAF] space-y-1">
                  <span className="text-[#60605B] uppercase text-[10px] font-bold">Phone Number</span>
                  <span className="text-[#000000] font-black block text-base">{userInfo.phone}</span>
                </div>

                <div className="bg-[#BFBAAF]/20 p-4 rounded-[18px] border border-[#BFBAAF] space-y-1">
                  <span className="text-[#60605B] uppercase text-[10px] font-bold">Membership Tier</span>
                  <span className="text-[#003082] font-black block text-base">{userInfo.membershipTier}</span>
                </div>

                <div className="sm:col-span-2 bg-[#BFBAAF]/20 p-4 rounded-[18px] border border-[#BFBAAF] space-y-1">
                  <span className="text-[#60605B] uppercase text-[10px] font-bold">Residence Address</span>
                  <span className="text-[#000000] font-black block text-base">{userInfo.address}</span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 🚗 TAB 2: MY UPLOADED VEHICLES */}
        {activeTab === 'MY_VEHICLES' && (
          <div className="space-y-6 font-mono">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <Car className="w-5 h-5 text-[#003082]" /> Vehicles Uploaded By You ({userCustomVehicles.length})
              </h2>
              {userInfo && (
                <Button variant="primary" size="sm" onClick={() => setAddVehicleModalOpen(true)} className="bg-[#003082] text-white font-bold">
                  <Plus className="w-4 h-4 text-[#BFBAAF]" /> Upload New Car
                </Button>
              )}
            </div>

            {userCustomVehicles.length === 0 ? (
              <Card hoverEffect={false} className="p-12 text-center bg-white border-[#BFBAAF] space-y-4">
                <p className="text-[#60605B] text-sm font-bold">No vehicles uploaded by you yet.</p>
                {userInfo && (
                  <Button variant="primary" size="md" onClick={() => setAddVehicleModalOpen(true)} className="bg-[#003082] text-white font-bold">
                    Upload Your First Car
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCustomVehicles.map((car) => (
                  <Card key={car.id} hoverEffect={true} className="p-0 bg-white border-[#BFBAAF] overflow-hidden rounded-[20px] space-y-4">
                    <div className="h-48 w-full bg-[#BFBAAF]/20 relative">
                      <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <Badge variant="amber">{car.year}</Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#60605B] uppercase font-extrabold">{car.make}</span>
                        <PriceTag price={car.price} />
                      </div>
                      <h3 className="text-lg font-extrabold uppercase text-[#000000]">{car.model}</h3>
                      <p className="text-xs text-[#60605B] line-clamp-2 font-bold">{car.description}</p>

                      <div className="pt-2 flex items-center justify-between border-t border-[#BFBAAF]">
                        <Link href={`/vehicle/${car.id}`}>
                          <button className="text-xs text-[#003082] font-extrabold uppercase hover:underline">
                            View 3D Specs →
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomVehicle(car.id)}
                          className="text-red-600 text-xs hover:text-red-800 p-1 font-bold"
                          title="Delete Custom Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📅 TAB 3: TEST DRIVE BOOKINGS */}
        {activeTab === 'TEST_DRIVES' && (
          <div className="space-y-6 font-mono">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#003082]" /> Your Test Drive Requests ({testDrives.length})
              </h2>
              <button
                onClick={loadLiveUserData}
                className="text-xs text-[#003082] hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#003082]" /> Live Admin Sync
              </button>
            </div>

            {testDrives.length === 0 ? (
              <Card hoverEffect={false} className="p-12 text-center bg-white border-[#BFBAAF] space-y-4">
                <p className="text-[#60605B] text-sm font-bold">No test drive requests created for account: <strong className="text-[#000000]">{userInfo?.email}</strong></p>
                <Link href="/inventory">
                  <Button variant="primary" size="md" className="bg-[#003082] text-white font-bold">
                    Explore Inventory & Schedule Test Drive
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {testDrives.map((td) => {
                  const isConfirmed = td.status === 'CONFIRMED' || td.status === 'APPROVED';
                  const isCompleted = td.status === 'COMPLETED';
                  const isCancelled = td.status === 'CANCELLED';

                  return (
                    <Card key={td.id} hoverEffect={false} className="p-5 bg-white border-[#BFBAAF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold uppercase text-[#000000]">{td.vehicleModel || td.carModel || 'Supercar Drive'}</h3>

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
                            {isCompleted
                              ? 'COMPLETED / DELIVERED'
                              : isConfirmed
                              ? '✓ CONFIRMED BY ADMIN'
                              : isCancelled
                              ? 'CANCELLED'
                              : 'PENDING ADMIN APPROVAL'}
                          </Badge>
                        </div>

                        <p className="text-xs text-[#60605B] font-mono font-bold">
                          Appt ID: <strong className="text-[#000000]">{td.id}</strong> · Client: <strong className="text-[#000000]">{td.customerName}</strong> ({td.customerEmail})
                        </p>
                        <p className="text-xs text-[#60605B] font-bold">
                          Date: <strong className="text-[#000000]">{td.date || td.preferredDate}</strong> · Time: <strong className="text-[#000000]">{td.time || td.preferredTime}</strong>
                        </p>
                        <p className="text-xs text-[#60605B] font-bold">
                          Location: {td.address || td.location || 'Flagship Showroom Track'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteTestDrive(td.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Cancel Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 🔧 TAB 4: SERVICE ORDERS */}
        {activeTab === 'SERVICE' && (
          <div className="space-y-6 font-mono">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#003082]" /> Your Concierge Service Orders ({serviceOrders.length})
              </h2>
              <button
                onClick={loadLiveUserData}
                className="text-xs text-[#003082] hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#003082]" /> Live Admin Sync
              </button>
            </div>

            {serviceOrders.length === 0 ? (
              <Card hoverEffect={false} className="p-12 text-center bg-white border-[#BFBAAF] space-y-4">
                <p className="text-[#60605B] text-sm font-bold">No service orders created for account: <strong className="text-[#000000]">{userInfo?.email}</strong></p>
                <Link href="/booking/service">
                  <Button variant="primary" size="md" className="bg-[#003082] text-white font-bold">
                    Book Maintenance & Concierge Service
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {serviceOrders.map((srv) => {
                  const isConfirmed = srv.status === 'CONFIRMED' || srv.status === 'APPROVED';
                  const isCompleted = srv.status === 'COMPLETED';
                  const isCancelled = srv.status === 'CANCELLED';

                  return (
                    <Card key={srv.id} hoverEffect={false} className="p-5 bg-white border-[#BFBAAF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px]">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold uppercase text-[#000000]">{srv.serviceType || 'Track Maintenance'}</h3>

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
                            {isCompleted
                              ? 'COMPLETED / SERVICED'
                              : isConfirmed
                              ? '✓ CONFIRMED BY ADMIN'
                              : isCancelled
                              ? 'CANCELLED'
                              : 'SCHEDULED'}
                          </Badge>
                        </div>

                        <p className="text-xs text-[#60605B] font-bold">
                          Vehicle: <strong className="text-[#000000]">{srv.vehicleModel}</strong> · Date: <strong className="text-[#000000]">{srv.scheduledDate || srv.date}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteServiceOrder(srv.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Cancel Service Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 🚀 MODAL: UPLOAD / ADD CUSTOM VEHICLE */}
      {addVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md font-mono">
          <div className="bg-white border-2 border-[#003082] p-6 sm:p-8 rounded-[28px] max-w-xl w-full space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#BFBAAF] pb-3">
              <h3 className="text-lg font-extrabold uppercase text-[#000000] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#003082]" /> Upload / Publish Custom Vehicle
              </h3>
              <button onClick={() => setAddVehicleModalOpen(false)} className="text-gray-500 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleAddCustomVehicle} className="space-y-4 text-xs font-mono text-[#000000]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#000000] font-bold uppercase mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex"
                    value={newCarMake}
                    onChange={(e) => setNewCarMake(e.target.value)}
                    className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] font-bold uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Valkyrie GT"
                    value={newCarModel}
                    onChange={(e) => setNewCarModel(e.target.value)}
                    className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#000000] font-bold uppercase mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={newCarYear}
                    onChange={(e) => setNewCarYear(Number(e.target.value))}
                    className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] font-bold uppercase mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={newCarPrice}
                    onChange={(e) => setNewCarPrice(Number(e.target.value))}
                    className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#000000] font-bold uppercase mb-1">Engine Specs</label>
                  <input
                    type="text"
                    required
                    value={newCarEngine}
                    onChange={(e) => setNewCarEngine(e.target.value)}
                    className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#000000] font-bold uppercase mb-1">Horsepower (HP)</label>
                  <input
                    type="number"
                    required
                    value={newCarHP}
                    onChange={(e) => setNewCarHP(Number(e.target.value))}
                    className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#000000] font-bold uppercase mb-1">3D WebGL Model (.GLB)</label>
                <select
                  value={newCarGlb}
                  onChange={(e) => setNewCarGlb(e.target.value)}
                  className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                >
                  <option value="/models/ferrari.glb">Ferrari GT2 Supercar (/models/ferrari.glb)</option>
                  <option value="/models/bugatti.glb">Bugatti Hypercar (/models/bugatti.glb)</option>
                  <option value="/models/aston.glb">Aston Martin DBR9 Racing (/models/aston.glb)</option>
                  <option value="/models/martin.glb">Aston Martin GT Zagato (/models/martin.glb)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#000000] font-bold uppercase mb-1">Vehicle Image URL</label>
                <input
                  type="text"
                  value={newCarImg}
                  onChange={(e) => setNewCarImg(e.target.value)}
                  className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold"
                />
              </div>

              <div>
                <label className="block text-[#000000] font-bold uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCarDesc}
                  onChange={(e) => setNewCarDesc(e.target.value)}
                  placeholder="Describe your custom supercar specification..."
                  className="w-full bg-[#BFBAAF]/20 border border-[#60605B]/40 rounded-[10px] p-2.5 text-[#000000] outline-none focus:border-[#003082] font-bold resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="md" type="submit" className="flex-1 bg-[#003082] text-white font-bold">
                  Publish Vehicle to Showroom
                </Button>
                <Button variant="outline" size="md" type="button" onClick={() => setAddVehicleModalOpen(false)} className="border-[#000000] text-[#000000]">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </div>
  );
}
