# Contributing to New Earth Collective Web Ecosystem

## Initial Setup

### 1. GitHub Access

This project uses the **newearthcollectiveteam** GitHub organization. You'll need to be added as a collaborator.

After the project lead adds you:

```bash
# Install GitHub CLI if you don't have it
brew install gh

# Login to GitHub
gh auth login

# Clone using HTTPS (not SSH)
git clone https://github.com/newearthcollectiveteam/web-eco.git
cd web-eco

# Set up credential routing (so git uses your GitHub CLI token)
gh auth setup-git

# Verify it's working
gh auth status
```

**Why HTTPS instead of SSH?** HTTPS with `gh auth setup-git` lets the GitHub CLI handle authentication automatically, which is simpler to set up and avoids SSH key configuration issues.

### 2. Install dependencies

```bash
npm install
```

**Important:** Use Node.js 20 (not 24). Node 24 has a known bug that breaks our database tools. Check with `node --version`.

### 3. Set up environment

```bash
cp .env.example .env
```

Fill in the values in `.env`. See `docs/ENVIRONMENT_SETUP.md` for a detailed walkthrough of every variable.

**Quick version:** Ask the project lead for:

- **Supabase URL and anon key**
- **Database connection string**
- **Service role key**

### 4. Set up Claude Code (optional but recommended)

We use Claude Code with a unified development framework. The setup script lets you choose how much to install:

```bash
./scripts/setup-claude.sh
```

Choose a preset when prompted:

| Preset                     | Skills | Best for                                                             |
| -------------------------- | ------ | -------------------------------------------------------------------- |
| **Standard** (recommended) | 22     | Most developers — session management, git workflow, code quality     |
| **Minimal**                | 11     | Just the essentials — session management + git workflow              |
| **Full**                   | 34     | Framework maintainers — includes scaffolding, multi-agent, utilities |

The script:

- Backs up your existing `~/.claude/` before any changes
- Only installs framework skills (preserves your custom skills and settings)
- Tracks what was installed for easy updates later

To update after pulling new code: `./scripts/setup-claude.sh --update`
To restore a backup: `./scripts/setup-claude.sh --restore`

### 5. Verify everything works

```bash
npm run dev          # Should start on localhost:3000
npm run typecheck    # Should pass with no errors
npm run build        # Should build successfully
```

## Branch Workflow

We use a two-tier branching model:

```
main (production — protected, deploys to Vercel)
 └── dev (integration branch — PRs merge here first)
      └── feature/your-feature (your working branch)
```

### Creating a feature branch

Always branch off `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### Branch naming

Use descriptive prefixes:

- `feature/` — new functionality (e.g., `feature/calendar-integration`)
- `fix/` — bug fixes (e.g., `fix/crm-search-crash`)
- `refactor/` — code improvements (e.g., `refactor/api-error-handling`)
- `docs/` — documentation only (e.g., `docs/api-reference`)

### Making a Pull Request

1. Push your branch: `git push -u origin feature/your-feature-name`
2. Go to GitHub → you'll see a prompt to create a PR
3. Set the **base branch** to `dev` (not main!)
4. Fill in the PR template
5. Wait for CI checks to pass (lint, typecheck, build)
6. Request review from the project lead

### After your PR is approved

The project lead will merge your PR into `dev`. Periodically, `dev` gets merged into `main` for production deployment.

## Code Standards

### Before committing

The pre-commit hook runs automatically:

- Prettier formatting
- ESLint checks
- TypeScript type checking

If any check fails, the commit is blocked. Fix the issues and try again.

### Manual quality check

```bash
npm run quality-check   # Runs format, lint, typecheck, and build
```

### Key conventions

- **TypeScript**: Strict mode. No `any` unless absolutely necessary.
- **Imports**: Use `~/` path alias (maps to `src/`)
- **Styling**: Tailwind CSS v4. Use existing design tokens.
- **Components**: shadcn/ui as the base component library
- **API**: tRPC routers in `src/server/api/routers/`
- **Database**: Drizzle ORM. Schema in `src/server/db/schema.ts`

### File organization

| What you're building    | Where it goes                            |
| ----------------------- | ---------------------------------------- |
| New page                | `src/app/<route>/page.tsx`               |
| Admin page              | `src/app/admin/<route>/page.tsx`         |
| API route               | `src/app/api/<route>/route.ts`           |
| tRPC router             | `src/server/api/routers/<name>.ts`       |
| Reusable component      | `src/components/<name>.tsx`              |
| Admin component         | `src/components/admin/<name>.tsx`        |
| Page-specific component | `src/components/pages/<page>/<name>.tsx` |

## Working with the Team

### Coordinate on schema changes

The database is shared — don't run `npm run db:push` without coordinating with the team first. Schema changes should go through a PR so they can be reviewed.

### Claim your tasks

Check `TODO.md` for available work. Add your `@name` to items you're working on so others know not to duplicate effort:

```markdown
- [ ] @yourname Fix the login redirect bug
```

### Don't step on toes

Before starting a new feature:

1. Check if there's an open PR or branch touching the same area
2. Let the team know what you're working on (Slack, GitHub issue, etc.)
3. Run `/sync` to make sure you have the latest code

## Getting Help

- `docs/TROUBLESHOOTING.md` — Common errors and how to fix them
- `docs/ENVIRONMENT_SETUP.md` — Detailed env var walkthrough
- `docs/GIT_WORKFLOW_GUIDE.md` — How branches, PRs, and reviews work
- `CLAUDE.md` — Project-specific instructions
- `STATUS.md` — What's working, what's not
- `TODO.md` — Outstanding work items
- Ask the project lead for Supabase access or env variables

## Quick Reference: Your First Day

```bash
# 1. Clone and setup
git clone https://github.com/newearthcollectiveteam/web-eco.git
cd web-eco
npm install
cp .env.example .env    # Then fill in values (ask project lead)

# 2. Install Claude framework (optional — choose Standard preset)
./scripts/setup-claude.sh --preset=standard

# 3. Start developing
npm run dev             # Visit http://localhost:3000

# 4. Start work on a task
/checkout my-feature    # Creates a branch

# 5. When done
/handoff                # Save session state
/pr                     # Open pull request for review
```
