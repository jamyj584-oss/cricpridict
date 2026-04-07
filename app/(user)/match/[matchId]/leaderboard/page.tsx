"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Medal, Loader2, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

interface LeaderboardEntry {
  id: string;
  userId: string;
  points: number;
  rank: number;
}

export default function Leaderboard({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { matchId } = params;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: Due to lack of strict Firestore index configuration locally, we pull and sort client side 
    // to guarantee it doesn't fail without the user establishing complex compound indexes first.
    const q = query(
      collection(db, "leaderboard"), 
      where("matchId", "==", matchId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: LeaderboardEntry[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as LeaderboardEntry));
      
      // Sort natively
      data.sort((a,b) => a.rank - b.rank);
      setLeaderboard(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId]);

  return (
    <main className="pb-24 min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-header p-4 sticky top-0 z-50 flex items-center gap-4 border-b border-white/10">
        <button onClick={() => router.back()} className="text-xl">&larr;</button>
        <h1 className="font-bold text-lg flex items-center gap-2">
           <Trophy size={20} className="text-yellow-500"/>
           Live Leaderboard
        </h1>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-accent" /></div>
      ) : leaderboard.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-textMuted">
           <Medal size={48} className="mb-4 opacity-20" />
           <p>Results not yet calculated.</p>
           <p className="text-xs mt-2">Waiting for match to complete.</p>
        </div>
      ) : (
        <div className="flex flex-col">
           {/* Column Headers */}
           <div className="flex px-4 py-2 text-[10px] uppercase font-bold text-textMuted bg-white/5 border-b border-white/5">
              <div className="w-12 text-center">Rank</div>
              <div className="flex-1 pl-2">User</div>
              <div className="w-20 text-center">Points</div>
           </div>

           {/* Leaderboard List */}
           {leaderboard.map((entry, index) => {
              const isTop3 = entry.rank <= 3;
              
              return (
                <div key={entry.id} className={`flex items-center px-4 py-3 border-b border-white/5 transition-colors ${entry.rank === 1 ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`}>
                  
                  {/* Rank Area */}
                  <div className="w-12 flex justify-center font-bold">
                     {entry.rank === 1 ? <Medal className="text-yellow-500 drop-shadow-md" size={20}/> 
                       : entry.rank === 2 ? <Medal className="text-gray-400 drop-shadow-md" size={20}/>
                       : entry.rank === 3 ? <Medal className="text-amber-600 drop-shadow-md" size={20}/>
                       : <span className="text-sm text-textMuted">#{entry.rank}</span>
                     }
                  </div>

                  {/* User Area */}
                  <div className="flex-1 flex items-center pl-2 gap-3">
                     <div className="w-8 h-8 rounded-full bg-secondary border border-white/10 flex items-center justify-center">
                        <User size={14} className="opacity-50" />
                     </div>
                     <div>
                        <p className={`font-bold text-sm ${entry.rank === 1 ? 'text-yellow-500' : 'text-white'}`}>
                           {entry.userId.slice(0, 8)}... {/* User ID masking for UI */}
                        </p>
                        {isTop3 && <p className="text-[10px] text-accent font-medium uppercase tracking-widest">Winning Zone</p>}
                     </div>
                  </div>

                  {/* Points Area */}
                  <div className="w-20 text-center flex flex-col justify-center">
                     <span className="font-bold text-lg leading-none">{entry.points.toFixed(1)}</span>
                     <span className="text-[8px] text-textMuted uppercase mt-0.5">PTS</span>
                  </div>

                </div>
              )
           })}
        </div>
      )}

      {/* Floating Action */}
      <div className="fixed bottom-0 left-0 right-0 glass-header p-4">
         <button className="w-full bg-white/10 text-white font-bold py-3 rounded-xl transition-colors hover:bg-white/20">
           View Prize Distribution
         </button>
      </div>
    </main>
  );
}
