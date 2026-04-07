"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { LayoutGrid, Trophy, Users, Swords, Zap, LogOut } from "lucide-react";
import { useAuth } from "./context/AuthContext";

function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  if (pathname === "/admin/login") return null;

  return (
    <aside className="w-full md:w-72 bg-[#161B22] md:min-h-screen p-8 border-r border-white/5 flex flex-col z-50 sticky top-0">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-[#0F1115] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          A
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none">Super Admin</h2>
          <span className="text-[9px] text-accent font-bold tracking-[0.3em] uppercase mt-1 block opacity-80">API Control</span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-3 flex-1">
        <Link href="/admin" className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${pathname === '/admin' ? 'bg-accent text-[#0F1115] shadow-[0_10px_20px_rgba(255,215,0,0.1)]' : 'hover:bg-white/5 text-textMuted hover:text-white'}`}>
          <LayoutGrid size={18} /> Dashboard
        </Link>
        <Link href="/admin/matches" className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${pathname === '/admin/matches' ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-white/5 text-textMuted hover:text-white'}`}>
          <Trophy size={18} /> Matches
        </Link>
        <Link href="/admin/live" className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${pathname === '/admin/live' ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-white/5 text-textMuted hover:text-white'}`}>
          <Zap size={18} className={pathname === '/admin/live' ? '' : 'text-danger'} /> Live Scores
        </Link>
        <Link href="/admin/players" className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${pathname === '/admin/players' ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-white/5 text-textMuted hover:text-white'}`}>
          <Users size={18} /> Players
        </Link>
        <Link href="/admin/contests" className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${pathname === '/admin/contests' ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-white/5 text-textMuted hover:text-white'}`}>
          <Swords size={18} /> Contests
        </Link>
        <Link href="/admin/ai-picks" className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all ${pathname === '/admin/ai-picks' ? 'bg-accent/10 border border-accent/20 text-accent' : 'hover:bg-white/5 text-textMuted hover:text-white'}`}>
          <div className="bg-blue-400 font-black px-1.5 py-0.5 rounded text-[8px] text-[#0F1115]">AI</div> Predictor
        </Link>
      </nav>

      <button onClick={logout} className="mt-12 p-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-4 text-danger/80 hover:bg-danger/10 transition-colors border border-transparent hover:border-danger/20">
         <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col md:flex-row relative z-[9999]" style={{ isolation: "isolate" }}>
      <style suppressHydrationWarning>{`
        /* Force admin layout to be full width, bypassing root layout mobile constraints */
        body { 
          max-width: none !important; 
          margin: 0 !important; 
          border: none !important; 
          padding-bottom: 0 !important;
        }
        /* Hide global user app navigation while in admin */
        nav.fixed.bottom-\\[72px\\].max-w-md,
        nav.fixed.bottom-0.max-w-md { display: none !important; }
      `}</style>
      
      {!isLoginPage && <AdminSidebar />}

      <main className={`flex-1 overflow-y-auto ${!isLoginPage ? 'p-4 md:p-8' : ''}`}>
        {isLoginPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
