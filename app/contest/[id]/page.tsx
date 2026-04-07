"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Wallet, Info, Trophy, ShieldCheck, Zap, Plus, Award, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Match, Contest, UserTeam } from "@/types";
import { useUserStore } from "@/store/useStore";
import { joinContest } from "@/lib/fantasy";
import { motion, AnimatePresence } from "framer-motion";

export default function ContestLobby() {
  const router = useRouter();
  const { id: matchId } = useParams();
  const { user } = useUserStore();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [activeTab, setActiveTab] = useState("All Contests");
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
     setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!matchId || !db) return;

    // 1. Listen to Match Status
    const unsubMatch = onSnapshot(doc(db, "matches", matchId as string), (doc) => {
      if (doc.exists()) setMatch({ id: doc.id, ...doc.data() } as Match);
    });

    // 2. Listen to Contests for this Match
    const qContests = query(collection(db, "contests"), where("matchId", "==", matchId));
    const unsubContests = onSnapshot(qContests, (snapshot) => {
      const data: Contest[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Contest));
      setContests(data);
      setLoading(false);
    });

    // 3. Listen to User Teams for this Match
    if (user) {
      const qTeams = query(collection(db, "teams"), where("userId", "==", user.uid), where("matchId", "==", matchId));
      const unsubscribeTeams = onSnapshot(qTeams, (snapshot) => {
        const data: UserTeam[] = [];
        snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as UserTeam));
        setUserTeams(data);
      });
      return () => { unsubMatch(); unsubContests(); unsubscribeTeams(); };
    }

    return () => { unsubMatch(); unsubContests(); };
  }, [matchId, user]);

  useEffect(() => {
    // Strict redirect guard
    if (!loading && match && user) {
        if (match.status !== 'Live') {
            if (userTeams.length === 0) {
               router.replace(`/create-team?match=${matchId}`);
            } else {
               const team = userTeams[userTeams.length - 1];
               if (!team.players || team.players.length !== 11 || !team.captainId || !team.viceCaptainId) {
                  router.replace(`/create-team?match=${matchId}`);
               }
            }
        }
    }
  }, [loading, match, userTeams, user, matchId, router]);

  const handleJoin = async (contest: Contest) => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!user) return router.push("/login");
    if (!match || match.status === 'Live') {
        return setErrorMsg("Match started! Entries locked.");
    }
    
    // UI Fast Fail on Balance
    const userCoins = user.walletCoins || 0;
    if (userCoins < (contest.entryFee || 0)) {
        return setErrorMsg("Insufficient Balance");
    }

    if (userTeams.length === 0) {
        setErrorMsg("Please create your team first");
        setTimeout(() => router.push(`/create-team?match=${matchId}`), 1500);
        return;
    }

    // Always use the strict complete team implementation per anti gravity request
    const teamToUse = userTeams[userTeams.length - 1];
    
    if (!teamToUse || !teamToUse.players || teamToUse.players.length !== 11 || !teamToUse.captainId || !teamToUse.viceCaptainId) {
        setErrorMsg("Your team is incomplete. Please select 11 players, Captain, and Vice-Captain.");
        setTimeout(() => router.push(`/create-team?match=${matchId}`), 2500);
        return;
    }
    
    setJoiningId(contest.id!);
    const result = await joinContest(user.uid, matchId as string, contest.id!, teamToUse.id!, contest.entryFee);
    setJoiningId(null);

    if (result.success) {
      setSuccessMsg(`₹${contest.entryFee || 0} deducted. Joined successfully`);
    } else {
      setErrorMsg(`Join Failed: ${result.error}`);
    }
  };
  if (loading) return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent mb-4" size={40} />
        <p className="text-xs font-bold text-accent uppercase tracking-widest">Syncing Arena...</p>
    </div>
  );

  if (!match) return <div className="min-h-screen bg-[#0F1115] flex items-center justify-center text-danger font-bold">Match not found</div>;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-32">
      {/* Premium Header */}
      <header className="bg-[#161B22]/80 backdrop-blur-md sticky top-0 z-50 p-4 border-b border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="text-white hover:text-accent transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-bold uppercase tracking-widest text-textMuted">{match.teamA} vs {match.teamB}</h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${match.status === 'Live' ? 'text-danger animate-pulse' : 'text-accent'}`}>
                {match.status === 'Live' ? 'Live Now' : 'Upcoming'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 cursor-pointer hover:bg-white/10" onClick={() => router.push('/wallet')}>
            <span className="text-sm">🪙</span>
            <span className="text-xs font-bold">{mounted ? (user?.walletCoins?.toLocaleString() || 0) : 0}</span>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar px-2 mt-4">
            {["All Contests", "Mega", "Head-to-Head", "Winner Takes All"].map((tab) => (
                <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab)}
                   className={`text-[11px] font-bold uppercase tracking-widest min-w-max pb-2 relative transition-all ${activeTab === tab ? 'text-accent' : 'text-textMuted'}`}
                >
                    {tab}
                    {activeTab === tab && <motion.div layoutId="lobby-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                </button>
            ))}
        </div>
      </header>

      {/* Message Notifications */}
      <div className="px-4 mt-4">
        <AnimatePresence>
            {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-danger/20 border border-danger/50 text-danger text-[10px] font-bold p-3 rounded-xl mb-4 text-center uppercase tracking-widest shadow-[0_5px_15px_rgba(239,68,68,0.2)]">
                    {errorMsg}
                </motion.div>
            )}
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-success/20 border border-success/50 text-success text-[10px] font-bold p-3 rounded-xl mb-4 text-center uppercase tracking-widest shadow-[0_5px_15px_rgba(34,197,94,0.2)]">
                    {successMsg}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Contests List */}
      <div className="p-4 space-y-8 mt-2">
        {contests.length === 0 ? (
            <div className="bg-[#161B22] border border-dashed border-white/10 rounded-[2rem] p-12 text-center opacity-50">
                <Trophy size={40} className="mx-auto mb-4 text-white/10" />
                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">No contests available yet</p>
            </div>
        ) : (
            contests.filter(c => activeTab === "All Contests" || (c.type && c.type.includes(activeTab))).map((contest) => (
                <section key={contest.id} className="relative">
                    <div className="bg-[#161B22] border border-white/5 rounded-[1.5rem] overflow-hidden shadow-2xl transition-transform active:scale-[0.99]">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Prize Pool</p>
                                    <h3 className="text-3xl font-black tracking-tighter text-white">₹{contest.prizePool?.toLocaleString()}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#FF5A5F] bg-[#FF5A5F]/10 px-2 py-0.5 rounded-full border border-[#FF5A5F]/20">
                                        🔥 Entry: ₹{contest.entryFee ? (contest.entryFee / 5) : 0}
                                    </div>
                                    <button 
                                        onClick={() => handleJoin(contest)}
                                        disabled={joiningId === contest.id || match.status === 'Live'}
                                        className={`w-full px-6 py-2.5 rounded-xl font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${
                                            joiningId === contest.id 
                                            ? 'bg-white/10 text-white/40 cursor-wait' 
                                            : match.status === 'Live'
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            : 'bg-accent text-[#0F1115] shadow-[0_5px_15px_rgba(255,215,0,0.2)] active:scale-95'
                                        }`}
                                    >
                                        {joiningId === contest.id && <Loader2 size={16} className="animate-spin" />}
                                        {joiningId === contest.id ? "Processing..." : match.status === 'Live' ? "Details" : `Join`}
                                    </button>
                                    <p className="text-[8px] text-textMuted font-bold uppercase tracking-widest mt-1 text-center w-full">
                                        {contest.entryFee} coins used
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-danger">{(contest.totalSpots || 0) - (contest.spotsFilled || 0)} spots left</span>
                                    <span className="text-textMuted opacity-50">{contest.totalSpots} spots</span>
                                </div>
                                <div className="w-full h-2 bg-[#0F1115] rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div 
                                        className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,215,0,0.4)]" 
                                        style={{ width: `${((contest.spotsFilled || 0) / (contest.totalSpots || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info Row with Trust Building */}
                        <div className="bg-[#0F1115]/50 px-6 py-4 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-white/50 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-accent">
                                <Trophy size={12} /> 💰 LOW COMPETITION
                            </div>
                            <div className="flex items-center gap-1.5 text-success">
                                <ShieldCheck size={12} /> 🎯 HIGH WINNING CHANCE
                            </div>
                        </div>
                    </div>
                </section>
            ))
        )}
      </div>

      {/* Persistence Floating Bottom Bar */}
      <AnimatePresence>
        {match.status !== 'Live' && (
            <motion.div 
                initial={{ y: 100 }} 
                animate={{ y: 0 }} 
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/95 to-transparent z-50 pointer-events-none"
            >
                <div className="grid grid-cols-2 gap-4 pointer-events-auto">
                    <button 
                        onClick={() => router.push(`/create-team?match=${matchId}`)}
                        className="bg-[#161B22] border border-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                    >
                        {userTeams.length > 0 ? `My Teams (${userTeams.length})` : <><Plus size={16} className="text-accent" /> Create Team</>}
                    </button>
                    <button className="bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                        <Zap size={16} /> AI Assistant
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
