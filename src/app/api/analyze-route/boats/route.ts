import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createAdminSupabase();
  const { data } = await supabase.from('boat_profiles').select('*');
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const supabase = createAdminSupabase();
  const body = await req.json();
  const { data } = await supabase.from('boat_profiles').insert(body).select();
  return NextResponse.json(data?.[0]);
}