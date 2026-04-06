"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Player, PlayerRole } from "@/types";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // New Player Form
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState<PlayerRole>("BAT");
  const [credits, setCredits] = useState("8.5");
  const [basePoints, setBasePoints] = useState("0");

  useEffect(() => {
    const q = query(collection(db, "players"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Player[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Player));
      setPlayers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !team) return;

    try {
      await addDoc(collection(db, "players"), {
        name,
        team,
        role,
        credits: parseFloat(credits),
        basePoints: parseInt(basePoints),
        createdAt: serverTimestamp()
      });
      // Clear form
      setName(""); 
    } catch (err) {
      console.error(err);
      alert("Failed to add player");
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure?")) {
      await deleteDoc(doc(db, "players", id));
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Players Database</h1>

      {/* Add New Player Form */}
      <div className="glass-card p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-accent">Quick Add Player</h2>
        <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="text-xs text-textMuted mb-1 block">Full Name</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" placeholder="e.g. V. Kohli"/>
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1 block">Team (Exact String)</label>
            <input type="text" value={team} onChange={e=>setTeam(e.target.value)} required className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" placeholder="e.g. India"/>
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1 block">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value as PlayerRole)} className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm text-white">
              <option value="BAT">BAT</option>
              <option value="BOWL">BOWL</option>
              <option value="AR">AR (All Rounder)</option>
              <option value="WK">WK (Wicket Keeper)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1 block">Credits (Budget)</label>
            <input type="number" step="0.5" value={credits} onChange={e=>setCredits(e.target.value)} required className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-success text-primary font-bold py-2 px-4 rounded hover:bg-success/90">
            Save
          </button>
        </form>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? <p>Loading players...</p> : players.map(player => (
          <div key={player.id} className="glass-card p-4 border border-white/10 relative group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-lg">{player.name}</span>
              <span className="bg-white/10 text-xs px-2 py-0.5 rounded font-bold text-accent">{player.role}</span>
            </div>
            <p className="text-xs text-textMuted mb-3">Team: <strong className="text-white">{player.team}</strong></p>
            
            <div className="flex justify-between items-center text-sm pt-3 border-t border-white/10">
              <span>{player.credits} Credits</span>
              <span>{player.basePoints} Pts</span>
            </div>

            <button onClick={() => handleDelete(player.id)} className="absolute top-2 right-2 text-danger opacity-0 group-hover:opacity-100 transition-opacity">
               &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
