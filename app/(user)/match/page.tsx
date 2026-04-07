"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Trophy, Loader2, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Match, MatchStatus } from "@/types";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useStore";

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MatchStatus>("Upcoming");

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "matches"), orderBy("startTime", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchData: Match[] = [];
      snapshot.forEach((doc) => {
        matchData.push({ id: doc.id, ...doc.data() } as Match);
      });
      setMatches(matchData);
      setLoading(false);
    }, (error) => {
      console.error("Match fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMatches = matches.filter(m => m.status === activeTab);

  const getTimeDisplay = (timestamp: any) => {
    if (!timestamp) return "TBD";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs < 0) return "Started";
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return `${diffHrs}h ${remainingMins}m`;
  };

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">All Matches</h1>
        </div>
        <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-full"><Search size={20} className="text-textMuted" /></button>
            <button className="p-2 hover:bg-white/5 rounded-full"><Filter size={20} className="text-textMuted" /></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-6 pt-6 gap-8 mb-6 bg-[#0F1115]">
        {['Upcoming', 'Live', 'Completed'].map((tab) => (
           <button 
           key={tab}
           onClick={() => setActiveTab(tab as MatchStatus)}
           className={`text-sm font-bold uppercase tracking-widest pb-3 relative transition-all ${activeTab === tab ? 'text-accent' : 'text-textMuted'}`}
         >
           {tab}
           {activeTab === tab && (
               <motion.div layoutId="match-tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full shadow-[0_0_10px_#FFD700]" />
           )}
         </button>
        ))}
      </div>

      {/* Match Cards */}
      <div className="px-6 space-y-4">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-textMuted">
                <Loader2 className="animate-spin mb-4 text-accent" size={40} />
                <p className="text-xs font-bold tracking-widest uppercase">Syncing Arena...</p>
             </div>
        ) : filteredMatches.length === 0 ? (
            <div className="bg-[#161B22] border border-dashed border-white/10 rounded-[2rem] p-12 text-center opacity-50">
                <Trophy size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-sm font-bold text-textMuted uppercase tracking-widest">No {activeTab} matches</p>
            </div>
        ) : (
            <AnimatePresence mode="popLayout">
                {filteredMatches.map((match) => (
                    <motion.div 
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => router.push(`/contest/${match.id}`)}
                        className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-[9px] text-textMuted font-bold uppercase tracking-[0.2em]">{match.league}</p>
                            <div className="bg-[#0F1115] border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'Live' ? 'bg-danger animate-pulse' : 'bg-accent'}`}></div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === 'Live' ? 'text-danger' : 'text-accent'}`}>
                                    {activeTab === 'Upcoming' ? `Starts in ${getTimeDisplay(match.startTime)}` : match.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col items-center gap-3 w-24">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#7698FB] to-[#4B73E1] p-0.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-[#161B22] border-2 border-[#161B22] flex items-center justify-center font-black text-lg">
                                        {match.teamA.charAt(0)}
                                    </div>
                                </div>
                                <span className="font-bold text-sm tracking-tight text-center">{match.teamA}</span>
                            </div>

                            <div className="text-[10px] font-bold text-textMuted uppercase tracking-[0.3em] opacity-30">VS</div>

                            <div className="flex flex-col items-center gap-3 w-24">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#7698FB] to-[#4B73E1] p-0.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-[#161B22] border-2 border-[#161B22] flex items-center justify-center font-black text-lg">
                                        {match.teamB.charAt(0)}
                                    </div>
                                </div>
                                <span className="font-bold text-sm tracking-tight text-center">{match.teamB}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                            <div className="bg-white/5 px-3 py-1 rounded-lg">
                                <p className="text-[8px] text-textMuted font-bold uppercase tracking-widest">Mega Contest</p>
                                <p className="text-xs font-bold text-accent">₹50L Pool</p>
                            </div>
                            <button className="bg-accent text-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/10 active:scale-95 transition-all">
                                {activeTab === 'Upcoming' ? "Enter Lobby" : "View Match"}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        )}
      </div>
    </main>
  );
}
