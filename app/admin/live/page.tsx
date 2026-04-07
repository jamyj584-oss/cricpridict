"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where, setDoc } from "firebase/firestore";
import { Match } from "@/types";
import { Activity, Zap, Radio, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLiveScores() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Local state for the inputs mapping { matchId: { ...scoreData } }
  const [updateData, setUpdateData] = useState<Record<string, any>>({});

  useEffect(() => {
    const q = query(collection(db, "matches"), where("status", "==", "Live"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Match));
      setLiveMatches(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync existing live_updates to input state when matches load
  useEffect(() => {
    liveMatches.forEach(match => {
        const unsub = onSnapshot(doc(db, "live_updates", match.id!), (docSnap) => {
            if (docSnap.exists()) {
                setUpdateData(prev => ({
                    ...prev,
                    [match.id!]: docSnap.data()
                }));
            }
        });
        return () => unsub();
    });
  }, [liveMatches]);

  const handleUpdate = (matchId: string, field: string, value: string) => {
      setUpdateData(prev => ({
          ...prev,
          [matchId]: {
              ...prev[matchId],
              [field]: value
          }
      }));
  };

  const handleSave = async (matchId: string) => {
      setSaving(matchId);
      try {
          const data = updateData[matchId] || {};
          await setDoc(doc(db, "live_updates", matchId), {
              matchId,
              score: data.score || "",
              overs: data.overs || "",
              runRate: data.runRate || "",
              commentary: data.commentary || "",
              updatedAt: new Date().toISOString()
          }, { merge: true });
      } catch (err) {
          console.error(err);
          alert("Failed to push update.");
      }
      setTimeout(() => setSaving(null), 500); 
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Zap size={24} className="text-accent" /> Live Scores
        </h1>
        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Real-Time API Sync</p>
      </header>

      {loading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
      ) : liveMatches.length === 0 ? (
          <div className="bg-[#161B22] border border-white/5 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
              <Globe size={48} className="text-white/10 mb-4" />
              <h3 className="text-sm font-black uppercase text-white tracking-widest">No Live Matches</h3>
              <p className="text-[10px] text-textMuted uppercase tracking-widest font-bold mt-2">Start a match from the Matches tab</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {liveMatches.map(match => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={match.id} className="bg-[#161B22] border border-accent/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,215,0,0.05)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-danger bg-danger/10 px-2 py-1 rounded-md border border-danger/20">
                              <Activity size={10} className="animate-pulse" /> Broadcasting
                          </span>
                      </div>

                      <h2 className="text-xl font-black uppercase tracking-wide text-white mb-1">{match.teamA} vs {match.teamB}</h2>
                      <p className="text-[10px] text-textMuted uppercase font-bold tracking-widest mb-6">Match ID: {match.id}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-[9px] text-accent uppercase tracking-widest font-black block mb-1">Current Score</label>
                              <input 
                                  type="text" 
                                  value={updateData[match.id!]?.score || ""}
                                  onChange={(e) => handleUpdate(match.id!, 'score', e.target.value)}
                                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-lg font-black tracking-widest focus:border-accent/50 outline-none transition-colors placeholder:text-white/10" 
                                  placeholder="e.g. 180/5"
                              />
                          </div>
                          <div>
                              <label className="text-[9px] text-textMuted uppercase tracking-widest font-bold block mb-1">Overs</label>
                              <input 
                                  type="text" 
                                  value={updateData[match.id!]?.overs || ""}
                                  onChange={(e) => handleUpdate(match.id!, 'overs', e.target.value)}
                                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold tracking-widest focus:border-accent/50 outline-none transition-colors placeholder:text-white/10" 
                                  placeholder="e.g. 18.3"
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-[9px] text-textMuted uppercase tracking-widest font-bold block mb-1">Run Rate (RR)</label>
                              <input 
                                  type="text" 
                                  value={updateData[match.id!]?.runRate || ""}
                                  onChange={(e) => handleUpdate(match.id!, 'runRate', e.target.value)}
                                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold tracking-widest focus:border-accent/50 outline-none transition-colors placeholder:text-white/10" 
                                  placeholder="e.g. 9.80"
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="text-[9px] border border-success/30 text-success bg-success/10 px-2 py-0.5 rounded uppercase tracking-widest font-black inline-flex items-center gap-1 mb-2"><Radio size={10} /> Live Commentary</label>
                              <textarea 
                                  rows={2}
                                  value={updateData[match.id!]?.commentary || ""}
                                  onChange={(e) => handleUpdate(match.id!, 'commentary', e.target.value)}
                                  className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-accent/50 outline-none transition-colors placeholder:text-white/10 resize-none" 
                                  placeholder="Next ball coming up..."
                              />
                          </div>
                      </div>

                      <button 
                          onClick={() => handleSave(match.id!)}
                          disabled={saving === match.id}
                          className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-xl ${saving === match.id ? 'bg-success text-white' : 'bg-accent text-[#0F1115] active:scale-95 shadow-accent/20'}`}
                      >
                          {saving === match.id ? 'Pushed Successfully' : 'Push Live Update'}
                      </button>
                  </motion.div>
              ))}
          </div>
      )}
    </div>
  );
}
