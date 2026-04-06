"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Share2, Info, Trophy, LayoutGrid, Award, Plus, User, Info as HelpIcon, RotateCw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Match } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveMatchStatus() {
  const router = useRouter();
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState("My Team");

  useEffect(() => {
    if (!id || !db) return;
    const unsubscribe = onSnapshot(doc(db, "matches", id as string), (doc) => {
      if (doc.exists()) {
        setMatch({ id: doc.id, ...doc.data() } as Match);
      }
    });
    return () => unsubscribe();
  }, [id]);

  if (!match) return <div className="min-h-screen bg-[#0F1115] flex items-center justify-center text-[#7698FB] uppercase tracking-widest font-bold">Connecting to Arena...</div>;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-32">
      {/* 08.png Header */}
      <header className="bg-[#0F1115]/80 backdrop-blur-md sticky top-0 z-50 p-4 border-b border-white/5 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white"><ChevronLeft size={24}/></button>
        <div className="text-center">
            <h1 className="text-sm font-bold uppercase tracking-widest">{match.teamA} vs {match.teamB}</h1>
            <p className="text-[10px] font-bold text-danger uppercase tracking-[0.2em] mt-0.5">LIVE • T20 World Cup</p>
        </div>
        <button className="text-white/80"><Share2 size={20}/></button>
      </header>

      {/* 08.png Scoreboard Card */}
      <div className="p-4">
          <div className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="white" strokeWidth="1" /></svg>
               </div>
               
               <div className="flex justify-between items-center mb-8 px-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-xs">IN</div>
                        <span className="font-bold text-xs uppercase tracking-widest">{match.teamA}</span>
                        <div className="text-center">
                            <h2 className="text-lg font-black tracking-tight">{match.scoreData?.teamAScore || "164/4 (18.2)"}</h2>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 pt-6">
                        <span className="text-[10px] font-bold text-textMuted opacity-20 uppercase tracking-[0.3em]">VS</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-xs">AU</div>
                        <span className="font-bold text-xs uppercase tracking-widest">{match.teamB}</span>
                        <div className="text-center">
                           <h2 className="text-lg font-black tracking-tight text-textMuted uppercase opacity-40 italic">Yet to bat</h2>
                        </div>
                    </div>
               </div>

               <div className="flex justify-between items-center border-t border-white/5 pt-4 text-[10px] font-bold text-textMuted uppercase tracking-widest">
                    <div className="flex gap-2">
                        <span className="text-white">Virat Kohli</span>
                        <span>74*(42)</span>
                    </div>
                    <div className="flex gap-2 opacity-50">
                        <span>Hardik Pandya</span>
                        <span>12(8)</span>
                    </div>
               </div>
          </div>
      </div>

      {/* 08.png My Fantasy Points Banner */}
      <div className="p-4">
          <div className="bg-gradient-to-br from-[#7698FB] to-[#2D3F6D] rounded-[2rem] p-8 h-[160px] flex justify-between items-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="40" cy="50" r="30" fill="white" filter="blur(30px)" /></svg>
                </div>
                <div>
                   <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">My Fantasy Points</p>
                   <h3 className="text-5xl font-black tracking-tighter">482</h3>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Current Rank</p>
                   <div className="flex items-center gap-2 justify-end">
                       < RotateCw size={12} className="text-white/40" />
                       <h3 className="text-2xl font-black tracking-tight">#1,248</h3>
                   </div>
                </div>
          </div>
      </div>

      {/* Tabs Row from 08.png */}
      <div className="flex px-4 gap-8 mb-6 mt-4">
          {["My Team", "Leaderboard", "Stats"].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] pb-1 relative transition-all ${activeTab === tab ? 'text-white' : 'text-textMuted'}`}
              >
                  {tab}
                  {activeTab === tab && <motion.div layoutId="live-tab-underline" className="absolute -bottom-1 left-0 right-0 h-1 bg-accent rounded-full" />}
              </button>
          ))}
      </div>

      {/* Live Point Updates List Implementation */}
      <AnimatePresence mode="wait">
        <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 space-y-4"
        >
            <div className="flex justify-between items-center px-2">
                <h4 className="text-xs font-black uppercase tracking-widest">Live Point Updates</h4>
                <button className="text-[9px] font-bold text-accent uppercase tracking-[0.2em] flex items-center gap-1"><RotateCw size={10}/> Refresh</button>
            </div>

            <div className="bg-[#161B22] border border-white/5 rounded-[2rem] p-4 divide-y divide-white/5 space-y-4">
                {[
                    { name: "Virat Kohli", role: "Batter", pts: "112 pts", sub: "4 runs + Milestone", color: "text-[#4ADE80]" },
                    { name: "Jasprit Bumrah", role: "Bowler", pts: "86 pts", sub: "Wicket (LBW)", color: "text-[#4ADE80]" },
                    { name: "Suryakumar Yadav", role: "Batter", pts: "42 pts", sub: "Strike Rate Bonus", color: "text-accent" }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs overflow-hidden relative">
                                <div className="absolute inset-0 bg-accent/10"></div>
                                {item.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold tracking-tight">{item.name} <span className="ml-1 text-[8px] bg-white/10 px-1 rounded text-accent uppercase">C</span></h4>
                                <p className="text-[10px] text-textMuted font-bold uppercase mt-0.5">{item.role}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <p className="font-black text-sm">{item.pts}</p>
                             <p className={`text-[9px] font-bold uppercase tracking-tighter ${item.color}`}>{item.sub}</p>
                         </div>
                    </div>
                ))}
            </div>

            {/* Leaderboard Summary from 08.png */}
            <div className="pt-6">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h4 className="text-xs font-black uppercase tracking-widest">Leaderboard</h4>
                    <button className="text-[9px] font-bold text-textMuted uppercase tracking-widest font-bold">View Full</button>
                </div>

                <div className="bg-[#161B22] border border-white/5 rounded-[1.5rem] divide-y divide-white/5 overflow-hidden">
                    {[
                        { rank: "1", name: "Rahul Kumar", initials: "RK", pts: "612", isSelf: false },
                        { rank: "2", name: "Amit Singh", initials: "AS", pts: "598", isSelf: false },
                        { rank: "1248", name: "John Doe (You)", initials: "JD", pts: "482", isSelf: true }
                    ].map((row, idx) => (
                        <div key={idx} className={`p-4 flex items-center justify-between ${row.isSelf ? 'bg-accent/5 ring-1 ring-inset ring-accent/20' : ''}`}>
                             <div className="flex items-center gap-4">
                                <span className={`text-xs font-black w-6 ${row.isSelf ? 'text-accent' : 'text-textMuted opacity-50'}`}>{row.rank}</span>
                                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-bold text-[10px] ${row.isSelf ? 'bg-accent text-primary' : 'bg-primary'}`}>
                                    {row.initials}
                                </div>
                                <span className={`text-[11px] font-bold tracking-wide ${row.isSelf ? 'text-white' : 'text-textMain'}`}>{row.name}</span>
                             </div>
                             <span className="font-black text-xs">{row.pts}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 08.png Predict & Win Tracker Bar Implementation */}
            <div className="pt-6 pb-10">
                <div className="bg-[#161B22] border border-white/5 rounded-2xl p-5 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Predict & Win Tracker</h4>
                        <span className="bg-[#4ADE80] text-[#0F1115] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">2/4 Correct</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-1">
                            <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest mb-1 opacity-50">Most 6s: V. Kohli</p>
                            <div className="w-full h-1 bg-[#0F1115] rounded-full overflow-hidden">
                                <div className="h-full bg-[#4ADE80] w-[70%]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest mb-1 opacity-50">Wickets: J. Bumrah</p>
                            <div className="w-full h-1 bg-[#0F1115] rounded-full overflow-hidden">
                                <div className="h-full bg-accent/30 w-[45%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </AnimatePresence>

      {/* Main persistence bottom nav (08.png has no icons shown, but matches global) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between items-end z-50">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-textMuted" onClick={() => router.push("/")}>
              <LayoutGrid size={22} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-accent">
              <Trophy size={22} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Matches</span>
          </div>
          
          <div className="relative -top-3">
              <div onClick={() => router.push("/create")} className="w-14 h-14 bg-white/10 rounded-full border-4 border-[#0F1115] flex items-center justify-center cursor-pointer opacity-30">
                  <Plus size={28} className="text-white" />
              </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-textMuted hover:text-white transition-colors" onClick={() => router.push("/winners")}>
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
