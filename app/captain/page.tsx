"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, HelpCircle, Trophy, Save, Layout } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Player } from "@/types";
import { motion } from "framer-motion";

export default function CaptainSelection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("current_team");
    if (saved) {
      setSelectedPlayers(JSON.parse(saved));
    } else {
      router.push("/");
    }
  }, []);

  const handleSelectCaptain = (id: string) => {
    if (viceCaptainId === id) setViceCaptainId(null);
    setCaptainId(id);
  };

  const handleSelectViceCaptain = (id: string) => {
    if (captainId === id) setCaptainId(null);
    setViceCaptainId(id);
  };

  const handleSaveTeam = () => {
    if (!captainId || !viceCaptainId) return alert("Select C and VC first!");
    // Logic to save in Firebase
    console.log("Saving Team:", { players: selectedPlayers, captain: captainId, viceCaptain: viceCaptainId });
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-24">
      {/* 05.png Header */}
      <header className="bg-[#161B22] p-4 border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="text-white"><ChevronLeft size={24}/></button>
          <div className="text-center">
            <h1 className="text-sm font-bold uppercase tracking-widest text-[#FFFFFF]">Choose C & VC</h1>
            <p className="text-[10px] text-accent font-bold mt-0.5 uppercase tracking-[0.2em]">IND vs AUS • 14h 20m left</p>
          </div>
          <HelpCircle size={20} className="text-textMuted" />
        </div>

        {/* Info Banner from 05.png */}
        <div className="bg-[#0F1115] border border-white/5 p-3 rounded-xl flex items-center gap-3">
             <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-accent rounded-full"></div>
             </div>
             <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                C gets <strong className="text-white">2x points</strong>, VC gets <strong className="text-white">1.5x points</strong>.
             </p>
        </div>
      </header>

      {/* Players List (Selected 11) */}
      <div className="flex-1 p-4 space-y-3">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Selected 11 Players</span>
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Sorted by Points</span>
          </div>

          {selectedPlayers.map((player) => (
              <div key={player.id} className="bg-[#161B22] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                   <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs relative overflow-hidden">
                             {player.team.charAt(0)}
                             <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent"></div>
                        </div>
                        <div>
                             <h4 className="text-sm font-bold tracking-tight">{player.name}</h4>
                             <p className="text-[10px] text-textMuted font-bold uppercase mt-0.5">{player.role} | {player.basePoints} Pts</p>
                        </div>
                   </div>

                   <div className="flex gap-4">
                        <button 
                            onClick={() => handleSelectCaptain(player.id)}
                            className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center transition-all ${captainId === player.id ? 'bg-[#7698FB] border-[#7698FB] text-[#0F1115]' : 'bg-transparent border-white/10 text-white/40'}`}
                        >
                            <span className="text-xs font-black leading-none">C</span>
                            <span className="text-[7px] font-bold leading-none mt-0.5">2X</span>
                        </button>
                        <button 
                            onClick={() => handleSelectViceCaptain(player.id)}
                            className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center transition-all ${viceCaptainId === player.id ? 'bg-[#7698FB] border-[#7698FB] text-[#0F1115]' : 'bg-transparent border-white/10 text-white/40'}`}
                        >
                            <span className="text-xs font-black leading-none">VC</span>
                            <span className="text-[7px] font-bold leading-none mt-0.5">1.5X</span>
                        </button>
                   </div>
              </div>
          ))}
      </div>

      {/* 05.png Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 grid grid-cols-2 gap-4 z-50">
          <button 
             className="border border-white/20 bg-transparent text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/5 active:scale-95 transition-all"
          >
              <Layout size={16} className="text-accent" /> Team Preview
          </button>
          <button 
            onClick={handleSaveTeam}
            className="bg-gradient-to-r from-[#7698FB] to-[#4B73E1] text-[#0F1115] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all"
          >
              <Save size={16} /> Save Team
          </button>
      </div>
    </main>
  );
}
