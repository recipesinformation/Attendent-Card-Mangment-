import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'DAILY';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const now = new Date();

    if (type === 'DAILY') {
      const targetDate = fromDate ? new Date(fromDate) : now;
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);

      const where: Prisma.AttendantCardWhereInput = {
        dateOfIssue: { gte: startOfDay, lte: endOfDay },
      };

      const [totalCards, activeCards, returnedCards, sums, cards] = await Promise.all([
        db.attendantCard.count({ where }),
        db.attendantCard.count({ where: { ...where, status: 'ACTIVE' } }),
        db.attendantCard.count({ where: { ...where, status: 'RETURNED' } }),
        db.attendantCard.aggregate({
          where,
          _sum: {
            paymentReceived: true,
            returnPayment: true,
            netReceived: true,
          },
        }),
        db.attendantCard.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return NextResponse.json({
        reportType: 'DAILY',
        date: startOfDay.toISOString().split('T')[0],
        summary: {
          totalCards,
          activeCards,
          returnedCards,
          paymentReceived: Number(sums._sum.paymentReceived || 0),
          returnPayment: Number(sums._sum.returnPayment || 0),
          netReceived: Number(sums._sum.netReceived || 0),
        },
        cards: cards.map((c) => ({
          ...c,
          paymentReceived: Number(c.paymentReceived),
          returnPayment: Number(c.returnPayment),
          netReceived: Number(c.netReceived),
        })),
      });
    }

    if (type === 'DATE_RANGE') {
      const start = fromDate ? new Date(fromDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = toDate ? new Date(toDate) : now;
      end.setHours(23, 59, 59, 999);

      const where: Prisma.AttendantCardWhereInput = {
        dateOfIssue: { gte: start, lte: end },
      };

      const [totalCards, activeCards, returnedCards, sums, cards] = await Promise.all([
        db.attendantCard.count({ where }),
        db.attendantCard.count({ where: { ...where, status: 'ACTIVE' } }),
        db.attendantCard.count({ where: { ...where, status: 'RETURNED' } }),
        db.attendantCard.aggregate({
          where,
          _sum: {
            paymentReceived: true,
            returnPayment: true,
            netReceived: true,
          },
        }),
        db.attendantCard.findMany({
          where,
          orderBy: { dateOfIssue: 'desc' },
        }),
      ]);

      return NextResponse.json({
        reportType: 'DATE_RANGE',
        fromDate: start.toISOString().split('T')[0],
        toDate: end.toISOString().split('T')[0],
        summary: {
          totalCards,
          activeCards,
          returnedCards,
          paymentReceived: Number(sums._sum.paymentReceived || 0),
          returnPayment: Number(sums._sum.returnPayment || 0),
          netReceived: Number(sums._sum.netReceived || 0),
        },
        cards: cards.map((c) => ({
          ...c,
          paymentReceived: Number(c.paymentReceived),
          returnPayment: Number(c.returnPayment),
          netReceived: Number(c.netReceived),
        })),
      });
    }

    if (type === 'WARD') {
      const wardGroups = await db.attendantCard.groupBy({
        by: ['wardName'],
        _count: { id: true },
        _sum: {
          paymentReceived: true,
          returnPayment: true,
          netReceived: true,
        },
        orderBy: { wardName: 'asc' },
      });

      const wardReport = wardGroups.map((g) => ({
        wardName: g.wardName,
        totalCards: g._count.id,
        paymentReceived: Number(g._sum.paymentReceived || 0),
        returnPayment: Number(g._sum.returnPayment || 0),
        netReceived: Number(g._sum.netReceived || 0),
      }));

      return NextResponse.json({
        reportType: 'WARD',
        wards: wardReport,
      });
    }

    if (type === 'PAYMENT_RECEIVED' || type === 'RETURN_PAYMENT' || type === 'NET_RECEIVED') {
      const where: Prisma.AttendantCardWhereInput = {};
      if (fromDate) {
        const start = new Date(fromDate);
        const end = toDate ? new Date(toDate) : now;
        end.setHours(23, 59, 59, 999);
        where.dateOfIssue = { gte: start, lte: end };
      }

      const [totalCards, sums, cards] = await Promise.all([
        db.attendantCard.count({ where }),
        db.attendantCard.aggregate({
          where,
          _sum: {
            paymentReceived: true,
            returnPayment: true,
            netReceived: true,
          },
        }),
        db.attendantCard.findMany({
          where,
          orderBy: { dateOfIssue: 'desc' },
          select: {
            id: true,
            cardNumber: true,
            dateOfIssue: true,
            mrNumber: true,
            patientName: true,
            attendantName: true,
            wardName: true,
            paymentReceived: true,
            returnPayment: true,
            netReceived: true,
            status: true,
          },
        }),
      ]);

      return NextResponse.json({
        reportType: type,
        fromDate: fromDate || null,
        toDate: toDate || null,
        summary: {
          totalCards,
          paymentReceived: Number(sums._sum.paymentReceived || 0),
          returnPayment: Number(sums._sum.returnPayment || 0),
          netReceived: Number(sums._sum.netReceived || 0),
        },
        cards: cards.map((c) => ({
          ...c,
          paymentReceived: Number(c.paymentReceived),
          returnPayment: Number(c.returnPayment),
          netReceived: Number(c.netReceived),
        })),
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
