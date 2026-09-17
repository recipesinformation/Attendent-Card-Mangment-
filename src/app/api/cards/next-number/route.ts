import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lastCard = await db.attendantCard.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { cardNumber: true },
    });

    let nextNum = 1;
    if (lastCard && lastCard.cardNumber) {
      const match = lastCard.cardNumber.match(/AT-(\d+)/i);
      if (match && match[1]) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    const nextCardNumber = `AT-${String(nextNum).padStart(6, '0')}`;
    return NextResponse.json({ cardNumber: nextCardNumber });
  } catch (error) {
    console.error('Error generating card number:', error);
    return NextResponse.json({ cardNumber: 'AT-000001' });
  }
}
