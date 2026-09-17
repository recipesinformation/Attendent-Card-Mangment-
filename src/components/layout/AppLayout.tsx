'use client';

import React from 'react';
import Navbar from './Navbar';
import NavigationTabs from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <NavigationTabs />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
