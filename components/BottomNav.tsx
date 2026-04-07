"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Trophy, Award, User, Plus } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide Bottom Navigation on Create Team page to avoid distractions
  if (pathname.includes("/create-team")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between items-end z-50">
      <div 
        className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${pathname === "/" ? "text-accent" : "text-textMuted hover:text-white"}`} 
        onClick={() => router.push("/")}
      >
        <LayoutGrid size={22} className={pathname === "/" ? "text-accent" : ""} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${pathname === "/" ? "text-white" : ""}`}>Home</span>
      </div>
      <div 
        className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${pathname?.startsWith("/match") ? "text-accent" : "text-textMuted hover:text-white"}`} 
        onClick={() => router.push("/match")}
      >
        <Trophy size={22} className={pathname?.startsWith("/match") ? "text-accent" : ""} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${pathname?.startsWith("/match") ? "text-white" : ""}`}>Matches</span>
      </div>
      
      <div className="relative -top-3">
          <div onClick={() => router.push("/match")} className="w-14 h-14 bg-[#7698FB] rounded-full border-4 border-[#0F1115] flex items-center justify-center shadow-2xl shadow-accent/40 cursor-pointer active:scale-90 transition-transform">
              <Plus size={28} className="text-[#0F1115]" />
          </div>
      </div>

      <div 
        className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${pathname?.startsWith("/winners") ? "text-accent" : "text-textMuted hover:text-white"}`} 
        onClick={() => router.push("/winners")}
      >
        <Award size={22} className={pathname?.startsWith("/winners") ? "text-accent" : ""} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${pathname?.startsWith("/winners") ? "text-white" : ""}`}>Winners</span>
      </div>
      <div 
        className={`flex flex-col items-center gap-1.5 cursor-pointer transition-colors ${pathname?.startsWith("/profile") ? "text-accent" : "text-textMuted hover:text-white"}`} 
        onClick={() => router.push("/profile")}
      >
        <User size={22} className={pathname?.startsWith("/profile") ? "text-accent" : ""} />
        <span className={`text-[9px] font-bold uppercase tracking-widest ${pathname?.startsWith("/profile") ? "text-white" : ""}`}>Profile</span>
      </div>
    </nav>
  );
}
