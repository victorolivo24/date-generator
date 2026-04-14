# The Scare Report

Monsters University-themed date tracking app built with Next.js and Tailwind CSS.

## Features

- MU-styled lobby with `Victor` and `Gianna` entry points
- 12 preloaded dates in a pending scare-report queue
- Private `Secret Scare Aspirations` per user
- Separate 1-16 sliders for activity vibe and venue score
- Shared persistence through Vercel KV when configured
- Gemini-powered `Final Exam` date generation using history plus hidden wishlist context

## Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Add `GEMINI_API_KEY`
4. Optionally add Vercel KV credentials for shared persistence across deployments
5. Run `npm run dev`

Without Vercel KV configured, the app falls back to in-memory storage for local development only.
