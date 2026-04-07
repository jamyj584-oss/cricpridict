"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Edit2, ShieldCheck, Wallet, History, Bell, HelpCircle, LogOut, Award, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-32">
      {/* 09.png Header */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
        <button onClick={() => router.back()} className="text-white"><ChevronLeft size={24}/></button>
        <h1 className="font-black text-sm uppercase tracking-widest">Imperial Profile</h1>
        <button className="text-accent text-[10px] font-bold uppercase tracking-widest">Edit</button>
      </header>

      {/* User Branding Row from 09.png */}
      <div className="p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-accent/30 p-1 bg-gradient-to-br from-accent/20 to-transparent">
              <div className="w-full h-full rounded-full bg-[#161B22] border-2 border-[#0F1115] flex items-center justify-center font-black text-2xl text-accent">JD</div>
          </div>
          <div>
              <h2 className="text-xl font-bold flex items-center gap-2">John Doe <CheckCircle2 size={16} className="text-accent" /></h2>
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-0.5">Level 42 Strategist</p>
              <div className="bg-accent/20 border border-accent/40 px-3 py-1 rounded-full text-[9px] font-black text-accent uppercase tracking-widest mt-2 w-fit">Pro Member</div>
          </div>
      </div>

      {/* Stats Grid from 09.png */}
      <div className="p-4 grid grid-cols-2 gap-4">
          {[
              { val: "₹12.5k", label: "Total Winnings" },
              { val: "68%", label: "Win Rate" },
              { val: "142", label: "Contests Joined" },
              { val: "12", label: "Series Wins" }
          ].map((stat, i) => (
              <div key={i} className="bg-[#161B22] border border-white/5 rounded-2xl p-5 shadow-xl">
                  <h3 className="text-xl font-black text-white">{stat.val}</h3>
                  <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
          ))}
      </div>

      {/* Daily Zen Streak Card from 09.png */}
      <div className="p-4">
          <div className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-bold tracking-tight">Daily Zen Streak</h4>
                    <span className="text-accent text-[11px] font-bold uppercase tracking-widest">5 Days</span>
               </div>
               
               <div className="flex justify-between items-center mb-8 px-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${day <= 5 ? 'bg-accent/30 text-accent border border-accent/40' : 'bg-[#0F1115] text-textMuted border border-white/10 opacity-30 shadow-inner'}`}>
                                {day <= 5 ? <CheckCircle2 size={16} strokeWidth={3} /> : <span className="text-[10px] font-bold">{day}</span>}
                            </div>
                        </div>
                    ))}
               </div>
               
               <button className="w-full bg-[#161B22] border border-white/10 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold shadow-lg hover:bg-white/5 transition-all">
                    Claim Daily Bonus
               </button>
          </div>
      </div>

      {/* Points Progression Graph from 09.png */}
      <div className="p-4">
          <div className="bg-[#161B22] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <h4 className="text-sm font-bold tracking-tight mb-4 text-white/50">Points Progression</h4>
                <div className="h-32 w-full mt-6 flex items-end justify-between px-2 relative">
                    {/* SVG Graph path mask */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none stroke-accent stroke-[3] fill-none opacity-50 overflow-visible">
                        <path d="M0,80 L20,70 L40,85 L60,50 L80,75 L100,20 L120,40" strokeDasharray="1000" vectorEffect="non-scaling-stroke" />
                    </svg>

                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-4 relative z-10 w-full group">
                            <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-[#161B22] shadow-[0_0_10px_#7698FB] ${idx === 5 ? 'bg-accent scale-150' : 'bg-accent/40'}`} style={{ marginBottom: `${[20, 25, 10, 40, 20, 50, 40][idx]}px` }}></div>
                            <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest">{day}</span>
                        </div>
                    ))}
                </div>
          </div>
      </div>

      {/* Imperial Collection Badges from 09.png */}
      <div className="p-4">
          <div className="flex justify-between items-center mb-6 px-2">
              <h4 className="text-xs font-black uppercase tracking-widest">Imperial Collection</h4>
              <button className="text-[10px] font-bold text-accent uppercase tracking-widest">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
              {[
                  { label: "First Blood", icon: Award, active: true },
                  { label: "Centurion", icon: Award, active: true },
                  { label: "Oracle", icon: Star, active: true },
                  { label: "Grandmaster", icon: Award, active: false }
              ].map((badge, idx) => (
                  <div key={idx} className={`flex flex-col items-center gap-3 min-w-[80px] ${badge.active ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                      <div className="w-14 h-14 bg-[#161B22] border border-white/5 rounded-[1.5rem] flex items-center justify-center shadow-lg relative">
                          <badge.icon size={28} className="text-accent" />
                          {badge.active && <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-[#161B22]"></div>}
                      </div>
                      <span className="text-[9px] font-bold text-textMuted uppercase tracking-[0.05em] text-center">{badge.label}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Settings list from 09.png */}
      <div className="p-4 space-y-4">
          <h4 className="text-[10px] text-textMuted font-bold uppercase tracking-[0.2em] mb-4 px-2">Account Settings</h4>
          <div className="bg-[#161B22] border border-white/5 rounded-[1.5rem] divide-y divide-white/5 overflow-hidden shadow-2xl">
              {[
                  { icon: Wallet, label: "Wallet & Withdrawals", sub: "Manage your winnings and deposits", route: "/wallet" },
                  { icon: ShieldCheck, label: "Identity Verification", sub: "KYC completed on Oct 12", route: "/kyc" },
                  { icon: History, label: "Transaction History", sub: null, route: "/history" },
                  { icon: Bell, label: "Notification Preferences", sub: null, route: "/notifications" },
                  { icon: HelpCircle, label: "Help & Support", sub: "24/7 Imperial Concierge", route: "/help" },
                  { icon: LogOut, label: "Logout", sub: null, route: "/login", isDanger: true }
              ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => router.push(item.route)}
                    className="p-5 flex items-center justify-between cursor-pointer active:bg-white/5 transition-all group"
                  >
                      <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center transition-all group-hover:scale-105 shadow-inner ${item.isDanger ? 'bg-danger/10' : ''}`}>
                              <item.icon size={20} className={item.isDanger ? 'text-danger' : 'text-accent'} />
                          </div>
                          <div>
                              <h4 className={`text-sm font-bold tracking-tight ${item.isDanger ? 'text-danger' : 'text-white/90'}`}>{item.label}</h4>
                              {item.sub && <p className="text-[10px] text-textMuted mt-0.5">{item.sub}</p>}
                          </div>
                      </div>
                      <ChevronLeft size={20} className="text-textMuted rotate-180 opacity-40 group-hover:opacity-100 transition-all font-bold" />
                  </div>
              ))}
          </div>
      </div>

      {/* 09.png Footer */}
      <div className="text-center py-10 opacity-30">
          <p className="text-[9px] font-black uppercase tracking-widest text-textMuted mb-2">Version 2.4.0-BETA</p>
          <p className="text-[9px] font-bold text-textMuted uppercase tracking-widest">Play Responsibly. 18+ Only.</p>
          <p className="text-[9px] text-[#7698FB] font-bold uppercase tracking-widest mt-2 underline cursor-pointer">Terms of Service • Privacy Policy</p>
      </div>

    </main>
  );
}
