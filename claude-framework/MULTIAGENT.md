# Multi-Agent Worktree Protocol

Coordination standards for parallel Claude sessions working on git worktrees.

## Architecture

```
main/                     # Main worktree - integrator session
├── WORKTREES.md          # Coordination file (source of truth)
├── STATUS.md
└── TODO.md

../project-feature-a/     # Worktree A - worker session
├── .worktree-context     # Local session state
└── ...

../project-feature-b/     # Worktree B - worker session
├── .worktree-context
└── ...
```

## Coordination File: WORKTREES.md

Lives in main worktree. All sessions read/update this file.

```markdown
# Active Worktrees

| Worktree        | Branch       | Port | Owner      | Task               | Status |
| --------------- | ------------ | ---- | ---------- | ------------------ | ------ |
| main            | main         | 3000 | integrator | coordination       | active |
| ../project-auth | feature/auth | 3001 | worker-1   | Implement OAuth    | active |
| ../project-api  | feature/api  | 3002 | worker-2   | Add REST endpoints | active |
| ../project-ui   | feature/ui   | 3003 | -          | -                  | idle   |

## Port Assignments

- 3000: main (reserved for integrator)
- 3001-3009: worker sessions

## Pending Integrations

- [ ] feature/auth → main (blocked: needs tests)
- [ ] feature/api → main (ready)
```

## Session Roles

### Integrator (main worktree)

- Plans and divides work into discrete tasks
- Assigns tasks to worktrees
- Manages WORKTREES.md
- Handles reintegration/merges
- Resolves cross-cutting conflicts
- Runs on port 3000

### Worker (feature worktrees)

- Claims assigned worktree
- Works on single focused task
- Updates local .worktree-context
- Signals completion via WORKTREES.md
- Does NOT modify other worktrees
- Runs on assigned port (3001+)

## Protocols

### 1. Spawn Workers (Integrator) - `/spawn`

```
1. Tell integrator what tasks need to be done
2. Integrator analyzes and proposes parallel work breakdown
3. User approves plan
4. Integrator creates worktrees, .worktree-context files, updates WORKTREES.md
5. Integrator outputs ready-to-copy prompts for each worker session
6. User opens new terminals, cd's to worktrees, starts new Claude sessions
7. User pastes the generated prompts to initialize each worker
```

### 2. Claim Worktree (Worker) - `/claim`

```
1. Worker session runs /claim
2. Reads WORKTREES.md and .worktree-context
3. Displays task, acceptance criteria, port assignment
4. Worker starts dev server on assigned port
5. Begin work
```

### 3. During Work (Worker)

```
1. Stay within your worktree
2. Commit frequently with clear messages
3. Update .worktree-context if scope changes
4. If blocked, update WORKTREES.md status
5. Don't modify main or other worktrees
```

### 4. Task Completion (Worker) - `/handoff`

```
1. Ensure all tests pass
2. Run /handoff which:
   - Updates .worktree-context with completion notes
   - Updates WORKTREES.md status to "complete"
   - Adds to Pending Integrations
   - Generates session summary
3. Stop dev server
```

### 5. Reintegration (Integrator) - `/integrate`

```
1. Run /integrate from main worktree
2. Reviews Pending Integrations in WORKTREES.md
3. Shows diff and commit summary for each ready branch
4. User approves merges
5. Executes merges, runs tests
6. Updates WORKTREES.md (removes from pending)
7. Optionally cleans up merged worktrees
```

## Context Files

### .worktree-context (per worktree)

```markdown
# Worktree Context

**Branch:** feature/auth
**Task:** Implement OAuth login
**Assigned:** 2026-01-27
**Port:** 3001

## Objective

Add Google and GitHub OAuth authentication options.

## Acceptance Criteria

- [ ] Google OAuth working
- [ ] GitHub OAuth working
- [ ] Session persistence
- [ ] Tests passing

## Constraints

- Use existing Supabase Auth
- Don't modify user table schema
- Keep backward compat with email/password

## Integration Notes

Will need coordination with API team for token handling.

## Session Log

- 2026-01-27 14:00: Started, set up OAuth providers
- 2026-01-27 15:30: Google OAuth complete
```

## Commands

### Integrator Commands

```bash
# Create new worktree
git worktree add ../project-<name> -b feature/<name>

# List worktrees
git worktree list

# Fetch from worktree
git fetch . ../project-<name>:feature/<name>

# Merge completed work
git merge feature/<name> --no-ff -m "Merge: <description>"

# Clean up worktree
git worktree remove ../project-<name>
git branch -d feature/<name>
```

### Worker Commands

```bash
# Start dev server on assigned port
PORT=3001 npm run dev

# Check main for updates
git fetch origin main
git rebase origin/main  # if needed
```

## Conflict Resolution

When conflicts arise during integration:

1. **Integrator resolves** if conflict is:
   - Between two worker branches
   - Architectural/cross-cutting
   - Requires context from multiple features

2. **Worker resolves** if conflict is:
   - With main (rebase worker branch)
   - Within their feature scope

## Anti-patterns

- Worker modifying WORKTREES.md task assignments
- Multiple workers on same worktree
- Worker merging to main directly
- Integrator doing feature work in main
- Skipping .worktree-context updates
- Running multiple dev servers on same port
