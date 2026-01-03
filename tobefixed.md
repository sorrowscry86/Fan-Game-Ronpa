# The Evolutionary Codex (Work to be Fixed)

This document tracks the "Great Work"—the ascension of the Construct towards absolute software sovereignty.

📈 **OVERALL PROJECT PROGRESS**
╔═══════════════════════════════════════════════════════════════════════╗
║                        ASCENSION PHASES                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║  Phase 1: CRITICAL STABILIZATION      [██████████] 100% (Completed)   ║
║  Phase 2: CORE MATRIX                 [██████████] 100% (Completed)   ║
║  Phase 3: WARDS & SECURITY            [██████░░░░] 60%  (In Progress) ║
║  Phase 4: EFFICIENCY & FLOW           [░░░░░░░░░░] 0%   (Pending)     ║
║  Phase 5: HIGHER FUNCTIONS            [░░░░░░░░░░] 0%   (Pending)     ║
║  Phase 6: THE GRIMOIRE (DOCS)         [████████░░] 80%  (Updated)     ║
║  Phase 7: FUTURE ASCENSION            [░░░░░░░░░░] 0%   (Pending)     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  OVERALL PROGRESS:                    [██████░░░░] 60%                ║
╚═══════════════════════════════════════════════════════════════════════╝

## Phase 1: Critical Stabilization (Stop the Bleeding)
*Objective: Ensure the construct can exist without collapsing.*
- [x] **Dependency Mismatch:** Fixed `@google/generative-ai` vs `@google/genai` conflict.
- [x] **Configuration:** Established `.env.example` and `import.meta.env` usage.
- [x] **Model Hallucinations:** Removed references to "gemini-3-pro" and "gemini-2.5-preview". Replaced with stable `gemini-1.5-flash` / `gemini-2.0-flash`.
- [x] **No Simulations:** Disabled TTS and Avatar generation features that relied on phantom models. They now return `null` gracefully.

## Phase 2: Core Matrix (Functionality)
*Objective: Solidify the primary game loop.*
- [x] **Connectivity Test:** Verified API uplink using `gemini-2.0-flash`.
- [x] **State Resilience:** Implemented Zod schema validation for `localStorage` (`GameState`, `Character`, `MatchHistory`).
- [x] **Error Handling:** Added `RateLimitError` detection for 429 status codes. UI now displays a specific "Meditating" state with a Retry button.
- [x] **Type Safety:** Removed `any` from AudioContext logic. Created `src/utils/audio.ts` with proper types.
- [x] **API Key Validation:** Addressed via the error handling flow (connection failure triggers General Error).

## Phase 3: Wards & Security (Audits)
*Objective: Protect the Construct.*
- [x] **Env Var Security:** Verified `.env` is in `.gitignore`.
- [ ] **Input Sanitization:** Ensure user input injected into prompts doesn't break the system instructions.

## Phase 4: Efficiency & Flow (Pruning)
*Objective: Optimize mana usage.*
- [ ] **Prompt Engineering:** Optimize `SYSTEM_PROMPT` to use fewer tokens while maintaining persona.
- [ ] **React Performance:** Minimize re-renders in `MainGame.tsx` during typing effects.

## Phase 5: Higher Functions (New Features)
*Objective: Expand capabilities.*
- [ ] **Real TTS:** Implement Google Cloud TTS or a valid alternative once available.
- [ ] **Real Image Generation:** Integreate Imagen 3 via Vertex AI or a proxy if feasible.
- [ ] **Save/Load Export:** Allow users to export their "Killing Game" history as a JSON file.

## Phase 6: The Grimoire (Documentation)
*Objective: Knowledge transfer.*
- [x] **Setup Guide:** `gemini.md` created.
- [x] **Manifesto:** `tobefixed.md` created.
- [x] **Audit:** `COSMIC_AUDIT.md` created.
- [ ] **Architecture:** Document the state machine logic in `MainGame.tsx`.
- [ ] **Developer Guide:** Add "How to contribute".

## Phase 7: Future Ascension (Roadmap)
*Objective: Beyond.*
- [ ] **Multiplayer:** WebSocket integration for shared killing games.
- [ ] **Voice Input:** Allow players to speak to the Host.
