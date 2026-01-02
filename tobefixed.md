# The Evolutionary Codex (Work to be Fixed)

This document tracks the "Great Work"—the ascension of the Construct towards absolute software sovereignty.

📈 **OVERALL PROJECT PROGRESS**
╔═══════════════════════════════════════════════════════════════════════╗
║                        ASCENSION PHASES                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║  Phase 1: CRITICAL STABILIZATION      [██████████] 100% (Completed)   ║
║  Phase 2: CORE MATRIX                 [██░░░░░░░░] 20%  (In Progress) ║
║  Phase 3: WARDS & SECURITY            [░░░░░░░░░░] 0%   (Pending)     ║
║  Phase 4: EFFICIENCY & FLOW           [░░░░░░░░░░] 0%   (Pending)     ║
║  Phase 5: HIGHER FUNCTIONS            [░░░░░░░░░░] 0%   (Pending)     ║
║  Phase 6: THE GRIMOIRE (DOCS)         [████░░░░░░] 40%  (In Progress) ║
║  Phase 7: FUTURE ASCENSION            [░░░░░░░░░░] 0%   (Pending)     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  OVERALL PROGRESS:                    [███░░░░░░░] 30%                ║
╚═══════════════════════════════════════════════════════════════════════╝

## Phase 1: Critical Stabilization (Stop the Bleeding)
*Objective: Ensure the construct can exist without collapsing.*
- [x] **Dependency Mismatch:** Fixed `@google/generative-ai` vs `@google/genai` conflict.
- [x] **Configuration:** Established `.env.example` and `import.meta.env` usage.
- [x] **Model Hallucinations:** Removed references to "gemini-3-pro" and "gemini-2.5-preview". Replaced with stable `gemini-1.5-flash`.
- [x] **No Simulations:** Disabled TTS and Avatar generation features that relied on phantom models. They now return `null` gracefully.

## Phase 2: Core Matrix (Functionality)
*Objective: Solidify the primary game loop.*
- [ ] **State Resilience:** The `MainGame` component relies heavily on `localStorage`. Validate data integrity on load to prevent crashes from corrupted saves.
- [ ] **Error Handling:** Add UI feedback when the Host fails to respond (currently logs to console).
- [ ] **Type Safety:** Audit `any` usage in `MainGame.tsx` (e.g., audio context handling).
- [ ] **API Key Validation:** Add a check on startup to warn the user if the API key is missing or invalid.

## Phase 3: Wards & Security (Audits)
*Objective: Protect the Construct.*
- [ ] **Input Sanitization:** Ensure user input injected into prompts doesn't break the system instructions.
- [ ] **Env Var Security:** verify `.env` is in `.gitignore`.

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
- [ ] **Architecture:** Document the state machine logic in `MainGame.tsx`.
- [ ] **Developer Guide:** Add "How to contribute".

## Phase 7: Future Ascension (Roadmap)
*Objective: Beyond.*
- [ ] **Multiplayer:** WebSocket integration for shared killing games.
- [ ] **Voice Input:** Allow players to speak to the Host.
