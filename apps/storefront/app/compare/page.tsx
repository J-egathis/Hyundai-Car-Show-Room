'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card, Badge, PriceTag } from '@showroom/ui';
import { MOCK_VEHICLES, CategorizedVehicle } from '../../lib/mockData';
import { Header } from '../../components/shared/Header';
import { Footer } from '../../components/shared/Footer';
import { AiChatDrawer } from '../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../components/shared/CookieConsent';
import {
  Car,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  Search,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const initialCar1Id = searchParams.get('car1') || 'h1';
  const initialCar2Id = searchParams.get('car2') || 'h2';

  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [vehicles, setVehicles] = useState<CategorizedVehicle[]>(MOCK_VEHICLES);

  const [car1Id, setCar1Id] = useState<string>(initialCar1Id);
  const [car2Id, setCar2Id] = useState<string>(initialCar2Id);
  const [car3Id, setCar3Id] = useState<string>('h3');

  const [selectingSlotIndex, setSelectingSlotIndex] = useState<number | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const fetchLiveVehicles = async () => {
    let list: any[] = [];
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        list = await res.json();
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const stored = localStorage.getItem('APEX_VEHICLES_STORE');
      if (stored) {
        const localList = JSON.parse(stored);
        localList.forEach((car: any) => {
          if (!list.some((c) => c.id === car.id)) {
            list.unshift(car);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (list.length > 0) {
      setVehicles(list);
    }
  };

  useEffect(() => {
    fetchLiveVehicles();
    window.addEventListener('storage', fetchLiveVehicles);
    return () => window.removeEventListener('storage', fetchLiveVehicles);
  }, []);

  const car1 = vehicles.find((v) => v.id === car1Id) || vehicles[0] || MOCK_VEHICLES[0];
  const car2 = vehicles.find((v) => v.id === car2Id) || vehicles[1] || MOCK_VEHICLES[1];
  const car3 = vehicles.find((v) => v.id === car3Id) || vehicles[2] || MOCK_VEHICLES[2];

  const selectedCars = [
    { label: 'Primary Comparison Vehicle', car: car1, setId: setCar1Id, currentId: car1Id },
    { label: 'Challenger Model 1', car: car2, setId: setCar2Id, currentId: car2Id },
    { label: 'Challenger Model 2', car: car3, setId: setCar3Id, currentId: car3Id },
  ];

  const maxHp = useMemo(() => {
    return Math.max(car1.horsepower || 0, car2.horsepower || 0, car3.horsepower || 0);
  }, [car1, car2, car3]);

  const minPrice = useMemo(() => {
    return Math.min(car1.price || 0, car2.price || 0, car3.price || 0);
  }, [car1, car2, car3]);

  const filteredModalVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (
        modalSearchQuery.trim() &&
        !v.make.toLowerCase().includes(modalSearchQuery.toLowerCase()) &&
        !v.model.toLowerCase().includes(modalSearchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [vehicles, modalSearchQuery]);

  return (
    <div className="min-h-screen bg-white text-[#063B00] font-mono">
      <Header onOpenAiChat={() => setAiChatOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#266210]/20 pb-6">
          <div>
            <Badge variant="amber">Side-By-Side Matrix</Badge>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#063B00] tracking-tight flex items-center gap-2 pt-1">
              <Sparkles className="w-8 h-8 text-[#266210]" /> Compare Vehicles Side-By-Side
            </h1>
            <p className="text-xs text-[#266210] font-bold mt-1">
              Select any 3 vehicles from our live showroom inventory to compare power, performance specs, pricing, and tech blueprints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCar1Id('h1');
                setCar2Id('h2');
                setCar3Id('h3');
              }}
              className="flex items-center gap-1.5 text-xs border-[#063B00] text-[#063B00] hover:bg-[#063B00] hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Comparison
            </Button>
          </div>
        </div>

        {/* 🏎️ TOP 3 INTERACTIVE CAR SELECTOR SLOTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedCars.map((slot, index) => (
            <Card
              key={index}
              hoverEffect={false}
              className="p-5 space-y-4 bg-[#F4F7F3] border-[#266210]/30 shadow-md relative"
            >
              <div className="flex items-center justify-between border-b border-[#266210]/20 pb-2">
                <span className="text-xs font-bold text-[#063B00] uppercase flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#266210]" /> Car {index + 1} Slot
                </span>
                <Badge variant={index === 0 ? 'amber' : index === 1 ? 'green' : 'blue'}>
                  {index === 0 ? 'PRIMARY' : `SLOT ${index + 1}`}
                </Badge>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] text-[#063B00] uppercase font-bold">
                  Select Vehicle:
                </label>
                <select
                  value={slot.currentId}
                  onChange={(e) => slot.setId(e.target.value)}
                  className="w-full bg-white text-[#063B00] text-xs px-3.5 py-3 rounded-[12px] border border-[#266210]/40 outline-none font-bold focus:border-[#063B00]"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.year}) - ${v.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative h-36 w-full rounded-[12px] overflow-hidden border border-[#266210]/30 group">
                <img
                  src={slot.car.images[0]}
                  alt={slot.car.model}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#063B00]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setSelectingSlotIndex(index)}
                    className="px-3.5 py-2 rounded-[10px] bg-[#063B00] text-white font-bold text-xs uppercase shadow-lg flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" /> Choose from Gallery
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-[#063B00] text-white px-2.5 py-1 rounded-[8px] text-[10px] font-bold">
                  {slot.car.horsepower} HP • {slot.car.fuelType}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 📊 COMPARISON MATRIX TABLE */}
        <Card hoverEffect={false} className="p-0 overflow-hidden bg-white border-[#266210]/30 shadow-xl">
          <div className="overflow-x-auto">
            <div className="min-w-[850px] grid grid-cols-4 divide-x divide-[#266210]/20">
              {/* SPEC LABELS COLUMN */}
              <div className="p-6 space-y-4 font-mono text-xs text-[#266210] uppercase bg-[#F4F7F3]">
                <div className="h-44 flex items-end pb-3 font-extrabold text-[#063B00] border-b border-[#266210]/20 text-sm">
                  Technical Parameters
                </div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Vehicle Model</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Model Year</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">MSRP Price</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Engine Powertrain</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Horsepower Output</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Fuel / Energy Type</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Transmission</div>
                <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#063B00]">Category Taxonomy</div>
                <div className="h-12 flex items-center font-bold text-[#063B00]">Actions</div>
              </div>

              {/* CAR COLUMNS */}
              {selectedCars.map((slot, i) => {
                const isMaxHp = slot.car.horsepower === maxHp && maxHp > 0;
                const isMinPrice = slot.car.price === minPrice && minPrice > 0;

                return (
                  <div key={i} className="p-6 space-y-4 font-mono text-xs text-[#063B00] bg-white">
                    <div className="h-44 space-y-2 border-b border-[#266210]/20 pb-3">
                      <img
                        src={slot.car.images[0]}
                        alt={slot.car.model}
                        className="w-full h-28 object-cover rounded-[10px] border border-[#266210]/20"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#266210] font-black uppercase">{slot.car.make}</span>
                        <Badge variant="amber">{slot.car.year}</Badge>
                      </div>
                    </div>

                    <div className="h-10 flex items-center font-black uppercase text-sm border-b border-[#266210]/20 text-[#063B00]">
                      {slot.car.model}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold">
                      {slot.car.year}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-extrabold">
                      <PriceTag price={slot.car.price} />
                      {isMinPrice && (
                        <span className="ml-2 text-[10px] bg-[#90B800]/30 text-[#063B00] px-2 py-0.5 rounded-full font-bold">
                          ★ Best Value
                        </span>
                      )}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#266210]">
                      {slot.car.engine || 'V8 Twin-Turbo'}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-black text-sm text-[#063B00]">
                      {slot.car.horsepower} HP
                      {isMaxHp && (
                        <span className="ml-2 text-[10px] bg-[#063B00] text-white px-2 py-0.5 rounded-full font-bold">
                          ⚡ Max HP
                        </span>
                      )}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#266210]">
                      {slot.car.fuelType}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#266210]">
                      {slot.car.transmission}
                    </div>

                    <div className="h-10 flex items-center border-b border-[#266210]/20 font-bold text-[#266210]">
                      {slot.car.mainCategory}
                    </div>

                    <div className="h-12 flex items-center gap-2 pt-1">
                      <Link href={`/vehicle/${slot.car.id}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full bg-[#063B00] text-white">
                          View 3D
                        </Button>
                      </Link>
                      <Link href={`/booking/test-drive?carId=${slot.car.id}`}>
                        <Button variant="outline" size="sm" className="border-[#063B00] text-[#063B00]">
                          Drive
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* GALLERY SELECTION MODAL */}
      {selectingSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md font-mono">
          <div className="bg-white border-2 border-[#063B00] p-6 rounded-[28px] max-w-2xl w-full space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#266210]/20 pb-3">
              <h3 className="text-sm font-extrabold uppercase text-[#063B00] flex items-center gap-2">
                <Car className="w-4 h-4 text-[#266210]" /> Select Vehicle for Slot {selectingSlotIndex + 1}
              </h3>
              <button
                onClick={() => setSelectingSlotIndex(null)}
                className="text-gray-500 hover:text-black font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search catalog make or model..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full bg-[#F4F7F3] text-[#063B00] p-3 rounded-[12px] border border-[#266210]/40 outline-none text-xs font-bold focus:border-[#063B00]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {filteredModalVehicles.map((car) => (
                <div
                  key={car.id}
                  onClick={() => {
                    if (selectingSlotIndex === 0) setCar1Id(car.id);
                    if (selectingSlotIndex === 1) setCar2Id(car.id);
                    if (selectingSlotIndex === 2) setCar3Id(car.id);
                    setSelectingSlotIndex(null);
                  }}
                  className="p-3 bg-[#F4F7F3] border border-[#266210]/30 rounded-[14px] cursor-pointer hover:border-[#063B00] hover:bg-white transition-all flex items-center gap-3"
                >
                  <img src={car.images[0]} alt={car.model} className="w-16 h-12 object-cover rounded-[8px]" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#266210] font-black uppercase block">{car.make}</span>
                    <span className="text-xs font-extrabold text-[#063B00] block">{car.model}</span>
                    <span className="text-[10px] text-[#063B00] font-bold block">${car.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </div>
  );
}
