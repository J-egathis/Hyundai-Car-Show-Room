'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@showroom/ui';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  FolderPlus,
  Tag,
  ChevronRight,
  ListFilter,
  Sparkles,
} from 'lucide-react';

const SEED_CATEGORIES = [
  {
    name: 'Hypercars & Supercars',
    subCategories: [
      'Electric Track Specialists',
      'V12 Atmospheric Mechanical',
      'V8 Twin-Turbo Hybrids',
    ],
  },
  {
    name: 'Luxury SUVs',
    subCategories: [
      'Autonomous Air Suspensions',
      'Off-Road Armor Executives',
      'Performance Hybrid Crossovers',
    ],
  },
  {
    name: 'Executive Sedans',
    subCategories: [
      'Plug-in Hybrid Limousines',
      'Armored VIP Express',
      'Full Electric Long-Range',
    ],
  },
  {
    name: 'Grand Tourer Convertibles',
    subCategories: [
      'Open-Top Electric GTs',
      'Classic Roadster Classics',
      'Sport Convertible Cruisers',
    ],
  },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>(SEED_CATEGORIES);
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedMainForSub, setSelectedMainForSub] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // FETCH CATEGORIES FROM API AND LOCALSTORAGE
  const fetchCategories = async () => {
    let list: any[] = [];
    try {
      let res = await fetch('/api/categories');
      if (!res.ok) {
        res = await fetch('http://localhost:3000/api/categories');
      }
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
            const mergedSubs = Array.from(new Set([...list[idx].subCategories, ...cat.subCategories]));
            list[idx].subCategories = mergedSubs;
          } else {
            list.push(cat);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }

    if (list.length === 0) {
      list = SEED_CATEGORIES;
    }

    setCategories(list);
    if (!selectedMainForSub && list.length > 0) {
      setSelectedMainForSub(list[0].name);
    }
  };

  useEffect(() => {
    fetchCategories();
    window.addEventListener('storage', fetchCategories);
    return () => window.removeEventListener('storage', fetchCategories);
  }, []);

  const saveCategories = async (updated: any[]) => {
    setCategories(updated);

    // 1. Save to localStorage
    try {
      localStorage.setItem('APEX_CATEGORIES_STORE', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }

    // 2. Sync to API endpoints
    try {
      let res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updated }),
      });
      if (!res.ok) {
        await fetch('http://localhost:3000/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: updated }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADD NEW MAIN CATEGORY
  const handleAddMainCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMainCategory.trim()) return;

    const catName = newMainCategory.trim();
    if (categories.some((c) => c.name.toLowerCase() === catName.toLowerCase())) {
      alert('Category already exists!');
      return;
    }

    const updated = [...categories, { name: catName, subCategories: [] }];
    await saveCategories(updated);

    setNewMainCategory('');
    setToastMessage(`Created Main Category "${catName}"!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ADD NEW SUBCATEGORY
  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCategory.trim() || !selectedMainForSub) return;

    const subName = newSubCategory.trim();
    const updated = categories.map((cat) => {
      if (cat.name === selectedMainForSub) {
        if (!cat.subCategories.includes(subName)) {
          return { ...cat, subCategories: [...cat.subCategories, subName] };
        }
      }
      return cat;
    });

    await saveCategories(updated);

    setNewSubCategory('');
    setToastMessage(`Added Sub-Category "${subName}" to "${selectedMainForSub}"!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // DELETE MAIN OR SUBCATEGORY
  const handleDeleteCategory = async (mainCategory: string, subCategory?: string) => {
    if (!confirm(`Are you sure you want to delete ${subCategory ? `Sub-Category "${subCategory}"` : `Main Category "${mainCategory}"`}?`)) {
      return;
    }

    let updated: any[];
    if (subCategory) {
      updated = categories.map((cat) => {
        if (cat.name === mainCategory) {
          return { ...cat, subCategories: cat.subCategories.filter((s: string) => s !== subCategory) };
        }
        return cat;
      });
    } else {
      updated = categories.filter((cat) => cat.name !== mainCategory);
    }

    await saveCategories(updated);

    setToastMessage(`Deleted ${subCategory || mainCategory} successfully.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const totalMainCount = categories.length;
  const totalSubCount = categories.reduce((acc, cat) => acc + (cat.subCategories?.length || 0), 0);

  return (
    <div className="space-y-8 font-mono">
      {/* PAGE HEADER */}
      <div className="border-b border-[#3A3D42] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="amber">Live Storefront Synchronized</Badge>
          <h1 className="text-3xl font-extrabold uppercase text-[#E8ECF1] mt-1 flex items-center gap-3">
            <Layers className="w-8 h-8 text-[#F5A623]" /> Category & Subcategory Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Create and organize vehicle categories & subcategories. Changes update live in Storefront Inventory filters.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-amber-950/60 border border-[#F5A623] text-[#F5A623] rounded-[12px] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#F5A623]" /> {toastMessage}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-[#F5A623]/40">
          <span className="text-[#F5A623] text-[10px] uppercase block font-bold">Total Main Categories</span>
          <span className="text-2xl font-extrabold text-[#F5A623]">{totalMainCount}</span>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-[#3A3D42]/60 border-amber-500/40">
          <span className="text-amber-400 text-[10px] uppercase block font-bold">Total Sub-Categories</span>
          <span className="text-2xl font-extrabold text-amber-400">{totalSubCount}</span>
        </Card>
      </div>

      {/* CREATE FORMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. ADD MAIN CATEGORY FORM */}
        <Card hoverEffect={false} className="p-6 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
          <h3 className="text-sm font-extrabold uppercase text-[#E8ECF1] flex items-center gap-2 border-b border-[#52565E]/40 pb-3">
            <FolderPlus className="w-4 h-4 text-[#F5A623]" /> + Create Main Category
          </h3>
          <form onSubmit={handleAddMainCategory} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 uppercase mb-1">Main Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Electric Hyper-GTs"
                value={newMainCategory}
                onChange={(e) => setNewMainCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
              />
            </div>
            <Button variant="primary" size="sm" type="submit" className="w-full">
              + Add Main Category
            </Button>
          </form>
        </Card>

        {/* 2. ADD SUB-CATEGORY FORM */}
        <Card hoverEffect={false} className="p-6 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
          <h3 className="text-sm font-extrabold uppercase text-[#E8ECF1] flex items-center gap-2 border-b border-[#52565E]/40 pb-3">
            <Tag className="w-4 h-4 text-[#F5A623]" /> + Create Sub-Category
          </h3>
          <form onSubmit={handleAddSubCategory} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 uppercase mb-1">Select Parent Main Category</label>
              <select
                value={selectedMainForSub}
                onChange={(e) => setSelectedMainForSub(e.target.value)}
                className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 uppercase mb-1">Sub-Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Carbon Aerodynamic Track Edition"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] text-[#E8ECF1] p-3 rounded-[12px] border border-[#52565E]/60 outline-none focus:border-[#F5A623]"
              />
            </div>
            <Button variant="primary" size="sm" type="submit" className="w-full">
              + Add Sub-Category
            </Button>
          </form>
        </Card>
      </div>

      {/* CATEGORIES & SUBCATEGORIES TREE LIST */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-[#E8ECF1] flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-[#F5A623]" /> Active Category Taxonomy Structure
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} hoverEffect={false} className="p-5 bg-[#3A3D42]/60 border-[#52565E]/60 space-y-4">
              <div className="flex justify-between items-center border-b border-[#52565E]/40 pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-[#F5A623]" />
                  <h4 className="text-base font-extrabold text-[#E8ECF1] uppercase">{cat.name}</h4>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.name)}
                  title="Delete Main Category"
                  className="p-1.5 rounded-[8px] bg-red-950/60 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Subcategories list */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[10px] text-gray-400 uppercase block font-bold">Sub-Categories ({cat.subCategories?.length || 0}):</span>
                {cat.subCategories && cat.subCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {cat.subCategories.map((sub: string) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-2 bg-[#0D0D0D] text-[#E8ECF1] px-3 py-1.5 rounded-[8px] border border-[#52565E]/60 text-[11px]"
                      >
                        <Tag className="w-3 h-3 text-[#F5A623]" /> {sub}
                        <button
                          onClick={() => handleDeleteCategory(cat.name, sub)}
                          title="Delete Sub-Category"
                          className="text-gray-400 hover:text-red-400 ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-[11px]">No sub-categories added yet.</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
