"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShieldAlert } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, query, where, onSnapshot, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { Match, Player } from "@/types";
import { useUserStore } from "@/store/useStore";

const CATEGORIES = [
  { id: 'most6', label: 'Most 6s', max: 10 },
  { id: 'most4', label: 'Most 4s', max: 10 },
  { id: 'wickets', label: 'Wickets', max: 10 },
  { id: 'catches', label: 'Catches', max: 10 },
  { id: 'century', label: 'Century', max: 1 },
  { id: 'halfCentury', label: 'Fifty', max: 1 }
];

export default function PredictAndWin({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { matchId } = params;
  const { user } = useUserStore();

  const [matchData, setMatchData] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCatId, setActiveCatId] = useState(CATEGORIES[0].id);
  
  // Local state for predictions: Record<categoryId, Record<playerId, number>>
  const [predictions, setPredictions] = useState<Record<string, Record<string, number>>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Watch match status
    const fetchMatch = onSnapshot(doc(db, "matches", matchId), async (docSnap) => {
      if (docSnap.exists()) {
         const match = { id: docSnap.id, ...docSnap.data() } as Match;
         setMatchData(match);
         
         // Fetch precisely 8 players (4 from each team) as requested
         if (players.length === 0) {
            const teamAQuery = query(collection(db, "players"), where("team", "==", match.teamA));
            const teamBQuery = query(collection(db, "players"), where("team", "==", match.teamB));
            
            const [snapA, snapB] = await Promise.all([getDocs(teamAQuery), getDocs(teamBQuery)]);
            
            const teamAPlayers = snapA.docs.map(d => ({id: d.id, ...d.data()} as Player)).sort((a,b) => b.basePoints - a.basePoints).slice(0,4);
            const teamBPlayers = snapB.docs.map(d => ({id: d.id, ...d.data()} as Player)).sort((a,b) => b.basePoints - a.basePoints).slice(0,4);
            
            setPlayers([...teamAPlayers, ...teamBPlayers]);
         }
      }
      setLoading(false);
    });

    return () => fetchMatch();
  }, [matchId, players.length]);

  const handleAdjust = (playerId: string, delta: number) => {
    if (matchData?.status === "Live" || matchData?.status === "Completed") return; // Locked

    const activeCat = CATEGORIES.find(c => c.id === activeCatId)!;
    
    setPredictions((prev) => {
       const catState = prev[activeCatId] || {};
       const currentVal = catState[playerId] || 0;
       const newVal = currentVal + delta;
       
       if (newVal < 0 || newVal > activeCat.max) return prev; // Boundaries Check
       
       return {
         ...prev,
         [activeCatId]: {
           ...catState,
           [playerId]: newVal
         }
       };
    });
  };

  const savePredictions = async () => {
    if (matchData?.status === "Live" || matchData?.status === "Completed") {
       alert("Match is already live. Predictions are locked!");
       return;
    }

    const finalUserId = user?.uid || "DEV_USER_123";
    setIsSaving(true);

    try {
      // Loop over categories and save independent documents referencing the match and user
      for (const [catId, playerMap] of Object.entries(predictions)) {
         // Create deterministic ID so it overwrites existing predictions safely
         const documentId = `${finalUserId}_${matchId}_${catId}`;
         await setDoc(doc(db, "predictions", documentId), {
            userId: finalUserId,
            matchId: matchId,
            category: catId,
            playerPredictions: playerMap,
            updatedAt: serverTimestamp()
         });
      }
      alert("Predictions securely locked in! 🏆");
    } catch (err) {
      console.error(err);
      alert("Failed to save. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Lock logic
  const isLocked = matchData?.status === "Live" || matchData?.status === "Completed";

  return (
    <main className="pb-24 min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-header p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-xl">&larr;</button>
          <h1 className="font-bold text-lg">Predict & Win</h1>
        </div>
        
        {matchData && (
          <div className="border border-white/10 rounded-xl p-3 flex justify-between items-center mt-4 bg-primary/30">
            <div className="text-center">
              <h2 className="text-xl font-bold">{matchData.teamA.slice(0,3).toUpperCase()}</h2>
            </div>
            <div className="text-center">
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ${isLocked ? 'bg-danger text-white' : 'bg-white/10 text-white/50'}`}>
                {isLocked ? "Match Live: Locked" : matchData.status}
              </span>
              <p className="text-xs font-bold text-textMuted mt-1">VS</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">{matchData.teamB.slice(0,3).toUpperCase()}</h2>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
         {/* Sliding Tabs */}
         <div className="flex px-4 gap-6 mt-4 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar relative z-40">
           {CATEGORIES.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveCatId(tab.id)}
                className={`${activeCatId === tab.id ? 'text-accent border-b-2 border-accent font-bold' : 'text-textMuted font-medium'} pb-2 -mb-[9px] min-w-max transition-colors text-sm`}
              >
                {tab.label}
              </button>
           ))}
         </div>

         {/* Warning if locker */}
         {isLocked && (
            <div className="bg-danger/20 border-l-4 border-danger p-3 m-4 flex items-center gap-3 text-sm">
               <ShieldAlert className="text-danger flex-shrink-0" size={20} />
               <p>Predictions are <strong>locked</strong>. Match has officially started.</p>
            </div>
         )}

         {/* Predictors GUI */}
         <div className="p-4 flex flex-col gap-3">
           {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-accent" /></div> : 
             players.map(p => {
               const currentVal = predictions[activeCatId]?.[p.id] || 0;
               return (
                 <div key={p.id} className="glass-card flex items-center border border-white/5 p-3 pr-4 group transition-colors hover:bg-white/5">
                   <div className="relative">
                     <div className="w-12 h-12 rounded-full border border-white/20 bg-secondary flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden">
                       <span className="opacity-50">{p.team.slice(0,3).toUpperCase()}</span>
                     </div>
                     <div className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-primary"></div>
                   </div>
                   
                   <div className="flex-1 ml-4">
                     <p className="font-bold text-sm">{p.name}</p>
                     <p className="text-[10px] text-success uppercase mt-0.5 tracking-wider font-bold">Form: High</p>
                   </div>

                   {/* Counter Box */}
                   <div className="flex items-center bg-primary/70 border border-white/10 rounded-lg overflow-hidden">
                     <button 
                       disabled={isLocked || currentVal === 0}
                       onClick={() => handleAdjust(p.id, -1)}
                       className="p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                     >
                       <Minus size={16} />
                     </button>
                     <div className="w-12 text-center flex flex-col items-center justify-center pt-1 pb-0.5">
                       <span className="font-bold leading-none text-lg">{currentVal}</span>
                       <span className="text-[8px] text-textMuted uppercase font-bold tracking-widest">{CATEGORIES.find(c=>c.id===activeCatId)?.label}</span>
                     </div>
                     <button 
                       disabled={isLocked || currentVal === CATEGORIES.find(c=>c.id===activeCatId)?.max}
                       onClick={() => handleAdjust(p.id, 1)}
                       className="p-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                     >
                       <Plus size={16} />
                     </button>
                   </div>
                 </div>
               )
             })
           }

           {/* AI Banner */}
           <div className="mt-4 rounded-xl relative overflow-hidden glass-card p-6 border border-accent/20">
             <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"></div>
             <div className="relative z-10 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-accent mb-1 flex items-center gap-2">AI Smart Prediction</h3>
                   <p className="text-xs text-textMuted">Based on pitch report & recent form</p>
                </div>
                <button className="text-accent text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">Apply</button>
             </div>
           </div>
         </div>
      </div>

      {/* Floating Saver */}
      <div className="fixed bottom-0 left-0 right-0 glass-header p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
         <div className="flex items-center gap-4 max-w-md mx-auto">
           <div className="flex flex-col flex-1 pl-2 text-success">
              <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted">Potential Win</span>
              <span className="font-bold text-xl">₹5,000</span>
           </div>
           <button 
             disabled={isSaving || isLocked}
             onClick={savePredictions}
             className="flex-[2] bg-accent text-primary font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:bg-white/10 disabled:text-textMuted transition-colors flex justify-center items-center gap-2"
           >
             {isLocked ? "Match Live (Locked)" : isSaving ? <Loader2 className="animate-spin" size={20} /> : "Lock Predictions"}
           </button>
         </div>
      </div>
    </main>
  );
}
