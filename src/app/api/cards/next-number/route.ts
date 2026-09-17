import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wardParam = (searchParams.get('wardName') || '').trim();

    if (wardParam) {
      // Find cards matching this ward either in wardName or starting with wardParam-
      const cards = await db.attendantCard.findMany({
        where: {
          OR: [
            { wardName: { equals: wardParam } },
            { cardNumber: { startsWith: `${wardParam}-` } },
          ],
        },
        select: { cardNumber: true },
      });

      let maxNum = 0;
      for (const card of cards) {
        if (!card.cardNumber) continue;
        const match = card.cardNumber.match(/(\d+)$/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }

      const nextNum = maxNum + 1;
      const formattedNum = nextNum < 1000 ? String(nextNum).padStart(3, '0') : String(nextNum);
      const nextCardNumber = `${wardParam}-${formattedNum}`;

      return NextResponse.json({
        cardNumber: nextCardNumber,
        wardName: wardParam,
        nextNum,
      });
    }

    // Fallback if no wardName provided: check most recent card
    const lastCard = await db.attendantCard.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { cardNumber: true, wardName: true },
    });

    if (lastCard && lastCard.wardName) {
      const cards = await db.attendantCard.findMany({
        where: {
          OR: [
            { wardName: { equals: lastCard.wardName } },
            { cardNumber: { startsWith: `${lastCard.wardName}-` } },
          ],
        },
        select: { cardNumber: true },
      });

      let maxNum = 0;
      for (const card of cards) {
        const match = card.cardNumber?.match(/(\d+)$/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }

      const nextNum = maxNum + 1;
      const formattedNum = nextNum < 1000 ? String(nextNum).padStart(3, '0') : String(nextNum);
      return NextResponse.json({
        cardNumber: `${lastCard.wardName}-${formattedNum}`,
        wardName: lastCard.wardName,
        nextNum,
      });
    }

    // Default fallback
    return NextResponse.json({ cardNumber: 'AT-000001', wardName: '', nextNum: 1 });
  } catch (error) {
    console.error('Error generating card number:', error);
    return NextResponse.json({ cardNumber: 'AT-000001', wardName: '', nextNum: 1 });
  }
}
