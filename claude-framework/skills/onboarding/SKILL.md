---
name: onboarding
description: Full developer onboarding — GitHub, env, dependencies, Claude framework (local or global), and verification
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion, Agent
---

# Onboarding - New Developer Setup

Complete, interactive onboarding for new developers joining the project. Handles everything from GitHub access to a verified running dev server.

## When to Use

- New developer joining the project
- User says "onboard", "set me up", "I'm new", "first time setup"
- Someone cloned the repo and needs to get running

## Steps

### Phase 1: Orientation

Greet the developer and explain what this skill will do:

1. Verify GitHub access and CLI setup
2. Install dependencies
3. Configure environment variables
4. Set up Claude Code framework (local or global — their choice)
5. Verify everything works (dev server, typecheck, build)
6. Create their first feature branch

### Phase 2: GitHub & Git

#### 2.1 Check GitHub CLI

```bash
gh --version 2>/dev/null
```

If not installed, tell them:

```
brew install gh
```

#### 2.2 Authenticate

```bash
gh auth status
```

If not logged in, walk them through:

```bash
gh auth login
```

#### 2.3 Verify repo access

```bash
gh repo view newearthcollectiveteam/web-eco --json name 2>/dev/null
```

If no access, tell them to ask the project lead to add them as a collaborator on the `newearthcollectiveteam` GitHub org.

#### 2.4 Configure git for HTTPS

```bash
# Ensure remote uses HTTPS (not SSH) for credential routing
git remote get-url origin
```

If it uses SSH, fix it:

```bash
git remote set-url origin https://github.com/newearthcollectiveteam/web-eco.git
gh auth setup-git
```

#### 2.5 Set git identity (if not set)

```bash
git config user.name
git config user.email
```

If blank, ask the developer for their name and email, then set them:

```bash
git config user.name "Their Name"
git config user.email "their@email.com"
```

### Phase 3: Node.js & Dependencies

#### 3.1 Check Node version

```bash
node --version
```

Must be Node 20.x. If they're on Node 24, warn them:

> Node 24 has a known bug that breaks `drizzle-kit push`. Use Node 20 via nvm: `nvm use 20`

#### 3.2 Install dependencies

```bash
npm install
```

This also sets up Husky pre-commit hooks automatically.

#### 3.3 Verify Husky installed

```bash
ls .husky/pre-commit
```

### Phase 4: Environment Variables

#### 4.1 Check for existing .env

```bash
ls -la .env 2>/dev/null
```

#### 4.2 Create .env from template

If no .env exists:

```bash
cp .env.example .env
```

#### 4.3 Collect required values

Ask the developer using AskUserQuestion for the required env vars. Present them clearly:

> I need a few environment variables to connect to the database and services.
> You can get these from the project lead or from the Supabase dashboard.
>
> **Required (app won't start without these):**
>
> 1. `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
> 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
> 3. `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
> 4. `DATABASE_URL` — PostgreSQL connection string (from Supabase > Settings > Database > Connection Pooling)
>
> **Optional (features work without these):**
>
> - `RESEND_API_KEY` — For sending emails
> - `KLAVIYO_API_KEY` / `KLAVIYO_PUBLIC_KEY` — For email marketing
> - `ANTHROPIC_API_KEY` — For AI chat features
>
> Paste them all at once or one at a time. Or type "skip" if you want to fill these in manually later.

If they provide values, update the .env file with the correct values.

If they skip, remind them: "Fill in `.env` before running the dev server. See `docs/ENVIRONMENT_SETUP.md` for details."

#### 4.4 Generate defaults for optional vars

Set sensible defaults that won't break the build:

- `NEXT_PUBLIC_BASE_URL` → `http://localhost:3000`
- `NEXT_PUBLIC_COOKIE_DOMAIN` → `localhost`
- `IP_HASH_SALT` → generate a random string
- `MAILJET_FROM_EMAIL` → `noreply@joinnewearthcollective.com`
- `MAILJET_FROM_NAME` → `New Earth Collective`

### Phase 5: Claude Code Framework

This is the key decision point. Ask the developer:

> **Claude Code Framework Setup**
>
> This project uses a unified development framework with custom skills, patterns, and standards for Claude Code. You have two options:
>
> **Option A: Project-only (local)** — recommended for new Claude Code users
>
> - Installs to `~/.claude/` so it works with this project
> - No impact on other projects
> - Easy to remove later
>
> **Option B: Global** — recommended if you use Claude Code across multiple projects
>
> - Same install location (`~/.claude/`), but you'll also get the framework
>   for any project you work on
> - Skills like `/resume`, `/handoff`, `/checkout` work everywhere
> - You can always customize per-project via each project's CLAUDE.md
>
> **Option C: Skip** — use Claude Code without the framework
>
> - You can still work on this project fine
> - You just won't have the custom skills and patterns
>
> Which would you prefer? (A/B/C)

#### Option A or B: Run the setup script

```bash
./scripts/setup-claude.sh
```

The script handles everything — it copies framework files, skills, and patterns to `~/.claude/`.

For **Option A** specifically, after running the script, note:

> The framework is installed. It works with all projects by default since it lives in `~/.claude/`. If you ever want to limit it to just this project, you can move the files. But for most people, having it globally is fine — the project's `CLAUDE.md` handles project-specific overrides.

For **Option B**, the messaging is the same — the script installs globally by design.

**Actually, both A and B use the same install.** The real difference is awareness. For Option A people, add a note:

> If you work on other projects with Claude Code, the framework skills will be available there too. If you don't want that, you can remove `~/.claude/FRAMEWORK.md` and `~/.claude/skills/` later.

#### Option C: Skip

Just note:

> No problem. You can always run `./scripts/setup-claude.sh` later if you change your mind.

#### 5.1 Supabase MCP (for Option A or B)

If they have Claude CLI installed:

```bash
claude mcp list 2>/dev/null | grep -i supabase
```

If not already configured:

> To connect Claude directly to your Supabase database, run:
>
> ```
> claude mcp add supabase -- npx -y @anthropic-ai/supabase-mcp@latest
> ```
>
> This is optional but lets Claude read/write your database directly.

### Phase 6: Verification

Run checks in sequence, stopping on first failure:

#### 6.1 TypeScript check

```bash
npm run typecheck
```

#### 6.2 Lint check

```bash
npm run lint
```

#### 6.3 Build

```bash
npm run build
```

If build fails due to missing env vars, help them fill in the required ones.

#### 6.4 Dev server smoke test

```bash
# Start dev server briefly to verify it boots
timeout 15 npm run dev 2>&1 || true
```

Look for "Ready" or "started server" in the output.

### Phase 7: First Branch

Ask if they'd like to create their first feature branch:

> You're all set! Want to create a feature branch to start working on something?
> Check `TODO.md` for available tasks, or tell me what you'd like to work on.

If yes, use the checkout flow:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<their-feature>
```

### Phase 8: Summary

Print a completion summary:

```
## Onboarding Complete!

**Developer:** <name from git config>
**Branch:** <current branch>
**Node:** <version>
**Framework:** <installed / skipped>

### Quick Reference
- `npm run dev` — Start dev server (localhost:3000)
- `npm run quality-check` — Full quality check before committing
- `/checkout <name>` — Create a feature branch
- `/pr` — Open a pull request when done
- `/resume` — Load project context at session start
- `/handoff` — Save session state when done

### Key Files
- `CLAUDE.md` — Project instructions
- `CONTRIBUTING.md` — Full development guide
- `STATUS.md` — What's working
- `TODO.md` — Available tasks
- `docs/GIT_WORKFLOW_GUIDE.md` — Git workflow explained

### Need Help?
- `docs/TROUBLESHOOTING.md` for common issues
- Ask the project lead for Supabase access or env vars
```

## Error Handling

- If `gh` not installed → provide install command, continue with rest of setup
- If no repo access → tell them to ask project lead, continue with local setup
- If wrong Node version → warn but don't block (things may still work)
- If .env values missing → let them skip, but warn about build failures
- If build fails → diagnose (usually missing env vars), help fix
- Never exit early — complete as much setup as possible and summarize what's left

## Important Notes

- NEVER ask for or store passwords, tokens, or secrets in memory — only write them to .env
- The .env file is gitignored, so it's safe to write secrets there
- Always verify the remote URL uses HTTPS, not SSH
- The pre-commit hook is installed by `npm install` via Husky — no extra step needed
