import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, AppUser } from '@/types';

interface UserState {
  user: AppUser | null;
  hasAcceptedDisclaimer: boolean;
  setUser: (user: AppUser | null) => void;
  setHasAcceptedDisclaimer: (val: boolean) => void;
}

interface TeamCreationState {
  availablePlayers: Player[]; // All players for this match
  selectedPlayers: Player[];
  creditsLeft: number;
  captainId: string | null;
  viceCaptainId: string | null;
  
  setAvailablePlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => boolean; // Returns true if success, false if rejected
  removePlayer: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  autoCreateTeam: () => void; // AI Feature
  resetTeam: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      hasAcceptedDisclaimer: false,
      setUser: (user) => set({ user }),
      setHasAcceptedDisclaimer: (val) => set({ hasAcceptedDisclaimer: val }),
    }),
    {
      name: 'user-storage',
    }
  )
);

export const useTeamStore = create<TeamCreationState>()(
  persist(
    (set, get) => ({
      availablePlayers: [],
      selectedPlayers: [],
      creditsLeft: 100,
      captainId: null,
      viceCaptainId: null,

      setAvailablePlayers: (players) => set({ availablePlayers: players }),
      
      addPlayer: (player) => {
        const state = get();
    if (state.selectedPlayers.length >= 11) return false;
    if (state.creditsLeft < player.credits) return false;
    
    // Max 7 per team check
    const teamCount = state.selectedPlayers.filter(p => p.team === player.team).length;
    if (teamCount >= 7) return false;
    
    // Prevent duplicate
    if (state.selectedPlayers.some(p => p.id === player.id)) return false;

    set({
      selectedPlayers: [...state.selectedPlayers, player],
      creditsLeft: state.creditsLeft - player.credits,
    });
    return true;
  },

  removePlayer: (playerId) => {
    const state = get();
    const playerToRemove = state.selectedPlayers.find((p) => p.id === playerId);
    if (!playerToRemove) return;
    
    set({
      selectedPlayers: state.selectedPlayers.filter((p) => p.id !== playerId),
      creditsLeft: state.creditsLeft + playerToRemove.credits,
      captainId: state.captainId === playerId ? null : state.captainId,
      viceCaptainId: state.viceCaptainId === playerId ? null : state.viceCaptainId,
    });
  },

  setCaptain: (playerId) => set({ captainId: playerId }),
  setViceCaptain: (playerId) => set({ viceCaptainId: playerId }),

      autoCreateTeam: () => {
        const state = get();
        let remainingBudget = 100;
        const aiSelected: Player[] = [];
        
        const sortedPlayers = [...state.availablePlayers].sort((a, b) => b.basePoints - a.basePoints);
        
        for (const p of sortedPlayers) {
          if (aiSelected.length >= 11) break;
          const teamCount = aiSelected.filter(ap => ap.team === p.team).length;
          if (teamCount >= 7) continue; 
          
          if (remainingBudget >= p.credits) {
            aiSelected.push(p);
            remainingBudget -= p.credits;
          }
        }
        
        set({
          selectedPlayers: aiSelected,
          creditsLeft: remainingBudget,
          captainId: aiSelected[0]?.id || null, 
          viceCaptainId: aiSelected[1]?.id || null,
        });
      },

      resetTeam: () => set({ selectedPlayers: [], creditsLeft: 100, captainId: null, viceCaptainId: null }),
    }),
    {
      name: 'team-creation-storage',
    }
  )
);
