---
name: claim
description: Claim a worktree assignment and set up worker session context
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Claim Worktree

Claim a worktree assignment and set up worker session context.

## Steps

1. **Find Coordination File**
   Look for WORKTREES.md in:
   - Current directory
   - Parent directory (if in a worktree)
   - Main worktree (use `git worktree list` to find main)

2. **Read Assignment**
   - Parse WORKTREES.md for current directory's assignment
   - If no assignment, list available idle worktrees
   - If this is main worktree, inform user this is integrator role

3. **Validate Worktree**
   ```bash
   git worktree list
   ```
   Confirm current directory is a valid worktree.

4. **Read or Create Context**
   - If .worktree-context exists, read it
   - If not, create from WORKTREES.md assignment info

5. **Report Session Setup**
   Display:
   - Worktree name and branch
   - Assigned port
   - Task summary
   - Acceptance criteria
   - Any blockers or dependencies

6. **Start Dev Server** (if user confirms)
   ```bash
   PORT=<assigned-port> npm run dev
   ```
   Run in background so session can continue.

## Output Format

```
## Worker Session Claimed

**Worktree:** ../project-auth
**Branch:** feature/auth
**Port:** 3001

### Task
Implement OAuth login with Google and GitHub providers.

### Acceptance Criteria
- [ ] Google OAuth working
- [ ] GitHub OAuth working
- [ ] Session persistence
- [ ] Tests passing

### Dependencies
- None

### Ready to Start
Run `PORT=3001 npm run dev` to start dev server.
```

## Completion Protocol

**CRITICAL**: Before marking work as done, workers MUST:
1. Commit all changes to the worktree branch (`git add` + `git commit`)
2. Verify the commit landed: `git log --oneline -1`
3. Run `/handoff` to update status

Workers that skip committing will leave their work as uncommitted changes that get lost when the integrator runs `/integrate` and cleans up worktrees. The integrator merges *commits*, not working tree state.

## Edge Cases

- **No WORKTREES.md found**: Inform user this project isn't set up for multi-agent work. Offer to create coordination file if in main worktree.
- **Worktree not assigned**: Show available tasks from WORKTREES.md and let user pick.
- **Already claimed**: Show current owner and status. Ask if user wants to take over.
