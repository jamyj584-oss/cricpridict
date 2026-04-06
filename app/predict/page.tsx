"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Wallet, Bell, Award, History, Users, ShieldCheck, Zap, LayoutGrid, Trophy, Play, Star, Sparkles, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useUserStore } from "@/store/useStore";

export default function PredictOverview() {
  const router = useRouter();
  const { user } = useUserStore();

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-32">
      {/* 04.png Header */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-[#161B22] flex items-center justify-center font-bold text-sm text-accent">
            {user?.phoneNumber?.substring(user.phoneNumber.length - 2) || "JD"}
          </div>
          <div>
            <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Welcome, Player</p>
            <h1 className="font-bold text-sm leading-tight text-white/90">
                {user?.phoneNumber ? `User ${user.phoneNumber.substring(user.phoneNumber.length - 4)}` : "Guest Player"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#161B22] px-3 py-1.5 rounded-full border border-white/10 text-sm font-bold cursor-pointer hover:bg-white/5 transition-colors" onClick={() => router.push("/wallet")}>
            <span className="text-accent">₹</span>
            <span>{user?.walletBalance ?? 0}</span>
          </div>
          <Bell size={22} className="text-white/60" />
        </div>
      </header>

      {/* Main Branding Section */}
      <div className="p-6">
          <div className="flex justify-between items-end mb-6">
              <div>
                  <h2 className="text-3xl font-black tracking-tight">Predict & Win</h2>
                  <p className="text-[10px] text-accent uppercase tracking-[0.3em] font-bold mt-1 opacity-60">The Imperial Selection</p>
              </div>
              <button className="text-xs font-bold text-textMuted uppercase tracking-widest hover:text-white transition-colors">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {/* AI Strategy Banner from 04.png */}
              <div className="relative rounded-[2rem] bg-gradient-to-br from-[#7698FB] to-[#2D3F6D] p-6 h-[180px] flex flex-col justify-center overflow-hidden col-span-1 shadow-2xl">
                  <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                       <Sparkles size={200} className="text-white absolute -top-10 -right-10" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">AI Strategy</h3>
                    <p className="text-[10px] text-white/70 mb-4 leading-relaxed font-bold uppercase tracking-wider">Let the algorithm pick your <br/> winning XI</p>
                    <button className="bg-white/90 text-[#0F1115] px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">Generate</button>
                  </div>
              </div>

              {/* Points Category Cards from 04.png */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#161B22] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 shadow-xl hover:border-accent/30 transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Award size={20} className="text-accent" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">Most 6s</p>
                      <p className="text-[10px] font-bold text-textMuted">+500 pts</p>
                  </div>
                  <div className="bg-[#161B22] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 shadow-xl hover:border-accent/30 transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Award size={20} className="text-accent" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">Hat-trick</p>
                      <p className="text-[10px] font-bold text-textMuted">+1200 pts</p>
                  </div>
              </div>
          </div>

          {/* Upcoming Battles Section from 04.png */}
          <div className="mb-10">
              <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3">Upcoming Battles <div className="flex-1 h-px bg-white/5 opacity-50"></div></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest">IPL 2024</span>
                            <span className="text-[9px] font-bold text-danger uppercase tracking-[0.2em] bg-danger/10 px-2 py-0.5 rounded-full">Starts in 2h 45m</span>
                        </div>
                        <div className="flex justify-between items-center px-4 mb-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs">CSK</div>
                                <span className="font-bold text-xs uppercase tracking-widest">CSK</span>
                            </div>
                            <span className="text-[10px] font-bold text-textMuted opacity-20 uppercase tracking-[0.3em]">VS</span>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs">RCB</div>
                                <span className="font-bold text-xs uppercase tracking-widest">RCB</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.push("/predict/selection")}
                            className="w-full bg-transparent border border-white/20 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            Join Contest
                        </button>
                  </div>
              </div>
          </div>

          {/* Quick Nav Row from 04.png */}
          <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                  { icon: Users, label: "Refer" },
                  { icon: History, label: "History" },
                  { icon: LayoutGrid, label: "Ranks" },
                  { icon: ShieldCheck, label: "Rules" }
              ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-[#161B22] border border-white/5 rounded-2xl flex items-center justify-center shadow-lg active:bg-accent active:text-primary transition-all">
                          <item.icon size={20} className="text-accent" />
                      </div>
                      <span className="text-[9px] font-bold text-textMuted uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
              ))}
          </div>

          {/* Live Tracker Row from 04.png */}
          <div className="bg-[#161B22]/60 border border-danger/20 rounded-2xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger shadow-[0_0_10px_#F87171]"></div>
              <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-1">LIVE: IND vs ENG</h4>
                    <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest">You are currently ranked <span className="text-white">#142</span></p>
                  </div>
              </div>
              <button 
                className="bg-[#161B22] border border-white/10 px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 active:scale-95 transition-all"
              >
                  Track
              </button>
          </div>
      </div>

      {/* Persistence navigation as seen in Home */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between items-end z-50">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-textMuted hover:text-white transition-colors" onClick={() => router.push("/")}>
              <LayoutGrid size={22} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-textMuted hover:text-white transition-colors" onClick={() => router.push("/match")}>
              <Trophy size={22} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Matches</span>
          </div>
          
          <div className="relative -top-3">
              <div onClick={() => router.push("/match")} className="w-14 h-14 bg-[#7698FB] rounded-full border-4 border-[#0F1115] flex items-center justify-center shadow-2xl shadow-accent/40 cursor-pointer active:scale-90 transition-transform">
                  <Plus size={28} className="text-[#0F1115]" />
              </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-accent">
              <Award size={22} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Winners</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-textMuted hover:text-white transition-colors" onClick={() => router.push("/profile")}>
              <User size={22} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </div>
      </nav>
    </main>
  );
}
