<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mbymbgkEdl5wSmc7g6p7UU839mLbo2jq

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Potential Feature Ideas
- Inline validation when adding contestants (missing name/description guardrails).
- Session toggle to opt out of remote avatar generation.
- Lazy-loaded gallery thumbnails and richer save-slot metadata (phase, survivors, last turn).
- Support for custom avatar uploads with simple client-side validation.
- “Resume last session” quick action powered by the autosaved state.
