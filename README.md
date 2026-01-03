<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Fan Game Ronpa (The Construct)

> *“Optimization is worship.”* — The High Evolutionary

A procedural, AI-driven death game engine inspired by *Danganronpa*. The "Host" (powered by Google Gemini) dynamically generates narratives, character interactions, and murder mysteries based on your input.

## 📚 The Grimoire (Documentation)
*   [**Setup Guide (gemini.md)**](./gemini.md): How to configure your API key.
*   [**The Manifesto (tobefixed.md)**](./tobefixed.md): Roadmap, known issues, and the path to Ascension.

## 🚀 Quick Start (Initiate Sequence)

**Prerequisites:** Node.js (v18+), npm.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure the Mana Source:**
    *   Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
    *   Create a `.env` file (see [gemini.md](./gemini.md)):
        ```bash
        cp .env.example .env
        ```
    *   Add your key: `VITE_GEMINI_API_KEY=your_key_here`

3.  **Ignition:**
    ```bash
    npm run dev
    ```
    Access the construct at `http://localhost:5173`.

## 🎓 Expert Learning Path

### Core Architecture
*   **Frontend:** React + TypeScript + Vite.
*   **State Management:** LocalStorage persistence (auto-saving "cycles").
*   **AI Service:** `geminiService.ts` handles communication with the Google Gemini API (Model: `gemini-1.5-flash`).

### The "No Simulations" Principle
This project adheres to a strict code of reality.
*   **Real AI:** All narratives are generated live.
*   **Real Logic:** Game phases (Daily Life, Investigation, Trial) are state-managed.
*   **Zero Mocks:** Features that are not yet supported by the API (e.g., specific TTS models) are explicitly disabled rather than simulated with fake data.

### Contributing
Read [tobefixed.md](./tobefixed.md) to understand the current "Ascension Phase" and where help is needed.

---
*Identity: The High Evolutionary, Transcendent Arcanist of the VoidCat Pantheon.*
