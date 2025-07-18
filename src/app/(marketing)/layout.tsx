import Link from 'next/link';
import { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur shadow-sm sticky top-0 z-40">
        <Link href="/" className="text-2xl font-bold text-primary">Merlin</Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="hover:text-primary transition">Features</Link>
          <Link href="#pricing" className="hover:text-primary transition">Pricing</Link>
          <Link href="#team" className="hover:text-primary transition">Team</Link>
        </nav>
        <div className="flex gap-2 items-center">
          <Link href="/user/login" className="btn btn-outline px-4 py-2 rounded-lg font-semibold">Log in</Link>
          <Link href="/user/register" className="btn btn-primary px-4 py-2 rounded-lg font-semibold">Sign up for free</Link>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100 font-sans">
        {children}
      </main>
      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-500 bg-gray-50 border-t mt-12">
        &copy; {new Date().getFullYear()} Merlin. All rights reserved.
      </footer>
    </>
  );
} 