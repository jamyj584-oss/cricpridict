"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, where, deleteDoc, doc } from "firebase/firestore";
import { Match, Contest, ContestType } from "@/types";
import { Trophy, Plus, Trash2, Coins } from "lucide-react";

export default function AdminContests() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [loading, setLoading] = useState(true);

  // New Contest Form
  const [type, setType] = useState<ContestType>("Mega Contest");
  const [entryFee, setEntryFee] = useState("49");
  const [prizePool, setPrizePool] = useState("5000000");
  const [totalSpots, setTotalSpots] = useState("100000");

  useEffect(() => {
    // 1. Fetch upcoming/live matches for selection
    const qMatches = query(collection(db, "matches"), orderBy("startTime", "asc"));
    const unsubMatches = onSnapshot(qMatches, (snap) => {
      const data: Match[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Match));
      setMatches(data);
      if (data.length > 0 && !selectedMatchId) setSelectedMatchId(data[0].id);
    });

    // 2. Fetch all contests
    const qContests = query(collection(db, "contests"), orderBy("matchId"));
    const unsubContests = onSnapshot(qContests, (snap) => {
      const data: Contest[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Contest));
      setContests(data);
      setLoading(false);
    });

    return () => { unsubMatches(); unsubContests(); };
  }, [selectedMatchId]);

  const handleAddContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    try {
      await addDoc(collection(db, "contests"), {
        matchId: selectedMatchId,
        type,
        entryFee: parseInt(entryFee),
        prizePool: parseInt(prizePool),
        totalSpots: parseInt(totalSpots),
        spotsFilled: 0,
        createdAt: serverTimestamp()
      });
      alert("Contest created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create contest");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this contest?")) {
      await deleteDoc(doc(db, "contests", id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Arena Management</h1>

      {/* Create Contest Form */}
      <div className="bg-[#161B22] border border-white/10 rounded-[2rem] p-8 mb-10 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-accent flex items-center gap-2">
            <Plus size={24} /> Create New Contest
        </h2>
        <form onSubmit={handleAddContest} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="lg:col-span-1">
            <label className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2 block">Target Match</label>
            <select 
                value={selectedMatchId} 
                onChange={e => setSelectedMatchId(e.target.value)}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>{m.teamA} vs {m.teamB} ({m.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2 block">Contest Type</label>
            <select 
                value={type} 
                onChange={e => setType(e.target.value as ContestType)}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            >
              <option value="Mega Contest">Mega Contest</option>
              <option value="Head-to-Head">Head-to-Head</option>
              <option value="Small League">Small League</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2 block">Entry Fee (₹)</label>
            <input type="number" value={entryFee} onChange={e=>setEntryFee(e.target.value)} required className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2 block">Prize Pool (₹)</label>
            <input type="number" value={prizePool} onChange={e=>setPrizePool(e.target.value)} required className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2 block">Total Spots</label>
            <input type="number" value={totalSpots} onChange={e=>setTotalSpots(e.target.value)} required className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm" />
          </div>
          <button type="submit" className="bg-accent text-[#0F1115] font-black h-[50px] rounded-xl hover:bg-accent/90 transition-all uppercase tracking-widest text-xs">
            Deploy Contest
          </button>
        </form>
      </div>

      {/* Active Contests List */}
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 px-2">
        <Trophy size={20} className="text-accent" /> Active Contests
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-textMuted px-2">Syncing contests...</p> : contests.map(c => {
            const match = matches.find(m => m.id === c.matchId);
            return (
                <div key={c.id} className="bg-[#161B22] border border-white/5 rounded-[1.5rem] p-6 shadow-xl relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">{c.type}</span>
                            <h3 className="text-lg font-bold mt-2 text-white">₹{(c.prizePool/100000).toFixed(1)}L Pool</h3>
                        </div>
                        <button onClick={() => handleDelete(c.id!)} className="text-white/20 hover:text-danger p-2 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                            <span className="text-textMuted">Entry</span>
                            <span className="text-white">₹{c.entryFee}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                            <span className="text-textMuted">Spots</span>
                            <span className="text-white">{c.spotsFilled} / {c.totalSpots}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                            <span className="text-textMuted">Match</span>
                            <span className="text-success">{match ? `${match.teamA} vs ${match.teamB}` : 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#0F1115] rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-accent rounded-full transition-all duration-1000" 
                            style={{ width: `${(c.spotsFilled / c.totalSpots) * 100}%` }}
                        ></div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
