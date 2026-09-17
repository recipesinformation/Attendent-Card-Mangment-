'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { format } from 'date-fns';

interface CardData {
  id: string;
  cardNumber: string;
  dateOfIssue: string | Date;
  mrNumber: string;
  patientName: string;
  attendantName: string;
  phoneNumber: string;
  wardName: string;
  paymentReceived: number;
  returnPayment: number;
  netReceived: number;
  status: 'ACTIVE' | 'RETURNED';
  returnedAt?: string | Date | null;
}

interface PrintCardModalProps {
  card: CardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintCardModal({ card, isOpen, onClose }: PrintCardModalProps) {
  if (!isOpen || !card) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = card.dateOfIssue
    ? format(new Date(card.dateOfIssue), 'dd-MM-yyyy')
    : '';

  const formattedReturnedDate = card.returnedAt
    ? format(new Date(card.returnedAt), 'dd-MM-yyyy hh:mm a')
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      {/* Screen Preview Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 no-print">
        <div className="bg-sky-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-sky-200" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Print Attendant Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white p-1 rounded hover:bg-sky-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-slate-100 flex justify-center">
          {/* Card Preview Graphic */}
          <div className="w-full bg-white border-2 border-slate-800 rounded-lg p-5 shadow-md text-slate-900 space-y-3">
            <div className="text-center border-b-2 border-slate-800 pb-2">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-900">
                ATTENDANT CARD
              </h3>
              <p className="text-[10px] font-bold uppercase text-slate-600">
                Hospital Front-Desk Reception
              </p>
            </div>

            <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded border border-slate-300">
              <span className="text-xs font-bold uppercase text-slate-600">Card Number:</span>
              <span className="text-sm font-black text-sky-800">{card.cardNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Date of Issue</span>
                <span className="font-semibold text-slate-900">{formattedDate}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">MR Number</span>
                <span className="font-semibold text-slate-900">{card.mrNumber}</span>
              </div>
            </div>

            <div className="text-xs space-y-1 border-t border-slate-200 pt-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Patient Name:</span>
                <span className="font-bold text-slate-900 text-sm">{card.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Attendant Name:</span>
                <span className="font-bold text-slate-900 text-sm">{card.attendantName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Number:</span>
                  <span className="font-semibold text-slate-800">{card.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Ward Name:</span>
                  <span className="font-semibold text-slate-800">{card.wardName}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-800 pt-2 grid grid-cols-3 gap-1 text-center bg-slate-50 p-2 rounded">
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-500">Received</span>
                <span className="text-xs font-black text-emerald-700">Rs. {Number(card.paymentReceived).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-500">Return</span>
                <span className="text-xs font-black text-rose-700">Rs. {Number(card.returnPayment).toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase font-bold text-slate-500">Net</span>
                <span className="text-xs font-black text-sky-800">Rs. {Number(card.netReceived).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-200">
              <span className="font-bold uppercase text-slate-500">Status:</span>
              <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                card.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {card.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg uppercase"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-2 uppercase"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT CARD</span>
          </button>
        </div>
      </div>

      {/* Pure Printable Element (Rendered on window.print()) */}
      <div className="print-only print-area fixed inset-0 bg-white p-8 text-black">
        <div className="max-w-md mx-auto border-2 border-black p-6 space-y-4 font-sans">
          <div className="text-center border-b-2 border-black pb-3">
            <h1 className="text-xl font-extrabold uppercase tracking-widest">HOSPITAL ATTENDANT CARD</h1>
            <p className="text-xs font-semibold">Official Reception Entry Pass</p>
          </div>

          <div className="flex justify-between items-center border-b border-gray-400 py-1 font-bold text-sm">
            <span>CARD NO: {card.cardNumber}</span>
            <span>DATE: {formattedDate}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3">
              <span className="font-bold uppercase text-xs">MR Number:</span>
              <span className="col-span-2 font-semibold">{card.mrNumber}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-bold uppercase text-xs">Patient Name:</span>
              <span className="col-span-2 font-extrabold">{card.patientName}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-bold uppercase text-xs">Attendant Name:</span>
              <span className="col-span-2 font-extrabold">{card.attendantName}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-bold uppercase text-xs">Phone Number:</span>
              <span className="col-span-2 font-semibold">{card.phoneNumber}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="font-bold uppercase text-xs">Ward Name:</span>
              <span className="col-span-2 font-semibold">{card.wardName}</span>
            </div>
          </div>

          <div className="border-t-2 border-black pt-3 space-y-1 text-sm font-bold">
            <div className="flex justify-between">
              <span>Payment Received:</span>
              <span>Rs. {Number(card.paymentReceived).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Return Payment:</span>
              <span>Rs. {Number(card.returnPayment).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-1 text-base">
              <span>NET RECEIVED:</span>
              <span>Rs. {Number(card.netReceived).toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-400 pt-2 flex justify-between text-xs font-bold">
            <span>STATUS: {card.status}</span>
            {formattedReturnedDate && <span>Returned: {formattedReturnedDate}</span>}
          </div>

          <div className="text-center text-[10px] italic border-t border-gray-300 pt-3">
            Please return this card at the reception desk before checkout to claim deposit return.
          </div>
        </div>
      </div>
    </div>
  );
}
