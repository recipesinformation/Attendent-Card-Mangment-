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
    <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-900/60 shadow-xl sticky top-0 z-30 no-print backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-xl blur-xs opacity-75"></div>
            <div className="relative bg-slate-900 p-2.5 rounded-xl border border-indigo-500/40 flex items-center justify-center">
              <IdCard className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-base sm:text-lg tracking-wider uppercase leading-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                Attendant Card Management
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                Portal v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Hospital Reception & Ward Security System
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {user && (
            <div className="flex items-center space-x-2.5 text-xs bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-inner transition">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-slate-200 block text-xs leading-none">{user.name}</span>
                <span className="text-[10px] text-slate-400 leading-none">@{user.username}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                user.role === 'ADMIN'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
              }`}>
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition shadow-sm"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
