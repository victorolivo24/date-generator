# The Scare Report

Monsters University-themed date tracking app built with Next.js and Tailwind CSS.

## Features

- MU-styled lobby with `Victor` and `Gianna` entry points
- 12 preloaded dates in a pending scare-report queue
- Private `Secret Scare Aspirations` per user
- Separate 1-16 sliders for activity vibe and venue score
- Shared persistence through `REDIS_URL` when configured
- Gemini-powered `Final Exam` date generation using history plus hidden wishlist context

## Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Add `GEMINI_API_KEY`
4. Optionally add `REDIS_URL` for shared persistence across deployments
5. Run `npm run dev`

Without `REDIS_URL` configured, the app falls back to in-memory storage for local development only.

## Optional Audio Asset

If you want the in-app music button to work, add an audio file at `public/mu-theme.mp3`.
