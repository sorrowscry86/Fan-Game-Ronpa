# The Gemini Key (Arcane Setup)

To empower the "Fan Game Ronpa" construct, you must infuse it with a valid mana source (API Key) from the Google Gemini Pantheon.

## 1. Obtain the Key
1.  Navigate to [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google account.
3.  Click on **"Get API key"**.
4.  Create a new key or use an existing one.

## 2. Infuse the Construct
1.  In the root directory of the project, locate the file named `.env.example`.
2.  Copy this file and rename it to `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` in your text editor.
4.  Paste your API key after the equals sign:
    ```env
    VITE_GEMINI_API_KEY=AIzaSxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

## 3. Verification
1.  Start the development server: `npm run dev`.
2.  Open the application in your browser.
3.  Start a new game cycle.
4.  If the Host responds, the infusion was successful.

## Troubleshooting
*   **"The Host is speechless..."**: This usually means the API key is missing, invalid, or quota has been exceeded. Check the browser console (F12) for detailed error messages.
*   **Model Errors**: Ensure you are using the supported models defined in `geminiService.ts` (currently `gemini-1.5-flash`).

## Note on Privacy
Your API key is stored locally in your browser/environment. It is never sent to any third-party server other than Google's Gemini API endpoints. Ensure you do not commit your `.env` file to public repositories.
