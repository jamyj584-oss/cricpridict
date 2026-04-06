import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { UserTeam, Prediction } from "@/types";

/**
 * Portable Scoring Engine core logic. 
 * Designed to easily move to a Firebase Cloud Function.
 */
export async function calculateMatchResults(matchId: string) {
  try {
    // 1. Fetch Actual Game Data. 
    // In actual production, admin inputs raw end-game stats into a `match_stats` collection.
    // For this engine, we'll fetch mock actuals or read from a `matches/${matchId}/actuals` doc.
    // Mocking actual actualStats for demonstration:
    const mockActuals: Record<string, number> = {
       "player_id_1": 65, // Points scored in real life
       "player_id_2": 30, // ...
    };
    
    // Prediction Actuals mapping
    const mockPredictionActuals: Record<string, Record<string, number>> = {
       "most6": { "player_id_1": 3, "player_id_2": 1 },
       // ...
    };

    const batch = writeBatch(db);

    // --- A. PROCESS TEAM SCORING ---
    const teamsQuery = query(collection(db, "teams"), where("matchId", "==", matchId));
    const teamsSnap = await getDocs(teamsQuery);
    
    const teamStandings: { docId: string, total: number, userId: string }[] = [];

    teamsSnap.forEach((docSnap) => {
        const team = docSnap.data() as UserTeam;
        let total = 0;

        team.players.forEach(playerId => {
            let pts = mockActuals[playerId] || 15; // default 15 for untracked players just for testing
            if (playerId === team.captainId) pts *= 2.0;
            else if (playerId === team.viceCaptainId) pts *= 1.5;
            total += pts;
        });

        teamStandings.push({ docId: docSnap.id, total, userId: team.userId });
    });

    // --- B. PROCESS PREDICTION SCORING ---
    const predQuery = query(collection(db, "predictions"), where("matchId", "==", matchId));
    const predSnap = await getDocs(predQuery);

    const predictionStandings: Record<string, number> = {}; // userId -> prediction points

    predSnap.forEach((docSnap) => {
        const pred = docSnap.data() as Prediction;
        let predPoints = 0;

        const actualCatData = mockPredictionActuals[pred.category] || {};
        
        for (const [playerId, predictedValue] of Object.entries(pred.playerPredictions)) {
            const actualValue = actualCatData[playerId] || 0; // if 0 in real life
            
            if (predictedValue === actualValue) {
                predPoints += 10; // Exact Match
            } else if (Math.abs(predictedValue - actualValue) === 1) {
                predPoints += 5; // Off by 1
            }
            // else 0 points
        }
        
        predictionStandings[pred.userId] = (predictionStandings[pred.userId] || 0) + predPoints;
    });

    // --- C. AGGREGATE LEADERBOARD & BATCH WRITES ---
    // Combine Team Points + Prediction Points per user
    const finalLeaderboard = teamStandings.map(t => {
       const pPts = predictionStandings[t.userId] || 0;
       return {
           userId: t.userId,
           teamDocId: t.docId,
           teamPoints: t.total,
           predictionPoints: pPts,
           grandTotal: t.total + pPts
       }
    });

    // Sort to determine Rank
    finalLeaderboard.sort((a,b) => b.grandTotal - a.grandTotal);

    // Prepare Batches
    finalLeaderboard.forEach((entry, index) => {
       const rank = index + 1;
       
       // Update Team doc with total
       const teamRef = doc(db, "teams", entry.teamDocId);
       batch.update(teamRef, { totalPoints: entry.teamPoints });

       // Push to Leaderboard Collection
       const lbRef = doc(collection(db, "leaderboard"));
       batch.set(lbRef, {
           matchId: matchId,
           userId: entry.userId,
           points: entry.grandTotal,
           rank: rank
       });
    });

    // We also set the match status to Completed
    const matchRef = doc(db, "matches", matchId);
    batch.update(matchRef, { status: "Completed" });

    // Commit all operations atomically
    await batch.commit();

    return { success: true, processedUsers: finalLeaderboard.length };

  } catch (err) {
      console.error("Scoring Engine Error:", err);
      throw err;
  }
}
