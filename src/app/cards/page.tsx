'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ViewCardModal, { CardData } from '@/components/cards/ViewCardModal';
import EditCardModal from '@/components/cards/EditCardModal';
import ReturnCardModal from '@/components/cards/ReturnCardModal';
import PrintCardModal from '@/components/cards/PrintCardModal';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Printer,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AllCardsPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [wardFilter, setWardFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Active Modals state
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isReturnOpen, setIsReturnOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  // Ward list for filter dropdown
  const [wardList, setWardList] = useState<string[]>([]);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch cards list
  const fetchCards = useCallback(() => {
    setLoading(true);

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      status: statusFilter,
      wardName: wardFilter,
      dateRange: dateRangeFilter,
    });

    if (dateRangeFilter === 'CUSTOM') {
      if (fromDate) query.append('fromDate', fromDate);
      if (toDate) query.append('toDate', toDate);
    }

    fetch(`/api/cards?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setCards(data.cards);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading cards:', err);
        setLoading(false);
      });
  }, [page, limit, search, statusFilter, wardFilter, dateRangeFilter, fromDate, toDate]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Fetch distinct ward names for the filter dropdown
  useEffect(() => {
    fetch('/api/cards/wards')
      .then((res) => res.json())
      .then((data) => {
        if (data.wards) setWardList(data.wards);
      })
      .catch(() => {});
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Debounce: reset page after 300ms of no typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
    }, 300);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
              All Attendant Cards
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage, search, edit, print, and return hospital visitor cards
            </p>
          </div>

          <Link
            href="/cards/new"
            className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-2 uppercase shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ NEW ATTENDANT CARD</span>
          </Link>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search Card #, MR #, Patient, Phone..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="ALL">STATUS: ALL</option>
                <option value="ACTIVE">STATUS: ACTIVE</option>
                <option value="RETURNED">STATUS: RETURNED</option>
              </select>
            </div>

            {/* Ward Filter */}
            <div>
              <select
                value={wardFilter}
                onChange={(e) => {
                  setWardFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="ALL">WARD: ALL</option>
                {wardList.map((w) => (
                  <option key={w} value={w}>
                    WARD: {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="ALL">DATE: ALL TIME</option>
                <option value="TODAY">DATE: TODAY</option>
                <option value="YESTERDAY">DATE: YESTERDAY</option>
                <option value="CUSTOM">DATE: CUSTOM RANGE</option>
              </select>
            </div>

            {/* Rows Per Page */}
            <div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value={10}>10 records / page</option>
                <option value={20}>20 records / page</option>
                <option value={50}>50 records / page</option>
                <option value={100}>100 records / page</option>
              </select>
            </div>
          </div>

          {/* Custom Date Pickers */}
          {dateRangeFilter === 'CUSTOM' && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 uppercase">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 uppercase">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>
              <button
                onClick={fetchCards}
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg transition uppercase flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Apply Range</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Card No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">MR No</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Attendant</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Ward</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Return</th>
                  <th className="px-4 py-3">Net</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 text-sky-700 animate-spin" />
                        <span className="font-bold text-xs uppercase tracking-wider">
                          Loading records from database...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : cards.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-slate-500 italic">
                      No attendant cards found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  cards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-bold text-sky-800">{card.cardNumber}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {card.dateOfIssue ? format(new Date(card.dateOfIssue), 'dd-MM-yyyy') : ''}
                      </td>
                      <td className="px-4 py-3 font-semibold">{card.mrNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{card.patientName}</td>
                      <td className="px-4 py-3">{card.attendantName}</td>
                      <td className="px-4 py-3">{card.phoneNumber}</td>
                      <td className="px-4 py-3">{card.wardName}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        Rs. {Number(card.paymentReceived).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-700">
                        Rs. {Number(card.returnPayment).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-bold text-sky-900">
                        Rs. {Number(card.netReceived).toFixed(2)}
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setIsViewOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded transition"
                            title="View Card Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                            title="Edit Card"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCard(card);
                              setIsPrintOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-sky-800 hover:bg-sky-100 rounded transition"
                            title="Print Card"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {card.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                setSelectedCard(card);
                                setIsReturnOpen(true);
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase transition flex items-center space-x-1"
                              title="Return Card Deposit"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing <span className="font-bold">{cards.length}</span> of{' '}
              <span className="font-bold">{totalCount}</span> records
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-slate-800 px-2">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ViewCardModal
          card={selectedCard}
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          onEdit={(card) => {
            setIsViewOpen(false);
            setSelectedCard(card);
            setIsEditOpen(true);
          }}
          onPrint={(card) => {
            setIsViewOpen(false);
            setSelectedCard(card);
            setIsPrintOpen(true);
          }}
          onReturn={(card) => {
            setIsViewOpen(false);
            setSelectedCard(card);
            setIsReturnOpen(true);
          }}
        />

        <EditCardModal
          card={selectedCard}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={fetchCards}
        />

        <ReturnCardModal
          card={selectedCard}
          isOpen={isReturnOpen}
          onClose={() => setIsReturnOpen(false)}
          onSuccess={fetchCards}
        />

        <PrintCardModal
          card={selectedCard}
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
