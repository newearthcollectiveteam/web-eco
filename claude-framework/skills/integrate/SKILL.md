---
name: integrate
description: Orchestrate reintegration of completed worktree branches into main
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Integrate Worktrees

Orchestrate reintegration of completed worktree branches into main.

## Prerequisites

- Must be run from main worktree
- WORKTREES.md must exist with Pending Integrations section

## Steps

1. **Verify Integrator Role**
   ```bash
   git worktree list
   ```
   Confirm current directory is the main worktree. If not, abort with instructions.

2. **Read Coordination State**
   - Parse WORKTREES.md
   - List all worktrees and their status
   - Identify Pending Integrations marked as ready

3. **Pre-Integration Checks**
   For each ready integration:
   ```bash
   # Fetch the branch
   git fetch . ../project-<name>:feature/<name>

   # Show what will be merged
   git log --oneline main..feature/<name>
   git diff --stat main...feature/<name>
   ```

4. **Present Integration Plan**
   Show user:
   - Branches ready to merge
   - Commit count and file changes per branch
   - Recommended merge order (based on dependencies)
   - Any potential conflicts detected

5. **Execute Integrations** (with user confirmation)
   For each approved integration:
   ```bash
   git merge feature/<name> --no-ff -m "Merge feature/<name>: <description>"
   ```

   If conflicts:
   - Show conflicting files
   - Offer to help resolve or abort
   - After resolution, continue merge

6. **Post-Integration**
   - Run test suite: `npm test` or `npm run typecheck`
   - Update WORKTREES.md:
     - Remove from Pending Integrations
     - Update worktree status to "merged"
   - Optionally clean up worktrees:
     ```bash
     git worktree remove ../project-<name>
     git branch -d feature/<name>
     ```

7. **Report Results**
   Show:
   - Successfully merged branches
   - Any failures or skipped integrations
   - Updated WORKTREES.md state
   - Recommendations for next steps

## Output Format

```
## Integration Complete

### Merged
- feature/auth (3 commits, 5 files)
- feature/api (7 commits, 12 files)

### Skipped
- feature/ui (not ready - missing tests)

### Tests
All passing ✓

### Cleaned Up
- Removed worktree: ../project-auth
- Removed worktree: ../project-api

### WORKTREES.md Updated
- 2 integrations removed from pending
- 2 worktrees marked as merged

### Next Steps
- feature/ui still needs test coverage before integration
- Consider starting new parallel tasks
```

## Conflict Resolution

When merge conflicts occur:

1. **Show Conflict Details**
   ```bash
   git diff --name-only --diff-filter=U
   ```

2. **Categorize Conflicts**
   - Trivial (whitespace, imports): Auto-resolve if possible
   - Content (same lines modified): Show both versions, ask user
   - Structural (file moved/deleted): Explain situation, get direction

3. **Resolution Options**
   - Accept theirs (feature branch version)
   - Accept ours (main version)
   - Manual merge (show editor)
   - Abort and defer

4. **After Resolution**
   ```bash
   git add <resolved-files>
   git commit
   ```

## Safety Checks

- Never force push to main
- Always run tests after merge
- Keep WORKTREES.md as source of truth
- Don't delete worktrees until confirmed merged
