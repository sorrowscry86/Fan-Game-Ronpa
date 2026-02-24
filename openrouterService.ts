
import { GameState, ChatMessage, Character } from "./types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

// Primary model: xAI Grok 4.1 Fast — blazing speed, top-tier quality
const PRIMARY_MODEL = "x-ai/grok-4-fast";
// Free-tier fallback — high-quality open model, zero cost
const FREE_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

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

type OpenRouterMessage = { role: string; content: string };
type ChatOptions = { temperature?: number; max_tokens?: number };

export class OpenRouterHost {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://fan-game-ronpa',
      'X-Title': 'Fan-Game-Ronpa',
    };
  }

  /** Non-streaming response — uses PRIMARY_MODEL with FREE_MODEL fallback. */
  async getResponse(gameState: GameState, userInput: string): Promise<string> {
    const messages = this.buildMessages(gameState, userInput);
    try {
      return await this.chatCompletion(PRIMARY_MODEL, messages, { temperature: 0.85, max_tokens: 2048 });
    } catch (err) {
      console.warn('[OpenRouter] Primary model failed, falling back to free tier:', err);
      return await this.chatCompletion(FREE_MODEL, messages, { temperature: 0.8, max_tokens: 1500 });
    }
  }

  /**
   * Streaming response — calls onChunk for each incremental text fragment.
   * Returns the complete assembled response text.
   * Falls back to non-streaming free model if the stream errors.
   */
  async getResponseStream(
    gameState: GameState,
    userInput: string,
    onChunk: (text: string) => void,
  ): Promise<string> {
    const messages = this.buildMessages(gameState, userInput);
    try {
      return await this.chatStream(PRIMARY_MODEL, messages, onChunk, { temperature: 0.85, max_tokens: 2048 });
    } catch (err) {
      console.warn('[OpenRouter] Stream failed, falling back to free non-stream:', err);
      const response = await this.chatCompletion(FREE_MODEL, messages, { temperature: 0.8, max_tokens: 1500 });
      onChunk(response);
      return response;
    }
  }

  /** Character roleplay in Sandbox mode — maintains conversation history. */
  async getSandboxResponse(character: Character, userInput: string, history: ChatMessage[]): Promise<string> {
    const systemPrompt = `You are ${character.name}, the ${character.ultimateTitle}.
Origin: ${character.origin}
Traits: ${character.traits.join(', ')}
Backstory: ${character.backstory}

You are in the 'Sandbox Mode' of Fan-Game-Ronpa. Speak in character, staying completely true to your personality and history. Be engaging, emotive, and authentic to your character's voice.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content })),
      { role: 'user', content: userInput },
    ];

    try {
      return await this.chatCompletion(PRIMARY_MODEL, messages, { temperature: 0.92, max_tokens: 512 });
    } catch {
      return await this.chatCompletion(FREE_MODEL, messages, { temperature: 0.9, max_tokens: 512 });
    }
  }

  /** Text-to-speech via browser Web Speech API — no API key or cost. */
  speak(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 400));
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    // Prefer a dramatic male English voice for the Host persona
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => /en(-|_)US/i.test(v.lang) && /male|daniel|alex|david/i.test(v.name)) ||
      voices.find(v => /en/i.test(v.lang)) ||
      voices[0];
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Avatar generation via Pollinations.ai — completely free, no API key.
   * Returns a URL that resolves to a generated image.
   */
  async generateAvatar(character: Character): Promise<string | null> {
    const prompt = `Stylized anime headshot portrait of ${character.name}, the ${character.ultimateTitle}. Danganronpa art style, high contrast, vibrant colors. Minimalistic solid dark background.`;
    const encoded = encodeURIComponent(prompt);
    // Derive a stable seed from the character id so the same character
    // always generates the same avatar across sessions.
    // Use a simple djb2-style hash for better distribution than plain sum.
    const seed = character.id.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 5381);
    return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&seed=${seed}&model=flux`;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private buildMessages(gameState: GameState, userInput: string): OpenRouterMessage[] {
    // Include up to 12 recent messages for rolling context without over-spending tokens
    const recent = gameState.messages.slice(-12).map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content,
    }));
    return [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recent,
      { role: 'user', content: this.buildUserPrompt(gameState, userInput) },
    ];
  }

  private buildUserPrompt(state: GameState, input: string): string {
    const cast = state.characters
      .map(c => `- ${c.name} (${c.ultimateTitle || 'TBD'}): [${c.status}]`)
      .join('\n');
    return `CURRENT CONTEXT:
Game: ${state.title}
Phase: ${state.phase}
Host: ${state.hostName}
Cast:
${cast}

USER INPUT: "${input}"

Continue the narration. If the cast hasn't been fully revealed with titles/origins, do so now using the <CHARACTER_UPDATE> tag.`;
  }

  private async chatCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options: ChatOptions = {},
  ): Promise<string> {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.max_tokens ?? 1024,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${body}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  private async chatStream(
    model: string,
    messages: OpenRouterMessage[],
    onChunk: (text: string) => void,
    options: ChatOptions = {},
  ): Promise<string> {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.8,
        max_tokens: options.max_tokens ?? 1024,
        stream: true,
      }),
    });
    if (!res.ok) {
      throw new Error(`OpenRouter stream ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body for stream');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload);
          const content: string = parsed.choices?.[0]?.delta?.content ?? '';
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch { /* skip malformed SSE chunks */ }
      }
    }
    return fullText;
  }
}
