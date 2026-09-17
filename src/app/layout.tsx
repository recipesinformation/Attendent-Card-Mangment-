import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Attendant Card Management System',
  description: 'Production-ready Attendant Card Management System for Hospital Front-Desk',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
