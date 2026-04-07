"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trophy, Loader2, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, query, where, onSnapshot, runTransaction } from "firebase/firestore";
import { Contest, Match, BANNED_STATES } from "@/types";
import { useUserStore } from "@/store/useStore";

export default function Contests({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { matchId } = params;
  const { user } = useUserStore();

  const [contests, setContests] = useState<Contest[]>([]);
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    // Basic match metadata fetch
    const fetchMatch = onSnapshot(doc(db, "matches", matchId), (docSnap) => {
      if (docSnap.exists()) setMatchData({ id: docSnap.id, ...docSnap.data() } as Match);
    });

    const q = query(collection(db, "contests"), where("matchId", "==", matchId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Contest[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as Contest));

      // Fallback Seed for UI demonstration if admin didn't make them yet
      if (list.length === 0) {
        list.push({ id: "mock1", matchId, type: "Mega Contest", entryFee: 49, prizePool: 10000000, totalSpots: 500000, spotsFilled: 230453 });
        list.push({ id: "mock2", matchId, type: "Head-to-Head", entryFee: 999, prizePool: 1800, totalSpots: 2, spotsFilled: 1 });
        list.push({ id: "mock3", matchId, type: "Small League", entryFee: 149, prizePool: 10000, totalSpots: 100, spotsFilled: 45 });
      }

      setContests(list);
      setLoading(false);
    });

    return () => { fetchMatch(); unsubscribe(); };
  }, [matchId]);

  const handleJoinContest = async (contest: Contest) => {
    if (!user) {
       alert("You must be logged in.");
       return;
    }

    if (user.state && BANNED_STATES.includes(user.state)) {
       alert(`Service not available in ${user.state} due to regional legal restrictions.`);
       return;
    }

    if (user.walletBalance < contest.entryFee) {
      alert(`Insufficient balance. You need ₹${contest.entryFee} to join.`);
      return;
    }

    setJoiningId(contest.id || "");

    try {
      if (contest.id?.startsWith("mock")) {
         // Fake integration for the mock objects
         setTimeout(() => {
           alert("Joined Successfully! (Mock)");
           setJoiningId(null);
         }, 1000);
         return;
      }

      // **SECURE WALLET DEDUCTION USING FIREBASE TRANSACTIONS**
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const contestRef = doc(db, "contests", contest.id!);
        
        const userDoc = await transaction.get(userRef);
        const contestDoc = await transaction.get(contestRef);

        if (!userDoc.exists() || !contestDoc.exists()) {
          throw new Error("Data not found");
        }

        const currentBalance = userDoc.data().walletBalance || 0;
        if (currentBalance < contest.entryFee) {
          throw new Error("Insufficient Balance in secure transaction.");
        }

        // Deduct balance
        transaction.update(userRef, { walletBalance: currentBalance - contest.entryFee });
        
        // Increase contest spots
        const currentSpots = contestDoc.data().spotsFilled || 0;
        transaction.update(contestRef, { spotsFilled: currentSpots + 1 });

        // Add user participant record
        const participantRef = doc(collection(db, "contest_participants"));
        transaction.set(participantRef, {
           contestId: contest.id,
           matchId: matchId,
           userId: user.uid,
           points: 0,
           rank: 0
        });
      });

      alert("Contest joined securely!");

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to join contest due to an error.");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <main className="pb-24 min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-header p-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-xl">&larr;</button>
          <div>
            <h1 className="font-bold text-lg">Contests</h1>
            {matchData && <p className="text-xs text-textMuted">{matchData.teamA} vs {matchData.teamB}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/80 px-3 py-1.5 rounded-full border border-white/10 text-sm font-bold">
            <Copy size={16} className="text-accent" />
            <span>₹{user?.walletBalance?.toLocaleString() || '0'}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-accent" /></div>
      ) : (
        <div className="p-4 flex flex-col gap-4">
          {contests.map((contest) => {
            const fillPercentage = (contest.spotsFilled / contest.totalSpots) * 100;

            return (
              <div key={contest.id} className="glass-card rounded-2xl overflow-hidden border border-white/10 relative">
                
                {/* Ribbon for Mega Contest */}
                {contest.type === "Mega Contest" && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-accent to-blue-400 text-white text-[10px] uppercase font-bold tracking-widest px-8 py-1 rotate-45 translate-x-8 translate-y-3 shadow-lg">
                    MEGA
                  </div>
                )}

                <div className="p-4 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-textMuted font-bold uppercase tracking-wider mb-1">{contest.type}</p>
                      <h3 className="text-2xl font-bold text-accent">₹{(Number(contest.prizePool) / 100000).toFixed(1)} Lakhs</h3>
                    </div>
                    <div>
                      <p className="text-xs text-textMuted font-bold uppercase tracking-wider mb-1 text-right">Entry</p>
                      <button 
                        onClick={() => handleJoinContest(contest)}
                        disabled={joiningId === contest.id}
                        className="bg-success text-primary font-bold px-4 py-1.5 rounded-lg text-sm transition-transform hover:scale-105 disabled:opacity-50"
                      >
                        {joiningId === contest.id ? "..." : `₹${contest.entryFee}`}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-white mb-2">
                       <span className="text-danger">{contest.totalSpots - contest.spotsFilled} spots left</span>
                       <span className="text-textMuted">{contest.totalSpots.toLocaleString()} spots</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-danger to-yellow-500 rounded-full transition-all duration-1000" 
                         style={{ width: `${fillPercentage}%` }}
                       />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border-t border-white/5 p-3 flex justify-between items-center text-xs font-medium text-textMuted">
                  <span className="flex items-center gap-1.5">
                    <Trophy size={14} className="text-yellow-500"/>
                    65% Winners
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-accent" />
                    Up to 20 Teams
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  );
}
