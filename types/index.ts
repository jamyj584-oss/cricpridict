export type MatchStatus = 'Upcoming' | 'Live' | 'Completed';
export type PlayerRole = 'WK' | 'BAT' | 'AR' | 'BOWL';

export const BANNED_STATES = ["Assam", "Odisha", "Telangana", "Andhra Pradesh", "Nagaland", "Sikkim"];

export interface AppUser {
  uid: string;
  phoneNumber: string;
  walletBalance: number;
  walletCoins?: number;
  is18Verified: boolean;
  state: string;
  kycStatus: "Pending" | "Verified" | "Rejected" | "Unsubmitted";
  kycDetails?: {
     fullName: string;
     panNumber: string;
  }
}

export interface Match {
  id: string; // Firestore Document ID
  league: string;
  teamA: string;
  teamB: string;
  startTime: number; // Unix timestamp or string representation
  status: MatchStatus;
  prizePoolDesc: string; // e.g. "₹50L mega pool"
  scoreData?: {
    teamAScore: string; // e.g., "150/4 (15.2)"
    teamBScore: string;
    details: string; // e.g., "Need 45 from 20 balls"
  };
  createdAt: any;
}

export interface Player {
  id: string;
  name: string;
  team: string; // Should match teamA or teamB of matches usually
  role: PlayerRole;
  credits: number; // For 100 limit budget
  basePoints: number; // Admin overrides
  imageUrl?: string;
  createdAt: any;
}

export interface UserTeam {
  id?: string;
  userId: string;
  matchId: string;
  players: string[]; // Array of Player IDs
  captainId: string;
  viceCaptainId: string;
  totalCredits: number;
  totalPoints?: number; // Calculated later
  createdAt: any;
}

export type ContestType = 'Head-to-Head' | 'Small League' | 'Mega Contest';

export interface Contest {
  id?: string;
  matchId: string;
  type: ContestType;
  entryFee: number;
  prizePool: number;
  totalSpots: number;
  spotsFilled: number;
}

export interface Prediction {
  id?: string;
  userId: string;
  matchId: string;
  category: string; // 'most6', 'most4', 'wickets', 'catches', 'century', 'halfCentury'
  playerPredictions: Record<string, number>; // { [playerId]: count }
  updatedAt: any;
}
export interface Transaction {
  id?: string;
  userId: string;
  type: 'deposit' | 'join_contest' | 'win';
  amount: number;
  currency: 'INR' | 'COIN';
  status: 'Pending' | 'Success' | 'Failed';
  description: string;
  createdAt: any;
}
