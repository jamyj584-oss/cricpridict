"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Match, MatchStatus, Player } from "@/types";
import { Calendar, MapPin, MoreVertical, Plus, Trophy, Activity, CheckCircle, Trash2, Edit2, User, X, Search } from "lucide-react";
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
  
  // Squad Selection State
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [selectedMatchForSquad, setSelectedMatchForSquad] = useState<Match | null>(null);
  const [tempSquadA, setTempSquadA] = useState<string[]>([]);
  const [tempSquadB, setTempSquadB] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("startTime", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
      setLoading(false);
    });
    const unsubPlayers = onSnapshot(collection(db, "players"), (snapshot) => {
      const data: Player[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Player));
      setAllPlayers(data);
    });

    return () => { unsubscribe(); unsubPlayers(); };
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

  const handleTossWin = async (matchId: string, winner: string) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { tossWinner: winner });
    } catch (err) { console.error(err); }
  };

  const openSquadModal = (match: Match) => {
    setSelectedMatchForSquad(match);
    setTempSquadA(match.squadA || []);
    setTempSquadB(match.squadB || []);
    setShowSquadModal(true);
  };

  const togglePlayerSelection = (team: 'A' | 'B', playerId: string) => {
    if (team === 'A') {
      if (tempSquadA.includes(playerId)) {
        setTempSquadA(prev => prev.filter(id => id !== playerId));
      } else if (tempSquadA.length < 16) {
        setTempSquadA(prev => [...prev, playerId]);
      } else {
        alert("Maximum 16 players allowed for Team A");
      }
    } else {
      if (tempSquadB.includes(playerId)) {
        setTempSquadB(prev => prev.filter(id => id !== playerId));
      } else if (tempSquadB.length < 16) {
        setTempSquadB(prev => [...prev, playerId]);
      } else {
        alert("Maximum 16 players allowed for Team B");
      }
    }
  };

  const handleSaveSquad = async () => {
    if (!selectedMatchForSquad) return;
    try {
      await updateDoc(doc(db, "matches", selectedMatchForSquad.id), {
        squadA: tempSquadA,
        squadB: tempSquadB
      });
      setShowSquadModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save squads.");
    }
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

                 <div className="mt-auto border-t border-white/5 pt-4 space-y-3">
                     {match.status === 'Upcoming' && (
                         <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button onClick={() => handleUpdateStatus(match.id!, 'Live')} className="flex-1 bg-accent text-[#0F1115] hover:bg-accent/90 text-[10px] uppercase font-black py-2.5 rounded-lg transition-all shadow-lg shadow-accent/10">Start Live</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => handleTossWin(match.id!, match.teamA)} 
                                    className={`flex-1 text-[9px] uppercase font-bold py-2 rounded-lg transition-all border ${match.tossWinner === match.teamA ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                                >
                                    {match.teamA} Toss Win
                                </button>
                                <button 
                                    onClick={() => handleTossWin(match.id!, match.teamB)} 
                                    className={`flex-1 text-[9px] uppercase font-bold py-2 rounded-lg transition-all border ${match.tossWinner === match.teamB ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                                >
                                    {match.teamB} Toss Win
                                </button>
                            </div>
                         </div>
                     )}
                     
                     <button 
                        onClick={() => openSquadModal(match)}
                        className="w-full bg-white/5 hover:bg-white/10 text-[10px] uppercase font-black py-2.5 rounded-lg text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5"
                     >
                        <User size={14} /> Manage Squads ({ (match.squadA?.length || 0) + (match.squadB?.length || 0) } Selected)
                     </button>

                     {match.status === 'Live' && (
                         <div className="flex gap-2">
                            <button onClick={() => handleSetWinner(match.id!, match.teamA)} className="flex-1 bg-success/10 hover:bg-success/20 text-[10px] uppercase font-bold py-2 rounded-lg text-success transition-colors">{match.teamA} Win</button>
                            <button onClick={() => handleSetWinner(match.id!, match.teamB)} className="flex-1 bg-success/10 hover:bg-success/20 text-[10px] uppercase font-bold py-2 rounded-lg text-success transition-colors">{match.teamB} Win</button>
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

      {/* Squad Management Modal */}
      <AnimatePresence>
        {showSquadModal && selectedMatchForSquad && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSquadModal(false)} className="absolute inset-0 bg-[#0F1115]/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#161B22] w-full max-w-6xl h-full max-h-[85vh] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1A1F26]">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <User size={24} className="text-accent" /> Squad Selection
                        </h2>
                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1">
                            {selectedMatchForSquad.teamA} vs {selectedMatchForSquad.teamB} — Select 16 players per team
                        </p>
                    </div>
                    <button onClick={() => setShowSquadModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><X size={20} /></button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Team A Selection */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-black text-accent uppercase tracking-widest">{selectedMatchForSquad.teamA} Pool</h3>
                            <span className="text-[10px] font-bold text-white/40 uppercase bg-white/5 px-3 py-1 rounded-full">{tempSquadA.length} / 16 Selected</span>
                        </div>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {allPlayers.filter(p => p.team === selectedMatchForSquad.teamA).map(player => (
                                <div 
                                    key={player.id} 
                                    onClick={() => togglePlayerSelection('A', player.id)}
                                    className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all ${tempSquadA.includes(player.id) ? 'bg-accent/10 border-accent/50' : 'bg-[#0F1115] border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#161B22] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {player.imageUrl ? <img src={player.imageUrl} className="w-full h-full object-cover" /> : <User size={20} className="text-white/10" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white uppercase tracking-wider">{player.name}</p>
                                        <p className="text-[9px] text-textMuted uppercase font-bold">{player.role}</p>
                                    </div>
                                    {tempSquadA.includes(player.id) && <CheckCircle size={16} className="text-accent" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team B Selection */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-black text-accent uppercase tracking-widest">{selectedMatchForSquad.teamB} Pool</h3>
                            <span className="text-[10px] font-bold text-white/40 uppercase bg-white/5 px-3 py-1 rounded-full">{tempSquadB.length} / 16 Selected</span>
                        </div>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {allPlayers.filter(p => p.team === selectedMatchForSquad.teamB).map(player => (
                                <div 
                                    key={player.id} 
                                    onClick={() => togglePlayerSelection('B', player.id)}
                                    className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all ${tempSquadB.includes(player.id) ? 'bg-accent/10 border-accent/50' : 'bg-[#0F1115] border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#161B22] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {player.imageUrl ? <img src={player.imageUrl} className="w-full h-full object-cover" /> : <User size={20} className="text-white/10" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white uppercase tracking-wider">{player.name}</p>
                                        <p className="text-[9px] text-textMuted uppercase font-bold">{player.role}</p>
                                    </div>
                                    {tempSquadB.includes(player.id) && <CheckCircle size={16} className="text-accent" />}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-white/5 bg-[#1A1F26] flex justify-end gap-4">
                    <button onClick={() => setShowSquadModal(false)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-white transition-colors">Discard</button>
                    <button onClick={handleSaveSquad} className="px-12 py-4 bg-accent text-[#0F1115] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Save Changes</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
