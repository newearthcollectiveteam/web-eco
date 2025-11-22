# New Earth Collective Website Ecosystem

A multi-domain Next.js application supporting different sites within a single codebase for the New Earth Collective.

## Supported Domains

- **joinnewearthcollective.com** - Main collective website (placeholder - coming soon)
- **test.joinnewearthcollective.com** - Development hub with all features and demos

## Tech Stack

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://typescriptlang.org)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com)** - Styling with custom design system
- **[tRPC](https://trpc.io)** - Type-safe API layer
- **[Drizzle ORM](https://orm.drizzle.team)** - Database toolkit
- **[Supabase](https://supabase.com)** - Database and auth
- **GLSL Shaders** - Interactive visual effects and sacred geometry

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (already configured)
# .env file is ready with Supabase credentials

# Start development server
npm run dev
```

### Local Development with Domains

Access different domains locally:

- `http://localhost:3000` - Main site (coming soon placeholder)
- `http://localhost:3000?domain=test.joinnewearthcollective.com` - Development hub with all features

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/trpc/          # tRPC API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── domain-layout.tsx  # Multi-domain layout
│   ├── pages/             # Domain-specific pages
│   └── ui/                # Shared UI components
├── lib/
│   ├── domains.ts         # Domain configuration
│   ├── supabase/          # Supabase client utilities
│   └── utils.ts           # Shared utilities
├── server/
│   ├── api/               # tRPC routers
│   └── db/                # Database schema
├── styles/                # Global styles
└── trpc/                  # tRPC client setup
```

## Database

- **Development**: SQLite (file-based)
- **Production**: PostgreSQL via Supabase
- **ORM**: Drizzle with automatic migrations

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# View database
npm run db:studio
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Environment variables are already configured in `.env`
3. Deploy automatically on git push

### Environment Variables

The project is pre-configured with:

- Supabase URL and Anon Key
- SQLite database for development

For production, update `DATABASE_URL` in Vercel settings to use PostgreSQL.

## Development Workflow

### Daily Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality & Formatting

```bash
# Format code with Prettier
npm run format              # Format all files
npm run format:check        # Check formatting without changing files

# Linting with ESLint
npm run lint                # Check for lint errors
npm run lint:fix            # Auto-fix lint errors where possible

# Type checking
npm run typecheck           # Run TypeScript compiler checks
```

### Pre-Push Quality Checks

Before pushing code to GitHub, run:

```bash
# Option 1: Use the pre-commit script (recommended)
npm run pre-commit

# Option 2: One-line quality check
npm run quality-check

# Option 3: Manual commands
npm run format && npm run lint:fix && npm run lint && npm run typecheck && npm run build
```

### Database Commands

```bash
npm run db:generate     # Generate migrations from schema changes
npm run db:migrate      # Apply pending migrations
npm run db:push         # Push schema directly (development only)
npm run db:studio       # Open Drizzle Studio (database GUI)
```

## Features

### Development Hub (test.joinnewearthcollective.com)

The test domain serves as a navigation hub to all features under development:

1. **GLSL Shaders Gallery** (`/shaders`)
   - 8 interactive WebGL shader demonstrations
   - Flower of Life, Metatron's Cube, North Star
   - Neural networks, fractals, sacred geometry
   - Full-screen immersive experiences

2. **Component Playground** (`/playground`)
   - Interactive UI component demonstrations
   - Animation effects and particle systems
   - 9 different demo categories

3. **Template Gallery** (`/templates`)
   - 4 full-page template previews
   - Portfolio, SaaS, Startup, Developer Profile
   - Ready for customization

### Core Features

- Multi-domain routing and configuration
- Type-safe API with tRPC
- Responsive design system with dark mode
- Database migrations with Drizzle
- Environment validation
- Supabase authentication ready

## Multi-Domain Support

The application automatically routes to different content based on the hostname:

- **Production**: Uses actual domain names
- **Development**: Uses URL parameters (`?domain=test`)

Configure domains in `src/lib/domains.ts`.

## GLSL Shaders

The `shaders/` directory contains GLSL shader files for visual effects:

- Flower of Life
- Metatron's Cube
- Sacred geometry patterns
- Fractal visualizations
- Neural network animations

## Scripts

- `scripts/pre-commit.sh` - Pre-commit quality checks
- `scripts/setup-env.js` - Environment setup and validation

## License

Private - New Earth Collective

---

Built with Claude Code by Anthropic
