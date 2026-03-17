---
name: spawn
description: Plan parallel work, create worktrees, generate worker session prompts
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
---

# Spawn Parallel Workers

Integrator skill to divide work into parallel tasks, create worktrees, and generate prompts for worker sessions.

## Prerequisites

- Must be run from main worktree
- Project should have WORKTREES.md (will create if missing)

## Steps

1. **Gather Tasks**
   Ask user what work needs to be parallelized, or read from:
   - User input (preferred)
   - TODO.md items
   - Existing WORKTREES.md task queue

2. **Analyze & Plan**
   For each task, determine:
   - Branch name: `feature/<short-name>`
   - Worktree path: `../<project>-<short-name>`
   - Port assignment: 3001, 3002, etc.
   - Dependencies between tasks (if any)
   - Acceptance criteria

   Present plan to user for approval before creating anything.

3. **Create Worktrees**
   For each approved task:
   ```bash
   git worktree add ../<project>-<name> -b feature/<name>
   ```

4. **Create Context Files**
   For each worktree, create `.worktree-context`:
   ```markdown
   # Worktree Context

   **Branch:** feature/<name>
   **Task:** <description>
   **Assigned:** <today>
   **Port:** <port>

   ## Objective
   <detailed task description>

   ## Acceptance Criteria
   - [ ] <criterion 1>
   - [ ] <criterion 2>
   - [ ] All changes committed to branch
   - [ ] Tests passing

   ## Constraints
   <any constraints or dependencies>

   ## Integration Notes
   <notes for merge time>

   ## Session Log
   ```

5. **Update WORKTREES.md**
   Add all new worktrees to the coordination file with status "ready".

6. **Generate Worker Prompts**
   For each worktree, generate a copy-paste prompt:

   ```
   ================================================================================
   WORKER SESSION: <name>
   PORT: <port>
   ================================================================================

   cd <absolute-worktree-path>

   Then start a new Claude session and paste:

   ---
   I'm a worker session for this worktree. My task:

   **Branch:** feature/<name>
   **Port:** <port>

   **Objective:**
   <task description>

   **Acceptance Criteria:**
   - [ ] <criteria>

   **IMPORTANT:** Commit all changes to the branch before finishing. The integrator merges commits, not working tree state.

   Please run /claim to confirm setup, then start the dev server on port <port> and begin work.
   ---
   ```

## Output Format

```
## Parallel Work Plan

### Tasks to Spawn

| # | Task | Branch | Port | Path |
|---|------|--------|------|------|
| 1 | <desc> | feature/<name> | 3001 | ../<project>-<name> |
| 2 | <desc> | feature/<name> | 3002 | ../<project>-<name> |

### Dependencies
- Task 2 should not modify <file> (Task 1 owns it)

Proceed with creation? [y/n]

---

## Worktrees Created

- ../<project>-<name> (feature/<name>)
- ../<project>-<name> (feature/<name>)

## Worker Session Prompts

Copy each prompt below into a new terminal + Claude session:

================================================================================
WORKER 1: <name>
PORT: 3001
================================================================================

cd <path>

Prompt to paste:
---
<prompt>
---

================================================================================
WORKER 2: <name>
PORT: 3002
================================================================================

cd <path>

Prompt to paste:
---
<prompt>
---

## Integrator Next Steps

1. Open new terminals for each worker
2. Start each worker session with the prompts above
3. Monitor progress in WORKTREES.md
4. Run /integrate when workers complete
```

## Task Division Guidelines

When dividing work:
- Prefer tasks that touch different files/directories
- Identify shared dependencies and assign clear ownership
- Keep tasks roughly equal in scope
- Flag any tasks that must be sequential (can't parallelize)

## Error Handling

- **Worktree exists**: Ask to reuse or pick new name
- **Branch exists**: Ask to reuse, delete, or pick new name
- **Port conflict**: Auto-increment to next available
