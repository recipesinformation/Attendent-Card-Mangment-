'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PrintCardModal from '@/components/cards/PrintCardModal';
import {
  User,
  CreditCard,
  Building2,
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Printer,
  Loader2,
  X,
  PlusCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function NewCardPage() {
  const router = useRouter();

  const [dateOfIssue, setDateOfIssue] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mrNumber, setMrNumber] = useState('');
  const [patientName, setPatientName] = useState('');
  const [wardName, setWardName] = useState('');

  const [attendantName, setAttendantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [fetchingNumber, setFetchingNumber] = useState(true);

  const [paymentReceived, setPaymentReceived] = useState<number>(500);
  const [returnPayment, setReturnPayment] = useState<number>(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // For Save & Print modal
  const [createdCardForPrint, setCreatedCardForPrint] = useState<any>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Fetch next card number automatically
  useEffect(() => {
    fetch('/api/cards/next-number')
      .then((res) => res.json())
      .then((data) => {
        if (data.cardNumber) setCardNumber(data.cardNumber);
        setFetchingNumber(false);
      })
      .catch((err) => {
        console.error('Error fetching card number:', err);
        setCardNumber('AT-000001');
        setFetchingNumber(false);
      });
  }, []);

  const netReceived = (Number(paymentReceived) || 0) - (Number(returnPayment) || 0);

  const handleSave = async (andPrint = false) => {
    setError('');

    if (!mrNumber.trim()) return setError('MR Number is required');
    if (!patientName.trim()) return setError('Patient Name is required');
    if (!wardName.trim()) return setError('Ward Name is required');
    if (!attendantName.trim()) return setError('Attendant Name is required');
    if (!phoneNumber.trim()) return setError('Phone Number is required');
    if (!cardNumber.trim()) return setError('Card Number is required');

    if (returnPayment > paymentReceived) {
      return setError('Return Payment cannot exceed Payment Received.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfIssue,
          mrNumber,
          patientName,
          wardName,
          attendantName,
          phoneNumber,
          cardNumber,
          paymentReceived: Number(paymentReceived),
          returnPayment: Number(returnPayment),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save card');
        setLoading(false);
        return;
      }

      if (andPrint && data.card) {
        setCreatedCardForPrint(data.card);
        setIsPrintOpen(true);
        setLoading(false);
      } else {
        router.push('/cards');
        router.refresh();
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-900/60 shadow-xl flex items-center justify-between text-white">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-cyan-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase text-white">
                New Attendant Pass Issuance
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Issue a visitor attendant security pass with ward authorization
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/cards')}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition uppercase flex items-center space-x-1.5 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Back to Cards</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          className="space-y-6"
        >
          {/* PRIMARY SECTION: WARD LOCATION (FIRST & BIGGEST) */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 rounded-2xl border-2 border-indigo-500/60 shadow-xl p-6 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-cyan-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-sm uppercase tracking-wider text-white">
                    WARD LOCATION (PRIMARY FIELD)
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    This ward will be highlighted and printed in bold on the attendant pass
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                REQUIRED FIRST
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-cyan-300 uppercase tracking-wider mb-2">
                ENTER WARD / ROOM NAME *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. ICU - BED 4 / EMERGENCY / CCU / GENERAL WARD 3"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900/90 border-2 border-indigo-400 rounded-xl text-lg sm:text-xl font-black text-amber-300 uppercase tracking-wider placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 outline-none shadow-inner transition"
              />
            </div>
          </div>

          {/* Section 1: Patient Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-indigo-900">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-sm uppercase tracking-wider">
                PATIENT INFORMATION
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Date of Issue *
                </label>
                <input
                  type="date"
                  required
                  value={dateOfIssue}
                  onChange={(e) => setDateOfIssue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  MR Number (Medical Record #) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MR-10492"
                  value={mrNumber}
                  onChange={(e) => setMrNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Attendant Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-sky-800">
              <Building2 className="w-5 h-5" />
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                ATTENDANT INFORMATION
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Attendant Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter attendant full name"
                  value={attendantName}
                  onChange={(e) => setAttendantName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0300-1234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Card Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-sky-800">
              <CreditCard className="w-5 h-5" />
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                CARD INFORMATION
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Card Number (Unique) *
              </label>
              <div className="relative max-w-sm">
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="e.g. AT-000001"
                  className="w-full px-3 py-2 border-2 border-sky-600 rounded-lg text-base font-black text-sky-900 focus:ring-2 focus:ring-sky-500 outline-none uppercase tracking-wider"
                />
                {fetchingNumber && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-3 animate-spin text-sky-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Auto-generated unique card identifier. Can be manually customized if needed.
              </p>
            </div>
          </div>

          {/* Section 4: Payment Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-sky-800">
              <DollarSign className="w-5 h-5" />
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                PAYMENT DETAILS
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Received (Rs.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={paymentReceived}
                  onChange={(e) => setPaymentReceived(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Return Payment (Rs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={returnPayment}
                  onChange={(e) => setReturnPayment(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-rose-700 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Net Received (Calculated)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`Rs. ${netReceived.toFixed(2)}`}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg text-sm font-black text-sky-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/cards')}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition uppercase"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2 uppercase disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>SAVE CARD</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center space-x-2 uppercase disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>SAVE & PRINT</span>
            </button>
          </div>
        </form>

        {/* Print Modal for Save & Print action */}
        <PrintCardModal
          card={createdCardForPrint}
          isOpen={isPrintOpen}
          onClose={() => {
            setIsPrintOpen(false);
            router.push('/cards');
            router.refresh();
          }}
        />
      </div>
    </AppLayout>
  );
}
