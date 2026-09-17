import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const cardUpdateSchema = z.object({
  dateOfIssue: z.string().or(z.date()).optional(),
  mrNumber: z.string().min(1).optional(),
  patientName: z.string().min(1).optional(),
  attendantName: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  wardName: z.string().min(1).optional(),
  paymentReceived: z.number().min(0).optional(),
  returnPayment: z.number().min(0).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const card = await db.attendantCard.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true, username: true } },
        updatedBy: { select: { name: true, username: true } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      card: {
        ...card,
        paymentReceived: Number(card.paymentReceived),
        returnPayment: Number(card.returnPayment),
        netReceived: Number(card.netReceived),
      },
    });
  } catch (error) {
    console.error('Error fetching card detail:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const body = await req.json();

    const parseResult = cardUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const existingCard = await db.attendantCard.findUnique({
      where: { id: params.id },
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const dataToUpdate: Prisma.AttendantCardUpdateInput = {};

    if (body.dateOfIssue) dataToUpdate.dateOfIssue = new Date(body.dateOfIssue);
    if (body.mrNumber) dataToUpdate.mrNumber = body.mrNumber;
    if (body.patientName) dataToUpdate.patientName = body.patientName;
    if (body.attendantName) dataToUpdate.attendantName = body.attendantName;
    if (body.phoneNumber) dataToUpdate.phoneNumber = body.phoneNumber;
    if (body.wardName) dataToUpdate.wardName = body.wardName;

    let paymentReceived = Number(existingCard.paymentReceived);
    let returnPayment = Number(existingCard.returnPayment);

    if (body.paymentReceived !== undefined) {
      paymentReceived = body.paymentReceived;
      dataToUpdate.paymentReceived = new Prisma.Decimal(paymentReceived);
    }

    if (body.returnPayment !== undefined) {
      returnPayment = body.returnPayment;
      dataToUpdate.returnPayment = new Prisma.Decimal(returnPayment);
    }

    if (returnPayment > paymentReceived) {
      return NextResponse.json(
        { error: 'Return Payment cannot exceed Payment Received.' },
        { status: 400 }
      );
    }

    const netReceived = paymentReceived - returnPayment;
    dataToUpdate.netReceived = new Prisma.Decimal(netReceived);

    if (session?.id) {
      dataToUpdate.updatedBy = { connect: { id: session.id } };
    }

    const updatedCard = await db.attendantCard.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: 'Card updated successfully',
      card: {
        ...updatedCard,
        paymentReceived: Number(updatedCard.paymentReceived),
        returnPayment: Number(updatedCard.returnPayment),
        netReceived: Number(updatedCard.netReceived),
      },
    });
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}
