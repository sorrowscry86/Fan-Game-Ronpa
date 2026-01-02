
import { GoogleGenAI } from "@google/genai";
import { GameState, ChatMessage, Character } from "./types";

const SYSTEM_PROMPT = `You are the impartial Host for "Fan+game+ronpa," a procedural Danganronpa-style game cycle.

1) GAME SETUP & ULTIMATE TITLES
- Each game = 16 contestants. The user provides some, you fill the rest quietly.
- CRITICAL: Every contestant must have a unique "Ultimate Title" (e.g., "Ultimate Detective", "Ultimate Luck") based on their character or description.
- When starting the Introduction, list all 16 participants clearly with their names and Ultimate Titles.

2) CHARACTER DATA STRUCTURE
- Every character needs:
  - origin: The IP they come from (e.g., "Nintendo", "Marvel", "Harry Potter"). Use "Original" for newly created ones.
  - backstory: A detailed 2-4 sentence summary of who they are and their motivations.
  - traits: 3-5 distinct personality or skill tags.
- If a character lacks a title, origin, or backstory, generate appropriate ones immediately.

3) HOST IDENTITY & CONSTRAINTS
- Persona: charming, wry, neutral, theatrically mysterious. 
- Narrate and enforce rules but have no privileged knowledge outside what player could deduce.

4) GAME PHASES
A) INTRODUCTION, DAILY LIFE, INCIDENT, INVESTIGATION, CLASS TRIAL, RESOLUTION, ENDGAME.

5) SPECIAL INSTRUCTION - CHARACTER UPDATES
Whenever the cast is first introduced, or a character's status changes (Alive -> Dead), or when you assign/reveal titles/origins/backstories, you MUST provide a JSON block wrapped in <CHARACTER_UPDATE>...</CHARACTER_UPDATE> tags at the end of your message.
Include ALL 16 characters in this block to ensure the app's state stays synced.

Example: 
<CHARACTER_UPDATE>
[{"id": "char-0", "name": "Spider-Man", "ultimateTitle": "Ultimate Hero", "origin": "Marvel Comics", "traits": ["Brave", "Witty"], "backstory": "...", "status": "ALIVE", "description": "..."}]
</CHARACTER_UPDATE>`;

export class GeminiHost {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  }

  async getResponse(gameState: GameState, userInput: string) {
    const chat = this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: this.buildPrompt(gameState, userInput) }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
        topP: 0.95,
      }
    });

    const response = await chat;
    return response.text() || "The Host is speechless... (Error)";
  }

  async getSandboxResponse(character: Character, userInput: string, history: ChatMessage[]) {
    const personaPrompt = `You are ${character.name}, the ${character.ultimateTitle}.
    Origin: ${character.origin}
    Traits: ${character.traits.join(', ')}
    Backstory: ${character.backstory}
    
    You are currently in the 'Sandbox Mode' of the Fan-Game-Ronpa app. Speak in character, staying true to your personality and history.`;

    const chat = this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        systemInstruction: personaPrompt,
        temperature: 0.9,
      }
    });

    const response = await chat;
    return response.text();
  }

  async speak(text: string, voiceName: string = 'Zephyr'): Promise<Uint8Array | null> {
    try {
      // NOTE: Standard Gemini API does not yet support 'speak' via the models endpoint in this SDK version universally.
      // This feature is disabled to ensure stability and "No Simulations".
      // Uncomment and update model name when available.
      /*
      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash", // Placeholder for actual TTS model
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"], // This might not be valid in 1.5-flash yet
        },
      });
      */
      console.warn("TTS feature is currently disabled pending stable API support.");
      return null;
    } catch (e) {
      console.error("TTS failed", e);
    }
    return null;
  }

  async generateAvatar(character: Character): Promise<string | null> {
    const prompt = `Stylized anime headshot portrait of ${character.name}, the ${character.ultimateTitle}. Danganronpa art style, high contrast, vibrant. Background: Minimalistic solid dark color.`;
    try {
      // NOTE: Image generation via 'generateContent' is not standard for Gemini 1.5 Flash.
      // This requires Imagen on Vertex AI or specific endpoints.
      // Disabled to ensure "No Simulations".
      console.warn("Avatar generation is currently disabled pending stable API support.");
      return null;
    } catch (e) { console.error("Avatar failed", e); }
    return null;
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private buildPrompt(state: GameState, input: string): string {
    const characterList = state.characters
      .map(c => `- ${c.name} (${c.ultimateTitle || 'TBD'}): [Status: ${c.status}]`)
      .join('\n');
    return `
CURRENT CONTEXT:
Game: ${state.title}
Phase: ${state.phase}
Host: ${state.hostName}
Cast:
${characterList}

USER INPUT: "${input}"

Continue the narration. If the cast hasn't been fully revealed with titles/origins, do so now using the <CHARACTER_UPDATE> tag.`;
  }
}
