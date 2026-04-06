import { db } from "./firebase";
import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";

/**
 * Atomic transaction to join a contest.
 * 1. Verifies user balance.
 * 2. Checks contest availability.
 * 3. Deducts balance.
 * 4. Increments spotsFilled.
 * 5. Creates participant record.
 */
export async function joinContest(
  userId: string, 
  matchId: string, 
  contestId: string, 
  teamId: string,
  entryFee: number
) {
  const userRef = doc(db, "users", userId);
  const contestRef = doc(db, "contests", contestId);
  const participationId = `${userId}_${contestId}`;
  const participantRef = doc(db, "contest_participants", participationId);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Get User Data
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("User not found");
      const userData = userSnap.data();
      
      if (userData.walletBalance < entryFee) {
        throw new Error("Insufficient balance");
      }

      // 2. Get Contest Data
      const contestSnap = await transaction.get(contestRef);
      if (!contestSnap.exists()) throw new Error("Contest not found");
      const contestData = contestSnap.data();

      if (contestData.spotsFilled >= contestData.totalSpots) {
        throw new Error("Contest is full");
      }

      // 3. Check if already joined (Atomic check via participation ID)
      const participantSnap = await transaction.get(participantRef);
      if (participantSnap.exists()) {
        throw new Error("Already joined this contest");
      }

      // 4. Check if Match is Live (Extra security)
      const matchRef = doc(db, "matches", matchId);
      const matchSnap = await transaction.get(matchRef);
      if (matchSnap.exists() && matchSnap.data().status === 'Live') {
        throw new Error("Match has already started. Cannot join now.");
      }

      // 5. Deduct Balance & Update Stats
      transaction.update(userRef, {
        walletBalance: (userData.walletBalance || 0) - entryFee,
        joinedContests: (userData.joinedContests || 0) + 1
      });

      // 6. Update Contest Spots
      transaction.update(contestRef, {
        spotsFilled: (contestData.spotsFilled || 0) + 1
      });

      // 7. Create Participation Record
      transaction.set(participantRef, {
        userId,
        matchId,
        contestId,
        teamId,
        entryFee,
        joinedAt: serverTimestamp()
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error("Join Contest Error:", error);
    return { success: false, error: error.message };
  }
}
