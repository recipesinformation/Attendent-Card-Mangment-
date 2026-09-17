'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  CreditCard,
  PlusCircle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  RotateCcw,
  DollarSign,
  TrendingDown,
  Wallet,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface Metrics {
  todaysCards: number;
  activeCards: number;
  returnedCards: number;
  paymentReceived: number;
  returnPayment: number;
  netReceived: number;
}

interface RecentCard {
  id: string;
  cardNumber: string;
  mrNumber: string;
  patientName: string;
  attendantName: string;
  phoneNumber: string;
  wardName: string;
  paymentReceived: number;
  returnPayment: number;
  netReceived: number;
  status: 'ACTIVE' | 'RETURNED';
  dateOfIssue: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentCards, setRecentCards] = useState<RecentCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) {
          setMetrics(data.metrics);
          setRecentCards(data.recentCards || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading dashboard metrics:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time operational summary & front-desk statistics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/cards/new"
              className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-2 uppercase"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ NEW ATTENDANT CARD</span>
            </Link>

            <Link
              href="/cards"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-2 uppercase"
            >
              <CreditCard className="w-4 h-4" />
              <span>ALL CARDS</span>
            </Link>

            <Link
              href="/reports"
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-2 uppercase"
            >
              <BarChart3 className="w-4 h-4" />
              <span>REPORTS</span>
            </Link>
          </div>
        </div>

        {/* Real DB Metrics Grid */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-700 animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Loading Real Database Metrics...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Today's Cards */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  TODAY'S CARDS
                </span>
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <CalendarCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">
                  {metrics?.todaysCards ?? 0}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Issued today</p>
              </div>
            </div>

            {/* Active Cards */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                  ACTIVE CARDS
                </span>
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-emerald-700">
                  {metrics?.activeCards ?? 0}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Currently in hospital</p>
              </div>
            </div>

            {/* Returned Cards */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  RETURNED CARDS
                </span>
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <RotateCcw className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-700">
                  {metrics?.returnedCards ?? 0}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Completed & checked out</p>
              </div>
            </div>

            {/* Payment Received */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                  PAYMENT RECEIVED
                </span>
                <div className="p-2 bg-sky-100 text-sky-800 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-sky-900">
                  Rs. {(metrics?.paymentReceived ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Gross deposit collection</p>
              </div>
            </div>

            {/* Return Payment */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider">
                  RETURN PAYMENT
                </span>
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-rose-700">
                  Rs. {(metrics?.returnPayment ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Total returned deposit amount</p>
              </div>
            </div>

            {/* Net Received */}
            <div className="bg-sky-900 text-white p-5 rounded-xl border border-sky-800 shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-sky-200 uppercase tracking-wider">
                  NET RECEIVED
                </span>
                <div className="p-2 bg-sky-800 text-sky-200 rounded-lg">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-white">
                  Rs. {(metrics?.netReceived ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-[11px] text-sky-200 mt-1 font-medium">Net revenue retained</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Cards List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="font-bold text-sm uppercase text-slate-800 tracking-wider">
                Recent Attendant Cards
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Latest 5 cards issued from reception
              </p>
            </div>
            <Link
              href="/cards"
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center space-x-1 uppercase"
            >
              <span>View All Cards</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Card No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">MR No</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Attendant</th>
                  <th className="px-4 py-3">Ward</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Return</th>
                  <th className="px-4 py-3">Net</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {recentCards.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500 italic">
                      No attendant cards issued yet.
                    </td>
                  </tr>
                ) : (
                  recentCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-sky-800">{card.cardNumber}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {format(new Date(card.dateOfIssue), 'dd-MM-yyyy')}
                      </td>
                      <td className="px-4 py-3 font-semibold">{card.mrNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{card.patientName}</td>
                      <td className="px-4 py-3">{card.attendantName}</td>
                      <td className="px-4 py-3">{card.wardName}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        Rs. {card.paymentReceived.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-700">
                        Rs. {card.returnPayment.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-sky-900">
                        Rs. {card.netReceived.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            card.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {card.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
