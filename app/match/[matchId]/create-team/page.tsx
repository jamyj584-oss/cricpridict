"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Plus, Minus, Wand2, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { Player, PlayerRole, Match } from "@/types";
import { useTeamStore } from "@/store/useStore";

export default function CreateTeam({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { matchId } = params;
  
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlayerRole>("WK");

  const { availablePlayers, selectedPlayers, creditsLeft, setAvailablePlayers, addPlayer, removePlayer, autoCreateTeam, resetTeam } = useTeamStore();

  useEffect(() => {
    const fetchMatchAndPlayers = async () => {
      // Fetch match
      const matchDoc = await getDoc(doc(db, "matches", matchId));
      if (!matchDoc.exists()) return;
      const match = { id: matchDoc.id, ...matchDoc.data() } as Match;
      setMatchData(match);

      // Fetch Players (Optimisation: Only fetch players belonging to Team A or Team B)
      const playersQuery = query(
        collection(db, "players"),
        where("team", "in", [match.teamA, match.teamB])
      );
      const playersSnapshot = await getDocs(playersQuery);
      const playersList: Player[] = [];
      playersSnapshot.forEach(doc => playersList.push({ id: doc.id, ...doc.data() } as Player));
      
      setAvailablePlayers(playersList);
      setLoading(false);
    };

    fetchMatchAndPlayers();
  }, [matchId, setAvailablePlayers]);

  const handleTogglePlayer = (player: Player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    if (isSelected) {
      removePlayer(player.id);
    } else {
      const success = addPlayer(player);
      if (!success) alert("Cannot add player: Check 100 Credits, 11 Max Players, or Max 7 Per Team limit.");
    }
  };

  if (loading || !matchData) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  const teamACount = selectedPlayers.filter(p => p.team === matchData.teamA).length;
  const teamBCount = selectedPlayers.filter(p => p.team === matchData.teamB).length;

  const filteredPlayers = availablePlayers.filter((p) => p.role === activeTab);

  return (
    <main className="pb-24 max-h-screen overflow-hidden flex flex-col">
      {/* Top Fixed Header */}
      <div className="glass-header p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => router.back()} className="text-xl">&larr;</button>
          <div className="text-center">
            <p className="text-xs text-textMuted">{matchData.league}</p>
            <h1 className="font-bold text-sm">{matchData.teamA} vs {matchData.teamB}</h1>
          </div>
          <button onClick={() => resetTeam()} className="text-xs text-danger font-medium border border-white/10 px-2 py-1 rounded">Reset</button>
        </div>

        {/* Live Team Status Header */}
        <div className="glass-card p-3 flex justify-between items-center text-sm border border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[10px] text-textMuted uppercase font-bold">Players</span>
              <span className="font-bold text-lg">{selectedPlayers.length}/11</span>
           </div>
           
           <div className="flex gap-4 items-center">
             <div className="text-center">
                <span className="text-[10px] text-textMuted font-bold block">{matchData.teamA}</span>
                <span className="font-bold text-sm bg-white/10 px-3 py-1 rounded-full">{teamACount}</span>
             </div>
             <span className="text-xs text-textMuted">vs</span>
             <div className="text-center">
                <span className="text-[10px] text-textMuted font-bold block">{matchData.teamB}</span>
                <span className="font-bold text-sm bg-white/10 px-3 py-1 rounded-full">{teamBCount}</span>
             </div>
           </div>

           <div className="flex flex-col items-center">
              <span className="text-[10px] text-textMuted uppercase font-bold">Credits Left</span>
              <span className={`font-bold text-lg ${creditsLeft < 0 ? 'text-danger' : 'text-accent'}`}>{creditsLeft}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full no-scrollbar">
        {/* AI Auto Create Button */}
        <div className="px-4 mt-4">
          <button 
            onClick={autoCreateTeam}
            className="w-full bg-gradient-to-r from-accent/20 to-primary border border-accent/40 text-accent font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors"
          >
            <Wand2 size={16} /> Auto Create Team
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex px-4 gap-4 mt-6 border-b border-white/10 pb-2">
          {['WK', 'BAT', 'AR', 'BOWL'].map((tab) => (
             <button 
             key={tab}
             onClick={() => setActiveTab(tab as PlayerRole)}
             className={`${activeTab === tab ? 'text-accent border-b-2 border-accent font-bold' : 'text-textMuted font-medium'} flex-1 pb-2 -mb-[9px] min-w-max transition-colors text-sm`}
           >
             {tab} ({selectedPlayers.filter(p => p.role === tab).length})
           </button>
          ))}
        </div>

        {/* Players List Grid */}
        <div className="flex flex-col">
          <div className="flex text-[10px] uppercase text-textMuted font-bold px-4 py-2 border-b border-white/5 bg-primary/50 sticky top-0 z-40 relative">
             <div className="flex-1">Select Player</div>
             <div className="w-16 text-center">Points</div>
             <div className="w-16 text-center">Credits</div>
             <div className="w-10"></div>
          </div>

          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayers.some(p => p.id === player.id);
            return (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTogglePlayer(player)}
                key={player.id} 
                className={`flex items-center px-4 py-3 border-b border-white/5 cursor-pointer transition-colors ${isSelected ? 'bg-success/10' : 'hover:bg-white/5'}`}
              >
                <div className="relative">
                   <div className="w-12 h-12 rounded-full border border-white/20 bg-secondary flex items-center justify-center font-bold text-sm">
                      {player.name.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1 -left-1 text-[8px] bg-white text-black font-bold px-1.5 py-0.5 rounded-sm">
                      {player.team}
                   </div>
                </div>
                
                <div className="flex-1 ml-3">
                  <p className="font-bold text-sm tracking-wide">{player.name}</p>
                  <p className="text-[10px] text-textMuted mt-0.5">Sel by 54%</p>
                </div>

                <div className="w-16 text-center font-semibold text-sm">
                   {player.basePoints}
                </div>

                <div className="w-16 text-center font-bold text-sm text-accent">
                   {player.credits}
                </div>

                <div className="w-10 flex justify-end">
                   <div className={`w-6 h-6 rounded-md flex items-center justify-center outline outline-1 outline-offset-2 ${isSelected ? 'bg-success outline-success text-primary' : 'outline-white/20 text-success'}`}>
                      {isSelected ? <Minus size={14} strokeWidth={4} /> : <Plus size={14} strokeWidth={4} />}
                   </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Floating Continue Action */}
      <div className="fixed bottom-0 left-0 right-0 glass-header p-4">
         <button 
           onClick={() => router.push(`/match/${matchId}/captain`)}
           disabled={selectedPlayers.length !== 11}
           className="w-full bg-accent text-primary font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:bg-white/20 disabled:text-textMuted transition-colors text-lg"
         >
           {selectedPlayers.length === 11 ? "Next: Choose Captains" : `Select ${11 - selectedPlayers.length} More Players`}
         </button>
      </div>
    </main>
  );
}
