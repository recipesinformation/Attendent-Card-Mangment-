'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IdCard, LogOut, UserCheck } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string; username: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-sky-800 text-white shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-900 p-2 rounded-lg border border-sky-700">
            <IdCard className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide uppercase leading-tight">
              Attendant Card Management System
            </h1>
            <p className="text-xs text-sky-200">Reception & Visitor Front Desk</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2 text-sm bg-sky-900/60 px-3 py-1.5 rounded-full border border-sky-700">
              <UserCheck className="w-4 h-4 text-sky-300" />
              <span className="font-medium text-sky-100">{user.name}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-700 text-sky-100 uppercase">
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
