"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Player, PlayerRole } from "@/types";
import { Users, Plus, Trash2, Edit2, Star, DollarSign, ChevronRight, ArrowLeft, Image as ImageIcon, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Team {
  id?: string;
  name: string;
  code: string;
  logoUrl?: string;
}

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"TEAMS" | "PLAYERS">("TEAMS");
  const [selectedTeamCode, setSelectedTeamCode] = useState<string | null>(null);
  
  // Form State (Shared for Teams and Players)
  const [editId, setEditId] = useState<string | null>(null);
  
  // Team Form State
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teamLogo, setTeamLogo] = useState("");

// Player Form State
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState<PlayerRole>("BAT");
  const [playerImage, setPlayerImage] = useState("");

  useEffect(() => {
    // 1. Fetch Teams
    const qTeams = query(collection(db, "teams"), orderBy("name"));
    const unsubTeams = onSnapshot(qTeams, (snapshot) => {
      const data: Team[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Team));
      setTeams(data);
    });

    // 2. Fetch Players
    const qPlayers = query(collection(db, "players"), orderBy("name"));
    const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const data: Player[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Player));
      setPlayers(data);
      setLoading(false);
    });

    return () => {
      unsubTeams();
      unsubPlayers();
    };
  }, []);

  const resetForms = () => {
    setEditId(null);
    setTeamName(""); setTeamCode(""); setTeamLogo("");
    setPlayerName(""); setPlayerRole("BAT"); setPlayerImage("");
    setShowForm(false);
  };

  const handleEditTeam = (team: Team) => {
    setEditId(team.id!);
    setTeamName(team.name);
    setTeamCode(team.code);
    setTeamLogo(team.logoUrl || "");
    setShowForm(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditId(player.id!);
    setPlayerName(player.name);
    setPlayerRole(player.role);
    setPlayerImage(player.imageUrl || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete this ${collectionName.slice(0,-1)}?`)) return;
    await deleteDoc(doc(db, collectionName, id));
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamCode) return;
    try {
      const payload = { 
        name: teamName, 
        code: teamCode.toUpperCase(), 
        logoUrl: teamLogo,
        updatedAt: serverTimestamp()
      };
      if (editId) {
        await updateDoc(doc(db, "teams", editId), payload);
      } else {
        await addDoc(collection(db, "teams"), { ...payload, createdAt: serverTimestamp() });
      }
      resetForms();
    } catch (err) { alert("Error saving team"); }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !selectedTeamCode) return;
    try {
      const payload = {
        name: playerName,
        team: selectedTeamCode,
        role: playerRole,
        imageUrl: playerImage,
        updatedAt: serverTimestamp()
      };
      if (editId) {
        await updateDoc(doc(db, "players", editId), payload);
      } else {
        await addDoc(collection(db, "players"), { ...payload, createdAt: serverTimestamp() });
      }
      resetForms();
    } catch (err) { alert("Error saving player"); }
  };

  const roleOrder: Record<string, number> = { "AR": 1, "WK": 2, "BAT": 3, "BOWL": 4 };
  const currentTeamPlayers = players
    .filter(p => p.role && p.team === selectedTeamCode)
    .sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));
  const selectedTeamData = teams.find(t => t.code === selectedTeamCode);

  return (
    <div className="space-y-6 relative">
      <header className="flex justify-between items-end mb-8">
        <div>
           {viewMode === "PLAYERS" && (
              <button onClick={() => { setViewMode("TEAMS"); setSelectedTeamCode(null); }} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-textMuted hover:text-white transition-colors mb-2">
                 <ArrowLeft size={10} /> Back to Teams
              </button>
           )}
           <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
               <Users size={24} className="text-accent" /> 
               {viewMode === "TEAMS" ? "Teams Database" : `${selectedTeamCode} Squad`}
           </h1>
        </div>
        {!showForm && (
           <button onClick={() => setShowForm(true)} className="bg-accent text-[#0F1115] font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,215,0,0.2)]">
               <Plus size={16} /> {viewMode === "TEAMS" ? "Add New Team" : "Add Player"}
           </button>
        )}
      </header>

      <AnimatePresence>
         {showForm && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                 <div className="bg-[#161B22] p-8 rounded-[2rem] border border-white/5 mb-8 shadow-2xl relative">
                    <h2 className="text-accent font-black uppercase tracking-[0.2em] text-xs mb-8">
                       {viewMode === "TEAMS" ? (editId ? "Update Team Info" : "Register Team") : (editId ? "Modify Player" : "Onboard Cricketer")}
                    </h2>
                    
                    {viewMode === "TEAMS" ? (
                        <form onSubmit={handleSaveTeam} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block">Team Full Name</label>
                                <input type="text" value={teamName} onChange={e=>setTeamName(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. India" />
                            </div>
                            <div>
                                <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block">Short Code</label>
                                <input type="text" value={teamCode} onChange={e=>setTeamCode(e.target.value.toUpperCase())} required className="w-full bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="e.g. IND" />
                            </div>
                            <div>
                                <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block flex items-center gap-2">
                                    <ImageIcon size={12} /> Team Logo URL
                                </label>
                                <input type="text" value={teamLogo} onChange={e=>setTeamLogo(e.target.value)} className="w-full bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="https://..." />
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-3 mt-4 border-t border-white/5 pt-6">
                                <button type="button" onClick={resetForms} className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-10 py-4 bg-accent text-[#0F1115] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                    {editId ? 'Update Team' : 'Publish Team'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSavePlayer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block">Full Name</label>
                                <input type="text" value={playerName} onChange={e=>setPlayerName(e.target.value)} required className="w-full bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-accent/50 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block">Role</label>
                                <select value={playerRole} onChange={e=>setPlayerRole(e.target.value as PlayerRole)} className="w-full bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-accent/50 outline-none transition-colors">
                                    <option value="BAT">BATSMAN</option>
                                    <option value="BOWL">BOWLER</option>
                                    <option value="AR">ALL-ROUNDER</option>
                                    <option value="WK">WICKET-KEEPER</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block flex items-center gap-2">
                                    <ImageIcon size={12} /> Athlete Photo URL
                                </label>
                                <input type="text" value={playerImage} onChange={e=>setPlayerImage(e.target.value)} className="w-full bg-[#0F1115] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-accent/50 outline-none transition-colors" placeholder="https://..." />
                            </div>
                            <div className="md:col-span-3 flex justify-end gap-3 mt-4 border-t border-white/5 pt-6">
                                <button type="button" onClick={resetForms} className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-white transition-colors">Discard</button>
                                <button type="submit" className="px-10 py-4 bg-accent text-[#0F1115] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                    {editId ? 'Save Changes' : 'Onboard Player'}
                                </button>
                            </div>
                        </form>
                    )}
                 </div>
             </motion.div>
         )}
      </AnimatePresence>

      {/* Main Content View */}
      <AnimatePresence mode="wait">
          {viewMode === "TEAMS" ? (
              <motion.div key="teams-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {teams.length === 0 && !loading && <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-widest">No Teams Created Yet</div>}
                  {teams.map(team => (
                      <div key={team.id} className="bg-[#161B22] border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center group relative hover:border-white/10 transition-all">
                          <div className="absolute top-4 right-4 flex gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); handleEditTeam(team); }} className="p-1.5 rounded-lg bg-[#0F1115] text-white/40 hover:text-white"><Edit2 size={12} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(team.id!, "teams"); }} className="p-1.5 rounded-lg bg-[#0F1115] text-white/40 hover:text-danger"><Trash2 size={12} /></button>
                          </div>

                          <div className="w-24 h-24 rounded-[2rem] bg-[#0F1115] border border-white/5 shadow-inner mb-6 flex items-center justify-center overflow-hidden">
                              {team.logoUrl ? (
                                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain p-2" />
                              ) : (
                                  <span className="text-2xl font-black text-white/10 uppercase tracking-widest">{team.code}</span>
                              )}
                          </div>

                          <h3 className="text-base font-black text-white uppercase tracking-wider text-center">{team.name}</h3>
                          <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">{team.code}</span>

                          <button 
                            onClick={() => { setViewMode("PLAYERS"); setSelectedTeamCode(team.code); }}
                            className="mt-8 w-full py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                               Players List <ChevronRight size={12} />
                          </button>
                      </div>
                  ))}
              </motion.div>
          ) : (
              <motion.div key="players-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex items-center gap-6 bg-[#161B22] p-6 rounded-[2rem] border border-white/5">
                      <div className="w-16 h-16 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {selectedTeamData?.logoUrl ? <img src={selectedTeamData.logoUrl} className="w-full h-full object-contain p-2" /> : <span className="font-black text-white/10 uppercase">{selectedTeamCode}</span>}
                      </div>
                      <div>
                          <h2 className="text-lg font-black text-white uppercase tracking-widest">{selectedTeamData?.name}</h2>
                          <p className="text-[10px] text-accent uppercase font-black tracking-widest">{currentTeamPlayers.length} Total Cricketers</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {currentTeamPlayers.map(player => (
                         <div key={player.id} className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 flex flex-col group hover:border-white/10 transition-colors">
                             <div className="flex justify-between items-start mb-6">
                                 <span className="text-[10px] uppercase font-black tracking-widest text-[#FFFFFF]/30 px-3 py-1 rounded-lg border border-white/5">
                                     {player.role}
                                 </span>
                                 <div className="flex gap-2">
                                     <button onClick={() => handleEditPlayer(player)} className="p-1.5 rounded-lg bg-[#0F1115] text-white/40 hover:text-white"><Edit2 size={12}/></button>
                                     <button onClick={() => handleDelete(player.id!, "players")} className="p-1.5 rounded-lg bg-[#0F1115] text-white/40 hover:text-danger"><Trash2 size={12}/></button>
                                 </div>
                             </div>

                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                    {player.imageUrl ? (
                                        <img src={player.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-white/10" />
                                    )}
                                </div>
                                <h3 className="text-base font-black text-white leading-tight">{player.name}</h3>
                             </div>

                         </div>
                      ))}
                      {currentTeamPlayers.length === 0 && <div className="col-span-full py-12 text-center opacity-20 uppercase font-black text-[10px] tracking-widest border border-dashed border-white/5 rounded-[2rem]">No Players Listed</div>}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
