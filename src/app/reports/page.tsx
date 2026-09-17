'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  BarChart3,
  Calendar,
  Building2,
  Printer,
  Loader2,
  Banknote,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'DAILY' | 'DATE_RANGE' | 'WARD' | 'PAYMENT_RECEIVED' | 'RETURN_PAYMENT' | 'NET_RECEIVED'>('DAILY');
  const [fromDate, setFromDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = useCallback(() => {
    setLoading(true);
    const query = new URLSearchParams({
      type: reportType,
      fromDate,
      toDate,
    });

    fetch(`/api/reports?${query.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching report:', err);
        setLoading(false);
      });
  }, [reportType, fromDate, toDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm no-print">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
              Financial & Operational Reports
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Daily totals, date range breakdowns, and ward-wise financial summaries
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-2 uppercase shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT REPORT</span>
          </button>
        </div>

        {/* Report Type Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 no-print">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setReportType('DAILY')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-2 ${
                reportType === 'DAILY'
                  ? 'bg-sky-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Report</span>
            </button>

            <button
              onClick={() => setReportType('DATE_RANGE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-2 ${
                reportType === 'DATE_RANGE'
                  ? 'bg-sky-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Date Range Report</span>
            </button>

            <button
              onClick={() => setReportType('WARD')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-2 ${
                reportType === 'WARD'
                  ? 'bg-sky-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Ward-wise Report</span>
            </button>

            <button
              onClick={() => setReportType('PAYMENT_RECEIVED')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-2 ${
                reportType === 'PAYMENT_RECEIVED'
                  ? 'bg-sky-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Payment Received (PKR)</span>
            </button>

            <button
              onClick={() => setReportType('RETURN_PAYMENT')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-2 ${
                reportType === 'RETURN_PAYMENT'
                  ? 'bg-sky-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Return Payment (PKR)</span>
            </button>

            <button
              onClick={() => setReportType('NET_RECEIVED')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center space-x-2 ${
                reportType === 'NET_RECEIVED'
                  ? 'bg-sky-700 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Net Received (PKR)</span>
            </button>
          </div>

          {/* Date Selector Inputs */}
          {(reportType === 'DAILY' || reportType === 'DATE_RANGE' || reportType === 'PAYMENT_RECEIVED' || reportType === 'RETURN_PAYMENT' || reportType === 'NET_RECEIVED') && (
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 uppercase">
                  {reportType === 'DAILY' ? 'Date:' : 'From Date:'}
                </span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                />
              </div>

              {reportType !== 'DAILY' && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">To Date:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Printable Report Output Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 print-area">
          {/* Printable Header */}
          <div className="border-b border-slate-300 pb-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-wider">
                ATTENDANT CARD MANAGEMENT REPORT
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase mt-0.5">
                Report Type: {reportType.replace('_', ' ')} • Date: {fromDate} {reportType === 'DATE_RANGE' && ` to ${toDate}`}
              </p>
            </div>
            <div className="text-right text-xs font-bold text-slate-600">
              Generated: {format(new Date(), 'dd-MM-yyyy hh:mm a')}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-700 animate-spin" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                Generating Report from Database...
              </span>
            </div>
          ) : data?.summary ? (
            /* Summary Cards */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Total Cards</span>
                  <span className="text-xl font-black text-slate-900">{data.summary.totalCards}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
                  <span className="block text-[10px] font-bold uppercase text-emerald-700">Active</span>
                  <span className="text-xl font-black text-emerald-800">{data.summary.activeCards}</span>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 text-center">
                  <span className="block text-[10px] font-bold uppercase text-slate-600">Returned</span>
                  <span className="text-xl font-black text-slate-700">{data.summary.returnedCards}</span>
                </div>
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-center">
                  <span className="block text-[10px] font-bold uppercase text-sky-700">Received (PKR)</span>
                  <span className="text-sm font-black text-sky-900">
                    PKR {data.summary.paymentReceived.toFixed(2)}
                  </span>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-center">
                  <span className="block text-[10px] font-bold uppercase text-rose-700">Returned (PKR)</span>
                  <span className="text-sm font-black text-rose-800">
                    PKR {data.summary.returnPayment.toFixed(2)}
                  </span>
                </div>
                <div className="bg-sky-900 text-white p-3 rounded-lg text-center">
                  <span className="block text-[10px] font-bold uppercase text-sky-200">Net Received (PKR)</span>
                  <span className="text-sm font-black text-white">
                    PKR {data.summary.netReceived.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detailed Card Records */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Card No</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">MR No</th>
                      <th className="px-3 py-2.5">Patient</th>
                      <th className="px-3 py-2.5">Attendant</th>
                      <th className="px-3 py-2.5">Ward</th>
                      <th className="px-3 py-2.5">Payment (PKR)</th>
                      <th className="px-3 py-2.5">Return (PKR)</th>
                      <th className="px-3 py-2.5">Net (PKR)</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {data.cards.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-4 text-center text-slate-500 italic">
                          No cards recorded for this date query.
                        </td>
                      </tr>
                    ) : (
                      data.cards.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-sky-800">{c.cardNumber}</td>
                          <td className="px-3 py-2">{format(new Date(c.dateOfIssue), 'dd-MM-yyyy')}</td>
                          <td className="px-3 py-2">{c.mrNumber}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">{c.patientName}</td>
                          <td className="px-3 py-2">{c.attendantName}</td>
                          <td className="px-3 py-2">{c.wardName}</td>
                          <td className="px-3 py-2 font-bold text-emerald-700">
                            PKR {c.paymentReceived.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-bold text-rose-700">
                            PKR {c.returnPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-bold text-sky-900">
                            PKR {c.netReceived.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-bold uppercase text-[10px]">
                            {c.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : data?.wards ? (
            /* Ward-wise Breakdown Table */
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Ward Name</th>
                    <th className="px-4 py-3">Total Cards</th>
                    <th className="px-4 py-3">Payment Received (PKR)</th>
                    <th className="px-4 py-3">Return Payment (PKR)</th>
                    <th className="px-4 py-3">Net Received (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.wards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                        No ward data found in database.
                      </td>
                    </tr>
                  ) : (
                    data.wards.map((w: any) => (
                      <tr key={w.wardName} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{w.wardName}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{w.totalCards}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          PKR {w.paymentReceived.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-bold text-rose-700">
                          PKR {w.returnPayment.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-bold text-sky-900">
                          PKR {w.netReceived.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : data?.reportType && ['PAYMENT_RECEIVED', 'RETURN_PAYMENT', 'NET_RECEIVED'].includes(data.reportType) ? (
            /* Financial Focus Reports */
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 text-center">
                  <span className="block text-[10px] font-bold uppercase text-sky-700">Total Cards</span>
                  <span className="text-2xl font-black text-sky-900">{data.summary.totalCards}</span>
                </div>
                <div className={`p-4 rounded-lg border text-center ${
                  data.reportType === 'PAYMENT_RECEIVED'
                    ? 'bg-emerald-50 border-emerald-200'
                    : data.reportType === 'RETURN_PAYMENT'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-sky-900 border-sky-800'
                }`}>
                  <span className={`block text-[10px] font-bold uppercase ${
                    data.reportType === 'PAYMENT_RECEIVED' ? 'text-emerald-700'
                    : data.reportType === 'RETURN_PAYMENT' ? 'text-rose-700'
                    : 'text-sky-200'
                  }`}>
                    {data.reportType === 'PAYMENT_RECEIVED' ? 'Total Payment Received (PKR)'
                     : data.reportType === 'RETURN_PAYMENT' ? 'Total Return Payment (PKR)'
                     : 'Total Net Received (PKR)'}
                  </span>
                  <span className={`text-xl font-black ${
                    data.reportType === 'PAYMENT_RECEIVED' ? 'text-emerald-800'
                    : data.reportType === 'RETURN_PAYMENT' ? 'text-rose-800'
                    : 'text-white'
                  }`}>
                    PKR {data.reportType === 'PAYMENT_RECEIVED'
                      ? data.summary.paymentReceived.toFixed(2)
                      : data.reportType === 'RETURN_PAYMENT'
                      ? data.summary.returnPayment.toFixed(2)
                      : data.summary.netReceived.toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                  <span className="block text-[10px] font-bold uppercase text-slate-600">Formula</span>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    <div>Received: PKR {data.summary.paymentReceived.toFixed(2)}</div>
                    <div>- Return: PKR {data.summary.returnPayment.toFixed(2)}</div>
                    <div className="border-t border-slate-300 pt-1 mt-1 font-black text-sky-900">
                      = Net: PKR {data.summary.netReceived.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Detailed Records */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Card No</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Patient</th>
                      <th className="px-3 py-2.5">Attendant</th>
                      <th className="px-3 py-2.5">Ward</th>
                      <th className="px-3 py-2.5">Received (PKR)</th>
                      <th className="px-3 py-2.5">Return (PKR)</th>
                      <th className="px-3 py-2.5">Net (PKR)</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {data.cards.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-slate-500 italic">
                          No records found for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      data.cards.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-sky-800">{c.cardNumber}</td>
                          <td className="px-3 py-2">{format(new Date(c.dateOfIssue), 'dd-MM-yyyy')}</td>
                          <td className="px-3 py-2 font-bold text-slate-900">{c.patientName}</td>
                          <td className="px-3 py-2">{c.attendantName}</td>
                          <td className="px-3 py-2">{c.wardName}</td>
                          <td className="px-3 py-2 font-bold text-emerald-700">
                            PKR {c.paymentReceived.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-bold text-rose-700">
                            PKR {c.returnPayment.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-bold text-sky-900">
                            PKR {c.netReceived.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 font-bold uppercase text-[10px]">
                            {c.status}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
