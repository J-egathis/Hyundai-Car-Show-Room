'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, Badge, PriceTag } from '@showroom/ui';
import { MOCK_VEHICLES, CategorizedVehicle } from '../../lib/mockData';
import { Header } from '../../components/shared/Header';
import { Footer } from '../../components/shared/Footer';
import { AiChatDrawer } from '../../components/shared/AiChatDrawer';
import { CookieConsent } from '../../components/shared/CookieConsent';
import {
  SlidersHorizontal,
  Gauge,
  Cpu,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Sparkles,
  Box,
  Compass,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_MAIN_CATEGORIES = [
  'Hypercars & Supercars',
  'Luxury SUVs',
  'Executive Sedans',
  'Grand Tourer Convertibles',
];

const DEFAULT_SUB_CATEGORIES_MAP: Record<string, string[]> = {
  'Hypercars & Supercars': [
    'Electric Track Specialists',
    'V12 Atmospheric Mechanical',
    'V8 Twin-Turbo Hybrids',
  ],
  'Luxury SUVs': [
    'Autonomous Air Suspensions',
    'Off-Road Armor Executives',
    'Performance Hybrid Crossovers',
  ],
  'Executive Sedans': [
    'Plug-in Hybrid Limousines',
    'Armored VIP Express',
    'Full Electric Long-Range',
  ],
  'Grand Tourer Convertibles': [
    'Open-Top Electric GTs',
    'Classic Roadster Classics',
    'Sport Convertible Cruisers',
  ],
};

export default function InventoryPage() {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedVehicleModal, setSelectedVehicleModal] = useState<CategorizedVehicle | null>(null);

  const [vehicles, setVehicles] = useState<CategorizedVehicle[]>(MOCK_VEHICLES);
  const [mainCategories, setMainCategories] = useState<string[]>(DEFAULT_MAIN_CATEGORIES);
  const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, string[]>>(DEFAULT_SUB_CATEGORIES_MAP);

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('All Categories');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All Sub-Categories');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Hypercars & Supercars': true,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(450000);
  const [sortBy, setSortBy] = useState<string>('price_desc');

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
        if (Array.isArray(localList)) {
          localList.forEach((item: any) => {
            if (!list.some((v) => v.id === item.id)) {
              list.unshift(item);
            }
          });
        }
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

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedMainCategory !== 'All Categories' && v.mainCategory !== selectedMainCategory) {
        return false;
      }
      if (
        selectedSubCategory !== 'All Sub-Categories' &&
        v.subCategory !== selectedSubCategory
      ) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !v.make.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !v.model.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !v.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (v.price > maxPrice) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'hp_desc') return b.horsepower - a.horsepower;
      if (sortBy === 'year_desc') return b.year - a.year;
      return 0;
    });
  }, [vehicles, selectedMainCategory, selectedSubCategory, searchQuery, maxPrice, sortBy]);

  const resetAllFilters = () => {
    setSelectedMainCategory('All Categories');
    setSelectedSubCategory('All Sub-Categories');
    setSearchQuery('');
    setMaxPrice(450000);
    setSortBy('price_desc');
  };

  return (
    <div className="min-h-screen bg-white text-[#000000] font-mono">
      <Header onOpenAiChat={() => setAiChatOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BFBAAF] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="amber">Live Inventory Taxonomy</Badge>
              <span className="text-xs text-[#60605B] font-bold">
                Showing {filteredVehicles.length} of {vehicles.length} Models
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-[#000000] tracking-tight">
              Hypercars & Bespoke Inventory
            </h1>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAllFilters}
              className="flex items-center gap-1.5 text-xs border-[#000000] text-[#000000] hover:bg-[#003082] hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTERS */}
          <div className="space-y-6">
            <Card hoverEffect={false} className="p-5 space-y-6 bg-[#BFBAAF]/20 border-[#BFBAAF] shadow-md">
              <div className="flex justify-between items-center border-b border-[#BFBAAF] pb-3">
                <h3 className="text-sm font-extrabold uppercase text-[#000000] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#003082]" /> Category Taxonomy
                </h3>
                <span className="text-[10px] text-[#60605B] font-bold">({mainCategories.length} Main)</span>
              </div>

              <button
                onClick={() => {
                  setSelectedMainCategory('All Categories');
                  setSelectedSubCategory('All Sub-Categories');
                }}
                className={`w-full text-left p-3 rounded-[12px] text-xs font-bold uppercase transition-all flex items-center justify-between border ${
                  selectedMainCategory === 'All Categories'
                    ? 'bg-[#003082] text-white border-[#003082] shadow-md'
                    : 'bg-white text-[#000000] border-[#60605B]/30 hover:border-[#003082]'
                }`}
              >
                <span>🌐 All Categories ({vehicles.length})</span>
                {selectedMainCategory === 'All Categories' && <CheckCircle2 className="w-4 h-4 text-[#BFBAAF]" />}
              </button>

              <div className="space-y-3">
                {mainCategories.map((mainCat) => {
                  const subList = subCategoriesMap[mainCat] || [];
                  const isExpanded = expandedCategories[mainCat];
                  const isSelectedMain = selectedMainCategory === mainCat;
                  const categoryCarCount = vehicles.filter((v) => v.mainCategory === mainCat).length;

                  return (
                    <div key={mainCat} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCategoryExpand(mainCat)}
                          className={`w-full text-left p-2.5 rounded-[10px] text-xs font-bold uppercase transition-all flex items-center justify-between border ${
                            isSelectedMain
                              ? 'bg-[#003082] text-white border-[#003082]'
                              : 'bg-white text-[#000000] border-[#60605B]/30 hover:bg-[#BFBAAF]/20'
                          }`}
                        >
                          <span className="truncate">{mainCat} ({categoryCarCount})</span>
                          <ChevronRight
                            className={`w-4 h-4 text-[#003082] transition-transform ${
                              isExpanded ? 'rotate-90 text-[#003082]' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="pl-3 space-y-1 pt-1 border-l-2 border-[#003082]/40 ml-2">
                          <button
                            onClick={() => {
                              setSelectedMainCategory(mainCat);
                              setSelectedSubCategory('All Sub-Categories');
                            }}
                            className={`w-full text-left p-2 rounded-[8px] text-[11px] font-bold transition-all flex items-center justify-between ${
                              isSelectedMain && selectedSubCategory === 'All Sub-Categories'
                                ? 'bg-[#BFBAAF]/40 text-[#003082] font-black'
                                : 'text-[#60605B] hover:text-[#000000]'
                            }`}
                          >
                            <span>• All {mainCat}</span>
                          </button>

                          {subList.map((sub) => {
                            const isSelectedSub = isSelectedMain && selectedSubCategory === sub;
                            const subCarCount = vehicles.filter(
                              (v) => v.mainCategory === mainCat && v.subCategory === sub
                            ).length;

                            return (
                              <button
                                key={sub}
                                onClick={() => {
                                  setSelectedMainCategory(mainCat);
                                  setSelectedSubCategory(sub);
                                }}
                                className={`w-full text-left p-2 rounded-[8px] text-[11px] transition-all flex items-center justify-between font-bold ${
                                  isSelectedSub
                                    ? 'bg-[#003082] text-white font-extrabold shadow-sm'
                                    : 'text-[#60605B] hover:text-[#000000] hover:bg-white'
                                }`}
                              >
                                <span className="truncate">• {sub}</span>
                                <span className="text-[10px] opacity-70">({subCarCount})</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SEARCH FILTER */}
              <div className="space-y-2 pt-2 border-t border-[#BFBAAF]">
                <label className="block text-xs text-[#000000] uppercase font-bold">Search Make / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Apex, CyberSUV, V8..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none text-xs font-bold focus:border-[#003082]"
                />
              </div>

              {/* PRICE SLIDER */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <label className="text-[#000000] uppercase">Price Range Ceiling</label>
                  <span className="text-[#003082] font-black">${maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={500000}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#003082] cursor-pointer"
                />
              </div>

              {/* SORT BY */}
              <div className="space-y-2">
                <label className="block text-xs text-[#000000] uppercase font-bold">Sort Catalog By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white text-[#000000] p-3 rounded-[12px] border border-[#60605B]/40 outline-none text-xs font-bold focus:border-[#003082]"
                >
                  <option value="price_desc">Price: Highest to Lowest</option>
                  <option value="price_asc">Price: Lowest to Highest</option>
                  <option value="hp_desc">Performance: Highest Horsepower</option>
                  <option value="year_desc">Year: Newest Release</option>
                </select>
              </div>
            </Card>
          </div>

          {/* MAIN CATALOG GRID */}
          <div className="lg:col-span-3 space-y-6">
            {filteredVehicles.length === 0 ? (
              <Card hoverEffect={false} className="p-12 text-center bg-[#BFBAAF]/20 border-[#BFBAAF] space-y-4">
                <p className="text-[#60605B] font-bold">No vehicles match your active taxonomy filter criteria.</p>
                <Button variant="primary" size="md" onClick={resetAllFilters} className="bg-[#003082] text-white font-bold">
                  Reset All Filter Rules
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((car) => (
                  <Card
                    key={car.id}
                    hoverEffect={true}
                    className="p-0 bg-white border-[#BFBAAF] overflow-hidden rounded-[20px] space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-52 w-full bg-[#BFBAAF]/20 relative overflow-hidden group">
                        <img
                          src={car.images[0]}
                          alt={car.model}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <Badge variant="amber">{car.year}</Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-[#000000]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {car.subCategory || car.bodyStyle}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#60605B] font-black uppercase">{car.make}</span>
                          <PriceTag price={car.price} />
                        </div>
                        <h3 className="text-lg font-extrabold uppercase text-[#000000]">{car.model}</h3>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#60605B] pt-1 border-t border-[#BFBAAF]">
                          <div className="flex items-center gap-1 text-[#003082]">
                            <Zap className="w-3.5 h-3.5 text-[#003082]" /> {car.horsepower} HP
                          </div>
                          <div className="flex items-center gap-1 text-[#60605B]">
                            <Gauge className="w-3.5 h-3.5 text-[#000000]" /> {car.fuelType}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2">
                      <Link href={`/vehicle/${car.id}`} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full bg-[#003082] text-white font-bold">
                          <Eye className="w-3.5 h-3.5 text-[#BFBAAF] mr-1" /> 3D View
                        </Button>
                      </Link>
                      <Link href={`/booking/test-drive?carId=${car.id}`}>
                        <Button variant="outline" size="sm" className="border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-white">
                          Drive
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <AiChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <CookieConsent />
    </div>
  );
}
