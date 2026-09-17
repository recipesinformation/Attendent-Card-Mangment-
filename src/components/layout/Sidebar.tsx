'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, CreditCard, BarChart3 } from 'lucide-react';

export default function NavigationTabs() {
  const pathname = usePathname();

  const navItems = [
    { label: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
    { label: 'NEW ATTENDANT CARD', href: '/cards/new', icon: PlusCircle },
    { label: 'ALL CARDS', href: '/cards', icon: CreditCard },
    { label: 'REPORTS', href: '/reports', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm no-print sticky top-16 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-4 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  isActive
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
