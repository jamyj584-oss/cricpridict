"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trophy, Zap, Swords, Activity, Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMatches: 0,
    liveMatches: 0,
    totalContests: 0,
  });

  useEffect(() => {
    if (!db) return;

    const unsubMatches = onSnapshot(collection(db, "matches"), (snapshot) => {
      let live = 0;
      snapshot.forEach(doc => {
        if (doc.data().status === "Live") live++;
      });
      setStats(prev => ({ ...prev, totalMatches: snapshot.size, liveMatches: live }));
    });

    const unsubContests = onSnapshot(collection(db, "contests"), (snapshot) => {
      setStats(prev => ({ ...prev, totalContests: snapshot.size }));
    });

    return () => {
      unsubMatches();
      unsubContests();
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest">Dashboard</h1>
        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">System Overview & Stats</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161B22] border border-white/5 p-8 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
             <p className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 opacity-60">Total Matches</p>
             <h3 className="text-5xl font-black text-white">{stats.totalMatches}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
             <Trophy size={28} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#161B22] border border-accent/30 p-8 rounded-3xl flex items-center justify-between shadow-[0_20px_40px_rgba(255,215,0,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={80} className="text-accent" />
          </div>
          <div className="relative z-10">
             <p className="text-[10px] text-accent uppercase tracking-widest font-black mb-2 flex items-center gap-1.5"><Activity size={12} className="animate-pulse" /> Live Now</p>
             <h3 className="text-5xl font-black text-accent">{stats.liveMatches}</h3>
          </div>
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-accent text-[#0F1115] flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.3)]">
             <Zap size={28} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#161B22] border border-white/5 p-8 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
             <p className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 opacity-60">Active Contests</p>
             <h3 className="text-5xl font-black text-white">{stats.totalContests}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
             <Swords size={28} />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-16 mb-6 px-2 italic">Master Controls</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Link href="/admin/matches" className="bg-[#161B22] border border-white/5 hover:border-accent/40 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1 shadow-lg">
           <div className="w-14 h-14 rounded-2xl bg-[#0F1115] border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:text-[#0F1115] group-hover:border-accent transition-all group-hover:rotate-6 shadow-inner">
              <Plus size={24} />
           </div>
           <span className="text-[10px] uppercase font-black tracking-widest text-[#FFFFFF]/60 group-hover:text-accent transition-colors">Add Match</span>
        </Link>
        <Link href="/admin/live" className="bg-[#161B22] border border-white/5 hover:border-danger/40 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1 shadow-lg">
           <div className="w-14 h-14 rounded-2xl bg-[#0F1115] border border-white/10 flex items-center justify-center group-hover:bg-danger group-hover:text-white group-hover:border-danger transition-all group-hover:-rotate-6 shadow-inner">
              <Activity size={24} />
           </div>
           <span className="text-[10px] uppercase font-black tracking-widest text-[#FFFFFF]/60 group-hover:text-danger transition-colors">Live Update</span>
        </Link>
        <Link href="/admin/contests" className="bg-[#161B22] border border-white/5 hover:border-purple-500/40 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group hover:-translate-y-1 shadow-lg">
           <div className="w-14 h-14 rounded-2xl bg-[#0F1115] border border-white/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 transition-all group-hover:scale-110 shadow-inner">
              <Swords size={24} />
           </div>
           <span className="text-[10px] uppercase font-black tracking-widest text-[#FFFFFF]/60 group-hover:text-purple-400 transition-colors">New Contest</span>
        </Link>
      </div>
    </div>
  );
}
