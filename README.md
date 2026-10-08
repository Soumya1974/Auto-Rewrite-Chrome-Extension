# AI Auto-Rewrite Chrome Extension & Backend

An AI-powered Chrome extension and backend service for rephrasing, explaining, and drafting replies for selected text.

## Features

- **Rephrase Text**: Rewrite text into various tones (professional, casual, concise, etc.).
- **Explain Text**: Get instant explanations for highlighted text in a draggable modal interface.
- **Smart Reply**: Generate context-aware replies for comments and messages.
- **Dark / Light Mode**: Built-in visual theme toggles for smooth reading.

## Architecture

- **Extension**: Manifest V3 Chrome Extension.
- **Backend**: Node.js + Express with Google GenAI / Groq SDK integrations.

## Setup & Running

### Backend
```bash
cd backend
npm install
npm run dev
```

### Extension
1. Open `chrome://extensions/` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` directory.

<!-- temp: sync build trigger -->

