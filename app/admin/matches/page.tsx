"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Match, MatchStatus } from "@/types";
import { calculateMatchResults } from "@/lib/scoring";

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // New Match Form
  const [league, setLeague] = useState("Imperial League");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [prizePool, setPrizePool] = useState("₹10L");
  const [timeStr, setTimeStr] = useState("");

  // Live Score Updates (Local State Mapping via Match ID)
  const [scoreInputs, setScoreInputs] = useState<Record<string, { a: string, b: string, details: string }>>({});

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Match[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() } as Match));
      setMatches(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !timeStr) return;

    try {
      await addDoc(collection(db, "matches"), {
        league,
        teamA,
        teamB,
        startTime: new Date(timeStr).getTime(),
        status: "Upcoming",
        prizePoolDesc: prizePool,
        createdAt: serverTimestamp()
      });
      // Clear form
      setTeamA(""); setTeamB(""); setTimeStr("");
    } catch (err) {
      console.error(err);
      alert("Failed to add match");
    }
  };

  const handleUpdateStatus = async (matchId: string, newStatus: MatchStatus) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { status: newStatus });
    } catch (err) { console.error(err); }
  };

  const handleUpdateScore = async (matchId: string) => {
    const scores = scoreInputs[matchId];
    if (!scores) return;
    try {
      await updateDoc(doc(db, "matches", matchId), {
        scoreData: {
          teamAScore: scores.a || "",
          teamBScore: scores.b || "",
          details: scores.details || ""
        }
      });
      alert("Score updated!");
    } catch (err) { console.error(err); }
  };

  const handleCalculateScore = async (matchId: string) => {
    if(!confirm("Warning: This locks the match and processes ALL user scores into the Leaderboard. Proceed?")) return;
    try {
      await calculateMatchResults(matchId);
      alert("Scoring Engine finished processing! Leaderboards generated.");
    } catch (e) {
      alert("Error occurred during batch calculation. Check console.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Matches</h1>

      {/* Add New Match Form */}
      <div className="glass-card p-6 mb-8 border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-accent">Create New Match</h2>
        <form onSubmit={handleAddMatch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-textMuted mb-1 block">League</label>
            <input type="text" value={league} onChange={e=>setLeague(e.target.value)} className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1 block">Team A</label>
            <input type="text" value={teamA} onChange={e=>setTeamA(e.target.value)} required className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" placeholder="e.g. Mumbai"/>
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1 block">Team B</label>
            <input type="text" value={teamB} onChange={e=>setTeamB(e.target.value)} required className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" placeholder="e.g. Chennai"/>
          </div>
          <div>
            <label className="text-xs text-textMuted mb-1 block">Date/Time</label>
            <input type="datetime-local" value={timeStr} onChange={e=>setTimeStr(e.target.value)} required className="w-full bg-primary/50 border border-white/10 rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-accent text-primary font-bold py-2 px-4 rounded hover:bg-accent/90">
            Add Match
          </button>
        </form>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {loading ? <p>Loading matches...</p> : matches.map(match => (
          <div key={match.id} className="glass-card p-4 border border-white/10 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
            
            <div className="flex-1">
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${match.status === 'Live' ? 'bg-danger/20 text-danger' : match.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-white/10'}`}>
                {match.status}
              </span>
              <p className="font-bold text-lg mt-2">{match.teamA} vs {match.teamB}</p>
              <p className="text-xs text-textMuted">{new Date(match.startTime).toLocaleString()} • {match.league}</p>
            </div>

            {/* Status Toggles */}
            <div className="flex gap-2">
              <button onClick={() => handleUpdateStatus(match.id, 'Upcoming')} className={`text-xs px-3 py-1 rounded border ${match.status === 'Upcoming' ? 'border-accent text-accent' : 'border-white/10 text-textMuted'}`}>Upcoming</button>
              <button onClick={() => handleUpdateStatus(match.id, 'Live')} className={`text-xs px-3 py-1 rounded border ${match.status === 'Live' ? 'border-danger text-danger' : 'border-white/10 text-textMuted'}`}>Live</button>
              <button onClick={() => handleUpdateStatus(match.id, 'Completed')} className={`text-xs px-3 py-1 rounded border ${match.status === 'Completed' ? 'border-success text-success' : 'border-white/10 text-textMuted'}`}>Completed</button>
            </div>

            {/* Calculate Trigger */}
            {match.status === "Live" && (
                <button onClick={() => handleCalculateScore(match.id)} className="bg-gradient-to-r from-accent to-blue-500 text-white text-xs font-bold px-4 py-2 rounded shadow-lg shadow-accent/20 transition-transform hover:scale-105">
                   Calculate Results
                </button>
            )}

            {/* Live Score Updater */}
            {match.status === "Live" && (
              <div className="flex flex-col gap-2 bg-primary/50 p-2 rounded">
                <div className="flex gap-2">
                   <input 
                     placeholder={`${match.teamA} Score`} 
                     className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs w-24" 
                     value={scoreInputs[match.id]?.a ?? match.scoreData?.teamAScore ?? ""}
                     onChange={(e) => setScoreInputs(prev => ({...prev, [match.id]: {...prev[match.id], a: e.target.value}}))}
                   />
                   <input 
                     placeholder={`${match.teamB} Score`} 
                     className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs w-24" 
                     value={scoreInputs[match.id]?.b ?? match.scoreData?.teamBScore ?? ""}
                     onChange={(e) => setScoreInputs(prev => ({...prev, [match.id]: {...prev[match.id], b: e.target.value}}))}
                   />
                </div>
                <div className="flex gap-2">
                   <input 
                     placeholder="Details (e.g. Need 45 runs...)" 
                     className="bg-transparent border border-white/20 rounded px-2 py-1 text-xs flex-1" 
                     value={scoreInputs[match.id]?.details ?? match.scoreData?.details ?? ""}
                     onChange={(e) => setScoreInputs(prev => ({...prev, [match.id]: {...prev[match.id], details: e.target.value}}))}
                   />
                   <button onClick={() => handleUpdateScore(match.id)} className="bg-danger text-white text-xs px-2 rounded font-bold hover:bg-danger/80">Save</button>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
