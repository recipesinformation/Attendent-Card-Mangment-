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
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md no-print sticky top-16 z-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-3 py-2.5 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 ml-1"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
