"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Match, MatchStatus } from "@/types";
import { Calendar, MapPin, MoreVertical, Plus, Trophy, Activity, CheckCircle, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [matchType, setMatchType] = useState("T20");
  const [venue, setVenue] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("startTime", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setTeamA(""); setTeamB(""); setMatchType("T20"); setVenue(""); setTimeStr("");
    setShowForm(false);
  };

  const handleEdit = (match: Match) => {
    setEditId(match.id!);
    setTeamA(match.teamA);
    setTeamB(match.teamB);
    setMatchType(match.league || "T20");
    setVenue(match.venue || "");
    // Format timestamp back to datetime-local string
    const d = new Date(match.startTime);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, -1);
    setTimeStr(localISOTime.split('.')[0]); // YYYY-MM-DDThh:mm
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    await deleteDoc(doc(db, "matches", id));
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !timeStr) return;

    try {
      if (editId) {
        await updateDoc(doc(db, "matches", editId), {
          teamA,
          teamB,
          league: matchType,
          venue,
          startTime: new Date(timeStr).getTime(),
        });
      } else {
        await addDoc(collection(db, "matches"), {
          teamA,
          teamB,
          league: matchType,
          venue,
          startTime: new Date(timeStr).getTime(),
          status: "Upcoming",
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (err) {
      console.error("Match save error:", err);
      alert("Failed to save match.");
    }
  };

  const handleUpdateStatus = async (matchId: string, newStatus: MatchStatus) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { status: newStatus });
    } catch (err) { console.error(err); }
  };

  const handleSetWinner = async (matchId: string, winner: string) => {
    if(!confirm(`Set ${winner} as winner and complete match?`)) return;
    try {
      await updateDoc(doc(db, "matches", matchId), { status: 'Completed', matchWinner: winner });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex justify-between items-end mb-8">
        <div>
           <h1 className="text-2xl font-black text-white uppercase tracking-widest">Matches</h1>
           <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Manage Database</p>
        </div>
        {!showForm && (
           <button onClick={() => setShowForm(true)} className="bg-accent text-[#0F1115] font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.2)]">
               <Plus size={16} /> Add Match
           </button>
        )}
      </header>

      <AnimatePresence>
         {showForm && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                 <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5 mb-8 shadow-2xl relative">
                    <h2 className="text-accent font-black uppercase tracking-widest text-sm mb-6">{editId ? 'Edit Match' : 'New Match'}</h2>
                    <form onSubmit={handleSaveMatch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Team A</label>
                            <input type="text" value={teamA} onChange={e=>setTeamA(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. IND" />
                        </div>
                        <div>
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Team B</label>
                            <input type="text" value={teamB} onChange={e=>setTeamB(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. AUS" />
                        </div>
                        <div>
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Match Type</label>
                            <select value={matchType} onChange={e=>setMatchType(e.target.value)} className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors">
                                <option value="T20">T20</option>
                                <option value="ODI">ODI</option>
                                <option value="Test">Test</option>
                                <option value="League">League</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Date & Time</label>
                            <input type="datetime-local" value={timeStr} onChange={e=>setTimeStr(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors [color-scheme:dark]" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-[10px] text-textMuted uppercase tracking-widest font-bold mb-1 block">Venue (Optional)</label>
                            <input type="text" value={venue} onChange={e=>setVenue(e.target.value)} className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. Wankhede Stadium" />
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

      {/* Matches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-12 flex justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : matches.map(match => (
             <div key={match.id} className="bg-[#161B22] border border-white/5 rounded-2xl p-5 flex flex-col relative group hover:border-white/10 transition-colors">
                 
                 <div className="flex justify-between items-start mb-6">
                     <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border flex items-center gap-1.5 
                       ${match.status === 'Upcoming' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : ''}
                       ${match.status === 'Live' ? 'border-danger/30 text-danger bg-danger/10 animate-pulse' : ''}
                       ${match.status === 'Completed' ? 'border-success/30 text-success bg-success/10' : ''}
                     `}>
                        {match.status === 'Live' && <Activity size={10} />}
                        {match.status}
                     </span>
                     <div className="flex gap-2">
                        <button onClick={() => handleEdit(match)} className="text-white/30 hover:text-white transition-colors p-1"><Edit2 size={14}/></button>
                        <button onClick={() => handleDelete(match.id!)} className="text-white/30 hover:text-danger transition-colors p-1"><Trash2 size={14}/></button>
                     </div>
                 </div>

                 <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-[#0F1115] border border-white/5 rounded-full flex items-center justify-center font-black text-sm text-white/80">{match.teamA.substring(0,3).toUpperCase()}</div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-textMuted">{match.teamA}</span>
                      </div>
                      <span className="text-xs font-black text-white/20 italic">VS</span>
                      <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-[#0F1115] border border-white/5 rounded-full flex items-center justify-center font-black text-sm text-white/80">{match.teamB.substring(0,3).toUpperCase()}</div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-textMuted">{match.teamB}</span>
                      </div>
                 </div>

                 <div className="space-y-2 mb-6">
                     <p className="text-[10px] uppercase tracking-widest text-textMuted font-bold flex items-center gap-2"><Calendar size={12}/> {new Date(match.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                     {match.venue && <p className="text-[10px] uppercase tracking-widest text-textMuted font-bold flex items-center gap-2"><MapPin size={12}/> {match.venue}</p>}
                     <p className="text-[10px] uppercase tracking-widest text-textMuted font-bold flex items-center gap-2"><Trophy size={12}/> {match.league}</p>
                 </div>

                 <div className="mt-auto border-t border-white/5 pt-4">
                     {match.status === 'Upcoming' && (
                         <div className="flex gap-2">
                            <button onClick={() => handleUpdateStatus(match.id!, 'Live')} className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg text-danger transition-colors">Start Live</button>
                         </div>
                     )}
                     {match.status === 'Live' && (
                         <div className="flex gap-2">
                            <button onClick={() => handleSetWinner(match.id!, match.teamA)} className="flex-1 bg-success/10 hover:bg-success/20 text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg text-success transition-colors">{match.teamA} Win</button>
                            <button onClick={() => handleSetWinner(match.id!, match.teamB)} className="flex-1 bg-success/10 hover:bg-success/20 text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg text-success transition-colors">{match.teamB} Win</button>
                         </div>
                     )}
                     {match.status === 'Completed' && (
                         <div className="flex items-center justify-center gap-2 text-[10px] text-accent uppercase font-black tracking-widest border border-accent/20 bg-accent/5 rounded-lg py-2">
                             <CheckCircle size={14} /> Winner: {(match as any).matchWinner || 'N/A'}
                         </div>
                     )}
                 </div>
             </div>
          ))}
      </div>
    </div>
  );
}
