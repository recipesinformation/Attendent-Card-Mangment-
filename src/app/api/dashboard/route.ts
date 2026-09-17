import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [
      todaysCards,
      activeCards,
      returnedCards,
      paymentSums,
      recentCards,
    ] = await Promise.all([
      db.attendantCard.count({
        where: { dateOfIssue: { gte: startOfToday, lte: endOfToday } },
      }),
      db.attendantCard.count({
        where: { status: 'ACTIVE' },
      }),
      db.attendantCard.count({
        where: { status: 'RETURNED' },
      }),
      db.attendantCard.aggregate({
        _sum: {
          paymentReceived: true,
          returnPayment: true,
          netReceived: true,
        },
      }),
      db.attendantCard.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          cardNumber: true,
          mrNumber: true,
          patientName: true,
          attendantName: true,
          phoneNumber: true,
          wardName: true,
          paymentReceived: true,
          returnPayment: true,
          netReceived: true,
          status: true,
          dateOfIssue: true,
        },
      }),
    ]);

    const formattedRecentCards = recentCards.map((c) => ({
      ...c,
      paymentReceived: Number(c.paymentReceived),
      returnPayment: Number(c.returnPayment),
      netReceived: Number(c.netReceived),
    }));

    return NextResponse.json({
      metrics: {
        todaysCards,
        activeCards,
        returnedCards,
        paymentReceived: Number(paymentSums._sum.paymentReceived || 0),
        returnPayment: Number(paymentSums._sum.returnPayment || 0),
        netReceived: Number(paymentSums._sum.netReceived || 0),
      },
      recentCards: formattedRecentCards,
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
