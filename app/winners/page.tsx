"use client";

import { ChevronLeft, Trophy, Award, Star, TrendingUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const WINNERS = [
  { id: "1", name: "Rohan K.", prize: "₹5,00,000", match: "IND vs PAK", points: 842.5, rank: 1, avatar: "RK" },
  { id: "2", name: "Sneha S.", prize: "₹2,50,000", match: "CSK vs MI", points: 830.0, rank: 2, avatar: "SS" },
  { id: "3", name: "Aditya P.", prize: "₹1,00,000", match: "IND vs PAK", points: 815.2, rank: 3, avatar: "AP" },
];

export default function WinnersPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-32">
      {/* Premium Header */}
      <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent"></div>
          <header className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between">
              <button onClick={() => router.back()} className="p-2 bg-[#0F1115]/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                  <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-bold tracking-tight">Imperial Winners</h1>
              <Award size={24} className="text-accent" />
          </header>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 mt-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center shadow-2xl shadow-accent/40 mb-4"
              >
                  <Trophy size={40} className="text-[#0F1115]" />
              </motion.div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Hall of Fame</h2>
              <p className="text-xs text-textMuted font-bold uppercase tracking-widest opacity-60">Rewarding the world's best tacticians</p>
          </div>
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-3 gap-3 px-6 -mt-8 relative z-10">
          {[
              { label: "Pool Won", value: "₹24M+", icon: Award },
              { label: "Top Rank", value: "#1", icon: Star },
              { label: "Trending", value: "+14%", icon: TrendingUp }
          ].map((stat, i) => (
              <div key={i} className="bg-[#161B22] border border-white/5 rounded-2xl p-4 shadow-xl flex flex-col items-center gap-1.5 backdrop-blur-md">
                 <stat.icon size={16} className="text-accent mb-1" />
                 <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest">{stat.label}</span>
                 <p className="text-xs font-bold">{stat.value}</p>
              </div>
          ))}
      </div>

      {/* Top 3 Podium Selection Placeholder */}
      <div className="p-6 mt-8">
          <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-black tracking-tight">Recent Champions</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full">
                  <Sparkles size={12} /> Live Updates
              </div>
          </div>

          <div className="space-y-4">
              {WINNERS.map((winner, idx) => (
                  <motion.div 
                    key={winner.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[#161B22] border border-white/5 rounded-[2rem] p-5 flex items-center justify-between shadow-xl relative overflow-hidden group"
                  >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_#FFD700]"></div>
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs border-2 ${idx === 0 ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-white'}`}>
                              {winner.avatar}
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-white/90">{winner.name}</h4>
                              <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest mt-0.5">{winner.match}</p>
                          </div>
                      </div>

                      <div className="text-right">
                          <p className="text-xs font-black text-accent mb-0.5">{winner.prize}</p>
                          <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest">{winner.points} pts</p>
                      </div>
                  </motion.div>
              ))}
          </div>
      </div>

      {/* Hero Banner Bottom */}
      <div className="px-6 mt-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">Your Name Here?</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-6">Join the next mega contest now</p>
                    <button 
                        onClick={() => router.push("/")}
                        className="bg-white text-blue-700 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        View Matches
                    </button>
                </div>
          </div>
      </div>
    </main>
  );
}
