'use client';

import React from 'react';
import { X, Eye, Edit, Printer, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

export interface CardData {
  id: string;
  cardNumber: string;
  dateOfIssue: string;
  mrNumber: string;
  patientName: string;
  attendantName: string;
  phoneNumber: string;
  wardName: string;
  paymentReceived: number;
  returnPayment: number;
  netReceived: number;
  status: 'ACTIVE' | 'RETURNED';
  createdAt?: string;
  returnedAt?: string | null;
  createdBy?: { name: string; username: string } | null;
}

interface ViewCardModalProps {
  card: CardData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: CardData) => void;
  onPrint: (card: CardData) => void;
  onReturn: (card: CardData) => void;
}

export default function ViewCardModal({
  card,
  isOpen,
  onClose,
  onEdit,
  onPrint,
  onReturn,
}: ViewCardModalProps) {
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="bg-sky-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-sky-200" />
            <h2 className="font-bold text-base uppercase">Attendant Card Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white p-1 rounded hover:bg-sky-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-4 rounded-xl">
            <div>
              <span className="text-[10px] font-bold uppercase text-sky-600 block">
                Card Number
              </span>
              <span className="text-xl font-black text-sky-900">{card.cardNumber}</span>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                card.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-800 border border-slate-300'
              }`}>
                {card.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 border-b pb-1">
                Patient Details
              </h3>
              <p className="text-xs"><strong className="text-slate-600">MR Number:</strong> {card.mrNumber}</p>
              <p className="text-xs"><strong className="text-slate-600">Patient Name:</strong> {card.patientName}</p>
              <p className="text-xs"><strong className="text-slate-600">Ward Name:</strong> {card.wardName}</p>
              <p className="text-xs"><strong className="text-slate-600">Issue Date:</strong> {card.dateOfIssue ? format(new Date(card.dateOfIssue), 'dd-MM-yyyy') : ''}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 border-b pb-1">
                Attendant Details
              </h3>
              <p className="text-xs"><strong className="text-slate-600">Attendant Name:</strong> {card.attendantName}</p>
              <p className="text-xs"><strong className="text-slate-600">Phone Number:</strong> {card.phoneNumber}</p>
              {card.createdBy && (
                <p className="text-xs"><strong className="text-slate-600">Issued By:</strong> {card.createdBy.name}</p>
              )}
              {card.returnedAt && (
                <p className="text-xs"><strong className="text-slate-600">Returned On:</strong> {format(new Date(card.returnedAt), 'dd-MM-yyyy hh:mm a')}</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Payment Received</span>
              <span className="text-base font-black text-emerald-400">Rs. {Number(card.paymentReceived).toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Return Payment</span>
              <span className="text-base font-black text-rose-400">Rs. {Number(card.returnPayment).toFixed(2)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Net Received</span>
              <span className="text-base font-black text-sky-400">Rs. {Number(card.netReceived).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => onPrint(card)}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 uppercase shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(card)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 uppercase"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>

              {card.status === 'ACTIVE' && (
                <button
                  onClick={() => onReturn(card)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 uppercase"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return Card</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
