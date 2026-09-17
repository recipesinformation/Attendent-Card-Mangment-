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
      setError(`Return Payment cannot exceed Payment Received (PKR ${paymentReceived.toFixed(2)}).`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 no-print">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-lg overflow-hidden border border-slate-700/50 ring-1 ring-indigo-500/10">
        {/* ── Luxury Header ── */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-sm uppercase tracking-wider text-white">Return Attendant Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ── Error Alert ── */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Prominent Ward Badge ── */}
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Ward Location</span>
            <div className="mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 border border-indigo-500/30">
              <span className="text-lg font-extrabold text-white tracking-wide">{card.wardName}</span>
            </div>
          </div>

          {/* ── Card Details ── */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-2.5 text-xs backdrop-blur-sm">
            <div className="flex justify-between border-b border-slate-700/40 pb-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Card Number</span>
              <span className="font-bold text-indigo-300">{card.cardNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/40 pb-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">MR Number</span>
              <span className="font-medium text-slate-200">{card.mrNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/40 pb-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Patient Name</span>
              <span className="font-medium text-slate-200">{card.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Attendant Name</span>
              <span className="font-medium text-slate-200">{card.attendantName}</span>
            </div>
          </div>

          {/* ── Payment Summary Cards ── */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                Payment Received (PKR)
              </span>
              <span className="text-base font-extrabold text-emerald-300">
                PKR {paymentReceived.toFixed(2)}
              </span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
              <span className="block text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                Net Received (PKR)
              </span>
              <span className="text-base font-extrabold text-amber-300">
                PKR {calculatedNet.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Return Amount Input ── */}
          <div>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
              Return Payment Amount (PKR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={paymentReceived}
              required
              value={returnAmount}
              onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-slate-800/80 border-2 border-indigo-500/50 rounded-xl text-lg font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-200"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Net Received will update to: <strong className="text-indigo-300">PKR {calculatedNet.toFixed(2)}</strong>
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 text-xs font-bold rounded-xl transition-all duration-200 uppercase border border-slate-600/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center space-x-1.5 uppercase disabled:opacity-50"
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
