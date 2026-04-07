"use client";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, Info, Plus, Check, Trophy, ShieldCheck, Gamepad2, ArrowRight, Zap, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, onSnapshot, query, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Player, PlayerRole, Match } from "@/types";
import { useTeamStore, useUserStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import TeamPreviewModal from "../components/TeamPreviewModal";

const ROLE_LIMITS: Record<PlayerRole, { min: number; max: number }> = {
  WK: { min: 1, max: 4 },
  BAT: { min: 3, max: 6 },
  AR: { min: 1, max: 4 },
  BOWL: { min: 3, max: 6 }
};

export default function CreateTeamClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  
  const { user } = useUserStore();
  const {
    availablePlayers,
    selectedPlayers,
    creditsLeft,
    setAvailablePlayers,
    addPlayer,
    removePlayer,
    resetTeam,
    captainId, setCaptain,
    viceCaptainId, setViceCaptain
  } = useTeamStore();

  // 1 = Player Selection, 2 = Captain & VC Selection
  const [step, setStep] = useState<1 | 2>(1);
  const [activeRole, setActiveRole] = useState<PlayerRole>("WK");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     setMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !matchId) return;

    const fetchMatch = async () => {
      const mDoc = await getDoc(doc(db, "matches", matchId));
      if (mDoc.exists()) setMatch({ id: mDoc.id, ...mDoc.data() } as Match);
    };
    fetchMatch();

    const q = query(collection(db, "players"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Player[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Player));
      // For production, filter by match team here
      setAvailablePlayers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [matchId]);

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(p => p.role === activeRole);
  }, [availablePlayers, activeRole]);

  const isComplete = selectedPlayers.length === 11;

  // Validation Check for proceeding to Step 2
  const canProceedToCaptain = useMemo(() => {
    if (!isComplete) return false;
    for (const role of ["WK", "BAT", "AR", "BOWL"] as PlayerRole[]) {
      const count = selectedPlayers.filter(p => p.role === role).length;
      if (count < ROLE_LIMITS[role].min || count > ROLE_LIMITS[role].max) return false;
    }
    return true;
  }, [selectedPlayers, isComplete]);

  // Handle Player Selection with strict Role and Credit constraints
  const handlePlayerToggle = (player: Player) => {
      if (match?.status === 'Live') return;
      setErrorMsg("");

      const isSelected = selectedPlayers.some(p => p.id === player.id);
      if (isSelected) {
          removePlayer(player.id);
      } else {
          // Check limits before adding
          const currentRoleCount = selectedPlayers.filter(p => p.role === player.role).length;
          if (currentRoleCount >= ROLE_LIMITS[player.role].max) {
             return setErrorMsg(`Maximum allowed limit reached for ${player.role}`);
          }
          if (creditsLeft < player.credits) {
             return setErrorMsg("Insufficient credits. Free up budget to select this player.");
          }
          if (selectedPlayers.length >= 11) {
              return setErrorMsg("You can only select 11 players.");
          }
          addPlayer(player);
      }
  };

  const handleSaveTeam = async () => {
      if (!user) {
          setErrorMsg("Please login to create a team.");
          return;
      }
      if (selectedPlayers.length !== 11) {
          setErrorMsg("You must select exactly 11 players.");
          return;
      }
      if (!captainId || !viceCaptainId) {
          setErrorMsg("Check your C and VC selection. Must choose both.");
          return;
      }
      if (captainId === viceCaptainId) {
          setErrorMsg("Captain and Vice Captain cannot be the same.");
          return;
      }

      setSaving(true);
      setErrorMsg("");

      try {
          const payload = {
              userId: user.uid,
              matchId,
              players: selectedPlayers.map(p => p.id),
              captainId,
              viceCaptainId,
              totalCredits: 100 - creditsLeft,
              createdAt: serverTimestamp()
          };

          await addDoc(collection(db, "teams"), payload);
          // Success! Reset store and push to contest.
          resetTeam();
          router.replace(`/contest/${matchId}`);
      } catch (err: any) {
          console.error(err);
          setErrorMsg(err.message || "Failed to save team. Please try again.");
          setSaving(false);
      }
  };

  const handleGenerateAI = () => {
    if (aiGenerating || availablePlayers.length < 11 || match?.status === 'Live') return;
    setAiGenerating(true);
    setErrorMsg("");
    
    setTimeout(() => {
      resetTeam();
      
      let selected: Player[] = [];
      let totalCr = 0;
      let roleCounts = { WK: 0, BAT: 0, AR: 0, BOWL: 0 };
      
      const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
      
      // Pass 1: Meet minimums
      const minReq = { WK: 1, BAT: 3, AR: 1, BOWL: 3 };
      for (const role of Object.keys(minReq) as PlayerRole[]) {
         const pForRole = shuffled.filter(p => p.role === role);
         for (let i = 0; i < minReq[role]; i++) {
             if (pForRole[i] && totalCr + pForRole[i].credits <= 100) {
                 selected.push(pForRole[i]);
                 totalCr += pForRole[i].credits;
                 roleCounts[role]++;
             }
         }
      }
      
      // Pass 2: Fill rest
      for (const p of shuffled) {
         if (selected.length === 11) break;
         if (selected.find(s => s.id === p.id)) continue;
         
         if (roleCounts[p.role] < ROLE_LIMITS[p.role].max && totalCr + p.credits <= 100) {
             selected.push(p);
             totalCr += p.credits;
             roleCounts[p.role]++;
         }
      }
      
      if (selected.length === 11) {
          selected.forEach(addPlayer);
          setCaptain(selected[0].id);
          setViceCaptain(selected[1].id);
          setStep(2);
      } else {
          setErrorMsg("Could not generate a valid AI team with current constraints. Please try manually.");
      }
      
      setAiGenerating(false);
    }, 1500);
  };

  if (!mounted || loading) return <div className="min-h-screen bg-[#0F1115] flex items-center justify-center text-accent uppercase tracking-widest font-bold animate-pulse">Drafting Arena...</div>;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-36">
        {/* Dynamic Header */}
        <header className="bg-[#161B22]/80 backdrop-blur-md p-4 border-b border-white/5 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
               <button 
                  onClick={() => step === 2 ? setStep(1) : router.back()} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
               >
                 <ChevronLeft size={20} />
               </button>
               <div className="text-center">
                 <h1 className="text-xs font-black uppercase tracking-widest text-[#FFFFFF]">
                    {step === 1 ? "Create Team" : "Choose C & VC"}
                 </h1>
                 <p className="text-[10px] text-accent font-bold mt-0.5 uppercase tracking-[0.2em]">
                   {match ? `${match.teamA} vs ${match.teamB}` : "Loading Match..."}
                 </p>
               </div>
               <Info size={20} className="text-textMuted" />
            </div>

            {/* Error UI Banner */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-danger/20 border border-danger/50 text-danger text-[10px] font-bold p-3 rounded-lg mb-4 text-center uppercase tracking-widest"
                    >
                        {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between gap-4">
               <div className="flex-1">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                   <span>Selection <strong className="text-white bg-white/10 px-2 py-0.5 rounded ml-1">{selectedPlayers.length} / 11</strong></span>
                   <span>Credits Left <strong className={`ml-1 px-2 py-0.5 rounded ${creditsLeft < 0 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>{creditsLeft.toFixed(1)}</strong></span>
                 </div>
                 <div className="flex gap-1 h-1.5">
                   {Array.from({ length: 11 }).map((_, i) => (
                     <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i < selectedPlayers.length ? 'bg-accent shadow-[0_0_8px_#FFD700]' : 'bg-white/10'}`} />
                   ))}
                 </div>
               </div>
               
               {/* Auto-Fill Logic Button */}
               <button onClick={handleGenerateAI} disabled={aiGenerating || match?.status === 'Live'} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all">
                  {aiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  {aiGenerating ? "..." : "Auto-Fill"}
               </button>
            </div>
        </header>

        {/* --- STEP 1: PLAYER SELECTION --- */}
        {step === 1 && (
            <>
              {/* Role Filters */}
              <div className="flex bg-[#161B22]/50 sticky top-[116px] z-40 backdrop-blur-md border-b border-white/5">
                {(["WK", "BAT", "AR", "BOWL"] as PlayerRole[]).map(role => {
                  const count = selectedPlayers.filter(p => p.role === role).length;
                  const isInvalid = count < ROLE_LIMITS[role].min || count > ROLE_LIMITS[role].max;
                  return (
                    <button
                      key={role}
                      onClick={() => { setActiveRole(role); setErrorMsg(""); }}
                      className={`flex-1 flex flex-col py-3 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeRole === role ? 'text-accent bg-accent/5' : 'text-textMuted hover:text-white'}`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {role}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isInvalid && count > 0 ? 'bg-danger/20 text-danger' : 'bg-white/10 text-white'}`}>
                          {count}
                        </span>
                      </div>
                      <span className="text-[7px] text-white/30">{ROLE_LIMITS[role].min}-{ROLE_LIMITS[role].max} allowed</span>
                      {activeRole === role && <motion.div layoutId="role-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                  );
                })}
              </div>

              {/* Roster List */}
              <div className="flex-1 p-4 space-y-3">
                <div className="flex justify-between items-center mb-2 px-2">
                  <p className="text-[9px] text-textMuted font-bold uppercase tracking-widest border-b border-white/5 pb-1 w-full flex justify-between">
                      {activeRole}'s Available
                      {match?.status === 'Live' && <span className="bg-danger/10 text-danger text-[8px] font-bold uppercase px-2 py-0.5 rounded-full animate-pulse">Match Live - Read Only</span>}
                  </p>
                </div>
                
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredPlayers.map((player) => {
                    const isSelected = selectedPlayers.some(p => p.id === player.id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={player.id}
                        onClick={() => handlePlayerToggle(player)}
                        className={`bg-[#161B22] border rounded-[1.25rem] p-3 flex items-center justify-between cursor-pointer transition-all duration-200 ${isSelected ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : 'border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm overflow-hidden relative ${isSelected ? 'bg-accent/20 border-accent text-accent border' : 'bg-[#0F1115] border border-white/10 text-white/80'}`}>
                              {player.team.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold tracking-tight text-white/90">{player.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-textMuted font-bold uppercase tracking-widest bg-[#0F1115] px-1.5 py-0.5 rounded">{player.team}</span>
                              <div className="w-1 h-1 rounded-full bg-white/20"></div>
                              <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest">{player.basePoints} Pts</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-black ${creditsLeft < player.credits && !isSelected ? 'text-danger/70' : 'text-white/80'}`}>{player.credits} Cr</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-accent text-primary rotate-[360deg] shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'bg-[#0F1115] border border-white/10 text-textMuted hover:border-white/40'}`}>
                            {isSelected ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
        )}

        {/* --- STEP 2: CAPTAIN & VC SELECTION --- */}
        {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 p-4 space-y-3">
              <div className="bg-[#0F1115] border border-white/10 p-4 rounded-[1.5rem] flex items-center gap-4 shadow-xl mb-6">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                  <Gamepad2 size={16} className="text-accent" />
                </div>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-relaxed">
                  Choose wisely! <strong className="text-accent">Captain (C)</strong> gets 2X points and <strong className="text-accent">Vice Captain (VC)</strong> gets 1.5X points.
                </p>
              </div>

              <div className="flex justify-between items-center mb-2 px-2 border-b border-white/5 pb-2">
                <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Selected XI</span>
              </div>

              {selectedPlayers.map((player) => (
                <div key={player.id} className="bg-[#161B22] border border-white/5 rounded-[1.25rem] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs relative overflow-hidden">
                              <span className="text-white/50 relative z-10">{player.team.charAt(0)}</span>
                              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-white/5 to-transparent"></div>
                         </div>
                         <div>
                              <h4 className="text-sm font-bold text-white/90">{player.name}</h4>
                              <p className="text-[9px] text-textMuted font-bold uppercase mt-1">{player.role} | {player.basePoints} Pts</p>
                         </div>
                    </div>

                    <div className="flex gap-3">
                         <button 
                             onClick={() => { if (viceCaptainId === player.id) setViceCaptain(null as any); setCaptain(player.id); setErrorMsg(""); }}
                             className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center transition-all ${captainId === player.id ? 'bg-accent border-accent text-[#0F1115] scale-110 shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-[#0F1115] border-white/10 text-white/40'}`}
                         >
                             <span className="text-[10px] font-black leading-none">C</span>
                             <span className="text-[6px] font-bold leading-none mt-1 uppercase">2X</span>
                         </button>
                         <button 
                             onClick={() => { if (captainId === player.id) setCaptain(null as any); setViceCaptain(player.id); setErrorMsg(""); }}
                             className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center transition-all ${viceCaptainId === player.id ? 'bg-[#7698FB] border-[#7698FB] text-[#0F1115] scale-110 shadow-[0_0_15px_rgba(118,152,251,0.4)]' : 'bg-[#0F1115] border-white/10 text-white/40'}`}
                         >
                             <span className="text-[10px] font-black leading-none">VC</span>
                             <span className="text-[6px] font-bold leading-none mt-1 uppercase">1.5X</span>
                         </button>
                    </div>
                </div>
              ))}
            </motion.div>
        )}

        {/* Floating Bottom Navigator */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F1115] z-40 to-transparent">
             <div className="w-full bg-[#161B22]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4">
                 
                 {step === 1 && (
                     <button
                        onClick={() => {
                          if (!canProceedToCaptain) {
                              return setErrorMsg("Please complete your XI adhering to credit and role limits.");
                          }
                          setStep(2);
                        }}
                        disabled={!canProceedToCaptain || match?.status === 'Live'}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-between px-6 items-center transition-all ${canProceedToCaptain && match?.status !== 'Live' ? 'bg-accent text-[#0F1115] shadow-[0_5px_20px_rgba(255,215,0,0.3)] active:scale-95' : 'bg-white/5 text-white/30'}`}
                     >
                        NEXT
                        <ArrowRight size={16} />
                     </button>
                 )}

                 {step === 2 && (
                     <div className="grid grid-cols-2 gap-3">
                         <button 
                             onClick={() => setShowPreview(true)}
                             className="border-2 border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                         >
                             Preview
                         </button>
                         <button 
                             onClick={handleSaveTeam}
                             disabled={saving || !captainId || !viceCaptainId}
                             className={`font-black uppercase text-[10px] tracking-widest rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${(!saving && captainId && viceCaptainId) ? 'bg-success text-white shadow-[0_5px_20px_rgba(34,197,94,0.3)] active:scale-95 border border-success/50' : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'}`}
                         >
                             {saving ? 'Processing...' : 'Save & Join'}
                         </button>
                     </div>
                 )}
             </div>
        </div>

        {/* Team Preview Modal Overlay */}
        <TeamPreviewModal 
           isOpen={showPreview} 
           onClose={() => setShowPreview(false)} 
           players={selectedPlayers} 
           captainId={captainId} 
           viceCaptainId={viceCaptainId} 
        />
    </main>
  );
}
