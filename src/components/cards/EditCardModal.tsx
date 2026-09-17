'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface EditCardModalProps {
  card: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCardModal({
  card,
  isOpen,
  onClose,
  onSuccess,
}: EditCardModalProps) {
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [mrNumber, setMrNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [attendantName, setAttendantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [wardName, setWardName] = useState('');
  const [paymentReceived, setPaymentReceived] = useState<number>(0);
  const [returnPayment, setReturnPayment] = useState<number>(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setDateOfIssue(card.dateOfIssue ? format(new Date(card.dateOfIssue), 'yyyy-MM-dd') : '');
      setMrNumber(card.mrNumber);
      setPatientName(card.patientName);
      setAttendantName(card.attendantName);
      setPhoneNumber(card.phoneNumber);
      setWardName(card.wardName);
      setPaymentReceived(Number(card.paymentReceived));
      setReturnPayment(Number(card.returnPayment));
      setError('');
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const calculatedNet = (Number(paymentReceived) || 0) - (Number(returnPayment) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (returnPayment > paymentReceived) {
      setError('Return Payment cannot exceed Payment Received.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfIssue,
          mrNumber,
          patientName,
          attendantName,
          phoneNumber,
          wardName,
          paymentReceived: Number(paymentReceived),
          returnPayment: Number(returnPayment),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update card details');
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="bg-sky-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-sky-200" />
            <h2 className="font-bold text-base uppercase">Edit Attendant Card</h2>
          </div>
          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white p-1 rounded hover:bg-sky-700 transition"
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

          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-200">
            <span className="text-xs font-bold uppercase text-slate-600">Card Number (Locked):</span>
            <span className="text-sm font-black text-sky-800">{card.cardNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date of Issue *
              </label>
              <input
                type="date"
                required
                value={dateOfIssue}
                onChange={(e) => setDateOfIssue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                MR Number *
              </label>
              <input
                type="text"
                required
                value={mrNumber}
                onChange={(e) => setMrNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ward Name *
              </label>
              <input
                type="text"
                required
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Attendant Name *
              </label>
              <input
                type="text"
                required
                value={attendantName}
                onChange={(e) => setAttendantName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 border-t pt-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Payment Received *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={paymentReceived}
                onChange={(e) => setPaymentReceived(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Return Payment
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={returnPayment}
                onChange={(e) => setReturnPayment(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-rose-700 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Net Received
              </label>
              <input
                type="text"
                readOnly
                value={`Rs. ${calculatedNet.toFixed(2)}`}
                className="w-full px-3 py-1.5 border border-slate-200 bg-slate-100 rounded-lg text-xs font-extrabold text-sky-900 outline-none"
              />
            </div>
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
              className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5 uppercase disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
