# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**ntropiq** is an AI-powered analytics platform built with Next.js 15, featuring:
- Interactive AI chat interface for data analysis queries
- Jupyter-like notebook environment for code execution and visualization
- Voice integration (speech-to-text and text-to-speech)
- Multi-source data connections (databases, APIs, cloud storage)

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Google Gemini AI, ElevenLabs TTS

## Common Development Commands

### Installation & Setup
```bash
# Install dependencies with legacy peer deps (required for this project)
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
```

### Development
```bash
# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Start production server
npm start
```

### Environment Variables Required
- `GEMINI_API_KEY` - Google Gemini API key (required for AI responses)
- `ELEVENLABS_API_KEY` - ElevenLabs API key (required for voice features)
- `ELEVENLABS_VOICE_ID` - Optional, defaults to `21m00Tcm4TlvDq8ikWAM`
- `ELEVENLABS_MODEL_ID` - Optional, defaults to `eleven_multilingual_v2`

See `ENVIRONMENT_SETUP.md` for detailed configuration instructions.

## Code Architecture

### Directory Structure
```
app/                          # Next.js App Router (main application logic)
├── api/                      # Server-side API routes
│   ├── chat/route.ts         # POST endpoint for chat message processing
│   ├── notebook/             # Notebook-related endpoints
│   │   ├── analyze/route.ts  # Code analysis and insights
│   │   └── insights/route.ts # Data insights generation
│   └── voice/                # Voice features
│       └── tts/route.ts      # Text-to-speech conversion
├── chat/page.tsx             # Main chat interface (client component)
├── notebook/page.tsx         # Interactive notebook environment
├── signin/page.tsx           # Authentication page
├── page.tsx                  # Landing page
└── layout.tsx                # Root layout with metadata

lib/
├── gemini.ts                 # Gemini AI integration (core AI logic)
└── utils.ts                  # General utilities

components/
├── ui/                       # shadcn/ui components (50+ pre-built UI components)
├── geometric-background.tsx  # Landing page background animation
├── login-form.tsx            # Authentication form
└── theme-provider.tsx        # Theme context provider

hooks/
├── use-mobile.ts             # Responsive design detection
└── use-toast.ts              # Toast notification system

public/                       # Static assets
styles/                       # Global CSS (globals.css, Tailwind imports)
```

### Core Components & Data Flow

**1. AI Integration (`lib/gemini.ts`)**
- Lazy-loads Google Generative AI with single instance pattern
- Exports three main functions:
  - `generateChatResponse()` - Handles conversational queries with context detection
  - `generateNotebookInsights()` - Provides brief, actionable insights for notebook queries
  - `analyzeCode()` - Analyzes and suggests improvements for code snippets
- Uses `gemini-1.5-flash` model for responses
- Error handling and logging built-in

**2. API Layer**
- **Chat Route** (`app/api/chat/route.ts`) - Accepts POST requests with message, calls Gemini, returns response
- **Notebook Routes** - Provide analysis and insights for the notebook environment
- **Voice Route** - Converts text responses to speech using ElevenLabs API

**3. Frontend Pages (Client Components)**
- Chat page: Real-time message interface with AI responses
- Notebook page: Code editor with execution capability and visualizations
- Both are interactive React components with state management

### Key Architectural Patterns

1. **Separation of Concerns** - API routes handle external AI/API calls, frontend components handle UI
2. **Lazy Initialization** - Gemini client is only created when needed (avoids build-time issues)
3. **Error Handling** - Try-catch blocks with user-friendly error messages
4. **Environment-Based Configuration** - All API keys and secrets from environment variables
5. **TypeScript Strict Mode** - Type safety across the application

## Important Notes

- **Build Configuration** - `next.config.mjs` ignores ESLint and TypeScript errors during builds (intentional for this project). Don't remove these settings.
- **Legacy Dependencies** - Install with `--legacy-peer-deps` flag due to dependency conflicts
- **Static Optimization** - Images unoptimized in `next.config.mjs` for deployment flexibility
- **Deployment** - Configured for Netlify (see `DEPLOYMENT_GUIDE.md` and `netlify.toml`)
- **Components** - Uses comprehensive shadcn/ui library; check `components/ui/` before creating new UI components

## Useful References

- API Key Setup: See `ENVIRONMENT_SETUP.md`
- Deployment: See `DEPLOYMENT_GUIDE.md`
- Google Gemini Docs: https://ai.google.dev/
- ElevenLabs Docs: https://elevenlabs.io/
- Next.js 15 App Router: https://nextjs.org/docs

## Development Workflow Tips

1. When adding AI features: Modify `lib/gemini.ts` and expose new functions
2. When creating new API endpoints: Follow the pattern in `app/api/chat/route.ts` (POST handler with error catch)
3. When updating UI: Check if shadcn/ui already has the component before creating new ones
4. Testing AI features: Use environment variables in `.env.local` - never hardcode API keys
5. For deployment changes: Update both `next.config.mjs` and `netlify.toml` if needed
