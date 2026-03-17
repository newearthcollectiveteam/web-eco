# Git Workflow Guide (For You, Matthew)

A plain-language walkthrough of how the development pipeline works now that you have another developer contributing.

## The Big Picture

```
Your dev writes code
       ↓
Pushes to their feature branch on GitHub
       ↓
Opens a Pull Request (PR) targeting "dev" branch
       ↓
GitHub Actions automatically runs checks (lint, types, build)
       ↓
You get a notification to review the code
       ↓
You approve (or request changes)
       ↓
PR merges into "dev" — Vercel deploys a preview
       ↓
When you're happy with dev, you merge dev → main
       ↓
Vercel deploys to production
```

## Your Two Branches

### `main` = Production

- This is what's live on your real domain
- **Nobody pushes directly to main** (protected)
- Code only gets here through a PR from `dev`
- Vercel auto-deploys this to production

### `dev` = Staging / Integration

- This is where new work lands first
- Your dev's PRs merge into `dev`
- Vercel gives `dev` its own preview URL so you can see changes live
- When everything looks good, you merge `dev` into `main`

## What's a Pull Request (PR)?

Think of it like a proposal. Your dev is saying: "Here are changes I'd like to add. Please look them over."

**What you see when reviewing a PR:**

- A title and description of what changed
- A diff showing every line added (green) or removed (red)
- Whether the automated checks passed or failed
- A place to leave comments on specific lines of code

**What you can do:**

- **Approve** — looks good, merge it
- **Request changes** — leave comments about what to fix
- **Comment** — just leave feedback without approving or rejecting

## How to Review a PR

1. Go to https://github.com/newearthcollectiveteam/web-eco/pulls
2. Click on the PR
3. Click the **"Files changed"** tab to see what code changed
4. Look at the **"Checks"** section — make sure CI passed (green checkmark)
5. If everything looks good, click **"Review changes"** → **"Approve"** → **"Submit review"**
6. Click **"Merge pull request"** → **"Confirm merge"**

## Vercel Preview Deployments

Every branch and PR automatically gets its own live preview URL from Vercel. This means:

- **`dev` branch** → has a permanent preview URL (something like `web-eco-dev-newearthcollective.vercel.app`)
- **Each PR** → gets a unique temporary preview URL
- **`main` branch** → deploys to your production domain

### Setting this up in Vercel

If your repo is already connected to Vercel (it should be), previews work automatically. To verify:

1. Go to your Vercel dashboard → your project
2. Go to **Settings** → **Git**
3. Make sure "GitHub" is connected and the repo is linked
4. Under **"Production Branch"**, make sure it says `main`

That's it. Vercel handles the rest. Every push to any branch creates a preview.

### Where to find preview URLs

- In the PR on GitHub, Vercel adds a comment with the preview link
- In your Vercel dashboard under "Deployments"

## Your Day-to-Day Workflow

### When your dev opens a PR

1. You get a GitHub notification (email or GitHub mobile app)
2. Go review it (see steps above)
3. Check the Vercel preview link to see the changes live
4. Approve and merge, or request changes

### When you want to ship to production

1. Go to GitHub
2. Click **"Pull requests"** → **"New pull request"**
3. Set **base:** `main` and **compare:** `dev`
4. Click **"Create pull request"**
5. Review the combined changes
6. Merge it → Vercel deploys to production

### When you want to work on code yourself

```bash
# Make sure you're on dev and up to date
git checkout dev
git pull origin dev

# Create your own feature branch
git checkout -b feature/my-thing

# ... do your work ...

# Commit and push
git add -A
git commit -m "Description of what you did"
git push -u origin feature/my-thing
```

Then open a PR on GitHub just like your dev would. The CI checks will run on your code too — this protects everyone equally.

### If you need to make a quick fix to production

For urgent hotfixes:

```bash
git checkout main
git pull origin main
git checkout -b fix/urgent-thing

# ... make the fix ...

git add -A
git commit -m "Fix: description"
git push -u origin fix/urgent-thing
```

Then open a PR targeting `main` directly (instead of `dev`). After merging, also merge `main` back into `dev` so they stay in sync:

```bash
git checkout dev
git pull origin dev
git merge main
git push origin dev
```

## Common Situations

### "CI failed on a PR"

The automated checks (lint, types, build) caught an issue. Click on the failed check in the PR to see what went wrong. Your dev needs to fix it and push again.

### "Dev and main are out of sync"

This happens when hotfixes go to main but not dev, or vice versa. To sync:

```bash
git checkout dev
git pull origin dev
git merge origin/main
git push origin dev
```

### "I want to see what's different between dev and main"

On GitHub: go to the repo → click **"Compare"** → set base `main`, compare `dev`.

Or locally:

```bash
git diff main..dev --stat
```

### "My dev's PR has merge conflicts"

This means their code touches the same lines as something that already changed in `dev`. They need to update their branch:

```bash
# (your dev runs this)
git checkout their-feature-branch
git pull origin dev
# Fix any conflicts in the files
git add .
git commit -m "Resolve merge conflicts"
git push
```

## Quick Reference

| Action                 | How                                             |
| ---------------------- | ----------------------------------------------- |
| See open PRs           | github.com/newearthcollectiveteam/web-eco/pulls |
| See CI results         | Click "Checks" tab on any PR                    |
| See preview deployment | Look for Vercel bot comment on PR               |
| Merge dev → main       | Create PR with base:main, compare:dev           |
| Check what's different | GitHub Compare or `git diff main..dev --stat`   |
