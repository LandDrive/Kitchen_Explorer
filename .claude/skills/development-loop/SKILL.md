---
name: development-loop
description: Self-healing development loop for Kitchen Explorer. Builds, tests, fixes, and commits working code. No TypeScript, no backend. Build validator is Vite build; test validator is Vitest. Use when implementing a fix or feature in the game.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Development Loop — Kitchen Explorer

> **Purpose**: Never deliver broken code. Build → Test → Fix → Verify until everything passes, then commit.

---

## Core Principle

**Fix the root cause, not the symptom.** Every fix must address WHY something is broken, not just make the error go away. See the Fix Anti-Patterns table below.

---

## The Loop

```
BUILD → TEST → FIX (if needed) → VERIFY → COMMIT
         ↑         |
         └─────────┘ (loop until passing)
```

---

## Phase 1: Before Coding

Read the relevant files before making any change:

- For game logic: read `src/CookingGame.jsx` around the affected area first
- For data: read `src/data/gameData.js`
- For hooks: read the specific file in `src/systems/` or `src/hooks/`

**Never edit a file you haven't read in this session.**

Extract the existing pattern before writing new code:
- What naming convention is used for handlers? (`handleDrop_station`, `handleStation_action`, etc.)
- What state shape does the affected station use?
- What notification format does the game use for player feedback?

---

## Phase 2: BUILD

After making changes, run the Vite build to catch import errors, missing modules, and JSX syntax problems:

```bash
cd /c/Dev/Kitchen_Explorer && npm run build 2>&1
```

**If build fails:**
- Read the full error message
- JSX syntax errors: fix the malformed JSX
- Import errors: verify the file path and export name
- Missing module: check if the dependency is in package.json devDependencies
- Do NOT proceed to tests until build passes

---

## Phase 3: TEST

Run Vitest:

```bash
cd /c/Dev/Kitchen_Explorer && npm run test 2>&1
```

**If tests fail:**
- Read the full failure output
- Identify the failing test file and assertion
- Trace back to which game data or function is broken
- Proceed to Phase 4

**If tests pass:** Proceed to Phase 5 (VERIFY).

---

## Phase 4: FIX

### Root Cause Analysis (required before writing any fix)

Answer these questions before touching code:

1. **What** is the actual error? (Read the full message, not just the first line)
2. **Where** does it originate? (Trace to the source, not where it surfaces)
3. **Why** does it occur? (What assumption is wrong?)
4. **What** should happen instead?
5. **How** should it be properly fixed?

If you cannot answer all 5, read more code before fixing.

### Error Tracking

Track errors by unique signature (message + file + line). Each unique error gets **3 attempts** before blocking:

```
error_key = hash(message + file + line)
error_attempts[error_key]++

IF attempts >= 3:
  Mark error as BLOCKED
  Write .kitchen-troubleshooting/ERROR-{slug}.md
  Stop attempting this error
```

### Fix Anti-Patterns (never do these)

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| Comment out failing test | Hides broken game behavior | Fix the game code to match expected behavior |
| Hardcode values to pass test | Tests won't catch real regressions | Implement the actual logic |
| Add empty try/catch | Silently swallows game errors | Handle or rethrow with a console.error |
| Skip state validation | Game can reach broken states | Add proper guards |
| `// eslint-disable` with no reason | Hides real problem | Fix the underlying issue |

After each fix, return to Phase 2 (build first, then test).

---

## Phase 5: VERIFY

Before marking a fix complete, verify:

- [ ] `npm run build` exits with code 0
- [ ] `npm run test` exits with code 0 (all tests pass)
- [ ] The specific broken feature was tested manually in the dev server (if feasible)
- [ ] No new console errors introduced

**Visual spot-check (for UI fixes):**

```bash
cd /c/Dev/Kitchen_Explorer && npm run dev
```

Open the game in a browser. Verify the fixed feature works as described in CLAUDE.md.

---

## Phase 6: COMMIT

Commit after each self-contained fix:

```bash
cd /c/Dev/Kitchen_Explorer
git add -A
git commit -m "kitchen-fix-{N}: {brief description of what was fixed}"
```

Increment N for each commit this session. Keep descriptions concrete:
- `kitchen-fix-1: add missing handleDrop_plate handler`
- `kitchen-fix-2: fix rice seasoned state missing from salmonMaki recipe check`
- `kitchen-fix-3: add SVG case for tilapia ingredient`

---

## Progress Tracking

Update `kitchen-progress.txt` after each phase:

```markdown
## PROGRESS LOG

[HH:MM] BUILD - Vite build passing
[HH:MM] TEST - 3/12 tests failing (gameData.test.js)
[HH:MM] FIX-1 - Added missing 'seasoned' state to rice in RECIPES.salmonMaki
[HH:MM] TEST - 12/12 tests passing
[HH:MM] COMMIT - kitchen-fix-1: fix salmonMaki rice state reference
```

---

## Blocked Error Protocol

If a fix is stuck after 3 attempts, create:

```markdown
# File: .kitchen-troubleshooting/ERROR-{slug}.md

## ERROR: {brief description}
**First Seen**: {timestamp}
**File**: {file:line}
**Status**: BLOCKED

## Symptom
{what the user sees / what the test shows}

## Attempts Made
1. {attempt 1} — {why it failed}
2. {attempt 2} — {why it failed}
3. {attempt 3} — {why it failed}

## Root Cause Hypothesis
{best guess}

## Needs Review
{what a human should look at}
```

---

## Context Survival

If the session ends mid-fix, write to `kitchen-progress.txt`:

```markdown
## IF SESSION ENDS NOW

Continue from: Phase {N}
Next action: {specific next step}
Files in progress: {list}
Last commit: {hash or "none"}

### Resume Checklist
1. Read kitchen-progress.txt PROGRESS LOG
2. Re-read any files that were being edited
3. Continue from the listed phase
```

---

## Related Skills

| Need | Skill |
|---|---|
| Find what needs fixing | `codebase-auditor` |
| Generate test coverage | `test-suite-generator` |
| Run the full QA loop | `autonomous-qa-loop` |
