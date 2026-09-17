import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const returnCardSchema = z.object({
  returnPayment: z.number().min(0, 'Return Payment cannot be negative'),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const body = await req.json();

    const parseResult = returnCardSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { returnPayment } = parseResult.data;

    const updatedCard = await db.$transaction(async (tx) => {
      const card = await tx.attendantCard.findUnique({
        where: { id: params.id },
      });

      if (!card) {
        throw new Error('CARD_NOT_FOUND');
      }

      if (card.status === 'RETURNED') {
        throw new Error('CARD_ALREADY_RETURNED');
      }

      const paymentReceived = Number(card.paymentReceived);

      if (returnPayment > paymentReceived) {
        throw new Error('RETURN_EXCEEDS_PAYMENT');
      }

      const netReceived = paymentReceived - returnPayment;

      return await tx.attendantCard.update({
        where: { id: params.id },
        data: {
          returnPayment: new Prisma.Decimal(returnPayment),
          netReceived: new Prisma.Decimal(netReceived),
          status: 'RETURNED',
          returnedAt: new Date(),
          updatedById: session?.id || null,
        },
      });
    });

    return NextResponse.json({
      message: 'Attendant card returned successfully',
      card: {
        ...updatedCard,
        paymentReceived: Number(updatedCard.paymentReceived),
        returnPayment: Number(updatedCard.returnPayment),
        netReceived: Number(updatedCard.netReceived),
      },
    });
  } catch (error: any) {
    if (error.message === 'CARD_NOT_FOUND') {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    if (error.message === 'CARD_ALREADY_RETURNED') {
      return NextResponse.json(
        { error: 'Card has already been returned.' },
        { status: 400 }
      );
    }
    if (error.message === 'RETURN_EXCEEDS_PAYMENT') {
      return NextResponse.json(
        { error: 'Return Payment cannot exceed Payment Received.' },
        { status: 400 }
      );
    }

    console.error('Error executing card return:', error);
    return NextResponse.json(
      { error: 'Failed to complete card return operation.' },
      { status: 500 }
    );
  }
}
