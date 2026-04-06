"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTeamStore, useUserStore } from "@/store/useStore";
import { Match } from "@/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronLeft, ShieldCheck, Award } from "lucide-react";

export default function CaptainSelection({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { matchId } = params;
  
  const { user } = useUserStore();
  const { selectedPlayers, captainId, viceCaptainId, setCaptain, setViceCaptain, creditsLeft, resetTeam } = useTeamStore();
  
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!db || !matchId) return;
    const unsubscribe = onSnapshot(doc(db, "matches", matchId), (doc) => {
      if (doc.exists()) setMatch({ id: doc.id, ...doc.data() } as Match);
    });
    return () => unsubscribe();
  }, [matchId]);

  if (selectedPlayers.length !== 11) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-6">
            <Trophy size={40} className="text-danger opacity-50" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Team Selection Lost</h2>
        <p className="text-textMuted text-sm mb-8 leading-relaxed">It seems your draft was interrupted. Please go back and select 11 players again.</p>
        <button 
            onClick={() => router.back()} 
            className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
        >
            Go Back
        </button>
      </div>
    );
  }

  const handleSaveTeam = async () => {
    if (!captainId || !viceCaptainId) return;
    if (match?.status === 'Live') return alert("Match started! Entries locked.");
    if (!user) return alert("Please login to save your team.");

    setLoading(true);
    try {
      await addDoc(collection(db, "teams"), {
        userId: user.uid,
        matchId,
        players: selectedPlayers.map(p => p.id),
        captainId,
        viceCaptainId,
        totalCredits: 100 - creditsLeft,
        createdAt: serverTimestamp()
      });
      
      // We don't reset yet, because user might want to join a contest immediately after.
      // Or we can reset and navigate to the contest lobby.
      alert("Team Created Successfully!");
      router.push(`/contest/${matchId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save team securely.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-32">
      <header className="bg-[#161B22]/80 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="text-white hover:text-accent transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-base tracking-tight uppercase">Choose C & VC</h1>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">
                {match ? `${match.teamA} vs ${match.teamB}` : "Loading..."}
            </p>
          </div>
        </div>
        <div className="bg-accent/5 border border-accent/20 px-4 py-2.5 rounded-xl flex items-center gap-3">
           <ShieldCheck size={16} className="text-accent" />
           <p className="text-[10px] font-bold text-accent/80 uppercase tracking-wider leading-relaxed">
               C gets 2x points, VC gets 1.5x points. <br/>
               These choices are critical for your rank!
           </p>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3 mt-2">
        <h2 className="text-[10px] font-bold text-textMuted uppercase tracking-[0.2em] px-2 mb-4">Select Captain & Vice-Captain</h2>

        <div className="space-y-3">
          {[...selectedPlayers].sort((a,b) => b.basePoints - a.basePoints).map((player) => {
            const isC = captainId === player.id;
            const isVC = viceCaptainId === player.id;
            
            return (
              <motion.div 
                layout
                key={player.id} 
                className={`bg-[#161B22] p-4 flex items-center border rounded-2xl transition-all duration-300 ${isC || isVC ? 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/5' : 'border-white/5'}`}
              >
                <div className="relative">
                   <div className="w-14 h-14 rounded-full border-2 border-white/10 bg-[#0F1115] flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                      {player.name.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-white text-[#0F1115] font-black px-2 py-0.5 rounded shadow-sm uppercase">
                      {player.team.substring(0, 3)}
                   </div>
                </div>
                
                <div className="flex-1 ml-5">
                  <p className="font-bold text-sm text-white/90">{player.name}</p>
                  <div className="flex items-center gap-2 mt-1 opacity-60">
                    <span className="text-[9px] font-bold uppercase tracking-wider">{player.role}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20"></div>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{player.basePoints} Pts</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                       if (match?.status === 'Live') return;
                       if (isVC) setViceCaptain(""); 
                       setCaptain(isC ? "" : player.id);
                    }}
                    className={`w-11 h-11 rounded-full flex flex-col items-center justify-center border-2 font-black transition-all ${isC ? 'bg-white text-[#0F1115] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110' : 'bg-transparent text-textMuted border-white/5 hover:border-white/20'}`}
                  >
                     <span className="text-xs">C</span>
                     {isC && <span className="text-[7px] -mt-0.5">2X</span>}
                  </button>
                  <button 
                    onClick={() => {
                       if (match?.status === 'Live') return;
                       if (isC) setCaptain("");
                       setViceCaptain(isVC ? "" : player.id);
                    }}
                    className={`w-11 h-11 rounded-full flex flex-col items-center justify-center border-2 font-black transition-all ${isVC ? 'bg-accent text-[#0F1115] border-accent shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-110' : 'bg-transparent text-textMuted border-white/5 hover:border-white/20'}`}
                  >
                     <span className="text-xs">VC</span>
                     {isVC && <span className="text-[7px] -mt-0.5">1.5X</span>}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Floating Save Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F1115]/90 backdrop-blur-xl border-t border-white/5 p-6 flex gap-4 z-50">
         <button 
            className="flex-1 bg-white/5 border border-white/10 text-[10px] text-white font-bold py-4 rounded-2xl uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]"
         >
           Preview Team
         </button>
         <button 
           onClick={handleSaveTeam}
           disabled={!captainId || !viceCaptainId || loading || match?.status === 'Live'}
           className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
               captainId && viceCaptainId && !loading && match?.status !== 'Live'
               ? 'bg-accent text-[#0F1115] shadow-2xl shadow-accent/20 active:scale-[0.98]'
               : 'bg-white/5 text-white/20 cursor-not-allowed'
           }`}
         >
           {loading ? "Syncing..." : match?.status === 'Live' ? "Locked" : "Save & Proceed"}
           <Award size={18} />
         </button>
      </div>
    </main>
  );
}
