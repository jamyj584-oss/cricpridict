"use client";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, Info, Plus, Check, Loader2, Trophy } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Player, PlayerRole, Match } from "@/types";
import { useTeamStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateTeamClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");

  const {
    availablePlayers,
    selectedPlayers,
    creditsLeft,
    setAvailablePlayers,
    addPlayer,
    removePlayer,
    resetTeam
  } = useTeamStore();

  const [activeRole, setActiveRole] = useState<PlayerRole>("WK");
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!db || !matchId) return;

    // Fetch Match Details for Header
    const fetchMatch = async () => {
      const mDoc = await getDoc(doc(db, "matches", matchId));
      if (mDoc.exists()) setMatch({ id: mDoc.id, ...mDoc.data() } as Match);
    };
    fetchMatch();

    // Fetch Players for this match (Mocking filter by team for now, should be matchId in production)
    const q = query(collection(db, "players"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Player[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Player));
      setAvailablePlayers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [matchId]);

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(p => p.role === activeRole);
  }, [availablePlayers, activeRole]);

  const isComplete = selectedPlayers.length === 11;

  // Validation Check for Proceed
  const canProceed = useMemo(() => {
    if (!isComplete) return false;
    // Check role limits
    for (const role of ["WK", "BAT", "AR", "BOWL"] as PlayerRole[]) {
      const count = selectedPlayers.filter(p => p.role === role).length;
      if (count < ROLE_LIMITS[role].min || count > ROLE_LIMITS[role].max) return false;
    }
    return true;
  }, [selectedPlayers, isComplete]);

  if (loading) return <div className="min-h-screen bg-[#0F1115] flex items-center justify-center text-accent uppercase tracking-widest font-bold">Drafting Roster...</div>;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col">
      {/* Top Selection Status Header */}
      <header className="bg-[#161B22]/80 backdrop-blur-md p-4 border-b border-white/5 sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="text-white hover:text-accent transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-bold uppercase tracking-widest text-textMuted">Create Team</h1>
            <p className="text-[10px] text-accent font-bold mt-0.5 uppercase tracking-[0.2em]">
              {match ? `${match.teamA} vs ${match.teamB}` : "Loading Match..."}
            </p>
          </div>
          <Info size={20} className="text-textMuted" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
              <span>Selection <strong className="text-white">{selectedPlayers.length} / 11</strong></span>
              <span>Credits <strong className={creditsLeft < 0 ? 'text-danger' : 'text-accent'}>{creditsLeft.toFixed(1)}</strong></span>
            </div>
            <div className="flex gap-1 h-2">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < selectedPlayers.length ? 'bg-accent shadow-[0_0_8px_#FFD700]' : 'bg-white/5'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Role Filters (Tabs) */}
      <div className="flex bg-[#161B22]/50 sticky top-[116px] z-40 backdrop-blur-md border-b border-white/5">
        {(["WK", "BAT", "AR", "BOWL"] as PlayerRole[]).map(role => {
          const count = selectedPlayers.filter(p => p.role === role).length;
          const isInvalid = count < ROLE_LIMITS[role].min || count > ROLE_LIMITS[role].max;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-widest relative transition-all ${activeRole === role ? 'text-accent bg-accent/5' : 'text-textMuted hover:text-white'}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {role}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isInvalid && count > 0 ? 'bg-danger/20 text-danger' : 'bg-white/10 text-white'}`}>{count}</span>
              </span>
              {activeRole === role && <motion.div layoutId="role-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </button>
          );
        })}
      </div>

      {/* Roster List */}
      <div className="flex-1 p-4 space-y-3 pb-40">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest">Pick {ROLE_LIMITS[activeRole].min}-{ROLE_LIMITS[activeRole].max} {activeRole}s</p>
          {match?.status === 'Live' && (
            <div className="bg-danger/10 text-danger text-[8px] font-bold uppercase px-2 py-1 rounded-full animate-pulse">Match Live - Read Only</div>
          )}
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {filteredPlayers.map((player) => {
            const isSelected = selectedPlayers.some(p => p.id === player.id);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key={player.id}
                onClick={() => {
                  if (match?.status === 'Live') return;
                  isSelected ? removePlayer(player.id) : addPlayer(player);
                }}
                className={`bg-[#161B22] border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${isSelected ? 'border-accent ring-1 ring-accent/20 bg-accent/5 shadow-lg shadow-accent/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
                    {player.team.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-white/90">{player.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-textMuted font-bold uppercase tracking-widest">{player.team}</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[9px] text-accent font-bold uppercase tracking-widest">{player.basePoints} Pts</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-xs font-bold text-white/80">{player.credits} Cr</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-accent text-primary rotate-[360deg]' : 'bg-white/5 border border-white/10 text-textMuted hover:border-white/40'}`}>
                    {isSelected ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/90 to-transparent z-50">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: isComplete ? 0 : 20, opacity: isComplete ? 1 : 0.5 }}
          className="flex flex-col gap-4"
        >
          <button
            onClick={() => {
              if (!canProceed) return;
              router.push(`/match/${matchId}/captain`);
            }}
            disabled={!canProceed || match?.status === 'Live'}
            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-2xl transition-all flex items-center justify-center gap-3 ${canProceed && match?.status !== 'Live'
              ? 'bg-accent text-primary shadow-accent/20 active:scale-[0.98]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
          >
            {match?.status === 'Live' ? "Locked" : "Next: Choose C & VC"}
            <Trophy size={18} />
          </button>
        </motion.div>
      </div>

      {/* Mini Progress Overlay */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F1115]/90 backdrop-blur-xl border-t border-white/5 py-3 px-6 flex justify-between items-center z-40 shadow-2xl safe-area-bottom">
        <div className="flex -space-x-1.5">
          {selectedPlayers.map(p => (
            <div key={p.id} className="w-7 h-7 rounded-full bg-accent border border-[#0F1115] flex items-center justify-center text-[7px] font-black text-primary uppercase shadow-md">
              {p.name.split(" ").pop()?.substring(0, 3)}
            </div>
          ))}
          {Array.from({ length: 11 - selectedPlayers.length }).map((_, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 border-dashed" />
          ))}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-textMuted">
          {selectedPlayers.length} / 11 <span className="text-white/20">|</span> {creditsLeft.toFixed(1)} Cr
        </p>
      </div>
    </main>
  );
}

const ROLE_LIMITS: Record<PlayerRole, { min: number; max: number }> = {
  WK: { min: 1, max: 4 },
  BAT: { min: 3, max: 6 },
  AR: { min: 1, max: 4 },
  BOWL: { min: 3, max: 6 }
};
