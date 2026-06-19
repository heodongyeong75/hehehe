# hehehe — character chat

Next.js 14 character chat app. Create your own AI characters and chat with them. Powered by Groq, stored in Upstash Redis.

## Stack

- Next.js 14 (App Router)
- Upstash Redis (REST) — storage
- Groq API — `llama-3.1-8b-instant` (fast & cheap)
- Tailwind CSS — dark, character.ai-style UI
- Deploy: Vercel

## Setup

1. Install deps:

   ```bash
   npm install
   ```

2. Create `.env.local` (see `.env.example`):

   ```
   GROQ_API=...
   UPSTASH_TOKEN=...
   UPSTASH_REDIS_REST_URL=...
   ```

3. Run:

   ```bash
   npm run dev
   ```

## Deploy to Vercel

Push to GitHub, import the repo in Vercel, and add the three env vars
(`GROQ_API`, `UPSTASH_TOKEN`, `UPSTASH_REDIS_REST_URL`) in project settings.

## Data model (Redis)

- `profile` — `{ username, description }`
- `characters` — `Character[]`
- `chat:<characterId>` — `ChatMessage[]`

## Flow

First visit → `/onboarding` (profile) → `/characters/new` → main page (`/`)
with your character list → `/chat/[characterId]`.

## Features

- Onboarding (profile) + character creation (name, description, scenario)
- Scenario used as system prompt; your profile injected so the character
  knows who it's talking to
- `*actions*` rendered in italics
- Edit / delete any message inline, resend last turn, clear chat (confirm)
- Auto-scroll, mobile friendly, dark theme
