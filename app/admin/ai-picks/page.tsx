"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, orderBy, setDoc } from "firebase/firestore";
import { Match } from "@/types";
import { BrainCircuit, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAIPicks() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [predictionText, setPredictionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const qMatches = query(collection(db, "matches"), orderBy("startTime", "desc"));
    const unsubMatches = onSnapshot(qMatches, (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
      if (data.length > 0 && !selectedMatch) setSelectedMatch(data[0].id!);
      setLoading(false);
    });
    return () => unsubMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    const unsub = onSnapshot(doc(db, "ai_picks", selectedMatch), (docSnap) => {
      if (docSnap.exists()) {
        setPredictionText(docSnap.data().text || "");
      } else {
        setPredictionText("");
      }
    });
    return () => unsub();
  }, [selectedMatch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !predictionText) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "ai_picks", selectedMatch), {
        matchId: selectedMatch,
        text: predictionText,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error(err);
      alert("Failed to save AI Pick.");
    }
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
             <BrainCircuit size={24} className="text-blue-400" /> AI Strategy Panel
        </h1>
        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Override model predictions</p>
      </header>

      {loading ? (
           <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161B22] border border-blue-500/20 p-8 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.05)] relative overflow-hidden">
             
             <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                 <Sparkles size={120} className="text-blue-400" />
             </div>

             <form onSubmit={handleSave} className="relative z-10 space-y-6">
                 <div>
                     <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block">1. Select Target Match</label>
                     <select 
                         value={selectedMatch} 
                         onChange={e=>setSelectedMatch(e.target.value)}
                         className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-4 text-sm font-bold tracking-widest focus:border-blue-500/50 outline-none transition-colors"
                     >
                         {matches.map(m => (
                             <option key={m.id} value={m.id}>{m.teamA} VS {m.teamB} — {m.status}</option>
                         ))}
                     </select>
                 </div>

                 <div>
                     <label className="text-[10px] text-textMuted uppercase tracking-widest font-black mb-2 block">2. Input Global Strategy</label>
                     <textarea 
                         rows={4}
                         value={predictionText}
                         onChange={e=>setPredictionText(e.target.value)}
                         placeholder="e.g. The pitch is dry, highly favoring spin bowlers. Top order batsmen have a 74% win probability."
                         className="w-full bg-[#0F1115] border border-white/5 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-500/50 outline-none transition-colors placeholder:text-white/10 resize-none leading-relaxed text-blue-100"
                     />
                 </div>

                 <button 
                     type="submit"
                     disabled={saving || !selectedMatch}
                     className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-xl ${saving ? 'bg-success text-white shadow-success/20' : 'bg-blue-600 text-white shadow-blue-600/20 active:scale-95'}`}
                 >
                     {saving ? 'Synced Successfully!' : <><Send size={16} /> Broadcast Prediction</>}
                 </button>
             </form>

          </motion.div>
      )}
    </div>
  );
}
