"use client";
import { X } from "lucide-react";
import { Player } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface TeamPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  captainId: string | null;
  viceCaptainId: string | null;
}

export default function TeamPreviewModal({ isOpen, onClose, players, captainId, viceCaptainId }: TeamPreviewModalProps) {
  if (!isOpen) return null;

  const wks = players.filter(p => p.role === "WK");
  const bats = players.filter(p => p.role === "BAT");
  const ars = players.filter(p => p.role === "AR");
  const bowls = players.filter(p => p.role === "BOWL");

  const Row = ({ title, items }: { title: string, items: Player[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="w-full mb-6">
        <h3 className="text-[10px] font-black uppercase text-center text-white/50 mb-3 tracking-widest">{title}</h3>
        <div className="flex justify-center items-end gap-2 md:gap-4 flex-wrap">
          {items.map(p => {
            const isCaptain = captainId === p.id;
            const isViceCaptain = viceCaptainId === p.id;
            
            return (
              <div key={p.id} className="flex flex-col items-center justify-center relative w-14 md:w-16">
                {(isCaptain || isViceCaptain) && (
                  <div className="absolute -top-3 -right-2 w-5 h-5 rounded-full bg-accent text-[#0F1115] border-2 border-[#161B22] flex items-center justify-center z-10 font-black text-[9px] shadow-lg">
                    {isCaptain ? 'C' : 'VC'}
                  </div>
                )}
                
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xl border-2 overflow-hidden bg-[#161B22] relative ${isCaptain || isViceCaptain ? 'border-accent text-accent' : 'border-white/20 text-white'}`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      p.name.split(" ").slice(-1)[0].substring(0, 3)
                    )}
                </div>
                <div className="mt-1.5 px-2 py-0.5 bg-[#0F1115]/90 rounded text-[8px] font-bold text-center text-white truncate max-w-full backdrop-blur-sm border border-white/10">
                  {p.name.split(" ").pop()}
                </div>
                <div className="text-[8px] text-white/60 font-bold mt-0.5">{p.credits} Cr</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1115]/90 backdrop-blur-sm p-4"
      >
        <motion.div 
           initial={{ scale: 0.95, y: 20 }}
           animate={{ scale: 1, y: 0 }}
           exit={{ scale: 0.95, y: 20 }}
           className="w-full max-w-md bg-[#161B22] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#161B22] shrink-0 sticky top-0 z-10">
            <div>
               <h2 className="text-sm font-black text-white uppercase tracking-widest">Team Preview</h2>
               <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">{players.length}/11 Players Selected</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 text-white/50 flex items-center justify-center hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Ground View */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative p-4 flex flex-col items-center">
            {/* Standard Green Grass Pattern using CSS radial gradients */}
            <div className="absolute inset-x-2 inset-y-2 rounded-2xl opacity-60 pointer-events-none overflow-hidden" style={{ background: '#2B5e31' }}>
                <div className="absolute inset-0 pattern-dots border-[1px] border-white/10 pointer-events-none rounded-2xl" />
                <div className="absolute top-1/2 left-0 right-0 border-t border-white/10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/10 w-16 h-16 rounded-full"></div>
            </div>
            
            <div className="relative w-full py-6 flex flex-col justify-around min-h-max flex-1">
                <Row title="Wicket Keeper" items={wks} />
                <Row title="Batter" items={bats} />
                <Row title="All Rounder" items={ars} />
                <Row title="Bowler" items={bowls} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
