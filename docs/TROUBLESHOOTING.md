# Troubleshooting

Common issues and how to fix them. If you hit something not listed here, ask the project lead or open a GitHub issue.

## Setup Issues

### `npm install` fails

**Symptom:** Errors during dependency installation.

**Fix:**

```bash
# Make sure you're on Node 20 (not 24)
node --version

# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

**Why Node 20?** Node v24 has a bug that crashes `drizzle-kit` (a database tool we use). Stick with Node 20 for now.

### `.env` file not found / environment errors

**Symptom:** App crashes on startup with missing environment variable errors.

**Fix:**

```bash
# Create .env from the template
cp .env.example .env

# Then fill in the values — see docs/ENVIRONMENT_SETUP.md for details
```

### Supabase connection errors

**Symptom:** `ECONNREFUSED` or `connection terminated` errors.

**Possible causes:**

1. **Wrong DATABASE_URL** — Make sure you're using the pooler URL (contains `pooler.supabase.com`), not the direct host
2. **Password encoding** — If your password contains special characters (`!`, `*`, etc.), they need to be URL-encoded (e.g., `!` becomes `%21`)
3. **Project paused** — Free Supabase projects pause after inactivity. Go to your Supabase dashboard and unpause it

**Fix:** Check your `.env` DATABASE_URL matches this format:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Build & Lint Issues

### `npm run build` fails

**Symptom:** Build errors during `next build`.

**Common causes:**

1. **TypeScript errors** — Run `npm run typecheck` to see specific errors
2. **Missing env vars** — Build needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at minimum
3. **Import errors** — Make sure you're using `~/` path alias (not relative paths like `../../`)

### `npm run typecheck` shows errors

**Symptom:** TypeScript type errors.

**Fix:**

```bash
# See the full error list
npm run typecheck

# Common quick fixes:
# - Add proper types instead of `any`
# - Check import paths use ~/
# - Make sure new files are .tsx (not .jsx) for React components
```

### Pre-commit hook fails

**Symptom:** `git commit` is rejected by the pre-commit hook.

**What's happening:** The hook runs typecheck + lint automatically to prevent broken code from being committed.

**Fix:**

```bash
# See what's wrong
npm run quality-check

# Auto-fix what can be auto-fixed
npm run format
npm run lint:fix

# Then try committing again
```

### Prettier formatting conflicts

**Symptom:** Files keep changing format, or format check fails.

**Fix:**

```bash
# Format everything
npm run format

# Then commit the formatted files
```

## Git Issues

### "Your branch is behind"

**Symptom:** Git says your branch is behind `origin/dev`.

**What this means:** Other people have added code since you last synced.

**Fix:**

```bash
# If using Claude Code:
/sync

# Or manually:
git pull origin dev
```

### Merge conflicts

**Symptom:** Git shows `CONFLICT` messages after pulling or merging.

**What this means:** You and someone else changed the same lines of code. Git needs you to decide which version to keep.

**Fix:**

```bash
# If using Claude Code:
/sync
# Claude will walk you through resolving each conflict

# Or manually:
# 1. Open the conflicting file(s)
# 2. Look for <<<<<<< and >>>>>>> markers
# 3. Edit the file to keep the right code
# 4. Remove the conflict markers
# 5. git add <file> && git commit
```

### "Push rejected"

**Symptom:** `git push` is rejected.

**Why:** Someone else pushed changes since your last pull.

**Fix:**

```bash
git pull origin dev
# Resolve any conflicts if needed
git push origin HEAD
```

### Wrong GitHub account

**Symptom:** Push fails with "permission denied" or code goes to wrong repo.

**Fix:**

```bash
# Check which account is active
gh auth status

# Switch to the right account
gh auth switch --user newearthcollectiveteam

# Make sure remote uses HTTPS
git remote set-url origin https://github.com/newearthcollectiveteam/web-eco.git

# Set up credential routing
gh auth setup-git
```

## Runtime Issues

### Port 3000 already in use

**Symptom:** `npm run dev` says port 3000 is taken.

**Fix:**

```bash
# Use a different port
PORT=3001 npm run dev

# Or find and kill what's using port 3000
lsof -ti:3000 | xargs kill -9
```

### Page loads but looks broken

**Possible causes:**

1. **Missing env vars** — Check browser console for errors about Supabase or API keys
2. **Database not seeded** — Some pages need data to display. Check `supabase-scripts/` for setup SQL
3. **Cache issue** — Try hard refresh (Cmd+Shift+R on Mac)

### Admin pages show "Unauthorized"

**Fix:**

1. Make sure you're logged in at `/login`
2. Your account needs to be approved. Check with the project lead or run the approval SQL:
   ```sql
   -- In Supabase SQL editor:
   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"approved": true, "role": "admin"}' WHERE email = 'your@email.com';
   ```

## Database Issues

### `drizzle-kit push` crashes

**Symptom:** `Cannot read properties of undefined (reading 'replace')` during `db:push`.

**Why:** This is a known bug with Node v24. Drizzle-kit hasn't fixed it yet.

**Workaround:** Use Node 20, or run migrations via raw SQL in the Supabase dashboard.

### Migration conflicts

**Symptom:** Two developers ran migrations that conflict.

**Prevention:** Coordinate with the team before running `npm run db:push` on the shared database. Use the PR process for schema changes — don't push schema changes without review.

## Still Stuck?

1. Check `STATUS.md` for known limitations
2. Check `TODO.md` for known bugs
3. Ask the project lead
4. Open a GitHub issue with the "Bug" template
