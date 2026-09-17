import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wardGroups = await db.attendantCard.groupBy({
      by: ['wardName'],
      orderBy: { wardName: 'asc' },
    });

    const wards = wardGroups.map((g) => g.wardName);

    return NextResponse.json({ wards });
  } catch (error) {
    console.error('Error fetching ward list:', error);
    return NextResponse.json({ wards: [] });
  }
}
