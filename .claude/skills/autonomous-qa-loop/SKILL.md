---
name: autonomous-qa-loop
description: Autonomous self-improving QA cycle for Kitchen Explorer. Runs codebase-auditor → creates fix tasks → builds → runs Vitest → fixes failures → loops until no CRITICAL or HIGH issues remain. Use when asked to "run autonomous QA", "run the QA loop", or /autonomous-qa-loop.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Autonomous QA Loop — Kitchen Explorer

> **Purpose**: Self-improving quality cycle that runs until the game has no CRITICAL or HIGH issues.
> Each outer iteration: audit → plan fixes → build → test → fix → repeat.

No backend. No E2E. No Playwright. This loop works entirely with the Vite build and Vitest.

---

## Quick Start

```
/autonomous-qa-loop                    # Full loop, defaults
/autonomous-qa-loop --max-outer 2      # Limit to 2 audit cycles
/autonomous-qa-loop --skip-audit       # Start from existing audit in kitchen-progress.txt
/autonomous-qa-loop --skip-build       # Skip to test phase (already built)
```

---

## State File

All phases read/write `kitchen-progress.txt` at the Kitchen Explorer root. This file is the shared memory between skills and survives session boundaries.

State block format:

```markdown
## AUTONOMOUS QA STATE
outer_iteration: 1
inner_fix_iteration: 0
phase: AUDIT
critical_issues_last_audit: 0
high_issues_last_audit: 0
started_at: 2026-03-20T09:00:00Z
last_updated: 2026-03-20T10:45:00Z
```

---

## Outer Loop

```
WHILE (critical_issues > 0 OR high_issues > 0) AND outer_iteration <= MAX_OUTER:

  Phase 1: Codebase Audit
  Phase 2: Exit Check
  Phase 3: Fix Planning
  Phase 4: Build
  Phase 5: Vitest Run
  Phase 6: Fix Inner Loop (if failures)
  Phase 7: Commit
  Phase 8: Increment outer_iteration, loop
```

Default `MAX_OUTER = 3`. Override with `--max-outer N`.

---

## Phase 1: Codebase Audit

**Skip condition**: `--skip-audit` flag OR audit in `kitchen-progress.txt` is less than 2 hours old.

**Action**: Invoke `codebase-auditor` skill.

```
Tell Claude: "Run /codebase-auditor — full audit of Kitchen Explorer. Write output to kitchen-progress.txt."
```

Wait for completion. The audit writes `## ISSUES FOUND` to `kitchen-progress.txt`.

**After audit**: Parse issue counts:
- Count lines matching `### CRITICAL (N issues)` → extract N
- Count lines matching `### HIGH (N issues)` → extract N
- Update `## AUTONOMOUS QA STATE` with counts

---

## Phase 2: Exit Check

Read `## AUTONOMOUS QA STATE` from `kitchen-progress.txt`.

```
IF critical_issues == 0 AND high_issues == 0:
  PRINT "Autonomous QA complete — no CRITICAL or HIGH issues found."
  PRINT summary table
  EXIT
```

---

## Phase 3: Fix Planning

Read the `## ISSUES FOUND` section from `kitchen-progress.txt`.

Group issues by file/area:
- `CookingGame.jsx` issues → one fix batch
- `gameData.js` issues → one fix batch
- `src/systems/` issues → one fix batch
- Build failures → one fix batch

**Batching rule** (same as LandDrive pattern):

| Issues in area | Fix batches |
|---|---|
| 1–3 issues | 1 batch |
| 4–8 issues | 2 batches (CRITICAL first, then HIGH) |
| 9+ issues | 3 batches (CRITICAL, HIGH, MEDIUM) |

For each batch, invoke `development-loop`:

```
Tell Claude: "Using /development-loop, fix these Kitchen Explorer issues:

[paste issue list for this batch]

Read the relevant files first. Build and test after each fix. Commit after all fixes in this batch pass."
```

Log fix batches in the state block:
```markdown
fix_batches_this_iteration:
  - batch-1: CookingGame.jsx handlers (3 CRITICAL)
  - batch-2: gameData.js state references (2 HIGH)
```

---

## Phase 4: Build

After all fix batches, run a full build to confirm nothing is broken:

```bash
cd /c/Dev/Kitchen_Explorer && npm run build 2>&1
```

**If build fails:**
- Log failure in state block as `build_error: true`
- Read the error output
- Apply a targeted fix (using `development-loop`)
- Re-run build
- Max 3 attempts before marking as BLOCKED

**After passing build**: Update state:
```markdown
phase: BUILD_PASS
build_clean: true
```

---

## Phase 5: Vitest Run

```bash
cd /c/Dev/Kitchen_Explorer && npm run test 2>&1
```

Parse results:
- Count failing tests → `vitest_failures`
- Log failures in state block under `## VITEST FAILURES`

```markdown
## VITEST FAILURES
- gameData.test.js > RECIPES > every required ingredient state is valid: shrimp "battered" not in states
- utils.test.js > smoke test > all passing (0 failures here)
```

If `vitest_failures == 0` → skip Phase 6, go to Phase 7.

---

## Phase 6: Fix Inner Loop

```
inner_iteration = 1
MAX_INNER = 3

WHILE vitest_failures > 0 AND inner_iteration <= MAX_INNER:

  Phase 6a: Read failing test output
  Phase 6b: Apply targeted fix (development-loop)
  Phase 6c: Re-run Vitest

  inner_iteration++
```

### Phase 6a: Analyze Failures

Read `## VITEST FAILURES` from `kitchen-progress.txt`.

Group failures by file. For each group, use `development-loop`:

```
Tell Claude: "Using /development-loop, fix these Vitest failures:

[paste failures]

Read the failing test to understand what it expects. Fix the game code (not the test) unless the test assertion is genuinely wrong."
```

### Phase 6b: Apply Fix

Follow `development-loop` Phase 4 (root cause analysis, 3 attempts per error).

### Phase 6c: Re-run Vitest

```bash
cd /c/Dev/Kitchen_Explorer && npm run test 2>&1
```

Update `vitest_failures` count. If still > 0 at `inner_iteration == MAX_INNER`:
- Log stuck failures as `stuck_vitest_failures` in state block
- Break inner loop
- Continue outer loop (re-audit will rediscover genuinely broken things)

---

## Phase 7: Commit

After build and tests pass:

```bash
cd /c/Dev/Kitchen_Explorer
git add -A
git commit -m "qa-loop-{outer_iteration}: fixes from iteration {N}"
```

Update state:
```markdown
phase: COMMITTED
last_commit: [hash]
```

---

## Phase 8: Outer Loop Increment

1. Update `outer_iteration` in state block
2. Update `last_updated`
3. Print progress summary:

```
=== Outer Iteration {N} Complete ===
Issues found:   CRITICAL={X} HIGH={Y}
Build:          PASS
Vitest:         {N} failures fixed (stuck: {M})
Next:           Starting iteration {N+1}...
```

Loop back to Phase 1.

---

## Exit Summary

```markdown
# Autonomous QA Loop — Complete

**Exit Reason**: {No CRITICAL/HIGH issues | Max iterations reached}
**Total Outer Iterations**: {N}

## Per-Iteration Summary
| Iteration | CRITICAL | HIGH | Build | Vitest Failures |
|-----------|----------|------|-------|-----------------|
| 1         | 4        | 7    | PASS  | 3               |
| 2         | 1        | 2    | PASS  | 0               |
| 3         | 0        | 0    | PASS  | 0               |

## Remaining Issues (if max iterations hit)
{List any CRITICAL/HIGH issues that persisted}

## Stuck Failures
{List any Vitest failures that did not resolve after 3 fix attempts}
```

---

## Resuming After Interruption

Run `/autonomous-qa-loop` again. Read `## AUTONOMOUS QA STATE` from `kitchen-progress.txt`:

```
IF phase == AUDIT_COMPLETE  → Resume at Phase 2
IF phase == FIX_PLANNING    → Resume at Phase 4 (re-read fix batch list from state)
IF phase == BUILD_PASS      → Resume at Phase 5
IF phase == VITEST_RUNNING  → Resume Phase 6 (re-read failures)
IF phase == COMMITTED       → Resume Phase 8 (increment and loop)
```

---

## Primary Goal

Get the game to a state where all features documented in `CLAUDE.md` actually work:

1. All 6 stations accept ingredients via drag-and-drop
2. All ingredient state transformations documented in CLAUDE.md are implemented
3. All 5 recipes can be completed by a player following the correct steps
4. The build is clean (no Vite errors)
5. All Vitest tests pass

---

## Related Skills

| Skill | When to Invoke |
|---|---|
| `codebase-auditor` | Phase 1 — find what's broken |
| `development-loop` | Phases 3/6 — fix broken things |
| `test-suite-generator` | When adding new test coverage |
