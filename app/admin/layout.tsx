"use client";

import { useUserStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Trophy, LogOut, Zap, Activity, MessageSquare, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminAuth") === "true";
    if (!isAdmin && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  if (loading && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center text-accent uppercase tracking-widest font-black animate-pulse">
        Authenticating Admin...
      </div>
    );
  }

  if (pathname === "/admin/login") return <>{children}</>;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Matches", icon: Trophy, path: "/admin/matches" },
    { name: "Live Scores", icon: Zap, path: "/admin/live" },
    { name: "Players", icon: Users, path: "/admin/players" },
    { name: "Contests", icon: Activity, path: "/admin/contests" },
    { name: "Predictor", icon: MessageSquare, path: "/admin/ai-picks" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0F1115] text-white font-inter overflow-x-hidden">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="fixed top-6 left-6 z-[100] p-3 bg-accent text-[#0F1115] rounded-xl shadow-xl lg:hidden active:scale-95 transition-all"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#161B22] border-r border-white/5 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
          <div className="flex flex-col h-full p-6">
              <div className="flex items-center gap-3 mb-12 overflow-hidden whitespace-nowrap">
                  <div className="w-10 h-10 bg-accent text-[#0F1115] rounded-xl flex items-center justify-center font-black shadow-[0_0_15px_rgba(255,215,0,0.3)] shrink-0">
                      A
                  </div>
                  <div className={`${!sidebarOpen && 'lg:opacity-0 lg:hidden'} transition-opacity`}>
                      <h2 className="text-sm font-black uppercase tracking-widest leading-none">Super Admin</h2>
                      <p className="text-[9px] text-textMuted uppercase font-bold mt-1 tracking-tighter">API Control</p>
                  </div>
              </div>

              <nav className="flex-1 space-y-2 font-black">
                 {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                       <Link 
                          key={item.name} 
                          href={item.path} 
                          className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group overflow-hidden whitespace-nowrap ${isActive ? 'bg-accent text-[#0F1115] font-black shadow-[0_10px_20px_rgba(255,215,0,0.1)]' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                       >
                          <item.icon size={20} className="shrink-0" />
                          <span className={`text-[11px] uppercase tracking-widest font-black transition-opacity ${!sidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
                            {item.name}
                          </span>
                       </Link>
                    )
                 })}
              </nav>

              <button 
                 onClick={() => { localStorage.removeItem("adminAuth"); router.push("/admin/login"); }}
                 className="flex items-center gap-4 px-4 py-4 rounded-2xl text-danger/50 hover:text-danger hover:bg-danger/5 transition-all mt-auto overflow-hidden whitespace-nowrap"
              >
                 <LogOut size={20} className="shrink-0" />
                 <span className={`text-[11px] uppercase tracking-widest font-black transition-opacity ${!sidebarOpen && 'lg:opacity-0 lg:hidden'}`}>
                    Logout
                 </span>
              </button>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} p-6 md:p-10 min-w-0`}>
         <div className="w-full max-w-[1600px] mx-auto">
            {children}
         </div>
      </main>
    </div>
  );
}
