"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Contest, Match } from "@/types";
import { Swords, Plus, Trash2, Edit2, CheckCircle, Users, ChevronLeft, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContests() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [entryFee, setEntryFee] = useState(500);
  const [prizePool, setPrizePool] = useState("₹100k");
  const [totalSpots, setTotalSpots] = useState(5000);
  const [type, setType] = useState("Mega");

  useEffect(() => {
    const unsubMatches = onSnapshot(query(collection(db, "matches"), orderBy("startTime", "desc")), (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
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
    setEntryFee(500); setPrizePool("₹100k"); setTotalSpots(5000); setType("Mega");
    setShowForm(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEdit = (contest: Contest) => {
    setEditId(contest.id!);
    setEntryFee(contest.entryFee || 500);
    setPrizePool(String(contest.prizePool || ""));
    setTotalSpots(contest.totalSpots || 5000);
    setType((contest as any).type || "Mega");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contest? Refund users manually if needed.")) return;
    await deleteDoc(doc(db, "contests", id));
  };

  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatchId) return alert("No active match selected");

    setSaving(true);
    setFeedback(null);

    try {
      if (editId) {
        await updateDoc(doc(db, "contests", editId), {
           entryFee: Number(entryFee),
           prizePool: isNaN(Number(prizePool)) ? prizePool : Number(prizePool),
           totalSpots: Number(totalSpots),
           type
        });
        setFeedback({ type: 'success', msg: 'Contest Updated Successfully!' });
      } else {
        await addDoc(collection(db, "contests"), {
          matchId: activeMatchId,
          entryFee: Number(entryFee),
          prizePool: isNaN(Number(prizePool)) ? prizePool : Number(prizePool),
          totalSpots: Number(totalSpots),
          spotsFilled: 0,
          type,
          createdAt: new Date().toISOString()
        });
        setFeedback({ type: 'success', msg: 'New Contest Published!' });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', msg: 'Failed to save contest.' });
    } finally {
      setSaving(false);
    }
  };

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const activeMatchContests = contests.filter(c => c.matchId === activeMatchId);

  return (
    <div className="space-y-6 relative pb-20">
      <header className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Swords size={24} className="text-accent" /> Contests
           </h1>
           <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">League Builder</p>
        </div>
      </header>

      {!activeMatchId ? (
          // --- MATCH SELECTION VIEW ---
          <div>
             <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Calendar size={16}/> Select Match</h2>
             {loading ? (
                 <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {matches.map(m => (
                         <div key={m.id} className="bg-[#161B22] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all shadow-xl">
                             <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${m.status === 'Completed' ? 'text-success bg-success/10 border-success/20' : m.status === 'Live' ? 'text-danger bg-danger/10 border-danger/20 animate-pulse' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                                    {m.status}
                                </span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    {contests.filter(c => c.matchId === m.id).length} Contests
                                </span>
                             </div>
                             <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">{m.teamA} VS {m.teamB}</h3>
                             <button onClick={() => setActiveMatchId(m.id!)} className="mt-auto w-full py-3 rounded-xl bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-[#0F1115] transition-colors shadow-lg">
                                 Manage Contests
                             </button>
                         </div>
                     ))}
                     {matches.length === 0 && <p className="text-textMuted text-xs font-bold uppercase col-span-full">No Matches Available. Create them first.</p>}
                 </div>
             )}
          </div>
      ) : (
          // --- CONTEST MANAGEMENT VIEW (Per Match) ---
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <button onClick={() => { setActiveMatchId(null); resetForm(); }} className="mb-6 flex items-center gap-2 text-textMuted hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                 <ChevronLeft size={16} /> Back to Matches
             </button>

             <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
                 <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{activeMatch?.teamA} VS {activeMatch?.teamB}</h2>
                    <span className="text-[10px] text-accent font-bold uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20 mt-2 inline-block">MATCH TARGETED</span>
                 </div>
                 {!showForm && (
                     <button onClick={() => setShowForm(true)} className="bg-accent text-[#0F1115] font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.2)]">
                         <Plus size={16} /> New Contest
                     </button>
                 )}
             </div>

             <AnimatePresence>
                 {showForm && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                         <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5 mb-8 shadow-2xl relative">
                            <h2 className="text-accent font-black uppercase tracking-widest text-sm mb-6">{editId ? 'Edit Contest' : 'New Contest'}</h2>
                            <form onSubmit={handleSaveContest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Entry Fee (Coins)</label>
                                    <input type="number" value={entryFee} onChange={e=>setEntryFee(Number(e.target.value))} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Total Spots</label>
                                    <input type="number" value={totalSpots} onChange={e=>setTotalSpots(Number(e.target.value))} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Contest Type</label>
                                    <select value={type} onChange={e=>setType(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors">
                                        <option value="Mega">Mega</option>
                                        <option value="Head-to-Head">Head-to-Head</option>
                                        <option value="Winner Takes All">Winner Takes All</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Prize Pool Text</label>
                                    <input type="text" value={prizePool} onChange={e=>setPrizePool(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. ₹100k Multi-Winner" />
                                </div>
                                
                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" disabled={saving} className="px-6 py-3 bg-accent text-[#0F1115] rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_5px_15px_rgba(255,215,0,0.2)] active:scale-95 transition-all disabled:opacity-50">
                                        {saving ? 'Processing...' : (editId ? 'Update' : 'Publish')}
                                    </button>
                                </div>
                            </form>
                            
                            <AnimatePresence>
                               {feedback && (
                                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-4 p-4 rounded-xl text-[10px] uppercase font-black tracking-widest text-center ${feedback.type === 'success' ? 'bg-success/20 text-success border border-success/20' : 'bg-danger/20 text-danger border border-danger/20'}`}>
                                       {feedback.msg}
                                   </motion.div>
                               )}
                            </AnimatePresence>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {activeMatchContests.length === 0 && !showForm && (
                     <p className="text-textMuted text-xs font-bold uppercase tracking-widest col-span-full py-8 border border-dashed border-white/10 rounded-2xl text-center">No contests exist for this match.</p>
                 )}
                 {activeMatchContests.map(contest => (
                    <div key={contest.id} className="bg-[#161B22] border border-white/5 rounded-2xl p-5 flex flex-col relative group hover:border-white/10 transition-colors shadow-xl">
                        
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[9px] bg-accent/20 text-accent font-black uppercase tracking-widest px-2.5 py-1 rounded border border-accent/20">{(contest as any).type || "Mega"}</span>
                            <div className="flex gap-2">
                               <button onClick={() => handleEdit(contest)} className="text-white/30 hover:text-white transition-colors p-1"><Edit2 size={12}/></button>
                               <button onClick={() => handleDelete(contest.id!)} className="text-white/30 hover:text-danger transition-colors p-1"><Trash2 size={12}/></button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-black text-white">{contest.prizePool}</h3>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-textMuted mt-1">Prize Pool</p>
                        </div>

                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div>
                                <p className="text-[9px] text-textMuted uppercase tracking-widest font-bold flex items-center gap-1"><CheckCircle size={10} /> Entry Fee</p>
                                <p className="text-sm font-black text-white tracking-widest mt-0.5">{contest.entryFee} C</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-textMuted uppercase tracking-widest font-bold flex items-center gap-1 justify-end"><Users size={10} /> Joined</p>
                                <p className="text-sm font-black text-white tracking-widest mt-0.5">{contest.spotsFilled || 0} / {contest.totalSpots}</p>
                            </div>
                        </div>
                    </div>
                 ))}
             </div>
          </motion.div>
      )}
    </div>
  );
}
