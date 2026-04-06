"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-primary text-textMain flex flex-col md:flex-row">
      {/* Basic Admin Sidebar */}
      <aside className="w-full md:w-64 glass-header md:min-h-screen p-6 border-r border-white/5">
        <h2 className="text-xl font-bold text-accent mb-8">CricPredict Admin</h2>
        <nav className="flex flex-col gap-2">
          <Link 
            href="/admin" 
            className={`p-3 rounded-lg font-medium transition-colors ${pathname === '/admin' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-textMuted'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/matches" 
            className={`p-3 rounded-lg font-medium transition-colors ${pathname === '/admin/matches' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-textMuted'}`}
          >
            Manage Matches
          </Link>
          <Link 
            href="/admin/players" 
            className={`p-3 rounded-lg font-medium transition-colors ${pathname === '/admin/players' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-textMuted'}`}
          >
            Players Database
          </Link>
          <Link 
            href="/admin/contests" 
            className={`p-3 rounded-lg font-medium transition-colors ${pathname === '/admin/contests' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-textMuted'}`}
          >
            Contests Arena
          </Link>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
