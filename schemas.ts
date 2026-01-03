
import { z } from 'zod';
import { GamePhase, GameMode } from './types';

// Character Schema
export const MatchHistorySchema = z.object({
  gameTitle: z.string(),
  outcome: z.enum(['SURVIVOR', 'VICTIM', 'CULPRIT', 'MASTERMIND', 'UNKNOWN']),
  details: z.string()
});

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  ultimateTitle: z.string().optional(),
  origin: z.string(),
  traits: z.array(z.string()),
  backstory: z.string(),
  description: z.string(),
  status: z.enum(['ALIVE', 'DEAD', 'EXECUTED']),
  avatarUrl: z.string().optional(),
  isPlayer: z.boolean().optional(),
  history: z.array(MatchHistorySchema).optional()
});

export const EvidenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string()
});

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  timestamp: z.number().optional()
});

// Game State Schema
export const GameStateSchema = z.object({
  id: z.string(),
  title: z.string(),
  isLocked: z.boolean(),
  phase: z.nativeEnum(GamePhase),
  mode: z.nativeEnum(GameMode),
  theme: z.string(),
  hostName: z.string(),
  restrictions: z.string(),
  characters: z.array(CharacterSchema),
  evidence: z.array(EvidenceSchema),
  messages: z.array(ChatMessageSchema),
  turnCount: z.number()
});

export const SaveSlotSchema = z.object({
  id: z.string(),
  title: z.string(),
  lastPlayed: z.number(),
  state: GameStateSchema
});

export const SaveSlotsMapSchema = z.record(z.string(), SaveSlotSchema);
