'use client';

import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface CardData {
  id: string;
  cardNumber: string;
  mrNumber: string;
  patientName: string;
  attendantName: string;
  wardName: string;
  paymentReceived: number;
  returnPayment: number;
  netReceived: number;
  status: 'ACTIVE' | 'RETURNED';
}

interface ReturnCardModalProps {
  card: CardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnCardModal({
  card,
  isOpen,
  onClose,
  onSuccess,
}: ReturnCardModalProps) {
  const [returnAmount, setReturnAmount] = useState<number>(
    card ? (card.returnPayment > 0 ? card.returnPayment : card.paymentReceived) : 0
  );
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Sync state when card opens
  React.useEffect(() => {
    if (card) {
      setReturnAmount(card.returnPayment > 0 ? card.returnPayment : card.paymentReceived);
      setError('');
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const paymentReceived = Number(card.paymentReceived);
  const calculatedNet = paymentReceived - (Number(returnAmount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numReturn = Number(returnAmount);
    if (isNaN(numReturn) || numReturn < 0) {
      setError('Return Payment cannot be negative.');
      return;
    }

    if (numReturn > paymentReceived) {
      setError(`Return Payment cannot exceed Payment Received (Rs. ${paymentReceived.toFixed(2)}).`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/cards/${card.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPayment: numReturn }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process return');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-sky-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-sky-200" />
            <h2 className="font-bold text-base uppercase">Return Attendant Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white p-1 rounded hover:bg-sky-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold uppercase">Card Number:</span>
              <span className="font-bold text-sky-700">{card.cardNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold uppercase">MR Number:</span>
              <span className="font-medium text-slate-800">{card.mrNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold uppercase">Patient Name:</span>
              <span className="font-medium text-slate-800">{card.patientName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-semibold uppercase">Attendant Name:</span>
              <span className="font-medium text-slate-800">{card.attendantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold uppercase">Ward:</span>
              <span className="font-medium text-slate-800">{card.wardName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              <span className="block text-[10px] font-bold uppercase text-emerald-700">
                Payment Received
              </span>
              <span className="text-base font-extrabold text-emerald-800">
                Rs. {paymentReceived.toFixed(2)}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <span className="block text-[10px] font-bold uppercase text-amber-700">
                Current Net Received
              </span>
              <span className="text-base font-extrabold text-amber-800">
                Rs. {calculatedNet.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Enter Return Payment Amount (Rs.) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={paymentReceived}
              required
              value={returnAmount}
              onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 border-2 border-sky-600 rounded-lg text-lg font-bold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Net Received will be updated to: <strong>Rs. {calculatedNet.toFixed(2)}</strong>
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5 uppercase disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Return</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
