import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '..', '..', '.test_drives.json');

function readBookings(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Admin API error reading test drives:', err);
  }
  return [];
}

function writeBookings(bookings: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Admin API error writing test drives:', err);
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
  const bookings = readBookings();
  return NextResponse.json(bookings, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = readBookings();
    const newBooking = {
      id: body.id || `TD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: body.customerName || 'Anonymous Client',
      customerEmail: body.customerEmail || 'client@domain.com',
      customerPhone: body.customerPhone || '+1 (555) 000-1122',
      vehicleModel: body.vehicleModel || 'Apex CyberSUV Ultra',
      vehicleYear: body.vehicleYear || 2026,
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '10:30 AM',
      locationType: body.locationType || 'SHOWROOM_TRACK',
      address: body.address || 'Flagship Showroom Track',
      status: body.status || 'PENDING',
      notes: body.notes || '',
    };
    const updated = [newBooking, ...current.filter((b) => b.id !== newBooking.id)];
    writeBookings(updated);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const current = readBookings();
    const updated = current.map((b) => (b.id === id ? { ...b, status } : b));
    writeBookings(updated);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : [body.id || body.ids];
    const current = readBookings();
    const updated = current.filter((b) => !ids.includes(b.id));
    writeBookings(updated);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400, headers: corsHeaders });
  }
}
