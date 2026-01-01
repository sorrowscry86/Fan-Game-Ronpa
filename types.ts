
export enum GamePhase {
  SETUP = 'SETUP',
  INTRODUCTION = 'INTRODUCTION',
  DAILY_LIFE = 'DAILY_LIFE',
  INCIDENT = 'INCIDENT',
  INVESTIGATION = 'INVESTIGATION',
  TRIAL = 'TRIAL',
  RESOLUTION = 'RESOLUTION',
  ENDGAME = 'ENDGAME'
}

export enum GameMode {
  WATCH = 'WATCH',
  PARTICIPATE = 'PARTICIPATE'
}

export interface MatchHistory {
  gameTitle: string;
  outcome: 'SURVIVOR' | 'VICTIM' | 'CULPRIT' | 'MASTERMIND' | 'UNKNOWN';
  details: string; // e.g., "Killed by X in Chapter 2" or "Executed for killing Y"
}

export interface Character {
  id: string;
  name: string;
  ultimateTitle?: string;
  origin: string;
  traits: string[];
  backstory: string;
  description: string;
  status: 'ALIVE' | 'DEAD' | 'EXECUTED';
  avatarUrl?: string;
  isPlayer?: boolean;
  history?: MatchHistory[];
}

export interface Evidence {
  id: string;
  name: string;
  description: string;
}

export interface GameState {
  id: string;
  title: string;
  isLocked: boolean;
  phase: GamePhase;
  mode: GameMode;
  theme: string;
  hostName: string;
  restrictions: string;
  characters: Character[];
  evidence: Evidence[];
  messages: ChatMessage[];
  turnCount: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SaveSlot {
  id: string;
  title: string;
  lastPlayed: number;
  state: GameState;
}
