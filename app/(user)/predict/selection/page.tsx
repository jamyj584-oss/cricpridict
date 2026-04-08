"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { ChevronLeft, HelpCircle, Minus, Plus, Lock, Sparkles, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Match, Player } from "@/types";
import { useUserStore } from "@/store/useStore";
import LoadingFallback from "../../components/LoadingFallback";

function PredictSelectionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  const { user } = useUserStore();

  const [activeTab, setActiveTab] = useState("Most 6s");
  const [saving, setSaving] = useState(false);
  
  const [predictions, setPredictions] = useState<Record<string, Record<string, number>>>({
      "Most 6s": {},
      "Most 4s": {},
      "Wickets": {},
      "Catch": {}
  });

  const [match, setMatch] = useState<Match | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }

    const qMatches = query(collection(db, "matches"), orderBy("startTime", "asc"));
    const unsubMatches = onSnapshot(qMatches, (snapshot) => {
         const mData: Match[] = [];
         snapshot.forEach(d => mData.push({ id: d.id, ...d.data() } as Match));
         
         let targetMatch = null;
         if (matchId) {
             targetMatch = mData.find(m => m.id === matchId) || null;
         } else {
             targetMatch = mData.find(m => m.status === 'Upcoming') || mData[0] || null;
         }
         
         if (targetMatch && (!match || match.id !== targetMatch.id)) {
            setMatch(targetMatch);
         }
    });

    const qPlayers = query(collection(db, "players"));
    const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const data: Player[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Player));
      setAllPlayers(data);
    });

    return () => {
        unsubMatches();
        unsubPlayers();
    };
  }, [matchId]);

  useEffect(() => {
    if (allPlayers.length > 0 && match) {
        const squadIds = new Set([
            ...(match.squadA || []),
            ...(match.squadB || [])
        ]);

        let filteredOpts = allPlayers;
        if (squadIds.size > 0) {
            filteredOpts = allPlayers.filter(p => squadIds.has(p.id!));
        } else {
            filteredOpts = allPlayers.filter(p => p.team === match.teamA || p.team === match.teamB);
        }
        
        setAvailablePlayers(filteredOpts);
        setLoading(false);
    } else if (allPlayers.length > 0 && !match) {
        setLoading(false);
    }
  }, [allPlayers, match]);

  const updatePrediction = (playerId: string, delta: number) => {
    setPredictions(prev => {
        const currentTabScores = prev[activeTab] || {};
        const currentScore = currentTabScores[playerId] || 0;
        const newScore = Math.max(0, currentScore + delta);

        if (delta > 0 && currentScore === 0) {
            const playersSelectedCount = Object.values(currentTabScores).filter(v => v > 0).length;
            if (playersSelectedCount >= 6) {
                alert("You can only predict for a maximum of 6 players per category! Increase counts of selected players or remove one first.");
                return prev;
            }
        }

        return {
            ...prev,
            [activeTab]: {
                ...currentTabScores,
                [playerId]: newScore
            }
        };
    });
  };

  const totalForTab = Object.values(predictions[activeTab] || {}).reduce((a, b) => a + b, 0);

  let totalPicks = 0;
  Object.values(predictions).forEach(tabObj => {
      Object.values(tabObj).forEach(score => {
          totalPicks += score;
      });
  });

  const lockCost = totalPicks * 75;

  const handleLock = async () => {
      if (totalPicks === 0) return alert("Make at least 1 prediction.");
      if (!user?.uid) return alert("Please log in to lock predictions.");
      if (user.walletBalance < lockCost) {
          return alert(`Insufficient Balance! You have ${user.walletBalance} C, but need ${lockCost} C.`);
      }

      setSaving(true);
      try {
          await updateDoc(doc(db, "users", user.uid), {
             walletBalance: user.walletBalance - lockCost
          });
          alert(`Success! Locked ${totalPicks} prediction picks. ${lockCost} Coins deducted.`);
          router.push("/");
      } catch (err) {
          console.error(err);
          alert("Failed to pay entry fee. Try again.");
      } finally {
          setSaving(false);
      }
  };

  const displayedPlayers = useMemo(() => {
      let roleFilter = ["BAT", "AR", "WK", "BOWL"];
      if (activeTab === "Most 6s" || activeTab === "Most 4s") roleFilter = ["BAT", "WK", "AR"];
      if (activeTab === "Wickets") roleFilter = ["BOWL", "AR"];
      
      return availablePlayers.filter(p => roleFilter.includes(p.role));
  }, [availablePlayers, activeTab]);

  if (loading) return (
     <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center">
         <Loader2 className="animate-spin text-accent mb-4" size={40} />
         <p className="text-xs font-bold text-accent uppercase tracking-widest">Loading Match Data...</p>
     </div>
  );

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-36">
      <header className="bg-[#161B22] p-4 border-b border-white/5 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-white"><ChevronLeft size={24}/></button>
          <div className="text-center flex-1">
            <h1 className="text-sm font-bold uppercase tracking-widest text-[#FFFFFF]">Predict & Win</h1>
          </div>
          <HelpCircle size={20} className="text-textMuted" />
        </div>

        {/* Match Info Bar */}
        <div className="bg-[#0F1115] border border-white/5 p-4 rounded-xl flex items-center justify-between mb-4 shadow-inner">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-black text-[10px] text-accent">
                    {match ? match.teamA.substring(0,3).toUpperCase() : "T1"}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">{match?.teamA || "Team 1"}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{match?.status || 'Active'}</span>
                <span className="text-[10px] font-bold text-textMuted opacity-30 uppercase tracking-[0.3em]">VS</span>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-black text-[10px] text-accent">
                    {match ? match.teamB.substring(0,3).toUpperCase() : "T2"}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">{match?.teamB || "Team 2"}</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 overflow-x-auto no-scrollbar px-2 pt-2">
            {["Most 6s", "Most 4s", "Wickets", "Catch"].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-bold uppercase tracking-widest min-w-max pb-3 relative transition-all ${activeTab === tab ? 'text-accent' : 'text-textMuted'}`}
                >
                    {tab}
                    {activeTab === tab && <motion.div layoutId="pred-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_8px_#FFD700]" />}
                </button>
            ))}
        </div>
      </header>

      {/* Roster List */}
      <div className="p-4 space-y-4">
          <div className="flex justify-between items-center px-2 mb-4 border-b border-white/5 pb-2">
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Select {activeTab} Picks (Max 6 Plrs)</span>
              <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">Total Predicted: {totalForTab}</span>
          </div>

          {!match && <p className="text-center text-xs text-textMuted p-10 uppercase tracking-widest">No active match found.</p>}

          {displayedPlayers.map((player) => (
              <div key={player.id} className="bg-[#161B22] border border-white/5 rounded-[1.5rem] p-4 flex items-center justify-between shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                   <div className="flex items-center gap-4 relative z-10 w-full">
                        <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs relative overflow-hidden shrink-0">
                             {player.imageUrl ? (
                                <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                             ) : (
                                <span className="text-white/50">{player.team.charAt(0)}</span>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent pointer-events-none"></div>
                        </div>
                        <div className="flex-1">
                             <h4 className="text-sm font-bold tracking-tight">{player.name}</h4>
                             <div className="flex justify-between items-center pr-2 mt-1">
                                 <span className="text-[9px] text-textMuted bg-white/5 px-2 py-0.5 rounded uppercase font-bold tracking-widest flex items-center gap-1">
                                     <div className={`w-1.5 h-1.5 rounded-full ${player.team === match?.teamA ? 'bg-blue-400' : 'bg-[#FFD700]'}`}></div>
                                     {player.team}
                                 </span>
                                 <span className="text-[9px] text-[#4ADE80] tracking-widest font-bold uppercase">{player.role}</span>
                             </div>
                        </div>
                        
        <div className="bg-[#0F1115] border border-white/5 p-1 rounded-xl flex items-center gap-2 shrink-0 shadow-inner max-w-[110px]">
                            <button 
                                onClick={() => updatePrediction(player.id!, -1)}
                                className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 active:scale-95 transition-all outline-none"
                            >
                                <Minus size={14} />
                            </button>
                            <div className="flex flex-col items-center justify-center w-6">
                                <span className="text-base font-black leading-none block">{(predictions[activeTab] || {})[player.id!] || 0}</span>
                            </div>
                            <button 
                                onClick={() => updatePrediction(player.id!, 1)}
                                className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-accent active:scale-95 transition-all outline-none border border-transparent hover:border-accent/30"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                   </div>
              </div>
          ))}

          {/* AI Banner */}
          <div className="p-1 mt-6">
              <div className="bg-gradient-to-br from-[#7698FB] to-[#2D3F6D] rounded-[2xl] p-6 relative overflow-hidden shadow-2xl h-[160px] flex gap-4 flex-col justify-center">
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                      <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="80" cy="20" r="40" fill="white" filter="blur(20px)" /></svg>
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                         <Sparkles size={24} className="text-white" />
                      </div>
                      <div>
                          <h4 className="text-sm font-black text-white shadow-xl tracking-wide">AI Smart Prediction</h4>
                          <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1.5 leading-snug">Let algorithm map Pitch report to recent form for {activeTab}</p>
                      </div>
                  </div>
                  <button className="relative z-10 w-full mt-2 text-[10px] font-black uppercase tracking-widest text-[#0F1115] bg-white backdrop-blur-md px-4 py-3 rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                      Apply Smart Picks
                  </button>
              </div>
          </div>
      </div>

      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto p-4 z-[60] bg-gradient-to-t from-[#0F1115] via-[#0F1115]/95 to-transparent pointer-events-none">
          <div className="bg-[#161B22]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 pointer-events-auto">
             <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Sparkles size={12}/> Potential Win</span>
                    <span className="text-2xl font-black text-[#FFD700] tracking-tighter">{lockCost * 10} <span className="text-sm font-bold text-white/50">C</span></span>
                </div>
                <div className="text-right flex flex-col justify-end h-full">
                    <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest mb-1">Entry Fee</span>
                    <span className="text-lg font-black text-[#FFD700] px-3 border border-accent/20 rounded-lg bg-accent/5">{lockCost} <span className="text-xs font-bold text-white/50">C</span></span>
                </div>
             </div>

             <button 
                onClick={handleLock}
                disabled={saving || totalPicks === 0}
                className="w-full bg-[#7698FB] hover:bg-[#7698FB]/90 border border-[#7698FB] text-[#0F1115] font-black py-4 rounded-xl shadow-[0_5px_15px_rgba(118,152,251,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest disabled:opacity-50"
             >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} 
                {saving ? 'Processing...' : `Lock & Pay ${lockCost} Coins`}
             </button>
          </div>
      </div>
    </main>
  );
}

export default function PredictSelection() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PredictSelectionClient />
        </Suspense>
    );
}
