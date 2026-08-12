import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), '..', '..', '.categories.json');

function readCategories(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Admin API error reading categories:', err);
  }
  return [];
}

function writeCategories(categories: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Admin API error writing categories:', err);
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
    let current = readCategories();
    if (body.categories && Array.isArray(body.categories)) {
      current = body.categories;
    }
    writeCategories(current);
    return NextResponse.json(current, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    let current = readCategories();
    if (body.categories && Array.isArray(body.categories)) {
      current = body.categories;
    }
    writeCategories(current);
    return NextResponse.json(current, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 400, headers: corsHeaders });
  }
}
