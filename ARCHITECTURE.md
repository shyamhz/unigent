# Unigent Architecture

AI-powered personal assistant that manages Gmail and Google Calendar through natural language conversations.

## Directory Structure

```
src/
├── admin/              # Standalone admin panel (Node.js HTTP server, excluded from tsconfig)
├── app/                # Next.js App Router (routes, API endpoints, layouts)
│   ├── actions/        # DELETED — moved to server/actions/
│   ├── api/            # API route handlers
│   ├── dashboard/      # Dashboard page (server component)
│   ├── onboarding/     # OAuth onboarding flow
│   └── ...
├── client/             # Client-side code
│   ├── components/     # React components (UI, dashboard panels, landing page)
│   ├── hooks/          # Custom React hooks (useInView)
│   └── utils/          # Client utilities (sounds.ts)
├── emails/             # Email templates (used by admin)
├── lib/                # Shared utilities
│   └── utils.ts        # cn() helper (clsx + twMerge)
├── scripts/            # CLI scripts (setup-corsair.ts)
├── server/             # Server-side code
│   ├── actions/        # Server Actions ('use server' — Clerk auth wrappers)
│   ├── ai/             # AI configuration, tools, memory, system prompt
│   ├── db/             # Drizzle ORM schema and client
│   └── services/       # External service integrations
│       ├── corsair.ts  # Corsair instance (self-hosted mode)
│       ├── corsair-hosted.ts  # Corsair hosted mode (MCP tools)
│       ├── aicredits.ts       # LLM provider (aicredits.in)
│       ├── email.ts           # Resend email sending
│       ├── gmail/             # Gmail data access (DB + API fallback)
│       └── googlecalendar/    # Google Calendar data access
└── types/              # Shared TypeScript types
```

## System Flow

### Authentication
1. User signs in via Clerk (Next.js middleware handles auth)
2. `@clerk/nextjs/server` provides `auth()` and `clerkClient()` in Server Components/Actions
3. User metadata stored in Clerk (`access_allowed`, `onboarded`, `connections`, `tier`)

### OAuth Flow (Gmail + Google Calendar)
1. User clicks "Connect" → `getGoogleOAuthUrl()` in `server/actions/oauth.ts`
2. `ensureIntegration()` ensures OAuth credentials exist in Neon DB via `setupCorsair()`
3. `generateOAuthUrl()` returns Google OAuth consent URL
4. User authorizes → Google redirects to `/api/corsair/oauth/callback`
5. `processOAuthCallback()` exchanges code for tokens, stores encrypted credentials in DB
6. User metadata updated with connection status

### AI Chat
1. User sends message → `/api/chat/route.ts` (streaming endpoint)
2. Checks if hosted Corsair mode available → uses MCP tools if so
3. Falls back to self-hosted mode → builds tools from `server/ai/tools.ts`
4. Tools call Server Actions (gmail, calendar) which use service layer
5. `streamText()` from Vercel AI SDK streams response back
6. Messages persisted to DB via `server/ai/memory.ts`

### Data Access Pattern
```
Server Action (auth) → Service (business logic) → Corsair (DB + API)
     ↓                      ↓                          ↓
  Clerk auth          gmail/index.ts            corsair.withTenant()
                   googlecalendar/index.ts     .gmail.db.messages.search()
```

## Key Integrations

| Service | Package | Purpose |
|---------|---------|---------|
| Clerk | `@clerk/nextjs` | Authentication, user management |
| Corsair | `corsair` | Gmail/Calendar API proxy + DB cache |
| Drizzle | `drizzle-orm` | PostgreSQL ORM (Neon) |
| AI SDK | `ai` | Streaming AI responses |
| aicredits.in | `@ai-sdk/openai` | LLM provider |
| Resend | `resend` | Transactional emails |

## Environment Variables

See `.env.example` for full list. Key variables:
- `DATABASE_URL` — Neon PostgreSQL connection
- `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` — Auth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth
- `CORSAIR_KEK` — Encryption key for stored credentials
- `AICREDITS_API_KEY` — LLM API key
- `NEXT_PUBLIC_APP_URL` — Base URL for redirects

## Admin Panel

Standalone Node.js server (`src/admin/server.ts`) running locally:
- User management (grant/revoke access, tier changes)
- AI config management (model, temperature, maxTokens)
- Email notifications on access grant
- Runs with production Clerk keys locally
- Excluded from Next.js build (tsconfig exclude)
