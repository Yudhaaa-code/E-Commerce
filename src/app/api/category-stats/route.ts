import { NextResponse } from 'next/server';
import { getCategoryOrderStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getCategoryOrderStats();
    return NextResponse.json({ stats });
  } catch (err) {
    return NextResponse.json({ stats: [], error: 'Failed to fetch category stats' }, { status: 500 });
  }
}
