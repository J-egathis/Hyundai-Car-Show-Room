'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Badge, PriceTag } from '@showroom/ui';
import { MOCK_VEHICLES as INITIAL_MOCK } from '../../lib/mockData';
import {
  Plus,
  Trash2,
  Edit3,
  Car,
  Upload,
  Link as LinkIcon,
  Search,
  Filter,
  Calendar,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  X,
  Layers,
  Tag,
} from 'lucide-react';

const DEFAULT_CATEGORIES_MAP: Record<string, string[]> = {
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

export default function AdminInventoryPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // INDIVIDUAL FILTERS STATE
  const [nameFilter, setNameFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [bodyFilter, setBodyFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // DYNAMIC CATEGORIES MAP FROM API & LOCALSTORAGE
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string[]>>(DEFAULT_CATEGORIES_MAP);

  // FETCH LIVE VEHICLES FROM API & LOCALSTORAGE
  const fetchLiveVehicles = async () => {
    let combined: any[] = [];
    try {
      const res = await fetch('http://localhost:3000/api/vehicles');
      if (res.ok) {
        combined = await res.json();
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const stored = localStorage.getItem('APEX_VEHICLES_STORE');
      if (stored) {
        const localList = JSON.parse(stored);
        localList.forEach((car: any) => {
          if (!combined.some((c) => c.id === car.id)) {
            combined.unshift(car);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (combined.length === 0) {
      combined = INITIAL_MOCK.map((car, idx) => ({
        ...car,
        dateAdded: `2026-08-0${(idx % 7) + 1}`,
      }));
    }

    setVehicles(combined);
  };

  const fetchCategories = async () => {
    let list: any[] = [];
    try {
      const res = await fetch('http://localhost:3000/api/categories');
      if (res.ok) {
        list = await res.json();
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const stored = localStorage.getItem('APEX_CATEGORIES_STORE');
      if (stored) {
        const localList = JSON.parse(stored);
        localList.forEach((cat: any) => {
          const idx = list.findIndex((c) => c.name.toLowerCase() === cat.name.toLowerCase());
          if (idx !== -1) {
            list[idx].subCategories = Array.from(new Set([...list[idx].subCategories, ...cat.subCategories]));
          } else {
            list.push(cat);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (list.length > 0) {
      const map: Record<string, string[]> = {};
      list.forEach((c) => {
        map[c.name] = c.subCategories || [];
      });
      setCategoriesMap(map);
    }
  };

  useEffect(() => {
    fetchLiveVehicles();
    fetchCategories();
    window.addEventListener('storage', fetchLiveVehicles);
    window.addEventListener('storage', fetchCategories);
    const interval = setInterval(fetchLiveVehicles, 2000);
    return () => {
      window.removeEventListener('storage', fetchLiveVehicles);
      window.removeEventListener('storage', fetchCategories);
      clearInterval(interval);
    };
  }, []);

  // MODAL STATE FOR ADD VEHICLE
  const [modalOpen, setModalOpen] = useState(false);
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    year: 2026,
    price: 185000,
    mainCategory: 'Hypercars & Supercars',
    subCategory: 'Electric Track Specialists',
    bodyStyle: 'Coupe',
    fuelType: 'V8 Hybrid',
    horsepower: 800,
    dateAdded: new Date().toISOString().split('T')[0],
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  });

  // FILTERED VEHICLES COMPUTED
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (
        nameFilter &&
        !v.make.toLowerCase().includes(nameFilter.toLowerCase()) &&
        !v.model.toLowerCase().includes(nameFilter.toLowerCase())
      ) {
        return false;
      }
      if (yearFilter !== 'All' && String(v.year) !== yearFilter) {
        return false;
      }
      if (bodyFilter !== 'All' && v.bodyStyle !== bodyFilter) {
        return false;
      }
      if (dateFilter !== '' && v.dateAdded !== dateFilter) {
        return false;
      }
      return true;
    });
  }, [vehicles, nameFilter, yearFilter, bodyFilter, dateFilter]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(vehicles.map((v) => String(v.year))));
    return years.sort().reverse();
  }, [vehicles]);

  const availableBodyStyles = useMemo(() => {
    return Array.from(new Set(vehicles.map((v) => v.bodyStyle))).sort();
  }, [vehicles]);

  // INDIVIDUAL DELETE
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle from inventory?')) {
      const updated = vehicles.filter((v) => v.id !== id);
      setVehicles(updated);
      setSelectedIds((prev) => prev.filter((item) => item !== id));

      localStorage.setItem('APEX_VEHICLES_STORE', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      try {
        await fetch('http://localhost:3000/api/vehicles', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // BULK DELETE
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected vehicles?`)) {
      const updated = vehicles.filter((v) => !selectedIds.includes(v.id));
      const deletedIds = [...selectedIds];
      setVehicles(updated);
      setSelectedIds([]);

      localStorage.setItem('APEX_VEHICLES_STORE', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      try {
        await fetch('http://localhost:3000/api/vehicles', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: deletedIds }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // SELECT ALL / DESELECT ALL
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredVehicles.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // RESET FILTERS
  const resetFilters = () => {
    setNameFilter('');
    setYearFilter('All');
    setBodyFilter('All');
    setDateFilter('');
  };

  // FILE UPLOAD HANDLER
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCar((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ADD NEW VEHICLE HANDLER (WITH API & LOCALSTORAGE PERSISTENCE)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `v${Date.now()}`,
      make: newCar.make || 'Apex',
      model: newCar.model || 'GT Spec',
      year: Number(newCar.year) || 2026,
      price: Number(newCar.price) || 185000,
      bodyStyle: newCar.bodyStyle || 'Coupe',
      fuelType: newCar.fuelType || 'V8 Hybrid',
      horsepower: Number(newCar.horsepower) || 800,
      description: 'Newly listed executive showroom vehicle.',
      images: [newCar.imageUrl || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'],
      status: 'AVAILABLE' as const,
      featured: true,
      tenantId: 't1',
      mainCategory: newCar.mainCategory || 'Hypercars & Supercars',
      subCategory: newCar.subCategory || 'Electric Track Specialists',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateAdded: newCar.dateAdded || new Date().toISOString().split('T')[0],
    };

    const updated = [created, ...vehicles];
    setVehicles(updated);
    setModalOpen(false);

    // Persist to localStorage & dispatch storage event for storefront!
    localStorage.setItem('APEX_VEHICLES_STORE', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    // POST to shared API
    try {
      await fetch('http://localhost:3000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
    } catch (err) {
      console.error(err);
    }

    // Reset input fields
    setNewCar({
      make: '',
      model: '',
      year: 2026,
      price: 185000,
      mainCategory: 'Hypercars & Supercars',
      subCategory: 'Electric Track Specialists',
      bodyStyle: 'Coupe',
      fuelType: 'V8 Hybrid',
      horsepower: 800,
      dateAdded: new Date().toISOString().split('T')[0],
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    });
  };

  const isAllSelected =
    filteredVehicles.length > 0 &&
    filteredVehicles.every((v) => selectedIds.includes(v.id));

  const mainCategoryList = Object.keys(categoriesMap);
  const subCategoryList = categoriesMap[newCar.mainCategory] || [];

  return (
    <div className="space-y-6 font-mono">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3A3D42] pb-6">
        <div>
          <Badge variant="amber">Real-Time Inventory Management</Badge>
          <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1">
            Showroom Vehicle Management ({vehicles.length})
          </h1>
        </div>

        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded-[12px] bg-red-950 border border-red-500 text-red-400 font-bold hover:bg-red-900 transition-colors flex items-center gap-2 text-xs"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Vehicle
          </Button>
        </div>
      </div>

      {/* FILTER TOOLBAR STRIP */}
      <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between text-xs">
          {/* Name / Make / Model Search */}
          <div className="w-full sm:w-64">
            <label className="block text-gray-400 text-[10px] uppercase mb-1">
              Search Make or Model
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CyberSUV, Veloce..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full bg-[#0D0D0D] text-[#E8ECF1] pl-8 pr-3 py-2 rounded-[10px] border border-[#52565E] outline-none focus:border-[#F5A623]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Year Filter Dropdown */}
          <div className="w-full sm:w-36">
            <label className="block text-gray-400 text-[10px] uppercase mb-1">
              Filter Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-[#0D0D0D] text-[#E8ECF1] px-3 py-2 rounded-[10px] border border-[#52565E] outline-none focus:border-[#F5A623]"
            >
              <option value="All">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Body Style Filter Dropdown */}
          <div className="w-full sm:w-40">
            <label className="block text-gray-400 text-[10px] uppercase mb-1">
              Body Style
            </label>
            <select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
              className="w-full bg-[#0D0D0D] text-[#E8ECF1] px-3 py-2 rounded-[10px] border border-[#52565E] outline-none focus:border-[#F5A623]"
            >
              <option value="All">All Styles</option>
              {availableBodyStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          {/* Date Added Date Picker Filter */}
          <div className="w-full sm:w-44">
            <label className="block text-gray-400 text-[10px] uppercase mb-1">
              Date Added
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#0D0D0D] text-[#E8ECF1] px-3 py-2 rounded-[10px] border border-[#52565E] outline-none focus:border-[#F5A623]"
            />
          </div>

          {/* Reset Filters Button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 rounded-[10px] bg-[#0D0D0D] border border-[#52565E] text-gray-300 hover:text-[#F5A623] hover:border-[#F5A623] transition-colors flex items-center gap-1.5 font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </Card>

      {/* INVENTORY TABLE */}
      <Card hoverEffect={false} className="p-0 overflow-hidden bg-[#3A3D42]/60 border-[#52565E]/60 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0D0D0D] text-[#F5A623] uppercase border-b border-[#52565E]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="accent-[#F5A623] w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4">Vehicle Preview</th>
                <th className="p-4">Category & Subcategory</th>
                <th className="p-4">Year & Style</th>
                <th className="p-4">Price ($ USD)</th>
                <th className="p-4">Date Added</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#52565E]/40">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    No vehicles match your active filters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((car) => {
                  const isSelected = selectedIds.includes(car.id);
                  return (
                    <tr
                      key={car.id}
                      className={`hover:bg-[#3A3D42]/80 transition-colors ${
                        isSelected ? 'bg-[#F5A623]/10' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(car.id)}
                          className="accent-[#F5A623] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Preview Image & Make/Model */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={car.images[0]}
                            alt={car.model}
                            className="w-14 h-10 object-cover rounded-[8px] border border-[#52565E]"
                          />
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase block font-bold">
                              {car.make}
                            </span>
                            <span className="font-extrabold text-[#E8ECF1] uppercase text-sm block">
                              {car.model}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="p-4 space-y-0.5">
                        <span className="font-bold text-[#F5A623] text-xs block">
                          {car.mainCategory || 'Hypercars & Supercars'}
                        </span>
                        <span className="text-[11px] text-gray-300 block">
                          {car.subCategory || 'Electric Track Specialists'}
                        </span>
                      </td>

                      {/* Year & Body Style */}
                      <td className="p-4">
                        <span className="font-bold text-[#E8ECF1] block">{car.year}</span>
                        <span className="text-[10px] text-gray-400 uppercase block">
                          {car.bodyStyle}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-black text-emerald-400 text-sm">
                        ${car.price.toLocaleString()}
                      </td>

                      {/* Date Added */}
                      <td className="p-4 text-gray-300 font-mono text-xs">
                        📅 {car.dateAdded}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="p-2 rounded-[8px] bg-red-950/80 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs"
                          title="Delete Vehicle"
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

      {/* 🚀 ADD NEW VEHICLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0D0D0D] border border-[#F5A623] rounded-[20px] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center p-6 border-b border-[#52565E] bg-[#3A3D42] shrink-0">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-lg font-extrabold uppercase text-[#E8ECF1]">
                  Add New Showroom Vehicle
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL SCROLLABLE BODY */}
            <form onSubmit={handleAdd} className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-6 space-y-4 text-xs font-mono">
                {/* Make & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 uppercase mb-1">Make / Manufacturer</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex, Veloce, Kronos"
                      value={newCar.make}
                      onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 uppercase mb-1">Model Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CyberSUV Ultra"
                      value={newCar.model}
                      onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                {/* 📂 CATEGORY & SUBCATEGORY SELECTION DROPDOWNS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#3A3D42]/60 rounded-[12px] border border-[#F5A623]/40">
                  <div>
                    <label className="block text-[#F5A623] uppercase font-bold mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Main Category
                    </label>
                    <select
                      value={newCar.mainCategory}
                      onChange={(e) => {
                        const selectedMain = e.target.value;
                        const subList = categoriesMap[selectedMain] || [];
                        setNewCar({
                          ...newCar,
                          mainCategory: selectedMain,
                          subCategory: subList[0] || 'General Edition',
                        });
                      }}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    >
                      {mainCategoryList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#F5A623] uppercase font-bold mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Sub-Category
                    </label>
                    <select
                      value={newCar.subCategory}
                      onChange={(e) => setNewCar({ ...newCar, subCategory: e.target.value })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    >
                      {subCategoryList.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Year & Body Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 uppercase mb-1">Year</label>
                    <input
                      type="number"
                      required
                      value={newCar.year}
                      onChange={(e) => setNewCar({ ...newCar, year: Number(e.target.value) })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 uppercase mb-1">Body Style</label>
                    <select
                      value={newCar.bodyStyle}
                      onChange={(e) => setNewCar({ ...newCar, bodyStyle: e.target.value })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    >
                      <option value="Coupe">Coupe</option>
                      <option value="SUV">SUV</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hypercar">Hypercar</option>
                    </select>
                  </div>
                </div>

                {/* Power (HP) & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 uppercase mb-1">Power (Horsepower HP)</label>
                    <input
                      type="number"
                      required
                      placeholder="850"
                      value={newCar.horsepower}
                      onChange={(e) => setNewCar({ ...newCar, horsepower: Number(e.target.value) })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 uppercase mb-1">Price ($ USD)</label>
                    <input
                      type="number"
                      required
                      placeholder="185000"
                      value={newCar.price}
                      onChange={(e) => setNewCar({ ...newCar, price: Number(e.target.value) })}
                      className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                    />
                  </div>
                </div>

                {/* Date Added Input */}
                <div>
                  <label className="block text-gray-300 uppercase mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#F5A623]" /> Date Added
                  </label>
                  <input
                    type="date"
                    required
                    value={newCar.dateAdded}
                    onChange={(e) => setNewCar({ ...newCar, dateAdded: e.target.value })}
                    className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none focus:border-[#F5A623]"
                  />
                </div>

                {/* Image Selection Type */}
                <div className="space-y-3 pt-2 border-t border-[#52565E]">
                  <label className="block text-[#F5A623] uppercase font-bold">
                    Vehicle Image Input Method
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setImageInputType('url')}
                      className={`flex-1 p-2.5 rounded-[12px] border flex items-center justify-center gap-2 uppercase text-[11px] ${
                        imageInputType === 'url'
                          ? 'bg-[#F5A623] text-[#0D0D0D] font-bold border-[#F5A623]'
                          : 'bg-[#0D0D0D] text-gray-300 border-[#52565E]'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputType('file')}
                      className={`flex-1 p-2.5 rounded-[12px] border flex items-center justify-center gap-2 uppercase text-[11px] ${
                        imageInputType === 'file'
                          ? 'bg-[#F5A623] text-[#0D0D0D] font-bold border-[#F5A623]'
                          : 'bg-[#0D0D0D] text-gray-300 border-[#52565E]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                  </div>

                  {imageInputType === 'url' ? (
                    <div>
                      <label className="block text-gray-400 uppercase text-[10px] mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newCar.imageUrl}
                        onChange={(e) => setNewCar({ ...newCar, imageUrl: e.target.value })}
                        className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E] outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-gray-400 uppercase text-[10px] mb-1">
                        Select Image File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-2.5 rounded-[12px] border border-[#52565E] outline-none text-xs"
                      />
                    </div>
                  )}

                  {/* Live Image Preview */}
                  {newCar.imageUrl && (
                    <div className="pt-2">
                      <span className="block text-[10px] text-gray-400 uppercase mb-1">
                        Image Preview:
                      </span>
                      <img
                        src={newCar.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-[12px] border border-[#F5A623]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* FIXED STICKY FOOTER WITH BUTTONS */}
              <div className="flex gap-3 justify-end p-6 border-t border-[#52565E] bg-[#3A3D42] shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit">
                  Save & Publish Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
