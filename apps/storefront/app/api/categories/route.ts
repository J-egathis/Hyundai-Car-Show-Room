import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '..', '..', '.categories.json');

const INITIAL_DEFAULT_CATEGORIES = [
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

function readCategories(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading categories storage file:', err);
  }
  writeCategories(INITIAL_DEFAULT_CATEGORIES);
  return INITIAL_DEFAULT_CATEGORIES;
}

function writeCategories(categories: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing categories storage file:', err);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  const categories = readCategories();
  return NextResponse.json(categories, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let currentCategories = readCategories();

    if (body.categories && Array.isArray(body.categories)) {
      currentCategories = body.categories;
    } else {
      const { action, mainCategory, subCategory } = body;
      if (action === 'ADD_MAIN') {
        if (mainCategory && !currentCategories.some((c) => c.name.toLowerCase() === mainCategory.toLowerCase())) {
          currentCategories.push({
            name: mainCategory,
            subCategories: subCategory ? [subCategory] : [],
          });
        }
      } else if (action === 'ADD_SUB') {
        const target = currentCategories.find((c) => c.name.toLowerCase() === mainCategory.toLowerCase());
        if (target && subCategory) {
          if (!target.subCategories.includes(subCategory)) {
            target.subCategories.push(subCategory);
          }
        }
      }
    }

    writeCategories(currentCategories);
    return NextResponse.json(currentCategories, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    let currentCategories = readCategories();

    if (body.categories && Array.isArray(body.categories)) {
      currentCategories = body.categories;
    } else {
      const { mainCategory, subCategory } = body;
      if (subCategory) {
        const target = currentCategories.find((c) => c.name.toLowerCase() === mainCategory.toLowerCase());
        if (target) {
          target.subCategories = target.subCategories.filter((s: string) => s !== subCategory);
        }
      } else if (mainCategory) {
        currentCategories = currentCategories.filter((c) => c.name.toLowerCase() !== mainCategory.toLowerCase());
      }
    }

    writeCategories(currentCategories);
    return NextResponse.json(currentCategories, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400, headers: corsHeaders });
  }
}
