# CivicEye AI — Setup

```bash
npm install        # required: installs deps for THIS machine (fixes the
                   # rolldown/vite native-binding error from a cross-platform zip)
npm run dev        # start the dev server (Vite)
```

## Groq AI vision (optional)
The photo-analysis step calls Groq (Llama 4 Scout) through a Vite dev proxy.
1. Rename `.env.example` -> `.env` (or edit the included `.env`).
2. Put your real key in it:  `GROQ_API_KEY=gsk_...`   (no VITE_ prefix)
3. Restart `npm run dev`.
Without a key the app still works — AI analysis falls back to offline heuristics.

## Demo logins
| Role    | Email                 | Password |
|---------|-----------------------|----------|
| Citizen | citizen@civiceye.app  | demo123  |
| Officer | officer@civiceye.app  | demo123  |
| Admin   | admin@civiceye.app    | demo123  |

(Click any row on the login screen to auto-fill.)
