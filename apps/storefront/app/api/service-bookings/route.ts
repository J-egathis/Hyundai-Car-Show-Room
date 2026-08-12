import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// SHARED PERSISTENT STORAGE FILE PATH
const STORAGE_FILE = path.join(process.cwd(), '..', '..', '.service_bookings.json');

const INITIAL_SEED_SERVICES: any[] = [];

function readServiceOrders(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading service bookings storage file:', err);
  }
  writeServiceOrders([]);
  return [];
}

function writeServiceOrders(orders: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing service bookings storage file:', err);
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
  const orders = readServiceOrders();
  return NextResponse.json(orders, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentOrders = readServiceOrders();

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

    const updatedList = [newOrder, ...currentOrders];
    writeServiceOrders(updatedList);
    return NextResponse.json(updatedList, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid service order data' }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, progress, stage, status } = body;
    const currentOrders = readServiceOrders();

    let found = false;
    const updatedList = currentOrders.map((s) => {
      if (s.id === id) {
        found = true;
        return { ...s, progress, stage, status };
      }
      return s;
    });

    if (!found) {
      updatedList.unshift({
        id,
        progress: progress || 10,
        stage: stage || 'Checked In',
        status: status || 'PENDING',
        customerName: 'Client Order',
        customerPhone: '',
        customerAddress: '',
        vehicleModel: '',
        vehicleYear: '2026',
        serviceType: '',
        technician: 'Marcus Vance',
        pickupType: 'SHOWROOM_DROPOFF',
        pickupRequired: false,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00 AM',
      });
    }

    writeServiceOrders(updatedList);
    return NextResponse.json(updatedList, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : [body.id || body.ids];
    const currentOrders = readServiceOrders();
    const updatedList = currentOrders.filter((s) => !ids.includes(s.id));

    writeServiceOrders(updatedList);
    return NextResponse.json(updatedList, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400, headers: corsHeaders });
  }
}
