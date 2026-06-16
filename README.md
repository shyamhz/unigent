# Unigent

**AI Agents at the Speed of Thought**

Unigent is a keyboard-first workspace powered by intelligent AI agents. Automate tasks, manage communications, and let AI handle the rest — all from one unified interface.

## Features

### AI-Powered Agents
- Natural language commands for task automation
- Multi-step workflow orchestration
- Real-time action execution and reporting

### Intelligent Integrations
- **Gmail**: Read, draft, send, and organize emails automatically
- **Google Calendar**: Schedule, create, and manage events
- **OAuth 2.0**: Secure Google authentication without storing passwords

### Priority Intelligence
- LLM-powered email and task triage
- Automatic priority scoring and categorization
- Smart filtering to surface what matters most

### Keyboard-First Design
- Command palette for instant actions (⌘K)
- Navigate and control everything without leaving the keyboard
- Optimized for power users

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org) | React framework with App Router |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Type-safe development |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Reusable UI components |
| [Drizzle ORM](https://orm.drizzle.team) | Database toolkit |
| [PostgreSQL 17](https://www.postgresql.org) | Relational database |
| [Corsair](https://github.com/corsair) | Google OAuth & API integration |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- Docker & Docker Compose
- Google Cloud Project with OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/unigent.git
   cd unigent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgres://unigent:postgres@localhost:5432/unigent"
   CORSAIR_KEK="<your-encryption-key>"
   ```

4. **Start the database**
   ```bash
   npm run db:up
   ```

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
unigent/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   └── dashboard/
│   │       ├── layout.tsx      # Dashboard layout
│   │       └── page.tsx        # Main dashboard
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard panels
│   │   │   ├── TopBar.tsx
│   │   │   ├── GmailPanel.tsx
│   │   │   ├── AICommandPanel.tsx
│   │   │   └── CalendarPanel.tsx
│   │   ├── hero.tsx            # Hero section
│   │   ├── features.tsx        # Feature showcase
│   │   ├── integrations.tsx    # Integration demos
│   │   ├── pricing.tsx         # Pricing tiers
│   │   └── ...                 # Other landing components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   └── utils/                  # Helper functions
├── public/                     # Static assets
├── docker-compose.yml          # PostgreSQL setup
├── drizzle.config.ts           # Database config
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:down-hard` | Stop PostgreSQL and delete volumes |
| `npm run db:health` | Check database status |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:push` | Push schema to database |

## Dashboard

The dashboard provides a unified workspace with three main panels:

### Gmail Panel
- View and manage your inbox
- AI-powered email triage and priority scoring
- Auto-sorted messages by importance

### AI Agent Panel
- Execute natural language commands
- Multi-step task orchestration
- Real-time action feedback

### Calendar Panel
- View upcoming events
- AI-created meeting scheduling
- Conflict detection and resolution

## Architecture

### Server Components
- Landing page sections (except interactive components)
- Layouts and metadata generation
- Initial data fetching

### Client Components
- Dashboard panels (interactive)
- Feature animations
- Real-time updates

### Database
- PostgreSQL with Drizzle ORM
- Schema migrations via `drizzle-kit`
- Docker-based local development

## Security

- OAuth 2.0 for Google authentication
- No password storage
- Encrypted session tokens
- SOC 2 certification in progress

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

- **Documentation**: [docs.unigent.ai](https://docs.unigent.ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/unigent/issues)
- **Email**: support@unigent.ai

---

Built with by the Unigent team
