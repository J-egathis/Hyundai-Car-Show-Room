'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge, PriceTag } from '@showroom/ui';
import { MOCK_VEHICLES } from '../../lib/mockData';
import {
  Search,
  Shield,
  Zap,
  Award,
  Calendar,
  ArrowRight,
  Gauge,
  Cpu,
  Sparkles,
  RotateCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [searchMake, setSearchMake] = useState('');
  const [searchBody, setSearchBody] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const activeCar = MOCK_VEHICLES[selectedCarIndex] || MOCK_VEHICLES[0];
  const featured = MOCK_VEHICLES.filter((v) => v.featured);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 20, y: -y * 20 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden font-mono bg-white text-[#000000]">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-[#BFBAAF] pt-6">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#003082]/10 blur-[160px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12">
          {/* LEFT HERO TEXT & SEARCH */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[12px] bg-[#BFBAAF]/20 border border-[#003082] text-[#003082] text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN64oTdKISaR5X4Ta0q5F8sFN85kOqW_inzifw8-_n7kKrd5ykp2BxPFjs&s=10"
                alt="Hyundai Logo"
                className="w-5 h-4 object-contain rounded-[4px]"
              />
              <Sparkles className="w-4 h-4 text-[#003082] animate-spin" /> Hyundai Sapphire 3D Automotive Series
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#000000] uppercase leading-none">
              HYUNDAI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003082] via-[#60605B] to-[#003082]">
                MOTORS 3D
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#60605B] font-bold leading-relaxed max-w-xl">
              Experience interactive 3D Hyundai vehicle customization, AI-driven trade-in valuation, and white-glove executive home test drives.
            </p>

            {/* QUICK SEARCH BAR */}
            <div className="bg-[#BFBAAF]/20 backdrop-blur-xl p-3 rounded-[16px] border border-[#BFBAAF] shadow-xl flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-3 rounded-[12px] border border-[#60605B]/40">
                <Search className="w-4 h-4 text-[#003082]" />
                <input
                  type="text"
                  placeholder="Search model (Hyundai, Apex, Veloce)..."
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                  className="bg-transparent text-xs text-[#000000] font-bold placeholder-gray-400 outline-none w-full"
                />
              </div>

              <select
                value={searchBody}
                onChange={(e) => setSearchBody(e.target.value)}
                className="bg-white text-[#000000] font-bold text-xs px-3 py-3 rounded-[12px] border border-[#60605B]/40 outline-none"
              >
                <option value="">All Styles</option>
                <option value="SUV">SUV</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
              </select>

              <Link href={`/inventory?search=${searchMake}&bodyStyle=${searchBody}`}>
                <Button variant="primary" size="md" className="w-full sm:w-auto h-full bg-[#003082] text-white font-bold">
                  Explore <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT 3D INTERACTIVE HERO CARD */}
          <div className="lg:col-span-6 flex justify-center">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
              className="relative w-full max-w-lg bg-white border-2 border-[#003082] rounded-[32px] p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <Badge variant="amber">{activeCar.year} Model</Badge>
                <span className="text-xs text-[#60605B] font-black uppercase font-mono">{activeCar.make}</span>
              </div>

              <div className="h-64 rounded-[20px] overflow-hidden bg-[#BFBAAF]/20 relative border border-[#BFBAAF]">
                <img
                  src={activeCar.images[0]}
                  alt={activeCar.model}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-left">
                <h3 className="text-2xl font-black uppercase text-[#000000]">{activeCar.model}</h3>
                <div className="flex items-center justify-between">
                  <PriceTag price={activeCar.price} />
                  <span className="text-xs text-[#60605B] font-bold">{activeCar.horsepower} HP • {activeCar.fuelType}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/vehicle/${activeCar.id}`} className="flex-1">
                  <Button variant="primary" size="md" className="w-full bg-[#003082] text-white font-bold">
                    Inspect 3D Model 🏎
                  </Button>
                </Link>
                <Link href={`/booking/test-drive?carId=${activeCar.id}`}>
                  <Button variant="outline" size="md" className="border-[#000000] text-[#000000]">
                    Test Drive
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED INVENTORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#BFBAAF] pb-4">
          <div>
            <Badge variant="amber">Hyundai Bespoke Collection</Badge>
            <h2 className="text-3xl font-extrabold uppercase text-[#000000] pt-1">
              Featured Flagship Models
            </h2>
          </div>
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-white">
              View Full Catalog →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((car) => (
            <Card key={car.id} hoverEffect={true} className="p-0 bg-white border-[#BFBAAF] rounded-[20px] overflow-hidden shadow-lg space-y-4 flex flex-col justify-between">
              <div>
                <div className="h-52 w-full bg-[#BFBAAF]/20 relative overflow-hidden">
                  <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="amber">{car.year}</Badge>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#60605B] font-black uppercase">{car.make}</span>
                    <PriceTag price={car.price} />
                  </div>
                  <h3 className="text-lg font-extrabold uppercase text-[#000000]">{car.model}</h3>
                  <p className="text-xs text-[#60605B] line-clamp-2 font-bold">{car.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Link href={`/vehicle/${car.id}`} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full bg-[#003082] text-white font-bold">
                    <Eye className="w-3.5 h-3.5 text-[#BFBAAF] mr-1" /> 3D View
                  </Button>
                </Link>
                <Link href={`/booking/test-drive?carId=${car.id}`}>
                  <Button variant="outline" size="sm" className="border-[#000000] text-[#000000]">
                    Drive
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
