import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const cardCreateSchema = z.object({
  dateOfIssue: z.string().or(z.date()),
  mrNumber: z.string().min(1, 'MR Number is required'),
  patientName: z.string().min(1, 'Patient Name is required'),
  attendantName: z.string().min(1, 'Attendant Name is required'),
  phoneNumber: z.string().min(1, 'Phone Number is required'),
  cardNumber: z.string().min(1, 'Card Number is required'),
  paymentReceived: z.number().min(0, 'Payment Received cannot be negative'),
  returnPayment: z.number().min(0, 'Return Payment cannot be negative').optional().default(0),
  wardName: z.string().min(1, 'Ward Name is required'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const wardName = searchParams.get('wardName') || 'ALL';
    const dateRange = searchParams.get('dateRange') || 'ALL';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const skip = (page - 1) * limit;

    const where: Prisma.AttendantCardWhereInput = {};

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { cardNumber: { contains: q } },
        { mrNumber: { contains: q } },
        { patientName: { contains: q } },
        { attendantName: { contains: q } },
        { phoneNumber: { contains: q } },
      ];
    }

    if (status !== 'ALL' && (status === 'ACTIVE' || status === 'RETURNED')) {
      where.status = status;
    }

    if (wardName !== 'ALL' && wardName.trim()) {
      where.wardName = wardName.trim();
    }

    const now = new Date();
    if (dateRange === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      where.dateOfIssue = { gte: startOfDay, lte: endOfDay };
    } else if (dateRange === 'YESTERDAY') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
      const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
      where.dateOfIssue = { gte: startOfDay, lte: endOfDay };
    } else if (dateRange === 'CUSTOM' && fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      where.dateOfIssue = { gte: start, lte: end };
    }

    const [cards, totalCount] = await Promise.all([
      db.attendantCard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          createdBy: { select: { name: true, username: true } },
        },
      }),
      db.attendantCard.count({ where }),
    ]);

    const formattedCards = cards.map((c) => ({
      ...c,
      paymentReceived: Number(c.paymentReceived),
      returnPayment: Number(c.returnPayment),
      netReceived: Number(c.netReceived),
    }));

    return NextResponse.json({
      cards: formattedCards,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();

    const parseResult = cardCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      dateOfIssue,
      mrNumber,
      patientName,
      attendantName,
      phoneNumber,
      cardNumber,
      paymentReceived,
      returnPayment = 0,
      wardName,
    } = parseResult.data;

    if (returnPayment > paymentReceived) {
      return NextResponse.json(
        { error: 'Return Payment cannot exceed Payment Received.' },
        { status: 400 }
      );
    }

    const netReceived = paymentReceived - returnPayment;


    const newCard = await db.$transaction(async (tx) => {
      // Double-check uniqueness inside transaction
      const duplicate = await tx.attendantCard.findUnique({
        where: { cardNumber },
      });
      if (duplicate) {
        throw new Error('DUPLICATE_CARD_NUMBER');
      }

      return await tx.attendantCard.create({
        data: {
          cardNumber,
          dateOfIssue: new Date(dateOfIssue),
          mrNumber,
          patientName,
          attendantName,
          phoneNumber,
          wardName,
          paymentReceived: new Prisma.Decimal(paymentReceived),
          returnPayment: new Prisma.Decimal(returnPayment),
          netReceived: new Prisma.Decimal(netReceived),
          status: 'ACTIVE',
          createdById: session?.id || null,
        },
      });
    });

    return NextResponse.json({
      message: 'Attendant card created successfully',
      card: {
        ...newCard,
        paymentReceived: Number(newCard.paymentReceived),
        returnPayment: Number(newCard.returnPayment),
        netReceived: Number(newCard.netReceived),
      },
    });
  } catch (error: any) {
    if (error.message === 'DUPLICATE_CARD_NUMBER') {
      return NextResponse.json(
        { error: 'Card number already exists.' },
        { status: 400 }
      );
    }
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to save card. Please try again.' },
      { status: 500 }
    );
  }
}
