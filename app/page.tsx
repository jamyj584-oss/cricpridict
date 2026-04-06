"use client";

import { useEffect, useState } from "react";
import { Bell, Trophy, User, Loader2, Wallet, LayoutGrid, Award, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Match, MatchStatus } from "@/types";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useStore";

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MatchStatus>("Upcoming");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");

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

  // Robust Time Display for Firestore Timestamps
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
      {/* 03.png Header Implementation */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-[#161B22] flex items-center justify-center font-bold text-sm text-textMain">
            {user?.phoneNumber?.substring(user.phoneNumber.length - 2) || "JD"}
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">CricPredict</h1>
            <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Imperial League</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/wallet")} className="flex items-center gap-2 bg-[#161B22] px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold hover:bg-[#1A2234] transition-colors">
            <span className="text-sm">🪙</span>
            <span>{(user?.walletCoins || 0).toLocaleString()}</span>
          </button>
          <button className="p-1 relative">
            <Bell size={20} className="text-white/80" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-[#0F1115]"></div>
          </button>
        </div>
      </header>

      {/* Hero Banner (Predict & Win) */}
      <div className="p-4">
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#7698FB] to-[#2D3F6D] p-6 h-[190px] flex flex-col justify-center">
            {/* Wavy background decoration */}
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                    <path d="M0,100 C150,150 250,50 400,100 L400,400 L0,400 Z" fill="white"></path>
                </svg>
            </div>

            <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold w-fit uppercase tracking-widest mb-3">
                    Predict & Win
                </div>
                <h2 className="text-3xl font-bold mb-1 tracking-tight">Win ₹10 Lakhs</h2>
                <p className="text-xs text-white/70 mb-5 font-medium">Predict boundaries & wickets</p>
                <button onClick={() => router.push("/predict")} className="bg-white/90 text-[#0F1115] w-full py-2.5 rounded-lg font-bold text-sm shadow-xl shadow-black/10 active:scale-[0.98] transition-all">
                    Predict Now
                </button>
            </div>
        </div>
      </div>

      {/* Horizontal Nav Blocks (Matches, Winners, etc) */}
      <div className="grid grid-cols-4 gap-3 px-4 mb-8">
          {[
              { icon: LayoutGrid, label: "Matches", color: "text-accent", link: "/match" },
              { icon: Award, label: "Winners", color: "text-white", link: "/winners" },
              { icon: Award, label: "Profile", color: "text-accent", link: "/profile" },
              { icon: Trophy, label: "Wallet", color: "text-white", link: "/wallet" }
          ].map((item, idx) => (
              <div key={idx} onClick={() => router.push(item.link)} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-12 h-12 bg-[#161B22] border border-white/5 rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                      <item.icon size={20} className={item.color} />
                  </div>
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider group-hover:text-white transition-colors">{item.label}</span>
              </div>
          ))}
      </div>

      {/* Tabs Implementation from 03.png */}
      <div className="flex px-4 gap-8 mb-6 relative">
        {['Upcoming', 'Live', 'Completed'].map((tab) => (
           <button 
           key={tab}
           onClick={() => setActiveTab(tab as MatchStatus)}
           className={`text-sm font-bold uppercase tracking-widest pb-1 relative transition-all ${activeTab === tab ? 'text-white' : 'text-textMuted'}`}
         >
           {tab}
           {activeTab === tab && (
               <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-1 bg-accent rounded-full shadow-lg shadow-accent/40" />
           )}
         </button>
        ))}
      </div>

      {/* Match Cards Container */}
      <div className="px-4 space-y-4">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-textMuted opacity-50">
             <Loader2 className="animate-spin mb-4 text-accent" size={40} />
             <p className="text-xs font-bold tracking-widest uppercase">Syncing Arena...</p>
           </div>
        ) : filteredMatches.length === 0 ? (
            <div className="bg-[#161B22] border border-dashed border-white/10 rounded-[2rem] p-12 text-center">
                <Trophy size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-sm font-bold text-textMuted uppercase tracking-widest leading-loose">No {activeTab} matches <br/> available right now</p>
            </div>
        ) : (
            filteredMatches.map((match) => (
                <div key={match.id} className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                     {/* Team Logos Overlay (matches circular aesthetic of 03.png) */}
                     <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <p className="text-[9px] text-textMuted font-bold uppercase tracking-[0.2em]">{match.league}</p>
                        </div>
                        <div className="bg-[#0F1115] border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
                            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'Live' ? 'bg-danger animate-pulse' : 'bg-accent'}`}></div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTab === 'Live' ? 'text-danger' : 'text-accent'}`}>
                                {activeTab === 'Upcoming' ? `Starts in ${getTimeDisplay(match.startTime)}` : match.status}
                            </span>
                        </div>
                     </div>

                     <div className="flex justify-between items-center mb-8 px-2">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#7698FB] to-[#4B73E1] p-0.5 shadow-lg shadow-black/40">
                                <div className="w-full h-full rounded-full bg-[#161B22] border-2 border-[#161B22] flex items-center justify-center overflow-hidden">
                                     {/* Mock logo as seen in screenshot */}
                                     {match.teamA.charAt(0)}
                                </div>
                            </div>
                            <span className="font-bold text-sm tracking-tight">{match.teamA}</span>
                        </div>

                        <div className="text-[10px] font-bold text-textMuted uppercase tracking-[0.3em] opacity-30">VS</div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#7698FB] to-[#4B73E1] p-0.5 shadow-lg shadow-black/40">
                                <div className="w-full h-full rounded-full bg-[#161B22] border-2 border-[#161B22] flex items-center justify-center overflow-hidden">
                                     {match.teamB.charAt(0)}
                                </div>
                            </div>
                            <span className="font-bold text-sm tracking-tight">{match.teamB}</span>
                        </div>
                     </div>

                     <div className="flex justify-between items-center border-t border-white/5 pt-5 mt-2">
                        <div>
                            <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest mb-1">Mega Contest</p>
                            <p className="font-bold text-accent">₹50 Lakhs</p>
                        </div>
                        <button 
                            onClick={() => router.push(`/contest/${match.id}`)}
                            className="bg-[#7698FB] text-[#0F1115] px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#7698FB]/20 hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                            {activeTab === 'Upcoming' ? "Create Team" : activeTab === 'Live' ? "Track Live" : "Final Standings"}
                        </button>
                     </div>
                </div>
            ))
        )}
      </div>

      {/* AI Smart Pick Implementation */}
      <div className="p-4">
          <div 
            onClick={() => {
                if (aiResult) return;
                setAiLoading(true);
                setAiError("");
                setTimeout(() => {
                    if (Math.random() > 0.9) {
                        setAiError("AI Engine busy. Please try again.");
                        setAiLoading(false);
                    } else {
                        setAiResult("🔥 AI Predicts: Virat Kohli is heavily underpriced at 8.5 Credits given his historical strike rate at Wankhede.");
                        setAiLoading(false);
                    }
                }, 2000);
            }}
            className="bg-gradient-to-r from-[#161B22] to-[#1A2234] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 cursor-pointer hover:border-accent/20 transition-all group overflow-hidden relative"
          >
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#0F1115] border border-white/10 rounded-full flex items-center justify-center shrink-0">
                      <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center">
                          {aiLoading ? <Loader2 size={14} className="text-accent animate-spin" /> : <Plus size={14} className="text-accent" />}
                      </div>
                  </div>
                  <div className="flex-1">
                      <h4 className="text-xs font-bold text-white/90">Deep Engine Analysis</h4>
                      <p className="text-[10px] text-textMuted mt-0.5">Generate real-time AI squad predictions based on pitch reports & form.</p>
                  </div>
              </div>

              {/* Dynamic Expandable Content */}
              {aiLoading && (
                  <div className="text-[10px] text-accent animate-pulse font-bold uppercase tracking-widest pl-14">
                      Running Neural Net Simulation...
                  </div>
              )}
              {aiError && (
                  <div className="text-[10px] text-danger font-bold uppercase tracking-widest pl-14">
                      {aiError}
                  </div>
              )}
              {aiResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[10px] text-success/90 font-bold uppercase tracking-wider px-4 py-3 bg-success/10 rounded-xl border border-success/20 leading-relaxed mx-2">
                      {aiResult}
                  </motion.div>
              )}
          </div>
      </div>

      {/* 03.png Disclaimer */}
      <div className="text-center px-8 mt-4 text-[9px] font-bold text-textMuted uppercase tracking-widest opacity-60 leading-relaxed">
          18+ Only • Play Responsibly <br/>
          <span className="underline mt-1 block">Terms & Conditions Apply</span>
      </div>

      {/* Fixed Bottom Navigation (matches 03.png) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex justify-between items-end z-50">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer text-white" onClick={() => router.push("/")}>
              <LayoutGrid size={22} className="text-accent" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Home</span>
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
