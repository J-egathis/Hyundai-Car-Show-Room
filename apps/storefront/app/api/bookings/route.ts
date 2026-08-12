import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// SHARED PERSISTENT STORAGE FILE PATH
const STORAGE_FILE = path.join(process.cwd(), '..', '..', '.test_drives.json');

const INITIAL_SEED_BOOKINGS: any[] = [];

function readBookings(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading test drives storage file:', err);
  }
  writeBookings([]);
  return [];
}

function writeBookings(bookings: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing test drives storage file:', err);
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
    const currentBookings = readBookings();

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

    const existingIndex = currentBookings.findIndex((b) => b.id === newBooking.id);
    let updatedList: any[];
    if (existingIndex !== -1) {
      currentBookings[existingIndex] = { ...currentBookings[existingIndex], ...newBooking };
      updatedList = currentBookings;
    } else {
      updatedList = [newBooking, ...currentBookings];
    }

    writeBookings(updatedList);
    return NextResponse.json(updatedList, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid booking data' }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const currentBookings = readBookings();

    let found = false;
    const updatedList = currentBookings.map((b) => {
      if (b.id === id) {
        found = true;
        return { ...b, status };
      }
      return b;
    });

    if (!found && id) {
      updatedList.unshift({
        id,
        customerName: body.customerName || 'Anonymous Client',
        customerEmail: body.customerEmail || 'client@domain.com',
        customerPhone: body.customerPhone || '+1 (555) 000-1122',
        vehicleModel: body.vehicleModel || 'Apex CyberSUV Ultra',
        vehicleYear: 2026,
        date: body.date || new Date().toISOString().split('T')[0],
        time: body.time || '10:30 AM',
        locationType: 'SHOWROOM_TRACK',
        address: 'Flagship Showroom Track',
        status: status || 'PENDING',
        notes: '',
      });
    }

    writeBookings(updatedList);
    return NextResponse.json(updatedList, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : [body.id || body.ids];
    const currentBookings = readBookings();
    const updatedList = currentBookings.filter((b) => !ids.includes(b.id));

    writeBookings(updatedList);
    return NextResponse.json(updatedList, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400, headers: corsHeaders });
  }
}
