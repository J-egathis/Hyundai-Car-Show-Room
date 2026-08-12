import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '..', '..', '.service_bookings.json');

function readOrders(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Admin API error reading service bookings:', err);
  }
  return [];
}

function writeOrders(orders: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Admin API error writing service bookings:', err);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  const orders = readOrders();
  return NextResponse.json(orders, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = readOrders();
    const newOrder = {
      id: body.id || `SRV-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: body.customerName || 'Anonymous Client',
      customerPhone: body.customerPhone || '+1 (555) 000-1122',
      customerAddress: body.customerAddress || 'Showroom Service Bay',
      vehicleModel: body.vehicleModel || 'Apex Showroom Vehicle',
      vehicleYear: body.vehicleYear || '2026',
      serviceType: body.serviceType || 'General Maintenance',
      technician: body.technician || 'Marcus Vance (Master Tech)',
      progress: body.progress || 10,
      stage: body.stage || 'Checked In',
      pickupType: body.pickupType || 'SHOWROOM_DROPOFF',
      pickupRequired: body.pickupType === 'VALET_PICKUP',
      scheduledDate: body.scheduledDate || body.date || new Date().toISOString().split('T')[0],
      scheduledTime: body.scheduledTime || body.time || '09:00 AM',
      date: body.scheduledDate || body.date || new Date().toISOString().split('T')[0],
      time: body.scheduledTime || body.time || '09:00 AM',
      status: body.status || 'PENDING',
    };
    const updated = [newOrder, ...current];
    writeOrders(updated);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, progress, stage, status } = body;
    const current = readOrders();
    const updated = current.map((s) => (s.id === id ? { ...s, progress, stage, status } : s));
    writeOrders(updated);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : [body.id || body.ids];
    const current = readOrders();
    const updated = current.filter((s) => !ids.includes(s.id));
    writeOrders(updated);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400, headers: corsHeaders });
  }
}
