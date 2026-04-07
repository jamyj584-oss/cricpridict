"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Contest, Match } from "@/types";
import { Swords, Plus, Trash2, Edit2, CheckCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState("");
  const [entryFee, setEntryFee] = useState(500);
  const [prizePool, setPrizePool] = useState("₹100k");
  const [totalSpots, setTotalSpots] = useState(5000);

  useEffect(() => {
    const unsubMatches = onSnapshot(query(collection(db, "matches"), orderBy("startTime", "desc")), (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
      if (data.length > 0 && !matchId) setMatchId(data[0].id!);
    });

    const unsubContests = onSnapshot(collection(db, "contests"), (snapshot) => {
      const data: Contest[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Contest));
      setContests(data);
      setLoading(false);
    });

    return () => { unsubMatches(); unsubContests(); };
  }, []);

  const resetForm = () => {
    setEditId(null);
    setEntryFee(500); setPrizePool("₹100k"); setTotalSpots(5000);
    setShowForm(false);
  };

  const handleEdit = (contest: Contest) => {
    setEditId(contest.id!);
    setMatchId(contest.matchId);
    setEntryFee(contest.entryFee || 500);
    setPrizePool(contest.prizePool || contest.prizePoolDesc || "");
    setTotalSpots(contest.totalSpots || 5000);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contest? Refund users manually if needed.")) return;
    await deleteDoc(doc(db, "contests", id));
  };

  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId) return alert("Select a Match first");

    try {
      const payload = {
        matchId,
        entryFee: Number(entryFee),
        prizePool,
        totalSpots: Number(totalSpots),
        spotsFilled: 0 // Reset on Add, but how about Edit?
      };

      if (editId) {
        // Only update certain fields so we don't overwrite spotsFilled and joinedUsers
        await updateDoc(doc(db, "contests", editId), {
           entryFee: Number(entryFee),
           prizePool,
           totalSpots: Number(totalSpots)
        });
      } else {
        await addDoc(collection(db, "contests"), payload);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save contest.");
    }
  };

  const getMatchDisplay = (id: string) => {
      const m = matches.find(m => m.id === id);
      return m ? `${m.teamA} vs ${m.teamB}` : "Unknown Match";
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Swords size={24} className="text-accent" /> Contests
           </h1>
           <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">League Builder</p>
        </div>
        {!showForm && (
           <button onClick={() => setShowForm(true)} className="bg-accent text-[#0F1115] font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.2)]">
               <Plus size={16} /> Create
           </button>
        )}
      </header>

      <AnimatePresence>
         {showForm && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                 <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5 mb-8 shadow-2xl relative">
                    <h2 className="text-accent font-black uppercase tracking-widest text-sm mb-6">{editId ? 'Edit Contest' : 'New Contest'}</h2>
                    <form onSubmit={handleSaveContest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Target Match</label>
                            <select disabled={!!editId} value={matchId} onChange={e=>setMatchId(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors disabled:opacity-50">
                                {matches.map(m => (
                                    <option key={m.id} value={m.id}>{m.teamA} VS {m.teamB} ({m.status})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Entry Fee (Coins)</label>
                            <input type="number" value={entryFee} onChange={e=>setEntryFee(Number(e.target.value))} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Total Spots</label>
                            <input type="number" value={totalSpots} onChange={e=>setTotalSpots(Number(e.target.value))} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Prize Pool Text</label>
                            <input type="text" value={prizePool} onChange={e=>setPrizePool(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. ₹100k Mega" />
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-3 bg-accent text-[#0F1115] rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_5px_15px_rgba(255,215,0,0.2)] active:scale-95 transition-all">
                                {editId ? 'Update' : 'Publish'}
                            </button>
                        </div>
                    </form>
                 </div>
             </motion.div>
         )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-12 flex justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : contests.map(contest => (
             <div key={contest.id} className="bg-[#161B22] border border-white/5 rounded-2xl p-5 flex flex-col relative group hover:border-white/10 transition-colors">
                 
                 <div className="flex justify-between items-start mb-6">
                     <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border text-blue-400 bg-blue-500/10 border-blue-500/20`}>
                        {getMatchDisplay(contest.matchId)}
                     </span>
                     <div className="flex gap-2">
                        <button onClick={() => handleEdit(contest)} className="text-white/30 hover:text-white transition-colors p-1"><Edit2 size={12}/></button>
                        <button onClick={() => handleDelete(contest.id!)} className="text-white/30 hover:text-danger transition-colors p-1"><Trash2 size={12}/></button>
                     </div>
                 </div>

                 <div className="mb-4">
                     <h3 className="text-lg font-black text-white">{contest.prizePool || contest.prizePoolDesc}</h3>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-accent mt-1">Prize Pool</p>
                 </div>

                 <div className="flex justify-between items-end border-t border-white/5 pt-4">
                     <div>
                         <p className="text-[10px] text-textMuted uppercase tracking-widest font-bold flex items-center gap-1"><CheckCircle size={10} /> Entry Fee</p>
                         <p className="text-sm font-black text-white tracking-widest mt-0.5">{contest.entryFee} C</p>
                     </div>
                     <div className="text-right">
                         <p className="text-[10px] text-textMuted uppercase tracking-widest font-bold flex items-center gap-1 justify-end"><Users size={10} /> Joined</p>
                         <p className="text-sm font-black text-white tracking-widest mt-0.5">{contest.spotsFilled || 0} / {contest.totalSpots}</p>
                     </div>
                 </div>
             </div>
          ))}
      </div>
    </div>
  );
}
