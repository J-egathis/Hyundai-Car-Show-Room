import { NextResponse } from 'next/server';
import { MOCK_VEHICLES } from '../../../lib/mockData';

let globalVehicles: any[] = [...MOCK_VEHICLES];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(globalVehicles, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newVehicle = {
      id: body.id || `v${Date.now()}`,
      make: body.make || 'Apex',
      model: body.model || 'GT Spec',
      year: Number(body.year) || 2026,
      price: Number(body.price) || 185000,
      mileage: body.mileage || 150,
      fuelType: body.fuelType || 'V8 Hybrid',
      transmission: body.transmission || '8-Speed Dual-Clutch',
      bodyStyle: body.bodyStyle || 'Coupe',
      color: body.color || 'Amber Gold',
      engine: body.engine || 'V8 Twin-Turbo Electric Hybrid',
      horsepower: Number(body.horsepower) || 800,
      description: body.description || 'Newly listed luxury showroom vehicle.',
      images: body.images || [body.imageUrl || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'],
      status: body.status || 'AVAILABLE',
      featured: true,
      tenantId: 't1',
      mainCategory: body.mainCategory || 'Hypercars & Supercars',
      subCategory: body.subCategory || 'Electric Track Specialists',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateAdded: body.dateAdded || new Date().toISOString().split('T')[0],
    };

    globalVehicles = [newVehicle, ...globalVehicles];
    return NextResponse.json(globalVehicles, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save vehicle' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, ids } = body;
    if (ids && Array.isArray(ids)) {
      globalVehicles = globalVehicles.filter((v) => !ids.includes(v.id));
    } else if (id) {
      globalVehicles = globalVehicles.filter((v) => v.id !== id);
    }
    return NextResponse.json(globalVehicles, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 400, headers: corsHeaders });
  }
}
